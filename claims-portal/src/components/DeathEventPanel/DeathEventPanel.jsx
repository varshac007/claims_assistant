import { iconEl } from '../../utils/iconEl';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcBadge,
  DxcChip,
  DxcButton,
  DxcInset
} from '@dxc-technology/halstack-react';
import './DeathEventPanel.css';

/**
 * SA-003: Death Event Panel
 *
 * Displays death event details including:
 * - Date of Death
 * - Manner of Death
 * - Cause of Death
 * - Location (Death in USA?, Country)
 * - Verification source and confidence score
 * - Proof of Death details
 *
 * Maps to cmA "Death Claim Summary" section
 */
const DeathEventPanel = ({ claimData, onEdit }) => {
  const {
    dateOfDeath,
    mannerOfDeath,
    causeOfDeath,
    deathInUSA,
    countryOfDeath,
    proofOfDeathSourceType,
    proofOfDeathDate,
    certifiedDOB,
    verificationSource,
    verificationScore,
    specialEvent
  } = claimData || {};

  const getVerificationColor = (score) => {
    if (score >= 90) return 'var(--color-status-success-darker)';
    if (score >= 75) return 'var(--color-status-warning-darker)';
    return 'var(--color-status-error-darker)';
  };

  const getVerificationLabel = (score) => {
    if (score >= 90) return 'High Confidence';
    if (score >= 75) return 'Medium Confidence';
    return 'Low Confidence';
  };

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
              event
            </span>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Death Event
            </DxcTypography>
          </DxcFlex>
          {verificationScore !== undefined && (
            <DxcChip
              label={`${getVerificationLabel(verificationScore)} (${verificationScore}%)`}
              icon={iconEl("verified")}
              size="small"
            />
          )}
        </DxcFlex>

        {/* Main Death Event Information */}
        <div className="death-event-grid">
          {/* Date of Death */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
              Date of Death
            </DxcTypography>
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
              {dateOfDeath || 'N/A'}
            </DxcTypography>
          </DxcFlex>

          {/* Manner of Death */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
              Manner Of Death
            </DxcTypography>
            <DxcTypography fontSize="font-scale-02">
              {mannerOfDeath || 'N/A'}
            </DxcTypography>
          </DxcFlex>

          {/* Cause of Death */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
              Cause of Death
            </DxcTypography>
            <DxcTypography fontSize="font-scale-02">
              {causeOfDeath || 'N/A'}
            </DxcTypography>
          </DxcFlex>

          {/* Death Location */}
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
              Death Location
            </DxcTypography>
            <DxcTypography fontSize="font-scale-02">
              {deathInUSA === 'Yes' || deathInUSA === true ? 'United States' : countryOfDeath || 'N/A'}
            </DxcTypography>
          </DxcFlex>
        </div>

        {/* Proof of Death Section */}
        <DxcInset>
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-primary-stronger)' }}>
                description
              </span>
              <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                Proof of Death Verification
              </DxcTypography>
            </DxcFlex>

            <div className="proof-grid">
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Source Type
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01">
                  {proofOfDeathSourceType || 'Certified Death Certificate'}
                </DxcTypography>
              </DxcFlex>

              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Proof of Death Date
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01">
                  {proofOfDeathDate || dateOfDeath || 'N/A'}
                </DxcTypography>
              </DxcFlex>

              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Certified DOB
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01">
                  {certifiedDOB || 'N/A'}
                </DxcTypography>
              </DxcFlex>

              {verificationSource && (
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Verification Source
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-01">
                    {verificationSource}
                  </DxcTypography>
                </DxcFlex>
              )}
            </div>

            {verificationScore !== undefined && (
              <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getVerificationColor(verificationScore)
                  }}
                />
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                  Death verification confidence: {verificationScore}%
                  {verificationScore >= 90 ? ' - Auto-verified via LexisNexis' : ' - Manual review required'}
                </DxcTypography>
              </DxcFlex>
            )}
          </DxcFlex>
        </DxcInset>

        {/* Special Event Badge */}
        {specialEvent && specialEvent !== 'None' && (
          <DxcFlex>
            <DxcBadge label={`Special Event: ${specialEvent}`} />
          </DxcFlex>
        )}

        {/* Action Button */}
        {onEdit && (
          <DxcFlex>
            <DxcButton
              label="Update Death Details"
              mode="secondary"
              size="small"
              icon={iconEl("edit")}
              onClick={onEdit}
            />
          </DxcFlex>
        )}
      </DxcFlex>
    </DxcContainer>
  );
};

export default DeathEventPanel;
