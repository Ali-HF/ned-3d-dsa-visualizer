import { runCppTrace, type CppTraceExecutionResult, type CppTraceOptions } from './cppInterpreter';

export interface CppWorkerRequest {
  sourceCode: string;
  options: CppTraceOptions;
}

export type CppWorkerResponse =
  | { ok: true; result: CppTraceExecutionResult }
  | { ok: false; error: string; line?: number };

self.onmessage = (event: MessageEvent<CppWorkerRequest>) => {
  const { sourceCode, options } = event.data;
  try {
    const result = runCppTrace(sourceCode, options);
    const response: CppWorkerResponse = { ok: true, result };
    self.postMessage(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const line =
      typeof err === 'object' && err !== null && 'line' in err && typeof (err as { line: unknown }).line === 'number'
        ? (err as { line: number }).line
        : undefined;
    const response: CppWorkerResponse = { ok: false, error: msg, line };
    self.postMessage(response);
  }
};

