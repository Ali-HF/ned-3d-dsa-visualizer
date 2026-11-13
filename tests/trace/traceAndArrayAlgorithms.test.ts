import { describe, it, expect } from 'vitest';
import { TraceTimeline, applyTraceEvent, createEmptySnapshot } from '../../src/engine/traceEngine';
import {
  bubbleSortTrace,
  selectionSortTrace,
  insertionSortTrace,
  mergeSortTrace,
  quickSortTrace,
  arrayInsertAtTrace,
  arrayDeleteAtTrace,
  arrayDeleteByValueTrace,
  arrayUpdateAtTrace,
  arrayLinearSearchTrace,
  arrayBinarySearchTrace,
  arrayReverseTrace,
  arrayRotateTrace,
  arrayRotateRightTrace,
} from '../../src/algorithms/array/arrayAlgorithms';
import { useViewportStore } from '../../src/state/useViewportStore';

const SORT_CASES: { name: string; input: number[] }[] = [
  { name: 'random unsorted', input: [42, 17, 68, 29, 84, 12] },
  { name: 'reverse sorted', input: [90, 70, 50, 30, 10] },
  { name: 'already sorted', input: [5, 10, 15, 20] },
  { name: 'duplicates', input: [30, 10, 30, 20, 10] },
  { name: 'single element', input: [99] },
  { name: 'empty array', input: [] },
];

describe('Phase 2 — Trace Engine Keyframes & Replay Fidelity', () => {
  it('reconstructs identical state at every step via keyframes vs linear replay', () => {
    const { events } = quickSortTrace([42, 17, 68, 29, 84, 12]);
    const timeline = new TraceTimeline(events, 5); // small keyframe interval to test boundary crossings

    let linearSnap = createEmptySnapshot();
    for (let step = 1; step <= timeline.totalSteps; step++) {
      linearSnap = applyTraceEvent(linearSnap, events[step - 1], step);
      const keyframedSnap = timeline.getSnapshotAt(step);
      expect(keyframedSnap.arrays).toEqual(linearSnap.arrays);
      expect(keyframedSnap.activeLine).toBe(linearSnap.activeLine);
      expect(keyframedSnap.narration).toBe(linearSnap.narration);
      expect(keyframedSnap.visitedOrder).toEqual(linearSnap.visitedOrder);
      expect(keyframedSnap.callStack).toEqual(linearSnap.callStack);
    }
  });

  it('supports stepping backward from the end of a trace without re-running the algorithm', () => {
    const { events } = mergeSortTrace([50, 20, 40, 10, 30]);
    const timeline = new TraceTimeline(events, 8);

    const endSnap = timeline.getSnapshotAt(timeline.totalSteps);
    expect(endSnap.arrays['arr']?.values).toEqual([10, 20, 30, 40, 50]);
    expect(endSnap.isDone).toBe(true);

    const midStep = Math.floor(timeline.totalSteps / 2);
    const midSnapA = timeline.getSnapshotAt(midStep);
    const midSnapB = timeline.getSnapshotAt(midStep);
    expect(midSnapA).toEqual(midSnapB);
  });
});

describe('Phase 2 — Sorting Algorithms Trace Replay Verification', () => {
  const sorters = [
    { label: 'Bubble Sort', fn: bubbleSortTrace },
    { label: 'Selection Sort', fn: selectionSortTrace },
    { label: 'Insertion Sort', fn: insertionSortTrace },
    { label: 'Merge Sort', fn: mergeSortTrace },
    { label: 'Quick Sort', fn: quickSortTrace },
  ];

  for (const sorter of sorters) {
    describe(sorter.label, () => {
      for (const testCase of SORT_CASES) {
        it(`sorts ${testCase.name} [${testCase.input.join(', ')}] and replays trace to exact sorted state`, () => {
          const expected = [...testCase.input].sort((a, b) => a - b);
          const result = sorter.fn(testCase.input);
          expect(result.finalArray).toEqual(expected);

          const timeline = new TraceTimeline(result.events);
          const finalSnap = timeline.getSnapshotAt(timeline.totalSteps);
          expect(finalSnap.arrays['arr']?.values ?? []).toEqual(expected);
          expect(finalSnap.isDone).toBe(true);
        });
      }
    });
  }
});

describe('Phase 2 — Section 4.1 Array Operations & Queue Chaining', () => {
  it('inserts at index and shifts elements right in the trace', () => {
    const res = arrayInsertAtTrace([10, 20, 30, 40], 2, 99);
    const timeline = new TraceTimeline(res.events);
    const finalSnap = timeline.getSnapshotAt(timeline.totalSteps);
    expect(finalSnap.arrays['arr']?.values).toEqual([10, 20, 99, 30, 40]);
  });

  it('deletes at index, shifts left, and emits a remove event', () => {
    const res = arrayDeleteAtTrace([10, 20, 30, 40], 1);
    expect(res.events.some((e) => e.t === 'remove')).toBe(true);
    const timeline = new TraceTimeline(res.events);
    const finalSnap = timeline.getSnapshotAt(timeline.totalSteps);
    expect(finalSnap.arrays['arr']?.values).toEqual([10, 30, 40]);
  });

  it('updates value at index directly', () => {
    const res = arrayUpdateAtTrace([10, 20, 30], 1, 777);
    const timeline = new TraceTimeline(res.events);
    const finalSnap = timeline.getSnapshotAt(timeline.totalSteps);
    expect(finalSnap.arrays['arr']?.values).toEqual([10, 777, 30]);
  });

  it('performs linear search and records visited order badges', () => {
    const res = arrayLinearSearchTrace([15, 25, 35, 45], 35);
    const timeline = new TraceTimeline(res.events);
    const finalSnap = timeline.getSnapshotAt(timeline.totalSteps);
    expect(finalSnap.visitedOrder).toEqual(['arr[0]', 'arr[1]', 'arr[2]']);
    expect(finalSnap.narration).toContain('Found target 35 at index 2');
  });

  it('performs binary search and emits comparison and note captions', () => {
    const res = arrayBinarySearchTrace([10, 20, 30, 40, 50, 60, 70], 60);
    const timeline = new TraceTimeline(res.events);
    const finalSnap = timeline.getSnapshotAt(timeline.totalSteps);
    expect(finalSnap.narration).toContain('Target found at index 5');
  });

  it('throws an error note when binary search is called on an unsorted array', () => {
    const res = arrayBinarySearchTrace([42, 17, 68, 29], 29);
    const timeline = new TraceTimeline(res.events);
    const finalSnap = timeline.getSnapshotAt(timeline.totalSteps);
    expect(finalSnap.narration).toContain('needs to be sorted first');
    expect(res.finalArray).toEqual([42, 17, 68, 29]);
  });

  it('reverses and rotates arrays accurately', () => {
    const rev = arrayReverseTrace([1, 2, 3, 4, 5]);
    const revSnap = new TraceTimeline(rev.events).getSnapshotAt(rev.events.length);
    expect(revSnap.arrays['arr']?.values).toEqual([5, 4, 3, 2, 1]);

    const rot = arrayRotateTrace([10, 20, 30, 40], 2);
    const rotSnap = new TraceTimeline(rot.events).getSnapshotAt(rot.events.length);
    expect(rotSnap.arrays['arr']?.values).toEqual([30, 40, 10, 20]);

    const rotRight = arrayRotateRightTrace([10, 20, 30, 40], 1);
    const rotRightSnap = new TraceTimeline(rotRight.events).getSnapshotAt(rotRight.events.length);
    expect(rotRightSnap.arrays['arr']?.values).toEqual([40, 10, 20, 30]);
  });

  it('deletes by value when found and reports not found when absent', () => {
    const found = arrayDeleteByValueTrace([10, 20, 30, 40], 20);
    const foundSnap = new TraceTimeline(found.events).getSnapshotAt(found.events.length);
    expect(foundSnap.arrays['arr']?.values).toEqual([10, 30, 40]);

    const missing = arrayDeleteByValueTrace([10, 20, 30], 99);
    const missingSnap = new TraceTimeline(missing.events).getSnapshotAt(missing.events.length);
    expect(missingSnap.arrays['arr']?.values).toEqual([10, 20, 30]);
    expect(missingSnap.narration.toLowerCase()).toContain('not found');
  });

  it('chains multiple operations in the store queue and replays the full sequence', () => {
    const store = useViewportStore.getState();
    store.setCustomArray([30, 10, 20]);
    store.runOperationNow('insert-at', 1, 50); // -> [30, 50, 10, 20]
    store.queueOperation('delete-at', 0); // -> [50, 10, 20]
    store.queueOperation('bubble-sort'); // -> [10, 20, 50]

    const updated = useViewportStore.getState();
    expect(updated.operationHistory.length).toBe(3);

    updated.skipToEnd();
    const endState = useViewportStore.getState();
    expect(endState.currentSnapshot.arrays['arr']?.values).toEqual([10, 20, 50]);
  });
});

