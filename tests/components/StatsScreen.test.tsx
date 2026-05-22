import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatsScreen } from '@/components/stats/StatsScreen';
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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

async function renderStats() {
  const result = render(
    <ThemeProvider>
      <TasksProvider>
        <StatsScreen />
      </TasksProvider>
    </ThemeProvider>,
  );
  await act(async () => {});
  return result;
}

describe('StatsScreen', () => {
  it('renders the 통계 heading and the 4 KPI cards', async () => {
    await renderStats();
    expect(screen.getByRole('heading', { name: '통계' })).toBeInTheDocument();
    expect(screen.getByText('완료율')).toBeInTheDocument();
    // "완료한 할 일" also appears in the donut center, so scope to the KPI label.
    expect(
      screen.getByText('완료한 할 일', { selector: '.kpi__label' }),
    ).toBeInTheDocument();
    expect(screen.getByText('연속 달성')).toBeInTheDocument();
    expect(screen.getByText('가장 활발한 시간')).toBeInTheDocument();
  });

  it('renders the four data panels', async () => {
    await renderStats();
    expect(screen.getByText('주간 완료 흐름')).toBeInTheDocument();
    expect(screen.getByText('카테고리 분포')).toBeInTheDocument();
    expect(screen.getByText('카테고리별 진행률')).toBeInTheDocument();
    expect(screen.getByText('활동 히트맵')).toBeInTheDocument();
  });

  it('renders the 20-week × 7-day heatmap (140 cells)', async () => {
    const { container } = await renderStats();
    expect(container.querySelectorAll('.streak__cell')).toHaveLength(140);
  });

  it('renders the weekly bar chart with one column per day', async () => {
    const { container } = await renderStats();
    expect(container.querySelectorAll('.chart__col')).toHaveLength(7);
  });

  it('the period toggle defaults to 이번 주 and updates on click', async () => {
    await renderStats();
    expect(screen.getByRole('button', { name: '이번 주' })).toHaveClass(
      'is-active',
    );
    await userEvent.click(screen.getByRole('button', { name: '이번 달' }));
    expect(screen.getByRole('button', { name: '이번 달' })).toHaveClass(
      'is-active',
    );
    expect(screen.getByRole('button', { name: '이번 주' })).not.toHaveClass(
      'is-active',
    );
  });
});
