import { useState, useEffect, useRef, useCallback } from 'react';
import { iconEl } from './utils/iconEl';
import { createPortal } from 'react-dom';
import { DxcApplicationLayout, DxcFlex, DxcTypography, DxcButton } from '@dxc-technology/halstack-react';
import Dashboard from './components/Dashboard/Dashboard';
import ClaimsWorkbench from './components/ClaimsWorkbench/ClaimsWorkbench';
import IntakeForms from './components/IntakeForms/IntakeForms';
import FNOLWorkspace from './components/FNOLWorkspace/FNOLWorkspace';
import PendingClaimsReview from './components/PendingClaimsReview/PendingClaimsReview';
import RequirementsReceived from './components/RequirementsReceived/RequirementsReceived';
import ClaimsHandlerDashboard from './components/ClaimsHandlerDashboard/ClaimsHandlerDashboard';
import ManagerDashboard from './components/ManagerDashboard/ManagerDashboard';
import ThemeSettings from './components/ThemeSettings/ThemeSettings';

// Context Providers
import { AppProvider, useApp } from './contexts/AppContext';
import { ClaimsProvider } from './contexts/ClaimsContext';
import { PolicyProvider } from './contexts/PolicyContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { DocumentProvider } from './contexts/DocumentContext';

// Services
import serviceNowService from './services/api/serviceNowService';

import './App.css';

// Demo personas for role switching
const DEMO_PERSONAS = [
  { id: 'user-sj', name: 'Sarah Johnson', email: 's.johnson@bloom.com', role: 'examiner', title: 'Claims Examiner', permissions: ['view_claims', 'edit_claims', 'approve_payments'] },
  { id: 'user-tb', name: 'Taylor Brooks', email: 't.brooks@bloom.com', role: 'supervisor', title: 'Supervisor', permissions: ['view_claims', 'edit_claims', 'approve_payments', 'manage_team', 'view_reports'] },
  { id: 'user-jc', name: 'Jayden Clarke', email: 'j.clarke@bloom.com', role: 'supervisor', title: 'Supervisor', permissions: ['view_claims', 'edit_claims', 'approve_payments', 'manage_team', 'view_reports'] },
  { id: 'user-mr', name: 'Morgan Reeves', email: 'm.reeves@bloom.com', role: 'manager', title: 'Claims Risk Manager', permissions: ['view_claims', 'edit_claims', 'approve_payments', 'manage_team', 'view_reports', 'view_risk_dashboard'] },
];

/**
 * Main Application Component (wrapped with context providers)
 */
function AppContent() {

  // Access global app context
  const { user, productLine, switchProductLine, updateUserProfile } = useApp();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [sidenavExpanded, setSidenavExpanded] = useState(false); // Start minimized
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);
  const [snowConnected, setSnowConnected] = useState(serviceNowService.isAuthenticated());
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const actionsButtonRef = useRef(null);
  const topAnchorRef = useRef(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuPos, setUserMenuPos] = useState({ top: 0, right: 0 });
  const userAvatarRef = useRef(null);

  // Scroll to top after every view/claim change.
  // Scroll to top whenever the view or selected claim changes.
  // scrollIntoView auto-finds the correct scroll container inside DxcApplicationLayout.
  useEffect(() => {
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => {
        topAnchorRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  }, [currentView, selectedClaim?.id]);

  // Track ServiceNow connection state
  useEffect(() => {
    const unsubscribe = serviceNowService.onAuthChange((authenticated) => {
      setSnowConnected(authenticated);
    });
    return () => unsubscribe?.();
  }, []);

  // Close actions menu on outside click or scroll
  useEffect(() => {
    const close = () => setActionsMenuOpen(false);
    if (actionsMenuOpen) {
      document.addEventListener('mousedown', close);
      document.addEventListener('scroll', close, true);
    }
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [actionsMenuOpen]);

  // Close user menu on outside click or scroll
  useEffect(() => {
    const close = () => setUserMenuOpen(false);
    if (userMenuOpen) {
      document.addEventListener('mousedown', close);
      document.addEventListener('scroll', close, true);
    }
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [userMenuOpen]);

  const openActionsMenu = useCallback((e) => {
    e.stopPropagation();
    const rect = actionsButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    setActionsMenuOpen(prev => !prev);
  }, []);

  const openUserMenu = useCallback((e) => {
    e.stopPropagation();
    const rect = userAvatarRef.current?.getBoundingClientRect();
    if (rect) {
      setUserMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    setUserMenuOpen(prev => !prev);
  }, []);

  const handleClaimSelect = async (claim) => {
    console.log('[App] handleClaimSelect called with claim:', claim);
    setSelectedClaim(claim);
    setCurrentView('workbench');

    // Trigger beneficiary analysis API immediately when FNOL is clicked
    const sysId = claim?.sysId || claim?.sys_id || claim?.servicenow_sys_id;
    if (sysId && !sysId.startsWith('demo-')) {
      console.log('[App] Triggering beneficiary analysis for sys_id:', sysId);
      try {
        await serviceNowService.getBeneficiaryAnalyzer(sysId);
        console.log('[App] Beneficiary analysis triggered successfully');
      } catch (error) {
        console.error('[App] Error triggering beneficiary analysis:', error);
        // Don't block navigation on error
      }
    }
  };

  const handleNavigationClick = (view) => {
    setCurrentView(view);
    if (view !== 'workbench') {
      setSelectedClaim(null);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return user?.role === 'manager'
          ? <ManagerDashboard onClaimSelect={handleClaimSelect} />
          : <Dashboard onClaimSelect={handleClaimSelect} />;
      case 'handlerDashboard':
        return <ClaimsHandlerDashboard />;
      case 'workbench':
        return <ClaimsWorkbench claim={selectedClaim} onBack={() => handleNavigationClick('dashboard')} />;
      case 'intake':
        return <IntakeForms />;
      case 'fnolWorkspace':
        return <FNOLWorkspace onClaimSelect={handleClaimSelect} />;
      case 'pendingReview':
        return <PendingClaimsReview onClaimSelect={handleClaimSelect} />;
      case 'requirementsReceived':
        return <RequirementsReceived onClaimSelect={handleClaimSelect} />;
      default:
        return <Dashboard onClaimSelect={handleClaimSelect} />;
    }
  };

  const sidenavItems = [
    {
      label: "Dashboard",
      icon: iconEl("dashboard"),
      selected: currentView === 'dashboard',
      onClick: () => handleNavigationClick('dashboard')
    },
    {
      label: "My Claims Workbench",
      icon: iconEl("assignment_ind"),
      selected: currentView === 'handlerDashboard',
      onClick: () => handleNavigationClick('handlerDashboard')
    },
    ...( productLine !== 'pc' ? [{
      label: "New Claim FNOL Party Portal",
      icon: iconEl("add_circle"),
      selected: currentView === 'intake',
      onClick: () => handleNavigationClick('intake')
    }] : []),
    {
      label: "Claim Notifications",
      icon: iconEl("work"),
      selected: currentView === 'fnolWorkspace',
      onClick: () => handleNavigationClick('fnolWorkspace')
    },
    {
      label: "Pending Claims Review",
      icon: iconEl("pending_actions"),
      selected: currentView === 'pendingReview',
      onClick: () => handleNavigationClick('pendingReview')
    },
    {
      label: "Requirements Received",
      icon: iconEl("mail"),
      selected: currentView === 'requirementsReceived',
      onClick: () => handleNavigationClick('requirementsReceived')
    },
  ];

  return (
    <>
    <DxcApplicationLayout
      header={
        <DxcApplicationLayout.Header
          appTitle={
            <img
              src="/Bloom_logo.jpg"
              alt="Bloom Insurance"
              style={{ height: '32px', width: 'auto' }}
            />
          }
          sideContent={(isResponsive) =>
            isResponsive ? null : (
              <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                {/* Actions Menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    ref={actionsButtonRef}
                    onClick={openActionsMenu}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 18px',
                      minHeight: '44px', /* BLOOM: Minimum button height */
                      cursor: 'pointer',
                      background: actionsMenuOpen ? '#1B75BB' : '#FFFFFF', /* BLOOM: Blue when open, white when closed */
                      border: actionsMenuOpen ? '2px solid #1B75BB' : '2px solid #1B75BB', /* BLOOM: Always blue border */
                      borderRadius: '8px', /* BLOOM: Rounded corners */
                      color: actionsMenuOpen ? '#FFFFFF' : '#1B75BB', /* BLOOM: White text when open, blue when closed */
                      fontSize: '14px',
                      fontWeight: '700', /* BLOOM: Bold */
                      userSelect: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: actionsMenuOpen ? '0 2px 6px rgba(27, 117, 187, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)' /* BLOOM: Shadow */
                    }}
                    onMouseEnter={e => {
                      if (!actionsMenuOpen) {
                        e.currentTarget.style.background = '#1B75BB';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(27, 117, 187, 0.3)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!actionsMenuOpen) {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.color = '#1B75BB';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                  >
                    Actions
                    <span className="material-icons" style={{ fontSize: '18px', transition: 'transform 0.2s ease', transform: actionsMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                  </button>
                  {actionsMenuOpen && createPortal(
                    <div
                      onMouseDown={e => e.stopPropagation()}
                      style={{
                        position: 'fixed',
                        top: menuPos.top,
                        right: menuPos.right,
                        minWidth: '280px',
                        backgroundColor: '#FFFFFF', /* BLOOM: Pure white background */
                        border: '1px solid #D1D3D4', /* BLOOM: Gray border */
                        borderRadius: '8px', /* BLOOM: Rounded corners */
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', /* BLOOM: Enhanced shadow */
                        zIndex: 99999,
                        overflow: 'hidden'
                      }}>
                      {/* Product Line Toggle Section */}
                      <div style={{ padding: '12px 16px 12px', borderBottom: '1px solid #E8E9EA' /* BLOOM: Light gray divider */ }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#58595B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                          DEMO PRODUCT LINE
                        </div>
                        <div style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
                          {[
                            { id: 'la', label: 'L&A', icon: 'favorite', title: 'Life & Annuity' },
                            { id: 'pc', label: 'P&C', icon: 'directions_car', title: 'Property and Casualty' }
                          ].map(pl => (
                            <button
                              key={pl.id}
                              onClick={() => { switchProductLine(pl.id); setActionsMenuOpen(false); }}
                              title={pl.title}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                background: productLine === pl.id ? '#1B75BB' : '#F8F9FA', /* BLOOM: Blue for selected, light gray for unselected */
                                border: productLine === pl.id ? '2px solid #1B75BB' : '2px solid #D1D3D4', /* BLOOM: Visible border */
                                borderRadius: '8px', /* BLOOM: Rounded corners */
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: productLine === pl.id ? '700' : '600',
                                color: productLine === pl.id ? '#FFFFFF' : '#000000', /* BLOOM: White text on selected, black on unselected */
                                transition: 'all 0.2s ease',
                                boxShadow: productLine === pl.id ? '0 2px 6px rgba(27, 117, 187, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)', /* BLOOM: Shadow */
                                minHeight: '44px', /* BLOOM: Minimum button height */
                                opacity: 1 /* BLOOM: Fix visibility issue */
                              }}
                              onMouseEnter={e => {
                                if (productLine !== pl.id) {
                                  e.currentTarget.style.background = '#E8E9EA';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
                                }
                              }}
                              onMouseLeave={e => {
                                if (productLine !== pl.id) {
                                  e.currentTarget.style.background = '#F8F9FA';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                }
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: '16px' }}>{pl.icon}</span>
                              {pl.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ServiceNow Connect Section */}
                      {serviceNowService.useOAuth && (
                        snowConnected ? (
                          <button
                            onClick={() => {
                              serviceNowService.clearAuth();
                              setSnowConnected(false);
                              setActionsMenuOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '14px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              background: '#FFFFFF', /* BLOOM: White background */
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#000000', /* BLOOM: Black text */
                              textAlign: 'left',
                              transition: 'all 0.2s ease',
                              minHeight: '44px', /* BLOOM: Minimum button height */
                              opacity: 1 /* BLOOM: Fix visibility */
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#FEF1E8'; /* BLOOM: Light orange hover */
                              e.currentTarget.style.boxShadow = 'inset 0 0 0 2px #F6921E'; /* BLOOM: Orange border */
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#FFFFFF';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: '20px', color: '#D02E2E' /* BLOOM: Red */ }}>link_off</span>
                            Disconnect from ServiceNow
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              serviceNowService.startOAuthLogin();
                              setActionsMenuOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '14px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              background: '#FFFFFF', /* BLOOM: White background */
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#000000', /* BLOOM: Black text */
                              textAlign: 'left',
                              transition: 'all 0.2s ease',
                              minHeight: '44px', /* BLOOM: Minimum button height */
                              opacity: 1 /* BLOOM: Fix visibility */
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#E8F5E3'; /* BLOOM: Light green hover */
                              e.currentTarget.style.boxShadow = 'inset 0 0 0 2px #37A526'; /* BLOOM: Green border */
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#FFFFFF';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: '20px', color: '#37A526' /* BLOOM: Green */ }}>link</span>
                            Connect to ServiceNow
                          </button>
                        )
                      )}
                    </div>,
                    document.body
                  )}
                </div>
                <div
                  onClick={() => {
                    setIsThemeSettingsOpen(true);
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-fg-neutral-strong)',
                    fontSize: '24px',
                    userSelect: 'none'
                  }}
                  title="Theme Settings"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setIsThemeSettingsOpen(true);
                    }
                  }}
                >
                  <span className="material-icons">palette</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    ref={userAvatarRef}
                    onClick={openUserMenu}
                    onMouseDown={e => e.stopPropagation()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '8px',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(27,117,187,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    title="Switch persona"
                  >
                    <DxcFlex direction="column" gap="var(--spacing-gap-none)" alignItems="flex-end">
                      <DxcTypography>{user?.name || 'User'}</DxcTypography>
                      <DxcTypography
                        fontSize="font-scale-01"
                        color="var(--color-fg-neutral-stronger)"
                      >
                        {user?.email || ''}
                      </DxcTypography>
                    </DxcFlex>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: userMenuOpen ? '#1B75BB' : "var(--color-bg-primary-lighter)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: userMenuOpen ? '#FFFFFF' : "var(--color-fg-primary-stronger)",
                        fontWeight: "600",
                        fontSize: "14px",
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </div>
                  </button>

                  {/* User / Persona Dropdown */}
                  {userMenuOpen && createPortal(
                    <div
                      onMouseDown={e => e.stopPropagation()}
                      style={{
                        position: 'fixed',
                        top: userMenuPos.top,
                        right: userMenuPos.right,
                        minWidth: '260px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #D1D3D4',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 99999,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Active user info header */}
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid #E8E9EA', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          backgroundColor: '#1B75BB', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#FFFFFF', fontWeight: '700', fontSize: '15px',
                        }}>
                          {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#000000' }}>{user?.name || 'User'}</div>
                          <div style={{ fontSize: '12px', color: '#58595B' }}>{user?.title || ''}</div>
                          <div style={{ fontSize: '11px', color: '#8C8E90' }}>{user?.email || ''}</div>
                        </div>
                      </div>

                      {/* Persona Switcher */}
                      <div style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#58595B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                          SWITCH PERSONA
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {DEMO_PERSONAS.map(persona => {
                            const isActive = user?.name === persona.name;
                            return (
                              <button
                                key={persona.id}
                                onClick={() => { updateUserProfile(persona); setUserMenuOpen(false); }}
                                style={{
                                  padding: '8px 12px',
                                  display: 'flex', alignItems: 'center', gap: '10px',
                                  background: isActive ? '#1B75BB' : '#F8F9FA',
                                  border: isActive ? '2px solid #1B75BB' : '2px solid #D1D3D4',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: isActive ? '700' : '500',
                                  color: isActive ? '#FFFFFF' : '#000000',
                                  textAlign: 'left',
                                  width: '100%',
                                  minHeight: '44px',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#E8E9EA'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = '#F8F9FA'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                              >
                                <span className="material-icons" style={{ fontSize: '18px', flexShrink: 0 }}>
                                  {persona.role === 'manager' ? 'manage_accounts' : persona.role === 'supervisor' ? 'supervisor_account' : 'person'}
                                </span>
                                <div>
                                  <div style={{ fontWeight: isActive ? '700' : '600' }}>{persona.name}</div>
                                  <div style={{ fontSize: '11px', opacity: 0.75 }}>{persona.title}</div>
                                </div>
                                {isActive && (
                                  <span className="material-icons" style={{ fontSize: '16px', marginLeft: 'auto', color: '#FFFFFF' }}>check_circle</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              </DxcFlex>
            )
          }
        />
      }
      sidenav={
        <DxcApplicationLayout.Sidenav
          navItems={sidenavItems}
          expanded={sidenavExpanded}
          onExpandedChange={setSidenavExpanded}
        />
      }
    >
      <DxcApplicationLayout.Main>
        <div ref={topAnchorRef} style={{ height: 0, overflow: 'hidden' }} />
        {renderContent()}
      </DxcApplicationLayout.Main>
    </DxcApplicationLayout>
    <ThemeSettings
      isOpen={isThemeSettingsOpen}
      onClose={() => setIsThemeSettingsOpen(false)}
    />
    </>
  );
}

/**
 * App Wrapper with Context Providers
 * Wraps the application with all context providers in the correct order
 */
function App() {

  return (
    <AppProvider>
      <ClaimsProvider>
        <PolicyProvider>
          <WorkflowProvider>
            <DocumentProvider>
              <AppContent />
            </DocumentProvider>
          </WorkflowProvider>
        </PolicyProvider>
      </ClaimsProvider>
    </AppProvider>
  );
}

export default App;
