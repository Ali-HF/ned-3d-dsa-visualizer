import { create } from 'zustand';
import type {
  CameraPreset,
  PreviewSceneKind,
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
} from '../corpus/cppCorpusRegistry';
import { executeCustomCodeTrace } from '../engine/codeRunner';

export interface QueuedOperationEntry {
  uid: string;
  label: string;
  op: ArrayOperationId | StructureOperationId;
  startStep: number;
  endStep: number;
}

const ARRAY_CORPUS_MAP: Record<ArrayOperationId, string> = {
  'bubble-sort': '06_elementary_sorting/bubble_sort.cpp',
  'selection-sort': '06_elementary_sorting/selection_sort.cpp',
  'insertion-sort': '06_elementary_sorting/insertion_sort.cpp',
  'merge-sort': '07_advanced_sorting/merge_sort.cpp',
  'quick-sort': '07_advanced_sorting/quick_sort.cpp',
  'insert-at': '01_arrays_and_searching/array_operations.cpp',
  'delete-at': '01_arrays_and_searching/array_operations.cpp',
  'delete-val': '01_arrays_and_searching/array_operations.cpp',
  'update-at': '01_arrays_and_searching/array_operations.cpp',
  reverse: '01_arrays_and_searching/array_operations.cpp',
  rotate: '01_arrays_and_searching/array_operations.cpp',
  'rotate-right': '01_arrays_and_searching/array_operations.cpp',
  'linear-search': '01_arrays_and_searching/linear_search.cpp',
  'binary-search': '01_arrays_and_searching/binary_search.cpp',
};

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
  runStructureOperationNow: (op: StructureOperationId, paramValue?: number) => void;
  selectCorpusFile: (relativePath: string) => void;
  selectAndRunCorpusFile: (relativePath: string) => void;
  previewCustomCode: (sourceCode: string, fileName?: string) => void;
  runCustomCodeNow: (sourceCode: string, fileName?: string) => void;
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
        },
        linksTo: [],
      });
    });
  });

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
 * Computes a 3D circular/elliptical graph layout when custom graph vertices
 * are not in the default `GRAPH_NODE_COORDS` map.
 */
function computeDynamicGraphLayout(
  snapshot: TraceStateSnapshot,
): Record<string, [number, number, number]> {
  const ids = Object.keys(snapshot.nodes);
  if (ids.every((id) => id in GRAPH_NODE_COORDS)) {
    return GRAPH_NODE_COORDS;
  }
  const out: Record<string, [number, number, number]> = {};
  const n = Math.max(1, ids.length);
  ids.forEach((id, idx) => {
    if (id in GRAPH_NODE_COORDS) {
      out[id] = GRAPH_NODE_COORDS[id];
      return;
    }
    const angle = (idx / n) * Math.PI * 2 - Math.PI / 2;
    out[id] = [
      Number((Math.cos(angle) * 3.6).toFixed(2)),
      Number((1.8 + Math.sin(angle * 2) * 0.75).toFixed(2)),
      Number((Math.sin(angle) * 1.4).toFixed(2)),
    ];
  });
  return out;
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
  if (scene === 'array') {
    return buildArraySceneObjectsFromSnapshot(snapshot);
  }

  // If Hash Table is running Open Addressing (uses `arr`), render as 3D bucket bars
  if (scene === 'hash-table' && Object.keys(snapshot.arrays).length > 0) {
    return buildArraySceneObjectsFromSnapshot(snapshot);
  }

  const nodeEntries = Object.values(snapshot.nodes);
  const count = nodeEntries.length;
  const dynamicTreeCoords =
    (scene === 'bst' || scene === 'heap') &&
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

  return nodeEntries.map((node, idx) => {
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
    } else if (scene === 'queue') {
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
    } else if (scene === 'bst' || scene === 'heap') {
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

  setUiMode: (mode) => set({ uiMode: mode }),
  toggleUiMode: () =>
    set((s) => ({ uiMode: s.uiMode === 'standard' ? 'pro' : 'standard' })),
  setDetailsOpen: (open) => set({ detailsOpen: open }),
  toggleDetailsOpen: () => set((s) => ({ detailsOpen: !s.detailsOpen })),

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
    const baseArr = state.workingArray;
    const result = runArrayOperation(op, baseArr, paramIndex, paramValue, true);
    const corpusPath = ARRAY_CORPUS_MAP[op];
    const corpusLines = getCorpusCodeLines(corpusPath, result.meta.code);
    const enrichedMeta: AlgorithmMetadata = {
      ...result.meta,
      code: corpusLines,
    };

    const timeline = new TraceTimeline(result.events);
    const startStep = Math.min(baseArr.length + 2, timeline.totalSteps);
    const snapshot = timeline.getSnapshotAt(startStep);
    const objs = buildArraySceneObjectsFromSnapshot(snapshot);

    set({
      previewScene: 'array',
      activeOperation: op,
      selectedCorpusFile: corpusPath,
      activeMetadata: enrichedMeta,
      workingArray: result.finalArray,
      timeline,
      currentStep: startStep,
      totalSteps: timeline.totalSteps,
      currentSnapshot: snapshot,
      sceneObjects: toObjectMap(objs),
      selectedId: objs[0]?.id ?? null,
      isPlaying: state.autoPlayOnRun,
      hasPendingOperationRun: false,
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

  runStructureOperationNow: (op, paramValue = 40) => {
    const state = get();
    const result = runStructureOperation(op, paramValue, state.workingArray);
    const timeline = new TraceTimeline(result.events);
    const firstNoteIdx = result.events.findIndex((e) => e.t === 'note');
    const startStep = firstNoteIdx >= 0 ? firstNoteIdx + 1 : 1;
    const snapshot = timeline.getSnapshotAt(startStep);
    const objs = buildSceneObjectsForScene(result.scene, snapshot);

    set({
      previewScene: result.scene,
      activeStructureOp: op,
      activeMetadata: result.meta,
      workingArray: result.updatedValues ?? state.workingArray,
      timeline,
      currentStep: startStep,
      totalSteps: timeline.totalSteps,
      currentSnapshot: snapshot,
      sceneObjects: toObjectMap(objs),
      selectedId: objs[0]?.id ?? null,
      isPlaying: state.autoPlayOnRun,
      hasPendingOperationRun: false,
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
    set({ selectedCorpusFile: relativePath });

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
        title: `${entry.title} (${relativePath.split('/')[1]})`,
        code: lines,
      },
    }));
  },

  previewCustomCode: (sourceCode, fileName) => {
    const lines = sourceCode.replace(/\r\n/g, '\n').split('\n');
    set((s) => ({
      activeMetadata: {
        ...s.activeMetadata,
        title: fileName ? `${fileName} (Ready — click Visualize)` : 'Custom Code (Ready)',
        code: lines,
      },
      isPlaying: false,
    }));
  },

  runCustomCodeNow: (sourceCode, fileName) => {
    const state = get();
    const res = executeCustomCodeTrace(
      sourceCode,
      state.workingArray,
      state.selectedCorpusFile,
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
      detailsOpen: true,
    });
  },

  queueOperation: (op, paramIndex = 0, paramValue = 42) => {
    const state = get();
    const existingEvents: TraceEvent[] = state.timeline.events.filter(
      (e, idx) => !(idx === state.timeline.events.length - 1 && e.t === 'done'),
    );
    const startStep = existingEvents.length + 1;
    const result = runArrayOperation(op, state.workingArray, paramIndex, paramValue, false);
    const combinedEvents = [...existingEvents, ...result.events];
    const timeline = new TraceTimeline(combinedEvents);
    const snapshot = timeline.getSnapshotAt(state.currentStep);
    const objs = buildArraySceneObjectsFromSnapshot(snapshot);

    set({
      previewScene: 'array',
      activeOperation: op,
      activeMetadata: result.meta,
      workingArray: result.finalArray,
      timeline,
      totalSteps: timeline.totalSteps,
      currentSnapshot: snapshot,
      sceneObjects: toObjectMap(objs),
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
