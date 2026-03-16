/**
 * Demo Data Generator
 *
 * Generates deterministic sample claims with full orchestration metadata:
 * - Uses seeded PRNG for reproducible data across page loads
 * - 5 hand-crafted showcase claims + 15 seeded claims
 * - STP routing (40% of claims)
 * - Workflow/SLA data
 * - Requirements with various statuses
 * - Policy information
 * - Financial data
 * - Timeline events
 */

import {
  ClaimStatus,
  ClaimType,
  RoutingType,
  RequirementStatus,
  RequirementType
} from '../types/claim.types';

// ============================================================
// Seeded PRNG (mulberry32) for deterministic random generation
// ============================================================
const createSeededRandom = (seed) => {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Global seeded random - same seed = same data every time
const seeded = createSeededRandom(42);

const seededDate = (start, end) => {
  return new Date(start.getTime() + seeded() * (end.getTime() - start.getTime()));
};

const maskedSSN = (last4) => `***-**-${last4}`;

const seededPick = (arr) => arr[Math.floor(seeded() * arr.length)];

const FIRST_NAMES_MALE = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Thomas', 'Daniel', 'Mark'];
const FIRST_NAMES_FEMALE = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Susan', 'Margaret', 'Dorothy', 'Lisa', 'Karen'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Garcia', 'Miller', 'Wilson', 'Moore', 'Taylor'];

const seededMaleName = () => `${seededPick(FIRST_NAMES_MALE)} ${seededPick(LAST_NAMES)}`;
const seededFemaleName = () => `${seededPick(FIRST_NAMES_FEMALE)} ${seededPick(LAST_NAMES)}`;

const STATES = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'West', 'Southwest'];
const COMPANY_CODES = ['BLM', 'ALI', 'GLP', 'NWL', 'FST'];
const PROOF_TYPES = ['Death Certificate', 'Coroner Report', 'Hospital Record', 'Funeral Home Statement'];

// ============================================================
// Requirement generation
// ============================================================
const generateRequirements = (claim) => {
  const requirements = [];
  const createdAtDate = typeof claim.createdAt === 'string' ? new Date(claim.createdAt) : claim.createdAt;
  const isSTP = claim.routing?.type === RoutingType.STP;

  // CLAIM LEVEL
  requirements.push({
    id: `${claim.id}-req-1`, level: 'claim', type: RequirementType.DEATH_CERTIFICATE,
    name: 'Certified Death Certificate', description: 'Official death certificate from state vital records',
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 2 * 86400000).toISOString() : null,
    documents: isSTP ? [{ id: `doc-${claim.id}-1`, name: 'death_certificate.pdf' }] : [],
    metadata: { confidenceScore: isSTP ? 0.96 : null, idpClassification: isSTP ? 'death_certificate' : null }
  });

  requirements.push({
    id: `${claim.id}-req-2`, level: 'claim', type: RequirementType.CLAIMANT_STATEMENT,
    name: 'Claimant Statement of Claim', description: 'Signed statement of claim form',
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 1 * 86400000).toISOString() : null,
    documents: isSTP
      ? [{ id: `doc-${claim.id}-2`, name: 'claimant_statement.pdf' }]
      : [{ id: `doc-${claim.id}-2`, name: 'claimant_statement_draft.pdf' }],
    metadata: { confidenceScore: isSTP ? 0.93 : 0.78, reason: isSTP ? null : 'Signature verification in progress' }
  });

  requirements.push({
    id: `${claim.id}-req-3`, level: 'claim', type: RequirementType.PROOF_OF_IDENTITY,
    name: 'Government-Issued Photo ID', description: "Driver's license, passport, or state ID",
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 1 * 86400000).toISOString() : null,
    documents: isSTP ? [{ id: `doc-${claim.id}-3`, name: 'drivers_license.pdf' }] : [],
    metadata: isSTP ? { confidenceScore: 0.95 } : {}
  });

  // POLICY LEVEL
  requirements.push({
    id: `${claim.id}-req-4`, level: 'policy', type: 'POLICY_VERIFICATION',
    name: 'Policy In-Force Verification', description: 'Verify policy status and coverage at date of death',
    status: RequirementStatus.SATISFIED, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 3 * 86400000).toISOString(),
    satisfiedDate: new Date(createdAtDate.getTime() + 6 * 3600000).toISOString(),
    documents: [],
    metadata: { verificationSource: 'Policy Admin System', policyNumber: claim.policy.policyNumber }
  });

  // PARTY LEVEL
  requirements.push({
    id: `${claim.id}-req-7`, level: 'party', type: 'BENEFICIARY_VERIFICATION',
    name: 'Beneficiary Identity Verification', description: 'SSN verification and identity confirmation',
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 1 * 86400000).toISOString() : null,
    documents: isSTP ? [{ id: `doc-${claim.id}-7`, name: 'beneficiary_ssn_card.pdf' }] : [],
    metadata: { confidenceScore: isSTP ? 0.97 : 0.82, partyId: claim.parties?.[1]?.id, partyName: claim.claimant?.name }
  });

  requirements.push({
    id: `${claim.id}-req-8`, level: 'party', type: 'TAX_FORM',
    name: 'IRS Form W-9', description: 'W-9 form for tax reporting and 1099 generation',
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 10 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 3 * 86400000).toISOString() : null,
    documents: isSTP ? [{ id: `doc-${claim.id}-8`, name: 'w9_form.pdf' }] : [],
    metadata: { partyId: claim.parties?.[1]?.id, partyName: claim.claimant?.name }
  });

  requirements.push({
    id: `${claim.id}-req-9`, level: 'party', type: 'PAYMENT_ELECTION',
    name: 'Payment Election Form', description: 'ACH direct deposit or check payment selection',
    status: isSTP ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 10 * 86400000).toISOString(),
    satisfiedDate: isSTP ? new Date(createdAtDate.getTime() + 2 * 86400000).toISOString() : null,
    documents: isSTP ? [{ id: `doc-${claim.id}-9`, name: 'payment_election.pdf' }] : [],
    metadata: { partyId: claim.parties?.[1]?.id, partyName: claim.claimant?.name, paymentMethod: isSTP ? 'ACH' : 'Not selected' }
  });

  return requirements;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const generateTimeline = (claim) => {
  const events = [];
  events.push({ id: `${claim.id}-event-1`, timestamp: claim.createdAt, type: 'claim.created', source: 'cma', user: { name: 'System', role: 'system' }, description: 'Claim submitted via online portal', metadata: { channel: 'beneficiary_portal' } });
  events.push({ id: `${claim.id}-event-2`, timestamp: new Date(new Date(claim.createdAt).getTime() + 5 * 60000).toISOString(), type: 'policy.verified', source: 'policy', user: { name: 'System', role: 'system' }, description: 'Policy verified in Policy Admin system', metadata: { policyNumber: claim.policy.policyNumber, status: 'in-force' } });
  events.push({ id: `${claim.id}-event-3`, timestamp: new Date(new Date(claim.createdAt).getTime() + 10 * 60000).toISOString(), type: 'death.verified', source: 'verification', user: { name: 'LexisNexis', role: 'external' }, description: 'Death verification completed (3-point match)', metadata: { confidence: 0.95, matchPoints: ['ssn', 'name', 'dob'] } });
  if (claim.routing?.type === RoutingType.STP) {
    events.push({ id: `${claim.id}-event-4`, timestamp: new Date(new Date(claim.createdAt).getTime() + 15 * 60000).toISOString(), type: 'routing.stp', source: 'fso', user: { name: 'Routing Engine', role: 'system' }, description: 'Claim routed to STP processing', metadata: { score: claim.routing.score, eligible: true } });
  }
  events.push({ id: `${claim.id}-event-5`, timestamp: new Date(new Date(claim.createdAt).getTime() + 20 * 60000).toISOString(), type: 'requirements.generated', source: 'requirements', user: { name: 'Decision Table Engine', role: 'system' }, description: `${claim.requirements?.length || 3} requirements generated`, metadata: { mandatoryCount: 3, optionalCount: 0 } });
  return events;
};

const generateWorkNotes = (claim) => {
  const createdAtDate = typeof claim.createdAt === 'string' ? new Date(claim.createdAt) : claim.createdAt;
  const noteTemplates = [
    'Initial claim review completed. All submitted documents have been received and logged.',
    'Verified death certificate against LexisNexis records. 3-point match confirmed.',
    'Contacted claimant to request additional documentation for beneficiary verification.'
  ];
  const authors = ['claims.adjuster', 'stephanie.lyons', 'john.examiner'];
  const notes = [];
  for (let i = 0; i < 3; i++) {
    const noteDate = new Date(createdAtDate.getTime() + (i + 1) * 86400000);
    notes.push({
      sys_id: `wn-${claim.id}-${i + 1}`, element: 'work_notes', element_id: claim.sysId || claim.id,
      name: 'x_dxcis_claims_a_0_claims_fnol', value: noteTemplates[i],
      sys_created_on: noteDate.toISOString().replace('T', ' ').substring(0, 19), sys_created_by: authors[i]
    });
  }
  return notes.sort((a, b) => new Date(b.sys_created_on) - new Date(a.sys_created_on));
};

// ============================================================
// Constants
// ============================================================
const NOW = new Date();
const DAY = 86400000;

// ============================================================
// Claim Guardian Intelligence Generator
// ============================================================
const generateGuardianInsights = (claim) => {
  const daysOpen = Math.floor((NOW - new Date(claim.createdAt)) / DAY);
  const isSTP = claim.routing?.type === RoutingType.STP;
  const riskScore = claim.aiInsights?.riskScore || 20;
  const claimAmount = claim.financial?.claimAmount || 0;
  const pmiRate = claim.financial?.pmiRate || 0.08;
  const dailyPMI = Math.round((claimAmount * pmiRate) / 365);
  const pmiAccrual = Math.round(claimAmount * pmiRate * daysOpen / 365);

  // ── claim-1: Elizabeth Jones — UNDER_REVIEW, beneficiary change ──
  if (claim.id === 'claim-1') {
    return {
      lastAnalyzed: new Date(NOW.getTime() - 2 * 3600000).toISOString(),
      overallRisk: 'Medium', leakageExposure: pmiAccrual,
      claimSummary: {
        narrative: `Death claim filed by Elizabeth Jones (spouse) for Robert Jones, age 67, who died of natural causes in Springfield, IL on ${claim.deathEvent.dateOfDeath}. Policy POL-847291 is a $150,000 Term Life policy issued May 2018. Claim is under standard review. A beneficiary designation change made 8 months prior to death has been flagged for enhanced verification. SLA has ${claim.workflow?.sla?.daysRemaining || 10} days remaining.`,
        keyEvents: [
          { date: claim.createdAt, event: 'FNOL received via beneficiary portal' },
          { date: new Date(new Date(claim.createdAt).getTime() + 5 * 60000).toISOString(), event: 'Policy POL-847291 verified in-force at date of death' },
          { date: new Date(new Date(claim.createdAt).getTime() + 10 * 60000).toISOString(), event: 'Death verification — LexisNexis 3-point match (score 88)' },
          { date: new Date(new Date(claim.createdAt).getTime() + 1 * DAY).toISOString(), event: 'Risk alert: Beneficiary designation change detected 8 months before death' }
        ],
        investigationStatus: 'Active — Beneficiary Change Review',
        outstandingActions: ['Beneficiary government ID verification', 'Beneficiary change rationale documentation', 'IRS W-9 form', 'Payment election form'],
        policyClaimantDetails: {
          policy: { 'Policy Number': 'POL-847291', 'Policy Type': 'Term Life', 'Face Amount': '$150,000', 'Status': 'In Force', 'Issue Date': 'May 2018', 'Issue State': 'IL' },
          claimant: { 'Name': 'Elizabeth Jones', 'Relationship': 'Spouse', 'Phone': '312-555-0147', 'ID Verification': 'Pending (LexisNexis score 82)' }
        },
        documentation: {
          received: ['Death Certificate', 'Claimant Statement (FNOL)', 'Policy In-Force Confirmation', 'LexisNexis Verification (score 88)'],
          missing: ['Government-Issued Photo ID (Elizabeth Jones)', 'Beneficiary Change Authorization Form', 'IRS W-9 Form', 'Payment Election Form']
        },
        eligibilityValidation: {
          checks: [
            { label: 'Policy In-Force at Date of Death', status: 'pass' },
            { label: 'Contestability Period Clear (>2 years)', status: 'pass' },
            { label: 'Death Verification (LexisNexis 88)', status: 'pass' },
            { label: 'Beneficiary Identity Verified', status: 'fail', detail: 'Government ID pending' },
            { label: 'Beneficiary Change Review Complete', status: 'warn', detail: '8 months before death — in progress' }
          ]
        },
        riskIndicators: [
          { label: 'Beneficiary Change Proximity', severity: 'Medium', detail: '8 months before death — within 12-month review window' }
        ],
        payoutReadiness: {
          status: 'Blocked',
          estimatedAmount: 150000,
          blockers: ['Beneficiary identity verification pending', 'Beneficiary change documentation not received', 'W-9 and payment election outstanding']
        }
      },
      fraudSignals: {
        score: 45,
        signals: [{ id: 'fs-1-1', category: 'Policy Pattern', severity: 'Medium', indicator: 'Beneficiary Designation Change Proximity to Death', description: 'Primary beneficiary was changed 8 months before date of death. Changes within 12 months of death trigger enhanced review under ISO ClaimSearch guidelines. Original beneficiary has not been notified.', dataSource: 'Internal Policy Admin', confidence: 72, detectedAt: new Date(new Date(claim.createdAt).getTime() + 1 * DAY).toISOString(), recommendation: 'Obtain signed beneficiary change authorization form and confirm relationship documentation' }]
      },
      leakageIndicators: [
        { id: 'li-1-1', category: 'PMI Accrual Exposure', severity: 'Low', description: `IL Post-Mortem Interest accruing at 8% p.a. on $150,000. Each processing day adds $${dailyPMI} to total liability. Current exposure: $${pmiAccrual.toLocaleString()}.`, estimatedAmount: pmiAccrual, recommendation: 'Prioritize beneficiary verification to reduce PMI exposure', status: 'Monitoring' }
      ],
      subrogationOpportunities: [],
      benchmarkData: {
        cycleTime: { current: daysOpen, industryAvg: 18, carrierAvg: 15, variance: `+${Math.max(0, Math.round((daysOpen / 15 - 1) * 100))}%`, status: daysOpen > 18 ? 'At Risk' : 'On Track' },
        reserveAccuracy: { currentReserve: 135000, benchmarkRatio: '90%', status: 'Adequate' },
        similarClaims: { count: 847, avgCycleTime: 18, avgSettlement: 148500, subrogationRate: '0%', fraudRate: '2.1%' },
        insights: [
          `Claim is running ${daysOpen > 15 ? Math.round((daysOpen / 15 - 1) * 100) + '% above' : 'within'} carrier average of 15 days for similar standard Term Life claims`,
          'Beneficiary change cases resolve 3.5 days slower on average vs. standard claims',
          'Reserve at 90% of face value — consistent with carrier benchmark for under-review claims'
        ]
      },
      nextBestActions: [
        { id: 'nba-1-1', priority: 1, action: 'Complete Beneficiary Identity Verification', description: `Government-issued photo ID for Elizabeth Jones has been pending for ${daysOpen} days. Send reminder with secure upload link.`, rationale: `Identity verification is blocking payment approval; SLA at ${claim.workflow?.sla?.daysRemaining || 10} days remaining`, urgency: 'This Week', agent: 'Claim Audit Agent', category: 'Documentation' },
        { id: 'nba-1-2', priority: 2, action: 'Issue Beneficiary Change Documentation Request', description: 'Request signed beneficiary change authorization form and prior beneficiary notification records from Policy Admin', rationale: 'Change 8 months before death requires documented review per underwriting guidelines', urgency: 'This Week', agent: 'Fraud Signal Agent', category: 'Investigation' },
        { id: 'nba-1-3', priority: 3, action: 'Collect W-9 and Payment Election Form', description: 'Send consolidated documentation request to claimant for both outstanding items', rationale: 'Required before payment can be issued', urgency: 'This Week', agent: 'Next Best Action Agent', category: 'Documentation' }
      ],
      auditFindings: [
        { id: 'af-1-1', stage: 'Investigation', finding: `Beneficiary identity verification in pending status for ${daysOpen} days — no follow-up contact logged after initial outreach`, severity: 'Medium', category: 'Incomplete Documentation', detectedAt: new Date(NOW.getTime() - 10 * DAY).toISOString(), status: 'Open' },
        { id: 'af-1-2', stage: 'Investigation', finding: 'Beneficiary change risk flagged but no formal documentation request issued to claimant or policy records team', severity: 'Medium', category: 'Missed Step', detectedAt: new Date(NOW.getTime() - 5 * DAY).toISOString(), status: 'Open' }
      ]
    };
  }

  // ── claim-2: Harold Mitchell — CLOSED, STP ──
  if (claim.id === 'claim-2') {
    return {
      lastAnalyzed: claim.closedAt || NOW.toISOString(),
      overallRisk: 'Low', leakageExposure: 0,
      claimSummary: {
        narrative: `Death claim for Harold Mitchell, age 73, closed via STP in 7 days. Spouse Margaret Mitchell received full benefit of $100,000 plus $${(claim.financial?.interestAmount || 0).toLocaleString()} PMI interest via ACH. All documentation auto-verified. No anomalies detected. GL posted and 1099 generated.`,
        keyEvents: [
          { date: claim.createdAt, event: 'FNOL received — STP eligibility score 92' },
          { date: new Date(new Date(claim.createdAt).getTime() + 1 * DAY).toISOString(), event: 'All documents auto-verified via IDP — death certificate and claimant statement' },
          { date: new Date(new Date(claim.createdAt).getTime() + 3 * DAY).toISOString(), event: 'W-9 and payment election completed by claimant' },
          { date: claim.closedAt, event: 'ACH payment of $100,000 + interest issued and confirmed' }
        ],
        investigationStatus: 'Cleared — Closed', outstandingActions: [],
        policyClaimantDetails: {
          policy: { 'Policy Number': 'POL-523184', 'Policy Type': 'Term Life', 'Face Amount': '$100,000', 'Status': 'In Force', 'Issue Date': 'Mar 2016', 'Issue State': 'FL' },
          claimant: { 'Name': 'Margaret Mitchell', 'Relationship': 'Spouse', 'Phone': '813-555-0291', 'ID Verification': 'Verified (score 96)' }
        },
        documentation: {
          received: ['Death Certificate', 'Claimant Statement', 'IRS W-9 Form', 'Payment Election Form (ACH)', 'LexisNexis Verification (score 96)', 'GL Posting & 1099 Generated'],
          missing: []
        },
        eligibilityValidation: {
          checks: [
            { label: 'Policy In-Force at Date of Death', status: 'pass' },
            { label: 'Contestability Period Clear', status: 'pass' },
            { label: 'Death Verification (LexisNexis 96)', status: 'pass' },
            { label: 'Beneficiary Identity Verified', status: 'pass' },
            { label: 'STP Score 92 — All Criteria Met', status: 'pass' }
          ]
        },
        riskIndicators: [],
        payoutReadiness: { status: 'Paid', estimatedAmount: 100000, blockers: [] }
      },
      fraudSignals: { score: 15, signals: [] },
      leakageIndicators: [],
      subrogationOpportunities: [],
      benchmarkData: {
        cycleTime: { current: 7, industryAvg: 12, carrierAvg: 10, variance: '-30%', status: 'Exceeding' },
        reserveAccuracy: { currentReserve: 0, benchmarkRatio: 'N/A', status: 'Closed' },
        similarClaims: { count: 1204, avgCycleTime: 12, avgSettlement: 100000, subrogationRate: '0%', fraudRate: '0.4%' },
        insights: [
          'Closed 30% faster than carrier STP average of 10 days — exemplary processing',
          'PMI liability minimized: settled day 7, saving ~$192 vs. carrier average settlement timeline',
          'ACH payment reduced settlement time by 2 days vs. check issuance average'
        ]
      },
      nextBestActions: [],
      auditFindings: []
    };
  }

  // ── claim-3: Thomas Garcia — NEW, STP, MVA ──
  if (claim.id === 'claim-3') {
    return {
      lastAnalyzed: new Date(NOW.getTime() - 1 * 3600000).toISOString(),
      overallRisk: 'Low', leakageExposure: 0,
      claimSummary: {
        narrative: `Death claim filed by Maria Garcia (spouse) for Thomas Garcia, age 55, who died in a motor vehicle accident in Dallas, TX on ${claim.deathEvent.dateOfDeath}. Policy POL-619247 is a $175,000 Term Life policy issued January 2020. STP eligibility score 91. A potential third-party subrogation opportunity has been identified — police report pending to confirm at-fault driver. Claim is ${daysOpen} days old.`,
        keyEvents: [
          { date: claim.createdAt, event: 'FNOL received — STP eligibility score 91 (MVA death)' },
          { date: new Date(new Date(claim.createdAt).getTime() + 15 * 60000).toISOString(), event: 'Routing Engine: STP approved — requirements auto-generated' },
          { date: new Date(new Date(claim.createdAt).getTime() + 1 * DAY).toISOString(), event: 'Subrogation flag raised: MVA death — third-party liability possible' }
        ],
        investigationStatus: 'Active — STP Processing',
        outstandingActions: ['Police/accident report', 'IRS W-9', 'Payment election form', 'Subrogation hold placement'],
        policyClaimantDetails: {
          policy: { 'Policy Number': 'POL-619247', 'Policy Type': 'Term Life', 'Face Amount': '$175,000', 'Status': 'In Force', 'Issue Date': 'Jan 2020', 'Issue State': 'TX' },
          claimant: { 'Name': 'Maria Garcia', 'Relationship': 'Spouse', 'Phone': '214-555-0382', 'ID Verification': 'Verified (score 95)' }
        },
        documentation: {
          received: ['Death Certificate', 'Claimant Statement', 'Policy In-Force Confirmation', 'LexisNexis Verification (score 94)'],
          missing: ['Police / Accident Report (Dallas PD)', 'Subrogation Hold Notice', 'IRS W-9 Form', 'Payment Election Form']
        },
        eligibilityValidation: {
          checks: [
            { label: 'Policy In-Force at Date of Death', status: 'pass' },
            { label: 'Contestability Period Clear (>2 years)', status: 'pass' },
            { label: 'Death Verification (LexisNexis 94)', status: 'pass' },
            { label: 'Beneficiary Identity Verified', status: 'pass' },
            { label: 'Subrogation Hold Placed (MVA)', status: 'fail', detail: 'Must be placed before payment' }
          ]
        },
        riskIndicators: [
          { label: 'Third-Party Liability (MVA Death)', severity: 'Medium', detail: 'Police report pending — fault not yet confirmed' }
        ],
        payoutReadiness: {
          status: 'Blocked',
          estimatedAmount: 175000,
          blockers: ['Subrogation hold required before payment (MVA claim)', 'Police report not yet received', 'W-9 and payment election outstanding']
        }
      },
      fraudSignals: { score: 22, signals: [] },
      leakageIndicators: [],
      subrogationOpportunities: [
        { id: 'sub-3-1', opportunityType: 'Third-Party Auto Liability', description: "Insured died in a motor vehicle accident. If a third-party driver was at fault, the carrier may be entitled to subrogation recovery against the at-fault party's auto liability insurer. Police report and accident reconstruction needed to assess fault.", estimatedRecovery: Math.round(175000 * 0.60), probability: 'Medium', recommendedAction: 'Request Dallas PD accident report. If third-party liability confirmed, initiate subrogation referral before payment is issued.', status: 'Identified' }
      ],
      benchmarkData: {
        cycleTime: { current: daysOpen, industryAvg: 8, carrierAvg: 7, variance: daysOpen <= 7 ? 'On Track' : `+${Math.round((daysOpen / 7 - 1) * 100)}%`, status: daysOpen <= 7 ? 'On Track' : 'At Risk' },
        reserveAccuracy: { currentReserve: 157500, benchmarkRatio: '90%', status: 'Adequate' },
        similarClaims: { count: 312, avgCycleTime: 8, avgSettlement: 172000, subrogationRate: '38%', fraudRate: '1.8%' },
        insights: [
          'MVA death claims have a 38% subrogation recovery rate — investigation is strongly recommended',
          'Average settlement for similar MVA Term Life claims: $172,000 vs. this claim\'s $175,000 face value',
          'STP pathway typically resolves MVA claims in 8 days assuming police report received within 3 days'
        ]
      },
      nextBestActions: [
        { id: 'nba-3-1', priority: 1, action: 'Place Subrogation Hold Before Payment', description: 'File subrogation hold and initiate third-party liability assessment before issuing any payment. Preserves recovery rights.', rationale: 'MVA claims have 38% subrogation rate; payment before investigation may waive recovery rights', urgency: 'Immediate', agent: 'Subrogation Opportunity Agent', category: 'Recovery' },
        { id: 'nba-3-2', priority: 2, action: 'Obtain Dallas PD Accident Report', description: `Request Dallas Police Department accident report for MVA on ${claim.deathEvent.dateOfDeath} to determine fault assignment`, rationale: 'Required to confirm third-party liability and support subrogation assessment', urgency: 'This Week', agent: 'Claim Audit Agent', category: 'Documentation' },
        { id: 'nba-3-3', priority: 3, action: 'Collect W-9 and Payment Election from Maria Garcia', description: 'While subrogation is assessed, proceed with collecting tax form and payment method selection', rationale: 'STP documents are complete except for W-9 and payment election', urgency: 'This Week', agent: 'Next Best Action Agent', category: 'Documentation' }
      ],
      auditFindings: [
        { id: 'af-3-1', stage: 'FNOL', finding: 'MVA death claim entered STP pathway without subrogation hold being placed. Standard procedure requires subrogation review before payment on accidental death claims.', severity: 'Medium', category: 'Missed Step', detectedAt: new Date(new Date(claim.createdAt).getTime() + 1 * DAY).toISOString(), status: 'Open' }
      ]
    };
  }

  // ── claim-4: William Davis — APPROVED, Hurricane disaster ──
  if (claim.id === 'claim-4') {
    return {
      lastAnalyzed: new Date(NOW.getTime() - 3 * 3600000).toISOString(),
      overallRisk: 'Low', leakageExposure: 0,
      claimSummary: {
        narrative: `Death claim for William Davis, age 60, who died from hurricane-related injuries in Miami, FL. Policy POL-738156 is a $200,000 Term Life policy. Claim was approved after ${daysOpen} days with disaster event provisions applicable. Disaster provision documentation is incomplete. Payment scheduling is the final outstanding action.`,
        keyEvents: [
          { date: claim.createdAt, event: 'FNOL received — disaster event flag set (Hurricane-related)' },
          { date: new Date(new Date(claim.createdAt).getTime() + 5 * DAY).toISOString(), event: 'Coroner report received confirming hurricane-related injuries' },
          { date: new Date(new Date(claim.createdAt).getTime() + 18 * DAY).toISOString(), event: 'Claim approved — payment scheduling pending' }
        ],
        investigationStatus: 'Cleared — Approved, Awaiting Payment',
        outstandingActions: ['Schedule ACH payment to Susan Davis', 'Complete disaster provisions documentation', 'Verify FEMA duplicate benefit eligibility'],
        policyClaimantDetails: {
          policy: { 'Policy Number': 'POL-738156', 'Policy Type': 'Term Life', 'Face Amount': '$200,000', 'Status': 'In Force', 'Issue Date': 'Sep 2019', 'Issue State': 'FL' },
          claimant: { 'Name': 'Susan Davis', 'Relationship': 'Spouse', 'Phone': '305-555-0419', 'ID Verification': 'Verified (score 93)' }
        },
        documentation: {
          received: ['Coroner Report (hurricane-related)', 'Claimant Statement', 'Policy In-Force Confirmation', 'Hurricane Event Documentation', 'LexisNexis Verification (score 85)'],
          missing: ['FEMA Registration Cross-Reference', 'Disaster Provisions Checklist (incomplete)', 'Payment Scheduling Confirmation']
        },
        eligibilityValidation: {
          checks: [
            { label: 'Policy In-Force at Date of Death', status: 'pass' },
            { label: 'Contestability Period Clear', status: 'pass' },
            { label: 'Death Verification', status: 'pass', detail: 'Hurricane-related injuries confirmed' },
            { label: 'Beneficiary Identity Verified', status: 'pass' },
            { label: 'Disaster Provisions Applied', status: 'warn', detail: 'Checklist incomplete' },
            { label: 'FEMA Duplicate Benefit Check', status: 'warn', detail: 'Cross-reference not yet completed' }
          ]
        },
        riskIndicators: [
          { label: 'FEMA Benefit Overlap Risk', severity: 'Low', detail: 'FL disaster claims — FEMA cross-reference required' }
        ],
        payoutReadiness: {
          status: 'Partial',
          estimatedAmount: 200000,
          blockers: ['FEMA duplicate benefit check pending', 'Disaster provisions documentation incomplete']
        }
      },
      fraudSignals: {
        score: 38,
        signals: [{ id: 'fs-4-1', category: 'Documentation', severity: 'Low', indicator: 'Disaster Provisions Checklist Incomplete', description: 'Claim was approved as disaster-related but the disaster provisions document checklist has not been formally completed. Documentation gap, not a fraud indicator, but required before closure.', dataSource: 'Internal Audit', confidence: 95, detectedAt: new Date(new Date(claim.createdAt).getTime() + 3 * DAY).toISOString(), recommendation: 'Complete disaster provisions documentation before claim closure' }]
      },
      leakageIndicators: [
        { id: 'li-4-1', category: 'Potential Duplicate Benefit — FEMA', severity: 'Medium', description: 'Hurricane-related death may qualify for FEMA disaster assistance. Cross-reference required to prevent duplicate government benefit overlap with insurance proceeds.', estimatedAmount: 0, recommendation: 'Verify FEMA registration under insured or claimant name before issuing payment', status: 'Open' }
      ],
      subrogationOpportunities: [
        { id: 'sub-4-1', opportunityType: 'Government Disaster Program Overlap', description: 'If FEMA or state disaster relief has already compensated the claimant for the same loss, the insurer may have a coordination of benefits right. Low probability but verification is required.', estimatedRecovery: 0, probability: 'Low', recommendedAction: 'Verify FEMA registration and any disaster relief payments received by claimant before closing', status: 'Identified' }
      ],
      benchmarkData: {
        cycleTime: { current: daysOpen, industryAvg: 25, carrierAvg: 22, variance: 'On Track', status: 'On Track' },
        reserveAccuracy: { currentReserve: 180000, benchmarkRatio: '90%', status: 'Adequate' },
        similarClaims: { count: 89, avgCycleTime: 25, avgSettlement: 198000, subrogationRate: '8%', fraudRate: '3.2%' },
        insights: [
          `Disaster claims average 25 days to resolution — this claim at ${daysOpen} days is tracking well`,
          'Disaster claims have a slightly elevated fraud rate of 3.2% vs. 1.8% for standard claims',
          'Hurricane claims in FL have an 8% government benefit overlap rate — FEMA verification is standard procedure'
        ]
      },
      nextBestActions: [
        { id: 'nba-4-1', priority: 1, action: 'Schedule ACH Payment to Susan Davis', description: 'Claim approved. Issue $200,000 ACH payment to Susan Davis. Confirm banking details and generate payment confirmation letter.', rationale: 'Approval is complete; payment is the only remaining financial action', urgency: 'Immediate', agent: 'Next Best Action Agent', category: 'Payment' },
        { id: 'nba-4-2', priority: 2, action: 'Verify FEMA Registration Before Payment', description: 'Check FEMA disaster relief database for William Davis or Susan Davis to rule out duplicate benefit coordination', rationale: 'Disaster claims require FEMA cross-reference per operational guidelines before closure', urgency: 'This Week', agent: 'Leakage Detection Agent', category: 'Compliance' },
        { id: 'nba-4-3', priority: 3, action: 'Complete Disaster Provisions Documentation', description: 'Formally document disaster provision application in claim file for audit trail and state regulatory reporting', rationale: 'Incomplete documentation will fail claim file audit', urgency: 'This Week', agent: 'Compliance Agent', category: 'Compliance' }
      ],
      auditFindings: [
        { id: 'af-4-1', stage: 'Coverage', finding: 'Disaster provisions checklist not completed despite claim being flagged as disaster-related at FNOL and approved', severity: 'Low', category: 'Incomplete Documentation', detectedAt: new Date(new Date(claim.createdAt).getTime() + 15 * DAY).toISOString(), status: 'Open' }
      ]
    };
  }

  // ── claim-5: Richard Moore — UNDER_REVIEW, pending investigation, policy loan ──
  if (claim.id === 'claim-5') {
    const loanBalance = 12500;
    return {
      lastAnalyzed: new Date(NOW.getTime() - 0.5 * 3600000).toISOString(),
      overallRisk: 'High', leakageExposure: pmiAccrual + loanBalance,
      claimSummary: {
        narrative: `Death claim filed by Patricia Moore (spouse) for Richard Moore, age 65, who died under investigation in Brooklyn, NY. Manner of death has not been finalized by the medical examiner. Policy POL-415892 is a $125,000 Term Life policy with a $12,500 outstanding loan balance. SLA expires in ${claim.workflow?.sla?.daysRemaining ?? 3} day(s) — extension request is required immediately. Payment is on hold pending investigation outcome.`,
        keyEvents: [
          { date: claim.createdAt, event: 'FNOL received — manner of death listed as Pending/Under Investigation' },
          { date: new Date(new Date(claim.createdAt).getTime() + 2 * DAY).toISOString(), event: 'Medical Examiner investigation confirmed ongoing — no completion timeline given' },
          { date: new Date(new Date(claim.createdAt).getTime() + 20 * DAY).toISOString(), event: 'Policy loan balance verified: $12,500 outstanding — deduction required at settlement' },
          { date: new Date(NOW.getTime() - 2 * DAY).toISOString(), event: 'SLA risk alert: fewer than 3 days remaining — extension not yet filed' }
        ],
        investigationStatus: 'Active — Medical Examiner Investigation Pending',
        outstandingActions: ['FILE SLA EXTENSION IMMEDIATELY', 'Obtain final ME report', 'Configure $12,500 loan deduction in payment module', 'W-9 and payment election from Patricia Moore'],
        policyClaimantDetails: {
          policy: { 'Policy Number': 'POL-415892', 'Policy Type': 'Term Life', 'Face Amount': '$125,000', 'Loan Balance': '$12,500', 'Net Benefit': '$112,500', 'Issue Date': 'Jun 2015', 'Issue State': 'NY' },
          claimant: { 'Name': 'Patricia Moore', 'Relationship': 'Spouse', 'Phone': '718-555-0563', 'ID Verification': 'Pending (score 79)' }
        },
        documentation: {
          received: ['Hospital Record', 'Claimant Statement (FNOL)', 'Policy In-Force Confirmation'],
          missing: ['Final Medical Examiner Report', 'Beneficiary Government-Issued ID', 'SLA Extension Form (URGENT)', 'IRS W-9 Form', 'Payment Election Form']
        },
        eligibilityValidation: {
          checks: [
            { label: 'Policy In-Force at Date of Death', status: 'pass' },
            { label: 'Contestability Period Clear', status: 'pass' },
            { label: 'Cause of Death Determined', status: 'fail', detail: 'ME investigation ongoing — no completion date' },
            { label: 'Beneficiary Identity Verified', status: 'fail', detail: 'Government ID pending' },
            { label: 'Policy Loan Deduction Configured ($12,500)', status: 'fail', detail: 'Not yet set in payment module' },
            { label: 'SLA Extension Filed', status: 'fail', detail: 'EXPIRES IN 3 DAYS — urgent' }
          ]
        },
        riskIndicators: [
          { label: 'ME Investigation — No Timeline', severity: 'High', detail: '27 days, no completion date given' },
          { label: 'SLA Breach Imminent', severity: 'High', detail: 'Extension not filed — 3 days remaining' },
          { label: '$12,500 Loan Overpayment Risk', severity: 'High', detail: 'Deduction not pre-configured' }
        ],
        payoutReadiness: {
          status: 'Blocked',
          estimatedAmount: 112500,
          blockers: ['ME investigation not complete', 'SLA extension not filed — imminent breach', 'Beneficiary verification pending', '$12,500 loan deduction not configured in payment module']
        }
      },
      fraudSignals: {
        score: 58,
        signals: [
          { id: 'fs-5-1', category: 'Investigation', severity: 'High', indicator: 'Manner of Death Under Investigation — 27 Days', description: `Medical Examiner investigation has been ongoing for ${daysOpen} days without a finding. The extended investigation period may indicate a complex or contested cause of death. Policy exclusion clauses for specific manners of death should be reviewed now.`, dataSource: 'Internal Claim File', confidence: 95, detectedAt: claim.createdAt, recommendation: 'Refer to SIU for preliminary parallel review. Review policy exclusion language before investigation concludes.' },
          { id: 'fs-5-2', category: 'Documentation', severity: 'Medium', indicator: 'Beneficiary Verification Pending — Extended Duration', description: `Primary beneficiary identity verification has not been completed after ${daysOpen} days. Combined with pending investigation, this warrants enhanced scrutiny.`, dataSource: 'Internal', confidence: 65, detectedAt: new Date(new Date(claim.createdAt).getTime() + 7 * DAY).toISOString(), recommendation: 'Conduct independent beneficiary identity verification regardless of investigation outcome' }
        ]
      },
      leakageIndicators: [
        { id: 'li-5-1', category: 'Policy Loan Deduction — Overpayment Risk', severity: 'High', description: `Outstanding policy loan of $12,500 must be deducted from $125,000 face amount at settlement. Net benefit is $112,500. Failure to apply deduction would result in $12,500 direct overpayment.`, estimatedAmount: loanBalance, recommendation: 'Pre-configure net benefit as $112,500 in payment module immediately', status: 'Open' },
        { id: 'li-5-2', category: 'PMI Accrual — Open-Ended Investigation', severity: 'Medium', description: `NY PMI accruing at 8% p.a. on $125,000 ($${dailyPMI}/day). Uncertain investigation timeline creates open-ended liability. Current exposure: $${pmiAccrual.toLocaleString()}.`, estimatedAmount: pmiAccrual, recommendation: 'Request ME office timeline. Document PMI exposure in reserve.', status: 'Monitoring' }
      ],
      subrogationOpportunities: [
        { id: 'sub-5-1', opportunityType: 'Third-Party Liability (Investigation Dependent)', description: 'If the investigation determines death involved a third-party act (assault, negligence), subrogation recovery rights may apply. Monitor investigation outcome.', estimatedRecovery: 0, probability: 'Low', recommendedAction: 'Place conditional subrogation hold. Activate full referral if investigation confirms third-party fault.', status: 'Identified' }
      ],
      benchmarkData: {
        cycleTime: { current: daysOpen, industryAvg: 35, carrierAvg: 32, variance: 'In Range', status: 'On Track' },
        reserveAccuracy: { currentReserve: 112500, benchmarkRatio: '90% of net benefit', status: 'Adequate' },
        similarClaims: { count: 47, avgCycleTime: 42, avgSettlement: 112000, subrogationRate: '12%', fraudRate: '8.5%' },
        insights: [
          `Investigation-pending claims average 42 days — this claim at ${daysOpen} days is within normal range`,
          'Similar investigation claims carry an elevated fraud rate of 8.5% — SIU referral is recommended',
          `Policy loan deduction of $12,500 must be applied at settlement — net benefit is $112,500 not $125,000`
        ]
      },
      nextBestActions: [
        { id: 'nba-5-1', priority: 1, action: 'File SLA Extension — URGENT', description: `SLA expires in ${claim.workflow?.sla?.daysRemaining ?? 3} day(s). File extension with supervisor approval citing active ME investigation. Document in claim notes immediately.`, rationale: 'SLA breach without an approved extension is a regulatory compliance violation', urgency: 'Immediate', agent: 'Compliance Agent', category: 'Compliance' },
        { id: 'nba-5-2', priority: 2, action: 'Refer to SIU for Preliminary Review', description: 'Given fraud score of 58 and ME investigation exceeding 25 days, refer to Special Investigations Unit for parallel review', rationale: 'Investigation-pending claims exceeding 25 days breach the SIU referral threshold', urgency: 'Immediate', agent: 'Fraud Signal Agent', category: 'Investigation' },
        { id: 'nba-5-3', priority: 3, action: 'Pre-Configure $12,500 Loan Deduction in Payment Module', description: 'Set net benefit to $112,500 in payment workflow now to prevent overpayment when claim reaches approval stage', rationale: 'Prevents $12,500 overpayment — highest-value leakage item on this claim', urgency: 'This Week', agent: 'Leakage Detection Agent', category: 'Financial' },
        { id: 'nba-5-4', priority: 4, action: 'Contact NY Medical Examiner for Timeline', description: 'Escalate to ME office supervisor requesting estimated report completion date. Document response in claim notes.', rationale: 'ME report is the sole outstanding item preventing claim resolution', urgency: 'This Week', agent: 'Claim Audit Agent', category: 'Investigation' }
      ],
      auditFindings: [
        { id: 'af-5-1', stage: 'Investigation', finding: `Claim under review for ${daysOpen} days with active ME investigation — SLA extension has not been filed`, severity: 'High', category: 'SLA Breach Risk', detectedAt: new Date(NOW.getTime() - 3 * DAY).toISOString(), status: 'Open' },
        { id: 'af-5-2', stage: 'Payment', finding: 'Policy loan deduction of $12,500 has not been pre-configured in payment module — overpayment risk at approval stage', severity: 'High', category: 'Missed Step', detectedAt: new Date(NOW.getTime() - 7 * DAY).toISOString(), status: 'Open' },
        { id: 'af-5-3', stage: 'Investigation', finding: `Beneficiary identity verification not completed after ${daysOpen} days`, severity: 'Medium', category: 'Incomplete Documentation', detectedAt: new Date(NOW.getTime() - 15 * DAY).toISOString(), status: 'Open' }
      ]
    };
  }

  // ── claim-sw: Sam Wright — NEW, STP, Cardiac ──
  if (claim.id === 'claim-sw') {
    return {
      lastAnalyzed: new Date(NOW.getTime() - 1 * 3600000).toISOString(),
      overallRisk: 'Low', leakageExposure: 0,
      claimSummary: {
        narrative: `Death claim filed by Jennifer Wright (spouse) for Sam Wright, age 56, who died of cardiac arrest in Los Angeles, CA. Policy POL-290471 is a $250,000 Term Life policy issued July 2019. STP eligibility score 93 — all automated verification checks passed. W-9 and payment election are the only outstanding items. Claim is ${daysOpen} days old, tracking ahead of the STP benchmark of 7 days.`,
        keyEvents: [
          { date: claim.createdAt, event: 'FNOL received — STP eligibility score 93' },
          { date: new Date(new Date(claim.createdAt).getTime() + 15 * 60000).toISOString(), event: 'All auto-verification checks passed — death, policy, beneficiary match confirmed' },
          { date: new Date(new Date(claim.createdAt).getTime() + 1 * DAY).toISOString(), event: 'Requirements generated — W-9 and payment election outstanding' }
        ],
        investigationStatus: 'Cleared — STP Processing',
        outstandingActions: ['IRS W-9 form from Jennifer Wright', 'Payment election form (ACH preferred)'],
        policyClaimantDetails: {
          policy: { 'Policy Number': 'POL-290471', 'Policy Type': 'Term Life', 'Face Amount': '$250,000', 'Status': 'In Force', 'Issue Date': 'Jul 2019', 'Issue State': 'CA' },
          claimant: { 'Name': 'Jennifer Wright', 'Relationship': 'Spouse', 'Phone': '415-555-0273', 'ID Verification': 'Verified (score 97)' }
        },
        documentation: {
          received: ['Death Certificate', 'Claimant Statement', 'Policy In-Force Confirmation', 'LexisNexis Verification (score 96)', 'All STP Auto-Verification Checks'],
          missing: ['IRS W-9 Form', 'Payment Election Form (ACH)']
        },
        eligibilityValidation: {
          checks: [
            { label: 'Policy In-Force at Date of Death', status: 'pass' },
            { label: 'Contestability Period Clear (>2 years)', status: 'pass' },
            { label: 'Death Verification (LexisNexis 96)', status: 'pass' },
            { label: 'Beneficiary Identity Verified', status: 'pass' },
            { label: 'STP Score 93 — All Criteria Met', status: 'pass' }
          ]
        },
        riskIndicators: [],
        payoutReadiness: {
          status: 'Partial',
          estimatedAmount: 250000,
          blockers: ['W-9 form pending from Jennifer Wright', 'Payment election form not yet received']
        }
      },
      fraudSignals: { score: 18, signals: [] },
      leakageIndicators: [],
      subrogationOpportunities: [],
      benchmarkData: {
        cycleTime: { current: daysOpen, industryAvg: 7, carrierAvg: 7, variance: daysOpen <= 7 ? 'On Track' : `+${Math.round((daysOpen / 7 - 1) * 100)}%`, status: 'On Track' },
        reserveAccuracy: { currentReserve: 225000, benchmarkRatio: '90%', status: 'Adequate' },
        similarClaims: { count: 2187, avgCycleTime: 7, avgSettlement: 249000, subrogationRate: '0%', fraudRate: '0.5%' },
        insights: [
          `STP claims average 7 days to closure — currently at ${daysOpen} day(s), tracking on schedule`,
          'CA post-mortem interest at 10% p.a.: collecting W-9 and payment election promptly avoids unnecessary accrual',
          'Cardiac arrest claims carry the lowest fraud rate (0.5%) across all STP claim types'
        ]
      },
      nextBestActions: [
        { id: 'nba-sw-1', priority: 1, action: 'Send W-9 and Payment Election Request to Jennifer Wright', description: 'Email consolidated document request with IRS W-9 and ACH payment election form via secure upload portal', rationale: 'These are the only two items outstanding before payment can be issued', urgency: 'Immediate', agent: 'Next Best Action Agent', category: 'Documentation' },
        { id: 'nba-sw-2', priority: 2, action: 'Queue for Payment Approval on Document Receipt', description: 'Pre-stage payment approval workflow so payment is issued within 24 hours of W-9 and payment election receipt', rationale: 'All STP criteria satisfied — payment should be immediate upon document receipt', urgency: 'This Week', agent: 'Claim Audit Agent', category: 'Payment' }
      ],
      auditFindings: []
    };
  }

  // ── claim-ah: Aiden Hakim — UNDER_REVIEW, address discrepancy ──
  if (claim.id === 'claim-ah') {
    return {
      lastAnalyzed: new Date(NOW.getTime() - 1.5 * 3600000).toISOString(),
      overallRisk: 'Medium', leakageExposure: pmiAccrual,
      claimSummary: {
        narrative: `Death claim filed by Layla Hakim (spouse) for Aiden Hakim, age 53, who died of Hypertensive Heart Disease in New York, NY. Policy POL-382156 is a $350,000 Whole Life policy issued November 2017. A discrepancy between the FNOL-submitted address and the Policy Admin address has been flagged for identity verification. PMI is accruing at $${dailyPMI}/day on $350,000. Claim is ${daysOpen} days old.`,
        keyEvents: [
          { date: claim.createdAt, event: 'FNOL received — address discrepancy flagged during verification' },
          { date: new Date(new Date(claim.createdAt).getTime() + 1 * DAY).toISOString(), event: 'Risk alert: FNOL beneficiary address does not match Policy Admin records' },
          { date: new Date(new Date(claim.createdAt).getTime() + 3 * DAY).toISOString(), event: 'Initial review complete — government ID request sent to beneficiary' }
        ],
        investigationStatus: 'Active — Address & Identity Verification',
        outstandingActions: ['Government-issued ID with current address', 'USPS address validation of submitted address', 'Beneficiary identity verification', 'W-9 and payment election forms'],
        policyClaimantDetails: {
          policy: { 'Policy Number': 'POL-382156', 'Policy Type': 'Whole Life', 'Face Amount': '$350,000', 'Status': 'In Force', 'Issue Date': 'Nov 2017', 'Issue State': 'NY' },
          claimant: { 'Name': 'Layla Hakim', 'Relationship': 'Spouse', 'Phone': '(on file)', 'ID Verification': 'Pending — Address Mismatch' }
        },
        documentation: {
          received: ['Claimant Statement (FNOL)', 'Policy In-Force Confirmation', 'Initial FNOL Submission'],
          missing: ['Government-Issued Photo ID (current address)', 'USPS Address Delivery Validation', 'Beneficiary Identity Verification', 'IRS W-9 Form', 'Payment Election Form']
        },
        eligibilityValidation: {
          checks: [
            { label: 'Policy In-Force at Date of Death', status: 'pass' },
            { label: 'Contestability Period Clear', status: 'pass' },
            { label: 'Death Verification', status: 'pass' },
            { label: 'FNOL Address Matches Policy Admin', status: 'fail', detail: 'Mismatch detected at FNOL' },
            { label: 'Beneficiary Identity Verified', status: 'fail', detail: 'Pending government ID with current address' }
          ]
        },
        riskIndicators: [
          { label: 'Address Discrepancy', severity: 'Medium', detail: 'FNOL address does not match Policy Admin records' }
        ],
        payoutReadiness: {
          status: 'Blocked',
          estimatedAmount: 350000,
          blockers: ['Address discrepancy not yet resolved', 'Beneficiary identity verification pending', 'W-9 and payment election forms outstanding']
        }
      },
      fraudSignals: {
        score: 46,
        signals: [{ id: 'fs-ah-1', category: 'Claimant Behavior', severity: 'Medium', indicator: 'FNOL Address Does Not Match Policy Admin Records', description: "Layla Hakim's address submitted in the FNOL differs from the address on file in Policy Admin. Address mismatches are flagged as a potential identity spoofing indicator under LexisNexis Fraud Score guidelines. Claimant verification score is 81.", dataSource: 'Policy Admin / LexisNexis', confidence: 78, detectedAt: new Date(new Date(claim.createdAt).getTime() + 0.5 * DAY).toISOString(), recommendation: 'Request current government-issued photo ID. Cross-check submitted address with USPS Delivery Point Validation.' }]
      },
      leakageIndicators: [
        { id: 'li-ah-1', category: 'PMI Accrual — Verification Delay', severity: 'Medium', description: `NY PMI accruing at 8% p.a. on $350,000 ($${dailyPMI}/day). Address verification delay is extending exposure. Current accrual: $${pmiAccrual.toLocaleString()} at ${daysOpen} days.`, estimatedAmount: pmiAccrual, recommendation: 'Expedite address and identity verification to reduce ongoing PMI exposure', status: 'Monitoring' }
      ],
      subrogationOpportunities: [],
      benchmarkData: {
        cycleTime: { current: daysOpen, industryAvg: 15, carrierAvg: 15, variance: daysOpen <= 15 ? 'On Track' : `+${Math.round((daysOpen / 15 - 1) * 100)}%`, status: daysOpen <= 15 ? 'On Track' : 'At Risk' },
        reserveAccuracy: { currentReserve: 315000, benchmarkRatio: '90%', status: 'Adequate' },
        similarClaims: { count: 634, avgCycleTime: 15, avgSettlement: 347000, subrogationRate: '0%', fraudRate: '3.4%' },
        insights: [
          'Address mismatch cases take on average 4 additional days vs. standard whole life claims',
          `PMI on $350,000 at NY rate: $${dailyPMI}/day — verification delay is a meaningful cost driver`,
          'Whole life claims with address discrepancies carry a 3.4% fraud rate — elevated monitoring is standard'
        ]
      },
      nextBestActions: [
        { id: 'nba-ah-1', priority: 1, action: 'Request Current Government-Issued Photo ID from Layla Hakim', description: "Contact via phone and secure portal — request driver's license or passport showing current address for cross-validation", rationale: 'Address discrepancy is the primary blocker for identity verification and payment processing', urgency: 'Immediate', agent: 'Fraud Signal Agent', category: 'Investigation' },
        { id: 'nba-ah-2', priority: 2, action: 'Run USPS Address Validation on Submitted Address', description: 'Validate FNOL address against USPS Delivery Point Validation database to assess address legitimacy before escalating', rationale: 'Low-cost automated step to triage address discrepancy before manual investigation', urgency: 'Immediate', agent: 'Fraud Signal Agent', category: 'Investigation' },
        { id: 'nba-ah-3', priority: 3, action: 'Send Identity Verification Letter to Policy Admin Address', description: 'Send formal verification request to the address on file in Policy Admin to confirm beneficiary access via dual channel', rationale: 'Dual-channel verification reduces risk of address fraud', urgency: 'This Week', agent: 'Claim Audit Agent', category: 'Documentation' }
      ],
      auditFindings: [
        { id: 'af-ah-1', stage: 'Investigation', finding: `Address discrepancy flagged at FNOL — identity verification formal request not documented after ${daysOpen} days`, severity: 'Medium', category: 'Missed Step', detectedAt: new Date(NOW.getTime() - 8 * DAY).toISOString(), status: 'Open' }
      ]
    };
  }

  // ── claim-ec: Ethan Carter — UNDER_REVIEW, complex estate ──
  if (claim.id === 'claim-ec') {
    const ecPMI = Math.round(500000 * 0.08 * daysOpen / 365);
    const ecDailyPMI = Math.round(500000 * 0.08 / 365);
    return {
      lastAnalyzed: new Date(NOW.getTime() - 0.25 * 3600000).toISOString(),
      overallRisk: 'Medium', leakageExposure: ecPMI,
      claimSummary: {
        narrative: `Complex death claim for Ethan Carter, age 58, who died of a myocardial infarction in Austin, TX on January 15, 2026. Policy POL-571390 is a $500,000 Universal Life policy with 4 named beneficiaries across 3 entity types: individual (40%), irrevocable trust (35%), estate (15%), and corporation (10%). Two NIGO documents are blocking progress — APS and trustee resolution. ${daysOpen} days open, SLA at ${claim.workflow?.sla?.daysRemaining ?? 15} days. PMI accruing at $${ecDailyPMI}/day.`,
        keyEvents: [
          { date: claim.createdAt, event: 'FNOL received — complex estate multi-entity workflow initiated' },
          { date: new Date(new Date(claim.createdAt).getTime() + 5 * DAY).toISOString(), event: 'Entity documentation packages issued to all 4 beneficiaries simultaneously' },
          { date: new Date(new Date(claim.createdAt).getTime() + 10 * DAY).toISOString(), event: 'NIGO: Trustee resolution returned — notarization missing' },
          { date: new Date(new Date(claim.createdAt).getTime() + 10 * DAY).toISOString(), event: 'NIGO: APS from Dr. Foster returned — scan quality below 300 dpi' }
        ],
        investigationStatus: 'Active — 2 NIGO Items, Entity Documentation Pending',
        outstandingActions: ['Resubmit APS (Dr. Foster, 300 dpi minimum)', 'Resubmit notarized trustee resolution (Benjamin Clark)', 'Trust agreement and EIN documents', 'Estate letters testamentary and EIN', 'Corporate resolution and TX SOS verification'],
        policyClaimantDetails: {
          policy: { 'Policy Number': 'POL-571390', 'Policy Type': 'Universal Life', 'Face Amount': '$500,000', 'Status': 'In Force', 'Issue Date': 'On File', 'Issue State': 'TX' },
          claimant: { 'Name': 'Multi-entity (4 beneficiaries)', 'Breakdown': '40% individual / 35% trust / 15% estate / 10% corp', 'Primary Contact': 'Mia Robinson (estate admin)', 'ID Verification': 'Individual verified; entities pending' }
        },
        documentation: {
          received: ['FNOL & Death Certificate', 'Individual Claimant Statement', 'LexisNexis Verification', 'Entity Documentation Packages (all 4 issued)'],
          missing: ['APS — Dr. Emily Foster (300 dpi resubmit)', 'Notarized Trustee Resolution (Benjamin Clark)', 'Trust Agreement & Trust EIN', 'Letters Testamentary & Estate EIN', 'Corporate Resolution & TX SOS Verification']
        },
        eligibilityValidation: {
          checks: [
            { label: 'Policy In-Force at Date of Death', status: 'pass' },
            { label: 'Death Verification', status: 'pass', detail: 'MI confirmed — Austin TX' },
            { label: 'Individual Beneficiary Verified', status: 'pass' },
            { label: 'APS Received (UL policy)', status: 'fail', detail: 'NIGO — scan quality below 300 dpi' },
            { label: 'Trust Documentation Complete', status: 'fail', detail: 'NIGO — notarization missing on trustee resolution' },
            { label: 'Estate Documentation Received', status: 'warn', detail: 'Letters testamentary in progress' },
            { label: 'Corporate Documentation Received', status: 'warn', detail: 'Request not yet issued' }
          ]
        },
        riskIndicators: [
          { label: 'NIGO — APS Scan Quality', severity: 'High', detail: 'Dr. Foster — resubmit at 300 dpi minimum' },
          { label: 'NIGO — Trustee Resolution', severity: 'Medium', detail: 'Benjamin Clark — notarization missing' },
          { label: 'Multi-Entity Complexity', severity: 'Low', detail: '4 entity types — trust, estate, corp, individual' }
        ],
        payoutReadiness: {
          status: 'Blocked',
          estimatedAmount: 500000,
          blockers: ['APS NIGO — resubmission required from Dr. Foster', 'Notarized trustee resolution pending (Benjamin Clark)', 'Corporate documentation request not yet issued', 'Estate letters testamentary in progress']
        }
      },
      fraudSignals: {
        score: 52,
        signals: [{ id: 'fs-ec-1', category: 'Documentation', severity: 'Low', indicator: 'Complex Multi-Entity Beneficiary Structure', description: 'Multiple non-individual beneficiaries (trust, estate, corporation) create elevated documentation complexity. While not a direct fraud indicator, complex ownership structures warrant standard entity verification protocols.', dataSource: 'Internal', confidence: 60, detectedAt: claim.createdAt, recommendation: 'Apply standard entity documentation protocols. Monitor for unusual ownership transfer patterns post-payment.' }]
      },
      leakageIndicators: [
        { id: 'li-ec-1', category: 'PMI Accrual — NIGO Delay', severity: 'High', description: `Two unresolved NIGO items are causing processing delays. At $${ecDailyPMI}/day on $500,000 Universal Life, each additional day adds $${ecDailyPMI} to PMI liability. Current exposure: $${ecPMI.toLocaleString()} at ${daysOpen} days.`, estimatedAmount: ecPMI, recommendation: 'Immediately resubmit APS and chase notarized trustee resolution to unblock critical path', status: 'Open' },
        { id: 'li-ec-2', category: 'TX Small Estate Threshold — Cost Reduction', severity: 'Low', description: "Estate of Ethan Carter's 15% share ($75,000) is at the TX small estate affidavit threshold. Using the small estate process avoids full probate, reducing legal fees by an estimated $2,500.", estimatedAmount: 2500, recommendation: 'Advise estate administrator Mia Robinson on TX small estate affidavit option', status: 'Monitoring' }
      ],
      subrogationOpportunities: [],
      benchmarkData: {
        cycleTime: { current: daysOpen, industryAvg: 45, carrierAvg: 42, variance: daysOpen <= 42 ? `On Track` : `+${Math.round((daysOpen / 42 - 1) * 100)}%`, status: daysOpen <= 42 ? 'On Track' : 'At Risk' },
        reserveAccuracy: { currentReserve: 450000, benchmarkRatio: '90%', status: 'Adequate' },
        similarClaims: { count: 23, avgCycleTime: 48, avgSettlement: 487000, subrogationRate: '0%', fraudRate: '2.2%' },
        insights: [
          `Complex multi-entity estate claims average 48 days — this claim at ${daysOpen} days is within normal range`,
          'Trustee resolution NIGO adds an average of 8 days to complex estate claim timelines',
          `PMI on $500K UL at TX rate: $${ecDailyPMI}/day — NIGO resolution directly reduces financial leakage`
        ]
      },
      nextBestActions: [
        { id: 'nba-ec-1', priority: 1, action: 'Resubmit APS Request to Dr. Emily Foster', description: "Contact Dr. Foster's office at Austin Medical Center (512-555-0892). Request APS resubmission at 300 dpi minimum via secure fax or upload portal.", rationale: 'APS NIGO has been outstanding for ~10 days and is on the critical path for UL policy medical review', urgency: 'Immediate', agent: 'Claim Audit Agent', category: 'Documentation' },
        { id: 'nba-ec-2', priority: 2, action: 'Chase Benjamin Clark for Notarized Trustee Resolution', description: 'Contact trustee (512-555-0380) — resolution was returned for missing notarization. Provide notarization requirements and a 5-business-day deadline.', rationale: 'Trust holds 35% ($175,000) of claim — trustee verification is the highest-value critical path item', urgency: 'Immediate', agent: 'Claim Audit Agent', category: 'Documentation' },
        { id: 'nba-ec-3', priority: 3, action: 'Issue Parallel Documentation Requests to Estate and Corporation', description: 'Send simultaneous requests to estate administrator Mia Robinson and Carter & Sons Construction LLC (Lucas Wright). Do not wait for trust resolution before starting.', rationale: 'Parallel collection reduces total cycle time by an estimated 12–15 days vs. sequential processing', urgency: 'This Week', agent: 'Next Best Action Agent', category: 'Documentation' },
        { id: 'nba-ec-4', priority: 4, action: 'Advise Estate Administrator on TX Small Estate Process', description: 'Inform Mia Robinson that the $75,000 estate share qualifies for TX small estate affidavit, potentially avoiding full probate court', rationale: 'Reduces estate legal overhead and accelerates estate documentation timeline', urgency: 'This Week', agent: 'Leakage Detection Agent', category: 'Financial' }
      ],
      auditFindings: [
        { id: 'af-ec-1', stage: 'Investigation', finding: 'APS from Dr. Foster returned NIGO ~10 days ago — no resubmission or documented follow-up in claim notes', severity: 'High', category: 'Missed Step', detectedAt: new Date(NOW.getTime() - 10 * DAY).toISOString(), status: 'Open' },
        { id: 'af-ec-2', stage: 'Investigation', finding: 'Trustee resolution NIGO — no escalation contact made to Benjamin Clark since initial document return', severity: 'Medium', category: 'Incomplete Documentation', detectedAt: new Date(NOW.getTime() - 7 * DAY).toISOString(), status: 'Open' },
        { id: 'af-ec-3', stage: 'FNOL', finding: 'Corporate beneficiary (Carter & Sons Construction LLC) documentation request not yet issued despite 30 days from claim creation', severity: 'Medium', category: 'Missed Step', detectedAt: new Date(NOW.getTime() - 5 * DAY).toISOString(), status: 'Open' }
      ]
    };
  }

  // ── Default: contextual insights for all other claims ──
  const overallRisk = riskScore < 30 ? 'Low' : riskScore < 55 ? 'Medium' : 'High';
  const alerts = claim.aiInsights?.alerts || [];
  return {
    lastAnalyzed: new Date(NOW.getTime() - Math.floor(daysOpen % 6 + 1) * 3600000).toISOString(),
    overallRisk,
    leakageExposure: claim.status === ClaimStatus.CLOSED ? 0 : pmiAccrual,
    claimSummary: {
      narrative: `Death claim for ${claim.insured?.name}${claim.insured?.age ? `, age ${claim.insured.age}` : ''}, filed by ${claim.claimant?.name} (${claim.claimant?.relationship || 'Beneficiary'}). Policy ${claim.policy?.policyNumber} — ${claim.policy?.type || 'Life Insurance'} with face amount $${(claimAmount).toLocaleString()}. Status: ${(claim.status || '').replace(/_/g, ' ')}. Claim is ${daysOpen} days old.`,
      keyEvents: [
        { date: claim.createdAt, event: 'FNOL submitted via beneficiary portal' },
        { date: new Date(new Date(claim.createdAt).getTime() + 5 * 60000).toISOString(), event: 'Policy verified in-force at date of death' },
        { date: new Date(new Date(claim.createdAt).getTime() + 10 * 60000).toISOString(), event: 'Death verification completed via LexisNexis' }
      ],
      investigationStatus: claim.status === ClaimStatus.CLOSED ? 'Cleared — Closed' : 'Active',
      outstandingActions: claim.status !== ClaimStatus.CLOSED ? ['Complete open requirements', 'Verify beneficiary identity'] : [],
      policyClaimantDetails: {
        policy: { 'Policy Number': claim.policy?.policyNumber || '—', 'Policy Type': claim.policy?.type || 'Life Insurance', 'Face Amount': `$${(claimAmount).toLocaleString()}`, 'Status': claim.policy?.status || 'In Force', 'Issue Date': claim.policy?.issueDate || '—' },
        claimant: { 'Name': claim.claimant?.name || '—', 'Relationship': claim.claimant?.relationship || 'Beneficiary', 'Phone': claim.claimant?.contactInfo?.phone || '—', 'ID Verification': isSTP ? 'Verified' : 'Pending' }
      },
      documentation: {
        received: ['Death Certificate', 'Claimant Statement', 'Policy In-Force Verification'],
        missing: claim.status === ClaimStatus.CLOSED ? [] : ['Outstanding requirements pending']
      },
      eligibilityValidation: {
        checks: [
          { label: 'Policy In-Force at Date of Death', status: 'pass' },
          { label: 'Death Verification', status: 'pass' },
          { label: 'Beneficiary Verified', status: isSTP ? 'pass' : 'warn', detail: isSTP ? undefined : 'Verification in progress' }
        ]
      },
      riskIndicators: alerts.map(a => ({ label: a.title || 'Risk Indicator', severity: a.severity || 'Low', detail: a.message || '' })),
      payoutReadiness: {
        status: claim.status === ClaimStatus.CLOSED ? 'Paid' : (isSTP ? 'Partial' : 'Blocked'),
        estimatedAmount: claimAmount,
        blockers: claim.status === ClaimStatus.CLOSED ? [] : ['Outstanding requirements must be completed']
      }
    },
    fraudSignals: {
      score: riskScore,
      signals: alerts.map((a, i) => ({ id: `fs-${claim.id}-${i}`, category: a.category || 'General', severity: a.severity || 'Low', indicator: a.title || 'Risk Indicator', description: a.description || a.message || '', dataSource: 'Internal', confidence: a.confidence || 70, detectedAt: a.timestamp || claim.createdAt, recommendation: a.recommendation || 'Review' }))
    },
    leakageIndicators: (claim.status !== ClaimStatus.CLOSED && pmiAccrual > 0) ? [
      { id: `li-${claim.id}-1`, category: 'PMI Accrual', severity: 'Low', description: `PMI accruing at ${(pmiRate * 100).toFixed(0)}% p.a. on $${claimAmount.toLocaleString()}. Estimated exposure: $${pmiAccrual.toLocaleString()}.`, estimatedAmount: pmiAccrual, recommendation: 'Expedite processing to reduce interest liability', status: 'Monitoring' }
    ] : [],
    subrogationOpportunities: claim.deathEvent?.mannerOfDeath === 'Accident' ? [
      { id: `sub-${claim.id}-1`, opportunityType: 'Accidental Death — Third-Party Liability', description: 'Accidental death claim. Third-party liability assessment recommended to identify potential subrogation recovery.', estimatedRecovery: 0, probability: 'Low', recommendedAction: 'Review accident circumstances for third-party liability before issuing payment', status: 'Identified' }
    ] : [],
    benchmarkData: {
      cycleTime: { current: daysOpen, industryAvg: isSTP ? 10 : 20, carrierAvg: isSTP ? 8 : 18, variance: 'In Range', status: 'On Track' },
      reserveAccuracy: { currentReserve: claim.financial?.reserve || 0, benchmarkRatio: '90%', status: claim.status === ClaimStatus.CLOSED ? 'Closed' : 'Adequate' },
      similarClaims: { count: 150, avgCycleTime: isSTP ? 8 : 18, avgSettlement: Math.round(claimAmount * 0.99), subrogationRate: '2%', fraudRate: '1.5%' },
      insights: [`Claim is tracking within normal range for ${isSTP ? 'STP' : 'standard'} ${claim.policy?.type || 'life'} processing`]
    },
    nextBestActions: claim.status === ClaimStatus.CLOSED ? [] : [
      { id: `nba-${claim.id}-1`, priority: 1, action: 'Review and Advance Outstanding Requirements', description: 'Complete all pending requirements to advance claim through the processing workflow', rationale: 'Outstanding requirements are the primary blocker for claim progression', urgency: 'This Week', agent: 'Next Best Action Agent', category: 'Documentation' }
    ],
    auditFindings: []
  };
};

// ============================================================
// 5 Hand-crafted showcase claims
// ============================================================
const createShowcaseClaims = () => {
  const claims = [];

  // ---- CLAIM 1: Elizabeth Jones (featured, UNDER_REVIEW, Standard) ----
  {
    const createdDate = new Date(NOW.getTime() - 20 * DAY);
    const deathDate = new Date(NOW.getTime() - 25 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-1', claimNumber: 'CLM-000001', status: ClaimStatus.UNDER_REVIEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 2 * DAY).toISOString(), closedAt: null,
      deathEvent: {
        dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Natural', causeOfDeath: 'Natural Causes',
        deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'IL', proofOfDeathSourceType: 'Death Certificate',
        proofOfDeathDate: new Date(deathDate.getTime() + 3 * DAY).toISOString().split('T')[0],
        certifiedDOB: '1958-06-15', verificationSource: 'LexisNexis', verificationScore: 88, specialEvent: null
      },
      insured: { name: 'Robert Jones', ssn: maskedSSN('4821'), dateOfBirth: '1958-06-15', dateOfDeath: deathDate.toISOString().split('T')[0], age: 67 },
      claimant: { name: 'Elizabeth Jones', relationship: 'Spouse', contactInfo: { email: 'elizabeth.jones@email.com', phone: '312-555-0147' } },
      policies: [{ policyNumber: 'POL-847291', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2018-05-10', issueState: 'IL', region: 'Midwest', companyCode: 'BLM', planCode: 'TL200', faceAmount: 150000, currentCashValue: 90000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 30 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Robert Jones' }],
      policy: { policyNumber: 'POL-847291', type: 'Term Life', status: 'In Force', issueDate: '2018-05-10', faceAmount: 150000, owner: 'Robert Jones' },
      parties: [
        { id: 'party-1-1', name: 'Robert Jones', role: 'Insured', source: 'Policy Admin', resState: 'IL', dateOfBirth: '1958-06-15', ssn: maskedSSN('4821'), phone: '312-555-0198', email: 'robert.jones@email.com', address: '742 Maple Drive, Springfield, IL 62704', verificationStatus: 'Verified', verificationScore: 98, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-1-2', name: 'Elizabeth Jones', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'IL', dateOfBirth: '1960-03-22', ssn: maskedSSN('7193'), phone: '312-555-0147', email: 'elizabeth.jones@email.com', address: '742 Maple Drive, Springfield, IL 62704', verificationStatus: 'Pending', verificationScore: 82, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-1-3', name: 'David Jones', role: 'Contingent Beneficiary', source: 'Policy Admin', resState: 'IL', dateOfBirth: '1988-09-14', ssn: maskedSSN('3056'), phone: '312-555-0234', email: 'david.jones@email.com', address: '1580 Oak Lane, Springfield, IL 62701', verificationStatus: 'Pending', verificationScore: 78, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-1-4', name: 'Rachel Jones', role: 'Contingent Beneficiary', source: 'Policy Admin', resState: 'IL', dateOfBirth: '1991-12-03', ssn: maskedSSN('8412'), phone: '312-555-0367', email: 'rachel.jones@email.com', address: '2204 Pine Street, Chicago, IL 60614', verificationStatus: 'Pending', verificationScore: 80, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-1-5', name: 'Elizabeth Jones', role: 'Notifier', source: 'FNOL', resState: 'IL', phone: '312-555-0147', email: 'elizabeth.jones@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 45, alerts: [{ id: 'alert-1-1', severity: 'Medium', category: 'Beneficiary Change', title: 'Recent Beneficiary Modification', message: 'Beneficiary designation was updated 8 months before date of death', description: 'Policy beneficiary was updated 8 months before date of death. While this is within a typical review window, it should be verified during standard processing.', confidence: 72, recommendation: 'Review beneficiary change documentation and rationale', timestamp: new Date(deathDate.getTime() - 240 * DAY).toISOString() }] },
      financial: { claimAmount: 150000, reserve: 135000, amountPaid: 0, pmiState: 'IL', pmiRate: 0.08, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 150000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 5.75, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STANDARD, score: 76, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: false, noContestability: true, claimAmountThreshold: true, noAnomalies: false } },
      workflow: { fsoCase: 'FSO-CLM-000001', currentTask: 'Review Requirements', assignedTo: 'John Smith', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 3 } }
    };
    claim.sysId = 'demo-sys-id-1'; claim.fnolNumber = 'FNOL0000001';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 2: STP, CLOSED, clean claim ----
  {
    const createdDate = new Date(NOW.getTime() - 12 * DAY);
    const deathDate = new Date(NOW.getTime() - 18 * DAY);
    const closedDate = new Date(createdDate.getTime() + 7 * DAY);
    const slaDate = new Date(createdDate.getTime() + 10 * DAY);
    const daysOpen = Math.floor((closedDate - createdDate) / DAY);
    const pmiDays = Math.floor((closedDate - deathDate) / DAY);
    const claimAmount = 100000;
    const interestAmount = Math.floor((claimAmount * 0.10 * pmiDays) / 365);

    const claim = {
      id: 'claim-2', claimNumber: 'CLM-000002', status: ClaimStatus.CLOSED, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: closedDate.toISOString(), closedAt: closedDate.toISOString(),
      deathEvent: { dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Natural', causeOfDeath: 'Natural Causes', deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'FL', proofOfDeathSourceType: 'Death Certificate', proofOfDeathDate: new Date(deathDate.getTime() + 2 * DAY).toISOString().split('T')[0], certifiedDOB: '1952-11-08', verificationSource: 'LexisNexis', verificationScore: 96, specialEvent: null },
      insured: { name: 'Harold Mitchell', ssn: maskedSSN('2947'), dateOfBirth: '1952-11-08', dateOfDeath: deathDate.toISOString().split('T')[0], age: 73 },
      claimant: { name: 'Margaret Mitchell', relationship: 'Spouse', contactInfo: { email: 'margaret.mitchell@email.com', phone: '813-555-0291' } },
      policies: [{ policyNumber: 'POL-523184', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2016-03-15', issueState: 'FL', region: 'Southeast', companyCode: 'ALI', planCode: 'TL150', faceAmount: claimAmount, currentCashValue: 60000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 15 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Harold Mitchell' }],
      policy: { policyNumber: 'POL-523184', type: 'Term Life', status: 'In Force', issueDate: '2016-03-15', faceAmount: claimAmount, owner: 'Harold Mitchell' },
      parties: [
        { id: 'party-2-1', name: 'Harold Mitchell', role: 'Insured', source: 'Policy Admin', resState: 'FL', dateOfBirth: '1952-11-08', ssn: maskedSSN('2947'), phone: '813-555-0198', email: 'harold.mitchell@email.com', address: '4521 Palm Court, Tampa, FL 33602', verificationStatus: 'Verified', verificationScore: 98, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-2-2', name: 'Margaret Mitchell', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'FL', dateOfBirth: '1955-07-20', ssn: maskedSSN('6183'), phone: '813-555-0291', email: 'margaret.mitchell@email.com', address: '4521 Palm Court, Tampa, FL 33602', verificationStatus: 'Verified', verificationScore: 96, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-2-3', name: 'Margaret Mitchell', role: 'Notifier', source: 'FNOL', resState: 'FL', phone: '813-555-0291', email: 'margaret.mitchell@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 15, alerts: [] },
      financial: { claimAmount, reserve: 0, amountPaid: claimAmount, pmiState: 'FL', pmiRate: 0.10, pmiDays, interestAmount, netBenefitProceeds: claimAmount, netBenefitPMI: interestAmount, federalTaxRate: 24, stateTaxRate: 5.75, taxableAmount: interestAmount, federalTaxWithheld: Math.floor(interestAmount * 0.24), stateTaxWithheld: Math.floor(interestAmount * 0.0575), taxWithheld: Math.floor(interestAmount * 0.2975), percentage: 100, currency: 'USD',
        payments: [{ id: 'payment-2-1', paymentNumber: 'PAY-000002', payeeId: 'party-2-2', payeeName: 'Margaret Mitchell', payeeSSN: maskedSSN('6183'), payeeAddress: '4521 Palm Court, Tampa, FL 33602', benefitAmount: claimAmount, netBenefitProceeds: claimAmount, netBenefitPMI: interestAmount, pmiCalculation: { state: 'FL', rate: 10, dateOfDeath: deathDate.toISOString().split('T')[0], settlementDate: closedDate.toISOString().split('T')[0], days: pmiDays, amount: interestAmount }, taxWithholding: { federalRate: 24, stateRate: 5.75, taxableAmount: interestAmount, federalWithheld: Math.floor(interestAmount * 0.24), stateWithheld: Math.floor(interestAmount * 0.0575), totalWithheld: Math.floor(interestAmount * 0.2975) }, taxWithheld: Math.floor(interestAmount * 0.2975), netPayment: claimAmount + interestAmount - Math.floor(interestAmount * 0.2975), percentage: 100, paymentMethod: 'ACH', bankInfo: { accountType: 'Checking', routingNumber: '063107513', accountNumberLast4: '****7829' }, scheduledDate: closedDate.toISOString().split('T')[0], paymentDate: closedDate.toISOString().split('T')[0], status: 'Completed', glPosting: { posted: true, postingDate: new Date(closedDate.getTime() + DAY).toISOString().split('T')[0], batchNumber: 'GL-482910', accountCodes: { benefit: '5000-1000', pmi: '5000-1100', tax: '2000-3000' } }, tax1099: { generated: true, year: NOW.getFullYear(), formType: '1099-MISC', box3Amount: interestAmount } }] },
      routing: { type: RoutingType.STP, score: 92, eligible: true, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true } },
      workflow: { fsoCase: 'FSO-CLM-000002', currentTask: null, assignedTo: null, daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: Math.ceil((slaDate - closedDate) / DAY), atRisk: false } }
    };
    claim.sysId = 'demo-sys-id-2'; claim.fnolNumber = 'FNOL0000002';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 3: NEW, STP eligible, just submitted ----
  {
    const createdDate = new Date(NOW.getTime() - 2 * DAY);
    const deathDate = new Date(NOW.getTime() - 5 * DAY);
    const slaDate = new Date(createdDate.getTime() + 10 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-3', claimNumber: 'CLM-000003', status: ClaimStatus.NEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: createdDate.toISOString(), closedAt: null,
      deathEvent: { dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Accident', causeOfDeath: 'Motor Vehicle Accident', deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'TX', proofOfDeathSourceType: 'Death Certificate', proofOfDeathDate: new Date(deathDate.getTime() + 2 * DAY).toISOString().split('T')[0], certifiedDOB: '1970-04-22', verificationSource: 'LexisNexis', verificationScore: 94, specialEvent: null },
      insured: { name: 'Thomas Garcia', ssn: maskedSSN('5612'), dateOfBirth: '1970-04-22', dateOfDeath: deathDate.toISOString().split('T')[0], age: 55 },
      claimant: { name: 'Maria Garcia', relationship: 'Spouse', contactInfo: { email: 'maria.garcia@email.com', phone: '214-555-0382' } },
      policies: [{ policyNumber: 'POL-619247', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2020-01-15', issueState: 'TX', region: 'Southwest', companyCode: 'GLP', planCode: 'TL175', faceAmount: 175000, currentCashValue: 105000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 10 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Thomas Garcia' }],
      policy: { policyNumber: 'POL-619247', type: 'Term Life', status: 'In Force', issueDate: '2020-01-15', faceAmount: 175000, owner: 'Thomas Garcia' },
      parties: [
        { id: 'party-3-1', name: 'Thomas Garcia', role: 'Insured', source: 'Policy Admin', resState: 'TX', dateOfBirth: '1970-04-22', ssn: maskedSSN('5612'), phone: '214-555-0100', email: 'thomas.garcia@email.com', address: '8901 Bluebonnet Lane, Dallas, TX 75201', verificationStatus: 'Verified', verificationScore: 97, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-3-2', name: 'Maria Garcia', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'TX', dateOfBirth: '1972-08-11', ssn: maskedSSN('8934'), phone: '214-555-0382', email: 'maria.garcia@email.com', address: '8901 Bluebonnet Lane, Dallas, TX 75201', verificationStatus: 'Verified', verificationScore: 95, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-3-3', name: 'Maria Garcia', role: 'Notifier', source: 'FNOL', resState: 'TX', phone: '214-555-0382', email: 'maria.garcia@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 22, alerts: [] },
      financial: { claimAmount: 175000, reserve: 157500, amountPaid: 0, pmiState: 'TX', pmiRate: 0.10, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 175000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 0, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STP, score: 91, eligible: true, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true } },
      workflow: { fsoCase: 'FSO-CLM-000003', currentTask: 'Review Requirements', assignedTo: 'Sarah Johnson', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: false } }
    };
    claim.sysId = 'demo-sys-id-3'; claim.fnolNumber = 'FNOL0000003';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 4: APPROVED, Standard, disaster-related (Accident, not Homicide) ----
  {
    const createdDate = new Date(NOW.getTime() - 22 * DAY);
    const deathDate = new Date(NOW.getTime() - 28 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-4', claimNumber: 'CLM-000004', status: ClaimStatus.APPROVED, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 18 * DAY).toISOString(), closedAt: null,
      deathEvent: { dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Accident', causeOfDeath: 'Hurricane-related injuries', deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'FL', proofOfDeathSourceType: 'Coroner Report', proofOfDeathDate: new Date(deathDate.getTime() + 5 * DAY).toISOString().split('T')[0], certifiedDOB: '1965-02-28', verificationSource: 'LexisNexis', verificationScore: 85, specialEvent: 'Disaster Related' },
      insured: { name: 'William Davis', ssn: maskedSSN('3478'), dateOfBirth: '1965-02-28', dateOfDeath: deathDate.toISOString().split('T')[0], age: 60 },
      claimant: { name: 'Susan Davis', relationship: 'Spouse', contactInfo: { email: 'susan.davis@email.com', phone: '305-555-0419' } },
      policies: [{ policyNumber: 'POL-738156', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2019-09-01', issueState: 'FL', region: 'Southeast', companyCode: 'NWL', planCode: 'TL250', faceAmount: 200000, currentCashValue: 120000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 20 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'William Davis' }],
      policy: { policyNumber: 'POL-738156', type: 'Term Life', status: 'In Force', issueDate: '2019-09-01', faceAmount: 200000, owner: 'William Davis' },
      parties: [
        { id: 'party-4-1', name: 'William Davis', role: 'Insured', source: 'Policy Admin', resState: 'FL', dateOfBirth: '1965-02-28', ssn: maskedSSN('3478'), phone: '305-555-0200', email: 'william.davis@email.com', address: '1234 Ocean Drive, Miami, FL 33139', verificationStatus: 'Verified', verificationScore: 97, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-4-2', name: 'Susan Davis', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'FL', dateOfBirth: '1967-05-14', ssn: maskedSSN('9201'), phone: '305-555-0419', email: 'susan.davis@email.com', address: '1234 Ocean Drive, Miami, FL 33139', verificationStatus: 'Verified', verificationScore: 93, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-4-3', name: 'Susan Davis', role: 'Notifier', source: 'FNOL', resState: 'FL', phone: '305-555-0419', email: 'susan.davis@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 38, alerts: [{ id: 'alert-4-1', severity: 'Medium', category: 'Special Event', title: 'Disaster-Related Claim', message: 'Claim filed under disaster event provisions', description: 'Death occurred during a hurricane event. Expedited processing may be warranted per disaster provisions.', confidence: 90, recommendation: 'Apply disaster provisions for expedited processing', timestamp: createdDate.toISOString() }] },
      financial: { claimAmount: 200000, reserve: 180000, amountPaid: 0, pmiState: 'FL', pmiRate: 0.08, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 200000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 5.75, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STANDARD, score: 78, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: false } },
      workflow: { fsoCase: 'FSO-CLM-000004', currentTask: 'Schedule Payment', assignedTo: 'John Smith', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 3 } }
    };
    claim.sysId = 'demo-sys-id-4'; claim.fnolNumber = 'FNOL0000004';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 5: UNDER_REVIEW, Standard, SLA at risk, pending investigation ----
  {
    const createdDate = new Date(NOW.getTime() - 27 * DAY);
    const deathDate = new Date(NOW.getTime() - 35 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-5', claimNumber: 'CLM-000005', status: ClaimStatus.UNDER_REVIEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 20 * DAY).toISOString(), closedAt: null,
      deathEvent: { dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Pending', causeOfDeath: 'Under Investigation', deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'NY', proofOfDeathSourceType: 'Hospital Record', proofOfDeathDate: new Date(deathDate.getTime() + 4 * DAY).toISOString().split('T')[0], certifiedDOB: '1960-10-05', verificationSource: 'LexisNexis', verificationScore: 82, specialEvent: null },
      insured: { name: 'Richard Moore', ssn: maskedSSN('6745'), dateOfBirth: '1960-10-05', dateOfDeath: deathDate.toISOString().split('T')[0], age: 65 },
      claimant: { name: 'Patricia Moore', relationship: 'Spouse', contactInfo: { email: 'patricia.moore@email.com', phone: '718-555-0563' } },
      policies: [{ policyNumber: 'POL-415892', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2015-06-20', issueState: 'NY', region: 'Northeast', companyCode: 'FST', planCode: 'TL125', faceAmount: 125000, currentCashValue: 75000, loanBalance: 12500, paidToDate: new Date(deathDate.getTime() - 25 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Richard Moore' }],
      policy: { policyNumber: 'POL-415892', type: 'Term Life', status: 'In Force', issueDate: '2015-06-20', faceAmount: 125000, owner: 'Richard Moore' },
      parties: [
        { id: 'party-5-1', name: 'Richard Moore', role: 'Insured', source: 'Policy Admin', resState: 'NY', dateOfBirth: '1960-10-05', ssn: maskedSSN('6745'), phone: '718-555-0100', email: 'richard.moore@email.com', address: '567 Broadway, Brooklyn, NY 11201', verificationStatus: 'Verified', verificationScore: 96, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-5-2', name: 'Patricia Moore', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'NY', dateOfBirth: '1962-01-18', ssn: maskedSSN('2389'), phone: '718-555-0563', email: 'patricia.moore@email.com', address: '567 Broadway, Brooklyn, NY 11201', verificationStatus: 'Pending', verificationScore: 79, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-5-3', name: 'Patricia Moore', role: 'Notifier', source: 'FNOL', resState: 'NY', phone: '718-555-0563', email: 'patricia.moore@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 58, alerts: [
        { id: 'alert-5-1', severity: 'High', category: 'Investigation', title: 'Pending Cause of Death', message: 'Manner of death is still under investigation', description: 'The manner and cause of death have not been finalized. Medical examiner investigation is ongoing.', confidence: 95, recommendation: 'Await final medical examiner report before proceeding with approval', timestamp: createdDate.toISOString() },
        { id: 'alert-5-2', severity: 'Medium', category: 'Policy Loan', title: 'Outstanding Policy Loan', message: 'Policy has an outstanding loan balance of $12,500', description: 'Loan balance will be deducted from benefit amount at time of payment.', confidence: 100, recommendation: 'Deduct loan balance from net benefit calculation', timestamp: createdDate.toISOString() }
      ] },
      financial: { claimAmount: 125000, reserve: 112500, amountPaid: 0, pmiState: 'NY', pmiRate: 0.08, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 125000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 6.85, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STANDARD, score: 71, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: false, noContestability: true, claimAmountThreshold: true, noAnomalies: false } },
      workflow: { fsoCase: 'FSO-CLM-000005', currentTask: 'Review Requirements', assignedTo: 'Jane Examiner', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 3 } }
    };
    claim.sysId = 'demo-sys-id-5'; claim.fnolNumber = 'FNOL0000005';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 6: Sam Wright (Option 1 Policy Holder) - NEW, STP eligible ----
  {
    const createdDate = new Date(NOW.getTime() - 5 * DAY);
    const deathDate = new Date(NOW.getTime() - 10 * DAY);
    const slaDate = new Date(createdDate.getTime() + 10 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-sw', claimNumber: 'CLM-000021', status: ClaimStatus.NEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: createdDate.toISOString(), closedAt: null,
      deathEvent: {
        dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Natural', causeOfDeath: 'Cardiac Arrest',
        deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'CA', proofOfDeathSourceType: 'Death Certificate',
        proofOfDeathDate: new Date(deathDate.getTime() + 2 * DAY).toISOString().split('T')[0],
        certifiedDOB: '1968-03-14', verificationSource: 'LexisNexis', verificationScore: 96, specialEvent: null
      },
      insured: { name: 'Sam Wright', ssn: maskedSSN('3892'), dateOfBirth: '1968-03-14', dateOfDeath: deathDate.toISOString().split('T')[0], age: 56 },
      claimant: { name: 'Jennifer Wright', relationship: 'Spouse', contactInfo: { email: 'jennifer.wright@email.com', phone: '415-555-0273' } },
      policies: [{ policyNumber: 'POL-290471', policyType: 'Term Life', policyStatus: 'In Force', issueDate: '2019-07-15', issueState: 'CA', region: 'West', companyCode: 'BLM', planCode: 'TL250', faceAmount: 250000, currentCashValue: 150000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 15 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Sam Wright' }],
      policy: { policyNumber: 'POL-290471', type: 'Term Life', policyType: 'Term Life', status: 'In Force', policyStatus: 'In Force', issueDate: '2019-07-15', issueState: 'CA', faceAmount: 250000, owner: 'Sam Wright', region: 'West', companyCode: 'BLM', planCode: 'TL250', paidToDate: new Date(deathDate.getTime() - 15 * DAY).toISOString().split('T')[0], source: 'Policy Admin', currentCashValue: 150000, loanBalance: 0 },
      parties: [
        { id: 'party-sw-1', name: 'Sam Wright', role: 'Insured', source: 'Policy Admin', resState: 'CA', dateOfBirth: '1968-03-14', ssn: maskedSSN('3892'), phone: '415-555-0100', email: 'sam.wright@email.com', address: '2847 Sunset Blvd, Los Angeles, CA 90028', verificationStatus: 'Verified', verificationScore: 97, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-sw-2', name: 'Jennifer Wright', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'CA', dateOfBirth: '1970-08-22', ssn: maskedSSN('5641'), phone: '415-555-0273', email: 'jennifer.wright@email.com', address: '2847 Sunset Blvd, Los Angeles, CA 90028', verificationStatus: 'Verified', verificationScore: 95, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-sw-3', name: 'Jennifer Wright', role: 'Notifier', source: 'FNOL', resState: 'CA', phone: '415-555-0273', email: 'jennifer.wright@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 18, alerts: [] },
      financial: { claimAmount: 250000, reserve: 225000, amountPaid: 0, pmiState: 'CA', pmiRate: 0.10, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 250000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 9.3, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STP, score: 93, eligible: true, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true } },
      workflow: { fsoCase: 'FSO-CLM-000021', currentTask: 'Review Requirements', assignedTo: 'Sarah Johnson', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: false } }
    };
    claim.sysId = 'demo-sys-id-sw'; claim.fnolNumber = 'FNOL0000021';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 7: Aiden Hakim (Option 2 Policy Holder) - UNDER_REVIEW, Standard ----
  {
    const createdDate = new Date(NOW.getTime() - 12 * DAY);
    const deathDate = new Date(NOW.getTime() - 18 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysOpen = Math.floor((NOW - createdDate) / DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'claim-ah', claimNumber: 'CLM-000022', status: ClaimStatus.UNDER_REVIEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 3 * DAY).toISOString(), closedAt: null,
      deathEvent: {
        dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: 'Natural', causeOfDeath: 'Hypertensive Heart Disease',
        deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'NY', proofOfDeathSourceType: 'Hospital Record',
        proofOfDeathDate: new Date(deathDate.getTime() + 3 * DAY).toISOString().split('T')[0],
        certifiedDOB: '1972-05-18', verificationSource: 'LexisNexis', verificationScore: 88, specialEvent: null
      },
      insured: { name: 'Aiden Hakim', ssn: maskedSSN('7614'), dateOfBirth: '1972-05-18', dateOfDeath: deathDate.toISOString().split('T')[0], age: 53 },
      claimant: { name: 'Layla Hakim', relationship: 'Spouse', contactInfo: { email: 'layla.hakim@email.com', phone: '646-555-0438' } },
      policies: [{ policyNumber: 'POL-382156', policyType: 'Whole Life', policyStatus: 'In Force', issueDate: '2017-11-01', issueState: 'NY', region: 'Northeast', companyCode: 'NWL', planCode: 'WL350', faceAmount: 350000, currentCashValue: 82000, loanBalance: 0, paidToDate: new Date(deathDate.getTime() - 20 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: 'Aiden Hakim' }],
      policy: { policyNumber: 'POL-382156', type: 'Whole Life', policyType: 'Whole Life', status: 'In Force', policyStatus: 'In Force', issueDate: '2017-11-01', issueState: 'NY', faceAmount: 350000, owner: 'Aiden Hakim', region: 'Northeast', companyCode: 'NWL', planCode: 'WL350', paidToDate: new Date(deathDate.getTime() - 20 * DAY).toISOString().split('T')[0], source: 'Policy Admin', currentCashValue: 82000, loanBalance: 0 },
      parties: [
        { id: 'party-ah-1', name: 'Aiden Hakim', role: 'Insured', source: 'Policy Admin', resState: 'NY', dateOfBirth: '1972-05-18', ssn: maskedSSN('7614'), phone: '646-555-0200', email: 'aiden.hakim@email.com', address: '415 West 45th Street, New York, NY 10036', verificationStatus: 'Verified', verificationScore: 96, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-ah-2', name: 'Layla Hakim', role: 'Primary Beneficiary', source: 'Policy Admin', resState: 'NY', dateOfBirth: '1974-11-30', ssn: maskedSSN('4127'), phone: '646-555-0438', email: 'layla.hakim@email.com', address: '415 West 45th Street, New York, NY 10036', verificationStatus: 'Pending', verificationScore: 81, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-ah-3', name: 'Layla Hakim', role: 'Notifier', source: 'FNOL', resState: 'NY', phone: '646-555-0438', email: 'layla.hakim@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 46, alerts: [
        { id: 'alert-ah-1', severity: 'Medium', category: 'Address Discrepancy', title: 'Claimant Address Mismatch', message: 'Claimant address differs from policy records', description: 'Beneficiary address submitted in FNOL does not match the address on file in the Policy Admin system. Identity verification is recommended before proceeding with payment.', confidence: 78, recommendation: 'Request updated address confirmation and government-issued photo ID', timestamp: new Date(createdDate.getTime() + 1 * DAY).toISOString() }
      ] },
      financial: { claimAmount: 350000, reserve: 315000, amountPaid: 0, pmiState: 'NY', pmiRate: 0.08, pmiDays: Math.floor((NOW - deathDate) / DAY), interestAmount: 0, netBenefitProceeds: 350000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 6.85, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STANDARD, score: 68, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: false, noContestability: true, claimAmountThreshold: true, noAnomalies: false } },
      workflow: { fsoCase: 'FSO-CLM-000022', currentTask: 'Review Requirements', assignedTo: 'Sarah Johnson', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 3 } }
    };
    claim.sysId = 'demo-sys-id-ah'; claim.fnolNumber = 'FNOL0000022';
    claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
    claims.push(claim);
  }

  // ---- CLAIM 8: Ethan Carter (CLM-000147) - UNDER_REVIEW, Complex Estate w/ Trust/Corp Beneficiaries ----
  {
    const createdDate = new Date(NOW.getTime() - 30 * DAY);
    const deathDate   = new Date('2026-01-15');
    const slaDate     = new Date(createdDate.getTime() + 45 * DAY);
    const daysOpen    = Math.floor((NOW - createdDate) / DAY);
    const daysToSla   = Math.ceil((slaDate - NOW) / DAY);
    const pmiDays     = Math.floor((NOW - deathDate) / DAY);
    const fmtDate = (d) => new Date(NOW.getTime() + d * DAY).toISOString().split('T')[0];
    const pastDate = (d) => new Date(NOW.getTime() - d * DAY).toISOString().split('T')[0];

    const claim = {
      id: 'claim-ec', claimNumber: 'CLM-000147', status: ClaimStatus.UNDER_REVIEW, type: ClaimType.DEATH,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 5 * DAY).toISOString(), closedAt: null,
      deathEvent: {
        dateOfDeath: '2026-01-15', mannerOfDeath: 'Natural', causeOfDeath: 'Myocardial Infarction',
        deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: 'TX', proofOfDeathSourceType: 'Death Certificate',
        proofOfDeathDate: '2026-01-18', certifiedDOB: '1967-04-22', verificationSource: 'EDRS',
        verificationScore: 99, specialEvent: null
      },
      insured: { name: 'Ethan Carter', ssn: maskedSSN('8812'), dateOfBirth: '1967-04-22', dateOfDeath: '2026-01-15', age: 58 },
      claimant: { name: 'Isabella Hughes', relationship: 'Sibling', contactInfo: { email: 'isabella.hughes@email.com', phone: '512-555-0192' } },
      policies: [{ policyNumber: 'POL-571390', policyType: 'Universal Life', policyStatus: 'In Force', issueDate: '2012-03-01', issueState: 'TX', region: 'South', companyCode: 'BLM', planCode: 'UL500', faceAmount: 500000, currentCashValue: 184200, loanBalance: 0, paidToDate: '2026-01-01', source: 'Policy Admin', owner: 'Ethan Carter' }],
      policy: { policyNumber: 'POL-571390', type: 'Universal Life', policyType: 'Universal Life', status: 'In Force', policyStatus: 'In Force', issueDate: '2012-03-01', issueState: 'TX', faceAmount: 500000, owner: 'Ethan Carter', region: 'South', companyCode: 'BLM', planCode: 'UL500', paidToDate: '2026-01-01', source: 'Policy Admin', currentCashValue: 184200, loanBalance: 0 },
      parties: [
        { id: 'party-ec-1', name: 'Ethan Carter', role: 'Insured', source: 'Policy Admin', resState: 'TX', dateOfBirth: '1967-04-22', ssn: maskedSSN('8812'), phone: '512-555-0100', email: 'ethan.carter@email.com', address: '3801 Ranch Road, Austin, TX 78704', verificationStatus: 'Verified', verificationScore: 99, cslnAction: 'Verified', cslnResult: 'Match' },
        { id: 'party-ec-2', name: 'Isabella Hughes', role: 'Primary Beneficiary', partyType: 'individual', allocation: 40, source: 'Policy Admin', resState: 'TX', dateOfBirth: '1969-05-14', ssn: maskedSSN('4721'), phone: '512-555-0192', email: 'isabella.hughes@email.com', address: '4521 Oak Creek Drive, Austin, TX 78745', verificationStatus: 'In Review', verificationScore: 82, cslnAction: 'Search', cslnResult: 'Pending Review' },
        { id: 'party-ec-3', name: 'Carter Family Irrevocable Trust', role: 'Primary Beneficiary', partyType: 'trust', allocation: 35, authorizedSigner: 'Benjamin Clark (Trustee)', source: 'Policy Admin', phone: '512-555-0380', email: 'b.clark@cartertrustee.com', address: '200 Congress Ave Suite 400, Austin, TX 78701', verificationStatus: 'Pending', verificationScore: null },
        { id: 'party-ec-4', name: 'Estate of Ethan Carter', role: 'Contingent Beneficiary', partyType: 'estate', allocation: 15, authorizedSigner: 'Mia Robinson (Administrator)', source: 'Policy Admin', phone: '512-555-0455', email: 'm.robinson@austinlegal.com', address: '1011 San Jacinto Blvd, Austin, TX 78701', verificationStatus: 'Pending', verificationScore: null },
        { id: 'party-ec-5', name: 'Carter & Sons Construction LLC', role: 'Contingent Beneficiary', partyType: 'corporate', allocation: 10, authorizedSigner: 'Lucas Wright (CEO)', source: 'Policy Admin', phone: '512-555-0711', email: 'lucas.wright@carterconst.com', address: '8900 E Ben White Blvd, Austin, TX 78741', verificationStatus: 'Pending', verificationScore: null },
        { id: 'party-ec-6', name: 'Dr. Emily Foster', role: 'Attending Physician', partyType: 'provider', source: 'FNOL', phone: '512-555-0892', email: 'efoster@austinmedical.com', address: '1301 W 38th St, Austin, TX 78705', verificationStatus: 'Verified', verificationScore: 97 },
        { id: 'party-ec-7', name: 'Isabella Hughes', role: 'Notifier', source: 'FNOL', resState: 'TX', phone: '512-555-0192', email: 'isabella.hughes@email.com', verificationStatus: 'Verified' }
      ],
      aiInsights: { riskScore: 52, alerts: [
        { id: 'alert-ec-1', severity: 'Medium', category: 'Complex Estate', title: 'Trust & Estate Beneficiaries', message: 'Claim involves trust, estate, and corporate beneficiaries requiring entity documentation', description: 'Multiple non-individual beneficiaries require additional documentation: Trust Agreement, Letters Testamentary, and Corporate Resolution.', confidence: 95, recommendation: 'Request all entity documentation packages concurrently to avoid delays', timestamp: createdDate.toISOString() },
        { id: 'alert-ec-2', severity: 'Medium', category: 'Document', title: 'APS Resubmission Required', message: 'Attending physician statement returned NIGO due to illegible scan', description: 'APS from Dr. Emily Foster was returned as NIGO — resubmit at 300 dpi minimum.', confidence: 100, recommendation: 'Contact Dr. Foster office to resubmit at required resolution', timestamp: new Date(createdDate.getTime() + 10 * DAY).toISOString() }
      ] },
      financial: { claimAmount: 500000, reserve: 450000, amountPaid: 0, pmiState: 'TX', pmiRate: 0.08, pmiDays, interestAmount: 0, netBenefitProceeds: 500000, netBenefitPMI: 0, federalTaxRate: 24, stateTaxRate: 0, taxableAmount: 0, federalTaxWithheld: 0, stateTaxWithheld: 0, taxWithheld: 0, percentage: 100, currency: 'USD', payments: [] },
      routing: { type: RoutingType.STANDARD, score: 48, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: false, noContestability: true, claimAmountThreshold: false, noAnomalies: false } },
      workflow: { fsoCase: 'FSO-CLM-000147', currentTask: 'Gather Entity Documentation', assignedTo: 'Sarah Johnson', daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 5 } }
    };

    claim.sysId = 'demo-sys-id-ec'; claim.fnolNumber = 'FNOL0000147';
    claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);

    // Pre-generated 39 requirements — complex estate with trust, estate entity & corp beneficiaries
    claim.requirements = [
      // ─── Claim Level (System Auto-Verified) ───
      { id: 'ec-r01', level: 'claim', name: 'EDRS Death Verification', description: 'Electronic Death Registration System auto-lookup — confirmed via Texas EDRS registry', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(28), dueDate: fmtDate(-25), documents: [{ id: 'ec-d01', name: 'death_cert_edrs.pdf' }], metadata: { confidenceScore: 0.99, verificationSource: 'Texas EDRS' } },
      { id: 'ec-r02', level: 'claim', name: 'OFAC / Sanctions Screening', description: 'All parties screened against OFAC SDN list and state sanctions databases — no matches', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(29), dueDate: fmtDate(-26), documents: [], metadata: { confidenceScore: 1.0, verificationSource: 'OFAC API' } },
      // ─── Policy Level (Auto-Verified) ───
      { id: 'ec-r03', level: 'policy', name: 'Policy In-Force Verification', description: 'Universal Life $500K confirmed in force at date of death — no lapse or surrender', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(29), dueDate: fmtDate(-26), documents: [{ id: 'ec-d03', name: 'policy_admin_extract.pdf' }], metadata: { confidenceScore: 0.99, verificationSource: 'Policy Admin System' } },
      { id: 'ec-r04', level: 'policy', name: 'Contestability Period Check', description: 'Policy issued 2012-03-01 — past the 2-year contestability window. No further investigation required.', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(29), dueDate: fmtDate(-26), documents: [], metadata: { confidenceScore: 0.99 } },
      { id: 'ec-r05', level: 'policy', name: 'Beneficiary Designation on File', description: 'All 4 named beneficiaries confirmed with correct allocation percentages (40/35/15/10)', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(28), dueDate: fmtDate(-25), documents: [], metadata: { confidenceScore: 0.98, verificationSource: 'Bene Designation Extract' } },
      { id: 'ec-r06', level: 'policy', name: 'Universal Life Coverage Confirmation', description: 'Face amount $500,000 — current cash value $184,200 — no outstanding loans', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(28), dueDate: fmtDate(-25), documents: [], metadata: { confidenceScore: 0.99 } },
      // ─── Isabella Hughes — Primary Beneficiary (Individual, 40%) ───
      { id: 'ec-r07', level: 'party', partyId: 'party-ec-2', name: 'Claimant Statement of Claim', description: 'Signed Form BLM-1042 — IDP confidence 78%, signature verification in progress on page 3', status: 'in_review', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(4), documents: [{ id: 'ec-d07', name: 'claimant_statement_draft.pdf' }], metadata: { confidenceScore: 0.78, reason: 'Signature verification in progress — IDP flagged signature area on page 3' } },
      { id: 'ec-r08', level: 'party', partyId: 'party-ec-2', name: 'Certified Death Certificate', description: 'Certified copy from Texas vital records — submitted by claimant and cross-matched with EDRS', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(20), dueDate: fmtDate(-17), documents: [{ id: 'ec-d08', name: 'death_cert_certified.pdf' }], metadata: { confidenceScore: 0.97 } },
      { id: 'ec-r09', level: 'party', partyId: 'party-ec-2', name: 'Government-Issued Photo ID', description: "Driver's license — IDP confidence 82%, name and DOB match in progress", status: 'in_review', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(4), documents: [{ id: 'ec-d09', name: 'drivers_license_ih.pdf' }], metadata: { confidenceScore: 0.82 } },
      { id: 'ec-r10', level: 'party', partyId: 'party-ec-2', name: 'IRS Form W-9', description: 'W-9 required for 1099-INT reporting on PMI interest earned during processing', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(7), documents: [], metadata: {} },
      { id: 'ec-r11', level: 'party', partyId: 'party-ec-2', name: 'Payment Election Form', description: 'ACH direct deposit or check — lump sum or settlement option selection required', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(7), documents: [], metadata: { paymentMethod: 'Not selected' } },
      { id: 'ec-r12', level: 'party', partyId: 'party-ec-2', name: 'Proof of Relationship Verification', description: 'Relationship to insured confirmed from policy records and FNOL attestation', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(25), dueDate: fmtDate(-22), documents: [], metadata: { confidenceScore: 0.95 } },
      { id: 'ec-r13', level: 'party', partyId: 'party-ec-2', name: 'OFAC Individual Screening', description: 'Individual SDN and state sanctions search — no matches found', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(29), dueDate: fmtDate(-26), documents: [], metadata: { confidenceScore: 1.0 } },
      { id: 'ec-r14', level: 'party', partyId: 'party-ec-2', name: 'Identity Verification (SSN Match)', description: '3-point match: name, DOB, address — confirmed via LexisNexis', status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(28), dueDate: fmtDate(-25), documents: [], metadata: { confidenceScore: 0.94 } },
      // ─── Carter Family Irrevocable Trust — Primary Beneficiary (Trust, 35%) ───
      { id: 'ec-r15', level: 'party', partyId: 'party-ec-3', name: 'Trust Agreement', description: 'Full trust agreement document — all pages, amendments, and schedules required', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: 'ec-r16', level: 'party', partyId: 'party-ec-3', name: 'Certificate of Trust Existence', description: 'Abbreviated certificate confirming trust existence, trustee authority, and tax ID', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: 'ec-r17', level: 'party', partyId: 'party-ec-3', name: 'Letters of Authority / Trustee Resolution', description: 'Trustee resolution authorizing claim payment — returned for re-execution (notarization missing)', status: 'nigo', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(3), documents: [{ id: 'ec-d17', name: 'trustee_resolution_draft.pdf' }], metadata: { confidenceScore: 0.31, reason: '❌ NIGO: Document was not properly executed — notarization missing. Returned to trustee for re-execution.' } },
      { id: 'ec-r18', level: 'party', partyId: 'party-ec-3', name: 'Trust Tax ID (EIN)', description: 'IRS-issued EIN for the trust — required for 1099 and payment processing', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r19', level: 'party', partyId: 'party-ec-3', name: 'Trustee Government-Issued ID', description: "Benjamin Clark's driver's license or passport — identity verification for authorized signer", status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: 'ec-r20', level: 'party', partyId: 'party-ec-3', name: 'Trustee IRS Form W-9', description: 'W-9 in name of trust with trust EIN — required for tax reporting', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r21', level: 'party', partyId: 'party-ec-3', name: 'Payment Election Form (Trust)', description: 'Wire transfer or check in name of trust — bank letter on trust letterhead required for ACH', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: { paymentMethod: 'Not selected' } },
      { id: 'ec-r22', level: 'party', partyId: 'party-ec-3', name: 'SOS Entity Verification', description: 'Texas Secretary of State confirmation — trust registration and good standing', status: 'pending', isMandatory: false, pri: 'conditional', dueDate: fmtDate(14), documents: [], metadata: {} },
      // ─── Estate of Ethan Carter — Contingent Beneficiary (Estate, 15%) ───
      { id: 'ec-r23', level: 'party', partyId: 'party-ec-4', name: 'Letters Testamentary / Letters of Administration', description: 'Court-issued authorization for estate administrator Mia Robinson — certified copy required', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: {} },
      { id: 'ec-r24', level: 'party', partyId: 'party-ec-4', name: 'Small Estate Affidavit Eligibility Check', description: 'Checking if estate qualifies for small estate affidavit (TX threshold $75K) — benefit share is $75K (15% of $500K)', status: 'in_review', isMandatory: false, pri: 'conditional', dueDate: fmtDate(5), documents: [], metadata: { reason: '⏳ Reviewing eligibility: benefit share $75,000 is at TX small estate threshold. Legal review in progress.' } },
      { id: 'ec-r25', level: 'party', partyId: 'party-ec-4', name: 'Estate EIN from IRS', description: 'Employer Identification Number for estate — required for payment and tax reporting', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: {} },
      { id: 'ec-r26', level: 'party', partyId: 'party-ec-4', name: 'Administrator Government-Issued ID', description: "Mia Robinson's driver's license or passport — identity verification for authorized administrator", status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: {} },
      { id: 'ec-r27', level: 'party', partyId: 'party-ec-4', name: 'Administrator IRS Form W-9', description: 'W-9 in name of estate with estate EIN — required for 1099 reporting', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(16), documents: [], metadata: {} },
      { id: 'ec-r28', level: 'party', partyId: 'party-ec-4', name: 'Payment Election Form (Estate)', description: 'Wire or check in name of estate — court authorization may be required for wire transfer', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(18), documents: [], metadata: { paymentMethod: 'Not selected' } },
      { id: 'ec-r29', level: 'party', partyId: 'party-ec-4', name: 'Surety Bond Verification', description: 'Confirm administrator has filed required surety bond with probate court (if applicable)', status: 'pending', isMandatory: false, pri: 'conditional', dueDate: fmtDate(14), documents: [], metadata: {} },
      // ─── Carter & Sons Construction LLC — Contingent Beneficiary (Corporate, 10%) ───
      { id: 'ec-r30', level: 'party', partyId: 'party-ec-5', name: 'Corporate Resolution', description: 'Board resolution authorizing receipt of life insurance proceeds — signed by all officers', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r31', level: 'party', partyId: 'party-ec-5', name: 'Articles of Incorporation', description: 'Certificate of formation or articles of organization — from Texas SOS filing records', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r32', level: 'party', partyId: 'party-ec-5', name: 'SOS Business Entity Verification', description: 'Texas Secretary of State — entity active, good standing, not dissolved or forfeited', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: 'ec-r33', level: 'party', partyId: 'party-ec-5', name: 'Certificate of Good Standing', description: 'Texas Comptroller certificate — current franchise tax status and good standing', status: 'pending', isMandatory: false, pri: 'conditional', dueDate: fmtDate(14), documents: [], metadata: {} },
      { id: 'ec-r34', level: 'party', partyId: 'party-ec-5', name: 'Authorized Signatory Government ID', description: "Lucas Wright (CEO) driver's license — identity verification for corporate authorized signer", status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r35', level: 'party', partyId: 'party-ec-5', name: 'Corporate W-9 (EIN)', description: 'W-9 in corporate name with business EIN — required for 1099-MISC reporting', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(12), documents: [], metadata: {} },
      { id: 'ec-r36', level: 'party', partyId: 'party-ec-5', name: 'Payment Election Form (Corporate)', description: 'Wire transfer preferred — corporate banking letter with authorized officer signature required', status: 'pending', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(14), documents: [], metadata: { paymentMethod: 'Not selected' } },
      // ─── Dr. Emily Foster — Attending Physician ───
      { id: 'ec-r37', level: 'party', partyId: 'party-ec-6', name: 'Attending Physician Statement (APS)', description: 'APS from Dr. Emily Foster required — myocardial infarction confirmation for UL policy review', status: 'nigo', isMandatory: true, pri: 'mandatory', dueDate: fmtDate(2), documents: [{ id: 'ec-d37', name: 'aps_form_scan.pdf' }], metadata: { confidenceScore: 0.41, reason: '❌ NIGO: Document quality insufficient — illegible scan. Please resubmit at 300 dpi minimum.' } },
      { id: 'ec-r38', level: 'party', partyId: 'party-ec-6', name: 'Medical Records Authorization (HIPAA)', description: 'Signed HIPAA release from authorized estate representative for complete medical records', status: 'pending', isMandatory: false, pri: 'conditional', dueDate: fmtDate(10), documents: [], metadata: {} },
      { id: 'ec-r39', level: 'party', partyId: 'party-ec-6', name: 'NPI Verification', description: "Dr. Foster's National Provider Identifier verified against NPI registry — confirmed active", status: 'satisfied', isMandatory: true, pri: 'mandatory', satisfiedDate: pastDate(25), dueDate: fmtDate(-22), documents: [], metadata: { confidenceScore: 1.0, verificationSource: 'NPI Registry' } },
    ];

    claims.push(claim);
  }

  return claims;
};

// ============================================================
// Generate remaining 15 claims with seeded PRNG
// ============================================================
const generateSeededClaim = (index, isSTP) => {
  const createdDate = seededDate(new Date(NOW.getTime() - 30 * DAY), new Date(NOW.getTime() - 1 * DAY));
  const insuredName = seeded() > 0.5 ? seededMaleName() : seededFemaleName();
  const claimantName = seeded() > 0.5 ? seededFemaleName() : seededMaleName();
  const policyNumber = `POL-${Math.floor(seeded() * 900000 + 100000)}`;
  const claimNumber = `CLM-${String(index).padStart(6, '0')}`;
  const claimAmount = Math.floor(seeded() * 200000 + 50000);
  const policyIssueDate = seededDate(new Date(NOW.getTime() - 10 * 365 * DAY), new Date(NOW.getTime() - 3 * 365 * DAY));
  const deathDate = seededDate(new Date(NOW.getTime() - 45 * DAY), new Date(NOW.getTime() - 3 * DAY));

  const statusOptions = isSTP
    ? [ClaimStatus.CLOSED, ClaimStatus.CLOSED, ClaimStatus.APPROVED, ClaimStatus.UNDER_REVIEW]
    : [ClaimStatus.NEW, ClaimStatus.UNDER_REVIEW, ClaimStatus.UNDER_REVIEW, ClaimStatus.APPROVED, ClaimStatus.PENDING_REQUIREMENTS];
  const status = seededPick(statusOptions);
  const isClosed = status === ClaimStatus.CLOSED;
  const closedDate = isClosed ? new Date(createdDate.getTime() + (isSTP ? 7 : 25) * DAY) : null;
  const daysOpen = Math.floor(((isClosed ? closedDate : NOW) - createdDate) / DAY);
  const slaDays = isSTP ? 10 : 30;
  const slaDate = new Date(createdDate.getTime() + slaDays * DAY);
  const daysToSla = isClosed ? Math.ceil((slaDate - closedDate) / DAY) : Math.ceil((slaDate - NOW) / DAY);
  const state = seededPick(STATES);

  const mannerOptions = ['Natural', 'Natural', 'Natural', 'Accident', 'Pending'];
  const manner = seededPick(mannerOptions);
  const causeMap = { 'Natural': 'Natural Causes', 'Accident': 'Accidental Injury', 'Pending': 'Under Investigation' };

  const pmiDays = isClosed ? Math.floor((closedDate - deathDate) / DAY) : Math.floor((NOW - deathDate) / DAY);
  const interestAmount = isClosed ? Math.floor((claimAmount * (isSTP ? 0.10 : 0.08) * pmiDays) / 365) : 0;

  const claim = {
    id: `claim-${index}`, claimNumber, status, type: ClaimType.DEATH,
    createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + seeded() * 24 * 3600000).toISOString(), closedAt: isClosed ? closedDate.toISOString() : null,
    deathEvent: {
      dateOfDeath: deathDate.toISOString().split('T')[0], mannerOfDeath: manner, causeOfDeath: causeMap[manner],
      deathInUSA: true, countryOfDeath: 'USA', stateOfDeath: state, proofOfDeathSourceType: seededPick(PROOF_TYPES),
      proofOfDeathDate: new Date(deathDate.getTime() + 3 * DAY).toISOString().split('T')[0],
      certifiedDOB: seededDate(new Date(1940, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0],
      verificationSource: 'LexisNexis', verificationScore: isSTP ? Math.floor(seeded() * 10 + 90) : Math.floor(seeded() * 20 + 70), specialEvent: null
    },
    insured: { name: insuredName, ssn: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), dateOfBirth: seededDate(new Date(1940, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0], dateOfDeath: deathDate.toISOString().split('T')[0], age: Math.floor(seeded() * 30 + 50) },
    claimant: { name: claimantName, relationship: 'Spouse', contactInfo: { email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`, phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}` } },
    policies: [{ policyNumber, policyType: 'Term Life', policyStatus: 'In Force', issueDate: policyIssueDate.toISOString().split('T')[0], issueState: state, region: seededPick(REGIONS), companyCode: seededPick(COMPANY_CODES), planCode: `TL${Math.floor(seeded() * 900 + 100)}`, faceAmount: claimAmount, currentCashValue: Math.floor(claimAmount * 0.6), loanBalance: seeded() > 0.8 ? Math.floor(claimAmount * 0.1) : 0, paidToDate: new Date(deathDate.getTime() - 30 * DAY).toISOString().split('T')[0], source: 'Policy Admin', owner: insuredName }],
    policy: { policyNumber, type: 'Term Life', status: 'In Force', issueDate: policyIssueDate.toISOString().split('T')[0], faceAmount: claimAmount, owner: insuredName },
    parties: [
      { id: `party-${index}-1`, name: insuredName, role: 'Insured', source: 'Policy Admin', resState: state, dateOfBirth: seededDate(new Date(1940, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0], ssn: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}`, email: `${insuredName.toLowerCase().replace(' ', '.')}@email.com`, address: `${Math.floor(seeded() * 9999)} Main St, Anytown, ${state} ${Math.floor(seeded() * 90000 + 10000)}`, verificationStatus: 'Verified', verificationScore: 98, cslnAction: 'Verified', cslnResult: 'Match' },
      { id: `party-${index}-2`, name: claimantName, role: 'Primary Beneficiary', source: 'Policy Admin', resState: state, dateOfBirth: seededDate(new Date(1945, 0, 1), new Date(1975, 11, 31)).toISOString().split('T')[0], ssn: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}`, email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`, address: `${Math.floor(seeded() * 9999)} Oak Ave, Somewhere, ${state} ${Math.floor(seeded() * 90000 + 10000)}`, verificationStatus: isSTP ? 'Verified' : 'Pending', verificationScore: isSTP ? 95 : 78, cslnAction: 'Search', cslnResult: isSTP ? 'Match' : 'Pending Review' },
      { id: `party-${index}-3`, name: claimantName, role: 'Notifier', source: 'FNOL', resState: state, phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}`, email: `notifier${index}@email.com`, verificationStatus: 'Verified' }
    ],
    aiInsights: { riskScore: isSTP ? Math.floor(seeded() * 25 + 10) : Math.floor(seeded() * 30 + 40), alerts: isSTP ? [] : (seeded() > 0.5 ? [{ id: `alert-${index}-1`, severity: 'Medium', category: 'Beneficiary Change', title: 'Recent Beneficiary Modification', message: 'Beneficiary was changed within 12 months of death', description: 'Policy beneficiary was updated before date of death, which may require additional review.', confidence: 75, recommendation: 'Review beneficiary change documentation and rationale', timestamp: new Date(deathDate.getTime() - 180 * DAY).toISOString() }] : []) },
    financial: { claimAmount, reserve: isClosed ? 0 : Math.floor(claimAmount * 0.9), amountPaid: isClosed ? claimAmount : 0, pmiState: state, pmiRate: isSTP ? 0.10 : 0.08, pmiDays, interestAmount, netBenefitProceeds: claimAmount, netBenefitPMI: interestAmount, federalTaxRate: 24, stateTaxRate: 5.75, taxableAmount: interestAmount, federalTaxWithheld: Math.floor(interestAmount * 0.24), stateTaxWithheld: Math.floor(interestAmount * 0.0575), taxWithheld: Math.floor(interestAmount * 0.2975), percentage: 100, currency: 'USD',
      payments: isClosed ? [{ id: `payment-${index}-1`, paymentNumber: `PAY-${String(index).padStart(6, '0')}`, payeeId: `party-${index}-2`, payeeName: claimantName, payeeSSN: maskedSSN(String(Math.floor(seeded() * 9000 + 1000))), payeeAddress: `${Math.floor(seeded() * 9999)} Oak Ave, Somewhere, ${state} ${Math.floor(seeded() * 90000 + 10000)}`, benefitAmount: claimAmount, netBenefitProceeds: claimAmount, netBenefitPMI: interestAmount, pmiCalculation: { state, rate: isSTP ? 10 : 8, dateOfDeath: deathDate.toISOString().split('T')[0], settlementDate: closedDate.toISOString().split('T')[0], days: pmiDays, amount: interestAmount }, taxWithholding: { federalRate: 24, stateRate: 5.75, taxableAmount: interestAmount, federalWithheld: Math.floor(interestAmount * 0.24), stateWithheld: Math.floor(interestAmount * 0.0575), totalWithheld: Math.floor(interestAmount * 0.2975) }, taxWithheld: Math.floor(interestAmount * 0.2975), netPayment: claimAmount + interestAmount - Math.floor(interestAmount * 0.2975), percentage: 100, paymentMethod: seeded() > 0.5 ? 'ACH' : 'Check', bankInfo: { accountType: 'Checking', routingNumber: '021000021', accountNumberLast4: `****${Math.floor(seeded() * 9000 + 1000)}` }, scheduledDate: closedDate.toISOString().split('T')[0], paymentDate: closedDate.toISOString().split('T')[0], status: 'Completed', glPosting: { posted: true, postingDate: new Date(closedDate.getTime() + DAY).toISOString().split('T')[0], batchNumber: `GL-${Math.floor(seeded() * 900000 + 100000)}`, accountCodes: { benefit: '5000-1000', pmi: '5000-1100', tax: '2000-3000' } }, tax1099: { generated: true, year: NOW.getFullYear(), formType: '1099-MISC', box3Amount: interestAmount } }] : [] },
    routing: isSTP ? { type: RoutingType.STP, score: Math.floor(seeded() * 10 + 85), eligible: true, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: true, noContestability: true, claimAmountThreshold: true, noAnomalies: true } } : { type: RoutingType.STANDARD, score: Math.floor(seeded() * 15 + 70), eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { deathVerification: true, policyInForce: true, beneficiaryMatch: seeded() > 0.4, noContestability: true, claimAmountThreshold: true, noAnomalies: seeded() > 0.3 } },
    workflow: { fsoCase: `FSO-${claimNumber}`, currentTask: isClosed ? null : 'Review Requirements', assignedTo: isClosed ? null : seededPick(['John Smith', 'Sarah Johnson', 'Jane Examiner']), daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: !isClosed && daysToSla < 3 } }
  };
  claim.sysId = `demo-sys-id-${index}`; claim.fnolNumber = `FNOL${String(index).padStart(7, '0')}`;
  claim.requirements = generateRequirements(claim); claim.timeline = generateTimeline(claim); claim.workNotes = generateWorkNotes(claim);
  return claim;
};

export const generateDemoClaims = () => {
  const showcaseClaims = createShowcaseClaims();
  const seededClaims = [];
  const stpIndices = [6, 8, 11, 14, 17, 19];
  for (let i = 6; i <= 20; i++) {
    seededClaims.push(generateSeededClaim(i, stpIndices.includes(i)));
  }
  const all = [...showcaseClaims, ...seededClaims];
  all.forEach(c => { c.guardianInsights = generateGuardianInsights(c); });
  return all;
};

export const generateDemoPolicies = (claims) => {
  const claimPolicies = claims.map(claim => ({
    id: claim.policy.policyNumber, policyNumber: claim.policy.policyNumber, status: claim.policy.status, type: claim.policy.type, issueDate: claim.policy.issueDate, faceAmount: claim.policy.faceAmount, owner: claim.policy.owner, insured: claim.insured.name,
    beneficiaries: claim.parties.filter(p => p.role === 'Primary Beneficiary' || p.role === 'Contingent Beneficiary').map(p => ({ name: p.name, relationship: p.role === 'Primary Beneficiary' ? claim.claimant.relationship : 'Child', percentage: p.role === 'Primary Beneficiary' ? 50 : 25, type: p.role === 'Primary Beneficiary' ? 'Primary' : 'Contingent' })),
    premiumAmount: Math.floor(claim.policy.faceAmount * 0.001), premiumFrequency: 'Annual',
    policyType: claim.policy.type, policyStatus: claim.policy.status,
    region: claims[0]?.policies?.[0]?.region || 'Midwest',
    companyCode: claims[0]?.policies?.[0]?.companyCode || 'BLM',
    planCode: claims[0]?.policies?.[0]?.planCode || 'TL200',
    currentCashValue: claims[0]?.policies?.[0]?.currentCashValue || 0,
    loanBalance: claims[0]?.policies?.[0]?.loanBalance || 0,
    source: 'Policy Admin'
  }));

  // Add unclaimed policies for some deceased insureds (for Related Policies feature)
  const unclaimedPolicies = [
    // Additional policy for Robert Jones (Claim 1)
    {
      id: 'POL-847292', policyNumber: 'POL-847292',
      policyStatus: 'In Force', status: 'In Force',
      policyType: 'Whole Life', type: 'Whole Life',
      issueDate: '2015-03-20',
      issueState: 'IL',
      faceAmount: 250000,
      owner: 'Robert Jones',
      insured: 'Robert Jones',
      region: 'Midwest',
      companyCode: 'BLM',
      planCode: 'WL250',
      currentCashValue: 45000,
      loanBalance: 0,
      source: 'Policy Admin',
      premiumAmount: 250,
      premiumFrequency: 'Monthly',
      beneficiaries: [
        { name: 'Elizabeth Jones', relationship: 'Spouse', percentage: 100, type: 'Primary' }
      ]
    },
    // Another policy for Robert Jones
    {
      id: 'POL-847293', policyNumber: 'POL-847293',
      policyStatus: 'In Force', status: 'In Force',
      policyType: 'Universal Life', type: 'Universal Life',
      issueDate: '2012-08-15',
      issueState: 'IL',
      faceAmount: 100000,
      owner: 'Robert Jones',
      insured: 'Robert Jones',
      region: 'Midwest',
      companyCode: 'BLM',
      planCode: 'UL100',
      currentCashValue: 28000,
      loanBalance: 5000,
      source: 'Policy Admin',
      premiumAmount: 150,
      premiumFrequency: 'Monthly',
      beneficiaries: [
        { name: 'David Jones', relationship: 'Child', percentage: 50, type: 'Primary' },
        { name: 'Rachel Jones', relationship: 'Child', percentage: 50, type: 'Primary' }
      ]
    },
    // Additional policy for Thomas Garcia (Claim 3)
    {
      id: 'POL-619248', policyNumber: 'POL-619248',
      policyStatus: 'In Force', status: 'In Force',
      policyType: 'Whole Life', type: 'Whole Life',
      issueDate: '2017-06-10',
      issueState: 'TX',
      faceAmount: 200000,
      owner: 'Thomas Garcia',
      insured: 'Thomas Garcia',
      region: 'Southwest',
      companyCode: 'GLP',
      planCode: 'WL200',
      currentCashValue: 38000,
      loanBalance: 0,
      source: 'Policy Admin',
      premiumAmount: 200,
      premiumFrequency: 'Monthly',
      beneficiaries: [
        { name: 'Maria Garcia', relationship: 'Spouse', percentage: 100, type: 'Primary' }
      ]
    }
  ];

  return [...claimPolicies, ...unclaimedPolicies];
};

export const generateDemoFSOCases = (claims) => {
  return claims.map(claim => ({
    id: claim.workflow.fsoCase, claimId: claim.id, claimNumber: claim.claimNumber, status: claim.status === ClaimStatus.CLOSED ? 'Closed' : 'Open', priority: claim.routing?.type === RoutingType.STP ? 'High' : 'Normal', currentTask: claim.workflow.currentTask, assignedTo: claim.workflow.assignedTo, sla: claim.workflow.sla, playbook: claim.routing?.type === RoutingType.STP ? 'STP Death Claim' : 'Standard Death Claim', createdAt: claim.createdAt, updatedAt: claim.updatedAt
  }));
};

let cachedDemoData = null;

export const getDemoData = () => {
  if (!cachedDemoData) {
    const demoClaims = generateDemoClaims();
    cachedDemoData = { claims: demoClaims, policies: generateDemoPolicies(demoClaims), fsoCases: generateDemoFSOCases(demoClaims) };
  }
  return cachedDemoData;
};

const demoDataInstance = getDemoData();
export default demoDataInstance;

// Requirements tab demo data — reuses the Ethan Carter (CLM-000147) showcase claim
// Used by RequirementsEngine to show rich demo requirements for FNOL/ServiceNow claims
export const getRequirementsDemoData = () => {
  const ec = getDemoData().claims.find(c => c.id === 'claim-ec');
  if (!ec) return { parties: [], requirements: [] };
  return { parties: ec.parties, requirements: ec.requirements };
};
