import { useEffect, useMemo, useState } from 'react';
import { BlenderViewport } from './components/viewport/BlenderViewport';
import { useViewportStore } from './state/useViewportStore';
import type { ArrayOperationId } from './algorithms/array/arrayAlgorithms';
import { STRUCTURE_OP_CATALOG } from './algorithms/structures/structureAlgorithms';
import {
  CORPUS_FILE_CATALOG,
  getCorpusRawText,
} from './corpus/cppCorpusRegistry';
import type { PreviewSceneKind } from './types/trace';
import {
  IconCube,
  IconGrid,
  IconPause,
  IconPlay,
  IconRestart,
  IconSkipEnd,
  IconStepBack,
  IconStepForward,
  IconTarget,
  IconWireframe,
} from './components/icons/StudioIcons';

type StitchCategoryTab = 'Sort' | 'Add' | 'Del' | 'Find' | 'Walk';

interface ArrayActionOption {
  id: ArrayOperationId;
  label: string;
  complexity: string;
  tab: StitchCategoryTab;
  needsPosition?: boolean;
  needsNumber?: boolean;
  positionLabel?: string;
  numberLabel?: string;
}

const ARRAY_GUIDE_ACTIONS: ArrayActionOption[] = [
  { id: 'bubble-sort', label: 'Bubble Sort', complexity: 'O(n²)', tab: 'Sort' },
  { id: 'selection-sort', label: 'Selection Sort', complexity: 'O(n²)', tab: 'Sort' },
  { id: 'insertion-sort', label: 'Insertion Sort', complexity: 'O(n²)', tab: 'Sort' },
  { id: 'merge-sort', label: 'Merge Sort', complexity: 'O(n log n)', tab: 'Sort' },
  { id: 'quick-sort', label: 'Quick Sort', complexity: 'O(n log n)', tab: 'Sort' },
  { id: 'reverse', label: 'Reverse Order', complexity: 'O(n)', tab: 'Sort' },
  {
    id: 'rotate',
    label: 'Shift Left',
    complexity: 'O(n)',
    tab: 'Sort',
    needsPosition: true,
    positionLabel: 'Shift steps (k)',
  },
  {
    id: 'insert-at',
    label: 'Insert a Number',
    complexity: 'O(n)',
    tab: 'Add',
    needsPosition: true,
    needsNumber: true,
    positionLabel: 'Index',
    numberLabel: 'Value',
  },
  {
    id: 'update-at',
    label: 'Replace a Number',
    complexity: 'O(1)',
    tab: 'Add',
    needsPosition: true,
    needsNumber: true,
    positionLabel: 'Index',
    numberLabel: 'Value',
  },
  {
    id: 'delete-at',
    label: 'Remove a Number',
    complexity: 'O(n)',
    tab: 'Del',
    needsPosition: true,
    positionLabel: 'Index',
  },
  {
    id: 'linear-search',
    label: 'Linear Search',
    complexity: 'O(n)',
    tab: 'Find',
    needsNumber: true,
    numberLabel: 'Target',
  },
  {
    id: 'binary-search',
    label: 'Binary Search',
    complexity: 'O(log n)',
    tab: 'Find',
    needsNumber: true,
    numberLabel: 'Target',
  },
];

const STRUCTURE_CARDS: {
  id: PreviewSceneKind;
  name: string;
  cppType: string;
  metaTag: string;
  icon: string;
}[] = [
  { id: 'array', name: 'Array', cppType: 'Array<int>', metaTag: '1D • Fixed', icon: '{}' },
  {
    id: 'linked-list',
    name: 'Linked List',
    cppType: 'List<Node*>',
    metaTag: 'Heap • Ptr',
    icon: '⊶⊷',
  },
  { id: 'stack', name: 'Stack', cppType: 'Stack<int>', metaTag: 'LIFO • Top', icon: '☰' },
  {
    id: 'queue',
    name: 'Queue & Deque',
    cppType: 'Queue<int>',
    metaTag: 'FIFO • Ring',
    icon: '⇥',
  },
  {
    id: 'bst',
    name: 'Tree (BST / AVL)',
    cppType: 'BSTNode<int>',
    metaTag: '2-Child • Bal',
    icon: '⑂',
  },
  {
    id: 'heap',
    name: 'Binary Heap',
    cppType: 'MaxHeap<int>',
    metaTag: 'Complete • PQ',
    icon: '△',
  },
  {
    id: 'graph',
    name: 'Graph',
    cppType: 'Graph<V,E>',
    metaTag: 'Adj • Weight',
    icon: '◈',
  },
  {
    id: 'hash-table',
    name: 'Hash Table',
    cppType: 'HashMap<K,V>',
    metaTag: 'Mod • Probe',
    icon: '#',
  },
];

const STITCH_TABS: StitchCategoryTab[] = ['Sort', 'Add', 'Del', 'Find', 'Walk'];

function mapGroupToTab(group: 'Sort' | 'Add' | 'Remove' | 'Find'): StitchCategoryTab {
  if (group === 'Remove') return 'Del';
  return group;
}

export function App() {
  const uiMode = useViewportStore((s) => s.uiMode);
  const setUiMode = useViewportStore((s) => s.setUiMode);
  const detailsOpen = useViewportStore((s) => s.detailsOpen);
  const toggleDetailsOpen = useViewportStore((s) => s.toggleDetailsOpen);

  const appMode = useViewportStore((s) => s.appMode);
  const setAppMode = useViewportStore((s) => s.setAppMode);
  const previewScene = useViewportStore((s) => s.previewScene);
  const setPreviewScene = useViewportStore((s) => s.setPreviewScene);
  const selectedId = useViewportStore((s) => s.selectedId);
  const sceneObjects = useViewportStore((s) => s.sceneObjects);
  const triggerCameraPreset = useViewportStore((s) => s.triggerCameraPreset);
  const showGrid = useViewportStore((s) => s.showGrid);
  const toggleGrid = useViewportStore((s) => s.toggleGrid);
  const wireframe = useViewportStore((s) => s.wireframe);
  const toggleWireframe = useViewportStore((s) => s.toggleWireframe);

  const workingArray = useViewportStore((s) => s.workingArray);
  const activeOperation = useViewportStore((s) => s.activeOperation);
  const activeStructureOp = useViewportStore((s) => s.activeStructureOp);
  const selectedCorpusFile = useViewportStore((s) => s.selectedCorpusFile);
  const activeMetadata = useViewportStore((s) => s.activeMetadata);
  const timeline = useViewportStore((s) => s.timeline);
  const currentStep = useViewportStore((s) => s.currentStep);
  const totalSteps = useViewportStore((s) => s.totalSteps);
  const currentSnapshot = useViewportStore((s) => s.currentSnapshot);
  const isPlaying = useViewportStore((s) => s.isPlaying);
  const playbackSpeed = useViewportStore((s) => s.playbackSpeed);

  const togglePlay = useViewportStore((s) => s.togglePlay);
  const stepForward = useViewportStore((s) => s.stepForward);
  const stepBackward = useViewportStore((s) => s.stepBackward);
  const restart = useViewportStore((s) => s.restart);
  const skipToEnd = useViewportStore((s) => s.skipToEnd);
  const seekToStep = useViewportStore((s) => s.seekToStep);
  const setPlaybackSpeed = useViewportStore((s) => s.setPlaybackSpeed);
  const setCustomArray = useViewportStore((s) => s.setCustomArray);
  const runOperationNow = useViewportStore((s) => s.runOperationNow);
  const runStructureOperationNow = useViewportStore((s) => s.runStructureOperationNow);
  const selectAndRunCorpusFile = useViewportStore((s) => s.selectAndRunCorpusFile);

  const [structPickerOpen, setStructPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<StitchCategoryTab>('Sort');
  const [arrayInputText, setArrayInputText] = useState(workingArray.join(', '));
  const [paramIndex, setParamIndex] = useState<number>(2);
  const [paramValue, setParamValue] = useState<number>(42);
  const [customCodeText, setCustomCodeText] = useState<string>(() =>
    getCorpusRawText('06_elementary_sorting/bubble_sort.cpp'),
  );

  // Compute live comparisons & swaps executed up to currentStep
  const liveStats = useMemo(() => {
    let comparisons = 0;
    let swaps = 0;
    const limit = Math.min(currentStep, timeline.events.length);
    for (let i = 0; i < limit; i++) {
      const ev = timeline.events[i];
      if (ev.t === 'compare') comparisons++;
      else if (ev.t === 'swap') swaps++;
    }
    const totalPasses = Math.max(1, workingArray.length - 1);
    const currentPass = Math.min(
      totalPasses,
      Math.max(1, Math.ceil((currentStep / Math.max(1, totalSteps)) * totalPasses)),
    );
    return {
      comparisons: String(comparisons).padStart(2, '0'),
      swaps: String(swaps).padStart(2, '0'),
      passStr: `${String(currentPass).padStart(2, '0')} / ${String(totalPasses).padStart(2, '0')}`,
    };
  }, [currentStep, totalSteps, timeline.events, workingArray.length]);

  const currentArrayAction =
    ARRAY_GUIDE_ACTIONS.find((a) => a.id === activeOperation) ?? ARRAY_GUIDE_ACTIONS[0];
  const currentStructAction =
    STRUCTURE_OP_CATALOG.find((a) => a.id === activeStructureOp) ??
    STRUCTURE_OP_CATALOG[0];

  const selectedObj = selectedId ? sceneObjects[selectedId] : null;
  const displayedCodeMeta = activeMetadata;

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(45, Math.round(460 / playbackSpeed));
    const timer = window.setInterval(() => {
      useViewportStore.getState().stepForward();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTextInput =
        (e.target instanceof HTMLInputElement &&
          e.target.type !== 'range' &&
          e.target.type !== 'button' &&
          e.target.type !== 'checkbox') ||
        e.target instanceof HTMLTextAreaElement;
      if (isTextInput) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        useViewportStore.getState().pause();
        stepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        useViewportStore.getState().pause();
        stepBackward();
      } else if (e.key === 'Home') {
        e.preventDefault();
        restart();
      } else if (e.key === 'End') {
        e.preventDefault();
        skipToEnd();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        restart();
      } else if (e.key === '0') {
        triggerCameraPreset('isometric');
      } else if (e.key === '1') {
        triggerCameraPreset('front');
      } else if (e.key === '7') {
        triggerCameraPreset('top');
      } else if (e.key === '3') {
        triggerCameraPreset('side');
      } else if (e.key === 'f' || e.key === 'F' || e.key === '.') {
        triggerCameraPreset('focus');
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [
    togglePlay,
    stepForward,
    stepBackward,
    restart,
    skipToEnd,
    triggerCameraPreset,
  ]);

  const parseInputNumbers = (text: string): number[] => {
    const parsed = text
      .split(/[\s,]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
    return parsed.length > 0 ? parsed : [42, 17, 68, 29, 84, 12];
  };

  const handleCommitArrayInput = () => {
    const nums = parseInputNumbers(arrayInputText);
    setCustomArray(nums);
    if (previewScene === 'array') {
      runOperationNow(activeOperation, paramIndex, paramValue);
    } else {
      runStructureOperationNow(activeStructureOp, paramValue);
    }
  };

  const handleRandomizeNumbers = () => {
    const rndVal = Math.floor(Math.random() * 80) + 12;
    const rnd = Array.from({ length: 6 }, () => Math.floor(Math.random() * 85) + 10);
    setParamValue(rndVal);
    setArrayInputText(rnd.join(', '));
    setCustomArray(rnd);
    if (previewScene === 'array') {
      runOperationNow(activeOperation, paramIndex, rndVal);
    } else {
      runStructureOperationNow(activeStructureOp, rndVal);
    }
  };

  const currentStructureCard =
    STRUCTURE_CARDS.find((c) => c.id === previewScene) ?? STRUCTURE_CARDS[0];

  const activeBreadcrumbOp =
    previewScene === 'array'
      ? currentArrayAction.label.replace(/\s+/g, '')
      : currentStructAction.label.replace(/\s+/g, '');

  const progressPct =
    totalSteps > 0 ? ((currentStep / totalSteps) * 100).toFixed(1) : '0.0';

  const showRightDrawer = uiMode === 'pro' || detailsOpen;

  const filteredArrayActions = ARRAY_GUIDE_ACTIONS.filter((a) =>
    activeTab === 'Walk' ? a.tab === 'Sort' : a.tab === activeTab,
  );
  const filteredStructActions = STRUCTURE_OP_CATALOG.filter(
    (a) =>
      a.scene === previewScene &&
      (activeTab === 'Walk'
        ? a.group === 'Sort' || a.group === 'Find'
        : mapGroupToTab(a.group) === activeTab),
  );
  const displayedStructActions =
    filteredStructActions.length > 0
      ? filteredStructActions
      : STRUCTURE_OP_CATALOG.filter((a) => a.scene === previewScene);

  return (
    <div className="stitch-shell">
      {/* 1. TOP HEADER BAR */}
      <header className="stitch-topbar">
        <div className="st-left">
          <div className="st-brand">
            <span className="st-brand-title">DSA Algorithm Studio</span>
            <span className="st-brand-ver">v2.4</span>
          </div>

          <span className="st-divider" />

          <div className="st-mode-tabs">
            <button
              type="button"
              className={`st-tab-btn ${appMode === 'library' ? 'active' : ''}`}
              onClick={() => setAppMode('library')}
            >
              <span className="st-tab-icon">🎓</span>
              <span>Learn</span>
            </button>
            <button
              type="button"
              className={`st-tab-btn ${appMode === 'upload' ? 'active' : ''}`}
              onClick={() => setAppMode('upload')}
            >
              <span className="st-tab-icon">&gt;_</span>
              <span>Run my code</span>
            </button>
          </div>

          <span className="st-divider" />

          <div className="st-breadcrumb">
            <span className="st-bc-type">{currentStructureCard.cppType}</span>
            <span className="st-bc-sep">›</span>
            <span className="st-bc-step">
              {activeBreadcrumbOp}.step_{currentStep}
            </span>
          </div>
        </div>

        <div className="st-right">
          {/* Segmented Mode Pill: Kids | Standard | Pro */}
          <div className="st-seg-group" role="group" aria-label="UI Mode">
            <button
              type="button"
              className={`st-seg-item ${uiMode === 'kids' ? 'active' : ''}`}
              onClick={() => setUiMode('kids')}
            >
              Kids
            </button>
            <button
              type="button"
              className={`st-seg-item ${uiMode === 'standard' ? 'active' : ''}`}
              onClick={() => setUiMode('standard')}
            >
              Standard
            </button>
            <button
              type="button"
              className={`st-seg-item ${uiMode === 'pro' ? 'active' : ''}`}
              onClick={() => setUiMode('pro')}
            >
              Pro
            </button>
          </div>

          {/* Viewport Quick Toggles */}
          <div className="st-icon-group">
            <button
              type="button"
              className={`st-icon-btn ${showGrid ? 'active' : ''}`}
              onClick={toggleGrid}
              title="Toggle Coordinate Grid"
            >
              <IconGrid />
            </button>
            <button
              type="button"
              className={`st-icon-btn ${wireframe ? 'active' : ''}`}
              onClick={toggleWireframe}
              title="Toggle Wireframe Overlay"
            >
              <IconWireframe />
            </button>
            <button
              type="button"
              className="st-icon-btn amber-active"
              onClick={() => triggerCameraPreset('isometric')}
              title="Metallic Rough Studio Shading"
            >
              ☀
            </button>
          </div>

          <span className="st-divider" />

          <button
            type="button"
            className="st-icon-btn"
            onClick={toggleDetailsOpen}
            title="Toggle Code & Inspector Drawer"
          >
            ?
          </button>
          <span className="st-avatar">AS</span>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE AREA */}
      <div
        className={`stitch-workspace ${
          showRightDrawer ? 'with-drawer' : 'no-drawer'
        }`}
      >
        {/* LEFT N-PANEL SIDEBAR */}
        <aside className="stitch-left-panel">
          <div className="st-panel-subheader">
            <span className="st-sub-title">⚙ PARAMETERS</span>
            <span className="st-npanel-badge">N-PANEL</span>
          </div>

          {appMode === 'library' ? (
            <div className="st-cards-scroll">
              {/* CARD 1: Pick Structure */}
              <section className="st-card">
                <div className="st-card-header">
                  <span className="st-step-circle">1</span>
                  <span className="st-card-title">Pick Structure</span>
                  <button
                    type="button"
                    className="st-edit-link"
                    onClick={() => setStructPickerOpen((v) => !v)}
                  >
                    Edit ✎
                  </button>
                </div>

                <button
                  type="button"
                  className="st-struct-well"
                  onClick={() => setStructPickerOpen((v) => !v)}
                >
                  <span className="st-struct-left">
                    <code className="st-struct-glyph">{currentStructureCard.icon}</code>
                    <strong>
                      {currentStructureCard.name} [{Object.keys(sceneObjects).length}]
                    </strong>
                  </span>
                  <span className="st-struct-meta">{currentStructureCard.metaTag}</span>
                </button>

                {structPickerOpen && (
                  <div className="st-struct-dropdown">
                    {STRUCTURE_CARDS.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        className={`st-struct-option ${
                          previewScene === card.id ? 'selected' : ''
                        }`}
                        onClick={() => {
                          setPreviewScene(card.id);
                          setStructPickerOpen(false);
                        }}
                      >
                        <code>{card.icon}</code>
                        <span>{card.name}</span>
                        <small>{card.metaTag}</small>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* CARD 2: Pick Algorithm */}
              <section className="st-card">
                <div className="st-card-header">
                  <span className="st-step-circle active-blue">2</span>
                  <span className="st-card-title">Pick Algorithm</span>
                </div>

                {/* Category Filter Pills: Sort | Add | Del | Find | Walk */}
                <div className="st-filter-pills">
                  {STITCH_TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={`st-pill-tab ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Algorithm List */}
                <div className="st-algo-list">
                  {previewScene === 'array'
                    ? filteredArrayActions.map((item) => {
                        const isSelected = activeOperation === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`st-algo-row ${isSelected ? 'active' : ''}`}
                            onClick={() =>
                              runOperationNow(item.id, paramIndex, paramValue)
                            }
                          >
                            <span className="st-algo-name">
                              {isSelected && <i className="st-blue-dot" />}
                              {item.label}
                            </span>
                            <code className="st-algo-badge">{item.complexity}</code>
                          </button>
                        );
                      })
                    : displayedStructActions.map((item) => {
                        const isSelected = activeStructureOp === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`st-algo-row ${isSelected ? 'active' : ''}`}
                            onClick={() =>
                              runStructureOperationNow(item.id, paramValue)
                            }
                          >
                            <span className="st-algo-name">
                              {isSelected && <i className="st-blue-dot" />}
                              {item.label}
                            </span>
                            <code className="st-algo-badge">{item.timeComplexity}</code>
                          </button>
                        );
                      })}
                </div>
              </section>

              {/* CARD 3: Input Numbers */}
              <section className="st-card">
                <div className="st-card-header">
                  <span className="st-step-circle">3</span>
                  <span className="st-card-title">Input Numbers</span>
                  <button
                    type="button"
                    className="st-edit-link"
                    onClick={handleCommitArrayInput}
                  >
                    Edit ✎
                  </button>
                </div>

                <div className="st-input-well-wrap">
                  <input
                    type="text"
                    className="st-numbers-input"
                    value={arrayInputText}
                    onChange={(e) => setArrayInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommitArrayInput();
                    }}
                    aria-label="Input Numbers"
                  />
                  <button
                    type="button"
                    className="st-refresh-btn"
                    onClick={handleRandomizeNumbers}
                    title="Surprise me (Randomize numbers)"
                  >
                    ↻
                  </button>
                </div>

                {((previewScene === 'array' &&
                  (currentArrayAction.needsPosition ||
                    currentArrayAction.needsNumber)) ||
                  previewScene !== 'array') && (
                  <div className="st-extra-params">
                    {previewScene === 'array' && currentArrayAction.needsPosition && (
                      <label className="st-mini-param">
                        <span>{currentArrayAction.positionLabel ?? 'Idx'}</span>
                        <input
                          type="number"
                          value={paramIndex}
                          min={0}
                          max={20}
                          onChange={(e) => setParamIndex(Number(e.target.value))}
                        />
                      </label>
                    )}
                    <label className="st-mini-param">
                      <span>
                        {previewScene === 'array'
                          ? (currentArrayAction.numberLabel ?? 'Val')
                          : (currentStructAction.numberLabel ?? 'Val')}
                      </span>
                      <input
                        type="number"
                        value={paramValue}
                        onChange={(e) => setParamValue(Number(e.target.value))}
                      />
                    </label>
                    <button
                      type="button"
                      className="st-mini-run-btn"
                      onClick={handleCommitArrayInput}
                    >
                      Run
                    </button>
                  </div>
                )}
              </section>
            </div>
          ) : (
            /* RUN MY CODE TAB: C++ Corpus Selector & Editor */
            <div className="st-cards-scroll">
              <section className="st-card">
                <div className="st-card-header">
                  <span className="st-step-circle active-blue">C++</span>
                  <span className="st-card-title">cpp_corpus/ Files</span>
                </div>
                <select
                  className="st-corpus-select"
                  value={selectedCorpusFile}
                  onChange={(e) => {
                    const path = e.target.value;
                    selectAndRunCorpusFile(path);
                    setCustomCodeText(getCorpusRawText(path));
                  }}
                >
                  {CORPUS_FILE_CATALOG.map((file) => (
                    <option key={file.relativePath} value={file.relativePath}>
                      {file.weekLabel} — {file.title}
                    </option>
                  ))}
                </select>
                <textarea
                  className="st-corpus-textarea"
                  value={customCodeText}
                  onChange={(e) => setCustomCodeText(e.target.value)}
                  rows={13}
                  spellCheck={false}
                />
                <button
                  type="button"
                  className="st-corpus-run-btn"
                  onClick={() => selectAndRunCorpusFile(selectedCorpusFile)}
                >
                  <IconPlay />
                  <span>Visualize on 3D Stage</span>
                </button>
              </section>
            </div>
          )}

          {/* Pinned Bottom Complexity & Live Telemetry Card */}
          <div className="st-telemetry-box">
            <div className="st-tel-head">
              <span>TIME COMPLEXITY</span>
              <strong className="amber">
                {displayedCodeMeta.timeComplexity.toUpperCase()}
              </strong>
            </div>
            <div className="st-tel-row">
              <span>Comparisons:</span>
              <code>{liveStats.comparisons}</code>
            </div>
            <div className="st-tel-row">
              <span>Swaps Executed:</span>
              <code>{liveStats.swaps}</code>
            </div>
            <div className="st-tel-row">
              <span>Pass Phase:</span>
              <code className="cyan">{liveStats.passStr}</code>
            </div>
            <div className="st-tel-row">
              <span>Auxiliary Memory:</span>
              <code className="green">{displayedCodeMeta.spaceComplexity} [0 B]</code>
            </div>
          </div>

          <div className="st-left-footer">
            <span>Grid: 1.00m</span>
            <span>Cam: User Persp</span>
          </div>
        </aside>

        {/* CENTER 3D VIEWPORT */}
        <main className="centre-viewport">
          <BlenderViewport />
        </main>

        {/* OPTIONAL CODE / NODE INSPECTOR DRAWER (Opens when <> or Pro mode clicked) */}
        {showRightDrawer && (
          <aside className="stitch-inspector-drawer" aria-label="Code and Node Inspector">
            {selectedObj && (
              <div className="st-drawer-section">
                <div className="st-drawer-header">
                  <span>ACTIVE MESH INSPECTOR</span>
                  <code>{selectedObj.memoryAddress}</code>
                </div>
                <div className="xyz-vector-triplet">
                  <div className="xyz-cell">
                    <span className="xyz-badge x">X</span>
                    <code className="xyz-val">
                      {selectedObj.position[0].toFixed(2)}
                    </code>
                  </div>
                  <div className="xyz-cell">
                    <span className="xyz-badge y">Y</span>
                    <code className="xyz-val">
                      {selectedObj.position[1].toFixed(2)}
                    </code>
                  </div>
                  <div className="xyz-cell">
                    <span className="xyz-badge z">Z</span>
                    <code className="xyz-val">
                      {selectedObj.position[2].toFixed(2)}
                    </code>
                  </div>
                </div>
              </div>
            )}

            <div className="st-drawer-section code-flex">
              <div className="st-drawer-header">
                <span>C++ SOURCE TRACE</span>
                <code>{selectedCorpusFile.split('/')[1]}</code>
              </div>
              <pre className="code-viewer" aria-label="Algorithm Source Code">
                {displayedCodeMeta.code.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isHighlighted = currentSnapshot.activeLine === lineNum;
                  return (
                    <div
                      key={lineNum}
                      className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
                    >
                      <span className="line-number">{lineNum}</span>
                      <span className="line-text">{line || ' '}</span>
                    </div>
                  );
                })}
              </pre>
            </div>
          </aside>
        )}

        {/* RIGHT SLIM VERTICAL ICON DOCK (32px) */}
        <nav className="stitch-right-dock" aria-label="Viewport Utilities">
          <div className="st-dock-top">
            <button
              type="button"
              className="st-dock-btn"
              onClick={() => triggerCameraPreset('front')}
              title="Front Orthographic Camera (1)"
            >
              🎥
            </button>
            <button
              type="button"
              className="st-dock-btn"
              onClick={() => triggerCameraPreset('isometric')}
              title="3D Perspective Orbit (0)"
            >
              <IconCube />
            </button>
            <button
              type="button"
              className="st-dock-btn"
              onClick={() => triggerCameraPreset('focus')}
              title="Frame Selected (.)"
            >
              <IconTarget />
            </button>
            <div className="st-dock-sep" />
            <button
              type="button"
              className={`st-dock-btn ${detailsOpen ? 'active' : ''}`}
              onClick={toggleDetailsOpen}
              title="Toggle C++ Source Code & Inspector"
            >
              &lt;&gt;
            </button>
          </div>

          <div className="st-dock-bottom">
            <span className="st-doc-vertical">⌄ DOC</span>
          </div>
        </nav>
      </div>

      {/* 3. BOTTOM TIMELINE & TRANSPORT BAR */}
      <footer className="stitch-bottom-bar">
        <div className="st-transport">
          <button
            type="button"
            className="st-tr-btn"
            onClick={restart}
            title="Restart (R)"
            aria-label="Restart"
          >
            <IconRestart />
          </button>
          <button
            type="button"
            className="st-tr-btn"
            onClick={stepBackward}
            disabled={currentStep <= 0}
            title="Previous Step (Left Arrow)"
            aria-label="Previous step"
          >
            <IconStepBack />
          </button>
          <button
            type="button"
            className={`st-tr-play ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlay}
            title="Play / Pause (Space)"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>
          <button
            type="button"
            className="st-tr-btn"
            onClick={stepForward}
            disabled={currentStep >= totalSteps}
            title="Next Step (Right Arrow)"
            aria-label="Next step"
          >
            <IconStepForward />
          </button>
          <button
            type="button"
            className="st-tr-btn"
            onClick={skipToEnd}
            disabled={currentStep >= totalSteps}
            title="Skip to End"
            aria-label="Skip to end"
          >
            <IconSkipEnd />
          </button>
        </div>

        <div className="st-scrubber-area">
          <span className="st-step-readout">
            Step <strong>{currentStep}</strong> / {totalSteps}
          </span>
          <input
            type="range"
            min={0}
            max={totalSteps}
            value={currentStep}
            onChange={(e) => seekToStep(Number(e.target.value))}
            className="st-range-slider"
            aria-label="Timeline Scrubber"
          />
          <span className="st-pct-readout">{progressPct}%</span>
        </div>

        <div className="st-speed-area">
          <div className="st-speed-pill">
            <span className="st-speed-label">Speed:</span>
            <input
              type="range"
              min={0.25}
              max={4}
              step={0.25}
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="st-speed-slider"
              aria-label="Playback Speed"
            />
            <code className="st-speed-val">{playbackSpeed.toFixed(1)}x</code>
          </div>
        </div>
      </footer>
    </div>
  );
}
