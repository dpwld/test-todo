# Implementation Plan: 인증 및 클라우드 저장소

**Branch**: `master` | **Date**: 2026-05-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/002-auth-cloud-storage/spec.md`

## Summary

현재 더미 로그인(버튼 클릭 → /main 이동)과 localStorage 기반 할 일 저장소를
Supabase Auth + Supabase PostgreSQL로 교체한다.
구체적으로: (1) 이메일/비밀번호 및 Google OAuth 인증, (2) Next.js Middleware 기반
보호 라우트, (3) RLS(Row Level Security)로 사용자별 데이터 격리,
(4) Vercel 배포 환경 지원.

## Technical Context

**Language/Version**: TypeScript 5.7 / Node 20+
**Primary Dependencies**: Next.js 15 (App Router), @supabase/supabase-js ^2, @supabase/ssr ^0.10, React 18
**Storage**: Supabase PostgreSQL (Auth + Tasks DB, RLS 적용)
**Testing**: Vitest + React Testing Library (기존 유지); E2E 시나리오는 통합 테스트로 작성
**Target Platform**: Web — Vercel (serverless, Edge Middleware 지원)
**Project Type**: Web application (Next.js App Router, SSR)
**Performance Goals**: 로그인 후 메인 화면 진입 3초 이내 / 페이지 리다이렉트 1초 이내
**Constraints**: 쿠키 기반 세션(SSR 호환), RLS 필수, localStorage 신규 사용 금지
**Scale/Scope**: 강의 수강생 규모 (~10–50 동시 사용자), Supabase Free Tier 범위

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Test-First | 인증 헬퍼(signIn, signUp, signOut) 단위 테스트 + 미들웨어 리다이렉트 통합 테스트를 구현 전에 작성 | ✅ PASS |
| II. Design Fidelity | LoginScreen 기존 디자인(레이아웃, 토큰, 4화면) 유지; 기능만 교체 | ✅ PASS |
| III. Simplicity & YAGNI | Supabase 클라이언트는 `src/utils/supabase/`(기존 헬퍼) 통해서만 사용. 비밀번호 재설정·이메일 인증 등 미명시 기능 제외 | ✅ PASS |
| IV. Component Modularity | Auth 상태는 `src/lib/store/AuthProvider.tsx`(신규)에 격리. LoginScreen은 auth 액션만 호출하고 내부 구현을 모름 | ✅ PASS |
| V. Accessibility | 기존 로그인 폼 시맨틱 HTML 유지, 오류 메시지에 `role="alert"` 추가 | ✅ PASS |

**Constitution Check: PASSED** — 진행 가능.

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-cloud-storage/
├── plan.md              ← 이 파일
├── research.md          ← Phase 0 산출물
├── data-model.md        ← Phase 1 산출물
├── quickstart.md        ← Phase 1 산출물
├── contracts/           ← Phase 1 산출물
│   └── auth-routes.md
└── tasks.md             ← /speckit-tasks 산출물 (미생성)
```

### Source Code

```text
src/
├── app/
│   ├── page.tsx                    ← 수정: 더미 LoginScreen → 실제 인증 LoginScreen
│   ├── main/page.tsx               ← 수정: Supabase에서 tasks 로드
│   ├── calendar/page.tsx           ← 수정: Supabase에서 tasks 로드
│   ├── stats/page.tsx              ← 수정: Supabase에서 tasks 로드
│   └── auth/
│       └── callback/route.ts       ← 신규: Google OAuth 콜백 핸들러
├── components/
│   └── login/
│       └── LoginScreen.tsx         ← 수정: 실제 signIn/signUp/signInWithGoogle 연결
├── lib/
│   └── store/
│       ├── AuthProvider.tsx         ← 신규: Supabase 세션 컨텍스트
│       ├── TasksProvider.tsx        ← 수정: localStorage → Supabase CRUD
│       ├── reducer.ts              ← 유지 (순수 함수)
│       └── persistence.ts          ← 유지 (localStorage — 신규 경로에는 미사용)
└── utils/
    └── supabase/
        ├── server.ts               ← 기존 (수정 없음)
        ├── client.ts               ← 기존 (수정 없음)
        └── middleware.ts           ← 기존 (수정 없음)

middleware.ts                       ← 신규: 루트 레벨 Next.js Middleware
                                       (보호 라우트 리다이렉트 로직)

tests/
└── integration/
    ├── auth-flow.test.tsx           ← 신규: 회원가입·로그인·로그아웃 통합 테스트
    └── protected-routes.test.tsx   ← 신규: 미들웨어 리다이렉트 테스트
```

## Complexity Tracking

> Constitution Check 통과 — 위반 없음.
