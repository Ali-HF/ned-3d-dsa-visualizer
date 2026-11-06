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

export interface QueuedOperationEntry {
  uid: string;
  label: string;
  op: ArrayOperationId;
  startStep: number;
  endStep: number;
}

interface ViewportState {
  /** UI complexity mode: 'standard' (clean, plain-English) vs 'pro' (full developer inspector) */
  uiMode: 'standard' | 'pro';
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

  /** Phase 2: Trace Playback & Operations State */
  workingArray: number[];
  activeOperation: ArrayOperationId;
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

  setUiMode: (mode: 'standard' | 'pro') => void;
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

  /** Array & Operation Queue actions */
  setCustomArray: (values: number[]) => void;
  runOperationNow: (op: ArrayOperationId, paramIndex?: number, paramValue?: number) => void;
  queueOperation: (op: ArrayOperationId, paramIndex?: number, paramValue?: number) => void;
  clearOperationQueue: () => void;
}

export const DEMO_SCENE_OBJECTS: Record<PreviewSceneKind, SceneObjectInfo[]> = {
  array: [],
  'linked-list': [
    {
      id: 'node-head',
      kind: 'list-node',
      label: 'head (10)',
      value: 10,
      memoryAddress: '0x2040',
      position: [-4.5, 1.0, 0],
      fields: { data: 10, next: '0x2080', prev: 'nullptr' },
      linksTo: [{ label: 'next', targetId: 'node-2' }],
    },
    {
      id: 'node-2',
      kind: 'list-node',
      label: 'node (25)',
      value: 25,
      memoryAddress: '0x2080',
      position: [-1.5, 1.0, 0.6],
      fields: { data: 25, next: '0x20C0', prev: '0x2040' },
      linksTo: [{ label: 'next', targetId: 'node-3' }],
    },
    {
      id: 'node-3',
      kind: 'list-node',
      label: 'curr (40)',
      value: 40,
      memoryAddress: '0x20C0',
      position: [1.5, 1.0, -0.4],
      fields: { data: 40, next: '0x2100', prev: '0x2080' },
      linksTo: [{ label: 'next', targetId: 'node-tail' }],
    },
    {
      id: 'node-tail',
      kind: 'list-node',
      label: 'tail (55)',
      value: 55,
      memoryAddress: '0x2100',
      position: [4.5, 1.0, 0.2],
      fields: { data: 55, next: 'nullptr', prev: '0x20C0' },
      linksTo: [],
    },
  ],
  bst: [
    {
      id: 'bst-50',
      kind: 'tree-node',
      label: 'root (50)',
      value: 50,
      memoryAddress: '0x3000',
      position: [0, 3.6, 0],
      fields: { key: 50, height: 3, bf: 0, left: '0x3040', right: '0x3080' },
      linksTo: [
        { label: 'left', targetId: 'bst-30' },
        { label: 'right', targetId: 'bst-70' },
      ],
    },
    {
      id: 'bst-30',
      kind: 'tree-node',
      label: 'node (30)',
      value: 30,
      memoryAddress: '0x3040',
      position: [-2.8, 2.0, 0.8],
      fields: { key: 30, height: 2, bf: 0, left: '0x30C0', right: '0x3100' },
      linksTo: [
        { label: 'left', targetId: 'bst-20' },
        { label: 'right', targetId: 'bst-40' },
      ],
    },
    {
      id: 'bst-70',
      kind: 'tree-node',
      label: 'node (70)',
      value: 70,
      memoryAddress: '0x3080',
      position: [2.8, 2.0, -0.8],
      fields: { key: 70, height: 2, bf: -1, left: '0x3140', right: '0x3180' },
      linksTo: [
        { label: 'left', targetId: 'bst-60' },
        { label: 'right', targetId: 'bst-85' },
      ],
    },
    {
      id: 'bst-20',
      kind: 'tree-node',
      label: 'leaf (20)',
      value: 20,
      memoryAddress: '0x30C0',
      position: [-4.2, 0.6, 1.5],
      fields: { key: 20, height: 1, bf: 0, left: 'nullptr', right: 'nullptr' },
      linksTo: [],
    },
    {
      id: 'bst-40',
      kind: 'tree-node',
      label: 'leaf (40)',
      value: 40,
      memoryAddress: '0x3100',
      position: [-1.4, 0.6, 0.1],
      fields: { key: 40, height: 1, bf: 0, left: 'nullptr', right: 'nullptr' },
      linksTo: [],
    },
    {
      id: 'bst-60',
      kind: 'tree-node',
      label: 'leaf (60)',
      value: 60,
      memoryAddress: '0x3140',
      position: [1.4, 0.6, -0.1],
      fields: { key: 60, height: 1, bf: 0, left: 'nullptr', right: 'nullptr' },
      linksTo: [],
    },
    {
      id: 'bst-85',
      kind: 'tree-node',
      label: 'leaf (85)',
      value: 85,
      memoryAddress: '0x3180',
      position: [4.2, 0.6, -1.5],
      fields: { key: 85, height: 1, bf: 0, left: 'nullptr', right: 'nullptr' },
      linksTo: [],
    },
  ],
};

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
// Start at the first comparison step so the stage and plain-English caption bar immediately show the action
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
  activeMetadata: initialTraceResult.meta,
  timeline: initialTimeline,
  currentStep: initialStartStep,
  totalSteps: initialTimeline.totalSteps,
  currentSnapshot: initialSnapshot,
  isPlaying: false,
  playbackSpeed: 1,
  autoPlayOnRun: true,
  autoFollowCamera: true,
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
      const snap = get().currentSnapshot;
      const objs = buildArraySceneObjectsFromSnapshot(snap);
      set({
        previewScene: 'array',
        sceneObjects: toObjectMap(objs),
        selectedId: objs[0]?.id ?? null,
      });
      return;
    }
    const objects = DEMO_SCENE_OBJECTS[scene];
    set({
      previewScene: scene,
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
      // If at the end, restart from step 1 and play
      get().seekToStep(Math.min(state.workingArray.length + 2, state.totalSteps));
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
    const updates: Partial<ViewportState> = {
      currentStep: clamped,
      currentSnapshot: snapshot,
    };

    if (clamped >= state.totalSteps) {
      updates.isPlaying = false;
    }

    if (state.previewScene === 'array') {
      const objs = buildArraySceneObjectsFromSnapshot(snapshot);
      updates.sceneObjects = toObjectMap(objs);
    }

    set(updates);
  },

  stepForward: () => {
    const state = get();
    if (state.currentStep < state.totalSteps) {
      state.seekToStep(state.currentStep + 1);
    } else {
      set({ isPlaying: false });
    }
  },

  stepBackward: () => {
    const state = get();
    set({ isPlaying: false });
    if (state.currentStep > 0) {
      state.seekToStep(state.currentStep - 1);
    }
  },

  restart: () => {
    const state = get();
    set({ isPlaying: false });
    const firstHistoryStart = state.operationHistory[0]?.startStep ?? 0;
    state.seekToStep(firstHistoryStart);
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
      { t: 'note', text: `Loaded custom array [${arr.join(', ')}]` },
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
    const timeline = new TraceTimeline(result.events);
    const startStep = Math.min(baseArr.length + 2, timeline.totalSteps);
    const snapshot = timeline.getSnapshotAt(startStep);
    const objs = buildArraySceneObjectsFromSnapshot(snapshot);

    set({
      previewScene: 'array',
      activeOperation: op,
      activeMetadata: result.meta,
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

  queueOperation: (op, paramIndex = 0, paramValue = 42) => {
    const state = get();
    // Remove trailing 'done' from previous events so the sequence plays seamlessly
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
