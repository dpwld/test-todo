'use client';

// Light/dark theme state. Initialised to 'light' (SSR-safe), then hydrated
// from localStorage after mount. Every change is mirrored onto
// document.documentElement[data-theme] — the design system's dark mirror keys
// off that attribute — and persisted; the first persist run is skipped so
// hydration doesn't echo a redundant write.

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Theme } from '@/lib/types';
import { loadTheme, saveTheme } from '@/lib/store/persistence';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const ready = useRef(false);

  useEffect(() => {
    setTheme(loadTheme());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (!ready.current) {
      ready.current = true;
      return;
    }
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
