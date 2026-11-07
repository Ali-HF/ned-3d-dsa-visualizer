import type { PreviewSceneKind, TraceEvent } from '../types/trace';
import {
  runArrayOperation,
  type AlgorithmMetadata,
  type ArrayOperationId,
} from '../algorithms/array/arrayAlgorithms';
import {
  runStructureOperation,
  type StructureOperationId,
} from '../algorithms/structures/structureAlgorithms';
import { CORPUS_FILE_CATALOG } from '../corpus/cppCorpusRegistry';

export interface CustomCodeRunResult {
  scene: PreviewSceneKind;
  events: TraceEvent[];
  meta: AlgorithmMetadata;
  extractedArray: number[];
}

/**
 * Extracts the first array/vector literal from C++ or JS source code, e.g.:
 * `int arr[] = { 42, 17, 68, 29, 84, 12 };` or `let arr = [10, 20, 30];`
 */
export function extractNumbersFromCode(
  sourceCode: string,
  fallback: number[] = [42, 17, 68, 29, 84, 12],
): number[] {
  // Match C++ brace initializer `{ 12, 34, 56 }` with at least 2 numbers
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

  // Match JS bracket initializer `[ 12, 34, 56 ]` with at least 2 numbers
  const bracketMatches = sourceCode.matchAll(/\[\s*(-?\d+(?:\s*,\s*-?\d+)+)\s*\]/g);
  for (const match of bracketMatches) {
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
 * Extracts a numeric parameter from common C++/JS operation calls in `main()`
 * such as `push(88)`, `enqueue(75)`, `insert(65)`, `search(40)`, etc.
 */
export function extractParamValueFromCode(
  sourceCode: string,
  fallback = 42,
): number {
  const callRegex =
    /\b(?:push|enqueue|insert|insertHead|insertTail|search|linearSearch|binarySearch|deleteValue|remove)\s*\(\s*(?:[a-zA-Z0-9_]+\s*,\s*)*(-?\d+)\s*\)/g;
  let lastVal = fallback;
  for (const match of sourceCode.matchAll(callRegex)) {
    const parsed = Number(match[1]);
    if (Number.isFinite(parsed)) {
      lastVal = parsed;
    }
  }
  return lastVal;
}

/**
 * Infers the best matching structure & operation from arbitrary C++ or JS source code.
 */
function inferOperationFromCode(
  sourceCode: string,
  fallbackCorpusPath?: string,
): {
  kind: 'array' | 'structure';
  arrayOp?: ArrayOperationId;
  structOp?: StructureOperationId;
} {
  const src = sourceCode.toLowerCase();

  if (src.includes('quicksort') || src.includes('partition(')) {
    return { kind: 'array', arrayOp: 'quick-sort' };
  }
  if (src.includes('mergesort') || src.includes('merge(')) {
    return { kind: 'array', arrayOp: 'merge-sort' };
  }
  if (src.includes('insertionsort')) {
    return { kind: 'array', arrayOp: 'insertion-sort' };
  }
  if (src.includes('selectionsort')) {
    return { kind: 'array', arrayOp: 'selection-sort' };
  }
  if (src.includes('bubblesort')) {
    return { kind: 'array', arrayOp: 'bubble-sort' };
  }
  if (src.includes('binarysearch')) {
    return { kind: 'array', arrayOp: 'binary-search' };
  }
  if (src.includes('linearsearch')) {
    return { kind: 'array', arrayOp: 'linear-search' };
  }
  if (src.includes('rightrotate') || src.includes('leftrotate') || src.includes('avl')) {
    return { kind: 'structure', structOp: 'avl-rotation' };
  }
  if (src.includes('inorder')) {
    return { kind: 'structure', structOp: 'tree-inorder' };
  }
  if (src.includes('preorder')) {
    return { kind: 'structure', structOp: 'tree-preorder' };
  }
  if (src.includes('postorder')) {
    return { kind: 'structure', structOp: 'tree-postorder' };
  }
  if (src.includes('siftup') || src.includes('maxheap') || src.includes('priority_queue')) {
    return { kind: 'structure', structOp: 'heap-insert' };
  }
  if (src.includes('dijkstra')) {
    return { kind: 'structure', structOp: 'graph-dijkstra' };
  }
  if (src.includes('bfs')) {
    return { kind: 'structure', structOp: 'graph-bfs' };
  }
  if (src.includes('dfs')) {
    return { kind: 'structure', structOp: 'graph-dfs' };
  }
  if (src.includes('enqueue')) {
    return { kind: 'structure', structOp: 'queue-enqueue' };
  }
  if (src.includes('dequeue')) {
    return { kind: 'structure', structOp: 'queue-dequeue' };
  }
  if (src.includes('hanoi')) {
    return { kind: 'structure', structOp: 'recursion-hanoi' };
  }
  if (src.includes('factorial')) {
    return { kind: 'structure', structOp: 'recursion-factorial' };
  }
  if (src.includes('push(')) {
    return { kind: 'structure', structOp: 'stack-push' };
  }
  if (src.includes('pop(')) {
    return { kind: 'structure', structOp: 'stack-pop' };
  }
  if (src.includes('inserthead') || src.includes('inserttail') || src.includes('node*')) {
    return { kind: 'structure', structOp: 'sll-insert-tail' };
  }

  if (fallbackCorpusPath) {
    const entry = CORPUS_FILE_CATALOG.find((c) => c.relativePath === fallbackCorpusPath);
    if (entry) {
      if (entry.scene === 'array') {
        return { kind: 'array', arrayOp: entry.operationId as ArrayOperationId };
      }
      return {
        kind: 'structure',
        structOp: entry.operationId as StructureOperationId,
      };
    }
  }

  return { kind: 'array', arrayOp: 'bubble-sort' };
}

/**
 * Runs user-edited or uploaded C++/JS source code and generates a live 3D TraceEvent[]
 * reflecting any array literals, parameter values, and source lines in the code.
 */
export function executeCustomCodeTrace(
  sourceCode: string,
  fallbackArray: number[],
  fallbackCorpusPath?: string,
  fileName?: string,
): CustomCodeRunResult {
  const extractedArray = extractNumbersFromCode(sourceCode, fallbackArray);
  const extractedParam = extractParamValueFromCode(sourceCode, 42);
  const codeLines = sourceCode.replace(/\r\n/g, '\n').split('\n');
  const inferred = inferOperationFromCode(sourceCode, fallbackCorpusPath);

  if (inferred.kind === 'array' && inferred.arrayOp) {
    const res = runArrayOperation(
      inferred.arrayOp,
      extractedArray,
      0,
      extractedParam,
      true,
    );
    return {
      scene: 'array',
      events: res.events,
      extractedArray: res.finalArray,
      meta: {
        ...res.meta,
        title: fileName ? `${fileName} (${res.meta.title})` : res.meta.title,
        code: codeLines,
      },
    };
  }

  const structOp = inferred.structOp ?? 'sll-insert-tail';
  const res = runStructureOperation(structOp, extractedParam, extractedArray);
  return {
    scene: res.scene,
    events: res.events,
    extractedArray: res.updatedValues ?? extractedArray,
    meta: {
      ...res.meta,
      title: fileName ? `${fileName} (${res.meta.title})` : res.meta.title,
      code: codeLines,
    },
  };
}
