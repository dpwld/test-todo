// Domain constants + sample seed data, ported verbatim from the Claude Design
// handoff bundle's store.jsx. "Today" is pinned to 2026-05-15.

import type { Category, Priority, Task, View } from '@/lib/types';

// Categories — color tags. Fixed set of 5.
export const CATEGORIES: Category[] = [
  { id: 'design', name: '디자인', color: '#b38ae6' },
  { id: 'dev', name: '개발', color: '#1571f3' },
  { id: 'meeting', name: '회의', color: '#27c961' },
  { id: 'plan', name: '기획', color: '#ffb547' },
  { id: 'personal', name: '개인', color: '#9aa0aa' },
];

export const CAT_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
);

export const PRIORITIES: Priority[] = [
  { id: 'high', name: '높음', color: 'var(--color-danger)' },
  { id: 'med', name: '보통', color: 'var(--color-warning)' },
  { id: 'low', name: '낮음', color: 'var(--color-accent)' },
  { id: 'none', name: '없음', color: 'transparent' },
];

export const PRIO_BY_ID: Record<string, Priority> = Object.fromEntries(
  PRIORITIES.map((p) => [p.id, p]),
);

// Views — left nav top items.
export const VIEWS: View[] = [
  { id: 'inbox', name: '받은편지함', icon: 'inbox' },
  { id: 'today', name: '오늘', icon: 'today' },
  { id: 'upcoming', name: '예정', icon: 'upcoming' },
  { id: 'overdue', name: '지연', icon: 'overdue' },
  { id: 'done', name: '완료', icon: 'done' },
];

// Initial sample tasks — pinned to 2026-05-15 as today.
export const SAMPLE_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Q4 디자인 시스템 토큰 마이그레이션 리뷰',
    due: '2026-05-15',
    priority: 'high',
    category: 'design',
    starred: true,
    done: false,
    notes:
      '@미나, @지훈 이 보낸 PR 두 건을 통합 검토. accent-500 흐름과 dark token mirror 부분 우선 확인 필요.',
    subs: [
      { id: 's1', text: '컬러 토큰 11단계 OKLCH 값 검수', done: true },
      { id: 's2', text: '다크모드 mirror 매핑 검토', done: true },
      { id: 's3', text: 'Pretendard fallback 체인 정리', done: false },
      { id: 's4', text: 'Figma library 동기화', done: false },
    ],
  },
  {
    id: 't2',
    title: '코드 리뷰 — PR #234 인증 모듈 리팩토링',
    due: '2026-05-15',
    priority: 'med',
    category: 'dev',
    starred: false,
    done: false,
    notes: '',
    subs: [
      { id: 's5', text: 'JWT refresh 로직 확인', done: false },
      { id: 's6', text: '테스트 커버리지 80% 확인', done: false },
    ],
  },
  {
    id: 't3',
    title: '팀 위클리 안건 정리 + 슬랙 공유',
    due: '2026-05-15',
    priority: 'low',
    category: 'meeting',
    starred: false,
    done: true,
    notes: '',
    subs: [],
  },
  {
    id: 't4',
    title: '사용자 인터뷰 인사이트 노션에 정리',
    due: '2026-05-15',
    priority: 'med',
    category: 'design',
    starred: false,
    done: false,
    notes: '',
    subs: [{ id: 's7', text: '핵심 페인포인트 3개 추출', done: false }],
  },
  {
    id: 't5',
    title: '백엔드 API 명세서 v2 검토',
    due: '2026-05-16',
    priority: 'med',
    category: 'dev',
    starred: false,
    done: false,
    notes: '',
    subs: [],
  },
  {
    id: 't6',
    title: '신규 클라이언트 킥오프 미팅 준비',
    due: '2026-05-16',
    priority: 'high',
    category: 'meeting',
    starred: true,
    done: false,
    notes: '',
    subs: [
      { id: 's8', text: '프로젝트 제안서 최종본 출력', done: false },
      { id: 's9', text: '데모 환경 점검', done: false },
    ],
  },
  {
    id: 't7',
    title: '스프린트 회고 자료 정리',
    due: '2026-05-18',
    priority: 'med',
    category: 'meeting',
    starred: false,
    done: false,
    notes: '',
    subs: [],
  },
  {
    id: 't8',
    title: '디자인 핸드오프 — 결제 플로우',
    due: '2026-05-19',
    priority: 'low',
    category: 'design',
    starred: false,
    done: false,
    notes: '',
    subs: [],
  },
  {
    id: 't9',
    title: '월간 OKR 리포트 작성',
    due: '2026-05-20',
    priority: 'med',
    category: 'plan',
    starred: false,
    done: false,
    notes: '',
    subs: [],
  },
  {
    id: 't10',
    title: 'v2.4 릴리스 노트 작성',
    due: '2026-05-14',
    priority: 'high',
    category: 'dev',
    starred: false,
    done: false,
    notes: '하루 지연됨. 마케팅팀 검토까지 오늘 안에 마무리.',
    subs: [],
  },
  {
    id: 't11',
    title: '신규 프로젝트 킥오프 문서',
    due: '2026-05-12',
    priority: 'high',
    category: 'plan',
    starred: false,
    done: false,
    notes: '',
    subs: [],
  },
  {
    id: 't12',
    title: '월간 비용 보고서 정리',
    due: '2026-05-13',
    priority: 'med',
    category: 'personal',
    starred: false,
    done: true,
    notes: '',
    subs: [],
  },
  {
    id: 't13',
    title: '디자인 시스템 가이드 v1 배포',
    due: '2026-05-14',
    priority: 'med',
    category: 'design',
    starred: false,
    done: true,
    notes: '',
    subs: [],
  },
  {
    id: 't14',
    title: '주간 리포트 메일링',
    due: '2026-05-22',
    priority: 'low',
    category: 'plan',
    starred: false,
    done: false,
    notes: '',
    subs: [],
  },
];
