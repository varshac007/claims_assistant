/**
 * Travel Demo Data Generator
 *
 * Travel Insurance Claims demo dataset:
 * - 5 hand-crafted showcase claims
 * - 10 seeded claims with varied travel loss types
 * - Fast Track routing (~35% of claims)
 * - Trip Cancellation, Medical Emergency, Baggage Loss, Flight Delay, Travel Accident
 */

import { ClaimStatus, RoutingType, RequirementStatus } from '../types/claim.types';

// Travel Claim Types
export const TravelClaimType = {
  TRIP_CANCELLATION: 'trip_cancellation',
  TRIP_INTERRUPTION: 'trip_interruption',
  MEDICAL_EMERGENCY: 'medical_emergency',
  BAGGAGE_LOSS: 'baggage_loss',
  BAGGAGE_DELAY: 'baggage_delay',
  FLIGHT_DELAY: 'flight_delay',
  TRAVEL_ACCIDENT: 'travel_accident'
};

// Travel Requirement Types
export const TravelRequirementType = {
  CLAIMANT_STATEMENT: 'claimant_statement',
  PROOF_OF_IDENTITY: 'proof_of_identity',
  TRAVEL_ITINERARY: 'travel_itinerary',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  CANCELLATION_NOTICE: 'cancellation_notice',
  MEDICAL_REPORT: 'medical_report',
  HOSPITAL_BILLS: 'hospital_bills',
  BAGGAGE_REPORT: 'baggage_report',
  RECEIPTS: 'receipts',
  AIRLINE_CONFIRMATION: 'airline_confirmation',
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

const seeded = createSeededRandom(77); // Unique seed for Travel

const seededDate = (start, end) =>
  new Date(start.getTime() + seeded() * (end.getTime() - start.getTime()));

const seededPick = (arr) => arr[Math.floor(seeded() * arr.length)];

const FIRST_NAMES = ['Alice', 'Brian', 'Carmen', 'David', 'Elena', 'Frank', 'Grace', 'Henry', 'Isabella', 'Jack', 'Kira', 'Liam', 'Mia', 'Noah', 'Olivia'];
const LAST_NAMES = ['Adams', 'Baker', 'Carter', 'Diaz', 'Edwards', 'Foster', 'Green', 'Hall', 'Irwin', 'Jones', 'Kim', 'Lopez', 'Morgan', 'Nguyen', 'Owens'];
const DESTINATIONS = ['Paris, France', 'Tokyo, Japan', 'Cancun, Mexico', 'Rome, Italy', 'Bali, Indonesia', 'London, UK', 'Sydney, Australia', 'Dubai, UAE', 'New York, USA', 'Bangkok, Thailand'];
const AIRLINES = ['Delta Airlines', 'United Airlines', 'American Airlines', 'British Airways', 'Air France', 'Lufthansa', 'Emirates', 'Singapore Airlines'];
const COMPANY_CODES = ['BLM', 'ALI', 'GLP', 'NWL', 'FST'];
const STATES = ['CA', 'TX', 'FL', 'NY', 'IL', 'GA', 'OH', 'WA', 'AZ', 'CO'];

const seededName = () => `${seededPick(FIRST_NAMES)} ${seededPick(LAST_NAMES)}`;

const NOW = new Date();
const DAY = 86400000;

// ============================================================
// Travel Requirements Generator
// ============================================================
const generateTravelRequirements = (claim) => {
  const requirements = [];
  const createdAtDate = new Date(claim.createdAt);
  const isFT = claim.routing?.type === RoutingType.STP;
  const type = claim.type;
  const isMedical = type === TravelClaimType.MEDICAL_EMERGENCY || type === TravelClaimType.TRAVEL_ACCIDENT;
  const isBaggage = type === TravelClaimType.BAGGAGE_LOSS || type === TravelClaimType.BAGGAGE_DELAY;
  const isCancellation = type === TravelClaimType.TRIP_CANCELLATION || type === TravelClaimType.TRIP_INTERRUPTION;
  const isDelay = type === TravelClaimType.FLIGHT_DELAY;

  requirements.push({
    id: `${claim.id}-req-1`, level: 'claim', type: TravelRequirementType.CLAIMANT_STATEMENT,
    name: 'Claimant Statement of Loss', description: 'Signed written statement describing the travel incident and losses incurred',
    status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 5 * DAY).toISOString(),
    satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 1 * DAY).toISOString() : null,
    documents: isFT ? [{ id: `doc-${claim.id}-1`, name: 'claimant_statement.pdf' }] : [],
    metadata: { confidenceScore: isFT ? 0.95 : 0.78 }
  });

  requirements.push({
    id: `${claim.id}-req-2`, level: 'claim', type: TravelRequirementType.TRAVEL_ITINERARY,
    name: 'Travel Itinerary', description: 'Complete travel itinerary including all booked flights, hotels, and tours',
    status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 5 * DAY).toISOString(),
    satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 1 * DAY).toISOString() : null,
    documents: isFT ? [{ id: `doc-${claim.id}-2`, name: 'travel_itinerary.pdf' }] : [],
    metadata: { confidenceScore: isFT ? 0.97 : null }
  });

  if (isMedical) {
    requirements.push({
      id: `${claim.id}-req-3`, level: 'claim', type: TravelRequirementType.MEDICAL_REPORT,
      name: 'Physician Medical Report', description: 'Official medical report from treating physician or hospital detailing diagnosis and treatment',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 10 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 3 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-3`, name: 'medical_report.pdf' }] : [],
      metadata: { confidenceScore: isFT ? 0.94 : null }
    });

    requirements.push({
      id: `${claim.id}-req-4`, level: 'claim', type: TravelRequirementType.HOSPITAL_BILLS,
      name: 'Hospital / Medical Bills', description: 'Itemized medical bills and receipts for all treatment and medications',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 14 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 5 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-4`, name: 'hospital_bills.pdf' }] : [],
      metadata: { estimateAmount: isFT ? claim.financial?.claimAmount : null }
    });
  }

  if (isBaggage) {
    requirements.push({
      id: `${claim.id}-req-3`, level: 'claim', type: TravelRequirementType.BAGGAGE_REPORT,
      name: 'Airline Baggage Report', description: 'Property Irregularity Report (PIR) filed with the airline at the destination',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 3 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 1 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-3`, name: 'baggage_pir.pdf' }] : [],
      metadata: { reportNumber: isFT ? `PIR-${claim.id.toUpperCase()}` : null }
    });

    requirements.push({
      id: `${claim.id}-req-4`, level: 'claim', type: TravelRequirementType.RECEIPTS,
      name: 'Receipts for Lost Items', description: 'Proof of purchase receipts or ownership documentation for claimed items',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: false,
      dueDate: new Date(createdAtDate.getTime() + 7 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 2 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-4`, name: 'item_receipts.pdf' }] : [],
      metadata: {}
    });
  }

  if (isCancellation) {
    requirements.push({
      id: `${claim.id}-req-3`, level: 'claim', type: TravelRequirementType.CANCELLATION_NOTICE,
      name: 'Cancellation / Interruption Notice', description: 'Official cancellation notice from airline, hotel, or tour operator with reason stated',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 5 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 2 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-3`, name: 'cancellation_notice.pdf' }] : [],
      metadata: {}
    });

    requirements.push({
      id: `${claim.id}-req-4`, level: 'claim', type: TravelRequirementType.RECEIPTS,
      name: 'Non-Refundable Cost Receipts', description: 'Itemized receipts for all non-refundable trip costs (flights, hotels, tours)',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 7 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 3 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-4`, name: 'trip_receipts.pdf' }] : [],
      metadata: { totalNonRefundable: isFT ? claim.financial?.claimAmount : null }
    });
  }

  if (isDelay) {
    requirements.push({
      id: `${claim.id}-req-3`, level: 'claim', type: TravelRequirementType.AIRLINE_CONFIRMATION,
      name: 'Airline Delay Confirmation', description: 'Official written confirmation from the airline stating delay duration and reason',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 3 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 1 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-3`, name: 'airline_delay_letter.pdf' }] : [],
      metadata: { delayHours: claim.policy?.delayHours || 6 }
    });

    requirements.push({
      id: `${claim.id}-req-4`, level: 'claim', type: TravelRequirementType.RECEIPTS,
      name: 'Additional Expense Receipts', description: 'Receipts for meals, accommodation, and transport incurred due to delay',
      status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.IN_REVIEW, isMandatory: true,
      dueDate: new Date(createdAtDate.getTime() + 5 * DAY).toISOString(),
      satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 2 * DAY).toISOString() : null,
      documents: isFT ? [{ id: `doc-${claim.id}-4`, name: 'delay_expenses.pdf' }] : [],
      metadata: {}
    });
  }

  requirements.push({
    id: `${claim.id}-req-cov`, level: 'policy', type: TravelRequirementType.COVERAGE_VERIFICATION,
    name: 'Policy Coverage Verification', description: 'Verify active coverage at date of travel, applicable limits and exclusions',
    status: RequirementStatus.SATISFIED, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 2 * DAY).toISOString(),
    satisfiedDate: new Date(createdAtDate.getTime() + 2 * 3600000).toISOString(),
    documents: [],
    metadata: { verificationSource: 'Policy Admin System', policyNumber: claim.policy.policyNumber }
  });

  requirements.push({
    id: `${claim.id}-req-id`, level: 'party', type: TravelRequirementType.PROOF_OF_IDENTITY,
    name: 'Traveler Identity Verification', description: "Government-issued photo ID — passport or driver's license",
    status: isFT ? RequirementStatus.SATISFIED : RequirementStatus.PENDING, isMandatory: true,
    dueDate: new Date(createdAtDate.getTime() + 7 * DAY).toISOString(),
    satisfiedDate: isFT ? new Date(createdAtDate.getTime() + 1 * DAY).toISOString() : null,
    documents: isFT ? [{ id: `doc-${claim.id}-id`, name: 'passport_copy.pdf' }] : [],
    metadata: { confidenceScore: isFT ? 0.96 : null }
  });

  return requirements;
};

// ============================================================
// Travel Timeline Generator
// ============================================================
const generateTravelTimeline = (claim) => {
  const events = [];
  const base = new Date(claim.createdAt).getTime();
  const isFT = claim.routing?.type === RoutingType.STP;

  events.push({ id: `${claim.id}-evt-1`, timestamp: claim.createdAt, type: 'claim.created', source: 'portal', user: { name: 'System', role: 'system' }, description: 'Travel claim submitted via online portal', metadata: { channel: 'traveler_portal' } });
  events.push({ id: `${claim.id}-evt-2`, timestamp: new Date(base + 3 * 60000).toISOString(), type: 'coverage.verified', source: 'policy', user: { name: 'System', role: 'system' }, description: 'Travel policy coverage verified in Policy Admin system', metadata: { policyNumber: claim.policy.policyNumber, status: 'active' } });

  if (isFT) {
    events.push({ id: `${claim.id}-evt-3`, timestamp: new Date(base + 8 * 60000).toISOString(), type: 'routing.fasttrack', source: 'routing', user: { name: 'Routing Engine', role: 'system' }, description: 'Claim qualified for STP (Straight Through Processing)', metadata: { score: claim.routing.score, eligible: true } });
    events.push({ id: `${claim.id}-evt-4`, timestamp: new Date(base + 15 * 60000).toISOString(), type: 'documents.verified', source: 'idp', user: { name: 'IDP Service', role: 'external' }, description: 'Travel documents verified and classified by IDP', metadata: { documentsProcessed: 3 } });
  } else {
    events.push({ id: `${claim.id}-evt-3`, timestamp: new Date(base + 12 * 60000).toISOString(), type: 'adjuster.assigned', source: 'routing', user: { name: 'Assignment Engine', role: 'system' }, description: 'Travel claims specialist assigned for review', metadata: { assignedTo: claim.workflow?.assignedTo } });
  }

  events.push({ id: `${claim.id}-evt-5`, timestamp: new Date(base + 20 * 60000).toISOString(), type: 'requirements.generated', source: 'requirements', user: { name: 'Decision Table Engine', role: 'system' }, description: `${claim.requirements?.length || 3} requirements generated for this claim`, metadata: {} });

  return events;
};

// ============================================================
// Travel Work Notes Generator
// ============================================================
const generateTravelWorkNotes = (claim) => {
  const createdAtDate = new Date(claim.createdAt);
  const type = claim.type;

  const notesByType = {
    [TravelClaimType.TRIP_CANCELLATION]: [
      'Trip cancellation claim received. Verifying reason for cancellation against covered perils in policy.',
      'Cancellation notice from carrier received. Calculating non-refundable costs based on submitted receipts.',
      'Policy covers cancellation due to illness. Medical documentation reviewed and confirmed.'
    ],
    [TravelClaimType.TRIP_INTERRUPTION]: [
      'Trip interruption claim logged. Traveler was mid-journey when covered event occurred.',
      'Additional accommodation and return flight costs calculated. Receipts match submitted documentation.',
      'Claim within policy limits. Proceeding to payment approval.'
    ],
    [TravelClaimType.MEDICAL_EMERGENCY]: [
      'Emergency medical claim received. Traveler was hospitalized abroad. High priority review.',
      'Hospital bills reviewed. Treatment was medically necessary per physician report.',
      'Translation of foreign medical documents completed. Coordinating with hospital billing for direct payment.'
    ],
    [TravelClaimType.BAGGAGE_LOSS]: [
      'Baggage loss claim submitted. PIR from airline received and validated.',
      'Item list reviewed. High-value items require additional proof of ownership documentation.',
      'Depreciation schedule applied per policy terms. Settlement amount calculated.'
    ],
    [TravelClaimType.BAGGAGE_DELAY]: [
      'Baggage delay claim received. Airline confirmed delay exceeded policy threshold of 6 hours.',
      'Emergency purchase receipts reviewed. Amounts within per-day allowance.',
      'All receipts validated. Payment authorized for essential item purchases.'
    ],
    [TravelClaimType.FLIGHT_DELAY]: [
      'Flight delay claim received. Delay confirmed by airline at over 6 hours.',
      'Meal and hotel receipts reviewed. All expenses align with reasonable costs for layover location.',
      'Expenses within policy sublimit. Approved for reimbursement.'
    ],
    [TravelClaimType.TRAVEL_ACCIDENT]: [
      'Travel accident claim filed. Incident occurred during covered trip period.',
      'Medical report and accident documentation reviewed. Injuries consistent with reported incident.',
      'Claim assessed under accidental injury benefit. Coordinating with attending physician for final report.'
    ]
  };

  const notes = notesByType[type] || notesByType[TravelClaimType.TRIP_CANCELLATION];

  return notes.map((text, i) => ({
    id: `${claim.id}-note-${i + 1}`,
    timestamp: new Date(createdAtDate.getTime() + (i + 1) * 2 * 3600000).toISOString(),
    author: { name: 'Sarah Thompson', role: 'Travel Claims Examiner' },
    text,
    type: 'internal'
  }));
};

// ============================================================
// Hand-crafted showcase claims
// ============================================================
const NOW_MS = NOW.getTime();

const showcaseClaims = [
  {
    id: 'trv-001',
    claimNumber: 'TRV-2025-001847',
    status: ClaimStatus.IN_REVIEW,
    type: TravelClaimType.TRIP_CANCELLATION,
    submissionDate: new Date(NOW_MS - 3 * DAY).toISOString(),
    createdAt: new Date(NOW_MS - 3 * DAY).toISOString(),
    insured: { name: 'Emily Hartwell', ssn: '***-**-4821', dob: '1985-06-12', address: { street: '742 Maple Ave', city: 'Austin', state: 'TX', zip: '78701' } },
    policy: { policyNumber: 'TRV-POL-7741', policyType: 'Comprehensive Travel', coverageType: 'Annual Multi-Trip', issueDate: '2024-11-01', expiryDate: '2025-10-31', premium: 380, destination: 'Rome, Italy' },
    claimant: { name: 'Emily Hartwell', relationship: 'Insured', phone: '(512) 555-0183', email: 'emily.hartwell@email.com' },
    financial: { claimAmount: 4250, paidAmount: 0, reserveAmount: 4500, currency: 'USD' },
    routing: { type: RoutingType.COMPLEX, score: 62, assignedTo: 'Sarah Thompson', assignedDate: new Date(NOW_MS - 2 * DAY).toISOString() },
    workflow: { assignedTo: 'Sarah Thompson', slaDate: new Date(NOW_MS + 7 * DAY).toISOString(), currentTask: 'Review cancellation documentation' },
    aiInsights: { riskScore: 28, anomalies: [], verificationConfidence: 0.91 },
    syncStatus: { cma: 'synced', policyAdmin: 'synced', fso: 'synced', dms: 'synced' }
  },
  {
    id: 'trv-002',
    claimNumber: 'TRV-2025-001912',
    status: ClaimStatus.OPEN,
    type: TravelClaimType.MEDICAL_EMERGENCY,
    submissionDate: new Date(NOW_MS - 6 * DAY).toISOString(),
    createdAt: new Date(NOW_MS - 6 * DAY).toISOString(),
    insured: { name: 'Marcus Chen', ssn: '***-**-3309', dob: '1972-03-28', address: { street: '211 Oak Street', city: 'San Francisco', state: 'CA', zip: '94102' } },
    policy: { policyNumber: 'TRV-POL-5529', policyType: 'Premium Travel', coverageType: 'Single Trip', issueDate: '2025-01-10', expiryDate: '2025-01-25', premium: 210, destination: 'Bangkok, Thailand' },
    claimant: { name: 'Marcus Chen', relationship: 'Insured', phone: '(415) 555-0271', email: 'marcus.chen@email.com' },
    financial: { claimAmount: 18750, paidAmount: 0, reserveAmount: 20000, currency: 'USD' },
    routing: { type: RoutingType.COMPLEX, score: 45, assignedTo: 'Dr. Robert Kim', assignedDate: new Date(NOW_MS - 5 * DAY).toISOString() },
    workflow: { assignedTo: 'Dr. Robert Kim', slaDate: new Date(NOW_MS + 2 * DAY).toISOString(), currentTask: 'Review foreign hospital bills and medical report' },
    aiInsights: { riskScore: 22, anomalies: [{ type: 'high_value', description: 'Medical claim exceeds average by 3.2x — standard for international emergency hospitalization' }], verificationConfidence: 0.88 },
    syncStatus: { cma: 'synced', policyAdmin: 'synced', fso: 'synced', dms: 'pending' }
  },
  {
    id: 'trv-003',
    claimNumber: 'TRV-2025-002034',
    status: ClaimStatus.CLOSED,
    type: TravelClaimType.BAGGAGE_LOSS,
    submissionDate: new Date(NOW_MS - 14 * DAY).toISOString(),
    createdAt: new Date(NOW_MS - 14 * DAY).toISOString(),
    insured: { name: 'Priya Nair', ssn: '***-**-6617', dob: '1990-09-15', address: { street: '58 Birchwood Ln', city: 'Chicago', state: 'IL', zip: '60601' } },
    policy: { policyNumber: 'TRV-POL-8834', policyType: 'Standard Travel', coverageType: 'Single Trip', issueDate: '2025-01-02', expiryDate: '2025-01-10', premium: 95, destination: 'London, UK' },
    claimant: { name: 'Priya Nair', relationship: 'Insured', phone: '(312) 555-0449', email: 'priya.nair@email.com' },
    financial: { claimAmount: 1800, paidAmount: 1800, reserveAmount: 0, currency: 'USD' },
    routing: { type: RoutingType.STP, score: 91, assignedTo: null },
    workflow: { assignedTo: null, slaDate: new Date(NOW_MS - 7 * DAY).toISOString(), currentTask: null },
    aiInsights: { riskScore: 8, anomalies: [], verificationConfidence: 0.97 },
    syncStatus: { cma: 'synced', policyAdmin: 'synced', fso: 'synced', dms: 'synced' }
  },
  {
    id: 'trv-004',
    claimNumber: 'TRV-2025-002187',
    status: ClaimStatus.OPEN,
    type: TravelClaimType.FLIGHT_DELAY,
    submissionDate: new Date(NOW_MS - 1 * DAY).toISOString(),
    createdAt: new Date(NOW_MS - 1 * DAY).toISOString(),
    insured: { name: 'James O\'Brien', ssn: '***-**-7752', dob: '1988-11-04', address: { street: '390 Cedar Blvd', city: 'Miami', state: 'FL', zip: '33101' } },
    policy: { policyNumber: 'TRV-POL-4413', policyType: 'Economy Travel', coverageType: 'Single Trip', issueDate: '2025-01-14', expiryDate: '2025-01-22', premium: 55, destination: 'Cancun, Mexico', delayHours: 9 },
    claimant: { name: 'James O\'Brien', relationship: 'Insured', phone: '(305) 555-0318', email: 'james.obrien@email.com' },
    financial: { claimAmount: 420, paidAmount: 0, reserveAmount: 500, currency: 'USD' },
    routing: { type: RoutingType.STP, score: 88, assignedTo: null },
    workflow: { assignedTo: null, slaDate: new Date(NOW_MS + 3 * DAY).toISOString(), currentTask: 'Auto-processing delay claim' },
    aiInsights: { riskScore: 5, anomalies: [], verificationConfidence: 0.99 },
    syncStatus: { cma: 'synced', policyAdmin: 'synced', fso: 'synced', dms: 'synced' }
  },
  {
    id: 'trv-005',
    claimNumber: 'TRV-2025-002291',
    status: ClaimStatus.IN_REVIEW,
    type: TravelClaimType.TRIP_INTERRUPTION,
    submissionDate: new Date(NOW_MS - 5 * DAY).toISOString(),
    createdAt: new Date(NOW_MS - 5 * DAY).toISOString(),
    insured: { name: 'Sofia Rodriguez', ssn: '***-**-2204', dob: '1979-07-22', address: { street: '1200 Sunset Drive', city: 'Phoenix', state: 'AZ', zip: '85001' } },
    policy: { policyNumber: 'TRV-POL-6628', policyType: 'Premium Travel', coverageType: 'Single Trip', issueDate: '2025-01-05', expiryDate: '2025-01-19', premium: 175, destination: 'Tokyo, Japan' },
    claimant: { name: 'Sofia Rodriguez', relationship: 'Insured', phone: '(602) 555-0562', email: 'sofia.rodriguez@email.com' },
    financial: { claimAmount: 6100, paidAmount: 0, reserveAmount: 6500, currency: 'USD' },
    routing: { type: RoutingType.COMPLEX, score: 58, assignedTo: 'Sarah Thompson', assignedDate: new Date(NOW_MS - 4 * DAY).toISOString() },
    workflow: { assignedTo: 'Sarah Thompson', slaDate: new Date(NOW_MS + 5 * DAY).toISOString(), currentTask: 'Verify interruption reason and additional expenses' },
    aiInsights: { riskScore: 18, anomalies: [], verificationConfidence: 0.93 },
    syncStatus: { cma: 'synced', policyAdmin: 'synced', fso: 'synced', dms: 'synced' }
  }
];

// ============================================================
// Seeded claims generator
// ============================================================
const CLAIM_TYPES = Object.values(TravelClaimType);
const STATUSES = [ClaimStatus.OPEN, ClaimStatus.IN_REVIEW, ClaimStatus.CLOSED, ClaimStatus.PENDING];

const generateSeededClaims = (count = 10) => {
  const claims = [];
  for (let i = 0; i < count; i++) {
    const id = `trv-s${String(i + 1).padStart(2, '0')}`;
    const daysAgo = Math.floor(seeded() * 30);
    const createdAt = new Date(NOW_MS - daysAgo * DAY).toISOString();
    const isSTP = seeded() < 0.35;
    const type = seededPick(CLAIM_TYPES);
    const status = isSTP ? ClaimStatus.CLOSED : seededPick(STATUSES);
    const claimantName = seededName();
    const destination = seededPick(DESTINATIONS);
    const state = seededPick(STATES);
    const claimAmount = Math.round((seeded() * 8000 + 200) * 100) / 100;

    claims.push({
      id,
      claimNumber: `TRV-2025-${String(3000 + i).padStart(6, '0')}`,
      status,
      type,
      submissionDate: createdAt,
      createdAt,
      insured: { name: claimantName, ssn: `***-**-${String(Math.floor(seeded() * 9000 + 1000))}`, dob: `${1950 + Math.floor(seeded() * 50)}-${String(Math.floor(seeded() * 12 + 1)).padStart(2, '0')}-${String(Math.floor(seeded() * 28 + 1)).padStart(2, '0')}`, address: { street: `${Math.floor(seeded() * 999 + 1)} Main St`, city: 'Anytown', state, zip: String(Math.floor(seeded() * 90000 + 10000)) } },
      policy: { policyNumber: `TRV-POL-${String(Math.floor(seeded() * 9000 + 1000))}`, policyType: seededPick(['Standard Travel', 'Premium Travel', 'Economy Travel', 'Comprehensive Travel']), coverageType: seededPick(['Single Trip', 'Annual Multi-Trip']), issueDate: new Date(NOW_MS - 90 * DAY).toISOString().split('T')[0], expiryDate: new Date(NOW_MS + 30 * DAY).toISOString().split('T')[0], premium: Math.round(seeded() * 350 + 50), destination },
      claimant: { name: claimantName, relationship: 'Insured', phone: `(${Math.floor(seeded() * 900 + 100)}) 555-${String(Math.floor(seeded() * 9000 + 1000))}`, email: `${claimantName.toLowerCase().replace(' ', '.')}@email.com` },
      financial: { claimAmount, paidAmount: isSTP ? claimAmount : 0, reserveAmount: isSTP ? 0 : claimAmount * 1.1, currency: 'USD' },
      routing: { type: isSTP ? RoutingType.STP : RoutingType.COMPLEX, score: isSTP ? Math.round(seeded() * 15 + 82) : Math.round(seeded() * 30 + 40), assignedTo: isSTP ? null : seededPick(['Sarah Thompson', 'Dr. Robert Kim', 'Amy Chen']), assignedDate: isSTP ? null : createdAt },
      workflow: { assignedTo: isSTP ? null : seededPick(['Sarah Thompson', 'Dr. Robert Kim', 'Amy Chen']), slaDate: new Date(NOW_MS + 7 * DAY).toISOString(), currentTask: isSTP ? null : 'Pending document review' },
      aiInsights: { riskScore: Math.round(seeded() * 40), anomalies: [], verificationConfidence: Math.round((seeded() * 0.2 + 0.8) * 100) / 100 },
      syncStatus: { cma: 'synced', policyAdmin: 'synced', fso: 'synced', dms: 'synced' }
    });
  }
  return claims;
};

// ============================================================
// Assemble and enrich all claims
// ============================================================
const allRawClaims = [...showcaseClaims, ...generateSeededClaims(10)];

const enrichedClaims = allRawClaims.map(claim => {
  const requirements = generateTravelRequirements(claim);
  const timeline = generateTravelTimeline({ ...claim, requirements });
  const workNotes = generateTravelWorkNotes(claim);
  return { ...claim, requirements, timeline, workNotes };
});

const travelDemoData = {
  claims: enrichedClaims,
  metadata: {
    productLine: 'travel',
    generatedAt: new Date().toISOString(),
    totalClaims: enrichedClaims.length,
    stpCount: enrichedClaims.filter(c => c.routing?.type === RoutingType.STP).length
  }
};

export const getTravelDemoData = () => travelDemoData;

export default travelDemoData;
