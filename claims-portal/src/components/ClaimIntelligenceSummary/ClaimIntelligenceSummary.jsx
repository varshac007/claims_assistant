// Claim Intelligence Summary — renders narrative + key events + investigation status + outstanding actions
import { useMemo } from 'react';

const C = {
  blue:   '#1B75BB',
  green:  '#37A526',
  orange: '#F6921E',
  red:    '#D02E2E',
  text:   '#1A1A2E',
  gray:   '#58595B',
  lgray:  '#808285',
  border: '#D1D3D4',
  white:  '#FFFFFF',
};

// ─── Helpers ──────────────────────────────────────────────────
const fmtDate = (ts) => {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return String(ts); }
};

const fmtMoney = (n) =>
  n != null && n !== 0
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)
    : null;

const fmtMonthYear = (ts) => {
  if (!ts) return null;
  try {
    return new Date(ts).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch { return null; }
};

const capitalize = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const monthsApart = (d1, d2) => {
  const a = new Date(d1), b = new Date(d2);
  return Math.round(Math.abs((b - a) / (1000 * 60 * 60 * 24 * 30)));
};

// ─── Narrative builder ────────────────────────────────────────
function buildNarrative(claim) {
  const isLA = !!(claim.deathEvent || claim.insured?.dateOfDeath);
  const policy  = claim.policy  || {};
  const fin     = claim.financial || {};
  const routing = claim.routing  || {};
  const sla     = claim.workflow?.sla;

  const routingLabel = (() => {
    const t = (routing.type || 'standard').toUpperCase();
    if (t === 'STP') return 'straight-through';
    if (t === 'SIU') return 'SIU';
    if (t === 'FASTTRACK') return 'fast-track';
    return 'standard';
  })();

  const slaRemaining = sla?.daysRemaining != null ? sla.daysRemaining
    : sla?.dueDate ? Math.ceil((new Date(sla.dueDate) - Date.now()) / 86400000)
    : null;

  const isClosed = ['closed', 'approved', 'denied'].includes((claim.status || '').toLowerCase());

  // ── L&A narrative ──────────────────────────────────────────
  if (isLA) {
    const de        = claim.deathEvent || {};
    const insured   = claim.insured   || {};
    const claimant  = claim.claimant  || {};

    const claimantName  = claimant.name || 'the claimant';
    const relationship  = claimant.relationship ? `(${claimant.relationship.toLowerCase()})` : '';
    const insuredName   = insured.name || 'the insured';
    const insuredAge    = insured.dateOfBirth && de.dateOfDeath
      ? Math.floor((new Date(de.dateOfDeath) - new Date(insured.dateOfBirth)) / (365.25 * 86400000))
      : null;
    const manner        = (de.mannerOfDeath || '').toLowerCase() || 'natural causes';
    const location      = [de.city, de.stateOfDeath].filter(Boolean).join(', ')
      || de.stateOfDeath || de.countryOfDeath || '';
    const dod           = de.dateOfDeath ? de.dateOfDeath.substring(0, 10) : '';

    const policyNum   = policy.policyNumber || '';
    const coverage    = fmtMoney(policy.coverageLimit || fin.claimAmount);
    const policyType  = policy.type || policy.policyType || 'Life';
    const issuedLabel = fmtMonthYear(policy.issueDate || policy.effectiveDate);

    // Risk hint from alerts
    const alerts = claim.aiInsights?.alerts || [];
    let riskSentence = '';
    if (alerts.length > 0) {
      const top = alerts[0];
      riskSentence = ` ${top.description || top.title || 'An anomaly has been detected'} has been flagged for enhanced verification.`;
    }

    const slaSentence = isClosed ? '' : slaRemaining != null ? ` SLA has ${slaRemaining} day${slaRemaining !== 1 ? 's' : ''} remaining.` : '';

    return [
      `Death claim filed by ${claimantName}${relationship ? ' ' + relationship : ''} for ${insuredName}`,
      insuredAge ? `, age ${insuredAge}` : '',
      `, who died of ${manner}`,
      location ? ` in ${location}` : '',
      dod ? ` on ${dod}` : '',
      '. ',
      policyNum ? `Policy ${policyNum} is a` : 'The policy is a',
      coverage ? ` ${coverage}` : '',
      ` ${policyType} policy`,
      issuedLabel ? ` issued ${issuedLabel}` : '',
      '. ',
      `Claim is under ${routingLabel} review.`,
      riskSentence,
      slaSentence,
    ].join('');
  }

  // ── P&C narrative ──────────────────────────────────────────
  const le       = claim.lossEvent || {};
  const insured  = claim.insured  || claim.claimant || {};

  const claimType = (() => {
    const t = (claim.type || claim.claimType || '').toLowerCase();
    if (t.includes('auto_collision') || t.includes('collision')) return 'Auto collision';
    if (t.includes('auto_comprehensive') || t.includes('comprehensive')) return 'Auto comprehensive';
    if (t.includes('auto_liability') || t.includes('liability')) return 'Auto liability';
    if (t.includes('homeowners')) return 'Homeowners';
    if (t.includes('commercial_property') || t.includes('commercial')) return 'Commercial property';
    if (t.includes('workers_comp')) return 'Workers compensation';
    return capitalize(claim.type || 'Property & Casualty');
  })();

  const claimantName = insured.name || claim.claimant?.name || 'the insured';
  const lossDate     = le.dateOfLoss ? le.dateOfLoss.substring(0, 10) : '';
  const lossLocation = le.lossLocation || le.city || '';
  const description  = le.lossDescription || le.causeOfLoss || '';

  const policyNum   = policy.policyNumber || '';
  const coverage    = fmtMoney(policy.coverageLimit || fin.claimAmount);
  const policyType  = policy.type || policy.policyType || 'Property & Casualty';
  const issuedLabel = fmtMonthYear(policy.issueDate || policy.effectiveDate);
  const claimNum    = claim.claimNumber || claim.fnolNumber || '';

  const alerts = claim.aiInsights?.alerts || [];
  let riskSentence = '';
  if (alerts.some(a => ['High', 'Critical'].includes(a.severity))) {
    const top = alerts.find(a => ['High', 'Critical'].includes(a.severity));
    riskSentence = ` ${top.description || top.title || 'A high-severity flag'} has been noted and requires review.`;
  } else if (alerts.length > 0) {
    riskSentence = ` ${alerts[0].description || alerts[0].title || 'An alert'} has been flagged for review.`;
  }

  const slaSentence = isClosed ? '' : slaRemaining != null ? ` SLA has ${slaRemaining} day${slaRemaining !== 1 ? 's' : ''} remaining.` : '';

  return [
    `${claimType} claim`,
    claimNum ? ` ${claimNum}` : '',
    ` filed by ${claimantName}`,
    lossDate ? ` following a loss on ${lossDate}` : '',
    lossLocation ? ` in ${lossLocation}` : '',
    '. ',
    policyNum ? `Policy ${policyNum} is a` : 'The policy is a',
    coverage ? ` ${coverage}` : '',
    ` ${policyType} policy`,
    issuedLabel ? ` issued ${issuedLabel}` : '',
    '. ',
    description ? `${description}. ` : '',
    `Claim is under ${routingLabel} review.`,
    riskSentence,
    slaSentence,
  ].join('');
}

// ─── Data builder ─────────────────────────────────────────────
function buildData(claim, aiInsightsProp) {
  // Key Events from timeline
  const rawTimeline = claim.timeline || [];
  const keyEvents = rawTimeline.slice(0, 5).map(e => ({
    date: fmtDate(e.timestamp),
    text: e.description || e.event || e.type || '',
  }));
  if (keyEvents.length === 0) {
    keyEvents.push({ date: fmtDate(claim.createdAt), text: 'FNOL received and claim created' });
    const rt = (claim.routing?.type || '').toUpperCase();
    if (rt) keyEvents.push({ date: fmtDate(claim.createdAt), text: `Claim routed — ${capitalize(rt)}` });
  }

  // Investigation Status
  const statusLabel = capitalize(claim.status || 'Open');
  const currentTask = claim.workflow?.currentTask || '';
  const investigationStatus = currentTask
    ? `${statusLabel} — ${currentTask}`
    : statusLabel;

  // Outstanding Actions from pending requirements
  const allReqs = claim.requirements || [];
  const pendingReqs = allReqs.filter(r =>
    !['satisfied', 'SATISFIED', 'Completed', 'COMPLETED'].includes(r.status)
  );
  const outstandingActions = pendingReqs.map(r => r.name || r.description || r.type).filter(Boolean);

  // Narrative
  const narrative = buildNarrative(claim);

  return { keyEvents, investigationStatus, outstandingActions, narrative };
}

// ─── Component ────────────────────────────────────────────────
export default function ClaimIntelligenceSummary({ claim, aiInsights = [] }) {
  const d = useMemo(() => buildData(claim, aiInsights), [claim, aiInsights]);

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      fontFamily: 'inherit',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span className="material-icons" style={{ fontSize: 18, color: C.blue }}>description</span>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text }}>Claim Intelligence Summary</span>
      </div>

      {/* Narrative */}
      <p style={{ margin: '0 0 18px', fontSize: '0.82rem', color: '#333', lineHeight: 1.7 }}>
        {d.narrative}
      </p>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '0 32px' }}>

        {/* Left — Key Events */}
        <div>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, color: C.blue,
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
          }}>
            Key Events
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {d.keyEvents.map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, fontSize: '0.82rem' }}>
                <span style={{ color: C.gray, whiteSpace: 'nowrap', minWidth: 74, flexShrink: 0 }}>
                  {ev.date}
                </span>
                <span style={{ color: C.text }}>{ev.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Investigation Status + Outstanding Actions */}
        <div>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, color: C.blue,
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>
            Investigation Status
          </div>
          <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: C.text, lineHeight: 1.5 }}>
            {d.investigationStatus}
          </p>

          <div style={{
            fontSize: '0.68rem', fontWeight: 700, color: C.blue,
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
          }}>
            Outstanding Actions
          </div>
          {d.outstandingActions.length === 0 ? (
            <span style={{ fontSize: '0.82rem', color: C.green }}>No outstanding actions</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {d.outstandingActions.map((a, i) => (
                <div key={i} style={{
                  fontSize: '0.82rem', color: C.text,
                  paddingLeft: 10,
                  borderLeft: `2px solid ${C.border}`,
                  lineHeight: 1.4,
                }}>
                  {a}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
