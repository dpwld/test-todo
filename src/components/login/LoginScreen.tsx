'use client';

// Login screen — 실제 Supabase 인증 연결.
// 이메일/비밀번호 로그인·회원가입 + Google OAuth 지원.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, GoogleIcon } from '@/components/shared/Icon';
import { Check } from '@/components/shared/Check';
import { useAuth } from '@/context/AuthProvider';

// Supabase 오류 코드 → 한국어 메시지
function toKoreanError(message: string): string {
  if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  if (message.includes('User already registered') || message.includes('user_already_exists')) {
    return '이미 사용 중인 이메일입니다.';
  }
  if (message.includes('weak_password') || message.includes('Password should be')) {
    return '비밀번호는 최소 8자 이상이어야 합니다.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('Failed')) {
    return '연결에 실패했습니다. 잠시 후 다시 시도해주세요.';
  }
  return '오류가 발생했습니다. 다시 시도해주세요.';
}

export function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pw) return;
    setError(null);
    setLoading(true);
    const err = await signIn(email, pw);
    setLoading(false);
    if (err) {
      setError(toKoreanError(err.message));
    } else {
      router.push('/main');
    }
  };

  const handleSignUp = async () => {
    if (!email || !pw) return;
    setError(null);
    setLoading(true);
    const err = await signUp(email, pw);
    setLoading(false);
    if (err) {
      setError(toKoreanError(err.message));
    } else {
      router.push('/main');
    }
  };

  const handleGoogle = async () => {
    setError(null);
    await signInWithGoogle();
  };

  return (
    <div className="login">
      {/* Dark hero */}
      <div className="login__side">
        <div className="login__brand">
          <span className="login__brand-mark">
            <Icon name="check" size={16} strokeWidth={2.5} />
          </span>
          <span>
            demodev{' '}
            <span style={{ color: 'var(--color-gray-500)', fontWeight: 500 }}>
              · Tasks
            </span>
          </span>
        </div>

        <div className="login__hero">
          <span className="login__eyebrow">매일의 흐름</span>
          <h2 className="login__title">
            오늘 할 일에만
            <br />
            온전히 집중하세요.
          </h2>
          <p className="login__sub">
            팀과 개인의 모든 작업을 한 곳에서. 마감일, 우선순위, 서브태스크까지 —
            외주 프로젝트의 복잡한 일정을 단순하게 만들어 줍니다.
          </p>
        </div>

        <div className="login__foot">
          © 2026 demodev (대모산개발단). All rights reserved.
        </div>
      </div>

      {/* Form */}
      <div className="login__pane">
        <div className="login__form">
          <div>
            <h1>
              {mode === 'login' ? '다시 오신 것을 환영합니다' : '계정 만들기'}
            </h1>
            <p style={{ marginTop: 8 }}>
              {mode === 'login'
                ? '계정에 로그인하고 오늘의 할 일을 확인하세요.'
                : '이메일로 무료 계정을 만드세요.'}
            </p>
          </div>

          <div className="login__alt">
            <button
              className="btn btn--outline"
              type="button"
              style={{ height: 44, justifyContent: 'center', gap: 8 }}
              onClick={handleGoogle}
            >
              <GoogleIcon size={16} /> Google
            </button>
          </div>

          <div className="login__divider">또는 이메일로</div>

          {error && (
            <p
              role="alert"
              style={{
                color: 'var(--color-red-500, #ef4444)',
                fontSize: 14,
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <div className="login__group">
            <label htmlFor="login-email">이메일</label>
            <div className="field field--lg">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="login__group">
            <div className="login__row">
              <label htmlFor="login-pw">비밀번호</label>
              {mode === 'login' && <a href="#">잊어버리셨나요?</a>}
            </div>
            <div className="field field--lg">
              <input
                id="login-pw"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {mode === 'login' && (
            <div className="cb">
              <Check
                checked={remember}
                onToggle={() => setRemember((r) => !r)}
                label="로그인 상태 유지"
              />
              <span>로그인 상태 유지</span>
            </div>
          )}

          {mode === 'login' ? (
            <>
              <button
                className="btn btn--primary btn--lg btn--block"
                type="button"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? '로그인 중…' : '로그인'}
              </button>
              <div className="login__signup">
                계정이 없으신가요?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode('signup');
                    setError(null);
                  }}
                >
                  무료로 시작하기
                </a>
              </div>
            </>
          ) : (
            <>
              <button
                className="btn btn--primary btn--lg btn--block"
                type="button"
                onClick={handleSignUp}
                disabled={loading}
              >
                {loading ? '처리 중…' : '회원가입'}
              </button>
              <div className="login__signup">
                이미 계정이 있으신가요?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode('login');
                    setError(null);
                  }}
                >
                  로그인
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
