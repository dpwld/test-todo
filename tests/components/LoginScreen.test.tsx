import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginScreen } from '@/components/login/LoginScreen';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

beforeEach(() => push.mockClear());

describe('LoginScreen', () => {
  it('renders the split layout: dark hero and the form', () => {
    render(<LoginScreen />);
    expect(screen.getByText('매일의 흐름')).toBeInTheDocument(); // hero eyebrow
    expect(
      screen.getByRole('heading', { name: '다시 오신 것을 환영합니다' }),
    ).toBeInTheDocument(); // form heading
  });

  it('renders the social buttons and the email/password fields', () => {
    render(<LoginScreen />);
    expect(
      screen.getByRole('button', { name: /Google/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /GitHub/ }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
  });

  it('toggles the "로그인 상태 유지" checkbox', async () => {
    render(<LoginScreen />);
    const cb = screen.getByRole('checkbox', { name: '로그인 상태 유지' });
    const initial = cb.getAttribute('aria-checked');
    await userEvent.click(cb);
    expect(
      screen.getByRole('checkbox', { name: '로그인 상태 유지' }),
    ).not.toHaveAttribute('aria-checked', initial!);
  });

  it('navigates to /main on login', async () => {
    render(<LoginScreen />);
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(push).toHaveBeenCalledWith('/main');
  });

  it('navigates to /main from a social button', async () => {
    render(<LoginScreen />);
    await userEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(push).toHaveBeenCalledWith('/main');
  });
});
