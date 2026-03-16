import { useState } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcTextInput,
  DxcSelect,
  DxcDateInput,
  DxcTextarea,
  DxcButton,
  DxcRadioGroup,
  DxcFileInput,
  DxcAlert,
  DxcProgressBar,
  DxcInset,
  DxcBadge,
  DxcTabs
} from '@dxc-technology/halstack-react';
import serviceNowService from '../../services/api/serviceNowService';
import { useApp } from '../../contexts/AppContext';
import './IntakeForms.css';

/**
 * FNOL Party Portal - Public-facing portal
 * Features:
 * - Simulated user registration/login flow
 * - Product selection (Life, Annuity for L&A; Auto, Homeowners, Commercial, Liability for P&C)
 * - Dynamic claim form based on product line and product
 * - Document upload
 * - ServiceNow submission
 */
const IntakeForms = () => {
  const { productLine } = useApp();
  const isPC = productLine === 'pc';

  // Auth state (simulated registration gate)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [authError, setAuthError] = useState(null);

  // Product selection
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form wizard
  const [step, setStep] = useState(1);
  const totalSteps = 4; // Product Selection, Claim Info, Claimant Info, Documents
  const [formData, setFormData] = useState({
    // Common fields
    claimType: '',
    policyNumber: '',
    insuredName: '',
    insuredSSN: '',
    insuredDOB: '',
    // L&A fields
    dateOfDeath: '',
    causeOfDeath: '',
    description: '',
    // Claimant fields
    claimantName: '',
    claimantEmail: '',
    claimantPhone: '',
    claimantSSN: '',
    claimantDOB: '',
    claimantAddress: '',
    relationship: '',
    // Life-specific
    lifeSettlementIndicator: '',
    contestabilityPeriod: '',
    // Annuity-specific
    annuityContractNumber: '',
    annuityType: '',
    surrenderValue: '',
    deathBenefitOption: '',
    // P&C common fields
    dateOfLoss: '',
    causeOfLoss: '',
    lossLocation: '',
    lossDescription: '',
    // P&C auto fields
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleVIN: '',
    // P&C property fields
    propertyAddress: '',
    propertyType: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fnolNumber, setFnolNumber] = useState(null);

  // Auth handlers
  const handleAuthChange = (field, value) => {
    setAuthData(prev => ({ ...prev, [field]: value }));
    setAuthError(null);
  };

  const handleLogin = () => {
    if (!authData.email || !authData.password) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setIsAuthenticated(true);
  };

  const handleRegister = () => {
    if (!authData.email || !authData.password || !authData.firstName || !authData.lastName) {
      setAuthError('Please fill in all required fields.');
      return;
    }
    if (authData.password !== authData.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    setIsAuthenticated(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    let claimType = product;
    if (!isPC) {
      claimType = product === 'life' ? 'death' : product === 'annuity' ? 'annuity_death' : 'health';
    } else {
      const pcTypeMap = {
        auto: 'auto_collision',
        homeowners: 'homeowners',
        commercial: 'commercial_property',
        liability: 'auto_liability'
      };
      claimType = pcTypeMap[product] || product;
    }
    setFormData(prev => ({ ...prev, claimType }));
    setStep(2);
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    if (step === 2 && !selectedProduct) {
      setStep(1);
    } else {
      setStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      let fnolData;
      if (isPC) {
        const pcProductLabels = { auto: 'Auto', homeowners: 'Homeowners', commercial: 'Commercial Property', liability: 'Auto Liability' };
        fnolData = {
          shortDescription: `${pcProductLabels[selectedProduct] || selectedProduct} Claim - ${formData.insuredName}`,
          description: formData.lossDescription,
          insured: {
            fullName: formData.insuredName,
            dateOfLoss: formData.dateOfLoss
          },
          claimant: {
            fullName: formData.claimantName,
            emailAddress: formData.claimantEmail,
            phoneNumber: formData.claimantPhone,
            relationshipToInsured: formData.relationship
          },
          policyNumbers: formData.policyNumber,
          priority: '3',
          urgency: '3',
          impact: '3'
        };
      } else {
        fnolData = {
          shortDescription: `${selectedProduct === 'life' ? 'Life' : 'Annuity'} Claim - ${formData.insuredName}`,
          description: formData.description,
          insured: {
            fullName: formData.insuredName,
            dateOfDeath: formData.dateOfDeath
          },
          claimant: {
            fullName: formData.claimantName,
            emailAddress: formData.claimantEmail,
            phoneNumber: formData.claimantPhone,
            relationshipToInsured: formData.relationship
          },
          policyNumbers: formData.policyNumber,
          priority: '3',
          urgency: '3',
          impact: '3'
        };
      }

      console.log('[IntakeForms] Submitting FNOL to ServiceNow:', fnolData);
      const result = await serviceNowService.createFNOL(fnolData);
      console.log('[IntakeForms] FNOL created successfully:', result);

      setFnolNumber(result.fnolNumber);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setFnolNumber(null);
        setStep(1);
        setSelectedProduct(null);
        setFormData({
          claimType: '', policyNumber: '', insuredName: '', insuredSSN: '', insuredDOB: '',
          dateOfDeath: '', causeOfDeath: '', description: '', claimantName: '', claimantEmail: '',
          claimantPhone: '', claimantSSN: '', claimantDOB: '', claimantAddress: '', relationship: '',
          lifeSettlementIndicator: '', contestabilityPeriod: '', annuityContractNumber: '',
          annuityType: '', surrenderValue: '', deathBenefitOption: '',
          dateOfLoss: '', causeOfLoss: '', lossLocation: '', lossDescription: '',
          vehicleYear: '', vehicleMake: '', vehicleModel: '', vehicleVIN: '',
          propertyAddress: '', propertyType: ''
        });
      }, 8000);
    } catch (err) {
      console.error('[IntakeForms] Error submitting FNOL:', err);
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (step / totalSteps) * 100;

  // P&C product card definitions
  const pcProducts = [
    {
      id: 'auto',
      label: 'Auto',
      icon: 'directions_car',
      badge: 'Connect Event',
      badgeColor: 'success',
      description: 'Collision, comprehensive, or liability claim for a personal or commercial vehicle',
      disabled: false
    },
    {
      id: 'homeowners',
      label: 'Homeowners',
      icon: 'home',
      badge: 'Connect Event',
      badgeColor: 'success',
      description: 'Property damage or loss for a residential home or condo',
      disabled: false
    },
    {
      id: 'commercial',
      label: 'Commercial Property',
      icon: 'business',
      badge: 'Connect Event',
      badgeColor: 'success',
      description: 'Property damage, business interruption, or loss for a commercial location',
      disabled: false
    },
    {
      id: 'liability',
      label: 'Liability',
      icon: 'gavel',
      badge: 'Connect Event',
      badgeColor: 'success',
      description: 'Third-party bodily injury or property damage liability claim',
      disabled: false
    },
    {
      id: 'workers_comp',
      label: "Workers' Comp",
      icon: 'health_and_safety',
      badge: 'Future Phase',
      badgeColor: 'neutral',
      description: "Workplace injury or occupational disease claims (coming soon)",
      disabled: true
    }
  ];

  // Is this an auto-type P&C product?
  const isPCAuto = isPC && (selectedProduct === 'auto' || selectedProduct === 'liability');
  const isPCProperty = isPC && (selectedProduct === 'homeowners' || selectedProduct === 'commercial');

  const pcProductLabel = () => {
    const labels = { auto: 'Auto', homeowners: 'Homeowners', commercial: 'Commercial Property', liability: 'Liability' };
    return labels[selectedProduct] || selectedProduct;
  };

  // =================== REGISTRATION/LOGIN GATE ===================
  if (!isAuthenticated) {
    return (
      <DxcContainer
        padding="var(--spacing-padding-xl)"
        style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
      >
        <DxcFlex direction="column" gap="var(--spacing-gap-l)" alignItems="center">
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
            <DxcHeading level={1} text="FNOL Party Portal" />
            <DxcTypography color="var(--color-fg-neutral-strong)">
              {isPC
                ? 'Submit a First Notice of Loss for auto, property, and liability claims'
                : 'Submit a First Notice of Loss for life and annuity claims'}
            </DxcTypography>
            <DxcBadge label="Demo Portal" mode="contextual" color="info" />
          </DxcFlex>

          <DxcContainer
            padding="var(--spacing-padding-xl)"
            style={{
              backgroundColor: "var(--color-bg-neutral-lightest)",
              maxWidth: "480px",
              width: "100%",
              borderRadius: "var(--border-radius-m)",
              boxShadow: "var(--shadow-mid-04)"
            }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcTabs>
                <DxcTabs.Tab
                  label="Sign In"
                  active={authMode === 'login'}
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                >
                  <div />
                </DxcTabs.Tab>
                <DxcTabs.Tab
                  label="Register"
                  active={authMode === 'register'}
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                >
                  <div />
                </DxcTabs.Tab>
              </DxcTabs>

              {authError && (
                <DxcAlert
                  semantic="error"
                  message={{ text: authError }}
                />
              )}

              {authMode === 'login' ? (
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  <DxcTextInput
                    label="Email Address"
                    placeholder="your@email.com"
                    value={authData.email}
                    onChange={({ value }) => handleAuthChange('email', value)}
                    size="fillParent"
                  />
                  <DxcTextInput
                    label="Password"
                    placeholder="Enter password"
                    value={authData.password}
                    onChange={({ value }) => handleAuthChange('password', value)}
                    size="fillParent"
                  />
                  <DxcButton
                    label="Sign In"
                    onClick={handleLogin}
                    size="fillParent"
                  />
                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)" textAlign="center">
                    For demo purposes, enter any email and password to proceed.
                  </DxcTypography>
                </DxcFlex>
              ) : (
                <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                  <DxcFlex gap="var(--spacing-gap-s)">
                    <DxcTextInput
                      label="First Name"
                      placeholder="First"
                      value={authData.firstName}
                      onChange={({ value }) => handleAuthChange('firstName', value)}
                      size="fillParent"
                    />
                    <DxcTextInput
                      label="Last Name"
                      placeholder="Last"
                      value={authData.lastName}
                      onChange={({ value }) => handleAuthChange('lastName', value)}
                      size="fillParent"
                    />
                  </DxcFlex>
                  <DxcTextInput
                    label="Email Address"
                    placeholder="your@email.com"
                    value={authData.email}
                    onChange={({ value }) => handleAuthChange('email', value)}
                    size="fillParent"
                  />
                  <DxcTextInput
                    label="Phone Number"
                    placeholder="(555) 123-4567"
                    value={authData.phone}
                    onChange={({ value }) => handleAuthChange('phone', value)}
                    size="fillParent"
                  />
                  <DxcTextInput
                    label="Password"
                    placeholder="Create a password"
                    value={authData.password}
                    onChange={({ value }) => handleAuthChange('password', value)}
                    size="fillParent"
                  />
                  <DxcTextInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={authData.confirmPassword}
                    onChange={({ value }) => handleAuthChange('confirmPassword', value)}
                    size="fillParent"
                  />
                  <DxcButton
                    label="Create Account"
                    onClick={handleRegister}
                    size="fillParent"
                  />
                  <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)" textAlign="center">
                    For demo purposes, fill required fields and click Create Account.
                  </DxcTypography>
                </DxcFlex>
              )}
            </DxcFlex>
          </DxcContainer>
        </DxcFlex>
      </DxcContainer>
    );
  }

  // =================== MAIN PORTAL (AUTHENTICATED) ===================
  return (
    <DxcContainer
      padding="var(--spacing-padding-xl)"
      style={{ backgroundColor: "var(--color-bg-secondary-lightest)" }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Page Header */}
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
            <DxcHeading level={1} text="FNOL Party Portal" />
            <DxcTypography color="var(--color-fg-neutral-strong)">
              {isPC
                ? 'Submit a First Notice of Loss for auto, property, and liability claims'
                : 'Submit a First Notice of Loss for life and annuity claims'}
            </DxcTypography>
          </DxcFlex>
          <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
            <DxcBadge label="Demo Portal" mode="contextual" color="info" />
            <DxcButton
              label="Sign Out"
              mode="tertiary"
              icon="logout"
              onClick={() => setIsAuthenticated(false)}
            />
          </DxcFlex>
        </DxcFlex>

        {/* Success Alert */}
        {showSuccess && fnolNumber && (
          <DxcAlert
            semantic="success"
            message={{ text: `Claim submitted successfully! Your FNOL number is ${fnolNumber}.` }}
          />
        )}

        {/* Error Alert */}
        {error && (
          <DxcAlert
            semantic="error"
            message={{ text: error }}
          />
        )}

        {/* Main Form Container */}
        <DxcContainer
          padding="var(--spacing-padding-xl)"
          style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)",
            boxShadow: "var(--shadow-mid-04)"
          }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-l)">
            {/* Progress Bar */}
            <DxcProgressBar
              label={step === 1 ? 'Step 1: Product Selection' : `Step ${step} of ${totalSteps}`}
              value={progress}
              showValue
            />

            {/* =================== STEP 1: PRODUCT SELECTION =================== */}
            {step === 1 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Select Coverage Type" />
                <DxcTypography color="var(--color-fg-neutral-strong)">
                  Choose the type of claim you would like to submit. The form will be tailored to the selected coverage.
                </DxcTypography>

                {/* ---- L&A Products ---- */}
                {!isPC && (
                  <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                    {/* Life Insurance */}
                    <div
                      onClick={() => handleProductSelect('life')}
                      style={{
                        flex: "1 1 250px",
                        padding: "var(--spacing-padding-l)",
                        borderRadius: "var(--border-radius-m)",
                        border: selectedProduct === 'life'
                          ? "2px solid var(--color-fg-secondary-medium)"
                          : "1px solid var(--border-color-neutral-lighter)",
                        backgroundColor: "var(--color-bg-neutral-lighter)",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
                        <span className="material-icons" style={{ fontSize: "48px", color: "var(--color-fg-secondary-medium)" }}>favorite</span>
                        <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-04">
                          Life Insurance
                        </DxcTypography>
                        <DxcBadge label="Connect Event" mode="contextual" color="success" />
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)" textAlign="center">
                          Death claim for whole life, term life, or universal life policies
                        </DxcTypography>
                      </DxcFlex>
                    </div>

                    {/* Annuity */}
                    <div
                      onClick={() => handleProductSelect('annuity')}
                      style={{
                        flex: "1 1 250px",
                        padding: "var(--spacing-padding-l)",
                        borderRadius: "var(--border-radius-m)",
                        border: selectedProduct === 'annuity'
                          ? "2px solid var(--color-fg-secondary-medium)"
                          : "1px solid var(--border-color-neutral-lighter)",
                        backgroundColor: "var(--color-bg-neutral-lighter)",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
                        <span className="material-icons" style={{ fontSize: "48px", color: "var(--color-fg-secondary-medium)" }}>account_balance</span>
                        <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-04">
                          Annuity
                        </DxcTypography>
                        <DxcBadge label="Connect Event" mode="contextual" color="success" />
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)" textAlign="center">
                          Death claim for fixed, variable, or indexed annuity contracts
                        </DxcTypography>
                      </DxcFlex>
                    </div>

                    {/* Health (Future Phase) */}
                    <div
                      style={{
                        flex: "1 1 250px",
                        padding: "var(--spacing-padding-l)",
                        borderRadius: "var(--border-radius-m)",
                        border: "1px solid var(--border-color-neutral-lighter)",
                        backgroundColor: "var(--color-bg-neutral-lighter)",
                        opacity: 0.5,
                        cursor: "not-allowed"
                      }}
                    >
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
                        <span className="material-icons" style={{ fontSize: "48px", color: "var(--color-fg-neutral-dark)" }}>local_hospital</span>
                        <DxcTypography fontWeight="font-weight-semibold" fontSize="font-scale-04" color="var(--color-fg-neutral-dark)">
                          Health
                        </DxcTypography>
                        <DxcBadge label="Future Phase" mode="contextual" color="neutral" />
                        <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)" textAlign="center">
                          Health insurance claims (coming soon)
                        </DxcTypography>
                      </DxcFlex>
                    </div>
                  </DxcFlex>
                )}

                {/* ---- P&C Products ---- */}
                {isPC && (
                  <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                    {pcProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={product.disabled ? undefined : () => handleProductSelect(product.id)}
                        style={{
                          flex: "1 1 200px",
                          padding: "var(--spacing-padding-l)",
                          borderRadius: "var(--border-radius-m)",
                          border: selectedProduct === product.id
                            ? "2px solid var(--color-fg-secondary-medium)"
                            : "1px solid var(--border-color-neutral-lighter)",
                          backgroundColor: "var(--color-bg-neutral-lighter)",
                          opacity: product.disabled ? 0.5 : 1,
                          cursor: product.disabled ? "not-allowed" : "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        <DxcFlex direction="column" gap="var(--spacing-gap-s)" alignItems="center">
                          <span
                            className="material-icons"
                            style={{
                              fontSize: "48px",
                              color: product.disabled
                                ? "var(--color-fg-neutral-dark)"
                                : "var(--color-fg-secondary-medium)"
                            }}
                          >
                            {product.icon}
                          </span>
                          <DxcTypography
                            fontWeight="font-weight-semibold"
                            fontSize="font-scale-04"
                            color={product.disabled ? "var(--color-fg-neutral-dark)" : undefined}
                          >
                            {product.label}
                          </DxcTypography>
                          <DxcBadge label={product.badge} mode="contextual" color={product.badgeColor} />
                          <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)" textAlign="center">
                            {product.description}
                          </DxcTypography>
                        </DxcFlex>
                      </div>
                    ))}
                  </DxcFlex>
                )}
              </DxcFlex>
            )}

            {/* =================== STEP 2: CLAIM INFORMATION =================== */}
            {step === 2 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                  <DxcHeading level={3} text="Claim Information" />
                  <DxcBadge
                    label={isPC ? pcProductLabel() : (selectedProduct === 'life' ? 'Life Insurance' : 'Annuity')}
                    mode="contextual"
                    color="info"
                  />
                </DxcFlex>

                {/* ---- P&C Step 2 ---- */}
                {isPC && (
                  <>
                    <DxcTextInput
                      label="Policy Number"
                      placeholder="Enter policy number"
                      value={formData.policyNumber}
                      onChange={({ value }) => handleInputChange('policyNumber', value)}
                      size="fillParent"
                    />

                    <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                      <div style={{ flex: "1 1 280px" }}>
                        <DxcTextInput
                          label="Policyholder Full Name"
                          placeholder="First Middle Last"
                          value={formData.insuredName}
                          onChange={({ value }) => handleInputChange('insuredName', value)}
                          size="fillParent"
                        />
                      </div>
                      <div style={{ flex: "1 1 200px" }}>
                        <DxcDateInput
                          label="Date of Loss"
                          value={formData.dateOfLoss}
                          onChange={({ value }) => handleInputChange('dateOfLoss', value)}
                          placeholder="MM/DD/YYYY"
                        />
                      </div>
                    </DxcFlex>

                    <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                      <div style={{ flex: "1 1 250px" }}>
                        <DxcSelect
                          label="Cause of Loss"
                          placeholder="Select cause of loss"
                          value={formData.causeOfLoss}
                          onChange={({ value }) => handleInputChange('causeOfLoss', value)}
                          options={isPCAuto ? [
                            { label: 'Collision', value: 'collision' },
                            { label: 'Theft / Total Theft', value: 'theft' },
                            { label: 'Vandalism', value: 'vandalism' },
                            { label: 'Weather / Hail', value: 'weather_hail' },
                            { label: 'Flood / Water Damage', value: 'flood' },
                            { label: 'Fire', value: 'fire' },
                            { label: 'Hit and Run', value: 'hit_and_run' },
                            { label: 'Other', value: 'other' }
                          ] : [
                            { label: 'Wind / Storm', value: 'wind_storm' },
                            { label: 'Hail', value: 'hail' },
                            { label: 'Fire', value: 'fire' },
                            { label: 'Flood / Water Damage', value: 'flood' },
                            { label: 'Theft / Burglary', value: 'theft' },
                            { label: 'Vandalism', value: 'vandalism' },
                            { label: 'Pipe Burst / Plumbing', value: 'plumbing' },
                            { label: 'Lightning Strike', value: 'lightning' },
                            { label: 'Other', value: 'other' }
                          ]}
                          size="fillParent"
                        />
                      </div>
                      <div style={{ flex: "1 1 250px" }}>
                        <DxcTextInput
                          label="Loss Location / Incident Address"
                          placeholder="City, State or full address"
                          value={formData.lossLocation}
                          onChange={({ value }) => handleInputChange('lossLocation', value)}
                          size="fillParent"
                        />
                      </div>
                    </DxcFlex>

                    {/* Auto-specific fields */}
                    {isPCAuto && (
                      <>
                        <DxcHeading level={4} text="Vehicle Information" />
                        <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                          <div style={{ flex: "0 1 120px" }}>
                            <DxcTextInput
                              label="Year"
                              placeholder="2022"
                              value={formData.vehicleYear}
                              onChange={({ value }) => handleInputChange('vehicleYear', value)}
                              size="fillParent"
                            />
                          </div>
                          <div style={{ flex: "1 1 160px" }}>
                            <DxcTextInput
                              label="Make"
                              placeholder="Toyota"
                              value={formData.vehicleMake}
                              onChange={({ value }) => handleInputChange('vehicleMake', value)}
                              size="fillParent"
                            />
                          </div>
                          <div style={{ flex: "1 1 160px" }}>
                            <DxcTextInput
                              label="Model"
                              placeholder="Camry"
                              value={formData.vehicleModel}
                              onChange={({ value }) => handleInputChange('vehicleModel', value)}
                              size="fillParent"
                            />
                          </div>
                          <div style={{ flex: "1 1 220px" }}>
                            <DxcTextInput
                              label="VIN"
                              placeholder="17-character VIN"
                              value={formData.vehicleVIN}
                              onChange={({ value }) => handleInputChange('vehicleVIN', value)}
                              size="fillParent"
                            />
                          </div>
                        </DxcFlex>
                      </>
                    )}

                    {/* Property-specific fields */}
                    {isPCProperty && (
                      <>
                        <DxcHeading level={4} text="Property Information" />
                        <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                          <div style={{ flex: "2 1 300px" }}>
                            <DxcTextInput
                              label="Property Address"
                              placeholder="Street, City, State, ZIP"
                              value={formData.propertyAddress}
                              onChange={({ value }) => handleInputChange('propertyAddress', value)}
                              size="fillParent"
                            />
                          </div>
                          <div style={{ flex: "1 1 200px" }}>
                            <DxcSelect
                              label="Property Type"
                              placeholder="Select type"
                              value={formData.propertyType}
                              onChange={({ value }) => handleInputChange('propertyType', value)}
                              options={selectedProduct === 'commercial' ? [
                                { label: 'Office Building', value: 'office' },
                                { label: 'Retail / Storefront', value: 'retail' },
                                { label: 'Warehouse / Industrial', value: 'warehouse' },
                                { label: 'Restaurant / Food Service', value: 'restaurant' },
                                { label: 'Multi-Family / Apartment', value: 'multifamily' },
                                { label: 'Other Commercial', value: 'other' }
                              ] : [
                                { label: 'Single Family Home', value: 'single_family' },
                                { label: 'Townhouse', value: 'townhouse' },
                                { label: 'Condominium', value: 'condo' },
                                { label: 'Mobile Home', value: 'mobile_home' },
                                { label: 'Other', value: 'other' }
                              ]}
                              size="fillParent"
                            />
                          </div>
                        </DxcFlex>
                      </>
                    )}

                    <DxcTextarea
                      label="Description of Loss"
                      placeholder="Describe what happened, when it occurred, and any damage observed"
                      value={formData.lossDescription}
                      onChange={({ value }) => handleInputChange('lossDescription', value)}
                      rows={4}
                    />
                  </>
                )}

                {/* ---- L&A Step 2 ---- */}
                {!isPC && (
                  <>
                    <DxcTypography fontSize="font-scale-03" color="var(--color-fg-neutral-dark)">
                      Form fields will match standard Wilton forms when specs are provided. Placeholder fields shown below.
                    </DxcTypography>

                    <DxcTextInput
                      label="Policy Number"
                      placeholder="Enter policy number"
                      value={formData.policyNumber}
                      onChange={({ value }) => handleInputChange('policyNumber', value)}
                      size="fillParent"
                    />

                    <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                      <div style={{ flex: "1 1 250px" }}>
                        <DxcTextInput
                          label="Insured Full Name"
                          placeholder="First Middle Last"
                          value={formData.insuredName}
                          onChange={({ value }) => handleInputChange('insuredName', value)}
                          size="fillParent"
                        />
                      </div>
                      <div style={{ flex: "1 1 200px" }}>
                        <DxcTextInput
                          label="Insured SSN"
                          placeholder="XXX-XX-XXXX"
                          value={formData.insuredSSN}
                          onChange={({ value }) => handleInputChange('insuredSSN', value)}
                          size="fillParent"
                        />
                      </div>
                      <div style={{ flex: "1 1 200px" }}>
                        <DxcDateInput
                          label="Insured Date of Birth"
                          value={formData.insuredDOB}
                          onChange={({ value }) => handleInputChange('insuredDOB', value)}
                          placeholder="MM/DD/YYYY"
                        />
                      </div>
                    </DxcFlex>

                    <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                      <div style={{ flex: "1 1 200px" }}>
                        <DxcDateInput
                          label="Date of Death"
                          value={formData.dateOfDeath}
                          onChange={({ value }) => handleInputChange('dateOfDeath', value)}
                          placeholder="MM/DD/YYYY"
                        />
                      </div>
                      <div style={{ flex: "1 1 250px" }}>
                        <DxcTextInput
                          label="Cause of Death"
                          placeholder="Enter cause of death"
                          value={formData.causeOfDeath}
                          onChange={({ value }) => handleInputChange('causeOfDeath', value)}
                          size="fillParent"
                        />
                      </div>
                    </DxcFlex>

                    {/* Life-Specific Fields */}
                    {selectedProduct === 'life' && (
                      <>
                        <DxcHeading level={4} text="Life Insurance Details" />
                        <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                          <div style={{ flex: "1 1 250px" }}>
                            <DxcSelect
                              label="Policy Type"
                              placeholder="Select policy type"
                              value={formData.lifeSettlementIndicator}
                              onChange={({ value }) => handleInputChange('lifeSettlementIndicator', value)}
                              options={[
                                { label: 'Whole Life', value: 'whole_life' },
                                { label: 'Term Life', value: 'term_life' },
                                { label: 'Universal Life', value: 'universal_life' },
                                { label: 'Variable Life', value: 'variable_life' }
                              ]}
                              size="fillParent"
                            />
                          </div>
                          <div style={{ flex: "1 1 250px" }}>
                            <DxcSelect
                              label="Contestability Status"
                              placeholder="Select status"
                              value={formData.contestabilityPeriod}
                              onChange={({ value }) => handleInputChange('contestabilityPeriod', value)}
                              options={[
                                { label: 'Within Contestability (0-2 years)', value: 'within' },
                                { label: 'Past Contestability (2+ years)', value: 'past' },
                                { label: 'Unknown', value: 'unknown' }
                              ]}
                              size="fillParent"
                            />
                          </div>
                        </DxcFlex>
                      </>
                    )}

                    {/* Annuity-Specific Fields */}
                    {selectedProduct === 'annuity' && (
                      <>
                        <DxcHeading level={4} text="Annuity Contract Details" />
                        <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                          <div style={{ flex: "1 1 250px" }}>
                            <DxcTextInput
                              label="Contract Number"
                              placeholder="Enter annuity contract number"
                              value={formData.annuityContractNumber}
                              onChange={({ value }) => handleInputChange('annuityContractNumber', value)}
                              size="fillParent"
                            />
                          </div>
                          <div style={{ flex: "1 1 250px" }}>
                            <DxcSelect
                              label="Annuity Type"
                              placeholder="Select annuity type"
                              value={formData.annuityType}
                              onChange={({ value }) => handleInputChange('annuityType', value)}
                              options={[
                                { label: 'Fixed Annuity', value: 'fixed' },
                                { label: 'Variable Annuity', value: 'variable' },
                                { label: 'Indexed Annuity', value: 'indexed' },
                                { label: 'Immediate Annuity', value: 'immediate' }
                              ]}
                              size="fillParent"
                            />
                          </div>
                        </DxcFlex>
                        <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                          <div style={{ flex: "1 1 250px" }}>
                            <DxcSelect
                              label="Death Benefit Option"
                              placeholder="Select benefit option"
                              value={formData.deathBenefitOption}
                              onChange={({ value }) => handleInputChange('deathBenefitOption', value)}
                              options={[
                                { label: 'Return of Premium', value: 'return_premium' },
                                { label: 'Account Value', value: 'account_value' },
                                { label: 'Greater of Premium or Account Value', value: 'greater' },
                                { label: 'Stepped-Up Value', value: 'stepped_up' }
                              ]}
                              size="fillParent"
                            />
                          </div>
                        </DxcFlex>
                      </>
                    )}

                    <DxcTextarea
                      label="Additional Details"
                      placeholder="Provide any additional details about the claim"
                      value={formData.description}
                      onChange={({ value }) => handleInputChange('description', value)}
                      rows={4}
                    />
                  </>
                )}
              </DxcFlex>
            )}

            {/* =================== STEP 3: CLAIMANT INFORMATION =================== */}
            {step === 3 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text={isPC ? 'Claimant Information' : 'Claimant / Beneficiary Information'} />

                <DxcFlex gap="var(--spacing-gap-m)" wrap="wrap">
                  <div style={{ flex: "1 1 250px" }}>
                    <DxcTextInput
                      label="Claimant Full Name"
                      placeholder="First Middle Last"
                      value={formData.claimantName}
                      onChange={({ value }) => handleInputChange('claimantName', value)}
                      size="fillParent"
                    />
                  </div>
                  {!isPC && (
                    <>
                      <div style={{ flex: "1 1 200px" }}>
                        <DxcTextInput
                          label="Claimant SSN"
                          placeholder="XXX-XX-XXXX"
                          value={formData.claimantSSN}
                          onChange={({ value }) => handleInputChange('claimantSSN', value)}
                          size="fillParent"
                        />
                      </div>
                      <div style={{ flex: "1 1 200px" }}>
                        <DxcDateInput
                          label="Date of Birth"
                          value={formData.claimantDOB}
                          onChange={({ value }) => handleInputChange('claimantDOB', value)}
                          placeholder="MM/DD/YYYY"
                        />
                      </div>
                    </>
                  )}
                </DxcFlex>

                <DxcTextInput
                  label="Email Address"
                  placeholder="claimant@email.com"
                  value={formData.claimantEmail}
                  onChange={({ value }) => handleInputChange('claimantEmail', value)}
                  size="fillParent"
                />

                <DxcTextInput
                  label="Phone Number"
                  placeholder="(555) 123-4567"
                  value={formData.claimantPhone}
                  onChange={({ value }) => handleInputChange('claimantPhone', value)}
                  size="fillParent"
                />

                <DxcTextInput
                  label="Mailing Address"
                  placeholder="Street, City, State, ZIP"
                  value={formData.claimantAddress}
                  onChange={({ value }) => handleInputChange('claimantAddress', value)}
                  size="fillParent"
                />

                <DxcSelect
                  label={isPC ? 'Relationship to Policyholder' : 'Relationship to Insured'}
                  placeholder="Select relationship"
                  value={formData.relationship}
                  onChange={({ value }) => handleInputChange('relationship', value)}
                  options={isPC ? [
                    { label: 'Policyholder (Self)', value: 'policyholder' },
                    { label: 'Spouse / Domestic Partner', value: 'spouse' },
                    { label: 'Other Insured Driver / Resident', value: 'resident' },
                    { label: 'Third Party Claimant', value: 'third_party' },
                    { label: 'Attorney / Legal Representative', value: 'attorney' },
                    { label: 'Other', value: 'other' }
                  ] : [
                    { label: 'Spouse', value: 'spouse' },
                    { label: 'Child', value: 'child' },
                    { label: 'Parent', value: 'parent' },
                    { label: 'Sibling', value: 'sibling' },
                    { label: 'Trust/Estate', value: 'trust' },
                    { label: 'Other', value: 'other' }
                  ]}
                  size="fillParent"
                />
              </DxcFlex>
            )}

            {/* =================== STEP 4: DOCUMENT UPLOAD =================== */}
            {step === 4 && (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcHeading level={3} text="Document Upload" />

                <DxcAlert
                  semantic="info"
                  message={{ text: "Please upload required documents. Accepted formats: PDF, JPG, PNG (Max 10MB per file)" }}
                />

                {/* ---- P&C Documents ---- */}
                {isPC && (
                  <>
                    {/* Police Report — required for auto and liability */}
                    {isPCAuto && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcTypography fontWeight="font-weight-semibold">
                          Police Report / Incident Report *
                        </DxcTypography>
                        <DxcFileInput
                          accept=".pdf,.jpg,.jpeg,.png"
                          mode="file"
                          buttonLabel="Choose File"
                        />
                      </DxcFlex>
                    )}

                    {/* Damage / Loss Photos — required for all P&C */}
                    <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                      <DxcTypography fontWeight="font-weight-semibold">
                        Damage / Loss Photos *
                      </DxcTypography>
                      <DxcFileInput
                        accept=".jpg,.jpeg,.png,.pdf"
                        mode="filedrop"
                        buttonLabel="Drop photos or click to upload"
                        multiple
                      />
                    </DxcFlex>

                    {/* Repair Estimate — auto */}
                    {isPCAuto && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcTypography fontWeight="font-weight-semibold">
                          Repair Estimate
                        </DxcTypography>
                        <DxcFileInput
                          accept=".pdf,.jpg,.jpeg,.png"
                          mode="file"
                          buttonLabel="Choose File"
                        />
                      </DxcFlex>
                    )}

                    {/* Contractor / Repair Estimate — property */}
                    {isPCProperty && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcTypography fontWeight="font-weight-semibold">
                          Contractor / Repair Estimate
                        </DxcTypography>
                        <DxcFileInput
                          accept=".pdf"
                          mode="file"
                          buttonLabel="Choose File"
                        />
                      </DxcFlex>
                    )}

                    {/* Proof of Ownership — auto */}
                    {isPCAuto && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcTypography fontWeight="font-weight-semibold">
                          Proof of Ownership (Title / Registration)
                        </DxcTypography>
                        <DxcFileInput
                          accept=".pdf,.jpg,.jpeg,.png"
                          mode="file"
                          buttonLabel="Choose File"
                        />
                      </DxcFlex>
                    )}

                    {/* Claimant ID */}
                    <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                      <DxcTypography fontWeight="font-weight-semibold">
                        Claimant ID Document *
                      </DxcTypography>
                      <DxcFileInput
                        accept=".pdf,.jpg,.jpeg,.png"
                        mode="file"
                        buttonLabel="Choose File"
                      />
                    </DxcFlex>
                  </>
                )}

                {/* ---- L&A Documents ---- */}
                {!isPC && (
                  <>
                    <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                      <DxcTypography fontWeight="font-weight-semibold">
                        Death Certificate *
                      </DxcTypography>
                      <DxcFileInput
                        accept=".pdf,.jpg,.jpeg,.png"
                        mode="file"
                        buttonLabel="Choose File"
                      />
                    </DxcFlex>

                    <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                      <DxcTypography fontWeight="font-weight-semibold">
                        Claimant ID Document *
                      </DxcTypography>
                      <DxcFileInput
                        accept=".pdf,.jpg,.jpeg,.png"
                        mode="file"
                        buttonLabel="Choose File"
                      />
                    </DxcFlex>

                    {selectedProduct === 'life' && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcTypography fontWeight="font-weight-semibold">
                          Completed Claim Form *
                        </DxcTypography>
                        <DxcFileInput
                          accept=".pdf"
                          mode="file"
                          buttonLabel="Choose File"
                        />
                      </DxcFlex>
                    )}

                    {selectedProduct === 'annuity' && (
                      <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                        <DxcTypography fontWeight="font-weight-semibold">
                          Annuity Claim Form *
                        </DxcTypography>
                        <DxcFileInput
                          accept=".pdf"
                          mode="file"
                          buttonLabel="Choose File"
                        />
                      </DxcFlex>
                    )}
                  </>
                )}

                {/* Additional Documents — all */}
                <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    Additional Documents (Optional)
                  </DxcTypography>
                  <DxcFileInput
                    accept=".pdf,.jpg,.jpeg,.png"
                    mode="filedrop"
                    buttonLabel="Drop files here or click to upload"
                    multiple
                  />
                </DxcFlex>

                <DxcAlert
                  semantic="warning"
                  message={{ text: "By submitting this claim, you certify that all information provided is accurate and complete." }}
                />
              </DxcFlex>
            )}

            {/* Navigation Buttons */}
            <DxcFlex justifyContent="space-between" gap="var(--spacing-gap-m)">
              <DxcButton
                label="Back"
                mode="secondary"
                onClick={handleBack}
                disabled={step === 1}
              />
              <DxcFlex gap="var(--spacing-gap-s)">
                <DxcButton
                  label="Cancel"
                  mode="tertiary"
                  onClick={() => { setStep(1); setSelectedProduct(null); }}
                />
                {step < totalSteps ? (
                  <DxcButton
                    label="Next"
                    mode="primary"
                    onClick={handleNext}
                    disabled={step === 1 && !selectedProduct}
                  />
                ) : (
                  <DxcButton
                    label={submitting ? "Submitting..." : "Submit Claim"}
                    mode="primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  />
                )}
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>

        {/* What Happens Next Section */}
        <DxcContainer
          padding="var(--spacing-padding-xl)"
          style={{
            backgroundColor: "var(--color-bg-neutral-lightest)",
            borderRadius: "var(--border-radius-m)"
          }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcHeading level={3} text="What happens next?" />

            {isPC ? (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    1. Coverage Verification
                  </DxcTypography>
                  <DxcTypography color="var(--color-fg-neutral-strong)">
                    Your policy will be verified to confirm active coverage and applicable deductibles at the time of loss
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    2. Adjuster Assignment
                  </DxcTypography>
                  <DxcTypography color="var(--color-fg-neutral-strong)">
                    A licensed claims adjuster will be assigned to your claim and will contact you to schedule an inspection or review
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    3. STP (Straight Through Processing)
                  </DxcTypography>
                  <DxcTypography color="var(--color-fg-neutral-strong)">
                    Simple, straightforward claims may qualify for STP with an accelerated settlement timeline
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    4. Adjuster Review & Settlement
                  </DxcTypography>
                  <DxcTypography color="var(--color-fg-neutral-strong)">
                    Your adjuster will review all submitted documents and damage assessments and contact you with a settlement offer
                  </DxcTypography>
                </DxcFlex>
              </DxcFlex>
            ) : (
              <DxcFlex direction="column" gap="var(--spacing-gap-m)">
                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    1. Automatic Verification
                  </DxcTypography>
                  <DxcTypography color="var(--color-fg-neutral-strong)">
                    Your claim will be automatically verified through LexisNexis death verification
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    2. Requirements Generation
                  </DxcTypography>
                  <DxcTypography color="var(--color-fg-neutral-strong)">
                    Our rules engine will determine any additional requirements based on policy and state regulations
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    3. STP (Straight Through Processing)
                  </DxcTypography>
                  <DxcTypography color="var(--color-fg-neutral-strong)">
                    Eligible claims will be processed through our STP system with a 10-day target
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                  <DxcTypography fontWeight="font-weight-semibold">
                    4. Examiner Review
                  </DxcTypography>
                  <DxcTypography color="var(--color-fg-neutral-strong)">
                    A claims examiner will review your submission and contact you if additional information is needed
                  </DxcTypography>
                </DxcFlex>
              </DxcFlex>
            )}
          </DxcFlex>
        </DxcContainer>
      </DxcFlex>
    </DxcContainer>
  );
};

export default IntakeForms;
