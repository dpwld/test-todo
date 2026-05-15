'use client';

// Shared task state. Thin React wrapper around the pure tasksReducer — IDs are
// generated here so the reducer stays deterministic.
//
// Persistence: the reducer is initialised with SAMPLE_TASKS (same value on the
// server and the client, so hydration matches), then a mount effect dispatches
// `hydrate` with whatever loadTasks() returns from localStorage. A second
// effect persists every subsequent change; its first run is skipped so loading
// stored data doesn't immediately echo a redundant write before hydration.

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import type { CategoryId, Task, ViewId } from '@/lib/types';
import { tasksReducer } from '@/lib/store/reducer';
import { SAMPLE_TASKS } from '@/lib/store/sample-data';
import { loadTasks, saveTasks } from '@/lib/store/persistence';

interface TasksContextValue {
  tasks: Task[];
  addTask: (title: string, categoryHint: CategoryId | null, view: ViewId) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleDone: (id: string) => void;
  toggleStar: (id: string) => void;
  addSub: (taskId: string, text: string) => void;
  toggleSub: (taskId: string, subId: string) => void;
  deleteSub: (taskId: string, subId: string) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

const genId = (prefix: string) =>
  prefix + Math.random().toString(36).slice(2, 8);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, SAMPLE_TASKS);
  const ready = useRef(false);

  // Load persisted tasks after mount (post-hydration so SSR HTML matches).
  useEffect(() => {
    dispatch({ type: 'hydrate', tasks: loadTasks() });
  }, []);

  // Persist on every change; skip the first run so the pre-hydration render
  // can't clobber stored data.
  useEffect(() => {
    if (!ready.current) {
      ready.current = true;
      return;
    }
    saveTasks(tasks);
  }, [tasks]);

  const value: TasksContextValue = {
    tasks,
    addTask: (title, categoryHint, view) =>
      dispatch({ type: 'add', id: genId('t'), title, categoryHint, view }),
    updateTask: (id, patch) => dispatch({ type: 'update', id, patch }),
    deleteTask: (id) => dispatch({ type: 'delete', id }),
    toggleDone: (id) => dispatch({ type: 'toggleDone', id }),
    toggleStar: (id) => dispatch({ type: 'toggleStar', id }),
    addSub: (taskId, text) =>
      dispatch({ type: 'addSub', taskId, subId: genId('s'), text }),
    toggleSub: (taskId, subId) =>
      dispatch({ type: 'toggleSub', taskId, subId }),
    deleteSub: (taskId, subId) =>
      dispatch({ type: 'deleteSub', taskId, subId }),
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within a TasksProvider');
  return ctx;
}
