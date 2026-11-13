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
  executionMode?: 'sandbox-array' | 'script-structure' | 'corpus-operation';
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

/**
 * Attempts to execute a multi-step data structure script (Stack, Queue, Linked List)
 * when the user writes a sequence of calls like:
 *   push(10); push(20); pop(); push(99);
 *   enqueue(15); enqueue(30); dequeue();
 *   insertHead(5); insertTail(50); deleteValue(20);
 */
function tryExecuteStructureScript(
  sourceCode: string,
  codeLines: string[],
  fallbackArray: number[],
  fileName?: string,
): CustomCodeRunResult | null {
  // Do not treat full multi-function C++ corpus files (with struct/class definitions) as short scripts
  if (/\b(?:struct\s+\w+|class\s+\w+|template\s*<)/.test(sourceCode)) {
    return null;
  }

  interface ParsedCall {
    fn: string;
    arg: number | null;
    line: number;
  }

  const calls: ParsedCall[] = [];
  const callLineRegex =
    /\b(push|pop|peek|enqueue|dequeue|insertHead|insertTail|deleteValue|deleteHead)\s*\(\s*(-?\d+)?\s*\)/g;

  codeLines.forEach((lineText, idx) => {
    const stripped = lineText.replace(/\/\/.*$/, '');
    for (const m of stripped.matchAll(callLineRegex)) {
      calls.push({
        fn: m[1],
        arg: m[2] !== undefined ? Number(m[2]) : null,
        line: idx + 1,
      });
    }
  });

  if (calls.length < 2) {
    return null;
  }

  const stackOps = new Set(['push', 'pop', 'peek']);
  const queueOps = new Set(['enqueue', 'dequeue']);
  const sllOps = new Set(['insertHead', 'insertTail', 'deleteValue', 'deleteHead']);

  // 1. STACK SCRIPT
  if (calls.every((c) => stackOps.has(c.fn))) {
    const events: TraceEvent[] = [];
    const pushCount = calls.filter((c) => c.fn === 'push').length;
    const stack: { id: string; val: number }[] = [];
    let nextId = 0;

    // Seed initial stack if user starts with pop/peek or only 1 push
    if (pushCount < 2 || calls[0].fn !== 'push') {
      const seeds = fallbackArray.slice(0, 3);
      seeds.forEach((v) => {
        const id = `stk-${nextId++}`;
        events.push({ t: 'create', id, kind: 'node', value: v });
        if (stack.length > 0) {
          events.push({
            t: 'link',
            from: id,
            to: stack[stack.length - 1].id,
            label: 'below',
          });
        }
        stack.push({ id, val: v });
      });
      events.push({
        t: 'note',
        text: `Initial Stack ready with [${stack.map((s) => s.val).join(', ')}] (top is ${stack[stack.length - 1]?.val}).`,
      });
    }

    for (const call of calls) {
      events.push({ t: 'line', line: call.line });
      if (call.fn === 'push') {
        const val = call.arg ?? 42;
        const id = `stk-${nextId++}`;
        events.push({ t: 'create', id, kind: 'node', value: val });
        if (stack.length > 0) {
          events.push({
            t: 'link',
            from: id,
            to: stack[stack.length - 1].id,
            label: 'below',
          });
        }
        events.push({ t: 'visit', id });
        stack.push({ id, val });
        events.push({
          t: 'note',
          text: `Line ${call.line}: push(${val}) — placed ${val} onto the top of the Stack (size: ${stack.length}).`,
        });
      } else if (call.fn === 'pop') {
        if (stack.length === 0) {
          events.push({
            t: 'note',
            text: `Line ${call.line}: pop() — Stack Underflow! The stack is already empty.`,
          });
        } else {
          const top = stack.pop()!;
          events.push({ t: 'visit', id: top.id });
          if (stack.length > 0) {
            events.push({
              t: 'unlink',
              from: top.id,
              to: stack[stack.length - 1].id,
            });
          }
          events.push({ t: 'remove', id: top.id });
          events.push({
            t: 'note',
            text: `Line ${call.line}: pop() — removed top element ${top.val} from the Stack.`,
          });
        }
      } else if (call.fn === 'peek') {
        if (stack.length > 0) {
          const top = stack[stack.length - 1];
          events.push({ t: 'visit', id: top.id });
          events.push({
            t: 'note',
            text: `Line ${call.line}: peek() — top of the Stack is ${top.val}.`,
          });
        }
      }
    }

    events.push({ t: 'done' });
    return {
      scene: 'stack',
      events,
      extractedArray: stack.map((s) => s.val),
      executionMode: 'script-structure',
      meta: {
        id: 'bubble-sort',
        title: fileName ? `${fileName} (Custom Stack Script)` : 'Custom Stack Script (LIFO)',
        category: 'operation',
        timeComplexity: 'O(1) per op',
        spaceComplexity: 'O(n)',
        code: codeLines,
      },
    };
  }

  // 2. QUEUE SCRIPT
  if (calls.every((c) => queueOps.has(c.fn))) {
    const events: TraceEvent[] = [];
    const enqueueCount = calls.filter((c) => c.fn === 'enqueue').length;
    const queue: { id: string; val: number }[] = [];
    let nextId = 0;

    if (enqueueCount < 2 || calls[0].fn !== 'enqueue') {
      const seeds = fallbackArray.slice(0, 3);
      seeds.forEach((v) => {
        const id = `q-${nextId++}`;
        events.push({ t: 'create', id, kind: 'node', value: v });
        if (queue.length > 0) {
          events.push({
            t: 'link',
            from: queue[queue.length - 1].id,
            to: id,
            label: 'next',
          });
        }
        queue.push({ id, val: v });
      });
      events.push({
        t: 'note',
        text: `Initial Queue ready with [${queue.map((q) => q.val).join(' → ')}].`,
      });
    }

    for (const call of calls) {
      events.push({ t: 'line', line: call.line });
      if (call.fn === 'enqueue') {
        const val = call.arg ?? 42;
        const id = `q-${nextId++}`;
        events.push({ t: 'create', id, kind: 'node', value: val });
        if (queue.length > 0) {
          events.push({
            t: 'link',
            from: queue[queue.length - 1].id,
            to: id,
            label: 'next',
          });
        }
        events.push({ t: 'visit', id });
        queue.push({ id, val });
        events.push({
          t: 'note',
          text: `Line ${call.line}: enqueue(${val}) — added ${val} at the rear of the Queue.`,
        });
      } else if (call.fn === 'dequeue') {
        if (queue.length === 0) {
          events.push({
            t: 'note',
            text: `Line ${call.line}: dequeue() — Queue Underflow! The queue is empty.`,
          });
        } else {
          const front = queue.shift()!;
          events.push({ t: 'visit', id: front.id });
          if (queue.length > 0) {
            events.push({
              t: 'unlink',
              from: front.id,
              to: queue[0].id,
            });
          }
          events.push({ t: 'remove', id: front.id });
          events.push({
            t: 'note',
            text: `Line ${call.line}: dequeue() — removed front element ${front.val} from the Queue.`,
          });
        }
      }
    }

    events.push({ t: 'done' });
    return {
      scene: 'queue',
      events,
      extractedArray: queue.map((q) => q.val),
      executionMode: 'script-structure',
      meta: {
        id: 'bubble-sort',
        title: fileName ? `${fileName} (Custom Queue Script)` : 'Custom Queue Script (FIFO)',
        category: 'operation',
        timeComplexity: 'O(1) per op',
        spaceComplexity: 'O(n)',
        code: codeLines,
      },
    };
  }

  // 3. LINKED LIST SCRIPT
  if (calls.every((c) => sllOps.has(c.fn))) {
    const events: TraceEvent[] = [];
    const list: { id: string; val: number }[] = [];
    let nextId = 0;

    const seeds = fallbackArray.slice(0, 3);
    seeds.forEach((v, idx) => {
      const id = idx === 0 ? 'node-head' : `node-${nextId++}`;
      events.push({ t: 'create', id, kind: 'node', value: v });
      if (list.length > 0) {
        events.push({
          t: 'link',
          from: list[list.length - 1].id,
          to: id,
          label: 'next',
        });
      }
      list.push({ id, val: v });
    });
    events.push({
      t: 'note',
      text: `Initial Singly Linked List: ${list.map((n) => n.val).join(' → ')} → NULL.`,
    });

    for (const call of calls) {
      events.push({ t: 'line', line: call.line });
      if (call.fn === 'insertHead') {
        const val = call.arg ?? 10;
        const id = `node-h${nextId++}`;
        events.push({ t: 'create', id, kind: 'node', value: val });
        if (list.length > 0) {
          events.push({ t: 'link', from: id, to: list[0].id, label: 'next' });
        }
        events.push({ t: 'visit', id });
        list.unshift({ id, val });
        events.push({
          t: 'note',
          text: `Line ${call.line}: insertHead(${val}) — linked new head node ${val}.`,
        });
      } else if (call.fn === 'insertTail') {
        const val = call.arg ?? 99;
        const id = `node-t${nextId++}`;
        events.push({ t: 'create', id, kind: 'node', value: val });
        if (list.length > 0) {
          events.push({
            t: 'link',
            from: list[list.length - 1].id,
            to: id,
            label: 'next',
          });
        }
        events.push({ t: 'visit', id });
        list.push({ id, val });
        events.push({
          t: 'note',
          text: `Line ${call.line}: insertTail(${val}) — appended node ${val} at the tail.`,
        });
      } else if (call.fn === 'deleteHead' && list.length > 0) {
        const removed = list.shift()!;
        if (list.length > 0) {
          events.push({ t: 'unlink', from: removed.id, to: list[0].id });
        }
        events.push({ t: 'remove', id: removed.id });
        events.push({
          t: 'note',
          text: `Line ${call.line}: deleteHead() — removed head node ${removed.val}.`,
        });
      } else if (call.fn === 'deleteValue' && list.length > 0) {
        const target = call.arg ?? list[list.length - 1].val;
        const idx = list.findIndex((n) => n.val === target);
        if (idx >= 0) {
          const removed = list[idx];
          events.push({ t: 'visit', id: removed.id });
          if (idx > 0) {
            events.push({ t: 'unlink', from: list[idx - 1].id, to: removed.id });
          }
          if (idx < list.length - 1) {
            events.push({ t: 'unlink', from: removed.id, to: list[idx + 1].id });
          }
          if (idx > 0 && idx < list.length - 1) {
            events.push({
              t: 'link',
              from: list[idx - 1].id,
              to: list[idx + 1].id,
              label: 'next',
            });
          }
          events.push({ t: 'remove', id: removed.id });
          list.splice(idx, 1);
          events.push({
            t: 'note',
            text: `Line ${call.line}: deleteValue(${target}) — bypassed and removed node ${target}.`,
          });
        } else {
          events.push({
            t: 'note',
            text: `Line ${call.line}: deleteValue(${target}) — value ${target} not found in list.`,
          });
        }
      }
    }

    events.push({ t: 'done' });
    return {
      scene: 'linked-list',
      events,
      extractedArray: list.map((n) => n.val),
      executionMode: 'script-structure',
      meta: {
        id: 'bubble-sort',
        title: fileName
          ? `${fileName} (Custom Linked List Script)`
          : 'Custom Singly Linked List Script',
        category: 'operation',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        code: codeLines,
      },
    };
  }

  return null;
}

/**
 * Transpiles and executes custom C++ or JS array code (loops, `swap(arr[i], arr[j])`,
 * manual temp swaps, comparisons `arr[i] > arr[j]`, and assignments `arr[i] = val`)
 * inside a step-guarded instrumented sandbox so arbitrary user sorting/array code
 * produces live 3D swap arcs, comparison callouts, and line-by-line highlights.
 */
function tryExecuteCustomArraySandbox(
  sourceCode: string,
  codeLines: string[],
  extractedArray: number[],
  fileName?: string,
): CustomCodeRunResult | null {
  // Skip sandbox for full multi-structure corpus files that define structs/classes/templates/pointers
  if (
    /\b(?:struct\s+\w+|class\s+\w+|template\s*<|unordered_map|priority_queue|std::queue|std::stack|Node\s*\*)/.test(
      sourceCode,
    )
  ) {
    return null;
  }

  // Also skip if it's one of the full multi-demo corpus files with multiple array declarations (arr1, arr2)
  if (/\barr1\b/.test(sourceCode) && /\barr2\b/.test(sourceCode)) {
    return null;
  }

  // Must reference `arr[` or `swap(` to be a custom array manipulation program
  if (!/\barr\s*\[/.test(sourceCode) && !/\bswap\s*\(/.test(sourceCode)) {
    return null;
  }

  try {
    const transpiledLines = codeLines.map((rawLine, idx) => {
      const lineNum = idx + 1;
      let line = rawLine;

      // Strip single-line comments first
      const commentIdx = line.indexOf('//');
      if (commentIdx >= 0) {
        line = line.slice(0, commentIdx);
      }

      // Strip preprocessor directives & `using namespace`
      if (/^\s*#/.test(line) || /^\s*using\s+namespace\b/.test(line)) {
        return '';
      }

      // Strip cout / printf lines
      if (/\b(?:std::)?cout\s*<</.test(line) || /\bprintf\s*\(/.test(line)) {
        return '';
      }

      // Transform C++ brace array initializer: `int arr[] = { 1, 2, 3 };`
      line = line.replace(
        /\b(?:const\s+)?(?:int|long|double|float|auto)\s+([a-zA-Z_]\w*)\s*\[\s*\d*\s*\]\s*=\s*\{([^}]+)\}/g,
        (_m, varName: string, vals: string) =>
          `${varName === 'arr' ? 'arr' : `let ${varName}`} = __initArr([${vals}], ${lineNum})`,
      );
      line = line.replace(
        /\b(?:std::)?vector\s*<\s*\w+\s*>\s+([a-zA-Z_]\w*)\s*=\s*\{([^}]+)\}/g,
        (_m, varName: string, vals: string) =>
          `${varName === 'arr' ? 'arr' : `let ${varName}`} = __initArr([${vals}], ${lineNum})`,
      );
      // Transform JS bracket array initializer on `arr`: `let arr = [1, 2, 3];`
      line = line.replace(
        /\b(?:let|const|var)\s+arr\s*=\s*\[([^\]]+)\]/g,
        `arr = __initArr([$1], ${lineNum})`,
      );

      // Replace sizeof(arr)/sizeof(arr[0]) and arr.size() with arr.length
      line = line.replace(
        /sizeof\s*\(\s*arr\s*\)\s*\/\s*sizeof\s*\(\s*arr\s*\[\s*0\s*\]\s*\)/g,
        'arr.length',
      );
      line = line.replace(/\barr\.size\s*\(\s*\)/g, 'arr.length');

      // Transform `std::swap(arr[a], arr[b])` or `swap(arr[a], arr[b])`
      line = line.replace(
        /\b(?:std::)?swap\s*\(\s*arr\s*\[([^\]]+)\]\s*,\s*arr\s*\[([^\]]+)\]\s*\)/g,
        `__swap(($1), ($2), ${lineNum})`,
      );

      // Transform JS destructuring swap `[arr[a], arr[b]] = [arr[b], arr[a]]`
      line = line.replace(
        /\[\s*arr\s*\[([^\]]+)\]\s*,\s*arr\s*\[([^\]]+)\]\s*\]\s*=\s*\[\s*arr\s*\[[^\]]+\]\s*,\s*arr\s*\[[^\]]+\]\s*\]/g,
        `__swap(($1), ($2), ${lineNum})`,
      );

      // Transform comparisons between two array elements: `arr[a] > arr[b]`
      line = line.replace(
        /arr\s*\[([^\]]+)\]\s*(<=|>=|===|!==|==|!=|<|>)\s*arr\s*\[([^\]]+)\]/g,
        `__cmp(($1), "$2", ($3), ${lineNum})`,
      );

      // Transform C++ function definitions: `void mySort(int arr[], int n)` or `int main()`
      line = line.replace(
        /\b(?:void|int|long|bool|double|float)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/g,
        (_match, fnName: string, rawParams: string) => {
          if (fnName === 'main') {
            return 'function main()';
          }
          const cleanParams = rawParams
            .split(',')
            .map((p) =>
              p
                .replace(/\[\s*\d*\s*\]/g, '')
                .replace(/&/g, ' ')
                .trim()
                .split(/\s+/)
                .pop() ?? '',
            )
            .filter(Boolean)
            .join(', ');
          return `function ${fnName}(${cleanParams})`;
        },
      );

      // Transform C++ primitive variable declarations (`int i = 0`, `bool swapped = false`)
      line = line.replace(
        /\b(?:const\s+)?(?:long\s+long|size_t|int|long|double|float|bool|auto)\s+/g,
        'let ',
      );

      // Track line numbers on direct assignments `arr[expr] = val`
      if (/\barr\s*\[[^\]]+\]\s*=[^=]/.test(line)) {
        line = `__setLine(${lineNum}); ` + line;
      }

      return line;
    });

    const jsBody =
      transpiledLines.join('\n') +
      '\nif (typeof main === "function") { main(); }';

    const rawArr = [...extractedArray];
    const events: TraceEvent[] = [];
    let initialized = false;
    let inInternalOp = false;
    let activeLine = 1;
    let stepGuard = 0;
    const MAX_STEPS = 800;

    let lastAssignment: {
      index: number;
      oldVal: number;
      newVal: number;
      line: number;
      eventStartIdx: number;
    } | null = null;

    const emitInitIfNeeded = (vals: number[], lineNum: number) => {
      if (initialized) return;
      initialized = true;
      events.push({ t: 'line', line: lineNum });
      events.push({ t: 'create', id: 'arr', kind: 'array', value: vals.length });
      for (let i = 0; i < vals.length; i++) {
        events.push({ t: 'set', target: { id: 'arr', index: i }, value: vals[i] });
      }
      events.push({
        t: 'note',
        text: `Initialized array with ${vals.length} elements: [${vals.join(', ')}].`,
      });
    };

    const createProxiedArray = (initialVals: number[]) => {
      rawArr.length = 0;
      rawArr.push(...initialVals);
      return new Proxy(rawArr, {
        set(target, prop, value) {
          if (typeof prop === 'string' && /^\d+$/.test(prop)) {
            const idx = Number(prop);
            const numVal = Number(value);
            const oldVal = target[idx];
            target[idx] = numVal;

            if (!inInternalOp && Number.isFinite(numVal)) {
              if (++stepGuard > MAX_STEPS) {
                throw new Error('MAX_STEPS_EXCEEDED');
              }
              emitInitIfNeeded(extractedArray, 1);

              // Detect 3-line temp variable swap:
              // `temp = arr[a]; arr[a] = arr[b]; arr[b] = temp;`
              if (
                lastAssignment &&
                lastAssignment.index !== idx &&
                lastAssignment.newVal === oldVal &&
                numVal === lastAssignment.oldVal
              ) {
                const idxA = lastAssignment.index;
                const idxB = idx;
                const valA = lastAssignment.oldVal;
                const valB = oldVal;
                // Replace the first assignment's events with a genuine 3D swap event!
                events.splice(
                  lastAssignment.eventStartIdx,
                  events.length - lastAssignment.eventStartIdx,
                  { t: 'line', line: activeLine },
                  {
                    t: 'swap',
                    a: { id: 'arr', index: idxA },
                    b: { id: 'arr', index: idxB },
                  },
                  {
                    t: 'note',
                    text: `Line ${activeLine}: Swapping ${valA} and ${valB} between arr[${idxA}] and arr[${idxB}].`,
                  },
                );
                lastAssignment = null;
              } else {
                const eventStartIdx = events.length;
                events.push({ t: 'line', line: activeLine });
                events.push({
                  t: 'set',
                  target: { id: 'arr', index: idx },
                  value: numVal,
                });
                events.push({
                  t: 'note',
                  text: `Line ${activeLine}: Set arr[${idx}] = ${numVal}.`,
                });
                lastAssignment = {
                  index: idx,
                  oldVal,
                  newVal: numVal,
                  line: activeLine,
                  eventStartIdx,
                };
              }
            }
            return true;
          }
          return Reflect.set(target, prop, value);
        },
      });
    };

    let proxiedArr = createProxiedArray(extractedArray);

    const __initArr = (vals: number[], lineNum: number) => {
      const clean = vals.map((v) => Number(v)).filter((v) => Number.isFinite(v));
      if (clean.length > 0) {
        emitInitIfNeeded(clean, lineNum);
        proxiedArr = createProxiedArray(clean);
      }
      return proxiedArr;
    };

    const __setLine = (lineNum: number) => {
      activeLine = lineNum;
    };

    const __cmp = (
      idxA: number,
      op: string,
      idxB: number,
      lineNum: number,
    ): boolean => {
      if (++stepGuard > MAX_STEPS) {
        throw new Error('MAX_STEPS_EXCEEDED');
      }
      emitInitIfNeeded(extractedArray, 1);
      lastAssignment = null;
      const a = Math.max(0, Math.min(rawArr.length - 1, Math.floor(Number(idxA) || 0)));
      const b = Math.max(0, Math.min(rawArr.length - 1, Math.floor(Number(idxB) || 0)));
      const valA = rawArr[a];
      const valB = rawArr[b];
      let result = false;
      switch (op) {
        case '<':
          result = valA < valB;
          break;
        case '>':
          result = valA > valB;
          break;
        case '<=':
          result = valA <= valB;
          break;
        case '>=':
          result = valA >= valB;
          break;
        case '==':
        case '===':
          result = valA === valB;
          break;
        case '!=':
        case '!==':
          result = valA !== valB;
          break;
      }
      events.push({ t: 'line', line: lineNum });
      events.push({
        t: 'compare',
        a: { id: 'arr', index: a },
        b: { id: 'arr', index: b },
      });
      events.push({
        t: 'note',
        text: `Line ${lineNum}: Comparing arr[${a}] (${valA}) ${op} arr[${b}] (${valB}) → ${
          result ? 'true' : 'false'
        }.`,
      });
      return result;
    };

    const __swap = (idxA: number, idxB: number, lineNum: number) => {
      if (++stepGuard > MAX_STEPS) {
        throw new Error('MAX_STEPS_EXCEEDED');
      }
      emitInitIfNeeded(extractedArray, 1);
      lastAssignment = null;
      const a = Math.max(0, Math.min(rawArr.length - 1, Math.floor(Number(idxA) || 0)));
      const b = Math.max(0, Math.min(rawArr.length - 1, Math.floor(Number(idxB) || 0)));
      if (a === b) return;
      const valA = rawArr[a];
      const valB = rawArr[b];
      inInternalOp = true;
      rawArr[a] = valB;
      rawArr[b] = valA;
      inInternalOp = false;

      events.push({ t: 'line', line: lineNum });
      events.push({
        t: 'swap',
        a: { id: 'arr', index: a },
        b: { id: 'arr', index: b },
      });
      events.push({
        t: 'note',
        text: `Line ${lineNum}: Swapping ${valA} and ${valB} between arr[${a}] and arr[${b}].`,
      });
    };

    const runner = new Function(
      'arr',
      'n',
      '__initArr',
      '__setLine',
      '__cmp',
      '__swap',
      jsBody,
    );
    runner(
      proxiedArr,
      rawArr.length,
      __initArr,
      __setLine,
      __cmp,
      __swap,
    );

    // Require at least 1 meaningful action (swap, compare, or set beyond initialization)
    const actionEvents = events.filter(
      (e) => e.t === 'swap' || e.t === 'compare',
    );
    const setEvents = events.filter((e) => e.t === 'set');
    if (actionEvents.length === 0 && setEvents.length <= rawArr.length) {
      return null;
    }

    for (let i = 0; i < rawArr.length; i++) {
      events.push({ t: 'visit', id: `arr[${i}]` });
    }
    events.push({
      t: 'note',
      text: `Custom code execution complete! Final array: [${rawArr.join(', ')}].`,
    });
    events.push({ t: 'done' });

    return {
      scene: 'array',
      events,
      extractedArray: [...rawArr],
      executionMode: 'sandbox-array',
      meta: {
        id: 'bubble-sort',
        title: fileName ? `${fileName} (Live Custom Trace)` : 'Custom Code (Live 3D Trace)',
        category: 'sorting',
        timeComplexity: 'Custom',
        spaceComplexity: 'O(1)',
        code: codeLines,
      },
    };
  } catch {
    return null;
  }
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

  // Check Hash Tables before generic Node* linked-list signatures (Separate Chaining uses Node* prev = nullptr)
  if (src.includes('linearprobing') || src.includes('linear probing')) {
    return { kind: 'structure', structOp: 'hash-linear' };
  }
  if (src.includes('hashtable') || src.includes('hashfunction') || src.includes('chaining')) {
    return { kind: 'structure', structOp: 'hash-chaining' };
  }

  // Check structure-specific signatures first so files like `linked_list_sort.cpp` (which have `Node*` + `mergeSort`)
  // stay on their Linked List / Tree / Graph / Hash structure scene!
  if (
    (src.includes('floyd') && (src.includes('cycle') || src.includes('->next'))) ||
    src.includes('hascycle') ||
    src.includes('circularlinkedlist')
  ) {
    return { kind: 'structure', structOp: 'cll-cycle' };
  }
  if (src.includes('doubly') || src.includes('->prev')) {
    return { kind: 'structure', structOp: 'dll-traversal' };
  }
  if (src.includes('findmiddle') || src.includes('slow->next')) {
    return { kind: 'structure', structOp: 'sll-find-middle' };
  }
  if (src.includes('reverselist') || (src.includes('node*') && src.includes('prev = nullptr'))) {
    return { kind: 'structure', structOp: 'sll-reverse' };
  }
  if (src.includes('inserthead')) {
    return { kind: 'structure', structOp: 'sll-insert-head' };
  }
  if (src.includes('inserttail') || src.includes('singlylinkedlist')) {
    return { kind: 'structure', structOp: 'sll-insert-tail' };
  }
  if (
    src.includes('rightrotate') ||
    src.includes('leftrotate') ||
    src.includes('rotateright') ||
    src.includes('rotateleft') ||
    /\bavl\b/.test(src) ||
    src.includes('avltree')
  ) {
    return { kind: 'structure', structOp: 'avl-rotation' };
  }
  if (src.includes('siftdown') || src.includes('extractmax') || src.includes('heapsort')) {
    return { kind: 'structure', structOp: 'heap-extract' };
  }
  if (src.includes('siftup') || src.includes('maxheap') || src.includes('priority_queue')) {
    return { kind: 'structure', structOp: 'heap-insert' };
  }
  if (src.includes('dijkstra')) {
    return { kind: 'structure', structOp: 'graph-dijkstra' };
  }
  if (src.includes('kruskal')) {
    return { kind: 'structure', structOp: 'graph-kruskal' };
  }
  if (/\bprim\b/.test(src) || /\bmst\b/.test(src)) {
    return { kind: 'structure', structOp: 'graph-prim' };
  }
  if (src.includes('topological')) {
    return { kind: 'structure', structOp: 'graph-toposort' };
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
  if (src.includes('levelorder')) {
    return { kind: 'structure', structOp: 'tree-levelorder' };
  }
  if (src.includes('isvalidbst') || src.includes('lowestcommonancestor')) {
    return { kind: 'structure', structOp: 'bst-search' };
  }
  if (/\bbfs\b/.test(src) || src.includes('matrixgraph') || src.includes('listgraph') || src.includes('adjacency matrix')) {
    return { kind: 'structure', structOp: 'graph-bfs' };
  }
  if (/\bdfs\b/.test(src)) {
    return { kind: 'structure', structOp: 'graph-dfs' };
  }
  if (src.includes('hashtable') || src.includes('hashfunction') || src.includes('chaining')) {
    return { kind: 'structure', structOp: 'hash-chaining' };
  }
  if (src.includes('deque') || src.includes('pushfront') || src.includes('pushrear')) {
    return { kind: 'structure', structOp: 'deque-ops' };
  }
  if (src.includes('circularqueue')) {
    return { kind: 'structure', structOp: 'circular-queue' };
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
  if (src.includes('isbalanced') || src.includes('infixtopostfix')) {
    return { kind: 'structure', structOp: 'stack-brackets' };
  }
  if (src.includes('bst') || (src.includes('->left') && src.includes('->right'))) {
    return { kind: 'structure', structOp: 'bst-insert' };
  }
  if (src.includes('push(')) {
    return { kind: 'structure', structOp: 'stack-push' };
  }
  if (src.includes('pop(')) {
    return { kind: 'structure', structOp: 'stack-pop' };
  }
  if (src.includes('node*')) {
    return { kind: 'structure', structOp: 'sll-find-middle' };
  }

  // Array algorithms
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
  if (src.includes('reversearray') || src.includes('reverse(')) {
    return { kind: 'array', arrayOp: 'reverse' };
  }
  if (src.includes('rotateleft') || src.includes('rotateright') || src.includes('rotate(')) {
    return { kind: 'array', arrayOp: 'rotate' };
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

interface SimTreeNode {
  id: string;
  val: number;
  left: SimTreeNode | null;
  right: SimTreeNode | null;
}

type TreeOpKind =
  | 'insert'
  | 'delete'
  | 'search'
  | 'pre'
  | 'in'
  | 'post'
  | 'level'
  | 'min'
  | 'max'
  | 'height';

function classifyTreeCall(name: string): TreeOpKind | null {
  const n = name.toLowerCase();
  if (n.includes('preorder')) return 'pre';
  if (n.includes('postorder')) return 'post';
  if (n.includes('inorder')) return 'in';
  if (n.includes('levelorder') || n.includes('bfs') || n === 'levelorder') return 'level';
  if (n.includes('height') || n.includes('depth')) return 'height';
  if (n.includes('min')) return 'min';
  if (n.includes('max')) return 'max';
  if (n.includes('insert') || n === 'add' || n === 'push') return 'insert';
  if (n.includes('delete') || n.includes('remove') || n.includes('erase') || n === 'del') {
    return 'delete';
  }
  if (n.includes('search') || n.includes('find') || n.includes('contains') || n.includes('exists')) {
    return 'search';
  }
  return null;
}

/**
 * Executes Binary Search Tree programs (class-based or free-function C++) by reading
 * every call made inside `main()` — insert / delete / search / pre-, in-, post-, level-order
 * traversals, min / max / height — and replaying them in order on a real simulated BST,
 * so the 3D tree is built from YOUR values and performs exactly what `main()` does.
 */
function tryExecuteTreeScript(
  sourceCode: string,
  codeLines: string[],
  fileName?: string,
): CustomCodeRunResult | null {
  const lower = sourceCode.toLowerCase();
  const looksLikeTree =
    (/->\s*left\b/.test(sourceCode) && /->\s*right\b/.test(sourceCode)) ||
    /\b(?:bst|binarysearchtree|treenode)\b/.test(lower);
  if (!looksLikeTree) return null;
  // AVL rotations & heaps have their own dedicated visualizations
  if (/rotate|\bavl\b|heapify|siftup|siftdown/.test(lower)) return null;

  const mainIdx = codeLines.findIndex((l) => /\b(?:int|void)\s+main\s*\(/.test(l));
  const scopeStart = mainIdx >= 0 ? mainIdx : 0;
  const scopeLines = codeLines.slice(scopeStart);
  const loopValues = extractNumbersFromCode(scopeLines.join('\n'), []);

  const ops: { kind: TreeOpKind; arg: number | null; line: number; name: string }[] = [];
  const SKIP = new Set(['if', 'for', 'while', 'switch', 'return', 'sizeof', 'main', 'printf']);
  const callRegex = /\b([A-Za-z_]\w*)\s*\(([^()]*)\)/g;

  scopeLines.forEach((rawLine, offset) => {
    const lineNum = scopeStart + offset + 1;
    const line = rawLine.replace(/\/\/.*$/, '');
    // Without a main(), ignore function definition lines
    if (
      mainIdx < 0 &&
      /^\s*(?:void|int|bool|auto|static|TreeNode\s*\*|Node\s*\*)\b[^;]*\)\s*\{?\s*$/.test(line)
    ) {
      return;
    }
    for (const m of line.matchAll(callRegex)) {
      const name = m[1];
      if (SKIP.has(name)) continue;
      const kind = classifyTreeCall(name);
      if (!kind) continue;
      const nums = [...m[2].matchAll(/-?\d+/g)].map((x) => Number(x[0]));
      const arg = nums.length > 0 ? nums[nums.length - 1] : null;
      if (kind === 'insert' && arg === null && loopValues.length > 0) {
        // e.g. `for (...) bst.insert(vals[i]);`
        loopValues.forEach((v) => ops.push({ kind, arg: v, line: lineNum, name }));
        continue;
      }
      ops.push({ kind, arg, line: lineNum, name });
    }
  });

  if (!ops.some((o) => o.kind === 'insert' && o.arg !== null)) {
    return null;
  }

  const events: TraceEvent[] = [];
  let root: SimTreeNode | null = null;
  let nextId = 0;
  const note = (text: string) => events.push({ t: 'note', text });
  const focus = (n: SimTreeNode) =>
    events.push({ t: 'compare', a: { id: n.id }, b: { id: n.id } });
  const makeNode = (val: number): SimTreeNode => ({
    id: `t-${nextId++}`,
    val,
    left: null,
    right: null,
  });

  const collect = (kind: 'pre' | 'in' | 'post' | 'level'): SimTreeNode[] => {
    const out: SimTreeNode[] = [];
    if (kind === 'level') {
      const q: SimTreeNode[] = root ? [root] : [];
      while (q.length > 0) {
        const n = q.shift()!;
        out.push(n);
        if (n.left) q.push(n.left);
        if (n.right) q.push(n.right);
      }
      return out;
    }
    const walk = (n: SimTreeNode | null) => {
      if (!n) return;
      if (kind === 'pre') out.push(n);
      walk(n.left);
      if (kind === 'in') out.push(n);
      walk(n.right);
      if (kind === 'post') out.push(n);
    };
    walk(root);
    return out;
  };

  const TRAVERSAL_LABEL: Record<'pre' | 'in' | 'post' | 'level', string> = {
    pre: 'Pre-order (Root → Left → Right)',
    in: 'In-order (Left → Root → Right)',
    post: 'Post-order (Left → Right → Root)',
    level: 'Level-order (Breadth-First)',
  };

  for (const op of ops) {
    events.push({ t: 'line', line: op.line });

    if (op.kind === 'insert' && op.arg !== null) {
      const key = op.arg;
      events.push({ t: 'call', fn: op.name, args: [key], depth: 1 });
      if (!root) {
        root = makeNode(key);
        events.push({ t: 'create', id: root.id, kind: 'node', value: key });
        note(`Line ${op.line}: ${op.name}(${key}) — the tree is empty, so ${key} becomes the root.`);
      } else {
        let cur: SimTreeNode = root;
        for (;;) {
          if (key === cur.val) {
            focus(cur);
            note(`${op.name}(${key}): ${key} already exists — a BST ignores duplicates.`);
            break;
          }
          const dir: 'left' | 'right' = key < cur.val ? 'left' : 'right';
          focus(cur);
          note(
            `${op.name}(${key}): ${key} ${key < cur.val ? '<' : '>'} ${cur.val}, so go ${dir}.`,
          );
          const child: SimTreeNode | null = cur[dir];
          if (!child) {
            const n = makeNode(key);
            cur[dir] = n;
            events.push({ t: 'link', from: cur.id, to: n.id, label: dir });
            events.push({ t: 'create', id: n.id, kind: 'node', value: key });
            note(`Placed ${key} as the ${dir} child of ${cur.val}.`);
            break;
          }
          cur = child;
        }
      }
      events.push({ t: 'return', fn: op.name });
      continue;
    }

    if (op.kind === 'search' && op.arg !== null) {
      const key = op.arg;
      events.push({ t: 'call', fn: op.name, args: [key], depth: 1 });
      let cur: SimTreeNode | null = root;
      let found = false;
      while (cur) {
        focus(cur);
        if (cur.val === key) {
          note(`${op.name}(${key}): found ${key}!`);
          found = true;
          break;
        }
        const dir = key < cur.val ? 'left' : 'right';
        note(`${op.name}(${key}): ${key} ${key < cur.val ? '<' : '>'} ${cur.val}, so go ${dir}.`);
        cur = cur[dir];
      }
      if (!found) note(`${op.name}(${key}): reached NULL — ${key} is not in the tree.`);
      events.push({ t: 'return', fn: op.name });
      continue;
    }

    if (op.kind === 'delete' && op.arg !== null) {
      const key = op.arg;
      events.push({ t: 'call', fn: op.name, args: [key], depth: 1 });
      let parent: SimTreeNode | null = null;
      let cur: SimTreeNode | null = root;
      while (cur && cur.val !== key) {
        focus(cur);
        const dir = key < cur.val ? 'left' : 'right';
        note(`${op.name}(${key}): ${key} ${key < cur.val ? '<' : '>'} ${cur.val}, so go ${dir}.`);
        parent = cur;
        cur = cur[dir];
      }
      if (!cur) {
        note(`${op.name}(${key}): ${key} is not in the tree, nothing to delete.`);
      } else {
        const target: SimTreeNode = cur;
        const parentDir: 'left' | 'right' | null = parent
          ? parent.left === target
            ? 'left'
            : 'right'
          : null;
        focus(target);
        if (target.left && target.right) {
          note(`Found ${key}. It has two children, so find its in-order successor (smallest in right subtree).`);
          let succParent = target;
          let succ = target.right;
          focus(succ);
          note(`Step right to ${succ.val}.`);
          while (succ.left) {
            succParent = succ;
            succ = succ.left;
            focus(succ);
            note(`Keep going left to ${succ.val}.`);
          }
          target.val = succ.val;
          events.push({ t: 'set', target: { id: target.id }, value: succ.val });
          note(`Copy successor ${succ.val} into the node that held ${key}.`);
          const sDir: 'left' | 'right' = succParent.left === succ ? 'left' : 'right';
          if (succ.right) {
            events.push({ t: 'link', from: succParent.id, to: succ.right.id, label: sDir });
          }
          events.push({ t: 'remove', id: succ.id });
          succParent[sDir] = succ.right;
          note(`Removed the old successor node, so ${key} is gone from the tree.`);
        } else {
          const child: SimTreeNode | null = target.left ?? target.right;
          events.push({ t: 'remove', id: target.id });
          if (parent && parentDir) {
            if (child) {
              events.push({ t: 'link', from: parent.id, to: child.id, label: parentDir });
            }
            parent[parentDir] = child;
          } else {
            root = child;
          }
          note(
            child
              ? `Found ${key} with one child (${child.val}); linked ${child.val} up in its place.`
              : `Found ${key}, a leaf node — simply removed it.`,
          );
        }
      }
      events.push({ t: 'return', fn: op.name });
      continue;
    }

    if (op.kind === 'pre' || op.kind === 'in' || op.kind === 'post' || op.kind === 'level') {
      const order = collect(op.kind);
      events.push({ t: 'call', fn: op.name, args: [], depth: 1 });
      note(`Line ${op.line}: ${op.name}() starts a ${TRAVERSAL_LABEL[op.kind]} traversal.`);
      const printed: number[] = [];
      for (const n of order) {
        printed.push(n.val);
        events.push({ t: 'visit', id: n.id });
        note(`${op.name}: visit ${n.val} → output so far: ${printed.join(' ')}`);
      }
      note(`${op.name}() printed: ${printed.join(' ') || '(empty tree)'}`);
      events.push({ t: 'return', fn: op.name });
      continue;
    }

    if ((op.kind === 'min' || op.kind === 'max') && root) {
      const dir = op.kind === 'min' ? 'left' : 'right';
      let cur: SimTreeNode = root;
      focus(cur);
      note(`${op.name}(): start at the root ${cur.val} and keep going ${dir}.`);
      while (cur[dir]) {
        cur = cur[dir]!;
        focus(cur);
        note(`${op.name}(): move ${dir} to ${cur.val}.`);
      }
      note(`${op.name}() = ${cur.val}.`);
      continue;
    }

    if (op.kind === 'height') {
      const h = (n: SimTreeNode | null): number => (n ? 1 + Math.max(h(n.left), h(n.right)) : 0);
      note(`${op.name}() = ${h(root)} levels.`);
    }
  }

  events.push({ t: 'done' });

  return {
    scene: 'bst',
    events,
    extractedArray: collect('in').map((n) => n.val),
    executionMode: 'script-structure',
    meta: {
      id: 'bubble-sort',
      title: fileName ? `${fileName} (Live BST Program)` : 'Custom BST Program',
      category: 'operation',
      timeComplexity: 'O(h) per op',
      spaceComplexity: 'O(n)',
      code: codeLines,
    },
  };
}

/**
 * Runs user-edited or uploaded C++/JS source code and generates a live 3D TraceEvent[]
 * reflecting custom loops, swaps, structure scripts, array literals, and source lines.
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

  // 0. Try executing as a Binary Search Tree program (replays main()'s calls)
  const treeResult = tryExecuteTreeScript(sourceCode, codeLines, fileName);
  if (treeResult) {
    return treeResult;
  }

  // 1. Try executing as a multi-step Stack / Queue / Linked-List script
  const scriptResult = tryExecuteStructureScript(
    sourceCode,
    codeLines,
    extractedArray,
    fileName,
  );
  if (scriptResult) {
    return scriptResult;
  }

  // 2. Try executing as live sandboxed C++/JS array manipulation code
  const sandboxResult = tryExecuteCustomArraySandbox(
    sourceCode,
    codeLines,
    extractedArray,
    fileName,
  );
  if (sandboxResult) {
    return sandboxResult;
  }

  // 3. Fall back to full C++ corpus / structure operation recognizer
  const inferred = inferOperationFromCode(sourceCode, fallbackCorpusPath);

  if (inferred.kind === 'array' && inferred.arrayOp) {
    const res = runArrayOperation(
      inferred.arrayOp,
      extractedArray,
      2,
      extractedParam,
      true,
    );
    return {
      scene: 'array',
      events: res.events,
      extractedArray: res.finalArray,
      executionMode: 'corpus-operation',
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
    executionMode: 'corpus-operation',
    meta: {
      ...res.meta,
      title: fileName ? `${fileName} (${res.meta.title})` : res.meta.title,
      code: codeLines,
    },
  };
}
