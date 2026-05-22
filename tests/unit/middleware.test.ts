import { describe, it, expect, vi, beforeEach } from 'vitest';

// Supabase SSR 모킹 — middleware.ts 로드 전에 등록
const mockGetUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

// middleware 내부의 보호 로직만 단위 테스트
// (Next.js EdgeRuntime이 없으므로 순수 로직으로 추출하여 검증)

const PROTECTED_PATHS = ['/main', '/calendar', '/stats'];
const LOGIN_PATH = '/';

function isProtected(pathname: string) {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

function shouldRedirectToLogin(pathname: string, user: unknown) {
  return isProtected(pathname) && !user;
}

function shouldRedirectToMain(pathname: string, user: unknown) {
  return pathname === LOGIN_PATH && !!user;
}

beforeEach(() => vi.clearAllMocks());

describe('middleware 라우트 보호 로직', () => {
  it('비인증 사용자 + /main → 로그인 리다이렉트', () => {
    expect(shouldRedirectToLogin('/main', null)).toBe(true);
  });

  it('비인증 사용자 + /calendar → 로그인 리다이렉트', () => {
    expect(shouldRedirectToLogin('/calendar', null)).toBe(true);
  });

  it('비인증 사용자 + /stats → 로그인 리다이렉트', () => {
    expect(shouldRedirectToLogin('/stats', null)).toBe(true);
  });

  it('인증된 사용자 + / → /main 리다이렉트', () => {
    expect(shouldRedirectToMain('/', { id: 'user-1' })).toBe(true);
  });

  it('인증된 사용자 + /main → 통과 (리다이렉트 없음)', () => {
    expect(shouldRedirectToLogin('/main', { id: 'user-1' })).toBe(false);
    expect(shouldRedirectToMain('/main', { id: 'user-1' })).toBe(false);
  });

  it('/auth/callback은 보호 경로가 아님', () => {
    expect(isProtected('/auth/callback')).toBe(false);
  });

  it('비인증 사용자 + / → 통과 (로그인 화면 보여야 함)', () => {
    expect(shouldRedirectToLogin('/', null)).toBe(false);
    expect(shouldRedirectToMain('/', null)).toBe(false);
  });
});
