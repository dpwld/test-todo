'use client';

// Checkbox primitive. Renders as a real <button role="checkbox"> so it is
// keyboard-operable and exposes aria-checked — the prototype used a bare
// <span>, and Constitution Principle V requires the production build to be at
// least as accessible. Visual styling comes from the `.check` class in todo.css.

import type { CSSProperties, MouseEvent } from 'react';

interface CheckProps {
  checked: boolean;
  onToggle: () => void;
  /** Accessible name — required since the control has no visible text. */
  label: string;
  className?: string;
  /** Box size in px (subtasks use 16; default 18 matches `.check`). */
  size?: number;
}

export function Check({
  checked,
  onToggle,
  label,
  className = '',
  size,
}: CheckProps) {
  // A checkbox click must never bubble to a clickable ancestor (e.g. a task
  // row that would otherwise select itself) — see spec FR re: propagation.
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const boxStyle: CSSProperties | undefined =
    size != null ? { width: size, height: size, padding: 0 } : { padding: 0 };
  const tickSize = size != null ? Math.round(size * 0.6) : 11;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={'check' + (checked ? ' is-checked' : '') +
        (className ? ' ' + className : '')}
      style={boxStyle}
      onClick={handleClick}
    >
      {checked && (
        <svg width={tickSize} height={tickSize} viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6L5 9L10 3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
