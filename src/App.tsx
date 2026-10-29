import { useEffect, useState } from 'react';
import { BlenderViewport } from './components/viewport/BlenderViewport';
import { useViewportStore } from './state/useViewportStore';
import type { ArrayOperationId } from './algorithms/array/arrayAlgorithms';
import type { PreviewSceneKind } from './types/trace';
import {
  IconPause,
  IconPlay,
  IconPlus,
  IconRestart,
  IconShield,
  IconSkipEnd,
  IconStepBack,
  IconStepForward,
  IconTarget,
} from './components/icons/StudioIcons';

const SORTING_BUTTONS: { id: ArrayOperationId; label: string; badge: string }[] = [
  { id: 'bubble-sort', label: 'Bubble Sort', badge: 'O(n²)' },
  { id: 'selection-sort', label: 'Selection Sort', badge: 'O(n²)' },
  { id: 'insertion-sort', label: 'Insertion Sort', badge: 'O(n²)' },
  { id: 'merge-sort', label: 'Merge Sort', badge: 'O(n log n)' },
  { id: 'quick-sort', label: 'Quick Sort', badge: 'O(n log n)' },
];

const ARRAY_OP_BUTTONS: {
  id: ArrayOperationId;
  label: string;
  needsIndex?: boolean;
  needsValue?: boolean;
}[] = [
  { id: 'insert-at', label: 'Insert @ Index', needsIndex: true, needsValue: true },
  { id: 'delete-at', label: 'Delete @ Index', needsIndex: true },
  { id: 'update-at', label: 'Update @ Index', needsIndex: true, needsValue: true },
  { id: 'linear-search', label: 'Linear Search', needsValue: true },
  { id: 'binary-search', label: 'Binary Search', needsValue: true },
  { id: 'reverse', label: 'Reverse In-Place' },
  { id: 'rotate', label: 'Rotate Left (k)', needsIndex: true },
];

const PREVIEW_FALLBACK_CODE: Record<
  Exclude<PreviewSceneKind, 'array'>,
  { title: string; timeComplexity: string; spaceComplexity: string; code: string[] }
> = {
  bst: {
    title: 'Binary Search Tree — Insert & Search (C++)',
    timeComplexity: 'O(log n) avg / O(n) worst',
    spaceComplexity: 'O(h) stack',
    code: [
      'struct Node {',
      '  int key;',
      '  Node *left, *right;',
      '  Node(int v) : key(v), left(nullptr), right(nullptr) {}',
      '};',
      '',
      'Node* insert(Node* root, int key) {',
      '  if (root == nullptr) return new Node(key);',
      '  if (key < root->key)',
      '    root->left = insert(root->left, key);',
      '  else if (key > root->key)',
      '    root->right = insert(root->right, key);',
      '  return root;',
      '}',
    ],
  },
  'linked-list': {
    title: 'Singly Linked List — In-Place Reversal (C++)',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: [
      'struct Node {',
      '  int data;',
      '  Node* next;',
      '};',
      '',
      'Node* reverseList(Node* head) {',
      '  Node *prev = nullptr, *curr = head, *next = nullptr;',
      '  while (curr != nullptr) {',
      '    next = curr->next;',
      '    curr->next = prev;',
      '    prev = curr;',
      '    curr = next;',
      '  }',
      '  return prev;',
      '}',
    ],
  },
};

export function App() {
  const appMode = useViewportStore((s) => s.appMode);
  const setAppMode = useViewportStore((s) => s.setAppMode);
  const previewScene = useViewportStore((s) => s.previewScene);
  const setPreviewScene = useViewportStore((s) => s.setPreviewScene);
  const selectedId = useViewportStore((s) => s.selectedId);
  const selectObject = useViewportStore((s) => s.selectObject);
  const sceneObjects = useViewportStore((s) => s.sceneObjects);
  const triggerCameraPreset = useViewportStore((s) => s.triggerCameraPreset);

  const workingArray = useViewportStore((s) => s.workingArray);
  const activeOperation = useViewportStore((s) => s.activeOperation);
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
  const queueOperation = useViewportStore((s) => s.queueOperation);

  const [arrayInputText, setArrayInputText] = useState(workingArray.join(', '));
  const [paramIndex, setParamIndex] = useState<number>(2);
  const [paramValue, setParamValue] = useState<number>(55);

  const selectedObj = selectedId ? sceneObjects[selectedId] : null;
  const displayedCodeMeta =
    previewScene === 'array' ? activeMetadata : PREVIEW_FALLBACK_CODE[previewScene];

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

  const handleApplyCustomArray = () => {
    const parsed = arrayInputText
      .split(/[\s,]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
    if (parsed.length > 0) {
      setCustomArray(parsed);
    }
  };

  return (
    <div className="app-shell">
      {/* Top Studio System Bar */}
      <header className="app-header">
        <div className="brand-title">
          <span className="brand-mark">DSA</span>
          <span className="brand-name">3D Memory &amp; Algorithm Studio</span>
          <span className="brand-divider" />
          <span className="brand-subtitle">NED University • CS-214 CCP</span>
        </div>

        <div className="workspace-tabs" role="tablist" aria-label="Workspace Mode">
          <button
            type="button"
            className={`ws-tab ${appMode === 'library' ? 'active' : ''}`}
            onClick={() => setAppMode('library')}
          >
            Library Inspector
          </button>
          <button
            type="button"
            className={`ws-tab ${appMode === 'upload' ? 'active' : ''}`}
            onClick={() => setAppMode('upload')}
          >
            Sandbox Code Runner (C++ / JS)
          </button>
        </div>

        <div className="security-status" title="Strict CSP + Isolated Worker Sandbox">
          <IconShield />
          <span>Your code runs locally in a sandbox and never leaves your browser.</span>
        </div>
      </header>

      {/* Main 3-Column Studio Dock */}
      <div className="workspace-grid">
        {/* LEFT DOCK: Structure Selector + Operations + Trace Queue */}
        <aside className="left-panel">
          <section className="dock-panel">
            <div className="dock-header">
              <span>SCENE COLLECTION</span>
              <span className="dock-meta">3 Primitives</span>
            </div>
            <div className="dock-body">
              <div className="collection-list">
                <button
                  type="button"
                  className={`collection-row ${previewScene === 'array' ? 'selected' : ''}`}
                  onClick={() => setPreviewScene('array')}
                >
                  <span className="col-name">Contiguous Array (1D / Aux)</span>
                  <span className="col-tag">{workingArray.length} cells</span>
                </button>

                <button
                  type="button"
                  className={`collection-row ${previewScene === 'linked-list' ? 'selected' : ''}`}
                  onClick={() => setPreviewScene('linked-list')}
                >
                  <span className="col-name">Linked List (Node* Heap)</span>
                  <span className="col-tag">4 nodes</span>
                </button>

                <button
                  type="button"
                  className={`collection-row ${previewScene === 'bst' ? 'selected' : ''}`}
                  onClick={() => setPreviewScene('bst')}
                >
                  <span className="col-name">Binary Search / AVL Tree</span>
                  <span className="col-tag">7 nodes</span>
                </button>
              </div>
            </div>
          </section>

          <section className="dock-panel">
            <div className="dock-header">
              <span>ARRAY BUFFER INPUT</span>
              <span className="dock-meta">int32[]</span>
            </div>
            <div className="dock-body">
              <div className="input-row">
                <input
                  type="text"
                  className="studio-input"
                  value={arrayInputText}
                  onChange={(e) => setArrayInputText(e.target.value)}
                  aria-label="Custom Array Values"
                  placeholder="42, 17, 68, 29, 84, 12"
                />
                <button
                  type="button"
                  className="studio-btn primary"
                  onClick={handleApplyCustomArray}
                >
                  Apply
                </button>
              </div>
              <div className="preset-bar">
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => {
                    const rnd = Array.from({ length: 6 }, () =>
                      Math.floor(Math.random() * 85) + 10,
                    );
                    setArrayInputText(rnd.join(', '));
                    setCustomArray(rnd);
                  }}
                >
                  Randomize
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => {
                    const rev = [90, 75, 60, 45, 30, 15];
                    setArrayInputText(rev.join(', '));
                    setCustomArray(rev);
                  }}
                >
                  Descending
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => {
                    const dup = [35, 15, 35, 70, 15, 50];
                    setArrayInputText(dup.join(', '));
                    setCustomArray(dup);
                  }}
                >
                  Duplicates
                </button>
              </div>
            </div>
          </section>

          <section className="dock-panel">
            <div className="dock-header">
              <span>SORTING KERNELS</span>
              <label className="inline-check">
                <input
                  type="checkbox"
                  checked={autoPlayOnRun}
                  onChange={toggleAutoPlayOnRun}
                />
                <span>Auto-Run</span>
              </label>
            </div>
            <div className="dock-body">
              <div className="op-table">
                {SORTING_BUTTONS.map((btn) => (
                  <div key={btn.id} className="op-row">
                    <button
                      type="button"
                      className={`op-exec-btn ${activeOperation === btn.id ? 'active' : ''}`}
                      onClick={() => runOperationNow(btn.id, paramIndex, paramValue)}
                    >
                      <IconPlay />
                      <span className="op-label">{btn.label}</span>
                      <code className="op-complexity">{btn.badge}</code>
                    </button>
                    <button
                      type="button"
                      className="op-append-btn"
                      title={`Queue ${btn.label}`}
                      onClick={() => queueOperation(btn.id, paramIndex, paramValue)}
                    >
                      <IconPlus />
                      <span>Queue</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="dock-panel">
            <div className="dock-header">
              <span>ARRAY OPERATIONS</span>
              <span className="dock-meta">Section 4.1</span>
            </div>
            <div className="dock-body">
              <div className="param-grid">
                <div className="param-field">
                  <label htmlFor="param-idx">Index / Shift (k)</label>
                  <input
                    id="param-idx"
                    type="number"
                    className="studio-input mono"
                    value={paramIndex}
                    min={0}
                    max={20}
                    onChange={(e) => setParamIndex(Number(e.target.value))}
                  />
                </div>
                <div className="param-field">
                  <label htmlFor="param-val">Value / Key</label>
                  <input
                    id="param-val"
                    type="number"
                    className="studio-input mono"
                    value={paramValue}
                    onChange={(e) => setParamValue(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="op-table">
                {ARRAY_OP_BUTTONS.map((btn) => (
                  <div key={btn.id} className="op-row">
                    <button
                      type="button"
                      className={`op-exec-btn ${activeOperation === btn.id ? 'active' : ''}`}
                      onClick={() => runOperationNow(btn.id, paramIndex, paramValue)}
                    >
                      <IconPlay />
                      <span className="op-label">{btn.label}</span>
                    </button>
                    <button
                      type="button"
                      className="op-append-btn"
                      title={`Queue ${btn.label}`}
                      onClick={() => queueOperation(btn.id, paramIndex, paramValue)}
                    >
                      <IconPlus />
                      <span>Queue</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="dock-panel">
            <div className="dock-header">
              <span>TRACE OPERATION QUEUE</span>
              <span className="dock-meta">{operationHistory.length} Ops</span>
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
        </aside>

        {/* CENTRE PANEL: 3D Viewport */}
        <main className="centre-viewport">
          <BlenderViewport />
        </main>

        {/* RIGHT DOCK: Outliner + Property Sheet + Source Trace */}
        <aside className="right-panel">
          <section className="dock-panel">
            <div className="dock-header">
              <span>OUTLINER</span>
              <span className="dock-meta">{Object.keys(sceneObjects).length} Objects</span>
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
              <span>OBJECT PROPERTIES</span>
              <span className="dock-meta">Memory Inspector</span>
            </div>
            <div className="dock-body">
              {selectedObj ? (
                <div className="prop-sheet">
                  <div className="prop-grid">
                    <span className="prop-label">Identifier</span>
                    <code className="prop-val">{selectedObj.id}</code>

                    <span className="prop-label">Primitive Type</span>
                    <code className="prop-val">{selectedObj.kind}</code>

                    <span className="prop-label">Hex Address</span>
                    <code className="prop-val accent">{selectedObj.memoryAddress}</code>

                    <span className="prop-label">World Transform</span>
                    <code className="prop-val">
                      X:{selectedObj.position[0].toFixed(1)} Y:
                      {selectedObj.position[1].toFixed(1)} Z:
                      {selectedObj.position[2].toFixed(1)}
                    </code>
                  </div>

                  <div className="prop-divider">STRUCT / CELL FIELDS</div>
                  <div className="prop-grid">
                    {Object.entries(selectedObj.fields).map(([fieldKey, fieldVal]) => (
                      <div key={fieldKey} className="prop-pair">
                        <span className="prop-label">{fieldKey}</span>
                        <code className="prop-val">{String(fieldVal)}</code>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="studio-btn full-width"
                    onClick={() => triggerCameraPreset('focus')}
                  >
                    <IconTarget />
                    <span>Frame Selected in Viewport (Numpad .)</span>
                  </button>
                </div>
              ) : (
                <div className="empty-state">
                  Select a mesh in the 3D Viewport or Outliner to inspect its simulated
                  memory cell and transform.
                </div>
              )}
            </div>
          </section>

          {currentSnapshot.callStack.length > 0 && (
            <section className="dock-panel">
              <div className="dock-header">
                <span>CALL STACK FRAMES</span>
                <span className="dock-meta">Depth {currentSnapshot.callStack.length}</span>
              </div>
              <div className="dock-body">
                <ul className="outliner-tree compact">
                  {[...currentSnapshot.callStack].reverse().map((frame, idx) => (
                    <li key={`${frame.fn}-${frame.depth}-${idx}`} className="tree-row">
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

          <section className="dock-panel code-dock">
            <div className="dock-header">
              <span>SOURCE TRACE</span>
              <span className="dock-meta">{displayedCodeMeta.title}</span>
            </div>
            <div className="complexity-strip">
              <span>
                Time: <strong>{displayedCodeMeta.timeComplexity}</strong>
              </span>
              <span>
                Space: <strong>{displayedCodeMeta.spaceComplexity}</strong>
              </span>
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
          </section>
        </aside>
      </div>

      {/* Bottom Timeline & Transport Bar */}
      <footer className="bottom-transport-bar">
        <div className="transport-cluster">
          <button
            type="button"
            className="transport-btn"
            onClick={restart}
            title="Restart Timeline (R)"
          >
            <IconRestart />
          </button>
          <button
            type="button"
            className="transport-btn"
            onClick={stepBackward}
            disabled={currentStep <= 0}
            title="Step Backward (Left Arrow)"
          >
            <IconStepBack />
          </button>
          <button
            type="button"
            className={`transport-btn primary ${isPlaying ? 'playing' : ''}`}
            onClick={togglePlay}
            title="Play / Pause (Spacebar)"
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            type="button"
            className="transport-btn"
            onClick={stepForward}
            disabled={currentStep >= totalSteps}
            title="Step Forward (Right Arrow)"
          >
            <IconStepForward />
          </button>
          <button
            type="button"
            className="transport-btn"
            onClick={skipToEnd}
            disabled={currentStep >= totalSteps}
            title="Skip to End"
          >
            <IconSkipEnd />
          </button>
        </div>

        <div className="scrubber-cluster">
          <div className="frame-counter">
            <span className="fc-label">FRAME</span>
            <code className="fc-val">
              {String(currentStep).padStart(3, '0')} /{' '}
              {String(totalSteps).padStart(3, '0')}
            </code>
          </div>
          <input
            type="range"
            min={0}
            max={totalSteps}
            value={currentStep}
            onChange={(e) => seekToStep(Number(e.target.value))}
            className="timeline-scrubber"
            aria-label="Timeline Scrubber"
          />
        </div>

        <div className="rate-cluster">
          <label htmlFor="speed-range" className="fc-label">
            RATE <code>{playbackSpeed.toFixed(2)}x</code>
          </label>
          <input
            id="speed-range"
            type="range"
            min={0.25}
            max={4}
            step={0.25}
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="rate-slider"
          />
        </div>
      </footer>
    </div>
  );
}
