import { iconEl } from '../../utils/iconEl';
import { useState } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcDialog,
  DxcInset
} from '@dxc-technology/halstack-react';
import AnomalyDetection from '../shared/AnomalyDetection';
import './AIInsightsPanel.css';

/**
 * Redesigned Claim Insights Panel - Compact & Modern
 * Enterprise-grade design for ServiceNow/Insurance portals
 */
const AIInsightsPanel = ({ claimData, insights = [], anomalyData }) => {
  const [showModal, setShowModal] = useState(false);

  // Calculate metrics
  const highAlerts = insights.filter(i => ['HIGH', 'CRITICAL'].includes((i.severity || '').toUpperCase()));
  const mediumAlerts = insights.filter(i => (i.severity || '').toUpperCase() === 'MEDIUM');
  const lowAlerts = insights.filter(i => (i.severity || '').toUpperCase() === 'LOW');
  const totalAlerts = insights.length;

  // Determine risk level
  const riskLevel = highAlerts.length > 0 ? 'High' : mediumAlerts.length > 0 ? 'Medium' : 'Low';
  const riskScore = claimData?.riskScore || 0;

  // Risk colors
  const getRiskColor = () => {
    if (riskLevel === 'High') return '#D32F2F'; // Red
    if (riskLevel === 'Medium') return '#F57C00'; // Orange
    return '#388E3C'; // Green
  };

  const getRiskBgColor = () => {
    if (riskLevel === 'High') return '#FFEBEE';
    if (riskLevel === 'Medium') return '#FFF3E0';
    return '#E8F5E9';
  };

  // Generate summary text (2-3 lines max)
  const getSummaryText = () => {
    if (totalAlerts === 0) {
      return 'All verification checks passed successfully. No anomalies or risk indicators detected.';
    }

    const criticalCount = highAlerts.length;
    const mediumCount = mediumAlerts.length;

    if (criticalCount > 0) {
      return `${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} detected requiring immediate attention. Payment discrepancies and data integrity concerns identified.`;
    }

    if (mediumCount > 0) {
      return `${mediumCount} moderate issue${mediumCount > 1 ? 's' : ''} found. Review recommended for data validation and compliance verification.`;
    }

    return 'Minor issues detected. Standard review procedures apply.';
  };

  return (
    <>
      {/* Compact Claim Insights Card */}
      <div className="ai-insights-card" style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E0E0E0',
        borderLeft: `4px solid ${getRiskColor()}`,
        padding: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease'
      }}>
        <DxcFlex direction="column" gap="12px">
          {/* Header Row */}
          <DxcFlex justifyContent="space-between" alignItems="center">
            <DxcFlex gap="8px" alignItems="center">
              <span className="material-icons" style={{
                color: 'var(--color-fg-primary-stronger)',
                fontSize: '20px'
              }}>
                psychology
              </span>
              <DxcTypography
                fontSize="font-scale-03"
                fontWeight="font-weight-semibold"
              >
                Claim Insights
              </DxcTypography>
            </DxcFlex>

            <DxcFlex gap="8px" alignItems="center">
              <DxcBadge
                label={`${totalAlerts} Alert${totalAlerts !== 1 ? 's' : ''}`}
                mode={totalAlerts > 0 ? 'notification' : 'default'}
              />
            </DxcFlex>
          </DxcFlex>

          {/* Risk Level & Score */}
          <DxcFlex justifyContent="space-between" alignItems="center">
            <div style={{
              backgroundColor: getRiskBgColor(),
              padding: '6px 12px',
              borderRadius: '4px',
              border: `1px solid ${getRiskColor()}`
            }}>
              <DxcTypography
                fontSize="font-scale-02"
                fontWeight="font-weight-semibold"
                style={{ color: getRiskColor() }}
              >
                {riskLevel} Risk
              </DxcTypography>
            </div>

            {riskScore > 0 && (
              <DxcTypography
                fontSize="24px"
                fontWeight="font-weight-bold"
                style={{ color: getRiskColor() }}
              >
                {riskScore}
              </DxcTypography>
            )}
          </DxcFlex>

          {/* Severity Badges */}
          {totalAlerts > 0 && (
            <DxcFlex gap="8px" alignItems="center" wrap="wrap">
              {highAlerts.length > 0 && (
                <div style={{
                  backgroundColor: '#FFEBEE',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#D32F2F',
                  fontWeight: 600
                }}>
                  {highAlerts.length} High
                </div>
              )}
              {mediumAlerts.length > 0 && (
                <div style={{
                  backgroundColor: '#FFF3E0',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#F57C00',
                  fontWeight: 600
                }}>
                  {mediumAlerts.length} Medium
                </div>
              )}
              {lowAlerts.length > 0 && (
                <div style={{
                  backgroundColor: '#E3F2FD',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#1976D2',
                  fontWeight: 600
                }}>
                  {lowAlerts.length} Low
                </div>
              )}
            </DxcFlex>
          )}

          {/* Summary Text (2-3 lines max) */}
          <DxcTypography
            fontSize="font-scale-02"
            style={{
              color: '#616161',
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {getSummaryText()}
          </DxcTypography>

          {/* Read More Button */}
          {(totalAlerts > 0 || anomalyData) && (
            <DxcButton
              label="Read More"
              mode="text"
              size="small"
              icon={iconEl("arrow_forward")}
              onClick={() => setShowModal(true)}
              style={{
                alignSelf: 'flex-start',
                padding: '4px 0'
              }}
            />
          )}
        </DxcFlex>
      </div>

      {/* Modal - Full Anomaly Details */}
      {showModal && anomalyData && (
        <DxcDialog
          isCloseVisible
          onCloseClick={() => setShowModal(false)}
          style={{
            borderRadius: '16px',
            maxWidth: '900px'
          }}
        >
          <div style={{
            maxHeight: '85vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            borderRadius: '16px'
          }}>
            <DxcInset space="var(--spacing-padding-l)">
              <AnomalyDetection
                anomalyData={anomalyData}
                onClose={() => setShowModal(false)}
              />
            </DxcInset>
          </div>
        </DxcDialog>
      )}
    </>
  );
};

export default AIInsightsPanel;
