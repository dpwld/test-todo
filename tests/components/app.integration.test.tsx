import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/context/ThemeProvider';
import { TasksProvider } from '@/context/TasksProvider';
import { MainScreen } from '@/components/main/MainScreen';
import { SAMPLE_TASKS } from '@/lib/store/sample-data';
import type { Task } from '@/lib/types';

vi.mock('@/context/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: unknown }) => children,
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}));

// Mutable in-memory store so inserts are visible on the next select call.
let mockDb: Task[] = [];

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockImplementation(() => Promise.resolve({ data: mockDb, error: null })),
      insert: vi.fn().mockImplementation((rows: Task | Task[]) => {
        const newRows = Array.isArray(rows) ? rows : [rows];
        mockDb = [...mockDb, ...newRows];
        return Promise.resolve({ data: null, error: null });
      }),
      update: () => ({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
      delete: () => ({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    }),
  }),
}));

// Integration coverage for US6: the persistence + theme mechanism, exercised
// through the real provider + screen composition (not the units in isolation).

const nav = vi.hoisted(() => ({
  params: new URLSearchParams(),
  push: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => nav.params,
  useRouter: () => ({ push: nav.push }),
}));

beforeEach(() => {
  nav.params = new URLSearchParams();
  document.documentElement.removeAttribute('data-theme');
  mockDb = [...SAMPLE_TASKS];
});

function App() {
  return (
    <ThemeProvider>
      <TasksProvider>
        <MainScreen />
      </TasksProvider>
    </ThemeProvider>
  );
}

describe('app integration — persistence & theme (US6)', () => {
  it('seeds the sample tasks on first run', async () => {
    render(<App />);
    await act(async () => {});
    expect(
      screen.getByText('Q4 디자인 시스템 토큰 마이그레이션 리뷰'),
    ).toBeInTheDocument();
  });

  it('persists an added task across a remount', async () => {
    const { unmount } = render(<App />);
    await act(async () => {});
    await userEvent.type(
      screen.getByPlaceholderText(/할 일을 추가하세요/),
      '영속성 테스트 작업{Enter}',
    );
    expect(screen.getByText('영속성 테스트 작업')).toBeInTheDocument();

    unmount();
    render(<App />);
    await act(async () => {});
    expect(screen.getByText('영속성 테스트 작업')).toBeInTheDocument();
  });

  it('persists the theme across a remount', async () => {
    const { unmount } = render(<App />);
    await act(async () => {});
    expect(document.documentElement.dataset.theme).toBe('light');

    await userEvent.click(screen.getByRole('switch', { name: /테마/ }));
    expect(document.documentElement.dataset.theme).toBe('dark');

    unmount();
    render(<App />);
    await act(async () => {});
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
