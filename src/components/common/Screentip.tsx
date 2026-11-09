import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type ReactElement,
  cloneElement,
  isValidElement,
} from 'react';

export interface ScreentipProps {
  title: string;
  description?: string;
  shortcut?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  disabled?: boolean;
  delayMs?: number;
}

export function Screentip({
  title,
  description,
  shortcut,
  placement = 'bottom',
  children,
  disabled = false,
  delayMs = 180,
}: ScreentipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  const calculatePosition = () => {
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const margin = 8;
    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = rect.top - margin;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - margin;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + margin;
        break;
    }

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    if (disabled || !title) return;
    timeoutRef.current = window.setTimeout(() => {
      calculatePosition();
      setVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clone single child or wrap in span
  let triggerElement: ReactNode;
  if (isValidElement(children)) {
    const child = children as ReactElement<{
      onMouseEnter?: (e: unknown) => void;
      onMouseLeave?: (e: unknown) => void;
      onFocus?: (e: unknown) => void;
      onBlur?: (e: unknown) => void;
      onClick?: (e: unknown) => void;
      ref?: unknown;
    }>;

    triggerElement = cloneElement(child, {
      ref: (el: HTMLElement | null) => {
        targetRef.current = el;
        // Also preserve original child ref if needed
        const origRef = (child as { ref?: unknown }).ref;
        if (typeof origRef === 'function') {
          origRef(el);
        } else if (origRef && typeof origRef === 'object' && 'current' in origRef) {
          (origRef as { current: HTMLElement | null }).current = el;
        }
      },
      onMouseEnter: (e: unknown) => {
        handleMouseEnter();
        child.props.onMouseEnter?.(e);
      },
      onMouseLeave: (e: unknown) => {
        handleMouseLeave();
        child.props.onMouseLeave?.(e);
      },
      onFocus: (e: unknown) => {
        handleMouseEnter();
        child.props.onFocus?.(e);
      },
      onBlur: (e: unknown) => {
        handleMouseLeave();
        child.props.onBlur?.(e);
      },
      onClick: (e: unknown) => {
        handleMouseLeave();
        child.props.onClick?.(e);
      },
    });
  } else {
    triggerElement = (
      <span
        ref={(el) => {
          targetRef.current = el;
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </span>
    );
  }

  return (
    <>
      {triggerElement}
      {visible && coords && (
        <div
          ref={tipRef}
          className={`stitch-screentip placement-${placement}`}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 99999,
          }}
          role="tooltip"
        >
          <div className="screentip-content">
            <div className="screentip-header">
              <span className="screentip-title">{title}</span>
              {shortcut && <kbd className="screentip-kbd">{shortcut}</kbd>}
            </div>
            {description && (
              <p className="screentip-desc">{description}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

