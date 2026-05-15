import { describe, it, expect } from 'vitest';
import {
  filterTasks,
  groupTasks,
  groupVisible,
  viewCount,
  catCount,
} from '@/lib/store/selectors';
import type { CategoryId, Task } from '@/lib/types';

function task(
  id: string,
  due: string,
  done: boolean,
  category: CategoryId,
): Task {
  return {
    id,
    title: id,
    due,
    priority: 'none',
    category,
    starred: false,
    done,
    notes: '',
    subs: [],
  };
}

// Fixture relative to TODAY = 2026-05-15.
const A = task('A', '2026-05-15', false, 'dev'); // today
const B = task('B', '2026-05-14', false, 'design'); // overdue
const C = task('C', '2026-05-16', false, 'dev'); // upcoming
const D = task('D', '2026-05-18', false, 'meeting'); // upcoming
const E = task('E', '2026-05-15', true, 'dev'); // done
const F = task('F', '', false, 'plan'); // no due → inbox only
const G = task('G', '2026-05-16', false, 'dev'); // upcoming
const TASKS = [A, B, C, D, E, F, G];

describe('filterTasks by view', () => {
  it('inbox = all incomplete', () => {
    expect(filterTasks(TASKS, 'inbox', null)).toEqual([A, B, C, D, F, G]);
  });
  it('today = incomplete due today or overdue', () => {
    expect(filterTasks(TASKS, 'today', null)).toEqual([A, B]);
  });
  it('upcoming = incomplete due in the future', () => {
    expect(filterTasks(TASKS, 'upcoming', null)).toEqual([C, D, G]);
  });
  it('overdue = incomplete due before today', () => {
    expect(filterTasks(TASKS, 'overdue', null)).toEqual([B]);
  });
  it('done = all completed', () => {
    expect(filterTasks(TASKS, 'done', null)).toEqual([E]);
  });
});

describe('filterTasks by category', () => {
  it('category filter overrides view, returns incomplete tasks of that category', () => {
    expect(filterTasks(TASKS, 'today', 'dev')).toEqual([A, C, G]);
    expect(filterTasks(TASKS, 'inbox', 'design')).toEqual([B]);
    expect(filterTasks(TASKS, 'inbox', 'personal')).toEqual([]);
  });
});

describe('viewCount', () => {
  it('counts tasks per view', () => {
    expect(viewCount(TASKS, 'inbox')).toBe(6);
    expect(viewCount(TASKS, 'today')).toBe(2);
    expect(viewCount(TASKS, 'upcoming')).toBe(3);
    expect(viewCount(TASKS, 'overdue')).toBe(1);
    expect(viewCount(TASKS, 'done')).toBe(1);
  });
});

describe('catCount', () => {
  it('counts incomplete tasks per category', () => {
    expect(catCount(TASKS, 'dev')).toBe(3); // A, C, G (E is done)
    expect(catCount(TASKS, 'design')).toBe(1);
    expect(catCount(TASKS, 'meeting')).toBe(1);
    expect(catCount(TASKS, 'plan')).toBe(1);
    expect(catCount(TASKS, 'personal')).toBe(0);
  });
});

describe('groupTasks', () => {
  it('today view splits into 지연 / 오늘 groups', () => {
    expect(groupTasks(TASKS, 'today', null)).toEqual([
      { label: '지연 · 1', items: [B] },
      { label: '오늘 · 1', items: [A] },
    ]);
  });

  it('today view omits the 지연 group when nothing is overdue', () => {
    const noOverdue = [A, E];
    expect(groupTasks(noOverdue, 'today', null)).toEqual([
      { label: '오늘 · 1', items: [A] },
    ]);
  });

  it('upcoming view groups by due date, sorted ascending', () => {
    expect(groupTasks(TASKS, 'upcoming', null)).toEqual([
      { label: '내일 · 2', items: [C, G] },
      { label: '3일 후 · 1', items: [D] },
    ]);
  });

  it('other views produce a single unlabelled group', () => {
    expect(groupTasks(TASKS, 'inbox', null)).toEqual([
      { label: null, items: [A, B, C, D, F, G] },
    ]);
  });

  it('category filter produces a single unlabelled group', () => {
    expect(groupTasks(TASKS, 'today', 'dev')).toEqual([
      { label: null, items: [A, C, G] },
    ]);
  });
});

describe('groupVisible (groups an already-filtered list)', () => {
  it('today view splits a pre-filtered list into 지연 / 오늘', () => {
    expect(groupVisible([B, A], 'today', null)).toEqual([
      { label: '지연 · 1', items: [B] },
      { label: '오늘 · 1', items: [A] },
    ]);
  });

  it('upcoming view groups a pre-filtered list by date', () => {
    expect(groupVisible([C, G, D], 'upcoming', null)).toEqual([
      { label: '내일 · 2', items: [C, G] },
      { label: '3일 후 · 1', items: [D] },
    ]);
  });

  it('other views / category filters produce a single group', () => {
    expect(groupVisible([A, B], 'inbox', null)).toEqual([
      { label: null, items: [A, B] },
    ]);
    expect(groupVisible([A, C], 'today', 'dev')).toEqual([
      { label: null, items: [A, C] },
    ]);
  });
});
