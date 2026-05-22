'use client';

// Shared task state. Thin React wrapper around the pure tasksReducer.
// Persistence: Supabase (authenticated users) or empty state (unauthenticated).

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import type { CategoryId, Task, ViewId } from '@/lib/types';
import { tasksReducer } from '@/lib/store/reducer';
import { TODAY_KEY } from '@/lib/store/dates';
import { SAMPLE_TASKS } from '@/lib/store/sample-data';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthProvider';

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
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  const { user } = useAuth();
  const supabase = createClient();

  // 로그인된 사용자의 tasks 로드
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'hydrate', tasks: [] });
      return;
    }

    supabase
      .from('tasks')
      .select()
      .then(({ data }) => {
        if (data) {
          dispatch({ type: 'hydrate', tasks: data as Task[] });
        }
      });
  }, [user?.id]);

  const addTask = (title: string, categoryHint: CategoryId | null, view: ViewId) => {
    const id = genId('t');
    dispatch({ type: 'add', id, title, categoryHint, view });

    if (user) {
      const newTask: Partial<Task> & { user_id: string } = {
        id,
        title,
        due: view === 'upcoming' ? '2026-05-18' : TODAY_KEY,
        priority: 'none',
        category: categoryHint ?? 'personal',
        starred: false,
        done: false,
        notes: '',
        subs: [],
        user_id: user.id,
      };
      supabase.from('tasks').insert(newTask);
    }
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    dispatch({ type: 'update', id, patch });
    if (user) {
      supabase.from('tasks').update(patch).eq('id', id);
    }
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'delete', id });
    if (user) {
      supabase.from('tasks').delete().eq('id', id);
    }
  };

  const toggleDone = (id: string) => {
    dispatch({ type: 'toggleDone', id });
    const task = tasks.find((t) => t.id === id);
    if (user && task) {
      supabase.from('tasks').update({ done: !task.done }).eq('id', id);
    }
  };

  const toggleStar = (id: string) => {
    dispatch({ type: 'toggleStar', id });
    const task = tasks.find((t) => t.id === id);
    if (user && task) {
      supabase.from('tasks').update({ starred: !task.starred }).eq('id', id);
    }
  };

  const addSub = (taskId: string, text: string) => {
    const subId = genId('s');
    dispatch({ type: 'addSub', taskId, subId, text });
    const task = tasks.find((t) => t.id === taskId);
    if (user && task) {
      const newSub = { id: subId, text, done: false };
      supabase.from('tasks').update({ subs: [...task.subs, newSub] }).eq('id', taskId);
    }
  };

  const toggleSub = (taskId: string, subId: string) => {
    dispatch({ type: 'toggleSub', taskId, subId });
    const task = tasks.find((t) => t.id === taskId);
    if (user && task) {
      const updatedSubs = task.subs.map((s) =>
        s.id === subId ? { ...s, done: !s.done } : s
      );
      supabase.from('tasks').update({ subs: updatedSubs }).eq('id', taskId);
    }
  };

  const deleteSub = (taskId: string, subId: string) => {
    dispatch({ type: 'deleteSub', taskId, subId });
    const task = tasks.find((t) => t.id === taskId);
    if (user && task) {
      const updatedSubs = task.subs.filter((s) => s.id !== subId);
      supabase.from('tasks').update({ subs: updatedSubs }).eq('id', taskId);
    }
  };

  const value: TasksContextValue = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleDone,
    toggleStar,
    addSub,
    toggleSub,
    deleteSub,
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
