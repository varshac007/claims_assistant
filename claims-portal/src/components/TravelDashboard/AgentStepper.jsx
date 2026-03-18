import { useState, useEffect, useContext, createContext } from 'react';
import MuiIcon from '@mui/material/Icon';

/* ─── Breakpoint hook & context ─────────────────────────────── */
const BpCtx = createContext({ isMobile: false, isTablet: false });
const useBp  = () => useContext(BpCtx);
const useBreakpoint = () => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return { isMobile: w < 640, isTablet: w < 1024 };
};

/* ─── Design tokens ─────────────────────────────────────────── */
const T    = '#0D7A5F';
const TL   = '#EAF5F1';
const BDR  = '#E2E4E8';
const BG   = '#F4F6F9';
const TXT  = '#1A1A2E';
const T2   = '#58595B';
const W    = '#FFFFFF';
const DONE = '#2E7D32';
const WARN = '#E57C00';

/* ─── Step definitions ──────────────────────────────────────── */
const STEPS = [
  { id:1, label:'Trip\nOverview'          },
  { id:2, label:'Incident\nReport'        },
  { id:3, label:'Coverage\nVerification'  },
  { id:4, label:'Eligibility\nReview'     },
  { id:5, label:'Document\nReview'        },
  { id:6, label:'Settlement\nCalculation' },
  { id:7, label:'Decision'                },
  { id:8, label:'Payment &\nClose'        },
];

/* ─── Primitives ────────────────────────────────────────────── */
const Icon = ({ n, size=18, color, style={} }) => (
  <MuiIcon style={{ fontSize:size, color, lineHeight:1, flexShrink:0, ...style }}>{n}</MuiIcon>
);

const Chip = ({ label, icon, color=W, bg=T }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600, color, background:bg, whiteSpace:'nowrap' }}>
    {icon && <Icon n={icon} size={13} color={color} />}{label}
  </span>
);

const Card = ({ children, style={}, pad=20 }) => (
  <div style={{ background:W, borderRadius:12, border:`1px solid ${BDR}`, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', padding:pad, ...style }}>
    {children}
  </div>
);

const SecTitle = ({ children, icon }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:700, color:T, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 }}>
    {icon && <Icon n={icon} size={15} color={T} />}{children}
  </div>
);

const InfoRow = ({ label, value, mono, highlight }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:8 }}>
    <span style={{ fontSize:13, color:T2, flexShrink:0 }}>{label}</span>
    <span style={{ fontSize:13, fontWeight:600, color:highlight||TXT, textAlign:'right', fontFamily:mono?'monospace':'inherit' }}>{value}</span>
  </div>
);

const Hr = () => <div style={{ borderTop:`1px solid ${BDR}`, margin:'16px 0' }} />;

const Check = ({ label, done=true, warn=false }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:done?'#F0FBF7':warn?'#FFF8F0':BG, borderRadius:8, marginBottom:8, border:`1px solid ${done?'#B2DFDB':warn?'#FFD9A0':BDR}` }}>
    <Icon n={done?'check_circle':warn?'warning':'radio_button_unchecked'} size={18} color={done?DONE:warn?WARN:BDR} />
    <span style={{ fontSize:13, color:done?TXT:warn?WARN:T2, fontWeight:done?500:400 }}>{label}</span>
    <div style={{ marginLeft:'auto' }}>
      <Chip label={done?'Verified':warn?'Review':'Pending'} bg={done?'#E8F5E9':warn?'#FFF4E5':'#F0F0F0'} color={done?DONE:warn?WARN:T2} />
    </div>
  </div>
);

/* ─── Stepper header ────────────────────────────────────────── */
function StepHeader({ step, onStepClick }) {
  const { isMobile, isTablet } = useBp();

  /* Mobile compact bar */
  if (isMobile) {
    const currentStep = STEPS[step];
    const label = currentStep.label.replace('\n', ' ');
    return (
      <div style={{ background:W, borderBottom:`1px solid ${BDR}`, padding:'14px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:12, color:T2 }}>Step {step+1} of {STEPS.length}</span>
          <span style={{ fontSize:13, fontWeight:700, color:T }}>{label}</span>
          <div style={{ display:'flex', gap:4 }}>
            {STEPS.map((_,i) => (
              <div key={i} onClick={() => i <= step && onStepClick(i)}
                style={{ width: i===step ? 18 : 6, height:6, borderRadius:20, background: i===step?T:i<step?T2:BDR, cursor: i<=step?'pointer':'default', transition:'all 0.2s' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:W, borderBottom:`1px solid ${BDR}`, padding:'20px 32px 0', overflowX: isTablet ? 'auto' : 'visible' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'center', minWidth: isTablet ? 600 : 'auto' }}>
        {STEPS.map((s, i) => {
          const isDone    = i < step;
          const isActive  = i === step;
          return (
            <div key={s.id} style={{ display:'flex', alignItems:'flex-start', flex: i < STEPS.length-1 ? 1 : 'none' }}>
              {/* Step circle + label */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', minWidth: isTablet ? 52 : 60 }}
                onClick={() => isDone && onStepClick(i)}>
                <div style={{
                  width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  background: isDone ? DONE : isActive ? T : '#E0E0E0',
                  border: isActive ? `3px solid ${T}` : isDone ? `3px solid ${DONE}` : '3px solid #E0E0E0',
                  color: W, fontSize:14, fontWeight:700,
                  boxShadow: isActive ? `0 0 0 4px ${TL}` : 'none',
                  transition:'all 0.2s ease',
                }}>
                  {isDone
                    ? <Icon n="check" size={18} color={W} />
                    : <span style={{ fontSize:13, fontWeight:700 }}>{s.id}</span>
                  }
                </div>
                <div style={{ marginTop:8, textAlign:'center', paddingBottom:12 }}>
                  {s.label.split('\n').map((line, li) => (
                    <div key={li} style={{ fontSize: isTablet ? 10 : 11, fontWeight: isActive ? 700 : 400, color: isActive ? T : isDone ? DONE : T2, lineHeight:1.4 }}>{line}</div>
                  ))}
                </div>
                {/* Active underline */}
                {isActive && <div style={{ height:3, width:'100%', background:T, borderRadius:'2px 2px 0 0', marginTop:2 }} />}
              </div>

              {/* Connector line */}
              {i < STEPS.length-1 && (
                <div style={{ flex:1, height:3, background: isDone ? DONE : '#E0E0E0', marginTop:17, borderRadius:2, transition:'background 0.3s' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 0 — Trip Overview
═══════════════════════════════════════════════════════════════ */
function StepTripOverview({ claim }) {
  const { isTablet } = useBp();
  return (
    <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:20, flex:1, minHeight:0, alignItems:'stretch' }}>
      {/* Flight card (dark, like screenshot) */}
      <div style={{ background:'linear-gradient(135deg, #1A2A3A 0%, #0D3A5C 100%)', borderRadius:16, padding:24, color:W }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:4 }}>{claim.destination}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:18, fontWeight:700 }}>
              <Icon n="flight" size={20} color="#FFD700" />
              {claim.airline} · {claim.flightNumber?.split('/')[0]?.trim() || 'SB201'}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <Chip label={claim.status} bg="rgba(255,255,255,0.15)" color={W} />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
          {[
            { label:'Departure', value:'14:10' },
            { label:'Arrival',   value:'22:20' },
            { label:'Terminal',  value:'T3'    },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginBottom:4 }}>{f.label}</div>
              <div style={{ fontSize:20, fontWeight:700 }}>{f.value}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>Coverage</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['Lost Baggage','Travel Delay','Medical','Add. Transport'].map(c => (
            <span key={c} style={{ padding:'5px 12px', borderRadius:20, background:'rgba(255,255,255,0.15)', fontSize:12, fontWeight:600, color:W, border:'1px solid rgba(255,255,255,0.2)' }}>{c}</span>
          ))}
        </div>
      </div>

      {/* Customer & policy */}
      <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
        <Card>
          <SecTitle icon="person">Customer</SecTitle>
          <InfoRow label="Name"          value={claim.customer} />
          <InfoRow label="Policy No."    value={claim.policy} mono />
          <InfoRow label="Plan"          value={claim.plan} />
          <InfoRow label="Destination"   value={claim.destination} />
          <InfoRow label="Travel Period" value="12 Jan – 25 Jan 2025" />
        </Card>

        <div style={{ background:'#F0FBF7', border:`1px solid ${T}`, borderRadius:12, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:DONE, marginTop:4, flexShrink:0, boxShadow:`0 0 0 3px rgba(46,125,50,0.2)` }} />
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:T, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Live Trip Monitoring</div>
            <div style={{ display:'flex', gap:16 }}>
              {[{icon:'flight',label:'Flight Status'},{icon:'cloud',label:'Weather Systems'},{icon:'location_on',label:'Airport Status'}].map(m => (
                <div key={m.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:T }}>
                  <Icon n={m.icon} size={14} color={T} />{m.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 1 — Incident Report
═══════════════════════════════════════════════════════════════ */
function StepIncidentReport({ claim }) {
  const { isTablet } = useBp();
  return (
    <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:20, flex:1, minHeight:0, alignItems:'stretch' }}>
      <Card>
        <SecTitle icon="report_problem">Incident Details</SecTitle>
        <div style={{ background:BG, borderRadius:8, padding:'14px 16px', fontSize:13, color:TXT, lineHeight:1.75, marginBottom:16 }}>
          <strong style={{ color:T }}>Customer Statement:</strong><br />
          "I checked in two bags at Singapore Changi Airport for my flight to Paris via London. Upon arrival at CDG, neither bag appeared on the baggage carousel. I immediately filed a Property Irregularity Report with SkyBridge Air at the airport."
        </div>
        <InfoRow label="Incident Type"   value={claim.type} />
        <InfoRow label="Date Reported"   value="15 Jan 2025" />
        <InfoRow label="Location"        value="London Heathrow (LHR)" />
        <InfoRow label="Bags Affected"   value="2 checked bags (28 kg)" />
        <InfoRow label="PIR Reference"   value="LHR-SB-PIR-2025-00318" mono />
        <InfoRow label="PIR Filed Date"  value="13 Jan 2025" />
      </Card>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Card>
          <SecTitle icon="timeline">Incident Timeline</SecTitle>
          {[
            { time:'12 Jan, 14:10', event:'Departed Singapore (SIN) on SB201' },
            { time:'12 Jan, 22:20', event:'Arrived London Heathrow (LHR)' },
            { time:'13 Jan, 08:45', event:'Departed LHR on SB408 to Paris CDG' },
            { time:'13 Jan, 11:30', event:'Arrived Paris CDG — bags not on carousel' },
            { time:'13 Jan, 12:15', event:'PIR filed with SkyBridge Air at CDG' },
            { time:'15 Jan, 09:42', event:'Claim submitted via online portal' },
          ].map((ev,i) => (
            <div key={i} style={{ display:'flex', gap:12, paddingBottom:12, borderBottom: i<5 ? `1px solid ${BDR}` : 'none', marginBottom: i<5 ? 12 : 0 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:T, marginTop:5, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:11, color:T2, marginBottom:2 }}>{ev.time}</div>
                <div style={{ fontSize:13, color:TXT }}>{ev.event}</div>
              </div>
            </div>
          ))}
        </Card>
        <div style={{ background:'#EEF5FF', border:'1px solid #BBDEFB', borderRadius:10, padding:'14px 16px' }}>
          <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
            <Icon n="verified" size={18} color="#1B75BB" style={{ marginTop:1 }} />
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#0D47A1', marginBottom:4 }}>Airline Confirmation</div>
              <div style={{ fontSize:12, color:'#1565C0', lineHeight:1.6 }}>SkyBridge Air has confirmed delayed baggage status via API. Last scan: LHR T5, 13 Jan 14:22 UTC. Tracer active — bags not located as of today.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2 — Coverage Verification
═══════════════════════════════════════════════════════════════ */
function StepCoverageVerification({ claim }) {
  const { isTablet } = useBp();
  return (
    <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:20, flex:1, minHeight:0, alignItems:'stretch' }}>
      <Card style={{ height:'100%', boxSizing:'border-box' }}>
        <SecTitle icon="policy">Policy Verification</SecTitle>
        <Check label="Policy was active at date of loss (13 Jan 2025)" done />
        <Check label="Customer is the named insured on the policy" done />
        <Check label="Destination covered under Worldwide plan" done />
        <Check label="Baggage loss is a covered peril under this plan" done />
        <Check label="Loss occurred during the covered trip period" done />
        <Check label="No policy exclusions apply to this claim" done />
        <Hr />
        <InfoRow label="Policy Number"    value={claim.policy} mono />
        <InfoRow label="Plan Type"        value={claim.plan} />
        <InfoRow label="Policy Status"    value="Active" highlight={DONE} />
        <InfoRow label="Coverage Period"  value="12 Jan – 25 Jan 2025" />
        <InfoRow label="Baggage Limit"    value={`$${claim.limit.toLocaleString()}`} />
        <InfoRow label="Deductible"       value="$0 (waived under this plan)" />
      </Card>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Card>
          <SecTitle icon="shield">Coverage Breakdown</SecTitle>
          {[
            { label:'Baggage Loss',        limit:'$1,500', status:'Applicable',    color:DONE  },
            { label:'Baggage Delay',       limit:'$400',   status:'N/A',           color:T2    },
            { label:'Medical Expenses',    limit:'$50,000',status:'N/A',           color:T2    },
            { label:'Trip Cancellation',   limit:'$8,000', status:'N/A',           color:T2    },
            { label:'Travel Accident',     limit:'$25,000',status:'N/A',           color:T2    },
          ].map((cov,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i<4 ? `1px solid ${BDR}` : 'none' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:TXT }}>{cov.label}</div>
                <div style={{ fontSize:11, color:T2 }}>Limit: {cov.limit}</div>
              </div>
              <Chip label={cov.status} bg={cov.status==='Applicable'?TL:BG} color={cov.color} />
            </div>
          ))}
        </Card>
        <div style={{ background:'#E8F5E9', border:'1px solid #A5D6A7', borderRadius:10, padding:'14px 16px', display:'flex', gap:10 }}>
          <Icon n="check_circle" size={20} color={DONE} style={{ marginTop:1 }} />
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#1B5E20', marginBottom:4 }}>Coverage Confirmed</div>
            <div style={{ fontSize:12, color:'#2E7D32', lineHeight:1.6 }}>All coverage checks passed. Claim is eligible for assessment under the Baggage Loss benefit ($1,500 limit).</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 3 — Eligibility Review
═══════════════════════════════════════════════════════════════ */
function StepEligibilityReview({ claim }) {
  const { isTablet } = useBp();
  return (
    <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 320px', gap:20, flex:1, minHeight:0, alignItems:'stretch' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
        <Card>
          <SecTitle icon="fact_check">Eligibility Criteria</SecTitle>
          <Check label="PIR filed within 7 days of arrival" done />
          <Check label="Claim submitted within policy claim window (30 days)" done />
          <Check label="Claimant identity verified (passport on file)" done />
          <Check label="Loss not caused by excluded peril (war, confiscation)" done />
          <Check label="Items claimed are covered personal belongings" done warn={false} />
          <Check label="One electronics item — receipt not provided for full value" done={false} warn />
          <Check label="No duplicate claim submitted for the same incident" done />
        </Card>
        <Card>
          <SecTitle icon="bar_chart">Risk Assessment</SecTitle>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { label:'Claim Frequency', value:'Low',     color:DONE, bg:'#E8F5E9' },
              { label:'Fraud Risk Score',value:'12%',     color:DONE, bg:'#E8F5E9' },
              { label:'Prior Claims',    value:`${claim.priorClaims} claim`, color:WARN, bg:'#FFF4E5' },
              { label:'Pattern',         value:'Normal',  color:DONE, bg:'#E8F5E9' },
            ].map((r,i) => (
              <div key={i} style={{ background:BG, borderRadius:8, padding:'12px 14px', border:`1px solid ${BDR}` }}>
                <div style={{ fontSize:11, color:T2, marginBottom:6 }}>{r.label}</div>
                <Chip label={r.value} color={r.color} bg={r.bg} />
              </div>
            ))}
          </div>
          <div style={{ marginTop:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:12, color:T2, fontWeight:600 }}>Eligibility Score</span>
              <span style={{ fontSize:12, fontWeight:700, color:T }}>87 / 100</span>
            </div>
            <div style={{ background:BDR, borderRadius:20, height:10, overflow:'hidden' }}>
              <div style={{ width:'87%', height:'100%', background:`linear-gradient(90deg, ${T}, #16A87E)`, borderRadius:20 }} />
            </div>
            <div style={{ fontSize:11, color:T2, marginTop:4 }}>Eligible — minor documentation gap on electronics receipt</div>
          </div>
        </Card>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Card>
          <SecTitle icon="insights">Eligibility Summary</SecTitle>
          <div style={{ background:TL, border:`1px solid ${T}`, borderRadius:8, padding:'12px 14px', marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T, marginBottom:4 }}>Eligible for Assessment</div>
            <div style={{ fontSize:12, color:TXT, lineHeight:1.65 }}>
              Claim meets all primary eligibility criteria. One minor gap: electronics receipt not provided — depreciation will be applied and item partially downgraded.
            </div>
          </div>
          <InfoRow label="Eligibility Score" value="87%" highlight={T} />
          <InfoRow label="STP Eligible"      value="No — value threshold" />
          <InfoRow label="Processing Route"  value="Manual Assessment" />
          <InfoRow label="Examiner"          value="Sarah Wong" />
        </Card>
        <Card>
          <SecTitle icon="note_alt">Examiner Note</SecTitle>
          <div style={{ background:BG, borderRadius:8, padding:'12px 14px', fontSize:13, color:TXT, lineHeight:1.65 }}>
            Claim history and travel pattern are consistent with the customer profile. Eligibility confirmed. Proceed to document review.
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 4 — Document Review
═══════════════════════════════════════════════════════════════ */
function DocPreviewModal({ doc, onClose }) {
  const { isMobile } = useBp();
  if (!doc) return null;
  const previews = {
    'Property Irregularity Report (PIR)': { lines: ['Reference: LHR-SB-PIR-2025-00318', 'Date Filed: 13 Jan 2025', 'Airline: SkyBridge Air', 'Station: London Heathrow (LHR)', 'Passenger: Aiden Lim', 'Bags Affected: 2 × checked (28 kg)', 'Last Known Scan: LHR T5 — 13 Jan 14:22 UTC', 'Tracer Status: Active — not located'] },
    'Boarding Pass — SB201 SIN→LHR':      { lines: ['Flight: SB201', 'Route: Singapore (SIN) → London (LHR)', 'Date: 12 Jan 2025', 'Departure: 14:10', 'Seat: 34A', 'Bags Checked: 2', 'Passenger: AIDEN LIM'] },
    'Boarding Pass — SB408 LHR→CDG':      { lines: ['Flight: SB408', 'Route: London (LHR) → Paris (CDG)', 'Date: 13 Jan 2025', 'Departure: 08:45', 'Seat: 22C', 'Bags Checked: 2 (tagged through)', 'Passenger: AIDEN LIM'] },
    'Clothing — H&M / Zara receipts':     { lines: ['H&M Singapore — $320 — Nov 2024', 'Zara Singapore — $280 — Nov 2024', 'Items: Jackets, shirts, trousers', 'Total Receipts Value: $600', 'Depreciation Rate Applied: 8%', 'Net Approved: $550'] },
    'Toiletries — pharmacy receipt':       { lines: ['Guardian Pharmacy — $200 — Dec 2024', 'Items: Skincare, toiletries kit, medication', 'Total: $200.00', 'No depreciation applied (consumables)'] },
    'Customer Statement of Loss':          { lines: ['Submitted: 15 Jan 2025', 'Channel: Online Portal', '"I checked in two bags at Singapore Changi for my flight to Paris via London. Upon arrival at CDG, neither bag appeared. I filed a PIR with SkyBridge Air immediately."', 'Signed & submitted by: Aiden Lim'] },
    'Passport Copy (identity)':            { lines: ['Document Type: Singapore Passport', 'Number: E7823XXXX', 'Expiry: 2030', 'Identity Verified: ✓', 'Matches policy holder record: ✓'] },
  };
  const content = previews[doc.name];
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}>
      <div style={{ background:W, borderRadius:14, width: isMobile ? '95vw' : 480, maxWidth:'95vw', maxHeight: isMobile ? '90vh' : 'none', overflowY: isMobile ? 'auto' : 'visible', boxShadow:'0 8px 32px rgba(0,0,0,0.22)', overflow:'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ background:'#1A2A3A', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Icon n={doc.icon} size={18} color={W} />
            <span style={{ fontSize:14, fontWeight:700, color:W }}>{doc.name}</span>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center' }}>
            <Icon n="close" size={20} color="rgba(255,255,255,0.6)" />
          </button>
        </div>
        <div style={{ padding:'20px' }}>
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            <Chip label={doc.type}   bg={BG}        color={T2} />
            <Chip label={doc.status} bg={doc.bg}    color={doc.color} />
            {doc.date !== '—' && <Chip label={doc.date} bg={BG} color={T2} />}
          </div>
          <div style={{ background:BG, borderRadius:8, padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
            {content ? content.lines.map((line, i) => (
              <div key={i} style={{ fontSize:13, color:TXT, lineHeight:1.6, borderBottom: i < content.lines.length-1 ? `1px solid ${BDR}` : 'none', paddingBottom: i < content.lines.length-1 ? 7 : 0 }}>{line}</div>
            )) : <div style={{ fontSize:13, color:T2 }}>Document content not available for preview.</div>}
          </div>
          <div style={{ marginTop:14, display:'flex', justifyContent:'flex-end' }}>
            <button onClick={onClose} style={{ padding:'8px 20px', background:T, color:W, border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepDocumentReview() {
  const { isTablet } = useBp();
  const [viewingDoc,    setViewingDoc]    = useState(null);
  const [requestedDocs, setRequestedDocs] = useState(new Set());

  const docs = [
    { name:'Property Irregularity Report (PIR)', type:'Airline Report',  status:'Verified',  date:'13 Jan 2025', icon:'description',     color:DONE, bg:'#E8F5E9' },
    { name:'Boarding Pass — SB201 SIN→LHR',      type:'Travel Document', status:'Verified',  date:'12 Jan 2025', icon:'confirmation_number', color:DONE, bg:'#E8F5E9' },
    { name:'Boarding Pass — SB408 LHR→CDG',      type:'Travel Document', status:'Verified',  date:'13 Jan 2025', icon:'confirmation_number', color:DONE, bg:'#E8F5E9' },
    { name:'Clothing — H&M / Zara receipts',     type:'Purchase Receipt', status:'Verified',  date:'Nov 2024',   icon:'receipt',          color:DONE, bg:'#E8F5E9' },
    { name:'Electronics — Laptop (Dell XPS)',     type:'Purchase Receipt', status:'Missing',   date:'—',           icon:'laptop',           color:WARN, bg:'#FFF4E5' },
    { name:'Toiletries — pharmacy receipt',      type:'Purchase Receipt', status:'Verified',  date:'Dec 2024',   icon:'receipt',          color:DONE, bg:'#E8F5E9' },
    { name:'Customer Statement of Loss',         type:'Declaration',     status:'Verified',  date:'15 Jan 2025', icon:'edit_note',        color:DONE, bg:'#E8F5E9' },
    { name:'Passport Copy (identity)',           type:'Identity',        status:'Verified',  date:'On file',     icon:'badge',            color:DONE, bg:'#E8F5E9' },
  ];

  return (
    <>
      {viewingDoc && <DocPreviewModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
    <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 300px', gap:20, flex:1, minHeight:0, alignItems:'stretch' }}>
      <Card pad={0} style={{ display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 20px', borderBottom:`1px solid ${BDR}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <span style={{ fontSize:14, fontWeight:700, color:TXT }}>Supporting Documents</span>
          <div style={{ display:'flex', gap:8 }}>
            <Chip label={`${docs.filter(d=>d.status==='Verified').length} Verified`} icon="check_circle" bg="#E8F5E9" color={DONE} />
            <Chip label={`${docs.filter(d=>d.status==='Missing').length} Missing`}   icon="warning"      bg="#FFF4E5" color={WARN} />
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
          <thead>
            <tr style={{ background:BG }}>
              {['Document','Type','Date','Status','Action'].map(h => (
                <th key={h} style={{ padding:'9px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:T2, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${BDR}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.map((d,i) => {
              const isRequested = requestedDocs.has(d.name);
              return (
                <tr key={i} style={{ borderBottom:`1px solid ${BDR}`, background: d.status==='Missing'?'#FFFDF0':W }}>
                  <td style={{ padding:'11px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Icon n={d.icon} size={16} color={d.color} />
                      <span style={{ fontSize:13, fontWeight:500, color:TXT }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'11px 16px', fontSize:12, color:T2 }}>{d.type}</td>
                  <td style={{ padding:'11px 16px', fontSize:12, color:T2 }}>{d.date}</td>
                  <td style={{ padding:'11px 16px' }}><Chip label={d.status} color={d.color} bg={d.bg} /></td>
                  <td style={{ padding:'11px 16px' }}>
                    {d.status === 'Missing' ? (
                      isRequested
                        ? <Chip label="Requested" icon="check" bg="#E8F5E9" color={DONE} />
                        : <button onClick={() => setRequestedDocs(prev => new Set([...prev, d.name]))}
                            style={{ fontSize:12, color:WARN, background:'transparent', border:`1px solid ${WARN}`, borderRadius:6, padding:'4px 10px', cursor:'pointer' }}>
                            Request
                          </button>
                    ) : (
                      <button onClick={() => setViewingDoc(d)}
                        style={{ fontSize:12, color:T, background:'transparent', border:`1px solid ${T}`, borderRadius:6, padding:'4px 10px', cursor:'pointer' }}>
                        View
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </Card>
      <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
        <Card style={{ flex:1 }}>
          <SecTitle icon="summarize">Document Summary</SecTitle>
          <InfoRow label="Total Required"  value="8 documents" />
          <InfoRow label="Verified"        value="7 / 8" highlight={DONE} />
          <InfoRow label="Missing"         value="1 (electronics receipt)" highlight={WARN} />
          <Hr />
          <div style={{ background:'#FFF4E5', border:'1px solid #FFD9A0', borderRadius:8, padding:'12px 14px' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#8C4D00', marginBottom:4 }}>Action Required</div>
            <div style={{ fontSize:12, color:'#8C4D00', lineHeight:1.6 }}>
              Electronics receipt not provided. Laptop (Dell XPS) will be assessed with 25% depreciation applied to declared value of $400.
            </div>
          </div>
        </Card>
        <Card>
          <SecTitle icon="analytics">IDP Classification</SecTitle>
          {[
            { label:'PIR Report',      score:'97%' },
            { label:'Boarding Passes', score:'99%' },
            { label:'Receipts',        score:'94%' },
            { label:'Statement',       score:'96%' },
          ].map((d,i) => (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, color:T2 }}>{d.label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:T }}>{d.score}</span>
              </div>
              <div style={{ background:BDR, borderRadius:20, height:6 }}>
                <div style={{ width:d.score, height:'100%', background:T, borderRadius:20 }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 5 — Settlement Calculation
═══════════════════════════════════════════════════════════════ */
function StepSettlement() {
  const { isTablet } = useBp();
  const items = [
    { name:'Clothing & Apparel',        claimed:600, rate:8,  approved:550, basis:'Depreciation 8% — receipts verified' },
    { name:'Electronics (Laptop)',       claimed:400, rate:25, approved:300, basis:'Depreciation 25% — receipt not provided' },
    { name:'Toiletries & Personal Care', claimed:200, rate:0,  approved:200, basis:'Approved in full — within sub-limit' },
  ];
  const totalClaimed  = items.reduce((s,i) => s+i.claimed, 0);
  const totalApproved = items.reduce((s,i) => s+i.approved, 0);
  return (
    <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 300px', gap:20, flex:1, minHeight:0, alignItems:'stretch' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
        <Card style={{ flex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <SecTitle icon="calculate">Itemised Settlement</SecTitle>
            <Chip label="Auto-Calculated" icon="auto_awesome" bg={TL} color={T} />
          </div>
          <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:16, minWidth:500 }}>
            <thead>
              <tr style={{ background:BG }}>
                {['Item','Claimed','Depr. Rate','Basis','Approved'].map(h => (
                  <th key={h} style={{ padding:'9px 14px', textAlign:h==='Claimed'||h==='Approved'?'right':'left', fontSize:11, fontWeight:700, color:T2, textTransform:'uppercase', letterSpacing:'0.04em', borderBottom:`2px solid ${BDR}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${BDR}` }}>
                  <td style={{ padding:'13px 14px', fontSize:13, fontWeight:600, color:TXT }}>{item.name}</td>
                  <td style={{ padding:'13px 14px', textAlign:'right', fontSize:13, color:T2 }}>${item.claimed}</td>
                  <td style={{ padding:'13px 14px' }}>
                    {item.rate > 0
                      ? <Chip label={`${item.rate}%`} bg="#FFF4E5" color={WARN} />
                      : <Chip label="None" bg="#E8F5E9" color={DONE} />}
                  </td>
                  <td style={{ padding:'13px 14px', fontSize:12, color:T2, fontStyle:'italic' }}>{item.basis}</td>
                  <td style={{ padding:'13px 14px', textAlign:'right', fontSize:13, fontWeight:700, color:item.approved===item.claimed?DONE:T }}>${item.approved}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background:TL }}>
                <td colSpan={2} style={{ padding:'14px', fontSize:14, fontWeight:700, color:T }}>Total</td>
                <td />
                <td style={{ padding:'14px', fontSize:13, color:T2, fontStyle:'italic' }}>Deduction: ${totalClaimed - totalApproved}</td>
                <td style={{ padding:'14px', textAlign:'right', fontSize:20, fontWeight:800, color:T }}>${totalApproved}</td>
              </tr>
            </tfoot>
          </table>
          </div>
          <div style={{ background:BG, borderRadius:8, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:T2 }}>Confidence Score</span>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:120, background:BDR, borderRadius:20, height:8 }}>
                <div style={{ width:'87%', height:'100%', background:T, borderRadius:20 }} />
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:T }}>87%</span>
            </div>
          </div>
        </Card>
        <Card>
          <SecTitle icon="gavel">Clauses Applied</SecTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { name:'Baggage Loss Coverage',  ok:true,  detail:'Up to $1,500 per journey for confirmed lost baggage.' },
              { name:'Depreciation Schedule',  ok:true,  detail:'Standard rates: Electronics 25%/yr, Clothing 8%/yr.' },
              { name:'Receipts Requirement',   ok:false, detail:'$400 item downgraded — receipt not submitted.' },
              { name:'Single Item Cap',        ok:true,  detail:'$500 per item — no item exceeds this limit.' },
            ].map((c,i) => (
              <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', background:BG, borderRadius:8, border:`1px solid ${BDR}` }}>
                <Icon n={c.ok?'check_circle':'info'} size={17} color={c.ok?DONE:WARN} style={{ marginTop:2 }} />
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:TXT }}>{c.name}</div>
                  <div style={{ fontSize:12, color:T2, marginTop:2 }}>{c.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Card style={{ background:`linear-gradient(135deg, ${TL}, #D0F0E8)`, border:`1px solid ${T}` }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:12, fontWeight:700, color:T, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Recommended Settlement</div>
            <div style={{ fontSize:48, fontWeight:800, color:T, lineHeight:1 }}>$1,050</div>
            <div style={{ fontSize:12, color:T2, marginTop:8 }}>of $1,200 claimed · $1,500 limit</div>
            <Hr />
            <InfoRow label="Claimed"    value="$1,200" />
            <InfoRow label="Deduction"  value="$150 (depreciation)" />
            <InfoRow label="Deductible" value="$0.00" />
          </div>
        </Card>
        <Card>
          <SecTitle icon="account_balance">Reserve Movement</SecTitle>
          <div style={{ display:'flex', gap:10, alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:11, color:T2, marginBottom:4 }}>INITIAL</div>
              <div style={{ fontSize:20, fontWeight:700, color:TXT }}>$1,200</div>
            </div>
            <Icon n="arrow_forward" size={18} color={T2} />
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:11, color:T, marginBottom:4 }}>RECOMMENDED</div>
              <div style={{ fontSize:20, fontWeight:700, color:T }}>$1,050</div>
            </div>
          </div>
          <div style={{ fontSize:12, color:T2, lineHeight:1.6 }}>Reserve reduced by $150 after applying depreciation schedule and document review.</div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 6 — Decision
═══════════════════════════════════════════════════════════════ */
function StepDecision({ decision, setDecision, customAmount, setCustomAmount }) {
  const { isTablet } = useBp();
  const [notes, setNotes] = useState('');

  const opts = [
    { id:'approve_full',    label:'Approve Full Amount',    amount:'$1,200', icon:'check_circle', color:DONE,     bg:'#E8F5E9', desc:'Approve the full claimed amount of $1,200 without depreciation.' },
    { id:'approve_partial', label:'Approve Recommended',    amount:'$1,050', icon:'check',        color:T,        bg:TL,        desc:'Approve $1,050 as recommended — depreciation applied to electronics and clothing.' },
    { id:'approve_custom',  label:'Approve Custom Amount',  amount:null,     icon:'edit',         color:'#6B3FA0',bg:'#F3EEFF', desc:'Override the recommended amount and enter a specific approved value.' },
    { id:'reject',          label:'Reject Claim',           amount:'$0',     icon:'cancel',       color:'#C62828',bg:'#FFEBEE', desc:'Reject the claim — specify reason below.' },
  ];

  const displayAmount = () => {
    if (decision === 'approve_full')    return '$1,200';
    if (decision === 'approve_partial') return '$1,050';
    if (decision === 'approve_custom')  return customAmount ? `$${customAmount}` : '—';
    return '$0';
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 320px', gap:20, flex:1, minHeight:0, alignItems:'stretch' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
        <Card style={{ flex:1 }}>
          <SecTitle icon="gavel">Claim Decision</SecTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
            {opts.map(opt => (
              <div key={opt.id}>
                <div onClick={() => setDecision(opt.id)}
                  style={{ display:'flex', gap:14, padding:'16px', borderRadius:10, border:`2px solid ${decision===opt.id?opt.color:BDR}`, background:decision===opt.id?opt.bg:W, cursor:'pointer', transition:'all 0.15s' }}>
                  <Icon n={opt.icon} size={24} color={opt.color} style={{ marginTop:2 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:TXT }}>{opt.label}</span>
                      {opt.amount !== null && <span style={{ fontSize:18, fontWeight:800, color:opt.color }}>{opt.amount}</span>}
                    </div>
                    <div style={{ fontSize:12, color:T2 }}>{opt.desc}</div>
                  </div>
                  <Icon n={decision===opt.id?'radio_button_checked':'radio_button_unchecked'} size={20} color={decision===opt.id?opt.color:BDR} style={{ flexShrink:0 }} />
                </div>
                {opt.id === 'approve_custom' && decision === 'approve_custom' && (
                  <div style={{ marginTop:8, padding:'14px 16px', background:'#FAF5FF', border:`1px solid #D8B4FE`, borderRadius:8, display:'flex', alignItems:'center', gap:12 }}>
                    <Icon n="attach_money" size={20} color='#6B3FA0' />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color:'#6B3FA0', fontWeight:600, marginBottom:6 }}>Enter approved amount (SGD)</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:16, fontWeight:700, color:'#6B3FA0' }}>$</span>
                        <input
                          type="number" min="0" max="1500" placeholder="e.g. 900"
                          value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                          style={{ flex:1, fontSize:16, fontWeight:700, color:'#6B3FA0', border:`1px solid #D8B4FE`, borderRadius:6, padding:'8px 10px', outline:'none', background:W }}
                        />
                        <span style={{ fontSize:12, color:'#6B3FA0' }}>/ $1,500 limit</span>
                      </div>
                      {customAmount && Number(customAmount) > 1500 && (
                        <div style={{ fontSize:11, color:'#C62828', marginTop:4 }}>Amount exceeds policy limit of $1,500</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <SecTitle icon="sticky_note_2">Decision Notes</SecTitle>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Add notes to support your decision — visible in the claim record and audit trail..."
            style={{ width:'100%', minHeight:100, border:`1px solid ${BDR}`, borderRadius:8, padding:'10px 12px', fontSize:13, color:TXT, resize:'vertical', fontFamily:'inherit', boxSizing:'border-box', outline:'none' }} />
        </Card>

        {decision && (
          <div style={{ background: decision==='reject'?'#FFEBEE':TL, border:`1px solid ${decision==='reject'?'#FFCDD2':T}`, borderRadius:10, padding:'14px 18px', display:'flex', gap:10 }}>
            <Icon n={decision==='reject'?'warning':'check_circle'} size={20} color={decision==='reject'?'#C62828':DONE} />
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:decision==='reject'?'#C62828':DONE, marginBottom:4 }}>
                {decision==='approve_full'   ? 'Full Approval Selected' :
                 decision==='approve_partial'? 'Partial Approval Selected ($1,050)' :
                 decision==='approve_custom' ? `Custom Approval Selected (${displayAmount()})` :
                 'Rejection Selected'}
              </div>
              <div style={{ fontSize:12, color:T2, lineHeight:1.6 }}>
                {decision==='approve_full'    ? 'Claim will be approved for the full claimed amount of $1,200. Policy limit: $1,500. Proceeds to payment.' :
                 decision==='approve_partial' ? 'Claim approved for $1,050 after depreciation. Customer will be notified of the deduction. Proceeds to payment.' :
                 decision==='approve_custom'  ? `Claim will be approved for ${displayAmount()}. Ensure this is within your authority limit and notes reflect the rationale.` :
                 'Claim will be rejected. An automated notification will be sent to the customer with the reason stated. Customer may resubmit with additional documentation.'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary sidebar */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Card>
          <SecTitle icon="receipt_long">Decision Summary</SecTitle>
          <InfoRow label="Claim Ref"     value="CLM-884210" mono />
          <InfoRow label="Customer"      value="Aiden Lim" />
          <InfoRow label="Claim Type"    value="Lost Baggage" />
          <Hr />
          <InfoRow label="Claimed"       value="$1,200.00" />
          <InfoRow label="Recommended"   value="$1,050.00" highlight={T} />
          <InfoRow label="Decision Amt"  value={displayAmount()} highlight={decision==='reject'?'#C62828':DONE} />
          <InfoRow label="Limit"         value="$1,500.00" />
          <Hr />
          <InfoRow label="Authority"     value="Up to $2,500" />
          <InfoRow label="Escalation"    value="Not required" highlight={DONE} />
        </Card>
        <Card>
          <SecTitle icon="history">Claim History</SecTitle>
          <div style={{ fontSize:13, color:T2 }}>1 prior claim in 3 years</div>
          <div style={{ marginTop:8, fontSize:12, color:TXT, lineHeight:1.6 }}>
            Previous claim (2022): Baggage delay — $180 — Approved via STP. No pattern of concern.
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 7 — Payment & Close
═══════════════════════════════════════════════════════════════ */
function StepPaymentClose({ decision, customAmount }) {
  const { isTablet } = useBp();
  const [paymentSent,   setPaymentSent]   = useState(false);
  const [recoveryInit,  setRecoveryInit]  = useState(false);
  const [rejectionSent, setRejectionSent] = useState(false);
  const amount =
    decision === 'approve_full'    ? '$1,200.00' :
    decision === 'approve_partial' ? '$1,050.00' :
    decision === 'approve_custom'  ? `$${Number(customAmount || 0).toFixed(2)}` :
    '$0';
  const isApproved = decision !== 'reject' && decision !== null;

  return (
    <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:20, flex:1, minHeight:0, alignItems:'stretch' }}>
      {isApproved ? <>
        {/* Payment processing */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, height:'100%' }}>
          {paymentSent ? (
            <div style={{ background:'#E8F5E9', border:'1px solid #A5D6A7', borderRadius:12, padding:'20px 24px', display:'flex', gap:16 }}>
              <Icon n="check_circle" size={36} color={DONE} />
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'#1B5E20', marginBottom:4 }}>Payment Processed</div>
                <div style={{ fontSize:14, color:'#2E7D32' }}>{amount} sent to Aiden Lim via PayNow (GrabPay). Claim CLM-884210 settled.</div>
              </div>
            </div>
          ) : (
            <Card>
              <SecTitle icon="payments">Payment Processing</SecTitle>
              <InfoRow label="Payee"           value="Aiden Lim" />
              <InfoRow label="Claim Ref"        value="CLM-884210" mono />
              <InfoRow label="Approved Amount"  value={amount} highlight={T} />
              <InfoRow label="Processing Fee"   value="$0.00" />
              <Hr />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <span style={{ fontSize:15, fontWeight:700, color:TXT }}>Total Payment</span>
                <span style={{ fontSize:28, fontWeight:800, color:T }}>{amount}</span>
              </div>
              <div style={{ background:TL, border:`1px solid ${T}`, borderRadius:8, padding:'10px 14px', marginBottom:16, display:'flex', gap:8, alignItems:'center' }}>
                <Icon n="account_balance_wallet" size={18} color={T} />
                <span style={{ fontSize:13, color:T, fontWeight:600 }}>Digital Wallet (PayNow / GrabPay) · Instant Processing</span>
              </div>
              <button onClick={() => setPaymentSent(true)}
                style={{ width:'100%', padding:'14px', background:DONE, color:W, border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <Icon n="check_circle" size={18} color={W} />Approve & Send Payment
              </button>
            </Card>
          )}

          <Card>
            <SecTitle icon="send">Customer Notification</SecTitle>
            <div style={{ background:BG, borderRadius:8, padding:'12px 14px', fontSize:13, color:TXT, lineHeight:1.7, marginBottom:12 }}>
              <strong>Email to aiden.lim@email.sg:</strong><br />
              "Dear Aiden, your travel insurance claim (CLM-884210) for lost baggage has been approved. A payment of SGD {amount.replace('$','')} has been processed to your PayNow account. We apologise for the inconvenience."
            </div>
            <Chip label={paymentSent ? "Notification Sent" : "Pending payment"} icon={paymentSent?"done_all":"schedule"} bg={paymentSent?"#E8F5E9":BG} color={paymentSent?DONE:T2} />
          </Card>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Card>
            <SecTitle icon="star_rate">Experience Survey</SecTitle>
            <div style={{ fontSize:13, color:T2, lineHeight:1.65, marginBottom:12 }}>
              A CSAT survey will be triggered automatically upon payment confirmation.
            </div>
            <InfoRow label="Channel"  value="Email + App push" />
            <InfoRow label="Questions"value="4 (CSAT, NPS, ease)" />
            <InfoRow label="Window"   value="7 days" />
          </Card>
          <Card>
            <SecTitle icon="account_balance">Claims Recovery</SecTitle>
            <div style={{ background:'#EEF5FF', border:'1px solid #BBDEFB', borderRadius:8, padding:'12px 14px', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#0D47A1', marginBottom:4 }}>Airline Liability Identified</div>
              <div style={{ fontSize:12, color:'#1565C0', lineHeight:1.6 }}>Montreal Convention — SkyBridge Air bears partial liability. Recoverable: <strong>$400</strong>.</div>
            </div>
            {recoveryInit
              ? <Chip label="Recovery Process Initiated" icon="check_circle" bg="#E8F5E9" color={DONE} />
              : <button onClick={() => setRecoveryInit(true)}
                  style={{ width:'100%', padding:'10px', background:W, color:'#1B75BB', border:'2px solid #1B75BB', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  Initiate Recovery Process
                </button>
            }
          </Card>
          <Card>
            <SecTitle icon="card_giftcard">Value Added Services</SecTitle>
            {[
              { icon:'flight_takeoff', label:'Travel Protection Upgrade' },
              { icon:'luggage',        label:'Baggage Tracking Add-On'   },
            ].map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:i===0?`1px solid ${BDR}`:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Icon n={s.icon} size={16} color={T} />
                  <span style={{ fontSize:13, color:TXT }}>{s.label}</span>
                </div>
                <button style={{ fontSize:12, color:T, border:`1px solid ${T}`, background:'transparent', borderRadius:6, padding:'4px 10px', cursor:'pointer' }}>Offer</button>
              </div>
            ))}
          </Card>
        </div>
      </> : (
        <div style={{ gridColumn:'1/-1' }}>
          {rejectionSent ? (
            <div style={{ background:'#FFF3E0', border:'1px solid #FFCC80', borderRadius:12, padding:'28px 32px', display:'flex', gap:20, alignItems:'flex-start' }}>
              <Icon n="mark_email_read" size={40} color="#E57C00" />
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'#E57C00', marginBottom:6 }}>Rejection Notice Sent</div>
                <div style={{ fontSize:13, color:TXT, lineHeight:1.75, maxWidth:560 }}>
                  A formal rejection notice has been sent to <strong>aiden.lim@email.sg</strong> and a copy logged to the claim record.<br />
                  The customer has <strong>30 days</strong> to resubmit with additional documentation. Claim CLM-884210 is now closed.
                </div>
                <div style={{ marginTop:14, display:'flex', gap:10, flexWrap:'wrap' }}>
                  <Chip label="Notice Sent"    icon="done_all"   bg="#E8F5E9" color={DONE} />
                  <Chip label="Claim Closed"   icon="lock"       bg="#F3F4F6" color={T2} />
                  <Chip label="Audit Logged"   icon="history"    bg="#EEF5FF" color="#1B75BB" />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background:'#FFEBEE', border:'1px solid #FFCDD2', borderRadius:12, padding:'28px', textAlign:'center' }}>
              <Icon n="cancel" size={40} color="#C62828" />
              <div style={{ fontSize:16, fontWeight:700, color:'#C62828', marginTop:12, marginBottom:8 }}>Claim Rejected</div>
              <div style={{ fontSize:13, color:T2, maxWidth:500, margin:'0 auto', lineHeight:1.7 }}>
                A rejection notice will be sent to the customer at aiden.lim@email.sg with the reason stated. The customer may resubmit with additional documentation within 30 days.
              </div>
              <button onClick={() => setRejectionSent(true)}
                style={{ marginTop:16, padding:'12px 28px', background:'#C62828', color:W, border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
                <Icon n="send" size={16} color={W} />Send Rejection Notice
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT: AgentStepper
═══════════════════════════════════════════════════════════════ */
export default function AgentStepper({ claim, onBack, initialStep = 0, readOnly = false }) {
  const bp = useBreakpoint();
  const { isMobile } = bp;
  const [step,         setStep]         = useState(initialStep);
  const [decision,     setDecision]     = useState('approve_partial');
  const [customAmount, setCustomAmount] = useState('');

  const c = claim || {
    ref:'CLM-884210', customer:'Aiden Lim', type:'Lost Baggage', status:'Pending Assessment',
    priority:'Medium', stp:false, amount:1200, limit:1500, plan:'Comprehensive Travel',
    policy:'TRV-SG-2025-44821', destination:'SIN → LHR → CDG',
    airline:'SkyBridge Air', flightNumber:'SB201 / SB408',
    priorClaims:1, fraudScore:12, similarApproval:'92%',
    insight:'Declared item value exceeds automated approval threshold.',
    failReason:'High declared item value — manual review required',
    checklist:[],
  };

  const canNext = step < STEPS.length - 1;
  const canBack = step > 0;

  const renderStep = () => {
    switch (step) {
      case 0: return <StepTripOverview       claim={c} />;
      case 1: return <StepIncidentReport     claim={c} />;
      case 2: return <StepCoverageVerification claim={c} />;
      case 3: return <StepEligibilityReview  claim={c} />;
      case 4: return <StepDocumentReview />;
      case 5: return <StepSettlement />;
      case 6: return <StepDecision decision={decision} setDecision={setDecision} customAmount={customAmount} setCustomAmount={setCustomAmount} />;
      case 7: return <StepPaymentClose decision={decision} customAmount={customAmount} />;
      default: return null;
    }
  };

  return (
    <BpCtx.Provider value={bp}>
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:BG, fontFamily:'inherit' }}>
      {/* Top bar */}
      <div style={{ background:W, borderBottom:`1px solid ${BDR}`, padding: isMobile ? '10px 16px' : '12px 28px', display:'flex', alignItems:'center', gap:12, flexShrink:0, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
        <button onClick={onBack}
          style={{ display:'flex', alignItems:'center', gap:6, background:TL, border:`1px solid ${T}`, cursor:'pointer', color:T, fontSize:13, fontWeight:700, padding:'6px 12px', borderRadius:8, flexShrink:0 }}>
          <Icon n="arrow_back" size={16} color={T} />Back to Work Queue
        </button>
        <div style={{ width:1, height:24, background:BDR, flexShrink:0 }} />
        {isMobile ? (
          <div style={{ display:'flex', flexDirection:'column', gap:2, flex:1, minWidth:0 }}>
            <strong style={{ fontSize:13, color:TXT }}>{c.customer}</strong>
            <span style={{ fontFamily:'monospace', fontSize:12, color:T }}>{c.ref}</span>
          </div>
        ) : (
          <div style={{ fontSize:13, color:T2 }}>
            <strong style={{ color:TXT }}>{c.customer}</strong>
            <span style={{ margin:'0 8px' }}>·</span>
            <span style={{ fontFamily:'monospace', color:T }}>{c.ref}</span>
            <span style={{ margin:'0 8px' }}>·</span>
            {c.destination}
          </div>
        )}
        <div style={{ marginLeft:'auto', display:'flex', gap:8, flexShrink:0 }}>
          <Chip label={c.type} bg={TL} color={T} />
          {readOnly
            ? <Chip label="View Only" icon="visibility" bg="#F3F4F6" color={T2} />
            : <Chip label={c.status} icon="pending" bg="#FFF4E5" color={WARN} />}
        </div>
      </div>

      {/* Read-only banner */}
      {readOnly && (
        <div style={{ background:'#F3F4F6', borderBottom:`1px solid ${BDR}`, padding:'8px 28px', display:'flex', alignItems:'center', gap:8 }}>
          <Icon n="lock" size={14} color={T2} />
          <span style={{ fontSize:12, color:T2 }}>This claim is closed — you are viewing the record in read-only mode. No changes can be made.</span>
        </div>
      )}

      {/* Stepper header */}
      <StepHeader step={step} onStepClick={setStep} />

      {/* Step content */}
      <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '16px 12px' : '24px 32px', display:'flex', flexDirection:'column' }}>
        {renderStep()}
      </div>

      {/* Navigation footer */}
      <div style={{ background:W, borderTop:`1px solid ${BDR}`, padding: isMobile ? '12px 16px' : '14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <button onClick={() => canBack && setStep(s => s-1)} disabled={!canBack}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 20px', borderRadius:8, border:`1px solid ${BDR}`, background:canBack?W:'#F8F9FA', color:canBack?TXT:T2, fontSize:14, fontWeight:600, cursor:canBack?'pointer':'not-allowed', opacity:canBack?1:0.5 }}>
          <Icon n="arrow_back" size={16} color={canBack?TXT:T2} />Back
        </button>

        <div style={{ display:'flex', gap:6 }}>
          {STEPS.map((_,i) => (
            <div key={i} onClick={() => i <= step && setStep(i)}
              style={{ width: i===step ? 24 : 8, height:8, borderRadius:20, background: i===step?T:i<step?T2:BDR, cursor: i<=step?'pointer':'default', transition:'all 0.2s' }} />
          ))}
        </div>

        <div style={{ display:'flex', gap:10 }}>
          {readOnly ? (
            step === STEPS.length - 1
              ? <button onClick={onBack}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 24px', borderRadius:8, border:`1px solid ${BDR}`, background:W, color:T2, fontSize:14, fontWeight:600, cursor:'pointer' }}>
                  <Icon n="close" size={16} color={T2} />Exit Review
                </button>
              : <button onClick={() => setStep(s => s+1)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 24px', borderRadius:8, border:'none', background:T2, color:W, fontSize:14, fontWeight:600, cursor:'pointer' }}>
                  Next Step<Icon n="arrow_forward" size={16} color={W} />
                </button>
          ) : step === STEPS.length - 1 ? (
            <button onClick={onBack}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 24px', borderRadius:8, border:'none', background:DONE, color:W, fontSize:14, fontWeight:700, cursor:'pointer' }}>
              <Icon n="check_circle" size={16} color={W} />Close Claim
            </button>
          ) : (
            <button onClick={() => canNext && setStep(s => s+1)} disabled={!canNext}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 24px', borderRadius:8, border:'none', background:T, color:W, fontSize:14, fontWeight:700, cursor:canNext?'pointer':'not-allowed', boxShadow:'0 2px 6px rgba(13,122,95,0.3)', opacity:canNext?1:0.5 }}>
              {step === 6 ? 'Confirm Decision' : 'Next'}
              <Icon n="arrow_forward" size={16} color={W} />
            </button>
          )}
        </div>
      </div>
    </div>
    </BpCtx.Provider>
  );
}
