import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/context/ThemeProvider';
import { THEME_KEY } from '@/lib/store/persistence';

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

function setup() {
  return render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );
}

describe('ThemeProvider', () => {
  it('defaults to light and applies data-theme', () => {
    setup();
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('toggleTheme flips the theme, applies data-theme, and persists', async () => {
    setup();
    await userEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  });

  it('hydrates the stored theme on mount', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    setup();
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
