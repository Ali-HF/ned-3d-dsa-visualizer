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
  runStructureOperation,
  type StructureOperationId,
} from '../algorithms/structures/structureAlgorithms';
import {
  CORPUS_FILE_CATALOG,
  getCorpusCodeLines,
} from '../corpus/cppCorpusRegistry';

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
  'update-at': '01_arrays_and_searching/array_operations.cpp',
  reverse: '01_arrays_and_searching/array_operations.cpp',
  rotate: '01_arrays_and_searching/array_operations.cpp',
  'linear-search': '01_arrays_and_searching/linear_search.cpp',
  'binary-search': '01_arrays_and_searching/binary_search.cpp',
};

const DEFAULT_STRUCTURE_OP: Record<
  Exclude<PreviewSceneKind, 'array'>,
  StructureOperationId
> = {
  'linked-list': 'sll-search',
  stack: 'stack-push',
  queue: 'queue-enqueue',
  bst: 'tree-inorder',
  heap: 'heap-insert',
  graph: 'graph-bfs',
  'hash-table': 'hash-linear',
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
  activeOperation: ArrayOperationId;
  activeStructureOp: StructureOperationId;
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
  runOperationNow: (op: ArrayOperationId, paramIndex?: number, paramValue?: number) => void;
  runStructureOperationNow: (op: StructureOperationId, paramValue?: number) => void;
  selectAndRunCorpusFile: (relativePath: string) => void;
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
  'bst-new': [-0.5, -0.5, 0.4],
};

const GRAPH_NODE_COORDS: Record<string, [number, number, number]> = {
  'v-0': [-4.2, 2.0, 0],
  'v-1': [-1.4, 3.4, -0.8],
  'v-2': [-1.4, 0.7, 0.8],
  'v-3': [1.6, 3.4, -0.6],
  'v-4': [1.6, 0.7, 0.6],
  'v-5': [4.2, 2.0, 0],
};

const HASH_CHAIN_COORDS: Record<string, [number, number, number]> = {
  'b-0': [-3.2, 1.0, 0],
  'b-1': [0, 1.0, 0],
  'b-2': [3.2, 1.0, 0],
  'c-1': [0, 1.0, -2.2],
  'c-2': [0, 1.0, -4.4],
};

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

  return nodeEntries.map((node, idx) => {
    const outgoingLinks = snapshot.edges
      .filter((e) => e.from === node.id)
      .map((e) => ({ label: e.label ?? 'next', targetId: e.to }));

    const addrHex = `0x${(0x2040 + idx * 0x40).toString(16).toUpperCase()}`;
    let pos: [number, number, number] = [0, 1.0, 0];
    let kind: SceneObjectInfo['kind'] = 'list-node';

    if (scene === 'linked-list') {
      const spacing = 2.8;
      const startX = -((count - 1) * spacing) / 2;
      const zOffset = idx % 2 === 1 ? 0.35 : -0.15;
      pos = [startX + idx * spacing, 1.0, zOffset];
      kind = 'list-node';
    } else if (scene === 'stack') {
      // Vertical 3D Stack along Y axis
      pos = [0, 0.65 + idx * 1.15, 0];
      kind = 'list-node';
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
      pos = TREE_NODE_COORDS[node.id] ?? [idx * 1.8 - 2.5, 0.6, 0];
      kind = 'tree-node';
    } else if (scene === 'graph') {
      pos = GRAPH_NODE_COORDS[node.id] ?? [idx * 2.0 - 3.0, 1.5, 0];
      kind = 'graph-node';
    } else if (scene === 'hash-table') {
      pos = HASH_CHAIN_COORDS[node.id] ?? [idx * 2.2 - 2.2, 1.0, 0];
      kind = 'list-node';
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
    case 'update-at':
      return `Update [${paramIndex}] = ${paramValue}`;
    case 'linear-search':
      return `Linear Search (${paramValue})`;
    case 'binary-search':
      return `Binary Search (${paramValue})`;
    case 'rotate':
      return `Rotate Left (k=${paramIndex || 1})`;
    default:
      return ARRAY_ALGORITHM_METADATA[op].title;
  }
}

const INITIAL_ARRAY = [42, 17, 68, 29, 84, 12];
const initialTraceResult = runArrayOperation('bubble-sort', INITIAL_ARRAY, 0, 42, true);
const initialTimeline = new TraceTimeline(initialTraceResult.events);
const initialStartStep = Math.min(INITIAL_ARRAY.length + 7, initialTimeline.totalSteps);
const initialSnapshot = initialTimeline.getSnapshotAt(initialStartStep);
const initialArrayObjects = buildArraySceneObjectsFromSnapshot(initialSnapshot);

export const useViewportStore = create<ViewportState>((set, get) => ({
  uiMode: 'standard',
  detailsOpen: false,
  appMode: 'library',
  previewScene: 'array',
  selectedId: 'arr[0]',
  sceneObjects: toObjectMap(initialArrayObjects),
  cameraPreset: 'isometric',
  cameraCommandVersion: 0,
  showGrid: true,
  wireframe: false,

  workingArray: INITIAL_ARRAY,
  activeOperation: 'bubble-sort',
  activeStructureOp: 'sll-search',
  selectedCorpusFile: '06_elementary_sorting/bubble_sort.cpp',
  activeMetadata: initialTraceResult.meta,
  timeline: initialTimeline,
  currentStep: initialStartStep,
  totalSteps: initialTimeline.totalSteps,
  currentSnapshot: initialSnapshot,
  isPlaying: false,
  playbackSpeed: 1,
  autoPlayOnRun: true,
  autoFollowCamera: false,
  operationHistory: [
    {
      uid: 'init-op-1',
      label: 'Bubble Sort',
      op: 'bubble-sort',
      startStep: initialStartStep,
      endStep: initialTimeline.totalSteps,
    },
  ],

  setUiMode: (mode) => set({ uiMode: mode }),
  toggleUiMode: () =>
    set((s) => ({ uiMode: s.uiMode === 'standard' ? 'pro' : 'standard' })),
  setDetailsOpen: (open) => set({ detailsOpen: open }),
  toggleDetailsOpen: () => set((s) => ({ detailsOpen: !s.detailsOpen })),

  setAppMode: (mode) => set({ appMode: mode }),

  setPreviewScene: (scene) => {
    if (scene === 'array') {
      const state = get();
      const result = runArrayOperation(
        state.activeOperation,
        state.workingArray,
        0,
        42,
        true,
      );
      const timeline = new TraceTimeline(result.events);
      const startStep = Math.min(state.workingArray.length + 2, timeline.totalSteps);
      const snap = timeline.getSnapshotAt(startStep);
      const objs = buildArraySceneObjectsFromSnapshot(snap);
      set({
        previewScene: 'array',
        timeline,
        currentStep: startStep,
        totalSteps: timeline.totalSteps,
        currentSnapshot: snap,
        activeMetadata: result.meta,
        sceneObjects: toObjectMap(objs),
        selectedId: objs[0]?.id ?? null,
        isPlaying: false,
      });
      return;
    }

    const defaultOp = DEFAULT_STRUCTURE_OP[scene];
    const result = runStructureOperation(defaultOp, 40);
    const timeline = new TraceTimeline(result.events);
    // Advance past the initial node/edge creation events so the full structure is immediately on stage
    const firstNoteIdx = result.events.findIndex((e) => e.t === 'note');
    const startStep = firstNoteIdx >= 0 ? firstNoteIdx + 1 : timeline.totalSteps;
    const snapshot = timeline.getSnapshotAt(startStep);
    const objects = buildSceneObjectsForScene(scene, snapshot);

    set({
      previewScene: scene,
      activeStructureOp: defaultOp,
      activeMetadata: result.meta,
      timeline,
      currentStep: startStep,
      totalSteps: timeline.totalSteps,
      currentSnapshot: snapshot,
      isPlaying: false,
      sceneObjects: toObjectMap(objects),
      selectedId: objects[0]?.id ?? null,
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
    const initEvents: TraceEvent[] = [
      { t: 'create', id: 'arr', kind: 'array', value: arr.length },
      ...arr.map((v, idx) => ({
        t: 'set' as const,
        target: { id: 'arr', index: idx },
        value: v,
      })),
      { t: 'note', text: `Loaded numbers: ${arr.join(', ')}. Ready to run!` },
      { t: 'done' },
    ];
    const timeline = new TraceTimeline(initEvents);
    const snapshot = timeline.getSnapshotAt(timeline.totalSteps);
    const objs = buildArraySceneObjectsFromSnapshot(snapshot);
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
