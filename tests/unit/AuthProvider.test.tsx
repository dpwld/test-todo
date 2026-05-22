import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/context/AuthProvider';

// Supabase 클라이언트 모킹
const mockGetUser = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      signInWithOAuth: mockSignInWithOAuth,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));

function TestConsumer() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.email ?? 'null'}</span>
      <button onClick={() => signIn('a@b.com', 'pass')}>로그인</button>
      <button onClick={() => signUp('a@b.com', 'pass')}>회원가입</button>
      <button onClick={() => signOut()}>로그아웃</button>
    </div>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

describe('AuthProvider', () => {
  it('초기 상태: loading=true, user=null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // 최초 렌더 직후에는 loading=true
    expect(screen.getByTestId('loading').textContent).toBe('true');

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('getUser 성공 시 user 상태 설정', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('user').textContent).toBe('test@example.com')
    );
  });

  it('signIn 성공 시 error null 반환', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('로그인'));
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
    });
  });

  it('signIn 실패 시 AuthError 반환', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const mockError = { message: 'Invalid credentials' };
    mockSignInWithPassword.mockResolvedValue({ error: mockError });

    let capturedError: unknown;
    function ErrorConsumer() {
      const { signIn } = useAuth();
      return (
        <button
          onClick={async () => {
            capturedError = await signIn('a@b.com', 'wrong');
          }}
        >
          로그인
        </button>
      );
    }

    render(
      <AuthProvider>
        <ErrorConsumer />
      </AuthProvider>
    );

    await act(async () => {
      await userEvent.click(screen.getByText('로그인'));
    });

    expect(capturedError).toEqual(mockError);
  });

  it('signUp 성공 시 error null 반환', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockSignUp.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('회원가입'));
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
    });
  });

  it('signOut 호출 시 supabase.auth.signOut 호출됨', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { email: 'test@example.com' } } });
    mockSignOut.mockResolvedValue({});

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      await userEvent.click(screen.getByText('로그아웃'));
    });

    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});
