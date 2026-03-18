/**
 * Beneficiary Analysis Panel
 *
 * Displays beneficiary analysis status and results within ClaimDetail
 * Automatically triggers analysis when FNOL is loaded
 */

import { iconEl } from '../../utils/iconEl';
import { useState } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcHeading,
  DxcTypography,
  DxcButton,
  DxcSpinner,
  DxcBadge,
  DxcAlert
} from '@dxc-technology/halstack-react';
import useBeneficiaryAnalysis from '../../hooks/useBeneficiaryAnalysis';
import './BeneficiaryAnalysisPanel.css';

const BeneficiaryAnalysisPanel = ({ fnolSysId, claimNumber }) => {
  const [expanded, setExpanded] = useState(true);

  const {
    analysisData,
    analysisResult,
    loading,
    error,
    triggered,
    triggerAnalysis,
    fetchBeneficiaryData,
    hasData,
    hasResult,
    isSuccess
  } = useBeneficiaryAnalysis(fnolSysId, {
    autoTrigger: true,
    autoTriggerDelay: 2000, // Wait 2 seconds after claim loads
    onSuccess: (result) => {
      console.log('Beneficiary analysis completed for claim:', claimNumber, result);
    },
    onError: (err) => {
      console.error('Beneficiary analysis failed for claim:', claimNumber, err);
    }
  });

  /**
   * Render beneficiary comparison results
   */
  const renderBeneficiaryData = () => {
    if (!analysisData?.Output) return null;

    const output = analysisData.Output;
    const dmsData = output.find(item => item.DMS)?.DMS || [];
    const pasData = output.find(item => item.PAS)?.PAS || [];
    const summary = output.find(item => item.Summary)?.Summary || '';
    const scoring = output.find(item => item.BeneScoring)?.BeneScoring || [];

    // Extract total shares matching
    const totalShares = scoring.find(s => s.totalBeneficiaryShares)?.totalBeneficiaryShares || [];
    const primaryMatch = totalShares.find(s => s.PrimaryShares)?.PrimaryShares;
    const contingentMatch = totalShares.find(s => s.ContingentShares)?.ContingentShares;

    return (
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Summary Banner */}
        <DxcAlert
          type={primaryMatch?.Match === 'MATCH' && contingentMatch?.Match === 'MATCH' ? 'success' : 'warning'}
          size="fitContent"
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcTypography fontWeight="font-weight-semibold">
              {primaryMatch?.Match === 'MATCH' && contingentMatch?.Match === 'MATCH'
                ? '✓ Beneficiaries Match'
                : '⚠ Review Required'}
            </DxcTypography>
            <DxcTypography fontSize="font-scale-02">
              {summary}
            </DxcTypography>
          </DxcFlex>
        </DxcAlert>

        {/* Beneficiary Count */}
        <DxcFlex gap="var(--spacing-gap-m)">
          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              DMS BENEFICIARIES
            </DxcTypography>
            <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
              {dmsData.length}
            </DxcTypography>
          </DxcFlex>

          <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
            <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
              PAS BENEFICIARIES
            </DxcTypography>
            <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
              {pasData.length}
            </DxcTypography>
          </DxcFlex>
        </DxcFlex>

        {/* Share Totals */}
        {(primaryMatch || contingentMatch) && (
          <DxcContainer
            style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
            padding="var(--spacing-padding-s)"
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcTypography fontSize="12px" fontWeight="font-weight-semibold" color="var(--color-fg-neutral-dark)">
                SHARE TOTALS
              </DxcTypography>

              {primaryMatch && (
                <DxcFlex justifyContent="space-between" alignItems="center">
                  <DxcTypography fontSize="font-scale-02">
                    Primary: DMS {primaryMatch.DMS} | PAS {primaryMatch.PAS}
                  </DxcTypography>
                  <DxcBadge
                    label={primaryMatch.Match}
                    mode="contextual"
                    color={primaryMatch.Match === 'MATCH' ? 'success' : 'error'}
                  />
                </DxcFlex>
              )}

              {contingentMatch && (
                <DxcFlex justifyContent="space-between" alignItems="center">
                  <DxcTypography fontSize="font-scale-02">
                    Contingent: DMS {contingentMatch.DMS} | PAS {contingentMatch.PAS}
                  </DxcTypography>
                  <DxcBadge
                    label={contingentMatch.Match}
                    mode="contextual"
                    color={contingentMatch.Match === 'MATCH' ? 'success' : 'error'}
                  />
                </DxcFlex>
              )}
            </DxcFlex>
          </DxcContainer>
        )}

        {/* View Details Button */}
        <DxcButton
          label="View Full Beneficiary Comparison"
          mode="tertiary"
          icon={iconEl("visibility")}
          onClick={() => {
            // TODO: Open detailed beneficiary comparison modal
            console.log('Open beneficiary comparison modal');
          }}
        />
      </DxcFlex>
    );
  };

  if (!fnolSysId) {
    return null; // Don't render if no FNOL sys_id
  }

  return (
    <DxcContainer
      className="beneficiary-analysis-panel"
      style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
      padding="var(--spacing-padding-m)"
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
            <span className="material-icons" style={{ color: 'var(--color-fg-accent-primary)' }}>
              account_balance
            </span>
            <DxcHeading level={4} text="Beneficiary Analysis" />
          </DxcFlex>

          {!loading && (
            <DxcButton
              label={expanded ? 'Collapse' : 'Expand'}
              mode="text"
              icon={expanded ? 'expand_less' : 'expand_more'}
              onClick={() => setExpanded(!expanded)}
            />
          )}
        </DxcFlex>

        {expanded && (
          <>
            {/* Loading State */}
            {loading && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center" style={{ padding: '24px 0' }}>
                <DxcSpinner label="Analyzing beneficiaries..." />
                <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                  Retrieving data from worknotes and triggering analysis subflow...
                </DxcTypography>
              </DxcFlex>
            )}

            {/* Error State */}
            {error && !loading && (
              <DxcAlert type="error" size="fitContent">
                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    Analysis Failed
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02">
                    {error}
                  </DxcTypography>
                  <DxcFlex gap="var(--spacing-gap-s)">
                    <DxcButton
                      label="Retry Analysis"
                      mode="secondary"
                      icon={iconEl("refresh")}
                      onClick={triggerAnalysis}
                    />
                    <DxcButton
                      label="Fetch Data Only"
                      mode="tertiary"
                      icon={iconEl("download")}
                      onClick={fetchBeneficiaryData}
                    />
                  </DxcFlex>
                </DxcFlex>
              </DxcAlert>
            )}

            {/* Success State - Show Results */}
            {!loading && !error && hasData && renderBeneficiaryData()}

            {/* Not Triggered / No Data State */}
            {!loading && !error && !hasData && !triggered && (
              <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center" style={{ padding: '24px 0' }}>
                <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-fg-neutral-light)' }}>
                  pending_actions
                </span>
                <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-dark)">
                  Analysis will start automatically...
                </DxcTypography>
              </DxcFlex>
            )}

            {/* Manual Trigger Option */}
            {!loading && !triggered && (
              <DxcButton
                label="Trigger Analysis Now"
                mode="secondary"
                icon={iconEl("play_arrow")}
                onClick={triggerAnalysis}
              />
            )}
          </>
        )}

        {/* Collapsed State - Show Summary Badge */}
        {!expanded && (
          <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
            {loading && <DxcSpinner size="small" />}
            {error && <DxcBadge label="Error" mode="contextual" color="error" />}
            {isSuccess && <DxcBadge label="Complete" mode="contextual" color="success" />}
            {!triggered && <DxcBadge label="Pending" mode="contextual" color="neutral" />}
          </DxcFlex>
        )}
      </DxcFlex>
    </DxcContainer>
  );
};

export default BeneficiaryAnalysisPanel;
