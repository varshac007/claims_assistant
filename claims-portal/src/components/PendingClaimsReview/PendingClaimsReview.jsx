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
  DxcAccordion,
  DxcTable,
  DxcAlert,
  DxcPaginator,
  DxcChip
} from '@dxc-technology/halstack-react';
import { useClaims } from '../../contexts/ClaimsContext';
import './PendingClaimsReview.css';

/**
 * Pending Claims Review
 * Data Hierarchy: Claim > Policies > Beneficiaries > Benefits
 */

// Demo claims data for pending review
const demoPendingClaims = [
  {
    id: 'CLM-2026-00142',
    claimNumber: 'CLM-2026-00142',
    status: 'under_review',
    insured: { name: 'James R. Smith', dob: '04/15/1958', dod: '01/10/2026', ssn: '***-**-4521' },
    claimant: { name: 'Sarah M. Smith', relationship: 'Spouse' },
    dateOfLoss: '01/10/2026',
    dateFiled: '01/15/2026',
    totalClaimAmount: 750000,
    policies: [
      {
        id: 'POL-001',
        policyNumber: 'WR-LI-2019-445501',
        type: 'Whole Life',
        status: 'In Force',
        coverage: 500000,
        issueDate: '03/15/2019',
        deathBenefit: 500000,
        accumulatedValue: 42350,
        beneficiaries: [
          {
            id: 'BEN-001',
            name: 'Sarah M. Smith',
            relationship: 'Spouse',
            type: 'Primary',
            allocationPercent: 100,
            status: 'Verified',
            requirementsComplete: true,
            benefits: [
              { type: 'Death Benefit', amount: 500000, status: 'Pending Payment' },
              { type: 'Accumulated Interest', amount: 12350, status: 'Calculating' }
            ]
          }
        ]
      },
      {
        id: 'POL-002',
        policyNumber: 'WR-TL-2021-667802',
        type: 'Term Life',
        status: 'In Force',
        coverage: 250000,
        issueDate: '07/22/2021',
        deathBenefit: 250000,
        accumulatedValue: 0,
        beneficiaries: [
          {
            id: 'BEN-002',
            name: 'Sarah M. Smith',
            relationship: 'Spouse',
            type: 'Primary',
            allocationPercent: 50,
            status: 'Verified',
            requirementsComplete: true,
            benefits: [
              { type: 'Death Benefit', amount: 125000, status: 'Pending Payment' }
            ]
          },
          {
            id: 'BEN-003',
            name: 'Michael J. Smith',
            relationship: 'Son',
            type: 'Primary',
            allocationPercent: 50,
            status: 'Pending Verification',
            requirementsComplete: false,
            benefits: [
              { type: 'Death Benefit', amount: 125000, status: 'Awaiting Requirements' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'CLM-2026-00139',
    claimNumber: 'CLM-2026-00139',
    status: 'pending_requirements',
    insured: { name: 'Mary L. Johnson', dob: '08/22/1965', dod: '01/05/2026', ssn: '***-**-7834' },
    claimant: { name: 'David R. Johnson', relationship: 'Spouse' },
    dateOfLoss: '01/05/2026',
    dateFiled: '01/08/2026',
    totalClaimAmount: 350000,
    policies: [
      {
        id: 'POL-003',
        policyNumber: 'WR-AN-2020-339903',
        type: 'Fixed Annuity',
        status: 'In Force',
        coverage: 350000,
        issueDate: '11/10/2020',
        deathBenefit: 350000,
        accumulatedValue: 28750,
        beneficiaries: [
          {
            id: 'BEN-004',
            name: 'David R. Johnson',
            relationship: 'Spouse',
            type: 'Primary',
            allocationPercent: 75,
            status: 'Verified',
            requirementsComplete: false,
            benefits: [
              { type: 'Death Benefit', amount: 262500, status: 'Awaiting Requirements' },
              { type: 'Accumulated Interest', amount: 21562, status: 'Calculating' }
            ]
          },
          {
            id: 'BEN-005',
            name: 'Emily A. Johnson',
            relationship: 'Daughter',
            type: 'Primary',
            allocationPercent: 25,
            status: 'Pending Verification',
            requirementsComplete: false,
            benefits: [
              { type: 'Death Benefit', amount: 87500, status: 'Awaiting Requirements' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'CLM-2026-00135',
    claimNumber: 'CLM-2026-00135',
    status: 'in_approval',
    insured: { name: 'Robert T. Davis', dob: '12/03/1950', dod: '12/28/2025', ssn: '***-**-2198' },
    claimant: { name: 'Linda M. Davis', relationship: 'Spouse' },
    dateOfLoss: '12/28/2025',
    dateFiled: '01/02/2026',
    totalClaimAmount: 1000000,
    policies: [
      {
        id: 'POL-004',
        policyNumber: 'WR-LI-2015-112204',
        type: 'Universal Life',
        status: 'In Force',
        coverage: 1000000,
        issueDate: '06/01/2015',
        deathBenefit: 1000000,
        accumulatedValue: 156000,
        beneficiaries: [
          {
            id: 'BEN-006',
            name: 'Linda M. Davis',
            relationship: 'Spouse',
            type: 'Primary',
            allocationPercent: 60,
            status: 'Verified',
            requirementsComplete: true,
            benefits: [
              { type: 'Death Benefit', amount: 600000, status: 'Approved' },
              { type: 'Cash Value', amount: 93600, status: 'Approved' }
            ]
          },
          {
            id: 'BEN-007',
            name: 'Davis Family Trust',
            relationship: 'Trust',
            type: 'Primary',
            allocationPercent: 40,
            status: 'Verified',
            requirementsComplete: true,
            benefits: [
              { type: 'Death Benefit', amount: 400000, status: 'Approved' },
              { type: 'Cash Value', amount: 62400, status: 'Approved' }
            ]
          }
        ]
      }
    ]
  }
];

const getStatusColor = (status) => {
  const map = {
    'under_review': 'warning',
    'pending_requirements': 'error',
    'in_approval': 'info',
    'approved': 'success',
    'Verified': 'success',
    'Pending Verification': 'warning',
    'Pending Payment': 'info',
    'Awaiting Requirements': 'warning',
    'Calculating': 'info',
    'Approved': 'success',
    'In Force': 'success'
  };
  return map[status] || 'neutral';
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const PendingClaimsReview = ({ onClaimSelect }) => {
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [viewMode, setViewMode] = useState(0); // 0 = Claims list, 1 = Claim detail
  const [beneficiaryView, setBeneficiaryView] = useState(0); // 0 = by policy, 1 = aggregate
  const [searchValue, setSearchValue] = useState('');

  const selectedClaim = useMemo(() => {
    return demoPendingClaims.find(c => c.id === selectedClaimId);
  }, [selectedClaimId]);

  // Aggregate beneficiaries across all policies for a claim
  const aggregateBeneficiaries = useMemo(() => {
    if (!selectedClaim) return [];
    const benefMap = {};
    selectedClaim.policies.forEach(policy => {
      policy.beneficiaries.forEach(ben => {
        if (!benefMap[ben.name]) {
          benefMap[ben.name] = {
            ...ben,
            policies: [],
            totalBenefits: 0
          };
        }
        const policyBenefits = ben.benefits.reduce((sum, b) => sum + b.amount, 0);
        benefMap[ben.name].policies.push({
          policyNumber: policy.policyNumber,
          type: policy.type,
          allocationPercent: ben.allocationPercent,
          benefits: ben.benefits,
          totalAmount: policyBenefits
        });
        benefMap[ben.name].totalBenefits += policyBenefits;
      });
    });
    return Object.values(benefMap);
  }, [selectedClaim]);

  const filteredClaims = useMemo(() => {
    if (!searchValue) return demoPendingClaims;
    const search = searchValue.toLowerCase();
    return demoPendingClaims.filter(c =>
      c.claimNumber.toLowerCase().includes(search) ||
      c.insured.name.toLowerCase().includes(search) ||
      c.claimant.name.toLowerCase().includes(search)
    );
  }, [searchValue]);

  return (
    <div className="pending-claims-review">
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcHeading level={1} text="Pending Claims Review" />
          {selectedClaim && (
            <DxcButton
              label="Back to Claims List"
              mode="tertiary"
              icon={iconEl("arrow_back")}
              onClick={() => { setSelectedClaimId(null); }}
            />
          )}
        </DxcFlex>

        {/* =================== CLAIMS LIST VIEW =================== */}
        {!selectedClaim && (
          <>
            <div style={{
              backgroundColor: "var(--color-bg-neutral-lightest)",
              borderRadius: "var(--border-radius-m)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", /* BLOOM: Card shadow */
              padding: "var(--spacing-padding-m)",
              borderLeft: "4px solid #00ADEE" /* BLOOM: Cyan left accent border for search */
            }}>
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                <DxcTextInput
                  placeholder="Search claims by number, insured, or claimant..."
                  value={searchValue}
                  onChange={({ value }) => setSearchValue(value)}
                  size="fillParent"
                />
              </DxcFlex>
            </div>

            {filteredClaims.map(claim => (
              <div
                key={claim.id}
                className="claim-card"
                onClick={() => setSelectedClaimId(claim.id)}
              >
                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                      <DxcTypography fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */ fontSize="font-scale-04">
                        {claim.claimNumber}
                      </DxcTypography>
                      <DxcBadge label={claim.status.replace(/_/g, ' ')} mode="contextual" color={getStatusColor(claim.status)} />
                    </DxcFlex>
                    <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-04">
                      {formatCurrency(claim.totalClaimAmount)}
                    </DxcTypography>
                  </DxcFlex>

                  <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>INSURED</DxcTypography>
                      <DxcTypography>{claim.insured.name}</DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>CLAIMANT</DxcTypography>
                      <DxcTypography>{claim.claimant.name} ({claim.claimant.relationship})</DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>DATE OF LOSS</DxcTypography>
                      <DxcTypography>{claim.dateOfLoss}</DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>POLICIES</DxcTypography>
                      <DxcTypography>{claim.policies.length} policy(ies)</DxcTypography>
                    </DxcFlex>
                  </DxcFlex>
                </DxcFlex>
              </div>
            ))}
          </>
        )}

        {/* =================== CLAIM DETAIL VIEW =================== */}
        {selectedClaim && (
          <>
            {/* Claim Summary */}
            <div style={{
              backgroundColor: "var(--color-bg-neutral-lightest)",
              borderRadius: "var(--border-radius-m)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", /* BLOOM: Card shadow */
              padding: "var(--spacing-padding-m)",
              borderLeft: "4px solid #1B75BB" /* BLOOM: Blue left accent border */
            }}>
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                <DxcFlex justifyContent="space-between" alignItems="center">
                  <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                    <DxcHeading level={2} text={selectedClaim.claimNumber} />
                    <DxcBadge label={selectedClaim.status.replace(/_/g, ' ')} mode="contextual" color={getStatusColor(selectedClaim.status)} />
                  </DxcFlex>
                  <DxcTypography fontWeight="font-weight-semibold" fontSize="32px" color="#000000" /* BLOOM: Data values must be black */>
                    {formatCurrency(selectedClaim.totalClaimAmount)}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>INSURED</DxcTypography>
                    <DxcTypography fontWeight="font-weight-semibold">{selectedClaim.insured.name}</DxcTypography>
                    <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>DOB: {selectedClaim.insured.dob} | DOD: {selectedClaim.insured.dod}</DxcTypography>
                  </DxcFlex>
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>CLAIMANT</DxcTypography>
                    <DxcTypography fontWeight="font-weight-semibold">{selectedClaim.claimant.name}</DxcTypography>
                    <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>Relationship: {selectedClaim.claimant.relationship}</DxcTypography>
                  </DxcFlex>
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>DATE OF LOSS</DxcTypography>
                    <DxcTypography fontWeight="font-weight-semibold">{selectedClaim.dateOfLoss}</DxcTypography>
                  </DxcFlex>
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>DATE FILED</DxcTypography>
                    <DxcTypography fontWeight="font-weight-semibold">{selectedClaim.dateFiled}</DxcTypography>
                  </DxcFlex>
                </DxcFlex>
              </DxcFlex>
            </div>

            {/* Beneficiary View Toggle */}
            <DxcTabs>
              <DxcTabs.Tab
                label="By Policy"
                icon={iconEl("policy")}
                active={beneficiaryView === 0}
                onClick={() => setBeneficiaryView(0)}
              >
                <div />
              </DxcTabs.Tab>
              <DxcTabs.Tab
                label="Aggregate Beneficiary View"
                icon={iconEl("people")}
                active={beneficiaryView === 1}
                onClick={() => setBeneficiaryView(1)}
              >
                <div />
              </DxcTabs.Tab>
            </DxcTabs>

            {/* ===== BY POLICY VIEW ===== */}
            {beneficiaryView === 0 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                {selectedClaim.policies.map(policy => (
                  <div key={policy.id} style={{
                    backgroundColor: "var(--color-bg-neutral-lightest)",
                    borderRadius: "var(--border-radius-m)",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", /* BLOOM: Card shadow */
                    padding: "var(--spacing-padding-m)",
                    borderLeft: "4px solid #37A526" /* BLOOM: Green left accent border for policies */
                  }}>
                    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                      {/* Policy Header */}
                      <DxcFlex justifyContent="space-between" alignItems="center">
                        <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                          <DxcTypography fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                            {policy.policyNumber}
                          </DxcTypography>
                          <DxcBadge label={policy.type} mode="contextual" color="info" />
                          <DxcBadge label={policy.status} mode="contextual" color={getStatusColor(policy.status)} />
                        </DxcFlex>
                        <DxcTypography fontWeight="font-weight-semibold">
                          {formatCurrency(policy.deathBenefit)}
                        </DxcTypography>
                      </DxcFlex>

                      {/* Policy Details */}
                      <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>COVERAGE</DxcTypography>
                          <DxcTypography>{formatCurrency(policy.coverage)}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>ISSUE DATE</DxcTypography>
                          <DxcTypography>{policy.issueDate}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>ACCUMULATED VALUE</DxcTypography>
                          <DxcTypography>{formatCurrency(policy.accumulatedValue)}</DxcTypography>
                        </DxcFlex>
                      </DxcFlex>

                      {/* Beneficiaries for this policy */}
                      <div className="policy-nested-section">
                        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                          <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-03">
                            Beneficiaries ({policy.beneficiaries.length})
                          </DxcTypography>

                          {policy.beneficiaries.map(ben => (
                            <div key={ben.id} className="beneficiary-row">
                              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                                <DxcFlex justifyContent="space-between" alignItems="center" wrap="wrap">
                                  <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                                    <DxcTypography fontWeight="font-weight-semibold">{ben.name}</DxcTypography>
                                    <DxcBadge label={ben.type} mode="contextual" color="info" />
                                    <DxcBadge label={ben.status} mode="contextual" color={getStatusColor(ben.status)} />
                                    <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>
                                      {ben.relationship} | {ben.allocationPercent}%
                                    </DxcTypography>
                                  </DxcFlex>
                                  <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                                    {ben.requirementsComplete ? (
                                      <DxcBadge label="Requirements Complete" mode="contextual" color="success" />
                                    ) : (
                                      <DxcBadge label="Requirements Pending" mode="contextual" color="warning" />
                                    )}
                                  </DxcFlex>
                                </DxcFlex>

                                {/* Benefits Table */}
                                <div className="benefit-table-container">
                                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                    <thead>
                                      <tr style={{ borderBottom: "2px solid var(--border-color-neutral-lighter)", textAlign: "left" }}>
                                        <th style={{ padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "var(--color-fg-neutral-stronger)", textTransform: "uppercase" }}>Benefit Type</th>
                                        <th style={{ padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "var(--color-fg-neutral-stronger)", textTransform: "uppercase", textAlign: "right" }}>Amount</th>
                                        <th style={{ padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "var(--color-fg-neutral-stronger)", textTransform: "uppercase" }}>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {ben.benefits.map((benefit, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid var(--border-color-neutral-lighter)" }}>
                                          <td style={{ padding: "8px 12px" }}>
                                            <DxcTypography fontSize="font-scale-03">{benefit.type}</DxcTypography>
                                          </td>
                                          <td style={{ padding: "8px 12px", textAlign: "right" }}>
                                            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                                              {formatCurrency(benefit.amount)}
                                            </DxcTypography>
                                          </td>
                                          <td style={{ padding: "8px 12px" }}>
                                            <DxcBadge label={benefit.status} mode="contextual" color={getStatusColor(benefit.status)} />
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </DxcFlex>
                            </div>
                          ))}
                        </DxcFlex>
                      </div>
                    </DxcFlex>
                  </div>
                ))}
              </DxcFlex>
            )}

            {/* ===== AGGREGATE BENEFICIARY VIEW ===== */}
            {beneficiaryView === 1 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <div style={{
                  backgroundColor: "var(--color-bg-neutral-lightest)",
                  borderRadius: "var(--border-radius-m)",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", /* BLOOM: Card shadow */
                  padding: "var(--spacing-padding-m)",
                  borderLeft: "4px solid #F6921E" /* BLOOM: Orange left accent border for aggregate view */
                }}>
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcHeading level={3} text="Claim-Level Beneficiary Summary" />

                    {aggregateBeneficiaries.map((ben, idx) => (
                      <div key={idx} style={{
                        padding: "var(--spacing-padding-m)",
                        border: "1px solid var(--border-color-neutral-lighter)",
                        borderRadius: "var(--border-radius-m)",
                        backgroundColor: "var(--color-bg-neutral-lighter)"
                      }}>
                        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                          <DxcFlex justifyContent="space-between" alignItems="center">
                            <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                              <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-04">
                                {ben.name}
                              </DxcTypography>
                              <DxcBadge label={ben.relationship} mode="contextual" color="info" />
                              <DxcBadge label={ben.status} mode="contextual" color={getStatusColor(ben.status)} />
                            </DxcFlex>
                            <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-04" color="#000000" /* BLOOM: Data values must be black */>
                              Total: {formatCurrency(ben.totalBenefits)}
                            </DxcTypography>
                          </DxcFlex>

                          <DxcTypography fontSize="font-scale-03" color="#000000" /* BLOOM */>
                            Across {ben.policies.length} policy(ies):
                          </DxcTypography>

                          {ben.policies.map((pol, pidx) => (
                            <DxcFlex key={pidx} gap="var(--spacing-gap-m)" alignItems="center" wrap="wrap" style={{ paddingLeft: "16px" }}>
                              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                                {pol.policyNumber}
                              </DxcTypography>
                              <DxcBadge label={pol.type} mode="contextual" color="info" />
                              <DxcTypography fontSize="12px" color="#000000" /* BLOOM */>
                                {pol.allocationPercent}% allocation
                              </DxcTypography>
                              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                                {formatCurrency(pol.totalAmount)}
                              </DxcTypography>
                            </DxcFlex>
                          ))}
                        </DxcFlex>
                      </div>
                    ))}
                  </DxcFlex>
                </div>
              </DxcFlex>
            )}

            {/* Action Bar */}
            <div style={{
              backgroundColor: "var(--color-bg-neutral-lightest)",
              borderRadius: "var(--border-radius-m)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", /* BLOOM: Card shadow */
              padding: "var(--spacing-padding-m)",
              borderLeft: "4px solid #808285" /* BLOOM: Gray left accent border for actions */
            }}>
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcFlex gap="var(--spacing-gap-s)">
                  <DxcButton
                    label="Open in Workbench"
                    icon={iconEl("open_in_new")}
                    onClick={() => onClaimSelect && onClaimSelect(selectedClaim)}
                  />
                  <DxcButton
                    label="View Requirements"
                    mode="secondary"
                    icon={iconEl("checklist")}
                    onClick={() => {}}
                  />
                </DxcFlex>
                <DxcFlex gap="var(--spacing-gap-s)">
                  <DxcButton
                    label="Approve Claim"
                    mode="primary"
                    icon={iconEl("check_circle")}
                    onClick={() => {}}
                  />
                  <DxcButton
                    label="Hold"
                    mode="tertiary"
                    icon={iconEl("pause_circle")}
                    onClick={() => {}}
                  />
                </DxcFlex>
              </DxcFlex>
            </div>
          </>
        )}
      </DxcFlex>
    </div>
  );
};

export default PendingClaimsReview;
