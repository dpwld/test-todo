'use client';

// Stats dashboard: KPI cards, weekly completion bars, category donut, category
// progress bars, 20-week activity heatmap. All figures are fixed synthetic
// data from stats-data.ts (see the /speckit-clarify decision) — the screen
// does not reflect the user's live tasks.

import { useState } from 'react';
import { SideNav } from '@/components/shared/SideNav';
import { Icon } from '@/components/shared/Icon';
import {
  WEEK,
  DONUT_DATA,
  HEATMAP,
  HEAT_COLORS,
  CATEGORY_STATS,
} from '@/lib/stats-data';

type Range = 'week' | 'month' | 'quarter' | 'year';

const RANGES: [Range, string][] = [
  ['week', '이번 주'],
  ['month', '이번 달'],
  ['quarter', '분기'],
  ['year', '연간'],
];

const DOW_LBL = ['월', '화', '수', '목', '금', '토', '일'];

export function StatsScreen() {
  const [range, setRange] = useState<Range>('week');

  const weekMax = Math.max(...WEEK.map((d) => d.total));
  const totalDone = WEEK.reduce((s, d) => s + d.completed, 0);
  const totalTasks = WEEK.reduce((s, d) => s + d.total, 0);
  const completionPct = Math.round((totalDone / totalTasks) * 100);

  const maxCat = Math.max(...CATEGORY_STATS.map((c) => c.total));

  const donutTotal = DONUT_DATA.reduce((s, d) => s + d.value, 0);
  const radius = 56;
  const cx = 70;
  const cy = 70;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  const arcs = DONUT_DATA.map((d) => {
    const frac = d.value / donutTotal;
    const dash = frac * circumference;
    const gap = circumference - dash;
    const offset = -cumulative * circumference;
    cumulative += frac;
    return { ...d, dash, gap, offset };
  });

  return (
    <div className="stats">
      <SideNav activeRoute="stats" />

      <section className="stats__main">
        <header className="stats__head">
          <h1 className="stats__title">통계</h1>
          <div className="stats__range">
            {RANGES.map(([id, lbl]) => (
              <button
                key={id}
                type="button"
                className={range === id ? 'is-active' : ''}
                onClick={() => setRange(id)}
              >
                {lbl}
              </button>
            ))}
          </div>
        </header>

        {/* KPI grid */}
        <div className="stats__grid">
          <div className="kpi">
            <div className="kpi__label">
              <Icon name="trend" size={12} /> 완료율
            </div>
            <div className="kpi__value">
              {completionPct}
              <span className="unit">%</span>
            </div>
            <div className="kpi__sub">
              <span className="kpi__delta">
                <Icon name="arrowUp" size={11} /> 12%
              </span>{' '}
              지난주 대비
            </div>
          </div>
          <div className="kpi">
            <div className="kpi__label">
              <Icon name="check" size={12} /> 완료한 할 일
            </div>
            <div className="kpi__value">
              {totalDone}
              <span className="unit">개</span>
            </div>
            <div className="kpi__sub">
              {totalTasks}개 중 — 하루 평균 {Math.round(totalDone / 7)}개
            </div>
          </div>
          <div className="kpi">
            <div className="kpi__label" style={{ color: '#d97500' }}>
              <Icon name="fire" size={12} fill="currentColor" strokeWidth={0} />{' '}
              연속 달성
            </div>
            <div className="kpi__value">
              12<span className="unit">일</span>
            </div>
            <div className="kpi__sub">
              <span className="kpi__delta">최고 기록 24일</span>
            </div>
          </div>
          <div className="kpi">
            <div className="kpi__label">
              <Icon name="zap" size={12} /> 가장 활발한 시간
            </div>
            <div className="kpi__value" style={{ fontSize: 22 }}>
              10–12<span className="unit">시</span>
            </div>
            <div className="kpi__sub">오전 작업 비중 64%</div>
          </div>
        </div>

        {/* Weekly chart + donut */}
        <div className="two-col">
          <div className="panel">
            <div className="panel__head">
              <div>
                <div className="panel__title">주간 완료 흐름</div>
                <div className="panel__sub" style={{ marginTop: 4 }}>
                  5월 11일 — 5월 17일
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  font: '500 11px/1 var(--font-sans)',
                  color: 'var(--fg-muted)',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: 'var(--color-accent)',
                    }}
                  />{' '}
                  완료
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: 'var(--color-gray-200)',
                    }}
                  />{' '}
                  미완료
                </span>
              </div>
            </div>
            <div className="chart">
              {WEEK.map((d, i) => {
                const hPct = (d.total / weekMax) * 100;
                const donePct =
                  d.total === 0 ? 0 : (d.completed / d.total) * 100;
                return (
                  <div key={i} className="chart__col">
                    <span
                      style={{
                        font: '600 11px/1 var(--font-sans)',
                        color: d.isToday
                          ? 'var(--color-accent)'
                          : 'var(--fg-muted)',
                      }}
                    >
                      {d.total === 0 ? '—' : `${d.completed}/${d.total}`}
                    </span>
                    <div
                      className="chart__bars"
                      style={{
                        height: `${hPct}%`,
                        alignSelf: 'stretch',
                        justifySelf: 'stretch',
                      }}
                    >
                      <div
                        className="chart__bar is-incomplete"
                        style={{ height: `${100 - donePct}%`, opacity: 0.55 }}
                      />
                      <div
                        className="chart__bar"
                        style={{ height: `${donePct}%` }}
                      />
                    </div>
                    <span
                      className={
                        'chart__label' + (d.isToday ? ' is-today' : '')
                      }
                    >
                      {d.dow}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="panel__head">
              <div>
                <div className="panel__title">카테고리 분포</div>
                <div className="panel__sub" style={{ marginTop: 4 }}>
                  이번 달 완료 100건
                </div>
              </div>
            </div>

            <div className="donut" style={{ marginTop: 4 }}>
              <div className="donut__chart">
                <svg
                  width="140"
                  height="140"
                  viewBox="0 0 140 140"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke="var(--bg-muted)"
                    strokeWidth={stroke}
                  />
                  {arcs.map((a, i) => (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="none"
                      stroke={a.color}
                      strokeWidth={stroke}
                      strokeDasharray={`${a.dash} ${a.gap}`}
                      strokeDashoffset={a.offset}
                    />
                  ))}
                </svg>
                <div className="donut__center">
                  <div className="donut__pct">{donutTotal}</div>
                  <div className="donut__lbl">완료한 할 일</div>
                </div>
              </div>
              <div className="donut__legend">
                {DONUT_DATA.map((d) => (
                  <div key={d.name} className="donut__legend-row">
                    <span
                      className="donut__legend-dot"
                      style={{ background: d.color }}
                    />
                    <span style={{ flex: 1, minWidth: 90 }}>{d.name}</span>
                    <span
                      className="muted"
                      style={{ font: '600 12px/1 var(--font-mono)' }}
                    >
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown + streak heatmap */}
        <div className="two-col">
          <div className="panel">
            <div className="panel__head">
              <div>
                <div className="panel__title">카테고리별 진행률</div>
                <div className="panel__sub" style={{ marginTop: 4 }}>
                  활성 할 일 기준
                </div>
              </div>
            </div>
            <div className="cats">
              {CATEGORY_STATS.map((c) => {
                const pct = c.total ? (c.done / c.total) * 100 : 0;
                const wPct = (c.total / maxCat) * 100;
                return (
                  <div key={c.id} className="cat-row">
                    <div className="cat-row__top">
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: c.color,
                        }}
                      />
                      <span className="cat-row__name">{c.name}</span>
                      <span className="cat-row__count">
                        {c.done} / {c.total}
                      </span>
                    </div>
                    <div className="cat-bar" style={{ width: `${wPct}%` }}>
                      <div
                        className="cat-bar__fill"
                        style={{ width: `${pct}%`, background: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="panel__head">
              <div>
                <div className="panel__title">활동 히트맵</div>
                <div className="panel__sub" style={{ marginTop: 4 }}>
                  최근 20주
                </div>
              </div>
              <div className="streak__legend">
                적음
                {HEAT_COLORS.map((c, i) => (
                  <span
                    key={i}
                    className="streak__legend-cell"
                    style={{ background: c }}
                  />
                ))}
                많음
              </div>
            </div>

            <div className="streak">
              {HEATMAP.map((row, dow) => (
                <div
                  key={dow}
                  style={{ display: 'contents' }}
                >
                  <span className="streak__dow">
                    {dow % 2 === 0 ? DOW_LBL[dow] : ''}
                  </span>
                  <div className="streak__row">
                    {row.map((v, w) => (
                      <div
                        key={w}
                        className="streak__cell"
                        style={{
                          background: HEAT_COLORS[v],
                          ...(dow === 4 && w === 19
                            ? {
                                outline: '2px solid var(--color-accent)',
                                outlineOffset: 1,
                              }
                            : {}),
                        }}
                        title={`${v}회 완료`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
