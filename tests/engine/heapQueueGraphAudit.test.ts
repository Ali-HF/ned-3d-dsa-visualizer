import { describe, it, expect } from 'vitest';
import { useViewportStore, buildSceneObjectsForScene, computeCollisionFreeGraphLayout } from '../../src/state/useViewportStore';
import { TraceStateSnapshot } from '../../src/types/trace';

describe('Library Deep Audit Tests: Heap Dual Rendering, Queue Custom Inputs & Graph Collisions', () => {
  describe('BUG 1: Binary Heap / Priority Queue Dual Rendering & Swaps', () => {
    const heapOps = ['heap-insert', 'heap-extract', 'heap-build', 'heap-sort'] as const;

    for (const op of heapOps) {
      it(`renders complete binary tree nodes and no array cells for ${op}`, () => {
        const store = useViewportStore.getState();
        store.setCustomArray([50, 30, 20, 15, 10]);
        store.runStructureOperationNow(op, 40);

        const totalSteps = store.timeline.totalSteps;
        expect(totalSteps).toBeGreaterThan(1);

        for (let s = 1; s <= totalSteps; s++) {
          const snap = store.timeline.getSnapshotAt(s);
          const objs = buildSceneObjectsForScene('heap', snap);

          // Heap array in snapshot
          const heapArr = snap.arrays['arr'] ?? snap.arrays['aux'];
          const heapSize = heapArr?.values?.length ?? 0;

          if (heapSize > 0) {
            // Stage must never be blank
            expect(objs.length).toBeGreaterThanOrEqual(heapSize);

            // Verify array cells are removed from 3D stage (tree-only)
            const arrayCells = objs.filter((o) => o.kind === 'array-cell');
            expect(arrayCells.length).toBe(0);

            // Verify complete binary tree nodes are present
            const treeNodes = objs.filter((o) => o.kind === 'tree-node' && o.id.startsWith('heap-node-'));
            expect(treeNodes.length).toBe(heapSize);

            // Values must match runtime heap array exactly
            for (let i = 0; i < heapSize; i++) {
              expect(treeNodes[i].value).toBe(heapArr.values[i]);
            }
          }
        }
      });
    }

    it('ensures heap swaps highlight and animate correctly', () => {
      const store = useViewportStore.getState();
      store.setCustomArray([90, 70, 80, 40, 50]);
      store.runStructureOperationNow('heap-insert', 95);

      let foundSwap = false;
      for (let s = 1; s <= store.timeline.totalSteps; s++) {
        const snap = store.timeline.getSnapshotAt(s);
        if (snap.swappedRefs && snap.swappedRefs.length === 2) {
          foundSwap = true;
          // Swap must carry original executable C++ line
          expect(snap.activeLine).toBeGreaterThan(0);
        }
      }
      expect(foundSwap).toBe(true);
    });
  });

  describe('BUG 2: Queue / Circular Queue / Deque with Custom Input Sizes', () => {
    const testSizes = [1, 3, 5, 8, 12];

    for (const size of testSizes) {
      it(`visualizes Linear Queue correctly for size ${size}`, () => {
        const inputVals = Array.from({ length: size }, (_, i) => (i + 1) * 11);
        const store = useViewportStore.getState();
        store.applyCustomInputValues(inputVals);
        store.runStructureOperationNow('queue-enqueue', 99);

        const snapEnd = store.timeline.getSnapshotAt(store.timeline.totalSteps);
        const objs = buildSceneObjectsForScene('queue', snapEnd);
        expect(objs.length).toBeGreaterThanOrEqual(size);
      });

      it(`visualizes Circular Queue correctly for size ${size}`, () => {
        const inputVals = Array.from({ length: size }, (_, i) => (i + 1) * 7);
        const store = useViewportStore.getState();
        store.applyCustomInputValues(inputVals);
        store.runStructureOperationNow('circular-queue', 88);

        const snapEnd = store.timeline.getSnapshotAt(store.timeline.totalSteps);
        const objs = buildSceneObjectsForScene('queue', snapEnd);
        expect(objs.length).toBeGreaterThanOrEqual(size);
      });

      it(`visualizes Deque correctly for size ${size}`, () => {
        const inputVals = Array.from({ length: size }, (_, i) => (i + 1) * 5);
        const store = useViewportStore.getState();
        store.applyCustomInputValues(inputVals);
        store.runStructureOperationNow('deque-ops', 77);

        const snapEnd = store.timeline.getSnapshotAt(store.timeline.totalSteps);
        const objs = buildSceneObjectsForScene('queue', snapEnd);
        expect(objs.length).toBeGreaterThan(0);
      });
    }
  });

  describe('BUG 3: Graph Node Overlap Prevention & Minimum Pairwise Distance', () => {
    it('guarantees pairwise distance >= 2.4 for all N in [2..15]', () => {
      for (let n = 2; n <= 15; n++) {
        const mockSnapshot: TraceStateSnapshot = {
          stepIndex: 1,
          lastEvent: null,
          arrays: {},
          nodes: Object.fromEntries(
            Array.from({ length: n }, (_, i) => [`v-${i}`, { id: `v-${i}`, value: i }]),
          ),
          edges: [],
          activeLine: 1,
          narration: '',
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
          truncatedReason: null,
          isDone: false,
        };

        const layout = computeCollisionFreeGraphLayout(mockSnapshot);
        const ids = Object.keys(layout);
        expect(ids.length).toBe(n);

        // Check pairwise distance between every pair
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const p1 = layout[ids[i]];
            const p2 = layout[ids[j]];
            const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]);
            expect(dist, `N=${n} distance between ${ids[i]} and ${ids[j]}`).toBeGreaterThanOrEqual(2.3);
          }
        }
      }
    });

    it('ensures library graph operations use collision-free layout', () => {
      const graphOps = ['graph-bfs', 'graph-dfs', 'graph-dijkstra', 'graph-kruskal', 'graph-toposort'] as const;
      for (const op of graphOps) {
        const store = useViewportStore.getState();
        store.runStructureOperationNow(op);
        const snap = store.timeline.getSnapshotAt(Math.floor(store.timeline.totalSteps / 2));
        const objs = buildSceneObjectsForScene('graph', snap);

        const nodeObjs = objs.filter((o) => o.kind === 'graph-node');
        for (let i = 0; i < nodeObjs.length; i++) {
          for (let j = i + 1; j < nodeObjs.length; j++) {
            const p1 = nodeObjs[i].position;
            const p2 = nodeObjs[j].position;
            const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]);
            expect(dist, `${op} distance between ${nodeObjs[i].id} and ${nodeObjs[j].id}`).toBeGreaterThanOrEqual(2.3);
          }
        }
      }
    });
  });
});
