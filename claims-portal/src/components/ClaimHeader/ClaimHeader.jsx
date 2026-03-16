import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcBadge,
  DxcButton,
  DxcChip
} from '@dxc-technology/halstack-react';
import STPBadge from '../shared/STPBadge';
import './ClaimHeader.css';

/**
 * SA-002: Persistent Claim Header
 *
 * Displays at top of all claim screens showing:
 * - Claim number and status
 * - Insured/claimant name
 * - STP indicator
 * - Key metrics (SLA, Days Open, Amount)
 * - Quick actions (Hold, Approve, Deny, Assign)
 *
 * Always visible across all claim-related pages
 */
const ClaimHeader = ({
  claim,
  onHold,
  onApprove,
  onDeny,
  onAssign,
  onBack
}) => {
  if (!claim) {
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

  const getSLAColor = (daysRemaining) => {
    if (daysRemaining <= 3) return 'var(--color-fg-error-medium)';
    if (daysRemaining <= 7) return 'var(--color-fg-warning-medium)';
    return 'var(--color-fg-success-medium)';
  };

  const slaDate = claim.workflow?.sla?.dueDate ? new Date(claim.workflow.sla.dueDate) : null;
  const today = new Date();
  const daysRemaining = slaDate ? Math.ceil((slaDate - today) / (1000 * 60 * 60 * 24)) : null;
  const isClosed = !!claim.closedAt;
  const closeDate = isClosed ? new Date(claim.closedAt) : null;
  const metSla = isClosed && slaDate ? closeDate <= slaDate : null;
  const daysOpen = claim.workflow?.daysOpen || 0;

  return (
    <DxcContainer
      padding="var(--spacing-padding-m)"
      style={{
        backgroundColor: 'var(--color-bg-primary-lightest)',
        borderBottom: '2px solid var(--color-border-primary-stronger)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Top Row: Claim Info and Actions */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          {/* Left: Claim Identification */}
          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
            {onBack && (
              <DxcButton
                mode="tertiary"
                icon="arrow_back"
                onClick={onBack}
              />
            )}

            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
                  {claim.claimNumber}
                </DxcTypography>
                <DxcBadge label={claim.status} />
                {claim.routing && (
                  <STPBadge routing={claim.routing.type} size="medium" />
                )}
              </DxcFlex>

              <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-neutral-strong)' }}>
                  person
                </span>
                <DxcTypography fontSize="font-scale-02" color="#000000" /* BLOOM */>
                  {claim.insured?.name || claim.claimant?.name || 'Unknown'}
                </DxcTypography>
                <span style={{ color: 'var(--color-fg-neutral-stronger)' }}>|</span>
                <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                  Policy: {claim.policy?.policyNumber || 'N/A'}
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>

          {/* Right: Quick Actions */}
          <DxcFlex gap="var(--spacing-gap-s)">
            {onAssign && (
              <DxcButton
                label="Assign"
                mode="tertiary"
                size="small"
                icon="person_add"
                onClick={onAssign}
              />
            )}
            {onHold && claim.status !== 'ON_HOLD' && (
              <DxcButton
                label="Hold"
                mode="secondary"
                size="small"
                icon="pause"
                onClick={onHold}
              />
            )}
            {onApprove && claim.status === 'UNDER_REVIEW' && (
              <DxcButton
                label="Approve"
                mode="primary"
                size="small"
                icon="check_circle"
                onClick={onApprove}
              />
            )}
            {onDeny && claim.status === 'UNDER_REVIEW' && (
              <DxcButton
                label="Deny"
                mode="secondary"
                size="small"
                icon="cancel"
                onClick={onDeny}
              />
            )}
          </DxcFlex>
        </DxcFlex>

        {/* Bottom Row: Key Metrics */}
        <div className="claim-header-metrics">
          {/* Claim Amount */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
              CLAIM AMOUNT
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              {formatCurrency(claim.financial?.claimAmount)}
            </DxcTypography>
          </DxcFlex>

          {/* Days Open */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
              DAYS OPEN
            </DxcTypography>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              {daysOpen}
            </DxcTypography>
          </DxcFlex>

          {/* SLA — closed claims show Met/Missed; open claims show countdown */}
          {isClosed ? (
            <>
              {slaDate && (
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                    SLA STATUS
                  </DxcTypography>
                  <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                    <span className="material-icons" style={{ fontSize: '18px', color: metSla ? 'var(--color-fg-success-medium)' : 'var(--color-fg-error-medium)' }}>
                      {metSla ? 'check_circle' : 'cancel'}
                    </span>
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" style={{ color: '#000000' }}>
                      {metSla ? 'Met' : 'Missed'}
                    </DxcTypography>
                  </DxcFlex>
                </DxcFlex>
              )}
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                  CLOSED DATE
                </DxcTypography>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  {closeDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                </DxcTypography>
              </DxcFlex>
            </>
          ) : (
            <>
              {daysRemaining !== null && (
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                    SLA DAYS REMAINING
                  </DxcTypography>
                  <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                    <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" style={{ color: '#000000' }}>
                      {daysRemaining}
                    </DxcTypography>
                    {daysRemaining <= 3 && (
                      <span className="material-icons" style={{ fontSize: '20px', color: 'var(--color-fg-error-medium)' }}>
                        warning
                      </span>
                    )}
                  </DxcFlex>
                </DxcFlex>
              )}
              {slaDate && (
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                    TARGET CLOSE DATE
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                    {slaDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                  </DxcTypography>
                </DxcFlex>
              )}
            </>
          )}

          {/* Examiner */}
          {claim.workflow?.assignedTo && (
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                EXAMINER
              </DxcTypography>
              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                {claim.workflow.assignedTo}
              </DxcTypography>
            </DxcFlex>
          )}

          {/* Requirements Progress */}
          {claim.requirements && claim.requirements.length > 0 && (
            <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
              <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                REQUIREMENTS
              </DxcTypography>
              <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  {claim.requirements.filter(r => r.status === 'satisfied').length}/{claim.requirements.length}
                </DxcTypography>
                <DxcChip
                  label={`${Math.round((claim.requirements.filter(r => r.status === 'satisfied').length / claim.requirements.length) * 100)}%`}
                  size="small"
                />
              </DxcFlex>
            </DxcFlex>
          )}
        </div>
      </DxcFlex>
    </DxcContainer>
  );
};

export default ClaimHeader;
