import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksProvider, useTasks } from '@/context/TasksProvider';
import { SAMPLE_TASKS } from '@/lib/store/sample-data';
import type { Task } from '@/lib/types';

// Supabase 클라이언트 모킹
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDeleteFn = vi.fn();
const mockEq = vi.fn();

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: mockSelect,
      insert: mockInsert,
      update: () => ({ eq: mockEq }),
      delete: () => ({ eq: mockEq }),
    }),
  }),
}));

vi.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'test@example.com' } }),
}));

// Test harness
function Probe() {
  const { tasks, addTask, toggleDone, deleteTask, updateTask, addSub, toggleSub, deleteSub } = useTasks();
  const first = tasks[0];
  return (
    <div>
      <span data-testid="count">{tasks.length}</span>
      <span data-testid="first-title">{first?.title}</span>
      <span data-testid="first-done">{String(first?.done)}</span>
      <span data-testid="first-subs">{first?.subs.length}</span>
      <span data-testid="first-sub0-done">{String(first?.subs[0]?.done)}</span>
      <button onClick={() => addTask('새 작업', null, 'today')}>add</button>
      {first && <button onClick={() => toggleDone(first.id)}>toggleDone</button>}
      {first && <button onClick={() => deleteTask(first.id)}>delete</button>}
      {first && <button onClick={() => updateTask(first.id, { title: '수정됨' })}>update</button>}
      {first && <button onClick={() => addSub(first.id, '새 서브')}>addSub</button>}
      {first?.subs[0] && <button onClick={() => toggleSub(first.id, first.subs[0].id)}>toggleSub</button>}
      {first?.subs[0] && <button onClick={() => deleteSub(first.id, first.subs[0].id)}>deleteSub</button>}
    </div>
  );
}

function setup() {
  return render(<TasksProvider><Probe /></TasksProvider>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSelect.mockResolvedValue({ data: SAMPLE_TASKS, error: null });
  mockInsert.mockResolvedValue({ data: null, error: null });
  mockEq.mockResolvedValue({ data: null, error: null });
});

describe('TasksProvider', () => {
  it('Supabase에서 tasks 로드 후 초기화', async () => {
    setup();
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent(String(SAMPLE_TASKS.length))
    );
    expect(screen.getByTestId('first-title')).toHaveTextContent(SAMPLE_TASKS[0].title);
  });

  it('addTask inserts a task at the front', async () => {
    setup();
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent(String(SAMPLE_TASKS.length))
    );
    await userEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('count')).toHaveTextContent(String(SAMPLE_TASKS.length + 1));
    expect(screen.getByTestId('first-title')).toHaveTextContent('새 작업');
  });

  it('toggleDone flips the task done flag', async () => {
    setup();
    await waitFor(() =>
      expect(screen.getByTestId('first-done')).toHaveTextContent('false')
    );
    await userEvent.click(screen.getByText('toggleDone'));
    expect(screen.getByTestId('first-done')).toHaveTextContent('true');
  });

  it('deleteTask removes the task', async () => {
    setup();
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent(String(SAMPLE_TASKS.length))
    );
    await userEvent.click(screen.getByText('delete'));
    expect(screen.getByTestId('count')).toHaveTextContent(String(SAMPLE_TASKS.length - 1));
  });

  it('updateTask patches the task', async () => {
    setup();
    await waitFor(() =>
      expect(screen.getByTestId('first-title')).toHaveTextContent(SAMPLE_TASKS[0].title)
    );
    await userEvent.click(screen.getByText('update'));
    expect(screen.getByTestId('first-title')).toHaveTextContent('수정됨');
  });

  it('addSub / toggleSub / deleteSub mutate subtasks', async () => {
    setup();
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent(String(SAMPLE_TASKS.length))
    );
    const subsBefore = Number(screen.getByTestId('first-subs').textContent);
    await userEvent.click(screen.getByText('addSub'));
    expect(screen.getByTestId('first-subs')).toHaveTextContent(String(subsBefore + 1));

    expect(screen.getByTestId('first-sub0-done')).toHaveTextContent('true');
    await userEvent.click(screen.getByText('toggleSub'));
    expect(screen.getByTestId('first-sub0-done')).toHaveTextContent('false');

    await userEvent.click(screen.getByText('deleteSub'));
    expect(screen.getByTestId('first-subs')).toHaveTextContent(String(subsBefore));
  });

  it('Supabase에서 특정 tasks 로드', async () => {
    const stored: Task[] = [{
      id: 'stored1', title: '저장된 작업', due: '', priority: 'none',
      category: 'dev', starred: false, done: false, notes: '', subs: [],
    }];
    mockSelect.mockResolvedValue({ data: stored, error: null });
    setup();
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    );
    expect(screen.getByTestId('first-title')).toHaveTextContent('저장된 작업');
  });

  it('addTask 시 Supabase insert 호출됨', async () => {
    setup();
    await waitFor(() =>
      expect(screen.getByTestId('count')).toHaveTextContent(String(SAMPLE_TASKS.length))
    );
    await act(async () => {
      await userEvent.click(screen.getByText('add'));
    });
    expect(mockInsert).toHaveBeenCalled();
  });
});
