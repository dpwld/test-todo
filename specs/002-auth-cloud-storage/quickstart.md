# Quickstart: 인증 및 클라우드 저장소

**Feature**: 002-auth-cloud-storage
**Date**: 2026-05-22

---

## 사전 준비

### 1. Supabase 테이블 생성

Supabase Dashboard → SQL Editor에서 아래 SQL 실행:

```sql
-- tasks 테이블 생성
CREATE TABLE public.tasks (
  id          text        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL DEFAULT '',
  due         text        NOT NULL DEFAULT '',
  priority    text        NOT NULL DEFAULT 'none'
              CHECK (priority IN ('high', 'med', 'low', 'none')),
  category    text        NOT NULL DEFAULT 'personal'
              CHECK (category IN ('design', 'dev', 'meeting', 'plan', 'personal')),
  starred     boolean     NOT NULL DEFAULT false,
  done        boolean     NOT NULL DEFAULT false,
  notes       text        NOT NULL DEFAULT '',
  subs        jsonb       NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX tasks_user_id_idx ON public.tasks (user_id);

-- RLS 활성화
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- updated_at 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 2. Google OAuth 설정 (선택 — P4 스토리)

1. [Google Cloud Console](https://console.cloud.google.com/) → API 및 서비스 → 사용자 인증 정보
2. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
3. 승인된 리다이렉트 URI 추가:
   - `https://yhfplwqcnwxzevtttfcx.supabase.co/auth/v1/callback`
4. Supabase Dashboard → Authentication → Providers → Google
   - Client ID, Client Secret 입력 후 저장

### 3. 환경변수 설정

**로컬 개발** (`.env.local` — 이미 존재):
```
NEXT_PUBLIC_SUPABASE_URL=https://yhfplwqcnwxzevtttfcx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

**Vercel 배포**:
- Vercel Dashboard → 프로젝트 → Settings → Environment Variables
- 위 두 값을 Production/Preview/Development 모두에 추가

---

## 로컬 개발 실행

```bash
cd ~/Documents/ax-academy-1
npm run dev    # http://localhost:3000
```

---

## 테스트 실행

```bash
npm test                        # 전체 테스트 (기존 122개 + 신규)
npm run test:unit               # 단위 테스트만
npx vitest run tests/integration  # 통합 테스트만
npm run typecheck               # 타입 체크
```

---

## Vercel 배포

```bash
# Vercel CLI 사용 시
npx vercel --prod

# 또는 GitHub 연동 자동 배포 (권장)
git push origin master
```

---

## 주요 파일 위치

| 역할 | 파일 |
|------|------|
| 인증 컨텍스트 | `src/lib/store/AuthProvider.tsx` |
| 라우트 보호 | `middleware.ts` (루트) |
| Google OAuth 콜백 | `src/app/auth/callback/route.ts` |
| Supabase 서버 클라이언트 | `src/utils/supabase/server.ts` |
| Supabase 브라우저 클라이언트 | `src/utils/supabase/client.ts` |
| 로그인 화면 | `src/components/login/LoginScreen.tsx` |
