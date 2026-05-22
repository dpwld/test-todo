import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarScreen } from '@/components/calendar/CalendarScreen';
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

async function renderCalendar() {
  const result = render(
    <ThemeProvider>
      <TasksProvider>
        <CalendarScreen />
      </TasksProvider>
    </ThemeProvider>,
  );
  await act(async () => {});
  return result;
}

describe('CalendarScreen', () => {
  it('renders May 2026 as a 6-week (42-cell) grid', async () => {
    const { container } = await renderCalendar();
    expect(screen.getByRole('heading', { name: '5월' })).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(container.querySelectorAll('.cell')).toHaveLength(42);
  });

  it('highlights today (May 15)', async () => {
    const { container } = await renderCalendar();
    const today = container.querySelector('.cell.is-today');
    expect(today).not.toBeNull();
    expect(today).toHaveTextContent('15');
  });

  it('renders task events in their date cells with a "+N개 더" overflow', async () => {
    await renderCalendar();
    // t6 is due 2026-05-16; the selected day defaults to 05-15 so it only
    // appears in the grid, not the preview panel.
    expect(
      screen.getByText('신규 클라이언트 킥오프 미팅 준비'),
    ).toBeInTheDocument();
    // 2026-05-15 has 4 tasks → 3 shown + "+ 1개 더"
    expect(screen.getByText(/1개 더/)).toBeInTheDocument();
  });

  it('shows the selected day in the preview panel and updates on date click', async () => {
    await renderCalendar();
    expect(screen.getByText('5월 15일')).toBeInTheDocument(); // default selection
    await userEvent.click(screen.getByText('16')); // click the May 16 cell
    expect(screen.getByText('5월 16일')).toBeInTheDocument();
  });

  it('navigates months with 다음 달 / 오늘', async () => {
    await renderCalendar();
    await userEvent.click(screen.getByRole('button', { name: '다음 달' }));
    expect(screen.getByRole('heading', { name: '6월' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '오늘로 이동' }));
    expect(screen.getByRole('heading', { name: '5월' })).toBeInTheDocument();
  });
});
