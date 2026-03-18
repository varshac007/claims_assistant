import { iconEl } from '../../utils/iconEl';
import { useState } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcTextInput,
  DxcSelect,
  DxcInset,
  DxcAlert
} from '@dxc-technology/halstack-react';
import './PMICalculator.css';

/**
 * SA-016: Post Mortem Interest (PMI) Calculator
 *
 * Calculates state-specific interest on death claims based on:
 * - Date of Death
 * - Settlement Date
 * - Claim Amount
 * - State regulations
 * - Policy type
 *
 * Integrates with VPMS Interest Engine
 */
const PMICalculator = ({ claimData, onCalculate, onApply, onClose }) => {
  const [formData, setFormData] = useState({
    dateOfDeath: claimData?.insured?.dateOfDeath || claimData?.deathEvent?.dateOfDeath || '',
    settlementDate: new Date().toISOString().split('T')[0],
    claimAmount: claimData?.financial?.claimAmount || 0,
    state: claimData?.deathEvent?.stateOfDeath || claimData?.policy?.issueState || 'NY',
    policyType: claimData?.policy?.type || claimData?.policies?.[0]?.policyType || 'Term Life'
  });

  const [calculationResult, setCalculationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  // State interest rates (simplified - in production, comes from VPMS)
  const stateRates = {
    'NY': { rate: 9.0, method: 'Simple', description: 'New York statutory rate' },
    'CA': { rate: 10.0, method: 'Simple', description: 'California statutory rate' },
    'TX': { rate: 10.0, method: 'Simple', description: 'Texas statutory rate' },
    'FL': { rate: 12.0, method: 'Simple', description: 'Florida statutory rate' },
    'IL': { rate: 9.0, method: 'Simple', description: 'Illinois statutory rate' },
    'PA': { rate: 6.0, method: 'Simple', description: 'Pennsylvania statutory rate' },
    'OH': { rate: 10.0, method: 'Simple', description: 'Ohio statutory rate' },
    'GA': { rate: 12.0, method: 'Simple', description: 'Georgia statutory rate' },
    'NC': { rate: 8.0, method: 'Simple', description: 'North Carolina statutory rate' },
    'MI': { rate: 12.0, method: 'Simple', description: 'Michigan statutory rate' }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear previous results when inputs change
    setCalculationResult(null);
    setError(null);
  };

  const calculatePMI = () => {
    setIsCalculating(true);
    setError(null);

    try {
      // Validation
      if (!formData.dateOfDeath || !formData.settlementDate || !formData.claimAmount) {
        throw new Error('Please fill in all required fields');
      }

      const dod = new Date(formData.dateOfDeath);
      const settlement = new Date(formData.settlementDate);

      if (settlement <= dod) {
        throw new Error('Settlement date must be after date of death');
      }

      // Calculate days between DOD and settlement
      const daysDiff = Math.floor((settlement - dod) / (1000 * 60 * 60 * 24));

      // Get state rate
      const stateInfo = stateRates[formData.state] || stateRates['NY'];
      const annualRate = stateInfo.rate / 100;

      // Calculate interest (Simple interest: Principal × Rate × Time)
      const interestAmount = (formData.claimAmount * annualRate * daysDiff) / 365;

      const result = {
        dateOfDeath: formData.dateOfDeath,
        settlementDate: formData.settlementDate,
        claimAmount: formData.claimAmount,
        daysBetween: daysDiff,
        interestRate: stateInfo.rate,
        interestMethod: stateInfo.method,
        interestAmount: Math.round(interestAmount * 100) / 100,
        totalAmount: formData.claimAmount + Math.round(interestAmount * 100) / 100,
        state: formData.state,
        stateDescription: stateInfo.description,
        calculatedAt: new Date().toISOString()
      };

      setCalculationResult(result);

      // Callback to parent
      if (onCalculate) {
        onCalculate(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleApply = () => {
    if (calculationResult && onApply) {
      onApply(calculationResult);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <DxcContainer
      padding="var(--spacing-padding-m)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Header */}
        <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
          <span className="material-icons" style={{ color: 'var(--color-fg-primary-stronger)', fontSize: '24px' }}>
            calculate
          </span>
          <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
            Post Mortem Interest Calculator
          </DxcTypography>
        </DxcFlex>

        {/* Error Alert */}
        {error && (
          <DxcAlert
            type="error"
            inlineText={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Input Form */}
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
              Calculation Parameters
            </DxcTypography>

            <div className="pmi-form-grid">
              <DxcTextInput
                label="Date of Death *"
                value={formData.dateOfDeath}
                onChange={(value) => handleInputChange('dateOfDeath', value)}
                type="date"
                size="fillParent"
              />

              <DxcTextInput
                label="Settlement Date *"
                value={formData.settlementDate}
                onChange={(value) => handleInputChange('settlementDate', value)}
                type="date"
                size="fillParent"
              />

              <DxcTextInput
                label="Claim Amount *"
                value={formData.claimAmount}
                onChange={(value) => handleInputChange('claimAmount', parseFloat(value) || 0)}
                type="number"
                prefix="$"
                size="fillParent"
              />

              <DxcSelect
                label="State *"
                value={formData.state}
                onChange={(value) => handleInputChange('state', value)}
                options={Object.keys(stateRates).map(state => ({
                  label: `${state} - ${stateRates[state].rate}%`,
                  value: state
                }))}
                size="fillParent"
              />

              <DxcTextInput
                label="Policy Type"
                value={formData.policyType}
                onChange={(value) => handleInputChange('policyType', value)}
                size="fillParent"
                disabled
              />
            </div>

            <DxcFlex gap="var(--spacing-gap-s)">
              <DxcButton
                label="Calculate Interest"
                mode="primary"
                icon={iconEl("calculate")}
                onClick={calculatePMI}
                disabled={isCalculating}
              />
              {calculationResult && (
                <DxcButton
                  label="Apply to Claim"
                  mode="secondary"
                  icon={iconEl("check")}
                  onClick={handleApply}
                />
              )}
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>

        {/* Calculation Results */}
        {calculationResult && (
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-success-lightest)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                <span className="material-icons" style={{ color: 'var(--color-fg-success-medium)', fontSize: '20px' }}>
                  check_circle
                </span>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  Calculation Results
                </DxcTypography>
              </DxcFlex>

              <div className="pmi-results-grid">
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                    Days Between DOD and Settlement
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                    {calculationResult.daysBetween} days
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                    Interest Rate ({calculationResult.state})
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                    {calculationResult.interestRate}% ({calculationResult.interestMethod})
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                    Claim Amount
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                    {formatCurrency(calculationResult.claimAmount)}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                    Interest Amount
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000" /* BLOOM */>
                    {formatCurrency(calculationResult.interestAmount)}
                  </DxcTypography>
                </DxcFlex>
              </div>

              <DxcInset>
                <DxcContainer
                  padding="var(--spacing-padding-m)"
                  style={{ backgroundColor: 'var(--color-bg-info-lighter)' }}
                >
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                      Total Amount (Principal + Interest)
                    </DxcTypography>
                    <DxcTypography fontSize="font-scale-05" fontWeight="font-weight-semibold" color="var(--color-fg-success-darker)">
                      {formatCurrency(calculationResult.totalAmount)}
                    </DxcTypography>
                  </DxcFlex>
                </DxcContainer>
              </DxcInset>

              <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM */>
                {calculationResult.stateDescription}
              </DxcTypography>
            </DxcFlex>
          </DxcContainer>
        )}

        {/* Info Note */}
        <DxcAlert
          type="info"
          inlineText="Interest calculations are based on state-specific statutory rates and regulations. Production system integrates with VPMS Interest Engine for real-time rate updates."
        />
      </DxcFlex>
    </DxcContainer>
  );
};

export default PMICalculator;
