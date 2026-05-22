import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogoutButton } from '@/components/shared/LogoutButton';

const mockSignOut = vi.fn();
const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('@/context/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    loading: false,
    signOut: mockSignOut,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('LogoutButton', () => {
  it('로그아웃 버튼이 렌더됨', () => {
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /로그아웃/ })).toBeInTheDocument();
  });

  it('클릭 시 signOut 호출됨', async () => {
    mockSignOut.mockResolvedValue(undefined);
    render(<LogoutButton />);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /로그아웃/ }));
    });

    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it('signOut 후 로그인 화면으로 이동', async () => {
    mockSignOut.mockResolvedValue(undefined);
    render(<LogoutButton />);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /로그아웃/ }));
    });

    expect(push).toHaveBeenCalledWith('/');
  });
});
