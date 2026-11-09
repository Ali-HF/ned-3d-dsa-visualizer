import { useState, useEffect, useRef, useCallback } from 'react';

export interface TourStep {
  title: string;
  category: string;
  description: string[];
  targetSelector?: string;
  placement?: 'bottom' | 'top' | 'right' | 'left' | 'center';
  shortcutHint?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    category: 'OVERVIEW',
    title: 'DSA Algorithm Studio',
    description: [
      'An interactive 3D computing stage built for CT-159 Data Structures & Algorithms.',
      'Explore memory layouts, trace pointer operations in real time, and verify custom C++ implementations on standard datasets.',
    ],
    placement: 'center',
    shortcutHint: 'Esc to dismiss • Arrow keys to navigate',
  },
  {
    category: 'STEP 01',
    title: 'Structure Selection',
    description: [
      'Select any of the eight core data structures from the left sidebar.',
      'Includes 1D contiguous arrays, singly and doubly linked lists, vertical LIFO stack slabs, circular queues, BST/AVL balance trees, binary heaps, and hash tables.',
    ],
    targetSelector: '[data-tour="structure-picker"]',
    placement: 'right',
    shortcutHint: 'Click to expand the structure index',
  },
  {
    category: 'STEP 02',
    title: 'Operation Catalog & Complexity',
    description: [
      'Filter algorithms by category: Sort, Insert, Delete, Search, and Traversal.',
      'Each operation provides theoretical worst-case time complexity, from O(1) pointer updates to O(n log n) divide-and-conquer routines.',
    ],
    targetSelector: '[data-tour="algorithm-picker"]',
    placement: 'right',
    shortcutHint: 'Selecting an item generates its 3D execution trace',
  },
  {
    category: 'STEP 03',
    title: 'Dataset Configuration',
    description: [
      'Supply custom comma-separated values to test boundary conditions.',
      'Alternatively, trigger randomization to generate uniform random datasets across standard ranges.',
    ],
    targetSelector: '[data-tour="input-numbers"]',
    placement: 'right',
    shortcutHint: 'Enter commits new input values',
  },
  {
    category: 'STEP 04',
    title: '3D Viewport Navigation',
    description: [
      'Direct manipulation 3D viewport with standard CAD navigation:',
      '• Left drag: Orbit camera around focal point',
      '• Right / Shift drag: Pan camera laterally',
      '• Scroll: Zoom in and out',
      '• Direct click: Inspect node memory addresses and local coordinates.',
    ],
    targetSelector: '[data-tour="viewport-stage"]',
    placement: 'bottom',
    shortcutHint: 'Presets 0, 1, 3, 7 provide orthographic and isometric views',
  },
  {
    category: 'STEP 05',
    title: 'Trace Playback & Scrubbing',
    description: [
      'Step-by-step state machine with deterministic forward and backward evaluation.',
      'Use the timeline scrubber to inspect keyframe states, or adjust playback rate from 0.25x to 4.0x.',
    ],
    targetSelector: '[data-tour="timeline-controls"]',
    placement: 'top',
    shortcutHint: 'Space toggles play/pause • Left/Right arrows step',
  },
  {
    category: 'STEP 06',
    title: 'Custom C++ Code Sandbox',
    description: [
      'Switch to "Run my code" in the top bar to upload or paste local C++ source files.',
      'The engine executes your main() routine, generates the corresponding 3D trace, and tracks active lines in the right-hand code viewer.',
    ],
    targetSelector: '[data-tour="run-code-tab"]',
    placement: 'bottom',
    shortcutHint: 'Supports standard class methods and STL syntax',
  },
  {
    category: 'STEP 07',
    title: 'Telemetry & UI Modes',
    description: [
      'Toggle UI complexity between Kids, Standard, and Pro.',
      'Pro mode displays hex memory addresses, XYZ vector offsets, call stack frames, and instruction cycle counters.',
    ],
    targetSelector: '[data-tour="ui-mode-pill"]',
    placement: 'bottom',
    shortcutHint: 'Access this guide anytime via Guide in the header',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const step = TOUR_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (!isOpen) return;

    const updateTarget = () => {
      if (step.targetSelector) {
        const el = document.querySelector(step.targetSelector);
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }
      }
      setTargetRect(null);
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    return () => window.removeEventListener('resize', updateTarget);
  }, [isOpen, currentStepIndex, step.targetSelector]);

  const handleFinish = useCallback(() => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('dsa_studio_tour_completed', 'true');
      } catch {
        // ignore
      }
    }
    onClose();
  }, [dontShowAgain, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (!isLast) setCurrentStepIndex((i) => i + 1);
        else handleFinish();
      } else if (e.key === 'ArrowLeft') {
        if (!isFirst) setCurrentStepIndex((i) => i - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isLast, isFirst, handleFinish]);

  if (!isOpen) return null;

  return (
    <div
      className="tour-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Studio Walkthrough"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleFinish();
      }}
    >
      {targetRect && (
        <div
          className="tour-spotlight-box"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      <div
        ref={cardRef}
        className={`tour-card ${step.placement ? `placement-${step.placement}` : 'placement-center'}`}
        style={
          targetRect && step.placement === 'right'
            ? {
                top: Math.max(64, Math.min(window.innerHeight - 380, targetRect.top)),
                left: Math.min(window.innerWidth - 440, targetRect.right + 18),
              }
            : targetRect && step.placement === 'bottom'
              ? {
                  top: Math.min(window.innerHeight - 380, targetRect.bottom + 18),
                  left: Math.max(18, Math.min(window.innerWidth - 440, targetRect.left + (targetRect.width - 410) / 2)),
                }
              : targetRect && step.placement === 'top'
                ? {
                    top: Math.max(64, targetRect.top - 340),
                    left: Math.max(18, Math.min(window.innerWidth - 440, targetRect.left + (targetRect.width - 410) / 2)),
                  }
                : undefined
        }
      >
        {/* Sleek Segmented Hairline Progress Track */}
        <div className="tour-progress-track">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`tour-progress-segment ${i <= currentStepIndex ? 'filled' : ''} ${i === currentStepIndex ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Minimal Header */}
        <div className="tour-card-header">
          <div className="tour-header-meta">
            <span className="tour-category-tag">{step.category}</span>
            <span className="tour-counter">
              {String(currentStepIndex + 1).padStart(2, '0')} / {String(TOUR_STEPS.length).padStart(2, '0')}
            </span>
          </div>
          <button
            type="button"
            className="tour-close-btn"
            onClick={handleFinish}
            title="Dismiss (Esc)"
            aria-label="Dismiss tour"
          >
            <span className="tour-close-icon">✕</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="tour-card-body">
          <h3 className="tour-title">{step.title}</h3>
          <div className="tour-desc">
            {step.description.map((paragraph, i) => (
              <p key={i} className="tour-p">
                {paragraph}
              </p>
            ))}
          </div>

          {step.shortcutHint && (
            <div className="tour-hint-row">
              <span className="tour-hint-label">KEY</span>
              <span className="tour-hint-text">{step.shortcutHint}</span>
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="tour-card-footer">
          <label className="tour-checkbox-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>Do not show at launch</span>
          </label>

          <div className="tour-btn-group">
            {!isFirst && (
              <button
                type="button"
                className="tour-btn secondary"
                onClick={() => setCurrentStepIndex((i) => i - 1)}
              >
                Back
              </button>
            )}
            {!isLast ? (
              <button
                type="button"
                className="tour-btn primary"
                onClick={() => setCurrentStepIndex((i) => i + 1)}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="tour-btn primary"
                onClick={handleFinish}
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
