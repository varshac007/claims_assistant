import { iconEl } from '../../utils/iconEl';
import { useState, useMemo } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcTextInput,
  DxcSelect,
  DxcButton,
  DxcBadge,
  DxcTabs,
  DxcInset,
  DxcChip,
  DxcAlert,
  DxcDialog,
  DxcPaginator
} from '@dxc-technology/halstack-react';
import './RequirementsReceived.css';

/**
 * Requirements Received Window (Actionable Mail)
 * Organizes requirements by level: Claim, Policy, Beneficiary
 * Shows what is needed and from whom
 */

// Demo requirements data
const demoRequirements = [
  // Claim Level
  {
    id: 'REQ-001',
    level: 'claim',
    claimNumber: 'CLM-2026-00142',
    insured: 'James R. Smith',
    type: 'Loss Verification',
    description: 'Official loss verification document from the relevant authority',
    status: 'received',
    receivedDate: '01/18/2026',
    dueDate: '01/22/2026',
    assignedTo: null,
    source: 'Portal Upload',
    priority: 'high',
    documents: [{ name: 'loss_verification_smith.pdf', size: '2.4 MB', uploadedAt: '01/18/2026' }],
    actionRequired: 'Review and verify document authenticity'
  },
  {
    id: 'REQ-002',
    level: 'claim',
    claimNumber: 'CLM-2026-00139',
    insured: 'Mary L. Johnson',
    type: 'Loss Verification',
    description: 'Official loss verification document from the relevant authority',
    status: 'pending',
    receivedDate: null,
    dueDate: '01/15/2026',
    assignedTo: null,
    source: null,
    priority: 'urgent',
    documents: [],
    actionRequired: 'Follow up with claimant — past due'
  },
  {
    id: 'REQ-003',
    level: 'claim',
    claimNumber: 'CLM-2026-00142',
    insured: 'James R. Smith',
    type: 'Claimant Statement',
    description: 'Signed statement of claim form',
    status: 'in_review',
    receivedDate: '01/16/2026',
    dueDate: '01/22/2026',
    assignedTo: 'Sarah M. Smith',
    source: 'Mail',
    priority: 'medium',
    documents: [{ name: 'claimant_statement_signed.pdf', size: '1.1 MB', uploadedAt: '01/16/2026' }],
    actionRequired: 'Verify signature and completeness'
  },
  // Policy Level
  {
    id: 'REQ-004',
    level: 'policy',
    claimNumber: 'CLM-2026-00142',
    insured: 'James R. Smith',
    policyNumber: 'WR-LI-2019-445501',
    type: 'Release of Assignment',
    description: 'Release of collateral assignment from lender',
    status: 'pending',
    receivedDate: null,
    dueDate: '01/25/2026',
    assignedTo: null,
    source: null,
    priority: 'medium',
    documents: [],
    actionRequired: 'Contact lender for release documentation'
  },
  {
    id: 'REQ-005',
    level: 'policy',
    claimNumber: 'CLM-2026-00135',
    insured: 'Robert T. Davis',
    policyNumber: 'WR-LI-2015-112204',
    type: 'Policy Loan Payoff Statement',
    description: 'Current policy loan balance and payoff amount',
    status: 'received',
    receivedDate: '01/12/2026',
    dueDate: '01/20/2026',
    assignedTo: null,
    source: 'System Generated',
    priority: 'low',
    documents: [{ name: 'loan_payoff_112204.pdf', size: '0.5 MB', uploadedAt: '01/12/2026' }],
    actionRequired: 'Review and apply to benefit calculation'
  },
  // Beneficiary Level
  {
    id: 'REQ-006',
    level: 'beneficiary',
    claimNumber: 'CLM-2026-00142',
    insured: 'James R. Smith',
    policyNumber: 'WR-TL-2021-667802',
    beneficiaryName: 'Michael J. Smith',
    type: 'Claim Form',
    description: 'Beneficiary claim form for term life policy',
    status: 'pending',
    receivedDate: null,
    dueDate: '01/28/2026',
    assignedTo: 'Michael J. Smith',
    source: null,
    priority: 'high',
    documents: [],
    actionRequired: 'Claim packet sent — awaiting return from beneficiary'
  },
  {
    id: 'REQ-007',
    level: 'beneficiary',
    claimNumber: 'CLM-2026-00142',
    insured: 'James R. Smith',
    policyNumber: 'WR-TL-2021-667802',
    beneficiaryName: 'Michael J. Smith',
    type: 'Government-Issued ID',
    description: 'Copy of valid government-issued photo identification',
    status: 'pending',
    receivedDate: null,
    dueDate: '01/28/2026',
    assignedTo: 'Michael J. Smith',
    source: null,
    priority: 'high',
    documents: [],
    actionRequired: 'Included in claim packet — awaiting return'
  },
  {
    id: 'REQ-008',
    level: 'beneficiary',
    claimNumber: 'CLM-2026-00139',
    insured: 'Mary L. Johnson',
    policyNumber: 'WR-AN-2020-339903',
    beneficiaryName: 'Emily A. Johnson',
    type: 'Name Change Documents',
    description: 'Legal documentation for name change (marriage certificate or court order)',
    status: 'received',
    receivedDate: '01/14/2026',
    dueDate: '01/20/2026',
    assignedTo: 'Emily A. Johnson',
    source: 'Portal Upload',
    priority: 'medium',
    documents: [{ name: 'marriage_certificate_johnson.pdf', size: '1.8 MB', uploadedAt: '01/14/2026' }],
    actionRequired: 'Verify name change documentation'
  },
  {
    id: 'REQ-009',
    level: 'beneficiary',
    claimNumber: 'CLM-2026-00139',
    insured: 'Mary L. Johnson',
    policyNumber: 'WR-AN-2020-339903',
    beneficiaryName: 'David R. Johnson',
    type: 'Claim Form',
    description: 'Beneficiary claim form for fixed annuity',
    status: 'in_review',
    receivedDate: '01/10/2026',
    dueDate: '01/15/2026',
    assignedTo: 'David R. Johnson',
    source: 'Mail',
    priority: 'medium',
    documents: [{ name: 'claimform_johnson_david.pdf', size: '0.9 MB', uploadedAt: '01/10/2026' }],
    actionRequired: 'Verify form completeness and signature'
  }
];

const getStatusColor = (status) => {
  const map = {
    'received': 'success',
    'in_review': 'info',
    'pending': 'warning',
    'overdue': 'error',
    'waived': 'neutral'
  };
  return map[status] || 'neutral';
};

const getPriorityColor = (priority) => {
  const map = {
    'urgent': 'error',
    'high': 'warning',
    'medium': 'info',
    'low': 'neutral'
  };
  return map[priority] || 'neutral';
};

const RequirementsReceived = ({ onClaimSelect }) => {
  const [activeLevel, setActiveLevel] = useState(0); // 0=all, 1=claim, 2=policy, 3=beneficiary
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [actionDialogReq, setActionDialogReq] = useState(null);

  const filteredRequirements = useMemo(() => {
    let filtered = [...demoRequirements];

    // Filter by level
    if (activeLevel === 1) filtered = filtered.filter(r => r.level === 'claim');
    if (activeLevel === 2) filtered = filtered.filter(r => r.level === 'policy');
    if (activeLevel === 3) filtered = filtered.filter(r => r.level === 'beneficiary');

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Search
    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(r =>
        r.claimNumber.toLowerCase().includes(search) ||
        r.insured.toLowerCase().includes(search) ||
        r.type.toLowerCase().includes(search) ||
        (r.beneficiaryName && r.beneficiaryName.toLowerCase().includes(search)) ||
        (r.policyNumber && r.policyNumber.toLowerCase().includes(search))
      );
    }

    return filtered;
  }, [activeLevel, statusFilter, searchValue]);

  const counts = useMemo(() => ({
    all: demoRequirements.length,
    claim: demoRequirements.filter(r => r.level === 'claim').length,
    policy: demoRequirements.filter(r => r.level === 'policy').length,
    beneficiary: demoRequirements.filter(r => r.level === 'beneficiary').length,
    pending: demoRequirements.filter(r => r.status === 'pending').length,
    received: demoRequirements.filter(r => r.status === 'received').length,
    inReview: demoRequirements.filter(r => r.status === 'in_review').length
  }), []);

  const getItemClass = (req) => {
    if (req.priority === 'urgent' || (req.status === 'pending' && new Date(req.dueDate) < new Date())) {
      return 'requirement-item urgent';
    }
    if (req.status === 'pending') return 'requirement-item pending';
    if (req.status === 'received') return 'requirement-item received';
    return 'requirement-item';
  };

  return (
    <div className="requirements-received">
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcHeading level={1} text="Requirements Received" />
          <DxcFlex gap="var(--spacing-gap-s)">
            <DxcBadge label={`${counts.pending} Pending`} mode="contextual" color="warning" />
            <DxcBadge label={`${counts.received} Received`} mode="contextual" color="success" />
            <DxcBadge label={`${counts.inReview} In Review`} mode="contextual" color="info" />
          </DxcFlex>
        </DxcFlex>

        {/* Level Tabs */}
        <DxcTabs>
          <DxcTabs.Tab
            label={`All (${counts.all})`}
            icon={iconEl("list")}
            active={activeLevel === 0}
            onClick={() => setActiveLevel(0)}
          >
            <div />
          </DxcTabs.Tab>
          <DxcTabs.Tab
            label={`Claim Level (${counts.claim})`}
            icon={iconEl("description")}
            active={activeLevel === 1}
            onClick={() => setActiveLevel(1)}
          >
            <div />
          </DxcTabs.Tab>
          <DxcTabs.Tab
            label={`Policy Level (${counts.policy})`}
            icon={iconEl("policy")}
            active={activeLevel === 2}
            onClick={() => setActiveLevel(2)}
          >
            <div />
          </DxcTabs.Tab>
          <DxcTabs.Tab
            label={`Beneficiary Level (${counts.beneficiary})`}
            icon={iconEl("people")}
            active={activeLevel === 3}
            onClick={() => setActiveLevel(3)}
          >
            <div />
          </DxcTabs.Tab>
        </DxcTabs>

        {/* Filters */}
        <div style={{
          backgroundColor: "#FFFFFF", /* BLOOM: White */
          borderRadius: "8px", /* BLOOM: Rounded */
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", /* BLOOM: Shadow */
          padding: "var(--spacing-padding-m)",
          borderLeft: "4px solid #00ADEE" /* BLOOM: Cyan accent for filters */
        }}>
          <DxcFlex gap="var(--spacing-gap-m)" alignItems="flex-end" wrap="wrap">
            <div style={{ flex: "1 1 300px" }}>
              <DxcTextInput
                placeholder="Search by claim, insured, type, beneficiary, or policy..."
                value={searchValue}
                onChange={({ value }) => setSearchValue(value)}
                size="fillParent"
              />
            </div>
            <DxcSelect
              label="Status"
              value={statusFilter}
              onChange={({ value }) => setStatusFilter(value)}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Received', value: 'received' },
                { label: 'In Review', value: 'in_review' }
              ]}
              size="medium"
            />
          </DxcFlex>
        </div>

        {/* Requirements List */}
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          {filteredRequirements.length === 0 && (
            <DxcAlert
              semantic="info"
              message={{ text: "No requirements match the current filters." }}
            />
          )}

          {filteredRequirements.map(req => (
            <div key={req.id} className={getItemClass(req)}>
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                {/* Top row: type, claim, status */}
                <DxcFlex justifyContent="space-between" alignItems="center" wrap="wrap" gap="var(--spacing-gap-s)">
                  <DxcFlex gap="var(--spacing-gap-s)" alignItems="center" wrap="wrap">
                    <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-04">
                      {req.type}
                    </DxcTypography>
                    <DxcBadge label={req.level.charAt(0).toUpperCase() + req.level.slice(1)} mode="contextual" color="info" />
                    <DxcBadge label={req.status.replace(/_/g, ' ')} mode="contextual" color={getStatusColor(req.status)} />
                    <DxcBadge label={req.priority} mode="contextual" color={getPriorityColor(req.priority)} />
                  </DxcFlex>

                  <DxcFlex gap="var(--spacing-gap-xs)">
                    <DxcButton
                      label="Mark Received"
                      mode="tertiary"
                      icon={iconEl("check")}
                      size="small"
                      onClick={() => {}}
                      disabled={req.status === 'received'}
                    />
                    <DxcButton
                      label="Request"
                      mode="tertiary"
                      icon={iconEl("send")}
                      size="small"
                      onClick={() => {}}
                    />
                    <DxcButton
                      label="Waive"
                      mode="tertiary"
                      icon={iconEl("do_not_disturb")}
                      size="small"
                      onClick={() => setActionDialogReq(req)}
                    />
                  </DxcFlex>
                </DxcFlex>

                {/* Details row */}
                <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">CLAIM</DxcTypography>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                      {req.claimNumber}
                    </DxcTypography>
                  </DxcFlex>
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">INSURED</DxcTypography>
                    <DxcTypography fontSize="font-scale-03">{req.insured}</DxcTypography>
                  </DxcFlex>
                  {req.policyNumber && (
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">POLICY</DxcTypography>
                      <DxcTypography fontSize="font-scale-03">{req.policyNumber}</DxcTypography>
                    </DxcFlex>
                  )}
                  {req.beneficiaryName && (
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">FROM</DxcTypography>
                      <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">{req.beneficiaryName}</DxcTypography>
                    </DxcFlex>
                  )}
                  {req.assignedTo && (
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">ASSIGNED TO</DxcTypography>
                      <DxcTypography fontSize="font-scale-03">{req.assignedTo}</DxcTypography>
                    </DxcFlex>
                  )}
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">DUE DATE</DxcTypography>
                    <DxcTypography
                      fontSize="font-scale-03"
                      fontWeight="font-weight-semibold"
                      color={new Date(req.dueDate) < new Date() && req.status === 'pending' ? "var(--color-fg-error-medium)" : undefined}
                    >
                      {req.dueDate}
                      {new Date(req.dueDate) < new Date() && req.status === 'pending' && ' (OVERDUE)'}
                    </DxcTypography>
                  </DxcFlex>
                  {req.receivedDate && (
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">RECEIVED</DxcTypography>
                      <DxcTypography fontSize="font-scale-03">{req.receivedDate}</DxcTypography>
                    </DxcFlex>
                  )}
                  {req.source && (
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">SOURCE</DxcTypography>
                      <DxcTypography fontSize="font-scale-03">{req.source}</DxcTypography>
                    </DxcFlex>
                  )}
                </DxcFlex>

                {/* Action Required */}
                <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                  <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
                    ACTION:
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03">
                    {req.actionRequired}
                  </DxcTypography>
                </DxcFlex>

                {/* Documents */}
                {req.documents.length > 0 && (
                  <DxcFlex gap="var(--spacing-gap-s)" alignItems="center" wrap="wrap">
                    <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">DOCUMENTS:</DxcTypography>
                    {req.documents.map((doc, idx) => (
                      <DxcChip
                        key={idx}
                        label={`${doc.name} (${doc.size})`}
                        onClick={() => {}}
                      />
                    ))}
                  </DxcFlex>
                )}
              </DxcFlex>
            </div>
          ))}
        </DxcFlex>

        {/* Waive Confirmation Dialog */}
        {actionDialogReq && (
          <DxcDialog
            closable
            onCloseClick={() => setActionDialogReq(null)}
            onBackgroundClick={() => setActionDialogReq(null)}
          >
            <DxcInset space="var(--spacing-padding-m)">
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Waive Requirement" />
                <DxcTypography>
                  Are you sure you want to waive the requirement "{actionDialogReq.type}" for claim {actionDialogReq.claimNumber}?
                </DxcTypography>
                {actionDialogReq.beneficiaryName && (
                  <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                    Beneficiary: {actionDialogReq.beneficiaryName}
                  </DxcTypography>
                )}
                <DxcAlert
                  semantic="warning"
                  message={{ text: "Waiving this requirement may affect claim processing and audit compliance." }}
                />
                <DxcFlex gap="var(--spacing-gap-s)" justifyContent="flex-end">
                  <DxcButton
                    label="Cancel"
                    mode="secondary"
                    onClick={() => setActionDialogReq(null)}
                  />
                  <DxcButton
                    label="Confirm Waive"
                    onClick={() => setActionDialogReq(null)}
                  />
                </DxcFlex>
              </DxcFlex>
            </DxcInset>
          </DxcDialog>
        )}
      </DxcFlex>
    </div>
  );
};

export default RequirementsReceived;
