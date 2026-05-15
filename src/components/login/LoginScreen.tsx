'use client';

// Login screen — split layout: dark hero (with a decorative preview list) on
// the left, the form on the right. Presentational: there is no real auth, so
// the login and social buttons just route to /main.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, GoogleIcon } from '@/components/shared/Icon';
import { Check } from '@/components/shared/Check';

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('minji@demodev.kr');
  const [pw, setPw] = useState('••••••••••');
  const [remember, setRemember] = useState(true);

  const goToMain = () => router.push('/main');

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

        {/* Decorative preview */}
        <div className="login__preview" aria-hidden="true">
          <div className="login__preview-row is-done">
            <span className="login__preview-check is-on">
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                style={{ display: 'block', margin: '2px auto' }}
              >
                <path
                  d="M2 6L5 9L10 3"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>팀 위클리 안건 정리</span>
            <span className="meta">오늘</span>
          </div>
          <div className="login__preview-row">
            <span className="login__preview-check" />
            <span>Q4 디자인 시스템 토큰 리뷰</span>
            <span className="meta">오늘</span>
          </div>
          <div className="login__preview-row">
            <span className="login__preview-check" />
            <span>코드 리뷰 — PR #234</span>
            <span className="meta">오늘</span>
          </div>
          <div className="login__preview-row">
            <span className="login__preview-check" />
            <span>신규 클라이언트 킥오프 미팅 준비</span>
            <span className="meta">내일</span>
          </div>
          <div className="login__preview-row">
            <span className="login__preview-check" />
            <span>스프린트 회고 자료 정리</span>
            <span className="meta">5/18</span>
          </div>
        </div>

        <div className="login__foot">
          © 2026 demodev (대모산개발단). All rights reserved.
        </div>
      </div>

      {/* Form */}
      <div className="login__pane">
        <div className="login__form">
          <div>
            <h1>다시 오신 것을 환영합니다</h1>
            <p style={{ marginTop: 8 }}>
              계정에 로그인하고 오늘의 할 일을 확인하세요.
            </p>
          </div>

          <div className="login__alt">
            <button
              className="btn btn--outline"
              type="button"
              style={{ height: 44, justifyContent: 'center', gap: 8 }}
              onClick={goToMain}
            >
              <GoogleIcon size={16} /> Google
            </button>
            <button
              className="btn btn--outline"
              type="button"
              style={{ height: 44, justifyContent: 'center', gap: 8 }}
              onClick={goToMain}
            >
              <Icon name="github" size={16} /> GitHub
            </button>
          </div>

          <div className="login__divider">또는 이메일로</div>

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
              <a href="#">잊어버리셨나요?</a>
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

          <div className="cb">
            <Check
              checked={remember}
              onToggle={() => setRemember((r) => !r)}
              label="로그인 상태 유지"
            />
            <span>로그인 상태 유지</span>
          </div>

          <button
            className="btn btn--primary btn--lg btn--block"
            type="button"
            onClick={goToMain}
          >
            로그인
          </button>

          <div className="login__signup">
            계정이 없으신가요? <a href="#">무료로 시작하기</a>
          </div>
        </div>
      </div>
    </div>
  );
}
