# Data Model: 인증 및 클라우드 저장소

**Feature**: 002-auth-cloud-storage
**Date**: 2026-05-22

---

## Supabase 스키마

### auth.users (Supabase 내장)

Supabase Auth가 자동 관리하는 테이블. 직접 수정 금지.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | 사용자 고유 식별자 (PK) |
| email | text | 이메일 주소 |
| created_at | timestamptz | 가입일시 |

---

### public.tasks (신규)

기존 localStorage `Task` 타입을 DB 테이블로 변환.

```sql
CREATE TABLE public.tasks (
  id          text        PRIMARY KEY,           -- 기존 로컬 ID 재사용 (nanoid)
  user_id     uuid        NOT NULL
              REFERENCES auth.users(id)
              ON DELETE CASCADE,
  title       text        NOT NULL DEFAULT '',
  due         text        NOT NULL DEFAULT '',   -- 'YYYY-MM-DD' 또는 ''
  priority    text        NOT NULL DEFAULT 'none'
              CHECK (priority IN ('high', 'med', 'low', 'none')),
  category    text        NOT NULL DEFAULT 'personal'
              CHECK (category IN ('design', 'dev', 'meeting', 'plan', 'personal')),
  starred     boolean     NOT NULL DEFAULT false,
  done        boolean     NOT NULL DEFAULT false,
  notes       text        NOT NULL DEFAULT '',
  subs        jsonb       NOT NULL DEFAULT '[]', -- Subtask[] 직렬화
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

**인덱스**:
```sql
CREATE INDEX tasks_user_id_idx ON public.tasks (user_id);
CREATE INDEX tasks_due_idx     ON public.tasks (due) WHERE due != '';
```

**RLS 활성화 및 정책**:
```sql
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);
```

**updated_at 자동 갱신 트리거**:
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## TypeScript 타입 매핑

기존 `src/lib/types.ts`의 `Task` 타입을 그대로 사용한다.
`subs` 컬럼은 `Subtask[]`로 직렬화/역직렬화한다.

```typescript
// 기존 타입 유지 — 변경 없음
export interface Task {
  id: string;
  title: string;
  due: string;
  priority: PriorityId;
  category: CategoryId;
  starred: boolean;
  done: boolean;
  notes: string;
  subs: Subtask[];
}
```

DB ↔ 앱 매핑: `user_id`, `created_at`, `updated_at`는 UI 레이어에 노출하지 않는다.

---

## 세션 모델

Supabase Auth 쿠키 기반 세션 (서버사이드 접근 가능).

| 항목 | 값 |
|------|----|
| 저장 방식 | HTTP-only 쿠키 (`@supabase/ssr` 자동 관리) |
| 만료 | 7일 (Supabase 기본값) |
| 갱신 | Next.js Middleware에서 자동 갱신 (`updateSession`) |
| 접근 | Server Component: `createClient(cookieStore)` / Client: `createClient()` |

---

## 엔티티 관계

```
auth.users (1) ──── (N) public.tasks
    id                    user_id (FK)
```

사용자 삭제 시 `ON DELETE CASCADE`로 해당 사용자의 tasks 전부 삭제.
