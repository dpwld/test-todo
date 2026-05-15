// Pure selectors over the task list — view/category filtering, grouping, and
// counts. Ported from the handoff bundle's filterTasks plus MainScreen's
// grouping memo, with category filtering always producing a single group.

import type { CategoryId, Task, TaskGroup, ViewId } from '@/lib/types';
import { isOverdue, isToday, isUpcoming, relDay } from '@/lib/store/dates';

export function filterTasks(
  tasks: Task[],
  view: ViewId,
  categoryId: CategoryId | null,
): Task[] {
  if (categoryId) {
    return tasks.filter((t) => t.category === categoryId && !t.done);
  }
  switch (view) {
    case 'today':
      return tasks.filter((t) => !t.done && (isToday(t) || isOverdue(t)));
    case 'upcoming':
      return tasks.filter((t) => !t.done && isUpcoming(t));
    case 'overdue':
      return tasks.filter((t) => !t.done && isOverdue(t));
    case 'done':
      return tasks.filter((t) => t.done);
    case 'inbox':
    default:
      return tasks.filter((t) => !t.done);
  }
}

export function viewCount(tasks: Task[], view: ViewId): number {
  return filterTasks(tasks, view, null).length;
}

export function catCount(tasks: Task[], catId: CategoryId): number {
  return tasks.filter((t) => t.category === catId && !t.done).length;
}

/** Group an already view/category-filtered list. Used directly by the list
 *  UI after applying the filter chips; groupTasks wraps it with filterTasks. */
export function groupVisible(
  visible: Task[],
  view: ViewId,
  categoryId: CategoryId | null,
): TaskGroup[] {
  if (!categoryId && view === 'today') {
    const overdue = visible.filter(isOverdue);
    const today = visible.filter((t) => !isOverdue(t));
    return [
      ...(overdue.length
        ? [{ label: `지연 · ${overdue.length}`, items: overdue }]
        : []),
      { label: `오늘 · ${today.length}`, items: today },
    ];
  }

  if (!categoryId && view === 'upcoming') {
    const byDate: Record<string, Task[]> = {};
    visible.forEach((t) => {
      (byDate[t.due] = byDate[t.due] || []).push(t);
    });
    return Object.keys(byDate)
      .sort()
      .map((d) => ({
        label: `${relDay(d)} · ${byDate[d].length}`,
        items: byDate[d],
      }));
  }

  return [{ label: null, items: visible }];
}

export function groupTasks(
  tasks: Task[],
  view: ViewId,
  categoryId: CategoryId | null,
): TaskGroup[] {
  return groupVisible(filterTasks(tasks, view, categoryId), view, categoryId);
}
