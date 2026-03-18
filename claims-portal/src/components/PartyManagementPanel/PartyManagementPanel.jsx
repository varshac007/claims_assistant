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
import './PartyManagementPanel.css';

/**
 * SA-005: Party Management Panel
 *
 * Displays all 9 party types with roles and verification status:
 * - Insured
 * - Notifier
 * - Recipient
 * - Owner
 * - Primary Beneficiary
 * - Contingent Beneficiary
 * - Agent
 * - Assignee
 * - Funeral Home
 *
 * Maps to cmA "Claim Party Information" section
 */
const PartyManagementPanel = ({ parties = [], onAddParty, onEditParty, onChangeInsured, onCSLNSearch }) => {
  const getVerificationColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'VERIFIED' || statusUpper === 'PASSED') return 'success';
    if (statusUpper === 'PENDING' || statusUpper === 'IN_PROGRESS') return 'warning';
    if (statusUpper === 'FAILED' || statusUpper === 'NOT_VERIFIED') return 'error';
    return 'neutral';
  };

  const getRoleIcon = (role) => {
    const roleUpper = (role || '').toUpperCase();
    if (roleUpper.includes('INSURED')) return 'person';
    if (roleUpper.includes('BENEFICIARY')) return 'account_balance_wallet';
    if (roleUpper.includes('OWNER')) return 'badge';
    if (roleUpper.includes('AGENT')) return 'support_agent';
    if (roleUpper.includes('NOTIFIER')) return 'notification_important';
    if (roleUpper.includes('RECIPIENT')) return 'mail';
    if (roleUpper.includes('ASSIGNEE')) return 'assignment';
    if (roleUpper.includes('FUNERAL')) return 'local_florist';
    return 'person_outline';
  };

  const getCSLNBadgeType = (result) => {
    const resultUpper = (result || '').toUpperCase();
    if (resultUpper.includes('PASS') || resultUpper.includes('MATCH')) return 'success';
    if (resultUpper.includes('PENDING') || resultUpper.includes('REVIEW')) return 'warning';
    if (resultUpper.includes('FAIL') || resultUpper.includes('NO_MATCH')) return 'error';
    return 'neutral';
  };

  // Group parties by type
  const partyGroups = {};
  parties.forEach(party => {
    const key = party.role || 'Other';
    if (!partyGroups[key]) {
      partyGroups[key] = [];
    }
    partyGroups[key].push(party);
  });

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
              groups
            </span>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Party Management
            </DxcTypography>
            <DxcChip label={`${parties.length} ${parties.length === 1 ? 'Party' : 'Parties'}`} size="small" />
          </DxcFlex>
          <DxcFlex gap="var(--spacing-gap-xs)">
            <DxcButton
              label="Add Party"
              mode="primary"
              size="small"
              icon={iconEl("person_add")}
              onClick={onAddParty}
            />
            <DxcButton
              label="Change Insured"
              mode="secondary"
              size="small"
              icon={iconEl("swap_horiz")}
              onClick={onChangeInsured}
            />
          </DxcFlex>
        </DxcFlex>

        {/* Party Cards */}
        {parties.length > 0 ? (
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            {parties.map((party, index) => (
              <div key={party.id || index}>
                {index > 0 && <DxcDivider />}
                <DxcContainer
                  padding="var(--spacing-padding-m)"
                  style={{
                    backgroundColor: 'var(--color-bg-neutral-lighter)',
                    cursor: 'pointer'
                  }}
                  onClick={() => onEditParty && onEditParty(party)}
                >
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    {/* Party Header */}
                    <DxcFlex justifyContent="space-between" alignItems="flex-start">
                      <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                        <span
                          className="material-icons"
                          style={{
                            fontSize: '32px',
                            color: 'var(--color-fg-primary-stronger)',
                            backgroundColor: 'var(--color-bg-primary-lightest)',
                            borderRadius: '50%',
                            padding: '8px'
                          }}
                        >
                          {getRoleIcon(party.role)}
                        </span>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                            {party.name || 'Unknown'}
                          </DxcTypography>
                          <DxcFlex gap="var(--spacing-gap-xs)">
                            <DxcBadge label={party.role || 'Unknown Role'} />
                            {party.source && (
                              <DxcChip label={`Source: ${party.source}`} size="small" />
                            )}
                          </DxcFlex>
                        </DxcFlex>
                      </DxcFlex>
                      <DxcFlex direction="column" alignItems="flex-end" gap="var(--spacing-gap-xs)">
                        {party.verificationStatus && (
                          <DxcBadge label={party.verificationStatus} />
                        )}
                        {party.verificationScore !== undefined && (
                          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: party.verificationScore >= 90 ? 'var(--color-status-success-darker)' : party.verificationScore >= 75 ? 'var(--color-status-warning-darker)' : 'var(--color-status-error-darker)'
                              }}
                            />
                            <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                              {party.verificationScore}%
                            </DxcTypography>
                          </DxcFlex>
                        )}
                      </DxcFlex>
                    </DxcFlex>

                    {/* Party Details Grid */}
                    <div className="party-details-grid">
                      {party.resState && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            Residence State
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01">
                            {party.resState}
                          </DxcTypography>
                        </DxcFlex>
                      )}

                      {party.dateOfBirth && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            Date of Birth
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01">
                            {party.dateOfBirth}
                          </DxcTypography>
                        </DxcFlex>
                      )}

                      {party.ssn && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            SSN
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01">
                            {party.ssn}
                          </DxcTypography>
                        </DxcFlex>
                      )}

                      {party.phone && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            Phone
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01">
                            {party.phone}
                          </DxcTypography>
                        </DxcFlex>
                      )}

                      {party.email && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            Email
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01">
                            {party.email}
                          </DxcTypography>
                        </DxcFlex>
                      )}

                      {party.address && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            Address
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01">
                            {party.address}
                          </DxcTypography>
                        </DxcFlex>
                      )}
                    </div>

                    {/* CSLN Verification */}
                    {(party.cslnAction || party.cslnResult) && (
                      <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            CSLN Action
                          </DxcTypography>
                          <DxcTypography fontSize="font-scale-01">
                            {party.cslnAction || 'N/A'}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                            CSLN Result
                          </DxcTypography>
                          <DxcBadge label={party.cslnResult || 'N/A'} />
                        </DxcFlex>
                      </DxcFlex>
                    )}

                    {/* Action Buttons */}
                    <DxcFlex gap="var(--spacing-gap-s)">
                      <DxcButton
                        label="Edit"
                        mode="tertiary"
                        size="small"
                        icon={iconEl("edit")}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditParty && onEditParty(party);
                        }}
                      />
                      {onCSLNSearch && (
                        <DxcButton
                          label="CSLN Search"
                          mode="tertiary"
                          size="small"
                          icon={iconEl("search")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCSLNSearch(party);
                          }}
                        />
                      )}
                    </DxcFlex>
                  </DxcFlex>
                </DxcContainer>
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
                groups
              </span>
              <DxcTypography color="var(--color-fg-neutral-strong)">
                No parties associated with this claim
              </DxcTypography>
              <DxcButton
                label="Add Party"
                mode="primary"
                size="small"
                icon={iconEl("person_add")}
                onClick={onAddParty}
              />
            </DxcFlex>
          </DxcContainer>
        )}
      </DxcFlex>
    </DxcContainer>
  );
};

export default PartyManagementPanel;
