# Research: 인증 및 클라우드 저장소

**Feature**: 002-auth-cloud-storage
**Date**: 2026-05-22

---

## 1. Supabase Auth + Next.js 15 App Router 통합

**Decision**: `@supabase/ssr` 쿠키 기반 세션, Next.js Middleware에서 보호 라우트 처리

**Rationale**:
- App Router는 Server Component에서 `cookies()`로 세션을 읽어야 하므로 JWT를
  localStorage에 저장하는 방식(legacy `@supabase/auth-helpers-nextjs`)은 SSR에서
  동작하지 않는다.
- `@supabase/ssr`은 쿠키를 통해 서버/클라이언트 양쪽에서 동일한 세션을 공유하는
  공식 권장 방식이다. (이미 `src/utils/supabase/` 헬퍼로 설치 완료)
- Next.js Middleware는 Edge Runtime에서 실행되어 Vercel 배포 시 모든 요청 전에
  인증 확인이 가능하다.

**Alternatives considered**:
- `@supabase/auth-helpers-nextjs` — 구버전, App Router 미최적화, 제외.
- 클라이언트에서만 인증 확인 — SSR 시 보호 페이지 내용이 잠깐 노출될 수 있어 제외.

**Key implementation pattern**:
```
middleware.ts (루트)
  └── createClient(request) from utils/supabase/middleware.ts
      └── supabase.auth.getUser()
          ├── 비인증 + 보호경로 → redirect('/') 
          └── 인증됨 + 로그인경로 → redirect('/main')
```

---

## 2. Google OAuth 설정 (Supabase + Vercel)

**Decision**: Supabase Dashboard에서 Google OAuth Provider 활성화 + `/auth/callback` route 추가

**Rationale**:
- Supabase Auth는 OAuth Provider를 내장 지원한다. Google Cloud Console에서 OAuth 앱을
  만들고 Client ID/Secret을 Supabase Dashboard에 등록하면 된다.
- OAuth 리다이렉트 URL은 Supabase에서 자동 처리하고, 앱은 `/auth/callback` 경로에서
  코드를 세션으로 교환(exchange)하기만 하면 된다.

**Alternatives considered**:
- NextAuth.js — 별도 라이브러리 추가 필요, Supabase 세션과 이중 관리 발생, 제외.

**Setup steps**:
1. Google Cloud Console → OAuth 2.0 앱 생성
2. 승인된 리다이렉트 URI: `https://<supabase-ref>.supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → Google 활성화
4. Vercel 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 등록

---

## 3. RLS(Row Level Security)로 사용자별 데이터 격리

**Decision**: `tasks` 테이블에 `user_id uuid` 컬럼 추가 + RLS 정책 4개

**Rationale**:
- Supabase에서 RLS는 데이터베이스 레벨 접근 제어이므로 클라이언트 코드를 우회해도
  다른 사용자의 데이터를 읽을 수 없다. 애플리케이션 레벨 필터보다 훨씬 안전하다.

**RLS Policies**:
```sql
-- SELECT: 자신의 task만 조회
CREATE POLICY "tasks_select" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: user_id를 현재 사용자로 강제
CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: 자신의 task만 수정
CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: 자신의 task만 삭제
CREATE POLICY "tasks_delete" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 4. localStorage → Supabase 마이그레이션 전략

**Decision**: 신규 사용자부터 Supabase 사용. 기존 localStorage 데이터 마이그레이션 없음.

**Rationale**:
- 강의 실습용 프로젝트로 기존 사용자 데이터 마이그레이션이 불필요하다.
- `TasksProvider`를 수정하여 Supabase CRUD로 교체하되, 순수 함수인 `reducer.ts`는
  그대로 유지한다. 상태 관리 로직은 변경 없이 데이터 소스만 교체한다.

**Alternatives considered**:
- localStorage 데이터를 첫 로그인 시 Supabase로 이전 — 불필요한 복잡도, 제외.

---

## 5. Vercel 배포 환경 설정

**Decision**: Vercel 환경변수로 Supabase 키 관리, Edge Middleware 사용

**Required env vars (Vercel Dashboard)**:
```
NEXT_PUBLIC_SUPABASE_URL=https://yhfplwqcnwxzevtttfcx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

**Rationale**:
- `NEXT_PUBLIC_*` prefix가 있으므로 클라이언트 번들에 포함된다.
- Vercel의 Edge Runtime은 Next.js Middleware를 지원하므로 별도 설정 없이 동작한다.

---

## 6. 기존 기능 회귀 방지

**Decision**: 기존 122개 테스트를 모두 통과시킨 채 인증 레이어를 추가한다.

**Approach**:
- `TasksProvider`의 Supabase 클라이언트를 vi.mock()으로 모킹하여 기존 단위 테스트가
  실제 네트워크 없이도 동작하도록 한다.
- 신규 통합 테스트는 `tests/integration/` 하위에 별도 추가한다.
