'use client';

// Right-hand detail panel: edit title/notes, change priority/category via
// inline popovers, manage subtasks, toggle done/star, delete. Task data +
// mutations come from useTasks(); selection is driven by props.

import { useState } from 'react';
import { useTasks } from '@/context/TasksProvider';
import { CAT_BY_ID, CATEGORIES, PRIORITIES, PRIO_BY_ID } from '@/lib/store/sample-data';
import { fmtDay, isOverdue, relDay } from '@/lib/store/dates';
import { Icon } from '@/components/shared/Icon';
import { Check } from '@/components/shared/Check';
import { Popover, PopoverItem } from '@/components/shared/Popover';

interface DetailPanelProps {
  selectedId: string | null;
  onClearSelection: () => void;
}

export function DetailPanel({ selectedId, onClearSelection }: DetailPanelProps) {
  const {
    tasks,
    updateTask,
    deleteTask,
    toggleDone,
    toggleStar,
    addSub,
    toggleSub,
    deleteSub,
  } = useTasks();
  const [showPrioPop, setShowPrioPop] = useState(false);
  const [showCatPop, setShowCatPop] = useState(false);
  const [newSub, setNewSub] = useState('');

  const task = tasks.find((t) => t.id === selectedId) ?? null;

  if (!task) {
    return (
      <aside className="detail">
        <div className="empty">
          <span className="empty__icon">
            <Icon name="panelR" size={22} />
          </span>
          <span className="empty__title">선택된 할 일이 없습니다</span>
          <span className="empty__sub">
            왼쪽 리스트에서 할 일을 선택하거나, 새 할 일을 추가하세요.
          </span>
        </div>
      </aside>
    );
  }

  const doneSubs = task.subs.filter((s) => s.done).length;
  const totalSubs = task.subs.length;
  const pct = totalSubs ? (doneSubs / totalSubs) * 100 : 0;

  const handleDelete = () => {
    deleteTask(task.id);
    onClearSelection();
  };

  const handleAddSub = () => {
    if (!newSub.trim()) return;
    addSub(task.id, newSub);
    setNewSub('');
  };

  const propBtnStyle = {
    background: 'transparent',
    border: 0,
    cursor: 'pointer',
  } as const;

  return (
    <aside className={'detail' + (task.done ? ' is-done' : '')}>
      <header className="detail__head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check
            checked={task.done}
            onToggle={() => toggleDone(task.id)}
            label="할 일 완료 상태"
          />
          <span
            style={{
              font: '500 12px/1 var(--font-sans)',
              color: 'var(--fg-muted)',
            }}
          >
            {task.done ? '완료됨' : '진행 중'}
          </span>
        </div>
        <div className="detail__head-actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon"
            onClick={() => toggleStar(task.id)}
            style={{
              color: task.starred
                ? 'var(--color-warning)'
                : 'var(--fg-secondary)',
            }}
            aria-label="즐겨찾기"
            aria-pressed={task.starred}
          >
            <Icon
              name="star"
              size={14}
              fill={task.starred ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon"
            aria-label="복제"
          >
            <Icon name="copy" size={14} />
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon"
            onClick={handleDelete}
            aria-label="삭제"
            style={{ color: 'var(--fg-secondary)' }}
          >
            <Icon name="trash" size={14} />
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--icon"
            aria-label="더보기"
          >
            <Icon name="more" size={14} />
          </button>
        </div>
      </header>

      <div className="detail__body">
        <textarea
          className="detail__title-input"
          value={task.title}
          rows={2}
          aria-label="할 일 제목"
          onChange={(e) => updateTask(task.id, { title: e.target.value })}
        />

        <div className="detail__props">
          <span className="detail__prop-label">
            <Icon name="calendar" size={12} /> 마감일
          </span>
          <span className="detail__prop-value">
            {task.due ? (
              <>
                <span
                  style={{
                    color: isOverdue(task)
                      ? 'var(--color-danger)'
                      : 'var(--fg)',
                  }}
                >
                  {fmtDay(task.due)}
                </span>
                <span className="muted">· {relDay(task.due)}</span>
              </>
            ) : (
              <span className="muted">설정 안 됨</span>
            )}
          </span>

          <span className="detail__prop-label">
            <Icon name="flag" size={12} /> 우선순위
          </span>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="detail__prop-value"
              aria-label="우선순위 변경"
              data-popover-keep-open
              style={propBtnStyle}
              onClick={() => {
                setShowPrioPop((v) => !v);
                setShowCatPop(false);
              }}
            >
              {task.priority !== 'none' ? (
                <>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: PRIO_BY_ID[task.priority].color,
                    }}
                  />
                  {PRIO_BY_ID[task.priority].name}
                </>
              ) : (
                <span className="muted">없음</span>
              )}
            </button>
            <Popover
              open={showPrioPop}
              onClose={() => setShowPrioPop(false)}
              style={{ top: '100%', left: 0, marginTop: 4 }}
            >
              {PRIORITIES.map((p) => (
                <PopoverItem
                  key={p.id}
                  selected={task.priority === p.id}
                  onSelect={() => {
                    updateTask(task.id, { priority: p.id });
                    setShowPrioPop(false);
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background:
                        p.id === 'none' ? 'var(--border)' : p.color,
                    }}
                  />
                  {p.name}
                  {task.priority === p.id && (
                    <Icon
                      name="check"
                      size={12}
                      style={{
                        marginLeft: 'auto',
                        color: 'var(--color-accent)',
                      }}
                    />
                  )}
                </PopoverItem>
              ))}
            </Popover>
          </div>

          <span className="detail__prop-label">
            <Icon name="filter" size={12} /> 카테고리
          </span>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="detail__prop-value"
              aria-label="카테고리 변경"
              data-popover-keep-open
              style={propBtnStyle}
              onClick={() => {
                setShowCatPop((v) => !v);
                setShowPrioPop(false);
              }}
            >
              <span
                className="row__cat-dot"
                style={{ background: CAT_BY_ID[task.category].color }}
              />
              {CAT_BY_ID[task.category].name}
            </button>
            <Popover
              open={showCatPop}
              onClose={() => setShowCatPop(false)}
              style={{ top: '100%', left: 0, marginTop: 4 }}
            >
              {CATEGORIES.map((c) => (
                <PopoverItem
                  key={c.id}
                  selected={task.category === c.id}
                  onSelect={() => {
                    updateTask(task.id, { category: c.id });
                    setShowCatPop(false);
                  }}
                >
                  <span
                    className="row__cat-dot"
                    style={{ background: c.color }}
                  />
                  {c.name}
                  {task.category === c.id && (
                    <Icon
                      name="check"
                      size={12}
                      style={{
                        marginLeft: 'auto',
                        color: 'var(--color-accent)',
                      }}
                    />
                  )}
                </PopoverItem>
              ))}
            </Popover>
          </div>

          <span className="detail__prop-label">
            <Icon name="bell" size={12} /> 알림
          </span>
          <span className="detail__prop-value">
            <span className="muted">설정 안 됨</span>
          </span>
        </div>

        {totalSubs > 0 && (
          <div className="progress">
            <span>
              {doneSubs} / {totalSubs}
            </span>
            <div className="progress__bar">
              <div className="progress__fill" style={{ width: `${pct}%` }} />
            </div>
            <span>{Math.round(pct)}%</span>
          </div>
        )}

        <div>
          <div className="detail__section-title">
            <span>
              <Icon name="list" size={12} /> 서브태스크
            </span>
            {totalSubs > 0 && (
              <span
                className="muted"
                style={{ font: '500 11px/1 var(--font-sans)' }}
              >
                {doneSubs}개 완료
              </span>
            )}
          </div>
          <div className="subs" style={{ marginTop: 8 }}>
            {task.subs.map((s) => (
              <div key={s.id} className={'sub' + (s.done ? ' is-done' : '')}>
                <Check
                  checked={s.done}
                  onToggle={() => toggleSub(task.id, s.id)}
                  label={`${s.text} 완료 토글`}
                  size={16}
                />
                <span style={{ flex: 1 }}>{s.text}</span>
                <button
                  type="button"
                  className="sub__del"
                  onClick={() => deleteSub(task.id, s.id)}
                  aria-label={`${s.text} 삭제`}
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
            ))}
            <div className="sub__add">
              <span className="sub__add-plus">
                <Icon name="plus" size={10} />
              </span>
              <input
                placeholder="서브태스크 추가"
                value={newSub}
                aria-label="서브태스크 추가"
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSub();
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="detail__section-title">
            <span>
              <Icon name="note" size={12} /> 메모
            </span>
          </div>
          <textarea
            className="notes"
            style={{ marginTop: 8 }}
            placeholder="이 할 일에 대한 메모를 남겨두세요."
            value={task.notes}
            aria-label="메모"
            onChange={(e) => updateTask(task.id, { notes: e.target.value })}
          />
        </div>
      </div>
    </aside>
  );
}
