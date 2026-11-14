/**
 * Custom C++ AST-Walking Tracing Interpreter
 *
 * Executes the AST produced by `parseCppProgram` step-by-step:
 * - Every statement records a step with `{ line, variables, event }`.
 * - Arrays and `std::vector` are wrapped in an ES6 Proxy so index reads,
 *   writes (`set`), comparisons (`compare`), and swaps (`swap`) are logged
 *   with the exact original C++ line number.
 * - Dynamic heap nodes (`new Node(...)`, `new TreeNode(...)`), pointer links
 *   (`node->next`, `node->left`, `node->right`), `std::stack` / `std::queue`,
 *   and top-level DSL helpers (`push`, `pop`, `enqueue`, `dequeue`,
 *   `insertHead`, `insertTail`, `deleteHead`, `deleteValue`) emit real 3D
 *   TraceEvents.
 * - Enforces a step limit and execution timeout to stop infinite loops.
 */

import type {
  ContainerState,
  IndexPointerState,
  MatrixState,
  PreviewSceneKind,
  Primitive,
  Ref,
  RuntimeMetadataSnapshot,
  TraceEvent,
} from '../types/trace';
import type { AlgorithmMetadata } from '../algorithms/array/arrayAlgorithms';
import {
  CppCompileError,
  parseCppProgram,
  type CppClassDecl,
  type CppExpr,
  type CppFuncDecl,
  type CppStmt,
  type CppTypeInfo,
} from './cppParser';

export class CppRuntimeError extends Error {
  public readonly line: number;

  constructor(message: string, line: number) {
    super(`Runtime error at line ${line}: ${message}`);
    this.name = 'CppRuntimeError';
    this.line = line;
  }
}

export interface InstrumentedStepRecord {
  line: number;
  variables: Record<string, Primitive | Primitive[]>;
  event: TraceEvent;
}

export interface CppTraceExecutionResult {
  scene: PreviewSceneKind;
  events: TraceEvent[];
  steps: InstrumentedStepRecord[];
  extractedArray: number[];
  coutOutput: string;
  hasArrayWrites: boolean;
  truncatedReason: string | null;
  meta: AlgorithmMetadata;
}

export interface CppTraceOptions {
  maxSteps?: number;
  timeoutMs?: number;
  fallbackArray?: number[];
  stdinInputs?: (number | string)[];
  fileName?: string;
  expectedBaseNodeCount?: number;
}

interface ProxiedArrayMeta {
  __isProxiedArray: true;
  id: string;
  name: string;
  raw: number[];
  proxy: number[];
  isCharBuffer?: boolean;
  isPointerArray?: boolean;
  pointerItems?: (HeapNodeInstance | null)[];
  structItems?: HeapNodeInstance[];
}

interface MatrixInstance {
  __isMatrix: true;
  id: string;
  name: string;
  rows: number;
  cols: number;
  grid: number[][];
}

interface MatrixRowRef {
  __isMatrixRow: true;
  matrix: MatrixInstance;
  row: number;
}

interface HeapNodeInstance {
  __isHeapNode: true;
  id: string;
  className: string;
  isVisualNode: boolean;
  fields: Record<string, CppValue>;
}

interface ContainerInstance {
  __isContainer: true;
  kind: 'stack' | 'queue' | 'deque' | 'priority_queue' | 'list';
  name: string;
  items: CppValue[];
  visualIds: string[];
  isMinHeap?: boolean;
}

interface MapContainerInstance {
  __isMapContainer: true;
  kind: 'map' | 'unordered_map';
  name: string;
  entries: Map<Primitive, CppValue>;
  bucketIds: Map<Primitive, string>;
}

interface MapElementLValue {
  __isMapElementLValue: true;
  map: MapContainerInstance;
  key: Primitive;
}

interface CoutStreamSentinel {
  __isCout: true;
  buffer: string[];
  lines: string[];
  rawText: string;
}

interface CinStreamSentinel {
  __isCin: true;
  queue: (number | string)[];
}

interface VarCell {
  value: CppValue;
  typeInfo?: CppTypeInfo;
}

type CppValue =
  | number
  | string
  | boolean
  | null
  | ProxiedArrayMeta
  | MatrixInstance
  | MatrixRowRef
  | HeapNodeInstance
  | ContainerInstance
  | MapContainerInstance
  | MapElementLValue
  | CoutStreamSentinel
  | CinStreamSentinel;

interface IndexedElementProvenance {
  arrayId: string;
  index: number;
  value: number;
  line: number;
  eventIdx: number;
  stepIdx: number;
}

interface EvaluatedWithProvenance {
  value: CppValue;
  ref?: Ref;
}

class ReturnSignal {
  public readonly value: CppValue;
  constructor(value: CppValue) {
    this.value = value;
  }
}

class BreakSignal { }
class ContinueSignal { }

const VALUE_FIELD_NAMES = new Set(['val', 'value', 'data', 'key']);
const LINK_FIELD_NAMES = new Set(['next', 'prev', 'left', 'right']);

function isProxiedArray(v: CppValue): v is ProxiedArrayMeta {
  return typeof v === 'object' && v !== null && '__isProxiedArray' in v;
}

function isMatrix(v: CppValue): v is MatrixInstance {
  return typeof v === 'object' && v !== null && '__isMatrix' in v;
}

function isMatrixRow(v: CppValue): v is MatrixRowRef {
  return typeof v === 'object' && v !== null && '__isMatrixRow' in v;
}

function isHeapNode(v: CppValue): v is HeapNodeInstance {
  return typeof v === 'object' && v !== null && '__isHeapNode' in v;
}

function isContainer(v: CppValue): v is ContainerInstance {
  return typeof v === 'object' && v !== null && '__isContainer' in v;
}

function isMapContainer(v: CppValue): v is MapContainerInstance {
  return typeof v === 'object' && v !== null && '__isMapContainer' in v;
}

function isMapElementLValue(v: CppValue): v is MapElementLValue {
  return typeof v === 'object' && v !== null && '__isMapElementLValue' in v;
}

function isCoutStream(v: CppValue): v is CoutStreamSentinel {
  return typeof v === 'object' && v !== null && '__isCout' in v;
}

function isCinStream(v: CppValue): v is CinStreamSentinel {
  return typeof v === 'object' && v !== null && '__isCin' in v;
}

function toPrimitive(v: CppValue): Primitive {
  if (v === null || typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') {
    return v;
  }
  if (isMapElementLValue(v)) {
    const cur = v.map.entries.get(v.key);
    return cur !== undefined ? toPrimitive(cur) : 0;
  }
  if (isHeapNode(v)) {
    for (const k of VALUE_FIELD_NAMES) {
      if (k in v.fields && typeof v.fields[k] === 'number') {
        return v.fields[k] as number;
      }
    }
    return v.id;
  }
  return null;
}

function toBool(v: CppValue): boolean {
  if (v === null) return false;
  if (isMapElementLValue(v)) {
    return toBool(v.map.entries.get(v.key) ?? 0);
  }
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.length > 0;
  return true;
}

function toNumber(v: CppValue, line: number): number {
  if (isMapElementLValue(v)) {
    const cur = v.map.entries.get(v.key) ?? 0;
    return toNumber(cur, line);
  }
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === null) return 0;
  if (typeof v === 'string' && v.length === 1) {
    return v.charCodeAt(0);
  }
  throw new CppRuntimeError(`Expected numeric value, got ${typeof v}`, line);
}

/**
 * Finds the exit choice value inside `do { ... } while (choice != K);` if present,
 * so interactive menu loops can execute sample operations and then exit cleanly.
 */
function findMenuExitValue(sourceCode: string): number {
  const m = sourceCode.match(/while\s*\(\s*choice\s*!=\s*(\d+)\s*\)/);
  if (m) {
    return Number(m[1]);
  }
  return 7;
}

export function runCppTrace(
  sourceCode: string,
  options: CppTraceOptions = {},
): CppTraceExecutionResult {
  const maxSteps = options.maxSteps ?? 20000;
  const timeoutMs = options.timeoutMs ?? 4000;
  const fallbackArray = options.fallbackArray ?? [42, 17, 68, 29, 84, 12];
  const fileName = options.fileName;

  const trimmed = sourceCode.trim();
  if (!trimmed) {
    throw new CppCompileError('Source code is empty', 1, 'syntax');
  }

  const program = parseCppProgram(sourceCode);
  const codeLines = sourceCode.replace(/\r\n/g, '\n').split('\n');
  const menuExitChoice = findMenuExitValue(sourceCode);

  const classMap = new Map<string, CppClassDecl>();
  for (const cls of program.classes) {
    classMap.set(cls.name, cls);
  }

  const funcMap = new Map<string, CppFuncDecl>();
  for (const fn of program.functions) {
    funcMap.set(fn.name, fn);
  }

  const startTime = Date.now();
  let stepCount = 0;
  let activeLine = 1;
  let consecutiveSameLineSteps = 0;
  let lastCheckedGuardLine = -1;
  let truncatedReason: string | null = null;
  let hasArrayWrites = false;

  const events: TraceEvent[] = [];
  const steps: InstrumentedStepRecord[] = [];
  const scopeStack: Map<string, VarCell>[] = [new Map()];

  // Populate top-level enum constants in global scope
  for (const [enumKey, enumVal] of Object.entries(program.enums)) {
    scopeStack[0].set(enumKey, { value: enumVal });
  }

  const coutStream: CoutStreamSentinel = {
    __isCout: true,
    buffer: [],
    lines: [],
    rawText: '',
  };
  const hasExplicitStdin = Array.isArray(options.stdinInputs) && options.stdinInputs.length > 0;
  const cinStream: CinStreamSentinel = {
    __isCin: true,
    queue: hasExplicitStdin
      ? [...options.stdinInputs!]
      : [
        fallbackArray.length,
        ...fallbackArray,
        fallbackArray[Math.floor(fallbackArray.length / 2)] ?? 42,
        fallbackArray.length,
        ...fallbackArray,
      ],
  };
  let menuChoiceReadCount = 0;
  let activeMethodName: string | null = null;
  const thisStack: HeapNodeInstance[] = [];

  const proxiedArrays = new Map<string, ProxiedArrayMeta>();
  const matrices = new Map<string, MatrixInstance>();
  const containers = new Map<string, ContainerInstance>();
  const mapContainers = new Map<string, MapContainerInstance>();
  const heapNodes = new Map<string, HeapNodeInstance>();
  const graphVerticesCreated = new Set<number>();
  const bucketHeadersCreated = new Set<number>();
  const indexPointers: Record<string, IndexPointerState> = {};

  let primaryArrayId: string | null = null;
  let primaryArrayLogicalLength: number | null = null;
  let nextNodeSeq = 0;
  let detectedScene: PreviewSceneKind | null = null;
  let callDepth = 0;
  let inComparisonContext = 0;

  // DSL state for top-level Stack / Queue / SLL helper calls
  const dslStack: { id: string; val: number }[] = [];
  const dslQueue: { id: string; val: number }[] = [];
  const dslList: { id: string; val: number }[] = [];
  let dslSeeded: 'stack' | 'queue' | 'sll' | null = null;

  class TruncationSignal {
    public readonly reason: string;
    constructor(reason: string) {
      this.reason = reason;
    }
  }

  // Track recent array element reads and writes for swap detection
  let lastArrayRead: IndexedElementProvenance | null = null;
  const tempVarProvenance = new Map<string, IndexedElementProvenance>();
  let pendingSwapFirstWrite: {
    arrayId: string;
    indexA: number;
    indexB: number;
    oldValA: number;
    newValA: number;
    line: number;
    eventIdx: number;
    stepIdx: number;
  } | null = null;
  let inInternalSwap = false;
  let inArrayInit = false;

  const ensureGraphVertex = (vIdx: number, line: number) => {
    if (vIdx < 0 || vIdx > 20 || graphVerticesCreated.has(vIdx)) return;
    graphVerticesCreated.add(vIdx);
    detectedScene = 'graph';
    recordEvent({ t: 'create', id: `v-${vIdx}`, kind: 'node', value: vIdx }, line);
  };

  const ensureBucketHeader = (bIdx: number, line: number) => {
    if (bIdx < 0 || bIdx > 20 || bucketHeadersCreated.has(bIdx)) return;
    bucketHeadersCreated.add(bIdx);
    detectedScene = 'hash-table';
    recordEvent({ t: 'create', id: `b-${bIdx}`, kind: 'bucket', value: `#${bIdx}` }, line);
  };

  const checkGuards = (line: number) => {
    stepCount++;
    if (line === lastCheckedGuardLine) {
      consecutiveSameLineSteps++;
    } else {
      lastCheckedGuardLine = line;
      consecutiveSameLineSteps = 1;
    }

    // Tight single-line infinite loop (`while (true) {}`) with no progress
    if (consecutiveSameLineSteps > 600) {
      throw new CppRuntimeError(
        `Infinite loop detected at line ${line} (no state progress).`,
        line,
      );
    }

    if (stepCount > maxSteps) {
      const hasAnyProgress =
        events.some((e) => e.t !== 'line') ||
        Object.keys(captureScalarsSnapshot()).length > 0;
      if (!hasAnyProgress) {
        throw new CppRuntimeError(
          `Execution exceeded maximum step limit (${maxSteps} steps). Check for an infinite loop.`,
          line,
        );
      }
      const reason = `Trace truncated at ${maxSteps} steps (line ${line}). Showing partial execution trace.`;
      truncatedReason = reason;
      throw new TruncationSignal(reason);
    }
    if (stepCount % 32 === 0 && Date.now() - startTime > timeoutMs) {
      throw new CppRuntimeError(
        `Execution timed out after ${timeoutMs}ms. Check for an infinite loop.`,
        line,
      );
    }
  };

  const captureScalarsSnapshot = (): Record<string, Primitive> => {
    const scalars: Record<string, Primitive> = {};
    for (const scope of scopeStack) {
      for (const [k, cell] of scope.entries()) {
        if (k.startsWith('__') || k in program.enums) continue;
        const val = cell.value;
        if (
          typeof val === 'number' ||
          typeof val === 'boolean' ||
          typeof val === 'string'
        ) {
          scalars[k] = val;
        }
      }
    }
    const currentThis = thisStack[thisStack.length - 1];
    if (currentThis && !currentThis.isVisualNode) {
      for (const [fName, fVal] of Object.entries(currentThis.fields)) {
        if (
          typeof fVal === 'number' ||
          typeof fVal === 'boolean' ||
          typeof fVal === 'string'
        ) {
          scalars[fName] = fVal;
        }
      }
    }
    return scalars;
  };

  const captureRuntimeMetadata = (): RuntimeMetadataSnapshot => {
    const scalars = captureScalarsSnapshot();
    const ptrSnap: Record<string, IndexPointerState> = {};
    for (const [pName, pState] of Object.entries(indexPointers)) {
      if (pName in scalars && typeof scalars[pName] === 'number') {
        ptrSnap[pName] = {
          arrayId: pState.arrayId,
          index: Math.trunc(scalars[pName] as number),
        };
      }
    }

    const matSnap: Record<string, MatrixState> = {};
    for (const [mId, mat] of matrices.entries()) {
      matSnap[mId] = {
        id: mId,
        rows: mat.rows,
        cols: mat.cols,
        values: mat.grid.map((r) => [...r]),
      };
    }

    const contSnap: Record<string, ContainerState> = {};
    for (const [cId, cont] of containers.entries()) {
      contSnap[cId] = {
        id: cId,
        kind: cont.kind,
        values: cont.items.map((it) => toPrimitive(it)),
      };
    }
    for (const [mId, mp] of mapContainers.entries()) {
      contSnap[mId] = {
        id: mId,
        kind: mp.kind,
        entries: [...mp.entries.entries()].map(([k, v]) => ({
          key: k,
          value: toPrimitive(v),
        })),
      };
    }

    const flushParts = [...coutStream.lines];
    if (coutStream.buffer.length > 0) {
      flushParts.push(coutStream.buffer.join(' '));
    }

    return {
      scalars,
      indexPointers: ptrSnap,
      matrices: matSnap,
      containers: contSnap,
      hasArrayWrites,
      coutOutput: flushParts.join('\n'),
      detectedStructure: detectedScene ?? undefined,
    };
  };

  const captureVariablesSnapshot = (): Record<string, Primitive | Primitive[]> => {
    const snap: Record<string, Primitive | Primitive[]> = {};
    for (const scope of scopeStack) {
      for (const [k, cell] of scope.entries()) {
        if (k.startsWith('__') || k in program.enums) continue;
        const val = cell.value;
        if (isCoutStream(val) || isCinStream(val)) continue;
        if (isProxiedArray(val)) {
          snap[k] = [...val.raw];
        } else if (isContainer(val)) {
          snap[k] = val.items.map((it) => toPrimitive(it));
        } else if (isMapContainer(val)) {
          snap[k] = [...val.entries.entries()].map(([ek, ev]) => `${ek}:${toPrimitive(ev)}`);
        } else if (isMatrix(val)) {
          snap[k] = val.grid.flat();
        } else {
          snap[k] = toPrimitive(val);
        }
      }
    }
    return snap;
  };

  const recordEvent = (ev: TraceEvent, line = activeLine) => {
    const clampedLine = Math.max(1, Math.min(codeLines.length, line || 1));
    const metaSnap = captureRuntimeMetadata();
    const eventWithLine: TraceEvent = {
      ...ev,
      line: clampedLine,
      ...metaSnap,
    };
    events.push(eventWithLine);
    steps.push({
      line: clampedLine,
      variables: captureVariablesSnapshot(),
      event: eventWithLine,
    });
  };

  const emitStepLine = (line: number) => {
    activeLine = Math.max(1, Math.min(codeLines.length, line || 1));
    checkGuards(activeLine);
    const lastEv = events[events.length - 1];
    if (!lastEv || lastEv.t !== 'line' || lastEv.line !== activeLine) {
      recordEvent({ t: 'line', line: activeLine }, activeLine);
    }
  };

  const createProxiedArray = (
    name: string,
    initialValues: number[],
    line: number,
    emitInitEvents = true,
    extraOpts?: {
      isCharBuffer?: boolean;
      isPointerArray?: boolean;
      pointerCapacity?: number;
      structTypeName?: string;
      structCapacity?: number;
    },
  ): ProxiedArrayMeta => {
    const isAuxiliaryScratch =
      extraOpts?.isCharBuffer ||
      extraOpts?.isPointerArray ||
      Boolean(extraOpts?.structTypeName) ||
      name === 'stackArr' ||
      name === 'visited' ||
      name === 'done' ||
      name === 'parent' ||
      name === 'inDegree';

    let canonicalId = name;
    if (!isAuxiliaryScratch) {
      if (!primaryArrayId) {
        primaryArrayId = 'arr';
        canonicalId = 'arr';
      } else if (name !== 'arr' && !proxiedArrays.has('aux')) {
        canonicalId = 'aux';
      }
      if (!detectedScene) {
        if (name.toLowerCase().includes('heap')) {
          detectedScene = 'heap';
        } else if (name.toLowerCase().includes('stack')) {
          detectedScene = 'stack';
        } else {
          detectedScene = 'array';
        }
      }
    }

    const raw = [...initialValues];
    emitStepLine(line);
    if (emitInitEvents && raw.length > 0 && !isAuxiliaryScratch) {
      inArrayInit = true;
      recordEvent({ t: 'create', id: canonicalId, kind: 'array', value: raw.length }, line);
      for (let i = 0; i < raw.length; i++) {
        recordEvent(
          { t: 'set', target: { id: canonicalId, index: i }, value: raw[i], isInit: true },
          line,
        );
      }
      recordEvent(
        {
          t: 'note',
          text: `Line ${line}: Initialized array ${name}[${raw.length}] = [${raw.join(', ')}].`,
        },
        line,
      );
      inArrayInit = false;
    }

    const pointerItems: (HeapNodeInstance | null)[] | undefined = extraOpts?.isPointerArray
      ? new Array(extraOpts.pointerCapacity ?? 16).fill(null)
      : undefined;

    let structItems: HeapNodeInstance[] | undefined;
    if (extraOpts?.structTypeName) {
      const cap = extraOpts.structCapacity ?? 16;
      structItems = [];
      for (let i = 0; i < cap; i++) {
        structItems.push(instantiateClass(extraOpts.structTypeName, [], line, false));
      }
    }

    const proxy = new Proxy(raw, {
      get(target, prop, receiver) {
        if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
          const idx = Number(prop);
          const maxBound = extraOpts?.isCharBuffer
            ? Math.max(target.length, 256)
            : canonicalId === 'arr' && primaryArrayLogicalLength !== null
              ? Math.max(target.length, primaryArrayLogicalLength)
              : Math.max(target.length, isAuxiliaryScratch ? 128 : target.length);
          if (idx < 0 || idx >= maxBound) {
            throw new CppRuntimeError(
              `Array index ${idx} out of bounds for ${name} of size ${maxBound}`,
              activeLine,
            );
          }
          const val = target[idx] ?? 0;
          if (!inInternalSwap && !isAuxiliaryScratch) {
            const eventIdxBeforeRead = events.length;
            const stepIdxBeforeRead = steps.length;
            if (inComparisonContext === 0) {
              recordEvent({ t: 'visit', id: `${canonicalId}[${idx}]` }, activeLine);
            }
            lastArrayRead = {
              arrayId: canonicalId,
              index: idx,
              value: val,
              line: activeLine,
              eventIdx: eventIdxBeforeRead,
              stepIdx: stepIdxBeforeRead,
            };
          }
          return val;
        }
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop, value, receiver) {
        if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
          const idx = Number(prop);
          const maxBound = !emitInitEvents || isAuxiliaryScratch ? 256 : target.length;
          if (idx < 0 || idx > maxBound) {
            throw new CppRuntimeError(
              `Array index ${idx} out of bounds for ${name} of size ${target.length}`,
              activeLine,
            );
          }
          const numVal = Number(value);
          target[idx] = numVal;

          if (!inInternalSwap && !isAuxiliaryScratch) {
            checkGuards(activeLine);
            if (!inArrayInit) {
              hasArrayWrites = true;
            }
            emitStepLine(activeLine);
            recordEvent(
              {
                t: 'set',
                target: { id: canonicalId, index: idx },
                value: numVal,
                isInit: inArrayInit,
              },
              activeLine,
            );
            recordEvent(
              { t: 'note', text: `Line ${activeLine}: Set ${name}[${idx}] = ${numVal}.` },
              activeLine,
            );
          }
          return true;
        }
        return Reflect.set(target, prop, value, receiver);
      },
    });

    const meta: ProxiedArrayMeta = {
      __isProxiedArray: true,
      id: canonicalId,
      name,
      raw,
      proxy,
      isCharBuffer: extraOpts?.isCharBuffer,
      isPointerArray: extraOpts?.isPointerArray,
      pointerItems,
      structItems,
    };
    proxiedArrays.set(canonicalId, meta);
    return meta;
  };

  const createMatrixInstance = (
    name: string,
    rows: number,
    cols: number,
    initialGrid: number[][] | null,
    line: number,
  ): MatrixInstance => {
    const safeRows = Math.max(1, Math.min(24, rows || 4));
    const safeCols = Math.max(1, Math.min(24, cols || 4));
    const grid: number[][] = [];
    for (let r = 0; r < safeRows; r++) {
      const rowVals: number[] = [];
      for (let c = 0; c < safeCols; c++) {
        rowVals.push(initialGrid?.[r]?.[c] ?? 0);
      }
      grid.push(rowVals);
    }

    const mat: MatrixInstance = {
      __isMatrix: true,
      id: name,
      name,
      rows: safeRows,
      cols: safeCols,
      grid,
    };
    matrices.set(name, mat);

    if (
      name.toLowerCase().includes('graph') ||
      name.toLowerCase().includes('adj') ||
      sourceCode.includes('addEdge') ||
      sourceCode.includes('dijkstra') ||
      sourceCode.includes('topological')
    ) {
      detectedScene = 'graph';
    } else if (!detectedScene) {
      detectedScene = 'array';
    }

    emitStepLine(line);
    recordEvent(
      {
        t: 'note',
        text: `Line ${line}: Initialized 2D matrix ${name}[${safeRows}][${safeCols}].`,
      },
      line,
    );
    return mat;
  };

  const lookupVarCell = (name: string): VarCell | null => {
    for (let i = scopeStack.length - 1; i >= 0; i--) {
      const cell = scopeStack[i].get(name);
      if (cell) return cell;
    }
    return null;
  };

  const isVisualNodeClass = (cls: CppClassDecl): boolean => {
    const fieldNames = new Set(cls.fields.map((f) => f.name));
    const hasVal = [...fieldNames].some((f) => VALUE_FIELD_NAMES.has(f));
    const hasLink = [...fieldNames].some((f) => LINK_FIELD_NAMES.has(f));
    return hasVal && hasLink;
  };

  const getHeapNodeValue = (node: HeapNodeInstance): Primitive => {
    for (const k of VALUE_FIELD_NAMES) {
      if (k in node.fields) {
        return toPrimitive(node.fields[k]);
      }
    }
    return null;
  };

  const allocateDeclareFieldValue = (
    name: string,
    typeInfo: CppTypeInfo,
    defaultValue: CppExpr | undefined,
    line: number,
  ): CppValue => {
    if (typeInfo.arrayDims && typeInfo.arrayDims.length >= 2) {
      const r = Math.max(1, Math.trunc(toNumber(evalExpr(typeInfo.arrayDims[0]).value, line)));
      const c = Math.max(1, Math.trunc(toNumber(evalExpr(typeInfo.arrayDims[1]).value, line)));
      return createMatrixInstance(name, r, c, null, line);
    }

    if (typeInfo.isArray || typeInfo.baseType === 'vector') {
      const elemType = typeInfo.templateArg ?? typeInfo.baseType;
      if (elemType.startsWith('vector<')) {
        return createMatrixInstance(name, 4, 4, null, line);
      }
      const isPtrElem = elemType.endsWith('*') || (typeInfo.isArray && typeInfo.isPointer);
      const cleanElemType = elemType.replace(/\*+$/, '').trim();
      const size = typeInfo.arraySizeExpr
        ? Math.max(1, Math.trunc(toNumber(evalExpr(typeInfo.arraySizeExpr).value, line)))
        : 0;
      if (isPtrElem) {
        return createProxiedArray(name, [], line, false, {
          isPointerArray: true,
          pointerCapacity: Math.max(size, 16),
        });
      }
      if (classMap.has(cleanElemType)) {
        return createProxiedArray(name, [], line, false, {
          structTypeName: cleanElemType,
          structCapacity: Math.max(size, 16),
        });
      }
      const initArr = size > 0 && size <= 24 ? new Array(size).fill(0) : [];
      return createProxiedArray(name, initArr, line, size > 0 && size <= 24, {
        isCharBuffer: typeInfo.baseType === 'char',
      });
    }

    if (defaultValue) {
      return evalExpr(defaultValue).value;
    }
    if (typeInfo.isPointer) return null;
    if (typeInfo.baseType === 'string') return '';
    if (typeInfo.baseType === 'bool') return false;
    return 0;
  };

  const instantiateClass = (
    className: string,
    argVals: CppValue[],
    line: number,
    isHeapAllocated: boolean,
  ): HeapNodeInstance => {
    const cls = classMap.get(className);
    const lowerName = className.toLowerCase();
    const isTreeLike =
      cls?.fields.some((f) => f.name === 'left' || f.name === 'right') ||
      lowerName.includes('tree') ||
      lowerName.includes('bst') ||
      lowerName.includes('avl');
    const isGraphLike = lowerName.includes('graph');
    const isHashLike = lowerName.includes('hash');
    const isHeapLike = lowerName.includes('heap');
    const isQueueLike = lowerName.includes('queue') || lowerName.includes('deque');
    const isStackLike =
      lowerName.includes('stack') ||
      scopeStack[0].has('topNode') ||
      scopeStack[0].has('stackArr') ||
      scopeStack[0].has('charStack');
    const isListLike =
      !isStackLike &&
      (cls?.fields.some((f) => f.name === 'next' || f.name === 'prev') ||
        lowerName.includes('list') ||
        className === 'Node');

    if (isGraphLike) {
      detectedScene = 'graph';
    } else if (isHashLike) {
      detectedScene = 'hash-table';
    } else if (isHeapLike) {
      detectedScene = 'heap';
    } else if (isTreeLike) {
      detectedScene = 'bst';
    } else if (isQueueLike && !detectedScene) {
      detectedScene = 'queue';
    } else if (isStackLike && !detectedScene) {
      detectedScene = 'stack';
    } else if (isListLike && !detectedScene) {
      detectedScene = 'linked-list';
    }

    const visual = cls ? isVisualNodeClass(cls) : isHeapAllocated;
    let id: string;
    if (isListLike && !isTreeLike && visual && isHeapAllocated) {
      const seq = ++nextNodeSeq;
      if (seq === 1) {
        id = 'node-head';
      } else {
        const expectedBaseCount = options.expectedBaseNodeCount;
        if (typeof expectedBaseCount === 'number' && expectedBaseCount >= 2) {
          if (seq === expectedBaseCount) {
            id = 'node-tail';
          } else if (seq > expectedBaseCount) {
            id = seq === expectedBaseCount + 1 ? 'node-new' : `node-new-${seq}`;
          } else {
            id = `node-${seq}`;
          }
        } else {
          id = `node-${seq}`;
        }
      }
    } else if (isTreeLike && visual && isHeapAllocated) {
      const firstNum = typeof argVals[0] === 'number' ? argVals[0] : undefined;
      const expectedBaseCount = options.expectedBaseNodeCount;
      const seq = ++nextNodeSeq;
      if (
        typeof expectedBaseCount === 'number' &&
        expectedBaseCount >= 1 &&
        seq > expectedBaseCount
      ) {
        id = seq === expectedBaseCount + 1 ? 'bst-new' : `bst-${firstNum ?? seq}`;
      } else if (firstNum !== undefined && !heapNodes.has(`bst-${firstNum}`)) {
        id = `bst-${firstNum}`;
      } else {
        id = `t-${seq}`;
      }
    } else if (visual && isHeapAllocated) {
      const prefix = isTreeLike ? 't' : 'node';
      id = `${prefix}-${++nextNodeSeq}`;
    } else {
      id = `obj-${className.toLowerCase()}`;
    }

    const fields: Record<string, CppValue> = {};
    if (cls) {
      for (const f of cls.fields) {
        fields[f.name] = allocateDeclareFieldValue(
          f.name,
          f.typeInfo,
          f.defaultValue ?? undefined,
          line,
        );
      }
    } else {
      // Default Node fallback if user didn't declare struct fields explicitly
      fields.val = argVals[0] ?? 0;
      fields.data = argVals[0] ?? 0;
      fields.next = null;
      fields.prev = null;
      fields.left = null;
      fields.right = null;
    }

    const instance: HeapNodeInstance = {
      __isHeapNode: true,
      id,
      className,
      isVisualNode: visual && isHeapAllocated,
      fields,
    };

    if (cls) {
      const ctor =
        cls.constructors.find((c) => c.params.length === argVals.length) ??
        cls.constructors[0];
      if (ctor) {
        scopeStack.push(new Map());
        thisStack.push(instance);
        const savedVisual = instance.isVisualNode;
        instance.isVisualNode = false;
        try {
          ctor.params.forEach((p, idx) => {
            scopeStack[scopeStack.length - 1].set(p.name, {
              value: argVals[idx] ?? 0,
              typeInfo: p.typeInfo,
            });
          });
          for (const init of ctor.initializers) {
            instance.fields[init.field] = evalExpr(init.expr).value;
          }
          for (const stmt of ctor.body) {
            execStmt(stmt);
          }
        } catch (sig) {
          if (!(sig instanceof ReturnSignal)) throw sig;
        } finally {
          instance.isVisualNode = savedVisual;
          thisStack.pop();
          scopeStack.pop();
        }
      } else if (argVals.length > 0) {
        // Aggregate initialization `new Node(val)` or `{u, v, weight}` without explicit constructor
        if (argVals.length === 1) {
          const valField = cls.fields.find((f) => VALUE_FIELD_NAMES.has(f.name)) ?? cls.fields[0];
          if (valField) {
            instance.fields[valField.name] = argVals[0];
          }
        } else {
          cls.fields.forEach((f, idx) => {
            if (idx < argVals.length) {
              instance.fields[f.name] = argVals[idx];
            }
          });
        }
      }
    }

    if (instance.isVisualNode) {
      heapNodes.set(instance.id, instance);
      const nodeVal = getHeapNodeValue(instance);
      emitStepLine(line);
      recordEvent({ t: 'create', id: instance.id, kind: 'node', value: nodeVal }, line);
      recordEvent(
        {
          t: 'note',
          text: `Line ${line}: Allocated new ${className}(${nodeVal ?? ''}).`,
        },
        line,
      );
      // Emit any initial non-null pointer links set inside the constructor
      for (const linkField of LINK_FIELD_NAMES) {
        const target = instance.fields[linkField];
        if (isHeapNode(target) && target.isVisualNode) {
          recordEvent(
            { t: 'link', from: instance.id, to: target.id, label: linkField },
            line,
          );
        }
      }
    }

    return instance;
  };

  // Top-level DSL helpers (`push`, `pop`, `peek`, `enqueue`, `dequeue`, `insertHead`, `insertTail`, `deleteHead`, `deleteValue`)
  const execDslBuiltin = (fnName: string, args: CppValue[], line: number): boolean => {
    const stackOps = new Set(['push', 'pop', 'peek']);
    const queueOps = new Set(['enqueue', 'dequeue']);
    const sllOps = new Set(['insertHead', 'insertTail', 'deleteHead', 'deleteValue']);

    if (stackOps.has(fnName)) {
      detectedScene = 'stack';
      if (!dslSeeded && fnName !== 'push') {
        dslSeeded = 'stack';
        for (const v of fallbackArray.slice(0, 3)) {
          const id = `stk-${nextNodeSeq++}`;
          recordEvent({ t: 'create', id, kind: 'node', value: v }, line);
          if (dslStack.length > 0) {
            recordEvent(
              { t: 'link', from: id, to: dslStack[dslStack.length - 1].id, label: 'below' },
              line,
            );
          }
          dslStack.push({ id, val: v });
        }
      } else {
        dslSeeded = 'stack';
      }

      emitStepLine(line);
      if (fnName === 'push') {
        const val = typeof args[0] === 'number' ? args[0] : 42;
        const id = `stk-${nextNodeSeq++}`;
        recordEvent({ t: 'create', id, kind: 'node', value: val }, line);
        if (dslStack.length > 0) {
          recordEvent(
            { t: 'link', from: id, to: dslStack[dslStack.length - 1].id, label: 'below' },
            line,
          );
        }
        recordEvent({ t: 'visit', id }, line);
        dslStack.push({ id, val });
        recordEvent(
          {
            t: 'note',
            text: `Line ${line}: push(${val}) — placed ${val} onto top of Stack (size: ${dslStack.length}).`,
          },
          line,
        );
      } else if (fnName === 'pop') {
        if (dslStack.length === 0) {
          recordEvent(
            { t: 'note', text: `Line ${line}: pop() — Stack Underflow! Stack is empty.` },
            line,
          );
        } else {
          const top = dslStack.pop()!;
          recordEvent({ t: 'visit', id: top.id }, line);
          if (dslStack.length > 0) {
            recordEvent(
              { t: 'unlink', from: top.id, to: dslStack[dslStack.length - 1].id },
              line,
            );
          }
          recordEvent({ t: 'remove', id: top.id }, line);
          recordEvent(
            { t: 'note', text: `Line ${line}: pop() — removed top element ${top.val}.` },
            line,
          );
        }
      } else if (fnName === 'peek' && dslStack.length > 0) {
        const top = dslStack[dslStack.length - 1];
        recordEvent({ t: 'visit', id: top.id }, line);
        recordEvent(
          { t: 'note', text: `Line ${line}: peek() — top of Stack is ${top.val}.` },
          line,
        );
      }
      return true;
    }

    if (queueOps.has(fnName)) {
      detectedScene = 'queue';
      if (!dslSeeded && fnName !== 'enqueue') {
        dslSeeded = 'queue';
        for (const v of fallbackArray.slice(0, 3)) {
          const id = `q-${nextNodeSeq++}`;
          recordEvent({ t: 'create', id, kind: 'node', value: v }, line);
          if (dslQueue.length > 0) {
            recordEvent(
              { t: 'link', from: dslQueue[dslQueue.length - 1].id, to: id, label: 'next' },
              line,
            );
          }
          dslQueue.push({ id, val: v });
        }
      } else {
        dslSeeded = 'queue';
      }

      emitStepLine(line);
      if (fnName === 'enqueue') {
        const val = typeof args[0] === 'number' ? args[0] : 42;
        const id = `q-${nextNodeSeq++}`;
        recordEvent({ t: 'create', id, kind: 'node', value: val }, line);
        if (dslQueue.length > 0) {
          recordEvent(
            { t: 'link', from: dslQueue[dslQueue.length - 1].id, to: id, label: 'next' },
            line,
          );
        }
        recordEvent({ t: 'visit', id }, line);
        dslQueue.push({ id, val });
        recordEvent(
          {
            t: 'note',
            text: `Line ${line}: enqueue(${val}) — added ${val} at rear of Queue.`,
          },
          line,
        );
      } else if (fnName === 'dequeue') {
        if (dslQueue.length === 0) {
          recordEvent(
            { t: 'note', text: `Line ${line}: dequeue() — Queue Underflow! Queue is empty.` },
            line,
          );
        } else {
          const front = dslQueue.shift()!;
          recordEvent({ t: 'visit', id: front.id }, line);
          if (dslQueue.length > 0) {
            recordEvent({ t: 'unlink', from: front.id, to: dslQueue[0].id }, line);
          }
          recordEvent({ t: 'remove', id: front.id }, line);
          recordEvent(
            {
              t: 'note',
              text: `Line ${line}: dequeue() — removed front element ${front.val}.`,
            },
            line,
          );
        }
      }
      return true;
    }

    if (sllOps.has(fnName)) {
      detectedScene = 'linked-list';
      if (!dslSeeded) {
        dslSeeded = 'sll';
        fallbackArray.slice(0, 3).forEach((v, idx) => {
          const id = idx === 0 ? 'node-head' : `node-${nextNodeSeq++}`;
          recordEvent({ t: 'create', id, kind: 'node', value: v }, line);
          if (dslList.length > 0) {
            recordEvent(
              { t: 'link', from: dslList[dslList.length - 1].id, to: id, label: 'next' },
              line,
            );
          }
          dslList.push({ id, val: v });
        });
      }

      emitStepLine(line);
      if (fnName === 'insertHead') {
        const val = typeof args[0] === 'number' ? args[0] : 10;
        const id = `node-h${nextNodeSeq++}`;
        recordEvent({ t: 'create', id, kind: 'node', value: val }, line);
        if (dslList.length > 0) {
          recordEvent({ t: 'link', from: id, to: dslList[0].id, label: 'next' }, line);
        }
        recordEvent({ t: 'visit', id }, line);
        dslList.unshift({ id, val });
        recordEvent(
          { t: 'note', text: `Line ${line}: insertHead(${val}) — linked new head node ${val}.` },
          line,
        );
      } else if (fnName === 'insertTail') {
        const val = typeof args[0] === 'number' ? args[0] : 99;
        const id = `node-t${nextNodeSeq++}`;
        recordEvent({ t: 'create', id, kind: 'node', value: val }, line);
        if (dslList.length > 0) {
          recordEvent(
            { t: 'link', from: dslList[dslList.length - 1].id, to: id, label: 'next' },
            line,
          );
        }
        recordEvent({ t: 'visit', id }, line);
        dslList.push({ id, val });
        recordEvent(
          { t: 'note', text: `Line ${line}: insertTail(${val}) — appended node ${val} at tail.` },
          line,
        );
      } else if (fnName === 'deleteHead' && dslList.length > 0) {
        const removed = dslList.shift()!;
        if (dslList.length > 0) {
          recordEvent({ t: 'unlink', from: removed.id, to: dslList[0].id }, line);
        }
        recordEvent({ t: 'remove', id: removed.id }, line);
        recordEvent(
          { t: 'note', text: `Line ${line}: deleteHead() — removed head node ${removed.val}.` },
          line,
        );
      } else if (fnName === 'deleteValue' && dslList.length > 0) {
        const target = typeof args[0] === 'number' ? args[0] : dslList[dslList.length - 1].val;
        const idx = dslList.findIndex((n) => n.val === target);
        if (idx >= 0) {
          const removed = dslList[idx];
          recordEvent({ t: 'visit', id: removed.id }, line);
          if (idx > 0) {
            recordEvent({ t: 'unlink', from: dslList[idx - 1].id, to: removed.id }, line);
          }
          if (idx < dslList.length - 1) {
            recordEvent({ t: 'unlink', from: removed.id, to: dslList[idx + 1].id }, line);
          }
          if (idx > 0 && idx < dslList.length - 1) {
            recordEvent(
              { t: 'link', from: dslList[idx - 1].id, to: dslList[idx + 1].id, label: 'next' },
              line,
            );
          }
          recordEvent({ t: 'remove', id: removed.id }, line);
          dslList.splice(idx, 1);
          recordEvent(
            {
              t: 'note',
              text: `Line ${line}: deleteValue(${target}) — bypassed and removed node ${target}.`,
            },
            line,
          );
        } else {
          recordEvent(
            { t: 'note', text: `Line ${line}: deleteValue(${target}) — value ${target} not found.` },
            line,
          );
        }
      }
      return true;
    }

    return false;
  };

  // Built-in BST / Structure simulation when user writes `BST t; t.insert(50);` without full class definition
  const syntheticBstObjects = new Map<string, { root: HeapNodeInstance | null }>();

  const execSyntheticBstMethod = (
    obj: { root: HeapNodeInstance | null },
    methodName: string,
    args: CppValue[],
    line: number,
  ): CppValue => {
    detectedScene = 'bst';
    const lower = methodName.toLowerCase();

    const makeBstNode = (val: number): HeapNodeInstance => {
      const id = `t-${nextNodeSeq++}`;
      const node: HeapNodeInstance = {
        __isHeapNode: true,
        id,
        className: 'TreeNode',
        isVisualNode: true,
        fields: { val, left: null, right: null },
      };
      heapNodes.set(id, node);
      return node;
    };

    emitStepLine(line);

    if (lower.includes('insert') || lower === 'add') {
      const key = toNumber(args[0] ?? 0, line);
      recordEvent({ t: 'call', fn: methodName, args: [key], depth: callDepth + 1 }, line);
      if (!obj.root) {
        const n = makeBstNode(key);
        obj.root = n;
        recordEvent({ t: 'create', id: n.id, kind: 'node', value: key }, line);
        recordEvent(
          {
            t: 'note',
            text: `Line ${line}: ${methodName}(${key}) — tree is empty, so ${key} becomes the root.`,
          },
          line,
        );
      } else {
        let cur = obj.root;
        for (; ;) {
          const curVal = Number(cur.fields.val ?? 0);
          recordEvent({ t: 'compare', a: { id: cur.id }, b: { id: cur.id } }, line);
          if (key === curVal) {
            recordEvent(
              { t: 'note', text: `${methodName}(${key}): ${key} already exists in BST.` },
              line,
            );
            break;
          }
          const dir = key < curVal ? 'left' : 'right';
          recordEvent(
            {
              t: 'note',
              text: `${methodName}(${key}): ${key} ${key < curVal ? '<' : '>'} ${curVal}, go ${dir}.`,
            },
            line,
          );
          const child = cur.fields[dir];
          if (!isHeapNode(child)) {
            const n = makeBstNode(key);
            cur.fields[dir] = n;
            recordEvent({ t: 'link', from: cur.id, to: n.id, label: dir }, line);
            recordEvent({ t: 'create', id: n.id, kind: 'node', value: key }, line);
            recordEvent(
              { t: 'note', text: `Placed ${key} as the ${dir} child of ${curVal}.` },
              line,
            );
            break;
          }
          cur = child;
        }
      }
      recordEvent({ t: 'return', fn: methodName }, line);
      return null;
    }

    if (lower.includes('search') || lower.includes('find')) {
      const key = toNumber(args[0] ?? 0, line);
      recordEvent({ t: 'call', fn: methodName, args: [key], depth: callDepth + 1 }, line);
      let cur = obj.root;
      let found = false;
      while (cur) {
        const curVal = Number(cur.fields.val ?? 0);
        recordEvent({ t: 'compare', a: { id: cur.id }, b: { id: cur.id } }, line);
        if (curVal === key) {
          recordEvent({ t: 'visit', id: cur.id }, line);
          recordEvent({ t: 'note', text: `${methodName}(${key}): found ${key}!` }, line);
          found = true;
          break;
        }
        const dir = key < curVal ? 'left' : 'right';
        recordEvent(
          {
            t: 'note',
            text: `${methodName}(${key}): ${key} ${key < curVal ? '<' : '>'} ${curVal}, go ${dir}.`,
          },
          line,
        );
        const nextChild = cur.fields[dir];
        cur = isHeapNode(nextChild) ? nextChild : null;
      }
      if (!found) {
        recordEvent(
          { t: 'note', text: `${methodName}(${key}): reached NULL — ${key} is not in the tree.` },
          line,
        );
      }
      recordEvent({ t: 'return', fn: methodName, value: found }, line);
      return found;
    }

    if (lower.includes('delete') || lower.includes('remove')) {
      const key = toNumber(args[0] ?? 0, line);
      recordEvent({ t: 'call', fn: methodName, args: [key], depth: callDepth + 1 }, line);
      let parent: HeapNodeInstance | null = null;
      let cur = obj.root;
      while (cur && Number(cur.fields.val) !== key) {
        const curVal = Number(cur.fields.val);
        recordEvent({ t: 'compare', a: { id: cur.id }, b: { id: cur.id } }, line);
        const dir = key < curVal ? 'left' : 'right';
        parent = cur;
        const nxt = cur.fields[dir];
        cur = isHeapNode(nxt) ? nxt : null;
      }
      if (cur) {
        const leftNode = isHeapNode(cur.fields.left) ? cur.fields.left : null;
        const rightNode = isHeapNode(cur.fields.right) ? cur.fields.right : null;
        const parentDir: 'left' | 'right' | null = parent
          ? parent.fields.left === cur
            ? 'left'
            : 'right'
          : null;
        if (leftNode && rightNode) {
          let succParent = cur;
          let succ = rightNode;
          while (isHeapNode(succ.fields.left)) {
            succParent = succ;
            succ = succ.fields.left;
          }
          cur.fields.val = succ.fields.val;
          recordEvent({ t: 'set', target: { id: cur.id }, value: toPrimitive(succ.fields.val) }, line);
          const sDir: 'left' | 'right' = succParent.fields.left === succ ? 'left' : 'right';
          const succRight = isHeapNode(succ.fields.right) ? succ.fields.right : null;
          if (succRight) {
            recordEvent({ t: 'link', from: succParent.id, to: succRight.id, label: sDir }, line);
          }
          recordEvent({ t: 'remove', id: succ.id }, line);
          heapNodes.delete(succ.id);
          succParent.fields[sDir] = succRight;
        } else {
          const child = leftNode ?? rightNode;
          recordEvent({ t: 'remove', id: cur.id }, line);
          heapNodes.delete(cur.id);
          if (parent && parentDir) {
            if (child) {
              recordEvent({ t: 'link', from: parent.id, to: child.id, label: parentDir }, line);
            }
            parent.fields[parentDir] = child;
          } else {
            obj.root = child;
          }
        }
      }
      recordEvent({ t: 'return', fn: methodName }, line);
      return null;
    }

    if (
      lower.includes('inorder') ||
      lower.includes('preorder') ||
      lower.includes('postorder') ||
      lower.includes('levelorder')
    ) {
      const order: HeapNodeInstance[] = [];
      const walk = (n: HeapNodeInstance | null) => {
        if (!n) return;
        if (lower.includes('preorder')) order.push(n);
        const l = isHeapNode(n.fields.left) ? n.fields.left : null;
        const r = isHeapNode(n.fields.right) ? n.fields.right : null;
        walk(l);
        if (lower.includes('inorder')) order.push(n);
        walk(r);
        if (lower.includes('postorder')) order.push(n);
      };
      walk(obj.root);
      const printed: number[] = [];
      for (const n of order) {
        const v = Number(n.fields.val ?? 0);
        printed.push(v);
        recordEvent({ t: 'visit', id: n.id }, line);
        recordEvent(
          { t: 'note', text: `${methodName}: visit ${v} → output so far: ${printed.join(' ')}` },
          line,
        );
      }
      recordEvent(
        { t: 'note', text: `${methodName}() printed: ${printed.join(' ') || '(empty tree)'}` },
        line,
      );
      return null;
    }

    return null;
  };

  const invokeFunction = (
    fn: CppFuncDecl,
    argExprs: CppExpr[],
    thisInstance: HeapNodeInstance | null,
    callLine: number,
  ): CppValue => {
    const evaledArgs: { val: CppValue; expr: CppExpr }[] = argExprs.map((e) => ({
      val: evalExpr(e).value,
      expr: e,
    }));

    const primitiveArgs = evaledArgs.map((a) => toPrimitive(a.val));
    callDepth++;
    if (fn.name !== 'main') {
      recordEvent(
        {
          t: 'call',
          fn: fn.name,
          args: primitiveArgs,
          depth: callDepth,
        },
        callLine,
      );
    }

    const fnScope = new Map<string, VarCell>();
    const refWritebacks: { paramName: string; callerCell: VarCell }[] = [];

    fn.params.forEach((param, idx) => {
      const arg = evaledArgs[idx];
      const val = arg ? arg.val : 0;

      if (param.typeInfo.isReference && arg && arg.expr.kind === 'Ident') {
        const callerCell = lookupVarCell(arg.expr.name);
        if (callerCell) {
          fnScope.set(param.name, callerCell);
          refWritebacks.push({ paramName: param.name, callerCell });
          return;
        }
      }
      fnScope.set(param.name, { value: val, typeInfo: param.typeInfo });
    });

    scopeStack.push(fnScope);
    const prevMethodName = activeMethodName;
    if (thisInstance) {
      thisStack.push(thisInstance);
      activeMethodName = fn.name;
    }

    let returnValue: CppValue = 0;
    try {
      for (const stmt of fn.body) {
        execStmt(stmt);
      }
    } catch (sig) {
      if (sig instanceof ReturnSignal) {
        returnValue = sig.value;
      } else {
        throw sig;
      }
    } finally {
      if (thisInstance) {
        thisStack.pop();
        activeMethodName = prevMethodName;
      }
      scopeStack.pop();
      if (fn.name !== 'main') {
        recordEvent(
          {
            t: 'return',
            fn: fn.name,
            value: toPrimitive(returnValue),
          },
          activeLine,
        );
      }
      callDepth--;
    }

    return returnValue;
  };

  const assignToTarget = (
    target: CppExpr,
    op: string,
    rhsVal: CppValue,
    rhsExpr: CppExpr,
    line: number,
  ): CppValue => {
    const actualRhsVal = isMapElementLValue(rhsVal)
      ? rhsVal.map.entries.get(rhsVal.key) ?? 0
      : rhsVal;

    const computeCompound = (cur: CppValue, right: CppValue): CppValue => {
      if (op === '=') return right;
      if (op === '+=' && typeof cur === 'string') {
        return `${cur}${toPrimitive(right) ?? ''}`;
      }
      const a = toNumber(cur, line);
      const b = toNumber(right, line);
      switch (op) {
        case '+=':
          return a + b;
        case '-=':
          return a - b;
        case '*=':
          return a * b;
        case '/=':
          if (b === 0) throw new CppRuntimeError('Division by zero', line);
          return Math.trunc(a / b);
        case '%=':
          if (b === 0) throw new CppRuntimeError('Modulo by zero', line);
          return a % b;
        default:
          return right;
      }
    };

    if (target.kind === 'Ident') {
      const currentThis = thisStack[thisStack.length - 1];
      const topScope = scopeStack[scopeStack.length - 1];
      const isTopScopeLocal = topScope?.has(target.name) ?? false;

      if (!isTopScopeLocal && currentThis && target.name in currentThis.fields) {
        const prevFieldVal = currentThis.fields[target.name];
        if (op === '=' && isProxiedArray(prevFieldVal) && isProxiedArray(actualRhsVal)) {
          prevFieldVal.raw.length = 0;
          prevFieldVal.raw.push(...actualRhsVal.raw);
          hasArrayWrites = true;
          emitStepLine(line);
          recordEvent({ t: 'create', id: prevFieldVal.id, kind: 'array', value: prevFieldVal.raw.length }, line);
          for (let i = 0; i < prevFieldVal.raw.length; i++) {
            recordEvent(
              { t: 'set', target: { id: prevFieldVal.id, index: i }, value: prevFieldVal.raw[i] },
              line,
            );
          }
          return prevFieldVal;
        }
        const finalVal = computeCompound(prevFieldVal, actualRhsVal);
        updateHeapNodeField(currentThis, target.name, prevFieldVal, finalVal, line);
        return finalVal;
      }

      const cell = lookupVarCell(target.name);
      if (cell) {
        // Copying a vector (`heap = arr;`)
        if (op === '=' && isProxiedArray(cell.value) && isProxiedArray(actualRhsVal)) {
          const destArr = cell.value;
          destArr.raw.length = 0;
          destArr.raw.push(...actualRhsVal.raw);
          hasArrayWrites = true;
          emitStepLine(line);
          recordEvent({ t: 'create', id: destArr.id, kind: 'array', value: destArr.raw.length }, line);
          for (let i = 0; i < destArr.raw.length; i++) {
            recordEvent(
              { t: 'set', target: { id: destArr.id, index: i }, value: destArr.raw[i] },
              line,
            );
          }
          return destArr;
        }

        const prevScalarVal = cell.value;
        const finalVal = computeCompound(prevScalarVal, actualRhsVal);
        cell.value = finalVal;
        if (target.name === 'n' && typeof finalVal === 'number') {
          primaryArrayLogicalLength = finalVal;
        }
        if (target.name === 'charTop' && typeof finalVal === 'number') {
          while (dslStack.length > Math.max(0, finalVal + 1)) {
            const popped = dslStack.pop()!;
            emitStepLine(line);
            recordEvent({ t: 'remove', id: popped.id }, line);
            recordEvent(
              {
                t: 'note',
                text: `Line ${line}: Popped '${String.fromCharCode(popped.val)}' from charStack.`,
              },
              line,
            );
          }
        }
        if (target.name === 'topIndex' && typeof finalVal === 'number' && finalVal < Number(prevScalarVal)) {
          while (dslStack.length > Math.max(0, finalVal + 1)) {
            const popped = dslStack.pop()!;
            emitStepLine(line);
            recordEvent({ t: 'remove', id: popped.id }, line);
            recordEvent(
              {
                t: 'note',
                text: `Line ${line}: Popped ${popped.val} from stackArr.`,
              },
              line,
            );
          }
        }
        if (op === '=' && rhsExpr.kind === 'IndexExpr' && lastArrayRead) {
          tempVarProvenance.set(target.name, { ...lastArrayRead });
        } else {
          tempVarProvenance.delete(target.name);
        }
        return finalVal;
      }

      if (currentThis && target.name in currentThis.fields) {
        const prevFieldVal = currentThis.fields[target.name];
        if (op === '=' && isProxiedArray(prevFieldVal) && isProxiedArray(actualRhsVal)) {
          prevFieldVal.raw.length = 0;
          prevFieldVal.raw.push(...actualRhsVal.raw);
          hasArrayWrites = true;
          emitStepLine(line);
          recordEvent({ t: 'create', id: prevFieldVal.id, kind: 'array', value: prevFieldVal.raw.length }, line);
          for (let i = 0; i < prevFieldVal.raw.length; i++) {
            recordEvent(
              { t: 'set', target: { id: prevFieldVal.id, index: i }, value: prevFieldVal.raw[i] },
              line,
            );
          }
          return prevFieldVal;
        }
        const finalVal = computeCompound(prevFieldVal, actualRhsVal);
        updateHeapNodeField(currentThis, target.name, prevFieldVal, finalVal, line);
        return finalVal;
      }

      throw new CppRuntimeError(`Undeclared identifier '${target.name}'`, line);
    }

    if (target.kind === 'IndexExpr') {
      const arrEval = evalExpr(target.array).value;
      const idxRawEval = evalExpr(target.index).value;

      if (target.index.kind === 'Ident' && isProxiedArray(arrEval) && typeof idxRawEval === 'number') {
        indexPointers[target.index.name] = {
          arrayId: arrEval.id,
          index: Math.trunc(idxRawEval),
        };
      }

      // 1. 2D Matrix cell write (`matrix[r][c] = val`)
      if (isMatrixRow(arrEval)) {
        const colIdx = Math.trunc(toNumber(idxRawEval, line));
        const mat = arrEval.matrix;
        const rowIdx = arrEval.row;
        if (rowIdx >= 0 && rowIdx < mat.rows && colIdx >= 0 && colIdx < mat.cols) {
          const oldCell = mat.grid[rowIdx][colIdx] ?? 0;
          const finalCell = toNumber(computeCompound(oldCell, actualRhsVal), line);
          mat.grid[rowIdx][colIdx] = finalCell;

          // If this matrix represents a graph adjacency matrix, emit graph vertex/edge events
          if (
            detectedScene === 'graph' ||
            mat.name.toLowerCase().includes('graph') ||
            mat.name.toLowerCase().includes('matrix')
          ) {
            if (finalCell !== 0 && rowIdx !== colIdx && mat.rows <= 12) {
              ensureGraphVertex(rowIdx, line);
              ensureGraphVertex(colIdx, line);
              emitStepLine(line);
              recordEvent(
                {
                  t: 'link',
                  from: `v-${rowIdx}`,
                  to: `v-${colIdx}`,
                  label: finalCell === 1 ? undefined : String(finalCell),
                },
                line,
              );
              recordEvent(
                {
                  t: 'note',
                  text: `Line ${line}: Added edge ${rowIdx} -> ${colIdx} (weight ${finalCell}).`,
                },
                line,
              );
            }
          }
          return finalCell;
        }
        return 0;
      }

      // 2. `std::map` / `std::unordered_map` subscript assignment (`mp[key] = val`)
      if (isMapContainer(arrEval)) {
        const kPrim = toPrimitive(idxRawEval);
        const oldEntry = arrEval.entries.get(kPrim) ?? 0;
        const finalEntry = computeCompound(oldEntry, actualRhsVal);
        arrEval.entries.set(kPrim, finalEntry);

        detectedScene = detectedScene ?? 'hash-table';
        let bId = arrEval.bucketIds.get(kPrim);
        emitStepLine(line);
        if (!bId) {
          bId = `map-${nextNodeSeq++}`;
          arrEval.bucketIds.set(kPrim, bId);
          recordEvent(
            {
              t: 'create',
              id: bId,
              kind: 'bucket',
              value: `${kPrim}:${toPrimitive(finalEntry)}`,
            },
            line,
          );
        } else {
          recordEvent(
            {
              t: 'set',
              target: { id: bId },
              value: `${kPrim}:${toPrimitive(finalEntry)}`,
            },
            line,
          );
        }
        recordEvent(
          {
            t: 'note',
            text: `Line ${line}: ${arrEval.name}[${kPrim}] = ${toPrimitive(finalEntry)}.`,
          },
          line,
        );
        return finalEntry;
      }

      // 3. String character assignment (`s[i] = 'a'`) or char[] buffer write (`stackArr[topIndex] = ch`)
      if (typeof arrEval === 'string' && target.array.kind === 'Ident') {
        const idxVal = Math.trunc(toNumber(idxRawEval, line));
        const ch =
          typeof actualRhsVal === 'string'
            ? actualRhsVal[0] ?? ' '
            : String.fromCharCode(toNumber(actualRhsVal, line));
        const chars = arrEval.split('');
        if (idxVal >= 0 && idxVal < chars.length) {
          chars[idxVal] = ch;
        }
        const updatedStr = chars.join('');
        const strCell = lookupVarCell(target.array.name);
        if (strCell) strCell.value = updatedStr;
        return ch;
      }

      const idxVal = Math.trunc(toNumber(idxRawEval, line));
      if (!isProxiedArray(arrEval)) {
        throw new CppRuntimeError('Subscripted value is not an array or vector', line);
      }

      if (
        (arrEval.isCharBuffer && arrEval.name === 'charStack') ||
        arrEval.name === 'stackArr'
      ) {
        const numVal = toNumber(actualRhsVal, line);
        arrEval.raw[idxVal] = numVal;
        const valOrChar =
          arrEval.name === 'charStack' ? String.fromCharCode(numVal) : numVal;
        detectedScene = 'stack';
        const id = `stk-${nextNodeSeq++}`;
        emitStepLine(line);
        recordEvent({ t: 'create', id, kind: 'node', value: valOrChar }, line);
        if (dslStack.length > 0) {
          recordEvent(
            { t: 'link', from: id, to: dslStack[dslStack.length - 1].id, label: 'below' },
            line,
          );
        }
        dslStack.push({ id, val: numVal });
        recordEvent(
          {
            t: 'note',
            text: `Line ${line}: Pushed ${arrEval.name === 'charStack' ? `'${valOrChar}'` : valOrChar} onto ${arrEval.name}[${idxVal}].`,
          },
          line,
        );
        return numVal;
      }

      // 4. Array/vector of pointers (`buckets[idx] = newNode` or `graph[u] = newNode`)
      if (arrEval.isPointerArray && arrEval.pointerItems) {
        const prevPtr = arrEval.pointerItems[idxVal] ?? null;
        const nextPtr = isHeapNode(actualRhsVal) ? actualRhsVal : null;
        arrEval.pointerItems[idxVal] = nextPtr;

        if (arrEval.name === 'buckets' || detectedScene === 'hash-table') {
          ensureBucketHeader(idxVal, line);
          emitStepLine(line);
          if (prevPtr && prevPtr.isVisualNode) {
            recordEvent({ t: 'unlink', from: `b-${idxVal}`, to: prevPtr.id }, line);
          }
          if (nextPtr && nextPtr.isVisualNode) {
            recordEvent({ t: 'link', from: `b-${idxVal}`, to: nextPtr.id, label: 'head' }, line);
          }
        } else if (
          arrEval.name === 'graph' ||
          arrEval.name === 'list' ||
          detectedScene === 'graph'
        ) {
          if (nextPtr) {
            const targetVertex = toNumber(nextPtr.fields.data ?? nextPtr.fields.val ?? 0, line);
            ensureGraphVertex(idxVal, line);
            ensureGraphVertex(targetVertex, line);
            emitStepLine(line);
            recordEvent(
              { t: 'link', from: `v-${idxVal}`, to: `v-${targetVertex}` },
              line,
            );
          }
        }
        return nextPtr;
      }

      // 5. Array/vector of structs (`edges[j] = temp` or `edges[0] = {0, 1, 4}`)
      if (arrEval.structItems) {
        while (idxVal >= arrEval.structItems.length) {
          arrEval.structItems.push(
            instantiateClass(arrEval.structItems[0]?.className ?? 'Node', [], line, false),
          );
        }
        const destStruct = arrEval.structItems[idxVal];
        if (isHeapNode(actualRhsVal)) {
          // Copy fields from struct value
          destStruct.fields = { ...actualRhsVal.fields };
          return destStruct;
        }
        if (isProxiedArray(actualRhsVal) && actualRhsVal.id === '__init__') {
          const cls = classMap.get(destStruct.className);
          if (cls) {
            cls.fields.forEach((f, fIdx) => {
              if (fIdx < actualRhsVal.raw.length) {
                destStruct.fields[f.name] = actualRhsVal.raw[fIdx];
              }
            });
            // If initializing a graph Edge `{u, v, weight}`, create vertices
            if ('u' in destStruct.fields && 'v' in destStruct.fields) {
              const u = Number(destStruct.fields.u ?? 0);
              const v = Number(destStruct.fields.v ?? 0);
              ensureGraphVertex(u, line);
              ensureGraphVertex(v, line);
            }
          }
          return destStruct;
        }
      }

      const rhsRead = lastArrayRead ? { ...lastArrayRead } : null;
      const oldVal =
        op === '=' ? (arrEval.raw[idxVal] ?? 0) : arrEval.proxy[idxVal];
      const finalVal = toNumber(computeCompound(oldVal, actualRhsVal), line);

      // Check for 3-line temp variable swap:
      // 1) `temp = arr[a];`
      // 2) `arr[a] = arr[b];`
      // 3) `arr[b] = temp;`
      if (
        op === '=' &&
        rhsExpr.kind === 'Ident' &&
        pendingSwapFirstWrite &&
        pendingSwapFirstWrite.arrayId === arrEval.id &&
        pendingSwapFirstWrite.indexB === idxVal
      ) {
        const tempProv = tempVarProvenance.get(rhsExpr.name);
        if (
          tempProv &&
          tempProv.arrayId === arrEval.id &&
          tempProv.index === pendingSwapFirstWrite.indexA &&
          tempProv.value === finalVal
        ) {
          const idxA = pendingSwapFirstWrite.indexA;
          const idxB = idxVal;
          const valA = pendingSwapFirstWrite.oldValA;
          const valB = pendingSwapFirstWrite.newValA;

          inInternalSwap = true;
          arrEval.proxy[idxB] = finalVal;
          inInternalSwap = false;

          // Fold the temp read and intermediate set events from lines 1 & 2 into a single swap event
          const foldEventIdx = Math.min(tempProv.eventIdx, pendingSwapFirstWrite.eventIdx);
          const foldStepIdx = Math.min(tempProv.stepIdx, pendingSwapFirstWrite.stepIdx);
          events.splice(foldEventIdx);
          steps.splice(foldStepIdx);

          if (idxA !== idxB) {
            hasArrayWrites = true;
            emitStepLine(line);
            recordEvent(
              {
                t: 'swap',
                a: { id: arrEval.id, index: idxA },
                b: { id: arrEval.id, index: idxB },
              },
              line,
            );
            recordEvent(
              {
                t: 'note',
                text: `Line ${line}: Swapped ${valA} and ${valB} between ${arrEval.id}[${idxA}] and ${arrEval.id}[${idxB}].`,
              },
              line,
            );
          }
          pendingSwapFirstWrite = null;
          tempVarProvenance.delete(rhsExpr.name);
          return finalVal;
        }
      }

      const eventIdxBefore =
        op === '=' &&
          rhsExpr.kind === 'IndexExpr' &&
          rhsRead &&
          rhsRead.arrayId === arrEval.id
          ? rhsRead.eventIdx
          : events.length;
      const stepIdxBefore =
        op === '=' &&
          rhsExpr.kind === 'IndexExpr' &&
          rhsRead &&
          rhsRead.arrayId === arrEval.id
          ? rhsRead.stepIdx
          : steps.length;

      arrEval.proxy[idxVal] = finalVal;

      if (
        op === '=' &&
        rhsExpr.kind === 'IndexExpr' &&
        rhsRead &&
        rhsRead.arrayId === arrEval.id
      ) {
        pendingSwapFirstWrite = {
          arrayId: arrEval.id,
          indexA: idxVal,
          indexB: rhsRead.index,
          oldValA: oldVal,
          newValA: finalVal,
          line,
          eventIdx: eventIdxBefore,
          stepIdx: stepIdxBefore,
        };
      } else {
        pendingSwapFirstWrite = null;
      }

      return finalVal;
    }

    if (target.kind === 'MemberExpr') {
      const objVal = evalExpr(target.object).value;
      if (objVal === null) {
        throw new CppRuntimeError(
          `Null pointer dereference when accessing '${target.isArrow ? '->' : '.'}${target.member}'`,
          line,
        );
      }
      if (!isHeapNode(objVal)) {
        throw new CppRuntimeError(`Cannot access member '${target.member}' on non-struct value`, line);
      }
      const prevFieldVal = objVal.fields[target.member] ?? null;
      const finalVal = computeCompound(prevFieldVal, actualRhsVal);
      updateHeapNodeField(objVal, target.member, prevFieldVal, finalVal, line);

      // Mirror HashTableLinearProbing `table[target].key = key` into visual array `'arr'`
      if (
        target.object.kind === 'IndexExpr' &&
        (target.member === 'key' || target.member === 'state')
      ) {
        const idxVal = Math.trunc(toNumber(evalExpr(target.object.index).value, line));
        let visualArr = proxiedArrays.get('arr');
        if (!visualArr) {
          const cap = Number(thisStack[thisStack.length - 1]?.fields.capacity ?? 7);
          visualArr = createProxiedArray('arr', new Array(Math.min(cap, 16)).fill(0), line, true);
        }
        if (target.member === 'key' && typeof finalVal === 'number') {
          visualArr.proxy[idxVal] = finalVal;
        } else if (target.member === 'state' && finalVal === 2) {
          // Tombstone DELETED state
          visualArr.proxy[idxVal] = -1;
        }
      }

      // Mirror ListGraph / adjacency list `temp->next = newNode` into graph edge
      if (
        target.member === 'next' &&
        isHeapNode(finalVal) &&
        (detectedScene === 'graph' || thisStack[thisStack.length - 1]?.className === 'ListGraph')
      ) {
        const uCell = lookupVarCell('u');
        if (uCell && typeof uCell.value === 'number') {
          const u = uCell.value;
          const v = toNumber(finalVal.fields.data ?? finalVal.fields.val ?? 0, line);
          ensureGraphVertex(u, line);
          ensureGraphVertex(v, line);
          emitStepLine(line);
          recordEvent({ t: 'link', from: `v-${u}`, to: `v-${v}` }, line);
        }
      }

      return finalVal;
    }

    throw new CppRuntimeError('Invalid assignment target', line);
  };

  const updateHeapNodeField = (
    node: HeapNodeInstance,
    field: string,
    prevVal: CppValue,
    nextVal: CppValue,
    line: number,
  ) => {
    node.fields[field] = nextVal;
    if (!node.isVisualNode) return;

    if (VALUE_FIELD_NAMES.has(field)) {
      emitStepLine(line);
      recordEvent(
        { t: 'set', target: { id: node.id }, value: toPrimitive(nextVal) },
        line,
      );
      recordEvent(
        {
          t: 'note',
          text: `Line ${line}: Updated ${node.id}->${field} = ${toPrimitive(nextVal)}.`,
        },
        line,
      );
    } else if (LINK_FIELD_NAMES.has(field)) {
      emitStepLine(line);
      if (isHeapNode(prevVal) && prevVal.isVisualNode) {
        recordEvent({ t: 'unlink', from: node.id, to: prevVal.id }, line);
      }
      if (isHeapNode(nextVal) && nextVal.isVisualNode) {
        recordEvent(
          { t: 'link', from: node.id, to: nextVal.id, label: field },
          line,
        );
        recordEvent(
          {
            t: 'note',
            text: `Line ${line}: Linked ${node.id}->${field} to ${nextVal.id} (${getHeapNodeValue(nextVal)}).`,
          },
          line,
        );
      } else if (nextVal === null && isHeapNode(prevVal) && prevVal.isVisualNode) {
        recordEvent(
          {
            t: 'note',
            text: `Line ${line}: Set ${node.id}->${field} = nullptr.`,
          },
          line,
        );
      }
    }
  };

  const evalExpr = (expr: CppExpr): EvaluatedWithProvenance => {
    activeLine = expr.line;

    switch (expr.kind) {
      case 'NumberLit':
        return { value: expr.value };

      case 'StringLit':
        return { value: expr.value };

      case 'BoolLit':
        return { value: expr.value };

      case 'NullLit':
        return { value: null };

      case 'ThisExpr': {
        const currentThis = thisStack[thisStack.length - 1];
        if (!currentThis) {
          throw new CppRuntimeError("'this' used outside of a class method", expr.line);
        }
        return { value: currentThis, ref: currentThis.isVisualNode ? { id: currentThis.id } : undefined };
      }

      case 'Ident': {
        if (expr.name === 'cout' || expr.name === 'cerr') {
          return { value: coutStream };
        }
        if (expr.name === 'cin') {
          return { value: cinStream };
        }
        if (expr.name === 'endl') {
          return { value: '\n' };
        }
        const currentThis = thisStack[thisStack.length - 1];
        const topScope = scopeStack[scopeStack.length - 1];
        const isTopScopeLocal = topScope?.has(expr.name) ?? false;
        if (!isTopScopeLocal && currentThis && expr.name in currentThis.fields) {
          const fVal = currentThis.fields[expr.name];
          if (isHeapNode(fVal) && fVal.isVisualNode) {
            return { value: fVal, ref: { id: fVal.id } };
          }
          return { value: fVal };
        }
        const cell = lookupVarCell(expr.name);
        if (cell) {
          const val = cell.value;
          if (isHeapNode(val) && val.isVisualNode) {
            return { value: val, ref: { id: val.id } };
          }
          return { value: val };
        }
        if (currentThis && expr.name in currentThis.fields) {
          const fVal = currentThis.fields[expr.name];
          if (isHeapNode(fVal) && fVal.isVisualNode) {
            return { value: fVal, ref: { id: fVal.id } };
          }
          return { value: fVal };
        }
        if (expr.name in program.enums) {
          return { value: program.enums[expr.name] };
        }
        throw new CppRuntimeError(`Undeclared identifier '${expr.name}'`, expr.line);
      }

      case 'InitList': {
        const elemVals = expr.elements.map((el) => evalExpr(el).value);
        // Check if this is a 2D initializer list (`{ {1, 2}, {3, 4} }`)
        if (elemVals.length > 0 && elemVals.every((ev) => isProxiedArray(ev))) {
          const grid = elemVals.map((ev) => [...(ev as ProxiedArrayMeta).raw]);
          return {
            value: {
              __isMatrix: true,
              id: '__init_mat__',
              name: '__init_mat__',
              rows: grid.length,
              cols: grid[0]?.length ?? 0,
              grid,
            },
          };
        }
        const nums = elemVals.map((ev) => toNumber(ev, expr.line));
        return {
          value: {
            __isProxiedArray: true,
            id: '__init__',
            name: '__init__',
            raw: nums,
            proxy: nums,
          },
        };
      }

      case 'SizeofExpr': {
        if (expr.targetType) {
          return { value: 4 };
        }
        if (expr.targetExpr) {
          const targetVal = evalExpr(expr.targetExpr).value;
          if (isProxiedArray(targetVal)) {
            return { value: targetVal.raw.length * 4 };
          }
          return { value: 4 };
        }
        return { value: 4 };
      }

      case 'IndexExpr': {
        const arrVal = evalExpr(expr.array).value;
        const idxRaw = evalExpr(expr.index).value;

        if (expr.index.kind === 'Ident' && isProxiedArray(arrVal) && typeof idxRaw === 'number') {
          indexPointers[expr.index.name] = {
            arrayId: arrVal.id,
            index: Math.trunc(idxRaw),
          };
        }

        // 1. 2D Matrix row access (`matrix[r]`)
        if (isMatrix(arrVal)) {
          const rIdx = Math.trunc(toNumber(idxRaw, expr.line));
          return {
            value: {
              __isMatrixRow: true,
              matrix: arrVal,
              row: rIdx,
            },
          };
        }

        // 2. 2D Matrix cell read (`matrix[r][c]`)
        if (isMatrixRow(arrVal)) {
          const cIdx = Math.trunc(toNumber(idxRaw, expr.line));
          const cellVal = arrVal.matrix.grid[arrVal.row]?.[cIdx] ?? 0;
          return {
            value: cellVal,
            ref:
              detectedScene === 'graph' && arrVal.row >= 0
                ? { id: `v-${arrVal.row}` }
                : undefined,
          };
        }

        // 3. `std::map` / `std::unordered_map` subscript read (`mp[key]`)
        if (isMapContainer(arrVal)) {
          const kPrim = toPrimitive(idxRaw);
          if (!arrVal.entries.has(kPrim)) {
            arrVal.entries.set(kPrim, 0);
          }
          const bId = arrVal.bucketIds.get(kPrim);
          if (bId && inComparisonContext === 0) {
            recordEvent({ t: 'visit', id: bId }, expr.line);
          }
          return {
            value: {
              __isMapElementLValue: true,
              map: arrVal,
              key: kPrim,
            },
          };
        }

        // 4. `std::string` subscript read (`s[i]`)
        if (typeof arrVal === 'string') {
          const idxVal = Math.trunc(toNumber(idxRaw, expr.line));
          if (idxVal === arrVal.length) {
            return { value: 0 };
          }
          const ch = arrVal[idxVal] ?? '\0';
          return { value: ch === '\0' ? 0 : ch.charCodeAt(0) };
        }

        const idxVal = Math.trunc(toNumber(idxRaw, expr.line));
        if (!isProxiedArray(arrVal)) {
          throw new CppRuntimeError('Subscripted value is not an array or vector', expr.line);
        }

        if (arrVal.isPointerArray && arrVal.pointerItems) {
          const ptr = arrVal.pointerItems[idxVal] ?? null;
          return {
            value: ptr,
            ref: isHeapNode(ptr) && ptr.isVisualNode ? { id: ptr.id } : undefined,
          };
        }

        if (arrVal.structItems) {
          while (idxVal >= arrVal.structItems.length) {
            arrVal.structItems.push(
              instantiateClass(arrVal.structItems[0]?.className ?? 'Node', [], expr.line, false),
            );
          }
          return {
            value: arrVal.structItems[idxVal],
            ref: proxiedArrays.has('arr') ? { id: 'arr', index: idxVal } : undefined,
          };
        }

        const elemVal = arrVal.proxy[idxVal];
        return {
          value: elemVal,
          ref: { id: arrVal.id, index: idxVal },
        };
      }

      case 'MemberExpr': {
        const objEval = evalExpr(expr.object);
        const objVal = objEval.value;
        if (objVal === null) {
          throw new CppRuntimeError(
            `Null pointer dereference when reading '${expr.isArrow ? '->' : '.'}${expr.member}'`,
            expr.line,
          );
        }
        if (isHeapNode(objVal)) {
          if (expr.member in objVal.fields) {
            const fieldVal = objVal.fields[expr.member];
            if (VALUE_FIELD_NAMES.has(expr.member) && objVal.isVisualNode) {
              return { value: fieldVal, ref: { id: objVal.id } };
            }
            if (isHeapNode(fieldVal) && fieldVal.isVisualNode) {
              return { value: fieldVal, ref: { id: fieldVal.id } };
            }
            if (objEval.ref) {
              return { value: fieldVal, ref: objEval.ref };
            }
            return { value: fieldVal };
          }
        }
        throw new CppRuntimeError(`Unknown member '${expr.member}'`, expr.line);
      }

      case 'NewExpr': {
        if (expr.isArray) {
          const size = expr.sizeExpr
            ? Math.max(0, Math.trunc(toNumber(evalExpr(expr.sizeExpr).value, expr.line)))
            : 0;
          return {
            value: createProxiedArray('arr', new Array(size).fill(0), expr.line),
          };
        }
        const argVals = expr.args.map((a) => evalExpr(a).value);
        const inst = instantiateClass(expr.className, argVals, expr.line, true);
        return {
          value: inst,
          ref: inst.isVisualNode ? { id: inst.id } : undefined,
        };
      }

      case 'UnaryExpr': {
        if (expr.op === '++' || expr.op === '--') {
          const delta = expr.op === '++' ? 1 : -1;
          const targetEval = evalExpr(expr.expr).value;
          if (isMapElementLValue(targetEval)) {
            const cur = toNumber(targetEval.map.entries.get(targetEval.key) ?? 0, expr.line);
            const updated = cur + delta;
            assignToTarget(
              expr.expr,
              '=',
              updated,
              { kind: 'NumberLit', value: updated, line: expr.line },
              expr.line,
            );
            return { value: expr.prefix ? updated : cur };
          }
          const current = toNumber(targetEval, expr.line);
          const updated = current + delta;
          assignToTarget(
            expr.expr,
            '=',
            updated,
            { kind: 'NumberLit', value: updated, line: expr.line },
            expr.line,
          );
          return { value: expr.prefix ? updated : current };
        }
        const inner = evalExpr(expr.expr).value;
        switch (expr.op) {
          case '+':
            return { value: +toNumber(inner, expr.line) };
          case '-':
            return { value: -toNumber(inner, expr.line) };
          case '!':
            return { value: !toBool(inner) };
          case '~':
            return { value: ~Math.trunc(toNumber(inner, expr.line)) };
          case '*':
            return { value: inner };
          default:
            throw new CppCompileError(`Unsupported unary operator '${expr.op}'`, expr.line, 'unsupported');
        }
      }

      case 'BinaryExpr': {
        // Short-circuit logical operators
        if (expr.op === '&&') {
          const l = evalExpr(expr.left);
          if (!toBool(l.value)) return { value: false };
          const r = evalExpr(expr.right);
          return { value: toBool(r.value) };
        }
        if (expr.op === '||') {
          const l = evalExpr(expr.left);
          if (toBool(l.value)) return { value: true };
          const r = evalExpr(expr.right);
          return { value: toBool(r.value) };
        }

        // Handle `cout << ...` stream output
        if (expr.op === '<<') {
          const l = evalExpr(expr.left);
          if (isCoutStream(l.value)) {
            const r = evalExpr(expr.right);
            if (r.ref && heapNodes.has(r.ref.id)) {
              emitStepLine(expr.line);
              recordEvent({ t: 'visit', id: r.ref.id }, expr.line);
            } else if (
              detectedScene === 'graph' &&
              expr.right.kind === 'Ident' &&
              (expr.right.name === 'node' || expr.right.name === 'u' || expr.right.name === 'v') &&
              typeof r.value === 'number' &&
              graphVerticesCreated.has(r.value)
            ) {
              emitStepLine(expr.line);
              recordEvent({ t: 'visit', id: `v-${r.value}` }, expr.line);
              recordEvent(
                { t: 'note', text: `Line ${expr.line}: Visited graph vertex ${r.value}.` },
                expr.line,
              );
            }
            const rawRVal = isMapElementLValue(r.value)
              ? r.value.map.entries.get(r.value.key) ?? 0
              : isProxiedArray(r.value) && r.value.isCharBuffer
                ? r.value.raw
                  .filter((c) => c > 0)
                  .map((c) => String.fromCharCode(c))
                  .join('')
                : r.value;

            const textPiece =
              rawRVal === null
                ? 'NULL'
                : typeof rawRVal === 'number' || typeof rawRVal === 'string' || typeof rawRVal === 'boolean'
                  ? String(rawRVal)
                  : '';

            l.value.rawText += textPiece;

            if (textPiece && textPiece !== '\n' && textPiece.trim() !== '') {
              const cleaned = textPiece.replace(/\n/g, '').trim();
              if (cleaned) {
                l.value.buffer.push(cleaned);
              }
              if (textPiece.includes('\n') && l.value.buffer.length > 0) {
                const outStr = l.value.buffer.join(' ');
                l.value.lines.push(outStr);
                l.value.buffer.length = 0;
                if (activeMethodName) {
                  recordEvent(
                    { t: 'note', text: `${activeMethodName}() printed: ${outStr}` },
                    expr.line,
                  );
                } else {
                  recordEvent({ t: 'note', text: `Line ${expr.line}: Output: ${outStr}` }, expr.line);
                }
              }
            } else if (textPiece === '\n' && l.value.buffer.length > 0) {
              const outStr = l.value.buffer.join(' ');
              l.value.lines.push(outStr);
              l.value.buffer.length = 0;
              if (activeMethodName) {
                recordEvent(
                  { t: 'note', text: `${activeMethodName}() printed: ${outStr}` },
                  expr.line,
                );
              } else {
                recordEvent({ t: 'note', text: `Line ${expr.line}: Output: ${outStr}` }, expr.line);
              }
            }
            return { value: l.value };
          }
        }

        // Handle `cin >> ...` stream input
        if (expr.op === '>>') {
          const l = evalExpr(expr.left);
          if (isCinStream(l.value)) {
            emitStepLine(expr.line);

            // Check if reading into a char[] buffer (`cin >> expression;`)
            if (expr.right.kind === 'Ident') {
              const targetCell = lookupVarCell(expr.right.name);
              if (targetCell && isProxiedArray(targetCell.value) && targetCell.value.isCharBuffer) {
                const queuedNext =
                  hasExplicitStdin && l.value.queue.length > 0 ? l.value.queue.shift() : undefined;
                const sampleStr =
                  typeof queuedNext === 'string' && queuedNext.length > 0
                    ? queuedNext
                    : '{[()]}';
                const charArr = targetCell.value;
                charArr.raw.length = 0;
                for (let i = 0; i < sampleStr.length; i++) {
                  charArr.raw.push(sampleStr.charCodeAt(i));
                }
                charArr.raw.push(0); // null terminator
                recordEvent(
                  {
                    t: 'note',
                    text: `Line ${expr.line}: Read string ${expr.right.name} = "${sampleStr}".`,
                  },
                  expr.line,
                );
                return { value: l.value };
              }
            }

            let nextInput: number | string;
            if (hasExplicitStdin && l.value.queue.length > 0) {
              nextInput = l.value.queue.shift()!;
            } else if (expr.right.kind === 'Ident' && expr.right.name === 'choice') {
              menuChoiceReadCount++;
              const hasMenuLoop = /while\s*\(\s*choice\s*!=\s*\d+\s*\)/.test(sourceCode);
              if (!hasMenuLoop) {
                nextInput = 1;
              } else if (sourceCode.includes('balancedParentheses')) {
                nextInput = menuChoiceReadCount === 1 ? 1 : menuExitChoice;
              } else {
                // In interactive menu loops: push/insert 2 items, display, then exit cleanly
                if (menuChoiceReadCount <= 2) {
                  nextInput = 1;
                } else if (menuChoiceReadCount === 3 && menuExitChoice > 4) {
                  nextInput = 4;
                } else {
                  nextInput = menuExitChoice;
                }
              }
            } else if (expr.right.kind === 'Ident' && expr.right.name === 'pos') {
              nextInput = 1;
            } else if (
              expr.right.kind === 'Ident' &&
              (expr.right.name === 'n' || expr.right.name === 'size')
            ) {
              nextInput = Math.min(fallbackArray.length, 6);
            } else {
              nextInput = l.value.queue.length > 0 ? l.value.queue.shift()! : 42;
            }

            const numInput = typeof nextInput === 'number' ? nextInput : Number(nextInput) || 0;
            assignToTarget(
              expr.right,
              '=',
              numInput,
              { kind: 'NumberLit', value: numInput, line: expr.line },
              expr.line,
            );
            if (expr.right.kind === 'Ident') {
              if (expr.right.name === 'n' || expr.right.name === 'size') {
                primaryArrayLogicalLength = numInput;
                const primaryArr = primaryArrayId ? proxiedArrays.get(primaryArrayId) : undefined;
                if (primaryArr && primaryArr.raw.length === 0 && numInput > 0 && numInput <= 24) {
                  inArrayInit = true;
                  primaryArr.raw.length = numInput;
                  primaryArr.raw.fill(0);
                  recordEvent(
                    { t: 'create', id: primaryArr.id, kind: 'array', value: numInput },
                    expr.line,
                  );
                  inArrayInit = false;
                }
              }
              recordEvent(
                {
                  t: 'note',
                  text: `Line ${expr.line}: Read input ${expr.right.name} = ${numInput}.`,
                },
                expr.line,
              );
            }
            return { value: l.value };
          }
        }

        const isRelationalOp = ['<', '>', '<=', '>=', '==', '!='].includes(expr.op);
        if (isRelationalOp) inComparisonContext++;
        let leftEval: EvaluatedWithProvenance;
        let rightEval: EvaluatedWithProvenance;
        try {
          leftEval = evalExpr(expr.left);
          rightEval = evalExpr(expr.right);
        } finally {
          if (isRelationalOp) inComparisonContext--;
        }

        const lVal = isMapElementLValue(leftEval.value)
          ? leftEval.value.map.entries.get(leftEval.value.key) ?? 0
          : leftEval.value;
        const rVal = isMapElementLValue(rightEval.value)
          ? rightEval.value.map.entries.get(rightEval.value.key) ?? 0
          : rightEval.value;

        // Comparison operators
        if (isRelationalOp) {
          let result = false;
          if (lVal === null || rVal === null || isHeapNode(lVal) || isHeapNode(rVal)) {
            const lId = isHeapNode(lVal) ? lVal.id : lVal;
            const rId = isHeapNode(rVal) ? rVal.id : rVal;
            result = expr.op === '==' ? lId === rId : lId !== rId;
          } else {
            const a = typeof lVal === 'string' && typeof rVal === 'string' ? lVal : toNumber(lVal, expr.line);
            const b = typeof lVal === 'string' && typeof rVal === 'string' ? rVal : toNumber(rVal, expr.line);
            switch (expr.op) {
              case '<':
                result = a < b;
                break;
              case '>':
                result = a > b;
                break;
              case '<=':
                result = a <= b;
                break;
              case '>=':
                result = a >= b;
                break;
              case '==':
                result = a === b;
                break;
              case '!=':
                result = a !== b;
                break;
            }
          }

          // Emit 3D `compare` event whenever at least one side references an array cell or visual heap node
          if (leftEval.ref || rightEval.ref) {
            const refA = leftEval.ref ?? rightEval.ref!;
            const refB = rightEval.ref ?? leftEval.ref!;
            emitStepLine(expr.line);
            recordEvent({ t: 'compare', a: refA, b: refB }, expr.line);
            const labelA =
              typeof refA.index === 'number'
                ? `${refA.id}[${refA.index}] (${toPrimitive(lVal)})`
                : `${refA.id} (${toPrimitive(lVal)})`;
            const labelB =
              rightEval.ref && leftEval.ref
                ? typeof refB.index === 'number'
                  ? `${refB.id}[${refB.index}] (${toPrimitive(rVal)})`
                  : `${refB.id} (${toPrimitive(rVal)})`
                : String(toPrimitive(rVal));
            recordEvent(
              {
                t: 'note',
                text: `Line ${expr.line}: Comparing ${labelA} ${expr.op} ${labelB} → ${result ? 'true' : 'false'}.`,
              },
              expr.line,
            );
          }

          return { value: result };
        }

        // Arithmetic & Bitwise operators
        if (expr.op === '+' && (typeof lVal === 'string' || typeof rVal === 'string')) {
          return { value: `${toPrimitive(lVal) ?? ''}${toPrimitive(rVal) ?? ''}` };
        }

        const numA = toNumber(lVal, expr.line);
        const numB = toNumber(rVal, expr.line);

        switch (expr.op) {
          case '+':
            return { value: numA + numB };
          case '-':
            return { value: numA - numB };
          case '*':
            return { value: numA * numB };
          case '/':
            if (numB === 0) throw new CppRuntimeError('Division by zero', expr.line);
            if (Number.isInteger(numA) && Number.isInteger(numB)) {
              return { value: Math.trunc(numA / numB) };
            }
            return { value: numA / numB };
          case '%':
            if (numB === 0) throw new CppRuntimeError('Modulo by zero', expr.line);
            return { value: numA % numB };
          case '&':
            return { value: Math.trunc(numA) & Math.trunc(numB) };
          case '|':
            return { value: Math.trunc(numA) | Math.trunc(numB) };
          case '^':
            return { value: Math.trunc(numA) ^ Math.trunc(numB) };
          case '<<':
            return { value: Math.trunc(numA) << Math.trunc(numB) };
          case '>>':
            return { value: Math.trunc(numA) >> Math.trunc(numB) };
          default:
            throw new CppCompileError(`Unsupported binary operator '${expr.op}'`, expr.line, 'unsupported');
        }
      }

      case 'AssignExpr': {
        const rhs = evalExpr(expr.value).value;
        const res = assignToTarget(expr.target, expr.op, rhs, expr.value, expr.line);
        return { value: res };
      }

      case 'ConditionalExpr': {
        const cond = toBool(evalExpr(expr.test).value);
        return cond ? evalExpr(expr.consequent) : evalExpr(expr.alternate);
      }

      case 'CallExpr': {
        // 1. Member method call `obj.method(...)` or `ptr->method(...)`
        if (expr.callee.kind === 'MemberExpr') {
          const memberName = expr.callee.member;

          // Check if `obj` is a synthetic BST variable (`BST t;`)
          if (expr.callee.object.kind === 'Ident') {
            const synBst = syntheticBstObjects.get(expr.callee.object.name);
            if (synBst) {
              const argVals = expr.args.map((a) => evalExpr(a).value);
              return { value: execSyntheticBstMethod(synBst, memberName, argVals, expr.line) };
            }
          }

          const objVal = evalExpr(expr.callee.object).value;
          if (objVal === null) {
            throw new CppRuntimeError(
              `Null pointer dereference when calling '${memberName}()'`,
              expr.line,
            );
          }

          // `std::string` methods
          if (typeof objVal === 'string') {
            if (memberName === 'size' || memberName === 'length') {
              return { value: objVal.length };
            }
            if (memberName === 'empty') {
              return { value: objVal.length === 0 };
            }
            if (memberName === 'substr') {
              const start = expr.args[0] ? Math.trunc(toNumber(evalExpr(expr.args[0]).value, expr.line)) : 0;
              const len = expr.args[1] ? Math.trunc(toNumber(evalExpr(expr.args[1]).value, expr.line)) : objVal.length;
              return { value: objVal.slice(start, start + len) };
            }
            if (memberName === 'find') {
              const needle = String(evalExpr(expr.args[0]).value ?? '');
              return { value: objVal.indexOf(needle) };
            }
            if (memberName === 'push_back' && expr.callee.object.kind === 'Ident') {
              const chArg = evalExpr(expr.args[0]).value;
              const ch = typeof chArg === 'string' ? chArg : String.fromCharCode(toNumber(chArg, expr.line));
              const updated = objVal + ch;
              const cell = lookupVarCell(expr.callee.object.name);
              if (cell) cell.value = updated;
              return { value: null };
            }
            if (memberName === 'pop_back' && expr.callee.object.kind === 'Ident') {
              const updated = objVal.slice(0, -1);
              const cell = lookupVarCell(expr.callee.object.name);
              if (cell) cell.value = updated;
              return { value: null };
            }
            if (memberName === 'back') {
              return { value: objVal.length > 0 ? objVal.charCodeAt(objVal.length - 1) : 0 };
            }
            if (memberName === 'front') {
              return { value: objVal.length > 0 ? objVal.charCodeAt(0) : 0 };
            }
          }

          // 2D Matrix (`vector<vector<int>>`) methods
          if (isMatrix(objVal)) {
            if (memberName === 'size') {
              return { value: objVal.rows };
            }
            if (memberName === 'empty') {
              return { value: objVal.rows === 0 };
            }
            if (memberName === 'push_back') {
              const rowEval = evalExpr(expr.args[0]).value;
              if (isProxiedArray(rowEval)) {
                objVal.grid.push([...rowEval.raw]);
                objVal.rows = objVal.grid.length;
                objVal.cols = Math.max(objVal.cols, rowEval.raw.length);
              }
              return { value: null };
            }
          }
          if (isMatrixRow(objVal)) {
            if (memberName === 'size') {
              return { value: objVal.matrix.cols };
            }
            if (memberName === 'empty') {
              return { value: objVal.matrix.cols === 0 };
            }
          }

          // `std::vector` methods
          if (isProxiedArray(objVal)) {
            if (memberName === 'size' || memberName === 'length') {
              if (objVal.isPointerArray && objVal.pointerItems) {
                return { value: objVal.pointerItems.length };
              }
              if (objVal.structItems) {
                return { value: objVal.structItems.length };
              }
              return { value: objVal.raw.length };
            }
            if (memberName === 'empty') {
              return { value: objVal.raw.length === 0 };
            }
            if (memberName === 'resize' || memberName === 'assign') {
              const count = Math.max(0, Math.trunc(toNumber(evalExpr(expr.args[0]).value, expr.line)));
              const fillVal = expr.args.length > 1 ? evalExpr(expr.args[1]).value : 0;
              if (objVal.isPointerArray) {
                objVal.pointerItems = new Array(count).fill(isHeapNode(fillVal) ? fillVal : null);
                if (objVal.name === 'buckets') {
                  for (let b = 0; b < Math.min(count, 16); b++) {
                    ensureBucketHeader(b, expr.line);
                  }
                }
                return { value: null };
              }
              if (objVal.structItems) {
                const sName = objVal.structItems[0]?.className ?? 'Slot';
                objVal.structItems = [];
                for (let i = 0; i < count; i++) {
                  objVal.structItems.push(instantiateClass(sName, [], expr.line, false));
                }
                if (objVal.name === 'table' || detectedScene === 'hash-table') {
                  createProxiedArray('arr', new Array(Math.min(count, 16)).fill(0), expr.line, true);
                }
                return { value: null };
              }
              const fillNum = toNumber(fillVal, expr.line);
              while (objVal.raw.length < count) {
                objVal.raw.push(fillNum);
              }
              objVal.raw.length = count;
              return { value: null };
            }
            if (memberName === 'clear') {
              objVal.raw.length = 0;
              return { value: null };
            }
            if (memberName === 'push_back') {
              const v = toNumber(evalExpr(expr.args[0]).value, expr.line);
              const idx = objVal.raw.length;
              objVal.proxy[idx] = v;
              return { value: null };
            }
            if (memberName === 'pop_back') {
              if (objVal.raw.length === 0) {
                throw new CppRuntimeError('pop_back() called on empty vector', expr.line);
              }
              const idx = objVal.raw.length - 1;
              objVal.raw.pop();
              emitStepLine(expr.line);
              recordEvent({ t: 'remove', id: `${objVal.id}[${idx}]` }, expr.line);
              return { value: null };
            }
            if (memberName === 'back') {
              if (objVal.raw.length === 0) {
                throw new CppRuntimeError('back() called on empty vector', expr.line);
              }
              return {
                value: objVal.proxy[objVal.raw.length - 1],
                ref: { id: objVal.id, index: objVal.raw.length - 1 },
              };
            }
            if (memberName === 'front') {
              if (objVal.raw.length === 0) {
                throw new CppRuntimeError('front() called on empty vector', expr.line);
              }
              return {
                value: objVal.proxy[0],
                ref: { id: objVal.id, index: 0 },
              };
            }
          }

          // `std::map` / `std::unordered_map` methods
          if (isMapContainer(objVal)) {
            if (memberName === 'size') {
              return { value: objVal.entries.size };
            }
            if (memberName === 'empty') {
              return { value: objVal.entries.size === 0 };
            }
            if (memberName === 'count' || memberName === 'contains') {
              const k = toPrimitive(evalExpr(expr.args[0]).value);
              return { value: objVal.entries.has(k) ? 1 : 0 };
            }
            if (memberName === 'find') {
              const k = toPrimitive(evalExpr(expr.args[0]).value);
              return { value: objVal.entries.has(k) ? 1 : 0 };
            }
            if (memberName === 'end') {
              return { value: 0 };
            }
            if (memberName === 'erase') {
              const k = toPrimitive(evalExpr(expr.args[0]).value);
              const bId = objVal.bucketIds.get(k);
              objVal.entries.delete(k);
              objVal.bucketIds.delete(k);
              if (bId) {
                emitStepLine(expr.line);
                recordEvent({ t: 'remove', id: bId }, expr.line);
              }
              return { value: 1 };
            }
            if (memberName === 'insert') {
              const arg0 = evalExpr(expr.args[0]).value;
              if (isProxiedArray(arg0) && arg0.raw.length >= 2) {
                const k = arg0.raw[0];
                const v = arg0.raw[1];
                objVal.entries.set(k, v);
                detectedScene = detectedScene ?? 'hash-table';
                const bId = `map-${nextNodeSeq++}`;
                objVal.bucketIds.set(k, bId);
                emitStepLine(expr.line);
                recordEvent({ t: 'create', id: bId, kind: 'bucket', value: `${k}:${v}` }, expr.line);
              }
              return { value: null };
            }
          }

          // `std::stack` / `std::queue` / `std::deque` / `std::priority_queue` / `std::list` container methods
          if (isContainer(objVal)) {
            if (memberName === 'empty') {
              return { value: objVal.items.length === 0 };
            }
            if (memberName === 'size') {
              return { value: objVal.items.length };
            }
            if (
              memberName === 'push' ||
              memberName === 'push_back' ||
              memberName === 'push_front'
            ) {
              const val = evalExpr(expr.args[0]).value;
              const isFront = memberName === 'push_front';
              if (isFront) {
                objVal.items.unshift(val);
              } else {
                objVal.items.push(val);
              }

              // Priority queue: maintain heap ordering and mirror to array `'arr'` for 3D heap view
              if (objVal.kind === 'priority_queue' && typeof val === 'number') {
                detectedScene = 'heap';
                objVal.items.sort((a, b) =>
                  objVal.isMinHeap
                    ? Number(a) - Number(b)
                    : Number(b) - Number(a),
                );
                let heapArr = proxiedArrays.get('arr');
                if (!heapArr) {
                  heapArr = createProxiedArray('arr', [], expr.line, false);
                }
                inInternalSwap = true;
                heapArr.raw.length = 0;
                for (const it of objVal.items) {
                  heapArr.raw.push(Number(it));
                }
                inInternalSwap = false;
                emitStepLine(expr.line);
                recordEvent({ t: 'create', id: 'arr', kind: 'array', value: heapArr.raw.length }, expr.line);
                for (let i = 0; i < heapArr.raw.length; i++) {
                  recordEvent(
                    { t: 'set', target: { id: 'arr', index: i }, value: heapArr.raw[i] },
                    expr.line,
                  );
                }
                recordEvent(
                  {
                    t: 'note',
                    text: `Line ${expr.line}: priority_queue.push(${val}) → top is ${heapArr.raw[0]}.`,
                  },
                  expr.line,
                );
                return { value: null };
              }

              if (typeof val === 'number' || typeof val === 'string') {
                const targetScene: PreviewSceneKind =
                  objVal.kind === 'stack'
                    ? 'stack'
                    : objVal.kind === 'list'
                      ? 'linked-list'
                      : 'queue';
                detectedScene = detectedScene ?? targetScene;
                const prefix =
                  objVal.kind === 'stack'
                    ? 'stk'
                    : objVal.kind === 'list'
                      ? 'node'
                      : 'q';
                const id = `${prefix}-${nextNodeSeq++}`;
                emitStepLine(expr.line);
                recordEvent({ t: 'create', id, kind: 'node', value: val }, expr.line);
                if (objVal.visualIds.length > 0) {
                  if (objVal.kind === 'stack') {
                    recordEvent(
                      {
                        t: 'link',
                        from: id,
                        to: objVal.visualIds[objVal.visualIds.length - 1],
                        label: 'below',
                      },
                      expr.line,
                    );
                  } else if (isFront) {
                    recordEvent(
                      {
                        t: 'link',
                        from: id,
                        to: objVal.visualIds[0],
                        label: 'next',
                      },
                      expr.line,
                    );
                  } else {
                    recordEvent(
                      {
                        t: 'link',
                        from: objVal.visualIds[objVal.visualIds.length - 1],
                        to: id,
                        label: 'next',
                      },
                      expr.line,
                    );
                  }
                }
                if (isFront) {
                  objVal.visualIds.unshift(id);
                } else {
                  objVal.visualIds.push(id);
                }
              }
              return { value: null };
            }
            if (
              memberName === 'pop' ||
              memberName === 'pop_back' ||
              memberName === 'pop_front'
            ) {
              if (objVal.items.length === 0) {
                throw new CppRuntimeError(`${memberName}() called on empty ${objVal.kind}`, expr.line);
              }
              if (objVal.kind === 'priority_queue') {
                objVal.items.shift();
                const heapArr = proxiedArrays.get('arr');
                if (heapArr) {
                  inInternalSwap = true;
                  heapArr.raw.shift();
                  inInternalSwap = false;
                  emitStepLine(expr.line);
                  recordEvent({ t: 'create', id: 'arr', kind: 'array', value: heapArr.raw.length }, expr.line);
                  for (let i = 0; i < heapArr.raw.length; i++) {
                    recordEvent(
                      { t: 'set', target: { id: 'arr', index: i }, value: heapArr.raw[i] },
                      expr.line,
                    );
                  }
                }
                return { value: null };
              }
              const removeBack =
                objVal.kind === 'stack' || memberName === 'pop_back';
              if (removeBack) {
                objVal.items.pop();
                const remId = objVal.visualIds.pop();
                if (remId) {
                  emitStepLine(expr.line);
                  recordEvent({ t: 'remove', id: remId }, expr.line);
                }
              } else {
                objVal.items.shift();
                const remId = objVal.visualIds.shift();
                if (remId) {
                  emitStepLine(expr.line);
                  recordEvent({ t: 'remove', id: remId }, expr.line);
                }
              }
              return { value: null };
            }
            if (memberName === 'top' || memberName === 'front' || memberName === 'back') {
              if (objVal.items.length === 0) {
                throw new CppRuntimeError(`${memberName}() called on empty ${objVal.kind}`, expr.line);
              }
              const item =
                objVal.kind === 'stack' || memberName === 'back'
                  ? objVal.items[objVal.items.length - 1]
                  : objVal.items[0];
              return {
                value: item,
                ref: isHeapNode(item) && item.isVisualNode ? { id: item.id } : undefined,
              };
            }
          }

          // User class method call
          if (isHeapNode(objVal)) {
            const cls = classMap.get(objVal.className);
            const method = cls?.methods.find(
              (m) => m.name === memberName && m.params.length === expr.args.length,
            ) ?? cls?.methods.find((m) => m.name === memberName);
            if (!method) {
              throw new CppRuntimeError(
                `Method '${memberName}' not found on class '${objVal.className}'`,
                expr.line,
              );
            }
            return { value: invokeFunction(method, expr.args, objVal, expr.line) };
          }

          throw new CppRuntimeError(`Cannot call method '${memberName}'`, expr.line);
        }

        // 2. Free function or built-in call
        if (expr.callee.kind !== 'Ident') {
          throw new CppRuntimeError('Invalid function call target', expr.line);
        }
        const fnName = expr.callee.name;

        // Built-in `swap(a, b)`
        if (fnName === 'swap') {
          if (expr.args.length !== 2) {
            throw new CppRuntimeError('swap() requires exactly 2 arguments', expr.line);
          }
          const argA = expr.args[0];
          const argB = expr.args[1];

          // Array element swap `swap(arr[i], arr[j])`
          if (argA.kind === 'IndexExpr' && argB.kind === 'IndexExpr') {
            const arrA = evalExpr(argA.array).value;
            const idxA = Math.trunc(toNumber(evalExpr(argA.index).value, expr.line));
            const arrB = evalExpr(argB.array).value;
            const idxB = Math.trunc(toNumber(evalExpr(argB.index).value, expr.line));

            if (isProxiedArray(arrA) && isProxiedArray(arrB)) {
              const valA = arrA.raw[idxA] ?? 0;
              const valB = arrB.raw[idxB] ?? 0;
              if (arrA.id === arrB.id && idxA === idxB) {
                return { value: null };
              }
              inInternalSwap = true;
              arrA.proxy[idxA] = valB;
              arrB.proxy[idxB] = valA;
              inInternalSwap = false;
              hasArrayWrites = true;
              pendingSwapFirstWrite = null;

              emitStepLine(expr.line);
              recordEvent(
                {
                  t: 'swap',
                  a: { id: arrA.id, index: idxA },
                  b: { id: arrB.id, index: idxB },
                },
                expr.line,
              );
              recordEvent(
                {
                  t: 'note',
                  text: `Line ${expr.line}: Swapping ${valA} and ${valB} between ${arrA.id}[${idxA}] and ${arrB.id}[${idxB}].`,
                },
                expr.line,
              );
              return { value: null };
            }
          }

          // Scalar or struct field swap `swap(x, y)`
          const valA = evalExpr(argA).value;
          const valB = evalExpr(argB).value;
          assignToTarget(argA, '=', valB, argB, expr.line);
          assignToTarget(argB, '=', valA, argA, expr.line);
          return { value: null };
        }

        // Standard math & utility functions
        if (fnName === 'max') {
          const a = toNumber(evalExpr(expr.args[0]).value, expr.line);
          const b = toNumber(evalExpr(expr.args[1]).value, expr.line);
          return { value: Math.max(a, b) };
        }
        if (fnName === 'min') {
          const a = toNumber(evalExpr(expr.args[0]).value, expr.line);
          const b = toNumber(evalExpr(expr.args[1]).value, expr.line);
          return { value: Math.min(a, b) };
        }
        if (fnName === 'abs') {
          const a = toNumber(evalExpr(expr.args[0]).value, expr.line);
          return { value: Math.abs(a) };
        }
        if (fnName === 'to_string') {
          const val = evalExpr(expr.args[0]).value;
          return { value: String(toPrimitive(val) ?? '') };
        }
        if (fnName === 'stoi' || fnName === 'stoll') {
          const val = evalExpr(expr.args[0]).value;
          return { value: Number(val) || 0 };
        }
        if (fnName === 'sqrt') {
          const a = toNumber(evalExpr(expr.args[0]).value, expr.line);
          return { value: Math.trunc(Math.sqrt(a)) };
        }
        if (fnName === 'pow') {
          const a = toNumber(evalExpr(expr.args[0]).value, expr.line);
          const b = toNumber(evalExpr(expr.args[1]).value, expr.line);
          return { value: Math.pow(a, b) };
        }
        if (fnName === 'sort') {
          // `sort(vec.begin(), vec.end())` or `sort(arr, arr + n)`
          const firstArg = expr.args[0];
          let targetArr: ProxiedArrayMeta | null = null;
          if (firstArg?.kind === 'CallExpr' && firstArg.callee.kind === 'MemberExpr') {
            const obj = evalExpr(firstArg.callee.object).value;
            if (isProxiedArray(obj)) targetArr = obj;
          } else if (firstArg) {
            const obj = evalExpr(firstArg).value;
            if (isProxiedArray(obj)) targetArr = obj;
          }
          if (targetArr) {
            hasArrayWrites = true;
            targetArr.raw.sort((a, b) => a - b);
            emitStepLine(expr.line);
            for (let i = 0; i < targetArr.raw.length; i++) {
              recordEvent(
                { t: 'set', target: { id: targetArr.id, index: i }, value: targetArr.raw[i] },
                expr.line,
              );
            }
          }
          return { value: null };
        }
        if (fnName === 'reverse') {
          const firstArg = expr.args[0];
          let targetArr: ProxiedArrayMeta | null = null;
          if (firstArg?.kind === 'CallExpr' && firstArg.callee.kind === 'MemberExpr') {
            const obj = evalExpr(firstArg.callee.object).value;
            if (isProxiedArray(obj)) targetArr = obj;
          } else if (firstArg) {
            const obj = evalExpr(firstArg).value;
            if (isProxiedArray(obj)) targetArr = obj;
          }
          if (targetArr) {
            hasArrayWrites = true;
            targetArr.raw.reverse();
            emitStepLine(expr.line);
            for (let i = 0; i < targetArr.raw.length; i++) {
              recordEvent(
                { t: 'set', target: { id: targetArr.id, index: i }, value: targetArr.raw[i] },
                expr.line,
              );
            }
          }
          return { value: null };
        }
        if (fnName === 'printf') {
          for (const a of expr.args) {
            evalExpr(a);
          }
          return { value: 0 };
        }

        // Check if inside a class method calling a sibling method implicitly via `this`
        const currentThis = thisStack[thisStack.length - 1];
        if (currentThis) {
          const cls = classMap.get(currentThis.className);
          const siblingMethod =
            cls?.methods.find((m) => m.name === fnName && m.params.length === expr.args.length) ??
            cls?.methods.find((m) => m.name === fnName);
          if (siblingMethod) {
            return { value: invokeFunction(siblingMethod, expr.args, currentThis, expr.line) };
          }
        }

        // User-defined free function (including Kruskal's `unionSets(u, v)`)
        const userFn = funcMap.get(fnName);
        if (userFn) {
          if (fnName === 'unionSets' && expr.args.length === 2) {
            const uVal = toNumber(evalExpr(expr.args[0]).value, expr.line);
            const vVal = toNumber(evalExpr(expr.args[1]).value, expr.line);
            ensureGraphVertex(uVal, expr.line);
            ensureGraphVertex(vVal, expr.line);
            emitStepLine(expr.line);
            recordEvent({ t: 'link', from: `v-${uVal}`, to: `v-${vVal}`, label: 'MST' }, expr.line);
          }
          return { value: invokeFunction(userFn, expr.args, null, expr.line) };
        }

        // Top-level DSL helper (`push`, `pop`, `enqueue`, `dequeue`, `insertHead`, `insertTail`, `__markOperationStart`, `__hanoiInit`, `__hanoiMove`, etc.)
        if (fnName === '__markOperationStart') {
          recordEvent({ t: 'note', text: '__OP_START__' }, expr.line);
          return { value: null };
        }
        if (fnName === '__hanoiInit') {
          detectedScene = 'stack';
          const diskCount = Math.max(1, Math.min(8, Math.trunc(toNumber(evalExpr(expr.args[0]).value, expr.line))));
          const disks = fallbackArray.slice(0, diskCount).sort((a, b) => b - a);
          while (disks.length < diskCount) {
            disks.push((diskCount - disks.length) * 10);
          }
          emitStepLine(expr.line);
          disks.forEach((v, idx) => {
            const diskNum = diskCount - idx;
            const id = `disk-${diskNum}`;
            recordEvent({ t: 'create', id, kind: 'node', value: v }, expr.line);
            recordEvent({ t: 'link', from: id, to: 'peg-A', label: 'peg' }, expr.line);
          });
          return { value: null };
        }
        if (fnName === '__hanoiMove') {
          detectedScene = 'stack';
          const diskNum = Math.trunc(toNumber(evalExpr(expr.args[0]).value, expr.line));
          const fromRaw = evalExpr(expr.args[1]).value;
          const toRaw = evalExpr(expr.args[2]).value;
          const fromPeg = typeof fromRaw === 'number' ? String.fromCharCode(fromRaw) : String(fromRaw);
          const toPeg = typeof toRaw === 'number' ? String.fromCharCode(toRaw) : String(toRaw);
          const id = `disk-${diskNum}`;
          emitStepLine(expr.line);
          recordEvent({ t: 'visit', id }, expr.line);
          recordEvent({ t: 'unlink', from: id, to: `peg-${fromPeg}` }, expr.line);
          recordEvent({ t: 'link', from: id, to: `peg-${toPeg}`, label: 'peg' }, expr.line);
          recordEvent(
            {
              t: 'note',
              text: `Line ${expr.line}: Move disk ${diskNum} from peg ${fromPeg} to peg ${toPeg}.`,
            },
            expr.line,
          );
          return { value: null };
        }
        const evaluatedArgs = expr.args.map((a) => evalExpr(a).value);
        if (execDslBuiltin(fnName, evaluatedArgs, expr.line)) {
          return { value: null };
        }

        throw new CppRuntimeError(`Call to undefined function '${fnName}'`, expr.line);
      }
    }
  };

  const execStmt = (stmt: CppStmt): void => {
    activeLine = stmt.line;
    checkGuards(stmt.line);

    switch (stmt.kind) {
      case 'EmptyStmt':
        return;

      case 'BlockStmt': {
        scopeStack.push(new Map());
        try {
          for (const s of stmt.body) {
            execStmt(s);
          }
        } finally {
          scopeStack.pop();
        }
        return;
      }

      case 'VarDeclStmt': {
        emitStepLine(stmt.line);
        const curScope = scopeStack[scopeStack.length - 1];
        const eventsBeforeStmt = events.length;
        const initializedScalars: string[] = [];

        for (const decl of stmt.declarations) {
          const { name, typeInfo, init, ctorArgs, line } = decl;

          // 0. 2D Array or `vector<vector<...>>`
          if (
            (typeInfo.arrayDims && typeInfo.arrayDims.length >= 2) ||
            (typeInfo.baseType === 'vector' && typeInfo.templateArg?.startsWith('vector<'))
          ) {
            let rows = 4;
            let cols = 4;
            let initGrid: number[][] | null = null;
            if (init) {
              const initEval = evalExpr(init).value;
              if (isMatrix(initEval)) {
                rows = initEval.rows;
                cols = initEval.cols;
                initGrid = initEval.grid;
              }
            } else if (typeInfo.arrayDims && typeInfo.arrayDims.length >= 2) {
              rows = Math.max(1, Math.trunc(toNumber(evalExpr(typeInfo.arrayDims[0]).value, line)));
              cols = Math.max(1, Math.trunc(toNumber(evalExpr(typeInfo.arrayDims[1]).value, line)));
            } else if (ctorArgs && ctorArgs.length > 0) {
              rows = Math.max(1, Math.trunc(toNumber(evalExpr(ctorArgs[0]).value, line)));
              if (ctorArgs.length > 1) {
                const secondArg = evalExpr(ctorArgs[1]).value;
                if (isProxiedArray(secondArg)) {
                  cols = secondArg.raw.length || 4;
                }
              }
            }
            const mat = createMatrixInstance(name, rows, cols, initGrid, line);
            curScope.set(name, { value: mat, typeInfo });
            continue;
          }

          // 1. Array or `std::vector`
          if (typeInfo.isArray || typeInfo.baseType === 'vector') {
            const elemType = typeInfo.templateArg ?? typeInfo.baseType;
            const isPtrElem = elemType.endsWith('*') || (typeInfo.isArray && typeInfo.isPointer);
            const cleanElemType = elemType.replace(/\*+$/, '').trim();

            if (isPtrElem) {
              const size = typeInfo.arraySizeExpr
                ? Math.max(1, Math.trunc(toNumber(evalExpr(typeInfo.arraySizeExpr).value, line)))
                : 16;
              const ptrArr = createProxiedArray(name, [], line, false, {
                isPointerArray: true,
                pointerCapacity: Math.max(size, 16),
              });
              curScope.set(name, { value: ptrArr, typeInfo });
              continue;
            }

            if (classMap.has(cleanElemType)) {
              const size = typeInfo.arraySizeExpr
                ? Math.max(1, Math.trunc(toNumber(evalExpr(typeInfo.arraySizeExpr).value, line)))
                : 16;
              const structArr = createProxiedArray(name, [], line, false, {
                structTypeName: cleanElemType,
                structCapacity: Math.max(size, 16),
              });
              curScope.set(name, { value: structArr, typeInfo });
              continue;
            }

            if (typeInfo.baseType === 'char' && typeInfo.isArray) {
              let initialChars: number[] = [0];
              if (init) {
                const initVal = evalExpr(init).value;
                if (typeof initVal === 'string') {
                  initialChars = initVal.split('').map((c) => c.charCodeAt(0));
                  initialChars.push(0);
                } else if (isProxiedArray(initVal)) {
                  initialChars = [...initVal.raw, 0];
                }
              }
              const charArr = createProxiedArray(name, initialChars, line, false, {
                isCharBuffer: true,
              });
              curScope.set(name, { value: charArr, typeInfo });
              continue;
            }

            let initialVals: number[] = [];
            let emitInitEvents = true;
            if (init) {
              const initEval = evalExpr(init).value;
              if (isProxiedArray(initEval)) {
                initialVals = [...initEval.raw];
              }
            } else if (ctorArgs && ctorArgs.length > 0) {
              const count = Math.max(0, Math.trunc(toNumber(evalExpr(ctorArgs[0]).value, line)));
              const fill = ctorArgs.length > 1 ? toNumber(evalExpr(ctorArgs[1]).value, line) : 0;
              initialVals = new Array(count).fill(fill);
            } else if (typeInfo.arraySizeExpr) {
              const size = Math.max(
                0,
                Math.trunc(toNumber(evalExpr(typeInfo.arraySizeExpr).value, line)),
              );
              if (size > 24) {
                // Scratch or capacity-allocated buffer (e.g. `int arr[100]` or `int L[100], R[100]`):
                // grow dynamically on actual writes so 100 zero-bars do not clutter the 3D scene.
                initialVals = [];
                emitInitEvents = false;
              } else {
                initialVals = new Array(size).fill(0);
              }
            }

            const arrMeta = createProxiedArray(name, initialVals, line, emitInitEvents);
            curScope.set(name, { value: arrMeta, typeInfo });
            continue;
          }

          // 2. `std::stack`, `std::queue`, `std::deque`, `std::priority_queue`, `std::list`
          if (
            typeInfo.baseType === 'stack' ||
            typeInfo.baseType === 'queue' ||
            typeInfo.baseType === 'deque' ||
            typeInfo.baseType === 'priority_queue' ||
            typeInfo.baseType === 'list'
          ) {
            const isMinHeap = Boolean(
              typeInfo.templateArg && typeInfo.templateArg.includes('greater'),
            );
            const initialItems: CppValue[] = [];
            const visualIds: string[] = [];
            if (init) {
              const initEval = evalExpr(init).value;
              if (isProxiedArray(initEval)) {
                for (const num of initEval.raw) {
                  initialItems.push(num);
                  if (typeInfo.baseType === 'list' || typeInfo.baseType === 'deque') {
                    detectedScene =
                      detectedScene ?? (typeInfo.baseType === 'list' ? 'linked-list' : 'queue');
                    const id = `${typeInfo.baseType === 'list' ? 'node' : 'q'}-${nextNodeSeq++}`;
                    recordEvent({ t: 'create', id, kind: 'node', value: num }, line);
                    if (visualIds.length > 0) {
                      recordEvent(
                        {
                          t: 'link',
                          from: visualIds[visualIds.length - 1],
                          to: id,
                          label: 'next',
                        },
                        line,
                      );
                    }
                    visualIds.push(id);
                  }
                }
              }
            }
            const container: ContainerInstance = {
              __isContainer: true,
              kind: typeInfo.baseType,
              name,
              items: initialItems,
              visualIds,
              isMinHeap,
            };
            containers.set(name, container);
            curScope.set(name, { value: container, typeInfo });
            continue;
          }

          // 2b. `std::map` / `std::unordered_map`
          if (typeInfo.baseType === 'map' || typeInfo.baseType === 'unordered_map') {
            const mapInst: MapContainerInstance = {
              __isMapContainer: true,
              kind: typeInfo.baseType,
              name,
              entries: new Map(),
              bucketIds: new Map(),
            };
            mapContainers.set(name, mapInst);
            detectedScene = detectedScene ?? 'hash-table';
            curScope.set(name, { value: mapInst, typeInfo });
            continue;
          }

          // 3. Value-allocated user class/struct instance (`BinarySearchTree bst;` or `BST t;`)
          if (!typeInfo.isPointer && classMap.has(typeInfo.baseType)) {
            if (init) {
              const initEval = evalExpr(init).value;
              if (isHeapNode(initEval)) {
                const copyInst: HeapNodeInstance = {
                  ...initEval,
                  id: `${initEval.id}-copy-${nextNodeSeq++}`,
                  fields: { ...initEval.fields },
                };
                curScope.set(name, { value: copyInst, typeInfo });
                continue;
              }
            }
            const args = (ctorArgs ?? []).map((a) => evalExpr(a).value);
            const inst = instantiateClass(typeInfo.baseType, args, line, false);
            curScope.set(name, { value: inst, typeInfo });
            continue;
          }

          if (
            !typeInfo.isPointer &&
            typeInfo.baseType === 'BST' &&
            !classMap.has(typeInfo.baseType)
          ) {
            syntheticBstObjects.set(name, { root: null });
            curScope.set(name, { value: null, typeInfo });
            continue;
          }

          // 4. Scalar, `std::string`, or pointer variable
          let initVal: CppValue = typeInfo.isPointer
            ? null
            : typeInfo.baseType === 'string'
              ? ''
              : 0;
          if (init) {
            const rawInit = evalExpr(init).value;
            initVal = isMapElementLValue(rawInit)
              ? rawInit.map.entries.get(rawInit.key) ?? 0
              : rawInit;
            if (init.kind === 'IndexExpr' && lastArrayRead) {
              tempVarProvenance.set(name, { ...lastArrayRead });
            } else {
              initializedScalars.push(`${name} = ${toPrimitive(initVal)}`);
            }
          } else if (ctorArgs && ctorArgs.length > 0 && typeInfo.baseType === 'string') {
            initVal = String(evalExpr(ctorArgs[0]).value ?? '');
            initializedScalars.push(`${name} = "${initVal}"`);
          }
          curScope.set(name, { value: initVal, typeInfo });
        }

        if (
          initializedScalars.length > 0 &&
          events.slice(eventsBeforeStmt).every((e) => e.t !== 'note')
        ) {
          recordEvent(
            {
              t: 'note',
              text: `Line ${stmt.line}: Initialized ${initializedScalars.join(', ')}.`,
            },
            stmt.line,
          );
        }
        return;
      }

      case 'ExprStmt': {
        emitStepLine(stmt.line);
        const eventsBeforeStmt = events.length;
        evalExpr(stmt.expr);
        if (events.slice(eventsBeforeStmt).every((e) => e.t !== 'note')) {
          if (
            stmt.expr.kind === 'AssignExpr' &&
            stmt.expr.target.kind === 'Ident' &&
            !tempVarProvenance.has(stmt.expr.target.name)
          ) {
            const varName = stmt.expr.target.name;
            const cell = lookupVarCell(varName);
            if (cell) {
              recordEvent(
                {
                  t: 'note',
                  text: `Line ${stmt.line}: Updated ${varName} = ${toPrimitive(cell.value)}.`,
                },
                stmt.line,
              );
            }
          } else if (
            stmt.expr.kind === 'UnaryExpr' &&
            (stmt.expr.op === '++' || stmt.expr.op === '--') &&
            stmt.expr.expr.kind === 'Ident'
          ) {
            const varName = stmt.expr.expr.name;
            const cell = lookupVarCell(varName);
            if (cell) {
              recordEvent(
                {
                  t: 'note',
                  text: `Line ${stmt.line}: ${varName}${stmt.expr.op} → ${varName} = ${toPrimitive(cell.value)}.`,
                },
                stmt.line,
              );
            }
          }
        }
        return;
      }

      case 'IfStmt': {
        emitStepLine(stmt.line);
        const eventsBeforeTest = events.length;
        const cond = toBool(evalExpr(stmt.test).value);
        if (events.slice(eventsBeforeTest).every((e) => e.t !== 'note')) {
          const lineText = (codeLines[stmt.line - 1] ?? '').trim();
          recordEvent(
            {
              t: 'note',
              text: `Line ${stmt.line}: Checked condition (${lineText}) → ${cond ? 'true' : 'false'}.`,
            },
            stmt.line,
          );
        }
        if (cond) {
          execStmt(stmt.consequent);
        } else if (stmt.alternate) {
          execStmt(stmt.alternate);
        }
        return;
      }

      case 'WhileStmt': {
        for (; ;) {
          emitStepLine(stmt.line);
          const eventsBeforeTest = events.length;
          const cond = toBool(evalExpr(stmt.test).value);
          if (!cond) {
            if (events.slice(eventsBeforeTest).every((e) => e.t !== 'note')) {
              const lineText = (codeLines[stmt.line - 1] ?? '').trim();
              recordEvent(
                {
                  t: 'note',
                  text: `Line ${stmt.line}: Loop condition (${lineText}) is false — exiting loop.`,
                },
                stmt.line,
              );
            }
            break;
          }
          try {
            execStmt(stmt.body);
          } catch (sig) {
            if (sig instanceof BreakSignal) break;
            if (sig instanceof ContinueSignal) continue;
            throw sig;
          }
        }
        return;
      }

      case 'DoWhileStmt': {
        do {
          try {
            execStmt(stmt.body);
          } catch (sig) {
            if (sig instanceof BreakSignal) break;
            if (sig instanceof ContinueSignal) {
              // continue to test
            } else {
              throw sig;
            }
          }
          emitStepLine(stmt.test.line);
        } while (toBool(evalExpr(stmt.test).value));
        return;
      }

      case 'ForStmt': {
        scopeStack.push(new Map());
        try {
          const eventsBeforeInit = events.length;
          if (stmt.init) {
            execStmt(stmt.init);
          }
          for (; ;) {
            emitStepLine(stmt.line);
            const eventsBeforeTest = events.length;
            const cond = stmt.test ? toBool(evalExpr(stmt.test).value) : true;
            if (events.slice(eventsBeforeInit).every((e) => e.t !== 'note') || events.slice(eventsBeforeTest).every((e) => e.t !== 'note')) {
              const loopScope = scopeStack[scopeStack.length - 1];
              const loopVars: string[] = [];
              for (const [k, cell] of loopScope.entries()) {
                if (typeof cell.value === 'number') {
                  loopVars.push(`${k} = ${cell.value}`);
                }
              }
              const varSummary = loopVars.length > 0 ? ` (${loopVars.join(', ')})` : '';
              recordEvent(
                {
                  t: 'note',
                  text: cond
                    ? `Line ${stmt.line}: Entering for-loop iteration${varSummary}.`
                    : `Line ${stmt.line}: For-loop condition false${varSummary} — loop complete.`,
                },
                stmt.line,
              );
            }
            if (!cond) {
              break;
            }
            try {
              execStmt(stmt.body);
            } catch (sig) {
              if (sig instanceof BreakSignal) break;
              if (sig instanceof ContinueSignal) {
                // proceed to update
              } else {
                throw sig;
              }
            }
            if (stmt.update) {
              emitStepLine(stmt.update.line);
              evalExpr(stmt.update);
            }
          }
        } finally {
          scopeStack.pop();
        }
        return;
      }

      case 'ForRangeStmt': {
        const iterVal = evalExpr(stmt.iterable).value;
        scopeStack.push(new Map());
        try {
          const loopScope = scopeStack[scopeStack.length - 1];
          if (isProxiedArray(iterVal)) {
            for (let i = 0; i < iterVal.raw.length; i++) {
              emitStepLine(stmt.line);
              const elem = iterVal.proxy[i];
              loopScope.set(stmt.varName, { value: elem, typeInfo: stmt.typeInfo });
              recordEvent(
                {
                  t: 'note',
                  text: `Line ${stmt.line}: Range-for iteration ${i}: ${stmt.varName} = ${toPrimitive(elem)}.`,
                },
                stmt.line,
              );
              try {
                execStmt(stmt.body);
              } catch (sig) {
                if (sig instanceof BreakSignal) break;
                if (sig instanceof ContinueSignal) continue;
                throw sig;
              }
            }
          } else if (isContainer(iterVal)) {
            for (let i = 0; i < iterVal.items.length; i++) {
              emitStepLine(stmt.line);
              const elem = iterVal.items[i];
              loopScope.set(stmt.varName, { value: elem, typeInfo: stmt.typeInfo });
              try {
                execStmt(stmt.body);
              } catch (sig) {
                if (sig instanceof BreakSignal) break;
                if (sig instanceof ContinueSignal) continue;
                throw sig;
              }
            }
          } else if (isMapContainer(iterVal)) {
            let idx = 0;
            for (const [k, v] of iterVal.entries.entries()) {
              emitStepLine(stmt.line);
              if (stmt.secondVarName) {
                loopScope.set(stmt.varName, { value: k });
                loopScope.set(stmt.secondVarName, { value: v });
              } else {
                const pairObj: HeapNodeInstance = {
                  __isHeapNode: true,
                  id: `pair-${idx++}`,
                  className: 'pair',
                  isVisualNode: false,
                  fields: { first: k, second: v },
                };
                loopScope.set(stmt.varName, { value: pairObj });
              }
              try {
                execStmt(stmt.body);
              } catch (sig) {
                if (sig instanceof BreakSignal) break;
                if (sig instanceof ContinueSignal) continue;
                throw sig;
              }
            }
          } else if (typeof iterVal === 'string') {
            for (let i = 0; i < iterVal.length; i++) {
              emitStepLine(stmt.line);
              loopScope.set(stmt.varName, {
                value: iterVal.charCodeAt(i),
                typeInfo: stmt.typeInfo,
              });
              try {
                execStmt(stmt.body);
              } catch (sig) {
                if (sig instanceof BreakSignal) break;
                if (sig instanceof ContinueSignal) continue;
                throw sig;
              }
            }
          } else {
            throw new CppRuntimeError(
              'Range-based for loop requires an array, vector, string, list, or map',
              stmt.line,
            );
          }
        } finally {
          scopeStack.pop();
        }
        return;
      }

      case 'SwitchStmt': {
        emitStepLine(stmt.line);
        const discVal = toPrimitive(evalExpr(stmt.discriminant).value);
        let matchedIdx = -1;
        let defaultIdx = -1;
        for (let i = 0; i < stmt.cases.length; i++) {
          const c = stmt.cases[i];
          if (c.test === null) {
            defaultIdx = i;
          } else {
            const cVal = toPrimitive(evalExpr(c.test).value);
            if (cVal === discVal) {
              matchedIdx = i;
              break;
            }
          }
        }
        const startIdx = matchedIdx !== -1 ? matchedIdx : defaultIdx;
        if (startIdx !== -1) {
          scopeStack.push(new Map());
          try {
            for (let i = startIdx; i < stmt.cases.length; i++) {
              for (const s of stmt.cases[i].body) {
                execStmt(s);
              }
            }
          } catch (sig) {
            if (!(sig instanceof BreakSignal)) {
              throw sig;
            }
          } finally {
            scopeStack.pop();
          }
        }
        return;
      }

      case 'ThrowStmt': {
        emitStepLine(stmt.line);
        const errVal = stmt.expr ? evalExpr(stmt.expr).value : 'Exception thrown';
        throw new CppRuntimeError(String(toPrimitive(errVal) ?? 'Exception thrown'), stmt.line);
      }

      case 'ReturnStmt': {
        emitStepLine(stmt.line);
        const rawVal = stmt.value ? evalExpr(stmt.value).value : null;
        const val = isMapElementLValue(rawVal)
          ? rawVal.map.entries.get(rawVal.key) ?? 0
          : rawVal;
        const retLine = stmt.value?.line ?? stmt.line;
        emitStepLine(retLine);
        recordEvent(
          {
            t: 'note',
            text:
              val !== null
                ? `Line ${retLine}: return ${toPrimitive(val)};`
                : `Line ${retLine}: return;`,
          },
          retLine,
        );
        throw new ReturnSignal(val);
      }

      case 'BreakStmt': {
        emitStepLine(stmt.line);
        recordEvent({ t: 'note', text: `Line ${stmt.line}: break — exiting loop.` }, stmt.line);
        throw new BreakSignal();
      }

      case 'ContinueStmt': {
        emitStepLine(stmt.line);
        throw new ContinueSignal();
      }

      case 'DeleteStmt': {
        emitStepLine(stmt.line);
        const targetVal = evalExpr(stmt.target).value;
        if (isHeapNode(targetVal) && targetVal.isVisualNode) {
          recordEvent({ t: 'remove', id: targetVal.id }, stmt.line);
          recordEvent(
            {
              t: 'note',
              text: `Line ${stmt.line}: Freed node ${targetVal.id} (${getHeapNodeValue(targetVal)}).`,
            },
            stmt.line,
          );
          heapNodes.delete(targetVal.id);
        }
        return;
      }
    }
  };

  try {
    // 1. Execute top-level statements (global variables or script-style statements)
    for (const stmt of program.topLevelStatements) {
      execStmt(stmt);
    }

    // 2. If `main()` is defined, invoke it; otherwise if a single non-main function is defined
    //    (e.g. a standalone sorting/array function with or without a top-level array), invoke it!
    const mainFn = funcMap.get('main');
    if (mainFn) {
      invokeFunction(mainFn, [], null, mainFn.line);
    } else if (
      program.functions.length > 0 &&
      program.topLevelStatements.every((s) => s.kind === 'VarDeclStmt' || s.kind === 'EmptyStmt')
    ) {
      const entryFn = program.functions[program.functions.length - 1];
      let arrMeta = primaryArrayId ? proxiedArrays.get(primaryArrayId) : undefined;
      if (!arrMeta) {
        arrMeta = createProxiedArray('arr', fallbackArray, entryFn.line);
      }
      // Synthesize arguments based on parameter count (`(arr, n)` or `(arr, 0, n - 1)`)
      const synthArgs: CppExpr[] = [];
      const globalScope = scopeStack[0];
      const tempArrVar = '__entry_arr__';
      globalScope.set(tempArrVar, { value: arrMeta });

      if (entryFn.params.length === 1) {
        synthArgs.push({ kind: 'Ident', name: tempArrVar, line: entryFn.line });
      } else if (entryFn.params.length === 2) {
        synthArgs.push({ kind: 'Ident', name: tempArrVar, line: entryFn.line });
        synthArgs.push({ kind: 'NumberLit', value: arrMeta.raw.length, line: entryFn.line });
      } else if (entryFn.params.length >= 3) {
        synthArgs.push({ kind: 'Ident', name: tempArrVar, line: entryFn.line });
        synthArgs.push({ kind: 'NumberLit', value: 0, line: entryFn.line });
        synthArgs.push({
          kind: 'NumberLit',
          value: Math.max(0, arrMeta.raw.length - 1),
          line: entryFn.line,
        });
      }
      invokeFunction(entryFn, synthArgs, null, entryFn.line);
    }
  } catch (err) {
    if (err instanceof TruncationSignal) {
      recordEvent({ t: 'truncated', reason: err.reason }, activeLine);
      recordEvent({ t: 'note', text: err.reason }, activeLine);
    } else {
      throw err;
    }
  }

  // Flush any remaining cout buffer into lines
  if (coutStream.buffer.length > 0) {
    const remStr = coutStream.buffer.join(' ');
    coutStream.lines.push(remStr);
    coutStream.buffer.length = 0;
    recordEvent({ t: 'note', text: `Output: ${remStr}` }, activeLine);
  }

  const finalScene: PreviewSceneKind = (detectedScene as PreviewSceneKind | null) ?? 'array';
  let finalExtractedArray: number[] = [...fallbackArray];

  if (
    (finalScene === 'array' || finalScene === 'heap' || finalScene === 'hash-table') &&
    primaryArrayId &&
    proxiedArrays.has(primaryArrayId)
  ) {
    const primaryArr = proxiedArrays.get(primaryArrayId)!;
    const effectiveLen =
      primaryArrayLogicalLength !== null
        ? Math.min(primaryArr.raw.length, primaryArrayLogicalLength)
        : primaryArr.raw.length;
    if (primaryArr.raw.length > effectiveLen) {
      for (let i = primaryArr.raw.length - 1; i >= effectiveLen; i--) {
        recordEvent({ t: 'remove', id: `${primaryArr.id}[${i}]` }, activeLine);
      }
      primaryArr.raw.length = effectiveLen;
    }
    finalExtractedArray = primaryArr.raw.slice(0, effectiveLen);
    if (finalScene === 'array' && hasArrayWrites) {
      for (let i = 0; i < effectiveLen; i++) {
        recordEvent({ t: 'visit', id: `${primaryArr.id}[${i}]` }, activeLine);
      }
    }
    recordEvent(
      {
        t: 'note',
        text: `C++ execution complete! Final array: [${finalExtractedArray.join(', ')}].`,
      },
      activeLine,
    );
  } else if (finalScene === 'stack' && dslStack.length > 0) {
    finalExtractedArray = dslStack.map((s) => s.val);
  } else if (finalScene === 'queue' && dslQueue.length > 0) {
    finalExtractedArray = dslQueue.map((q) => q.val);
  } else if (finalScene === 'linked-list') {
    if (dslList.length > 0) {
      finalExtractedArray = dslList.map((n) => n.val);
    } else if (heapNodes.size > 0) {
      // Follow head -> next chain so front insertions (`insertBeginning`) appear at index 0
      const headCell = lookupVarCell('head') ?? lookupVarCell('list1');
      if (headCell && isHeapNode(headCell.value)) {
        const chainVals: number[] = [];
        const seen = new Set<string>();
        let cur: HeapNodeInstance | null = headCell.value;
        while (cur && !seen.has(cur.id)) {
          seen.add(cur.id);
          const v = Number(getHeapNodeValue(cur));
          if (Number.isFinite(v)) chainVals.push(v);
          const nxt: CppValue = cur.fields.next;
          cur = isHeapNode(nxt) ? nxt : null;
        }
        if (chainVals.length > 0) {
          finalExtractedArray = chainVals;
        }
      } else {
        finalExtractedArray = [...heapNodes.values()]
          .map((n) => Number(getHeapNodeValue(n)))
          .filter((n) => Number.isFinite(n));
      }
    }
  } else if (finalScene === 'bst' && heapNodes.size > 0) {
    finalExtractedArray = [...heapNodes.values()]
      .map((n) => Number(getHeapNodeValue(n)))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);
  }

  recordEvent({ t: 'done' }, activeLine);

  // Compact and deduplicate events so each statement/operation produces a single clean playback step
  // and no two adjacent steps have identical line and identical state (satisfying A2).
  const compactedEvents: TraceEvent[] = [];
  const compactedSteps: InstrumentedStepRecord[] = [];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const nextEv = events[i + 1];
    // If this is a bare `line` marker and the next event is already on the exact same line,
    // skip the bare `line` marker so the statement's real event represents that line step.
    if (ev.t === 'line' && nextEv && nextEv.line === ev.line) {
      continue;
    }
    compactedEvents.push(ev);
    if (steps[i]) {
      compactedSteps.push(steps[i]);
    }
  }

  const dedupedEvents: TraceEvent[] = [];
  const dedupedSteps: InstrumentedStepRecord[] = [];
  let prevSig = '';
  for (let i = 0; i < compactedEvents.length; i++) {
    const ev = compactedEvents[i];
    const sig = JSON.stringify({
      t: ev.t,
      line: ev.line,
      id: 'id' in ev ? ev.id : undefined,
      target: 'target' in ev ? ev.target : undefined,
      value: 'value' in ev ? ev.value : undefined,
      a: 'a' in ev ? ev.a : undefined,
      b: 'b' in ev ? ev.b : undefined,
      from: 'from' in ev ? ev.from : undefined,
      to: 'to' in ev ? ev.to : undefined,
      text: 'text' in ev ? ev.text : undefined,
      fn: 'fn' in ev ? ev.fn : undefined,
      scalars: ev.scalars,
    });
    if (sig === prevSig && ev.t !== 'done') {
      continue;
    }
    prevSig = sig;
    dedupedEvents.push(ev);
    if (compactedSteps[i]) {
      dedupedSteps.push(compactedSteps[i]);
    }
  }

  const finalCoutOutput =
    coutStream.rawText.trim() || coutStream.lines.join('\n').trim();

  return {
    scene: finalScene,
    events: dedupedEvents,
    steps: dedupedSteps,
    extractedArray: finalExtractedArray,
    coutOutput: finalCoutOutput,
    hasArrayWrites,
    truncatedReason,
    meta: {
      id: 'bubble-sort',
      title: fileName ? `${fileName} (Live C++ Trace)` : 'Custom C++ Code (Live 3D Trace)',
      category:
        finalScene === 'array'
          ? hasArrayWrites
            ? 'sorting'
            : 'operation'
          : 'operation',
      timeComplexity: 'Live Trace',
      spaceComplexity: 'Live Trace',
      code: codeLines,
    },
  };
}
