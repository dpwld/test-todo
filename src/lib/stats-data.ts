// Fixed synthetic data for the stats screen, ported verbatim from the handoff
// bundle's screen-stats.jsx. Per the /speckit-clarify decision, the stats
// screen does NOT reflect the user's live localStorage tasks — every figure
// here is frozen demo data. The category breakdown is computed from the
// original SAMPLE_TASKS constant only.

import type { CategoryId } from '@/lib/types';
import { CATEGORIES, SAMPLE_TASKS } from '@/lib/store/sample-data';

export interface WeekDay {
  dow: string;
  date: string;
  completed: number;
  total: number;
  isToday: boolean;
}

// Mon–Sun completion (deterministic synthetic).
export const WEEK: WeekDay[] = [
  { dow: '월', date: '5/11', completed: 6, total: 8, isToday: false },
  { dow: '화', date: '5/12', completed: 9, total: 11, isToday: false },
  { dow: '수', date: '5/13', completed: 7, total: 9, isToday: false },
  { dow: '목', date: '5/14', completed: 5, total: 8, isToday: false },
  { dow: '금', date: '5/15', completed: 4, total: 7, isToday: true },
  { dow: '토', date: '5/16', completed: 0, total: 3, isToday: false },
  { dow: '일', date: '5/17', completed: 0, total: 2, isToday: false },
];

export interface DonutSlice {
  name: string;
  color: string;
  value: number;
}

// Distribution of completed tasks by category (this month synthetic numbers).
export const DONUT_DATA: DonutSlice[] = [
  { name: '디자인', color: '#b38ae6', value: 28 },
  { name: '개발', color: '#1571f3', value: 34 },
  { name: '회의', color: '#27c961', value: 18 },
  { name: '기획', color: '#ffb547', value: 12 },
  { name: '개인', color: '#9aa0aa', value: 8 },
];

// Deterministic 7-day × 20-week activity matrix for the streak heatmap.
// 0=none … 4=peak — built from a seed so it looks real.
function buildHeatmap(): number[][] {
  const grid: number[][] = [];
  for (let dow = 0; dow < 7; dow++) {
    const row: number[] = [];
    for (let w = 0; w < 20; w++) {
      const seed = (dow * 31 + w * 7) % 11;
      let v = seed;
      if (dow === 0 || dow === 6) v = Math.max(0, seed - 5); // weekend dampen
      if (w > 6 && v < 10) v += 1; // mid-late ramp
      if (w > 12) v += 1;
      const buck = v <= 1 ? 0 : v <= 3 ? 1 : v <= 6 ? 2 : v <= 9 ? 3 : 4;
      row.push(buck);
    }
    grid.push(row);
  }
  // The current week (last col) — guarantee a streak run.
  for (let dow = 0; dow < 5; dow++) grid[dow][19] = 3 + (dow % 2);
  grid[5][19] = 1;
  grid[6][19] = 0;
  return grid;
}

export const HEATMAP: number[][] = buildHeatmap();

export const HEAT_COLORS = [
  'var(--bg-muted)',
  'color-mix(in oklch, var(--color-accent) 18%, var(--bg))',
  'color-mix(in oklch, var(--color-accent) 38%, var(--bg))',
  'color-mix(in oklch, var(--color-accent) 65%, var(--bg))',
  'var(--color-accent)',
];

export interface CategoryStat {
  id: CategoryId;
  name: string;
  color: string;
  total: number;
  done: number;
}

// Category breakdown — computed from the SAMPLE_TASKS constant (NOT live data).
export const CATEGORY_STATS: CategoryStat[] = CATEGORIES.map((c) => {
  const cTasks = SAMPLE_TASKS.filter((t) => t.category === c.id);
  return {
    ...c,
    total: cTasks.length,
    done: cTasks.filter((t) => t.done).length,
  };
}).filter((c) => c.total > 0);
