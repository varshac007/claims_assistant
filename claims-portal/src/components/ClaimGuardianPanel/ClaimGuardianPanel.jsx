import { useState } from 'react';
import {
  DxcFlex,
  DxcTypography,
  DxcBadge,
  DxcInset,
  DxcChip
} from '@dxc-technology/halstack-react';
import './ClaimGuardianPanel.css';

const RISK_CONFIG = {
  Low:      { color: '#37A526', bg: '#E8F5E3', border: '#37A526' },
  Medium:   { color: '#F6921E', bg: '#FEF1E8', border: '#F6921E' },
  High:     { color: '#D02E2E', bg: '#FFEBEE', border: '#D02E2E' },
  Critical: { color: '#7B1FA2', bg: '#F3E5F5', border: '#7B1FA2' }
};

const SEV_COLOR = { Low: '#37A526', Medium: '#F6921E', High: '#D02E2E', Critical: '#7B1FA2' };
const SEV_BG =   { Low: '#E8F5E3', Medium: '#FEF1E8', High: '#FFEBEE', Critical: '#F3E5F5' };

const URGENCY_COLOR = { Immediate: '#D02E2E', 'This Week': '#F6921E', 'This Month': '#37A526' };
const URGENCY_BG    = { Immediate: '#FFEBEE', 'This Week': '#FEF1E8', 'This Month': '#E8F5E3' };

const card = (extra = {}) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  border: '1px solid #E0E0E0',
  padding: '16px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  ...extra
});

const sectionTitle = (icon, label) => (
  <DxcFlex alignItems="center" gap="8px">
    <span className="material-icons" style={{ fontSize: '18px', color: '#5C6AE0' }}>{icon}</span>
    <DxcTypography fontWeight="600" fontSize="0.85rem" color="#1A1A2E">{label}</DxcTypography>
  </DxcFlex>
);

const Badge = ({ label, color, bg }) => (
  <span style={{ backgroundColor: bg, color, border: `1px solid ${color}`, borderRadius: '12px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>
);

const formatCurrency = (n) => n != null ? `$${Number(n).toLocaleString()}` : '—';
const fmt = (ts) => { try { return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return ts; } };
const fmtTime = (ts) => { try { return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch { return ts; } };

// ─── Sub-components ──────────────────────────────────────────

const StatCell = ({ label, value, valueColor }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '100px' }}>
    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#777', letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1, textAlign: 'center' }}>{label}</span>
    <span style={{ fontSize: '1rem', fontWeight: 700, color: valueColor || '#1A1A2E', lineHeight: 1.2, textAlign: 'center' }}>{value}</span>
  </div>
);

const SummaryBar = ({ gi }) => {
  const rc = RISK_CONFIG[gi.overallRisk] || RISK_CONFIG.Low;
  const openNBA = (gi.nextBestActions || []).length;
  const openAudit = (gi.auditFindings || []).filter(f => f.status === 'Open').length;
  const openLeakage = (gi.leakageIndicators || []).length;
  return (
    <div style={{ ...card(), borderLeft: `4px solid ${rc.border}`, backgroundColor: rc.bg, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Overall Risk */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '8px' }}>
          <span className="material-icons" style={{ fontSize: '26px', color: rc.color }}>shield</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#777', letterSpacing: '0.05em', textTransform: 'uppercase' }}>OVERALL RISK</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: rc.color, lineHeight: 1.2 }}>{gi.overallRisk}</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '36px', backgroundColor: rc.border, opacity: 0.3, flexShrink: 0 }} />

        {/* Stats */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', flex: 1 }}>
          <StatCell label="Leakage Exposure" value={gi.leakageExposure > 0 ? formatCurrency(gi.leakageExposure) : 'None'} valueColor={gi.leakageExposure > 0 ? '#D02E2E' : '#37A526'} />
          <StatCell label="Next Best Actions" value={openNBA} valueColor={openNBA > 0 ? '#F6921E' : '#37A526'} />
          <StatCell label="Audit Findings" value={`${openAudit} open`} valueColor={openAudit > 0 ? '#D02E2E' : '#37A526'} />
          <StatCell label="Leakage Items" value={openLeakage} valueColor={openLeakage > 0 ? '#F6921E' : '#37A526'} />
        </div>

        {/* Last analyzed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Last analyzed</span>
          <span style={{ fontSize: '0.72rem', color: '#555' }}>{fmtTime(gi.lastAnalyzed)}</span>
        </div>
      </div>
    </div>
  );
};

const SECTION_LABEL = (text) => (
  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5C6AE0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{text}</span>
);

const CHECK_ICON = { pass: 'check_circle', fail: 'cancel', warn: 'warning' };
const CHECK_COLOR = { pass: '#37A526', fail: '#D02E2E', warn: '#F6921E' };

const PR_COLOR = { Paid: '#37A526', Ready: '#37A526', Partial: '#F6921E', Blocked: '#D02E2E', Pending: '#5C6AE0' };
const PR_BG    = { Paid: '#E8F5E3', Ready: '#E8F5E3', Partial: '#FEF1E8', Blocked: '#FFEBEE', Pending: '#E8E9FF' };

// ─── L&A Intelligence Summary ─────────────────────────────────
// Sections: Policy & Claimant Details | Documentation | Eligibility | Risk Indicators | Payout Readiness

const LAIntelligenceSummary = ({ s }) => {
  if (!s) return null;
  const pr = s.payoutReadiness;
  return (
    <div style={card()}>
      <DxcFlex direction="column" gap="14px">
        {sectionTitle('summarize', 'Claim Intelligence Summary')}

        {/* Policy & Claimant Details */}
        {s.policyClaimantDetails && (
          <div>
            {SECTION_LABEL('Policy & Claimant Details')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              {['policy', 'claimant'].map(key => (
                <div key={key} style={{ backgroundColor: '#F8F9FF', borderRadius: '6px', padding: '10px', border: '1px solid #E8E9FF' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{key}</div>
                  {Object.entries(s.policyClaimantDetails[key] || {}).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#666' }}>{k}</span>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#333', textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documentation Received vs Missing */}
        {s.documentation && (
          <div>
            {SECTION_LABEL('Documentation Received vs Missing')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
              <div style={{ backgroundColor: '#F0FAF0', borderRadius: '6px', padding: '10px', border: '1px solid #C8E6C9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                  <span className="material-icons" style={{ fontSize: '13px', color: '#37A526' }}>check_circle</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#37A526', textTransform: 'uppercase' }}>Received ({(s.documentation.received || []).length})</span>
                </div>
                {(s.documentation.received || []).map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: '5px', fontSize: '0.75rem', color: '#333', marginBottom: '2px' }}>
                    <span style={{ color: '#37A526', flexShrink: 0 }}>•</span>{d}
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: s.documentation.missing?.length > 0 ? '#FFF3F3' : '#F0FAF0', borderRadius: '6px', padding: '10px', border: `1px solid ${s.documentation.missing?.length > 0 ? '#FFCDD2' : '#C8E6C9'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                  <span className="material-icons" style={{ fontSize: '13px', color: s.documentation.missing?.length > 0 ? '#D02E2E' : '#37A526' }}>
                    {s.documentation.missing?.length > 0 ? 'warning' : 'check_circle'}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: s.documentation.missing?.length > 0 ? '#D02E2E' : '#37A526', textTransform: 'uppercase' }}>
                    {s.documentation.missing?.length > 0 ? `Missing (${s.documentation.missing.length})` : 'Complete'}
                  </span>
                </div>
                {s.documentation.missing?.length > 0
                  ? s.documentation.missing.map((d, i) => (
                      <div key={i} style={{ display: 'flex', gap: '5px', fontSize: '0.75rem', color: '#333', marginBottom: '2px' }}>
                        <span style={{ color: '#D02E2E', flexShrink: 0 }}>•</span>{d}
                      </div>
                    ))
                  : <span style={{ fontSize: '0.75rem', color: '#37A526' }}>All required documents received</span>
                }
              </div>
            </div>
          </div>
        )}

        {/* 3-column: Eligibility Validation | Risk Indicators | Payout Readiness */}
        {(s.eligibilityValidation || s.riskIndicators || pr) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {s.eligibilityValidation && (
              <div style={{ backgroundColor: '#FAFAFA', borderRadius: '6px', padding: '10px', border: '1px solid #E0E0E0' }}>
                {SECTION_LABEL('Eligibility Validation')}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px' }}>
                  {(s.eligibilityValidation.checks || []).map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                      <span className="material-icons" style={{ fontSize: '13px', color: CHECK_COLOR[c.status] || '#888', flexShrink: 0, marginTop: '1px' }}>
                        {CHECK_ICON[c.status] || 'help'}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: '#333' }}>{c.label}</div>
                        {c.detail && <div style={{ fontSize: '0.67rem', color: '#888' }}>{c.detail}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {s.riskIndicators && (
              <div style={{ backgroundColor: '#FAFAFA', borderRadius: '6px', padding: '10px', border: '1px solid #E0E0E0' }}>
                {SECTION_LABEL('Risk Indicators')}
                <div style={{ marginTop: '8px' }}>
                  {s.riskIndicators.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span className="material-icons" style={{ fontSize: '13px', color: '#37A526' }}>check_circle</span>
                      <span style={{ fontSize: '0.74rem', color: '#37A526' }}>No risk indicators</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {s.riskIndicators.map((r, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: SEV_COLOR[r.severity] || '#888', flexShrink: 0, display: 'inline-block' }} />
                            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#333', flex: 1 }}>{r.label}</span>
                            <Badge label={r.severity} color={SEV_COLOR[r.severity]} bg={SEV_BG[r.severity]} />
                          </div>
                          {r.detail && <div style={{ fontSize: '0.67rem', color: '#888', paddingLeft: '13px', marginTop: '1px' }}>{r.detail}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {pr && (
              <div style={{ backgroundColor: '#FAFAFA', borderRadius: '6px', padding: '10px', border: `1px solid ${pr.status === 'Paid' || pr.status === 'Ready' ? '#C8E6C9' : pr.status === 'Blocked' ? '#FFCDD2' : '#FFE0B2'}` }}>
                {SECTION_LABEL('Payout Readiness')}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', marginBottom: '8px' }}>
                  <Badge label={pr.status} color={PR_COLOR[pr.status] || '#888'} bg={PR_BG[pr.status] || '#f5f5f5'} />
                  {pr.estimatedAmount != null && (
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1A2E' }}>{formatCurrency(pr.estimatedAmount)}</span>
                  )}
                </div>
                {pr.blockers?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {pr.blockers.map((b, i) => (
                      <div key={i} style={{ display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                        <span className="material-icons" style={{ fontSize: '11px', color: '#D02E2E', marginTop: '3px', flexShrink: 0 }}>block</span>
                        <span style={{ fontSize: '0.72rem', color: '#D02E2E' }}>{b}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.74rem', color: '#37A526' }}>
                    {pr.status === 'Paid' ? 'Payment completed' : 'Ready to process payment'}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </DxcFlex>
    </div>
  );
};

// ─── P&C Intelligence Summary ─────────────────────────────────
// Sections: Incident Summary | Current Claim Status | Key Events Timeline | Outstanding Actions | Potential Risk Indicators | Estimated Exposure

const PCIntelligenceSummary = ({ s }) => {
  if (!s) return null;
  const ee = s.estimatedExposure;
  const isClosed = s.investigationStatus?.toLowerCase().includes('closed');
  const isCritical = s.investigationStatus?.toLowerCase().includes('critical') || s.investigationStatus?.toLowerCase().includes('sla');
  const statusColor = isClosed ? '#37A526' : isCritical ? '#D02E2E' : '#F6921E';
  const statusBg   = isClosed ? '#E8F5E3' : isCritical ? '#FFEBEE' : '#FEF1E8';
  const statusIcon = isClosed ? 'check_circle' : isCritical ? 'error' : 'pending';
  const hasActions = (s.outstandingActions || []).length > 0;

  return (
    <div style={card()}>
      <DxcFlex direction="column" gap="14px">
        {sectionTitle('summarize', 'Claim Intelligence Summary')}

        {/* 1. Incident Summary */}
        <div>
          {SECTION_LABEL('Incident Summary')}
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#333', lineHeight: 1.6 }}>{s.narrative}</p>
        </div>

        <div style={{ borderTop: '1px solid #EEEEEE' }} />

        {/* 2. Current Claim Status  +  6. Estimated Exposure */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ backgroundColor: statusBg, borderRadius: '6px', padding: '12px', border: `1px solid ${statusColor}50` }}>
            {SECTION_LABEL('Current Claim Status')}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'flex-start' }}>
              <span className="material-icons" style={{ fontSize: '15px', color: statusColor, flexShrink: 0, marginTop: '1px' }}>{statusIcon}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: statusColor, lineHeight: 1.4 }}>{s.investigationStatus}</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFF8F0', borderRadius: '6px', padding: '12px', border: '2px solid #F6921E' }}>
            {SECTION_LABEL('Estimated Exposure')}
            <div style={{ marginTop: '6px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D02E2E', lineHeight: 1 }}>
                {ee ? formatCurrency(ee.total) : '—'}
              </span>
            </div>
            {ee && (ee.components || []).length > 0 && (
              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {ee.components.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: c.amount < 0 ? '#37A526' : '#555' }}>
                    <span>{c.label}</span>
                    <span style={{ fontWeight: 600 }}>{c.amount < 0 ? `-${formatCurrency(-c.amount)}` : formatCurrency(c.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            {ee?.notes && <div style={{ marginTop: '5px', fontSize: '0.67rem', color: '#888', fontStyle: 'italic' }}>{ee.notes}</div>}
          </div>
        </div>

        {/* 3. Key Events Timeline */}
        {(s.keyEvents || []).length > 0 && (
          <div>
            {SECTION_LABEL('Key Events Timeline')}
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column' }}>
              {s.keyEvents.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '10px', flexShrink: 0 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5C6AE0', display: 'block', marginTop: '5px', flexShrink: 0 }} />
                    {i < s.keyEvents.length - 1 && <span style={{ width: '1px', flex: 1, minHeight: '14px', backgroundColor: '#D0D3F5', display: 'block', marginTop: '2px' }} />}
                  </div>
                  <div style={{ paddingBottom: '8px', flex: 1 }}>
                    <span style={{ fontSize: '0.67rem', color: '#888', display: 'block', marginBottom: '1px' }}>{fmt(e.date)}</span>
                    <span style={{ fontSize: '0.78rem', color: '#333', lineHeight: 1.4 }}>{e.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Outstanding Actions  +  5. Potential Risk Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ backgroundColor: hasActions ? '#FFFBF0' : '#F0FAF0', borderRadius: '6px', padding: '10px', border: `1px solid ${hasActions ? '#FFE0B2' : '#C8E6C9'}` }}>
            {SECTION_LABEL('Outstanding Actions')}
            {hasActions ? (
              <ul style={{ margin: '8px 0 0', paddingLeft: '16px' }}>
                {s.outstandingActions.map((a, i) => (
                  <li key={i} style={{ fontSize: '0.78rem', color: (a.startsWith('FILE') || a.includes('IMMEDIATE')) ? '#D02E2E' : '#333', fontWeight: (a.startsWith('FILE') || a.includes('IMMEDIATE')) ? 700 : 400, marginBottom: '3px' }}>{a}</li>
                ))}
              </ul>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
                <span className="material-icons" style={{ fontSize: '13px', color: '#37A526' }}>check_circle</span>
                <span style={{ fontSize: '0.74rem', color: '#37A526' }}>No outstanding actions</span>
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#FAFAFA', borderRadius: '6px', padding: '10px', border: '1px solid #E0E0E0' }}>
            {SECTION_LABEL('Potential Risk Indicators')}
            <div style={{ marginTop: '8px' }}>
              {!s.riskIndicators || s.riskIndicators.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="material-icons" style={{ fontSize: '13px', color: '#37A526' }}>check_circle</span>
                  <span style={{ fontSize: '0.74rem', color: '#37A526' }}>No risk indicators</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {s.riskIndicators.map((r, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: SEV_COLOR[r.severity] || '#888', flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#333', flex: 1 }}>{r.label}</span>
                        <Badge label={r.severity} color={SEV_COLOR[r.severity]} bg={SEV_BG[r.severity]} />
                      </div>
                      {r.detail && <div style={{ fontSize: '0.67rem', color: '#888', paddingLeft: '13px', marginTop: '1px' }}>{r.detail}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DxcFlex>
    </div>
  );
};

// ─── Dispatcher ───────────────────────────────────────────────
const IntelligenceSummary = ({ s, claimData }) => {
  if (!s) return null;
  return claimData?.lossEvent
    ? <PCIntelligenceSummary s={s} />
    : <LAIntelligenceSummary s={s} />;
};

const NextBestActions = ({ actions }) => {
  if (!actions?.length) return (
    <div style={card()}>
      {sectionTitle('recommend', 'Next Best Actions')}
      <p style={{ margin: '12px 0 0', fontSize: '0.82rem', color: '#888' }}>No recommended actions at this time.</p>
    </div>
  );
  return (
    <div style={card()}>
      <DxcFlex direction="column" gap="12px">
        {sectionTitle('recommend', 'Next Best Actions')}
        {actions.sort((a, b) => a.priority - b.priority).map(a => (
          <div key={a.id} style={{ border: '1px solid #E8E8E8', borderLeft: `3px solid ${URGENCY_COLOR[a.urgency] || '#5C6AE0'}`, borderRadius: '6px', padding: '12px', backgroundColor: '#FAFAFA' }}>
            <DxcFlex justifyContent="space-between" alignItems="flex-start" wrap="wrap" gap="6px">
              <DxcFlex alignItems="center" gap="8px">
                <span style={{ backgroundColor: '#5C6AE0', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{a.priority}</span>
                <DxcTypography fontWeight="600" fontSize="0.85rem" color="#1A1A2E">{a.action}</DxcTypography>
              </DxcFlex>
              <DxcFlex gap="6px" alignItems="center">
                <Badge label={a.urgency} color={URGENCY_COLOR[a.urgency] || '#666'} bg={URGENCY_BG[a.urgency] || '#f5f5f5'} />
                <span style={{ fontSize: '0.7rem', color: '#888', fontStyle: 'italic' }}>{a.agent}</span>
              </DxcFlex>
            </DxcFlex>
            <p style={{ margin: '8px 0 4px 28px', fontSize: '0.8rem', color: '#333' }}>{a.description}</p>
            <p style={{ margin: '0 0 0 28px', fontSize: '0.75rem', color: '#666' }}><strong>Rationale:</strong> {a.rationale}</p>
          </div>
        ))}
      </DxcFlex>
    </div>
  );
};

const FraudSignals = ({ fs }) => {
  const score = fs?.score ?? 0;
  const signals = fs?.signals || [];
  const scoreColor = score < 30 ? '#37A526' : score < 55 ? '#F6921E' : '#D02E2E';
  return (
    <div style={card()}>
      <DxcFlex direction="column" gap="12px">
        <DxcFlex justifyContent="space-between" alignItems="center">
          {sectionTitle('gpp_maybe', 'Fraud Signal Detection')}
          <DxcFlex alignItems="center" gap="8px">
            <DxcTypography fontSize="0.75rem" color="#666">Fraud Risk Score</DxcTypography>
            <span style={{ backgroundColor: scoreColor, color: '#fff', borderRadius: '12px', padding: '2px 12px', fontWeight: 700, fontSize: '0.85rem' }}>{score}</span>
          </DxcFlex>
        </DxcFlex>
        {signals.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#E8F5E3', borderRadius: '6px' }}>
            <span className="material-icons" style={{ fontSize: '16px', color: '#37A526' }}>check_circle</span>
            <DxcTypography fontSize="0.82rem" color="#37A526">No fraud signals detected. Claim patterns are consistent with normal claim characteristics.</DxcTypography>
          </div>
        ) : signals.map(s => (
          <div key={s.id} style={{ border: `1px solid ${SEV_COLOR[s.severity] || '#ccc'}`, borderRadius: '6px', padding: '12px', backgroundColor: SEV_BG[s.severity] || '#fff' }}>
            <DxcFlex justifyContent="space-between" alignItems="flex-start" wrap="wrap" gap="6px">
              <DxcFlex alignItems="center" gap="6px">
                <Badge label={s.severity} color={SEV_COLOR[s.severity]} bg={SEV_BG[s.severity]} />
                <DxcTypography fontWeight="600" fontSize="0.82rem" color="#1A1A2E">{s.indicator}</DxcTypography>
              </DxcFlex>
              <DxcFlex gap="6px">
                <span style={{ fontSize: '0.7rem', color: '#888' }}>Source: {s.dataSource}</span>
                <span style={{ fontSize: '0.7rem', color: '#888' }}>Confidence: {s.confidence}%</span>
              </DxcFlex>
            </DxcFlex>
            <p style={{ margin: '8px 0 4px', fontSize: '0.8rem', color: '#333' }}>{s.description}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#555' }}><strong>Recommendation:</strong> {s.recommendation}</p>
          </div>
        ))}
      </DxcFlex>
    </div>
  );
};

const LeakageIndicators = ({ items }) => (
  <div style={card()}>
    <DxcFlex direction="column" gap="12px">
      {sectionTitle('leak_add', 'Claim Leakage Detection')}
      {!items?.length ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#E8F5E3', borderRadius: '6px' }}>
          <span className="material-icons" style={{ fontSize: '16px', color: '#37A526' }}>check_circle</span>
          <DxcTypography fontSize="0.82rem" color="#37A526">No leakage indicators detected.</DxcTypography>
        </div>
      ) : items.map(item => (
        <div key={item.id} style={{ border: `1px solid ${SEV_COLOR[item.severity] || '#ccc'}`, borderRadius: '6px', padding: '12px', backgroundColor: SEV_BG[item.severity] || '#fff' }}>
          <DxcFlex justifyContent="space-between" alignItems="flex-start" wrap="wrap" gap="6px">
            <DxcFlex alignItems="center" gap="6px">
              <Badge label={item.severity} color={SEV_COLOR[item.severity]} bg={SEV_BG[item.severity]} />
              <DxcTypography fontWeight="600" fontSize="0.82rem" color="#1A1A2E">{item.category}</DxcTypography>
            </DxcFlex>
            <DxcFlex gap="8px" alignItems="center">
              {item.estimatedAmount > 0 && <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#D02E2E' }}>{formatCurrency(item.estimatedAmount)} exposure</span>}
              <Badge label={item.status} color={item.status === 'Open' ? '#D02E2E' : item.status === 'Monitoring' ? '#F6921E' : '#37A526'} bg={item.status === 'Open' ? '#FFEBEE' : item.status === 'Monitoring' ? '#FEF1E8' : '#E8F5E3'} />
            </DxcFlex>
          </DxcFlex>
          <p style={{ margin: '8px 0 4px', fontSize: '0.8rem', color: '#333' }}>{item.description}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#555' }}><strong>Recommendation:</strong> {item.recommendation}</p>
        </div>
      ))}
    </DxcFlex>
  </div>
);

const SubrogationPanel = ({ items }) => {
  if (!items?.length) return (
    <div style={card()}>
      {sectionTitle('currency_exchange', 'Subrogation Opportunities')}
      <p style={{ margin: '12px 0 0', fontSize: '0.82rem', color: '#888' }}>No subrogation opportunities identified for this claim.</p>
    </div>
  );
  const probColor = { Low: '#37A526', Medium: '#F6921E', High: '#D02E2E' };
  return (
    <div style={card()}>
      <DxcFlex direction="column" gap="12px">
        {sectionTitle('currency_exchange', 'Subrogation Opportunities')}
        {items.map(s => (
          <div key={s.id} style={{ border: '1px solid #5C6AE0', borderRadius: '6px', padding: '12px', backgroundColor: '#F0F1FF' }}>
            <DxcFlex justifyContent="space-between" alignItems="flex-start" wrap="wrap" gap="6px">
              <DxcTypography fontWeight="600" fontSize="0.85rem" color="#1A1A2E">{s.opportunityType}</DxcTypography>
              <DxcFlex gap="8px" alignItems="center">
                <span style={{ fontSize: '0.75rem', color: '#666' }}>Probability: <strong style={{ color: probColor[s.probability] || '#333' }}>{s.probability}</strong></span>
                {s.estimatedRecovery > 0 && <span style={{ fontWeight: 700, color: '#37A526', fontSize: '0.85rem' }}>Est. recovery: {formatCurrency(s.estimatedRecovery)}</span>}
                <Badge label={s.status} color="#5C6AE0" bg="#E8E9FF" />
              </DxcFlex>
            </DxcFlex>
            <p style={{ margin: '8px 0 4px', fontSize: '0.8rem', color: '#333' }}>{s.description}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#555' }}><strong>Recommended action:</strong> {s.recommendedAction}</p>
          </div>
        ))}
      </DxcFlex>
    </div>
  );
};

const BenchmarkPanel = ({ bd }) => {
  if (!bd) return null;
  const ct = bd.cycleTime || {};
  const statusColor = { 'On Track': '#37A526', 'At Risk': '#F6921E', 'Exceeding': '#5C6AE0', 'In Range': '#37A526' };
  return (
    <div style={card()}>
      <DxcFlex direction="column" gap="14px">
        {sectionTitle('bar_chart', 'External Benchmarking')}
        {/* Cycle time bar */}
        <div>
          <DxcFlex justifyContent="space-between" alignItems="center" gap="8px">
            <DxcTypography fontSize="0.75rem" fontWeight="600" color="#555">CLAIM CYCLE TIME</DxcTypography>
            <Badge label={ct.status || 'On Track'} color={statusColor[ct.status] || '#37A526'} bg={ct.status === 'At Risk' ? '#FEF1E8' : ct.status === 'Exceeding' ? '#E8E9FF' : '#E8F5E3'} />
          </DxcFlex>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
            {[
              { label: 'This Claim', value: `${ct.current ?? '—'} days`, highlight: true },
              { label: 'Carrier Average', value: `${ct.carrierAvg ?? '—'} days` },
              { label: 'Industry Average', value: `${ct.industryAvg ?? '—'} days` }
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center', padding: '8px', backgroundColor: m.highlight ? '#E8E9FF' : '#F5F5F5', borderRadius: '6px', border: m.highlight ? '1px solid #5C6AE0' : '1px solid #E0E0E0' }}>
                <DxcTypography fontSize="0.7rem" color="#666">{m.label}</DxcTypography>
                <DxcTypography fontWeight="700" fontSize="0.95rem" color={m.highlight ? '#5C6AE0' : '#333'}>{m.value}</DxcTypography>
              </div>
            ))}
          </div>
        </div>
        {/* Similar claims */}
        {bd.similarClaims && (
          <div>
            <DxcTypography fontSize="0.75rem" fontWeight="600" color="#555">SIMILAR CLAIMS BENCHMARK ({bd.similarClaims.count?.toLocaleString()} claims)</DxcTypography>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginTop: '8px' }}>
              {[
                { label: 'Avg Cycle Time', value: `${bd.similarClaims.avgCycleTime} days` },
                { label: 'Avg Settlement', value: formatCurrency(bd.similarClaims.avgSettlement) },
                { label: 'Subrogation Rate', value: bd.similarClaims.subrogationRate },
                { label: 'Fraud Rate', value: bd.similarClaims.fraudRate }
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#F5F5F5', borderRadius: '4px' }}>
                  <DxcTypography fontSize="0.75rem" color="#666">{m.label}</DxcTypography>
                  <DxcTypography fontSize="0.75rem" fontWeight="600" color="#333">{m.value}</DxcTypography>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Insights */}
        {bd.insights?.length > 0 && (
          <div>
            <DxcTypography fontSize="0.75rem" fontWeight="600" color="#555">BENCHMARK INSIGHTS</DxcTypography>
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {bd.insights.map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span className="material-icons" style={{ fontSize: '14px', color: '#5C6AE0', marginTop: '2px', flexShrink: 0 }}>insights</span>
                  <DxcTypography fontSize="0.78rem" color="#333">{ins}</DxcTypography>
                </div>
              ))}
            </div>
          </div>
        )}
      </DxcFlex>
    </div>
  );
};

const AuditFindings = ({ findings }) => {
  const open = (findings || []).filter(f => f.status === 'Open');
  return (
    <div style={card()}>
      <DxcFlex direction="column" gap="12px">
        <DxcFlex justifyContent="space-between" alignItems="center">
          {sectionTitle('fact_check', 'Real-Time Claim Audit')}
          {open.length > 0 && <Badge label={`${open.length} open finding${open.length > 1 ? 's' : ''}`} color="#D02E2E" bg="#FFEBEE" />}
        </DxcFlex>
        {!findings?.length ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#E8F5E3', borderRadius: '6px' }}>
            <span className="material-icons" style={{ fontSize: '16px', color: '#37A526' }}>check_circle</span>
            <DxcTypography fontSize="0.82rem" color="#37A526">No audit findings. Claim handling is consistent with workflow guidelines.</DxcTypography>
          </div>
        ) : findings.map(f => (
          <div key={f.id} style={{ border: `1px solid ${SEV_COLOR[f.severity] || '#ccc'}`, borderRadius: '6px', padding: '12px', backgroundColor: f.status === 'Open' ? (SEV_BG[f.severity] || '#fff') : '#F5F5F5' }}>
            <DxcFlex justifyContent="space-between" alignItems="flex-start" wrap="wrap" gap="6px">
              <DxcFlex gap="6px" alignItems="center">
                <Badge label={f.severity} color={SEV_COLOR[f.severity]} bg={SEV_BG[f.severity]} />
                <span style={{ fontSize: '0.72rem', color: '#888', backgroundColor: '#F0F0F0', borderRadius: '10px', padding: '1px 8px' }}>{f.stage}</span>
                <span style={{ fontSize: '0.72rem', color: '#888', backgroundColor: '#F0F0F0', borderRadius: '10px', padding: '1px 8px' }}>{f.category}</span>
              </DxcFlex>
              <DxcFlex gap="6px" alignItems="center">
                <span style={{ fontSize: '0.7rem', color: '#888' }}>Detected {fmt(f.detectedAt)}</span>
                <Badge label={f.status} color={f.status === 'Open' ? '#D02E2E' : '#37A526'} bg={f.status === 'Open' ? '#FFEBEE' : '#E8F5E3'} />
              </DxcFlex>
            </DxcFlex>
            <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#333' }}>{f.finding}</p>
          </div>
        ))}
      </DxcFlex>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────

const SECTIONS = [
  { id: 'summary',      label: 'Intelligence Summary', icon: 'summarize' },
  { id: 'actions',      label: 'Next Best Actions',    icon: 'recommend' },
  { id: 'fraud',        label: 'Fraud Signals',        icon: 'gpp_maybe' },
  { id: 'leakage',      label: 'Leakage Detection',    icon: 'leak_add' },
  { id: 'subrogation',  label: 'Subrogation',          icon: 'currency_exchange' },
  { id: 'benchmark',    label: 'Benchmarking',         icon: 'bar_chart' },
  { id: 'audit',        label: 'Audit Findings',       icon: 'fact_check' }
];

// Build a minimal guardian-insights shell for P&C claims that have no pre-built guardianInsights
const buildPCGuardianShell = (claim) => {
  const alerts = claim?.aiInsights?.alerts || [];
  const hasHigh = alerts.some(a => ['High', 'Critical'].includes(a.severity));
  const hasMed  = alerts.some(a => a.severity === 'Medium');
  return {
    lastAnalyzed:            new Date().toISOString(),
    overallRisk:             hasHigh ? 'High' : hasMed ? 'Medium' : 'Low',
    leakageExposure:         0,
    claimSummary:            null,
    fraudSignals:            { score: claim?.aiInsights?.riskScore || 0, signals: [] },
    leakageIndicators:       [],
    subrogationOpportunities:[],
    benchmarkData:           null,
    nextBestActions:         [],
    auditFindings:           [],
  };
};

const ClaimGuardianPanel = ({ claimData }) => {
  const [activeSection, setActiveSection] = useState('summary');
  const gi = claimData?.guardianInsights || buildPCGuardianShell(claimData);

  const nbaUrgent = (gi.nextBestActions || []).filter(a => a.urgency === 'Immediate').length;
  const fraudHigh  = (gi.fraudSignals?.signals || []).filter(s => s.severity === 'High' || s.severity === 'Critical').length;
  const auditOpen  = (gi.auditFindings || []).filter(f => f.status === 'Open').length;

  const getBadge = (id) => {
    if (id === 'actions' && nbaUrgent > 0) return nbaUrgent;
    if (id === 'fraud' && fraudHigh > 0) return fraudHigh;
    if (id === 'audit' && auditOpen > 0) return auditOpen;
    if (id === 'leakage' && gi.leakageIndicators?.length > 0) return gi.leakageIndicators.length;
    if (id === 'subrogation' && gi.subrogationOpportunities?.length > 0) return gi.subrogationOpportunities.length;
    return null;
  };

  return (
    <DxcFlex direction="column" gap="16px">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="material-icons" style={{ fontSize: '24px', color: '#5C6AE0' }}>shield</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1A1A2E', lineHeight: 1.2 }}>Claim Guardian</span>
          <span style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.3 }}>Continuous claim intelligence &amp; oversight</span>
        </div>
      </div>

      {/* Risk summary bar */}
      <SummaryBar gi={gi} />

      {/* Section nav — scrollable single-row tab bar */}
      <div style={{
        overflowX: 'auto',
        overflowY: 'visible',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        borderBottom: '2px solid #E8E8E8',
        marginBottom: '-2px'
      }}
        className="cg-tabs-scroll"
      >
        <div style={{ display: 'flex', gap: '0', minWidth: 'max-content' }}>
          {SECTIONS.map(sec => {
            const badge = getBadge(sec.id);
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 16px',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #1B75BB' : '2px solid transparent',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: isActive ? '#1B75BB' : '#555',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  flexShrink: 0
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#1B75BB'; e.currentTarget.style.backgroundColor = '#F0F6FB'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#555'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
              >
                <span className="material-icons" style={{ fontSize: '15px' }}>{sec.icon}</span>
                {sec.label}
                {badge != null && (
                  <span style={{
                    backgroundColor: isActive ? '#1B75BB' : '#D02E2E',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '0 6px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    minWidth: '18px',
                    textAlign: 'center',
                    lineHeight: '16px',
                    display: 'inline-block'
                  }}>{badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section content */}
      <div>
        {activeSection === 'summary'     && <IntelligenceSummary s={gi.claimSummary} claimData={claimData} />}
        {activeSection === 'actions'     && <NextBestActions actions={gi.nextBestActions} />}
        {activeSection === 'fraud'       && <FraudSignals fs={gi.fraudSignals} />}
        {activeSection === 'leakage'     && <LeakageIndicators items={gi.leakageIndicators} />}
        {activeSection === 'subrogation' && <SubrogationPanel items={gi.subrogationOpportunities} />}
        {activeSection === 'benchmark'   && <BenchmarkPanel bd={gi.benchmarkData} />}
        {activeSection === 'audit'       && <AuditFindings findings={gi.auditFindings} />}
      </div>
    </DxcFlex>
  );
};

export default ClaimGuardianPanel;
