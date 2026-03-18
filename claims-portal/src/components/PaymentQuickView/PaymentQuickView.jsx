import { iconEl } from '../../utils/iconEl';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcDivider,
  DxcInset
} from '@dxc-technology/halstack-react';
import './PaymentQuickView.css';

/**
 * SA-018: Payment Quick View
 *
 * Displays detailed payment information in a modal:
 * - Payment status and timeline
 * - Payee information
 * - Benefit breakdown (principal + PMI - tax)
 * - Payment method details
 * - GL posting information
 * - 1099 status
 */
const PaymentQuickView = ({ payment, onEdit, onCancel, onResend, onView1099, onClose }) => {
  if (!payment) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper === 'COMPLETED' || statusUpper === 'PAID') return 'var(--color-fg-success-medium)';
    if (statusUpper === 'PENDING' || statusUpper === 'SCHEDULED') return 'var(--color-fg-warning-medium)';
    if (statusUpper === 'FAILED' || statusUpper === 'CANCELLED') return 'var(--color-fg-error-medium)';
    return 'var(--color-fg-neutral-dark)';
  };

  const getPaymentMethodIcon = (method) => {
    const methodUpper = (method || '').toUpperCase();
    if (methodUpper.includes('ACH') || methodUpper.includes('DIRECT')) return 'account_balance';
    if (methodUpper.includes('CHECK') || methodUpper.includes('CHEQUE')) return 'check';
    if (methodUpper.includes('WIRE')) return 'send';
    return 'payment';
  };

  return (
    <DxcContainer
      padding="var(--spacing-padding-m)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-l)">
        {/* Header */}
        <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
          <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
            <span className="material-icons" style={{ color: 'var(--color-fg-primary-stronger)', fontSize: '24px' }}>
              payment
            </span>
            <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold">
              Payment Details
            </DxcTypography>
            <DxcBadge label={payment.status || 'Unknown'} />
          </DxcFlex>
          <DxcTypography fontSize="font-scale-02" color="var(--color-fg-neutral-strong)">
            {payment.paymentNumber || payment.id}
          </DxcTypography>
        </DxcFlex>

        <DxcDivider />

        {/* Payee Information */}
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '18px', color: 'var(--color-fg-neutral-strong)' }}>
                person
              </span>
              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                Payee Information
              </DxcTypography>
            </DxcFlex>

            <div className="payment-details-grid">
              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Payee Name
                </DxcTypography>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  {payment.payeeName || 'N/A'}
                </DxcTypography>
              </DxcFlex>

              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Payee ID
                </DxcTypography>
                <DxcTypography fontSize="font-scale-02">
                  {payment.payeeId || 'N/A'}
                </DxcTypography>
              </DxcFlex>

              <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                  Percentage
                </DxcTypography>
                <DxcTypography fontSize="font-scale-02">
                  {payment.percentage || 100}%
                </DxcTypography>
              </DxcFlex>
            </div>
          </DxcFlex>
        </DxcContainer>

        {/* Benefit Breakdown */}
        <DxcContainer
          padding="var(--spacing-padding-m)"
          style={{ backgroundColor: 'var(--color-bg-info-lightest)' }}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
              <span className="material-icons" style={{ fontSize: '18px', color: 'var(--color-fg-info-medium)' }}>
                account_balance_wallet
              </span>
              <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                Benefit Breakdown
              </DxcTypography>
            </DxcFlex>

            <DxcFlex direction="column" gap="var(--spacing-gap-s)">
              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcTypography fontSize="font-scale-01">
                  Death Benefit Amount
                </DxcTypography>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  {formatCurrency(payment.benefitAmount)}
                </DxcTypography>
              </DxcFlex>

              {payment.netBenefitPMI > 0 && (
                <DxcFlex justifyContent="space-between" alignItems="center">
                  <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM: Data black */>
                    + Post Mortem Interest
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data black */>
                    {formatCurrency(payment.netBenefitPMI)}
                  </DxcTypography>
                </DxcFlex>
              )}

              {payment.taxWithheld > 0 && (
                <DxcFlex justifyContent="space-between" alignItems="center">
                  <DxcTypography fontSize="font-scale-01" color="#000000" /* BLOOM: Data black */>
                    - Tax Withholding
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data black */>
                    {formatCurrency(payment.taxWithheld)}
                  </DxcTypography>
                </DxcFlex>
              )}

              <DxcDivider />

              <DxcFlex justifyContent="space-between" alignItems="center">
                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                  Net Benefit Proceeds
                </DxcTypography>
                <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data black */>
                  {formatCurrency(payment.netBenefitProceeds)}
                </DxcTypography>
              </DxcFlex>
            </DxcFlex>
          </DxcFlex>
        </DxcContainer>

        {/* Payment Method & Timeline */}
        <div className="payment-info-grid">
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                <span className="material-icons" style={{ fontSize: '18px', color: 'var(--color-fg-neutral-strong)' }}>
                  {getPaymentMethodIcon(payment.paymentMethod)}
                </span>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  Payment Method
                </DxcTypography>
              </DxcFlex>

              <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold" color="var(--color-fg-primary-stronger)">
                  {payment.paymentMethod || 'N/A'}
                </DxcTypography>
                {payment.accountNumber && (
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                    Account: ***{payment.accountNumber.slice(-4)}
                  </DxcTypography>
                )}
                {payment.routingNumber && (
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-strong)">
                    Routing: {payment.routingNumber}
                  </DxcTypography>
                )}
              </DxcFlex>
            </DxcFlex>
          </DxcContainer>

          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                <span className="material-icons" style={{ fontSize: '18px', color: 'var(--color-fg-neutral-strong)' }}>
                  schedule
                </span>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  Timeline
                </DxcTypography>
              </DxcFlex>

              <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                <DxcFlex justifyContent="space-between">
                  <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                    Scheduled Date:
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                    {formatDate(payment.scheduledDate)}
                  </DxcTypography>
                </DxcFlex>
                {payment.paymentDate && (
                  <DxcFlex justifyContent="space-between">
                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                      Payment Date:
                    </DxcTypography>
                    <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                      {formatDate(payment.paymentDate)}
                    </DxcTypography>
                  </DxcFlex>
                )}
                {payment.clearedDate && (
                  <DxcFlex justifyContent="space-between">
                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                      Cleared Date:
                    </DxcTypography>
                    <DxcTypography fontSize="font-scale-01" fontWeight="font-weight-semibold">
                      {formatDate(payment.clearedDate)}
                    </DxcTypography>
                  </DxcFlex>
                )}
              </DxcFlex>
            </DxcFlex>
          </DxcContainer>
        </div>

        {/* GL Posting & 1099 Information */}
        {(payment.glPosted || payment.form1099) && (
          <DxcContainer
            padding="var(--spacing-padding-m)"
            style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
          >
            <DxcFlex direction="column" gap="var(--spacing-gap-m)">
              <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                <span className="material-icons" style={{ fontSize: '18px', color: 'var(--color-fg-neutral-strong)' }}>
                  description
                </span>
                <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                  Accounting & Tax Information
                </DxcTypography>
              </DxcFlex>

              <div className="payment-details-grid">
                {payment.glPosted && (
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                      GL Posted
                    </DxcTypography>
                    <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                      <span className="material-icons" style={{ fontSize: '16px', color: 'var(--color-fg-success-medium)' }}>
                        check_circle
                      </span>
                      <DxcTypography fontSize="font-scale-01">
                        {formatDate(payment.glPostedDate)}
                      </DxcTypography>
                    </DxcFlex>
                  </DxcFlex>
                )}

                {payment.form1099 && (
                  <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                    <DxcTypography fontSize="font-scale-01" color="var(--color-fg-neutral-stronger)">
                      Form 1099-R Status
                    </DxcTypography>
                    <DxcFlex gap="var(--spacing-gap-xs)" alignItems="center">
                      <DxcBadge label={payment.form1099Status || 'Generated'} />
                      {onView1099 && (
                        <DxcButton
                          label="View"
                          mode="tertiary"
                          size="small"
                          onClick={onView1099}
                        />
                      )}
                    </DxcFlex>
                  </DxcFlex>
                )}
              </div>
            </DxcFlex>
          </DxcContainer>
        )}

        {/* Actions */}
        <DxcFlex gap="var(--spacing-gap-s)" wrap="wrap">
          {onEdit && payment.status !== 'COMPLETED' && (
            <DxcButton
              label="Edit Payment"
              mode="secondary"
              icon={iconEl("edit")}
              onClick={() => onEdit(payment)}
            />
          )}
          {onCancel && (payment.status === 'PENDING' || payment.status === 'SCHEDULED') && (
            <DxcButton
              label="Cancel Payment"
              mode="secondary"
              icon={iconEl("cancel")}
              onClick={() => onCancel(payment)}
            />
          )}
          {onResend && payment.status === 'FAILED' && (
            <DxcButton
              label="Resend Payment"
              mode="primary"
              icon={iconEl("send")}
              onClick={() => onResend(payment)}
            />
          )}
        </DxcFlex>
      </DxcFlex>
    </DxcContainer>
  );
};

export default PaymentQuickView;
