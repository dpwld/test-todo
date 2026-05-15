import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksProvider, useTasks } from '@/context/TasksProvider';
import { SAMPLE_TASKS } from '@/lib/store/sample-data';
import { TASKS_KEY } from '@/lib/store/persistence';
import type { Task } from '@/lib/types';

// Test harness — surfaces state and exposes each mutation as a button.
function Probe() {
  const {
    tasks,
    addTask,
    toggleDone,
    deleteTask,
    updateTask,
    addSub,
    toggleSub,
    deleteSub,
  } = useTasks();
  const first = tasks[0];
  return (
    <div>
      <span data-testid="count">{tasks.length}</span>
      <span data-testid="first-title">{first?.title}</span>
      <span data-testid="first-done">{String(first?.done)}</span>
      <span data-testid="first-subs">{first?.subs.length}</span>
      <span data-testid="first-sub0-done">{String(first?.subs[0]?.done)}</span>
      <button onClick={() => addTask('새 작업', null, 'today')}>add</button>
      <button onClick={() => toggleDone(first.id)}>toggleDone</button>
      <button onClick={() => deleteTask(first.id)}>delete</button>
      <button onClick={() => updateTask(first.id, { title: '수정됨' })}>
        update
      </button>
      <button onClick={() => addSub(first.id, '새 서브')}>addSub</button>
      <button onClick={() => toggleSub(first.id, first.subs[0]?.id)}>
        toggleSub
      </button>
      <button onClick={() => deleteSub(first.id, first.subs[0]?.id)}>
        deleteSub
      </button>
    </div>
  );
}

function setup() {
  return render(
    <TasksProvider>
      <Probe />
    </TasksProvider>,
  );
}

describe('TasksProvider', () => {
  it('initialises with the sample tasks', () => {
    setup();
    expect(screen.getByTestId('count')).toHaveTextContent(
      String(SAMPLE_TASKS.length),
    );
    expect(screen.getByTestId('first-title')).toHaveTextContent(
      SAMPLE_TASKS[0].title,
    );
  });

  it('addTask inserts a task at the front', async () => {
    setup();
    await userEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('count')).toHaveTextContent(
      String(SAMPLE_TASKS.length + 1),
    );
    expect(screen.getByTestId('first-title')).toHaveTextContent('새 작업');
  });

  it('toggleDone flips the task done flag', async () => {
    setup();
    expect(screen.getByTestId('first-done')).toHaveTextContent('false');
    await userEvent.click(screen.getByText('toggleDone'));
    expect(screen.getByTestId('first-done')).toHaveTextContent('true');
  });

  it('deleteTask removes the task', async () => {
    setup();
    await userEvent.click(screen.getByText('delete'));
    expect(screen.getByTestId('count')).toHaveTextContent(
      String(SAMPLE_TASKS.length - 1),
    );
  });

  it('updateTask patches the task', async () => {
    setup();
    await userEvent.click(screen.getByText('update'));
    expect(screen.getByTestId('first-title')).toHaveTextContent('수정됨');
  });

  it('addSub / toggleSub / deleteSub mutate subtasks', async () => {
    setup();
    const subsBefore = Number(
      screen.getByTestId('first-subs').textContent,
    );
    await userEvent.click(screen.getByText('addSub'));
    expect(screen.getByTestId('first-subs')).toHaveTextContent(
      String(subsBefore + 1),
    );

    // SAMPLE_TASKS[0].subs[0] (s1) starts done: true
    expect(screen.getByTestId('first-sub0-done')).toHaveTextContent('true');
    await userEvent.click(screen.getByText('toggleSub'));
    expect(screen.getByTestId('first-sub0-done')).toHaveTextContent('false');

    await userEvent.click(screen.getByText('deleteSub'));
    expect(screen.getByTestId('first-subs')).toHaveTextContent(
      String(subsBefore),
    );
  });

  it('hydrates from stored tasks on mount', () => {
    const stored: Task[] = [
      {
        id: 'stored1',
        title: '저장된 작업',
        due: '',
        priority: 'none',
        category: 'dev',
        starred: false,
        done: false,
        notes: '',
        subs: [],
      },
    ];
    localStorage.setItem(TASKS_KEY, JSON.stringify(stored));
    setup();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('first-title')).toHaveTextContent('저장된 작업');
  });

  it('persists mutations to localStorage', async () => {
    setup();
    await userEvent.click(screen.getByText('add'));
    const saved = JSON.parse(localStorage.getItem(TASKS_KEY)!) as Task[];
    expect(saved).toHaveLength(SAMPLE_TASKS.length + 1);
    expect(saved[0].title).toBe('새 작업');
  });
});
