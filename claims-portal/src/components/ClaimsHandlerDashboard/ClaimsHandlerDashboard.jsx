import { iconEl } from '../../utils/iconEl';
import { useState } from 'react';
import { DxcFlex, DxcButton, DxcTypography } from '@dxc-technology/halstack-react';
import './ClaimsHandlerDashboard.css';

const ClaimsHandlerDashboard = () => {
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [performanceView, setPerformanceView] = useState('yesterday');

  // Mock data - would come from API
  const inventoryData = {
    totalOpen: 54,
    buckets: [
      { id: 'all', label: 'All Claims', count: 54, color: '#000000', icon: 'list_alt' },
      { id: 'new-fnol', label: 'New FNOL', count: 8, color: '#1B75BB', icon: 'fiber_new' },
      { id: 'waiting-requirements', label: 'Waiting on Requirements', count: 12, color: '#F6921E', icon: 'pending_actions' },
      { id: 'manual-followup', label: 'Manual Follow-Up Required', count: 6, color: '#D02E2E', icon: 'phone_in_talk' },
      { id: 'mail-received', label: 'Mail Received – Needs Review', count: 9, color: '#00ADEE', icon: 'mail_outline' },
      { id: 'documents-received', label: 'Documents Received', count: 7, color: '#155A93', icon: 'description' },
      { id: 'waiting-other', label: 'Waiting on Other', count: 5, color: '#8BC53F', icon: 'hourglass_empty' },
      { id: 'quality-review', label: 'Quality Review', count: 4, color: '#37A526', icon: 'verified' },
      { id: 'manager-approvals', label: 'Manager Approvals', count: 3, color: '#E8DE23', icon: 'supervisor_account' }
    ]
  };

  const performanceData = {
    yesterday: {
      hoursWorked: 7.5,
      casesClosed: 4,
      activitiesCompleted: 23,
      utilizationRate: 3.07, // activities per hour
      rollingAvgHours: 7.8
    },
    today: {
      hoursWorked: 3.2,
      casesClosed: 1,
      activitiesCompleted: 9,
      utilizationRate: 2.81
    },
    weekToDate: {
      hoursWorked: 38.5,
      casesClosed: 19,
      activitiesCompleted: 112,
      utilizationRate: 2.91
    },
    monthToDate: {
      hoursWorked: 156.0,
      casesClosed: 78,
      activitiesCompleted: 468,
      utilizationRate: 3.00
    }
  };

  const handleBucketClick = (bucketId) => {
    setSelectedBucket(bucketId);
    // Would navigate to filtered list view
    console.log('Drilling into bucket:', bucketId);
  };

  const currentPerformance = performanceData[performanceView];

  return (
    <div className="claims-handler-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Claims Workbench</h1>
        <DxcTypography className="dashboard-subtitle">
          Logged in as: Claims Handler • Last updated: {new Date().toLocaleTimeString()}
        </DxcTypography>
      </div>

      {/* Total Open Inventory - Large KPI */}
      <div className="kpi-hero">
        <div className="kpi-hero-content">
          <span className="kpi-hero-label">Total Open Inventory</span>
          <span className="kpi-hero-value">{inventoryData.totalOpen}</span>
          <span className="kpi-hero-sublabel">Active Cases Assigned to Me</span>
        </div>
      </div>

      {/* Inventory by Claim Phase - Compact Tiles */}
      <div className="inventory-section">
        <h2 className="section-title">Inventory by Phase</h2>
        <div className="inventory-buckets">
          {inventoryData.buckets.map((bucket) => (
            <div
              key={bucket.id}
              className="inventory-bucket"
              onClick={() => handleBucketClick(bucket.id)}
              style={{ '--bucket-color': bucket.color }}
            >
              <div className="bucket-icon">
                <span className="material-icons">{bucket.icon}</span>
              </div>
              <div className="bucket-content">
                <div className="bucket-count">{bucket.count}</div>
                <div className="bucket-label">{bucket.label}</div>
              </div>
              <div className="bucket-arrow">
                <span className="material-icons">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Performance Section */}
      <div className="performance-section">
        <div className="section-header">
          <h2 className="section-title">My Performance</h2>
          <div className="performance-view-switcher">
            <button
              className={`view-btn ${performanceView === 'yesterday' ? 'active' : ''}`}
              onClick={() => setPerformanceView('yesterday')}
            >
              Yesterday
            </button>
            <button
              className={`view-btn ${performanceView === 'today' ? 'active' : ''}`}
              onClick={() => setPerformanceView('today')}
            >
              Today
            </button>
            <button
              className={`view-btn ${performanceView === 'weekToDate' ? 'active' : ''}`}
              onClick={() => setPerformanceView('weekToDate')}
            >
              Week-to-Date
            </button>
            <button
              className={`view-btn ${performanceView === 'monthToDate' ? 'active' : ''}`}
              onClick={() => setPerformanceView('monthToDate')}
            >
              Month-to-Date
            </button>
          </div>
        </div>

        <div className="performance-metrics">
          {/* Hours Worked */}
          <div className="performance-card" onClick={() => console.log('Drill into hours')}>
            <div className="metric-header">
              <span className="material-icons metric-icon" style={{ color: '#1B75BB' }}>
                schedule
              </span>
              <span className="metric-label">Hours Worked</span>
            </div>
            <div className="metric-value">{currentPerformance.hoursWorked}</div>
            <div className="metric-footer">
              {performanceView === 'yesterday' && currentPerformance.rollingAvgHours && (
                <span className="metric-comparison">
                  {currentPerformance.hoursWorked >= currentPerformance.rollingAvgHours ? (
                    <span className="positive">
                      <span className="material-icons">trending_up</span>
                      vs {currentPerformance.rollingAvgHours} avg
                    </span>
                  ) : (
                    <span className="negative">
                      <span className="material-icons">trending_down</span>
                      vs {currentPerformance.rollingAvgHours} avg
                    </span>
                  )}
                </span>
              )}
              {performanceView !== 'yesterday' && (
                <span className="metric-sublabel">{performanceView.replace(/([A-Z])/g, ' $1').trim()}</span>
              )}
            </div>
          </div>

          {/* Cases Closed */}
          <div className="performance-card" onClick={() => console.log('Drill into cases closed')}>
            <div className="metric-header">
              <span className="material-icons metric-icon" style={{ color: '#37A526' }}>
                check_circle
              </span>
              <span className="metric-label">Cases Closed</span>
            </div>
            <div className="metric-value">{currentPerformance.casesClosed}</div>
            <div className="metric-footer">
              <span className="metric-sublabel">Click to view details</span>
            </div>
          </div>

          {/* Activities Completed */}
          <div className="performance-card" onClick={() => console.log('Drill into activities')}>
            <div className="metric-header">
              <span className="material-icons metric-icon" style={{ color: '#F6921E' }}>
                task_alt
              </span>
              <span className="metric-label">Activities Completed</span>
            </div>
            <div className="metric-value">{currentPerformance.activitiesCompleted}</div>
            <div className="metric-footer">
              <span className="metric-sublabel">Calls, emails, reviews, etc.</span>
            </div>
          </div>

          {/* Activity Utilization */}
          <div className="performance-card utilization-card" onClick={() => console.log('Drill into utilization')}>
            <div className="metric-header">
              <span className="material-icons metric-icon" style={{ color: '#00ADEE' }}>
                insights
              </span>
              <span className="metric-label">Activity Utilization</span>
            </div>
            <div className="metric-value">{currentPerformance.utilizationRate.toFixed(2)}</div>
            <div className="metric-footer">
              <span className="metric-sublabel">
                Activities per hour •
                {Math.round((currentPerformance.activitiesCompleted / currentPerformance.hoursWorked) * 10 * 10)}% efficiency
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Compact - BLOOM: All buttons minHeight 44 */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          <DxcButton
            label="New FNOL Entry"
            mode="primary"
            size="small"
            icon={iconEl("add_circle_outline")}
            onClick={() => console.log('New FNOL')}
            style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
          />
          <DxcButton
            label="Search Claims"
            mode="secondary"
            size="small"
            icon={iconEl("search")}
            onClick={() => console.log('Search')}
            style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
          />
          <DxcButton
            label="View All Cases"
            mode="secondary"
            size="small"
            icon={iconEl("view_list")}
            onClick={() => console.log('View all')}
            style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
          />
          <DxcButton
            label="Reports"
            mode="secondary"
            size="small"
            icon={iconEl("analytics")}
            onClick={() => console.log('Reports')}
            style={{ minHeight: 44 }} /* BLOOM: Minimum button height */
          />
        </div>
      </div>
    </div>
  );
};

export default ClaimsHandlerDashboard;
