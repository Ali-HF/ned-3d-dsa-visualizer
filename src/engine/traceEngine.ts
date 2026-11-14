import type { Ref, TraceEvent, TraceStateSnapshot } from '../types/trace';

export const DEFAULT_KEYFRAME_INTERVAL = 16;

export function createEmptySnapshot(): TraceStateSnapshot {
  return {
    stepIndex: 0,
    lastEvent: null,
    arrays: {},
    nodes: {},
    edges: [],
    activeLine: null,
    narration: 'Ready — Press Play (Space) or Step Forward to begin.',
    comparedRefs: null,
    swappedRefs: null,
    spawnedRef: null,
    removedId: null,
    activeVisitId: null,
    visitedOrder: [],
    callStack: [],
    scalars: {},
    indexPointers: {},
    matrices: {},
    containers: {},
    hasArrayWrites: false,
    coutOutput: '',
    detectedStructure: undefined,
    truncatedReason: null,
    isDone: false,
  };
}

export function cloneSnapshot(snap: TraceStateSnapshot): TraceStateSnapshot {
  const arrays: TraceStateSnapshot['arrays'] = {};
  for (const [k, v] of Object.entries(snap.arrays)) {
    arrays[k] = { id: v.id, values: [...v.values] };
  }

  const nodes: TraceStateSnapshot['nodes'] = {};
  for (const [k, v] of Object.entries(snap.nodes)) {
    nodes[k] = { ...v };
  }

  const scalars: TraceStateSnapshot['scalars'] = { ...(snap.scalars ?? {}) };
  const indexPointers: TraceStateSnapshot['indexPointers'] = {};
  for (const [k, v] of Object.entries(snap.indexPointers ?? {})) {
    indexPointers[k] = { ...v };
  }

  const matrices: TraceStateSnapshot['matrices'] = {};
  for (const [k, v] of Object.entries(snap.matrices ?? {})) {
    matrices[k] = {
      id: v.id,
      rows: v.rows,
      cols: v.cols,
      values: v.values.map((row) => [...row]),
    };
  }

  const containers: TraceStateSnapshot['containers'] = {};
  for (const [k, v] of Object.entries(snap.containers ?? {})) {
    containers[k] = {
      id: v.id,
      kind: v.kind,
      values: Array.isArray(v.values) ? [...v.values] : [],
      entries: v.entries ? v.entries.map((e) => ({ ...e })) : undefined,
    };
  }

  return {
    stepIndex: snap.stepIndex,
    lastEvent: snap.lastEvent,
    arrays,
    nodes,
    edges: snap.edges.map((e) => ({ ...e })),
    activeLine: snap.activeLine,
    narration: snap.narration,
    comparedRefs: snap.comparedRefs
      ? [{ ...snap.comparedRefs[0] }, { ...snap.comparedRefs[1] }]
      : null,
    swappedRefs: snap.swappedRefs
      ? [{ ...snap.swappedRefs[0] }, { ...snap.swappedRefs[1] }]
      : null,
    spawnedRef: snap.spawnedRef ? { ...snap.spawnedRef } : null,
    removedId: snap.removedId,
    activeVisitId: snap.activeVisitId,
    visitedOrder: [...snap.visitedOrder],
    callStack: snap.callStack.map((f) => ({
      fn: f.fn,
      args: [...f.args],
      depth: f.depth,
      returnValue: f.returnValue,
    })),
    scalars,
    indexPointers,
    matrices,
    containers,
    hasArrayWrites: snap.hasArrayWrites ?? false,
    coutOutput: typeof snap.coutOutput === 'string' ? snap.coutOutput : '',
    detectedStructure: snap.detectedStructure,
    truncatedReason: snap.truncatedReason,
    isDone: snap.isDone,
  };
}

export function formatRefLabel(ref: Ref): string {
  return typeof ref.index === 'number' ? `${ref.id}[${ref.index}]` : ref.id;
}

/**
 * Pure reducer that advances a TraceStateSnapshot by a single TraceEvent.
 * Transient per-step highlights (compare beam, swap arc, spawn glow, remove fade)
 * are cleared when the next non-line/non-note structural event occurs, while
 * line and note events preserve or enrich the current step's visual cues.
 */
export function applyTraceEvent(
  prev: TraceStateSnapshot,
  event: TraceEvent,
  nextStepIndex: number,
): TraceStateSnapshot {
  const next = cloneSnapshot(prev);
  next.stepIndex = nextStepIndex;
  next.lastEvent = event;

  // Clear transient visual highlights unless this event is the immediate companion note
  // on the same source line describing a swap, compare, set, or create action.
  const isImmediateCompanionNote =
    event.t === 'note' &&
    prev.lastEvent !== null &&
    (prev.lastEvent.t === 'swap' ||
      prev.lastEvent.t === 'compare' ||
      prev.lastEvent.t === 'set' ||
      prev.lastEvent.t === 'create') &&
    (event.line === undefined || event.line === prev.activeLine);

  if (event.t !== 'line' && !isImmediateCompanionNote) {
    next.comparedRefs = null;
    next.swappedRefs = null;
    next.spawnedRef = null;
    next.removedId = null;
  }

  if (typeof event.line === 'number' && event.line > 0) {
    next.activeLine = event.line;
  }

  if (event.scalars) {
    next.scalars = { ...event.scalars };
  }
  if (event.indexPointers) {
    const ptrs: TraceStateSnapshot['indexPointers'] = {};
    for (const [k, v] of Object.entries(event.indexPointers)) {
      ptrs[k] = { ...v };
    }
    next.indexPointers = ptrs;
  }
  if (event.matrices) {
    const mats: TraceStateSnapshot['matrices'] = {};
    for (const [k, v] of Object.entries(event.matrices)) {
      mats[k] = {
        id: v.id,
        rows: v.rows,
        cols: v.cols,
        values: v.values.map((r) => [...r]),
      };
    }
    next.matrices = mats;
  }
  if (event.containers) {
    const conts: TraceStateSnapshot['containers'] = {};
    for (const [k, v] of Object.entries(event.containers)) {
      conts[k] = {
        id: v.id,
        kind: v.kind,
        values: Array.isArray(v.values) ? [...v.values] : [],
        entries: v.entries ? v.entries.map((e) => ({ ...e })) : undefined,
      };
    }
    next.containers = conts;
  }
  if (typeof event.hasArrayWrites === 'boolean') {
    next.hasArrayWrites = next.hasArrayWrites || event.hasArrayWrites;
  }
  if (typeof event.coutOutput === 'string') {
    next.coutOutput = event.coutOutput;
  }
  if (event.detectedStructure) {
    next.detectedStructure = event.detectedStructure;
  }

  switch (event.t) {
    case 'line': {
      next.activeLine = event.line;
      break;
    }

    case 'note': {
      next.narration = event.text;
      break;
    }

    case 'create': {
      if (event.kind === 'array') {
        const size = typeof event.value === 'number' && event.value >= 0 ? event.value : 0;
        next.arrays[event.id] = {
          id: event.id,
          values: new Array(size).fill(0),
        };
        next.spawnedRef = { id: event.id };
      } else if (event.kind === 'node') {
        next.nodes[event.id] = {
          id: event.id,
          value: event.value ?? null,
        };
        next.spawnedRef = { id: event.id };
      }
      break;
    }

    case 'set': {
      const { id, index } = event.target;
      if (typeof index === 'number') {
        if (!next.arrays[id]) {
          next.arrays[id] = { id, values: [] };
        }
        next.arrays[id].values[index] = event.value;
        next.spawnedRef = { id, index };
        if (event.isInit === false) {
          next.hasArrayWrites = true;
        }
      } else if (next.nodes[id]) {
        next.nodes[id].value = event.value;
        next.spawnedRef = { id };
      } else {
        // Also support creating/setting scalar or node on the fly
        next.nodes[id] = { id, value: event.value };
        next.spawnedRef = { id };
      }
      break;
    }

    case 'compare': {
      next.comparedRefs = [{ ...event.a }, { ...event.b }];
      break;
    }

    case 'swap': {
      const { a, b } = event;
      if (
        typeof a.index === 'number' &&
        typeof b.index === 'number' &&
        next.arrays[a.id] &&
        next.arrays[b.id]
      ) {
        const valA = next.arrays[a.id].values[a.index] ?? null;
        const valB = next.arrays[b.id].values[b.index] ?? null;
        next.arrays[a.id].values[a.index] = valB;
        next.arrays[b.id].values[b.index] = valA;
        next.hasArrayWrites = true;
      } else if (next.nodes[a.id] && next.nodes[b.id]) {
        const valA = next.nodes[a.id].value;
        next.nodes[a.id].value = next.nodes[b.id].value;
        next.nodes[b.id].value = valA;
      }
      next.swappedRefs = [{ ...a }, { ...b }];
      break;
    }

    case 'link': {
      const existingIdx = next.edges.findIndex(
        (e) =>
          e.from === event.from &&
          (event.label ? e.label === event.label : e.to === event.to),
      );
      if (existingIdx >= 0) {
        next.edges[existingIdx] = {
          from: event.from,
          to: event.to,
          label: event.label,
        };
      } else {
        next.edges.push({
          from: event.from,
          to: event.to,
          label: event.label,
        });
      }
      break;
    }

    case 'unlink': {
      next.edges = next.edges.filter(
        (e) => !(e.from === event.from && e.to === event.to),
      );
      break;
    }

    case 'remove': {
      // Support removing either an array element "arr[2]" or a node/array id
      const match = /^([^[\]]+)\[(\d+)\]$/.exec(event.id);
      if (match) {
        const arrId = match[1];
        const idx = Number(match[2]);
        if (next.arrays[arrId]) {
          next.arrays[arrId].values.splice(idx, 1);
        }
      } else {
        delete next.nodes[event.id];
        delete next.arrays[event.id];
        next.edges = next.edges.filter(
          (e) => e.from !== event.id && e.to !== event.id,
        );
      }
      next.removedId = event.id;
      break;
    }

    case 'visit': {
      next.activeVisitId = event.id;
      if (!next.visitedOrder.includes(event.id)) {
        next.visitedOrder.push(event.id);
      }
      break;
    }

    case 'call': {
      next.callStack.push({
        fn: event.fn,
        args: [...event.args],
        depth: event.depth,
      });
      break;
    }

    case 'return': {
      if (next.callStack.length > 0) {
        next.callStack.pop();
      }
      break;
    }

    case 'truncated': {
      next.truncatedReason = event.reason;
      next.narration = `Trace truncated: ${event.reason}`;
      next.isDone = true;
      break;
    }

    case 'done': {
      next.isDone = true;
      break;
    }
  }

  return next;
}

/**
 * Keyframed Trace Timeline
 *
 * Precomputes periodic state snapshots every `keyframeInterval` steps so that
 * stepping backward or scrubbing to any step index takes at most `keyframeInterval`
 * lightweight reducer applications—never re-running the algorithm.
 */
export class TraceTimeline {
  public readonly events: readonly TraceEvent[];
  public readonly keyframeInterval: number;
  private readonly keyframes: Map<number, TraceStateSnapshot> = new Map();

  constructor(
    events: TraceEvent[],
    keyframeInterval: number = DEFAULT_KEYFRAME_INTERVAL,
  ) {
    this.events = events;
    this.keyframeInterval = Math.max(1, keyframeInterval);
    this.buildKeyframes();
  }

  private buildKeyframes(): void {
    let current = createEmptySnapshot();
    this.keyframes.set(0, cloneSnapshot(current));

    for (let i = 0; i < this.events.length; i++) {
      const stepNum = i + 1;
      current = applyTraceEvent(current, this.events[i], stepNum);
      if (stepNum % this.keyframeInterval === 0 || stepNum === this.events.length) {
        this.keyframes.set(stepNum, cloneSnapshot(current));
      }
    }
  }

  public get totalSteps(): number {
    return this.events.length;
  }

  public get keyframeCount(): number {
    return this.keyframes.size;
  }

  /**
   * Reconstructs the exact snapshot at `targetStep` (0 <= targetStep <= totalSteps)
   * starting from the nearest keyframe <= targetStep.
   */
  public getSnapshotAt(targetStep: number): TraceStateSnapshot {
    const clamped = Math.max(0, Math.min(this.events.length, Math.floor(targetStep)));
    const exactKeyframe = this.keyframes.get(clamped);
    if (exactKeyframe) {
      return cloneSnapshot(exactKeyframe);
    }

    const baseStep =
      Math.floor(clamped / this.keyframeInterval) * this.keyframeInterval;
    let state = cloneSnapshot(this.keyframes.get(baseStep) ?? createEmptySnapshot());

    for (let step = baseStep + 1; step <= clamped; step++) {
      state = applyTraceEvent(state, this.events[step - 1], step);
    }

    return state;
  }
}

