import { useState, useMemo } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcTextInput,
  DxcSelect,
  DxcDateInput,
  DxcButton,
  DxcBadge,
  DxcTabs,
  DxcInset,
  DxcChip,
  DxcRadioGroup,
  DxcFileInput,
  DxcAlert,
  DxcTable,
  DxcProgressBar,
  DxcDialog,
  DxcSpinner
} from '@dxc-technology/halstack-react';
import { useClaims } from '../../contexts/ClaimsContext';
import BeneficiaryAnalyzer from '../BeneficiaryAnalyzer/BeneficiaryAnalyzer';
import './FNOLWorkspace.css';

/**
 * Claim Notifications - Examiner persona
 * Structure: 4-stage progressive tab flow
 * 1. Policy Match
 * 2. Related Policy Search
 * 3. Beneficiary Analyzer
 * 4. Claim Packet Generation
 */
const FNOLWorkspace = ({ onClaimSelect }) => {
  const [activeStage, setActiveStage] = useState(0);
  const [submissionSource, setSubmissionSource] = useState('portal');

  // Stage 1: Policy Match state
  const [insuredName, setInsuredName] = useState('');
  const [insuredSSN, setInsuredSSN] = useState('');
  const [insuredDOB, setInsuredDOB] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [policySearchValue, setPolicySearchValue] = useState('');
  const [matchedPolicy, setMatchedPolicy] = useState(null);
  const [searching, setSearching] = useState(false);

  // Stage 2: Related Policy Search state
  const [relatedPolicies, setRelatedPolicies] = useState([]);
  const [associatedPolicies, setAssociatedPolicies] = useState([]);
  const [manualSearchValue, setManualSearchValue] = useState('');
  const [ownerChangeItems, setOwnerChangeItems] = useState([]);

  // Stage 3: Beneficiary Analyzer state
  const [selectedPolicyForBeneficiary, setSelectedPolicyForBeneficiary] = useState(null);

  // Stage 4: Claim Packet Generation state
  const [deliveryMethod, setDeliveryMethod] = useState('email');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientFax, setRecipientFax] = useState('');
  const [packetGenerated, setPacketGenerated] = useState(false);

  // Death Verification state
  const [deathSearchStatus, setDeathSearchStatus] = useState('not_started');
  const [deathCertificateProvided, setDeathCertificateProvided] = useState(false);
  const [deathRecordFiles, setDeathRecordFiles] = useState([]);

  // Demo data for related policies
  const demoRelatedPolicies = [
    {
      id: 'POL-2024-001',
      policyNumber: 'WR-LI-2019-445501',
      type: 'Whole Life',
      status: 'In Force',
      coverage: 500000,
      insuredRole: 'Insured',
      ownerRole: 'Owner',
      issueDate: '2019-03-15',
      autoAssociated: true
    },
    {
      id: 'POL-2024-002',
      policyNumber: 'WR-TL-2021-667802',
      type: 'Term Life',
      status: 'In Force',
      coverage: 250000,
      insuredRole: 'Insured',
      ownerRole: 'Owner',
      issueDate: '2021-07-22',
      autoAssociated: true
    },
    {
      id: 'POL-2024-003',
      policyNumber: 'WR-AN-2020-339903',
      type: 'Fixed Annuity',
      status: 'In Force',
      coverage: 150000,
      insuredRole: 'Owner',
      ownerRole: 'Owner',
      issueDate: '2020-11-10',
      autoAssociated: false,
      ownerChangeRequired: true
    }
  ];

  const handlePolicySearch = () => {
    setSearching(true);
    // Simulate search delay
    setTimeout(() => {
      setMatchedPolicy({
        policyNumber: policySearchValue || 'WR-LI-2019-445501',
        type: 'Whole Life',
        status: 'In Force',
        insuredName: insuredName || 'James R. Smith',
        coverage: '$500,000',
        issueDate: '03/15/2019',
        premiumStatus: 'Current'
      });
      setSearching(false);
    }, 1200);
  };

  const handleRelatedPolicySearch = () => {
    setSearching(true);
    setTimeout(() => {
      setRelatedPolicies(demoRelatedPolicies);
      // Auto-associate policies where insured was the covered party
      const autoAssoc = demoRelatedPolicies.filter(p => p.autoAssociated);
      setAssociatedPolicies(autoAssoc.map(p => p.id));
      // Check for owner change items
      const ownerChanges = demoRelatedPolicies.filter(p => p.ownerChangeRequired);
      setOwnerChangeItems(ownerChanges);
      setSearching(false);
    }, 1500);
  };

  const handleAssociatePolicy = (policyId) => {
    if (!associatedPolicies.includes(policyId)) {
      setAssociatedPolicies(prev => [...prev, policyId]);
    }
  };

  const handleDisassociatePolicy = (policyId) => {
    setAssociatedPolicies(prev => prev.filter(id => id !== policyId));
  };

  const handleDeathSearch = () => {
    setDeathSearchStatus('searching');
    setTimeout(() => {
      setDeathSearchStatus('found');
    }, 2000);
  };

  const handleGeneratePacket = () => {
    setPacketGenerated(true);
  };

  const sourceOptions = [
    { label: 'Portal Submission', value: 'portal' },
    { label: 'Call Center Notification', value: 'call_center' },
    { label: 'Electronic Death Match', value: 'edm' },
    { label: 'Other', value: 'other' }
  ];

  const isElectronicDeathMatch = submissionSource === 'edm';
  const deathVerificationRequired = !deathCertificateProvided && !isElectronicDeathMatch;

  // Progress calculation
  const stageProgress = useMemo(() => {
    let completed = 0;
    if (matchedPolicy) completed++;
    if (associatedPolicies.length > 0) completed++;
    if (selectedPolicyForBeneficiary) completed++;
    if (packetGenerated) completed++;
    return Math.round((completed / 4) * 100);
  }, [matchedPolicy, associatedPolicies, selectedPolicyForBeneficiary, packetGenerated]);

  return (
    <div className="fnol-workspace">
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcHeading level={1} text="Claim Notifications" />
          <DxcBadge label="Examiner" mode="contextual" color="info" />
        </DxcFlex>

        {/* Submission Source Indicator */}
        <div style={{
          backgroundColor: "var(--color-bg-neutral-lightest)",
          borderRadius: "var(--border-radius-m)",
          boxShadow: "var(--shadow-mid-04)",
          padding: "var(--spacing-padding-m)"
        }}>
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcHeading level={4} text="Submission Source" />
            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
              <DxcSelect
                label="Source Type"
                value={submissionSource}
                onChange={({ value }) => setSubmissionSource(value)}
                options={sourceOptions}
                size="medium"
              />
              <div className="source-indicator">
                {submissionSource === 'portal' && <DxcBadge label="Portal Submission" mode="contextual" color="info" />}
                {submissionSource === 'call_center' && <DxcBadge label="Call Center" mode="contextual" color="warning" />}
                {submissionSource === 'edm' && <DxcBadge label="Electronic Death Match" mode="contextual" color="error" />}
                {submissionSource === 'other' && <DxcBadge label="Other Source" mode="contextual" color="neutral" />}
              </div>
            </DxcFlex>
          </DxcFlex>
        </div>

        {/* Overall Progress */}
        <DxcProgressBar
          label="FNOL Progress"
          helperText={`${stageProgress}% complete`}
          value={stageProgress}
          showValue
        />

        {/* Stage Tabs */}
        <div style={{
          backgroundColor: "var(--color-bg-neutral-lightest)",
          borderRadius: "var(--border-radius-m)",
          boxShadow: "var(--shadow-mid-04)",
          padding: "var(--spacing-padding-m)"
        }}>
          <DxcTabs iconPosition="left">
            <DxcTabs.Tab
              label="1. Policy Match"
              icon="search"
              active={activeStage === 0}
              onClick={() => setActiveStage(0)}
            >
              <div />
            </DxcTabs.Tab>
            <DxcTabs.Tab
              label="2. Related Policy Search"
              icon="policy"
              active={activeStage === 1}
              onClick={() => setActiveStage(1)}
            >
              <div />
            </DxcTabs.Tab>
            <DxcTabs.Tab
              label="3. Claimant Analyzer"
              icon="people"
              active={activeStage === 2}
              onClick={() => setActiveStage(2)}
            >
              <div />
            </DxcTabs.Tab>
            <DxcTabs.Tab
              label="4. Claim Packet"
              icon="description"
              active={activeStage === 3}
              onClick={() => setActiveStage(3)}
            >
              <div />
            </DxcTabs.Tab>
          </DxcTabs>

          <div className="stage-content" style={{ padding: "var(--spacing-padding-m)" }}>
            {/* =================== STAGE 1: POLICY MATCH =================== */}
            {activeStage === 0 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Match Insured with Policy" />
                <DxcTypography color="var(--color-fg-neutral-dark)">
                  Enter insured information to search for matching policies.
                </DxcTypography>

                <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                  <div style={{ flex: "1 1 250px" }}>
                    <DxcTextInput
                      label="Insured Full Name"
                      placeholder="First Middle Last"
                      value={insuredName}
                      onChange={({ value }) => setInsuredName(value)}
                      size="fillParent"
                    />
                  </div>
                  <div style={{ flex: "1 1 200px" }}>
                    <DxcTextInput
                      label="SSN"
                      placeholder="XXX-XX-XXXX"
                      value={insuredSSN}
                      onChange={({ value }) => setInsuredSSN(value)}
                      size="fillParent"
                    />
                  </div>
                  <div style={{ flex: "1 1 200px" }}>
                    <DxcDateInput
                      label="Date of Birth"
                      value={insuredDOB}
                      onChange={({ value }) => setInsuredDOB(value)}
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                </DxcFlex>

                <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                  <div style={{ flex: "1 1 250px" }}>
                    <DxcTextInput
                      label="Policy Number (if known)"
                      placeholder="Enter policy number"
                      value={policySearchValue}
                      onChange={({ value }) => setPolicySearchValue(value)}
                      size="fillParent"
                    />
                  </div>
                </DxcFlex>

                <DxcFlex gap="var(--spacing-gap-s)">
                  <DxcButton
                    label="Search for Policy"
                    icon="search"
                    onClick={handlePolicySearch}
                    disabled={!insuredName && !policySearchValue}
                  />
                </DxcFlex>

                {searching && <DxcSpinner label="Searching policies..." />}

                {matchedPolicy && (
                  <div style={{
                    backgroundColor: "var(--color-bg-neutral-lighter)",
                    borderRadius: "var(--border-radius-m)",
                    border: "2px solid var(--border-color-success-medium, #24A148)",
                    padding: "var(--spacing-padding-m)"
                  }}>
                    <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                      <DxcFlex justifyContent="space-between" alignItems="center">
                        <DxcHeading level={4} text="Policy Match Found" />
                        <DxcBadge label="Matched" mode="contextual" color="success" />
                      </DxcFlex>
                      <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">POLICY NUMBER</DxcTypography>
                          <DxcTypography fontWeight="font-weight-semibold">{matchedPolicy.policyNumber}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">TYPE</DxcTypography>
                          <DxcTypography>{matchedPolicy.type}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">STATUS</DxcTypography>
                          <DxcBadge label={matchedPolicy.status} mode="contextual" color="success" />
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">INSURED</DxcTypography>
                          <DxcTypography>{matchedPolicy.insuredName}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">COVERAGE</DxcTypography>
                          <DxcTypography fontWeight="font-weight-semibold">{matchedPolicy.coverage}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">ISSUE DATE</DxcTypography>
                          <DxcTypography>{matchedPolicy.issueDate}</DxcTypography>
                        </DxcFlex>
                      </DxcFlex>
                      <DxcFlex gap="var(--spacing-gap-s)">
                        <DxcButton
                          label="Proceed to Related Policy Search"
                          onClick={() => { setActiveStage(1); handleRelatedPolicySearch(); }}
                        />
                      </DxcFlex>
                    </DxcFlex>
                  </div>
                )}

              </DxcFlex>
            )}

            {/* =================== STAGE 2: RELATED POLICY SEARCH =================== */}
            {activeStage === 1 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Related Policy Search" />
                <DxcTypography color="var(--color-fg-neutral-dark)">
                  System auto-searches for all policies impacted by the death event claim. Policies active as of date of death claim where the insured was the covered party are auto-associated.
                </DxcTypography>

                {relatedPolicies.length === 0 && !searching && (
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
                    <DxcButton
                      label="Search Related Policies"
                      icon="search"
                      onClick={handleRelatedPolicySearch}
                    />
                  </DxcFlex>
                )}

                {searching && <DxcSpinner label="Searching related policies..." />}

                {/* Owner Change Alerts */}
                {ownerChangeItems.length > 0 && (
                  <DxcAlert
                    semantic="warning"
                    message={{ text: `${ownerChangeItems.length} policy(ies) found where the deceased was the owner but not insured. Owner change work items will be triggered.` }}
                  />
                )}

                {/* Related Policies List */}
                {relatedPolicies.length > 0 && (
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcTypography fontWeight="font-weight-semibold">
                        {relatedPolicies.length} Related Policies Found
                      </DxcTypography>
                      <DxcBadge label={`${associatedPolicies.length} Associated`} mode="contextual" color="success" />
                    </DxcFlex>

                    {relatedPolicies.map(policy => (
                      <div key={policy.id} className="policy-result-row">
                        <DxcFlex justifyContent="space-between" alignItems="center" wrap="wrap" gap="var(--spacing-gap-s)">
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                              <DxcTypography fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                                {policy.policyNumber}
                              </DxcTypography>
                              <DxcBadge label={policy.type} mode="contextual" color="info" />
                              <DxcBadge label={policy.status} mode="contextual" color="success" />
                              {policy.autoAssociated && (
                                <DxcBadge label="Auto-Associated" mode="contextual" color="success" />
                              )}
                              {policy.ownerChangeRequired && (
                                <DxcBadge label="Owner Change Required" mode="contextual" color="warning" />
                              )}
                            </DxcFlex>
                            <DxcFlex gap="var(--spacing-gap-m)">
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                                Coverage: ${policy.coverage.toLocaleString()}
                              </DxcTypography>
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                                Role: {policy.insuredRole}
                              </DxcTypography>
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                                Issued: {new Date(policy.issueDate).toLocaleDateString()}
                              </DxcTypography>
                            </DxcFlex>
                          </DxcFlex>

                          <DxcFlex gap="var(--spacing-gap-s)">
                            {associatedPolicies.includes(policy.id) ? (
                              <DxcButton
                                label="Remove Association"
                                mode="tertiary"
                                icon="link_off"
                                onClick={() => handleDisassociatePolicy(policy.id)}
                              />
                            ) : (
                              <DxcButton
                                label="Tie to Claim"
                                mode="secondary"
                                icon="link"
                                onClick={() => handleAssociatePolicy(policy.id)}
                              />
                            )}
                          </DxcFlex>
                        </DxcFlex>
                      </div>
                    ))}
                  </DxcFlex>
                )}

                {/* Manual Search */}
                <div style={{
                  borderTop: "1px solid var(--border-color-neutral-lighter)",
                  paddingTop: "16px",
                  marginTop: "8px"
                }}>
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcHeading level={4} text="Manual Policy Search" />
                    <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                      Search for additional policies that did not auto-match.
                    </DxcTypography>
                    <DxcFlex gap="var(--spacing-gap-s)" alignItems="flex-end">
                      <DxcTextInput
                        label="Policy Number"
                        placeholder="Enter policy number"
                        value={manualSearchValue}
                        onChange={({ value }) => setManualSearchValue(value)}
                        size="medium"
                      />
                      <DxcButton
                        label="Search"
                        mode="secondary"
                        icon="search"
                        onClick={() => {}}
                        disabled={!manualSearchValue}
                      />
                    </DxcFlex>
                  </DxcFlex>
                </div>

                <DxcFlex justifyContent="flex-end">
                  <DxcButton
                    label="Continue to Beneficiary Analysis"
                    onClick={() => setActiveStage(2)}
                    disabled={associatedPolicies.length === 0}
                  />
                </DxcFlex>
              </DxcFlex>
            )}

            {/* =================== STAGE 3: BENEFICIARY ANALYZER =================== */}
            {activeStage === 2 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Claimant Analyzer" />
                <DxcTypography color="var(--color-fg-neutral-dark)">
                  Policy-specific beneficiary claimant analysis. Select a policy to analyze its beneficiaries policyholders.
                </DxcTypography>

                {/* Policy selector */}
                {associatedPolicies.length > 0 && (
                  <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap">
                    {relatedPolicies
                      .filter(p => associatedPolicies.includes(p.id))
                      .map(policy => (
                        <DxcChip
                          key={policy.id}
                          label={`${policy.policyNumber} (${policy.type})`}
                          onClick={() => setSelectedPolicyForBeneficiary(policy)}
                        />
                      ))
                    }
                  </DxcFlex>
                )}

                {associatedPolicies.length === 0 && (
                  <DxcAlert
                    semantic="warning"
                    message={{ text: "No policies associated. Go back to Related Policy Search to associate policies first." }}
                  />
                )}

                {selectedPolicyForBeneficiary && (
                  <BeneficiaryAnalyzer
                    policy={selectedPolicyForBeneficiary}
                    claim={{
                      insured: { name: insuredName || 'James R. Smith', dod: dateOfDeath }
                    }}
                  />
                )}

                <DxcFlex justifyContent="flex-end" gap="var(--spacing-gap-s)">
                  <DxcButton
                    label="Back"
                    mode="secondary"
                    onClick={() => setActiveStage(1)}
                  />
                  <DxcButton
                    label="Continue to Claim Packet"
                    onClick={() => setActiveStage(3)}
                  />
                </DxcFlex>
              </DxcFlex>
            )}

            {/* =================== STAGE 4: CLAIM PACKET GENERATION =================== */}
            {activeStage === 3 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Claim Packet Generation" />
                <DxcTypography color="var(--color-fg-neutral-dark)">
                  Generate and deliver the claim packet to beneficiaries. Includes a QR code directing users to the party portal for online submission.
                </DxcTypography>

                {/* Delivery Method */}
                <DxcRadioGroup
                  label="Delivery Method"
                  options={[
                    { label: 'Email', value: 'email' },
                    { label: 'US Mail', value: 'mail' },
                    { label: 'Fax', value: 'fax' }
                  ]}
                  value={deliveryMethod}
                  onChange={({ value }) => setDeliveryMethod(value)}
                  stacking="row"
                />

                {deliveryMethod === 'email' && (
                  <DxcTextInput
                    label="Recipient Email"
                    placeholder="beneficiary@example.com"
                    value={recipientEmail}
                    onChange={({ value }) => setRecipientEmail(value)}
                    size="fillParent"
                  />
                )}

                {deliveryMethod === 'mail' && (
                  <DxcTextInput
                    label="Mailing Address"
                    placeholder="Enter full mailing address"
                    value={recipientAddress}
                    onChange={({ value }) => setRecipientAddress(value)}
                    size="fillParent"
                  />
                )}

                {deliveryMethod === 'fax' && (
                  <DxcTextInput
                    label="Fax Number"
                    placeholder="(XXX) XXX-XXXX"
                    value={recipientFax}
                    onChange={({ value }) => setRecipientFax(value)}
                    size="fillParent"
                  />
                )}

                {/* Packet Preview */}
                <div style={{
                  backgroundColor: "var(--color-bg-neutral-lighter)",
                  borderRadius: "var(--border-radius-m)",
                  padding: "var(--spacing-padding-m)"
                }}>
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcHeading level={4} text="Packet Contents" />
                    <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcTypography fontWeight="font-weight-semibold">Included Documents:</DxcTypography>
                        <DxcTypography fontSize="font-scale-03">- Claim Form (per product type)</DxcTypography>
                        <DxcTypography fontSize="font-scale-03">- Claimant Instructions</DxcTypography>
                        <DxcTypography fontSize="font-scale-03">- Requirements Checklist</DxcTypography>
                        <DxcTypography fontSize="font-scale-03">- Return Envelope / Portal Access</DxcTypography>
                      </DxcFlex>

                      {/* QR Code */}
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
                        <DxcTypography fontWeight="font-weight-semibold">Party Portal QR Code</DxcTypography>
                        <div className="qr-code-placeholder">
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center">
                            <span className="material-icons" style={{ fontSize: "48px", color: "var(--color-fg-neutral-strong)" }}>qr_code_2</span>
                            <DxcTypography fontSize="10px" color="var(--color-fg-neutral-dark)">QR Code</DxcTypography>
                          </DxcFlex>
                        </div>
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                          Directs to FNOL Party Portal
                        </DxcTypography>
                      </DxcFlex>
                    </DxcFlex>
                  </DxcFlex>
                </div>

                <DxcFlex gap="var(--spacing-gap-s)" justifyContent="flex-end">
                  <DxcButton
                    label="Back"
                    mode="secondary"
                    onClick={() => setActiveStage(2)}
                  />
                  <DxcButton
                    label="Generate & Send Packet"
                    icon="send"
                    onClick={handleGeneratePacket}
                  />
                </DxcFlex>

                {packetGenerated && (
                  <DxcAlert
                    semantic="success"
                    message={{ text: `Claim packet generated and ${deliveryMethod === 'email' ? 'sent via email' : deliveryMethod === 'mail' ? 'queued for mailing' : 'sent via fax'} successfully. QR code included for party portal access.` }}
                  />
                )}
              </DxcFlex>
            )}
          </div>
        </div>
      </DxcFlex>
    </div>
  );
};

export default FNOLWorkspace;
