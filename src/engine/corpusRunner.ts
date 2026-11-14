/**
 * Corpus Operation Runner (Library Tab Unified Trace & Highlight)
 *
 * Executes the real `cpp_corpus/*.cpp` source file through `runCppTrace` for
 * interactive Library operation buttons (`ArrayOperationId` and `StructureOperationId`),
 * so both the 3D scene snapshot and `activeLine` highlight come from the SAME
 * trace step.
 *
 * When a corpus file's `main()` is replaced with a driver `main()` to invoke a
 * specific class method or function with the user's chosen parameters, `main()`
 * is replaced at its EXACT original starting line number so that every line
 * above `main()` (all classes, structs, and algorithm functions) stays at its
 * exact 1-based line number in the displayed `cpp_corpus/*.cpp` file.
 */

import {
  ARRAY_ALGORITHM_METADATA,
  type AlgorithmMetadata,
  type ArrayOperationId,
} from '../algorithms/array/arrayAlgorithms';
import {
  STRUCTURE_OP_CATALOG,
  type StructureOperationId,
} from '../algorithms/structures/structureAlgorithms';
import {
  getCorpusCodeLines,
  getCorpusRawText,
} from '../corpus/cppCorpusRegistry';
import type { PreviewSceneKind, TraceEvent } from '../types/trace';
import { runCppTrace } from './cppInterpreter';

export const ARRAY_CORPUS_MAP: Record<ArrayOperationId, string> = {
  'bubble-sort': '06_elementary_sorting/bubble_sort.cpp',
  'selection-sort': '06_elementary_sorting/selection_sort.cpp',
  'insertion-sort': '06_elementary_sorting/insertion_sort.cpp',
  'merge-sort': '07_advanced_sorting/merge_sort.cpp',
  'quick-sort': '07_advanced_sorting/quick_sort.cpp',
  'insert-at': '01_arrays_and_searching/array_operations.cpp',
  'delete-at': '01_arrays_and_searching/array_operations.cpp',
  'delete-val': '01_arrays_and_searching/array_operations.cpp',
  'update-at': '01_arrays_and_searching/array_operations.cpp',
  'linear-search': '01_arrays_and_searching/linear_search.cpp',
  'binary-search': '01_arrays_and_searching/binary_search.cpp',
  reverse: '01_arrays_and_searching/array_operations.cpp',
  rotate: '01_arrays_and_searching/array_operations.cpp',
  'rotate-right': '01_arrays_and_searching/array_operations.cpp',
};

export interface CorpusOperationTraceResult {
  scene: PreviewSceneKind;
  corpusPath: string;
  events: TraceEvent[];
  finalArray: number[];
  meta: AlgorithmMetadata;
  /**
   * 1-based step index right after initial array/structure seeding completes,
   * so playback and `stepForward()` begin immediately on the requested operation.
   */
  operationStartStep: number;
  /**
   * Non-null ONLY when an operation button has no implementation in the corpus
   * file (e.g., `rotate` left, `recursion-factorial`, `recursion-hanoi`,
   * `graph-prim`, `hash-quadratic`, `hash-double`).
   */
  unsupportedCorpusReason: string | null;
}

/**
 * Replaces `int main()` and everything below it in `rawCpp` with `driverMainLines`,
 * keeping every line above `int main()` at its exact original 1-based line number.
 * Also clamps any trace event lines inside the synthesized `main()` to the displayed
 * corpus file's `main()` body lines so every `activeLine` is an executable line of
 * the displayed file.
 */
function replaceMainPreservingLines(
  rawCpp: string,
  driverMainBodyLines: string[],
  extraFunctionsBeforeMain: string[] = [],
): {
  modifiedSource: string;
  mainStartLine: number;
  originalLineCount: number;
} {
  const origLines = rawCpp.replace(/\r\n/g, '\n').trimEnd().split('\n');
  let mainLineIdx = origLines.findIndex((l) => /^\s*int\s+main\s*\(/.test(l));
  if (mainLineIdx < 0) {
    mainLineIdx = origLines.length;
  }
  const prefix = origLines.slice(0, mainLineIdx);
  const modifiedLines = [
    ...prefix,
    ...extraFunctionsBeforeMain,
    'int main() {',
    ...driverMainBodyLines.map((l) => `    ${l}`),
    '    return 0;',
    '}',
  ];
  return {
    modifiedSource: modifiedLines.join('\n'),
    mainStartLine: mainLineIdx + 1,
    originalLineCount: origLines.length,
  };
}

/**
 * Finds all 1-based executable line numbers in `corpusLines` so any synthesized
 * driver `main()` setup lines can be clamped to real executable lines of the
 * displayed corpus file.
 */
export function getExecutableLineNumbers(corpusLines: string[]): Set<number> {
  const set = new Set<number>();
  for (let i = 0; i < corpusLines.length; i++) {
    const trimmed = corpusLines[i].trim();
    if (
      !trimmed ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('using ') ||
      trimmed === '{' ||
      trimmed === '}' ||
      trimmed === '};' ||
      trimmed === 'public:' ||
      trimmed === 'private:' ||
      trimmed === 'protected:'
    ) {
      continue;
    }
    set.add(i + 1);
  }
  return set;
}

function normalizeDriverLinesToExecutableCorpusLines(
  events: TraceEvent[],
  corpusLines: string[],
  mainStartLine: number,
): TraceEvent[] {
  const execSet = getExecutableLineNumbers(corpusLines);
  const execArr = [...execSet].sort((a, b) => a - b);
  if (execArr.length === 0) return events;

  const mainExecLines = execArr.filter((l) => l >= mainStartLine);
  const fallbackMainLine = mainExecLines[0] ?? execArr[execArr.length - 1];

  return events.map((ev) => {
    const rawLine = ev.line ?? fallbackMainLine;
    if (rawLine >= 1 && rawLine <= corpusLines.length && execSet.has(rawLine)) {
      return ev;
    }
    // Find nearest executable line in the displayed corpus file
    if (rawLine >= mainStartLine && mainExecLines.length > 0) {
      const offset = rawLine - mainStartLine;
      const mapped = mainExecLines[Math.min(offset, mainExecLines.length - 1)] ?? fallbackMainLine;
      return { ...ev, line: mapped };
    }
    let nearest = execArr[0];
    let bestDist = Math.abs(rawLine - nearest);
    for (const candidate of execArr) {
      const d = Math.abs(rawLine - candidate);
      if (d < bestDist) {
        bestDist = d;
        nearest = candidate;
      }
    }
    return { ...ev, line: nearest };
  });
}

function extractOperationStartStepAndCleanMarkers(
  events: TraceEvent[],
  _corpusPath: string,
  n: number,
): { cleanedEvents: TraceEvent[]; operationStartStep: number } {
  const markerIdx = events.findIndex((e) => e.t === 'note' && e.text === '__OP_START__');
  if (markerIdx >= 0) {
    const cleaned = events.filter((e) => !(e.t === 'note' && e.text === '__OP_START__'));
    // Find the last note at or before markerIdx so the scene shows the seeded state right before the operation
    let startStep = Math.max(1, Math.min(markerIdx, cleaned.length));
    for (let i = Math.min(markerIdx - 1, cleaned.length - 1); i >= 0; i--) {
      if (cleaned[i].t === 'note') {
        startStep = i + 1;
        break;
      }
    }
    return { cleanedEvents: cleaned, operationStartStep: startStep };
  }

  // For stdin-driven array files (`cin >> n; for (int i=0; i<n; i++) cin >> arr[i];`),
  // find the step where the last `cin >> arr[i]` (`Set arr[n-1]`) completes.
  let lastInitSetIdx = -1;
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (
      ev.t === 'note' &&
      n > 0 &&
      ev.text.includes(`Set arr[${n - 1}] =`) &&
      lastInitSetIdx === -1
    ) {
      lastInitSetIdx = i;
      break;
    }
  }
  if (lastInitSetIdx >= 0) {
    return { cleanedEvents: events, operationStartStep: lastInitSetIdx + 1 };
  }

  const firstNoteIdx = events.findIndex((e) => e.t === 'note');
  return {
    cleanedEvents: events,
    operationStartStep: firstNoteIdx >= 0 ? firstNoteIdx + 1 : 1,
  };
}

/**
 * Executes an `ArrayOperationId` against its `cpp_corpus/*.cpp` file using `runCppTrace`.
 */
export function runCorpusArrayOperation(
  op: ArrayOperationId,
  workingArray: number[],
  paramIndex = 0,
  paramValue = 42,
): CorpusOperationTraceResult {
  const corpusPath = ARRAY_CORPUS_MAP[op];
  const rawCpp = getCorpusRawText(corpusPath);
  const corpusLines = getCorpusCodeLines(corpusPath, ARRAY_ALGORITHM_METADATA[op].code);
  const baseMeta: AlgorithmMetadata = {
    ...ARRAY_ALGORITHM_METADATA[op],
    code: corpusLines,
  };
  const safeArr = workingArray.length > 0 ? workingArray.slice(0, 16) : [42, 17, 68, 29, 84, 12];
  const n = safeArr.length;
  const clampedIdx = Math.max(0, Math.min(n - 1, Math.trunc(paramIndex)));
  const clampedInsertIdx = Math.max(0, Math.min(n, Math.trunc(paramIndex)));

  let stdinInputs: (number | string)[] = [];
  let sourceToRun = rawCpp;
  let mainStartLine = corpusLines.length;
  let unsupportedReason: string | null = null;

  switch (op) {
    case 'bubble-sort':
    case 'selection-sort':
    case 'insertion-sort':
    case 'merge-sort':
    case 'quick-sort': {
      stdinInputs = [n, ...safeArr];
      break;
    }

    case 'linear-search': {
      stdinInputs = [n, ...safeArr, paramValue];
      break;
    }

    case 'binary-search': {
      const sorted = [...safeArr].sort((a, b) => a - b);
      // Run iterative binarySearch(arr, n, key) directly in main so trace is concise
      const replaced = replaceMainPreservingLines(rawCpp, [
        `int arr[${n}] = {${sorted.join(', ')}};`,
        `int n = ${n};`,
        `int key = ${paramValue};`,
        `__markOperationStart();`,
        `int idx = binarySearch(arr, n, key);`,
        `cout << "Iterative Search: " << idx << endl;`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'insert-at': {
      stdinInputs = [n, ...safeArr, 1, clampedInsertIdx, paramValue];
      break;
    }

    case 'delete-at': {
      stdinInputs = [n, ...safeArr, 2, clampedIdx];
      break;
    }

    case 'update-at': {
      stdinInputs = [n, ...safeArr, 3, clampedIdx, paramValue];
      break;
    }

    case 'reverse': {
      stdinInputs = [n, ...safeArr, 4];
      break;
    }

    case 'rotate-right': {
      stdinInputs = [n, ...safeArr, 5];
      break;
    }

    case 'delete-val': {
      const targetVal = safeArr.includes(paramValue) ? paramValue : (safeArr[0] ?? paramValue);
      stdinInputs = [n, ...safeArr, 6, targetVal];
      break;
    }

    case 'rotate': {
      // Report explicitly that array_operations.cpp only implements Rotate Right (case 5)
      unsupportedReason =
        '01_arrays_and_searching/array_operations.cpp implements Rotate Right (case 5), not Rotate Left; executing Rotate Right (case 5) from the corpus file.';
      stdinInputs = [n, ...safeArr, 5];
      break;
    }
  }

  const traceRes = runCppTrace(sourceToRun, {
    fallbackArray: safeArr,
    stdinInputs,
    fileName: corpusPath.split('/')[1] ?? corpusPath,
  });

  const { cleanedEvents, operationStartStep } = extractOperationStartStepAndCleanMarkers(
    traceRes.events,
    corpusPath,
    n,
  );

  const normalizedEvents = normalizeDriverLinesToExecutableCorpusLines(
    cleanedEvents,
    corpusLines,
    mainStartLine,
  );

  return {
    scene: 'array',
    corpusPath,
    events: normalizedEvents,
    finalArray: traceRes.extractedArray,
    meta: baseMeta,
    operationStartStep,
    unsupportedCorpusReason: unsupportedReason,
  };
}

/**
 * Executes a `StructureOperationId` against its `cpp_corpus/*.cpp` file using `runCppTrace`.
 */
export function runCorpusStructureOperation(
  op: StructureOperationId,
  workingArray: number[],
  paramValue = 40,
  paramText?: string,
): CorpusOperationTraceResult {
  const def = STRUCTURE_OP_CATALOG.find((item) => item.id === op);
  const corpusPath = def?.corpusPath ?? '02_singly_linked_list/singly_linked_list.cpp';
  const scene: PreviewSceneKind = def?.scene ?? 'linked-list';
  const rawCpp = getCorpusRawText(corpusPath);
  const corpusLines = getCorpusCodeLines(corpusPath, []);
  const safeArr = workingArray.length > 0 ? workingArray.slice(0, 12) : [10, 25, 40, 55];

  let stdinInputs: (number | string)[] = [];
  let sourceToRun = rawCpp;
  let mainStartLine = corpusLines.length;
  let unsupportedReason: string | null = null;
  let expectedBaseNodeCount: number | undefined;
  let postProcessSummaryNote: ((coutText: string, events: TraceEvent[]) => string | null) | null = null;

  switch (op) {
    // ==========================================
    // LINKED LIST (Weeks 2 & 3)
    // ==========================================
    case 'sll-insert-head': {
      const baseVals = safeArr;
      expectedBaseNodeCount = baseVals.length;
      const replaced = replaceMainPreservingLines(rawCpp, [
        ...baseVals.map((v) => `insertEnd(${v});`),
        `__markOperationStart();`,
        `insertBeginning(${paramValue});`,
        `display();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'sll-insert-tail': {
      const baseVals = safeArr;
      expectedBaseNodeCount = baseVals.length;
      const replaced = replaceMainPreservingLines(rawCpp, [
        ...baseVals.map((v) => `insertEnd(${v});`),
        `__markOperationStart();`,
        `insertEnd(${paramValue});`,
        `display();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'sll-delete-val': {
      const baseVals = safeArr;
      expectedBaseNodeCount = baseVals.length;
      const targetIdx = baseVals.indexOf(paramValue);
      const pos1Based = targetIdx >= 0 ? targetIdx + 1 : Math.min(2, baseVals.length);
      const replaced = replaceMainPreservingLines(rawCpp, [
        ...baseVals.map((v) => `insertEnd(${v});`),
        `__markOperationStart();`,
        `deletePosition(${pos1Based});`,
        `display();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'sll-search': {
      const baseVals = safeArr;
      expectedBaseNodeCount = baseVals.length;
      const replaced = replaceMainPreservingLines(rawCpp, [
        ...baseVals.map((v) => `insertEnd(${v});`),
        `__markOperationStart();`,
        `search(${paramValue});`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      postProcessSummaryNote = (coutText) => {
        const m = coutText.match(/Found at position\s+(\d+)/i);
        if (m) {
          return `Found ${paramValue} at node #${m[1]}!`;
        }
        return `${paramValue} was not found in the linked list.`;
      };
      break;
    }

    case 'sll-reverse': {
      const baseVals = safeArr;
      expectedBaseNodeCount = baseVals.length;
      const replaced = replaceMainPreservingLines(rawCpp, [
        ...baseVals.map((v) => `insertEnd(${v});`),
        `__markOperationStart();`,
        `reverseList();`,
        `display();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'sll-find-middle': {
      const baseVals = [...safeArr.slice(0, 6)].sort((a, b) => a - b);
      expectedBaseNodeCount = baseVals.length;
      const replaced = replaceMainPreservingLines(rawCpp, [
        `Node* list1 = NULL;`,
        ...baseVals.map((v) => `insertEnd(list1, ${v});`),
        `__markOperationStart();`,
        `Node* middle = findMiddle(list1);`,
        `if (middle != NULL) cout << "Middle: " << middle->data << endl;`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'dll-traversal': {
      const baseVals = safeArr.slice(0, 5);
      expectedBaseNodeCount = baseVals.length;
      const replaced = replaceMainPreservingLines(rawCpp, [
        ...baseVals.map((v) => `insertEnd(${v});`),
        `__markOperationStart();`,
        `displayForward();`,
        `displayBackward();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'cll-cycle': {
      const baseVals = safeArr.slice(0, 4);
      expectedBaseNodeCount = baseVals.length;
      const replaced = replaceMainPreservingLines(rawCpp, [
        `Node* head = NULL;`,
        ...baseVals.map((v) => `insertEnd(head, ${v});`),
        `if (head != NULL && head->next != NULL && head->next->next != NULL) {`,
        `    Node* tail = head;`,
        `    while (tail->next != NULL) { tail = tail->next; }`,
        `    tail->next = head->next;`,
        `}`,
        `__markOperationStart();`,
        `bool hasLoop = detectCycle(head);`,
        `cout << (hasLoop ? "Cycle detected" : "No cycle detected") << endl;`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    // ==========================================
    // STACK & RECURSION (Week 4)
    // ==========================================
    case 'stack-push': {
      const baseVals = safeArr;
      stdinInputs = [
        ...baseVals.flatMap((v) => [1, v]),
        1,
        paramValue,
        4,
        7,
      ];
      break;
    }

    case 'stack-pop': {
      const baseVals = safeArr;
      const replaced = replaceMainPreservingLines(rawCpp, [
        ...baseVals.map((v) => `push(${v});`),
        `__markOperationStart();`,
        `pop();`,
        `display();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'stack-peek': {
      const baseVals = safeArr;
      stdinInputs = [
        ...baseVals.flatMap((v) => [1, v]),
        3,
        7,
      ];
      break;
    }

    case 'stack-brackets': {
      const exprStr = paramText && paramText.trim().length > 0 ? paramText.trim() : '{[()]}';
      stdinInputs = [1, exprStr, 4];
      postProcessSummaryNote = (coutText) => {
        if (coutText.includes('Parentheses are Balanced')) {
          return `Expression "${exprStr}" has balanced brackets! Stack is empty.`;
        }
        return `Expression "${exprStr}" is NOT balanced!`;
      };
      break;
    }

    case 'recursion-factorial': {
      // Report explicitly: viva_stack_applications.cpp does not contain a factorial() function;
      // it implements balancedParentheses, infixToPostfix, and evaluatePostfix.
      unsupportedReason =
        '04_recursion_and_stack/viva_stack_applications.cpp does not define a factorial() function (it defines balancedParentheses, infixToPostfix, and evaluatePostfix). Executing recursive factorial(n) via driver main.';
      const nVal = Math.max(1, Math.min(6, Math.trunc(paramValue) || 4));
      const replaced = replaceMainPreservingLines(
        rawCpp,
        [
          `int result = factorial(${nVal});`,
          `cout << "factorial(" << ${nVal} << ") = " << result << endl;`,
        ],
        [
          `int factorial(int n) { if (n <= 1) return 1; return n * factorial(n - 1); }`,
        ],
      );
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'recursion-hanoi': {
      // Report explicitly: viva_stack_applications.cpp does not contain a towerOfHanoi() function.
      unsupportedReason =
        '04_recursion_and_stack/viva_stack_applications.cpp does not define a towerOfHanoi() function (it defines balancedParentheses, infixToPostfix, and evaluatePostfix). Executing recursive towerOfHanoi(n, A, C, B) via driver main.';
      const diskCount = Math.max(1, Math.min(5, safeArr.length || 3));
      const totalMoves = Math.pow(2, diskCount) - 1;
      const replaced = replaceMainPreservingLines(
        rawCpp,
        [
          `__hanoiInit(${diskCount});`,
          `__markOperationStart();`,
          `towerOfHanoi(${diskCount}, 'A', 'C', 'B');`,
        ],
        [
          `void towerOfHanoi(int n, char fromPeg, char toPeg, char auxPeg) { if (n == 0) return; towerOfHanoi(n - 1, fromPeg, auxPeg, toPeg); __hanoiMove(n, fromPeg, toPeg); towerOfHanoi(n - 1, auxPeg, toPeg, fromPeg); }`,
        ],
      );
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      postProcessSummaryNote = () =>
        `Tower of Hanoi complete! Moved ${diskCount} disks from peg-A to peg-C in ${totalMoves} moves.`;
      break;
    }

    // ==========================================
    // QUEUE & DEQUE (Week 5)
    // ==========================================
    case 'queue-enqueue': {
      const baseVals = safeArr.slice(0, 4);
      const replaced = replaceMainPreservingLines(rawCpp, [
        `LinearQueue lq;`,
        ...baseVals.map((v) => `lq.enqueue(${v});`),
        `__markOperationStart();`,
        `lq.enqueue(${paramValue});`,
        `lq.display();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'queue-dequeue': {
      const baseVals = safeArr.slice(0, 4);
      const replaced = replaceMainPreservingLines(rawCpp, [
        `LinearQueue lq;`,
        ...baseVals.map((v) => `lq.enqueue(${v});`),
        `__markOperationStart();`,
        `lq.dequeue();`,
        `lq.display();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'circular-queue': {
      const replaced = replaceMainPreservingLines(rawCpp, [
        `CircularQueue cq;`,
        `cq.enqueue(10);`,
        `cq.enqueue(20);`,
        `cq.enqueue(30);`,
        `cq.enqueue(40);`,
        `__markOperationStart();`,
        `cq.dequeue();`,
        `cq.enqueue(${paramValue});`,
        `cq.display();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'deque-ops': {
      // Run deque.cpp unmodified
      break;
    }

    // ==========================================
    // BINARY TREE, BST & AVL (Weeks 9, 11, 12)
    // ==========================================
    case 'bst-insert': {
      const baseVals = safeArr.length >= 5
        ? buildBalancedBstInsertionOrder(safeArr)
        : [50, 30, 70, 20, 40, 60, 80];
      expectedBaseNodeCount = baseVals.length;
      const insertVal = baseVals.includes(paramValue) ? paramValue + 5 : paramValue;
      const replaced = replaceMainPreservingLines(rawCpp, [
        `BinarySearchTree bst;`,
        ...baseVals.map((v) => `bst.insert(${v});`),
        `__markOperationStart();`,
        `bst.insert(${insertVal});`,
        `bst.inOrder();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'bst-search': {
      const baseVals = safeArr.length >= 5
        ? buildBalancedBstInsertionOrder(safeArr)
        : [50, 30, 70, 20, 40, 60, 80];
      expectedBaseNodeCount = baseVals.length;
      const replaced = replaceMainPreservingLines(rawCpp, [
        `BinarySearchTree bst;`,
        ...baseVals.map((v) => `bst.insert(${v});`),
        `__markOperationStart();`,
        `bool found = bst.search(${paramValue});`,
        `cout << "Search " << ${paramValue} << ": " << (found ? "Found" : "Not Found") << endl;`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      postProcessSummaryNote = (coutText) => {
        if (coutText.includes('Not Found')) {
          return `${paramValue} is not in this BST (reached nullptr).`;
        }
        return `Found ${paramValue} in the BST!`;
      };
      break;
    }

    case 'bst-delete': {
      const baseVals = safeArr.length >= 5
        ? buildBalancedBstInsertionOrder(safeArr)
        : [50, 30, 70, 20, 40, 60, 80];
      expectedBaseNodeCount = baseVals.length;
      const delKey = baseVals.includes(paramValue) ? paramValue : (baseVals[1] ?? 30);
      const replaced = replaceMainPreservingLines(rawCpp, [
        `BinarySearchTree bst;`,
        ...baseVals.map((v) => `bst.insert(${v});`),
        `__markOperationStart();`,
        `bst.deleteKey(${delKey});`,
        `bst.inOrder();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'tree-inorder':
    case 'tree-preorder':
    case 'tree-postorder':
    case 'tree-levelorder': {
      const methodCall =
        op === 'tree-inorder'
          ? 'tree.inOrder();'
          : op === 'tree-preorder'
            ? 'tree.preOrder();'
            : op === 'tree-postorder'
              ? 'tree.postOrder();'
              : 'tree.levelOrder();';
      const replaced = replaceMainPreservingLines(rawCpp, [
        `BinaryTree tree;`,
        `for (int i = 1; i <= 7; i++) { tree.insertLevelOrder(i); }`,
        `__markOperationStart();`,
        methodCall,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'avl-rotation': {
      const replaced = replaceMainPreservingLines(rawCpp, [
        `AVLTree tree;`,
        `int keys[6] = {10, 20, 30, 40, 50, 25};`,
        `for (int k : keys) { tree.insert(k); }`,
        `tree.preOrder();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    // ==========================================
    // BINARY HEAP & PRIORITY QUEUE (Week 10)
    // ==========================================
    case 'heap-insert': {
      const baseVals = safeArr.slice(0, 6);
      const replaced = replaceMainPreservingLines(rawCpp, [
        `MaxHeap pq;`,
        ...baseVals.map((v) => `pq.insert(${v});`),
        `__markOperationStart();`,
        `pq.insert(${paramValue});`,
        `pq.printHeap();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      postProcessSummaryNote = (_coutText, evs) => {
        const opMarkerIdx = evs.findIndex((e) => e.t === 'note' && e.text === '__OP_START__');
        const swapsAfterStart = evs
          .slice(opMarkerIdx >= 0 ? opMarkerIdx : 0)
          .filter((e) => e.t === 'swap').length;
        if (swapsAfterStart === 0) {
          return `Inserted ${paramValue} at leaf; heap order already holds so no swap is needed.`;
        }
        return `Inserted ${paramValue} and sifted up (${swapsAfterStart} swap${swapsAfterStart > 1 ? 's' : ''}).`;
      };
      break;
    }

    case 'heap-extract': {
      const baseVals = safeArr.slice(0, 6);
      const replaced = replaceMainPreservingLines(rawCpp, [
        `MaxHeap pq;`,
        ...baseVals.map((v) => `pq.insert(${v});`),
        `__markOperationStart();`,
        `int top = pq.extractMax();`,
        `cout << "Extracted max: " << top << endl;`,
        `pq.printHeap();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'heap-build': {
      const baseVals = safeArr.slice(0, 7);
      const replaced = replaceMainPreservingLines(rawCpp, [
        `MaxHeap pq;`,
        `vector<int> raw = {${baseVals.join(', ')}};`,
        `__markOperationStart();`,
        `pq.buildHeap(raw);`,
        `pq.printHeap();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'heap-sort': {
      const baseVals = safeArr.slice(0, 6);
      const replaced = replaceMainPreservingLines(rawCpp, [
        `vector<int> arr = {${baseVals.join(', ')}};`,
        `__markOperationStart();`,
        `heapSort(arr);`,
        `printArray(arr);`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    // ==========================================
    // GRAPH (Weeks 13 & 14)
    // ==========================================
    case 'graph-bfs':
    case 'graph-dfs': {
      const callStmt = op === 'graph-bfs' ? 'bfs(0);' : 'dfs(0);';
      const replaced = replaceMainPreservingLines(rawCpp, [
        `for (int i = 0; i < V; i++) { graph[i] = NULL; }`,
        `addEdge(0, 1);`,
        `addEdge(0, 2);`,
        `addEdge(1, 3);`,
        `addEdge(1, 4);`,
        `addEdge(2, 5);`,
        `resetVisited();`,
        `__markOperationStart();`,
        callStmt,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'graph-dijkstra':
    case 'graph-kruskal':
    case 'graph-toposort': {
      // Run unmodified main() from dijkstra.cpp, kruskal_mst.cpp, topological_sort.cpp
      break;
    }

    case 'graph-prim': {
      unsupportedReason =
        "14_graph_mst_toposort/kruskal_mst.cpp implements Kruskal's MST (sortEdges, find, unionSets, kruskal), not Prim's MST. Executing kruskal() from the corpus file.";
      break;
    }

    // ==========================================
    // HASH TABLE (Week 15)
    // ==========================================
    case 'hash-linear':
    case 'hash-quadratic':
    case 'hash-double': {
      if (op === 'hash-quadratic') {
        unsupportedReason =
          '15_hashing/linear_probing.cpp implements HashTableLinearProbing, not Quadratic Probing. Executing HashTableLinearProbing::insert from the corpus file.';
      } else if (op === 'hash-double') {
        unsupportedReason =
          '15_hashing/linear_probing.cpp implements HashTableLinearProbing, not Double Hashing. Executing HashTableLinearProbing::insert from the corpus file.';
      }
      const replaced = replaceMainPreservingLines(rawCpp, [
        `HashTableLinearProbing ht(7);`,
        `ht.insert(10);`,
        `ht.insert(17);`,
        `ht.insert(24);`,
        `__markOperationStart();`,
        `ht.insert(${paramValue});`,
        `ht.display();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }

    case 'hash-chaining': {
      const replaced = replaceMainPreservingLines(rawCpp, [
        `HashTableSeparateChaining ht(5);`,
        `ht.insert(10);`,
        `ht.insert(15);`,
        `ht.insert(7);`,
        `ht.insert(12);`,
        `__markOperationStart();`,
        `ht.insert(${paramValue});`,
        `ht.display();`,
      ]);
      sourceToRun = replaced.modifiedSource;
      mainStartLine = replaced.mainStartLine;
      break;
    }
  }

  const traceRes = runCppTrace(sourceToRun, {
    fallbackArray: safeArr,
    stdinInputs,
    fileName: corpusPath.split('/')[1] ?? corpusPath,
    expectedBaseNodeCount,
  });

  let rawEvents = [...traceRes.events];

  if (op === 'stack-brackets') {
    // Clear any leftover stack nodes when balancedParentheses finishes
    if (traceRes.coutOutput.includes('Parentheses are Balanced')) {
      for (const ev of rawEvents) {
        if (ev.t === 'create' && ev.kind === 'node') {
          const hasRemove = rawEvents.some((r) => r.t === 'remove' && r.id === ev.id);
          if (!hasRemove) {
            rawEvents.splice(rawEvents.length - 1, 0, {
              t: 'remove',
              id: ev.id,
              line: mainStartLine,
            });
          }
        }
      }
    }
  } else if (scene === 'heap') {
    // Mirror the complete binary heap array (`arr`) onto the standard 3D heap tree node slots (`bst-50`, `bst-30`, `bst-70`, ...)
    const HEAP_TREE_IDS = ['bst-50', 'bst-30', 'bst-70', 'bst-20', 'bst-40', 'bst-60', 'bst-80'];
    const currentHeap: number[] = [];
    const createdTreeIds = new Set<string>();
    const linkedEdges = new Set<string>();
    const augmented: TraceEvent[] = [];

    const syncHeapTree = (line: number) => {
      const count = Math.min(currentHeap.length, HEAP_TREE_IDS.length);
      for (let i = 0; i < count; i++) {
        const nid = HEAP_TREE_IDS[i];
        const val = currentHeap[i];
        if (!createdTreeIds.has(nid)) {
          createdTreeIds.add(nid);
          augmented.push({ t: 'create', id: nid, kind: 'node', value: val, line });
        } else {
          augmented.push({ t: 'set', target: { id: nid }, value: val, line });
        }
        if (i > 0) {
          const parentIdx = Math.floor((i - 1) / 2);
          const parentId = HEAP_TREE_IDS[parentIdx];
          const label = i % 2 === 1 ? 'left' : 'right';
          const edgeKey = `${parentId}->${nid}`;
          if (!linkedEdges.has(edgeKey)) {
            linkedEdges.add(edgeKey);
            augmented.push({ t: 'link', from: parentId, to: nid, label, line });
          }
        }
      }
    };

    for (const ev of rawEvents) {
      if (ev.t === 'set' && ev.target.id === 'arr' && typeof ev.target.index === 'number') {
        currentHeap[ev.target.index] = Number(ev.value ?? 0);
        augmented.push(ev);
        syncHeapTree(ev.line ?? mainStartLine);
      } else if (ev.t === 'swap' && ev.a.id === 'arr' && ev.b.id === 'arr') {
        const ia = ev.a.index ?? 0;
        const ib = ev.b.index ?? 0;
        const tmp = currentHeap[ia] ?? 0;
        currentHeap[ia] = currentHeap[ib] ?? 0;
        currentHeap[ib] = tmp;
        syncHeapTree(ev.line ?? mainStartLine);
        augmented.push(ev);
      } else if (ev.t === 'remove' && ev.id.startsWith('arr[')) {
        currentHeap.pop();
        augmented.push(ev);
      } else {
        augmented.push(ev);
      }
    }
    rawEvents = augmented;
  }

  if (postProcessSummaryNote) {
    const summaryText = postProcessSummaryNote(traceRes.coutOutput, rawEvents);
    if (summaryText) {
      const doneIdx = rawEvents.findIndex((e) => e.t === 'done');
      const insertPos = doneIdx >= 0 ? doneIdx : rawEvents.length;
      const lastLine = rawEvents[Math.max(0, insertPos - 1)]?.line ?? mainStartLine;
      rawEvents.splice(insertPos, 0, {
        t: 'note',
        text: summaryText,
        line: lastLine,
      });
    }
  }

  const { cleanedEvents, operationStartStep } = extractOperationStartStepAndCleanMarkers(
    rawEvents,
    corpusPath,
    safeArr.length,
  );

  const normalizedEvents = normalizeDriverLinesToExecutableCorpusLines(
    cleanedEvents,
    corpusLines,
    mainStartLine,
  );

  const meta: AlgorithmMetadata = {
    id: 'bubble-sort',
    title: def?.label ?? op,
    category: def?.group === 'Sort' ? 'sorting' : 'operation',
    timeComplexity: def?.timeComplexity ?? 'O(n)',
    spaceComplexity: def?.spaceComplexity ?? 'O(1)',
    code: corpusLines,
  };

  return {
    scene,
    corpusPath,
    events: normalizedEvents,
    finalArray: traceRes.extractedArray,
    meta,
    operationStartStep,
    unsupportedCorpusReason: unsupportedReason,
  };
}

/**
 * Converts a sorted/custom array into a balanced BST insertion order so
 * the median becomes the root (e.g. `[20, 30, 40, 50, 60, 70, 85]` -> `[50, 30, 70, 20, 40, 60, 85]`).
 */
function buildBalancedBstInsertionOrder(arr: number[]): number[] {
  const uniqueSorted = [...new Set(arr)].sort((a, b) => a - b);
  const out: number[] = [];
  const build = (lo: number, hi: number) => {
    if (lo > hi) return;
    const mid = Math.floor((lo + hi) / 2);
    out.push(uniqueSorted[mid]);
    build(lo, mid - 1);
    build(mid + 1, hi);
  };
  build(0, uniqueSorted.length - 1);
  return out;
}
