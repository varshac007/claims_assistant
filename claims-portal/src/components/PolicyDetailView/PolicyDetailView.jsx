import { iconEl } from '../../utils/iconEl';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcDivider,
  DxcTabs,
  DxcInset
} from '@dxc-technology/halstack-react';
import { useState } from 'react';
import './PolicyDetailView.css';

/**
 * SA-014: Policy Detail View Modal
 *
 * Displays comprehensive policy information:
 * - Policy overview (number, type, status, dates)
 * - Coverage details (face amount, cash value, loans)
 * - Beneficiary designations with percentages
 * - Owner/insured information
 * - Premium and billing details
 * - Policy history and changes
 *
 * Integrates with Policy Admin System of Record
 */
const PolicyDetailView = ({ policy, onEdit, onClose, onSuspend, onAssociate, onDissociate }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!policy) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'IN FORCE' || statusUpper === 'ACTIVE') return 'var(--color-fg-success-medium)';
    if (statusUpper === 'SUSPENDED') return 'var(--color-fg-warning-medium)';
    if (statusUpper === 'LAPSED' || statusUpper === 'CANCELLED') return 'var(--color-fg-error-medium)';
    return 'var(--color-fg-neutral-dark)';
  };

  return (
    <DxcContainer
      padding="var(--spacing-padding-m)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Header */}
        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ color: 'var(--color-fg-primary-stronger)', fontSize: '24px' }}>
              policy
            </span>
            <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
              Policy Details
            </DxcTypography>
            <DxcBadge label={policy.policyStatus || policy.status || 'Unknown'} />
          </DxcFlex>
          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
            {policy.policyNumber}
          </DxcTypography>
        </DxcFlex>

        {/* Quick Stats */}
        <div className="policy-stats-grid">
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-info-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                FACE AMOUNT
              </DxcTypography>
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                {formatCurrency(policy.faceAmount)}
              </DxcTypography>
            </DxcFlex>
          </DxcContainer>

          {policy.currentCashValue !== undefined && (
            <DxcContainer
              padding="var(--spacing-padding-m)"
              style={{ backgroundColor: 'var(--color-bg-success-lighter)' }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  CASH VALUE
                </DxcTypography>
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-success-medium)">
                  {formatCurrency(policy.currentCashValue)}
                </DxcTypography>
              </DxcFlex>
            </DxcContainer>
          )}

          {policy.loanBalance > 0 && (
            <DxcContainer
              padding="var(--spacing-padding-m)"
              style={{ backgroundColor: 'var(--color-bg-warning-lighter)' }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  LOAN BALANCE
                </DxcTypography>
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)">
                  {formatCurrency(policy.loanBalance)}
                </DxcTypography>
              </DxcFlex>
            </DxcContainer>
          )}
        </div>

        <DxcDivider />

        {/* Tabs */}
        <DxcTabs iconPosition="left">
          <DxcTabs.Tab
            label="Overview"
            icon={iconEl("info")}
            active={activeTab === 0}
            onClick={() => setActiveTab(0)}
          >
            <div />
          </DxcTabs.Tab>
          <DxcTabs.Tab
            label="Coverage"
            icon={iconEl("shield")}
            active={activeTab === 1}
            onClick={() => setActiveTab(1)}
          >
            <div />
          </DxcTabs.Tab>
          <DxcTabs.Tab
            label="Beneficiaries"
            icon={iconEl("people")}
            active={activeTab === 2}
            onClick={() => setActiveTab(2)}
          >
            <div />
          </DxcTabs.Tab>
          <DxcTabs.Tab
            label="Billing"
            icon={iconEl("payment")}
            active={activeTab === 3}
            onClick={() => setActiveTab(3)}
          >
            <div />
          </DxcTabs.Tab>
        </DxcTabs>

        {/* Tab Content */}
        <DxcInset>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <div className="policy-details-grid">
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Policy Type
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                    {policy.policyType || policy.type}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Issue Date
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {formatDate(policy.issueDate)}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Issue State
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {policy.issueState || 'N/A'}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Region
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {policy.region || 'N/A'}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Company Code
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {policy.companyCode || 'N/A'}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Plan Code
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {policy.planCode || 'N/A'}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Owner
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {policy.owner || 'N/A'}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Paid To Date
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {formatDate(policy.paidToDate)}
                  </DxcTypography>
                </DxcFlex>
              </div>
            </DxcFlex>
          )}

          {/* Coverage Tab */}
          {activeTab === 1 && (
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcContainer
                padding="var(--spacing-padding-m)"
                style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
              >
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                    Coverage Summary
                  </DxcTypography>

                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcTypography fontSize="font-scale-01">
                      Death Benefit (Face Amount)
                    </DxcTypography>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                      {formatCurrency(policy.faceAmount)}
                    </DxcTypography>
                  </DxcFlex>

                  {policy.loanBalance > 0 && (
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcTypography fontSize="font-scale-01" color="var(--color-fg-error-medium)">
                        - Outstanding Loan
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)">
                        {formatCurrency(policy.loanBalance)}
                      </DxcTypography>
                    </DxcFlex>
                  )}

                  <DxcDivider />

                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                      Net Death Benefit
                    </DxcTypography>
                    <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-success-darker)">
                      {formatCurrency(policy.faceAmount - (policy.loanBalance || 0))}
                    </DxcTypography>
                  </DxcFlex>
                </DxcFlex>
              </DxcContainer>

              {policy.riders && policy.riders.length > 0 && (
                <DxcContainer
                  padding="var(--spacing-padding-m)"
                  style={{ backgroundColor: 'var(--color-bg-info-lightest)' }}
                >
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                      Riders & Endorsements
                    </DxcTypography>
                    {policy.riders.map((rider, index) => (
                      <DxcFlex key={index} justifyContent="space-between" alignItems="center">
                        <DxcTypography fontSize="font-scale-01">
                          {rider.name}
                        </DxcTypography>
                        <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                          {formatCurrency(rider.amount)}
                        </DxcTypography>
                      </DxcFlex>
                    ))}
                  </DxcFlex>
                </DxcContainer>
              )}
            </DxcFlex>
          )}

          {/* Beneficiaries Tab */}
          {activeTab === 2 && (
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              {policy.beneficiaries && policy.beneficiaries.length > 0 ? (
                policy.beneficiaries.map((beneficiary, index) => (
                  <DxcContainer
                    key={index}
                    padding="var(--spacing-padding-m)"
                    style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
                  >
                    <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                      <DxcFlex justifyContent="space-between" alignItems="center">
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                          {beneficiary.name}
                        </DxcTypography>
                        <DxcBadge label={beneficiary.type || 'Primary'} />
                      </DxcFlex>

                      <div className="beneficiary-details-grid">
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            Relationship
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01">
                            {beneficiary.relationship || 'N/A'}
                          </DxcTypography>
                        </DxcFlex>

                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            Percentage
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                            {beneficiary.percentage}%
                          </DxcTypography>
                        </DxcFlex>

                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            Share Amount
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                            {formatCurrency((policy.faceAmount * beneficiary.percentage) / 100)}
                          </DxcTypography>
                        </DxcFlex>
                      </div>
                    </DxcFlex>
                  </DxcContainer>
                ))
              ) : (
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                  No beneficiaries on file
                </DxcTypography>
              )}
            </DxcFlex>
          )}

          {/* Billing Tab */}
          {activeTab === 3 && (
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <div className="policy-details-grid">
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Premium Amount
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                    {formatCurrency(policy.premiumAmount || policy.premium)}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Premium Frequency
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {policy.premiumFrequency || 'Annual'}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Billing Mode
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {policy.billingMode || 'Direct Bill'}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Next Premium Due
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {formatDate(policy.nextPremiumDue)}
                  </DxcTypography>
                </DxcFlex>
              </div>
            </DxcFlex>
          )}
        </DxcInset>

        <DxcDivider />

        {/* Actions */}
        <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap">
          {onEdit && (
            <DxcButton
              label="Edit Policy"
              mode="secondary"
              icon={iconEl("edit")}
              onClick={() => onEdit(policy)}
            />
          )}
          {onSuspend && policy.policyStatus === 'In Force' && (
            <DxcButton
              label="Suspend Policy"
              mode="secondary"
              icon={iconEl("pause")}
              onClick={() => onSuspend(policy)}
            />
          )}
          {onAssociate && (
            <DxcButton
              label="Associate to Claim"
              mode="primary"
              icon={iconEl("link")}
              onClick={() => onAssociate(policy)}
            />
          )}
          {onDissociate && (
            <DxcButton
              label="Remove from Claim"
              mode="secondary"
              icon={iconEl("link_off")}
              onClick={() => onDissociate(policy)}
            />
          )}
        </DxcFlex>

        {/* Source Info */}
        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
          Source: {policy.source || 'Policy Admin System'} | Last Updated: {formatDate(policy.lastUpdated || new Date())}
        </DxcTypography>
      </DxcFlex>
    </DxcContainer>
  );
};

export default PolicyDetailView;
