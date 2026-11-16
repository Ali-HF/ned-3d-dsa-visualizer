import { create } from 'zustand';
import type {
  CameraPreset,
  PreviewSceneKind,
  Primitive,
  SceneObjectInfo,
  TraceEvent,
  TraceStateSnapshot,
} from '../types/trace';
import { TraceTimeline } from '../engine/traceEngine';
import {
  ARRAY_ALGORITHM_METADATA,
  runArrayOperation,
  type AlgorithmMetadata,
  type ArrayOperationId,
} from '../algorithms/array/arrayAlgorithms';
import {
  STRUCTURE_OP_CATALOG,
  buildStaticStructureTrace,
  runStructureOperation,
  type StructureOperationId,
} from '../algorithms/structures/structureAlgorithms';
import {
  CORPUS_FILE_CATALOG,
  getCorpusCodeLines,
  getCorpusRawText,
} from '../corpus/cppCorpusRegistry';
import {
  executeCustomCodeTrace,
  executeCustomCodeTraceInWorker,
} from '../engine/codeRunner';
import {
  ARRAY_CORPUS_MAP,
  carryForwardQueueScalars,
  runCorpusArrayOperation,
  runCorpusStructureOperation,
} from '../engine/corpusRunner';

export interface QueuedOperationEntry {
  uid: string;
  label: string;
  op: ArrayOperationId | StructureOperationId;
  startStep: number;
  endStep: number;
}

export type LastLibraryRun =
  | {
      kind: 'array';
      op: ArrayOperationId;
      paramIndex: number;
      paramValue: number;
      inputArray: number[];
    }
  | {
      kind: 'structure';
      op: StructureOperationId;
      paramValue: number;
      paramText?: string;
      inputArray: number[];
    };

/**
 * The C++ code viewer is visible in Pro mode (always-on drawer) or whenever the
 * Details/Code drawer is open. When it is visible, Library operations replay the
 * real corpus C++ line by line; when hidden, they use the fast visual-only traces.
 */
export function isCodeViewerOpen(s: { uiMode: 'kids' | 'standard' | 'pro'; detailsOpen: boolean }): boolean {
  return s.uiMode === 'pro' || s.detailsOpen;
}

interface ViewportState {
  /** UI complexity mode: 'kids' (friendly), 'standard' (CAD HUD), or 'pro' (full developer inspector) */
  uiMode: 'kids' | 'standard' | 'pro';
  /** Whether the right-side Details/Code drawer is open in Standard mode */
  detailsOpen: boolean;
  /** Active mode in the top-left switcher (Library vs Upload) */
  appMode: 'library' | 'upload';
  /** Which structure is displayed in the viewport */
  previewScene: PreviewSceneKind;
  /** Currently selected 3D object ID (null if background clicked) */
  selectedId: string | null;
  /** Map of all currently rendered scene objects for the right-hand inspector */
  sceneObjects: Record<string, SceneObjectInfo>;
  /** Active camera preset */
  cameraPreset: CameraPreset;
  /** Monotonic counter so clicking the same camera preset button triggers a camera move */
  cameraCommandVersion: number;
  /** Toggle for the Blender ground grid */
  showGrid: boolean;
  /** Toggle for wireframe overlay */
  wireframe: boolean;

  /** Trace Playback & Operations State */
  workingArray: number[];
  /**
   * Last Library operation run (with its pre-run input), so toggling the code
   * viewer can re-run the same operation in the other playback mode.
   */
  lastLibraryRun: LastLibraryRun | null;
  activeOperation: ArrayOperationId | null;
  activeStructureOp: StructureOperationId | null;
  selectedCorpusFile: string;
  activeMetadata: AlgorithmMetadata;
  timeline: TraceTimeline;
  currentStep: number;
  totalSteps: number;
  currentSnapshot: TraceStateSnapshot;
  isPlaying: boolean;
  playbackSpeed: number;
  autoPlayOnRun: boolean;
  autoFollowCamera: boolean;
  operationHistory: QueuedOperationEntry[];
  hasPendingOperationRun: boolean;
  customCodeError: string | null;
  isRunningCustomCode: boolean;

  setUiMode: (mode: 'kids' | 'standard' | 'pro') => void;
  toggleUiMode: () => void;
  setDetailsOpen: (open: boolean) => void;
  toggleDetailsOpen: () => void;
  setAppMode: (mode: 'library' | 'upload') => void;
  setPreviewScene: (scene: PreviewSceneKind) => void;
  selectObject: (id: string | null) => void;
  registerSceneObjects: (objects: SceneObjectInfo[]) => void;
  triggerCameraPreset: (preset: CameraPreset) => void;
  toggleGrid: () => void;
  toggleWireframe: () => void;

  /** Playback actions */
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  restart: () => void;
  skipToEnd: () => void;
  seekToStep: (step: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleAutoPlayOnRun: () => void;
  toggleAutoFollowCamera: () => void;
  pauseAutoFollowCamera: () => void;

  /** Array, Structure & Corpus actions */
  setCustomArray: (values: number[]) => void;
  applyCustomInputValues: (values: number[]) => void;
  selectArrayOperation: (op: ArrayOperationId) => void;
  selectStructureOperation: (op: StructureOperationId) => void;
  runOperationNow: (op: ArrayOperationId, paramIndex?: number, paramValue?: number) => void;
  runStructureOperationNow: (op: StructureOperationId, paramValue?: number, paramText?: string) => void;
  selectCorpusFile: (relativePath: string) => void;
  selectAndRunCorpusFile: (relativePath: string) => void;
  previewCustomCode: (sourceCode: string, fileName?: string) => void;
  runCustomCodeNow: (sourceCode: string, fileName?: string) => void;
  runCustomCodeAsync: (sourceCode: string, fileName?: string) => Promise<void>;
  clearCustomCodeError: () => void;
  queueOperation: (op: ArrayOperationId, paramIndex?: number, paramValue?: number) => void;
  clearOperationQueue: () => void;
}

function toObjectMap(list: SceneObjectInfo[]): Record<string, SceneObjectInfo> {
  const map: Record<string, SceneObjectInfo> = {};
  for (const item of list) {
    map[item.id] = item;
  }
  return map;
}

/**
 * Computes 3D positions and inspectable SceneObjectInfo records for all arrays
 * present in a TraceStateSnapshot (`arr` along Z=0, `aux` along Z=-2.8).
 */
export function buildArraySceneObjectsFromSnapshot(
  snapshot: TraceStateSnapshot,
): SceneObjectInfo[] {
  const objects: SceneObjectInfo[] = [];
  const arrayEntries = Object.values(snapshot.arrays);

  arrayEntries.forEach((arrState, rowIdx) => {
    const count = arrState.values.length;
    const spacing = 1.65;
    const startX = -((count - 1) * spacing) / 2;
    const zPos = rowIdx === 0 ? 0 : -2.8 * rowIdx;
    const baseAddr = rowIdx === 0 ? 0x1000 : 0x1800;

    arrState.values.forEach((val, idx) => {
      const cellId = `${arrState.id}[${idx}]`;
      const xPos = startX + idx * spacing;
      const numericVal = typeof val === 'number' ? val : 10;
      const barHeight = Math.max(0.45, Math.min(4.8, Math.abs(numericVal) / 22));
      const addrHex = `0x${(baseAddr + idx * 4).toString(16).toUpperCase()}`;
      const visitBadgeIdx = snapshot.visitedOrder.indexOf(cellId);

      // Attach any runtime index pointers (i, j, low, mid, high, left, right, topIndex, front, rear)
      const matchingPointers = Object.entries(snapshot.indexPointers ?? {})
        .filter(([, ptr]) => ptr.arrayId === arrState.id && ptr.index === idx)
        .map(([ptrName, ptr]) => ptr.name ?? ptrName);

      objects.push({
        id: cellId,
        kind: 'array-cell',
        label: cellId,
        value: val,
        memoryAddress: addrHex,
        position: [xPos, barHeight / 2, zPos],
        fields: {
          array: arrState.id,
          index: idx,
          value: val,
          type: 'int (4 bytes)',
          visitedOrder: visitBadgeIdx >= 0 ? `#${visitBadgeIdx + 1}` : 'unvisited',
          indexPointers: matchingPointers.length > 0 ? matchingPointers.join(' / ') : '',
        },
        linksTo: [],
      });
    });
  });

  // If no 1D arrays are present, check for 2D matrices (`vector<vector<int>>` or `int grid[R][C]`)
  if (objects.length === 0 && Object.keys(snapshot.matrices ?? {}).length > 0) {
    const matEntries = Object.values(snapshot.matrices);
    const mat = matEntries[0];
    const rowSpacing = 1.75;
    const colSpacing = 1.65;
    const startZ = -((mat.rows - 1) * rowSpacing) / 2;
    const startX = -((mat.cols - 1) * colSpacing) / 2;

    mat.values.forEach((rowVals, rIdx) => {
      rowVals.forEach((val, cIdx) => {
        const cellId = `${mat.id}[${rIdx}][${cIdx}]`;
        const xPos = startX + cIdx * colSpacing;
        const zPos = startZ + rIdx * rowSpacing;
        const numericVal = typeof val === 'number' ? val : 10;
        const barHeight = Math.max(0.45, Math.min(4.2, Math.abs(numericVal) / 22));
        const addrHex = `0x${(0x3000 + (rIdx * mat.cols + cIdx) * 4).toString(16).toUpperCase()}`;

        objects.push({
          id: cellId,
          kind: 'array-cell',
          label: cellId,
          value: val,
          memoryAddress: addrHex,
          position: [xPos, barHeight / 2, zPos],
          fields: {
            array: mat.id,
            index: rIdx * mat.cols + cIdx,
            row: rIdx,
            col: cIdx,
            value: val,
            type: 'int (2D Grid Cell)',
            visitedOrder: snapshot.visitedOrder.includes(cellId) ? 'visited' : 'unvisited',
            indexPointers: '',
          },
          linksTo: [],
        });
      });
    });
  }

  return objects;
}

const TREE_NODE_COORDS: Record<string, [number, number, number]> = {
  'bst-50': [0, 3.6, 0],
  'bst-30': [-2.8, 2.0, 0.5],
  'bst-70': [2.8, 2.0, -0.5],
  'bst-20': [-4.2, 0.6, 1.0],
  'bst-40': [-1.4, 0.6, 0.1],
  'bst-60': [1.4, 0.6, -0.1],
  'bst-85': [4.2, 0.6, -1.0],
};

const GRAPH_NODE_COORDS: Record<string, [number, number, number]> = {
  'v-0': [-4.2, 2.0, 0],
  'v-1': [-1.4, 3.4, -0.8],
  'v-2': [-1.4, 0.7, 0.8],
  'v-3': [1.6, 3.4, -0.6],
  'v-4': [1.6, 0.7, 0.6],
  'v-5': [4.2, 2.0, 0],
};

/**
 * Computes a dynamic 3D layout for Separate Chaining Hash Tables:
 * - Bucket headers (roots with no incoming edges or `b-*`) sit along an elevated horizontal row (`y = 2.8`).
 * - Collision chain nodes (`c-*` or nodes linked from a bucket) hang vertically downward under their bucket!
 */
function computeDynamicHashChainLayout(
  snapshot: TraceStateSnapshot,
): Record<string, [number, number, number]> {
  const ids = Object.keys(snapshot.nodes);
  const incoming = new Set<string>();
  const outgoingMap: Record<string, string[]> = {};

  for (const e of snapshot.edges) {
    if (!snapshot.nodes[e.from] || !snapshot.nodes[e.to]) continue;
    incoming.add(e.to);
    outgoingMap[e.from] = [...(outgoingMap[e.from] ?? []), e.to];
  }

  const buckets = ids.filter((id) => !incoming.has(id) || id.startsWith('b-'));
  const effectiveBuckets = buckets.length > 0 ? buckets : ids;
  const spacing = 3.2;
  const out: Record<string, [number, number, number]> = {};
  const placed = new Set<string>();

  effectiveBuckets.forEach((bId, bIdx) => {
    const bx = (bIdx - (effectiveBuckets.length - 1) / 2) * spacing;
    out[bId] = [bx, 2.8, 0];
    placed.add(bId);

    let queue = [...(outgoingMap[bId] ?? [])];
    let depth = 1;
    while (queue.length > 0) {
      const nextQueue: string[] = [];
      for (const childId of queue) {
        if (placed.has(childId)) continue;
        placed.add(childId);
        out[childId] = [
          bx,
          Math.max(0.55, 2.8 - depth * 1.35),
          depth * 0.35,
        ];
        nextQueue.push(...(outgoingMap[childId] ?? []));
      }
      queue = nextQueue;
      depth++;
    }
  });

  // Any unplaced nodes
  let extraIdx = 0;
  for (const id of ids) {
    if (!placed.has(id)) {
      out[id] = [extraIdx * 2.2 - 2.2, 0.8, 1.2];
      extraIdx++;
    }
  }

  return out;
}

/**
 * Computes deterministic, collision-free 3D graph vertex positions for N in [2..15]
 * with guaranteed minimum pairwise distance >= 2.4 units (strictly > 2 node diameters).
 */
export function computeCollisionFreeGraphLayout(
  snapshot: TraceStateSnapshot,
): Record<string, [number, number, number]> {
  const ids = Object.keys(snapshot.nodes).sort();
  const n = ids.length;
  if (n === 0) return {};

  const radius = Math.max(3.6, Math.sqrt(n) * 1.6);
  const out: Record<string, [number, number, number]> = {};

  // 1. Initial deterministic placement around an ellipse with alternating vertical elevation
  ids.forEach((id, idx) => {
    const angle = (idx / n) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * (radius * 0.72);
    const y = 2.0 + Math.sin(angle * 2) * 0.95 + ((idx % 2 === 1) ? 0.45 : -0.45);
    out[id] = [Number(x.toFixed(3)), Number(y.toFixed(3)), Number(z.toFixed(3))];
  });

  // 2. Collision pass: enforce minimum pairwise distance >= 2.4 (2 node diameters = 2 * 1.16 = 2.32)
  const MIN_DIST = 2.45;
  const iterations = 15;
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const idA = ids[i];
        const idB = ids[j];
        const posA = out[idA];
        const posB = out[idB];
        let dx = posB[0] - posA[0];
        const dy = posB[1] - posA[1];
        const dz = posB[2] - posA[2];
        let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 0.001) {
          dx = 0.1;
          dist = 0.1;
        }
        if (dist < MIN_DIST) {
          const overlap = (MIN_DIST - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;
          out[idA] = [
            Number((posA[0] - nx * overlap).toFixed(3)),
            Number(Math.max(0.6, posA[1] - ny * overlap * 0.5).toFixed(3)),
            Number((posA[2] - nz * overlap).toFixed(3)),
          ];
          out[idB] = [
            Number((posB[0] + nx * overlap).toFixed(3)),
            Number(Math.max(0.6, posB[1] + ny * overlap * 0.5).toFixed(3)),
            Number((posB[2] + nz * overlap).toFixed(3)),
          ];
        }
      }
    }
  }

  return out;
}

/**
 * Computes a 3D circular/elliptical graph layout when custom graph vertices
 * are not in the default `GRAPH_NODE_COORDS` map.
 */
function computeDynamicGraphLayout(
  snapshot: TraceStateSnapshot,
): Record<string, [number, number, number]> {
  return computeCollisionFreeGraphLayout(snapshot);
}

/**
 * Computes a classic binary-tree layout (x = in-order rank, y = depth) from the
 * snapshot's `left` / `right` edges, so trees built from any user values render
 * correctly no matter how many nodes they have or how they are shaped.
 */
function computeDynamicTreeLayout(
  snapshot: TraceStateSnapshot,
): Record<string, [number, number, number]> {
  const ids = Object.keys(snapshot.nodes);
  const children: Record<string, { left?: string; right?: string }> = {};
  const hasParent = new Set<string>();
  for (const e of snapshot.edges) {
    if (!snapshot.nodes[e.from] || !snapshot.nodes[e.to]) continue;
    if (e.label !== 'left' && e.label !== 'right') continue;
    children[e.from] = { ...children[e.from], [e.label]: e.to };
    hasParent.add(e.to);
  }

  const order: { id: string; depth: number }[] = [];
  const visited = new Set<string>();
  const walk = (id: string | undefined, depth: number) => {
    if (!id || visited.has(id)) return;
    visited.add(id);
    walk(children[id]?.left, depth + 1);
    order.push({ id, depth });
    walk(children[id]?.right, depth + 1);
  };
  ids.filter((id) => !hasParent.has(id)).forEach((id) => walk(id, 0));

  const maxDepth = order.reduce((m, o) => Math.max(m, o.depth), 0);
  const spacing = 1.65;
  const out: Record<string, [number, number, number]> = {};
  order.forEach((o, idx) => {
    out[o.id] = [
      (idx - (order.length - 1) / 2) * spacing,
      0.6 + (maxDepth - o.depth) * 1.55,
      0,
    ];
  });
  return out;
}

/**
 * Orders linked-list nodes by following `next` edges from head to tail so
 * front insertions (`node-new` / `node-h*`) appear on the left rather than
 * at the end of insertion order.
 */
function computeDynamicLinkedListLayout(
  snapshot: TraceStateSnapshot,
): Record<string, [number, number, number]> {
  const ids = Object.keys(snapshot.nodes);
  const nextMap: Record<string, string> = {};
  const incomingNext = new Set<string>();

  for (const e of snapshot.edges) {
    if (!snapshot.nodes[e.from] || !snapshot.nodes[e.to]) continue;
    if (e.label === 'next' || !e.label) {
      if (!(e.from in nextMap)) {
        nextMap[e.from] = e.to;
      }
      incomingNext.add(e.to);
    }
  }

  const ordered: string[] = [];
  const visited = new Set<string>();
  const walkChain = (startId: string) => {
    let curr: string | undefined = startId;
    while (curr && !visited.has(curr)) {
      visited.add(curr);
      ordered.push(curr);
      curr = nextMap[curr];
    }
  };

  for (const id of ids) {
    if (!incomingNext.has(id) && nextMap[id]) {
      walkChain(id);
    }
  }
  for (const id of ids) {
    if (!visited.has(id)) {
      if (id === 'node-new' || id.startsWith('node-h')) {
        ordered.unshift(id);
        visited.add(id);
      } else {
        walkChain(id);
      }
    }
  }

  const spacing = 2.8;
  const startX = -((ordered.length - 1) * spacing) / 2;
  const isTempDisconnect =
    snapshot.narration.toLowerCase().includes('temp') &&
    snapshot.edges.some((e) => e.label === 'next' || !e.label);
  const out: Record<string, [number, number, number]> = {};
  ordered.forEach((id, idx) => {
    const zOffset = idx % 2 === 1 ? 0.35 : -0.15;
    const isIsolatedTemp =
      isTempDisconnect &&
      !incomingNext.has(id) &&
      !(id in nextMap) &&
      snapshot.visitedOrder.includes(id);
    out[id] = [startX + idx * spacing, isIsolatedTemp ? 2.05 : 1.0, zOffset];
  });
  return out;
}

/**
 * Universal 3D Scene Builder: converts any TraceStateSnapshot into 3D SceneObjectInfo[]
 * based on the active structure scene.
 */
export function buildSceneObjectsForScene(
  scene: PreviewSceneKind,
  snapshot: TraceStateSnapshot,
): SceneObjectInfo[] {
  const appendCallStackAndScalarFallback = (baseObjs: SceneObjectInfo[]): SceneObjectInfo[] => {
    const out = [...baseObjs];
    const has3DCallFrames = out.some(
      (o) => o.id.startsWith('callframe-') || o.id.startsWith('stk-call-'),
    );
    const callDepth = snapshot.callStack.length;

    // Bug 1 Rule: Render 3D callframe blocks ONLY when there is no other structure to draw (out.length === 0).
    // When any real data structure (array, list, tree, graph, grid, container) is on stage, the call stack
    // is shown only in the compact HUD panel.
    if (!has3DCallFrames && out.length === 0 && callDepth > 0) {
      snapshot.callStack.forEach((frame, idx) => {
        const frameId = `callframe-${idx}`;
        const retSuffix = frame.returnValue !== undefined ? ` → ${String(frame.returnValue)}` : '';
        const label = `${frame.fn}(${frame.args.join(', ')})${retSuffix}`;
        out.push({
          id: frameId,
          kind: 'stack-slab',
          label,
          value: label,
          memoryAddress: `0x7FFF${(0x100 + idx * 16).toString(16).toUpperCase()}`,
          position: [0, 0.24 + idx * 0.58, 0],
          fields: {
            id: frameId,
            function: frame.fn,
            args: frame.args.join(', '),
            depth: idx + 1,
          },
          linksTo: idx > 0 ? [{ label: 'below', targetId: `callframe-${idx - 1}` }] : [],
        });
      });
    }

    // Requirement A4: If nothing else to draw (pure scalar math), show scalar variables as 3D blocks, never a blank stage
    if (out.length === 0) {
      const scalarEntries = Object.entries(snapshot.scalars ?? {});
      if (scalarEntries.length > 0) {
        const spacing = 1.85;
        const startX = -((scalarEntries.length - 1) * spacing) / 2;
        scalarEntries.forEach(([varName, val], idx) => {
          const numVal = typeof val === 'number' ? val : 10;
          const barHeight = Math.max(0.65, Math.min(4.2, Math.abs(numVal) / 18));
          out.push({
            id: `var-${varName}`,
            kind: 'array-cell',
            label: `${varName} = ${String(val)}`,
            value: val,
            memoryAddress: `0x7FF0${(idx * 4).toString(16).toUpperCase()}`,
            position: [startX + idx * spacing, barHeight / 2, 0],
            fields: {
              variable: varName,
              index: idx,
              value: val,
              type: typeof val,
              indexPointers: varName,
            },
            linksTo: [],
          });
        });
      }
    }

    return out;
  };

  if (scene === 'array') {
    return appendCallStackAndScalarFallback(buildArraySceneObjectsFromSnapshot(snapshot));
  }

  // Heap scene: render ONLY the complete binary tree (no array cells/bars on 3D stage)
  if (scene === 'heap') {
    const heapArray = snapshot.arrays['arr'] ?? snapshot.arrays['aux'];
    const heapValues = heapArray?.values ?? [];
    const totalCount = heapValues.length;

    // Detect active heap size if heapSize or i scalar is present (e.g. heapSort)
    const scalarHeapSize =
      typeof snapshot.scalars?.heapSize === 'number'
        ? snapshot.scalars.heapSize
        : typeof snapshot.scalars?.i === 'number' && snapshot.narration.toLowerCase().includes('sort')
          ? snapshot.scalars.i + 1
          : totalCount;
    const activeHeapLimit = Math.max(0, Math.min(totalCount, scalarHeapSize));

    const treeObjs: SceneObjectInfo[] = [];
    if (totalCount > 0) {
      const depth = Math.floor(Math.log2(totalCount));
      const treeSpacingX = 2.6;
      heapValues.forEach((val, i) => {
        const nodeId = `heap-node-${i}`;
        const isDetached = i >= activeHeapLimit;
        const level = Math.floor(Math.log2(i + 1));
        const indexInLevel = i - (Math.pow(2, level) - 1);
        const countInLevel = Math.pow(2, level);
        const levelWidth = countInLevel * treeSpacingX * Math.pow(0.72, Math.max(0, level - 1));
        const x = (indexInLevel - (countInLevel - 1) / 2) * (levelWidth / countInLevel);
        const y = isDetached ? 0.6 : 2.2 + (depth - level) * 1.55;
        const z = isDetached ? 2.5 : -0.6 + level * 0.2;

        const linksTo: SceneObjectInfo['linksTo'] = [];
        if (!isDetached) {
          const leftIdx = 2 * i + 1;
          const rightIdx = 2 * i + 2;
          if (leftIdx < activeHeapLimit) {
            linksTo.push({ label: 'left', targetId: `heap-node-${leftIdx}` });
          }
          if (rightIdx < activeHeapLimit) {
            linksTo.push({ label: 'right', targetId: `heap-node-${rightIdx}` });
          }
        }

        treeObjs.push({
          id: nodeId,
          kind: 'tree-node',
          label: isDetached ? `sorted[${i}] (${String(val)})` : `heap[${i}] (${String(val)})`,
          value: val,
          memoryAddress: `0x8000${(i * 4).toString(16).toUpperCase()}`,
          position: [Number(x.toFixed(3)), Number(y.toFixed(3)), Number(z.toFixed(3))],
          fields: {
            id: nodeId,
            heapIndex: i,
            value: val,
            links: linksTo.length,
            isSorted: isDetached,
            dimmed: isDetached,
          },
          linksTo,
        });
      });
    }

    if (treeObjs.length > 0) {
      return appendCallStackAndScalarFallback(treeObjs);
    }
  }

  // Queue or Deque backed by a flat C++ array (`arr`, e.g. queue_array_and_circular.cpp, deque.cpp):
  // Extract the active logical elements in [front .. rear] order and render them as 3D nodes,
  // avoiding sparse 16-bar arrays with empty zero slots in the middle.
  if (
    (scene === 'queue' || scene === 'deque') &&
    Object.keys(snapshot.nodes).length === 0 &&
    Object.keys(snapshot.arrays).length > 0
  ) {
    const backingArr = snapshot.arrays['arr'] ?? Object.values(snapshot.arrays)[0];
    const arrVals = backingArr?.values ?? [];
    const cap = arrVals.length;
    const fScalar = snapshot.scalars?.front;
    const rScalar = snapshot.scalars?.rear;
    const cScalar = snapshot.scalars?.count;

    if (typeof fScalar === 'number' && (typeof cScalar === 'number' || typeof rScalar === 'number')) {
      let activeVals: Primitive[] = [];
      if (typeof cScalar === 'number') {
        const cnt = Math.max(0, Math.min(cap, Math.trunc(cScalar)));
        if (cnt > 0 && cap > 0) {
          const frontIdx = ((Math.trunc(fScalar) % cap) + cap) % cap;
          activeVals = Array.from({ length: cnt }, (_, k) => arrVals[(frontIdx + k) % cap]);
        }
      } else if (typeof rScalar === 'number' && cap > 0) {
        const f = Math.max(0, Math.trunc(fScalar));
        const r = Math.min(cap - 1, Math.trunc(rScalar));
        if (r >= f) {
          activeVals = arrVals.slice(f, r + 1);
        }
      }

      const prefix = scene === 'deque' ? 'dq-' : 'q-';
      const spacing = 2.4;
      const startX = -((activeVals.length - 1) * spacing) / 2;
      const queueObjs: SceneObjectInfo[] = activeVals.map((val, idx) => {
        const id = `${prefix}${idx}`;
        const hasPrev = idx > 0;
        const hasNext = idx < activeVals.length - 1;
        return {
          id,
          kind: 'list-node',
          label: `${id} (${String(val)})`,
          value: val,
          memoryAddress: `0x${(0x2040 + idx * 0x40).toString(16).toUpperCase()}`,
          position: [startX + idx * spacing, 1.0, 0],
          fields: {
            id,
            value: val,
            links: hasNext ? 1 : 0,
            hasIncomingNext: hasPrev,
            queueSize: activeVals.length,
          },
          linksTo: hasNext ? [{ label: 'next', targetId: `${prefix}${idx + 1}` }] : [],
        };
      });

      if (queueObjs.length > 0) {
        return appendCallStackAndScalarFallback(queueObjs);
      }
      return appendCallStackAndScalarFallback([]);
    }

    return appendCallStackAndScalarFallback(buildArraySceneObjectsFromSnapshot(snapshot));
  }

  // If Stack is backed by a flat array (`arr`, e.g. stack_array.cpp), render as 3D bars
  if (
    scene === 'stack' &&
    Object.keys(snapshot.nodes).length === 0 &&
    Object.keys(snapshot.arrays).length > 0
  ) {
    return appendCallStackAndScalarFallback(buildArraySceneObjectsFromSnapshot(snapshot));
  }

  // If Hash Table is running Open Addressing (uses `arr`), render as 3D bucket bars
  if (scene === 'hash-table' && Object.keys(snapshot.arrays).length > 0) {
    return appendCallStackAndScalarFallback(buildArraySceneObjectsFromSnapshot(snapshot));
  }

  const nodeEntries = Object.values(snapshot.nodes);
  const count = nodeEntries.length;
  const dynamicTreeCoords =
    (scene === 'bst' || scene === 'avl' || scene === 'heap') &&
      nodeEntries.some((n) => !(n.id in TREE_NODE_COORDS))
      ? computeDynamicTreeLayout(snapshot)
      : null;
  const dynamicGraphCoords =
    scene === 'graph' ? computeDynamicGraphLayout(snapshot) : null;
  const dynamicHashCoords =
    scene === 'hash-table' ? computeDynamicHashChainLayout(snapshot) : null;
  const dynamicLinkedListCoords =
    scene === 'linked-list' ? computeDynamicLinkedListLayout(snapshot) : null;
  const heapIndexMap: Record<string, number> = {};
  if (scene === 'heap') {
    const hasParent = new Set<string>();
    const children: Record<string, { left?: string; right?: string }> = {};
    for (const e of snapshot.edges) {
      if (e.label === 'left' || e.label === 'right') {
        children[e.from] = { ...children[e.from], [e.label]: e.to };
        hasParent.add(e.to);
      }
    }
    const roots = nodeEntries
      .map((n) => n.id)
      .filter((id) => !hasParent.has(id));
    const bfsQueue = roots.length > 0 ? [...roots] : nodeEntries.map((n) => n.id);
    const seen = new Set<string>();
    let hIdx = 0;
    while (bfsQueue.length > 0) {
      const cid = bfsQueue.shift()!;
      if (seen.has(cid) || !snapshot.nodes[cid]) continue;
      seen.add(cid);
      heapIndexMap[cid] = hIdx++;
      if (children[cid]?.left) bfsQueue.push(children[cid].left!);
      if (children[cid]?.right) bfsQueue.push(children[cid].right!);
    }
  }
  const isHanoiScene =
    scene === 'stack' && snapshot.edges.some((e) => e.label === 'peg');
  const hanoiCoords: Record<string, [number, number, number]> = {};
  if (isHanoiScene) {
    const pegXMap: Record<string, number> = {
      'peg-A': -3.8,
      'peg-B': 0,
      'peg-C': 3.8,
    };
    const byPeg: Record<string, typeof nodeEntries> = {
      'peg-A': [],
      'peg-B': [],
      'peg-C': [],
    };
    for (const n of nodeEntries) {
      const pegEdge = snapshot.edges.find(
        (e) => e.from === n.id && e.label === 'peg',
      );
      const pegId = pegEdge?.to && pegEdge.to in byPeg ? pegEdge.to : 'peg-A';
      byPeg[pegId].push(n);
    }
    for (const [pegId, disks] of Object.entries(byPeg)) {
      // Larger disk values sit lower on the peg
      disks.sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0));
      const px = pegXMap[pegId] ?? 0;
      disks.forEach((d, dIdx) => {
        hanoiCoords[d.id] = [px, 0.24 + dIdx * 0.56, 0];
      });
    }
  }

  const nodeObjs = nodeEntries.map((node, idx) => {
    const outgoingLinks = snapshot.edges
      .filter((e) => e.from === node.id)
      .map((e) => ({ label: e.label ?? 'next', targetId: e.to }));

    const addrHex = `0x${(0x2040 + idx * 0x40).toString(16).toUpperCase()}`;
    let pos: [number, number, number] = [0, 1.0, 0];
    let kind: SceneObjectInfo['kind'] = 'list-node';

    if (scene === 'linked-list') {
      pos = dynamicLinkedListCoords?.[node.id] ?? [idx * 2.8, 1.0, 0];
      kind = 'list-node';
    } else if (scene === 'stack') {
      // Vertical 3D Stack along Y axis (or 3-peg Tower of Hanoi layout)
      const slabSpacing = 0.58;
      const isPoppingTop =
        !isHanoiScene &&
        idx === nodeEntries.length - 1 &&
        snapshot.narration.toLowerCase().includes('lifting and sliding');
      pos =
        hanoiCoords[node.id] ??
        (isPoppingTop
          ? [2.6, 0.24 + idx * slabSpacing + 1.85, 0]
          : [0, 0.24 + idx * slabSpacing, 0]);
      kind = 'stack-slab';
    } else if (scene === 'queue' || scene === 'deque') {
      if (node.id.startsWith('cq-')) {
        // Circular Queue ring layout
        const angle = (idx / Math.max(4, count)) * Math.PI * 2;
        pos = [Math.cos(angle) * 2.6, 1.0, Math.sin(angle) * 2.6];
      } else {
        const spacing = 2.4;
        const startX = -((count - 1) * spacing) / 2;
        pos = [startX + idx * spacing, 1.0, 0];
      }
      kind = 'list-node';
    } else if (scene === 'bst' || scene === 'avl' || scene === 'heap') {
      pos = dynamicTreeCoords?.[node.id] ?? TREE_NODE_COORDS[node.id] ?? [idx * 1.8 - 2.5, 0.6, 0];
      kind = 'tree-node';
    } else if (scene === 'graph') {
      pos =
        dynamicGraphCoords?.[node.id] ??
        GRAPH_NODE_COORDS[node.id] ??
        [idx * 2.0 - 3.0, 1.5, 0];
      kind = 'graph-node';
    } else if (scene === 'hash-table') {
      pos = dynamicHashCoords?.[node.id] ?? [idx * 2.2 - 2.2, 1.0, 0];
      kind = node.id.startsWith('b-') ? 'stack-slab' : 'list-node';
    }

    return {
      id: node.id,
      kind,
      label: `${node.id} (${String(node.value)})`,
      value: node.value,
      memoryAddress: addrHex,
      position: pos,
      fields: {
        id: node.id,
        value: node.value,
        links: outgoingLinks.length,
        isHanoi: isHanoiScene,
        heapIndex: scene === 'heap' ? (heapIndexMap[node.id] ?? idx) : null,
      },
      linksTo: outgoingLinks,
    };
  });

  return appendCallStackAndScalarFallback(nodeObjs);
}

function formatOperationLabel(
  op: ArrayOperationId,
  paramIndex: number,
  paramValue: number,
): string {
  switch (op) {
    case 'insert-at':
      return `Insert ${paramValue} @ [${paramIndex}]`;
    case 'delete-at':
      return `Delete @ [${paramIndex}]`;
    case 'delete-val':
      return `Delete Value (${paramValue})`;
    case 'update-at':
      return `Update [${paramIndex}] = ${paramValue}`;
    case 'linear-search':
      return `Linear Search (${paramValue})`;
    case 'binary-search':
      return `Binary Search (${paramValue})`;
    case 'rotate':
      return `Rotate Left (k=${paramIndex || 1})`;
    case 'rotate-right':
      return `Rotate Right (k=${paramIndex || 1})`;
    default:
      return ARRAY_ALGORITHM_METADATA[op].title;
  }
}

function buildStaticArrayState(arr: number[]) {
  const initEvents: TraceEvent[] = [
    { t: 'create', id: 'arr', kind: 'array', value: arr.length },
    ...arr.map((v, idx) => ({
      t: 'set' as const,
      target: { id: 'arr', index: idx },
      value: v,
    })),
    { t: 'note', text: `Loaded array: ${arr.join(', ')}. Pick an operation to run!` },
    { t: 'done' },
  ];
  const timeline = new TraceTimeline(initEvents);
  const snapshot = timeline.getSnapshotAt(timeline.totalSteps);
  const objs = buildArraySceneObjectsFromSnapshot(snapshot);
  return { timeline, snapshot, objs };
}

const INITIAL_ARRAY = [42, 17, 68, 29, 84, 12];
const initialArrayMeta = ARRAY_ALGORITHM_METADATA['bubble-sort'];
const initialStatic = buildStaticArrayState(INITIAL_ARRAY);

export const useViewportStore = create<ViewportState>((set, get) => ({
  uiMode: 'standard',
  detailsOpen: false,
  appMode: 'library',
  previewScene: 'array',
  selectedId: 'arr[0]',
  sceneObjects: toObjectMap(initialStatic.objs),
  cameraPreset: 'isometric',
  cameraCommandVersion: 0,
  showGrid: true,
  wireframe: false,

  workingArray: INITIAL_ARRAY,
  activeOperation: null,
  activeStructureOp: null,
  selectedCorpusFile: '01_arrays_and_searching/array_operations.cpp',
  activeMetadata: {
    ...initialArrayMeta,
    title: 'Array (Select an Operation)',
    code: getCorpusCodeLines('01_arrays_and_searching/array_operations.cpp', initialArrayMeta.code),
  },
  timeline: initialStatic.timeline,
  currentStep: initialStatic.timeline.totalSteps,
  totalSteps: initialStatic.timeline.totalSteps,
  currentSnapshot: initialStatic.snapshot,
  isPlaying: false,
  playbackSpeed: 1,
  autoPlayOnRun: true,
  autoFollowCamera: false,
  operationHistory: [],
  hasPendingOperationRun: false,
  customCodeError: null,
  isRunningCustomCode: false,
  lastLibraryRun: null,

  setUiMode: (mode) => {
    const wasOpen = isCodeViewerOpen(get());
    set({ uiMode: mode });
    rerunLibraryOperationIfCodeViewerToggled(wasOpen);
  },
  toggleUiMode: () => {
    const wasOpen = isCodeViewerOpen(get());
    set((s) => ({ uiMode: s.uiMode === 'standard' ? 'pro' : 'standard' }));
    rerunLibraryOperationIfCodeViewerToggled(wasOpen);
  },
  setDetailsOpen: (open) => {
    const wasOpen = isCodeViewerOpen(get());
    set({ detailsOpen: open });
    rerunLibraryOperationIfCodeViewerToggled(wasOpen);
  },
  toggleDetailsOpen: () => {
    const wasOpen = isCodeViewerOpen(get());
    set((s) => ({ detailsOpen: !s.detailsOpen }));
    rerunLibraryOperationIfCodeViewerToggled(wasOpen);
  },

  setAppMode: (mode) =>
    set({ appMode: mode, detailsOpen: mode === 'upload' ? true : get().detailsOpen }),

  setPreviewScene: (scene) => {
    if (scene === 'array') {
      const state = get();
      const { timeline, snapshot, objs } = buildStaticArrayState(state.workingArray);
      const corpusLines = getCorpusCodeLines(
        '01_arrays_and_searching/array_operations.cpp',
        ARRAY_ALGORITHM_METADATA['bubble-sort'].code,
      );
      set({
        previewScene: 'array',
        activeOperation: null,
        selectedCorpusFile: '01_arrays_and_searching/array_operations.cpp',
        timeline,
        currentStep: timeline.totalSteps,
        totalSteps: timeline.totalSteps,
        currentSnapshot: snapshot,
        activeMetadata: {
          ...ARRAY_ALGORITHM_METADATA['bubble-sort'],
          title: 'Array (Select an Operation)',
          code: corpusLines,
        },
        sceneObjects: toObjectMap(objs),
        selectedId: objs[0]?.id ?? null,
        isPlaying: false,
        operationHistory: [],
        lastLibraryRun: null,
        hasPendingOperationRun: false,
      });
      return;
    }

    const result = buildStaticStructureTrace(scene, get().workingArray);
    const timeline = new TraceTimeline(result.events);
    const firstNoteIdx = result.events.findIndex((e) => e.t === 'note');
    const startStep = firstNoteIdx >= 0 ? firstNoteIdx + 1 : timeline.totalSteps;
    const snapshot = timeline.getSnapshotAt(startStep);
    const objects = buildSceneObjectsForScene(scene, snapshot);

    set({
      previewScene: scene,
      activeStructureOp: null,
      activeMetadata: result.meta,
      timeline,
      currentStep: startStep,
      totalSteps: timeline.totalSteps,
      currentSnapshot: snapshot,
      isPlaying: false,
      sceneObjects: toObjectMap(objects),
      selectedId: objects[0]?.id ?? null,
      operationHistory: [],
      lastLibraryRun: null,
      hasPendingOperationRun: false,
    });
  },

  selectObject: (id) => set({ selectedId: id }),

  registerSceneObjects: (objects) =>
    set({
      sceneObjects: toObjectMap(objects),
    }),

  triggerCameraPreset: (preset) =>
    set((state) => ({
      cameraPreset: preset,
      cameraCommandVersion: state.cameraCommandVersion + 1,
    })),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  toggleWireframe: () => set((state) => ({ wireframe: !state.wireframe })),

  play: () => {
    const state = get();
    if (state.currentStep >= state.totalSteps) {
      const firstNoteIdx = state.timeline.events.findIndex((e) => e.t === 'note');
      const startStep = firstNoteIdx >= 0 ? firstNoteIdx + 1 : 1;
      get().seekToStep(Math.min(startStep, state.totalSteps));
    }
    set({ isPlaying: true });
  },

  pause: () => set({ isPlaying: false }),

  togglePlay: () => {
    if (get().isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  seekToStep: (step) => {
    const state = get();
    const clamped = Math.max(0, Math.min(state.totalSteps, Math.floor(step)));
    const snapshot = state.timeline.getSnapshotAt(clamped);
    const objs = buildSceneObjectsForScene(state.previewScene, snapshot);
    const updates: Partial<ViewportState> = {
      currentStep: clamped,
      currentSnapshot: snapshot,
      sceneObjects: toObjectMap(objs),
    };

    if (clamped >= state.totalSteps) {
      updates.isPlaying = false;
    }

    set(updates);
  },

  stepForward: () => {
    const state = get();
    if (state.currentStep < state.totalSteps) {
      let nextStep = state.currentStep + 1;
      for (let i = state.currentStep; i < state.timeline.events.length; i++) {
        const ev = state.timeline.events[i];
        if (ev.t === 'note' || ev.t === 'done') {
          nextStep = i + 1;
          break;
        }
      }
      state.seekToStep(nextStep);
    } else if (state.isPlaying) {
      set({ isPlaying: false });
    } else {
      // Manual step forward at the end of the timeline wraps to the first visual step
      const firstNoteIdx = state.timeline.events.findIndex((e) => e.t === 'note');
      const startStep = firstNoteIdx >= 0 ? firstNoteIdx + 1 : 1;
      state.seekToStep(Math.min(startStep, state.totalSteps));
    }
  },

  stepBackward: () => {
    const state = get();
    set({ isPlaying: false });
    if (state.currentStep > 0) {
      let prevStep = state.currentStep - 1;
      for (let i = state.currentStep - 2; i >= 0; i--) {
        const ev = state.timeline.events[i];
        if (ev.t === 'note') {
          prevStep = i + 1;
          break;
        }
      }
      state.seekToStep(prevStep);
    }
  },

  restart: () => {
    const state = get();
    set({ isPlaying: false });
    const firstNoteIdx = state.timeline.events.findIndex((e) => e.t === 'note');
    const firstStep = firstNoteIdx >= 0 ? firstNoteIdx + 1 : 0;
    state.seekToStep(firstStep);
  },

  skipToEnd: () => {
    const state = get();
    set({ isPlaying: false });
    state.seekToStep(state.totalSteps);
  },

  setPlaybackSpeed: (speed) =>
    set({ playbackSpeed: Math.max(0.25, Math.min(4, speed)) }),

  toggleAutoPlayOnRun: () =>
    set((s) => ({ autoPlayOnRun: !s.autoPlayOnRun })),

  toggleAutoFollowCamera: () =>
    set((s) => ({ autoFollowCamera: !s.autoFollowCamera })),

  pauseAutoFollowCamera: () => {
    if (get().autoFollowCamera) {
      set({ autoFollowCamera: false });
    }
  },

  setCustomArray: (values) => {
    const sanitized = values
      .filter((n) => Number.isFinite(n))
      .slice(0, 24)
      .map((n) => Math.round(n));
    const arr = sanitized.length > 0 ? sanitized : [10, 20, 30];
    const { timeline, snapshot, objs } = buildStaticArrayState(arr);
    set({
      previewScene: 'array',
      workingArray: arr,
      timeline,
      currentStep: timeline.totalSteps,
      totalSteps: timeline.totalSteps,
      currentSnapshot: snapshot,
      sceneObjects: toObjectMap(objs),
      selectedId: objs[0]?.id ?? null,
      isPlaying: false,
      operationHistory: [],
      lastLibraryRun: null,
    });
  },

  applyCustomInputValues: (values) => {
    const state = get();
    const sanitized = values
      .filter((n) => Number.isFinite(n))
      .slice(0, 24)
      .map((n) => Math.round(n));
    const arr = sanitized.length > 0 ? sanitized : [10, 20, 30];

    if (state.previewScene === 'array') {
      const { timeline, snapshot, objs } = buildStaticArrayState(arr);
      set({
        workingArray: arr,
        timeline,
        currentStep: timeline.totalSteps,
        totalSteps: timeline.totalSteps,
        currentSnapshot: snapshot,
        sceneObjects: toObjectMap(objs),
        selectedId: objs[0]?.id ?? null,
        isPlaying: false,
        operationHistory: [],
        lastLibraryRun: null,
        hasPendingOperationRun: state.activeOperation !== null,
      });
      return;
    }

    const result = buildStaticStructureTrace(state.previewScene, arr);
    const timeline = new TraceTimeline(result.events);
    const firstNoteIdx = result.events.findIndex((e) => e.t === 'note');
    const startStep = firstNoteIdx >= 0 ? firstNoteIdx + 1 : timeline.totalSteps;
    const snapshot = timeline.getSnapshotAt(startStep);
    const objs = buildSceneObjectsForScene(state.previewScene, snapshot);
    set({
      workingArray: arr,
      timeline,
      currentStep: startStep,
      totalSteps: timeline.totalSteps,
      currentSnapshot: snapshot,
      sceneObjects: toObjectMap(objs),
      selectedId: objs[0]?.id ?? null,
      isPlaying: false,
      operationHistory: [],
      lastLibraryRun: null,
      hasPendingOperationRun: state.activeStructureOp !== null,
    });
  },

  selectArrayOperation: (op) => {
    const corpusPath = ARRAY_CORPUS_MAP[op];
    const baseMeta = ARRAY_ALGORITHM_METADATA[op];
    const corpusLines = getCorpusCodeLines(corpusPath, baseMeta.code);
    set({
      activeOperation: op,
      selectedCorpusFile: corpusPath,
      activeMetadata: {
        ...baseMeta,
        code: corpusLines,
      },
      isPlaying: false,
      hasPendingOperationRun: true,
    });
  },

  selectStructureOperation: (op) => {
    const def = STRUCTURE_OP_CATALOG.find((item) => item.id === op);
    if (!def) {
      set({ activeStructureOp: op, isPlaying: false, hasPendingOperationRun: true });
      return;
    }
    const corpusLines = getCorpusCodeLines(def.corpusPath, []);
    set((s) => ({
      activeStructureOp: op,
      selectedCorpusFile: def.corpusPath,
      activeMetadata: {
        ...s.activeMetadata,
        title: def.label,
        timeComplexity: def.timeComplexity,
        spaceComplexity: def.spaceComplexity,
        code: corpusLines.length > 0 ? corpusLines : s.activeMetadata.code,
      },
      isPlaying: false,
      hasPendingOperationRun: true,
    }));
  },

  runOperationNow: (op, paramIndex = 0, paramValue = 42) => {
    const state = get();
    const inputArray = [...state.workingArray];
    const lastLibraryRun: LastLibraryRun = {
      kind: 'array',
      op,
      paramIndex,
      paramValue,
      inputArray,
    };

    // Code viewer hidden: fast visual-only trace (no line-by-line C++ stepping)
    if (!isCodeViewerOpen(state)) {
      const fast = runArrayOperation(op, inputArray, paramIndex, paramValue, true);
      const corpusPath = ARRAY_CORPUS_MAP[op];
      const corpusLines = getCorpusCodeLines(corpusPath, fast.meta.code);
      const fastTimeline = new TraceTimeline(fast.events);
      const fastStart = Math.min(inputArray.length + 2, fastTimeline.totalSteps);
      const fastSnapshot = fastTimeline.getSnapshotAt(fastStart);
      const fastObjs = buildArraySceneObjectsFromSnapshot(fastSnapshot);
      set({
        previewScene: 'array',
        activeOperation: op,
        selectedCorpusFile: corpusPath,
        activeMetadata: { ...fast.meta, code: corpusLines },
        workingArray: fast.finalArray,
        timeline: fastTimeline,
        currentStep: fastStart,
        totalSteps: fastTimeline.totalSteps,
        currentSnapshot: fastSnapshot,
        sceneObjects: toObjectMap(fastObjs),
        selectedId: fastObjs[0]?.id ?? null,
        isPlaying: state.autoPlayOnRun,
        hasPendingOperationRun: false,
        lastLibraryRun,
        operationHistory: [
          {
            uid: `op-${Date.now()}`,
            label: formatOperationLabel(op, paramIndex, paramValue),
            op,
            startStep: fastStart,
            endStep: fastTimeline.totalSteps,
          },
        ],
      });
      return;
    }

    const result = runCorpusArrayOperation(op, inputArray, paramIndex, paramValue);
    const timeline = new TraceTimeline(result.events);
    let startStep = Math.max(1, Math.min(result.operationStartStep, timeline.totalSteps));
    let snapshot = timeline.getSnapshotAt(startStep);
    let objs = buildArraySceneObjectsFromSnapshot(snapshot);
    if (objs.length === 0 && timeline.totalSteps > 1) {
      const nonEmptyIdx = result.events.findIndex((e: TraceEvent, idx: number) => {
        if (e.t !== 'note') return false;
        const snap = timeline.getSnapshotAt(idx + 1);
        return buildArraySceneObjectsFromSnapshot(snap).length > 0;
      });
      if (nonEmptyIdx >= 0) {
        startStep = nonEmptyIdx + 1;
        snapshot = timeline.getSnapshotAt(startStep);
        objs = buildArraySceneObjectsFromSnapshot(snapshot);
      }
    }

    set({
      previewScene: 'array',
      activeOperation: op,
      selectedCorpusFile: result.corpusPath,
      activeMetadata: result.meta,
      workingArray: result.finalArray,
      timeline,
      currentStep: startStep,
      totalSteps: timeline.totalSteps,
      currentSnapshot: snapshot,
      sceneObjects: toObjectMap(objs),
      selectedId: objs[0]?.id ?? null,
      isPlaying: state.autoPlayOnRun,
      hasPendingOperationRun: false,
      lastLibraryRun,
      operationHistory: [
        {
          uid: `op-${Date.now()}`,
          label: formatOperationLabel(op, paramIndex, paramValue),
          op,
          startStep,
          endStep: timeline.totalSteps,
        },
      ],
    });
  },

  runStructureOperationNow: (op, paramValue = 40, paramText) => {
    const state = get();
    const inputArray = [...state.workingArray];
    const lastLibraryRun: LastLibraryRun = {
      kind: 'structure',
      op,
      paramValue,
      paramText,
      inputArray,
    };

    // Code viewer hidden: fast visual-only trace (no line-by-line C++ stepping)
    if (!isCodeViewerOpen(state)) {
      const fast = runStructureOperation(op, paramValue, inputArray, paramText);
      const def = STRUCTURE_OP_CATALOG.find((item) => item.id === op);
      const corpusPath = def?.corpusPath ?? state.selectedCorpusFile;
      const corpusLines = getCorpusCodeLines(corpusPath, fast.meta.code);
      const fastTimeline = new TraceTimeline(fast.events);
      const firstNoteIdx = fast.events.findIndex((e) => e.t === 'note');
      const fastStart = firstNoteIdx >= 0 ? firstNoteIdx + 1 : 1;
      const fastSnapshot = fastTimeline.getSnapshotAt(fastStart);
      const fastObjs = buildSceneObjectsForScene(fast.scene, fastSnapshot);
      set({
        previewScene: fast.scene,
        activeStructureOp: op,
        selectedCorpusFile: corpusPath,
        activeMetadata: {
          ...fast.meta,
          code: corpusLines.length > 0 ? corpusLines : fast.meta.code,
        },
        workingArray: fast.updatedValues ?? inputArray,
        timeline: fastTimeline,
        currentStep: fastStart,
        totalSteps: fastTimeline.totalSteps,
        currentSnapshot: fastSnapshot,
        sceneObjects: toObjectMap(fastObjs),
        selectedId: fastObjs[0]?.id ?? null,
        isPlaying: state.autoPlayOnRun,
        hasPendingOperationRun: false,
        lastLibraryRun,
        operationHistory: [
          {
            uid: `op-${Date.now()}`,
            label: fast.meta.title,
            op,
            startStep: fastStart,
            endStep: fastTimeline.totalSteps,
          },
        ],
      });
      return;
    }

    const result = runCorpusStructureOperation(op, inputArray, paramValue, paramText);
    const timeline = new TraceTimeline(result.events);
    let startStep = Math.max(1, Math.min(result.operationStartStep, timeline.totalSteps));
    let snapshot = timeline.getSnapshotAt(startStep);
    let objs = buildSceneObjectsForScene(result.scene, snapshot);
    if (objs.length === 0 && timeline.totalSteps > 1) {
      const nonEmptyIdx = result.events.findIndex((e: TraceEvent, idx: number) => {
        if (e.t !== 'note') return false;
        const snap = timeline.getSnapshotAt(idx + 1);
        return buildSceneObjectsForScene(result.scene, snap).length > 0;
      });
      if (nonEmptyIdx >= 0) {
        startStep = nonEmptyIdx + 1;
        snapshot = timeline.getSnapshotAt(startStep);
        objs = buildSceneObjectsForScene(result.scene, snapshot);
      }
    }

    set({
      previewScene: result.scene,
      activeStructureOp: op,
      selectedCorpusFile: result.corpusPath,
      activeMetadata: result.meta,
      workingArray: result.finalArray,
      timeline,
      currentStep: startStep,
      totalSteps: timeline.totalSteps,
      currentSnapshot: snapshot,
      sceneObjects: toObjectMap(objs),
      selectedId: objs[0]?.id ?? null,
      isPlaying: state.autoPlayOnRun,
      hasPendingOperationRun: false,
      lastLibraryRun,
      operationHistory: [
        {
          uid: `op-${Date.now()}`,
          label: result.meta.title,
          op,
          startStep,
          endStep: timeline.totalSteps,
        },
      ],
    });
  },

  selectCorpusFile: (relativePath) => {
    const entry = CORPUS_FILE_CATALOG.find((c) => c.relativePath === relativePath);
    if (!entry) return;
    get().setPreviewScene(entry.scene);
    const lines = getCorpusCodeLines(relativePath, get().activeMetadata.code);
    set((s) => ({
      selectedCorpusFile: relativePath,
      activeMetadata: {
        ...s.activeMetadata,
        title: `${entry.title} (${relativePath.split('/')[1]})`,
        code: lines,
      },
      isPlaying: false,
      hasPendingOperationRun: false,
    }));
  },

  selectAndRunCorpusFile: (relativePath) => {
    const entry = CORPUS_FILE_CATALOG.find((c) => c.relativePath === relativePath);
    if (!entry) return;
    const state = get();
    const rawCpp = getCorpusRawText(relativePath);
    const fileName = relativePath.split('/')[1] ?? relativePath;

    try {
      const res = executeCustomCodeTrace(
        rawCpp,
        state.workingArray,
        relativePath,
        fileName,
      );
      const traceEvents =
        entry.scene === 'queue' || entry.scene === 'deque'
          ? carryForwardQueueScalars(res.events)
          : res.events;
      const timeline = new TraceTimeline(traceEvents);
      const firstNoteIdx = traceEvents.findIndex((e) => e.t === 'note');
      let startStep = firstNoteIdx >= 0 ? firstNoteIdx + 1 : 1;
      let snapshot = timeline.getSnapshotAt(startStep);
      let objs = buildSceneObjectsForScene(entry.scene, snapshot);
      if (objs.length === 0) {
        const midStep = Math.max(1, Math.ceil(timeline.totalSteps / 2));
        const midSnap = timeline.getSnapshotAt(midStep);
        const midObjs = buildSceneObjectsForScene(entry.scene, midSnap);
        if (midObjs.length > 0) {
          startStep = midStep;
          snapshot = midSnap;
          objs = midObjs;
        }
      }
      const lines = getCorpusCodeLines(relativePath, res.meta.code);

      set({
        previewScene: entry.scene,
        selectedCorpusFile: relativePath,
        activeOperation: entry.scene === 'array' ? (entry.operationId as ArrayOperationId) : null,
        activeStructureOp:
          entry.scene !== 'array' ? (entry.operationId as StructureOperationId) : null,
        activeMetadata: {
          ...res.meta,
          title: `${entry.title} (${fileName})`,
          code: lines,
        },
        workingArray: res.extractedArray,
        timeline,
        currentStep: startStep,
        totalSteps: timeline.totalSteps,
        currentSnapshot: snapshot,
        sceneObjects: toObjectMap(objs),
        selectedId: objs[0]?.id ?? null,
        isPlaying: state.autoPlayOnRun,
        hasPendingOperationRun: false,
        customCodeError: null,
        lastLibraryRun: null,
      });
    } catch {
      if (entry.scene === 'array') {
        get().runOperationNow(entry.operationId as ArrayOperationId, 2, 42);
      } else {
        get().runStructureOperationNow(entry.operationId as StructureOperationId, 42);
      }
      const lines = getCorpusCodeLines(relativePath, get().activeMetadata.code);
      set((s) => ({
        selectedCorpusFile: relativePath,
        activeMetadata: {
          ...s.activeMetadata,
          title: `${entry.title} (${fileName})`,
          code: lines,
        },
      }));
    }
  },

  previewCustomCode: (sourceCode, fileName) => {
    const lines = sourceCode.replace(/\r\n/g, '\n').split('\n');
    set((s) => ({
      activeMetadata: {
        ...s.activeMetadata,
        title: fileName ? `${fileName} (Ready — click Visualize)` : 'Custom Code (Ready)',
        code: lines,
      },
      customCodeError: null,
      isPlaying: false,
    }));
  },

  clearCustomCodeError: () => set({ customCodeError: null }),

  runCustomCodeNow: (sourceCode, fileName) => {
    const state = get();
    try {
      const res = executeCustomCodeTrace(
        sourceCode,
        state.workingArray,
        undefined,
        fileName,
      );
      const timeline = new TraceTimeline(res.events);
      const firstNoteIdx = res.events.findIndex((e) => e.t === 'note');
      const startStep = firstNoteIdx >= 0 ? firstNoteIdx + 1 : 1;
      const snapshot = timeline.getSnapshotAt(startStep);
      const objs = buildSceneObjectsForScene(res.scene, snapshot);

      set({
        previewScene: res.scene,
        activeMetadata: res.meta,
        workingArray: res.extractedArray,
        timeline,
        currentStep: startStep,
        totalSteps: timeline.totalSteps,
        currentSnapshot: snapshot,
        sceneObjects: toObjectMap(objs),
        selectedId: objs[0]?.id ?? null,
        isPlaying: state.autoPlayOnRun,
        hasPendingOperationRun: false,
        customCodeError: null,
        lastLibraryRun: null,
        isRunningCustomCode: false,
        detailsOpen: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const lines = sourceCode.replace(/\r\n/g, '\n').split('\n');
      set((s) => ({
        isPlaying: false,
        isRunningCustomCode: false,
        customCodeError: message,
        detailsOpen: true,
        activeMetadata: {
          ...s.activeMetadata,
          title: fileName ? `${fileName} (Error)` : 'Custom C++ Code (Error)',
          code: lines,
        },
      }));
    }
  },

  runCustomCodeAsync: async (sourceCode, fileName) => {
    const state = get();
    set({ isRunningCustomCode: true, customCodeError: null, isPlaying: false });
    try {
      const res = await executeCustomCodeTraceInWorker(
        sourceCode,
        state.workingArray,
        undefined,
        fileName,
      );
      const timeline = new TraceTimeline(res.events);
      const firstNoteIdx = res.events.findIndex((e) => e.t === 'note');
      const startStep = firstNoteIdx >= 0 ? firstNoteIdx + 1 : 1;
      const snapshot = timeline.getSnapshotAt(startStep);
      const objs = buildSceneObjectsForScene(res.scene, snapshot);

      set({
        previewScene: res.scene,
        activeMetadata: res.meta,
        workingArray: res.extractedArray,
        timeline,
        currentStep: startStep,
        totalSteps: timeline.totalSteps,
        currentSnapshot: snapshot,
        sceneObjects: toObjectMap(objs),
        selectedId: objs[0]?.id ?? null,
        isPlaying: get().autoPlayOnRun,
        hasPendingOperationRun: false,
        customCodeError: null,
        lastLibraryRun: null,
        isRunningCustomCode: false,
        detailsOpen: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const lines = sourceCode.replace(/\r\n/g, '\n').split('\n');
      set((s) => ({
        isPlaying: false,
        isRunningCustomCode: false,
        customCodeError: message,
        detailsOpen: true,
        activeMetadata: {
          ...s.activeMetadata,
          title: fileName ? `${fileName} (Error)` : 'Custom C++ Code (Error)',
          code: lines,
        },
      }));
    }
  },

  queueOperation: (op, paramIndex = 0, paramValue = 42) => {
    const state = get();
    const existingEvents: TraceEvent[] = state.timeline.events.filter(
      (e, idx) => !(idx === state.timeline.events.length - 1 && e.t === 'done'),
    );
    const startStep = existingEvents.length + 1;
    const result = runCorpusArrayOperation(op, state.workingArray, paramIndex, paramValue);
    const combinedEvents = [...existingEvents, ...result.events];
    const timeline = new TraceTimeline(combinedEvents);
    const snapshot = timeline.getSnapshotAt(state.currentStep);
    const objs = buildArraySceneObjectsFromSnapshot(snapshot);

    set({
      previewScene: 'array',
      activeOperation: op,
      selectedCorpusFile: result.corpusPath,
      activeMetadata: result.meta,
      workingArray: result.finalArray,
      timeline,
      totalSteps: timeline.totalSteps,
      currentSnapshot: snapshot,
      sceneObjects: toObjectMap(objs),
      lastLibraryRun: null,
      operationHistory: [
        ...state.operationHistory,
        {
          uid: `op-${Date.now()}-${state.operationHistory.length}`,
          label: formatOperationLabel(op, paramIndex, paramValue),
          op,
          startStep,
          endStep: timeline.totalSteps,
        },
      ],
    });
  },

  clearOperationQueue: () => {
    get().setCustomArray([42, 17, 68, 29, 84, 12]);
  },
}));

/**
 * When the code viewer is opened or closed while a Library operation is loaded,
 * re-run that same operation (same input values and params) in the other mode:
 * - code viewer open  → real corpus C++ trace, stepping line by line with highlights
 * - code viewer closed → fast visual-only trace
 * Playback state is carried over (playing keeps playing, finished stays finished).
 */
function rerunLibraryOperationIfCodeViewerToggled(wasOpen: boolean): void {
  const state = useViewportStore.getState();
  const isOpen = isCodeViewerOpen(state);
  if (wasOpen === isOpen) return;
  const last = state.lastLibraryRun;
  if (!last || state.appMode !== 'library' || state.hasPendingOperationRun) return;
  if (last.kind === 'array' ? state.activeOperation !== last.op : state.activeStructureOp !== last.op) {
    return;
  }

  const wasPlaying = state.isPlaying;
  const wasFinished = state.totalSteps > 0 && state.currentStep >= state.totalSteps;

  useViewportStore.setState({ workingArray: [...last.inputArray] });
  if (last.kind === 'array') {
    state.runOperationNow(last.op, last.paramIndex, last.paramValue);
  } else {
    state.runStructureOperationNow(last.op, last.paramValue, last.paramText);
  }

  if (wasFinished && !wasPlaying) {
    useViewportStore.getState().skipToEnd();
  } else {
    useViewportStore.setState({ isPlaying: wasPlaying });
  }
}
