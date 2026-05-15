// Shared domain types for demodev Tasks. Shapes mirror the Claude Design
// handoff bundle's store.jsx data structures.

export type Theme = 'light' | 'dark';

export type PriorityId = 'high' | 'med' | 'low' | 'none';

export type CategoryId = 'design' | 'dev' | 'meeting' | 'plan' | 'personal';

export type ViewId = 'inbox' | 'today' | 'upcoming' | 'overdue' | 'done';

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  /** Due date as 'YYYY-MM-DD', or '' when unset. */
  due: string;
  priority: PriorityId;
  category: CategoryId;
  starred: boolean;
  done: boolean;
  notes: string;
  subs: Subtask[];
}

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
}

export interface Priority {
  id: PriorityId;
  name: string;
  color: string;
}

export interface View {
  id: ViewId;
  name: string;
  icon: string;
}

/** A labelled group of tasks produced by groupTasks(). label is null for a
 *  single ungrouped list. */
export interface TaskGroup {
  label: string | null;
  items: Task[];
}
