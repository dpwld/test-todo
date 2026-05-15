'use client';

// Inline popover primitive for the priority / category pickers in the detail
// panel. Renders the `.pop` container (todo.css) when open and closes on any
// outside pointerdown or Escape.

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  style?: CSSProperties;
}

export function Popover({ open, onClose, children, style }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element;
      // Ignore clicks on the trigger — it owns its own open/close toggle, so
      // letting the outside handler also fire would race the two.
      if (target.closest?.('[data-popover-keep-open]')) return;
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      className="pop"
      role="listbox"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

interface PopoverItemProps {
  selected?: boolean;
  onSelect: () => void;
  children: ReactNode;
}

export function PopoverItem({ selected, onSelect, children }: PopoverItemProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className="pop__item"
      style={{ width: '100%', border: 0, background: 'transparent', font: 'inherit', textAlign: 'left' }}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}
