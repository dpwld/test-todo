// localStorage persistence for tasks + theme. Loads are defensive: a missing,
// unparseable, or schema-mismatched value falls back to a safe default so the
// app never breaks on corrupt storage.

import type { Task, Theme } from '@/lib/types';
import { SAMPLE_TASKS } from '@/lib/store/sample-data';

export const TASKS_KEY = 'demodev-tasks:tasks';
export const THEME_KEY = 'demodev-tasks:theme';

// SSR guard — localStorage is unavailable during server rendering.
function hasStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function isTaskLike(v: unknown): v is Task {
  if (typeof v !== 'object' || v === null) return false;
  const t = v as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.due === 'string' &&
    typeof t.priority === 'string' &&
    typeof t.category === 'string' &&
    typeof t.starred === 'boolean' &&
    typeof t.done === 'boolean' &&
    typeof t.notes === 'string' &&
    Array.isArray(t.subs)
  );
}

export function loadTasks(): Task[] {
  if (!hasStorage()) return SAMPLE_TASKS;
  const raw = window.localStorage.getItem(TASKS_KEY);
  if (raw === null) return SAMPLE_TASKS;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isTaskLike)) return parsed;
    return SAMPLE_TASKS;
  } catch {
    return SAMPLE_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadTheme(): Theme {
  if (!hasStorage()) return 'light';
  const raw = window.localStorage.getItem(THEME_KEY);
  return raw === 'dark' || raw === 'light' ? raw : 'light';
}

export function saveTheme(theme: Theme): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(THEME_KEY, theme);
}
