/**
 * Core Trace Model (Section 3 of Specification — Version 3)
 *
 * Every algorithm—whether built-in or uploaded C++/JS—produces an ordered
 * array of TraceEvent objects. The 3D viewport is a pure replay engine that
 * never executes algorithm logic directly.
 */

export type Ref = { id: string; index?: number };
export type Primitive = number | string | boolean | null;

export type TraceEvent =
  | { t: 'line'; line: number }
  | { t: 'create'; id: string; kind: 'array' | 'node' | 'edge'; value?: Primitive }
  | { t: 'set'; target: Ref; value: Primitive }
  | { t: 'compare'; a: Ref; b: Ref }
  | { t: 'swap'; a: Ref; b: Ref }
  | { t: 'link'; from: string; to: string; label?: string }
  | { t: 'unlink'; from: string; to: string }
  | { t: 'remove'; id: string }
  | { t: 'visit'; id: string }
  | { t: 'note'; text: string }
  | { t: 'call'; fn: string; args: Primitive[]; depth: number }
  | { t: 'return'; fn: string; value?: Primitive }
  | { t: 'truncated'; reason: string }
  | { t: 'done' };

/**
 * Inspectable 3D Scene Object
 *
 * Represents any clickable 3D object in the Blender-style viewport
 * (an array cell, a linked-list node, or a tree/graph node).
 */
export interface SceneObjectInfo {
  id: string;
  kind: 'array-cell' | 'list-node' | 'tree-node' | 'graph-node' | 'stack-slab';
  label: string;
  value: Primitive;
  memoryAddress: string;
  position: [number, number, number];
  fields: Record<string, Primitive>;
  linksTo: { label: string; targetId: string }[];
}

export type CameraPreset = 'isometric' | 'front' | 'top' | 'side' | 'focus';

export type PreviewSceneKind =
  | 'array'
  | 'linked-list'
  | 'stack'
  | 'queue'
  | 'bst'
  | 'heap'
  | 'graph'
  | 'hash-table';

/**
 * Reconstructed state at a specific trace step index.
 * Stored periodically at keyframes so step-back and scrubbing are O(1).
 */
export interface ArrayState {
  id: string;
  values: Primitive[];
}

export interface NodeState {
  id: string;
  value: Primitive;
}

export interface EdgeState {
  from: string;
  to: string;
  label?: string;
}

export interface CallStackFrame {
  fn: string;
  args: Primitive[];
  depth: number;
}

export interface TraceStateSnapshot {
  /** Index in the TraceEvent[] array (0 = initial state before event 0) */
  stepIndex: number;
  /** The event that produced this state (null at stepIndex 0) */
  lastEvent: TraceEvent | null;
  /** Active arrays keyed by id (e.g. 'arr', 'aux') */
  arrays: Record<string, ArrayState>;
  /** Active graph/tree/list nodes keyed by id */
  nodes: Record<string, NodeState>;
  /** Directed edges between nodes */
  edges: EdgeState[];
  /** Currently highlighted 1-based line in the code panel */
  activeLine: number | null;
  /** Latest narration caption from { t: 'note' } */
  narration: string;
  /** Currently compared references (for drawing the 3D comparison beam) */
  comparedRefs: [Ref, Ref] | null;
  /** Currently swapped references (for drawing the 3D swap arc) */
  swappedRefs: [Ref, Ref] | null;
  /** Newly created/modified ref in this step (for spawn glow) */
  spawnedRef: Ref | null;
  /** Newly removed id/ref in this step (for shrink/fade-out animation) */
  removedId: string | null;
  /** Currently visited id/ref (for pulsing highlight) */
  activeVisitId: string | null;
  /** Ordered list of visited IDs so far (for #1, #2, #3 badges & output strip) */
  visitedOrder: string[];
  /** Active call stack frames */
  callStack: CallStackFrame[];
  /** Whether the trace was truncated due to step limits */
  truncatedReason: string | null;
  /** Whether execution has reached { t: 'done' } */
  isDone: boolean;
}
