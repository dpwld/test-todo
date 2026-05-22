'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { Icon } from '@/components/shared/Icon';

export function LogoutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <button
      className="btn btn--ghost"
      type="button"
      onClick={handleSignOut}
      aria-label="로그아웃"
      style={{
        width: '100%',
        justifyContent: 'flex-start',
        gap: 8,
        padding: '6px 12px',
        fontSize: 13,
        color: 'var(--color-gray-500)',
      }}
    >
      <Icon name="log-out" size={14} />
      로그아웃
    </button>
  );
}
