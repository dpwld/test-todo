---
description: "Task list for 인증 및 클라우드 저장소"
---

# Tasks: 인증 및 클라우드 저장소

**Input**: Design documents from `specs/002-auth-cloud-storage/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: ⚠️ **Constitution Principle I (Test-First) — TDD 필수**
모든 구현 태스크 전에 테스트를 작성하고 FAIL 확인 후 구현한다.

**Organization**: User Story별 독립 구현 및 테스트 가능.

---

## Phase 1: Setup (공유 인프라)

**Purpose**: Supabase DB 스키마 적용, 신규 파일 골격 생성

- [ ] T001 Supabase Dashboard SQL Editor에서 data-model.md의 CREATE TABLE / RLS / 트리거 SQL 실행
- [ ] T002 루트 레벨 `middleware.ts` 파일 생성 (빈 파일, 다음 Phase에서 구현) — `middleware.ts`
- [ ] T003 [P] OAuth 콜백 라우트 디렉토리 생성 — `src/app/auth/callback/route.ts` (빈 파일)
- [ ] T004 [P] AuthProvider 파일 생성 (빈 컨텍스트 골격) — `src/lib/store/AuthProvider.tsx`

**Checkpoint**: DB 스키마 적용 완료, 신규 파일 4개 생성됨

---

## Phase 2: Foundational (모든 User Story의 사전 조건)

**Purpose**: AuthProvider 컨텍스트 구현 — 모든 US가 이 컨텍스트에 의존

⚠️ **CRITICAL**: 이 Phase가 완료되기 전까지 어떤 User Story도 시작 불가

### Tests (TDD — 먼저 작성, FAIL 확인 후 구현)

- [ ] T005 [P] AuthProvider `user`, `loading` 상태 초기값 단위 테스트 작성 — `tests/unit/AuthProvider.test.tsx`
- [ ] T006 [P] `signIn` 성공/실패 시 상태 변화 단위 테스트 작성 — `tests/unit/AuthProvider.test.tsx`
- [ ] T007 [P] `signUp` 성공/실패 시 상태 변화 단위 테스트 작성 — `tests/unit/AuthProvider.test.tsx`
- [ ] T008 [P] `signOut` 호출 후 user가 null이 되는 단위 테스트 작성 — `tests/unit/AuthProvider.test.tsx`

### Implementation

- [ ] T009 `AuthProvider.tsx` 구현: `user`, `loading`, `signIn`, `signUp`, `signInWithGoogle`, `signOut` — `src/lib/store/AuthProvider.tsx`
- [ ] T010 `src/app/layout.tsx`에 `AuthProvider` 래핑 추가 — `src/app/layout.tsx`
- [ ] T011 위 단위 테스트 실행 → 전부 PASS 확인 (`npm test tests/unit/AuthProvider.test.tsx`)

**Checkpoint**: AuthProvider 동작 확인, 기존 122개 테스트 여전히 통과 (`npm test`)

---

## Phase 3: User Story 1 — 이메일 회원가입/로그인 (Priority: P1) 🎯 MVP

**Goal**: 이메일/비밀번호로 회원가입 후 로그인, 오류 메시지 한국어 표시

**Independent Test**: 회원가입 → 로그아웃 → 재로그인 → 메인 화면 정상 진입

### Tests (TDD — 먼저 작성, FAIL 확인 후 구현)

- [ ] T012 [P] [US1] 로그인 버튼 클릭 시 `signIn` 호출되는 컴포넌트 테스트 작성 — `tests/unit/LoginScreen.test.tsx`
- [ ] T013 [P] [US1] 잘못된 자격증명 시 한국어 오류 메시지 렌더링 테스트 작성 — `tests/unit/LoginScreen.test.tsx`
- [ ] T014 [P] [US1] 이메일/비밀번호 유효성 검사(빈값, 이메일 형식) 테스트 작성 — `tests/unit/LoginScreen.test.tsx`
- [ ] T015 [P] [US1] 회원가입 폼 렌더링 및 `signUp` 호출 테스트 작성 — `tests/unit/LoginScreen.test.tsx`

### Implementation

- [ ] T016 [US1] `LoginScreen.tsx` 수정: `goToMain` 더미 → `useAuth().signIn` 실제 호출 연결 — `src/components/login/LoginScreen.tsx`
- [ ] T017 [US1] `LoginScreen.tsx`에 회원가입 폼/탭 추가 및 `signUp` 연결 — `src/components/login/LoginScreen.tsx`
- [ ] T018 [US1] 오류 메시지 표시 UI 추가 (`role="alert"`, 한국어 매핑은 contracts/auth-routes.md 참고) — `src/components/login/LoginScreen.tsx`
- [ ] T019 [US1] 이메일/비밀번호 클라이언트 유효성 검사 추가 — `src/components/login/LoginScreen.tsx`
- [ ] T020 [US1] 위 테스트 실행 → 전부 PASS 확인 (`npm test tests/unit/LoginScreen.test.tsx`)

**Checkpoint**: 회원가입 → 로그인 → 로그아웃 전체 흐름 브라우저에서 수동 확인

---

## Phase 4: User Story 2 — 보호된 페이지 접근 제어 (Priority: P2)

**Goal**: 비로그인 사용자의 `/main`, `/calendar`, `/stats` 접근 시 `/`로 리다이렉트

**Independent Test**: 비로그인 상태로 `/main` URL 직접 접근 → 로그인 화면으로 이동

### Tests (TDD — 먼저 작성, FAIL 확인 후 구현)

- [ ] T021 [P] [US2] 비인증 요청에 대해 미들웨어가 `/`로 리다이렉트하는 단위 테스트 작성 — `tests/unit/middleware.test.ts`
- [ ] T022 [P] [US2] 인증된 사용자가 `/`에 접근 시 `/main`으로 리다이렉트하는 테스트 작성 — `tests/unit/middleware.test.ts`
- [ ] T023 [P] [US2] `/auth/callback`은 인증 없이 통과하는 테스트 작성 — `tests/unit/middleware.test.ts`

### Implementation

- [ ] T024 [US2] `middleware.ts` 구현: `utils/supabase/middleware.ts`의 `createClient` 사용, 보호 경로 목록(`/main`, `/calendar`, `/stats`) 정의 및 리다이렉트 로직 — `middleware.ts`
- [ ] T025 [US2] `middleware.ts`에 `config.matcher` 설정 (보호 경로 + `/auth/callback` 제외) — `middleware.ts`
- [ ] T026 [US2] 위 테스트 실행 → 전부 PASS 확인 (`npm test tests/unit/middleware.test.ts`)

**Checkpoint**: 비로그인 상태로 `/main` 직접 접근 시 로그인 화면으로 이동 확인

---

## Phase 5: User Story 3 — 사용자별 데이터 격리 (Priority: P3)

**Goal**: 각 사용자는 자신의 할 일만 조회·수정·삭제 (Supabase CRUD + RLS)

**Independent Test**: 사용자 A와 B 각각 로그인 후 서로의 할 일이 보이지 않음 확인

### Tests (TDD — 먼저 작성, FAIL 확인 후 구현)

- [ ] T027 [P] [US3] `TasksProvider`의 `loadTasks`가 Supabase `.from('tasks').select()` 호출하는 테스트 작성 (`vi.mock` 사용) — `tests/unit/TasksProvider.test.tsx`
- [ ] T028 [P] [US3] `addTask`가 Supabase `.insert()` 호출하는 테스트 작성 — `tests/unit/TasksProvider.test.tsx`
- [ ] T029 [P] [US3] `updateTask`가 Supabase `.update()` 호출하는 테스트 작성 — `tests/unit/TasksProvider.test.tsx`
- [ ] T030 [P] [US3] `deleteTask`가 Supabase `.delete()` 호출하는 테스트 작성 — `tests/unit/TasksProvider.test.tsx`
- [ ] T031 [P] [US3] 비로그인 시 `loadTasks`가 빈 배열 반환하는 테스트 작성 — `tests/unit/TasksProvider.test.tsx`

### Implementation

- [ ] T032 [US3] `TasksProvider.tsx` 수정: `useEffect`에서 Supabase `.from('tasks').select()` 호출로 초기 데이터 로드 (localStorage `loadTasks` 대체) — `src/lib/store/TasksProvider.tsx`
- [ ] T033 [US3] `TasksProvider.tsx`의 `add` 액션 핸들러: `reducer` 호출 후 Supabase `.insert()` 동기화 — `src/lib/store/TasksProvider.tsx`
- [ ] T034 [US3] `TasksProvider.tsx`의 `update`/`toggleDone`/`toggleStar` 핸들러: Supabase `.update()` 동기화 — `src/lib/store/TasksProvider.tsx`
- [ ] T035 [US3] `TasksProvider.tsx`의 `delete` 핸들러: Supabase `.delete()` 동기화 — `src/lib/store/TasksProvider.tsx`
- [ ] T036 [US3] `src/app/page.tsx` 정리: 임시 Supabase todos 조회 코드 제거, 기존 `LoginScreen` 렌더링으로 복원 — `src/app/page.tsx`
- [ ] T037 [US3] 위 테스트 실행 → 전부 PASS 확인, 기존 테스트 회귀 없음 (`npm test`)

**Checkpoint**: 로그인 후 할 일 추가/수정/삭제가 Supabase에 반영되는지 확인 (대시보드에서 직접 조회)

---

## Phase 6: User Story 4 — Google 소셜 로그인 (Priority: P4)

**Goal**: "Google로 로그인" 버튼 → Google OAuth → 메인 화면 이동

**Independent Test**: Google 로그인 버튼 클릭 → Google 계정 선택 → 메인 화면 진입

### Tests (TDD — 먼저 작성, FAIL 확인 후 구현)

- [ ] T038 [P] [US4] "Google로 로그인" 버튼 클릭 시 `signInWithGoogle` 호출되는 테스트 작성 — `tests/unit/LoginScreen.test.tsx`
- [ ] T039 [P] [US4] `/auth/callback` route가 `code` 파라미터를 세션으로 교환하는 테스트 작성 — `tests/unit/auth-callback.test.ts`

### Implementation

- [ ] T040 [US4] `src/app/auth/callback/route.ts` 구현: `code` → `supabase.auth.exchangeCodeForSession()` → `/main` 리다이렉트 — `src/app/auth/callback/route.ts`
- [ ] T041 [US4] `LoginScreen.tsx`의 Google 버튼에 `useAuth().signInWithGoogle` 연결 — `src/components/login/LoginScreen.tsx`
- [ ] T042 [US4] 위 테스트 실행 → 전부 PASS 확인 (`npm test`)

> **사전 조건**: Supabase Dashboard에서 Google OAuth Provider 활성화 필요 (quickstart.md 참고)

**Checkpoint**: Google 로그인 전체 흐름 브라우저에서 수동 확인

---

## Phase 7: User Story 5 — 로그아웃 (Priority: P5)

**Goal**: 로그아웃 버튼 클릭 → 세션 종료 → 로그인 화면 이동

**Independent Test**: 로그아웃 후 뒤로가기로 `/main` 접근 시 로그인 화면 리다이렉트 확인

### Tests (TDD — 먼저 작성, FAIL 확인 후 구현)

- [ ] T043 [P] [US5] 로그아웃 버튼 클릭 시 `signOut` 호출되는 컴포넌트 테스트 작성 — `tests/unit/LogoutButton.test.tsx`
- [ ] T044 [P] [US5] `signOut` 후 `user`가 null이 되는 AuthProvider 테스트 추가 — `tests/unit/AuthProvider.test.tsx`

### Implementation

- [ ] T045 [US5] 로그아웃 버튼 컴포넌트 구현 — `src/components/shared/LogoutButton.tsx`
- [ ] T046 [US5] 메인 화면 네비게이션(사이드바/헤더)에 로그아웃 버튼 추가 — `src/components/main/` (기존 네비 컴포넌트 확인 후 적합한 위치)
- [ ] T047 [US5] 위 테스트 실행 → 전부 PASS 확인 (`npm test`)

**Checkpoint**: 로그아웃 → 로그인 화면 이동 → 뒤로가기 → 미들웨어가 다시 로그인으로 리다이렉트 확인

---

## Phase 8: Polish & 회귀 검증

**Purpose**: 전체 테스트 통과, 타입 안전성, Vercel 배포 확인

- [X] T048 [P] 전체 테스트 스위트 실행 — 기존 122개 + 신규 테스트 전부 PASS 확인 (`npm test`)
- [X] T049 [P] 타입 체크 — 에러 0건 확인 (`npm run typecheck`)
- [X] T050 프로덕션 빌드 성공 확인 (`npm run build`)
- [ ] T051 [P] Vercel 환경변수 설정 확인 (quickstart.md의 "Vercel 배포" 섹션 참고)
- [ ] T052 Vercel 배포 후 전체 흐름 E2E 수동 확인 (회원가입 → 로그인 → 할 일 추가 → 다른 기기에서 확인 → 로그아웃)

---

## Dependencies & Execution Order

### Phase 의존성

- **Phase 1 (Setup)**: 즉시 시작 가능
- **Phase 2 (Foundational)**: Phase 1 완료 후 — 모든 US를 블로킹
- **Phase 3–7 (User Stories)**: Phase 2 완료 후 순차 진행 (P1→P2→P3→P4→P5)
- **Phase 8 (Polish)**: 원하는 US가 모두 완료된 후

### User Story 의존성

- **US1 (P1)**: Phase 2 완료 후 시작 — MVP
- **US2 (P2)**: Phase 2 완료 후 시작, US1과 독립
- **US3 (P3)**: US1 완료 후 시작 권장 (로그인된 사용자가 있어야 데이터 격리 확인 가능)
- **US4 (P4)**: US1 완료 후 시작 (AuthProvider의 `signInWithGoogle` 의존)
- **US5 (P5)**: US1 완료 후 시작 (AuthProvider의 `signOut` 의존)

### 태스크 내 순서

1. **테스트 작성 → FAIL 확인** (Constitution Principle I)
2. 구현
3. **테스트 PASS 확인**
4. 기존 전체 테스트 회귀 없음 확인

---

## Parallel Example: Phase 2 (Foundational)

```bash
# 아래 테스트는 동시에 작성 가능 (다른 파일):
T005 AuthProvider user/loading 초기값 테스트
T006 signIn 상태 변화 테스트
T007 signUp 상태 변화 테스트
T008 signOut 테스트
```

## Parallel Example: Phase 3 (US1 테스트)

```bash
# 아래 테스트는 동시에 작성 가능 (같은 파일, 다른 describe 블록):
T012 로그인 버튼 → signIn 호출 테스트
T013 오류 메시지 렌더링 테스트
T014 유효성 검사 테스트
T015 회원가입 폼 테스트
```

---

## Implementation Strategy

### MVP (US1만 완료)

1. Phase 1: Setup 완료
2. Phase 2: AuthProvider 구현
3. Phase 3: 이메일 로그인/회원가입
4. **STOP & VALIDATE**: 이메일로 가입 → 로그인 → 메인 진입 동작 확인
5. 이 시점에서 이미 실제 인증 가능한 앱 완성

### 전체 완성 순서

Phase 1 → Phase 2 → Phase 3(MVP!) → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8

---

## Notes

- `[P]` = 다른 파일, 의존성 없음 → 병렬 실행 가능
- `[USN]` = 해당 User Story 추적용 레이블
- Constitution Principle I: 테스트가 FAIL하는 것을 확인한 후 구현 시작
- `src/lib/store/reducer.ts`는 순수 함수이므로 수정 없음 (Principle III)
- `src/utils/supabase/` 헬퍼는 이미 구현됨 — 별도 수정 불필요
- 각 Phase Checkpoint에서 `npm test` 실행으로 회귀 없음 확인
