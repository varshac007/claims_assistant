/**
 * Bloom Claims Assistant — Sales Pitch Deck Generator
 * Generates a professional PPTX using pptxgenjs
 * Run: node generate-pptx.mjs
 */

import PptxGenJS from 'pptxgenjs';

const pptx = new PptxGenJS();

// ── Brand Colors ──────────────────────────────────────────────────────────────
const BLUE    = '1B75BB';
const BLUE_DK = '0D2B52';
const ORANGE  = 'F6921E';
const GREEN   = '37A526';
const RED     = 'D02E2E';
const GRAY    = '58595B';
const LIGHT   = 'F5F5F5';
const WHITE   = 'FFFFFF';
const DARK    = '1A1A2E';

// ── Slide layout ─────────────────────────────────────────────────────────────
pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches

// ── Master background ────────────────────────────────────────────────────────
pptx.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: WHITE },
});

// ─── Helper: Add header band ──────────────────────────────────────────────────
function addHeader(slide, tag, bgColor = BLUE) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.65, fill: { color: bgColor }, line: { color: bgColor } });
  slide.addText(tag.toUpperCase(), { x: 0.5, y: 0, w: 8, h: 0.65, fontSize: 9, bold: true, color: 'FFFFFF', charSpacing: 3, valign: 'middle' });
  slide.addText('🌸 Bloom Claims Assistant', { x: 0, y: 0, w: 12.83, h: 0.65, fontSize: 12, bold: true, color: 'FFFFFF', align: 'right', valign: 'middle' });
}

// ─── Helper: Colored rectangle ───────────────────────────────────────────────
function rect(slide, x, y, w, h, color, opts = {}) {
  slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color }, line: { color }, ...opts });
}

// ─── Helper: Card box ────────────────────────────────────────────────────────
function card(slide, x, y, w, h, bgColor = 'F8F9FA', borderColor = 'E8E9EA') {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: bgColor },
    line: { color: borderColor, width: 1 },
    rectRadius: 0.08,
    shadow: { type: 'outer', color: '000000', opacity: 0.08, blur: 6, offset: 2, angle: 45 }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — COVER
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  // Full gradient background (simulate with two rects)
  rect(slide, 0, 0, '100%', '100%', BLUE_DK);
  // Diagonal overlay
  slide.addShape(pptx.ShapeType.rect, { x: 4, y: 0, w: 9.33, h: 7.5, fill: { color: BLUE, transparency: 40 }, line: { color: BLUE, transparency: 40 } });

  // Eyebrow
  slide.addText('DXC Technology  ·  Claims Management', { x: 0.6, y: 1.5, w: 8, h: 0.35, fontSize: 10, bold: true, color: 'FFFFFF', charSpacing: 4, transparency: 30 });

  // Title
  slide.addText('Bloom Claims\nAssistant', { x: 0.6, y: 1.9, w: 8.5, h: 2.2, fontSize: 54, bold: true, color: WHITE, fontFace: 'Calibri', breakLine: false });

  // Tagline
  slide.addText('AI-Powered Life & Annuity Claims Management\nProcess faster. Detect smarter. Settle confidently.', { x: 0.6, y: 4.15, w: 8, h: 0.9, fontSize: 16, color: 'CCDDEE', italic: false });

  // Badges
  const badges = ['🤖 AI-Driven', '⚡ STP Auto-Approval', '🔒 Fraud Detection', '📄 Document IDP', '🔗 ServiceNow Native'];
  badges.forEach((b, i) => {
    slide.addText(b, { x: 0.6 + i * 2.42, y: 5.3, w: 2.3, h: 0.38, fontSize: 10, bold: true, color: WHITE, fill: { color: BLUE }, line: { color: WHITE, transparency: 60 }, align: 'center', valign: 'middle', rectRadius: 0.15 });
  });

  // Logo / brand mark
  slide.addText('🌸 BLOOM', { x: 10.5, y: 6.8, w: 2.5, h: 0.5, fontSize: 14, bold: true, color: 'FFFFFF', align: 'right', transparency: 50 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — THE PROBLEM
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: 'FAFAFA' }, line: { color: 'FAFAFA' } });
  addHeader(slide, 'The Challenge');

  slide.addText('Claims Processing Is ', { x: 0.5, y: 0.8, w: 8, h: 0.7, fontSize: 30, bold: true, color: DARK });
  slide.addText('Broken', { x: 5.05, y: 0.8, w: 3, h: 0.7, fontSize: 30, bold: true, color: BLUE });

  // Orange accent line
  rect(slide, 0.5, 1.55, 0.6, 0.05, ORANGE);

  const pains = [
    ['⏱  Slow Cycle Times',         '20–30 days per claim. Manual reviews bottleneck payment timelines and frustrate beneficiaries at their most vulnerable.'],
    ['🔍  Reactive Fraud Detection', 'Fraud caught after-the-fact. No AI scoring, no proactive anomaly alerts until money has already moved.'],
    ['📋  Manual Document Review',   'Examiners re-key data from death certificates, W-9s, and claim forms — error-prone and time-consuming.'],
    ['🏚  Siloed Systems',           'Policy admin, claims, tax engine, and document management disconnected — constant re-keying, version conflicts.'],
    ['📊  No Risk Visibility',       'Managers lack real-time portfolio risk insight until month-end reports — by then it\'s too late to act.'],
    ['💸  Payment Leakage',          'Over-settlements, unrecovered subrogation, and missed related policies cost carriers millions annually.'],
  ];

  pains.forEach(([title, desc], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.4 + col * 4.28, y = 1.75 + row * 2.45;
    card(slide, x, y, 4.1, 2.25, WHITE, 'E8E9EA');
    rect(slide, x, y, 0.06, 2.25, RED);
    slide.addText(title, { x: x + 0.2, y: y + 0.15, w: 3.8, h: 0.45, fontSize: 12, bold: true, color: DARK });
    slide.addText(desc,  { x: x + 0.2, y: y + 0.6,  w: 3.8, h: 1.5,  fontSize: 10, color: GRAY, breakLine: true });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — SOLUTION OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  rect(slide, 0, 0, '100%', '100%', BLUE_DK);
  addHeader(slide, 'Our Solution', '162C4E');

  slide.addText('One Platform.', { x: 0.5, y: 0.8, w: 6, h: 0.65, fontSize: 32, bold: true, color: WHITE });
  slide.addText('End-to-End.', { x: 0.5, y: 1.45, w: 6, h: 0.65, fontSize: 32, bold: true, color: ORANGE });
  rect(slide, 0.5, 2.15, 0.6, 0.05, ORANGE);
  slide.addText('Bloom Claims Assistant unifies the entire claims lifecycle — from FNOL to payment — with AI intelligence at every step.', { x: 0.5, y: 2.3, w: 7, h: 0.7, fontSize: 14, color: 'AACCEE' });

  const pillars = [
    ['🤖', 'AI Claims Intelligence',   'Risk scoring, anomaly detection, next best actions, and analyst chat on every claim'],
    ['⚡', 'STP Automation',           '40% of claims auto-approved in 7–10 days with near-zero manual touchpoints'],
    ['📄', 'Document IDP',             'Auto-classify, extract, and validate documents with per-field confidence scoring'],
    ['🛡', 'Claim Guardian',           'Leakage detection, investment recovery, audit findings, and compliance tracking'],
    ['📊', 'Role-Based Analytics',     'Tailored dashboards for examiners, supervisors, and risk managers'],
    ['🔗', 'ServiceNow Native',        'OAuth 2.0 bi-directional sync — FNOL, work notes, AI findings — all real time'],
  ];

  pillars.forEach(([icon, title, desc], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.4 + col * 4.22, y = 3.15 + row * 1.95;
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 4.0, h: 1.75, fill: { color: BLUE, transparency: 80 }, line: { color: WHITE, transparency: 80 }, rectRadius: 0.1 });
    slide.addText(icon,  { x: x + 0.15, y: y + 0.18, w: 0.6, h: 0.6, fontSize: 22 });
    slide.addText(title, { x: x + 0.75, y: y + 0.18, w: 3.1, h: 0.45, fontSize: 13, bold: true, color: WHITE });
    slide.addText(desc,  { x: x + 0.2,  y: y + 0.7,  w: 3.65, h: 0.85, fontSize: 10, color: 'AACCEE', breakLine: true });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — ROLE-BASED DASHBOARDS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  rect(slide, 0, 0, '100%', '100%', LIGHT);
  addHeader(slide, 'Role-Based Dashboards');

  slide.addText('Every Role Gets ', { x: 0.5, y: 0.8, w: 8, h: 0.6, fontSize: 28, bold: true, color: DARK });
  slide.addText('Exactly', { x: 4.25, y: 0.8, w: 2.5, h: 0.6, fontSize: 28, bold: true, color: BLUE });
  slide.addText(' What They Need', { x: 6.2, y: 0.8, w: 5, h: 0.6, fontSize: 28, bold: true, color: DARK });
  rect(slide, 0.5, 1.45, 0.6, 0.05, ORANGE);

  const roles = [
    { name: 'Claims Examiner', person: 'Sarah Johnson', color: BLUE, items: ['Open & closed claims inventory (9 workflow buckets)', 'Multi-attribute filtering & real-time search', 'Claims Workbench with 12-tab detail view', 'STP vs. manual routing indicator per claim', 'Requirements tracker & document upload', 'AI Insights panel & risk score (0-100)', 'Next Best Actions & Claim Guardian tab'] },
    { name: 'Supervisor', person: 'Taylor Brooks', color: ORANGE, items: ['Team inventory with KPI cards overlay', 'Handler performance leaderboard (YTD metrics)', 'Cycle time, approval rate, STP % at a glance', 'Inventory by phase & workflow bucket drill-down', 'SLA monitoring & at-risk claim flags', 'Quality review & exception approvals (SIU)', 'Claims paid YTD & denial rate tracking'] },
    { name: 'Risk Manager', person: 'Morgan Reeves', color: '7B1FA2', items: ['Enterprise KPI overview — YTD volumes & amounts', 'Monthly claims & payment trend charts (6 months)', '4×4 Impact × Probability Risk Matrix', 'Coverage Gaps analysis with exposure amounts', 'Risk Heatmap — risk level vs. claim value grid', 'Disposition breakdown (STP auto vs. manual)', 'Fraud clusters & SLA breach visibility'] },
  ];

  roles.forEach((role, i) => {
    const x = 0.35 + i * 4.36;
    card(slide, x, 1.65, 4.1, 5.6, WHITE, 'E8E9EA');
    rect(slide, x, 1.65, 4.1, 0.07, role.color);
    slide.addText(role.name.toUpperCase(), { x: x + 0.15, y: 1.78, w: 3.8, h: 0.3, fontSize: 9, bold: true, color: role.color, charSpacing: 2 });
    slide.addText(role.person, { x: x + 0.15, y: 2.08, w: 3.8, h: 0.42, fontSize: 16, bold: true, color: DARK });
    role.items.forEach((item, j) => {
      slide.addText('• ' + item, { x: x + 0.15, y: 2.6 + j * 0.62, w: 3.8, h: 0.55, fontSize: 10, color: GRAY, breakLine: true });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — AI INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  rect(slide, 0, 0, '100%', '100%', 'F0F8FF');
  addHeader(slide, 'AI-Powered Intelligence');

  slide.addText('Intelligence Built Into ', { x: 0.5, y: 0.8, w: 9, h: 0.6, fontSize: 28, bold: true, color: DARK });
  slide.addText('Every Claim', { x: 5.75, y: 0.8, w: 4, h: 0.6, fontSize: 28, bold: true, color: BLUE });
  rect(slide, 0.5, 1.45, 0.6, 0.05, ORANGE);

  const features = [
    ['🎯', BLUE,   'Risk Scoring Engine (0–100)',    'Analyzes anomalies, beneficiary verification, death records, document authenticity, and policy flags. Low / Medium / High / Critical output.'],
    ['🚨', RED,    'Anomaly Detection',              'Proactively flags beneficiary mismatches, address discrepancies, timing irregularities near death, duplicate claim patterns, and unusual amounts.'],
    ['⚡', GREEN,  'Next Best Actions Engine',       'Prioritized AI recommendations by urgency (Immediate / This Week / This Month) with reasoning for each suggested action.'],
    ['💬', '7B1FA2','Claims Analyst Chat (GPT-4o)', 'Ask anything — "Why flagged?", "What docs missing?" — and get structured AI answers with full claim context.'],
  ];

  features.forEach(([icon, color, title, desc], i) => {
    const y = 1.65 + i * 1.35;
    card(slide, 0.4, y, 6.3, 1.2, WHITE, 'E8E9EA');
    slide.addText(icon, { x: 0.55, y: y + 0.12, w: 0.65, h: 0.65, fontSize: 22 });
    slide.addText(title, { x: 1.3, y: y + 0.1,  w: 5.2, h: 0.4, fontSize: 13, bold: true, color: DARK });
    slide.addText(desc,  { x: 1.3, y: y + 0.52, w: 5.2, h: 0.58, fontSize: 10, color: GRAY, breakLine: true });
    rect(slide, 0.4, y, 0.06, 1.2, color);
  });

  // Right panel
  card(slide, 6.95, 1.65, 6.0, 2.1, WHITE, 'E8E9EA');
  slide.addText('AI RISK SCORE', { x: 7.1, y: 1.75, w: 5.7, h: 0.3, fontSize: 9, bold: true, color: GRAY, charSpacing: 2 });
  slide.addText('73', { x: 7.1, y: 2.05, w: 1.2, h: 0.8, fontSize: 46, bold: true, color: BLUE });
  slide.addText('HIGH RISK', { x: 8.3, y: 2.25, w: 1.8, h: 0.38, fontSize: 10, bold: true, color: ORANGE, fill: { color: 'FFF3E0' }, align: 'center', valign: 'middle' });
  slide.addText('3 High · 2 Medium · 1 Low alerts', { x: 7.1, y: 3.0, w: 5.5, h: 0.3, fontSize: 10, color: GRAY });

  card(slide, 6.95, 3.95, 6.0, 1.75, 'E8F5E3', 'C8E6C9');
  slide.addText('✅  Priority Action #1', { x: 7.1, y: 4.05, w: 5.7, h: 0.4, fontSize: 12, bold: true, color: GREEN });
  slide.addText('Initiate SIU referral — beneficiary change detected 11 days before insured\'s date of death.', { x: 7.1, y: 4.48, w: 5.7, h: 0.65, fontSize: 11, color: DARK, breakLine: true });
  slide.addText('Urgency: Immediate  ·  Category: Investigation', { x: 7.1, y: 5.15, w: 5.7, h: 0.3, fontSize: 10, color: GRAY });

  card(slide, 6.95, 5.85, 6.0, 1.45, WHITE, 'E8E9EA');
  const cohortItems = [['Avg Cycle', '18 days', BLUE], ['Fraud Rate', '4.2%', RED], ['Avg Settlement', '$187K', GREEN], ['Subrogation', '8.1%', ORANGE]];
  cohortItems.forEach(([lbl, val, c], i) => {
    const cx = 6.95 + 0.2 + i * 1.45;
    slide.addText(lbl, { x: cx, y: 5.95, w: 1.35, h: 0.3, fontSize: 9, color: GRAY, align: 'center' });
    slide.addText(val, { x: cx, y: 6.25, w: 1.35, h: 0.5, fontSize: 20, bold: true, color: c, align: 'center' });
  });
  slide.addText('Similar Claims Cohort', { x: 7.1, y: 6.75, w: 5.7, h: 0.3, fontSize: 9, color: GRAY });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — STP
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  rect(slide, 0, 0, '100%', '100%', BLUE_DK);
  addHeader(slide, 'Straight-Through Processing', '162C4E');

  slide.addText('From 20+ Days to ', { x: 0.5, y: 0.8, w: 8, h: 0.65, fontSize: 30, bold: true, color: WHITE });
  slide.addText('7–10 Days', { x: 5.2, y: 0.8, w: 4, h: 0.65, fontSize: 30, bold: true, color: ORANGE });
  rect(slide, 0.5, 1.5, 0.6, 0.05, ORANGE);

  // Standard lifecycle
  slide.addText('STANDARD CLAIMS LIFECYCLE', { x: 0.5, y: 1.65, w: 5.9, h: 0.3, fontSize: 9, bold: true, color: '889999', charSpacing: 2 });
  const stdSteps = ['FNOL', 'Review', 'Requirements', 'Assessment', 'Decision', 'Closed'];
  stdSteps.forEach((s, i) => {
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.5 + i * 1.13, y: 2.0, w: 1.0, h: 0.5, fill: { color: BLUE, transparency: 65 }, line: { color: WHITE, transparency: 60 }, rectRadius: 0.05 });
    slide.addText(s, { x: 0.5 + i * 1.13, y: 2.0, w: 1.0, h: 0.5, fontSize: 9, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    if (i < 5) slide.addText('→', { x: 1.5 + i * 1.13, y: 2.0, w: 0.13, h: 0.5, fontSize: 10, color: '667788', align: 'center', valign: 'middle' });
  });
  slide.addText('⏱  Average 20–30 days · 6 manual touchpoints', { x: 0.5, y: 2.58, w: 6.5, h: 0.3, fontSize: 10, color: '889999' });

  // STP lifecycle
  slide.addText('⚡  STP FAST TRACK LIFECYCLE', { x: 0.5, y: 3.05, w: 5.9, h: 0.3, fontSize: 9, bold: true, color: '889999', charSpacing: 2 });
  const stpSteps = ['FNOL', 'STP Eval', 'Approved', 'Payment', 'Closed'];
  stpSteps.forEach((s, i) => {
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.5 + i * 1.3, y: 3.4, w: 1.15, h: 0.5, fill: { color: ORANGE }, line: { color: ORANGE }, rectRadius: 0.05 });
    slide.addText(s, { x: 0.5 + i * 1.3, y: 3.4, w: 1.15, h: 0.5, fontSize: 9, bold: true, color: WHITE, align: 'center', valign: 'middle' });
    if (i < 4) slide.addText('→', { x: 1.65 + i * 1.3, y: 3.4, w: 0.15, h: 0.5, fontSize: 10, color: ORANGE, align: 'center', valign: 'middle' });
  });
  slide.addText('⚡  Average 7–10 days · Near-zero manual touchpoints', { x: 0.5, y: 3.98, w: 6.5, h: 0.3, fontSize: 10, color: '889999' });

  // Stats grid
  const stats = [['40%', 'STP Eligible Claims', ORANGE], ['60%', 'Faster Cycle Time', GREEN], ['7', 'Days Avg Close', BLUE], ['Auto', 'Req. Waiving', ORANGE]];
  stats.forEach(([num, lbl, c], i) => {
    const x = 7.05 + (i % 2) * 3.05, y = 1.65 + Math.floor(i / 2) * 2.45;
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.75, h: 2.2, fill: { color: BLUE, transparency: 80 }, line: { color: WHITE, transparency: 70 }, rectRadius: 0.1 });
    slide.addText(num, { x, y: y + 0.35, w: 2.75, h: 1.0, fontSize: 48, bold: true, color: c, align: 'center' });
    slide.addText(lbl, { x, y: y + 1.38, w: 2.75, h: 0.55, fontSize: 11, bold: true, color: 'AABBCC', align: 'center', charSpacing: 1 });
  });

  // Eligibility criteria
  slide.addText('STP Qualification Criteria', { x: 0.5, y: 4.45, w: 6.5, h: 0.35, fontSize: 12, bold: true, color: WHITE });
  const criteria = ['Coverage active at date of death', 'Clear liability determination', 'LexisNexis 3-point death match verified', 'No fraud indicators or anomaly flags', 'Beneficiary data matches Policy Admin records'];
  criteria.forEach((c, i) => {
    slide.addText('✓  ' + c, { x: 0.5, y: 4.85 + i * 0.42, w: 6.5, h: 0.38, fontSize: 11, color: 'AACCEE' });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — DOCUMENT INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  rect(slide, 0, 0, '100%', '100%', LIGHT);
  addHeader(slide, 'Document Intelligence');

  slide.addText('IDP + Beneficiary ', { x: 0.5, y: 0.8, w: 7, h: 0.6, fontSize: 28, bold: true, color: DARK });
  slide.addText('Analyzer', { x: 4.35, y: 0.8, w: 3.5, h: 0.6, fontSize: 28, bold: true, color: BLUE });
  rect(slide, 0.5, 1.45, 0.6, 0.05, ORANGE);

  const idpFeats = [
    ['🔎', BLUE,   'Auto-Classification',              'Death certs, claimant statements, W-9s, APS, police reports — automatically categorized on upload with no manual selection.'],
    ['✍️',  ORANGE, 'Field Extraction + Confidence',    'Name, SSN, DOB, address, relationship extracted per field with 0–100% AI confidence. Manual override for low-confidence fields.'],
    ['🔐', GREEN,  'Beneficiary Analyzer',             'Extracted data vs. Policy Admin records — discrepancies highlighted. LexisNexis address & deceased status verification built in.'],
    ['📸', RED,    'Staged Document Preview',          'Realistic mockups of death certificates, W-9, IDs, and APS forms with extracted field overlays for visual review and sign-off.'],
  ];

  idpFeats.forEach(([icon, color, title, desc], i) => {
    const y = 1.65 + i * 1.35;
    card(slide, 0.4, y, 6.3, 1.2, WHITE, 'E8E9EA');
    rect(slide, 0.4, y, 0.06, 1.2, color);
    slide.addText(icon, { x: 0.55, y: y + 0.12, w: 0.65, h: 0.65, fontSize: 22 });
    slide.addText(title, { x: 1.3, y: y + 0.1,  w: 5.2, h: 0.4, fontSize: 13, bold: true, color: DARK });
    slide.addText(desc,  { x: 1.3, y: y + 0.52, w: 5.2, h: 0.58, fontSize: 10, color: GRAY, breakLine: true });
  });

  // Right: Beneficiary comparison card
  card(slide, 6.95, 1.65, 6.0, 3.75, WHITE, 'E8E9EA');
  slide.addText('BENEFICIARY ANALYZER — EXTRACTED VS. ADMIN RECORDS', { x: 7.1, y: 1.78, w: 5.7, h: 0.3, fontSize: 8, bold: true, color: GRAY, charSpacing: 1 });

  const benRows = [
    ['👤', 'Name',           'Elizabeth Jones', 'Matched to Policy Admin', GREEN, '98%'],
    ['📍', 'Address',        '312 Oak St  → 318 Oak Ave', 'Discrepancy Detected', ORANGE, '71%'],
    ['🗓', 'Date of Birth',  '1958-06-15', 'LexisNexis Verified', GREEN, '96%'],
    ['💰', 'Share',          'Spouse — 100% allocation', 'Relationship Confirmed', GREEN, '94%'],
  ];
  benRows.forEach(([icon, field, val, note, c, conf], i) => {
    const y = 2.18 + i * 0.82;
    card(slide, 7.1, y, 5.7, 0.72, 'F8F9FA', 'E8E9EA');
    slide.addText(icon,  { x: 7.18, y: y + 0.06, w: 0.5, h: 0.5, fontSize: 16 });
    slide.addText(val,   { x: 7.72, y: y + 0.05, w: 3.3, h: 0.35, fontSize: 12, bold: true, color: DARK });
    slide.addText(note,  { x: 7.72, y: y + 0.38, w: 3.3, h: 0.26, fontSize: 10, color: c === ORANGE ? ORANGE : GRAY });
    slide.addText(conf,  { x: 11.2, y: y + 0.12, w: 1.4, h: 0.38, fontSize: 12, bold: true, color: WHITE, fill: { color: c === ORANGE ? ORANGE : GREEN }, align: 'center', valign: 'middle' });
  });

  // Doc types
  card(slide, 6.95, 5.55, 6.0, 1.65, 'E3F2FD', 'BBDEFB');
  slide.addText('📄  Documents Supported', { x: 7.1, y: 5.65, w: 5.7, h: 0.38, fontSize: 13, bold: true, color: BLUE });
  const docs = ['Death Certificate', 'W-9 Form', 'Claimant Statement', 'APS', 'Police Report', "Gov't ID", 'Toxicology', 'Autopsy Report'];
  docs.forEach((d, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    slide.addText(d, { x: 7.1 + col * 1.45, y: 6.1 + row * 0.44, w: 1.35, h: 0.36, fontSize: 9, bold: true, color: BLUE, fill: { color: WHITE }, align: 'center', valign: 'middle' });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — CLAIM GUARDIAN
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  rect(slide, 0, 0, '100%', '100%', '0D2B52');
  addHeader(slide, 'Claim Guardian Intelligence', '162C4E');

  slide.addText('Claim Guardian', { x: 0.5, y: 0.82, w: 5, h: 0.6, fontSize: 30, bold: true, color: WHITE });
  slide.addText('Intelligence Layer', { x: 5.55, y: 0.88, w: 3.2, h: 0.48, fontSize: 12, bold: true, color: WHITE, fill: { color: ORANGE }, align: 'center', valign: 'middle' });
  rect(slide, 0.5, 1.5, 0.6, 0.05, ORANGE);

  const guardianCards = [
    {
      x: 0.4, y: 1.65, color: ORANGE, icon: '⚡', title: 'Next Best Actions',
      body: 'AI-ranked action items by priority & urgency. Each action includes rationale, category (Documentation / Investigation / Payment / Compliance), and urgency level (Immediate / This Week / This Month).',
      extra: ['🔴  P1: Initiate SIU referral — beneficiary change near death date', '🟠  P2: Request updated beneficiary designation from policy admin'],
    },
    {
      x: 6.78, y: 1.65, color: GREEN, icon: '💸', title: 'Leakage & Recovery Detection',
      body: 'Quantifies financial exposure across payment leakage, unrecovered subrogation, and over-settlement risk with estimated recovery amounts and probability scores.',
      extra: null, stats: [['$43K', 'Leakage Exposure', ORANGE], ['$18K', 'Recovery Opp.', GREEN]],
    },
    {
      x: 0.4, y: 4.55, color: BLUE, icon: '📋', title: 'Automated Audit Findings',
      body: 'Processing compliance tracking — missed workflow steps, timeline deviations, requirement gaps — with severity-coded open/closed status on every claim. Full regulatory audit trail.',
      extra: null,
    },
    {
      x: 6.78, y: 4.55, color: '7B1FA2', icon: '🔄', title: 'Investment Recovery',
      body: 'Identifies third-party subrogation opportunities (MVA cases), policy rescission scenarios, and overpayment recovery — with estimated recovery amounts and likelihood scores.',
      extra: null,
    },
  ];

  guardianCards.forEach(gc => {
    slide.addShape(pptx.ShapeType.roundRect, { x: gc.x, y: gc.y, w: 6.2, h: 2.7, fill: { color: BLUE, transparency: 80 }, line: { color: WHITE, transparency: 80 }, rectRadius: 0.1 });
    rect(slide, gc.x, gc.y, 6.2, 0.06, gc.color);
    slide.addText(gc.icon + '  ' + gc.title, { x: gc.x + 0.2, y: gc.y + 0.15, w: 5.8, h: 0.45, fontSize: 14, bold: true, color: WHITE });
    slide.addText(gc.body, { x: gc.x + 0.2, y: gc.y + 0.65, w: 5.8, h: 1.0, fontSize: 10, color: 'AACCEE', breakLine: true });
    if (gc.extra) {
      gc.extra.forEach((e, i) => {
        slide.addShape(pptx.ShapeType.roundRect, { x: gc.x + 0.2, y: gc.y + 1.75 + i * 0.45, w: 5.8, h: 0.38, fill: { color: i === 0 ? RED : ORANGE, transparency: 75 }, line: { color: WHITE, transparency: 80 }, rectRadius: 0.05 });
        slide.addText(e, { x: gc.x + 0.35, y: gc.y + 1.78 + i * 0.45, w: 5.6, h: 0.32, fontSize: 9, color: WHITE });
      });
    }
    if (gc.stats) {
      gc.stats.forEach(([val, lbl, c], i) => {
        const sx = gc.x + 0.2 + i * 3.0;
        slide.addShape(pptx.ShapeType.roundRect, { x: sx, y: gc.y + 1.7, w: 2.75, h: 0.75, fill: { color: BLUE, transparency: 70 }, line: { color: WHITE, transparency: 80 }, rectRadius: 0.07 });
        slide.addText(val, { x: sx, y: gc.y + 1.72, w: 2.75, h: 0.42, fontSize: 24, bold: true, color: c, align: 'center' });
        slide.addText(lbl, { x: sx, y: gc.y + 2.14, w: 2.75, h: 0.25, fontSize: 9, color: 'AABBCC', align: 'center' });
      });
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  rect(slide, 0, 0, '100%', '100%', LIGHT);
  addHeader(slide, 'Enterprise Integrations');

  slide.addText('Built for the ', { x: 0.5, y: 0.8, w: 8, h: 0.6, fontSize: 28, bold: true, color: DARK });
  slide.addText('Enterprise Ecosystem', { x: 3.3, y: 0.8, w: 6, h: 0.6, fontSize: 28, bold: true, color: BLUE });
  rect(slide, 0.5, 1.45, 0.6, 0.05, ORANGE);

  const integrations = [
    { icon: '🔗', name: 'ServiceNow',         color: BLUE,   tags: ['OAuth 2.0', 'FNOL Sync', 'Live Updates'], desc: 'Bi-directional OAuth 2.0 sync. FNOL data, work notes, anomaly results, and beneficiary analysis stored natively in ServiceNow.' },
    { icon: '🔍', name: 'LexisNexis',         color: GREEN,  tags: ['Death Verify', 'Address Check', 'STP Enabler'], desc: '3-point death verification (SSN, name, DOB). Address validation. Enables STP fast-track routing with confirmed match.' },
    { icon: '📋', name: 'Policy Admin (SOR)', color: BLUE,   tags: ['In-Force Check', 'Bene Records', 'Real-time'], desc: 'Real-time policy in-force verification, beneficiary admin records, premium status — authoritative system of record.' },
    { icon: '💰', name: 'Tax Engine (cmA)',   color: ORANGE, tags: ['1099-R Gen', 'Fed + State', 'GL Posting'], desc: 'Federal & state withholding calculations, automated 1099-R generation, GL posting for accounts payable reconciliation.' },
    { icon: '🧮', name: 'VPMS (PMI)',         color: BLUE,   tags: ['10 States', 'PMI Calc', 'Accrual'], desc: 'State-specific Post Mortem Interest rates. Simple interest from date of death to settlement with full validation.' },
    { icon: '🤖', name: 'GPT-4o (OpenAI)',    color: '7B1FA2', tags: ['AI Chat', 'Claim Context', 'Markdown'], desc: 'Claims Analyst Chat and AI Insights powered by GPT-4o with full claim context injection and structured reasoning output.' },
  ];

  integrations.forEach((int, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.35 + col * 4.35, y = 1.65 + row * 2.85;
    card(slide, x, y, 4.15, 2.65, WHITE, 'E8E9EA');
    slide.addText(int.icon, { x: x + 0.2, y: y + 0.15, w: 0.6, h: 0.6, fontSize: 26 });
    slide.addText(int.name, { x: x + 0.85, y: y + 0.22, w: 3.1, h: 0.45, fontSize: 14, bold: true, color: DARK });
    slide.addText(int.desc, { x: x + 0.2, y: y + 0.85, w: 3.8, h: 1.1, fontSize: 10, color: GRAY, breakLine: true });
    int.tags.forEach((tag, ti) => {
      slide.addText(tag, { x: x + 0.15 + ti * 1.3, y: y + 2.2, w: 1.25, h: 0.3, fontSize: 9, bold: true, color: int.color, fill: { color: 'EBF4FC' }, align: 'center', valign: 'middle' });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — ROI & METRICS
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  rect(slide, 0, 0, '100%', '100%', BLUE);
  addHeader(slide, 'Business Impact & ROI', BLUE_DK);

  slide.addText('Measurable Impact from Day One', { x: 0, y: 0.85, w: '100%', h: 0.65, fontSize: 30, bold: true, color: WHITE, align: 'center' });
  rect(slide, 6.37, 1.55, 0.6, 0.05, ORANGE);

  const topStats = [['60%', 'Faster Cycle Time'], ['40%', 'STP Auto-Approval Rate'], ['95%', 'Document Accuracy'], ['7', 'Days Avg STP Closure']];
  topStats.forEach(([num, lbl], i) => {
    const x = 0.45 + i * 3.15;
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.75, w: 3.0, h: 2.0, fill: { color: WHITE, transparency: 88 }, line: { color: WHITE, transparency: 70 }, rectRadius: 0.1 });
    slide.addText(num, { x, y: 1.95, w: 3.0, h: 1.0, fontSize: 50, bold: true, color: WHITE, align: 'center' });
    slide.addText(lbl, { x, y: 3.0, w: 3.0, h: 0.55, fontSize: 11, bold: true, color: 'CCEEFF', align: 'center', charSpacing: 1 });
  });

  const impactCards = [
    ['📉 Cost Reduction', 'Fewer manual touchpoints and STP automation reduce per-claim processing cost by up to 45%. Examiner capacity improves significantly for high-complexity claims.'],
    ['🔒 Fraud Prevention', 'Proactive AI risk scoring detects fraud patterns before payment. Real-time anomaly alerts protect millions in annual financial exposure.'],
    ['😊 Beneficiary Experience', 'Faster settlements reduce beneficiary follow-up calls and regulatory complaints — improving NPS and maintaining state insurance department standing.'],
  ];
  impactCards.forEach(([title, desc], i) => {
    const x = 0.45 + i * 4.3;
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 4.0, w: 4.15, h: 3.2, fill: { color: WHITE, transparency: 88 }, line: { color: WHITE, transparency: 70 }, rectRadius: 0.1 });
    slide.addText(title, { x: x + 0.2, y: 4.18, w: 3.7, h: 0.45, fontSize: 13, bold: true, color: WHITE });
    slide.addText(desc,  { x: x + 0.2, y: 4.7,  w: 3.7, h: 2.3,  fontSize: 11, color: 'CCEEFF', breakLine: true });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — WHY DXC BLOOM
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  rect(slide, 0, 0, '100%', '100%', 'FAFAFA');
  addHeader(slide, 'Why DXC Bloom');

  slide.addText('Why ', { x: 0.5, y: 0.8, w: 8, h: 0.6, fontSize: 28, bold: true, color: DARK });
  slide.addText('Bloom', { x: 1.62, y: 0.8, w: 2.5, h: 0.6, fontSize: 28, bold: true, color: BLUE });
  slide.addText(' by DXC Technology?', { x: 3.55, y: 0.8, w: 5, h: 0.6, fontSize: 28, bold: true, color: DARK });
  rect(slide, 0.5, 1.45, 0.6, 0.05, ORANGE);

  const whys = [
    ['01', 'Purpose-Built for L&A Carriers',    'Designed ground-up for Life & Annuity — not generic. Supports death, maturity, surrender, withdrawal, and disability claim types with carrier-specific workflows.'],
    ['02', 'ServiceNow Ecosystem Native',        'Built by DXC on the world\'s leading enterprise platform. FNOL, work notes, AI findings all sync natively. No middleware, no re-keying, no integration overhead.'],
    ['03', 'Enterprise-Grade Data Model',        'Full lifecycle tracking: multi-policy aggregation, nested beneficiaries, requirements at claim/policy/party levels, and complete system-of-record timeline.'],
    ['04', 'Regulatory & Compliance Ready',      'State-specific PMI rates, federal/state tax withholding, 1099-R auto-generation, NIGO tracking, and requirement satisfaction audit trails built-in.'],
    ['05', 'Halstack Design System',             'Built on DXC\'s enterprise Halstack React library — WCAG accessible, theme-configurable, responsive across desktop, tablet, and iPad layouts.'],
    ['06', 'L&A + P&C Flexibility',             'Single platform for both Life & Annuity and Property & Casualty claims — configurable requirements, claim types, and workflow rules per product line.'],
  ];

  whys.forEach(([num, title, desc], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.4 + col * 6.5, y = 1.65 + row * 1.9;
    card(slide, x, y, 6.2, 1.72, WHITE, 'E8E9EA');
    slide.addText(num, { x: x + 0.15, y: y + 0.12, w: 0.75, h: 1.3, fontSize: 34, bold: true, color: BLUE, transparency: 65, valign: 'middle' });
    slide.addText(title, { x: x + 0.98, y: y + 0.15, w: 5.1, h: 0.42, fontSize: 13, bold: true, color: DARK });
    slide.addText(desc,  { x: x + 0.98, y: y + 0.6,  w: 5.1, h: 1.0,  fontSize: 10, color: GRAY, breakLine: true });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — CTA
// ═══════════════════════════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  rect(slide, 0, 0, '100%', '100%', BLUE_DK);
  // Gradient overlay
  rect(slide, 4, 0, 9.33, 7.5, BLUE);

  slide.addText('Ready to Transform Your ', { x: 0, y: 1.0, w: '100%', h: 0.65, fontSize: 28, bold: true, color: WHITE, align: 'center' });
  slide.addText('Claims Operations?', { x: 0, y: 1.65, w: '100%', h: 0.65, fontSize: 28, bold: true, color: ORANGE, align: 'center' });
  rect(slide, 6.37, 2.38, 0.6, 0.05, ORANGE);

  const steps = [
    ['1', 'Live Guided Demo',         'Full walkthrough of all personas — examiner, supervisor, risk manager — using real claim scenarios from your environment.'],
    ['2', 'Integration Assessment',   'DXC team reviews your ServiceNow environment, policy admin system, and data model for fit analysis and integration roadmap.'],
    ['3', 'Pilot Program',            'Deploy Bloom Claims Assistant against a defined claim cohort — measure STP rates, cycle times, and fraud detection in production conditions.'],
  ];
  steps.forEach(([num, title, desc], i) => {
    const y = 2.6 + i * 1.4;
    slide.addShape(pptx.ShapeType.roundRect, { x: 1.5, y, w: 10.33, h: 1.25, fill: { color: WHITE, transparency: 88 }, line: { color: WHITE, transparency: 75 }, rectRadius: 0.1 });
    slide.addText(num, { x: 1.65, y: y + 0.05, w: 0.6, h: 1.1, fontSize: 36, bold: true, color: ORANGE, valign: 'middle', align: 'center' });
    slide.addText(title, { x: 2.4, y: y + 0.1,  w: 9.2, h: 0.42, fontSize: 14, bold: true, color: WHITE });
    slide.addText(desc,  { x: 2.4, y: y + 0.55, w: 9.2, h: 0.6,  fontSize: 11, color: 'CCEEFF', breakLine: true });
  });

  // Bottom bar
  rect(slide, 0, 6.9, '100%', 0.6, BLUE_DK);
  slide.addText('🌸 Bloom Claims Assistant  |  Built by DXC Technology  |  Life & Annuity · Property & Casualty', { x: 0, y: 6.9, w: '100%', h: 0.6, fontSize: 11, color: 'AABBCC', align: 'center', valign: 'middle' });
}

// ── Write file ────────────────────────────────────────────────────────────────
const outputPath = './bloom-claims-pitch-deck.pptx';
pptx.writeFile({ fileName: outputPath })
  .then(() => { console.log(`✅  PPTX saved: ${outputPath}`); })
  .catch(err => { console.error('❌  Error:', err); });
