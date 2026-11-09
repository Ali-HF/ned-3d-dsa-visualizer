import { useState, useEffect, useRef, useCallback } from 'react';

export interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  targetSelector?: string;
  placement?: 'bottom' | 'top' | 'right' | 'left' | 'center';
  tip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: '🚀',
    title: 'Welcome to DSA Algorithm Studio',
    subtitle: 'NED University CT-159 3D Visualizer',
    description:
      'This interactive 3D studio brings Data Structures & Algorithms to life! You can watch real-time pointer animations, inspect memory addresses, and even run your own C++ code. Let us take a quick 1-minute tour to help you navigate.',
    placement: 'center',
    tip: 'Press Esc anytime to exit the tour, or use Arrow keys to navigate.',
  },
  {
    icon: '📚',
    title: '1. Pick Any Data Structure',
    subtitle: 'From Arrays to Trees & Graphs',
    description:
      'Click the Structure Picker card in the top-left panel to switch between 8 core data structures: Arrays, Singly & Doubly Linked Lists, Stacks (with LIFO slabs), Queues, Binary Search Trees, Heaps, Graphs, and Hash Tables.',
    targetSelector: '[data-tour="structure-picker"]',
    placement: 'right',
    tip: 'Each structure renders in realistic 3D matching your course curriculum.',
  },
  {
    icon: '⚡',
    title: '2. Choose an Algorithm or Operation',
    subtitle: 'Sort, Insert, Delete, Search & Traversal',
    description:
      'Use the category tabs (Sort, Add, Del, Find, Walk) to filter operations. Click any algorithm (like Bubble Sort, In-Order Traversal, or Stack Push) to immediately prepare its 3D execution trace.',
    targetSelector: '[data-tour="algorithm-picker"]',
    placement: 'right',
    tip: 'Look at the Big-O badges on the right of each row (e.g. O(n log n)).',
  },
  {
    icon: '🎲',
    title: '3. Input Your Own Numbers',
    subtitle: 'Custom Datasets or Instant Randomization',
    description:
      'Want to test specific values? Type comma-separated numbers into the input box and click Run. You can also hit the ↻ (Randomize) button to generate a fresh random dataset with one click!',
    targetSelector: '[data-tour="input-numbers"]',
    placement: 'right',
    tip: 'Press Enter inside the input box to quickly apply your numbers.',
  },
  {
    icon: '🎮',
    title: '4. The 3D Viewport Stage',
    subtitle: 'Blender-Style Camera Navigation',
    description:
      'Interact with the 3D scene just like in Blender:\n• Left-Click + Drag: Orbit & rotate the camera in 3D\n• Right-Click + Drag (or Shift+Drag): Pan sideways\n• Scroll Wheel: Zoom in and out\n• Click any 3D node or bar: Inspect its memory address and XYZ coordinates!',
    targetSelector: '[data-tour="viewport-stage"]',
    placement: 'bottom',
    tip: 'Use the camera icons on the right dock (🎥 Front, 🧊 Perspective, 🎯 Focus) for instant camera angles.',
  },
  {
    icon: '⏯️',
    title: '5. Playback Timeline & Speed Control',
    subtitle: 'Step Forward, Backward, or Auto-Play',
    description:
      'Control the animation at your own pace:\n• Hit Space or Play (▶) to animate continuously\n• Next (→) and Prev (←) step through the algorithm line-by-line\n• Scrub the slider to jump directly to any step\n• Adjust speed from 0.25x to 4x.',
    targetSelector: '[data-tour="timeline-controls"]',
    placement: 'top',
    tip: 'The bottom debug console explains in plain English what is happening at each step!',
  },
  {
    icon: '💻',
    title: '6. Run Your Own C++ Code!',
    subtitle: 'Paste Your Lab Assignments & Tasks',
    description:
      'Click the ">_ Run my code" tab in the top header. You can paste or upload your C++ files (like your lab tasks). The visualizer will execute your exact main() operations in 3D with live line-by-line highlighting in the code drawer!',
    targetSelector: '[data-tour="run-code-tab"]',
    placement: 'bottom',
    tip: 'Supports BST insertions/traversals, arrays, stacks, and queues directly from your code.',
  },
  {
    icon: '🎛️',
    title: '7. Beginner-Friendly UI Modes',
    subtitle: 'Kids, Standard, or Pro Mode',
    description:
      'Feeling overwhelmed by technical details? Switch to "Kids" mode in the top right for friendly simplified labels and larger badges. Switch to "Standard" or "Pro" whenever you want full memory addresses, call stacks, and developer metrics.',
    targetSelector: '[data-tour="ui-mode-pill"]',
    placement: 'bottom',
    tip: 'You can re-open this tutorial anytime by clicking the 🎓 Tour button in the top bar!',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToStep?: (stepIndex: number) => void;
}

export function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const step = TOUR_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  // Measure target element position
  useEffect(() => {
    if (!isOpen) return;

    const updateTarget = () => {
      if (step.targetSelector) {
        const el = document.querySelector(step.targetSelector);
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          // Highlight target element
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

  // Keyboard navigation
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
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-label="Interactive Tour">
      {/* Target element spotlight cutout / bounding highlight */}
      {targetRect && (
        <div
          className="tour-spotlight-box"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Floating Tour Card */}
      <div
        ref={cardRef}
        className={`tour-card ${step.placement ? `placement-${step.placement}` : 'placement-center'}`}
        style={
          targetRect && step.placement === 'right'
            ? {
                top: Math.max(70, Math.min(window.innerHeight - 380, targetRect.top)),
                left: Math.min(window.innerWidth - 440, targetRect.right + 20),
              }
            : targetRect && step.placement === 'bottom'
              ? {
                  top: Math.min(window.innerHeight - 380, targetRect.bottom + 20),
                  left: Math.max(20, Math.min(window.innerWidth - 440, targetRect.left + (targetRect.width - 400) / 2)),
                }
              : targetRect && step.placement === 'top'
                ? {
                    top: Math.max(70, targetRect.top - 340),
                    left: Math.max(20, Math.min(window.innerWidth - 440, targetRect.left + (targetRect.width - 400) / 2)),
                  }
                : undefined
        }
      >
        {/* Card Header */}
        <div className="tour-card-header">
          <div className="tour-step-badge">
            <span className="tour-step-icon">{step.icon}</span>
            <span className="tour-step-count">
              STEP {currentStepIndex + 1} OF {TOUR_STEPS.length}
            </span>
          </div>
          <button
            type="button"
            className="tour-close-btn"
            onClick={handleFinish}
            title="Exit Tour (Esc)"
            aria-label="Close Tour"
          >
            ✕
          </button>
        </div>

        {/* Card Content */}
        <div className="tour-card-body">
          <h3 className="tour-title">{step.title}</h3>
          <h4 className="tour-subtitle">{step.subtitle}</h4>
          <p className="tour-desc">
            {step.description.split('\n').map((line, i) => (
              <span key={i} style={{ display: 'block', marginTop: i > 0 ? 4 : 0 }}>
                {line}
              </span>
            ))}
          </p>
          {step.tip && (
            <div className="tour-tip-box">
              <span className="tour-tip-icon">💡</span>
              <span className="tour-tip-text">{step.tip}</span>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="tour-dots-row">
          {TOUR_STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`tour-dot ${i === currentStepIndex ? 'active' : ''}`}
              onClick={() => setCurrentStepIndex(i)}
              title={`Go to step ${i + 1}`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="tour-card-footer">
          <label className="tour-checkbox-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>Don&apos;t show on startup</span>
          </label>

          <div className="tour-btn-group">
            {!isFirst && (
              <button
                type="button"
                className="tour-btn secondary"
                onClick={() => setCurrentStepIndex((i) => i - 1)}
              >
                ← Back
              </button>
            )}
            {!isLast ? (
              <button
                type="button"
                className="tour-btn primary"
                onClick={() => setCurrentStepIndex((i) => i + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="tour-btn success"
                onClick={handleFinish}
              >
                Get Started! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

