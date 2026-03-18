import { iconEl } from '../../utils/iconEl';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcBadge,
  DxcButton,
  DxcChip,
  DxcDivider
} from '@dxc-technology/halstack-react';
import './PolicySummaryPanel.css';

/**
 * SA-004: Policy Summary Panel
 *
 * Displays policy portfolio with all associated policies on the claim.
 * Card-based layout showing:
 * - Policy Number with hyperlink
 * - Region, Company Code
 * - Face Amount
 * - Issue Date
 * - Admin Status, Reporting Status
 * - Source System
 *
 * Maps to cmA "Policy Portfolio" section
 */
const PolicySummaryPanel = ({ policies = [], onViewPolicy, onAssociate, onDissociate, onSearchPolicy }) => {
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper.includes('ACTIVE') || statusUpper.includes('INFORCE')) return 'success';
    if (statusUpper.includes('PENDING')) return 'warning';
    if (statusUpper.includes('CLOSED') || statusUpper.includes('LAPSED')) return 'error';
    return 'neutral';
  };

  const totalFaceAmount = policies.reduce((sum, policy) => sum + (policy.faceAmount || 0), 0);

  return (
    <DxcContainer
      padding="var(--spacing-padding-m)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ color: 'var(--color-fg-neutral-strong)', fontSize: '20px' }}>
              description
            </span>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Policy Portfolio
            </DxcTypography>
            <DxcChip label={`${policies.length} ${policies.length === 1 ? 'Policy' : 'Policies'}`} size="small" />
          </DxcFlex>
          <DxcFlex gap="var(--spacing-gap-xs)">
            <DxcButton
              label="Associate"
              mode="secondary"
              size="small"
              icon={iconEl("add_link")}
              onClick={onAssociate}
            />
            <DxcButton
              label="Search"
              mode="secondary"
              size="small"
              icon={iconEl("search")}
              onClick={onSearchPolicy}
            />
          </DxcFlex>
        </DxcFlex>

        {/* Total Face Amount Summary */}
        {policies.length > 0 && (
          <div className="total-face-amount">
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#000000" /* BLOOM */>
                Total Face Amount
              </DxcTypography>
              <DxcTypography fontSize="32px" fontWeight="font-weight-bold" color="#000000" /* BLOOM: Data values must be black */>
                {formatCurrency(totalFaceAmount)}
              </DxcTypography>
            </DxcFlex>
          </div>
        )}

        {/* Policy Cards */}
        {policies.length > 0 ? (
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            {policies.map((policy, index) => (
              <div key={policy.policyNumber || index}>
                {index > 0 && <div style={{ height: '16px' }} />}
                <div
                  className="policy-card"
                  onClick={() => onViewPolicy && onViewPolicy(policy)}
                >
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    {/* Policy Header */}
                    <DxcFlex justifyContent="space-between" alignItems="flex-start">
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                          <DxcTypography
                            fontSize="font-scale-03"
                            className="policy-number-link"
                          >
                            {policy.policyNumber}
                          </DxcTypography>
                          {policy.source && (
                            <DxcChip label={policy.source} size="small" />
                          )}
                        </DxcFlex>
                        <DxcFlex gap="var(--spacing-gap-s)">
                          <DxcBadge label={policy.adminStatus || 'N/A'} />
                          <DxcBadge label={policy.reportingStatus || 'N/A'} />
                        </DxcFlex>
                      </DxcFlex>
                      <DxcFlex direction="column" alignItems="flex-end" gap="var(--spacing-gap-xs)">
                        <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="#000000" /* BLOOM */>
                          {formatCurrency(policy.faceAmount)}
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                          Face Amount
                        </DxcTypography>
                      </DxcFlex>
                    </DxcFlex>

                    {/* Policy Details Grid */}
                    <div className="policy-details-grid">
                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                          Region
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01">
                          {policy.region || 'N/A'}
                        </DxcTypography>
                      </DxcFlex>

                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                          Co #
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01">
                          {policy.companyCode || policy.coNumber || 'N/A'}
                        </DxcTypography>
                      </DxcFlex>

                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                          Issue Date
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01">
                          {policy.issueDate || 'N/A'}
                        </DxcTypography>
                      </DxcFlex>

                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                          Product Type
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01">
                          {policy.productType || policy.policyType || 'N/A'}
                        </DxcTypography>
                      </DxcFlex>

                      {policy.planCode && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                            Plan Code
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01">
                            {policy.planCode}
                          </DxcTypography>
                        </DxcFlex>
                      )}

                      {policy.issueState && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                            Issue State
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01">
                            {policy.issueState}
                          </DxcTypography>
                        </DxcFlex>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <DxcFlex gap="var(--spacing-gap-s)">
                      <DxcButton
                        label="View Policy"
                        mode="tertiary"
                        size="small"
                        icon={iconEl("visibility")}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewPolicy && onViewPolicy(policy);
                        }}
                      />
                      <DxcButton
                        label="Dissociate"
                        mode="tertiary"
                        size="small"
                        icon={iconEl("link_off")}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDissociate && onDissociate(policy);
                        }}
                      />
                    </DxcFlex>
                  </DxcFlex>
                </div>
              </div>
            ))}
          </DxcFlex>
        ) : (
          <DxcContainer
            padding="var(--spacing-padding-l)"
            style={{ backgroundColor: 'var(--color-bg-neutral-lighter)', textAlign: 'center' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-fg-neutral-stronger)' }}>
                description
              </span>
              <DxcTypography color="#000000" /* BLOOM */>
                No policies associated with this claim
              </DxcTypography>
              <DxcButton
                label="Associate Policy"
                mode="primary"
                size="small"
                icon={iconEl("add")}
                onClick={onAssociate}
              />
            </DxcFlex>
          </DxcContainer>
        )}
      </DxcFlex>
    </DxcContainer>
  );
};

export default PolicySummaryPanel;
