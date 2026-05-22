import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainScreen } from '@/components/main/MainScreen';
import { TasksProvider } from '@/context/TasksProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import { SAMPLE_TASKS } from '@/lib/store/sample-data';

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

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockResolvedValue({ data: SAMPLE_TASKS, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: () => ({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
      delete: () => ({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    }),
  }),
}));

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
  nav.push.mockClear();
});

async function renderMain() {
  const result = render(
    <ThemeProvider>
      <TasksProvider>
        <MainScreen />
      </TasksProvider>
    </ThemeProvider>,
  );
  await act(async () => {});
  return result;
}

describe('MainScreen', () => {
  it('renders the three panels: nav, list, detail placeholder', async () => {
    await renderMain();
    expect(screen.getByText('Tasks')).toBeInTheDocument(); // SideNav brand
    expect(
      screen.getByPlaceholderText(/할 일을 추가하세요/),
    ).toBeInTheDocument(); // TaskList add input
    expect(
      screen.getByText('선택된 할 일이 없습니다'),
    ).toBeInTheDocument(); // empty DetailPanel placeholder
  });

  it('defaults to the today view when no query is present', async () => {
    await renderMain();
    expect(screen.getByRole('heading', { name: /오늘/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /오늘/ })).toHaveClass(
      'is-active',
    );
  });

  it('reflects the view query', async () => {
    nav.params = new URLSearchParams('view=upcoming');
    await renderMain();
    expect(screen.getByRole('heading', { name: /예정/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /예정/ })).toHaveClass(
      'is-active',
    );
  });

  it('reflects the category query', async () => {
    nav.params = new URLSearchParams('cat=design');
    await renderMain();
    expect(screen.getByRole('heading', { name: /디자인/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /디자인/ })).toHaveClass(
      'is-active',
    );
  });

  it('ignores an unknown view query and falls back to today', async () => {
    nav.params = new URLSearchParams('view=bogus');
    await renderMain();
    expect(screen.getByRole('heading', { name: /오늘/ })).toBeInTheDocument();
  });

  it('selects a task into the detail panel when its row is clicked', async () => {
    await renderMain(); // today view — t1 is visible
    await userEvent.click(
      screen.getByText('Q4 디자인 시스템 토큰 마이그레이션 리뷰'),
    );
    expect(
      screen.getByDisplayValue('Q4 디자인 시스템 토큰 마이그레이션 리뷰'),
    ).toBeInTheDocument();
  });

  it('returns to the empty detail state after deleting the selected task', async () => {
    await renderMain();
    await userEvent.click(
      screen.getByText('Q4 디자인 시스템 토큰 마이그레이션 리뷰'),
    );
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(screen.getByText('선택된 할 일이 없습니다')).toBeInTheDocument();
  });
});
