import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginScreen } from '@/components/login/LoginScreen';

// AuthProvider 모킹
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();

vi.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    signOut: vi.fn(),
  }),
}));

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSignIn.mockResolvedValue(null);
  mockSignUp.mockResolvedValue(null);
});

describe('LoginScreen', () => {
  it('renders the split layout: dark hero and the form', () => {
    render(<LoginScreen />);
    expect(screen.getByText('매일의 흐름')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '다시 오신 것을 환영합니다' }),
    ).toBeInTheDocument();
  });

  it('renders the social button and the email/password fields', () => {
    render(<LoginScreen />);
    expect(
      screen.getByRole('button', { name: /Google/ }),
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

  it('로그인 버튼 클릭 시 signIn 호출 후 /main 이동', async () => {
    render(<LoginScreen />);

    await userEvent.type(screen.getByLabelText('이메일'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'pass1234');

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    });

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'pass1234');
    await waitFor(() => expect(push).toHaveBeenCalledWith('/main'));
  });

  it('Google 버튼 클릭 시 signInWithGoogle 호출됨', async () => {
    render(<LoginScreen />);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Google/ }));
    });

    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });
});
