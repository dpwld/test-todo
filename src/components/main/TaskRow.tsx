'use client';

// A single task row in the center list. Presentational — selection and
// mutations are passed in as callbacks so it stays trivially testable.

import type { MouseEvent } from 'react';
import type { Task } from '@/lib/types';
import { CAT_BY_ID } from '@/lib/store/sample-data';
import { isOverdue, relDay } from '@/lib/store/dates';
import { Icon } from '@/components/shared/Icon';
import { Check } from '@/components/shared/Check';

interface TaskRowProps {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onToggleDone: () => void;
  onToggleStar: () => void;
}

export function TaskRow({
  task,
  selected,
  onSelect,
  onToggleDone,
  onToggleStar,
}: TaskRowProps) {
  const cat = CAT_BY_ID[task.category];
  const subDone = task.subs.filter((s) => s.done).length;
  const subTotal = task.subs.length;

  const handleStar = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleStar();
  };

  return (
    <div
      className={
        'row' +
        (selected ? ' is-selected' : '') +
        (task.done ? ' is-done' : '')
      }
      onClick={onSelect}
    >
      <Check
        className="row__check"
        checked={task.done}
        onToggle={onToggleDone}
        label={`${task.title} 완료 토글`}
      />
      {task.priority !== 'none' && (
        <span className={'row__priority prio-' + task.priority} />
      )}
      <div className="row__body">
        <div className="row__title-line">
          <span className="row__title">{task.title}</span>
          <button
            type="button"
            className={'row__star' + (task.starred ? ' is-on' : '')}
            onClick={handleStar}
            aria-label="즐겨찾기"
            aria-pressed={task.starred}
          >
            <Icon
              name="star"
              size={13}
              strokeWidth={2}
              fill={task.starred ? 'currentColor' : 'none'}
            />
          </button>
        </div>
        <div className="row__meta">
          {task.due && (
            <span className={isOverdue(task) ? 'overdue' : ''}>
              <Icon
                name="calendar"
                size={12}
                style={{
                  display: 'inline',
                  verticalAlign: '-2px',
                  marginRight: 3,
                }}
              />
              {relDay(task.due)}
            </span>
          )}
          {cat && (
            <>
              <span className="dot" />
              <span className="row__cat">
                <span
                  className="row__cat-dot"
                  style={{ background: cat.color }}
                />
                {cat.name}
              </span>
            </>
          )}
          {subTotal > 0 && (
            <>
              <span className="dot" />
              <span className="row__sub-progress">
                <Icon name="list" size={12} />
                {subDone}/{subTotal}
              </span>
            </>
          )}
          {task.notes && (
            <>
              <span className="dot" />
              <Icon name="note" size={12} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
