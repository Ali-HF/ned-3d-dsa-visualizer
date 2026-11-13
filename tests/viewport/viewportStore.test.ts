import { describe, it, expect, beforeEach } from 'vitest';
import { useViewportStore } from '../../src/state/useViewportStore';
import { getCameraPoseForPreset } from '../../src/components/viewport/cameraPoses';

describe('Phase 1 & 2 — Blender Viewport Store & Camera Presets', () => {
  beforeEach(() => {
    useViewportStore.getState().setPreviewScene('bst');
  });

  it('switches to the BST scene with root node selected', () => {
    const state = useViewportStore.getState();
    expect(state.previewScene).toBe('bst');
    expect(state.selectedId).toBe('bst-50');
    expect(Object.keys(state.sceneObjects).length).toBe(7);
  });

  it('switches between linked-list and live trace array scenes', () => {
    useViewportStore.getState().setPreviewScene('linked-list');
    let state = useViewportStore.getState();
    expect(state.previewScene).toBe('linked-list');
    expect(state.selectedId).toBe('node-head');
    expect(state.sceneObjects['node-head']?.linksTo[0]?.targetId).toBe('node-2');

    useViewportStore.getState().setCustomArray([42, 17, 68, 29, 84, 12]);
    useViewportStore.getState().setPreviewScene('array');
    state = useViewportStore.getState();
    expect(state.previewScene).toBe('array');
    expect(state.selectedId).toBe('arr[0]');
    expect(Object.keys(state.sceneObjects).length).toBe(6);
  });

  it('updates selectedId on click-to-select and clears on background click', () => {
    useViewportStore.getState().selectObject('bst-70');
    expect(useViewportStore.getState().selectedId).toBe('bst-70');

    useViewportStore.getState().selectObject(null);
    expect(useViewportStore.getState().selectedId).toBeNull();
  });

  it('computes accurate camera poses for front, top, side, isometric, and focus-selected', () => {
    const front = getCameraPoseForPreset('front');
    expect(front.position).toEqual([0, 2.2, 13]);

    const top = getCameraPoseForPreset('top');
    expect(top.position[1]).toBeGreaterThan(10);

    const side = getCameraPoseForPreset('side');
    expect(side.position[0]).toBeGreaterThan(10);

    const focus = getCameraPoseForPreset('focus', [2.8, 2.0, -0.8]);
    expect(focus.target).toEqual([2.8, 2.0, -0.8]);
    expect(focus.position[0]).toBeCloseTo(6.3);
  });

  it('pauses autoFollowCamera when manual camera interaction starts', () => {
    const store = useViewportStore.getState();
    if (!store.autoFollowCamera) {
      store.toggleAutoFollowCamera();
    }
    expect(useViewportStore.getState().autoFollowCamera).toBe(true);
    useViewportStore.getState().pauseAutoFollowCamera();
    expect(useViewportStore.getState().autoFollowCamera).toBe(false);
  });

  it('runs interactive 3D traces for Stack, Queue, Heap, Graph, and Hash Table scenes', () => {
    const store = useViewportStore.getState();

    store.setPreviewScene('stack');
    expect(useViewportStore.getState().previewScene).toBe('stack');
    const stackObjs = Object.values(useViewportStore.getState().sceneObjects);
    expect(stackObjs.length).toBeGreaterThan(0);
    expect(stackObjs[0]?.kind).toBe('stack-slab');

    store.setPreviewScene('queue');
    expect(useViewportStore.getState().previewScene).toBe('queue');
    const queueObjs = Object.values(useViewportStore.getState().sceneObjects);
    expect(queueObjs.length).toBeGreaterThan(0);
    expect(queueObjs[0]?.kind).toBe('list-node');

    store.setPreviewScene('heap');
    expect(useViewportStore.getState().previewScene).toBe('heap');
    expect(Object.keys(useViewportStore.getState().sceneObjects).length).toBeGreaterThan(0);

    store.setPreviewScene('graph');
    expect(useViewportStore.getState().previewScene).toBe('graph');
    expect(Object.keys(useViewportStore.getState().sceneObjects).length).toBe(6);

    store.setPreviewScene('hash-table');
    expect(useViewportStore.getState().previewScene).toBe('hash-table');
    expect(Object.keys(useViewportStore.getState().sceneObjects).length).toBeGreaterThan(0);
  });

  it('loads C++ source code directly from cpp_corpus/ when selecting a corpus file', () => {
    const store = useViewportStore.getState();
    store.selectAndRunCorpusFile('12_avl_tree/avl_tree.cpp');
    const state = useViewportStore.getState();
    expect(state.previewScene).toBe('bst');
    expect(state.selectedCorpusFile).toBe('12_avl_tree/avl_tree.cpp');
    expect(state.activeMetadata.code.join('\n')).toContain('rotateRight');
  });

  it('steps forward and backward cleanly between visual note events', () => {
    const store = useViewportStore.getState();
    store.setPreviewScene('bst');
    store.restart();
    const initialStep = useViewportStore.getState().currentStep;
    const initialNarration = useViewportStore.getState().currentSnapshot.narration;

    store.stepForward();
    const nextState = useViewportStore.getState();
    expect(nextState.currentStep).toBeGreaterThan(initialStep);
    expect(nextState.currentSnapshot.narration).not.toBe(initialNarration);

    store.stepBackward();
    expect(useViewportStore.getState().currentStep).toBe(initialStep);
  });

  it('applies custom input numbers across non-array structures and persists mutations', () => {
    const store = useViewportStore.getState();
    store.setCustomArray([11, 22, 33, 44]);
    store.runStructureOperationNow('sll-insert-head', 99);
    const sllState = useViewportStore.getState();
    expect(sllState.previewScene).toBe('linked-list');
    expect(sllState.sceneObjects['node-head']?.value).toBe(11);
    expect(sllState.workingArray[0]).toBe(99);
  });

  it('supports distinct Kids, Standard, and Pro UI modes', () => {
    const store = useViewportStore.getState();
    store.setUiMode('kids');
    expect(useViewportStore.getState().uiMode).toBe('kids');
    store.setUiMode('pro');
    expect(useViewportStore.getState().uiMode).toBe('pro');
    store.setUiMode('standard');
    expect(useViewportStore.getState().uiMode).toBe('standard');
  });

  it('executes custom C++ code with user-edited array literals and operation calls', () => {
    const store = useViewportStore.getState();
    const customCpp = `
      int arr[] = { 91, 14, 73, 28 };
      void quickSort(int arr[], int low, int high) {}
    `;
    store.runCustomCodeNow(customCpp, 'custom_quick.cpp');
    const state = useViewportStore.getState();
    expect(state.previewScene).toBe('array');
    expect(state.workingArray).toEqual([14, 28, 73, 91]);
    expect(state.activeMetadata.title).toContain('custom_quick.cpp');
  });

  it('populates live recursion callStack frames during recursive operations', () => {
    const store = useViewportStore.getState();
    store.runStructureOperationNow('recursion-factorial', 4);
    store.stepForward();
    store.stepForward();
    const state = useViewportStore.getState();
    expect(state.currentSnapshot.callStack.length).toBeGreaterThan(0);
    expect(state.currentSnapshot.callStack[0]?.fn).toBe('factorial');
  });

  it('stops directly on active comparedRefs and swappedRefs steps when stepping through Array and Heap operations', () => {
    const store = useViewportStore.getState();
    store.setCustomArray([42, 17, 68]);
    store.runOperationNow('bubble-sort');

    let sawCompare = false;
    let sawSwap = false;
    for (let i = 0; i < 8; i++) {
      store.stepForward();
      const snap = useViewportStore.getState().currentSnapshot;
      if (snap.comparedRefs) sawCompare = true;
      if (snap.swappedRefs) sawSwap = true;
    }
    expect(sawCompare).toBe(true);
    expect(sawSwap).toBe(true);

    store.runStructureOperationNow('heap-insert', 95);
    let sawHeapSwap = false;
    for (let i = 0; i < 8; i++) {
      store.stepForward();
      const snap = useViewportStore.getState().currentSnapshot;
      if (snap.swappedRefs) sawHeapSwap = true;
    }
    expect(sawHeapSwap).toBe(true);
  });

  it('executes custom C++ loops with swap() and manual temp swaps in the live sandbox', () => {
    const store = useViewportStore.getState();

    // 1. Custom descending sort loop
    const descendingCpp = `
      int main() {
        int arr[] = { 20, 80, 40, 60 };
        for (int i = 0; i < 3; i++) {
          for (int j = 0; j < 3 - i; j++) {
            if (arr[j] < arr[j + 1]) {
              swap(arr[j], arr[j + 1]);
            }
          }
        }
        return 0;
      }
    `;
    store.runCustomCodeNow(descendingCpp, 'descending_sort.cpp');
    let state = useViewportStore.getState();
    expect(state.previewScene).toBe('array');
    expect(state.workingArray).toEqual([80, 60, 40, 20]);
    expect(state.timeline.events.some((e) => e.t === 'swap')).toBe(true);
    expect(state.timeline.events.some((e) => e.t === 'compare')).toBe(true);

    // 2. Manual 3-line temp variable swap
    const tempSwapCpp = `
      int arr[] = { 10, 50, 90 };
      int temp = arr[0];
      arr[0] = arr[2];
      arr[2] = temp;
    `;
    store.runCustomCodeNow(tempSwapCpp, 'temp_swap.cpp');
    state = useViewportStore.getState();
    expect(state.workingArray).toEqual([90, 50, 10]);
    expect(state.timeline.events.some((e) => e.t === 'swap')).toBe(true);
  });

  it('executes multi-step Stack, Queue, and Linked List scripts in Run My Code', () => {
    const store = useViewportStore.getState();

    // Stack script
    store.runCustomCodeNow(
      `
      push(20);
      push(45);
      push(75);
      pop();
      push(92);
      `,
      'stack_script.cpp',
    );
    let state = useViewportStore.getState();
    expect(state.previewScene).toBe('stack');
    expect(state.workingArray).toEqual([20, 45, 92]);

    // Queue script
    store.runCustomCodeNow(
      `
      enqueue(11);
      enqueue(22);
      dequeue();
      enqueue(33);
      `,
      'queue_script.cpp',
    );
    state = useViewportStore.getState();
    expect(state.previewScene).toBe('queue');
    expect(state.workingArray).toEqual([22, 33]);

    // Linked List script
    store.runCustomCodeNow(
      `
      insertHead(5);
      insertTail(99);
      `,
      'sll_script.cpp',
    );
    state = useViewportStore.getState();
    expect(state.previewScene).toBe('linked-list');
    expect(state.workingArray[0]).toBe(5);
    expect(state.workingArray[state.workingArray.length - 1]).toBe(99);
  });

  it('waits for the user to configure values and click Run instead of auto-running on selection', () => {
    const store = useViewportStore.getState();
    store.setCustomArray([10, 20, 30, 40]);
    store.setPreviewScene('array');

    store.selectArrayOperation('insert-at');
    let state = useViewportStore.getState();
    expect(state.activeOperation).toBe('insert-at');
    expect(state.hasPendingOperationRun).toBe(true);
    expect(state.isPlaying).toBe(false);
    expect(state.workingArray).toEqual([10, 20, 30, 40]);
    expect(state.operationHistory.length).toBe(0);

    // User sets custom array values while keeping operation selected
    store.applyCustomInputValues([5, 15, 25]);
    state = useViewportStore.getState();
    expect(state.workingArray).toEqual([5, 15, 25]);
    expect(state.activeOperation).toBe('insert-at');
    expect(state.hasPendingOperationRun).toBe(true);
    expect(state.isPlaying).toBe(false);

    // User explicitly clicks Run with index=1, value=99
    store.runOperationNow('insert-at', 1, 99);
    state = useViewportStore.getState();
    expect(state.workingArray).toEqual([5, 99, 15, 25]);
    expect(state.hasPendingOperationRun).toBe(false);
    expect(state.operationHistory.length).toBe(1);

    // Structure selection & custom values also wait for Run
    store.setPreviewScene('linked-list');
    store.selectStructureOperation('sll-delete-val');
    state = useViewportStore.getState();
    expect(state.previewScene).toBe('linked-list');
    expect(state.activeStructureOp).toBe('sll-delete-val');
    expect(state.hasPendingOperationRun).toBe(true);
    expect(state.isPlaying).toBe(false);

    // Selecting a corpus file in Run Code mode loads without auto-running
    store.selectCorpusFile('07_advanced_sorting/quick_sort.cpp');
    state = useViewportStore.getState();
    expect(state.selectedCorpusFile).toBe('07_advanced_sorting/quick_sort.cpp');
    expect(state.isPlaying).toBe(false);
    expect(state.operationHistory.length).toBe(0);
    expect(state.activeMetadata.title).toContain('quick_sort.cpp');
  });

  it('honors user-supplied values across Linked List, BST, Heap, and Hash Table operations', () => {
    const store = useViewportStore.getState();

    // Linked list search & delete with custom target
    store.applyCustomInputValues([10, 25, 40, 55]);
    store.runStructureOperationNow('sll-delete-val', 25);
    let state = useViewportStore.getState();
    expect(state.workingArray).toEqual([10, 40, 55]);

    store.applyCustomInputValues([10, 25, 40, 55]);
    store.runStructureOperationNow('sll-search', 55);
    state = useViewportStore.getState();
    state.skipToEnd();
    expect(useViewportStore.getState().currentSnapshot.narration).toContain('Found 55 at node #4');

    // BST search for root or missing value, and BST insert on right branch
    store.applyCustomInputValues([20, 30, 40, 50, 60, 70, 85]);
    store.runStructureOperationNow('bst-search', 999);
    useViewportStore.getState().skipToEnd();
    expect(useViewportStore.getState().currentSnapshot.narration).toContain('999 is not in this BST');

    store.runStructureOperationNow('bst-insert', 95);
    useViewportStore.getState().skipToEnd();
    state = useViewportStore.getState();
    expect(state.currentSnapshot.nodes['bst-new']?.value).toBe(95);
    expect(
      state.currentSnapshot.edges.some(
        (e) => e.from === 'bst-85' && e.to === 'bst-new' && e.label === 'right',
      ),
    ).toBe(true);

    // Heap insert of a small number should NOT falsely swap to root
    store.applyCustomInputValues([90, 70, 80, 40, 50]);
    store.runStructureOperationNow('heap-insert', 15);
    useViewportStore.getState().skipToEnd();
    state = useViewportStore.getState();
    expect(state.currentSnapshot.nodes['bst-50']?.value).toBe(90);
    expect(state.currentSnapshot.narration).toContain('no swap is needed');

    // Hash table linear probing uses actual key % 7 (e.g. 21 % 7 = 0, empty!)
    store.runStructureOperationNow('hash-linear', 21);
    useViewportStore.getState().skipToEnd();
    state = useViewportStore.getState();
    expect(state.currentSnapshot.arrays['arr']?.values[0]).toBe(21);
  });
});
