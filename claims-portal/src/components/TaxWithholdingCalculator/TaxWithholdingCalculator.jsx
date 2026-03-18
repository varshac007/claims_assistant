import { iconEl } from '../../utils/iconEl';
import { useState } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcTextInput,
  DxcSelect,
  DxcCheckbox,
  DxcInset,
  DxcAlert
} from '@dxc-technology/halstack-react';
import './TaxWithholdingCalculator.css';

/**
 * SA-017: Tax Withholding Calculator
 *
 * Calculates federal and state tax withholding on death benefit payments:
 * - Federal withholding (optional, typically 10-37%)
 * - State withholding (varies by state)
 * - Interest portion taxation
 * - 1099-R form generation
 *
 * Integrates with cmA Tax Engine
 */
const TaxWithholdingCalculator = ({ claimData, paymentData, onCalculate, onApply, onClose }) => {
  const [formData, setFormData] = useState({
    benefitAmount: paymentData?.benefitAmount || claimData?.financial?.claimAmount || 0,
    interestAmount: paymentData?.netBenefitPMI || claimData?.financial?.netBenefitPMI || 0,
    federalWithholding: false,
    federalRate: 10,
    stateWithholding: false,
    stateRate: 0,
    state: claimData?.deathEvent?.stateOfDeath || claimData?.policy?.issueState || 'NY'
  });

  const [calculationResult, setCalculationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  // State tax rates (simplified - in production, comes from cmA Tax Engine)
  const stateTaxRates = {
    'NY': 4.0,
    'CA': 1.0,
    'TX': 0,
    'FL': 0,
    'IL': 4.95,
    'PA': 3.07,
    'OH': 2.85,
    'GA': 5.75,
    'NC': 4.99,
    'MI': 4.25
  };

  const federalRates = [
    { value: 10, label: '10%' },
    { value: 12, label: '12%' },
    { value: 22, label: '22%' },
    { value: 24, label: '24%' },
    { value: 32, label: '32%' },
    { value: 35, label: '35%' },
    { value: 37, label: '37%' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear previous results when inputs change
    setCalculationResult(null);
    setError(null);
  };

  const calculateTax = () => {
    setIsCalculating(true);
    setError(null);

    try {
      // Validation
      if (!formData.benefitAmount) {
        throw new Error('Benefit amount is required');
      }

      // Calculate taxable amount (typically only interest portion is taxable)
      const taxableAmount = formData.interestAmount;
      const nonTaxableAmount = formData.benefitAmount;

      // Federal withholding (applied to interest only)
      const federalWithheld = formData.federalWithholding
        ? (taxableAmount * (formData.federalRate / 100))
        : 0;

      // State withholding (applied to interest only)
      const stateRate = stateTaxRates[formData.state] || 0;
      const stateWithheld = formData.stateWithholding
        ? (taxableAmount * (stateRate / 100))
        : 0;

      const totalWithheld = federalWithheld + stateWithheld;
      const netPayment = formData.benefitAmount + formData.interestAmount - totalWithheld;

      const result = {
        benefitAmount: formData.benefitAmount,
        interestAmount: formData.interestAmount,
        totalPayment: formData.benefitAmount + formData.interestAmount,
        taxableAmount,
        nonTaxableAmount,
        federalWithholding: {
          applied: formData.federalWithholding,
          rate: formData.federalRate,
          amount: Math.round(federalWithheld * 100) / 100
        },
        stateWithholding: {
          applied: formData.stateWithholding,
          rate: stateRate,
          state: formData.state,
          amount: Math.round(stateWithheld * 100) / 100
        },
        totalWithheld: Math.round(totalWithheld * 100) / 100,
        netPayment: Math.round(netPayment * 100) / 100,
        form1099Required: taxableAmount > 0,
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
            receipt_long
          </span>
          <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
            Tax Withholding Calculator
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
              Payment Details
            </DxcTypography>

            <div className="tax-form-grid">
              <DxcTextInput
                label="Death Benefit Amount *"
                value={formData.benefitAmount}
                onChange={(value) => handleInputChange('benefitAmount', parseFloat(value) || 0)}
                type="number"
                prefix="$"
                helperText="Non-taxable portion"
                size="fillParent"
              />

              <DxcTextInput
                label="Interest Amount"
                value={formData.interestAmount}
                onChange={(value) => handleInputChange('interestAmount', parseFloat(value) || 0)}
                type="number"
                prefix="$"
                helperText="Taxable portion (PMI)"
                size="fillParent"
              />

              <DxcSelect
                label="Beneficiary State *"
                value={formData.state}
                onChange={(value) => handleInputChange('state', value)}
                options={Object.keys(stateTaxRates).map(state => ({
                  label: `${state} - ${stateTaxRates[state]}%`,
                  value: state
                }))}
                size="fillParent"
              />
            </div>

            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
              Withholding Options
            </DxcTypography>

            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcCheckbox
                label="Apply Federal Withholding"
                checked={formData.federalWithholding}
                onChange={(checked) => handleInputChange('federalWithholding', checked)}
              />

              {formData.federalWithholding && (
                <DxcInset left="var(--spacing-padding-xl)">
                  <DxcSelect
                    label="Federal Withholding Rate"
                    value={formData.federalRate}
                    onChange={(value) => handleInputChange('federalRate', parseInt(value))}
                    options={federalRates}
                    size="medium"
                  />
                </DxcInset>
              )}

              <DxcCheckbox
                label="Apply State Withholding"
                checked={formData.stateWithholding}
                onChange={(checked) => handleInputChange('stateWithholding', checked)}
              />

              {formData.stateWithholding && (
                <DxcInset left="var(--spacing-padding-xl)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                    State rate for {formData.state}: {stateTaxRates[formData.state] || 0}%
                  </DxcTypography>
                </DxcInset>
              )}
            </DxcFlex>

            <DxcFlex gap="var(--spacing-gap-s)">
              <DxcButton
                label="Calculate Withholding"
                mode="primary"
                icon={iconEl("calculate")}
                onClick={calculateTax}
                disabled={isCalculating}
              />
              {calculationResult && (
                <DxcButton
                  label="Apply to Payment"
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
                  Tax Calculation Results
                </DxcTypography>
              </DxcFlex>

              <div className="tax-results-grid">
                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Death Benefit (Non-Taxable)
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                    {formatCurrency(calculationResult.nonTaxableAmount)}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Interest (Taxable)
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                    {formatCurrency(calculationResult.taxableAmount)}
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Federal Withholding
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)">
                    {formatCurrency(calculationResult.federalWithholding.amount)}
                    {calculationResult.federalWithholding.applied &&
                      ` (${calculationResult.federalWithholding.rate}%)`
                    }
                  </DxcTypography>
                </DxcFlex>

                <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    State Withholding ({calculationResult.stateWithholding.state})
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)">
                    {formatCurrency(calculationResult.stateWithholding.amount)}
                    {calculationResult.stateWithholding.applied &&
                      ` (${calculationResult.stateWithholding.rate}%)`
                    }
                  </DxcTypography>
                </DxcFlex>
              </div>

              <DxcInset>
                <DxcContainer
                  padding="var(--spacing-padding-m)"
                  style={{ backgroundColor: 'var(--color-bg-info-lighter)' }}
                >
                  <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcTypography fontSize="font-scale-01">
                        Gross Payment
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                        {formatCurrency(calculationResult.totalPayment)}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcTypography fontSize="font-scale-01">
                        Total Withholding
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-error-medium)">
                        -{formatCurrency(calculationResult.totalWithheld)}
                      </DxcTypography>
                    </DxcFlex>
                    <DxcFlex justifyContent="space-between" alignItems="center">
                      <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                        Net Payment to Beneficiary
                      </DxcTypography>
                      <DxcTypography fontSize="font-scale-05" fontWeight="font-weight-semibold" color="var(--color-fg-success-darker)">
                        {formatCurrency(calculationResult.netPayment)}
                      </DxcTypography>
                    </DxcFlex>
                  </DxcFlex>
                </DxcContainer>
              </DxcInset>

              {calculationResult.form1099Required && (
                <DxcAlert
                  type="info"
                  inlineText="IRS Form 1099-R required for this payment due to taxable interest amount. Form will be generated and sent to beneficiary by January 31st."
                />
              )}
            </DxcFlex>
          </DxcContainer>
        )}

        {/* Info Note */}
        <DxcAlert
          type="warning"
          inlineText="Death benefit proceeds are generally not taxable. However, interest earned (Post Mortem Interest) is taxable income and subject to federal and state withholding. Beneficiary should consult tax advisor."
        />
      </DxcFlex>
    </DxcContainer>
  );
};

export default TaxWithholdingCalculator;
