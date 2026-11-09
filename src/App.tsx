import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Screentip } from './components/common/Screentip';
import { GuidedTour } from './components/common/GuidedTour';

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

const CUSTOM_CODE_TEMPLATES: { label: string; fileName: string; code: string }[] = [
  {
    label: 'Custom Swap',
    fileName: 'custom_sort.cpp',
    code: `// Write custom C++ or JS loops, comparisons & swaps!
int main() {
  int arr[] = { 65, 18, 84, 32, 47, 12 };
  int n = 6;
  for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr[j], arr[j + 1]);
      }
    }
  }
  return 0;
}`,
  },
  {
    label: 'Stack Script',
    fileName: 'stack_script.cpp',
    code: `// Multi-step Stack LIFO script
push(20);
push(45);
push(75);
pop();
push(92);
peek();`,
  },
  {
    label: 'Queue Script',
    fileName: 'queue_script.cpp',
    code: `// Multi-step Queue FIFO script
enqueue(15);
enqueue(35);
enqueue(60);
dequeue();
enqueue(88);`,
  },
  {
    label: 'Linked List',
    fileName: 'sll_script.cpp',
    code: `// Multi-step Singly Linked List script
insertHead(12);
insertTail(48);
insertTail(76);
deleteValue(48);
insertTail(95);`,
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
  const setDetailsOpen = useViewportStore((s) => s.setDetailsOpen);
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
  const runCustomCodeNow = useViewportStore((s) => s.runCustomCodeNow);

  const [structPickerOpen, setStructPickerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<StitchCategoryTab>('Sort');
  const [arrayInputText, setArrayInputText] = useState(workingArray.join(', '));
  const [paramIndex, setParamIndex] = useState<number>(2);
  const [paramValue, setParamValue] = useState<number>(42);
  const [customCodeText, setCustomCodeText] = useState<string>(() =>
    getCorpusRawText('06_elementary_sorting/bubble_sort.cpp'),
  );
  const [isTourOpen, setIsTourOpen] = useState(() => {
    try {
      return localStorage.getItem('dsa_studio_tour_completed') !== 'true';
    } catch {
      return false;
    }
  });

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

  const codeViewerRef = useRef<HTMLPreElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  const [rightDrawerWidth, setRightDrawerWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('dsa_right_drawer_width');
      const parsed = Number(saved);
      return Number.isFinite(parsed) && parsed >= 260 && parsed <= 900 ? parsed : 380;
    } catch {
      return 380;
    }
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startW = rightDrawerWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const minW = 260;
      const maxW = Math.max(minW, window.innerWidth - 320);
      const newWidth = Math.max(minW, Math.min(maxW, Math.round(startW + delta)));
      setRightDrawerWidth(newWidth);
      try {
        localStorage.setItem('dsa_right_drawer_width', String(newWidth));
      } catch {
        // ignore
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Auto-scroll the code viewer so the currently running line remains centered/visible
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [currentSnapshot.activeLine, detailsOpen]);

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
    const intervalMs = Math.max(90, Math.round(780 / playbackSpeed));
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
      } else if (e.key === '?' || (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey)) {
        setIsTourOpen((v) => !v);
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
            <Screentip
              title="Learn & Visualize Mode"
              description="Explore built-in curriculum data structures and algorithms with interactive 3D simulations."
              placement="bottom"
            >
              <button
                type="button"
                className={`st-tab-btn ${appMode === 'library' ? 'active' : ''}`}
                onClick={() => setAppMode('library')}
              >
                <span>Learn</span>
              </button>
            </Screentip>

            <Screentip
              title="Run My Own Code"
              description="Upload or paste custom C++ lab assignments. Replays main() with live 3D visual tracing."
              shortcut=">_"
              placement="bottom"
            >
              <button
                type="button"
                data-tour="run-code-tab"
                className={`st-tab-btn ${appMode === 'upload' ? 'active' : ''}`}
                onClick={() => {
                  setAppMode('upload');
                  setDetailsOpen(true);
                }}
              >
                <code className="st-code-prompt">&gt;_</code>
                <span>Run code</span>
              </button>
            </Screentip>
          </div>

          <Screentip
            title="Studio Guide"
            description="Minimal walkthrough of controls, 3D camera navigation, and code execution."
            shortcut="?"
            placement="bottom"
          >
            <button
              type="button"
              className="st-tour-btn"
              onClick={() => setIsTourOpen(true)}
              aria-label="Open Studio Guide"
            >
              <span>Guide</span>
              <kbd className="st-tour-kbd">?</kbd>
            </button>
          </Screentip>

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
          <div
            className="st-seg-group"
            role="group"
            aria-label="UI Mode"
            data-tour="ui-mode-pill"
          >
            <Screentip
              title="Kids / Beginner Mode"
              description="Friendly, simplified cards with larger labels and clean visual icons."
              placement="bottom"
            >
              <button
                type="button"
                className={`st-seg-item ${uiMode === 'kids' ? 'active' : ''}`}
                onClick={() => setUiMode('kids')}
              >
                Kids
              </button>
            </Screentip>

            <Screentip
              title="Standard Mode"
              description="Balanced CAD layout with Big-O analytics, camera controls, and plain-English debug captions."
              placement="bottom"
            >
              <button
                type="button"
                className={`st-seg-item ${uiMode === 'standard' ? 'active' : ''}`}
                onClick={() => setUiMode('standard')}
              >
                Standard
              </button>
            </Screentip>

            <Screentip
              title="Pro Mode"
              description="Developer mode with hex memory addresses, XYZ mesh coordinates, call stack frames, and live code viewer."
              placement="bottom"
            >
              <button
                type="button"
                className={`st-seg-item ${uiMode === 'pro' ? 'active' : ''}`}
                onClick={() => setUiMode('pro')}
              >
                Pro
              </button>
            </Screentip>
          </div>

          {/* Viewport Quick Toggles */}
          <div className="st-icon-group">
            <Screentip
              title="Ground Reference Grid"
              description="Toggle the infinite Blender 3D ground plane and colored X/Y axes."
              shortcut="G"
              placement="bottom"
            >
              <button
                type="button"
                className={`st-icon-btn ${showGrid ? 'active' : ''}`}
                onClick={toggleGrid}
                aria-label="Toggle Coordinate Grid"
              >
                <IconGrid />
              </button>
            </Screentip>

            <Screentip
              title="Wireframe Mesh Mode"
              description="Toggle geometric wireframe edge overlays on all 3D bars, slabs, and nodes."
              shortcut="W"
              placement="bottom"
            >
              <button
                type="button"
                className={`st-icon-btn ${wireframe ? 'active' : ''}`}
                onClick={toggleWireframe}
                aria-label="Toggle Wireframe Overlay"
              >
                <IconWireframe />
              </button>
            </Screentip>

            <Screentip
              title="Isometric Perspective Camera"
              description="Reset camera to the default isometric studio angle."
              shortcut="0"
              placement="bottom"
            >
              <button
                type="button"
                className="st-icon-btn amber-active"
                onClick={() => triggerCameraPreset('isometric')}
                aria-label="Isometric Perspective View"
              >
                ☀
              </button>
            </Screentip>
          </div>

          <span className="st-divider" />

          <Screentip
            title="C++ Code & Inspector Drawer"
            description="Toggle the live C++ source code viewer and active line execution panel on the right."
            shortcut="<>"
            placement="bottom"
          >
            <button
              type="button"
              className={`st-icon-btn ${showRightDrawer ? 'active' : ''}`}
              onClick={toggleDetailsOpen}
              aria-label="Toggle Code & Inspector Drawer"
            >
              &lt;&gt;
            </button>
          </Screentip>
          <span className="st-avatar">AS</span>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE AREA */}
      <div
        className={`stitch-workspace ${
          showRightDrawer ? 'with-drawer' : 'no-drawer'
        }`}
        style={
          showRightDrawer
            ? { gridTemplateColumns: `248px 1fr ${rightDrawerWidth}px 32px` }
            : undefined
        }
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
              <section className="st-card" data-tour="structure-picker">
                <div className="st-card-header">
                  <span className="st-step-circle">1</span>
                  <span className="st-card-title">Pick Structure</span>
                  <button
                    type="button"
                    className="st-edit-link"
                    onClick={() => setStructPickerOpen((v) => !v)}
                    aria-label="Toggle Structure Dropdown"
                  >
                    {structPickerOpen ? '▴' : '▾'}
                  </button>
                </div>

                <Screentip
                  title="Switch Data Structure"
                  description="Choose from 8 core structures: Arrays, Linked Lists, Stacks, Queues, Trees, Heaps, and Graphs."
                  placement="right"
                >
                  <button
                    type="button"
                    className="st-struct-well"
                    onClick={() => setStructPickerOpen((v) => !v)}
                    aria-expanded={structPickerOpen}
                  >
                    <span className="st-struct-left">
                      <code className="st-struct-glyph">{currentStructureCard.icon}</code>
                      <strong>
                        {currentStructureCard.name} [{Object.keys(sceneObjects).length}]
                      </strong>
                    </span>
                    <span className="st-struct-meta">
                      {currentStructureCard.metaTag}{' '}
                      <span className="st-struct-chevron">
                        {structPickerOpen ? '▴' : '▾'}
                      </span>
                    </span>
                  </button>
                </Screentip>

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
              <section className="st-card" data-tour="algorithm-picker">
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
                          <Screentip
                            key={item.id}
                            title={item.label}
                            description={`Simulate ${item.label} in 3D. Theoretical Time Complexity: ${item.complexity}.`}
                            placement="right"
                          >
                            <button
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
                          </Screentip>
                        );
                      })
                    : displayedStructActions.map((item) => {
                        const isSelected = activeStructureOp === item.id;
                        return (
                          <Screentip
                            key={item.id}
                            title={item.label}
                            description={`Execute ${item.label} in 3D with Big-O time complexity ${item.timeComplexity}.`}
                            placement="right"
                          >
                            <button
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
                          </Screentip>
                        );
                      })}
                </div>
              </section>

              {/* CARD 3: Input Numbers */}
              <section className="st-card" data-tour="input-numbers">
                <div className="st-card-header">
                  <span className="st-step-circle">3</span>
                  <span className="st-card-title">Input Numbers</span>
                  <Screentip
                    title="Apply Custom Numbers"
                    description="Commit the typed array values into the 3D scene."
                    placement="top"
                  >
                    <button
                      type="button"
                      className="st-edit-link"
                      onClick={handleCommitArrayInput}
                    >
                      Apply
                    </button>
                  </Screentip>
                </div>

                <div className="st-input-well-wrap">
                  <Screentip
                    title="Edit Dataset Values"
                    description="Enter comma-separated numbers (press Enter to run)."
                    placement="top"
                  >
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
                  </Screentip>

                  <Screentip
                    title="Surprise Me (Randomize)"
                    description="Generate 6 random numbers to test the algorithm with a surprise dataset."
                    shortcut="↻"
                    placement="top"
                  >
                    <button
                      type="button"
                      className="st-refresh-btn"
                      onClick={handleRandomizeNumbers}
                      aria-label="Randomize numbers"
                    >
                      ↻
                    </button>
                  </Screentip>
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
            /* RUN MY CODE TAB: C++ Corpus Selector, Upload & Live Editor */
            <div className="st-cards-scroll">
              <section className="st-card">
                <div className="st-card-header">
                  <span className="st-step-circle active-blue">C++</span>
                  <span className="st-card-title">cpp_corpus/ &amp; Upload</span>
                  <label className="st-edit-link" style={{ cursor: 'pointer' }}>
                    Upload
                    <input
                      type="file"
                      accept=".cpp,.cc,.h,.hpp,.js,.ts"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const text = String(reader.result ?? '');
                          setCustomCodeText(text);
                          setDetailsOpen(true);
                          runCustomCodeNow(text, file.name);
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
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
                <div className="st-filter-pills" style={{ marginBottom: 6 }}>
                  {CUSTOM_CODE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      className="st-pill-tab"
                      title={`Load ${tpl.fileName}`}
                      onClick={() => {
                        setCustomCodeText(tpl.code);
                        setDetailsOpen(true);
                        runCustomCodeNow(tpl.code, tpl.fileName);
                      }}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
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
                  onClick={() => {
                    setDetailsOpen(true);
                    runCustomCodeNow(customCodeText, 'custom_code.cpp');
                  }}
                >
                  <IconPlay />
                  <span>Visualize on 3D Stage</span>
                </button>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 10.5,
                    color: '#9ca3af',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Active: {displayedCodeMeta.title}</span>
                  <code style={{ color: '#4ade80' }}>{totalSteps} events</code>
                </div>
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
        <main className="centre-viewport" data-tour="viewport-stage">
          <BlenderViewport />
        </main>

        {/* OPTIONAL CODE / NODE INSPECTOR DRAWER (Opens when <> or Pro mode clicked) */}
        {showRightDrawer && (
          <aside className="stitch-inspector-drawer" aria-label="Code and Node Inspector">
            {/* DRAGGABLE RESIZER HANDLE ON LEFT EDGE */}
            <div
              className={`st-drawer-resizer ${isResizing ? 'resizing' : ''}`}
              onMouseDown={handleResizeStart}
              onDoubleClick={() => {
                setRightDrawerWidth(380);
                try {
                  localStorage.setItem('dsa_right_drawer_width', '380');
                } catch {
                  // ignore
                }
              }}
              title="Drag horizontally to resize code viewer (double-click to reset)"
              aria-label="Resize Code Viewer Drawer"
              role="separator"
              aria-orientation="vertical"
            >
              <div className="st-drawer-resizer-line" />
            </div>

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

            {currentSnapshot.callStack.length > 0 && (
              <div className="st-drawer-section">
                <div className="st-drawer-header">
                  <span>CALL STACK FRAMES</span>
                  <code>depth: {currentSnapshot.callStack.length}</code>
                </div>
                <div className="st-algo-list">
                  {[...currentSnapshot.callStack].reverse().map((frame, i) => (
                    <div
                      key={`${frame.fn}-${frame.depth}-${i}`}
                      className={`st-algo-row ${i === 0 ? 'active' : ''}`}
                    >
                      <span className="st-algo-name">
                        {frame.fn}({frame.args.join(', ')})
                      </span>
                      <code className="st-algo-badge">d={frame.depth}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="st-drawer-section code-flex">
              <div className="st-drawer-header code-editor-header">
                <div className="code-editor-title-group">
                  <span className="code-editor-tag">
                    {appMode === 'upload' ? 'USER CODE' : 'C++ TRACE'}
                  </span>
                  <span className="code-editor-filename" title={displayedCodeMeta.title}>
                    {displayedCodeMeta.title.replace(/\s*\(.*\)/, '')}
                  </span>
                </div>
                <div className="code-editor-status-group">
                  {currentSnapshot.activeLine ? (
                    <span className="code-active-line-pill">
                      ▶ LN {currentSnapshot.activeLine}
                    </span>
                  ) : (
                    <span className="code-idle-line-pill">READY</span>
                  )}
                  <button
                    type="button"
                    className="st-drawer-close-btn"
                    onClick={() => setDetailsOpen(false)}
                    title="Close Code Panel"
                    aria-label="Close Code Panel"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="code-editor-subbar">
                <span>{displayedCodeMeta.code.length} lines</span>
                <span>C++ / JS</span>
                {currentSnapshot.activeLine ? (
                  <span className="code-subbar-active">
                    Executing Line {currentSnapshot.activeLine}
                  </span>
                ) : (
                  <span>Idle</span>
                )}
              </div>
              <pre
                ref={codeViewerRef}
                className="code-viewer"
                aria-label="Algorithm Source Code"
              >
                {displayedCodeMeta.code.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isHighlighted = currentSnapshot.activeLine === lineNum;
                  return (
                    <div
                      key={lineNum}
                      ref={isHighlighted ? activeLineRef : null}
                      className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
                    >
                      <span className="line-gutter-marker">
                        {isHighlighted ? '▶' : ''}
                      </span>
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
            <Screentip
              title="Front Orthographic Camera"
              description="Align camera flat to front view along the X-Y plane."
              shortcut="1"
              placement="left"
            >
              <button
                type="button"
                className="st-dock-btn"
                onClick={() => triggerCameraPreset('front')}
                aria-label="Front Orthographic Camera"
              >
                🎥
              </button>
            </Screentip>

            <Screentip
              title="3D Perspective Orbit Camera"
              description="Snap camera to Blender Studio perspective isometric angle."
              shortcut="0"
              placement="left"
            >
              <button
                type="button"
                className="st-dock-btn"
                onClick={() => triggerCameraPreset('isometric')}
                aria-label="3D Perspective Orbit"
              >
                <IconCube />
              </button>
            </Screentip>

            <Screentip
              title="Focus Selected Object"
              description="Center and zoom 3D camera onto the currently selected node or bar."
              shortcut="."
              placement="left"
            >
              <button
                type="button"
                className="st-dock-btn"
                onClick={() => triggerCameraPreset('focus')}
                aria-label="Frame Selected"
              >
                <IconTarget />
              </button>
            </Screentip>

            <div className="st-dock-sep" />

            <Screentip
              title="C++ Source Code & Inspector"
              description="Toggle the right-hand panel with active executing code lines."
              shortcut="<>"
              placement="left"
            >
              <button
                type="button"
                className={`st-dock-btn ${detailsOpen ? 'active' : ''}`}
                onClick={toggleDetailsOpen}
                aria-label="Toggle Code & Inspector"
              >
                &lt;&gt;
              </button>
            </Screentip>
          </div>

          <div className="st-dock-bottom">
            <span className="st-doc-vertical">⌄ DOC</span>
          </div>
        </nav>
      </div>

      {/* 3. BOTTOM TIMELINE & TRANSPORT BAR */}
      <footer className="stitch-bottom-bar" data-tour="timeline-controls">
        <div className="st-transport">
          <Screentip
            title="Restart Animation"
            description="Rewind the timeline completely back to Step 0."
            shortcut="R"
            placement="top"
          >
            <button
              type="button"
              className="st-tr-btn"
              onClick={restart}
              aria-label="Restart"
            >
              <IconRestart />
            </button>
          </Screentip>

          <Screentip
            title="Previous Step"
            description="Step backwards by 1 event in the execution trace."
            shortcut="←"
            placement="top"
          >
            <button
              type="button"
              className="st-tr-btn"
              onClick={stepBackward}
              disabled={currentStep <= 0}
              aria-label="Previous step"
            >
              <IconStepBack />
            </button>
          </Screentip>

          <Screentip
            title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
            description="Animate the 3D algorithm continuously at the selected speed."
            shortcut="Space"
            placement="top"
          >
            <button
              type="button"
              className={`st-tr-play ${isPlaying ? 'playing' : ''}`}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <IconPause /> : <IconPlay />}
            </button>
          </Screentip>

          <Screentip
            title="Next Step"
            description="Advance forward by 1 step to see the next comparison, move, or swap."
            shortcut="→"
            placement="top"
          >
            <button
              type="button"
              className="st-tr-btn"
              onClick={stepForward}
              disabled={currentStep >= totalSteps}
              aria-label="Next step"
            >
              <IconStepForward />
            </button>
          </Screentip>

          <Screentip
            title="Skip to End"
            description="Jump straight to the final completed state of the algorithm."
            shortcut="End"
            placement="top"
          >
            <button
              type="button"
              className="st-tr-btn"
              onClick={skipToEnd}
              disabled={currentStep >= totalSteps}
              aria-label="Skip to end"
            >
              <IconSkipEnd />
            </button>
          </Screentip>
        </div>

        <div className="st-scrubber-area">
          <span className="st-step-readout">
            Step <strong>{currentStep}</strong> / {totalSteps}
          </span>
          <Screentip
            title="Timeline Scrubber"
            description="Drag or click to seek directly to any execution step."
            placement="top"
          >
            <input
              type="range"
              min={0}
              max={totalSteps}
              value={currentStep}
              onChange={(e) => seekToStep(Number(e.target.value))}
              className="st-range-slider"
              aria-label="Timeline Scrubber"
            />
          </Screentip>
          <span className="st-pct-readout">{progressPct}%</span>
        </div>

        <div className="st-speed-area">
          <Screentip
            title="Playback Speed"
            description="Slow down to 0.25x for detailed study or speed up to 4.0x."
            placement="top"
          >
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
          </Screentip>
        </div>
      </footer>

      {/* INTERACTIVE BEGINNER STEP-BY-STEP GUIDED TOUR */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
}
