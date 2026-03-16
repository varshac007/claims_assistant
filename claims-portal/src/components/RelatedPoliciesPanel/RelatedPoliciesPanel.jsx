import { useState, useEffect } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcBadge,
  DxcButton,
  DxcChip,
  DxcAlert,
  DxcSpinner
} from '@dxc-technology/halstack-react';
import { findRelatedPoliciesForDeathClaim } from '../../services/api/policyService';
import './RelatedPoliciesPanel.css';

/**
 * Related Policies Panel for Death Claims
 *
 * Automatically searches for and displays other policies where the deceased
 * was the insured or owner. This helps claims handlers identify all policies
 * that may require death claims to be filed.
 *
 * Features:
 * - Automatic search on load
 * - Groups policies by relationship (as insured, as owner)
 * - Shows total potential death benefit
 * - Actions to initiate claims on related policies
 */
const RelatedPoliciesPanel = ({ claimData, onInitiateClaim, onViewPolicy }) => {
  const [relatedPolicies, setRelatedPolicies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchRelatedPolicies = async () => {
      if (!claimData?.insured) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const deceasedInfo = {
          ssn: claimData.insured.ssn,
          name: claimData.insured.name,
          dateOfBirth: claimData.insured.dateOfBirth
        };

        // Exclude the current claim's policy
        const currentPolicyNumber = claimData.policy?.policyNumber;

        const result = await findRelatedPoliciesForDeathClaim(deceasedInfo, currentPolicyNumber);
        setRelatedPolicies(result);
      } catch (err) {
        console.error('Error searching for related policies:', err);
        setError('Unable to search for related policies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    searchRelatedPolicies();
  }, [claimData]);

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadgeMode = (status) => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper.includes('IN FORCE') || statusUpper.includes('ACTIVE')) return 'success';
    if (statusUpper.includes('PENDING')) return 'warning';
    return 'neutral';
  };

  if (loading) {
    return (
      <DxcContainer
        padding="var(--spacing-padding-m)"
        style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center">
          <DxcSpinner label="Searching for related policies..." />
        </DxcFlex>
      </DxcContainer>
    );
  }

  if (error) {
    return (
      <DxcContainer
        padding="var(--spacing-padding-m)"
        style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
      >
        <DxcAlert type="error" size="large">
          {error}
        </DxcAlert>
      </DxcContainer>
    );
  }

  const allPolicies = [...(relatedPolicies?.asInsured || []), ...(relatedPolicies?.asOwner || [])];
  const hasRelatedPolicies = allPolicies.length > 0;

  return (
    <DxcContainer
      padding="var(--spacing-padding-m)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ color: 'var(--color-fg-primary-stronger)', fontSize: '20px' }}>
              policy
            </span>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Other Policies Requiring Claims
            </DxcTypography>
            {hasRelatedPolicies && (
              <DxcChip
                label={`${relatedPolicies.total} Found`}
                size="small"
                color="error"
              />
            )}
          </DxcFlex>
        </DxcFlex>

        {/* Alert if policies found */}
        {hasRelatedPolicies && (
          <DxcAlert type="warning" size="fitContent">
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
              <DxcTypography fontWeight="font-weight-semibold">
                Additional Policies Identified
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01">
                The deceased has {relatedPolicies.total} other {relatedPolicies.total === 1 ? 'policy' : 'policies'} that may require death claims.
                Total potential death benefit: <strong>{formatCurrency(relatedPolicies.totalFaceAmount)}</strong>
              </DxcTypography>
            </DxcFlex>
          </DxcAlert>
        )}

        {/* Policy Cards */}
        {hasRelatedPolicies ? (
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            {allPolicies.map((policy, index) => (
              <div
                key={policy.policyNumber || index}
                className="related-policy-card"
              >
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  {/* Policy Header */}
                  <DxcFlex justifyContent="space-between" alignItems="flex-start">
                    <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                      <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                        <DxcTypography
                          fontSize="font-scale-03"
                          fontWeight="font-weight-semibold"
                          className="policy-number-link"
                          onClick={() => onViewPolicy && onViewPolicy(policy)}
                        >
                          {policy.policyNumber}
                        </DxcTypography>
                        <DxcBadge
                          label={policy.policyStatus || policy.status || 'In Force'}
                        />
                      </DxcFlex>
                      <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                        {policy.policyType || policy.type} • Issued {policy.issueDate}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" alignItems="flex-end" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-bold" color="var(--color-fg-error-darker)">
                        {formatCurrency(policy.faceAmount)}
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                        Death Benefit
                      </DxcTypography>
                    </DxcFlex>
                  </DxcFlex>

                  {/* Policy Details */}
                  <div className="related-policy-details-grid">
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                        Insured
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                        {policy.insured || claimData.insured.name}
                      </DxcTypography>
                    </DxcFlex>

                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                        Owner
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-01">
                        {policy.owner || 'N/A'}
                      </DxcTypography>
                    </DxcFlex>

                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                        Region
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-01">
                        {policy.region || 'N/A'}
                      </DxcTypography>
                    </DxcFlex>

                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                        Company
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-01">
                        {policy.companyCode || 'N/A'}
                      </DxcTypography>
                    </DxcFlex>

                    {policy.currentCashValue && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                          Cash Value
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01">
                          {formatCurrency(policy.currentCashValue)}
                        </DxcTypography>
                      </DxcFlex>
                    )}

                    {policy.loanBalance > 0 && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                          Loan Balance
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-warning-darker)">
                          {formatCurrency(policy.loanBalance)}
                        </DxcTypography>
                      </DxcFlex>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <DxcFlex gap="var(--spacing-gap-s)">
                    <DxcButton
                      label="Initiate Death Claim"
                      mode="primary"
                      size="small"
                      icon="add"
                      onClick={() => onInitiateClaim && onInitiateClaim(policy)}
                    />
                    <DxcButton
                      label="View Policy Details"
                      mode="secondary"
                      size="small"
                      icon="visibility"
                      onClick={() => onViewPolicy && onViewPolicy(policy)}
                    />
                  </DxcFlex>
                </DxcFlex>
              </div>
            ))}
          </DxcFlex>
        ) : (
          <DxcContainer
            padding="var(--spacing-padding-l)"
            style={{ backgroundColor: 'var(--color-bg-neutral-lighter)', textAlign: 'center' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-fg-success-darker)' }}>
                check_circle
              </span>
              <DxcTypography fontWeight="font-weight-semibold">
                No Other Policies Found
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                The deceased does not have any other active policies requiring death claims.
              </DxcTypography>
            </DxcFlex>
          </DxcContainer>
        )}
      </DxcFlex>
    </DxcContainer>
  );
};

export default RelatedPoliciesPanel;
