import { describe, it, expect } from 'vitest';
import {
  loadTasks,
  saveTasks,
  loadTheme,
  saveTheme,
  TASKS_KEY,
  THEME_KEY,
} from '@/lib/store/persistence';
import { SAMPLE_TASKS } from '@/lib/store/sample-data';
import type { Task } from '@/lib/types';

// tests/setup.ts clears localStorage after each test.

const oneTask: Task[] = [
  {
    id: 'x1',
    title: '저장된 할 일',
    due: '2026-05-20',
    priority: 'low',
    category: 'plan',
    starred: false,
    done: false,
    notes: '',
    subs: [],
  },
];

describe('loadTasks', () => {
  it('seeds with SAMPLE_TASKS when nothing is stored', () => {
    expect(loadTasks()).toEqual(SAMPLE_TASKS);
  });

  it('returns the stored tasks when valid', () => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(oneTask));
    expect(loadTasks()).toEqual(oneTask);
  });

  it('recovers to SAMPLE_TASKS on corrupt JSON', () => {
    localStorage.setItem(TASKS_KEY, '{not json');
    expect(loadTasks()).toEqual(SAMPLE_TASKS);
  });

  it('recovers to SAMPLE_TASKS on a schema mismatch', () => {
    localStorage.setItem(TASKS_KEY, JSON.stringify([{ nope: true }]));
    expect(loadTasks()).toEqual(SAMPLE_TASKS);
    localStorage.setItem(TASKS_KEY, JSON.stringify({ not: 'an array' }));
    expect(loadTasks()).toEqual(SAMPLE_TASKS);
  });
});

describe('saveTasks / loadTasks round-trip', () => {
  it('persists and reloads the task list', () => {
    saveTasks(oneTask);
    expect(loadTasks()).toEqual(oneTask);
  });
});

describe('loadTheme', () => {
  it('defaults to light when nothing is stored', () => {
    expect(loadTheme()).toBe('light');
  });

  it('returns the stored theme when valid', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    expect(loadTheme()).toBe('dark');
  });

  it('defaults to light on a garbage value', () => {
    localStorage.setItem(THEME_KEY, 'rainbow');
    expect(loadTheme()).toBe('light');
  });
});

describe('saveTheme / loadTheme round-trip', () => {
  it('persists and reloads the theme', () => {
    saveTheme('dark');
    expect(loadTheme()).toBe('dark');
    saveTheme('light');
    expect(loadTheme()).toBe('light');
  });
});
