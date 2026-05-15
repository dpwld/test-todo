import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskRow } from '@/components/main/TaskRow';
import type { Task } from '@/lib/types';

function makeTask(over: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: '코드 리뷰',
    due: '2026-05-15',
    priority: 'high',
    category: 'dev',
    starred: false,
    done: false,
    notes: '리뷰 메모',
    subs: [
      { id: 's1', text: 'a', done: true },
      { id: 's2', text: 'b', done: false },
    ],
    ...over,
  };
}

const onSelect = vi.fn();
const onToggleDone = vi.fn();
const onToggleStar = vi.fn();

beforeEach(() => {
  onSelect.mockClear();
  onToggleDone.mockClear();
  onToggleStar.mockClear();
});

function renderRow(task: Task, selected = false) {
  return render(
    <TaskRow
      task={task}
      selected={selected}
      onSelect={onSelect}
      onToggleDone={onToggleDone}
      onToggleStar={onToggleStar}
    />,
  );
}

describe('TaskRow', () => {
  it('renders the title and meta (due, category, subtask progress)', () => {
    renderRow(makeTask());
    expect(screen.getByText('코드 리뷰')).toBeInTheDocument();
    expect(screen.getByText('오늘')).toBeInTheDocument(); // relDay of 2026-05-15
    expect(screen.getByText('개발')).toBeInTheDocument(); // category name
    expect(screen.getByText('1/2')).toBeInTheDocument(); // subtask progress
  });

  it('applies is-selected and is-done classes', () => {
    const { container, rerender } = renderRow(makeTask(), true);
    expect(container.querySelector('.row')).toHaveClass('is-selected');
    rerender(
      <TaskRow
        task={makeTask({ done: true })}
        selected={false}
        onSelect={onSelect}
        onToggleDone={onToggleDone}
        onToggleStar={onToggleStar}
      />,
    );
    expect(container.querySelector('.row')).toHaveClass('is-done');
  });

  it('clicking the row body selects the task', async () => {
    renderRow(makeTask());
    await userEvent.click(screen.getByText('코드 리뷰'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('clicking the checkbox toggles done without selecting the row', async () => {
    renderRow(makeTask());
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggleDone).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('clicking the star toggles starred without selecting the row', async () => {
    renderRow(makeTask());
    await userEvent.click(screen.getByRole('button', { name: '즐겨찾기' }));
    expect(onToggleStar).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
