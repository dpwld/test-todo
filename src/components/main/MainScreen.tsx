'use client';

// Main 3-panel screen: SideNav | TaskList | DetailPanel. The active view /
// category is read from the URL query (?view= / ?cat=); cat overrides view.
// The detail panel is an empty placeholder here — US2 wires in the real one.

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CategoryId, ViewId } from '@/lib/types';
import { SideNav } from '@/components/shared/SideNav';
import { TaskList } from '@/components/main/TaskList';
import { DetailPanel } from '@/components/main/DetailPanel';

const VALID_VIEWS: ViewId[] = ['inbox', 'today', 'upcoming', 'overdue', 'done'];
const VALID_CATS: CategoryId[] = [
  'design',
  'dev',
  'meeting',
  'plan',
  'personal',
];

export function MainScreen() {
  const params = useSearchParams();
  const catParam = params.get('cat');
  const viewParam = params.get('view');

  const activeCat =
    catParam && VALID_CATS.includes(catParam as CategoryId)
      ? (catParam as CategoryId)
      : null;
  const view: ViewId =
    !activeCat && viewParam && VALID_VIEWS.includes(viewParam as ViewId)
      ? (viewParam as ViewId)
      : 'today';

  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="main">
      <SideNav activeView={activeCat ? null : view} activeCat={activeCat} />
      <TaskList
        view={view}
        activeCat={activeCat}
        selectedId={selectedId}
        onSelectTask={setSelectedId}
      />
      <DetailPanel
        selectedId={selectedId}
        onClearSelection={() => setSelectedId(null)}
      />
    </div>
  );
}
