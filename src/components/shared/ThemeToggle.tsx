'use client';

// Light/dark theme toggle, rendered in the SideNav footer. Styled as a nav
// item; a small swatch + label reflect the current theme.

import { useTheme } from '@/context/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="테마 전환"
      className="nav__item"
      onClick={toggleTheme}
    >
      <span
        aria-hidden="true"
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          flexShrink: 0,
          background: isDark
            ? 'var(--color-gray-900)'
            : 'var(--color-gray-100)',
          border: '1px solid var(--border)',
        }}
      />
      <span className="nav__item-label">
        {isDark ? '다크 모드' : '라이트 모드'}
      </span>
    </button>
  );
}
