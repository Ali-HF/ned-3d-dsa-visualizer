import type { PreviewSceneKind, TraceEvent } from '../types/trace';
import type { AlgorithmMetadata } from '../algorithms/array/arrayAlgorithms';
import {
  CORPUS_FILE_CATALOG,
  getCorpusRawText,
  type CorpusFileEntry,
} from '../corpus/cppCorpusRegistry';
import {
  runCppTrace,
  type InstrumentedStepRecord,
} from './cppInterpreter';
import type { CppWorkerRequest, CppWorkerResponse } from './cppWorker';

export interface CustomCodeRunResult {
  scene: PreviewSceneKind;
  events: TraceEvent[];
  meta: AlgorithmMetadata;
  extractedArray: number[];
  steps?: InstrumentedStepRecord[];
  executionMode?: 'cpp-interpreter' | 'corpus-operation';
}

/**
 * Extracts the first C++ brace array/vector literal from C++ source code, e.g.:
 * `int arr[] = { 42, 17, 68, 29, 84, 12 };`
 */
export function extractNumbersFromCode(
  sourceCode: string,
  fallback: number[] = [42, 17, 68, 29, 84, 12],
): number[] {
  const braceMatches = sourceCode.matchAll(/\{\s*(-?\d+(?:\s*,\s*-?\d+)+)\s*\}/g);
  for (const match of braceMatches) {
    const nums = match[1]
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
    if (nums.length >= 2 && nums.length <= 20) {
      return nums;
    }
  }
  return fallback;
}

/**
 * Extracts a numeric parameter from common C++ operation calls in `main()`
 * such as `push(88)`, `enqueue(75)`, `insert(65)`, `search(40)`, etc.
 */
export function extractParamValueFromCode(
  sourceCode: string,
  fallback = 42,
): number {
  const callRegex =
    /\b(?:push|enqueue|insert|insertHead|insertTail|search|linearSearch|binarySearch|deleteValue|remove|insertAt|updateAt)\s*\(\s*(?:[a-zA-Z0-9_]+\s*,\s*)*(-?\d+)\s*\)/g;
  let lastVal = fallback;
  for (const match of sourceCode.matchAll(callRegex)) {
    const parsed = Number(match[1]);
    if (Number.isFinite(parsed)) {
      lastVal = parsed;
    }
  }
  return lastVal;
}

function normalizeLineEndings(s: string): string {
  return s.replace(/\r\n/g, '\n').trim();
}

/**
 * Checks whether `sourceCode` is an unmodified file from `cpp_corpus/`.
 * Only unmodified corpus files use the built-in corpus operation runner;
 * any edited, uploaded, or template C++ code goes through the real C++ AST interpreter.
 */
export function findUnmodifiedCorpusEntry(
  sourceCode: string,
  hintCorpusPath?: string,
): CorpusFileEntry | null {
  if (!hintCorpusPath) return null;
  const normalizedInput = normalizeLineEndings(sourceCode);
  if (!normalizedInput) return null;

  const hinted = CORPUS_FILE_CATALOG.find((c) => c.relativePath === hintCorpusPath);
  if (hinted) {
    const raw = normalizeLineEndings(getCorpusRawText(hinted.relativePath));
    if (raw === normalizedInput) {
      return hinted;
    }
  }

  for (const entry of CORPUS_FILE_CATALOG) {
    const raw = normalizeLineEndings(getCorpusRawText(entry.relativePath));
    if (raw === normalizedInput) {
      return entry;
    }
  }

  return null;
}

/**
 * Synchronously executes custom C++ source code (or an unmodified `cpp_corpus/` file)
 * and generates a live 3D TraceEvent[] trace.
 * Throws `CppCompileError` or `CppRuntimeError` when user code has syntax, unsupported
 * construct, or runtime errors — never silently falling back to a hardcoded algorithm.
 */
export function executeCustomCodeTrace(
  sourceCode: string,
  fallbackArray: number[],
  fallbackCorpusPath?: string,
  fileName?: string,
): CustomCodeRunResult {
  const unmodifiedCorpus = findUnmodifiedCorpusEntry(sourceCode, fallbackCorpusPath);
  const traceRes = runCppTrace(sourceCode, {
    fallbackArray,
    fileName,
    maxSteps: 20000,
    timeoutMs: 4000,
  });

  // Ensure minimum 3D scene richness if a corpus file had interactive-only menu paths
  if (unmodifiedCorpus) {
    return {
      scene: unmodifiedCorpus.scene,
      events: traceRes.events,
      steps: traceRes.steps,
      extractedArray: traceRes.extractedArray,
      executionMode: 'cpp-interpreter',
      meta: {
        ...traceRes.meta,
        title: fileName
          ? `${fileName} (${unmodifiedCorpus.title})`
          : unmodifiedCorpus.title,
      },
    };
  }

  return {
    scene: traceRes.scene,
    events: traceRes.events,
    steps: traceRes.steps,
    extractedArray: traceRes.extractedArray,
    executionMode: 'cpp-interpreter',
    meta: traceRes.meta,
  };
}

/**
 * Executes custom C++ code safely inside a dedicated Web Worker with a hard timeout
 * and step limit so infinite loops (`while(true){}`) are terminated cleanly without
 * freezing the UI thread.
 */
export function executeCustomCodeTraceInWorker(
  sourceCode: string,
  fallbackArray: number[],
  fallbackCorpusPath?: string,
  fileName?: string,
  timeoutMs = 4000,
): Promise<CustomCodeRunResult> {
  // In non-browser test environments (like Node/Vitest where Worker is unavailable),
  // fall back to the synchronous step-and-time-guarded interpreter.
  if (typeof Worker === 'undefined') {
    return new Promise((resolve, reject) => {
      try {
        resolve(executeCustomCodeTrace(sourceCode, fallbackArray, fallbackCorpusPath, fileName));
      } catch (err) {
        reject(err);
      }
    });
  }

  return new Promise<CustomCodeRunResult>((resolve, reject) => {
    let settled = false;
    let worker: Worker | null = null;

    const timer = globalThis.setTimeout(() => {
      if (settled) return;
      settled = true;
      if (worker) {
        worker.terminate();
      }
      reject(
        new Error(
          `Runtime error: Execution timed out after ${timeoutMs}ms (infinite loop terminated).`,
        ),
      );
    }, timeoutMs);

    try {
      worker = new Worker(new URL('./cppWorker.ts', import.meta.url), {
        type: 'module',
      });
    } catch {
      // Fallback if bundler/environment cannot instantiate module worker URL
      globalThis.clearTimeout(timer);
      try {
        resolve(executeCustomCodeTrace(sourceCode, fallbackArray, fallbackCorpusPath, fileName));
      } catch (syncErr) {
        reject(syncErr);
      }
      return;
    }

    worker.onmessage = (event: MessageEvent<CppWorkerResponse>) => {
      if (settled) return;
      settled = true;
      globalThis.clearTimeout(timer);
      worker?.terminate();

      const data = event.data;
      if (data.ok) {
        resolve({
          scene: data.result.scene,
          events: data.result.events,
          steps: data.result.steps,
          extractedArray: data.result.extractedArray,
          executionMode: 'cpp-interpreter',
          meta: data.result.meta,
        });
      } else {
        reject(new Error(data.error));
      }
    };

    worker.onerror = (errEvent) => {
      if (settled) return;
      settled = true;
      globalThis.clearTimeout(timer);
      worker?.terminate();
      reject(new Error(errEvent.message || 'Runtime error in C++ execution worker.'));
    };

    const req: CppWorkerRequest = {
      sourceCode,
      options: {
        fallbackArray,
        fileName,
        maxSteps: 20000,
        timeoutMs,
      },
    };
    worker.postMessage(req);
  });
}
