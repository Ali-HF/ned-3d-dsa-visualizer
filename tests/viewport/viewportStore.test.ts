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
    expect(Object.keys(useViewportStore.getState().sceneObjects).length).toBeGreaterThan(0);

    store.setPreviewScene('queue');
    expect(useViewportStore.getState().previewScene).toBe('queue');
    expect(Object.keys(useViewportStore.getState().sceneObjects).length).toBeGreaterThan(0);

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
    expect(state.activeMetadata.code.join('\n')).toContain('rightRotate');
  });
});
