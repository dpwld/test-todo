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
});

describe('LoginScreen — 실제 인증', () => {
  it('로그인 버튼 클릭 시 signIn 호출됨', async () => {
    mockSignIn.mockResolvedValue(null);
    render(<LoginScreen />);

    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'password123');

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    });

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('signIn 성공 시 /main으로 이동', async () => {
    mockSignIn.mockResolvedValue(null);
    render(<LoginScreen />);

    await userEvent.type(screen.getByLabelText('이메일'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password123');

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    });

    await waitFor(() => expect(push).toHaveBeenCalledWith('/main'));
  });

  it('signIn 실패 시 한국어 오류 메시지 표시', async () => {
    mockSignIn.mockResolvedValue({ message: 'Invalid login credentials' });
    render(<LoginScreen />);

    await userEvent.type(screen.getByLabelText('이메일'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'wrongpass');

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toMatch(/이메일 또는 비밀번호/);
    });
  });

  it('이메일 빈값 시 로그인 시도 안 함', async () => {
    render(<LoginScreen />);

    const emailInput = screen.getByLabelText('이메일');
    await userEvent.clear(emailInput);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('"무료로 시작하기" 클릭 시 회원가입 폼 표시됨', async () => {
    render(<LoginScreen />);

    await userEvent.click(screen.getByText(/무료로 시작하기/));

    expect(
      screen.getByRole('button', { name: /회원가입/ })
    ).toBeInTheDocument();
  });

  it('회원가입 버튼 클릭 시 signUp 호출됨', async () => {
    mockSignUp.mockResolvedValue(null);
    render(<LoginScreen />);

    // 회원가입 폼으로 전환
    await userEvent.click(screen.getByText(/무료로 시작하기/));

    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'new@example.com');
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'newpass123');

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /회원가입/ }));
    });

    expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'newpass123');
  });

  it('Google 버튼 클릭 시 signInWithGoogle 호출됨', async () => {
    render(<LoginScreen />);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Google/ }));
    });

    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });
});
