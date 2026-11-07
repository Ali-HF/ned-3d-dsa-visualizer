import { useEffect, useState } from 'react';
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
  IconPlus,
  IconRabbit,
  IconRestart,
  IconSkipEnd,
  IconStepBack,
  IconStepForward,
  IconTarget,
  IconTurtle,
  IconWireframe,
} from './components/icons/StudioIcons';

interface ArrayActionOption {
  id: ArrayOperationId;
  label: string;
  subtitle: string;
  group: 'Sort' | 'Add' | 'Remove' | 'Find';
  needsPosition?: boolean;
  needsNumber?: boolean;
  positionLabel?: string;
  numberLabel?: string;
}

const ARRAY_GUIDE_ACTIONS: ArrayActionOption[] = [
  {
    id: 'bubble-sort',
    label: 'Bubble Sort',
    subtitle: 'Compare neighbours and bubble the biggest number to the end',
    group: 'Sort',
  },
  {
    id: 'selection-sort',
    label: 'Selection Sort',
    subtitle: 'Find the smallest remaining number and move it to the front',
    group: 'Sort',
  },
  {
    id: 'insertion-sort',
    label: 'Insertion Sort',
    subtitle: 'Slide each number left into its sorted spot',
    group: 'Sort',
  },
  {
    id: 'merge-sort',
    label: 'Merge Sort',
    subtitle: 'Split in half, sort each half, and merge them back together',
    group: 'Sort',
  },
  {
    id: 'quick-sort',
    label: 'Quick Sort',
    subtitle: 'Pick a pivot number and partition smaller vs bigger numbers',
    group: 'Sort',
  },
  {
    id: 'reverse',
    label: 'Reverse Order',
    subtitle: 'Flip the array from front to back',
    group: 'Sort',
  },
  {
    id: 'rotate',
    label: 'Shift Left',
    subtitle: 'Move every number left and wrap the first numbers around',
    group: 'Sort',
    needsPosition: true,
    positionLabel: 'How many steps to shift',
  },
  {
    id: 'insert-at',
    label: 'Insert a Number',
    subtitle: 'Shift numbers right to make room and place a new number',
    group: 'Add',
    needsPosition: true,
    needsNumber: true,
    positionLabel: 'At position (0-based)',
    numberLabel: 'Number to add',
  },
  {
    id: 'update-at',
    label: 'Replace a Number',
    subtitle: 'Overwrite the number at a specific position',
    group: 'Add',
    needsPosition: true,
    needsNumber: true,
    positionLabel: 'At position (0-based)',
    numberLabel: 'New number',
  },
  {
    id: 'delete-at',
    label: 'Remove a Number',
    subtitle: 'Delete a number and shift the remaining numbers left',
    group: 'Remove',
    needsPosition: true,
    positionLabel: 'At position (0-based)',
  },
  {
    id: 'linear-search',
    label: 'Linear Search',
    subtitle: 'Check each number one by one from left to right',
    group: 'Find',
    needsNumber: true,
    numberLabel: 'Number to find',
  },
  {
    id: 'binary-search',
    label: 'Binary Search',
    subtitle: 'Jump to the middle of a sorted list and cut the search in half',
    group: 'Find',
    needsNumber: true,
    numberLabel: 'Number to find',
  },
];

const STRUCTURE_CARDS: {
  id: PreviewSceneKind;
  name: string;
  desc: string;
  icon: string;
}[] = [
  { id: 'array', name: 'Array', desc: 'Row of numbered boxes', icon: '▤' },
  { id: 'linked-list', name: 'Linked List', desc: 'Chain of pointer nodes', icon: '⊶⊷' },
  { id: 'stack', name: 'Stack', desc: 'LIFO tower & recursion', icon: '☰' },
  { id: 'queue', name: 'Queue & Deque', desc: 'FIFO line & circular ring', icon: '⇥' },
  { id: 'bst', name: 'Tree (BST / AVL)', desc: 'Binary & self-balancing', icon: '⑂' },
  { id: 'heap', name: 'Binary Heap', desc: 'Max-Heap & Priority Queue', icon: '△' },
  { id: 'graph', name: 'Graph', desc: 'BFS, DFS, MST & Dijkstra', icon: '◈' },
  { id: 'hash-table', name: 'Hash Table', desc: 'Probing & Separate Chains', icon: '#' },
];

const ACTION_GROUPS: ('Sort' | 'Add' | 'Remove' | 'Find')[] = [
  'Sort',
  'Add',
  'Remove',
  'Find',
];

function explainCodeLineInPlainEnglish(line: string, fallbackNarration: string): string {
  const trimmed = line.trim();
  if (!trimmed || trimmed === '{' || trimmed === '}') {
    return fallbackNarration;
  }
  if (trimmed.startsWith('for ')) {
    return 'This loop steps through the positions one by one so every item gets checked.';
  }
  if (trimmed.startsWith('while ')) {
    return 'This loop keeps repeating as long as the condition in parentheses stays true.';
  }
  if (trimmed.includes('swap(')) {
    return 'This line swaps the two items so they trade places in memory.';
  }
  if (trimmed.startsWith('if ')) {
    return 'This line compares values to decide which branch to take next.';
  }
  if (trimmed.startsWith('return ')) {
    return 'This line finishes the function and hands back the result.';
  }
  return fallbackNarration;
}

export function App() {
  const uiMode = useViewportStore((s) => s.uiMode);
  const toggleUiMode = useViewportStore((s) => s.toggleUiMode);
  const detailsOpen = useViewportStore((s) => s.detailsOpen);
  const toggleDetailsOpen = useViewportStore((s) => s.toggleDetailsOpen);

  const appMode = useViewportStore((s) => s.appMode);
  const setAppMode = useViewportStore((s) => s.setAppMode);
  const previewScene = useViewportStore((s) => s.previewScene);
  const setPreviewScene = useViewportStore((s) => s.setPreviewScene);
  const selectedId = useViewportStore((s) => s.selectedId);
  const selectObject = useViewportStore((s) => s.selectObject);
  const sceneObjects = useViewportStore((s) => s.sceneObjects);
  const cameraPreset = useViewportStore((s) => s.cameraPreset);
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
  const currentStep = useViewportStore((s) => s.currentStep);
  const totalSteps = useViewportStore((s) => s.totalSteps);
  const currentSnapshot = useViewportStore((s) => s.currentSnapshot);
  const isPlaying = useViewportStore((s) => s.isPlaying);
  const playbackSpeed = useViewportStore((s) => s.playbackSpeed);
  const autoPlayOnRun = useViewportStore((s) => s.autoPlayOnRun);
  const operationHistory = useViewportStore((s) => s.operationHistory);

  const togglePlay = useViewportStore((s) => s.togglePlay);
  const stepForward = useViewportStore((s) => s.stepForward);
  const stepBackward = useViewportStore((s) => s.stepBackward);
  const restart = useViewportStore((s) => s.restart);
  const skipToEnd = useViewportStore((s) => s.skipToEnd);
  const seekToStep = useViewportStore((s) => s.seekToStep);
  const setPlaybackSpeed = useViewportStore((s) => s.setPlaybackSpeed);
  const toggleAutoPlayOnRun = useViewportStore((s) => s.toggleAutoPlayOnRun);
  const setCustomArray = useViewportStore((s) => s.setCustomArray);
  const runOperationNow = useViewportStore((s) => s.runOperationNow);
  const runStructureOperationNow = useViewportStore((s) => s.runStructureOperationNow);
  const selectAndRunCorpusFile = useViewportStore((s) => s.selectAndRunCorpusFile);
  const queueOperation = useViewportStore((s) => s.queueOperation);

  // 3-step accordion state in the left column (only 1 step expanded at a time)
  const [guideStep, setGuideStep] = useState<1 | 2 | 3>(2);
  const [arrayInputText, setArrayInputText] = useState(workingArray.join(', '));
  const [paramIndex, setParamIndex] = useState<number>(2);
  const [paramValue, setParamValue] = useState<number>(42);
  const [customCodeText, setCustomCodeText] = useState<string>(() =>
    getCorpusRawText('06_elementary_sorting/bubble_sort.cpp'),
  );

  const currentArrayAction =
    ARRAY_GUIDE_ACTIONS.find((a) => a.id === activeOperation) ?? ARRAY_GUIDE_ACTIONS[0];
  const currentStructAction =
    STRUCTURE_OP_CATALOG.find((a) => a.id === activeStructureOp) ??
    STRUCTURE_OP_CATALOG[0];

  const activeActionSummary =
    previewScene === 'array' ? currentArrayAction.label : currentStructAction.label;

  const selectedObj = selectedId ? sceneObjects[selectedId] : null;
  const displayedCodeMeta = activeMetadata;

  const highlightedLineIndex = (currentSnapshot.activeLine ?? 1) - 1;
  const highlightedLineText =
    displayedCodeMeta.code[highlightedLineIndex] ?? displayedCodeMeta.code[0] ?? '';
  const plainCodeExplanation = explainCodeLineInPlainEnglish(
    highlightedLineText,
    currentSnapshot.narration,
  );

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(45, Math.round(460 / playbackSpeed));
    const timer = window.setInterval(() => {
      useViewportStore.getState().stepForward();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Keyboard shortcuts for camera presets and playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
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
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    stepForward,
    stepBackward,
    restart,
    triggerCameraPreset,
  ]);

  const parseInputNumbers = (text: string): number[] => {
    const parsed = text
      .split(/[\s,]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
    return parsed.length > 0 ? parsed : [42, 17, 68, 29, 84, 12];
  };

  const handleApplyAndRun = () => {
    if (previewScene === 'array') {
      const nums = parseInputNumbers(arrayInputText);
      setCustomArray(nums);
      runOperationNow(activeOperation, paramIndex, paramValue);
    } else {
      runStructureOperationNow(activeStructureOp, paramValue);
    }
  };

  const handleSurpriseMe = () => {
    const rndVal = Math.floor(Math.random() * 80) + 12;
    setParamValue(rndVal);
    if (previewScene === 'array') {
      const rnd = Array.from({ length: 6 }, () => Math.floor(Math.random() * 85) + 10);
      setArrayInputText(rnd.join(', '));
      setCustomArray(rnd);
      runOperationNow(activeOperation, paramIndex, rndVal);
    } else {
      runStructureOperationNow(activeStructureOp, rndVal);
    }
  };

  const currentStructureCard =
    STRUCTURE_CARDS.find((c) => c.id === previewScene) ?? STRUCTURE_CARDS[0];

  const showRightSidebar = uiMode === 'pro' || detailsOpen;

  return (
    <div className="app-shell">
      {/* Top Studio Bar (Level 1 Dock Shell) */}
      <header className="app-header">
        <div className="brand-title">
          <span className="brand-mark">DSA</span>
          <span className="brand-name">Algorithm Studio</span>
        </div>

        <div className="workspace-tabs" role="tablist" aria-label="Workspace Mode">
          <button
            type="button"
            className={`ws-tab ${appMode === 'library' ? 'active' : ''}`}
            onClick={() => setAppMode('library')}
          >
            Learn
          </button>
          <button
            type="button"
            className={`ws-tab ${appMode === 'upload' ? 'active' : ''}`}
            onClick={() => setAppMode('upload')}
          >
            Run my code
          </button>
        </div>

        <div className="header-right-actions">
          {uiMode === 'standard' && (
            <button
              type="button"
              className={`details-drawer-toggle ${detailsOpen ? 'active' : ''}`}
              onClick={toggleDetailsOpen}
              title="Show or hide the code details drawer"
            >
              <span>{detailsOpen ? 'Hide Details' : 'Details'}</span>
              <span>{detailsOpen ? '›' : '‹'}</span>
            </button>
          )}

          <button
            type="button"
            className={`mode-switch-btn ${uiMode === 'pro' ? 'pro-active' : ''}`}
            onClick={toggleUiMode}
            title="Switch between clean Standard mode and full Pro developer mode"
          >
            <span className="mode-label">Mode:</span>
            <strong>{uiMode === 'standard' ? 'Standard' : 'Pro'}</strong>
          </button>
        </div>
      </header>

      {/* Main DCC Workbench Grid: Tool Ribbon + Left Outliner/Guide + Central Viewport + Right Inspector */}
      <div className={`workspace-grid ${showRightSidebar ? 'with-right' : 'no-right'}`}>
        {/* DOCKED VERTICAL ICON RIBBON (38px Fixed Width DCC Tool Shelf) */}
        <nav className="dcc-tool-ribbon" aria-label="Viewport Tool Shelf">
          <button
            type="button"
            className={`dcc-tool-btn ${cameraPreset === 'isometric' ? 'active' : ''}`}
            onClick={() => triggerCameraPreset('isometric')}
            title="Perspective Orbit View (Numpad 0)"
          >
            <IconCube />
          </button>
          <button
            type="button"
            className={`dcc-tool-btn ${cameraPreset === 'top' ? 'active' : ''}`}
            onClick={() => triggerCameraPreset('top')}
            title="Top Orthographic View (Numpad 7)"
          >
            <IconTarget />
          </button>
          <div className="dcc-ribbon-sep" />
          <button
            type="button"
            className={`dcc-tool-btn ${showGrid ? 'active' : ''}`}
            onClick={toggleGrid}
            title="Toggle Coordinate Floor Grid"
          >
            <IconGrid />
          </button>
          <button
            type="button"
            className={`dcc-tool-btn ${wireframe ? 'active' : ''}`}
            onClick={toggleWireframe}
            title="Toggle Wireframe Topology"
          >
            <IconWireframe />
          </button>
          <div className="dcc-ribbon-sep" />
          <button
            type="button"
            className={`dcc-tool-btn ${isPlaying ? 'active' : ''}`}
            onClick={togglePlay}
            title="Compute / Play Simulation (Space)"
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>
        </nav>

        {/* LEFT DOCK: 3-Step Guide (in Learn mode) OR C++ Corpus Runner (in Run my code mode) */}
        <aside className="left-panel">
          {appMode === 'library' ? (
            <div className="step-guide-container">
              {/* STEP 1: Pick a structure */}
              <section
                className={`guide-step-card ${guideStep === 1 ? 'expanded' : 'collapsed'}`}
              >
                <button
                  type="button"
                  className="guide-step-header"
                  onClick={() => setGuideStep(1)}
                >
                  <span className="dcc-caret" aria-hidden="true">
                    ▸
                  </span>
                  <span className="guide-step-num">1</span>
                  <span className="guide-step-title">Pick a structure</span>
                  <span className="guide-step-summary">{currentStructureCard.name}</span>
                </button>

                {guideStep === 1 && (
                  <div className="guide-step-body">
                    <div className="structure-cards-grid two-col">
                      {STRUCTURE_CARDS.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          className={`structure-big-card compact-card ${
                            previewScene === card.id ? 'selected' : ''
                          }`}
                          onClick={() => {
                            setPreviewScene(card.id);
                            setGuideStep(2);
                          }}
                        >
                          <span className="struct-icon">{card.icon}</span>
                          <div className="struct-text">
                            <strong>{card.name}</strong>
                            <span>{card.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* STEP 2: Pick what to do */}
              <section
                className={`guide-step-card ${guideStep === 2 ? 'expanded' : 'collapsed'}`}
              >
                <button
                  type="button"
                  className="guide-step-header"
                  onClick={() => setGuideStep(2)}
                >
                  <span className="dcc-caret" aria-hidden="true">
                    ▸
                  </span>
                  <span className="guide-step-num">2</span>
                  <span className="guide-step-title">Pick what to do</span>
                  <span className="guide-step-summary">{activeActionSummary}</span>
                </button>

                {guideStep === 2 && (
                  <div className="guide-step-body">
                    {previewScene === 'array'
                      ? ACTION_GROUPS.map((groupName) => {
                          const items = ARRAY_GUIDE_ACTIONS.filter(
                            (a) => a.group === groupName,
                          );
                          return (
                            <div key={groupName} className="action-group-block">
                              <div className="action-group-heading">{groupName}</div>
                              <div className="action-group-list">
                                {items.map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    className={`action-choice-btn ${
                                      activeOperation === item.id ? 'active' : ''
                                    }`}
                                    onClick={() => {
                                      runOperationNow(item.id, paramIndex, paramValue);
                                      if (item.needsNumber || item.needsPosition) {
                                        setGuideStep(3);
                                      }
                                    }}
                                  >
                                    <span className="action-choice-name">
                                      {item.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      : ACTION_GROUPS.map((groupName) => {
                          const items = STRUCTURE_OP_CATALOG.filter(
                            (a) => a.scene === previewScene && a.group === groupName,
                          );
                          if (items.length === 0) return null;
                          return (
                            <div key={groupName} className="action-group-block">
                              <div className="action-group-heading">{groupName}</div>
                              <div className="action-group-list">
                                {items.map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    className={`action-choice-btn ${
                                      activeStructureOp === item.id ? 'active' : ''
                                    }`}
                                    onClick={() => {
                                      runStructureOperationNow(item.id, paramValue);
                                      if (item.needsNumber) {
                                        setGuideStep(3);
                                      }
                                    }}
                                  >
                                    <span className="action-choice-name">
                                      {item.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                  </div>
                )}
              </section>

              {/* STEP 3: Your numbers */}
              <section
                className={`guide-step-card ${guideStep === 3 ? 'expanded' : 'collapsed'}`}
              >
                <button
                  type="button"
                  className="guide-step-header"
                  onClick={() => setGuideStep(3)}
                >
                  <span className="dcc-caret" aria-hidden="true">
                    ▸
                  </span>
                  <span className="guide-step-num">3</span>
                  <span className="guide-step-title">Your numbers</span>
                  <span className="guide-step-summary">
                    {previewScene === 'array'
                      ? `${workingArray.slice(0, 4).join(', ')}…`
                      : `Value: ${paramValue}`}
                  </span>
                </button>

                {guideStep === 3 && (
                  <div className="guide-step-body">
                    {previewScene === 'array' && (
                      <label className="field-block">
                        <span className="field-label">
                          Starting numbers (comma-separated)
                        </span>
                        <input
                          type="text"
                          className="studio-input large"
                          value={arrayInputText}
                          onChange={(e) => setArrayInputText(e.target.value)}
                          aria-label="Your numbers"
                          placeholder="42, 17, 68, 29, 84, 12"
                        />
                      </label>
                    )}

                    {previewScene === 'array' && currentArrayAction.needsPosition && (
                      <label className="field-block">
                        <span className="field-label">
                          {currentArrayAction.positionLabel ?? 'Position'}
                        </span>
                        <input
                          type="number"
                          className="studio-input large"
                          value={paramIndex}
                          min={0}
                          max={20}
                          onChange={(e) => setParamIndex(Number(e.target.value))}
                        />
                      </label>
                    )}

                    {((previewScene === 'array' && currentArrayAction.needsNumber) ||
                      (previewScene !== 'array' && currentStructAction.needsNumber) ||
                      previewScene !== 'array') && (
                      <label className="field-block">
                        <span className="field-label">
                          {previewScene === 'array'
                            ? (currentArrayAction.numberLabel ?? 'Number')
                            : (currentStructAction.numberLabel ?? 'Number value')}
                        </span>
                        <input
                          type="number"
                          className="studio-input large"
                          value={paramValue}
                          onChange={(e) => setParamValue(Number(e.target.value))}
                        />
                      </label>
                    )}

                    <div className="step3-btn-row">
                      <button
                        type="button"
                        className="studio-btn primary large"
                        onClick={handleApplyAndRun}
                      >
                        Apply &amp; Run
                      </button>
                      <button
                        type="button"
                        className="studio-btn surprise-btn large"
                        onClick={handleSurpriseMe}
                      >
                        Surprise me
                      </button>
                    </div>

                    {uiMode === 'pro' && previewScene === 'array' && (
                      <button
                        type="button"
                        className="studio-btn full-width"
                        onClick={() =>
                          queueOperation(activeOperation, paramIndex, paramValue)
                        }
                      >
                        <IconPlus />
                        <span>Add to playlist</span>
                      </button>
                    )}
                  </div>
                )}
              </section>
            </div>
          ) : (
            /* RUN MY CODE TAB: C++ Corpus Browser (`cpp_corpus/`) + Custom Code Editor */
            <div className="corpus-runner-panel">
              <div className="guide-step-card expanded">
                <div className="guide-step-header">
                  <span className="dcc-caret" aria-hidden="true">
                    ▸
                  </span>
                  <span className="guide-step-num">C++</span>
                  <span className="guide-step-title">Team C++ Corpus (cpp_corpus/)</span>
                </div>
                <div className="guide-step-body">
                  <label className="field-block">
                    <span className="field-label">
                      Pick a C++ file from cpp_corpus/ (Weeks 1–15)
                    </span>
                    <select
                      className="studio-input large"
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
                  </label>

                  <label className="field-block">
                    <span className="field-label">
                      C++ Source Code ({selectedCorpusFile})
                    </span>
                    <textarea
                      className="corpus-code-textarea"
                      value={customCodeText}
                      onChange={(e) => setCustomCodeText(e.target.value)}
                      rows={14}
                      spellCheck={false}
                    />
                  </label>

                  <button
                    type="button"
                    className="studio-btn primary large full-width"
                    onClick={() => selectAndRunCorpusFile(selectedCorpusFile)}
                  >
                    <IconPlay />
                    <span>Visualize on 3D Stage</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PRO MODE ONLY: Developer Panels on Left */}
          {uiMode === 'pro' && (
            <>
              <section className="dock-panel">
                <div className="dock-header">
                  <span>SCENE COLLECTION</span>
                  <button
                    type="button"
                    className="inline-check"
                    onClick={toggleAutoPlayOnRun}
                  >
                    <span
                      className={`dcc-checkbox ${autoPlayOnRun ? 'checked' : ''}`}
                      aria-hidden="true"
                    >
                      {autoPlayOnRun ? '✓' : ''}
                    </span>
                    <span>Auto-Run</span>
                  </button>
                </div>
                <div className="dock-body">
                  <div className="collection-list">
                    {STRUCTURE_CARDS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`collection-row ${previewScene === c.id ? 'selected' : ''}`}
                        onClick={() => setPreviewScene(c.id)}
                      >
                        <span className="col-name">
                          {c.icon} {c.name}
                        </span>
                        <span className="col-tag">{c.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="dock-panel">
                <div className="dock-header">
                  <span>TRACE OPERATION QUEUE</span>
                  <span className="dock-meta">{operationHistory.length} OPS</span>
                </div>
                <div className="dock-body">
                  <ul className="outliner-tree">
                    {operationHistory.map((item, idx) => {
                      const isCurrentOp =
                        currentStep >= item.startStep && currentStep <= item.endStep;
                      return (
                        <li key={item.uid}>
                          <button
                            type="button"
                            className={`tree-row ${isCurrentOp ? 'active' : ''}`}
                            onClick={() => seekToStep(item.startStep)}
                          >
                            <span className="tree-idx">{idx + 1}.</span>
                            <span className="tree-label">{item.label}</span>
                            <code className="tree-range">
                              [{item.startStep}..{item.endStep}]
                            </code>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            </>
          )}
        </aside>

        {/* CENTRE PANEL: 3D Stage + Plain-English Caption Bar */}
        <main className="centre-viewport">
          <BlenderViewport />
        </main>

        {/* RIGHT DOCK: Details Drawer (Standard Mode when open) or Full Developer Inspector (Pro Mode) */}
        {showRightSidebar && (
          <aside className="right-panel" aria-label="Details and Code Inspector">
            {uiMode === 'pro' && (
              <>
                <section className="dock-panel">
                  <div className="dock-header">
                    <span>OUTLINER HIERARCHY</span>
                    <span className="dock-meta">
                      {Object.keys(sceneObjects).length} MESHES
                    </span>
                  </div>
                  <div className="dock-body">
                    <ul className="outliner-tree compact">
                      {Object.values(sceneObjects).map((obj) => (
                        <li key={obj.id}>
                          <button
                            type="button"
                            className={`tree-row ${selectedId === obj.id ? 'active' : ''}`}
                            onClick={() => selectObject(obj.id)}
                          >
                            <span className="tree-type-glyph">◈</span>
                            <span className="tree-label">
                              {obj.label} = <strong>{String(obj.value)}</strong>
                            </span>
                            <code className="tree-range">{obj.memoryAddress}</code>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className="dock-panel">
                  <div className="dock-header">
                    <span>NODE INSPECTOR</span>
                    <span className="dock-meta">TRANSFORM &amp; MEMORY</span>
                  </div>
                  <div className="dock-body">
                    {selectedObj ? (
                      <div className="prop-sheet">
                        {/* Contiguous [X | Y | Z] Vector Input Triplet from Algorithm Studio Spec */}
                        <div className="prop-divider">WORLD TRANSFORM [X | Y | Z]</div>
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

                        <div className="prop-divider">MEMORY &amp; TOPOLOGY</div>
                        <div className="prop-grid">
                          <span className="prop-label">Identifier</span>
                          <code className="prop-val">{selectedObj.id}</code>

                          <span className="prop-label">Primitive</span>
                          <code className="prop-val">{selectedObj.kind}</code>

                          <span className="prop-label">Address</span>
                          <code className="prop-val accent">
                            {selectedObj.memoryAddress}
                          </code>
                        </div>

                        <div className="prop-divider">STRUCT / CELL FIELDS</div>
                        <div className="prop-grid">
                          {Object.entries(selectedObj.fields).map(
                            ([fieldKey, fieldVal]) => (
                              <div key={fieldKey} className="prop-pair">
                                <span className="prop-label">{fieldKey}</span>
                                <code className="prop-val">{String(fieldVal)}</code>
                              </div>
                            ),
                          )}
                        </div>

                        <button
                          type="button"
                          className="studio-btn full-width"
                          onClick={() => triggerCameraPreset('focus')}
                        >
                          <IconTarget />
                          <span>Frame Selected (Numpad .)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="empty-state">
                        Select a mesh in the 3D Viewport or Outliner to inspect its
                        coordinates and memory cell.
                      </div>
                    )}
                  </div>
                </section>

                {currentSnapshot.callStack.length > 0 && (
                  <section className="dock-panel">
                    <div className="dock-header">
                      <span>CALL STACK FRAMES</span>
                      <span className="dock-meta">
                        DEPTH {currentSnapshot.callStack.length}
                      </span>
                    </div>
                    <div className="dock-body">
                      <ul className="outliner-tree compact">
                        {[...currentSnapshot.callStack].reverse().map((frame, idx) => (
                          <li
                            key={`${frame.fn}-${frame.depth}-${idx}`}
                            className="tree-row"
                          >
                            <code className="tree-label">
                              {frame.fn}({frame.args.join(', ')})
                            </code>
                            <code className="tree-range">frame #{frame.depth}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}
              </>
            )}

            <section className="dock-panel code-dock">
              <div className="dock-header">
                <span>{uiMode === 'standard' ? 'CODE DETAILS' : 'SOURCE TRACE'}</span>
                <span className="dock-meta">{displayedCodeMeta.title}</span>
              </div>

              <div className="code-line-explanation">
                <span className="code-exp-badge">
                  LINE {currentSnapshot.activeLine ?? 1}
                </span>
                <p>{plainCodeExplanation}</p>
              </div>

              {uiMode === 'pro' && (
                <div className="complexity-strip">
                  <span>
                    TIME: <strong>{displayedCodeMeta.timeComplexity}</strong>
                  </span>
                  <span>
                    SPACE: <strong>{displayedCodeMeta.spaceComplexity}</strong>
                  </span>
                </div>
              )}

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
            </section>
          </aside>
        )}
      </div>

      {/* Bottom Timeline & Playback Shelf */}
      <footer className="bottom-transport-bar">
        <div className="transport-cluster">
          <button
            type="button"
            className="transport-btn"
            onClick={restart}
            title="Restart from beginning (R)"
            aria-label="Restart"
          >
            <IconRestart />
          </button>
          <button
            type="button"
            className="transport-btn"
            onClick={stepBackward}
            disabled={currentStep <= 0}
            title="Previous step (Left Arrow)"
            aria-label="Previous step"
          >
            <IconStepBack />
          </button>
          <button
            type="button"
            className={`transport-btn primary-play ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlay}
            title="Play or Pause (Spacebar)"
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            className="transport-btn"
            onClick={stepForward}
            disabled={currentStep >= totalSteps}
            title="Next step (Right Arrow)"
            aria-label="Next step"
          >
            <IconStepForward />
          </button>
          <button
            type="button"
            className="transport-btn"
            onClick={skipToEnd}
            disabled={currentStep >= totalSteps}
            title="Skip to end"
            aria-label="Skip to end"
          >
            <IconSkipEnd />
          </button>
        </div>

        <div className="scrubber-cluster">
          <input
            type="range"
            min={0}
            max={totalSteps}
            value={currentStep}
            onChange={(e) => seekToStep(Number(e.target.value))}
            className="timeline-scrubber"
            aria-label="Step Scrubber"
          />
          <span className="step-count-label">
            Step <strong>{currentStep}</strong> of <strong>{totalSteps}</strong>
          </span>
        </div>

        <div className="rate-cluster" title={`Playback speed: ${playbackSpeed}x`}>
          <span className="speed-icon" aria-hidden="true">
            <IconTurtle />
          </span>
          <input
            id="speed-range"
            type="range"
            min={0.25}
            max={4}
            step={0.25}
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="rate-slider"
            aria-label="Playback Speed"
          />
          <span className="speed-icon" aria-hidden="true">
            <IconRabbit />
          </span>
        </div>
      </footer>
    </div>
  );
}
