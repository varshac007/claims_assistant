import { useState, useEffect } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcTabs,
  DxcInset,
  DxcProgressBar,
  DxcAlert,
  DxcChip,
  DxcDialog,
  DxcSpinner,
  DxcTextInput,
  DxcSelect
} from '@dxc-technology/halstack-react';
import FastTrackBadge from '../shared/FastTrackBadge';
import DocumentUpload from '../shared/DocumentUpload';
import DocumentViewer from '../shared/DocumentViewer';
import AnomalyDetection from '../shared/AnomalyDetection';
import BeneficiaryAnalyzer from '../BeneficiaryAnalyzer/BeneficiaryAnalyzer';
import DeathEventPanel from '../DeathEventPanel/DeathEventPanel';
import PolicySummaryPanel from '../PolicySummaryPanel/PolicySummaryPanel';
import PartyManagementPanel from '../PartyManagementPanel/PartyManagementPanel';
import AIInsightsPanel from '../AIInsightsPanel/AIInsightsPanel';
import ClaimsAnalyst from '../ClaimsAnalyst/ClaimsAnalyst';
import ClaimHeader from '../ClaimHeader/ClaimHeader';
import PMICalculator from '../PMICalculator/PMICalculator';
import TaxWithholdingCalculator from '../TaxWithholdingCalculator/TaxWithholdingCalculator';
import PaymentQuickView from '../PaymentQuickView/PaymentQuickView';
import PolicyDetailView from '../PolicyDetailView/PolicyDetailView';
import PartyForm from '../PartyForm/PartyForm';
import RequirementsEngine from '../RequirementsEngine/RequirementsEngine';
import WorkNotes from '../WorkNotes/WorkNotes';
import RelatedPoliciesPanel from '../RelatedPoliciesPanel/RelatedPoliciesPanel';
import ClaimGuardianPanel from '../ClaimGuardianPanel/ClaimGuardianPanel';
import serviceNowService from '../../services/api/serviceNowService';
import './ClaimsWorkbench.css';

const ClaimsWorkbench = ({ claim, onBack }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showBeneficiaryAnalyzer, setShowBeneficiaryAnalyzer] = useState(false);

  // Scroll to top on every tab switch or claim change
  useEffect(() => {
    const scrollAll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.querySelectorAll('div').forEach(el => {
        if (el.scrollTop > 0) {
          const ov = window.getComputedStyle(el).overflowY;
          if (ov === 'auto' || ov === 'scroll') el.scrollTop = 0;
        }
      });
    };
    const r1 = requestAnimationFrame(() => { requestAnimationFrame(scrollAll); });
    return () => cancelAnimationFrame(r1);
  }, [activeTab, claim?.id]);

  // Modal states
  const [showPMICalculator, setShowPMICalculator] = useState(false);
  const [showTaxCalculator, setShowTaxCalculator] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showPartyForm, setShowPartyForm] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [showAnomalyDetection, setShowAnomalyDetection] = useState(false);
  const [anomalyData, setAnomalyData] = useState(null);

  // Death claim (ServiceNow sn_ins_claim_indl_death_case) — fetched when available
  const [deathClaimRecord, setDeathClaimRecord] = useState(null);
  useEffect(() => {
    console.log('[ClaimsWorkbench] deathClaimId:', claim.deathClaimId);
    if (claim.deathClaimId) {
      serviceNowService.getDeathClaim(claim.deathClaimId).then(dc => {
        console.log('[ClaimsWorkbench] deathClaimRecord fetched:', dc);
        if (dc) {
          setDeathClaimRecord(dc);
          // Merge into localDeathEvent so DeathEventPanel also benefits
          setLocalDeathEvent(prev => ({
            ...prev,
            dateOfDeath:         dc.date_and_time_of_incident?.display_value || dc.date_and_time_of_incident || prev.dateOfDeath,
            mannerOfDeath:       dc.nature_of_loss?.display_value            || dc.nature_of_loss            || prev.mannerOfDeath,
            stateOfDeath:        dc.state_province?.display_value            || dc.state_province            || prev.stateOfDeath,
            deathInUSA:          (dc.country === 'US' || dc.country === 'USA') ? 'Yes' : (dc.country ? 'No' : prev.deathInUSA),
            proofOfDeathDate:    dc.report_date?.display_value               || dc.report_date               || prev.proofOfDeathDate,
            incidentDescription: dc.describe_the_incident?.display_value     || dc.describe_the_incident     || prev.incidentDescription,
          }));
        }
      });
    }
  }, [claim.id, claim.deathClaimId]);

  // Death details edit modal
  const [showDeathEditModal, setShowDeathEditModal] = useState(false);
  const [localDeathEvent, setLocalDeathEvent] = useState(claim.deathEvent || {});
  const [deathForm, setDeathForm] = useState({});
  const [deathSaving, setDeathSaving] = useState(false);
  const [deathSaveError, setDeathSaveError] = useState(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [anomalyLoadingMessage, setAnomalyLoadingMessage] = useState('');
  const [anomalyRetryCount, setAnomalyRetryCount] = useState(0);
  const [aiInsights, setAiInsights] = useState([]);

  console.log('[ClaimsWorkbench] Received claim:', claim);

  // Fetch anomaly detection data when claim loads
  useEffect(() => {
    const fetchAnomalyData = async () => {
      if (!claim) return;

      const fnolSysId = claim.sysId || claim.servicenow_sys_id || claim.id;
      if (!fnolSysId) {
        console.log('[ClaimsWorkbench] No sys_id found, skipping anomaly detection fetch');
        return;
      }

      try {
        console.log('[ClaimsWorkbench] Fetching anomaly detection for AI Insights panel');
        const anomalyResponse = await serviceNowService.getAnomalyDetection(fnolSysId, {
          maxRetries: 10,
          retryDelay: 3000,
          onRetry: (retriesLeft, message) => {
            console.log(`[ClaimsWorkbench] AI Insights retry: ${message} (${retriesLeft} retries left)`);
          }
        });

        if (anomalyResponse && anomalyResponse.AgenticSummary) {
          // Store full anomaly data for modal
          setAnomalyData(anomalyResponse);

          // Convert anomaly findings to AI Insights format
          const findings = anomalyResponse.AgenticSummary.Analysis_Findings || [];
          const insights = findings
            .filter(f => f.Status === 'FAIL') // Only show failed findings
            .map(finding => ({
              id: finding.Finding_ID,
              title: finding.Title,
              severity: finding.Severity,
              type: finding.Risk_Type,
              description: finding.Evidence ? finding.Evidence.join(' ') : '',
              recommendation: finding.Recommendation,
              status: finding.Status
            }));

          setAiInsights(insights);
          console.log('[ClaimsWorkbench] AI Insights updated with', insights.length, 'findings');
        }
      } catch (error) {
        console.error('[ClaimsWorkbench] Error fetching anomaly data for AI Insights:', error);
        // Don't show error to user, just log it
        setAiInsights([]);
      }
    };

    fetchAnomalyData();
  }, [claim]);

  // Handler for anomaly detection
  const handleSchedulePayment = async () => {
    console.log('[ClaimsWorkbench] Schedule Payment clicked - Running anomaly detection');
    console.log('[ClaimsWorkbench] Claim object:', claim);

    // Get FNOL sys_id from claim
    const fnolSysId = claim.sysId || claim.servicenow_sys_id || claim.id;

    console.log('[ClaimsWorkbench] Extracted sys_id:', fnolSysId);
    console.log('[ClaimsWorkbench] claim.sysId:', claim.sysId);
    console.log('[ClaimsWorkbench] claim.servicenow_sys_id:', claim.servicenow_sys_id);
    console.log('[ClaimsWorkbench] claim.id:', claim.id);

    if (!fnolSysId) {
      console.error('[ClaimsWorkbench] No sys_id found for claim');
      alert('Cannot run anomaly detection: No claim sys_id found');
      return;
    }

    try {
      setAnomalyLoading(true);
      setShowAnomalyDetection(true);
      setAnomalyLoadingMessage('Initializing anomaly detection...');
      setAnomalyRetryCount(0);

      console.log('[ClaimsWorkbench] Fetching anomaly detection for sys_id:', fnolSysId);

      const anomalyResponse = await serviceNowService.getAnomalyDetection(fnolSysId, {
        maxRetries: 10,
        retryDelay: 3000,
        onRetry: (retriesLeft, message, delay) => {
          const attemptNumber = 11 - retriesLeft;
          console.log(`[ClaimsWorkbench] Retry attempt ${attemptNumber}/10`);
          setAnomalyRetryCount(attemptNumber);
          setAnomalyLoadingMessage(`${message} - Retrying in ${delay / 1000}s... (Attempt ${attemptNumber}/10)`);
        }
      });

      console.log('[ClaimsWorkbench] Anomaly detection response received');
      console.log('[ClaimsWorkbench] Response type:', typeof anomalyResponse);
      console.log('[ClaimsWorkbench] Response:', JSON.stringify(anomalyResponse, null, 2));

      setAnomalyData(anomalyResponse);

    } catch (error) {
      console.error('[ClaimsWorkbench] Error fetching anomaly detection:', error);

      // Fallback to mock data if API fails
      const mockAnomalyData = {
        "AgenticSummary": {
          "General_Information": {
            "Policy_Number": claim.policy?.policyNumber || "892461037",
            "Claim_Number": claim.claimNumber || "WRADC0004602"
          },
          "Overall_Status": "FAIL",
          "Processing_Recommendation": "STOP_AND_REVIEW - Multiple critical findings require manual review before payment processing.",
          "Analysis_Findings": [
            {
              "Finding_ID": "R001",
              "Severity": "MEDIUM",
              "Risk_Type": "Operational",
              "Title": "Mandatory Fields Missing",
              "Status": "FAIL",
              "Evidence": [
                "Missing beneficiary tax ID",
                "Missing payment method details"
              ],
              "Recommendation": "Complete all mandatory fields before proceeding with payment."
            },
            {
              "Finding_ID": "R002",
              "Severity": "HIGH",
              "Risk_Type": "Compliance",
              "Title": "Tax Withholding Not Calculated",
              "Status": "FAIL",
              "Evidence": [
                "No tax withholding calculation found",
                "Payment amount exceeds threshold requiring tax withholding"
              ],
              "Recommendation": "Calculate and apply appropriate tax withholding before payment."
            }
          ],
          "Actions_Required": [
            {
              "Action": "Complete Missing Beneficiary Information",
              "Priority": "HIGH",
              "Reason": "Tax ID and contact information required for IRS reporting"
            },
            {
              "Action": "Calculate Tax Withholding",
              "Priority": "CRITICAL",
              "Reason": "Federal and state tax withholding must be calculated and applied"
            }
          ],
          "Risk_Assessment": [
            {
              "Category": "Compliance Risk",
              "Level": "HIGH"
            },
            {
              "Category": "Operational Risk",
              "Level": "MEDIUM"
            }
          ],
          "Summary_Recommendation": {
            "Decision": "STOP_AND_REVIEW",
            "Rationale": "Payment cannot be processed until all mandatory fields are completed and tax withholding is calculated. Manual review required."
          }
        }
      };

      console.log('[ClaimsWorkbench] Using fallback mock data due to API error');
      setAnomalyData(mockAnomalyData);

      // Show alert to user about API error
      alert(`Failed to fetch anomaly detection: ${error.message}\n\nShowing sample data for demonstration.`);
    } finally {
      setAnomalyLoading(false);
    }
  };

  if (!claim) {
    console.log('[ClaimsWorkbench] No claim provided, showing alert');
    return (
      <DxcContainer
        padding="var(--spacing-padding-xl)"
        style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
      >
        <DxcAlert
          type="info"
          inlineText="Please select a claim from the dashboard to view details."
        />
      </DxcContainer>
    );
  }

  // Helper function - must be declared before use
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Extract financial data from claim
  const totalClaimAmount = claim.financial?.claimAmount || claim.financial?.totalClaimed || 0;
  const payments = claim.financial?.payments || claim.payments || [];
  const reserves = claim.financial?.reserves || {};

  // Calculate totals
  const totalPaid = payments
    .filter(p => p.status === 'PAID' || p.status === 'Paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingPayments = payments.filter(p =>
    p.status === 'PENDING' || p.status === 'Pending Approval' || p.status === 'SCHEDULED'
  );

  const completedPayments = payments.filter(p =>
    p.status === 'PAID' || p.status === 'Paid' || p.status === 'COMPLETED'
  );

  const financialData = {
    totalClaimAmount,
    reserves: {
      initial: reserves.initial || totalClaimAmount,
      current: reserves.current || (totalClaimAmount - totalPaid),
      paid: totalPaid,
      outstanding: reserves.outstanding || (totalClaimAmount - totalPaid)
    },
    payments: completedPayments,
    pendingPayments
  };

  // Extract policy data from claim
  const policyDetails = {
    policyNumber: claim.policy?.policyNumber || 'N/A',
    insuredName: claim.insured?.name || claim.claimant?.name || 'N/A',
    policyType: claim.policy?.policyType || claim.policy?.type || 'N/A',
    coverage: claim.financial?.claimAmount ? formatCurrency(claim.financial.claimAmount) : 'N/A',
    effectiveDate: claim.policy?.effectiveDate || claim.policy?.issueDate || 'N/A',
    expirationDate: claim.policy?.expirationDate || 'N/A',
    premium: claim.policy?.premium || 'N/A'
  };

  // Extract beneficiaries from claim
  const beneficiaries = claim.beneficiaries || claim.policy?.beneficiaries || [];

  // Extract timeline from claim
  const timelineEvents = claim.timeline || claim.activityLog || [];

  // Extract requirements from claim
  const requirements = claim.requirements || [];

  // Product-line detection
  const isPC = !!claim.lossEvent;
  const pcSamePerson = isPC && claim.insured?.name === claim.claimant?.name;
  const pcBusinessInsured = isPC && !pcSamePerson && !claim.insured?.dateOfBirth;

  return (
    <DxcContainer
      padding="0"
      style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
    >
      <DxcFlex direction="column" gap="0">
        {/* Persistent Claim Header */}
        <ClaimHeader
          claim={claim}
          onHold={() => console.log('Hold claim')}
          onApprove={() => console.log('Approve claim')}
          onDeny={() => console.log('Deny claim')}
          onAssign={() => console.log('Assign claim')}
          onBack={onBack || (() => window.history.back())}
        />

        {/* Main Content Area */}
        <DxcContainer padding="var(--spacing-padding-l)">
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            {/* Progress Card - BLOOM: Enhanced with left accent border */}
            <DxcContainer
          padding="var(--spacing-padding-l)"
          style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderLeft: "4px solid #1B75BB", /* BLOOM: Blue accent */
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcHeading level={3} text="Claim Progress" />
            {requirements.length > 0 && (
              <DxcProgressBar
                label="Requirements Complete"
                value={Math.round((requirements.filter(r => r.status === 'satisfied' || r.status === 'SATISFIED' || r.status === 'Completed').length / requirements.length) * 100)}
                showValue
              />
            )}
            <DxcFlex gap="var(--spacing-gap-xl)">
              {claim.workflow?.sla?.dueDate && (() => {
                const dueDate = new Date(claim.workflow.sla.dueDate);
                const today = new Date();
                const isClosed = claim.status === 'closed' || claim.status === 'denied' || claim.status === 'approved';
                const daysRemaining = isClosed ? 0 : Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                const color = isClosed ? 'var(--color-fg-success-medium)' : daysRemaining <= 3 ? 'var(--color-fg-error-medium)' : daysRemaining <= 7 ? 'var(--color-fg-warning-medium)' : 'var(--color-fg-success-medium)';

                return (
                  <>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        SLA DAYS REMAINING
                      </DxcTypography>
                      <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                        {isClosed ? 'Closed' : daysRemaining}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                      <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                        TARGET CLOSE DATE
                      </DxcTypography>
                      <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">
                        {dueDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                      </DxcTypography>
                    </DxcFlex>
                  </>
                );
              })()}
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-stronger)">
                  FASTTRACK ELIGIBLE
                </DxcTypography>
                <DxcTypography fontSize="16px" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                  {claim.routing?.type === 'FASTTRACK' ? 'Yes' : 'No'}
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>

        {/* Tabs */}
        <DxcContainer
          style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
        >
          <DxcFlex direction="column">
            <DxcInset space="var(--spacing-padding-l)" top>
              <div className="workbench-tabs-wrapper">
              <DxcTabs iconPosition="left">
                <DxcTabs.Tab
                  label="Dashboard"
                  icon="dashboard"
                  active={activeTab === 0}
                  onClick={() => setActiveTab(0)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Financials"
                  icon="payments"
                  active={activeTab === 1}
                  onClick={() => setActiveTab(1)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Policy 360"
                  icon="policy"
                  active={activeTab === 2}
                  onClick={() => setActiveTab(2)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Timeline"
                  icon="timeline"
                  active={activeTab === 3}
                  onClick={() => setActiveTab(3)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Requirements"
                  icon="checklist"
                  active={activeTab === 4}
                  onClick={() => setActiveTab(4)}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Documents"
                  icon="folder"
                  active={activeTab === 5}
                  onClick={() => setActiveTab(5)}
                >
                  <div />
                </DxcTabs.Tab>
                {claim.deathEvent && (
                <DxcTabs.Tab
                  label="Beneficiary Analyzer"
                  icon="psychology"
                  active={activeTab === 6}
                  onClick={() => setActiveTab(6)}
                >
                  <div />
                </DxcTabs.Tab>
                )}
                {claim.deathEvent && (
                <DxcTabs.Tab
                  label="Related Policies"
                  icon="policy"
                  active={activeTab === 7}
                  onClick={() => setActiveTab(7)}
                >
                  <div />
                </DxcTabs.Tab>
                )}
                <DxcTabs.Tab
                  label="Claim Guardian"
                  icon="shield"
                  active={activeTab === 8}
                  onClick={() => setActiveTab(8)}
                >
                  <div />
                </DxcTabs.Tab>
              </DxcTabs>
              </div>
            </DxcInset>

            <DxcInset space="var(--spacing-padding-l)">
              {/* Dashboard Tab - SA-001 Claim Dashboard 360° View */}
              {activeTab === 0 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-l)">

                  {/* FNOL People Row: Product-line-aware identity cards */}
                  {(claim.insured?.name || claim.claimant?.name) && (
                  <div className="dashboard-grid-people">

                    {/* P&C Personal Lines: single merged Policyholder / Claimant card */}
                    {isPC && pcSamePerson && (
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)', borderLeft: '4px solid #1B75BB', boxShadow: '0 1px 3px rgba(0,0,0,0.10)', gridColumn: '1 / -1' }}
                      border={{ color: 'var(--border-color-neutral-lighter)', style: 'solid', width: '1px' }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcFlex alignItems="center" gap="var(--spacing-gap-xs)">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#1B75BB' }}>person</span>
                          <DxcTypography fontSize="11px" fontWeight="font-weight-semibold" color="#1B75BB"
                            style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Policyholder / Claimant
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex alignItems="center" gap="var(--spacing-gap-s)" wrap="wrap">
                          <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="#000000">
                            {claim.insured.name}
                          </DxcTypography>
                          {claim.claimant?.relationship && <DxcBadge label={claim.claimant.relationship} />}
                        </DxcFlex>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                          {claim.insured.dateOfBirth && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Date of Birth</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.insured.dateOfBirth}</DxcTypography>
                          </DxcFlex>
                          )}
                          {claim.claimant?.contactInfo?.phone && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Phone</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.claimant.contactInfo.phone}</DxcTypography>
                          </DxcFlex>
                          )}
                          {claim.claimant?.contactInfo?.email && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Email</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.claimant.contactInfo.email}</DxcTypography>
                          </DxcFlex>
                          )}
                          {claim.vehicle && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Vehicle</DxcTypography>
                            <DxcTypography fontSize="14px">{[claim.vehicle.year, claim.vehicle.make, claim.vehicle.model].filter(Boolean).join(' ')}</DxcTypography>
                          </DxcFlex>
                          )}
                          {claim.property?.type && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Property Type</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.property.type}</DxcTypography>
                          </DxcFlex>
                          )}
                          {claim.property?.address && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" style={{ gridColumn: '1 / -1' }}>
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Property Address</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.property.address}</DxcTypography>
                          </DxcFlex>
                          )}
                        </div>
                      </DxcFlex>
                    </DxcContainer>
                    )}

                    {/* P&C Commercial or L&A: two separate cards */}
                    {(!isPC || !pcSamePerson) && (
                    <>
                    {/* Card 1: Named Insured (P&C commercial) or Insured (Deceased) (L&A) */}
                    {claim.insured?.name && (
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{
                        backgroundColor: 'var(--color-bg-neutral-lightest)',
                        borderLeft: `4px solid ${isPC ? '#2E7D32' : '#4A4A4A'}`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.10)'
                      }}
                      border={{ color: 'var(--border-color-neutral-lighter)', style: 'solid', width: '1px' }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcFlex alignItems="center" gap="var(--spacing-gap-xs)">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: isPC ? '#2E7D32' : '#4A4A4A' }}>
                            {isPC ? (pcBusinessInsured ? 'business' : 'person') : 'person_off'}
                          </span>
                          <DxcTypography fontSize="11px" fontWeight="font-weight-semibold" color={isPC ? '#2E7D32' : '#4A4A4A'}
                            style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {isPC ? 'Named Insured' : 'Insured (Deceased)'}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="#000000">
                          {claim.insured.name}
                        </DxcTypography>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {claim.insured.dateOfBirth && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Date of Birth</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.insured.dateOfBirth}</DxcTypography>
                          </DxcFlex>
                          )}
                          {isPC && pcBusinessInsured && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Entity Type</DxcTypography>
                            <DxcTypography fontSize="14px">Business</DxcTypography>
                          </DxcFlex>
                          )}
                          {claim.insured.maritalStatus && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Marital Status</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.insured.maritalStatus}</DxcTypography>
                          </DxcFlex>
                          )}
                          {(claim.insured.address?.city || claim.insured.address?.state) && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" style={{ gridColumn: '1 / -1' }}>
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Last Known Address</DxcTypography>
                            <DxcTypography fontSize="14px">
                              {[claim.insured.address?.street, claim.insured.address?.city, claim.insured.address?.state, claim.insured.address?.zipCode].filter(Boolean).join(', ')}
                            </DxcTypography>
                          </DxcFlex>
                          )}
                          {isPC && claim.property?.address && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" style={{ gridColumn: '1 / -1' }}>
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Property Address</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.property.address}</DxcTypography>
                          </DxcFlex>
                          )}
                        </div>
                      </DxcFlex>
                    </DxcContainer>
                    )}

                    {/* Card 2: Claimant / Contact (P&C) or Claimant / Notifier (L&A) */}
                    {claim.claimant?.name && (
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{
                        backgroundColor: 'var(--color-bg-neutral-lightest)',
                        borderLeft: '4px solid #1B75BB',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.10)'
                      }}
                      border={{ color: 'var(--border-color-neutral-lighter)', style: 'solid', width: '1px' }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcFlex alignItems="center" gap="var(--spacing-gap-xs)">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#1B75BB' }}>person</span>
                          <DxcTypography fontSize="11px" fontWeight="font-weight-semibold" color="#1B75BB"
                            style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {isPC ? 'Claimant / Contact' : 'Claimant / Notifier'}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex alignItems="center" gap="var(--spacing-gap-s)" wrap="wrap">
                          <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="#000000">
                            {claim.claimant.name}
                          </DxcTypography>
                          {claim.claimant.relationship && (
                          <DxcBadge label={claim.claimant.relationship} />
                          )}
                        </DxcFlex>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {(claim.claimant.phoneNumber || claim.claimant.contactInfo?.phone) && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Phone</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.claimant.phoneNumber || claim.claimant.contactInfo?.phone}</DxcTypography>
                          </DxcFlex>
                          )}
                          {(claim.claimant.emailAddress || claim.claimant.contactInfo?.email) && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Email</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.claimant.emailAddress || claim.claimant.contactInfo?.email}</DxcTypography>
                          </DxcFlex>
                          )}
                          {claim.claimant.dateOfBirth && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Date of Birth</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.claimant.dateOfBirth}</DxcTypography>
                          </DxcFlex>
                          )}
                          {claim.claimant.capacity && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Capacity</DxcTypography>
                            <DxcTypography fontSize="14px">{claim.claimant.capacity}</DxcTypography>
                          </DxcFlex>
                          )}
                          {(claim.claimant.address?.city || claim.claimant.address?.state) && (
                          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" style={{ gridColumn: '1 / -1' }}>
                            <DxcTypography fontSize="11px" color="var(--color-fg-neutral-dark)">Address</DxcTypography>
                            <DxcTypography fontSize="14px">
                              {[claim.claimant.address?.street, claim.claimant.address?.city, claim.claimant.address?.state, claim.claimant.address?.zipCode].filter(Boolean).join(', ')}
                            </DxcTypography>
                          </DxcFlex>
                          )}
                        </div>
                      </DxcFlex>
                    </DxcContainer>
                    )}
                    </>
                    )}

                  </div>
                  )}

                  {/* Top Row: Death Event (L&A only) and AI Insights */}
                  <div className="dashboard-grid-top">
                    {(claim.deathEvent || localDeathEvent?.dateOfDeath) && (
                      <DeathEventPanel
                        claimData={{
                          dateOfDeath: localDeathEvent?.dateOfDeath || claim.insured?.dateOfDeath,
                          mannerOfDeath: localDeathEvent?.mannerOfDeath || 'Natural',
                          causeOfDeath: localDeathEvent?.causeOfDeath,
                          deathInUSA: localDeathEvent?.deathInUSA || 'Yes',
                          countryOfDeath: localDeathEvent?.countryOfDeath || 'United States',
                          proofOfDeathSourceType: localDeathEvent?.proofOfDeathSourceType || 'Certified Death Certificate',
                          proofOfDeathDate: localDeathEvent?.proofOfDeathDate,
                          certifiedDOB: claim.insured?.dateOfBirth,
                          verificationSource: localDeathEvent?.verificationSource || 'LexisNexis',
                          verificationScore: localDeathEvent?.verificationScore || 95,
                          specialEvent: localDeathEvent?.specialEvent
                        }}
                        onEdit={() => {
                          setDeathForm({
                            dateOfDeath:          localDeathEvent?.dateOfDeath || '',
                            mannerOfDeath:        localDeathEvent?.mannerOfDeath || 'Natural',
                            causeOfDeath:         localDeathEvent?.causeOfDeath || '',
                            deathInUSA:           localDeathEvent?.deathInUSA === false ? 'No' : 'Yes',
                            countryOfDeath:       localDeathEvent?.countryOfDeath || '',
                            proofOfDeathSourceType: localDeathEvent?.proofOfDeathSourceType || 'Certified Death Certificate',
                            proofOfDeathDate:     localDeathEvent?.proofOfDeathDate || '',
                            specialEvent:         localDeathEvent?.specialEvent || '',
                          });
                          setDeathSaveError(null);
                          setShowDeathEditModal(true);
                        }}
                      />
                    )}
                    <AIInsightsPanel
                      claimData={{
                        riskScore: aiInsights.filter(i => ['HIGH', 'CRITICAL'].includes(i.severity)).length > 0 ? 75 : aiInsights.length > 0 ? 50 : 0
                      }}
                      insights={aiInsights}
                      anomalyData={anomalyData}
                      onViewDetail={(insight) => console.log('View insight:', insight)}
                      onDismiss={(insight) => console.log('Dismiss insight:', insight)}
                    />
                  </div>
                  <ClaimsAnalyst
                    claim={claim}
                    anomalyData={anomalyData}
                  />

                  {/* Middle Row: Policy Summary and Party Management */}
                  <div className="dashboard-grid-middle">
                    <PolicySummaryPanel
                      policies={claim.policies || (claim.policy ? [claim.policy] : [])}
                      onViewPolicy={(policy) => {
                        setSelectedPolicy(policy);
                        setShowPolicyModal(true);
                      }}
                      onAssociate={() => console.log('Associate policy')}
                      onDissociate={(policy) => console.log('Dissociate policy:', policy)}
                      onSearchPolicy={() => console.log('Search policy')}
                    />
                    <PartyManagementPanel
                      parties={claim.parties || []}
                      onAddParty={() => {
                        setSelectedParty(null);
                        setShowPartyForm(true);
                      }}
                      onEditParty={(party) => {
                        setSelectedParty(party);
                        setShowPartyForm(true);
                      }}
                      onChangeInsured={() => console.log('Change insured')}
                      onCSLNSearch={(party) => console.log('CSLN search for party:', party)}
                    />
                  </div>

                  {/* Bottom Row: Quick Actions */}
                  <DxcContainer
                    padding="var(--spacing-padding-m)"
                    style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
                  >
                    <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                      <DxcButton
                        label="View Full Financials"
                        mode="secondary"
                        icon="payments"
                        onClick={() => setActiveTab(1)}
                        style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                      />
                      <DxcButton
                        label="View Policy Details"
                        mode="secondary"
                        icon="policy"
                        onClick={() => setActiveTab(2)}
                        style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                      />
                      <DxcButton
                        label="Manage Requirements"
                        mode="secondary"
                        icon="checklist"
                        onClick={() => setActiveTab(4)}
                        style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                      />
                      <DxcButton
                        label="Upload Documents"
                        mode="secondary"
                        icon="upload_file"
                        onClick={() => setActiveTab(5)}
                        style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                      />
                      {claim.deathEvent && (
                      <DxcButton
                        label="Analyze Beneficiaries"
                        mode="primary"
                        icon="psychology"
                        onClick={() => setActiveTab(6)}
                        style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                      />
                      )}
                    </DxcFlex>
                  </DxcContainer>
                </DxcFlex>
              )}

              {/* Financials Tab */}
              {activeTab === 1 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                  {/* Reserve Summary - BLOOM: Enhanced stat cards with left accent borders */}
                  <DxcFlex gap="32px">
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{
                        backgroundColor: "var(--color-bg-neutral-lightest)",
                        borderLeft: "4px solid #1B75BB", /* BLOOM: Blue accent */
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                        <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                          TOTAL CLAIM AMOUNT
                        </DxcTypography>
                        <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                          {formatCurrency(financialData.totalClaimAmount)}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcContainer>
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{
                        backgroundColor: "var(--color-bg-neutral-lightest)",
                        borderLeft: "4px solid #37A526", /* BLOOM: Green accent */
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                        <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                          TOTAL PAID
                        </DxcTypography>
                        <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                          {formatCurrency(financialData.reserves.paid)}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcContainer>
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{
                        backgroundColor: "var(--color-bg-neutral-lightest)",
                        borderLeft: "4px solid #F6921E", /* BLOOM: Orange accent */
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
                        <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-stronger)">
                          OUTSTANDING RESERVE
                        </DxcTypography>
                        <DxcTypography fontSize="32px" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                          {formatCurrency(financialData.reserves.outstanding)}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcContainer>
                  </DxcFlex>

                  {/* Reserve Details - BLOOM: Enhanced card with left accent border */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcHeading level={4} text="Reserve History" />
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{
                        backgroundColor: "var(--color-bg-neutral-lightest)",
                        borderLeft: "4px solid #1B75BB", /* BLOOM: Blue accent */
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}
                      border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcFlex justifyContent="space-between">
                          <DxcTypography fontSize="font-scale-03">Initial Reserve Set</DxcTypography>
                          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                            {formatCurrency(financialData.reserves.initial)}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex justifyContent="space-between">
                          <DxcTypography fontSize="font-scale-03">Payments Issued</DxcTypography>
                          <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                            -{formatCurrency(financialData.reserves.paid)}
                          </DxcTypography>
                        </DxcFlex>
                        <div style={{ borderTop: "1px solid var(--border-color-neutral-light)", paddingTop: "var(--spacing-gap-s)" }}>
                          <DxcFlex justifyContent="space-between">
                            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">Current Reserve</DxcTypography>
                            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                              {formatCurrency(financialData.reserves.current)}
                            </DxcTypography>
                          </DxcFlex>
                        </div>
                      </DxcFlex>
                    </DxcContainer>
                  </DxcFlex>

                  {/* Payment History */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcHeading level={4} text="Payment History" />
                      <DxcFlex gap="var(--spacing-gap-s)">
                        <DxcButton
                          label="Calculate PMI"
                          mode="secondary"
                          size="small"
                          icon="calculate"
                          onClick={() => setShowPMICalculator(true)}
                          style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                        />
                        <DxcButton
                          label="Tax Withholding"
                          mode="secondary"
                          size="small"
                          icon="account_balance"
                          onClick={() => setShowTaxCalculator(true)}
                          style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                        />
                        <DxcButton
                          label="View EOB"
                          mode="tertiary"
                          size="small"
                          icon="description"
                          style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                        />
                      </DxcFlex>
                    </DxcFlex>
                    {financialData.payments.map((payment, index) => (
                      <DxcContainer
                        key={index}
                        style={{
                          backgroundColor: "var(--color-bg-neutral-lightest)",
                          cursor: "pointer",
                          borderLeft: "4px solid #37A526", /* BLOOM: Green accent for paid */
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          transition: "all 0.2s ease"
                        }}
                        border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowPaymentModal(true);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                            <DxcFlex justifyContent="space-between" alignItems="center">
                              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                                  {payment.id}
                                </DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.payee}</DxcTypography>
                                <DxcBadge label={payment.status} />
                              </DxcFlex>
                              <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                                {formatCurrency(payment.amount)}
                              </DxcTypography>
                            </DxcFlex>
                            <div className="payment-details-grid">
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Payment Type</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.type}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Date Paid</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.date}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Payment Method</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.method}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Check/Reference #</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.checkNumber || 'N/A'}</DxcTypography>
                              </DxcFlex>
                              {payment.netBenefitProceeds && (
                                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Net Benefit Proceeds</DxcTypography>
                                  <DxcTypography fontSize="font-scale-03">{formatCurrency(payment.netBenefitProceeds)}</DxcTypography>
                                </DxcFlex>
                              )}
                              {payment.netBenefitPMI && (
                                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Net Benefit PMI</DxcTypography>
                                  <DxcTypography fontSize="font-scale-03">{formatCurrency(payment.netBenefitPMI)}</DxcTypography>
                                </DxcFlex>
                              )}
                              {payment.taxWithheld && (
                                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Tax Withheld</DxcTypography>
                                  <DxcTypography fontSize="font-scale-03">{formatCurrency(payment.taxWithheld)}</DxcTypography>
                                </DxcFlex>
                              )}
                              {payment.percentage && (
                                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Percent</DxcTypography>
                                  <DxcTypography fontSize="font-scale-03">{payment.percentage}%</DxcTypography>
                                </DxcFlex>
                              )}
                            </div>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))}
                  </DxcFlex>

                  {/* Pending Payments */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcHeading level={4} text="Pending Payments" />
                      <DxcButton
                        label="Schedule Payment"
                        mode="primary"
                        icon="add"
                        onClick={handleSchedulePayment}
                        style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                      />
                    </DxcFlex>
                    {financialData.pendingPayments.map((payment, index) => (
                      <DxcContainer
                        key={index}
                        style={{
                          backgroundColor: "var(--color-bg-warning-lightest)",
                          borderLeft: "4px solid #F6921E", /* BLOOM: Orange accent for pending */
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}
                        border={{ color: "var(--border-color-warning-lighter)", style: "solid", width: "1px" }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                            <DxcFlex justifyContent="space-between" alignItems="center">
                              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                                  {payment.id}
                                </DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.payee}</DxcTypography>
                                <DxcBadge label={payment.status} />
                              </DxcFlex>
                              <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                                {formatCurrency(payment.amount)}
                              </DxcTypography>
                            </DxcFlex>
                            <DxcFlex gap="var(--spacing-gap-l)" alignItems="center">
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Payment Type</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.type}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Scheduled Date</DxcTypography>
                                <DxcTypography fontSize="font-scale-03">{payment.scheduledDate}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex gap="var(--spacing-gap-s)" style={{ marginLeft: "auto" }}>
                                <DxcButton
                                  label="Approve"
                                  mode="primary"
                                  size="small"
                                  style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                                />
                                <DxcButton
                                  label="Reject"
                                  mode="secondary"
                                  size="small"
                                  style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                                />
                              </DxcFlex>
                            </DxcFlex>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))}
                  </DxcFlex>
                </DxcFlex>
              )}

              {/* Policy 360 Tab */}
              {activeTab === 2 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-l)">

                  {/* Death Claim Record — shown first for FNOL claims */}
                  {deathClaimRecord && (
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcHeading level={4} text="Death Claim Details" />
                      <span style={{ fontSize: '12px', color: '#808285', fontWeight: 600 }}>
                        {deathClaimRecord.number} · ServiceNow
                      </span>
                    </DxcFlex>
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{
                        backgroundColor: 'var(--color-bg-neutral-lightest)',
                        borderLeft: '4px solid #D02E2E',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      border={{ color: 'var(--border-color-neutral-lighter)', style: 'solid', width: '1px' }}
                    >
                      <div className="policy-details-grid">
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Type of Death</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">
                            {deathClaimRecord.nature_of_loss?.display_value || deathClaimRecord.nature_of_loss || 'N/A'}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Date of Death</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">
                            {deathClaimRecord.date_and_time_of_incident?.display_value || deathClaimRecord.date_and_time_of_incident || 'N/A'}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Report Date</DxcTypography>
                          <DxcTypography fontSize="16px">
                            {deathClaimRecord.report_date?.display_value || deathClaimRecord.report_date || 'N/A'}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">State at Time of Death</DxcTypography>
                          <DxcTypography fontSize="16px">
                            {deathClaimRecord.state_province?.display_value || deathClaimRecord.state_province || 'N/A'}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Country</DxcTypography>
                          <DxcTypography fontSize="16px">
                            {deathClaimRecord.country?.display_value || deathClaimRecord.country || 'N/A'}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Status</DxcTypography>
                          <DxcTypography fontSize="16px">
                            {deathClaimRecord.state?.display_value || deathClaimRecord.state || 'New'}
                          </DxcTypography>
                        </DxcFlex>
                        {(deathClaimRecord.description?.display_value || deathClaimRecord.description) && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" style={{ gridColumn: '1 / -1' }}>
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Description</DxcTypography>
                          <DxcTypography fontSize="14px">
                            {deathClaimRecord.description?.display_value || deathClaimRecord.description}
                          </DxcTypography>
                        </DxcFlex>
                        )}
                        {(deathClaimRecord.describe_the_incident?.display_value || deathClaimRecord.describe_the_incident) && (
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" style={{ gridColumn: '1 / -1' }}>
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Incident Description</DxcTypography>
                          <DxcTypography fontSize="14px">
                            {deathClaimRecord.describe_the_incident?.display_value || deathClaimRecord.describe_the_incident}
                          </DxcTypography>
                        </DxcFlex>
                        )}
                      </div>
                    </DxcContainer>
                  </DxcFlex>
                  )}

                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcHeading level={4} text="Policy Details" />
                      <DxcButton
                        label="View Full Policy"
                        mode="secondary"
                        size="small"
                        icon="open_in_new"
                        style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                      />
                    </DxcFlex>
                    <DxcContainer
                      padding="var(--spacing-padding-m)"
                      style={{
                        backgroundColor: "var(--color-bg-neutral-lightest)",
                        borderLeft: "4px solid #1B75BB", /* BLOOM: Blue accent */
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                      }}
                      border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                    >
                      <div className="policy-details-grid">
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Policy Number</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{policyDetails.policyNumber}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Insured Name</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{policyDetails.insuredName}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Product Type</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{policyDetails.policyType}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">{claim.lossEvent ? 'Coverage Limit' : 'Face Amount'}</DxcTypography>
                          <DxcTypography fontSize="16px" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>{claim.lossEvent ? (claim.policy?.coverageLimit ? formatCurrency(claim.policy.coverageLimit) : 'N/A') : policyDetails.coverage}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Issue Date</DxcTypography>
                          <DxcTypography fontSize="16px">{policyDetails.effectiveDate}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">{claim.lossEvent ? 'Loss Location' : 'Issue State'}</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.lossEvent?.lossLocation || claim.policy?.issueState || 'N/A'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Plan Code</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.planCode || 'N/A'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Policy Status</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.adminStatus || 'Active'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Region</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.region || 'N/A'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Company Code</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.companyCode || 'N/A'}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Paid To Date</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.paidToDate || (claim.financial?.amountPaid ? formatCurrency(claim.financial.amountPaid) : 'N/A')}</DxcTypography>
                        </DxcFlex>
                        <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Source System</DxcTypography>
                          <DxcTypography fontSize="16px">{claim.policy?.source || (claim.lossEvent ? 'POINT-J' : 'CyberLife')}</DxcTypography>
                        </DxcFlex>
                      </div>
                    </DxcContainer>
                  </DxcFlex>

                  {claim.deathEvent && (
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcHeading level={4} text="Beneficiaries" />
                      <DxcButton
                        label="Analyze Beneficiaries"
                        mode="primary"
                        icon="psychology"
                        onClick={() => setShowBeneficiaryAnalyzer(true)}
                        style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
                      />
                    </DxcFlex>
                    {beneficiaries.map((ben, index) => (
                      <DxcContainer
                        key={index}
                        style={{
                          backgroundColor: "var(--color-bg-neutral-lightest)",
                          borderLeft: "4px solid #37A526", /* BLOOM: Green accent */
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}
                        border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex justifyContent="space-between" alignItems="center">
                            <DxcFlex gap="var(--spacing-gap-l)" alignItems="center">
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Name</DxcTypography>
                                <DxcTypography fontSize="16px" fontWeight="font-weight-semibold">{ben.name}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Relationship</DxcTypography>
                                <DxcTypography fontSize="16px">{ben.relationship}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Percentage</DxcTypography>
                                <DxcTypography fontSize="16px">{ben.percentage}</DxcTypography>
                              </DxcFlex>
                              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                                <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">Amount</DxcTypography>
                                <DxcTypography fontSize="20px" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>{ben.amount}</DxcTypography>
                              </DxcFlex>
                              <DxcBadge label={ben.status} />
                            </DxcFlex>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))}
                  </DxcFlex>
                  )}
                </DxcFlex>
              )}

              {/* Timeline Tab - SA-010 Activity Timeline */}
              {activeTab === 3 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcHeading level={4} text="Activity Timeline" />
                    <DxcFlex gap="var(--spacing-gap-s)">
                      <DxcChip label="User Generated" size="small" />
                      <DxcChip label="System Generated" size="small" />
                    </DxcFlex>
                  </DxcFlex>
                  {timelineEvents.length > 0 ? (
                    timelineEvents.map((event, index) => (
                      <DxcContainer
                        key={index}
                        style={{
                          backgroundColor: "var(--color-bg-neutral-lightest)",
                          borderLeft: "4px solid #808285", /* BLOOM: Gray accent for timeline */
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                        }}
                        border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
                      >
                        <DxcInset space="var(--spacing-padding-m)">
                          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                            <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                                {event.type || 'Event'}
                              </DxcTypography>
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                                {event.timestamp ? new Date(event.timestamp).toLocaleString('en-US', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}
                              </DxcTypography>
                            </DxcFlex>
                            {event.user?.name && (
                              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                                by {event.user.name}
                              </DxcTypography>
                            )}
                            <DxcTypography fontSize="font-scale-03">
                              {event.description || 'No description'}
                            </DxcTypography>
                          </DxcFlex>
                        </DxcInset>
                      </DxcContainer>
                    ))
                  ) : (
                    <DxcContainer
                      padding="var(--spacing-padding-l)"
                      style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
                    >
                      <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                        No timeline events available for this claim.
                      </DxcTypography>
                    </DxcContainer>
                  )}
                </DxcFlex>
              )}

              {/* Requirements Tab */}
              {activeTab === 4 && (
                <RequirementsEngine
                  claim={claim}
                  onGenerateRequirements={() => {
                    console.log('Generate requirements clicked');
                  }}
                  onGenerateLetter={() => {
                    console.log('Generate letter clicked');
                  }}
                  onUploadDocument={(req) => {
                    console.log('Upload document for requirement:', req);
                    setActiveTab(5); // Switch to Documents tab
                  }}
                  onWaive={(req) => {
                    console.log('Waive requirement:', req);
                  }}
                />
              )}

              {/* Documents Tab */}
              {activeTab === 5 && (
                <DxcFlex direction="column" gap="var(--spacing-gap-l)">
                  {/* Upload Section */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcHeading level={3} text="Upload Documents" />
                    <DocumentUpload
                      claimId={claim.id}
                      onUploadComplete={(result) => {
                        console.log('Upload complete:', result);
                        // TODO: Refresh documents list
                      }}
                      acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']}
                      maxFileSize={10 * 1024 * 1024}
                      multiple={true}
                    />
                  </DxcFlex>

                  {/* Documents List */}
                  <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                    <DxcHeading level={3} text="Uploaded Documents" />
                    <DocumentViewer
                      documents={claim.documents || []}
                      onDocumentClick={(doc) => {
                        console.log('Document clicked:', doc);
                        // TODO: Open document preview modal
                      }}
                      onDownload={(doc) => {
                        console.log('Download document:', doc);
                        // TODO: Implement download
                      }}
                      showIDP={true}
                      showActions={true}
                    />
                  </DxcFlex>
                </DxcFlex>
              )}

              {/* Beneficiary Analyzer Tab */}
              {activeTab === 6 && (
                <BeneficiaryAnalyzer
                  claimId={claim.claimNumber || claim.id}
                  claim={claim}
                  onApproveBeneficiaries={(beneficiaries) => {
                    console.log('[ClaimsWorkbench] Beneficiaries approved:', beneficiaries);
                    // TODO: Update claim with approved beneficiaries
                    // Switch back to Policy 360 tab to see updated beneficiaries
                    setActiveTab(2);
                  }}
                  onCancel={() => {
                    // Return to Policy 360 tab
                    setActiveTab(2);
                  }}
                />
              )}

              {/* Related Policies Tab */}
              {activeTab === 7 && (
                <RelatedPoliciesPanel
                  claimData={claim}
                  onInitiateClaim={(policy) => {
                    console.log('[ClaimsWorkbench] Initiating death claim for related policy:', policy.policyNumber);
                    // TODO: Navigate to FNOL form with pre-populated data
                    alert(`Initiating death claim for policy ${policy.policyNumber}\n\nThis would:\n1. Pre-populate FNOL with deceased information\n2. Copy death certificate from current claim\n3. Link to original claim: ${claim.claimNumber}\n4. Navigate to intake form`);
                  }}
                  onViewPolicy={(policy) => {
                    console.log('[ClaimsWorkbench] Viewing policy:', policy.policyNumber);
                    setSelectedPolicy(policy);
                    setShowPolicyModal(true);
                  }}
                />
              )}

              {/* Claim Guardian Tab */}
              {activeTab === 8 && (
                <ClaimGuardianPanel claimData={claim} />
              )}

            </DxcInset>
          </DxcFlex>
        </DxcContainer>
          </DxcFlex>
        </DxcContainer>

        {/* Work Notes Panel - Always Visible */}
        <DxcContainer padding="var(--spacing-padding-l)" paddingTop="0">
          <WorkNotes
            claimSysId={claim.sysId || claim.servicenow_sys_id}
            fnolNumber={claim.fnolNumber || claim.claimNumber}
            isDemo={!claim.sysId || claim.sysId?.includes('demo')}
            demoWorkNotes={claim.workNotes || []}
          />
        </DxcContainer>
      </DxcFlex>

      {/* Modal Dialogs */}
      {/* PMI Calculator Modal */}
      {showPMICalculator && (
        <DxcDialog
          isCloseVisible
          onCloseClick={() => setShowPMICalculator(false)}
        >
          <PMICalculator
            claimData={claim}
            onCalculate={(result) => {
              console.log('PMI calculated:', result);
            }}
            onApply={(result) => {
              console.log('PMI applied:', result);
              setShowPMICalculator(false);
            }}
            onClose={() => setShowPMICalculator(false)}
          />
        </DxcDialog>
      )}

      {/* Tax Withholding Calculator Modal */}
      {showTaxCalculator && (
        <DxcDialog
          isCloseVisible
          onCloseClick={() => setShowTaxCalculator(false)}
        >
          <TaxWithholdingCalculator
            claimData={claim}
            paymentData={claim.financial?.payments?.[0]}
            onCalculate={(result) => {
              console.log('Tax calculated:', result);
            }}
            onApply={(result) => {
              console.log('Tax applied:', result);
              setShowTaxCalculator(false);
            }}
            onClose={() => setShowTaxCalculator(false)}
          />
        </DxcDialog>
      )}

      {/* Payment Quick View Modal */}
      {showPaymentModal && selectedPayment && (
        <DxcDialog
          isCloseVisible
          onCloseClick={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
        >
          <PaymentQuickView
            payment={selectedPayment}
            onEdit={(payment) => {
              console.log('Edit payment:', payment);
              setShowPaymentModal(false);
            }}
            onCancel={(payment) => {
              console.log('Cancel payment:', payment);
              setShowPaymentModal(false);
            }}
            onResend={(payment) => {
              console.log('Resend payment:', payment);
              setShowPaymentModal(false);
            }}
            onView1099={() => {
              console.log('View 1099');
            }}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedPayment(null);
            }}
          />
        </DxcDialog>
      )}

      {/* Policy Detail View Modal */}
      {showPolicyModal && selectedPolicy && (
        <DxcDialog
          isCloseVisible
          onCloseClick={() => {
            setShowPolicyModal(false);
            setSelectedPolicy(null);
          }}
        >
          <PolicyDetailView
            policy={selectedPolicy}
            onEdit={(policy) => {
              console.log('Edit policy:', policy);
              setShowPolicyModal(false);
            }}
            onSuspend={(policy) => {
              console.log('Suspend policy:', policy);
              setShowPolicyModal(false);
            }}
            onAssociate={(policy) => {
              console.log('Associate policy:', policy);
              setShowPolicyModal(false);
            }}
            onDissociate={(policy) => {
              console.log('Dissociate policy:', policy);
              setShowPolicyModal(false);
            }}
            onClose={() => {
              setShowPolicyModal(false);
              setSelectedPolicy(null);
            }}
          />
        </DxcDialog>
      )}

      {/* Party Add/Edit Form Modal — custom overlay (same design as Update Death Details) */}
      {showPartyForm && (
        <PartyForm
          party={selectedParty}
          onSave={(partyData) => {
            console.log('Party saved:', partyData);
            setShowPartyForm(false);
            setSelectedParty(null);
          }}
          onCancel={() => {
            setShowPartyForm(false);
            setSelectedParty(null);
          }}
          onCSLNSearch={(partyData) => {
            console.log('CSLN search for:', partyData);
          }}
        />
      )}

      {/* Death Details Edit Modal — custom overlay */}
      {showDeathEditModal && (
        <div className="death-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !deathSaving) { setShowDeathEditModal(false); setDeathSaveError(null); } }}>
          <div className="death-modal">

            {/* Header */}
            <div className="death-modal__header">
              <div className="death-modal__header-icon">
                <span className="material-icons">event</span>
              </div>
              <div>
                <div className="death-modal__header-title">Update Death Details</div>
                <div className="death-modal__header-sub">Edit insured death event information</div>
              </div>
              <button className="death-modal__close" onClick={() => { setShowDeathEditModal(false); setDeathSaveError(null); }} disabled={deathSaving}>
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="death-modal__body">
              {deathSaveError && (
                <DxcAlert type="error" inlineText={deathSaveError} onClose={() => setDeathSaveError(null)} />
              )}

              {/* Section: Core Info */}
              <div className="death-modal__section">
                <div className="death-modal__section-label">
                  <span className="material-icons">info</span> Core Information
                </div>
                <div className="death-modal__grid-2">
                  <div className="death-modal__field">
                    <label className="death-modal__label">Date of Death <span className="death-modal__required">*</span></label>
                    <div className="death-modal__input-wrap">
                      <span className="material-icons death-modal__input-icon">calendar_today</span>
                      <input
                        type="date"
                        className="death-modal__input"
                        value={deathForm.dateOfDeath}
                        onChange={(e) => setDeathForm(p => ({ ...p, dateOfDeath: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="death-modal__field">
                    <label className="death-modal__label">Manner of Death</label>
                    <div className="death-modal__input-wrap">
                      <span className="material-icons death-modal__input-icon">policy</span>
                      <select
                        className="death-modal__select"
                        value={deathForm.mannerOfDeath}
                        onChange={(e) => setDeathForm(p => ({ ...p, mannerOfDeath: e.target.value }))}
                      >
                        {['Natural','Accident','Homicide','Suicide','Undetermined'].map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="death-modal__field death-modal__field--full">
                    <label className="death-modal__label">Cause of Death</label>
                    <div className="death-modal__input-wrap">
                      <span className="material-icons death-modal__input-icon">medical_information</span>
                      <input
                        type="text"
                        className="death-modal__input"
                        placeholder="e.g. Heart Failure, Natural Causes"
                        value={deathForm.causeOfDeath}
                        onChange={(e) => setDeathForm(p => ({ ...p, causeOfDeath: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Location */}
              <div className="death-modal__section">
                <div className="death-modal__section-label">
                  <span className="material-icons">location_on</span> Location
                </div>
                <div className="death-modal__grid-2">
                  <div className="death-modal__field">
                    <label className="death-modal__label">Death in USA</label>
                    <div className="death-modal__toggle-row">
                      {['Yes','No'].map(opt => (
                        <button
                          key={opt}
                          className={`death-modal__toggle ${deathForm.deathInUSA === opt ? 'death-modal__toggle--active' : ''}`}
                          onClick={() => setDeathForm(p => ({ ...p, deathInUSA: opt }))}
                          type="button"
                        >{opt}</button>
                      ))}
                    </div>
                  </div>
                  {deathForm.deathInUSA === 'No' && (
                    <div className="death-modal__field">
                      <label className="death-modal__label">Country of Death</label>
                      <div className="death-modal__input-wrap">
                        <span className="material-icons death-modal__input-icon">public</span>
                        <input
                          type="text"
                          className="death-modal__input"
                          placeholder="Country name"
                          value={deathForm.countryOfDeath}
                          onChange={(e) => setDeathForm(p => ({ ...p, countryOfDeath: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Documentation */}
              <div className="death-modal__section">
                <div className="death-modal__section-label">
                  <span className="material-icons">description</span> Documentation
                </div>
                <div className="death-modal__grid-2">
                  <div className="death-modal__field">
                    <label className="death-modal__label">Proof of Death Source</label>
                    <div className="death-modal__input-wrap">
                      <span className="material-icons death-modal__input-icon">verified</span>
                      <select
                        className="death-modal__select"
                        value={deathForm.proofOfDeathSourceType}
                        onChange={(e) => setDeathForm(p => ({ ...p, proofOfDeathSourceType: e.target.value }))}
                      >
                        {['Certified Death Certificate','Death Certificate Copy','Online Obituary','Funeral Home Records','Hospital Records'].map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="death-modal__field">
                    <label className="death-modal__label">Proof of Death Date</label>
                    <div className="death-modal__input-wrap">
                      <span className="material-icons death-modal__input-icon">calendar_today</span>
                      <input
                        type="date"
                        className="death-modal__input"
                        value={deathForm.proofOfDeathDate}
                        onChange={(e) => setDeathForm(p => ({ ...p, proofOfDeathDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="death-modal__field death-modal__field--full">
                    <label className="death-modal__label">Special Event <span className="death-modal__optional">(optional)</span></label>
                    <div className="death-modal__input-wrap">
                      <span className="material-icons death-modal__input-icon">warning</span>
                      <input
                        type="text"
                        className="death-modal__input"
                        placeholder="e.g. Airline Disaster, War, Pandemic"
                        value={deathForm.specialEvent}
                        onChange={(e) => setDeathForm(p => ({ ...p, specialEvent: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="death-modal__footer">
              <button
                className="death-modal__btn death-modal__btn--cancel"
                onClick={() => { setShowDeathEditModal(false); setDeathSaveError(null); }}
                disabled={deathSaving}
              >Cancel</button>
              <button
                className={`death-modal__btn death-modal__btn--save ${deathSaving ? 'death-modal__btn--saving' : ''}`}
                disabled={deathSaving || !deathForm.dateOfDeath}
                onClick={async () => {
                  setDeathSaving(true);
                  setDeathSaveError(null);
                  try {
                    const sysId = claim.sys_id || claim.id;
                    await serviceNowService.updateDeathDetails(sysId, {
                      dateOfDeath:   deathForm.dateOfDeath,
                      causeOfDeath:  deathForm.causeOfDeath,
                      mannerOfDeath: deathForm.mannerOfDeath,
                    });
                    setLocalDeathEvent(prev => ({
                      ...prev,
                      ...deathForm,
                      deathInUSA: deathForm.deathInUSA === 'Yes',
                    }));
                    setShowDeathEditModal(false);
                  } catch (err) {
                    setDeathSaveError(err.message || 'Failed to save death details.');
                  } finally {
                    setDeathSaving(false);
                  }
                }}
              >
                {deathSaving
                  ? <><span className="material-icons death-modal__spin">sync</span> Saving…</>
                  : <><span className="material-icons">save</span> Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beneficiary Analyzer Modal */}
      {showBeneficiaryAnalyzer && (
        <DxcDialog isCloseVisible onCloseClick={() => setShowBeneficiaryAnalyzer(false)}>
          <div style={{ maxHeight: '85vh', overflowY: 'auto', overflowX: 'hidden' }}>
            <BeneficiaryAnalyzer
              claimId={claim.claimNumber || claim.id}
              claim={claim}
              onApproveBeneficiaries={(beneficiaries) => {
                console.log('Beneficiaries approved:', beneficiaries);
                setShowBeneficiaryAnalyzer(false);
              }}
              onRequestDocuments={(beneficiaries) => {
                console.log('Request documents for beneficiaries:', beneficiaries);
                setShowBeneficiaryAnalyzer(false);
              }}
              onClose={() => setShowBeneficiaryAnalyzer(false)}
            />
          </div>
        </DxcDialog>
      )}

      {/* Anomaly Detection Modal */}
      {showAnomalyDetection && (
        <DxcDialog isCloseVisible onCloseClick={() => {
          setShowAnomalyDetection(false);
          setAnomalyData(null);
        }}>
          <div style={{ maxHeight: '85vh', overflowY: 'auto', overflowX: 'hidden' }}>
            <DxcInset space="var(--spacing-padding-l)">
              {anomalyLoading ? (
                <DxcFlex direction="column" alignItems="center" justifyContent="center" gap="var(--spacing-gap-m)" style={{ minHeight: '300px' }}>
                  <DxcSpinner label="Running anomaly detection..." mode="large" />
                  <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)" style={{ textAlign: 'center', maxWidth: '80%' }}>
                    {anomalyLoadingMessage || 'Analyzing payment data from ServiceNow...'}
                  </DxcTypography>
                  {anomalyRetryCount > 0 && (
                    <DxcBadge
                      label={`Attempt ${anomalyRetryCount}/10`}
                      mode="notification"
                    />
                  )}
                  <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-darker)">
                    Claim sys_id: {claim.sysId || claim.servicenow_sys_id || claim.id}
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-dark)" style={{ fontStyle: 'italic', textAlign: 'center', maxWidth: '80%' }}>
                    This process may take up to 30 seconds. Please wait...
                  </DxcTypography>
                </DxcFlex>
              ) : anomalyData ? (
                <AnomalyDetection
                  anomalyData={anomalyData}
                  onClose={() => {
                    setShowAnomalyDetection(false);
                    setAnomalyData(null);
                  }}
                />
              ) : (
                <DxcContainer padding="var(--spacing-padding-m)">
                  <DxcAlert
                    type="error"
                    inlineText="Failed to load anomaly detection data. Check browser console for details."
                  />
                  <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)" style={{ marginTop: '16px' }}>
                    Please check the browser console (F12) for detailed error information.
                  </DxcTypography>
                </DxcContainer>
              )}
            </DxcInset>
          </div>
        </DxcDialog>
      )}
    </DxcContainer>
  );
};

export default ClaimsWorkbench;
