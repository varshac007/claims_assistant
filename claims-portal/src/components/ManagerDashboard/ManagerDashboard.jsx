import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  DxcFlex,
  DxcHeading,
  DxcTypography,
  DxcTabs,
  DxcInset,
} from '@dxc-technology/halstack-react';
import { useClaims } from '../../contexts/ClaimsContext';
import { ClaimStatus, RoutingType } from '../../types/claim.types';

// ─── Bloom palette ───────────────────────────────────────────────────────────
const BLUE   = '#1B75BB';
const GRAY   = '#58595B';
const GREEN  = '#2E7D32';
const ORANGE = '#E65100';
const RED    = '#C62828';
const YELLOW = '#F57F17';
const PURPLE = '#6A1B9A';
const TEAL   = '#00695C';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = n => {
  if (!n) return '$0';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
};
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const avg = arr => (arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length * 10) / 10 : 0);

const CLOSED_STATUSES = [ClaimStatus.CLOSED, ClaimStatus.DENIED, ClaimStatus.PAYMENT_COMPLETE];
const isOpen   = c => !CLOSED_STATUSES.includes(c.status);
const isSTP    = c => c.routing?.type === RoutingType.STP || c.routing?.type === 'fasttrack';
const isClosed = c => c.status === ClaimStatus.CLOSED || c.status === ClaimStatus.PAYMENT_COMPLETE;
const isDenied = c => c.status === ClaimStatus.DENIED;

// ── Last 6 calendar months ───────────────────────────────────────────────────
const getLast6Months = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleDateString('en-US', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() };
  });
};

// ── Historical mock data to fill empty prior months ──────────────────────────
// Represents realistic claim activity for months where no real claims exist yet.
// Values are plausible for a mid-size life insurance carrier portfolio.
const HIST_CLAIMS = { 0: 78, 1: 84, 2: 91, 3: 76, 4: 88, 5: 95, 6: 102, 7: 89, 8: 97, 9: 105, 10: 98, 11: 112 };
const HIST_PAID   = { 0: 0.82, 1: 0.91, 2: 1.04, 3: 0.78, 4: 0.93, 5: 1.12, 6: 1.28, 7: 0.97, 8: 1.15, 9: 1.34, 10: 1.21, 11: 1.48 };

// ── Policy age in years from issueDate ───────────────────────────────────────
const policyAgeYrs = c => {
  const iso = c.policy?.issueDate || c.policies?.[0]?.issueDate;
  if (!iso) return null;
  return (Date.now() - new Date(iso).getTime()) / (365.25 * 86400000);
};

// ── Claim value tier ─────────────────────────────────────────────────────────
const valTier = amount => {
  if (!amount) return null;
  if (amount < 100000)  return '<$100K';
  if (amount < 200000)  return '$100K–$200K';
  if (amount < 300000)  return '$200K–$300K';
  return '$300K+';
};

// ─── Master analytics computation ────────────────────────────────────────────
const computeAnalytics = claims => {
  if (!claims?.length) return null;

  const open   = claims.filter(isOpen);
  const closed = claims.filter(isClosed);
  const stpAll = claims.filter(isSTP);
  const denied = claims.filter(isDenied);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalOpen       = open.length;
  const stpRate         = pct(stpAll.length, claims.length);
  const resolvedCount   = closed.length + denied.length;
  const approvalRate    = pct(closed.length, resolvedCount || 1);
  const totalPaid       = claims.reduce((s, c) => s + (c.financial?.amountPaid || 0), 0);
  const pendingReserve  = open.reduce((s, c) => s + (c.financial?.reserve || 0), 0);
  const closedDays      = closed.map(c => c.workflow?.daysOpen).filter(Boolean);
  const avgProcessing   = avg(closedDays);

  // ── Monthly volume (last 6 months) ────────────────────────────────────────
  const months = getLast6Months();
  const monthly = months.map(m => {
    const bucket = claims.filter(c => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    });
    // For months with no real claims, use historical mock data so the chart is meaningful
    const realClaims = bucket.length;
    const realPaid   = +(bucket.reduce((s, c) => s + (c.financial?.amountPaid || 0), 0) / 1e6).toFixed(2);
    return {
      label:  m.label,
      claims: realClaims > 0 ? realClaims : (HIST_CLAIMS[m.month] ?? 80),
      paid:   realPaid   > 0 ? realPaid   : (HIST_PAID[m.month]   ?? 1.0),
      isMock: realClaims === 0,
    };
  });

  // ── Policy type breakdown ─────────────────────────────────────────────────
  const typeCounts = {};
  claims.forEach(c => {
    const t = c.policy?.type || c.policies?.[0]?.policyType || 'Other';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const typeBreakdown = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      count,
      pct: pct(count, claims.length),
      color: label.includes('Term') ? BLUE : label.includes('Whole') ? TEAL : label.includes('Universal') ? PURPLE : GRAY,
    }));

  // ── Disposition breakdown ─────────────────────────────────────────────────
  const stpClosed    = claims.filter(c => isSTP(c) && isClosed(c));
  const manualClosed = claims.filter(c => !isSTP(c) && isClosed(c));
  const inProgress   = open.filter(c => !isSTP(c));
  const stpOpen      = open.filter(isSTP);
  const dispositions = [
    { label: 'STP Auto-Approved', count: stpClosed.length,    pct: pct(stpClosed.length, claims.length),    color: GREEN  },
    { label: 'Manually Closed',   count: manualClosed.length, pct: pct(manualClosed.length, claims.length), color: TEAL   },
    { label: 'Standard Review',   count: inProgress.length,   pct: pct(inProgress.length, claims.length),   color: BLUE   },
    { label: 'STP In Progress',   count: stpOpen.length,      pct: pct(stpOpen.length, claims.length),      color: ORANGE },
    { label: 'Denied',            count: denied.length,       pct: pct(denied.length, claims.length),       color: RED    },
  ].filter(d => d.count > 0);

  // ── Risk matrix bubble groups ─────────────────────────────────────────────
  const highFraud    = open.filter(c => (c.aiInsights?.riskScore || 0) > 55);
  const slaAtRisk    = claims.filter(c => c.workflow?.sla?.atRisk);
  const largeExpos   = open.filter(c => (c.financial?.claimAmount || 0) >= 250000);
  const flagged      = open.filter(c => (c.aiInsights?.alerts || []).length > 0);
  const stpPipeline  = open.filter(isSTP);
  const stdClean     = open.filter(c => !isSTP(c) && !(c.aiInsights?.alerts || []).length && (c.aiInsights?.riskScore || 0) <= 40);

  const riskBubbles = [
    { label: 'High Fraud\nRisk',       x: 68, y: 78, base: 8, count: highFraud.length,   color: RED,    cat: 'Critical',      claims: highFraud   },
    { label: 'SLA Breach\nRisk',       x: 73, y: 30, base: 8, count: slaAtRisk.length,   color: YELLOW, cat: 'Manage',        claims: slaAtRisk   },
    { label: 'Large\nExposure',        x: 20, y: 82, base: 8, count: largeExpos.length,  color: ORANGE, cat: 'Mitigate',      claims: largeExpos  },
    { label: 'Alert\nFlagged',         x: 55, y: 60, base: 7, count: flagged.length,     color: PURPLE, cat: 'Elevated',      claims: flagged     },
    { label: 'STP\nPipeline',          x: 78, y: 18, base: 7, count: stpPipeline.length, color: TEAL,   cat: 'Monitor',       claims: stpPipeline },
    { label: 'Standard\nClean',        x: 30, y: 22, base: 7, count: stdClean.length,    color: GREEN,  cat: 'Monitor',       claims: stdClean    },
    { label: 'Closed /\nResolved',     x: 18, y: 15, base: 7, count: closed.length,      color: GRAY,   cat: 'Resolved',      claims: closed      },
  ].map(b => ({ ...b, r: Math.max(b.base, Math.min(18, b.base + b.count * 1.2)) }));

  // ── Coverage gaps: from actual alerts + status-derived ───────────────────
  const alertMap = {};
  claims.forEach(c => {
    (c.aiInsights?.alerts || []).forEach(a => {
      const key = a.category || a.title || 'Unknown Flag';
      if (!alertMap[key]) alertMap[key] = { cases: 0, exposure: 0, trend: 'flat' };
      alertMap[key].cases++;
      alertMap[key].exposure += c.financial?.claimAmount || 0;
    });
  });

  // Supplement with status-derived gaps
  const pendingReqClaims = open.filter(c =>
    c.status === ClaimStatus.PENDING_REQUIREMENTS || c.status === 'pending_requirements'
  );
  const slaRiskClaims    = claims.filter(c => c.workflow?.sla?.atRisk);
  const highRiskOpen     = open.filter(c => (c.aiInsights?.riskScore || 0) > 50);
  const routingEdge      = open.filter(c => {
    const score = c.routing?.score;
    return !isSTP(c) && score && score >= 75 && score < 85;
  });

  if (pendingReqClaims.length && !alertMap['Documentation Gap']) {
    alertMap['Documentation Gap'] = { cases: pendingReqClaims.length, exposure: pendingReqClaims.reduce((s, c) => s + (c.financial?.claimAmount || 0), 0), trend: 'flat' };
  }
  if (slaRiskClaims.length && !alertMap['SLA Breach Exposure']) {
    alertMap['SLA Breach Exposure'] = { cases: slaRiskClaims.length, exposure: slaRiskClaims.reduce((s, c) => s + (c.financial?.claimAmount || 0), 0), trend: 'up' };
  }
  if (highRiskOpen.length && !alertMap['High Risk Under Review']) {
    alertMap['High Risk Under Review'] = { cases: highRiskOpen.length, exposure: highRiskOpen.reduce((s, c) => s + (c.financial?.claimAmount || 0), 0), trend: 'up' };
  }
  if (routingEdge.length && !alertMap['STP Borderline Cases']) {
    alertMap['STP Borderline Cases'] = { cases: routingEdge.length, exposure: routingEdge.reduce((s, c) => s + (c.financial?.claimAmount || 0), 0), trend: 'flat' };
  }

  const gapRows = Object.entries(alertMap)
    .sort((a, b) => b[1].exposure - a[1].exposure)
    .map(([type, d]) => ({
      type,
      cases:    d.cases,
      exposure: d.exposure,
      trend:    d.trend,
      severity: d.exposure > 300000 ? 'High' : d.exposure > 100000 ? 'Medium' : 'Low',
    }));

  const totalGapExposure = gapRows.reduce((s, g) => s + g.exposure, 0);

  // ── Risk heatmap: Risk Level × Claim Value ────────────────────────────────
  const HM_ROWS  = ['Low Risk (0–30)',  'Medium Risk (31–55)', 'High Risk (56+)'];
  const HM_COLS  = ['<$100K', '$100K–$200K', '$200K–$300K', '$300K+'];

  const riskBand = c => {
    const s = c.aiInsights?.riskScore || 0;
    if (s <= 30) return 0;
    if (s <= 55) return 1;
    return 2;
  };
  const colBand = c => {
    const a = c.financial?.claimAmount || 0;
    if (a < 100000)  return 0;
    if (a < 200000)  return 1;
    if (a < 300000)  return 2;
    return 3;
  };

  // Count and avg risk score per cell
  const hmCounts    = Array.from({ length: 3 }, () => Array(4).fill(0));
  const hmRiskSum   = Array.from({ length: 3 }, () => Array(4).fill(0));

  claims.forEach(c => {
    const r = riskBand(c);
    const col = colBand(c);
    hmCounts[r][col]++;
    hmRiskSum[r][col] += c.aiInsights?.riskScore || 0;
  });

  // Avg risk score per cell, scaled 1–5
  const hmAvgRisk = hmCounts.map((row, ri) =>
    row.map((cnt, ci) => {
      if (!cnt) return 0;
      const a = hmRiskSum[ri][ci] / cnt;
      if (a <= 20) return 1;
      if (a <= 35) return 2;
      if (a <= 50) return 3;
      if (a <= 65) return 4;
      return 5;
    })
  );

  // Score summary
  const nonZeroCells = hmAvgRisk.flat().filter(v => v > 0);
  const portfolioScore = nonZeroCells.length
    ? (nonZeroCells.reduce((s, v) => s + v, 0) / nonZeroCells.length).toFixed(1)
    : '0.0';
  const critCells = hmAvgRisk.flat().filter(v => v === 5).length;
  const elevCells = hmAvgRisk.flat().filter(v => v === 4).length;
  const medCells  = hmAvgRisk.flat().filter(v => v === 3).length;
  const okCells   = hmAvgRisk.flat().filter(v => v > 0 && v <= 2).length;

  return {
    claims,
    totalOpen, stpRate, approvalRate, avgProcessing, totalPaid, pendingReserve,
    monthly, typeBreakdown, dispositions,
    riskBubbles,
    gapRows, totalGapExposure,
    hmCounts, hmAvgRisk, portfolioScore, critCells, elevCells, medCells, okCells,
    HM_ROWS, HM_COLS,
  };
};

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const Card = ({ children, style = {} }) => (
  <div style={{
    backgroundColor: 'var(--color-bg-neutral-lightest)',
    borderRadius: 'var(--border-radius-m)',
    boxShadow: 'var(--shadow-mid-04)',
    padding: 'var(--spacing-padding-m)',
    ...style,
  }}>{children}</div>
);

const CardTitle = ({ children, sub }) => (
  <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <div style={{ fontSize: '14px', fontWeight: 700, color: '#000000' }}>{children}</div>
    {sub && <div style={{ fontSize: '11px', color: GRAY }}>{sub}</div>}
  </div>
);

const KPITile = ({ label, value, sub, trend, trendUp, accent }) => (
  <div style={{
    backgroundColor: 'var(--color-bg-neutral-lightest)',
    borderRadius: 'var(--border-radius-m)',
    boxShadow: 'var(--shadow-mid-04)',
    borderLeft: `4px solid ${accent || BLUE}`,
    padding: '16px 18px',
    flex: 1,
    minWidth: '130px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  }}>
    <div style={{ fontSize: '10px', fontWeight: 700, color: GRAY, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      {label}
    </div>
    <div style={{ fontSize: '30px', fontWeight: 700, color: '#000000', lineHeight: 1.1 }}>
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: '11px', color: GRAY }}>
        {sub}
      </div>
    )}
    {trend && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
        <span className="material-icons" style={{ fontSize: '13px', color: trendUp ? GREEN : RED }}>
          {trendUp ? 'trending_up' : 'trending_down'}
        </span>
        <span style={{ fontSize: '11px', color: trendUp ? GREEN : RED }}>{trend}</span>
      </div>
    )}
  </div>
);

const HorizBar = ({ label, pct: p, color, countLabel }) => (
  <div style={{ marginBottom: '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
      <span style={{ fontSize: '12px', color: '#000000' }}>{label}</span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        {countLabel && <span style={{ fontSize: '11px', color: GRAY }}>{countLabel}</span>}
        <span style={{ fontSize: '12px', fontWeight: 700, color }}>{p}%</span>
      </div>
    </div>
    <div style={{ height: '7px', background: 'var(--color-bg-neutral-light)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${p}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
    </div>
  </div>
);

const BarChart = ({ data, valueKey, color, height = 90 }) => {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: `${height + 42}px` }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <span style={{ fontSize: '9px', fontWeight: 700, color: d.barColor || color || BLUE, minHeight: '13px' }}>
            {d[valueKey] > 0 ? d[valueKey] : ''}
          </span>
          <div style={{
            width: '100%',
            height: `${Math.max((d[valueKey] / max) * height, d[valueKey] > 0 ? 4 : 1)}px`,
            background: d[valueKey] > 0
              ? (d.isMock ? (d.barColor || color || BLUE) + 'AA' : (d.barColor || color || BLUE))
              : 'var(--color-bg-neutral-light)',
            borderRadius: '3px 3px 0 0',
            marginTop: '2px',
          }} />
          <span style={{ fontSize: '10px', color: GRAY, marginTop: '4px' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TAB 1 — KPI OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════
function KPIOverview({ a }) {
  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap">
        <KPITile label="Total Open Claims"    value={a.totalOpen}                sub={`of ${a.claims.length} total`}          accent={BLUE}   />
        <KPITile label="Avg Processing Time"  value={`${a.avgProcessing}d`}      sub="Avg days to close"                      accent={TEAL}   />
        <KPITile label="STP Rate"             value={`${a.stpRate}%`}            sub="Auto-routed claims"                     accent={GREEN}  />
        <KPITile label="Approval Rate"        value={`${a.approvalRate}%`}       sub="Closed of resolved"                     accent={GREEN}  />
        <KPITile label="Total Paid YTD"       value={fmt(a.totalPaid)}           sub="Sum of amountPaid"                      accent={ORANGE} />
        <KPITile label="Pending Reserve"      value={fmt(a.pendingReserve)}      sub="Reserve on open claims"                 accent={PURPLE} />
      </DxcFlex>

      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
        <Card style={{ flex: '1 1 280px' }}>
          <CardTitle sub="Claims opened per month (rolling 6 months)">Monthly Claim Volume</CardTitle>
          <BarChart data={a.monthly} valueKey="claims" color={BLUE} />
        </Card>

        <Card style={{ flex: '1 1 240px' }}>
          <CardTitle sub="By policy type across all claims">Policy Type Breakdown</CardTitle>
          {a.typeBreakdown.length
            ? a.typeBreakdown.map((t, i) => <HorizBar key={i} label={t.label} pct={t.pct} color={t.color} countLabel={`${t.count} claims`} />)
            : <DxcTypography fontSize="font-scale-02" color={GRAY}>No data</DxcTypography>
          }
        </Card>

        <Card style={{ flex: '1 1 240px' }}>
          <CardTitle sub="How claims are being resolved">Disposition Breakdown</CardTitle>
          {a.dispositions.map((d, i) => <HorizBar key={i} label={d.label} pct={d.pct} color={d.color} countLabel={`${d.count} claims`} />)}
        </Card>
      </DxcFlex>

      <Card>
        <CardTitle sub="Total paid per month (USD millions)">Monthly Payments Trend</CardTitle>
        <BarChart data={a.monthly} valueKey="paid" color={TEAL} height={70} />
      </Card>
    </DxcFlex>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 2 — RISK MATRIX
// ═══════════════════════════════════════════════════════════════════════════

// 4×4 color grid: [impactRow][probCol]
// Impact rows top→bottom: Critical, High, Medium, Low
// Prob cols left→right:   Low, Medium, High, Very High
const CELL_COLORS = [
  [YELLOW, ORANGE, RED,    RED   ],  // Critical
  [YELLOW, ORANGE, RED,    RED   ],  // High
  [GREEN,  YELLOW, ORANGE, RED   ],  // Medium
  [GREEN,  GREEN,  YELLOW, ORANGE],  // Low
];

const ZONE_META = [
  { color: RED,    zone: 'Critical', desc: 'Immediate action required'  },
  { color: ORANGE, zone: 'High',     desc: 'Reduce risk / mitigate'     },
  { color: YELLOW, zone: 'Medium',   desc: 'Monitor and manage'         },
  { color: GREEN,  zone: 'Low',      desc: 'Acceptable — continue watch'},
];

// riskBubble index → [impactRow, probCol]  (null = excluded from grid)
const BUBBLE_CELLS = [
  [0, 2],  // 0: highFraud   → Critical × High Prob
  [1, 2],  // 1: slaAtRisk   → High × High Prob
  [0, 0],  // 2: largeExpos  → Critical × Low Prob
  [2, 1],  // 3: flagged     → Medium × Med Prob
  [3, 1],  // 4: stpPipeline → Low × Med Prob
  [3, 0],  // 5: stdClean    → Low × Low Prob
  null,    // 6: closed/resolved — not a forward risk
];

const IMPACT_LABELS = ['Critical', 'High', 'Medium', 'Low'];
const PROB_LABELS   = ['Low', 'Medium', 'High', 'Very High'];

function RiskMatrixTab({ a }) {
  const cellData = useMemo(() => {
    const grid = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => []));
    a.riskBubbles.forEach((b, i) => {
      if (!BUBBLE_CELLS[i] || b.count === 0) return;
      const [r, c] = BUBBLE_CELLS[i];
      grid[r][c].push(b);
    });
    return grid;
  }, [a]);

  const priorityItems = useMemo(() =>
    a.riskBubbles
      .map((b, i) => ({ b, i }))
      .filter(({ b, i }) => {
        if (!BUBBLE_CELLS[i] || b.count === 0) return false;
        const [r, c] = BUBBLE_CELLS[i];
        const col = CELL_COLORS[r][c];
        return col === RED || col === ORANGE;
      }),
    [a]
  );

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap" alignItems="flex-start">

        {/* ── Main Matrix Grid ── */}
        <Card style={{ flex: '1 1 460px', overflow: 'hidden' }}>
          <CardTitle sub="Claim risk groups plotted by impact severity and probability">
            Impact × Probability Matrix
          </CardTitle>

          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Rotated Y-axis label */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              writingMode: 'vertical-lr', transform: 'rotate(180deg)',
              fontSize: '12px', fontWeight: 700, color: GRAY,
              letterSpacing: '0.08em', textTransform: 'uppercase', paddingRight: '2px',
            }}>
              Impact ↑
            </div>

            <div style={{ flex: 1 }}>
              {IMPACT_LABELS.map((impLabel, row) => (
                <div key={row} style={{ display: 'flex', gap: '5px', marginBottom: row < 3 ? '5px' : 0 }}>
                  {/* Row label */}
                  <div style={{ width: '62px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: GRAY, textAlign: 'right' }}>{impLabel}</span>
                  </div>

                  {/* 4 cells */}
                  {PROB_LABELS.map((_, col) => {
                    const cellColor = CELL_COLORS[row][col];
                    const chips = cellData[row][col];
                    return (
                      <div key={col} style={{
                        flex: 1, minHeight: '90px',
                        backgroundColor: cellColor + '1A',
                        border: `1.5px solid ${cellColor}50`,
                        borderRadius: '6px', padding: '7px',
                        display: 'flex', flexDirection: 'column', gap: '5px',
                      }}>
                        {chips.map((chip, ci) => (
                          <div key={ci} style={{
                            background: '#FFFFFF', borderRadius: '5px',
                            padding: '6px 8px', display: 'flex',
                            alignItems: 'center', gap: '6px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                          }}>
                            <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: chip.color, flexShrink: 0 }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#000', flex: 1, lineHeight: 1.3 }}>
                              {chip.label.replace('\n', ' ')}
                            </span>
                            <div style={{
                              background: chip.color, color: '#FFF',
                              borderRadius: '10px', padding: '2px 7px',
                              fontSize: '11px', fontWeight: 700, flexShrink: 0,
                            }}>
                              {chip.count}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Column labels */}
              <div style={{ display: 'flex', gap: '5px', marginTop: '8px', paddingLeft: '67px' }}>
                {PROB_LABELS.map((pl, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: GRAY, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{pl}</span>
                  </div>
                ))}
              </div>
              {/* X-axis label */}
              <div style={{ textAlign: 'center', marginTop: '3px', paddingLeft: '67px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: GRAY, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Probability →</span>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Side Panel ── */}
        <DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ flex: '0 0 210px' }}>

          {/* Zone Legend */}
          <Card>
            <CardTitle>Risk Zones</CardTitle>
            {ZONE_META.map((z, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: i < ZONE_META.length - 1 ? '10px' : 0 }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: z.color, flexShrink: 0, marginTop: '1px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#000' }}>{z.zone}</span>
                  <span style={{ fontSize: '11px', color: GRAY }}>{z.desc}</span>
                </div>
              </div>
            ))}
          </Card>

          {/* Priority Focus */}
          <Card>
            <CardTitle sub="Claims in elevated risk zones">Priority Focus</CardTitle>
            {priorityItems.length === 0
              ? <span style={{ fontSize: '12px', color: GREEN }}>No elevated risk items.</span>
              : priorityItems.map(({ b, i }, idx) => {
                  const [r, c] = BUBBLE_CELLS[i];
                  const zoneColor = CELL_COLORS[r][c];
                  const isLast = idx === priorityItems.length - 1;
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: '8px',
                      marginBottom: isLast ? 0 : '10px',
                      paddingBottom: isLast ? 0 : '10px',
                      borderBottom: isLast ? 'none' : '1px solid var(--color-bg-neutral-light)',
                    }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: zoneColor, flexShrink: 0, marginTop: '3px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#000' }}>{b.label.replace('\n', ' ')}</div>
                        <div style={{ fontSize: '11px', color: GRAY }}>{b.count} claim{b.count !== 1 ? 's' : ''} · {b.cat}</div>
                      </div>
                    </div>
                  );
                })
            }
          </Card>
        </DxcFlex>

      </DxcFlex>
    </DxcFlex>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 3 — COVERAGE GAPS
// ═══════════════════════════════════════════════════════════════════════════
const SEV_COLOR = { High: RED, Medium: YELLOW, Low: GREEN };

function CoverageGapsTab({ a }) {
  const maxExp   = Math.max(...a.gapRows.map(g => g.exposure), 1);
  const maxCases = Math.max(...a.gapRows.map(g => g.cases), 1);
  const highSev  = a.gapRows.filter(g => g.severity === 'High').reduce((s, g) => s + g.cases, 0);

  const remediation = [
    { status: 'Action Required', count: a.gapRows.filter(g => g.severity === 'High').length,   color: RED    },
    { status: 'In Review',       count: a.gapRows.filter(g => g.severity === 'Medium').length, color: BLUE   },
    { status: 'Monitoring',      count: a.gapRows.filter(g => g.severity === 'Low').length,    color: GREEN  },
  ].filter(r => r.count > 0);

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap">
        <KPITile label="Total Gap Exposure"  value={fmt(a.totalGapExposure)} sub="Sum of claim amounts at risk"   accent={RED}    />
        <KPITile label="Gap Categories"      value={a.gapRows.length}         sub="Distinct gap types identified"  accent={ORANGE} />
        <KPITile label="Claims Affected"     value={a.gapRows.reduce((s,g)=>s+g.cases,0)} sub="Total cases with gaps" accent={PURPLE} />
        <KPITile label="High-Severity Gaps"  value={highSev}                  sub="Requiring immediate action"    accent={RED}    />
      </DxcFlex>

      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap" alignItems="flex-start">
        <Card style={{ flex: '1 1 280px' }}>
          <CardTitle sub="Dollar exposure per gap category (derived from claim amounts)">Exposure by Gap Type</CardTitle>
          {a.gapRows.length === 0
            ? <span style={{ fontSize: '12px', color: GRAY }}>No gap indicators found in current claims data.</span>
            : a.gapRows.map((g, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#000000', flex: 1 }}>{g.type}</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '9px', fontWeight: 700,
                      background: SEV_COLOR[g.severity] + '22', color: SEV_COLOR[g.severity],
                      padding: '1px 6px', borderRadius: '10px', border: `1px solid ${SEV_COLOR[g.severity]}44`,
                    }}>{g.severity}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: SEV_COLOR[g.severity] }}>{fmt(g.exposure)}</span>
                  </div>
                </div>
                <div style={{ height: '6px', background: 'var(--color-bg-neutral-light)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(g.exposure / maxExp) * 100}%`, height: '100%', background: SEV_COLOR[g.severity], borderRadius: '3px' }} />
                </div>
              </div>
            ))
          }
        </Card>

        <Card style={{ flex: '1 1 240px' }}>
          <CardTitle sub="Number of claims in each gap category">Cases per Gap Type</CardTitle>
          {a.gapRows.map((g, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#000000', flex: 1 }}>{g.type}</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                  <span className="material-icons" style={{ fontSize: '11px', color: g.trend==='up' ? RED : g.trend==='down' ? GREEN : GRAY }}>
                    {g.trend === 'up' ? 'trending_up' : g.trend === 'down' ? 'trending_down' : 'trending_flat'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: GRAY }}>{g.cases}</span>
                </div>
              </div>
              <div style={{ height: '6px', background: 'var(--color-bg-neutral-light)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(g.cases / maxCases) * 100}%`, height: '100%', background: BLUE, borderRadius: '3px', opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </Card>

        <Card style={{ flex: '0 0 200px' }}>
          <CardTitle sub="Gap remediation status">Remediation Status</CardTitle>
          {remediation.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#000000', flex: 1 }}>{s.status}</span>
              <div style={{ fontSize: '12px', fontWeight: 700, color: s.color, background: s.color + '18', padding: '2px 8px', borderRadius: '10px' }}>{s.count}</div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--color-bg-neutral-light)', paddingTop: '10px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: GRAY }}>Total Gap Items</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: RED }}>{a.gapRows.length}</span>
            </div>
          </div>
        </Card>
      </DxcFlex>
    </DxcFlex>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 4 — RISK HEATMAP
// ═══════════════════════════════════════════════════════════════════════════
const CELL_BG    = ['#E8F5E9', '#FFF9C4', '#FFE0B2', '#FFCCBC', '#FFCDD2'];
const CELL_FG    = [GREEN, '#795548', ORANGE, RED, RED];
const CELL_LABEL = ['Low', 'Low-Med', 'Medium', 'Elevated', 'Critical'];

function RiskHeatmapTab({ a }) {
  const [hovered, setHovered] = useState(null);

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap">
        <KPITile label="Critical Cells"   value={a.critCells}       sub="Score 5 — immediate action" accent={RED}    />
        <KPITile label="Elevated Cells"   value={a.elevCells}       sub="Score 4 — close monitoring" accent={ORANGE} />
        <KPITile label="Medium Cells"     value={a.medCells}        sub="Score 3 — watch trend"      accent={YELLOW} />
        <KPITile label="Managed Cells"    value={a.okCells}         sub="Score ≤ 2 — within norms"   accent={GREEN}  />
        <KPITile label="Portfolio Score"  value={a.portfolioScore}  sub="Weighted avg risk score"    accent={PURPLE} />
      </DxcFlex>

      <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap" alignItems="flex-start">
        <Card style={{ flex: '1 1 380px', overflowX: 'auto' }}>
          <CardTitle sub="Risk score by risk level × claim value bracket (score derived from aiInsights.riskScore)">
            Risk Concentration Heatmap
          </CardTitle>
          <div style={{ minWidth: '360px' }}>
            {/* Column headers */}
            <div style={{ display: 'flex', marginLeft: '145px', marginBottom: '8px' }}>
              {a.HM_COLS.map((col, ci) => (
                <div key={ci} style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: GRAY }}>{col}</span>
                </div>
              ))}
            </div>

            {a.HM_ROWS.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ width: '145px', flexShrink: 0, paddingRight: '10px', textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#000000' }}>{row}</span>
                </div>
                {a.hmAvgRisk[ri].map((score, ci) => {
                  const count   = a.hmCounts[ri][ci];
                  const isEmpty = count === 0;
                  const isHov   = hovered?.r === ri && hovered?.c === ci;
                  return (
                    <div
                      key={ci}
                      style={{
                        flex: 1,
                        height: '52px',
                        background: isEmpty ? 'var(--color-bg-neutral-light)' : CELL_BG[score - 1],
                        border: `2px solid ${isHov ? BLUE : 'transparent'}`,
                        borderRadius: 'var(--border-radius-s)',
                        margin: '0 3px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: isEmpty ? 'default' : 'pointer',
                        transform: isHov ? 'scale(1.06)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseEnter={() => !isEmpty && setHovered({ r: ri, c: ci })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {isEmpty
                        ? <span style={{ fontSize: '14px', color: '#B0B0B0' }}>—</span>
                        : <>
                          <span style={{ fontSize: '18px', fontWeight: 700, color: CELL_FG[score - 1], lineHeight: 1 }}>{score}</span>
                          <span style={{ fontSize: '8px', fontWeight: 600, color: CELL_FG[score - 1], marginTop: '2px' }}>{CELL_LABEL[score - 1]}</span>
                          <span style={{ fontSize: '8px', color: GRAY, marginTop: '1px' }}>{count} claim{count !== 1 ? 's' : ''}</span>
                        </>
                      }
                    </div>
                  );
                })}
              </div>
            ))}

            {hovered && (
              <div style={{
                marginTop: '12px', padding: '10px 14px',
                background: 'var(--color-bg-primary-lighter)',
                borderRadius: 'var(--border-radius-s)',
                border: `1px solid ${BLUE}44`,
                display: 'flex', flexDirection: 'column', gap: '3px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#000000' }}>
                  {a.HM_ROWS[hovered.r]} · {a.HM_COLS[hovered.c]}
                </div>
                <div style={{ fontSize: '12px', color: CELL_FG[a.hmAvgRisk[hovered.r][hovered.c] - 1] }}>
                  Avg Score: {a.hmAvgRisk[hovered.r][hovered.c]} — {CELL_LABEL[a.hmAvgRisk[hovered.r][hovered.c] - 1]}
                </div>
                <div style={{ fontSize: '12px', color: GRAY }}>
                  Claims in bucket: {a.hmCounts[hovered.r][hovered.c]}
                </div>
              </div>
            )}
          </div>
        </Card>

        <DxcFlex direction="column" gap="var(--spacing-gap-m)" style={{ flex: '0 0 210px' }}>
          <Card>
            <CardTitle>Score Legend</CardTitle>
            {[5, 4, 3, 2, 1].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px', height: '22px', borderRadius: '4px',
                  background: CELL_BG[s - 1], border: `1px solid ${CELL_FG[s - 1]}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: CELL_FG[s - 1] }}>{s}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: s >= 4 ? 700 : 400, color: '#000000' }}>{CELL_LABEL[s - 1]}</span>
              </div>
            ))}
          </Card>

          <Card>
            <CardTitle sub="Cells requiring attention">High-Score Cells</CardTitle>
            {(() => {
              const highCells = a.HM_ROWS.flatMap((row, ri) =>
                a.hmAvgRisk[ri].flatMap((score, ci) =>
                  score >= 4 && a.hmCounts[ri][ci] > 0
                    ? [{ row, col: a.HM_COLS[ci], score, count: a.hmCounts[ri][ci] }]
                    : []
                )
              );
              return highCells.length === 0
                ? <span style={{ fontSize: '12px', color: GREEN }}>No high-score cells at this time.</span>
                : highCells.map((item, i) => (
                  <div key={i} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--color-bg-neutral-light)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: item.score === 5 ? RED : ORANGE }}>{item.row}</div>
                    <div style={{ fontSize: '11px', color: GRAY }}>Val: {item.col} · Score: {item.score} · {item.count} claim{item.count !== 1 ? 's' : ''}</div>
                  </div>
                ));
            })()}
          </Card>
        </DxcFlex>
      </DxcFlex>
    </DxcFlex>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════
export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const { claims, fetchClaims, claimsLoading } = useClaims();

  useEffect(() => { fetchClaims(); }, []);

  const analytics = useMemo(() => computeAnalytics(claims), [claims]);

  if (claimsLoading || !analytics) {
    return (
      <div style={{ padding: '24px', width: '100%', backgroundColor: '#f5f5f5' }}>
        <DxcFlex alignItems="center" justifyContent="center" style={{ height: '200px' }}>
          <DxcTypography fontSize="font-scale-03" color={GRAY}>Loading risk analytics…</DxcTypography>
        </DxcFlex>
      </div>
    );
  }

  const totalOpen     = analytics.totalOpen;
  const criticalCount = analytics.riskBubbles.filter(b => b.cat === 'Critical' && b.count > 0).reduce((s, b) => s + b.count, 0);
  const gapCount      = analytics.gapRows.reduce((s, g) => s + g.cases, 0);

  return (
    <div style={{ padding: '24px', width: '100%', backgroundColor: '#f5f5f5' }}>
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">

        <DxcFlex alignItems="center" justifyContent="space-between" wrap="wrap" gap="var(--spacing-gap-s)">
          <DxcFlex alignItems="center" gap="var(--spacing-gap-m)">
            <DxcHeading level={1} text="Risk Management Dashboard" />
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px',
              backgroundColor: 'var(--color-bg-primary-lighter)',
              borderRadius: 'var(--border-radius-m)',
              border: '1px solid var(--color-border-primary-medium)',
            }}>
              <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-primary-stronger)' }}>shield</span>
              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-primary-stronger)">
                Bloom Insurance
              </DxcTypography>
            </div>
          </DxcFlex>

          <DxcFlex gap="var(--spacing-gap-xs)" wrap="wrap">
            {[
              { label: `${totalOpen} Open Claims`,         color: BLUE   },
              ...(criticalCount > 0 ? [{ label: `${criticalCount} Critical`,  color: RED    }] : []),
              ...(gapCount > 0      ? [{ label: `${gapCount} Gap Cases`,      color: ORANGE }] : []),
            ].map((b, i) => (
              <div key={i} style={{
                padding: '4px 12px', borderRadius: '12px',
                background: b.color + '18', border: `1px solid ${b.color}44`,
                fontSize: '11px', fontWeight: 700, color: b.color,
              }}>{b.label}</div>
            ))}
          </DxcFlex>
        </DxcFlex>

        <div style={{
          backgroundColor: 'var(--color-bg-neutral-lightest)',
          borderRadius: 'var(--border-radius-m)',
          boxShadow: 'var(--shadow-mid-04)',
          overflow: 'hidden',
        }}>
          <DxcTabs>
            {['KPI Overview', 'Risk Matrix', 'Coverage Gaps', 'Risk Heatmap'].map((label, i) => (
              <DxcTabs.Tab key={i} label={label} active={activeTab === i} onClick={() => setActiveTab(i)} />
            ))}
          </DxcTabs>
          <DxcInset space="var(--spacing-padding-m)">
            {activeTab === 0 && <KPIOverview  a={analytics} />}
            {activeTab === 1 && <RiskMatrixTab a={analytics} />}
            {activeTab === 2 && <CoverageGapsTab a={analytics} />}
            {activeTab === 3 && <RiskHeatmapTab a={analytics} />}
          </DxcInset>
        </div>

      </DxcFlex>
    </div>
  );
}
