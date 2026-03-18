import { useState, useMemo, useRef, useEffect, useContext, createContext } from 'react';
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
import { useApp } from '../../contexts/AppContext';
import AgentStepper from './AgentStepper';

/* ─── Design tokens ─────────────────────────────────────────── */
const T   = '#0D7A5F';
const TL  = '#EAF5F1';
const BDR = '#E2E4E8';
const BG  = '#F4F6F9';
const TXT = '#1A1A2E';
const T2  = '#58595B';
const W   = '#FFFFFF';

/* ─── Full claims dataset (all today) ───────────────────────── */
const TODAY = new Date();
const fmt   = h => {
  const d = new Date(TODAY);
  d.setHours(d.getHours() - h, Math.floor(Math.random() * 59));
  return d.toLocaleTimeString('en-SG', { hour:'2-digit', minute:'2-digit' }) + ' SGT';
};

const ALL_CLAIMS = [
  {
    ref:'CLM-884210', customer:'Aiden Lim',      type:'Lost Baggage',     status:'Pending Assessment', priority:'Medium', stp:false, amount:1200,  age:'2h',  submitted: fmt(2),  assignedTo:'Sarah Johnson',
    policy:'TRV-SG-2025-44821', plan:'Comprehensive Travel', limit:1500,  destination:'SIN → LHR → CDG', airline:'SkyBridge Air',
    insight:'Declared item value exceeds automated approval threshold. Depreciation schedule applies to electronics.',
    fraudScore:12, priorClaims:1, similarApproval:'92%', exposure:1200,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'PIR report received',d:true},{l:'Claimant identity verified',d:true},{l:'Item receipts submitted',d:false},{l:'Assessment completed',d:false} ],
    failReason:'High declared item value — manual review required',
  },
  {
    ref:'CLM-884211', customer:'Mei Lin Tan',    type:'Trip Cancellation', status:'In Review',          priority:'Low',    stp:false, amount:3400,  age:'3h',  submitted: fmt(3),  assignedTo:'Taylor Brooks',
    policy:'TRV-SG-2025-38812', plan:'Standard Travel',       limit:5000,  destination:'SIN → NRT',        airline:'AsiaStar Airways',
    insight:'Cancellation due to illness. Medical certificate submitted and under review by examiner.',
    fraudScore:8,  priorClaims:0, similarApproval:'88%', exposure:3400,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Cancellation notice received',d:true},{l:'Medical certificate submitted',d:true},{l:'Non-refundable receipts verified',d:false},{l:'Assessment completed',d:false} ],
    failReason:'Supporting documentation under review',
  },
  {
    ref:'CLM-884212', customer:'Raj Sharma',     type:'Medical Emergency',  status:'Pending Payment',   priority:'High',   stp:false, amount:18200, age:'5h',  submitted: fmt(5),  assignedTo:'Morgan Reeves',
    policy:'TRV-SG-2025-51009', plan:'Premium Travel',        limit:50000, destination:'SIN → BKK',        airline:'PacificWing Airlines',
    insight:'Emergency hospitalisation abroad. All documents verified. Awaiting payment authorisation.',
    fraudScore:6,  priorClaims:1, similarApproval:'95%', exposure:18200,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Hospital report verified',d:true},{l:'Medical bills reviewed',d:true},{l:'Direct payment to hospital authorised',d:true},{l:'Payment processing',d:false} ],
    failReason:'Awaiting payment authorisation from senior processor',
  },
  {
    ref:'CLM-884213', customer:'Hannah Park',    type:'Flight Delay',      status:'Closed',             priority:'Low',    stp:true,  amount:380,   age:'6h',  submitted: fmt(6),  assignedTo:'Sarah Johnson',
    policy:'TRV-SG-2025-29471', plan:'Economy Travel',        limit:500,   destination:'SIN → KUL',        airline:'SunAir Express',
    insight:'9-hour delay confirmed by airline. Expenses within daily allowance. Processed via automated workflow.',
    fraudScore:4,  priorClaims:0, similarApproval:'99%', exposure:380,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Airline delay confirmed',d:true},{l:'Expenses within limit',d:true},{l:'Payment processed',d:true},{l:'Claim closed',d:true} ],
    failReason:null,
  },
  {
    ref:'CLM-884214', customer:'Wei Zhang',      type:'Baggage Delay',     status:'Closed',             priority:'Low',    stp:true,  amount:220,   age:'7h',  submitted: fmt(7),  assignedTo:'Jayden Clarke',
    policy:'TRV-SG-2025-31188', plan:'Economy Travel',        limit:400,   destination:'SIN → HKG',        airline:'EastWest Airlines',
    insight:'Baggage delayed 14 hours. Emergency purchases within allowance. Auto-approved and paid.',
    fraudScore:3,  priorClaims:0, similarApproval:'97%', exposure:220,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Baggage delay confirmed',d:true},{l:'Receipts verified',d:true},{l:'Payment processed',d:true},{l:'Claim closed',d:true} ],
    failReason:null,
  },
  {
    ref:'CLM-884215', customer:'Carlos Rivera',  type:'Trip Interruption',  status:'Pending Assessment', priority:'Medium', stp:false, amount:5800,  age:'1h',  submitted: fmt(1),  assignedTo:'Sarah Johnson',
    policy:'TRV-SG-2025-60234', plan:'Comprehensive Travel',  limit:8000,  destination:'SIN → LHR → BCN',  airline:'SkyBridge Air',
    insight:'Trip interrupted mid-journey due to family emergency. Return flights and additional accommodation costs submitted.',
    fraudScore:15, priorClaims:2, similarApproval:'84%', exposure:5800,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Interruption reason documented',d:true},{l:'Return flight receipts submitted',d:true},{l:'Hotel receipts verified',d:false},{l:'Assessment completed',d:false} ],
    failReason:'Multiple prior claims — additional review required',
  },
  {
    ref:'CLM-884216', customer:'Priya Patel',    type:'Travel Accident',   status:'In Review',          priority:'High',   stp:false, amount:9500,  age:'4h',  submitted: fmt(4),  assignedTo:'Morgan Reeves',
    policy:'TRV-SG-2025-44019', plan:'Premium Travel',        limit:25000, destination:'SIN → DXB → FCO',  airline:'GulfPath Airlines',
    insight:'Accidental injury during excursion. Physician report and hospital bills under review.',
    fraudScore:9,  priorClaims:1, similarApproval:'90%', exposure:9500,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Accident report filed',d:true},{l:'Physician report received',d:true},{l:'Hospital bills submitted',d:false},{l:'Assessment completed',d:false} ],
    failReason:'Hospital bills pending submission',
  },
  {
    ref:'CLM-884217', customer:'Yuki Tanaka',    type:'Flight Delay',      status:'Closed',             priority:'Low',    stp:true,  amount:150,   age:'8h',  submitted: fmt(8),  assignedTo:'Taylor Brooks',
    policy:'TRV-SG-2025-27741', plan:'Economy Travel',        limit:300,   destination:'SIN → TPE',        airline:'DragonFly Air',
    insight:'7-hour delay. Meal expenses claimed within policy sub-limit. Auto-processed.',
    fraudScore:2,  priorClaims:0, similarApproval:'99%', exposure:150,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Airline delay confirmed',d:true},{l:'Expenses within limit',d:true},{l:'Payment processed',d:true},{l:'Claim closed',d:true} ],
    failReason:null,
  },
  {
    ref:'CLM-884218', customer:'Omar Hassan',    type:'Lost Baggage',      status:'Pending Assessment', priority:'Medium', stp:false, amount:2100,  age:'2h',  submitted: fmt(2),  assignedTo:'Jayden Clarke',
    policy:'TRV-SG-2025-55302', plan:'Comprehensive Travel',  limit:3000,  destination:'SIN → CDG → FCO',  airline:'EuroJet Airways',
    insight:'Two bags lost on connecting flight. PIR filed at Paris CDG. Items include camera equipment requiring depreciation review.',
    fraudScore:18, priorClaims:1, similarApproval:'89%', exposure:2100,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'PIR report received',d:true},{l:'Claimant identity verified',d:true},{l:'Equipment receipts required',d:false},{l:'Assessment completed',d:false} ],
    failReason:'Camera equipment value requires specialist review',
  },
  {
    ref:'CLM-884219', customer:'Lisa Chen',      type:'Trip Cancellation', status:'In Review',          priority:'Low',    stp:false, amount:4200,  age:'3h',  submitted: fmt(3),  assignedTo:'Sarah Johnson',
    policy:'TRV-SG-2025-41187', plan:'Standard Travel',       limit:6000,  destination:'SIN → SYD',        airline:'SouthCross Air',
    insight:'Cancellation due to adverse weather at destination. Airline cancellation notice received. Verifying covered peril.',
    fraudScore:7,  priorClaims:0, similarApproval:'81%', exposure:4200,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Airline cancellation notice received',d:true},{l:'Weather confirmation obtained',d:true},{l:'Non-refundable cost receipts',d:false},{l:'Covered peril verification',d:false} ],
    failReason:'Adverse weather coverage eligibility under review',
  },
  {
    ref:'CLM-884220', customer:'David Kim',      type:'Baggage Delay',     status:'Closed',             priority:'Low',    stp:true,  amount:310,   age:'9h',  submitted: fmt(9),  assignedTo:'Jayden Clarke',
    policy:'TRV-SG-2025-30055', plan:'Standard Travel',       limit:400,   destination:'SIN → ICN',        airline:'MorningCal Airlines',
    insight:'Baggage delayed 11 hours. Emergency clothing and toiletries purchased. Auto-approved.',
    fraudScore:5,  priorClaims:0, similarApproval:'98%', exposure:310,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Baggage delay confirmed',d:true},{l:'Receipts verified',d:true},{l:'Payment processed',d:true},{l:'Claim closed',d:true} ],
    failReason:null,
  },
  {
    ref:'CLM-884221', customer:'Sofia Martinez', type:'Medical Emergency',  status:'Pending Payment',   priority:'High',   stp:false, amount:12400, age:'6h',  submitted: fmt(6),  assignedTo:'Morgan Reeves',
    policy:'TRV-SG-2025-58841', plan:'Premium Travel',        limit:50000, destination:'SIN → MXC → LAX',  airline:'AsiaStar Airways',
    insight:'Acute appendicitis during transit. Emergency surgery performed. Assessment complete, payment pending approval.',
    fraudScore:4,  priorClaims:0, similarApproval:'97%', exposure:12400,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Hospital report verified',d:true},{l:'Medical necessity confirmed',d:true},{l:'Itemised bills received',d:true},{l:'Payment authorisation pending',d:false} ],
    failReason:'Awaiting senior processor payment sign-off',
  },
  {
    ref:'CLM-884222', customer:'James Okafor',   type:'Flight Delay',      status:'Pending Assessment', priority:'Low',    stp:false, amount:520,   age:'1h',  submitted: fmt(1),  assignedTo:'Taylor Brooks',
    policy:'TRV-SG-2025-22198', plan:'Standard Travel',       limit:600,   destination:'SIN → LHR',        airline:'SkyBridge Air',
    insight:'11-hour delay with overnight hotel. Delay confirmed, but hotel amount exceeds standard per-night sub-limit.',
    fraudScore:10, priorClaims:0, similarApproval:'76%', exposure:520,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Airline delay confirmed',d:true},{l:'Hotel receipt submitted',d:true},{l:'Sub-limit review required',d:false},{l:'Assessment completed',d:false} ],
    failReason:'Hotel cost exceeds nightly sub-limit — partial approval likely',
  },
  {
    ref:'CLM-884223', customer:'Amelia Wong',    type:'Trip Interruption',  status:'Closed',             priority:'Medium', stp:true,  amount:1800,  age:'10h', submitted: fmt(10), assignedTo:'Taylor Brooks',
    policy:'TRV-SG-2025-35561', plan:'Comprehensive Travel',  limit:8000,  destination:'SIN → BKK',        airline:'PacificWing Airlines',
    insight:'Interruption due to flight strike. Documentation clear. Auto-approved within threshold.',
    fraudScore:6,  priorClaims:1, similarApproval:'91%', exposure:1800,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Strike notice received',d:true},{l:'Return costs verified',d:true},{l:'Payment processed',d:true},{l:'Claim closed',d:true} ],
    failReason:null,
  },
  {
    ref:'CLM-884224', customer:'Nathan Lee',     type:'Travel Accident',   status:'Pending Assessment', priority:'High',   stp:false, amount:7300,  age:'3h',  submitted: fmt(3),  assignedTo:'Morgan Reeves',
    policy:'TRV-SG-2025-61004', plan:'Premium Travel',        limit:25000, destination:'SIN → MEL',        airline:'BlueHorizon Air',
    insight:'Slip and fall injury at hotel premises. Liability question between travel policy and hotel. Complex case.',
    fraudScore:22, priorClaims:2, similarApproval:'78%', exposure:7300,
    checklist:[ {l:'Policy active at travel date',d:true},{l:'Incident report filed',d:true},{l:'Medical report received',d:false},{l:'Liability assessment required',d:false},{l:'Assessment completed',d:false} ],
    failReason:'Liability split between policy and third party — specialist review',
  },
];

/* ─── KPIs derived from data ────────────────────────────────── */
const kpiFromData = () => {
  const total    = ALL_CLAIMS.length;
  const pending  = ALL_CLAIMS.filter(c => c.status === 'Pending Assessment').length;
  const closed   = ALL_CLAIMS.filter(c => c.status === 'Closed').length;
  return { total, pending, closed };
};

/* ─── Workflow steps (for the detail flow) ──────────────────── */
const STEPS       = ['claim','assessment','reserve','computation','case','payment','complete'];
const STEP_LABELS = { claim:'Claim Details', assessment:'Assessment', reserve:'Reserve', computation:'Computation', case:'Case Management', payment:'Payment', complete:'Closed' };

/* ─── Detail-flow data (CLM-884210 focused) ─────────────────── */
const DETAIL = {
  ref: 'CLM-884210',
  submitted: 'Today, 09:42 SGT',
  customer: {
    name:'Aiden Lim', id:'CUST-SG-88421', email:'aiden.lim@email.sg', phone:'+65 9123 4567',
    policyNumber:'TRV-SG-2025-44821', planType:'Comprehensive Travel', coverageLimit:1500,
    destination:'Singapore → London → Paris', tripDates:'12 Jan – 25 Jan 2025',
    airline:'SkyBridge Air', flightNumber:'SB201 / SB408',
    pirRef:'LHR-SB-PIR-2025-00318', pirDate:'13 Jan 2025', baggage:'2 checked bags (28 kg total)',
  },
  financial:{ policyLimit:1500, claimed:1200, recommended:1050, confidence:87 },
  items:[
    { name:'Clothing & Apparel',        claimed:600, approved:550, note:'Depreciation applied (8%)' },
    { name:'Electronics (Laptop)',      claimed:400, approved:300, note:'Depreciation (25%) — receipt not provided' },
    { name:'Toiletries & Personal Care',claimed:200, approved:200, note:'Approved in full' },
  ],
  risk:{ frequency:'Low', fraudScore:12, pattern:'Normal', priorClaims:1,
    note:'Claim frequency and travel pattern are consistent with the policyholder profile. No indicators of irregular behaviour detected.' },
  timeline:[
    { time:'Today, 09:42', label:'Claim submitted via customer portal',  done:true  },
    { time:'Today, 09:45', label:'Policy coverage verified',             done:true  },
    { time:'Today, 09:47', label:'Airline PIR report ingested',          done:true  },
    { time:'Today, 10:02', label:'Assessment assigned to Sarah Wong',    done:true  },
    { time:'Today, 14:30', label:'Assessment completed',                 done:false },
    { time:'Pending',      label:'Payment approved & processed',         done:false },
    { time:'Pending',      label:'Claim closed',                         done:false },
  ],
  recovery:{ party:'SkyBridge Air', amount:400, basis:'Montreal Convention — carrier liability for checked baggage loss' },
};

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
  <div style={{ background:W, borderRadius:10, border:`1px solid ${BDR}`, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', padding:pad, ...style }}>
    {children}
  </div>
);

const SecTitle = ({ children, icon }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:700, color:T, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 }}>
    {icon && <Icon n={icon} size={15} color={T} />}{children}
  </div>
);

const InfoRow = ({ label, value, mono }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:8 }}>
    <span style={{ fontSize:13, color:T2, flexShrink:0 }}>{label}</span>
    <span style={{ fontSize:13, fontWeight:600, color:TXT, textAlign:'right', fontFamily:mono?'monospace':'inherit' }}>{value}</span>
  </div>
);

const Hr = () => <div style={{ borderTop:`1px solid ${BDR}`, margin:'14px 0' }} />;

const Btn = ({ children, onClick, variant='primary', icon, disabled, style={} }) => {
  const base = { display:'inline-flex', alignItems:'center', gap:6, padding:'10px 20px', borderRadius:8, fontSize:14, fontWeight:700, cursor:disabled?'not-allowed':'pointer', border:'none', transition:'all 0.15s', ...style };
  const v = {
    primary:  { background:T,              color:W,  boxShadow:'0 2px 6px rgba(13,122,95,0.3)' },
    secondary:{ background:W,              color:T,  border:`2px solid ${T}` },
    ghost:    { background:'transparent',  color:T2, border:`1px solid ${BDR}` },
    success:  { background:'#2E7D32',      color:W },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant], opacity:disabled?0.5:1 }}>
      {icon && <Icon n={icon} size={16} color={variant==='primary'||variant==='success'?W:undefined} />}
      {children}
    </button>
  );
};

/* ─── Status / priority colour helpers ──────────────────────── */
const statusStyle = s =>
  s==='Closed'             ? {color:'#2E7D32',bg:'#E8F5E9'} :
  s==='Pending Assessment' ? {color:'#E57C00',bg:'#FFF4E5'} :
  s==='Pending Payment'    ? {color:'#1B75BB',bg:'#EEF5FF'} :
                             {color:'#5C35CC',bg:'#F0EBFF'};

const priorityStyle = p =>
  p==='High'   ? {color:'#C62828',bg:'#FFEBEE'} :
  p==='Medium' ? {color:'#E57C00',bg:'#FFF4E5'} :
                 {color:'#2E7D32',bg:'#E8F5E9'};

/* ─── Left navigation ───────────────────────────────────────── */
const NAV = [
  { id:'notification', label:'Claims Notification',   icon:'notifications_active', view:'claim',      tab:'notification' },
  { id:'registration', label:'Claims Registration',   icon:'app_registration',     view:'claim',      tab:'registration' },
  { id:'assessment',   label:'Claims Assessment',     icon:'fact_check',           view:'assessment'  },
  { id:'payment',      label:'Claims Payment',        icon:'payments',             view:'payment'     },
  { id:'case',         label:'Claims Case Management',icon:'folder_open',          view:'case'        },
  { id:'stp',          label:'STP Claims',            icon:'bolt',                 view:'complete'    },
  { id:'vas',          label:'Value Added Services',  icon:'card_giftcard',        view:'complete'    },
  { id:'analytics',    label:'Portfolio Analytics',   icon:'analytics',            view:'analytics'   },
];

function LeftNav({ activeModule, onModuleClick, userName, navOpen, onNavToggle }) {
  const { isMobile, isTablet } = useBp();
  const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'CP';
  const isOverlay = isMobile || isTablet;

  if (isOverlay && !navOpen) return null;

  const navContent = (
    <div style={{ width:224, flexShrink:0, background:'#1A2A3A', display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'18px 16px 12px', borderBottom:'1px solid rgba(255,255,255,0.08)', cursor:'pointer' }}
           onClick={() => onModuleClick({ id:'queue', view:'queue' })}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:T, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon n="flight" size={17} color={W} />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:W }}>Travel Claims</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>APAC Processing Hub</div>
          </div>
        </div>
      </div>
      <div style={{ padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:T, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:W, flexShrink:0 }}>{initials}</div>
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:W }}>{userName || 'Claims Processor'}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>Claims Processor · APAC</div>
        </div>
      </div>
      <nav style={{ flex:1, padding:'6px 0', overflowY:'auto' }}>
        {NAV.map(m => (
          <button key={m.id} onClick={() => onModuleClick(m)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 16px', border:'none', cursor:'pointer', textAlign:'left',
              background: activeModule===m.id ? 'rgba(13,122,95,0.22)' : 'transparent',
              borderLeft: activeModule===m.id ? `3px solid ${T}` : '3px solid transparent',
              color:      activeModule===m.id ? W : 'rgba(255,255,255,0.6)',
              fontSize:13, fontWeight:activeModule===m.id?600:400, transition:'all 0.15s' }}>
            <Icon n={m.icon} size={17} color={activeModule===m.id?TL:'rgba(255,255,255,0.5)'} />
            {m.label}
          </button>
        ))}
      </nav>
      <div style={{ padding:'10px 14px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => onModuleClick({ id:'queue', view:'queue' })}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', border:`1px solid ${T}`, borderRadius:8, background:'rgba(13,122,95,0.18)', cursor:'pointer', color:TL, fontSize:13, fontWeight:700 }}>
          <Icon n="arrow_back" size={15} color={TL} />Back to Work Queue
        </button>
      </div>
    </div>
  );

  if (isOverlay) {
    return (
      <>
        <div onClick={onNavToggle} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:199 }} />
        <div style={{ position:'fixed', left:0, top:0, height:'100%', zIndex:200, display:'flex', flexDirection:'column' }}>
          {navContent}
        </div>
      </>
    );
  }

  return navContent;
}

/* ─── Progress breadcrumb ───────────────────────────────────── */
function ProgressBar({ currentStep, claimRef }) {
  const { isMobile } = useBp();
  if (currentStep === 'queue') return null;
  const idx = STEPS.indexOf(currentStep);
  if (isMobile) {
    return (
      <div style={{ background:W, borderBottom:`1px solid ${BDR}`, padding:'8px 16px', display:'flex', alignItems:'center', gap:8, flexShrink:0, overflowX:'auto', whiteSpace:'nowrap' }}>
        <span style={{ fontSize:12, color:T2, fontWeight:600, flexShrink:0 }}>Claim {claimRef}</span>
        <div style={{ display:'flex', gap:4 }}>
          {STEPS.map((step, i) => (
            <div key={step} style={{ width: i===idx ? 18 : 6, height:6, borderRadius:20, background: i===idx?T:i<idx?TL:BDR, transition:'all 0.2s', flexShrink:0 }} />
          ))}
        </div>
        <span style={{ fontSize:12, fontWeight:700, color:T, flexShrink:0 }}>{STEP_LABELS[STEPS[idx]]}</span>
      </div>
    );
  }
  return (
    <div style={{ background:W, borderBottom:`1px solid ${BDR}`, padding:'10px 24px', display:'flex', alignItems:'center', gap:0, flexShrink:0 }}>
      <span style={{ fontSize:12, color:T2, marginRight:16, fontWeight:600, whiteSpace:'nowrap' }}>Claim {claimRef}</span>
      {STEPS.map((step, i) => (
        <div key={step} style={{ display:'flex', alignItems:'center', flex:i<STEPS.length-1?1:'none' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:12,
            fontWeight:i===idx?700:400,
            background:i===idx?T:i<idx?TL:'transparent',
            color:i===idx?W:i<idx?T:T2,
            whiteSpace:'nowrap' }}>
            {i<idx && <Icon n="check_circle" size={12} color={T} />}
            {STEP_LABELS[step]}
          </div>
          {i<STEPS.length-1 && <div style={{ flex:1, height:1, background:i<idx?T:BDR, margin:'0 3px', minWidth:10 }} />}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RIGHT INSIGHT PANEL — driven by selected claim
═══════════════════════════════════════════════════════════════ */
function InsightPanel({ claim, onOpen }) {
  if (!claim) return (
    <Card style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', color:T2 }}>
        <Icon n="touch_app" size={36} color={BDR} />
        <div style={{ marginTop:10, fontSize:13 }}>Select a claim to view insights</div>
      </div>
    </Card>
  );

  const ss = statusStyle(claim.status);
  const ps = priorityStyle(claim.priority);
  const allDone = claim.checklist.every(c => c.d);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14, height:'100%', overflowY:'auto' }}>
      {/* Header */}
      <Card pad={16}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:TXT, fontFamily:'monospace' }}>{claim.ref}</div>
            <div style={{ fontSize:12, color:T2, marginTop:2 }}>{claim.customer}</div>
          </div>
          <Chip label={claim.type} bg={TL} color={T} />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
          <Chip label={claim.status}   color={ss.color} bg={ss.bg} />
          <Chip label={claim.priority} color={ps.color} bg={ps.bg} />
          {claim.stp
            ? <Chip label="STP" icon="bolt" bg="#E8F5E9" color="#2E7D32" />
            : <Chip label="Manual" icon="person" bg="#FFF4E5" color="#E57C00" />}
        </div>
        <InfoRow label="Submitted"    value={claim.submitted} />
        <InfoRow label="Exposure"     value={`$${claim.amount.toLocaleString()}`} />
        <InfoRow label="Policy Limit" value={`$${claim.limit.toLocaleString()}`} />
        <InfoRow label="Destination"  value={claim.destination} />
      </Card>

      {/* Action button — top of panel */}
      {claim.status !== 'Closed'
        ? <Btn onClick={() => onOpen(claim)} icon="open_in_new" style={{ width:'100%', justifyContent:'center' }}>Open Claim</Btn>
        : <Btn variant="ghost" icon="visibility" onClick={() => onOpen(claim)} style={{ width:'100%', justifyContent:'center' }}>View Closed Claim</Btn>
      }

      {/* Insight */}
      <Card pad={16}>
        <SecTitle icon="insights">Assessment Insight</SecTitle>
        {claim.failReason && !claim.stp ? (
          <div style={{ background:'#FFF4E5', border:'1px solid #FFD9A0', borderRadius:8, padding:'10px 12px', marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#8C4D00', marginBottom:4 }}>
              {claim.status === 'Pending Assessment' ? 'STP Ineligible' : claim.status === 'In Review' ? 'Under Review' : claim.status}
            </div>
            <div style={{ fontSize:12, color:'#8C4D00', lineHeight:1.6 }}>{claim.failReason}</div>
          </div>
        ) : claim.stp && (
          <div style={{ background:'#E8F5E9', border:'1px solid #A5D6A7', borderRadius:8, padding:'10px 12px', marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#1B5E20', marginBottom:4 }}>Processed via Automated Workflow</div>
            <div style={{ fontSize:12, color:'#2E7D32', lineHeight:1.6 }}>No manual intervention required.</div>
          </div>
        )}
        <div style={{ fontSize:13, color:TXT, lineHeight:1.65 }}>{claim.insight}</div>
        <Hr />
        <InfoRow label="Similar claims approved" value={claim.similarApproval} />
        <InfoRow label="Fraud risk score" value={`${claim.fraudScore}%`} />
        <InfoRow label="Prior claims" value={`${claim.priorClaims} claim${claim.priorClaims!==1?'s':''}`} />
      </Card>

      {/* Checklist */}
      <Card pad={16}>
        <SecTitle icon="checklist">Checklist</SecTitle>
        {claim.checklist.map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
            <Icon n={item.d?'check_circle':'radio_button_unchecked'} size={16} color={item.d?'#2E7D32':BDR} />
            <span style={{ fontSize:13, color:item.d?TXT:T2 }}>{item.l}</span>
          </div>
        ))}
      </Card>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: Work Queue
═══════════════════════════════════════════════════════════════ */
const STATUS_TABS = ['All','Pending Assessment','In Review','Pending Payment','Closed'];

function QueueView({ onOpenClaim, navOpen, onNavToggle, onAnalytics }) {
  const { isMobile, isTablet } = useBp();
  const [selectedRef,  setSelectedRef]  = useState('CLM-884210');
  const [activeTab,    setActiveTab]    = useState('All');
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('All Types');
  const [showInsight,  setShowInsight]  = useState(false);

  const { total, pending, closed } = kpiFromData();
  const today = new Date().toLocaleDateString('en-SG', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const tabCounts = useMemo(() => {
    const counts = {};
    STATUS_TABS.forEach(t => {
      counts[t] = t === 'All' ? ALL_CLAIMS.length : ALL_CLAIMS.filter(c => c.status === t).length;
    });
    return counts;
  }, []);

  const allTypes = useMemo(() => {
    const types = [...new Set(ALL_CLAIMS.map(c => c.type))].sort();
    return ['All Types', ...types];
  }, []);

  const filtered = useMemo(() => ALL_CLAIMS.filter(c => {
    const matchTab    = activeTab === 'All' || c.status === activeTab;
    const matchSearch = !search || c.ref.toLowerCase().includes(search.toLowerCase()) || c.customer.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === 'All Types' || c.type === typeFilter;
    return matchTab && matchSearch && matchType;
  }), [activeTab, search, typeFilter]);

  const selected = ALL_CLAIMS.find(c => c.ref === selectedRef) || null;

  const kpis = [
    { label:'Total Claims Today',   value: String(total),   icon:'inbox',           color:'#1B75BB', bg:'#EEF5FF' },
    { label:'Pending Assessment',   value: String(pending), icon:'pending_actions', color:'#E57C00', bg:'#FFF4E5' },
    { label:'Processed Today',      value: String(closed),  icon:'task_alt',        color:T,         bg:TL        },
    { label:'Avg. Resolution Time', value:'1.8h',           icon:'timer',           color:'#8B5CF6', bg:'#F3EEFF' },
  ];

  return (
    <div style={{ flex:1, background:BG, display:'flex', flexDirection:'column', minHeight:0, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:W, padding: isMobile ? '14px 16px' : '18px 28px', borderBottom:`1px solid ${BDR}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {(isMobile || isTablet) && (
            <button onClick={onNavToggle} style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', padding:4, borderRadius:6 }}>
              <Icon n="menu" size={22} color={TXT} />
            </button>
          )}
          <div>
            <h1 style={{ margin:0, fontSize: isMobile ? 16 : 20, fontWeight:700, color:TXT }}>My Work Queue</h1>
            {!isMobile && <p style={{ margin:'4px 0 0', fontSize:13, color:T2 }}>{today} · Singapore (SGT)</p>}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {!isMobile && <Chip label="APAC Hub" icon="location_on" bg={TL} color={T} />}
          {!isMobile && <Chip label={`${ALL_CLAIMS.filter(c=>c.status!=='Closed').length} Active`} icon="work" bg="#EEF5FF" color="#1B75BB" />}
          <button onClick={onAnalytics}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8, border:'none', background:T, color:W, fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 6px rgba(13,122,95,0.25)' }}>
            <Icon n="analytics" size={16} color={W} />
            {!isMobile && 'Portfolio Analytics'}
          </button>
        </div>
      </div>

      <div style={{ padding: isMobile ? '14px 12px' : '20px 28px', flex:1, minHeight:0, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:14, marginBottom:20, flexShrink:0 }}>
          {kpis.map(k => (
            <Card key={k.label} pad={isMobile ? 14 : 16}
              style={{ cursor: k.label==='Pending Assessment' ? 'pointer' : 'default' }}
              onClick={() => k.label==='Pending Assessment' ? setActiveTab('Pending Assessment') : undefined}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize: isMobile ? 22 : 28, fontWeight:800, color:TXT, marginBottom:4 }}>{k.value}</div>
                  <div style={{ fontSize:12, color:T2 }}>{k.label}</div>
                </div>
                <div style={{ width:40, height:40, borderRadius:10, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon n={k.icon} size={20} color={k.color} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '1fr 320px', gap:18, alignItems:'stretch', flex:1, minHeight:0 }}>
          {/* Table card */}
          <Card pad={0} style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Status tabs */}
            <div style={{ display:'flex', borderBottom:`1px solid ${BDR}`, overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
              {STATUS_TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding:'12px 16px', border:'none', background:'transparent', cursor:'pointer', whiteSpace:'nowrap', fontSize:13, flexShrink:0,
                    fontWeight: activeTab===tab ? 700 : 400,
                    color:      activeTab===tab ? T   : T2,
                    borderBottom: activeTab===tab ? `2px solid ${T}` : '2px solid transparent',
                    transition:'all 0.15s' }}>
                  {tab}
                  <span style={{ marginLeft:6, fontSize:11, background: activeTab===tab?TL:BG, color:activeTab===tab?T:T2, borderRadius:10, padding:'1px 7px', fontWeight:600 }}>
                    {tabCounts[tab]}
                  </span>
                </button>
              ))}
            </div>

            {/* Search + filter bar */}
            <div style={{ padding:'12px 16px', borderBottom:`1px solid ${BDR}`, display:'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 10, alignItems: isMobile ? 'stretch' : 'center' }}>
              <div style={{ flex:1, position:'relative' }}>
                <Icon n="search" size={16} color={T2} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by claim, customer or type..."
                  style={{ width:'100%', padding:'8px 10px 8px 34px', border:`1px solid ${BDR}`, borderRadius:8, fontSize:13, color:TXT, outline:'none', boxSizing:'border-box', background:BG }} />
              </div>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                style={{ padding:'8px 12px', border:`1px solid ${BDR}`, borderRadius:8, fontSize:13, color:TXT, background:W, cursor:'pointer', outline:'none' }}>
                {allTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={{ overflowX:'auto', overflowY:'auto', flex:1, minHeight: isMobile ? 200 : 0 }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
                <thead>
                  <tr style={{ background:BG }}>
                    {['Claim Ref','Customer','Type','Status','Priority','STP','Amount','Received'].map(h => (
                      <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:T2, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${BDR}`, whiteSpace:'nowrap', position:'sticky', top:0, background:BG, zIndex:1,
                        display: isMobile && (h==='Priority'||h==='STP') ? 'none' : undefined }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} style={{ padding:'32px', textAlign:'center', color:T2, fontSize:13 }}>No claims match the current filter.</td></tr>
                  )}
                  {filtered.map(q => {
                    const isSelected = q.ref === selectedRef;
                    const ss = statusStyle(q.status);
                    const ps = priorityStyle(q.priority);
                    return (
                      <tr key={q.ref}
                        onClick={() => { setSelectedRef(q.ref); if (isMobile || isTablet) setShowInsight(true); }}
                        style={{ background:isSelected?TL:W, borderBottom:`1px solid ${BDR}`, cursor:'pointer', transition:'background 0.12s' }}
                        onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background=BG; }}
                        onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background=W; }}>
                        <td style={{ padding:'11px 14px' }}>
                          <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:12, color:isSelected?T:TXT }}>{q.ref}</span>
                        </td>
                        <td style={{ padding:'11px 14px', fontSize:13, color:TXT, fontWeight:isSelected?600:400 }}>{q.customer}</td>
                        <td style={{ padding:'11px 14px', fontSize:13, color:T2 }}>{q.type}</td>
                        <td style={{ padding:'11px 14px' }}><Chip label={q.status} color={ss.color} bg={ss.bg} /></td>
                        <td style={{ padding:'11px 14px', display: isMobile ? 'none' : undefined }}><Chip label={q.priority} color={ps.color} bg={ps.bg} /></td>
                        <td style={{ padding:'11px 14px', textAlign:'center', display: isMobile ? 'none' : undefined }}>
                          <Icon n={q.stp?'check_circle':'cancel'} size={17} color={q.stp?'#2E7D32':'#C62828'} />
                        </td>
                        <td style={{ padding:'11px 14px', fontSize:13, fontWeight:600, color:TXT }}>${q.amount.toLocaleString()}</td>
                        <td style={{ padding:'11px 14px', fontSize:13, color:T2 }}>{q.age}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ padding:'10px 16px', borderTop:`1px solid ${BDR}`, fontSize:12, color:T2 }}>
              Showing {filtered.length} of {ALL_CLAIMS.length} claims
            </div>
          </Card>

          {/* Dynamic insight panel — desktop side-by-side, tablet/mobile below */}
          {(isMobile || isTablet) ? (
            showInsight && selected ? (
              <div style={{ position:'relative' }}>
                <button onClick={() => setShowInsight(false)} style={{ position:'absolute', top:8, right:8, zIndex:10, background:'transparent', border:'none', cursor:'pointer' }}>
                  <Icon n="close" size={18} color={T2} />
                </button>
                <InsightPanel claim={selected} onOpen={claim => { setShowInsight(false); onOpenClaim(claim); }} />
              </div>
            ) : null
          ) : (
            <InsightPanel claim={selected} onOpen={claim => onOpenClaim(claim)} />
          )}
        </div>
        {/* Mobile: View Insights button */}
        {(isMobile || isTablet) && selected && !showInsight && (
          <div style={{ padding:'12px 0', display:'flex', justifyContent:'center' }}>
            <button onClick={() => setShowInsight(true)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 24px', background:T, color:W, border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer' }}>
              <Icon n="insights" size={16} color={W} />View Insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: Claim Notification + Registration
═══════════════════════════════════════════════════════════════ */
function ClaimView({ claimRef, activeTab, setActiveTab, onNext }) {
  const { isMobile, isTablet } = useBp();
  const d = DETAIL;
  return (
    <div style={{ flex:1, background:BG, overflowY:'auto' }}>
      <div style={{ background:'#1A2A3A', padding: isMobile ? '12px 14px' : '14px 28px', display:'flex', alignItems:'flex-start', gap:12 }}>
        <Icon n="info" size={18} color={TL} style={{ marginTop:2 }} />
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.88)', lineHeight:1.65 }}>
          <strong style={{ color:W }}>Exposure Summary — </strong>
          Customer reported lost baggage on a multi-leg journey (SIN → LHR → CDG). SkyBridge Air confirmed delayed baggage status. PIR filed 13 Jan 2025.{' '}
          <strong style={{ color:'#7BE0C8' }}>Estimated exposure: $1,200 against a $1,500 policy limit.</strong>
        </div>
      </div>
      <div style={{ padding: isMobile ? '16px 12px' : '24px 28px' }}>
        {/* Tabs */}
        <div style={{ display:'flex', marginBottom:24, background:W, borderRadius:10, border:`1px solid ${BDR}`, overflow:'hidden', width:'fit-content' }}>
          {[{id:'notification',label:'Claim Notification',icon:'notifications_active'},{id:'registration',label:'Claim Registration',icon:'app_registration'}].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ display:'flex', alignItems:'center', gap:8, padding: isMobile ? '10px 14px' : '12px 24px', border:'none', cursor:'pointer',
                fontSize: isMobile ? 12 : 14, fontWeight:activeTab===tab.id?700:400,
                background:activeTab===tab.id?T:W, color:activeTab===tab.id?W:T2, transition:'all 0.15s' }}>
              <Icon n={tab.icon} size={16} color={activeTab===tab.id?W:T2} />{tab.label}
            </button>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 300px', gap:20 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {activeTab==='notification' && <>
              <Card>
                <SecTitle icon="flight">Flight & Baggage Details</SecTitle>
                <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:'4px 20px' }}>
                  <InfoRow label="Route"          value={d.customer.destination} />
                  <InfoRow label="Travel Dates"   value={d.customer.tripDates}   />
                  <InfoRow label="Airline"        value={d.customer.airline}     />
                  <InfoRow label="Flight Numbers" value={d.customer.flightNumber}/>
                  <InfoRow label="Baggage"        value={d.customer.baggage}     />
                  <InfoRow label="PIR Reference"  value={d.customer.pirRef} mono />
                  <InfoRow label="PIR Filed"      value={d.customer.pirDate}     />
                  <InfoRow label="Loss Location"  value="London Heathrow (LHR)"  />
                </div>
              </Card>
              <Card>
                <SecTitle icon="description">Airline PIR Report</SecTitle>
                <div style={{ background:BG, borderRadius:8, padding:'14px 16px', fontSize:13, color:TXT, lineHeight:1.7, marginBottom:12 }}>
                  <div style={{ fontWeight:700, color:T, marginBottom:6 }}>Property Irregularity Report · {d.customer.pirRef}</div>
                  <p style={{ margin:'0 0 8px' }}>Passenger reported two checked baggage items (total 28 kg) not delivered at destination Charles de Gaulle Airport following connecting flight from London Heathrow.</p>
                  <p style={{ margin:0 }}>Airline records confirm bags were last scanned at LHR Terminal 5 on 13 Jan 2025, 14:22 UTC. Tracer initiated. Bags not located as of claim submission date.</p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <Chip label="Confirmed by Airline"    icon="verified" bg="#E8F5E9" color="#2E7D32" />
                  <Chip label="PIR Filed Within 7 Days" icon="check"    bg={TL}     color={T}        />
                </div>
              </Card>
            </>}
            {activeTab==='registration' && <>
              <Card>
                <SecTitle icon="person">Customer Profile</SecTitle>
                <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:'4px 20px' }}>
                  <InfoRow label="Customer Name" value={d.customer.name}  />
                  <InfoRow label="Customer ID"   value={d.customer.id} mono />
                  <InfoRow label="Email"         value={d.customer.email} />
                  <InfoRow label="Phone"         value={d.customer.phone} />
                </div>
              </Card>
              <Card>
                <SecTitle icon="policy">Policy Details</SecTitle>
                <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:'4px 20px' }}>
                  <InfoRow label="Policy Number" value={d.customer.policyNumber} mono />
                  <InfoRow label="Plan Type"     value={d.customer.planType}     />
                  <InfoRow label="Baggage Limit" value={`$${d.financial.policyLimit.toLocaleString()}`} />
                  <InfoRow label="Policy Status" value="Active"                  />
                  <InfoRow label="Coverage Dates"value={d.customer.tripDates}    />
                  <InfoRow label="Destination"   value="Worldwide"               />
                </div>
                <div style={{ marginTop:12 }}>
                  <Chip label="Coverage Verified" icon="verified" bg="#E8F5E9" color="#2E7D32" />
                </div>
              </Card>
            </>}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Card>
              <SecTitle icon="receipt_long">Claim Summary</SecTitle>
              <InfoRow label="Claim Reference" value={claimRef} mono />
              <InfoRow label="Submitted"       value={d.submitted}  />
              <InfoRow label="Claim Type"      value="Travel – Lost Baggage" />
              <Hr />
              <InfoRow label="Claimed Amount"  value={`$${d.financial.claimed}`} />
              <InfoRow label="Policy Limit"    value={`$${d.financial.policyLimit}`} />
              <Hr />
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <Chip label="Pending Assessment" icon="pending" bg="#FFF4E5" color="#E57C00" />
                <Chip label="STP Ineligible"     icon="cancel"  bg="#FFEBEE" color="#C62828" />
              </div>
            </Card>
            <Btn onClick={onNext} icon="arrow_forward" style={{ justifyContent:'center' }}>View Full Claim Details</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: Claims Assessment
═══════════════════════════════════════════════════════════════ */
function AssessmentView({ onRiskPanel, onNext }) {
  const { isMobile, isTablet } = useBp();
  return (
    <div style={{ flex:1, background:BG, overflowY:'auto', padding: isMobile ? '16px 12px' : '24px 28px' }}>
      <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr 300px', gap:20 }}>
        <Card>
          <SecTitle icon="summarize">Assessment Summary</SecTitle>
          <div style={{ fontSize:11, color:T2, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Coverage Validation</div>
          {['Policy active at date of loss','Claimant is named insured','Loss event covered under plan','PIR filed within required period'].map((item,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
              <Icon n="check_circle" size={16} color="#2E7D32" />
              <span style={{ fontSize:13, color:TXT }}>{item}</span>
            </div>
          ))}
          <Hr />
          <InfoRow label="Policy Limit"   value="$1,500.00" />
          <InfoRow label="Claimed Amount" value="$1,200.00" />
          <InfoRow label="Within Limit"   value="✔ Yes ($300 headroom)" />
          <InfoRow label="Deductible"     value="$0 (waived under plan)" />
        </Card>
        <Card>
          <SecTitle icon="recommend">Assessment Recommendation</SecTitle>
          <div style={{ background:TL, border:`1px solid ${T}`, borderRadius:10, padding:'16px', marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:T, marginBottom:4 }}>Recommended Approval</div>
            <div style={{ fontSize:34, fontWeight:800, color:T, marginBottom:4 }}>$1,050</div>
            <div style={{ fontSize:12, color:T2 }}>Based on depreciation schedule and submitted receipts</div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:12, color:T2 }}>Confidence Score</span>
              <span style={{ fontSize:12, fontWeight:700, color:T }}>87%</span>
            </div>
            <div style={{ background:BDR, borderRadius:20, height:8 }}>
              <div style={{ width:'87%', height:'100%', background:T, borderRadius:20 }} />
            </div>
          </div>
          <div style={{ fontSize:12, color:T2, lineHeight:1.65 }}>
            Depreciation applied to clothing (8%) and electronics (25%). Toiletries approved in full. Electronics item downgraded — receipt not provided.
          </div>
        </Card>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Card>
            <SecTitle icon="find_in_page">Supporting Data</SecTitle>
            {[{label:'Baggage tracking log',icon:'track_changes',note:'Confirmed'},{label:'Prior claims history',icon:'history',note:'1 prior claim'},{label:'Purchase receipts',icon:'shopping_bag',note:'Partial'},{label:'Airline correspondence',icon:'email',note:'On file'}].map((d,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Icon n={d.icon} size={15} color={T} />
                  <span style={{ fontSize:13, color:TXT }}>{d.label}</span>
                </div>
                <span style={{ fontSize:11, color:T2 }}>{d.note}</span>
              </div>
            ))}
          </Card>
          <Btn onClick={onRiskPanel} variant="secondary" icon="shield" style={{ justifyContent:'center' }}>Customer Risk Assessment</Btn>
          <Btn onClick={onNext} icon="arrow_forward" style={{ justifyContent:'center' }}>Review Line Items</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PANEL: Risk Assessment
═══════════════════════════════════════════════════════════════ */
function RiskPanel({ onClose, onProceed }) {
  const d = DETAIL;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1000, display:'flex', justifyContent:'flex-end' }} onClick={onClose}>
      <div style={{ width:420, background:W, display:'flex', flexDirection:'column', boxShadow:'-4px 0 20px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        <div style={{ background:'#1A2A3A', padding:'18px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Icon n="shield" size={20} color={TL} />
            <span style={{ fontSize:16, fontWeight:700, color:W }}>Customer Risk Assessment</span>
          </div>
          <button onClick={onClose} style={{ border:'none', background:'transparent', cursor:'pointer' }}>
            <Icon n="close" size={20} color="rgba(255,255,255,0.6)" />
          </button>
        </div>
        <div style={{ padding:'24px', flex:1, overflowY:'auto' }}>
          <div style={{ fontSize:13, color:T2, marginBottom:20 }}>
            <strong style={{ color:TXT }}>{d.customer.name}</strong> · {d.customer.policyNumber}
          </div>
          <SecTitle icon="bar_chart">Risk Indicators</SecTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
            {[
              {label:'Claim Frequency',   value:'Low',     icon:'trending_flat',  color:'#2E7D32',bg:'#E8F5E9'},
              {label:'Fraud Risk Score',  value:'12% — Low',icon:'security',      color:'#2E7D32',bg:'#E8F5E9'},
              {label:'Behavioural Pattern',value:'Normal', icon:'person_outline', color:'#2E7D32',bg:'#E8F5E9'},
              {label:'Prior Claims',      value:'1 claim', icon:'history',        color:'#E57C00',bg:'#FFF4E5'},
            ].map((r,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', background:BG, borderRadius:8, border:`1px solid ${BDR}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Icon n={r.icon} size={16} color={T2} />
                  <span style={{ fontSize:13, color:TXT }}>{r.label}</span>
                </div>
                <Chip label={r.value} color={r.color} bg={r.bg} />
              </div>
            ))}
          </div>
          <Hr />
          <SecTitle icon="notes">Pattern Analysis Note</SecTitle>
          <div style={{ background:TL, border:`1px solid ${T}`, borderRadius:8, padding:'14px 16px', fontSize:13, color:TXT, lineHeight:1.7, marginBottom:20 }}>
            {d.risk.note}
          </div>
          <div style={{ marginBottom:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color:T2, textTransform:'uppercase', letterSpacing:'0.05em' }}>Fraud Risk Level</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#2E7D32' }}>12% — Low</span>
            </div>
            <div style={{ background:'#E8F5E9', borderRadius:20, height:10 }}>
              <div style={{ width:'12%', height:'100%', background:'#2E7D32', borderRadius:20 }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
              <span style={{ fontSize:11, color:'#2E7D32' }}>Low</span>
              <span style={{ fontSize:11, color:'#C62828' }}>High</span>
            </div>
          </div>
          <Btn onClick={() => { onClose(); onProceed(); }} icon="arrow_forward" style={{ width:'100%', justifyContent:'center' }}>Proceed to Decision</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: Reserve Analysis
═══════════════════════════════════════════════════════════════ */
function ReserveView({ onNext }) {
  const { isMobile, isTablet } = useBp();
  const [accepted, setAccepted] = useState(false);
  return (
    <div style={{ flex:1, background:BG, overflowY:'auto', padding: isMobile ? '16px 12px' : '24px 28px' }}>
      <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:20, maxWidth:940 }}>
        <Card>
          <SecTitle icon="gavel">Clauses Applied</SecTitle>
          {[
            {name:'Baggage Loss Coverage', detail:'Maximum benefit $1,500 per journey. Applies to checked baggage confirmed lost by carrier.', ok:true},
            {name:'Depreciation Clause',   detail:'Standard schedule: Electronics 25%/yr, Clothing 8%/yr from purchase date.', ok:true},
            {name:'Maximum Item Cap',      detail:'Single-item limit $500. No cap breached in this claim.', ok:true},
            {name:'Receipts Requirement',  detail:'Items over $200 require receipt. One electronics item submitted without — downgraded accordingly.', ok:false},
          ].map((c,i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:i<3?`1px solid ${BDR}`:'none' }}>
              <Icon n={c.ok?'check_circle':'info'} size={18} color={c.ok?'#2E7D32':'#E57C00'} style={{ marginTop:2 }} />
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:TXT, marginBottom:3 }}>{c.name}</div>
                <div style={{ fontSize:12, color:T2, lineHeight:1.6 }}>{c.detail}</div>
              </div>
            </div>
          ))}
        </Card>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Card>
            <SecTitle icon="account_balance">Reserve Analysis</SecTitle>
            <div style={{ display:'flex', gap:16, marginBottom:16 }}>
              <div style={{ flex:1, background:BG, borderRadius:8, padding:'14px', textAlign:'center' }}>
                <div style={{ fontSize:11, color:T2, fontWeight:600, marginBottom:4 }}>INITIAL RESERVE</div>
                <div style={{ fontSize:26, fontWeight:800, color:TXT }}>$1,200</div>
              </div>
              <div style={{ display:'flex', alignItems:'center' }}><Icon n="arrow_forward" size={20} color={T2} /></div>
              <div style={{ flex:1, background:TL, borderRadius:8, padding:'14px', textAlign:'center', border:`1px solid ${T}` }}>
                <div style={{ fontSize:11, color:T, fontWeight:600, marginBottom:4 }}>RECOMMENDED</div>
                <div style={{ fontSize:26, fontWeight:800, color:T }}>$1,050</div>
              </div>
            </div>
            <div style={{ fontSize:13, color:T2, lineHeight:1.6, marginBottom:16 }}>
              Reserve reduced by $150 after applying depreciation schedule and reviewing submitted receipts.
            </div>
            {accepted
              ? <Chip label="Reserve Accepted" icon="check_circle" bg="#E8F5E9" color="#2E7D32" />
              : <Btn onClick={() => setAccepted(true)} icon="check" style={{ width:'100%', justifyContent:'center' }}>Accept Reserve Recommendation</Btn>
            }
          </Card>
          {accepted && <Btn onClick={onNext} icon="arrow_forward" style={{ justifyContent:'center' }}>Continue to Computation Sheet</Btn>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: Computation Sheet
═══════════════════════════════════════════════════════════════ */
function ComputationView({ onNext }) {
  const { isMobile } = useBp();
  const items = DETAIL.items;
  const total = items.reduce((s,i) => s+i.approved, 0);
  return (
    <div style={{ flex:1, background:BG, overflowY:'auto', padding: isMobile ? '16px 12px' : '24px 28px' }}>
      <div style={{ maxWidth:840 }}>
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <SecTitle icon="calculate">Computation Sheet</SecTitle>
            <Chip label="Auto-Generated" icon="auto_awesome" bg={TL} color={T} />
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:20 }}>
            <thead>
              <tr style={{ background:BG }}>
                {['Item','Claimed','Note','Approved'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:h==='Claimed'||h==='Approved'?'right':'left', fontSize:11, fontWeight:700, color:T2, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`2px solid ${BDR}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item,i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${BDR}` }}>
                  <td style={{ padding:'13px 16px', fontSize:14, fontWeight:600, color:TXT }}>{item.name}</td>
                  <td style={{ padding:'13px 16px', textAlign:'right', fontSize:14, color:T2 }}>${item.claimed.toLocaleString()}</td>
                  <td style={{ padding:'13px 16px', fontSize:12, color:T2, fontStyle:'italic' }}>{item.note}</td>
                  <td style={{ padding:'13px 16px', textAlign:'right', fontSize:14, fontWeight:700, color:item.approved===item.claimed?'#2E7D32':T }}>${item.approved.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background:TL }}>
                <td colSpan={2} style={{ padding:'14px 16px', fontSize:14, fontWeight:700, color:T }}>Total Approved</td>
                <td />
                <td style={{ padding:'14px 16px', textAlign:'right', fontSize:22, fontWeight:800, color:T }}>${total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ flex:1, fontSize:13, color:T2, lineHeight:1.6 }}>
              Total approved: <strong style={{ color:T }}>$1,050.00</strong>. No escalation criteria triggered — within processor authority ($2,500 limit).
            </div>
            <Btn onClick={onNext} icon="done_all" style={{ flexShrink:0 }}>Finalise Assessment</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: Case Management
═══════════════════════════════════════════════════════════════ */
function CaseView({ onNext, processorName }) {
  const [note,       setNote]       = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [saveMsg,    setSaveMsg]    = useState('');
  const [attachments,setAttachments]= useState([]);
  const fileRef = useRef(null);

  const handleSave = () => {
    if (!note.trim()) return;
    setSavedNotes(prev => [...prev, { text: note.trim(), ts: new Date().toLocaleTimeString('en-SG', { hour:'2-digit', minute:'2-digit' }) + ' SGT' }]);
    setNote('');
    setSaveMsg('Note saved');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleAttach = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAttachments(prev => [...prev, ...files.map(f => f.name)]);
    e.target.value = '';
  };

  const { isMobile, isTablet } = useBp();
  return (
    <div style={{ flex:1, background:BG, overflowY:'auto', padding: isMobile ? '16px 12px' : '24px 28px' }}>
      <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 340px', gap:20 }}>
        <Card>
          <SecTitle icon="timeline">Case Timeline</SecTitle>
          <div style={{ position:'relative', paddingLeft:26 }}>
            <div style={{ position:'absolute', left:8, top:8, bottom:8, width:2, background:BDR }} />
            {DETAIL.timeline.map((ev,i) => {
              const label = ev.label.replace('Sarah Wong', processorName || 'Claims Processor');
              return (
                <div key={i} style={{ position:'relative', marginBottom:22 }}>
                  <div style={{ position:'absolute', left:-22, top:2, width:16, height:16, borderRadius:'50%',
                    background:ev.done?T:W, border:`2px solid ${ev.done?T:BDR}`,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {ev.done && <Icon n="check" size={10} color={W} />}
                  </div>
                  <div style={{ fontSize:12, color:T2, marginBottom:2 }}>{ev.time}</div>
                  <div style={{ fontSize:13, fontWeight:ev.done?600:400, color:ev.done?TXT:T2 }}>{label}</div>
                </div>
              );
            })}
          </div>
          <Hr />
          <div style={{ background:'#FFF4E5', border:'1px solid #FFD9A0', borderRadius:8, padding:'12px 14px' }}>
            <div style={{ display:'flex', gap:8 }}>
              <Icon n="info_outline" size={16} color="#8C4D00" style={{ marginTop:1 }} />
              <div style={{ fontSize:12, color:'#8C4D00', lineHeight:1.65 }}>
                <strong>Escalation Check:</strong> Approved amount ($1,050) within processor authority ($2,500). Supervisor review not required. Proceeds to payment.
              </div>
            </div>
          </div>
        </Card>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Card>
            <SecTitle icon="sticky_note_2">Processor Notes</SecTitle>
            {savedNotes.length > 0 && (
              <div style={{ marginBottom:10, display:'flex', flexDirection:'column', gap:6 }}>
                {savedNotes.map((n,i) => (
                  <div key={i} style={{ background:TL, borderRadius:7, padding:'8px 12px', fontSize:12, color:TXT, lineHeight:1.5 }}>
                    <div style={{ marginBottom:2, color:T2, fontSize:11 }}>{n.ts}</div>
                    {n.text}
                  </div>
                ))}
              </div>
            )}
            {attachments.length > 0 && (
              <div style={{ marginBottom:10, display:'flex', flexDirection:'column', gap:4 }}>
                {attachments.map((name,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:T2 }}>
                    <Icon n="attach_file" size={14} color={T} />{name}
                  </div>
                ))}
              </div>
            )}
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Add internal notes..."
              style={{ width:'100%', minHeight:100, border:`1px solid ${BDR}`, borderRadius:8, padding:'10px 12px', fontSize:13, color:TXT, resize:'vertical', fontFamily:'inherit', boxSizing:'border-box', outline:'none' }} />
            {saveMsg && <div style={{ fontSize:12, color:'#2E7D32', marginTop:4 }}>{saveMsg}</div>}
            <div style={{ marginTop:8, display:'flex', gap:8 }}>
              <input ref={fileRef} type="file" multiple style={{ display:'none' }} onChange={handleAttach} />
              <Btn variant="ghost" icon="attach_file" onClick={() => fileRef.current?.click()} style={{ fontSize:12, padding:'6px 12px' }}>Attach</Btn>
              <Btn variant="ghost" icon="save" onClick={handleSave} style={{ fontSize:12, padding:'6px 12px' }}>Save</Btn>
            </div>
          </Card>
          <Card>
            <SecTitle icon="assignment_turned_in">Assessment Checklist</SecTitle>
            {['Coverage verified','Risk assessment completed','Reserve analysis accepted','Computation sheet finalised','No escalation required'].map((s,i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                <Icon n="check_circle" size={16} color="#2E7D32" />
                <span style={{ fontSize:13, color:TXT }}>{s}</span>
              </div>
            ))}
          </Card>
          <Btn onClick={onNext} icon="payments" style={{ justifyContent:'center' }}>Move to Payment</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: Payment
═══════════════════════════════════════════════════════════════ */
function PaymentView({ onNext }) {
  const [selected, setSelected] = useState('wallet');
  const methods = [
    {id:'wallet', label:'Digital Wallet',         icon:'account_balance_wallet', detail:'GrabPay / PayNow · Instant',            note:'Recommended'},
    {id:'bank',   label:'Bank Transfer',          icon:'account_balance',        detail:'FAST · 1–2 business days',              note:''},
    {id:'credit', label:'Airline Partner Credit', icon:'flight',                 detail:'SkyBridge Air travel credit · 3 days', note:''},
  ];
  const speed = {wallet:'Instant',bank:'1–2 Business Days',credit:'3 Business Days'};
  const { isMobile, isTablet } = useBp();
  return (
    <div style={{ flex:1, background:BG, overflowY:'auto', padding: isMobile ? '16px 12px' : '24px 28px' }}>
      <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 320px', gap:20, maxWidth:900 }}>
        <Card>
          <SecTitle icon="payments">Payment Method</SecTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {methods.map(m => (
              <div key={m.id} onClick={() => setSelected(m.id)}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:10,
                  border:`2px solid ${selected===m.id?T:BDR}`, background:selected===m.id?TL:W, cursor:'pointer', transition:'all 0.15s' }}>
                <div style={{ width:40, height:40, borderRadius:10, background:selected===m.id?T:BG, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon n={m.icon} size={20} color={selected===m.id?W:T2} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:TXT }}>{m.label}</div>
                  <div style={{ fontSize:12, color:T2 }}>{m.detail}</div>
                </div>
                {m.note && <Chip label={m.note} bg={TL} color={T} />}
                <Icon n={selected===m.id?'radio_button_checked':'radio_button_unchecked'} size={20} color={selected===m.id?T:BDR} />
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Card>
            <SecTitle icon="receipt">Payment Preview</SecTitle>
            <InfoRow label="Claim Reference" value={DETAIL.ref} mono />
            <InfoRow label="Payee"           value={DETAIL.customer.name} />
            <Hr />
            <InfoRow label="Approved Amount" value="$1,050.00" />
            <InfoRow label="Processing Fee"  value="$0.00" />
            <Hr />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:15, fontWeight:700, color:TXT }}>Total Payment</span>
              <span style={{ fontSize:24, fontWeight:800, color:T }}>$1,050.00</span>
            </div>
            <div style={{ marginTop:12 }}>
              <Chip label={speed[selected]} icon="schedule" bg={selected==='wallet'?TL:'#FFF4E5'} color={selected==='wallet'?T:'#E57C00'} />
            </div>
          </Card>
          <Btn onClick={onNext} icon="check_circle" variant="success" style={{ justifyContent:'center', fontSize:15 }}>Approve &amp; Pay</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: Post-Payment
═══════════════════════════════════════════════════════════════ */
function CompleteView({ onAnalytics }) {
  const { isMobile, isTablet } = useBp();
  const [recoveryInitiated, setRecoveryInitiated] = useState(false);
  const d = DETAIL;
  return (
    <div style={{ flex:1, background:BG, overflowY:'auto', padding: isMobile ? '16px 12px' : '24px 28px' }}>
      <div style={{ maxWidth:920 }}>
        <div style={{ background:'#E8F5E9', border:'1px solid #A5D6A7', borderRadius:12, padding:'18px 24px', marginBottom:24, display:'flex', gap:16, alignItems:'flex-start' }}>
          <Icon n="check_circle" size={32} color="#2E7D32" />
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'#1B5E20', marginBottom:4 }}>Payment Approved & Processed</div>
            <div style={{ fontSize:14, color:'#2E7D32' }}>$1,050.00 disbursed to {d.customer.name} via Digital Wallet (PayNow). Claim {d.ref} settled.</div>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:20, marginBottom:20 }}>
          <Card>
            <SecTitle icon="send">Customer Notification</SecTitle>
            <div style={{ background:BG, borderRadius:8, padding:'12px 14px', fontSize:13, color:TXT, lineHeight:1.7, marginBottom:12 }}>
              <strong>Email sent to {d.customer.email}:</strong><br />
              "Dear {d.customer.name}, your travel insurance claim ({d.ref}) for lost baggage has been approved. A payment of SGD 1,050 has been processed to your registered PayNow account."
            </div>
            <Chip label="Notification Sent" icon="done_all" bg="#E8F5E9" color="#2E7D32" />
          </Card>
          <Card>
            <SecTitle icon="star_rate">Claims Experience Survey</SecTitle>
            <div style={{ fontSize:13, color:T2, lineHeight:1.65, marginBottom:14 }}>
              A satisfaction survey has been sent. Responses are captured in the feedback loop and reported regionally.
            </div>
            <InfoRow label="Survey channel"  value="Email + App push" />
            <InfoRow label="Questions"       value="4 (CSAT, NPS, ease)" />
            <InfoRow label="Response window" value="7 days" />
            <Chip label="Survey Triggered" icon="send" bg={TL} color={T} />
          </Card>
        </div>
        <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:20, marginBottom:24 }}>
          <Card>
            <SecTitle icon="card_giftcard">Value Added Services</SecTitle>
            {[
              {icon:'flight_takeoff',title:'Travel Protection Upgrade',  desc:'Upgrade to Premium Travel plan with enhanced baggage coverage ($3,000 limit) and worldwide medical.'},
              {icon:'luggage',       title:'Baggage Tracking Add-On',    desc:'Real-time baggage monitoring and instant alerts on all future checked luggage via partner integration.'},
            ].map((svc,i) => (
              <div key={i} style={{ display:'flex', gap:12, padding:'12px', background:BG, borderRadius:8, border:`1px solid ${BDR}`, marginBottom:i===0?10:0 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:TL, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon n={svc.icon} size={18} color={T} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:TXT, marginBottom:4 }}>{svc.title}</div>
                  <div style={{ fontSize:12, color:T2, lineHeight:1.5, marginBottom:8 }}>{svc.desc}</div>
                  <Btn variant="secondary" style={{ fontSize:12, padding:'5px 12px' }}>Send Offer</Btn>
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <SecTitle icon="account_balance">Claims Recovery</SecTitle>
            <div style={{ background:'#EEF5FF', border:'1px solid #BBDEFB', borderRadius:8, padding:'14px', marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#0D47A1', marginBottom:6 }}>Airline Liability Identified</div>
              <div style={{ fontSize:13, color:'#1565C0', lineHeight:1.65 }}>
                Under the Montreal Convention, {d.recovery.party} bears partial liability. A recovery of <strong>${d.recovery.amount}</strong> is applicable.
              </div>
            </div>
            <InfoRow label="Recovery Party"    value={d.recovery.party}  />
            <InfoRow label="Recoverable Amount"value={`$${d.recovery.amount}`} />
            <InfoRow label="Legal Basis"       value={d.recovery.basis}  />
            <div style={{ marginTop:14 }}>
              {recoveryInitiated
                ? <Chip label="Recovery Process Initiated" icon="check_circle" bg="#E8F5E9" color="#2E7D32" />
                : <Btn onClick={() => setRecoveryInitiated(true)} icon="arrow_forward" variant="secondary" style={{ width:'100%', justifyContent:'center' }}>Initiate Recovery Process</Btn>
              }
            </div>
          </Card>
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
          <Btn onClick={onAnalytics} variant="ghost" icon="analytics">Portfolio Analytics</Btn>
          <Btn variant="success" icon="check_circle">Close Claim</Btn>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEW: Analytics
═══════════════════════════════════════════════════════════════ */
function AnalyticsView({ processorName, onBack }) {
  const { isMobile, isTablet } = useBp();
  const [tab, setTab] = useState('mine');

  /* ── My Performance data (filtered by current persona) ── */
  const myClaims   = ALL_CLAIMS.filter(c => c.assignedTo === processorName);
  const myTotal    = myClaims.length;
  const myResolved = myClaims.filter(c => c.status === 'Closed').length;
  const myPending  = myClaims.filter(c => c.status === 'Pending Assessment').length;
  const myInReview = myClaims.filter(c => c.status === 'In Review').length;
  const myExposure = myClaims.reduce((s, c) => s + c.amount, 0);
  const myAvgExp   = myTotal ? Math.round(myExposure / myTotal) : 0;
  const teamAvgExp = Math.round(ALL_CLAIMS.reduce((s,c)=>s+c.amount,0) / ALL_CLAIMS.length);

  const typeCount = myClaims.reduce((acc, c) => { acc[c.type] = (acc[c.type]||0)+1; return acc; }, {});
  const typeRows  = Object.entries(typeCount).sort((a,b)=>b[1]-a[1]);

  /* ── Portfolio data ── */
  const airlines = [
    {name:'SkyBridge Air',    claims:34, exposure:'$42,100', ratio:68},
    {name:'AsiaStar Airways', claims:21, exposure:'$27,800', ratio:54},
    {name:'EastWest Airlines',claims:18, exposure:'$23,400', ratio:61},
    {name:'GulfPath Airlines',claims:15, exposure:'$19,500', ratio:72},
    {name:'EuroJet Airways',  claims:9,  exposure:'$11,200', ratio:49},
  ];
  const ratioStyle = r => r>=70?{color:'#C62828',bg:'#FFEBEE'}:r>=60?{color:'#E57C00',bg:'#FFF4E5'}:{color:'#2E7D32',bg:'#E8F5E9'};

  const tabBtn = (id, label, icon) => (
    <button onClick={() => setTab(id)} style={{
      display:'flex', alignItems:'center', gap:6, padding:'8px 18px',
      border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600,
      background: tab===id ? T : 'transparent',
      color:       tab===id ? W : T2,
      transition: 'all 0.15s',
    }}>
      <Icon n={icon} size={15} color={tab===id ? W : T2} />{label}
    </button>
  );

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:BG, overflow:'hidden' }}>
      {/* Page header */}
      <div style={{ background:W, borderBottom:`1px solid ${BDR}`, padding: isMobile ? '10px 14px' : '12px 28px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:TL, border:`1px solid ${T}`, borderRadius:8, cursor:'pointer', color:T, fontSize:13, fontWeight:700, padding:'6px 12px' }}>
          <Icon n="arrow_back" size={16} color={T} />Work Queue
        </button>
        <Icon n="chevron_right" size={16} color={BDR} />
        <span style={{ fontSize:13, fontWeight:700, color:TXT }}>Analytics</span>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '16px 12px' : '24px 28px' }}>
      {/* Tab switcher */}
      <div style={{ display:'flex', gap:4, background:W, borderRadius:10, padding:4, border:`1px solid ${BDR}`, width:'fit-content', marginBottom:20 }}>
        {tabBtn('mine',      'My Performance',    'person')}
        {tabBtn('portfolio', 'Portfolio Overview', 'bar_chart')}
      </div>

      {/* ── MY PERFORMANCE ── */}
      {tab === 'mine' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={{ display:'grid', gridTemplateColumns: isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:16 }}>
            {[
              {label:'Assigned Today',  value:myTotal,                    icon:'assignment',       color:T,         bg:TL},
              {label:'Resolved Today',  value:myResolved,                 icon:'task_alt',         color:'#2E7D32', bg:'#E8F5E9'},
              {label:'Pending Review',  value:myPending + myInReview,     icon:'pending_actions',  color:'#E57C00', bg:'#FFF4E5'},
              {label:'Avg Exposure',    value:`$${myAvgExp.toLocaleString()}`, icon:'account_balance', color:'#1B75BB', bg:'#EEF5FF'},
            ].map(k => (
              <Card key={k.label} pad={16}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontSize:26, fontWeight:800, color:TXT, marginBottom:4 }}>{k.value}</div>
                    <div style={{ fontSize:12, color:T2 }}>{k.label}</div>
                  </div>
                  <div style={{ width:40, height:40, borderRadius:10, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon n={k.icon} size={20} color={k.color} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:16 }}>
            {/* Claim type breakdown */}
            <Card pad={0}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${BDR}` }}>
                <span style={{ fontSize:14, fontWeight:700, color:TXT }}>My Claims by Type</span>
              </div>
              <div style={{ padding:'12px 0' }}>
                {typeRows.map(([type, count]) => (
                  <div key={type} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 20px' }}>
                    <div style={{ flex:1, fontSize:13, color:TXT }}>{type}</div>
                    <div style={{ width:80, height:6, borderRadius:3, background:BDR, overflow:'hidden' }}>
                      <div style={{ width:`${(count/myTotal)*100}%`, height:'100%', background:T, borderRadius:3 }} />
                    </div>
                    <div style={{ width:20, textAlign:'right', fontSize:13, fontWeight:600, color:TXT }}>{count}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* vs Team average */}
            <Card pad={16}>
              <SecTitle icon="compare_arrows">vs Team Average</SecTitle>
              <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:8 }}>
                {[
                  {label:'My Avg Exposure',   value:`$${myAvgExp.toLocaleString()}`,    color:TXT},
                  {label:'Team Avg Exposure',  value:`$${teamAvgExp.toLocaleString()}`,  color:T2},
                  {label:'Resolution Rate',    value:`${myTotal ? Math.round(myResolved/myTotal*100) : 0}%`, color:myResolved/myTotal >= 0.3 ? '#2E7D32' : '#E57C00'},
                  {label:'STP Eligible',       value:myClaims.filter(c=>c.stp).length + ' claims',           color:'#8B5CF6'},
                ].map(r => (
                  <InfoRow key={r.label} label={r.label} value={<span style={{ color:r.color, fontWeight:600 }}>{r.value}</span>} />
                ))}
              </div>
            </Card>
          </div>

          {/* My claims list */}
          <Card pad={0}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${BDR}` }}>
              <span style={{ fontSize:14, fontWeight:700, color:TXT }}>My Claims — Today</span>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:BG }}>
                  {['Ref','Customer','Type','Status','Amount'].map(h => (
                    <th key={h} style={{ padding:'9px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T2, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${BDR}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myClaims.map((c,i) => {
                  const ss = statusStyle(c.status);
                  return (
                    <tr key={i} style={{ borderBottom:`1px solid ${BDR}` }}>
                      <td style={{ padding:'10px 20px', fontSize:12, fontWeight:600, color:T, fontFamily:'monospace' }}>{c.ref}</td>
                      <td style={{ padding:'10px 20px', fontSize:13, color:TXT }}>{c.customer}</td>
                      <td style={{ padding:'10px 20px', fontSize:13, color:T2 }}>{c.type}</td>
                      <td style={{ padding:'10px 20px' }}><Chip label={c.status} color={ss.color} bg={ss.bg} /></td>
                      <td style={{ padding:'10px 20px', fontSize:13, fontWeight:600, color:TXT }}>${c.amount.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ── PORTFOLIO OVERVIEW ── */}
      {tab === 'portfolio' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={{ display:'grid', gridTemplateColumns: isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:16 }}>
            {[
              {label:'Baggage Claims MTD',   value:String(ALL_CLAIMS.filter(c=>c.type.includes('Baggage')).length + 92),  icon:'luggage',       color:T,         bg:TL},
              {label:'Total Exposure MTD',   value:'$124.6K',                    icon:'account_balance',color:'#1B75BB',bg:'#EEF5FF'},
              {label:'STP Rate',             value:`${Math.round(ALL_CLAIMS.filter(c=>c.stp).length/ALL_CLAIMS.length*100)}%`, icon:'bolt', color:'#8B5CF6',bg:'#F3EEFF'},
              {label:'Portfolio Loss Ratio', value:'63%',                         icon:'show_chart',    color:'#E57C00', bg:'#FFF4E5'},
            ].map(k => (
              <Card key={k.label} pad={16}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontSize:26, fontWeight:800, color:TXT, marginBottom:4 }}>{k.value}</div>
                    <div style={{ fontSize:12, color:T2 }}>{k.label}</div>
                  </div>
                  <div style={{ width:40, height:40, borderRadius:10, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon n={k.icon} size={20} color={k.color} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Card pad={0}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${BDR}` }}>
              <span style={{ fontSize:14, fontWeight:700, color:TXT }}>Exposure by Airline — Baggage Claims (Month to Date)</span>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:BG }}>
                  {['Airline','Claims','Total Exposure','Loss Ratio','Trend'].map(h => (
                    <th key={h} style={{ padding:'9px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:T2, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:`1px solid ${BDR}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {airlines.map((a,i) => {
                  const rs = ratioStyle(a.ratio);
                  return (
                    <tr key={i} style={{ borderBottom:`1px solid ${BDR}` }}>
                      <td style={{ padding:'12px 20px', fontSize:14, fontWeight:600, color:TXT }}>{a.name}</td>
                      <td style={{ padding:'12px 20px', fontSize:13, color:TXT }}>{a.claims}</td>
                      <td style={{ padding:'12px 20px', fontSize:13, fontWeight:600, color:TXT }}>{a.exposure}</td>
                      <td style={{ padding:'12px 20px' }}><Chip label={`${a.ratio}%`} color={rs.color} bg={rs.bg} /></td>
                      <td style={{ padding:'12px 20px' }}><Icon n={a.ratio>=70?'trending_up':'trending_flat'} size={18} color={rs.color} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <div style={{ display:'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap:16 }}>
            {/* Claims by type */}
            <Card pad={0}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${BDR}` }}>
                <span style={{ fontSize:14, fontWeight:700, color:TXT }}>Claims by Type — Month to Date</span>
              </div>
              <div style={{ padding:'12px 0' }}>
                {[
                  {type:'Lost Baggage',      count:29, amount:'$34,200'},
                  {type:'Trip Cancellation', count:24, amount:'$61,400'},
                  {type:'Medical Emergency', count:18, amount:'$198,000'},
                  {type:'Flight Delay',      count:31, amount:'$9,800'},
                  {type:'Trip Interruption', count:16, amount:'$44,600'},
                  {type:'Travel Accident',   count:9,  amount:'$87,300'},
                  {type:'Baggage Delay',     count:22, amount:'$6,100'},
                ].map(r => (
                  <div key={r.type} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 20px' }}>
                    <div style={{ flex:1, fontSize:13, color:TXT }}>{r.type}</div>
                    <div style={{ width:90, height:6, borderRadius:3, background:BDR, overflow:'hidden' }}>
                      <div style={{ width:`${(r.count/31)*100}%`, height:'100%', background:T, borderRadius:3 }} />
                    </div>
                    <div style={{ width:24, textAlign:'right', fontSize:13, fontWeight:600, color:TXT }}>{r.count}</div>
                    <div style={{ width:64, textAlign:'right', fontSize:12, color:T2 }}>{r.amount}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Status distribution + avg resolution */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Card pad={16}>
                <SecTitle icon="donut_large">Status Distribution</SecTitle>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:8 }}>
                  {[
                    {label:'Pending Assessment', count:52, color:'#E57C00', bg:'#FFF4E5'},
                    {label:'In Review',          count:38, color:'#5C35CC', bg:'#F0EBFF'},
                    {label:'Pending Payment',    count:21, color:'#1B75BB', bg:'#EEF5FF'},
                    {label:'Closed',             count:38, color:'#2E7D32', bg:'#E8F5E9'},
                  ].map(s => {
                    const total = 149;
                    return (
                      <div key={s.label} style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:90, fontSize:12, color:TXT }}>{s.label}</div>
                        <div style={{ flex:1, height:8, borderRadius:4, background:BDR, overflow:'hidden' }}>
                          <div style={{ width:`${(s.count/total)*100}%`, height:'100%', background:s.color, borderRadius:4 }} />
                        </div>
                        <Chip label={String(s.count)} color={s.color} bg={s.bg} />
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card pad={16}>
                <SecTitle icon="timer">Avg Resolution Time</SecTitle>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:8 }}>
                  {[
                    {type:'Flight Delay',      time:'18 min',  note:'STP eligible'},
                    {type:'Baggage Delay',      time:'42 min',  note:'STP eligible'},
                    {type:'Lost Baggage',       time:'3.2 hrs', note:'Manual review'},
                    {type:'Trip Cancellation',  time:'5.8 hrs', note:'Manual review'},
                    {type:'Medical Emergency',  time:'9.1 hrs', note:'Senior sign-off'},
                  ].map(r => (
                    <div key={r.type} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 0', borderBottom:`1px solid ${BDR}` }}>
                      <span style={{ fontSize:12, color:TXT }}>{r.type}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:12, color:T2 }}>{r.note}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:TXT }}>{r.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════ */
export default function TravelDashboard() {
  const bp = useBreakpoint();
  const { isMobile, isTablet } = bp;
  const { user } = useApp();
  const processorName = user?.name || 'Sarah Johnson';

  const [activeView,   setActiveView]   = useState('queue');
  const [activeModule, setActiveModule] = useState('queue');
  const [activeTab,    setActiveTab]    = useState('notification');
  const [showRisk,     setShowRisk]     = useState(false);
  const [activeClaim,  setActiveClaim]  = useState(null);
  const [navOpen,      setNavOpen]      = useState(false);

  const go = (view, module) => {
    setActiveView(view);
    setActiveModule(module || view);
  };

  const handleModuleClick = (m) => {
    if (m.id === 'queue') {
      setActiveView('queue');
      setActiveModule('queue');
    } else {
      if (m.tab) setActiveTab(m.tab);
      go(m.view, m.id);
    }
  };

  const STATUS_TO_STEP = {
    'Pending Assessment': 0,
    'In Review':          4,
    'Pending Payment':    7,
    'Closed':             7,
  };

  const openClaim = (claim) => {
    setActiveClaim(claim);
    go('stepper', 'notification');
  };

  const claimRef = activeClaim?.ref || DETAIL.ref;

  const isStepperView   = activeView === 'stepper';
  const isQueueView     = activeView === 'queue';
  const isAnalyticsView = activeView === 'analytics';

  return (
    <BpCtx.Provider value={bp}>
    <div style={{ display:'flex', height:'100%', minHeight:0, fontFamily:'inherit' }}>
      {/* Workflow views: inline on desktop, overlay on mobile/tablet */}
      {!isQueueView && !isStepperView && !isAnalyticsView && (
        <LeftNav activeModule={activeModule} onModuleClick={m => { handleModuleClick(m); setNavOpen(false); }} userName={processorName} navOpen={navOpen} onNavToggle={() => setNavOpen(o => !o)} />
      )}
      {/* Queue view: overlay-only on mobile/tablet when open */}
      {isQueueView && navOpen && (
        <LeftNav activeModule={activeModule} onModuleClick={m => { handleModuleClick(m); setNavOpen(false); }} userName={processorName} navOpen={navOpen} onNavToggle={() => setNavOpen(o => !o)} />
      )}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0, overflow:'hidden' }}>
        {!isQueueView && !isStepperView && !isAnalyticsView && <ProgressBar currentStep={activeView} claimRef={claimRef} />}
        {!isQueueView && !isStepperView && !isAnalyticsView && (isMobile || isTablet) && (
          <div style={{ background:W, padding:'8px 14px', borderBottom:`1px solid ${BDR}`, display:'flex', alignItems:'center' }}>
            <button onClick={() => setNavOpen(o => !o)} style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, color:T2, fontSize:13, fontWeight:600 }}>
              <Icon n="menu" size={20} color={TXT} />Menu
            </button>
          </div>
        )}
        <div style={{ flex:1, minHeight:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {isQueueView                   && <QueueView      onOpenClaim={openClaim} navOpen={navOpen} onNavToggle={() => setNavOpen(o => !o)} onAnalytics={() => go('analytics','stp')} />}
          {isStepperView                 && <AgentStepper   claim={activeClaim} onBack={() => { setActiveView('queue'); setActiveModule('queue'); }} initialStep={STATUS_TO_STEP[activeClaim?.status] ?? 0} readOnly={activeClaim?.status === 'Closed'} />}
          {activeView==='claim'          && <ClaimView      claimRef={claimRef} activeTab={activeTab} setActiveTab={setActiveTab} onNext={() => go('assessment','assessment')} />}
          {activeView==='assessment'     && <AssessmentView onRiskPanel={() => setShowRisk(true)} onNext={() => go('reserve','assessment')} />}
          {activeView==='reserve'        && <ReserveView    onNext={() => go('computation','assessment')} />}
          {activeView==='computation'    && <ComputationView onNext={() => go('case','case')} />}
          {activeView==='case'           && <CaseView       onNext={() => go('payment','payment')} processorName={processorName} />}
          {activeView==='payment'        && <PaymentView    onNext={() => go('complete','stp')} />}
          {activeView==='complete'       && <CompleteView   onAnalytics={() => go('analytics','stp')} />}
          {isAnalyticsView               && <AnalyticsView  processorName={processorName} onBack={() => { setActiveView('queue'); setActiveModule('queue'); }} />}
        </div>
      </div>
      {showRisk && (
        <RiskPanel
          onClose={()  => setShowRisk(false)}
          onProceed={() => { setShowRisk(false); go('reserve','assessment'); }}
        />
      )}
    </div>
    </BpCtx.Provider>
  );
}
