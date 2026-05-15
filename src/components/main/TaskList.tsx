'use client';

// Center column of the main screen: view header, filter chips, the add-task
// input, and the grouped task rows. Task data + mutations come from useTasks();
// the current view/category and selection are driven by props.

import { Fragment, useState } from 'react';
import type { CategoryId, ViewId } from '@/lib/types';
import { useTasks } from '@/context/TasksProvider';
import { CAT_BY_ID, VIEWS } from '@/lib/store/sample-data';
import { filterTasks, groupVisible } from '@/lib/store/selectors';
import { Icon } from '@/components/shared/Icon';
import { TaskRow } from '@/components/main/TaskRow';

type ChipFilter = 'all' | 'high' | 'starred';

interface TaskListProps {
  view: ViewId;
  activeCat: CategoryId | null;
  selectedId: string | null;
  onSelectTask: (id: string) => void;
}

export function TaskList({
  view,
  activeCat,
  selectedId,
  onSelectTask,
}: TaskListProps) {
  const { tasks, addTask, toggleDone, toggleStar } = useTasks();
  const [filter, setFilter] = useState<ChipFilter>('all');
  const [newTitle, setNewTitle] = useState('');

  const viewTasks = filterTasks(tasks, view, activeCat);
  const visible =
    filter === 'high'
      ? viewTasks.filter((t) => t.priority === 'high')
      : filter === 'starred'
        ? viewTasks.filter((t) => t.starred)
        : viewTasks;
  const groups = groupVisible(visible, view, activeCat);

  const currentLabel = activeCat
    ? CAT_BY_ID[activeCat].name
    : VIEWS.find((v) => v.id === view)!.name;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTask(newTitle, activeCat, view);
    setNewTitle('');
  };

  return (
    <section className="list">
      <header className="list__head">
        <div className="list__title-row">
          <h1 className="list__title">
            {currentLabel}
            <span className="list__date">
              {view === 'today' && !activeCat ? '5월 15일 금요일' : ''}
            </span>
          </h1>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--icon"
              aria-label="검색"
            >
              <Icon name="search" size={14} />
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--icon"
              aria-label="더보기"
            >
              <Icon name="more" size={14} />
            </button>
          </div>
        </div>

        <div className="list__filters">
          <button
            type="button"
            className={'chip' + (filter === 'all' ? ' chip--accent' : '')}
            onClick={() => setFilter('all')}
            style={{
              cursor: 'pointer',
              border: filter === 'all' ? 'none' : '1px solid var(--border)',
            }}
          >
            전체 · {viewTasks.length}
          </button>
          <button
            type="button"
            className={'chip' + (filter === 'high' ? ' chip--danger' : '')}
            onClick={() => setFilter('high')}
            style={{
              cursor: 'pointer',
              border: filter === 'high' ? 'none' : '1px solid var(--border)',
            }}
          >
            <span
              className="chip__dot"
              style={{ background: 'var(--color-danger)' }}
            />
            우선순위 높음
          </button>
          <button
            type="button"
            className={'chip' + (filter === 'starred' ? ' chip--warning' : '')}
            onClick={() => setFilter('starred')}
            style={{
              cursor: 'pointer',
              border: filter === 'starred' ? 'none' : '1px solid var(--border)',
            }}
          >
            <Icon name="star" size={11} strokeWidth={2} /> 즐겨찾기
          </button>
          <span
            className="list__sort secondary"
            style={{ font: '500 12px/1 var(--font-sans)' }}
          >
            마감일 ↑
          </span>
        </div>
      </header>

      <div
        className={'list__add' + (newTitle ? ' is-focused' : '')}
        onClick={(e) =>
          e.currentTarget.querySelector('input')?.focus()
        }
      >
        <Icon
          name="plus"
          size={16}
          style={{
            color: newTitle ? 'var(--color-accent)' : 'var(--fg-muted)',
          }}
        />
        <input
          placeholder="할 일을 추가하세요…  Enter로 저장"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          aria-label="할 일 추가"
        />
        {newTitle && <span className="kbd">⏎</span>}
      </div>

      <div className="list__scroll">
        {groups.map((g, gi) => (
          <Fragment key={gi}>
            {g.label && <div className="list__section-label">{g.label}</div>}
            {g.items.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                selected={t.id === selectedId}
                onSelect={() => onSelectTask(t.id)}
                onToggleDone={() => toggleDone(t.id)}
                onToggleStar={() => toggleStar(t.id)}
              />
            ))}
          </Fragment>
        ))}

        {visible.length === 0 && (
          <div
            style={{
              padding: '60px 12px',
              textAlign: 'center',
              color: 'var(--fg-muted)',
            }}
          >
            <div
              style={{
                font: '600 14px/1.4 var(--font-sans)',
                color: 'var(--fg-secondary)',
                marginBottom: 6,
              }}
            >
              할 일이 없습니다
            </div>
            <div style={{ font: '500 13px/1.5 var(--font-sans)' }}>
              오늘은 여유롭게 쉬어가도 좋아요.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
