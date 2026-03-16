import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcAlert,
  DxcChip,
  DxcButton,
  DxcInset,
  DxcDivider
} from '@dxc-technology/halstack-react';
import './AIInsightsPanel.css';

/**
 * SA-012: Claim Insights Panel
 *
 * Displays AI-powered insights including:
 * - Anomaly alerts
 * - Verification confidence scores
 * - Risk indicators
 * - Fraud detection alerts
 * - Pattern matching results
 *
 * New functionality not present in cmA
 */
const AIInsightsPanel = ({ claimData, insights = [], onViewDetail, onDismiss }) => {
  const getSeverityType = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'info';
    }
  };

  const getSeverityColor = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return 'var(--color-status-error-darker)';
      case 'MEDIUM':
        return 'var(--color-status-warning-darker)';
      case 'LOW':
        return 'var(--color-status-info-darker)';
      default:
        return 'var(--color-fg-neutral-strong)';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 75) return 'var(--color-status-error-darker)';
    if (score >= 50) return 'var(--color-status-warning-darker)';
    return 'var(--color-status-success-darker)';
  };

  const getRiskLevel = (score) => {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    return 'Low Risk';
  };

  const highAlerts = insights.filter(i => ['HIGH', 'CRITICAL'].includes((i.severity || '').toUpperCase()));
  const mediumAlerts = insights.filter(i => (i.severity || '').toUpperCase() === 'MEDIUM');
  const lowAlerts = insights.filter(i => (i.severity || '').toUpperCase() === 'LOW');

  const overallRiskScore = claimData?.riskScore || 0;

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
              psychology
            </span>
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Claim Insights
            </DxcTypography>
          </DxcFlex>
          <DxcChip
            label={`${insights.length} ${insights.length === 1 ? 'Alert' : 'Alerts'}`}
            icon="notification_important"
            size="small"
          />
        </DxcFlex>

        {/* Overall Risk Score */}
        {overallRiskScore > 0 && (
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{
              backgroundColor: overallRiskScore >= 75 ? 'var(--color-bg-error-lightest)' : overallRiskScore >= 50 ? 'var(--color-bg-warning-lightest)' : 'var(--color-bg-success-lightest)'
            }}
          >
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Overall Risk Assessment
                </DxcTypography>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  {getRiskLevel(overallRiskScore)}
                </DxcTypography>
              </DxcFlex>
              <DxcFlex direction="column" alignItems="flex-end" gap="var(--spacing-gap-xs)">
                <DxcTypography
                  fontSize="font-scale-05"
                  fontWeight="font-weight-semibold"
                  style={{ color: getRiskScoreColor(overallRiskScore) }}
                >
                  {overallRiskScore}
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Risk Score
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </DxcContainer>
        )}

        {/* Alert Summary */}
        {insights.length > 0 && (
          <DxcFlex gap="var(--spacing-gap-m)">
            <DxcContainer
              padding="var(--spacing-padding-s)"
              style={{ backgroundColor: 'var(--color-bg-error-lightest)', flex: 1 }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center">
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)">
                  {highAlerts.length}
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  High Priority
                </DxcTypography>
              </DxcFlex>
            </DxcContainer>
            <DxcContainer
              padding="var(--spacing-padding-s)"
              style={{ backgroundColor: 'var(--color-bg-warning-lightest)', flex: 1 }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center">
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="var(--color-fg-warning-medium)">
                  {mediumAlerts.length}
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Medium
                </DxcTypography>
              </DxcFlex>
            </DxcContainer>
            <DxcContainer
              padding="var(--spacing-padding-s)"
              style={{ backgroundColor: 'var(--color-bg-info-lightest)', flex: 1 }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)" alignItems="center">
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                  {lowAlerts.length}
                </DxcTypography>
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Low
                </DxcTypography>
              </DxcFlex>
            </DxcContainer>
          </DxcFlex>
        )}

        {/* Insights List */}
        {insights.length > 0 ? (
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            {insights.map((insight, index) => (
              <div key={insight.id || index}>
                {index > 0 && <DxcDivider />}
                <DxcAlert
                  type={getSeverityType(insight.severity)}
                  inlineText={insight.title || insight.message}
                  onClose={onDismiss ? () => onDismiss(insight) : undefined}
                />
                <DxcInset>
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    {/* Insight Details */}
                    <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                      <DxcChip
                        label={insight.category || 'General'}
                        icon="category"
                        size="small"
                      />
                      <DxcChip
                        label={`Confidence: ${insight.confidence || 0}%`}
                        size="small"
                      />
                      {insight.timestamp && (
                        <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                          Detected: {new Date(insight.timestamp).toLocaleString()}
                        </DxcTypography>
                      )}
                    </DxcFlex>

                    {/* Description */}
                    {insight.description && (
                      <DxcTypography fontSize="font-scale-01">
                        {insight.description}
                      </DxcTypography>
                    )}

                    {/* Recommendation */}
                    {insight.recommendation && (
                      <DxcContainer
                        padding="var(--spacing-padding-s)"
                        style={{ backgroundColor: 'var(--color-bg-info-lighter)' }}
                      >
                        <DxcFlex gap="var(--spacing-gap-xs)">
                          <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-info-medium)' }}>
                            lightbulb
                          </span>
                          <DxcTypography fontSize="font-scale-01">
                            <strong>Recommendation:</strong> {insight.recommendation}
                          </DxcTypography>
                        </DxcFlex>
                      </DxcContainer>
                    )}

                    {/* Actions */}
                    {onViewDetail && (
                      <DxcFlex>
                        <DxcButton
                          label="View Details"
                          mode="tertiary"
                          size="small"
                          icon="visibility"
                          onClick={() => onViewDetail(insight)}
                        />
                      </DxcFlex>
                    )}
                  </DxcFlex>
                </DxcInset>
              </div>
            ))}
          </DxcFlex>
        ) : (
          <DxcContainer
            padding="var(--spacing-padding-l)"
            style={{ backgroundColor: 'var(--color-bg-success-lightest)', textAlign: 'center' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '48px', color: 'var(--color-fg-success-medium)' }}>
                check_circle
              </span>
              <DxcTypography color="var(--color-fg-success-medium)" fontWeight="font-weight-semibold">
                No anomalies detected
              </DxcTypography>
              <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                All verification checks passed successfully
              </DxcTypography>
            </DxcFlex>
          </DxcContainer>
        )}
      </DxcFlex>
    </DxcContainer>
  );
};

export default AIInsightsPanel;
