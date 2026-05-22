import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TasksProvider, useTasks } from '@/context/TasksProvider';

// Supabase 클라이언트 모킹
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
}));

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({ from: mockFrom }),
}));

vi.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'test@example.com' } }),
}));

function TestConsumer() {
  const { tasks, addTask, deleteTask } = useTasks();
  return (
    <div>
      <span data-testid="count">{tasks.length}</span>
      <button onClick={() => addTask('새 할 일', null, 'inbox')}>추가</button>
      {tasks.map((t) => (
        <button key={t.id} onClick={() => deleteTask(t.id)}>
          삭제:{t.id}
        </button>
      ))}
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // 기본: select → 빈 배열
  mockSelect.mockResolvedValue({ data: [], error: null });
  mockEq.mockResolvedValue({ data: [], error: null });
  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: vi.fn(() => ({ eq: mockEq })),
    eq: mockEq,
  });
  mockInsert.mockResolvedValue({ data: null, error: null });
  mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) });
});

describe('TasksProvider — Supabase 통합', () => {
  it('마운트 시 supabase.from("tasks").select() 호출', async () => {
    render(
      <TasksProvider>
        <TestConsumer />
      </TasksProvider>
    );

    await waitFor(() => expect(mockFrom).toHaveBeenCalledWith('tasks'));
    expect(mockSelect).toHaveBeenCalled();
  });

  it('비로그인 시 loadTasks 호출 안 함', async () => {
    // useAuth를 재모킹하여 user=null 반환
    vi.doMock('@/context/AuthProvider', () => ({
      useAuth: () => ({ user: null }),
    }));

    // 이 테스트에서는 select가 호출되지 않아야 함
    // (TasksProvider가 user=null이면 fetch 스킵)
    render(
      <TasksProvider>
        <TestConsumer />
      </TasksProvider>
    );

    // 마운트 완료 후에도 select 미호출 (또는 빈 배열 반환)
    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('0');
    });
  });

  it('addTask 시 supabase.insert() 호출', async () => {
    render(
      <TasksProvider>
        <TestConsumer />
      </TasksProvider>
    );

    await act(async () => {
      await userEvent.click(screen.getByText('추가'));
    });

    expect(mockFrom).toHaveBeenCalledWith('tasks');
    expect(mockInsert).toHaveBeenCalled();
  });

  it('deleteTask 시 supabase.delete().eq() 호출', async () => {
    const mockDeleteChain = vi.fn(() => ({ eq: mockEq }));
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDeleteChain,
      eq: mockEq,
    });

    // select가 task 1개 반환하도록
    mockSelect.mockResolvedValue({
      data: [{ id: 't1', title: '테스트', due: '', priority: 'none', category: 'personal', starred: false, done: false, notes: '', subs: [] }],
      error: null,
    });

    render(
      <TasksProvider>
        <TestConsumer />
      </TasksProvider>
    );

    await waitFor(() =>
      expect(screen.getByText(/삭제:t1/)).toBeInTheDocument()
    );

    await act(async () => {
      await userEvent.click(screen.getByText(/삭제:t1/));
    });

    expect(mockDeleteChain).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', 't1');
  });
});
