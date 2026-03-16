/**
 * P&C Demo Data Generator
 *
 * Property and Casualty Claims demo dataset:
 * - 5 hand-crafted showcase claims
 * - 10 seeded claims with varied loss types
 * - Fast Track routing (~35% of claims)
 * - Auto, Homeowners, Commercial Property, Liability
 */

import { ClaimStatus, RoutingType, RequirementStatus } from '../types/claim.types';

// P&C Claim Types
export const PCClaimType = {
  AUTO_COLLISION: 'auto_collision',
  AUTO_COMPREHENSIVE: 'auto_comprehensive',
  HOMEOWNERS: 'homeowners',
  COMMERCIAL_PROPERTY: 'commercial_property',
  AUTO_LIABILITY: 'auto_liability',
  WORKERS_COMP: 'workers_comp'
};

// P&C Requirement Types
export const PCRequirementType = {
  POLICE_REPORT: 'police_report',
  DAMAGE_PHOTOS: 'damage_photos',
  REPAIR_ESTIMATE: 'repair_estimate',
  PROOF_OF_OWNERSHIP: 'proof_of_ownership',
  MEDICAL_BILLS: 'medical_bills',
  RENTAL_RECEIPT: 'rental_receipt',
  CONTRACTOR_ESTIMATE: 'contractor_estimate',
  CLAIMANT_STATEMENT: 'claimant_statement',
  PROOF_OF_IDENTITY: 'proof_of_identity',
  COVERAGE_VERIFICATION: 'coverage_verification'
};

// ============================================================
// Seeded PRNG
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

const seeded = createSeededRandom(99); // Different seed from L&A

const seededDate = (start, end) =>
  new Date(start.getTime() + seeded() * (end.getTime() - start.getTime()));

const seededPick = (arr) => arr[Math.floor(seeded() * arr.length)];

const FIRST_NAMES = ['James', 'Jennifer', 'Robert', 'Michael', 'Linda', 'Patricia', 'David', 'Susan', 'William', 'Karen', 'Carlos', 'Aisha', 'Wei', 'Sofia', 'Marcus'];
const LAST_NAMES = ['Williams', 'Thompson', 'Chen', 'Wilson', 'Garcia', 'Anderson', 'Martinez', 'Taylor', 'Nguyen', 'Robinson', 'Lee', 'Harris', 'Clark', 'Lewis', 'Walker'];
const STATES = ['CA', 'TX', 'FL', 'NY', 'IL', 'GA', 'OH', 'WA', 'AZ', 'CO'];
const VEHICLE_MAKES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Tesla', 'Subaru', 'Dodge', 'Hyundai'];
const VEHICLE_MODELS = { Toyota: 'Camry', Honda: 'Accord', Ford: 'F-150', Chevrolet: 'Malibu', Nissan: 'Altima', BMW: '3 Series', Tesla: 'Model 3', Subaru: 'Outback', Dodge: 'Charger', Hyundai: 'Sonata' };
const COMPANY_CODES = ['BLM', 'ALI', 'GLP', 'NWL', 'FST'];

const seededName = () => `${seededPick(FIRST_NAMES)} ${seededPick(LAST_NAMES)}`;

const NOW = new Date();
const DAY = 86400000;

// ============================================================
// P&C Requirements Generator
// ============================================================
const generatePCRequirements = (claim) => {
  const requirements = [];
  const createdAtDate = new Date(claim.createdAt);
  const isFT = claim.routing?.type === RoutingType.STP;
  const type = claim.type;
  const isAuto = type === PCClaimType.AUTO_COLLISION || type === PCClaimType.AUTO_COMPREHENSIVE;
  const isProperty = type === PCClaimType.HOMEOWNERS || type === PCClaimType.COMMERCIAL_PROPERTY;

  requirements.push({
    id: `${claim.id}-req-1`, level: 'claim', type: PCRequirementType.CLAIMANT_STATEMENT,
    name: 'Claimant Loss Statement', description: 'Signed statement describing the loss event in detail',
    status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 5 * DAY).toISOString(),
    satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 1 * DAY).toISOString() : null,
    documents: isFT ? [{ id: `doc-${claim.id}-1`, name: 'claimant_statement.pdf' }] : [],
    metadata: { confidenceScore: isFT ? 0.95 : 0.78 }
  });

  if (isAuto) {
    requirements.push({
      id: `${claim.id}-req-2`, level: 'claim', type: PCRequirementType.POLICE_REPORT,
      name: 'Police / Accident Report', description: 'Official police report or accident report from responding agency',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: type === PCClaimType.AUTO_COLLISION,
      dueDate: new Date(createdAtDate.getTime() + 7 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 2 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-2`, name: 'police_report.pdf' }] : [],
      metadata: { confidenceScore: isFT ? 0.97 : null, reportNumber: isFT ? `RPT-${claim.id.toUpperCase()}` : null }
    });

    requirements.push({
      id: `${claim.id}-req-3`, level: 'claim', type: PCRequirementType.DAMAGE_PHOTOS,
      name: 'Vehicle Damage Photos', description: 'Clear photos of all vehicle damage from multiple angles',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 3 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 1 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-3a`, name: 'damage_front.jpg' }, { id: `doc-${claim.id}-3b`, name: 'damage_rear.jpg' }, { id: `doc-${claim.id}-3c`, name: 'damage_side.jpg' }] : [],
      metadata: {}
    });

    requirements.push({
      id: `${claim.id}-req-4`, level: 'claim', type: PCRequirementType.REPAIR_ESTIMATE,
      name: 'Certified Repair Estimate', description: 'Written estimate from a licensed repair facility',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 7 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 3 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-4`, name: 'repair_estimate.pdf' }] : [],
      metadata: { estimateAmount: isFT ? claim.financial?.repairEstimate : null }
    });
  }

  if (isProperty) {
    requirements.push({
      id: `${claim.id}-req-2`, level: 'claim', type: PCRequirementType.DAMAGE_PHOTOS,
      name: 'Property Damage Photos', description: 'Comprehensive photographic documentation of all damage',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 5 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 2 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-2a`, name: 'exterior_damage.jpg' }, { id: `doc-${claim.id}-2b`, name: 'interior_damage.jpg' }] : [],
      metadata: {}
    });

    requirements.push({
      id: `${claim.id}-req-3`, level: 'claim', type: PCRequirementType.CONTRACTOR_ESTIMATE,
      name: 'Licensed Contractor Estimate', description: 'Written repair/rebuild estimate from a licensed contractor',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 10 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 4 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-3`, name: 'contractor_estimate.pdf' }] : [],
      metadata: { estimateAmount: isFT ? claim.financial?.repairEstimate : null }
    });
  }

  requirements.push({
    id: `${claim.id}-req-5`, level: 'policy', type: PCRequirementType.COVERAGE_VERIFICATION,
    name: 'Coverage Verification', description: 'Verify active coverage at date of loss, deductible, and applicable limits',
    status: RequirementStatus.SATISFIED, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 2 * DAY).toISOString(),
    satisfiedDate: new Date(createdAtDate.getTime() + 4 * 3600000).toISOString(),
    documents: [],
    metadata: { verificationSource: 'Policy Admin System', policyNumber: claim.policy.policyNumber }
  });

  requirements.push({
    id: `${claim.id}-req-6`, level: 'party', type: PCRequirementType.PROOF_OF_IDENTITY,
    name: 'Claimant Identity Verification', description: "Government-issued photo ID — driver's license or passport",
    status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * DAY).toISOString(),
    satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 1 * DAY).toISOString() : null,
    documents: isFT ? [{ id: `doc-${claim.id}-6`, name: 'drivers_license.pdf' }] : [],
    metadata: { confidenceScore: isFT ? 0.96 : null }
  });

  return requirements;
};

// ============================================================
// P&C Timeline Generator
// ============================================================
const generatePCTimeline = (claim) => {
  const events = [];
  const base = new Date(claim.createdAt).getTime();
  const isFT = claim.routing?.type === RoutingType.STP;

  events.push({ id: `${claim.id}-evt-1`, timestamp: claim.createdAt, type: 'claim.created', source: 'portal', user: { name: 'System', role: 'system' }, description: 'Loss reported via online claims portal', metadata: { channel: 'policyholder_portal' } });
  events.push({ id: `${claim.id}-evt-2`, timestamp: new Date(base + 3 * 60000).toISOString(), type: 'coverage.verified', source: 'policy', user: { name: 'System', role: 'system' }, description: 'Coverage verified in Policy Admin system', metadata: { policyNumber: claim.policy.policyNumber, status: 'active' } });

  if (isFT) {
    events.push({ id: `${claim.id}-evt-3`, timestamp: new Date(base + 8 * 60000).toISOString(), type: 'routing.fasttrack', source: 'routing', user: { name: 'Routing Engine', role: 'system' }, description: 'Claim qualified for STP (Straight Through Processing)', metadata: { score: claim.routing.score, eligible: true } });
    events.push({ id: `${claim.id}-evt-4`, timestamp: new Date(base + 12 * 60000).toISOString(), type: 'estimate.approved', source: 'appraisal', user: { name: 'Auto Appraisal Service', role: 'external' }, description: 'Repair estimate reviewed and approved', metadata: { amount: claim.financial?.repairEstimate } });
  } else {
    events.push({ id: `${claim.id}-evt-3`, timestamp: new Date(base + 15 * 60000).toISOString(), type: 'adjuster.assigned', source: 'routing', user: { name: 'Assignment Engine', role: 'system' }, description: 'Field adjuster assigned for inspection', metadata: { assignedTo: claim.workflow?.assignedTo } });
  }

  events.push({ id: `${claim.id}-evt-5`, timestamp: new Date(base + 20 * 60000).toISOString(), type: 'requirements.generated', source: 'requirements', user: { name: 'Decision Table Engine', role: 'system' }, description: `${claim.requirements?.length || 3} requirements generated for this claim`, metadata: {} });

  return events;
};

// ============================================================
// P&C Work Notes Generator
// ============================================================
const generatePCWorkNotes = (claim) => {
  const createdAtDate = new Date(claim.createdAt);
  const isAuto = claim.type === PCClaimType.AUTO_COLLISION || claim.type === PCClaimType.AUTO_COMPREHENSIVE;
  const notes = isAuto ? [
    'Initial loss report reviewed. Police report and damage photos received. Scheduling repair shop inspection.',
    'Repair estimate from certified shop received. Amount within expected range for reported damage.',
    'Spoke with claimant to confirm rental car arrangements. Rental pre-authorized for 7 days.'
  ] : [
    'Initial loss report reviewed. Property damage photos submitted by policyholder.',
    'Field adjuster visited property. Preliminary estimate prepared and submitted for review.',
    'Contacted contractor for second estimate. Awaiting response within 3 business days.'
  ];
  const authors = ['p.adjuster', 's.lyons', 'j.examiner'];

  return notes.map((text, i) => ({
    sys_id: `wn-${claim.id}-${i + 1}`, element: 'work_notes', element_id: claim.sysId || claim.id,
    name: 'x_dxcis_claims_a_0_claims_fnol', value: text,
    sys_created_on: new Date(createdAtDate.getTime() + (i + 1) * DAY).toISOString().replace('T', ' ').substring(0, 19),
    sys_created_by: authors[i]
  })).sort((a, b) => new Date(b.sys_created_on) - new Date(a.sys_created_on));
};

// ============================================================
// P&C Guardian Insights Generator
// ============================================================
const generatePCGuardianInsights = (claim) => {
  const createdAt = new Date(claim.createdAt);
  const daysOpen = claim.workflow?.daysOpen ?? Math.floor((NOW - createdAt) / DAY);
  const riskScore = claim.aiInsights?.riskScore || 20;

  // ── PC-1: Jennifer Williams — Auto Collision, Fast Track, CLOSED ──
  if (claim.id === 'pc-claim-1') {
    return {
      lastAnalyzed: claim.closedAt || NOW.toISOString(),
      overallRisk: 'Low',
      leakageExposure: 0,
      claimSummary: {
        narrative: 'Auto collision claim for Jennifer Williams, 2022 Toyota Camry Silver, rear-ended at Main St & Commerce Blvd, Houston TX. Third-party Derek Nash determined at fault. Police report RPT-2026-04821. Repair cost $4,200 minus $500 deductible. Net payment of $3,700 issued via ACH in 5 days. Claim closed — STP exemplary processing. All documentation received at FNOL. No fraud signals. Subrogation recovery against Derek Nash\'s insurer identified.',
        keyEvents: [
          { date: createdAt.toISOString(), event: 'FNOL received — STP eligibility score 93, auto collision' },
          { date: new Date(createdAt.getTime() + 3 * 60000).toISOString(), event: 'Policy PA-TX-847291 verified active — $100K limit, $500 deductible confirmed' },
          { date: new Date(createdAt.getTime() + 8 * 60000).toISOString(), event: 'Routing Engine: STP approved — third-party fault clear, minor damage, no fraud indicators' },
          { date: new Date(createdAt.getTime() + 1 * DAY).toISOString(), event: 'Police report RPT-2026-04821 received — Derek Nash confirmed at fault' },
          { date: new Date(createdAt.getTime() + 3 * DAY).toISOString(), event: 'Certified repair estimate $4,200 received and approved' },
          { date: new Date(createdAt.getTime() + 4 * DAY).toISOString(), event: 'Subrogation opportunity identified — Derek Nash auto insurer' },
          { date: new Date(createdAt.getTime() + 5 * DAY).toISOString(), event: 'ACH payment $3,700 issued to Jennifer Williams — claim closed' }
        ],
        investigationStatus: 'Cleared — Closed',
        outstandingActions: [],
        policyClaimantDetails: {
          policy: {
            'Policy Number': 'PA-TX-847291',
            'Policy Type': 'Personal Auto',
            'Coverage Limit': '$100,000',
            'Deductible': '$500',
            'Status': 'Active',
            'Issue Date': '2021-04-01'
          },
          claimant: {
            'Name': 'Jennifer Williams',
            'Role': 'Policyholder',
            'Phone': '713-555-0192',
            'ID Verification': 'Verified (98/100)'
          }
        },
        documentation: {
          received: [
            'Police Report (RPT-2026-04821)',
            'Claimant Loss Statement',
            'Vehicle Damage Photos (3)',
            'Certified Repair Estimate — $4,200',
            'Coverage Verification',
            'Government-Issued Photo ID'
          ],
          missing: []
        },
        eligibilityValidation: {
          checks: [
            { label: 'Coverage Active at Date of Loss', status: 'pass' },
            { label: 'Third-Party Fault Confirmed', status: 'pass', detail: 'Police report RPT-2026-04821 — Derek Nash at fault' },
            { label: 'Repair Estimate Received', status: 'pass', detail: '$4,200 from certified shop' },
            { label: 'Deductible Applied ($500)', status: 'pass' },
            { label: 'Identity Verified', status: 'pass', detail: 'Score 98/100' },
            { label: 'No Fraud Indicators', status: 'pass' }
          ]
        },
        riskIndicators: [],
        payoutReadiness: {
          status: 'Paid',
          estimatedAmount: 3700,
          blockers: []
        },
        estimatedExposure: {
          total: 4200,
          components: [
            { label: 'Repair Cost (Toyota Camry)', amount: 4200 },
            { label: 'Less Deductible', amount: -500 }
          ],
          notes: 'Closed — net ACH payment $3,700 issued to Jennifer Williams'
        }
      },
      fraudSignals: { score: 12, signals: [] },
      leakageIndicators: [],
      subrogationOpportunities: [
        {
          id: 'pc-sub-1-1',
          opportunityType: 'Third-Party Auto Liability Recovery',
          description: 'Derek Nash was determined at fault per police report RPT-2026-04821. Carrier paid $3,700 to Jennifer Williams. Subrogation demand of up to $4,200 (full repair cost) may be recoverable from Derek Nash\'s auto liability insurer.',
          estimatedRecovery: 4200,
          probability: 'High',
          recommendedAction: 'Issue subrogation demand letter to Derek Nash\'s auto insurer. Reference police report RPT-2026-04821 and repair estimate.',
          status: 'Identified'
        }
      ],
      benchmarkData: {
        cycleTime: {
          current: 5,
          industryAvg: 7,
          carrierAvg: 6,
          variance: '-17%',
          status: 'Exceeding'
        },
        similarClaims: {
          count: 1240,
          avgCycleTime: 7,
          avgSettlement: 3800,
          subrogationRate: '42%',
          fraudRate: '0.8%'
        },
        insights: [
          'Closed 30% faster than carrier average of 6 days for STP auto collision claims — exemplary processing',
          'STP pathway eliminated manual review — all 6 documentation items received at FNOL',
          'Subrogation recovery at 42% rate for third-party auto liability claims — demand letter recommended'
        ]
      },
      nextBestActions: [],
      auditFindings: []
    };
  }

  // ── PC-2: Robert Thompson — Homeowners, Standard, UNDER_REVIEW ──
  if (claim.id === 'pc-claim-2') {
    const slaDate = new Date(createdAt.getTime() + 30 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);
    return {
      lastAnalyzed: new Date(NOW.getTime() - 2 * 3600000).toISOString(),
      overallRisk: 'Medium',
      leakageExposure: 2000,
      claimSummary: {
        narrative: `Homeowners hailstorm claim for Robert Thompson, 1842 Magnolia Lane Nashville TN 37211. Golf-ball size 2" hail confirmed by NWS caused roof and siding damage. Repair estimate $34,500, deductible $2,500, reserve $32,000. Field adjuster Maria Rodriguez assigned. CAT event — 18 claims in zip 37211 for same storm. 18 days open, ${daysToSla} days remaining on SLA. Contractor final estimate and mortgage company notification outstanding.`,
        keyEvents: [
          { date: createdAt.toISOString(), event: 'FNOL received — hailstorm damage reported, Nashville TN 37211' },
          { date: new Date(createdAt.getTime() + 3 * 60000).toISOString(), event: 'Policy HO-TN-523184 verified active — $380K limit, $2,500 deductible' },
          { date: new Date(createdAt.getTime() + 15 * 60000).toISOString(), event: 'CAT event flag: 18 claims in zip 37211 — NWS storm confirmed' },
          { date: new Date(createdAt.getTime() + 1 * DAY).toISOString(), event: 'NWS weather corroboration received — 2" hail confirmed for loss date' },
          { date: new Date(createdAt.getTime() + 2 * DAY).toISOString(), event: 'Field adjuster Maria Rodriguez assigned for property inspection' },
          { date: new Date(createdAt.getTime() + 3 * DAY).toISOString(), event: 'Preliminary damage photos and claimant statement received' },
          { date: new Date(createdAt.getTime() + 18 * DAY).toISOString(), event: 'Contractor estimate outstanding — no submission received after 18 days' }
        ],
        investigationStatus: 'Active — Awaiting Contractor Estimate',
        outstandingActions: [
          'Licensed contractor final estimate',
          'Mortgage company notification',
          'Signed contractor work authorization'
        ],
        policyClaimantDetails: {
          policy: {
            'Policy Number': 'HO-TN-523184',
            'Policy Type': 'Homeowners',
            'Coverage Limit': '$380,000',
            'Deductible': '$2,500',
            'Status': 'Active',
            'Issue Date': '2018-06-01'
          },
          claimant: {
            'Name': 'Robert Thompson',
            'Role': 'Policyholder',
            'Phone': '615-555-0274',
            'ID Verification': 'Verified (96/100)'
          }
        },
        documentation: {
          received: [
            'Claimant Loss Statement',
            'Preliminary Property Damage Photos',
            'NWS Weather Corroboration',
            'Coverage Verification'
          ],
          missing: [
            'Licensed Contractor Final Estimate',
            'Mortgage Company Notification',
            'Signed Contractor Work Authorization'
          ]
        },
        eligibilityValidation: {
          checks: [
            { label: 'Coverage Active at Date of Loss', status: 'pass' },
            { label: 'Weather Event Corroborated', status: 'pass', detail: 'NWS confirmed 2" hail, Nashville TN 37211' },
            { label: 'Deductible Confirmed ($2,500)', status: 'pass' },
            { label: 'Contractor Estimate Received', status: 'warn', detail: 'Pending — field adjuster assigned but estimate not yet received' },
            { label: 'Mortgage Holder Notified', status: 'warn', detail: 'Notification not confirmed' }
          ]
        },
        riskIndicators: [
          { label: 'CAT Event — Regional Storm', severity: 'Low', detail: '18 claims in zip 37211 for same storm — NWS corroborated' }
        ],
        payoutReadiness: {
          status: 'Partial',
          estimatedAmount: 32000,
          blockers: [
            'Licensed contractor estimate not received',
            'Mortgage company notification pending'
          ]
        },
        estimatedExposure: {
          total: 34500,
          components: [
            { label: 'Hail Damage Repair (Roof/Siding)', amount: 34500 },
            { label: 'Less Deductible', amount: -2500 }
          ],
          notes: 'Net reserve $32,000. Contractor final estimate pending — exposure may increase.'
        }
      },
      fraudSignals: { score: 28, signals: [] },
      leakageIndicators: [
        {
          id: 'pc-li-2-1',
          category: 'Contractor Estimate — Over-Estimate Risk',
          severity: 'Low',
          description: 'Preliminary estimate $34,500 submitted by claimant. Licensed contractor final estimate not yet received. Without a certified estimate, there is a risk of over-payment if final scope exceeds initial assessment.',
          estimatedAmount: 2000,
          recommendation: 'Obtain certified contractor estimate before approving reserve or payment',
          status: 'Monitoring'
        }
      ],
      subrogationOpportunities: [],
      benchmarkData: {
        cycleTime: {
          current: daysOpen,
          industryAvg: 25,
          carrierAvg: 22,
          variance: daysOpen <= 22 ? 'On Track' : `+${Math.round((daysOpen / 22 - 1) * 100)}%`,
          status: daysOpen <= 22 ? 'On Track' : 'At Risk'
        },
        similarClaims: {
          count: 487,
          avgCycleTime: 25,
          avgSettlement: 31500,
          subrogationRate: '0%',
          fraudRate: '1.2%'
        },
        insights: [
          `CAT event hail claims in TN average 25 days — currently at ${daysOpen} days, contractor estimate is the critical path item`,
          'NWS corroboration eliminates weather validation step — standard for CAT-designated events',
          '18 same-storm claims in zip 37211 — coordinate contractor scheduling to avoid regional backlog'
        ]
      },
      nextBestActions: [
        {
          id: 'pc-nba-2-1',
          priority: 1,
          action: 'Assign Licensed Contractor for Final Estimate',
          description: 'Contractor estimate has been outstanding for 18 days. Assign from approved CAT contractor panel for zip 37211. Set 5-business-day deadline.',
          rationale: 'Estimate is the primary blocker for reserve finalization and payment approval',
          urgency: 'Immediate',
          agent: 'Claim Audit Agent',
          category: 'Documentation'
        },
        {
          id: 'pc-nba-2-2',
          priority: 2,
          action: 'Verify Mortgage Holder Notification Requirement',
          description: 'Confirm mortgage company name and notification requirements. Send joint-payee notification per standard homeowners protocol.',
          rationale: 'Mortgage holder must be notified and may be co-payee on settlement check per policy terms',
          urgency: 'This Week',
          agent: 'Claim Audit Agent',
          category: 'Compliance'
        },
        {
          id: 'pc-nba-2-3',
          priority: 3,
          action: 'Confirm CAT Event Handling with Supervisor',
          description: 'Verify CAT event handling protocols are applied — extended SLA, approved contractor panel, and CAT reserve guidelines.',
          rationale: 'CAT event designation may allow SLA extension and requires supervisor sign-off on reserve',
          urgency: 'This Week',
          agent: 'Next Best Action Agent',
          category: 'Compliance'
        }
      ],
      auditFindings: [
        {
          id: 'pc-af-2-1',
          stage: 'Investigation',
          finding: 'Contractor estimate overdue at 18 days — field adjuster Maria Rodriguez assigned but no estimate received or follow-up documented in claim notes',
          severity: 'Medium',
          category: 'Missed Step',
          detectedAt: new Date(createdAt.getTime() + 14 * DAY).toISOString(),
          status: 'Open'
        }
      ]
    };
  }

  // ── PC-3: Michael Chen — Auto Comprehensive (Total Loss / Theft), PENDING_REQUIREMENTS ──
  if (claim.id === 'pc-claim-3') {
    const slaDate = new Date(createdAt.getTime() + 14 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);
    return {
      lastAnalyzed: new Date(NOW.getTime() - 1 * 3600000).toISOString(),
      overallRisk: 'Medium',
      leakageExposure: 1500,
      claimSummary: {
        narrative: 'Auto comprehensive total loss claim for Michael Chen, 2020 Tesla Model 3 Midnight Silver (ACV $38,000), stolen overnight from residential driveway in Phoenix AZ. Police report PHX-2026-19472 filed. Total loss processing initiated. Salvage value estimated at $3,500. Net settlement approximately $36,000 ($38,000 ACV minus $1,000 deductible and salvage adjustments). 8 days open, final police report and vehicle title outstanding. No total loss specialist assigned.',
        keyEvents: [
          { date: createdAt.toISOString(), event: 'FNOL received — vehicle theft reported, Phoenix AZ' },
          { date: new Date(createdAt.getTime() + 3 * 60000).toISOString(), event: 'Policy PA-AZ-619247 verified active — $50K limit, $1,000 deductible' },
          { date: new Date(createdAt.getTime() + 8 * 60000).toISOString(), event: 'Initial police report PHX-2026-19472 received' },
          { date: new Date(createdAt.getTime() + 1 * DAY).toISOString(), event: 'Total loss threshold confirmed — ACV $38,000 exceeds repair threshold' },
          { date: new Date(createdAt.getTime() + 2 * DAY).toISOString(), event: 'Total loss processing initiated — vehicle registration copy received' },
          { date: new Date(createdAt.getTime() + 8 * DAY).toISOString(), event: 'Final police report and vehicle title still outstanding — total loss specialist not assigned' }
        ],
        investigationStatus: 'Active — Awaiting Final Police Report and Vehicle Title',
        outstandingActions: [
          'Final police report (case closure)',
          'Vehicle title / Certificate of Title',
          'Lienholder payoff authorization (if applicable)',
          'AZ DMV Total Loss Notification Form'
        ],
        policyClaimantDetails: {
          policy: {
            'Policy Number': 'PA-AZ-619247',
            'Policy Type': 'Personal Auto',
            'Coverage Limit': '$50,000',
            'Deductible': '$1,000',
            'Status': 'Active',
            'Issue Date': '2020-03-15'
          },
          claimant: {
            'Name': 'Michael Chen',
            'Role': 'Policyholder',
            'Phone': '602-555-0388',
            'ID Verification': 'Verified (97/100)'
          }
        },
        documentation: {
          received: [
            'Initial Police Report (PHX-2026-19472)',
            'Claimant Loss Statement',
            'Coverage Verification',
            'Vehicle Registration Copy'
          ],
          missing: [
            'Final Police Report (Case Closure)',
            'Vehicle Title / Certificate of Title',
            'Lienholder Payoff Authorization (if applicable)',
            'AZ DMV Total Loss Notification Form'
          ]
        },
        eligibilityValidation: {
          checks: [
            { label: 'Coverage Active at Date of Loss', status: 'pass' },
            { label: 'Theft Confirmed (Police Report Filed)', status: 'pass', detail: 'PHX-2026-19472 received' },
            { label: 'Total Loss Threshold Met', status: 'pass', detail: 'ACV $38,000 exceeds repair threshold' },
            { label: 'Vehicle Title Received', status: 'fail', detail: 'Pending — required for total loss settlement' },
            { label: 'Lienholder Coordination', status: 'warn', detail: 'Lienholder status unknown — instructions required' }
          ]
        },
        riskIndicators: [
          { label: 'Total Loss Processing', severity: 'Medium', detail: 'ACV $38,000 — full vehicle replacement value, Tesla Model 3 parts market variability' }
        ],
        payoutReadiness: {
          status: 'Blocked',
          estimatedAmount: 36000,
          blockers: [
            'Final police report (case closure) pending',
            'Vehicle title not yet received',
            'Lienholder payoff instructions required'
          ]
        },
        estimatedExposure: {
          total: 38000,
          components: [
            { label: 'ACV — 2020 Tesla Model 3', amount: 38000 },
            { label: 'Less Deductible ($1,000)', amount: -1000 },
            { label: 'Less Salvage Offset (est.)', amount: -3500 }
          ],
          notes: 'Net settlement ~$33,500. Vehicle title and final police report required before payment.'
        }
      },
      fraudSignals: { score: 35, signals: [] },
      leakageIndicators: [
        {
          id: 'pc-li-3-1',
          category: 'Salvage Value — Miscalculation Risk',
          severity: 'Low',
          description: 'Salvage value estimated at $3,500 for a 2020 Tesla Model 3. Tesla EV parts market is volatile — salvage auction values can vary significantly based on battery condition and market demand. Estimate may be conservative or optimistic.',
          estimatedAmount: 1500,
          recommendation: 'Obtain certified salvage appraisal from EV-specialist salvage vendor before finalizing settlement',
          status: 'Monitoring'
        }
      ],
      subrogationOpportunities: [],
      benchmarkData: {
        cycleTime: {
          current: daysOpen,
          industryAvg: 14,
          carrierAvg: 12,
          variance: daysOpen <= 12 ? 'On Track' : `+${Math.round((daysOpen / 12 - 1) * 100)}%`,
          status: daysOpen <= 12 ? 'On Track' : 'At Risk'
        },
        similarClaims: {
          count: 218,
          avgCycleTime: 14,
          avgSettlement: 36500,
          subrogationRate: '0%',
          fraudRate: '2.8%'
        },
        insights: [
          `Auto theft total loss claims average 14 days — currently ${daysOpen} days, title and police report are on the critical path`,
          'Tesla Model 3 total loss claims require EV-specialist salvage appraisal — standard shop values may be inaccurate',
          'AZ DMV total loss notification is required within 10 days of settlement — initiate early'
        ]
      },
      nextBestActions: [
        {
          id: 'pc-nba-3-1',
          priority: 1,
          action: 'Obtain Final Police Report',
          description: 'Contact Phoenix PD case officer for PHX-2026-19472 to obtain case closure report or status update. Set 3-business-day follow-up.',
          rationale: 'Final police report is required to confirm theft was not recovered and to support total loss determination',
          urgency: 'Immediate',
          agent: 'Claim Audit Agent',
          category: 'Documentation'
        },
        {
          id: 'pc-nba-3-2',
          priority: 2,
          action: 'Request Vehicle Title from Claimant',
          description: 'Contact Michael Chen to obtain original vehicle title or Certificate of Title. If lienholder holds title, coordinate directly with lienholder.',
          rationale: 'Vehicle title is required before any total loss settlement can be issued',
          urgency: 'Immediate',
          agent: 'Claim Audit Agent',
          category: 'Documentation'
        },
        {
          id: 'pc-nba-3-3',
          priority: 3,
          action: 'Determine Lienholder Status',
          description: 'Check policy records and vehicle registration for lienholder information. If a lien exists, initiate payoff coordination with the lienholder.',
          rationale: 'Lienholder must be paid before or alongside claimant in a total loss settlement',
          urgency: 'This Week',
          agent: 'Next Best Action Agent',
          category: 'Financial'
        }
      ],
      auditFindings: [
        {
          id: 'pc-af-3-1',
          stage: 'Investigation',
          finding: 'Total loss specialist not yet assigned after 8 days on a theft total loss claim. Standard procedure requires specialist assignment within 3 business days.',
          severity: 'Medium',
          category: 'Missed Step',
          detectedAt: new Date(createdAt.getTime() + 5 * DAY).toISOString(),
          status: 'Open'
        }
      ]
    };
  }

  // ── PC-4: James Wilson — Auto Liability, SIU, UNDER_REVIEW ──
  if (claim.id === 'pc-claim-4') {
    const slaDate = new Date(createdAt.getTime() + 30 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);
    return {
      lastAnalyzed: new Date(NOW.getTime() - 0.5 * 3600000).toISOString(),
      overallRisk: 'High',
      leakageExposure: 75000,
      claimSummary: {
        narrative: `Auto liability claim for James Wilson, 2019 Ford F-150 Black, Atlanta GA. Three-vehicle accident in light rain — liability contested. Third party Sandra Kim retained attorney within 7 days, alleging neck and back injuries. Third party Thomas Brown also involved — recorded statement outstanding. BI exposure estimated $75,000–$150,000, reserve $120,000. SIU active 22 days. Defense counsel not yet retained. ${daysToSla} days remaining on SLA.`,
        keyEvents: [
          { date: createdAt.toISOString(), event: 'FNOL received — 3-vehicle accident, liability disputed, Atlanta GA' },
          { date: new Date(createdAt.getTime() + 3 * 60000).toISOString(), event: 'Policy PA-GA-738156 verified active — $300K limit, $1,000 deductible' },
          { date: new Date(createdAt.getTime() + 20 * 60000).toISOString(), event: 'SIU referral initiated — conflicting witness statements, liability contested' },
          { date: new Date(createdAt.getTime() + 3 * DAY).toISOString(), event: 'BI demand letter received — Sandra Kim attorney representation confirmed' },
          { date: new Date(createdAt.getTime() + 7 * DAY).toISOString(), event: 'Sandra Kim attorney retained within 7 days of loss — soft-tissue BI escalation risk flagged' },
          { date: new Date(createdAt.getTime() + 10 * DAY).toISOString(), event: 'Accident reconstruction report not yet ordered — liability undetermined' },
          { date: new Date(createdAt.getTime() + 22 * DAY).toISOString(), event: 'Defense counsel still not retained — 22 days open, SIU investigation ongoing' }
        ],
        investigationStatus: 'Active — SIU Investigation, Defense Counsel Required',
        outstandingActions: [
          'Retain defense counsel — IMMEDIATE',
          'Order IME for Sandra Kim',
          'Obtain SIU investigation report',
          'Collect recorded statement from Thomas Brown',
          'Order accident reconstruction report'
        ],
        policyClaimantDetails: {
          policy: {
            'Policy Number': 'PA-GA-738156',
            'Policy Type': 'Personal Auto',
            'Coverage Limit': '$300,000',
            'Deductible': '$1,000',
            'Status': 'Active',
            'Issue Date': '2017-08-15'
          },
          claimant: {
            'Name': 'James Wilson',
            'Role': 'Policyholder',
            'Phone': '404-555-0517',
            'ID Verification': 'Verified (94/100)'
          }
        },
        documentation: {
          received: [
            'Police Report (ATL-2026-00872)',
            'Claimant Statement',
            'Initial BI Demand Letter',
            'Vehicle Damage Photos'
          ],
          missing: [
            'SIU Investigation Report',
            'Defense Counsel Engagement Letter',
            'Third-Party Medical Records (Sandra Kim)',
            'Recorded Statement (Thomas Brown)',
            'Accident Reconstruction Report'
          ]
        },
        eligibilityValidation: {
          checks: [
            { label: 'Coverage Active at Date of Loss', status: 'pass' },
            { label: 'Liability Determined', status: 'fail', detail: 'Disputed — SIU investigation active' },
            { label: 'SIU Referral Initiated', status: 'pass' },
            { label: 'Defense Counsel Retained', status: 'fail', detail: 'Not yet assigned — 22 days open' },
            { label: 'Third-Party Statements Complete', status: 'fail', detail: 'Thomas Brown recorded statement pending' }
          ]
        },
        riskIndicators: [
          { label: 'Bodily Injury — Attorney Representation', severity: 'High', detail: 'Sandra Kim — neck/back, treatment ongoing, attorney retained within 7 days' },
          { label: 'Disputed Liability — SIU Investigation', severity: 'High', detail: 'Conflicting witness statements, 22 days open, no resolution timeline' },
          { label: 'Third-Party Exposure — $125K Reserve', severity: 'Medium', detail: '2 claimants, attorney demand escalating, defense not retained' }
        ],
        payoutReadiness: {
          status: 'Blocked',
          estimatedAmount: 125000,
          blockers: [
            'Liability determination pending SIU investigation',
            'Defense counsel not yet retained',
            'Third-party medical records outstanding',
            'Recorded statements incomplete'
          ]
        },
        estimatedExposure: {
          total: 150000,
          components: [
            { label: 'BI Demand — Sandra Kim (est.)', amount: 100000 },
            { label: 'Property Damage (multi-vehicle)', amount: 30000 },
            { label: 'Third-Party Thomas Brown (est.)', amount: 20000 }
          ],
          notes: 'Range $75K–$150K. Reserve $120K. Actual exposure depends on liability determination and medical records.'
        }
      },
      fraudSignals: {
        score: 55,
        signals: [
          {
            id: 'pc-fs-4-1',
            category: 'Bodily Injury',
            severity: 'Medium',
            indicator: 'Early Attorney Retention on Soft Tissue Claim',
            description: 'Third party Sandra Kim retained counsel within 7 days of loss event and is claiming soft-tissue injuries (neck/back). Early attorney retention on low-speed collisions with soft-tissue claims is a recognized BI inflation pattern.',
            dataSource: 'SIU Referral Data',
            confidence: 68,
            detectedAt: new Date(createdAt.getTime() + 3 * DAY).toISOString(),
            recommendation: 'SIU to investigate claim timeline and assess BI inflation risk. Do not accept demand without independent medical examination.'
          }
        ]
      },
      leakageIndicators: [
        {
          id: 'pc-li-4-1',
          category: 'Bodily Injury Exposure — Uncapped',
          severity: 'High',
          description: 'Sandra Kim BI demand not yet quantified. Soft-tissue injury with attorney. Reserve of $120,000 may be inadequate if treatment escalates. Each month of delayed settlement increases BI exposure.',
          estimatedAmount: 75000,
          recommendation: 'Retain defense counsel and request IME for Sandra Kim immediately',
          status: 'Open'
        },
        {
          id: 'pc-li-4-2',
          category: 'Defense Cost Exposure',
          severity: 'Medium',
          description: 'Defense counsel not retained after 22 days. Legal costs accruing without representation. Early retention typically reduces total defense spend by 20–35%.',
          estimatedAmount: 15000,
          recommendation: 'Retain defense counsel within 48 hours',
          status: 'Open'
        }
      ],
      subrogationOpportunities: [],
      benchmarkData: {
        cycleTime: {
          current: daysOpen,
          industryAvg: 90,
          carrierAvg: 80,
          variance: daysOpen <= 30 ? 'Early Stage' : `+${Math.round((daysOpen / 30 - 1) * 100)}%`,
          status: daysToSla < 5 ? 'At Risk' : 'In Progress'
        },
        similarClaims: {
          count: 94,
          avgCycleTime: 90,
          avgSettlement: 87500,
          subrogationRate: '0%',
          fraudRate: '12.4%'
        },
        insights: [
          'Contested BI liability claims with attorney representation average 90 days — early defense retention reduces costs by 20–35%',
          'Soft-tissue BI claims with early attorney retention carry a 12.4% fraud rate — IME is standard procedure',
          `Defense counsel not retained at day 22 is outside the 5-business-day carrier benchmark — escalate immediately`
        ]
      },
      nextBestActions: [
        {
          id: 'pc-nba-4-1',
          priority: 1,
          action: 'Retain Defense Counsel — IMMEDIATE',
          description: 'Assign defense counsel from approved panel immediately. 22 days without representation on a contested BI liability claim with attorney representation is a compliance failure.',
          rationale: 'Defense counsel is required to protect policyholder interests and manage BI exposure escalation',
          urgency: 'Immediate',
          agent: 'Claim Audit Agent',
          category: 'Legal'
        },
        {
          id: 'pc-nba-4-2',
          priority: 2,
          action: 'Request IME for Sandra Kim',
          description: 'Order an Independent Medical Examination for Sandra Kim immediately. Soft-tissue claims with attorney representation require IME to establish baseline and contest inflated demands.',
          rationale: 'IME is the primary tool to cap BI exposure on soft-tissue attorney-represented claims',
          urgency: 'Immediate',
          agent: 'Fraud Signal Agent',
          category: 'Investigation'
        },
        {
          id: 'pc-nba-4-3',
          priority: 3,
          action: 'Obtain SIU Investigation Timeline',
          description: 'Contact SIU supervisor for estimated report completion date. Document in claim notes. SIU report is required before any settlement negotiation can proceed.',
          rationale: 'Liability determination depends on SIU findings — no settlement should proceed without SIU clearance',
          urgency: 'This Week',
          agent: 'Fraud Signal Agent',
          category: 'Investigation'
        },
        {
          id: 'pc-nba-4-4',
          priority: 4,
          action: 'Collect Recorded Statement from Thomas Brown',
          description: 'Contact Thomas Brown (404-555-0134) to schedule recorded statement. Thomas is a key witness for liability determination.',
          rationale: 'Third-party witness statements are required to resolve disputed liability determination',
          urgency: 'This Week',
          agent: 'Claim Audit Agent',
          category: 'Investigation'
        }
      ],
      auditFindings: [
        {
          id: 'pc-af-4-1',
          stage: 'Investigation',
          finding: 'Defense counsel not retained after 22 days on a contested liability BI claim with third-party attorney representation. Carrier benchmark requires retention within 5 business days.',
          severity: 'High',
          category: 'Missed Step',
          detectedAt: new Date(createdAt.getTime() + 7 * DAY).toISOString(),
          status: 'Open'
        },
        {
          id: 'pc-af-4-2',
          stage: 'Investigation',
          finding: 'Recorded statement from Thomas Brown not obtained. Third-party claimant is available but has not been contacted for statement after 22 days.',
          severity: 'Medium',
          category: 'Incomplete Documentation',
          detectedAt: new Date(createdAt.getTime() + 10 * DAY).toISOString(),
          status: 'Open'
        },
        {
          id: 'pc-af-4-3',
          stage: 'Investigation',
          finding: 'IME not ordered for BI claimant Sandra Kim despite attorney representation and soft-tissue claims. IME is required per claim handling guidelines for BI claims with legal representation.',
          severity: 'Medium',
          category: 'Missed Step',
          detectedAt: new Date(createdAt.getTime() + 14 * DAY).toISOString(),
          status: 'Open'
        }
      ]
    };
  }

  // ── PC-5: Davidson Restaurant Group — Commercial Property, SLA at risk ──
  if (claim.id === 'pc-claim-5') {
    const slaDate = new Date(createdAt.getTime() + 30 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);
    return {
      lastAnalyzed: new Date(NOW.getTime() - 0.25 * 3600000).toISOString(),
      overallRisk: 'High',
      leakageExposure: 15000,
      claimSummary: {
        narrative: `Commercial property kitchen fire claim for Davidson Restaurant Group LLC (Davidson Grille, 840 N Michigan Ave Chicago IL). Restaurant closed 26 days — business interruption coverage triggered. Multi-component claim: $195,000 structural repair + $90,000 BI estimate = $285,000 total, reserve $280,000. Fire cause investigation (faulty equipment) ongoing — arson exclusion not yet cleared. Contractor estimate, 12 months revenue records, and BI specialist all outstanding. SLA in ${daysToSla} day(s) — extension not yet requested.`,
        keyEvents: [
          { date: createdAt.toISOString(), event: 'FNOL received — commercial kitchen fire, Chicago IL, restaurant closed' },
          { date: new Date(createdAt.getTime() + 3 * 60000).toISOString(), event: 'Policy CP-IL-415892 verified active — $1.2M commercial property, $10K deductible' },
          { date: new Date(createdAt.getTime() + 2 * DAY).toISOString(), event: 'Fire Department Report CPD-2026-FF-0042 received — faulty equipment attributed' },
          { date: new Date(createdAt.getTime() + 2 * DAY).toISOString(), event: 'Flag: Fire cause investigation incomplete — arson exclusion not yet cleared' },
          { date: new Date(createdAt.getTime() + 3 * DAY).toISOString(), event: 'Business interruption coverage triggered — daily revenue loss clock started' },
          { date: new Date(createdAt.getTime() + 10 * DAY).toISOString(), event: 'SLA alert raised — complex claim, BI specialist and contractor estimate outstanding' },
          { date: new Date(createdAt.getTime() + 26 * DAY).toISOString(), event: `SLA in ${daysToSla} day(s) — no extension requested, contractor estimate still outstanding` }
        ],
        investigationStatus: `Active — SLA Critical, BI Specialist Required, ${daysToSla} Days Remaining`,
        outstandingActions: [
          'FILE SLA EXTENSION IMMEDIATELY',
          'Assign BI specialist and request 12 months revenue records',
          'Engage licensed contractor for structural estimate',
          'Obtain fire cause investigation report (arson exclusion)',
          'Obtain equipment appraisal'
        ],
        policyClaimantDetails: {
          policy: {
            'Policy Number': 'CP-IL-415892',
            'Policy Type': 'Commercial Property',
            'Coverage Limit': '$1,200,000',
            'Deductible': '$10,000',
            'Status': 'Active',
            'Issue Date': '2022-01-01'
          },
          claimant: {
            'Name': 'Marcus Davidson',
            'Role': 'Named Insured / Business Owner',
            'Phone': '312-555-0748',
            'ID Verification': 'Verified (95/100)'
          }
        },
        documentation: {
          received: [
            'Fire Department Report (CPD-2026-FF-0042)',
            'Claimant Statement',
            'Preliminary Damage Photos (interior/exterior)',
            'Business License & Entity Verification'
          ],
          missing: [
            'Licensed Contractor Final Estimate (structural)',
            '12 Months Revenue Records (for BI calculation)',
            'Commercial Equipment Appraisal',
            'Fire Cause Investigation Report (arson/equipment)',
            'Proof of Ongoing Business Expenses (rent, payroll)'
          ]
        },
        eligibilityValidation: {
          checks: [
            { label: 'Coverage Active at Date of Loss', status: 'pass' },
            { label: 'Peril Covered (Fire)', status: 'pass' },
            { label: 'Business Interruption Triggered', status: 'pass', detail: 'Restaurant closed 26 days' },
            { label: 'Deductible Confirmed ($10,000)', status: 'pass' },
            { label: 'Revenue Documentation Received', status: 'fail', detail: '12 months revenue records not submitted' },
            { label: 'Fire Cause Determination', status: 'warn', detail: 'Faulty equipment pending formal investigation report' },
            { label: 'Arson Exclusion Cleared', status: 'warn', detail: 'Fire cause investigation ongoing — not yet confirmed' }
          ]
        },
        riskIndicators: [
          { label: 'SLA Critical Risk', severity: 'High', detail: `${daysToSla} days remaining — extension not requested` },
          { label: 'Business Interruption — Revenue Unquantified', severity: 'High', detail: '26 days closed, $90,000 BI estimate unconfirmed, daily accrual ongoing' },
          { label: 'Multi-Component Claim Complexity', severity: 'Medium', detail: 'Property + BI + equipment — require specialist for each component' }
        ],
        payoutReadiness: {
          status: 'Blocked',
          estimatedAmount: 285000,
          blockers: [
            'Licensed contractor estimate not yet received',
            '12 months revenue records not submitted',
            'Equipment appraisal outstanding',
            'SLA extension not requested — imminent breach'
          ]
        },
        estimatedExposure: {
          total: 300000,
          components: [
            { label: 'Structural Repairs (Kitchen Fire)', amount: 195000 },
            { label: 'Business Interruption (26+ days)', amount: 90000 },
            { label: 'Equipment Loss (est.)', amount: 15000 }
          ],
          notes: 'BI accruing ~$3,462/day. Exposure may exceed $300K without immediate contractor and BI specialist engagement.'
        }
      },
      fraudSignals: {
        score: 30,
        signals: [
          {
            id: 'pc-fs-5-1',
            category: 'Documentation',
            severity: 'Low',
            indicator: 'Fire Cause Under Investigation — Arson Not Excluded',
            description: 'Kitchen fire origin attributed to faulty equipment by fire department. However, the formal fire cause investigation has not been completed. Standard practice requires arson exclusion confirmation before settlement on commercial kitchen fires above $100,000.',
            dataSource: 'Fire Department Report CPD-2026-FF-0042',
            confidence: 72,
            detectedAt: new Date(createdAt.getTime() + 2 * DAY).toISOString(),
            recommendation: 'Obtain final fire marshal investigation report before proceeding to settlement'
          }
        ]
      },
      leakageIndicators: [
        {
          id: 'pc-li-5-1',
          category: 'Business Interruption — Daily Revenue Loss',
          severity: 'High',
          description: 'Restaurant has been closed 26 days. BI coverage pays for actual revenue loss minus saved expenses. Daily revenue estimate ~$3,462 based on claimant-provided figures. Each additional day adds ~$3,462 to liability. Current uncapped exposure: ~$90,000.',
          estimatedAmount: 90000,
          recommendation: 'Assign BI specialist and obtain 12 months revenue records immediately to quantify and cap exposure',
          status: 'Open'
        },
        {
          id: 'pc-li-5-2',
          category: 'Contractor Estimate — Overrun Risk',
          severity: 'Medium',
          description: 'Preliminary structural damage estimate $195,000. Commercial kitchen fire restoration costs are volatile. Without a final certified estimate, the reserve of $280,000 may be insufficient for full restoration including equipment.',
          estimatedAmount: 15000,
          recommendation: 'Engage certified restoration contractor within 48 hours',
          status: 'Monitoring'
        }
      ],
      subrogationOpportunities: [],
      benchmarkData: {
        cycleTime: {
          current: daysOpen,
          industryAvg: 45,
          carrierAvg: 40,
          variance: daysOpen <= 40 ? 'On Track' : `+${Math.round((daysOpen / 40 - 1) * 100)}%`,
          status: daysToSla < 5 ? 'At Risk' : 'In Progress'
        },
        similarClaims: {
          count: 63,
          avgCycleTime: 45,
          avgSettlement: 268000,
          subrogationRate: '8%',
          fraudRate: '4.1%'
        },
        insights: [
          `Commercial restaurant fire claims average 45 days — SLA expires in ${daysToSla} day(s), extension must be filed immediately`,
          'BI specialist assignment within first 5 days reduces average cycle time by 12 days — 26 days without one is a significant delay',
          'Commercial kitchen fires with unresolved arson investigations carry a 4.1% fraud rate — fire marshal report is standard protocol'
        ]
      },
      nextBestActions: [
        {
          id: 'pc-nba-5-1',
          priority: 1,
          action: 'Request SLA Extension — FILE NOW',
          description: `SLA expires in ${daysToSla} day(s). File extension request with supervisor approval citing complex multi-component commercial claim with BI and structural components. Document in claim notes immediately.`,
          rationale: 'SLA breach without an approved extension is a regulatory compliance violation',
          urgency: 'Immediate',
          agent: 'Compliance Agent',
          category: 'Compliance'
        },
        {
          id: 'pc-nba-5-2',
          priority: 2,
          action: 'Assign BI Specialist and Request Revenue Records',
          description: 'Assign a Business Interruption specialist to quantify daily revenue loss. Simultaneously request 12 months of revenue records (P&L statements, tax returns, POS reports) from Davidson Restaurant Group.',
          rationale: 'BI exposure is accruing at ~$3,462/day — each day without quantification increases total liability',
          urgency: 'Immediate',
          agent: 'Leakage Detection Agent',
          category: 'Financial'
        },
        {
          id: 'pc-nba-5-3',
          priority: 3,
          action: 'Engage Licensed Contractor for Final Estimate',
          description: 'Assign a licensed commercial restoration contractor to provide a certified structural damage estimate. Preliminary $195,000 figure must be validated by a certified contractor.',
          rationale: 'Contractor estimate is required to finalize reserve and approve any structural repair payment',
          urgency: 'Immediate',
          agent: 'Claim Audit Agent',
          category: 'Documentation'
        },
        {
          id: 'pc-nba-5-4',
          priority: 4,
          action: 'Obtain Fire Cause Investigation Report',
          description: 'Contact Chicago Fire Marshal office to request formal fire cause investigation report. Arson exclusion must be cleared before any settlement can be issued.',
          rationale: 'Policy may exclude arson — settlement without fire cause confirmation is an underwriting risk',
          urgency: 'This Week',
          agent: 'Fraud Signal Agent',
          category: 'Investigation'
        }
      ],
      auditFindings: [
        {
          id: 'pc-af-5-1',
          stage: 'Investigation',
          finding: `SLA approaching in ${daysToSla} day(s) with no extension request filed — 26 days open on a complex commercial property claim with multiple coverage components`,
          severity: 'High',
          category: 'SLA Breach Risk',
          detectedAt: new Date(NOW.getTime() - 3 * DAY).toISOString(),
          status: 'Open'
        },
        {
          id: 'pc-af-5-2',
          stage: 'Investigation',
          finding: 'BI specialist not assigned after 26 days — revenue records not requested. Business has been closed since loss date with daily revenue loss accruing uncapped.',
          severity: 'High',
          category: 'Missed Step',
          detectedAt: new Date(createdAt.getTime() + 10 * DAY).toISOString(),
          status: 'Open'
        },
        {
          id: 'pc-af-5-3',
          stage: 'Investigation',
          finding: 'Contractor estimate not received after 26 days — no documented follow-up or escalation in claim notes. Reserve of $280,000 is based on preliminary figures only.',
          severity: 'Medium',
          category: 'Incomplete Documentation',
          detectedAt: new Date(createdAt.getTime() + 14 * DAY).toISOString(),
          status: 'Open'
        }
      ]
    };
  }

  // ── PC-6: Kim's Flowers & Gifts — Commercial Property IoT, STP, CLOSED ──
  if (claim.id === 'pc-claim-6') {
    return {
      lastAnalyzed: claim.closedAt || NOW.toISOString(),
      overallRisk: 'Low',
      leakageExposure: 0,
      claimSummary: {
        narrative: "Commercial property frozen pipe claim for Kim's Flowers & Gifts, 1847 Main Street Chicago IL. Kim Lee, policyholder. Winter storm -5°F NOAA confirmed. IoT FloodStop Pro sensors: TEMP-BPF-001 recorded -5°F at 02:30, WATER-BPF-002 activated at 03:45. Emergency mitigation started within 2 hours. Prior claim CLM-2024-012847 — all 4 prevention measures followed. Claim $19,500 ($16,500 repair + $3,000 BI). STP approved in 45 minutes — 94% confidence. ACH payment issued same day. Fastest 5% of BOP pipe burst claims processed this year.",
        keyEvents: [
          { date: createdAt.toISOString(), event: 'IoT FloodStop Pro WATER-BPF-002 activated at 03:45 — pipe burst detected' },
          { date: new Date(createdAt.getTime() + 30 * 60000).toISOString(), event: 'Mobile FNOL submitted — geo-tagged damage photos, Kim Lee' },
          { date: new Date(createdAt.getTime() + 62 * 60000).toISOString(), event: 'Automated analysis: 5 data sources corroborated — NOAA, IoT, FNOL photos, prior claim history, peer benchmark' },
          { date: new Date(createdAt.getTime() + 75 * 60000).toISOString(), event: 'STP approved — 94% confidence, all 5 criteria met in 45 minutes' },
          { date: new Date(createdAt.getTime() + 2 * 3600000).toISOString(), event: 'Emergency contractor estimate $19,500 validated against 127 comparable claims' },
          { date: new Date(createdAt.getTime() + 2.5 * 3600000).toISOString(), event: 'ACH payment $19,500 issued to Kim\'s Flowers & Gifts — claim closed' }
        ],
        investigationStatus: 'Cleared — Closed (STP)',
        outstandingActions: [],
        policyClaimantDetails: {
          policy: {
            'Policy Number': 'BOP-IL-789456',
            'Policy Type': 'Business Owners Policy',
            'Coverage Limit': '$500,000',
            'Deductible': '$5,000',
            'Status': 'Active',
            'Issue Date': '2023-06-01'
          },
          claimant: {
            'Name': 'Kim Lee',
            'Role': 'Named Insured / Business Owner',
            'Phone': '503-555-0234',
            'ID Verification': 'Verified (99/100)'
          }
        },
        documentation: {
          received: [
            'Mobile FNOL + Geo-Tagged Damage Photos',
            'IoT Sensor Logs (TEMP-BPF-001 & WATER-BPF-002)',
            'NOAA Winter Storm Warning Confirmation',
            'Emergency Contractor Estimate',
            'Coverage Verification',
            'Government-Issued ID'
          ],
          missing: []
        },
        eligibilityValidation: {
          checks: [
            { label: 'Coverage Active at Date of Loss', status: 'pass' },
            { label: 'Peril Covered (Frozen Pipe)', status: 'pass' },
            { label: 'IoT Sensor Data Corroborated', status: 'pass', detail: 'TEMP-BPF-001: -5°F at 02:30, WATER-BPF-002: activated 03:45' },
            { label: 'NOAA Weather Confirmed', status: 'pass', detail: 'Winter Storm Warning — -5°F Chicago IL 60601' },
            { label: 'Prior Claim Prevention Compliance Verified', status: 'pass', detail: 'All 4 post-CLM-2024-012847 measures completed' },
            { label: 'Estimate Within Benchmark Range', status: 'pass', detail: 'Validated against 127 comparable BOP pipe burst claims' },
            { label: 'Identity Verified', status: 'pass', detail: 'Score 99/100 — pre-verified returning customer' }
          ]
        },
        riskIndicators: [],
        payoutReadiness: {
          status: 'Paid',
          estimatedAmount: 19500,
          blockers: []
        },
        estimatedExposure: {
          total: 19500,
          components: [
            { label: 'Structural Repair (Pipe Burst)', amount: 16500 },
            { label: 'Business Interruption', amount: 3000 }
          ],
          notes: "Closed — ACH payment $19,500 issued same day (STP). Fastest 5% of BOP pipe burst claims."
        }
      },
      fraudSignals: { score: 8, signals: [] },
      leakageIndicators: [],
      subrogationOpportunities: [],
      benchmarkData: {
        cycleTime: {
          current: 0,
          industryAvg: 5,
          carrierAvg: 4,
          variance: '-100%',
          status: 'Exceeding'
        },
        similarClaims: {
          count: 89,
          avgCycleTime: 5,
          avgSettlement: 18200,
          subrogationRate: '0%',
          fraudRate: '0.6%'
        },
        insights: [
          'Closed in 45 minutes — fastest 5% of BOP pipe burst claims processed this year',
          'IoT sensor validation eliminated need for field adjuster, saving an estimated 2 days of cycle time',
          'Prior claim prevention compliance (CLM-2024-012847) was a decisive STP qualifier — behavioral pattern indicative of low-risk insured'
        ]
      },
      nextBestActions: [],
      auditFindings: []
    };
  }

  // ── Default: seeded P&C claims ──
  const overallRisk = riskScore < 30 ? 'Low' : riskScore < 55 ? 'Medium' : 'High';
  const isSTP = claim.routing?.type === 'fasttrack';
  const claimAmount = claim.financial?.claimAmount || 0;
  const isClosed = claim.status === 'closed';
  const type = claim.type;
  const isAuto = type === PCClaimType.AUTO_COLLISION || type === PCClaimType.AUTO_COMPREHENSIVE;
  const isLiability = type === PCClaimType.AUTO_LIABILITY;
  const isProperty = type === PCClaimType.HOMEOWNERS || type === PCClaimType.COMMERCIAL_PROPERTY;
  const alerts = claim.aiInsights?.alerts || [];

  let narrativeSuffix = '';
  if (isAuto) narrativeSuffix = 'Repair estimate and damage documentation are the primary outstanding items.';
  else if (isLiability) narrativeSuffix = 'Liability determination and third-party statements are outstanding.';
  else if (isProperty) narrativeSuffix = 'Contractor estimate and coverage verification are the primary outstanding items.';
  else narrativeSuffix = 'Standard claim processing in progress.';

  return {
    lastAnalyzed: new Date(NOW.getTime() - Math.floor((daysOpen % 6) + 1) * 3600000).toISOString(),
    overallRisk,
    leakageExposure: isClosed ? 0 : (isLiability ? Math.round(claimAmount * 0.2) : 0),
    claimSummary: {
      narrative: `${type ? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'P&C'} claim for ${claim.insured?.name || claim.claimant?.name}, filed via claims portal. Policy ${claim.policy?.policyNumber} — ${claim.policy?.type || 'P&C Insurance'} with coverage limit $${(claim.policy?.coverageLimit || claimAmount).toLocaleString()}. Status: ${(claim.status || '').replace(/_/g, ' ')}. Claim is ${daysOpen} days old. ${narrativeSuffix}`,
      keyEvents: [
        { date: claim.createdAt, event: 'FNOL submitted via claims portal' },
        { date: new Date(createdAt.getTime() + 3 * 60000).toISOString(), event: `Policy ${claim.policy?.policyNumber} verified active` },
        { date: new Date(createdAt.getTime() + 15 * 60000).toISOString(), event: isSTP ? 'STP routing approved — claim fast-tracked' : 'Standard routing assigned — adjuster queue' }
      ],
      investigationStatus: isClosed ? 'Cleared — Closed' : 'Active',
      outstandingActions: isClosed ? [] : ['Complete open requirements', 'Advance claim through adjuster review'],
      policyClaimantDetails: {
        policy: {
          'Policy Number': claim.policy?.policyNumber || '—',
          'Policy Type': claim.policy?.type || '—',
          'Coverage Limit': claim.policy?.coverageLimit ? `$${claim.policy.coverageLimit.toLocaleString()}` : '—',
          'Deductible': claim.policy?.deductible ? `$${claim.policy.deductible.toLocaleString()}` : '—',
          'Status': claim.policy?.status || 'Active',
          'Issue Date': claim.policy?.issueDate || '—'
        },
        claimant: {
          'Name': claim.claimant?.name || claim.insured?.name || '—',
          'Role': claim.claimant?.relationship || 'Policyholder',
          'Phone': claim.claimant?.contactInfo?.phone || '—',
          'ID Verification': 'Verified'
        }
      },
      documentation: {
        received: ['Claimant Loss Statement', 'Coverage Verification', ...(isAuto ? ['Vehicle Damage Photos', 'Repair Estimate'] : isProperty ? ['Property Damage Photos'] : [])],
        missing: isClosed ? [] : (isAuto ? ['Police Report'] : isProperty ? ['Licensed Contractor Estimate'] : ['Outstanding Documentation'])
      },
      eligibilityValidation: {
        checks: [
          { label: 'Coverage Active at Date of Loss', status: 'pass' },
          { label: 'Claim Type Covered', status: 'pass' },
          { label: 'Identity Verified', status: isSTP ? 'pass' : 'warn', detail: isSTP ? undefined : 'Verification in progress' }
        ]
      },
      riskIndicators: alerts.length > 0 ? alerts.map(a => ({ label: a.title || 'Risk Indicator', severity: a.severity || 'Low', detail: a.message || '' })) : [],
      payoutReadiness: {
        status: isClosed ? 'Paid' : (isSTP ? 'Ready' : 'Blocked'),
        estimatedAmount: isClosed ? (claim.financial?.amountPaid || claimAmount) : Math.max(0, claimAmount - (claim.policy?.deductible || 0)),
        blockers: isClosed ? [] : (isSTP ? [] : ['Outstanding documentation required', 'Adjuster review in progress'])
      },
      estimatedExposure: {
        total: claimAmount,
        components: [
          { label: 'Claim Reserve', amount: claim.financial?.reserve || claimAmount },
          ...(claim.policy?.deductible ? [{ label: 'Less Deductible', amount: -(claim.policy.deductible) }] : [])
        ],
        notes: isClosed ? 'Claim closed — payment issued.' : null
      }
    },
    fraudSignals: {
      score: riskScore,
      signals: alerts.map((a, i) => ({
        id: `pc-fs-${claim.id}-${i}`,
        category: a.category || 'General',
        severity: a.severity || 'Low',
        indicator: a.title || 'Risk Indicator',
        description: a.description || a.message || '',
        dataSource: 'Internal',
        confidence: a.confidence || 70,
        detectedAt: a.timestamp || claim.createdAt,
        recommendation: a.recommendation || 'Review'
      }))
    },
    leakageIndicators: (!isClosed && isLiability && claimAmount > 0) ? [
      {
        id: `pc-li-${claim.id}-1`,
        category: 'Liability Exposure',
        severity: overallRisk === 'High' ? 'High' : 'Medium',
        description: `Liability claim with reserve $${(claim.financial?.reserve || 0).toLocaleString()}. Third-party exposure may escalate if liability is not determined promptly.`,
        estimatedAmount: Math.round(claimAmount * 0.2),
        recommendation: 'Prioritize liability determination and retain defense counsel if applicable',
        status: 'Monitoring'
      }
    ] : [],
    subrogationOpportunities: (isSTP && claim.lossEvent?.faultDetermination === 'Third-party at fault') ? [
      {
        id: `pc-sub-${claim.id}-1`,
        opportunityType: 'Third-Party Auto Liability',
        description: 'Third-party determined at fault. Subrogation recovery may be available against the at-fault party\'s insurer.',
        estimatedRecovery: Math.round(claimAmount * 0.85),
        probability: 'Medium',
        recommendedAction: 'Issue subrogation demand letter to third-party insurer on file',
        status: 'Identified'
      }
    ] : [],
    benchmarkData: {
      cycleTime: {
        current: daysOpen,
        industryAvg: isSTP ? 7 : (isProperty ? 25 : 14),
        carrierAvg: isSTP ? 6 : (isProperty ? 22 : 12),
        variance: 'In Range',
        status: isClosed ? 'Closed' : 'On Track'
      },
      similarClaims: {
        count: 120,
        avgCycleTime: isSTP ? 6 : (isProperty ? 22 : 12),
        avgSettlement: Math.round(claimAmount * 0.95),
        subrogationRate: isAuto ? '28%' : '5%',
        fraudRate: isLiability ? '8%' : '1.5%'
      },
      insights: [
        `Claim is tracking within normal range for ${isSTP ? 'STP' : 'standard'} ${type ? type.replace(/_/g, ' ') : 'P&C'} processing`
      ]
    },
    nextBestActions: isClosed ? [] : [
      {
        id: `pc-nba-${claim.id}-1`,
        priority: 1,
        action: 'Review and Advance Outstanding Requirements',
        description: 'Complete all pending requirements to advance claim through the processing workflow',
        rationale: 'Outstanding requirements are the primary blocker for claim progression',
        urgency: 'This Week',
        agent: 'Next Best Action Agent',
        category: 'Documentation'
      }
    ],
    auditFindings: []
  };
};
const createPCShowcaseClaims = () => {
  const claims = [];

  // ---- CLAIM PC-1: Auto Collision — Fast Track, CLOSED ----
  {
    const createdDate = new Date(NOW.getTime() - 10 * DAY);
    const lossDate = new Date(NOW.getTime() - 12 * DAY);
    const closedDate = new Date(createdDate.getTime() + 5 * DAY);
    const slaDate = new Date(createdDate.getTime() + 7 * DAY);

    const claim = {
      id: 'pc-claim-1', claimNumber: 'CLM-PC-000001', status: ClaimStatus.CLOSED,
      type: PCClaimType.AUTO_COLLISION,
      createdAt: createdDate.toISOString(), updatedAt: closedDate.toISOString(), closedAt: closedDate.toISOString(),
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Rear-end collision at traffic light',
        lossLocation: 'Houston, TX', lossDescription: 'Policyholder vehicle struck from behind at intersection of Main St & Commerce Blvd.',
        weatherConditions: 'Clear', policeReportNumber: 'RPT-2026-04821', faultDetermination: 'Third-party at fault'
      },
      insured: { name: 'Jennifer Williams', dateOfBirth: '1985-03-14', licenseNumber: 'TX-W8842913' },
      claimant: { name: 'Jennifer Williams', relationship: 'Policyholder', contactInfo: { email: 'j.williams@email.com', phone: '713-555-0192' } },
      vehicle: { year: 2022, make: 'Toyota', model: 'Camry', vin: '4T1BF3EK8CU109032', color: 'Silver', mileage: 28400 },
      policy: { policyNumber: 'PA-TX-847291', type: 'Personal Auto', status: 'Active', issueDate: '2021-04-01', coverageLimit: 100000, deductible: 500, owner: 'Jennifer Williams' },
      parties: [
        { id: 'pc-party-1-1', name: 'Jennifer Williams', role: 'Policyholder', source: 'Policy Admin', resState: 'TX', dateOfBirth: '1985-03-14', phone: '713-555-0192', email: 'j.williams@email.com', address: '4521 Oak Forest Dr, Houston, TX 77018', verificationStatus: 'Verified', verificationScore: 98 },
        { id: 'pc-party-1-2', name: 'Derek Nash', role: 'Third Party', source: 'FNOL', resState: 'TX', phone: '713-555-0371', email: 'dnash@email.com', address: '887 Westview Terrace, Houston, TX 77055', verificationStatus: 'Verified', verificationScore: 90 }
      ],
      aiInsights: { riskScore: 12, alerts: [] },
      financial: {
        claimAmount: 4200, deductible: 500, repairEstimate: 4200, salvageValue: 0,
        reserve: 0, amountPaid: 3700, currency: 'USD',
        payments: [{ id: 'pc-pay-1-1', paymentNumber: 'PAY-PC-000001', payeeName: 'Jennifer Williams', benefitAmount: 3700, paymentMethod: 'ACH', status: 'Completed', paymentDate: closedDate.toISOString().split('T')[0] }]
      },
      routing: { type: RoutingType.STP, score: 93, eligible: true, evaluatedAt: new Date(createdDate.getTime() + 5 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: true, minorDamage: true, establishedPolicyholder: true, noFraudIndicators: true } },
      workflow: { fsoCase: 'FSO-PC-000001', currentTask: null, assignedTo: null, daysOpen: 5, sla: { dueDate: slaDate.toISOString(), daysRemaining: 2, atRisk: false } }
    };
    claim.sysId = 'pc-demo-sys-id-1'; claim.fnolNumber = 'FNOL-PC-0000001';
    claim.requirements = generatePCRequirements(claim);
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = generatePCWorkNotes(claim);
    claim.guardianInsights = generatePCGuardianInsights(claim);
    claims.push(claim);
  }

  // ---- CLAIM PC-2: Homeowners — Standard, UNDER_REVIEW ----
  {
    const createdDate = new Date(NOW.getTime() - 18 * DAY);
    const lossDate = new Date(NOW.getTime() - 21 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'pc-claim-2', claimNumber: 'CLM-PC-000002', status: ClaimStatus.UNDER_REVIEW,
      type: PCClaimType.HOMEOWNERS,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 3 * DAY).toISOString(), closedAt: null,
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Severe hailstorm — roof and siding damage',
        lossLocation: 'Nashville, TN', lossDescription: 'Significant roof damage and exterior siding damage from golf-ball size hail during storm event.',
        weatherConditions: 'Severe hailstorm — 2" hail reported by NWS', policeReportNumber: null, faultDetermination: 'Weather event (no fault)'
      },
      insured: { name: 'Robert Thompson', dateOfBirth: '1971-08-22' },
      claimant: { name: 'Robert Thompson', relationship: 'Policyholder', contactInfo: { email: 'r.thompson@email.com', phone: '615-555-0274' } },
      property: { address: '1842 Magnolia Lane, Nashville, TN 37211', type: 'Single Family Residence', yearBuilt: 2003, squareFootage: 2400 },
      policy: { policyNumber: 'HO-TN-523184', type: 'Homeowners', status: 'Active', issueDate: '2018-06-01', coverageLimit: 380000, deductible: 2500, owner: 'Robert Thompson' },
      parties: [
        { id: 'pc-party-2-1', name: 'Robert Thompson', role: 'Policyholder', source: 'Policy Admin', resState: 'TN', dateOfBirth: '1971-08-22', phone: '615-555-0274', email: 'r.thompson@email.com', address: '1842 Magnolia Lane, Nashville, TN 37211', verificationStatus: 'Verified', verificationScore: 96 },
        { id: 'pc-party-2-2', name: 'Laura Thompson', role: 'Co-Insured', source: 'Policy Admin', resState: 'TN', phone: '615-555-0274', email: 'l.thompson@email.com', address: '1842 Magnolia Lane, Nashville, TN 37211', verificationStatus: 'Verified', verificationScore: 95 }
      ],
      aiInsights: { riskScore: 28, alerts: [{ id: 'pc-alert-2-1', severity: 'Low', category: 'Weather Event', title: 'Regional CAT Event', message: 'Multiple claims filed in this zip code for the same storm event', description: 'NWS confirmed severe hail event on the reported date. 18 claims filed in 37211 area code — consistent with documented storm path.', confidence: 92, recommendation: 'Apply CAT event handling — expedite contractor scheduling', timestamp: createdDate.toISOString() }] },
      financial: {
        claimAmount: 34500, deductible: 2500, repairEstimate: 34500, salvageValue: 0,
        reserve: 32000, amountPaid: 0, currency: 'USD', payments: []
      },
      routing: { type: RoutingType.STANDARD, score: 74, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 10 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: true, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: true } },
      workflow: { fsoCase: 'FSO-PC-000002', currentTask: 'Adjuster Inspection', assignedTo: 'Maria Rodriguez', daysOpen: 18, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 5 } }
    };
    claim.sysId = 'pc-demo-sys-id-2'; claim.fnolNumber = 'FNOL-PC-0000002';
    claim.requirements = generatePCRequirements(claim);
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = generatePCWorkNotes(claim);
    claim.guardianInsights = generatePCGuardianInsights(claim);
    claims.push(claim);
  }

  // ---- CLAIM PC-3: Auto Comprehensive (Total Loss / Theft) — PENDING_REQUIREMENTS ----
  {
    const createdDate = new Date(NOW.getTime() - 8 * DAY);
    const lossDate = new Date(NOW.getTime() - 9 * DAY);
    const slaDate = new Date(createdDate.getTime() + 14 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'pc-claim-3', claimNumber: 'CLM-PC-000003', status: ClaimStatus.PENDING_REQUIREMENTS,
      type: PCClaimType.AUTO_COMPREHENSIVE,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 2 * DAY).toISOString(), closedAt: null,
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Vehicle theft — reported to police',
        lossLocation: 'Phoenix, AZ', lossDescription: 'Policyholder vehicle stolen overnight from residential driveway. Police report filed.',
        weatherConditions: 'N/A', policeReportNumber: 'PHX-2026-19472', faultDetermination: 'Theft — no fault'
      },
      insured: { name: 'Michael Chen', dateOfBirth: '1990-11-05', licenseNumber: 'AZ-C4490127' },
      claimant: { name: 'Michael Chen', relationship: 'Policyholder', contactInfo: { email: 'm.chen@email.com', phone: '602-555-0388' } },
      vehicle: { year: 2020, make: 'Tesla', model: 'Model 3', vin: '5YJ3E1EB4LF123456', color: 'Midnight Silver', mileage: 41200, actualCashValue: 38000 },
      policy: { policyNumber: 'PA-AZ-619247', type: 'Personal Auto', status: 'Active', issueDate: '2020-03-15', coverageLimit: 50000, deductible: 1000, owner: 'Michael Chen' },
      parties: [
        { id: 'pc-party-3-1', name: 'Michael Chen', role: 'Policyholder', source: 'Policy Admin', resState: 'AZ', dateOfBirth: '1990-11-05', phone: '602-555-0388', email: 'm.chen@email.com', address: '2210 E Camelback Rd #304, Phoenix, AZ 85016', verificationStatus: 'Verified', verificationScore: 97 }
      ],
      aiInsights: { riskScore: 35, alerts: [{ id: 'pc-alert-3-1', severity: 'Medium', category: 'Total Loss', title: 'Total Loss Threshold Exceeded', message: 'Vehicle ACV likely exceeds repair threshold — total loss processing recommended', description: 'Based on reported vehicle details and market data, the actual cash value indicates this claim should be processed as a total loss.', confidence: 88, recommendation: 'Assign total loss specialist and obtain title documentation', timestamp: createdDate.toISOString() }] },
      financial: {
        claimAmount: 37000, deductible: 1000, repairEstimate: 37000, salvageValue: 3500,
        reserve: 36000, amountPaid: 0, currency: 'USD', payments: []
      },
      routing: { type: RoutingType.STANDARD, score: 68, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 8 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: false, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: true } },
      workflow: { fsoCase: 'FSO-PC-000003', currentTask: 'Await Police Report', assignedTo: 'David Park', daysOpen: 8, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 3 } }
    };
    claim.sysId = 'pc-demo-sys-id-3'; claim.fnolNumber = 'FNOL-PC-0000003';
    claim.requirements = generatePCRequirements(claim);
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = generatePCWorkNotes(claim);
    claim.guardianInsights = generatePCGuardianInsights(claim);
    claims.push(claim);
  }

  // ---- CLAIM PC-4: Auto Liability — SIU Routing, UNDER_REVIEW ----
  {
    const createdDate = new Date(NOW.getTime() - 22 * DAY);
    const lossDate = new Date(NOW.getTime() - 25 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'pc-claim-4', claimNumber: 'CLM-PC-000004', status: ClaimStatus.UNDER_REVIEW,
      type: PCClaimType.AUTO_LIABILITY,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 5 * DAY).toISOString(), closedAt: null,
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Multi-vehicle accident — liability disputed',
        lossLocation: 'Atlanta, GA', lossDescription: 'Three-vehicle accident. Third party alleging our policyholder caused collision. Liability contested. Opposing attorney retained.',
        weatherConditions: 'Light rain, reduced visibility', policeReportNumber: 'ATL-2026-00872', faultDetermination: 'Disputed — under investigation'
      },
      insured: { name: 'James Wilson', dateOfBirth: '1978-04-16', licenseNumber: 'GA-W5531094' },
      claimant: { name: 'James Wilson', relationship: 'Policyholder', contactInfo: { email: 'j.wilson@email.com', phone: '404-555-0517' } },
      vehicle: { year: 2019, make: 'Ford', model: 'F-150', vin: '1FTEW1EP5KFB01234', color: 'Black', mileage: 62000 },
      policy: { policyNumber: 'PA-GA-738156', type: 'Personal Auto', status: 'Active', issueDate: '2017-08-15', coverageLimit: 300000, deductible: 1000, owner: 'James Wilson' },
      parties: [
        { id: 'pc-party-4-1', name: 'James Wilson', role: 'Policyholder', source: 'Policy Admin', resState: 'GA', dateOfBirth: '1978-04-16', phone: '404-555-0517', email: 'j.wilson@email.com', address: '3389 Peachtree Rd NE, Atlanta, GA 30326', verificationStatus: 'Verified', verificationScore: 94 },
        { id: 'pc-party-4-2', name: 'Sandra Kim', role: 'Third Party Claimant', source: 'FNOL', resState: 'GA', phone: '404-555-0892', email: 'sandra.kim@email.com', address: '782 Marietta Blvd NW, Atlanta, GA 30318', verificationStatus: 'Pending', verificationScore: 72 },
        { id: 'pc-party-4-3', name: 'Thomas Brown', role: 'Third Party Claimant', source: 'FNOL', resState: 'GA', phone: '404-555-0134', email: 't.brown@email.com', address: '1104 Cascade Ave SW, Atlanta, GA 30311', verificationStatus: 'Pending', verificationScore: 68 }
      ],
      aiInsights: { riskScore: 72, alerts: [
        { id: 'pc-alert-4-1', severity: 'High', category: 'Liability Dispute', title: 'Contested Liability — Legal Representation', message: 'Third-party has retained legal counsel. Potential bodily injury exposure.', description: 'Opposing attorney demand letter received. Third party alleging neck and back injuries. Medical treatment ongoing. Potential BI exposure $75K-$150K.', confidence: 85, recommendation: 'Assign to senior liability adjuster. Retain defense counsel.', timestamp: createdDate.toISOString() },
        { id: 'pc-alert-4-2', severity: 'Medium', category: 'SIU Review', title: 'Claim Referred to SIU', message: 'SIU review initiated due to timeline inconsistencies in third-party statements', description: 'Conflicting witness statements regarding vehicle positions. SIU referral initiated per claim handling guidelines.', confidence: 78, recommendation: 'SIU investigation ongoing — do not settle pending review', timestamp: new Date(createdDate.getTime() + 3 * DAY).toISOString() }
      ] },
      financial: {
        claimAmount: 125000, deductible: 1000, repairEstimate: 18500, salvageValue: 0,
        reserve: 120000, amountPaid: 0, currency: 'USD', payments: []
      },
      routing: { type: RoutingType.SIU, score: 45, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 20 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: false, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: false } },
      workflow: { fsoCase: 'FSO-PC-000004', currentTask: 'SIU Investigation', assignedTo: 'Lisa Chen', daysOpen: 22, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla < 5 } }
    };
    claim.sysId = 'pc-demo-sys-id-4'; claim.fnolNumber = 'FNOL-PC-0000004';
    claim.requirements = generatePCRequirements(claim);
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = generatePCWorkNotes(claim);
    claim.guardianInsights = generatePCGuardianInsights(claim);
    claims.push(claim);
  }

  // ---- CLAIM PC-5: Commercial Property — Standard, SLA at risk ----
  {
    const createdDate = new Date(NOW.getTime() - 26 * DAY);
    const lossDate = new Date(NOW.getTime() - 28 * DAY);
    const slaDate = new Date(createdDate.getTime() + 30 * DAY);
    const daysToSla = Math.ceil((slaDate - NOW) / DAY);

    const claim = {
      id: 'pc-claim-5', claimNumber: 'CLM-PC-000005', status: ClaimStatus.UNDER_REVIEW,
      type: PCClaimType.COMMERCIAL_PROPERTY,
      createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + 10 * DAY).toISOString(), closedAt: null,
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Kitchen fire — commercial restaurant',
        lossLocation: 'Chicago, IL', lossDescription: 'Commercial kitchen fire causing extensive smoke, heat, and water damage throughout the premises. Fire suppression system activated.',
        weatherConditions: 'N/A', policeReportNumber: 'CPD-2026-FF-0042', faultDetermination: 'Accidental — faulty equipment'
      },
      insured: { name: 'Davidson Restaurant Group LLC', dateOfBirth: null },
      claimant: { name: 'Marcus Davidson', relationship: 'Named Insured / Business Owner', contactInfo: { email: 'm.davidson@davidsonrestaurants.com', phone: '312-555-0748' } },
      property: { address: '840 N Michigan Ave, Chicago, IL 60611', type: 'Commercial Restaurant', yearBuilt: 1998, squareFootage: 4800, businessName: 'Davidson Grille' },
      policy: { policyNumber: 'CP-IL-415892', type: 'Commercial Property', status: 'Active', issueDate: '2022-01-01', coverageLimit: 1200000, deductible: 10000, owner: 'Davidson Restaurant Group LLC' },
      parties: [
        { id: 'pc-party-5-1', name: 'Marcus Davidson', role: 'Policyholder', source: 'Policy Admin', resState: 'IL', phone: '312-555-0748', email: 'm.davidson@davidsonrestaurants.com', address: '840 N Michigan Ave, Chicago, IL 60611', verificationStatus: 'Verified', verificationScore: 95 },
        { id: 'pc-party-5-2', name: 'Davidson Restaurant Group LLC', role: 'Named Insured', source: 'Policy Admin', resState: 'IL', phone: '312-555-0748', email: 'insurance@davidsonrestaurants.com', address: '840 N Michigan Ave, Chicago, IL 60611', verificationStatus: 'Verified', verificationScore: 98 }
      ],
      aiInsights: { riskScore: 55, alerts: [
        { id: 'pc-alert-5-1', severity: 'High', category: 'Business Interruption', title: 'Business Interruption Coverage Active', message: 'Business closed since loss date — BI coverage triggered. Track revenue loss carefully.', description: 'Restaurant has been closed for operations since the fire. Business Interruption coverage activated. Revenue documentation required to calculate BI payment.', confidence: 97, recommendation: 'Request 12 months of revenue records. Assign BI specialist.', timestamp: createdDate.toISOString() },
        { id: 'pc-alert-5-2', severity: 'Medium', category: 'SLA Risk', title: 'SLA Approaching — Complex Claim', message: `SLA deadline in ${daysToSla} days. Multiple coverage components require coordination.`, description: 'This claim involves property damage, business interruption, and equipment breakdown coverage. Complexity may require timeline extension request.', confidence: 90, recommendation: 'Request SLA extension or escalate to supervisor', timestamp: new Date(createdDate.getTime() + 20 * DAY).toISOString() }
      ] },
      financial: {
        claimAmount: 285000, deductible: 10000, repairEstimate: 195000, salvageValue: 0,
        businessInterruptionEstimate: 90000, reserve: 280000, amountPaid: 0, currency: 'USD', payments: []
      },
      routing: { type: RoutingType.STANDARD, score: 62, eligible: false, evaluatedAt: new Date(createdDate.getTime() + 15 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: true, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: true } },
      workflow: { fsoCase: 'FSO-PC-000005', currentTask: 'Await Contractor Estimate', assignedTo: 'Stephanie Lyons', daysOpen: 26, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: daysToSla <= 5 } }
    };
    claim.sysId = 'pc-demo-sys-id-5'; claim.fnolNumber = 'FNOL-PC-0000005';
    claim.requirements = generatePCRequirements(claim);
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = generatePCWorkNotes(claim);
    claim.guardianInsights = generatePCGuardianInsights(claim);
    claims.push(claim);
  }


  // ---- CLAIM PC-6: Commercial Property — STP, CLOSED (IoT-Validated Winter Storm) ----
  {
    const createdDate = new Date(NOW.getTime() - 8 * DAY);
    const lossDate = createdDate;
    const closedDate = new Date(createdDate.getTime() + 4 * 3600000); // approved in 45 min, closed same day
    const slaDate = new Date(createdDate.getTime() + 1 * DAY);

    const claim = {
      id: 'pc-claim-6', claimNumber: 'CLM-PC-000006', status: ClaimStatus.CLOSED,
      type: PCClaimType.COMMERCIAL_PROPERTY,
      createdAt: createdDate.toISOString(), updatedAt: closedDate.toISOString(), closedAt: closedDate.toISOString(),
      lossEvent: {
        dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: 'Winter storm — frozen pipe burst',
        lossLocation: 'Chicago, IL', lossDescription: 'Extreme cold event (-5°F) caused pipe burst in commercial florist storage area. FloodStop Pro IoT sensors triggered immediate detection at 3:45 AM. Emergency mitigation started within 2 hours. Prior claim CLM-2024-012847 — all prevention measures followed.',
        weatherConditions: 'Winter Storm Warning — -5°F, 25 mph winds, NOAA confirmed', policeReportNumber: null, faultDetermination: 'Weather event (no fault)'
      },
      insured: { name: "Kim's Flowers & Gifts", dateOfBirth: null },
      claimant: { name: 'Kim Lee', relationship: 'Named Insured / Business Owner', contactInfo: { email: 'kim@bloomandpetals.com', phone: '503-555-0234' } },
      property: { address: '1847 Main Street, Chicago, IL 60601', type: 'Commercial Florist', yearBuilt: 2010, squareFootage: 2200, businessName: "Kim's Flowers & Gifts" },
      policy: { policyNumber: 'BOP-IL-789456', type: 'Business Owners Policy', status: 'Active', issueDate: '2023-06-01', coverageLimit: 500000, deductible: 5000, owner: "Kim's Flowers & Gifts" },
      parties: [
        { id: 'pc-party-6-1', name: 'Kim Lee', role: 'Policyholder', source: 'Policy Admin', resState: 'IL', dateOfBirth: '1982-03-15', phone: '503-555-0234', email: 'kim@bloomandpetals.com', address: '1847 Main Street, Chicago, IL 60601', verificationStatus: 'Verified', verificationScore: 99 },
        { id: 'pc-party-6-2', name: "Kim's Flowers & Gifts", role: 'Named Insured', source: 'Policy Admin', resState: 'IL', phone: '503-555-0234', email: 'kim@bloomandpetals.com', address: '1847 Main Street, Chicago, IL 60601', verificationStatus: 'Verified', verificationScore: 98 }
      ],
      aiInsights: {
        riskScore: 8,
        alerts: [
          {
            id: 'pc-ai-6-1',
            severity: 'Low',
            category: 'Weather Corroboration',
            title: 'Loss Event Validated — Freeze Timing & Severity Confirmed',
            message: 'NOAA weather data and IoT sensor logs independently corroborate the reported loss event.',
            description: 'Automated analysis cross-referenced NOAA Winter Storm Warning data with IoT sensor readings from FloodStop Pro. Temperature sensor TEMP-BPF-001 recorded -5°F at 02:30 — consistent with the freeze threshold for commercial pipe failure. Water sensor WATER-BPF-002 activated at 03:45, aligning precisely with the reported burst event. Loss timing, temperature severity, and physical sensor evidence are fully corroborated across independent data sources.',
            recommendation: 'No further weather validation required. Freeze timing and severity confirmed. Proceed with STP approval.',
            confidence: 99,
            timestamp: createdDate.toISOString()
          },
          {
            id: 'pc-ai-6-2',
            severity: 'Low',
            category: 'Estimate Validation',
            title: 'No Inflation Indicators Detected — Estimate Within Expected Range',
            message: 'Damage estimate of $19,500 validates against 127 comparable commercial pipe burst claims.',
            description: 'Claimed amount of $19,500 benchmarked against comparable commercial property pipe burst losses in the Midwest (2024–2026 cohort, n=127). Estimate falls within expected range for a florist with refrigerated storage, retail floor, walk-in cooler, and business interruption. No line-item inflation, round-number anomalies, duplicate billing, or cost escalation patterns detected. Inventory loss quantum is consistent with a florist of this size and seasonal stock profile.',
            recommendation: 'Settlement amount validated. No independent appraisal required. Approve as submitted.',
            confidence: 96,
            timestamp: createdDate.toISOString()
          },
          {
            id: 'pc-ai-6-3',
            severity: 'Low',
            category: 'Pattern Analysis',
            title: 'Prior Claim History Supports Authenticity — Prevention Compliance Verified',
            message: 'Insured completed all 4 prevention measures recommended after prior claim CLM-2024-012847.',
            description: 'Prior claim CLM-2024-012847 (January 2024, frozen pipe, $15,000) reviewed and cross-referenced. Post-claim adjuster recommended 4 prevention measures. All 4 independently verified: FloodStop Pro water sensor installed March 2024 (hardware registration confirmed), exposed basement pipes insulated (contractor invoice on file), Business Monitoring enrollment active (telematics data accessible), winterization checklist completed and submitted October 2025. Proactive compliance behavior is statistically inconsistent with fraudulent intent and supports STP Criterion 4.',
            recommendation: 'Prior claim compliance strengthens authenticity. Pattern consistent with a responsible insured who took prevention seriously.',
            confidence: 98,
            timestamp: createdDate.toISOString()
          },
          {
            id: 'pc-ai-6-4',
            severity: 'Low',
            category: 'Agentic Validation',
            title: 'Holistic Risk Profile Complete — 5 Independent Sources Corroborate Loss',
            message: 'Digital agent assembled complete contextual picture from 5 data sources. Fraud score: 8/100.',
            description: 'Automated claims analysis assembled and cross-referenced 5 independent data sources: (1) NOAA Winter Storm Warning — freeze event confirmed for Chicago IL 60601; (2) FloodStop Pro IoT sensor logs — temperature, water leak, and humidity readings timestamped and geo-verified; (3) Mobile FNOL submission — geo-tagged damage photos submitted within hours of sensor alert; (4) Prior claim history and prevention compliance record — behavioral pattern consistent with a low-risk insured; (5) Comparable loss benchmarks — estimate validated against regional peer cohort. All 5 sources independently support the reported loss. Fraud control achieved through context, not suspicion.',
            recommendation: 'STP approved. Complete contextual picture assembled — no human adjuster review required. Approve and schedule ACH payment.',
            confidence: 94,
            timestamp: createdDate.toISOString()
          }
        ]
      },
      financial: {
        claimAmount: 19500, deductible: 5000, repairEstimate: 16500, salvageValue: 0,
        businessInterruptionEstimate: 3000, reserve: 0, amountPaid: 19500, currency: 'USD',
        payments: [{ id: 'pc-pay-6-1', paymentNumber: 'PAY-PC-000006', payeeName: "Kim's Flowers & Gifts", benefitAmount: 19500, paymentMethod: 'ACH', status: 'Completed', paymentDate: new Date(createdDate.getTime() + 2 * DAY).toISOString().split('T')[0] }]
      },
      routing: {
        type: RoutingType.STP, score: 94, eligible: true,
        evaluatedAt: new Date(createdDate.getTime() + 62 * 60000).toISOString(),
        criteria: { coverageActive: true, clearLiability: true, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: true },
        stpDetails: {
          iotValidated: true, weatherCorroborated: true, priorClaimCompliance: true,
          confidenceScore: 94, approvalDuration: '45 minutes',
          stpCriteria: [
            { criterion: 'Storm Alert Sent', met: true, details: 'Winter storm alert sent to insured 48 hours before incident' },
            { criterion: 'Risk Documentation', met: true, details: 'Property photos documented vulnerable pipe locations from prior claim', priorClaimRef: 'CLM-2024-012847' },
            { criterion: 'IoT Monitoring', met: true, details: 'FloodStop Pro water sensor detected leak at 3:45 AM', sensorVerified: true },
            { criterion: 'Prevention Compliance', met: true, details: 'All recommended measures followed post prior claim — insulation, sensor install, winterization checklist', complianceScore: 100 },
            { criterion: 'Rapid Response', met: true, details: 'Emergency mitigation began within 2 hours of detection', responseTime: '1 hour 45 minutes' }
          ]
        }
      },
      workflow: { fsoCase: 'FSO-PC-000006', currentTask: null, assignedTo: null, daysOpen: 0, sla: { dueDate: slaDate.toISOString(), daysRemaining: 0, atRisk: false } }
    };
    claim.sysId = 'pc-demo-sys-id-6'; claim.fnolNumber = 'FNOL-PC-0000006';
    claim.requirements = [
      {
        id: 'pc-claim-6-req-1', level: 'claim', type: PCRequirementType.CLAIMANT_STATEMENT,
        name: 'FNOL & Loss Statement',
        description: 'Mobile FNOL submitted with geo-tagged damage photos and signed loss statement within 2 hours of sensor alert',
        status: RequirementStatus.SATISFIED, isMandatory: true,
        dueDate: new Date(createdDate.getTime() + 1 * DAY).toISOString(),
        satisfiedDate: new Date(createdDate.getTime() + 30 * 60000).toISOString(),
        documents: [
          { id: 'doc-pc6-1a', name: 'mobile_fnol_submission.pdf' },
          { id: 'doc-pc6-1b', name: 'geo_tagged_damage_photos.zip' }
        ],
        metadata: { confidenceScore: 0.98, channel: 'mobile_app' }
      },
      {
        id: 'pc-claim-6-req-2', level: 'claim', type: PCRequirementType.DAMAGE_PHOTOS,
        name: 'IoT Sensor Validation & Damage Documentation',
        description: 'FloodStop Pro sensor logs (TEMP-BPF-001 at -5°F, WATER-BPF-002 water alert at 03:45) independently corroborate loss event alongside mobile damage photos',
        status: RequirementStatus.SATISFIED, isMandatory: true,
        dueDate: new Date(createdDate.getTime() + 2 * DAY).toISOString(),
        satisfiedDate: new Date(createdDate.getTime() + 1 * 3600000).toISOString(),
        documents: [
          { id: 'doc-pc6-2a', name: 'iot_sensor_log_TEMP-BPF-001.csv' },
          { id: 'doc-pc6-2b', name: 'iot_sensor_log_WATER-BPF-002.csv' },
          { id: 'doc-pc6-2c', name: 'damage_photos_interior.zip' }
        ],
        metadata: { confidenceScore: 0.99, sensorVerified: true, noaaCorroborated: true }
      },
      {
        id: 'pc-claim-6-req-3', level: 'claim', type: PCRequirementType.CONTRACTOR_ESTIMATE,
        name: 'Emergency Mitigation & Repair Estimate',
        description: 'Licensed contractor on-site estimate covering water remediation, pipe repair, walk-in cooler damage, and business interruption — validated against 127 comparable peer claims',
        status: RequirementStatus.SATISFIED, isMandatory: true,
        dueDate: new Date(createdDate.getTime() + 3 * DAY).toISOString(),
        satisfiedDate: new Date(createdDate.getTime() + 2 * 3600000).toISOString(),
        documents: [
          { id: 'doc-pc6-3', name: 'emergency_mitigation_estimate.pdf' }
        ],
        metadata: { confidenceScore: 0.96, estimateAmount: 16500 }
      },
      {
        id: 'pc-claim-6-req-4', level: 'policy', type: PCRequirementType.COVERAGE_VERIFICATION,
        name: 'Coverage & Policy Verification',
        description: 'BOP-IL-789456 active at date of loss. Commercial property, business interruption, and inventory coverage confirmed in Policy Admin System',
        status: RequirementStatus.SATISFIED, isMandatory: true,
        dueDate: new Date(createdDate.getTime() + 1 * DAY).toISOString(),
        satisfiedDate: new Date(createdDate.getTime() + 15 * 60000).toISOString(),
        documents: [],
        metadata: { verificationSource: 'Policy Admin System', policyNumber: 'BOP-IL-789456' }
      },
      {
        id: 'pc-claim-6-req-5', level: 'party', type: PCRequirementType.PROOF_OF_IDENTITY,
        name: 'Claimant Identity Verification',
        description: 'Kim Lee — Government-issued photo ID verified. Identity score 99/100. Pre-verified returning customer.',
        status: RequirementStatus.SATISFIED, isMandatory: true,
        dueDate: new Date(createdDate.getTime() + 2 * DAY).toISOString(),
        satisfiedDate: new Date(createdDate.getTime() + 15 * 60000).toISOString(),
        documents: [
          { id: 'doc-pc6-5', name: 'identity_verification.pdf' }
        ],
        metadata: { confidenceScore: 0.99 }
      },
    ];
    claim.timeline = generatePCTimeline(claim);
    claim.workNotes = [
      { sys_id: 'wn-pc-claim-6-4', element: 'work_notes', element_id: 'pc-demo-sys-id-6', name: 'x_dxcis_claims_a_0_claims_fnol', value: 'STP completed. All 5 criteria validated — 94% confidence. Claim approved in 45 minutes. ACH payment of $19,500 scheduled. Post-settlement audit queued. Claim closed.', sys_created_on: new Date(createdDate.getTime() + 2.5 * 3600000).toISOString().replace('T', ' ').substring(0, 19), sys_created_by: 'digital.agent' },
      { sys_id: 'wn-pc-claim-6-3', element: 'work_notes', element_id: 'pc-demo-sys-id-6', name: 'x_dxcis_claims_a_0_claims_fnol', value: 'Fraud analysis complete. Claim aligns with freeze timing and severity. No inflation indicators detected.', sys_created_on: new Date(createdDate.getTime() + 2 * 3600000).toISOString().replace('T', ' ').substring(0, 19), sys_created_by: 'fraud.analysis' },
      { sys_id: 'wn-pc-claim-6-2', element: 'work_notes', element_id: 'pc-demo-sys-id-6', name: 'x_dxcis_claims_a_0_claims_fnol', value: 'Prior claim CLM-2024-012847 reviewed. Insured followed all prevention recommendations: FloodStop Pro sensor installed, exposed pipes insulated, winterization checklist completed. Prevention compliance 100%. STP criteria 2 and 4 confirmed.', sys_created_on: new Date(createdDate.getTime() + 1.5 * 3600000).toISOString().replace('T', ' ').substring(0, 19), sys_created_by: 'digital.agent' },
      { sys_id: 'wn-pc-claim-6-1', element: 'work_notes', element_id: 'pc-demo-sys-id-6', name: 'x_dxcis_claims_a_0_claims_fnol', value: 'FNOL received via mobile app with damage photos. IoT data: TEMP-BPF-001 recorded -5°F at 02:30, WATER-BPF-002 activated at 03:45 (water leak), HUMID-BPF-003 spike at 04:00. NOAA confirms Winter Storm Warning for Chicago IL. STP evaluation initiated.', sys_created_on: new Date(createdDate.getTime() + 0.5 * 3600000).toISOString().replace('T', ' ').substring(0, 19), sys_created_by: 'digital.agent' }
    ];
    claim.guardianInsights = generatePCGuardianInsights(claim);
    claims.push(claim);
  }

  return claims;
};

// ============================================================
// Generate 10 seeded P&C claims
// ============================================================
const PC_TYPES = [PCClaimType.AUTO_COLLISION, PCClaimType.AUTO_COLLISION, PCClaimType.HOMEOWNERS, PCClaimType.AUTO_COMPREHENSIVE, PCClaimType.AUTO_LIABILITY, PCClaimType.COMMERCIAL_PROPERTY];
const CAUSE_MAP = {
  [PCClaimType.AUTO_COLLISION]: 'Vehicle collision',
  [PCClaimType.AUTO_COMPREHENSIVE]: 'Comprehensive loss (theft/weather)',
  [PCClaimType.HOMEOWNERS]: 'Property damage — wind/hail/water',
  [PCClaimType.COMMERCIAL_PROPERTY]: 'Commercial property loss',
  [PCClaimType.AUTO_LIABILITY]: 'Liability claim — third party',
  [PCClaimType.WORKERS_COMP]: 'Workplace injury'
};

const generateSeededPCClaim = (index, isFT) => {
  const createdDate = seededDate(new Date(NOW.getTime() - 28 * DAY), new Date(NOW.getTime() - 1 * DAY));
  const lossDate = seededDate(new Date(createdDate.getTime() - 5 * DAY), createdDate);
  const claimType = seededPick(PC_TYPES);
  const claimantName = seededName();
  const policyNumber = `PA-${seededPick(STATES)}-${Math.floor(seeded() * 900000 + 100000)}`;
  const claimNumber = `CLM-PC-${String(index).padStart(6, '0')}`;
  const claimAmount = claimType === PCClaimType.COMMERCIAL_PROPERTY
    ? Math.floor(seeded() * 200000 + 50000)
    : Math.floor(seeded() * 30000 + 2000);
  const state = seededPick(STATES);
  const vehicleMake = seededPick(VEHICLE_MAKES);

  const statusOptions = isFT
    ? [ClaimStatus.CLOSED, ClaimStatus.CLOSED, ClaimStatus.APPROVED]
    : [ClaimStatus.NEW, ClaimStatus.UNDER_REVIEW, ClaimStatus.UNDER_REVIEW, ClaimStatus.PENDING_REQUIREMENTS, ClaimStatus.APPROVED];
  const status = seededPick(statusOptions);
  const isClosed = status === ClaimStatus.CLOSED;
  const closedDate = isClosed ? new Date(createdDate.getTime() + (isFT ? 5 : 20) * DAY) : null;
  const daysOpen = Math.floor(((isClosed ? closedDate : NOW) - createdDate) / DAY);
  const slaDays = isFT ? 7 : (claimType === PCClaimType.COMMERCIAL_PROPERTY ? 30 : 14);
  const slaDate = new Date(createdDate.getTime() + slaDays * DAY);
  // STP claims are evaluated within minutes — use the STP evaluation time as the effective
  // completion date so daysRemaining is always positive (never negative) for processed STP claims.
  const stpCompletedAt = isFT ? new Date(createdDate.getTime() + 5 * 60000) : null;
  const effectiveCompletionDate = closedDate || stpCompletedAt;
  const daysToSla = effectiveCompletionDate
    ? Math.ceil((slaDate - effectiveCompletionDate) / DAY)
    : Math.ceil((slaDate - NOW) / DAY);

  const claim = {
    id: `pc-claim-${index}`, claimNumber, status, type: claimType,
    createdAt: createdDate.toISOString(), updatedAt: new Date(createdDate.getTime() + seeded() * 12 * 3600000).toISOString(), closedAt: isClosed ? closedDate.toISOString() : null,
    lossEvent: {
      dateOfLoss: lossDate.toISOString().split('T')[0], causeOfLoss: CAUSE_MAP[claimType],
      lossLocation: `${seededPick(['Atlanta', 'Dallas', 'Denver', 'Seattle', 'Miami', 'Phoenix', 'Detroit', 'Portland'])}, ${state}`,
      lossDescription: `${CAUSE_MAP[claimType]} reported by policyholder.`,
      weatherConditions: seededPick(['Clear', 'Rain', 'Wind', 'Hail', 'N/A']),
      policeReportNumber: seeded() > 0.4 ? `RPT-${state}-${Math.floor(seeded() * 90000 + 10000)}` : null,
      faultDetermination: isFT ? 'Third-party at fault' : seededPick(['Under investigation', 'Disputed', 'No fault', 'Policyholder at fault'])
    },
    insured: { name: claimantName, dateOfBirth: seededDate(new Date(1965, 0, 1), new Date(1995, 11, 31)).toISOString().split('T')[0] },
    claimant: { name: claimantName, relationship: 'Policyholder', contactInfo: { email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`, phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}` } },
    vehicle: claimType === PCClaimType.AUTO_COLLISION || claimType === PCClaimType.AUTO_COMPREHENSIVE || claimType === PCClaimType.AUTO_LIABILITY
      ? { year: Math.floor(seeded() * 10 + 2014), make: vehicleMake, model: VEHICLE_MODELS[vehicleMake], vin: `1DEMO${Math.floor(seeded() * 9e10)}`, color: seededPick(['White', 'Black', 'Silver', 'Blue', 'Red']), mileage: Math.floor(seeded() * 80000 + 10000) }
      : null,
    policy: { policyNumber, type: claimType === PCClaimType.HOMEOWNERS ? 'Homeowners' : claimType === PCClaimType.COMMERCIAL_PROPERTY ? 'Commercial Property' : 'Personal Auto', status: 'Active', issueDate: seededDate(new Date(2018, 0, 1), new Date(2023, 11, 31)).toISOString().split('T')[0], coverageLimit: claimAmount * 8, deductible: seededPick([500, 1000, 2500]), owner: claimantName },
    parties: [
      { id: `pc-party-${index}-1`, name: claimantName, role: 'Policyholder', source: 'Policy Admin', resState: state, phone: `${Math.floor(seeded() * 900 + 100)}-555-${Math.floor(seeded() * 9000 + 1000)}`, email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com`, address: `${Math.floor(seeded() * 9999)} Main St, Anytown, ${state} ${Math.floor(seeded() * 90000 + 10000)}`, verificationStatus: 'Verified', verificationScore: isFT ? 97 : 82 }
    ],
    aiInsights: { riskScore: isFT ? Math.floor(seeded() * 20 + 10) : Math.floor(seeded() * 35 + 30), alerts: isFT ? [] : (seeded() > 0.5 ? [{ id: `pc-alert-${index}-1`, severity: 'Medium', category: 'Review', title: 'Manual Review Required', message: 'Claim requires standard manual review', description: 'One or more claim criteria require adjuster review.', confidence: 75, recommendation: 'Assign to adjuster queue', timestamp: createdDate.toISOString() }] : []) },
    financial: {
      claimAmount, deductible: seededPick([500, 1000, 2500]),
      repairEstimate: claimAmount, salvageValue: isFT && isClosed ? Math.floor(claimAmount * 0.08) : 0,
      reserve: isClosed ? 0 : Math.floor(claimAmount * 0.9),
      amountPaid: isClosed ? claimAmount - seededPick([500, 1000, 2500]) : 0, currency: 'USD',
      payments: isClosed ? [{ id: `pc-pay-${index}-1`, paymentNumber: `PAY-PC-${String(index).padStart(6, '0')}`, payeeName: claimantName, benefitAmount: claimAmount - 1000, paymentMethod: seeded() > 0.5 ? 'ACH' : 'Check', status: 'Completed', paymentDate: closedDate?.toISOString().split('T')[0] }] : []
    },
    routing: isFT
      ? { type: RoutingType.STP, score: Math.floor(seeded() * 8 + 88), eligible: true, evaluatedAt: new Date(createdDate.getTime() + 5 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: true, minorDamage: true, establishedPolicyholder: true, noFraudIndicators: true } }
      : { type: seeded() > 0.9 ? RoutingType.SIU : RoutingType.STANDARD, score: Math.floor(seeded() * 20 + 50), eligible: false, evaluatedAt: new Date(createdDate.getTime() + 10 * 60000).toISOString(), criteria: { coverageActive: true, clearLiability: seeded() > 0.4, minorDamage: false, establishedPolicyholder: true, noFraudIndicators: seeded() > 0.1 } },
    workflow: { fsoCase: `FSO-${claimNumber}`, currentTask: isClosed ? null : seededPick(['Adjuster Review', 'Estimate Review', 'Liability Review', 'SIU Review']), assignedTo: isClosed ? null : seededPick(['Maria Rodriguez', 'David Park', 'Lisa Chen', 'John Adjuster']), daysOpen, sla: { dueDate: slaDate.toISOString(), daysRemaining: daysToSla, atRisk: !isClosed && daysToSla < 3 } }
  };
  claim.sysId = `pc-demo-sys-id-${index}`; claim.fnolNumber = `FNOL-PC-${String(index).padStart(7, '0')}`;
  claim.requirements = generatePCRequirements(claim);
  claim.timeline = generatePCTimeline(claim);
  claim.workNotes = generatePCWorkNotes(claim);
  claim.guardianInsights = generatePCGuardianInsights(claim);
  return claim;
};

// ============================================================
// Export
// ============================================================
export const generatePCDemoClaims = () => {
  const showcaseClaims = createPCShowcaseClaims();
  const ftIndices = [7, 10, 13];
  const seededClaims = [];
  for (let i = 7; i <= 16; i++) {
    seededClaims.push(generateSeededPCClaim(i, ftIndices.includes(i)));
  }
  const all = [...showcaseClaims, ...seededClaims];
  all.forEach(c => { c.guardianInsights = generatePCGuardianInsights(c); });
  return all;
};

let cachedPCDemoData = null;

export const getPCDemoData = () => {
  if (!cachedPCDemoData) {
    cachedPCDemoData = { claims: generatePCDemoClaims() };
  }
  return cachedPCDemoData;
};

export default { claims: getPCDemoData().claims };
