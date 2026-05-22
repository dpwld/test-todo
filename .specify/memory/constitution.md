<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Bump rationale: MAJOR — backward-incompatible governance change.
  "No backend / localStorage only" constraint removed; Supabase (PostgreSQL)
  added as the persistence layer. This redefines Principle III and the
  Technology Constraints section in a non-backward-compatible way.

Modified principles:
  III. Simplicity & YAGNI — persistence clause updated:
    "localStorage only / No backend" → Supabase via src/utils/supabase/ helpers.

Modified sections:
  Technology Constraints — "Persistence: localStorage only. No server, no database,
    no external API." replaced with Supabase + @supabase/supabase-js + @supabase/ssr.

Added sections: none
Removed sections: none

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — generic; no edit needed.
  ✅ .specify/templates/spec-template.md — generic; no edit needed.
  ✅ .specify/templates/tasks-template.md — generic; no edit needed.

Follow-up TODOs: none
-->

# demodev Tasks Constitution

강의 실습용 한국어 Todo 웹앱 — Supabase 백엔드 연동 프로덕션 구현

## Core Principles

### I. Test-First (NON-NEGOTIABLE)

TDD is mandatory. The cycle is strictly Red-Green-Refactor: write a failing test,
make it pass with the minimum code, then refactor.

- Pure logic — the task store and its derived selectors (`filterTasks`, `isOverdue`,
  `isToday`, `isUpcoming`, `viewCount`, `catCount`, date helpers) MUST have unit
  tests written BEFORE the implementation.
- Component behavior — interactive components (add / edit / delete / toggle-done /
  toggle-star / subtask CRUD / view switching / theme toggle) MUST have behavioral
  tests (React Testing Library) written BEFORE the component logic.
- A test that has never failed is not trusted. Every test MUST be observed failing
  for the right reason before its implementation is written.
- Tests are NOT optional for this project; the `/speckit-tasks` "tests optional"
  default is overridden here.

Rationale: the prototype's value lives in its filtering/grouping logic and its
interactivity. Locking that behavior with tests first prevents regressions when the
prototype's structure is restructured into production components.

### II. Design Fidelity

The Claude Design handoff bundle is the source of truth for visual output.

- Recreate the visual result pixel-faithfully: layout, spacing (4px grid), colors,
  radii, typography, and the four screens (login / main 3-panel / calendar / stats).
- The demodev design tokens (`colors_and_type.css`) MUST be used verbatim as the
  token layer — no re-derivation of color, type, radius, spacing, or shadow scales.
- The prototype's harness (DesignCanvas pan/zoom, TweaksPanel host protocol, Babel
  standalone, `window`-global module pattern) MUST NOT be carried into production —
  it is a prototyping medium, not a structure to copy.
- Both light and dark themes MUST match the design system's `[data-theme="dark"]`
  mirror.

Rationale: the README of the handoff bundle is explicit — match the visual output,
do not copy the prototype's internal structure.

### III. Simplicity & YAGNI

Build only what is specified. No speculative generality.

- Persistence is handled via **Supabase (PostgreSQL)**. Use `@supabase/supabase-js`
  and `@supabase/ssr` through the helpers in `src/utils/supabase/`. Direct SDK
  calls outside these helpers are NOT permitted.
- No features beyond the spec — no abstractions for single-use code, no config
  surface that was not requested, no error handling for impossible states.
- Prefer the smallest code that satisfies a passing test. If it can be 50 lines,
  it is not 200.

Rationale: Supabase replaces the localStorage-only constraint to support
server-side rendering and multi-device persistence as required by the lecture
curriculum. Simplicity still applies — only use what the spec calls for.

### IV. Component Modularity

Screens and shared UI are separated into independently testable units.

- Each screen (login, main, calendar, stats) is its own module/route.
- Shared UI (icons, side-nav, primitives like check / chip / button) lives in
  shared modules consumed by screens.
- The task store is a single module with a typed public API; components consume it,
  they do not re-implement filtering or mutation logic.
- A unit MUST be testable without mounting an unrelated screen.

Rationale: modular boundaries are what make Principle I's component tests cheap and
what keep the four-screen scope from collapsing into one file.

### V. Accessibility

The production build MUST be at least as accessible as the prototype.

- Semantic HTML: real `<button>`, `<input>`, `<label>`, `<nav>`, `<aside>`,
  heading hierarchy.
- All `aria-label`s present in the prototype MUST be preserved; interactive
  controls without visible text MUST have an accessible name.
- Keyboard operability: Enter submits the add-task and add-subtask inputs; focus
  states are visible (`:focus-visible` rings from the token layer).
- Checkboxes, toggles, and radio groups expose correct roles/states.

Rationale: the prototype already encodes these affordances; regressing them in the
"real" build would be a downgrade, not a port.

## Technology Constraints

- **Framework**: Next.js 15 (App Router).
- **Language**: TypeScript — strict mode; no implicit `any` in committed code.
- **Testing**: Vitest + React Testing Library; jsdom environment.
- **Styling**: CSS carrying the demodev design tokens; no CSS framework that would
  re-derive the token scales.
- **Persistence**: Supabase (PostgreSQL) via `@supabase/supabase-js` +
  `@supabase/ssr`. Client helpers live in `src/utils/supabase/`
  (`server.ts`, `client.ts`, `middleware.ts`).
- **Environment**: `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` MUST be present in `.env.local`.
- **Fonts**: Pretendard Variable + Gaegu + JetBrains Mono via the existing CDN
  `@import`s in `colors_and_type.css`.
- **Demo clock**: "today" is pinned to 2026-05-15 to keep relative-date logic and
  sample data deterministic, exactly as the prototype does.

## Development Workflow

- The SDD pipeline is followed in order: constitution → specify → clarify → plan →
  tasks → analyze → implement.
- Within implementation, work proceeds task-by-task; each task that produces code
  follows Red-Green-Refactor.
- A task is "done" only when its tests pass AND the broader suite still passes.
  Failing or partial states keep the task open.
- Commits are made per task or per logical group, with the test added in (or before)
  the same commit as the code it covers.
- The Constitution Check gate in `plan.md` MUST pass before Phase 0 research and be
  re-verified after Phase 1 design. Violations go in Complexity Tracking with a
  justification or the design changes.

## Governance

- This constitution supersedes other practices for this project. Where a tool's
  default conflicts with a principle here (e.g. "tests optional"), this document
  wins.
- Amendments require: a written rationale, a version bump per the policy below, and
  propagation to dependent templates/docs in the same change.
- Versioning policy (semantic):
  - MAJOR — backward-incompatible governance change or principle removal/redefinition.
  - MINOR — a new principle/section, or materially expanded guidance.
  - PATCH — clarifications, wording, or non-semantic refinements.
- Compliance review: every plan and task breakdown MUST be checked against these
  principles; any complexity that violates a principle MUST be justified in the
  plan's Complexity Tracking table or removed.

**Version**: 2.0.0 | **Ratified**: 2026-05-15 | **Last Amended**: 2026-05-22
