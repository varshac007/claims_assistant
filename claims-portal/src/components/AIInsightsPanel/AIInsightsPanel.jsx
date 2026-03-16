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
 * Redesigned AI Insights Panel - Compact & Modern
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

  // Risk colors - BLOOM Design System
  const getRiskColor = () => {
    if (riskLevel === 'High') return '#D02E2E'; // BLOOM: Red
    if (riskLevel === 'Medium') return '#F6921E'; // BLOOM: Orange
    return '#37A526'; // BLOOM: Green
  };

  const getRiskBgColor = () => {
    if (riskLevel === 'High') return '#FFEBEE'; // Light red
    if (riskLevel === 'Medium') return '#FEF1E8'; // BLOOM: Light orange
    return '#E8F5E3'; // BLOOM: Light green
  };

  // Generate summary text (2-3 lines max)
  const getSummaryText = () => {
    if (totalAlerts === 0) {
      return 'All automated verification checks passed successfully. No anomalies or risk indicators detected.';
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
      {/* Compact AI Insights Card - BLOOM Enhanced */}
      <div className="ai-insights-card" style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '2px solid #D1D3D4', /* BLOOM: Border */
        borderLeft: `4px solid ${getRiskColor()}`,
        padding: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)', /* BLOOM: Shadow */
        transition: 'all 0.2s ease'
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

          {/* Risk Level & Score - BLOOM Enhanced */}
          <DxcFlex justifyContent="space-between" alignItems="center">
            <div style={{
              backgroundColor: getRiskBgColor(),
              padding: '8px 16px',
              borderRadius: '8px', /* BLOOM: Rounded */
              border: `2px solid ${getRiskColor()}`, /* BLOOM: 2px border */
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', /* BLOOM: Shadow */
              fontWeight: 700 /* BLOOM: Bold */
            }}>
              <DxcTypography
                fontSize="font-scale-02"
                fontWeight="font-weight-bold"
                style={{ color: getRiskColor() }}
              >
                {riskLevel} Risk
              </DxcTypography>
            </div>

            {riskScore > 0 && (
              <DxcTypography
                fontSize="32px"
                fontWeight="font-weight-bold"
                style={{ color: '#000000' /* BLOOM: Black for data */ }}
              >
                {riskScore}
              </DxcTypography>
            )}
          </DxcFlex>

          {/* Severity Badges - BLOOM Enhanced */}
          {totalAlerts > 0 && (
            <DxcFlex gap="8px" alignItems="center" wrap="wrap">
              {highAlerts.length > 0 && (
                <div style={{
                  backgroundColor: '#FFEBEE',
                  padding: '6px 14px',
                  borderRadius: '8px', /* BLOOM: Rounded */
                  fontSize: '13px',
                  color: '#D02E2E', /* BLOOM: Red */
                  fontWeight: 700, /* BLOOM: Bold */
                  border: '2px solid #D02E2E', /* BLOOM: Border */
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' /* BLOOM: Shadow */
                }}>
                  {highAlerts.length} High
                </div>
              )}
              {mediumAlerts.length > 0 && (
                <div style={{
                  backgroundColor: '#FEF1E8', /* BLOOM: Light orange */
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#F6921E', /* BLOOM: Orange */
                  fontWeight: 700,
                  border: '2px solid #F6921E',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  {mediumAlerts.length} Medium
                </div>
              )}
              {lowAlerts.length > 0 && (
                <div style={{
                  backgroundColor: '#E3F2FD',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#1B75BB', /* BLOOM: Blue */
                  fontWeight: 700,
                  border: '2px solid #1B75BB',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
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
              icon="arrow_forward"
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
