/**
 * Requirements Tracker Component
 *
 * Displays claim requirements with status tracking and progress visualization.
 * Supports document upload, waiver, and override actions.
 */

import { iconEl } from '../../utils/iconEl';
import { useMemo } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcBadge,
  DxcButton,
  DxcProgressBar,
  DxcInset
} from '@dxc-technology/halstack-react';
import { RequirementStatus, RequirementLevel } from '../../types/requirement.types';

/**
 * Individual Requirement Item
 */
const RequirementItem = ({ requirement, onUpload, onWaive, onOverride, compact = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case RequirementStatus.SATISFIED:
        return 'success';
      case RequirementStatus.PENDING:
        return 'warning';
      case RequirementStatus.IN_REVIEW:
        return 'info';
      case RequirementStatus.REJECTED:
        return 'error';
      case RequirementStatus.WAIVED:
        return 'neutral';
      case RequirementStatus.OVERRIDDEN:
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getLevelColor = (level) => {
    return level === RequirementLevel.MANDATORY ? '#D0021B' : '#0095FF';
  };

  const isOverdue = requirement.isOverdue && requirement.isOverdue();
  const isSatisfied = requirement.isSatisfied && requirement.isSatisfied();

  if (compact) {
    return (
      <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
        <DxcBadge
          label={requirement.status}
          mode="contextual"
          color={getStatusColor(requirement.status)}
        />
        <DxcTypography fontSize="12px" color="#000000">
          {requirement.type}
        </DxcTypography>
        {isOverdue && (
          <DxcTypography fontSize="12px" color="#000000">
            Overdue
          </DxcTypography>
        )}
      </DxcFlex>
    );
  }

  return (
    <DxcContainer
      style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
      border={{ color: "var(--border-color-neutral-lighter)", style: "solid", width: "1px" }}
    >
      <DxcInset space="var(--spacing-padding-m)">
        <DxcFlex direction="column" gap="var(--spacing-gap-s)">
          {/* Header */}
          <DxcFlex justifyContent="space-between" alignItems="center">
            <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
              <div
                style={{
                  width: '4px',
                  height: '20px',
                  backgroundColor: getLevelColor(requirement.level),
                  borderRadius: '2px'
                }}
              />
              <DxcTypography
                fontSize="font-scale-03"
                fontWeight="font-weight-semibold"
                color="#000000"
              >
                {requirement.type}
              </DxcTypography>
              <DxcBadge
                label={requirement.level}
                mode="contextual"
                color={requirement.level === RequirementLevel.MANDATORY ? 'error' : 'info'}
              />
            </DxcFlex>
            <DxcBadge
              label={requirement.status}
              mode="contextual"
              color={getStatusColor(requirement.status)}
            />
          </DxcFlex>

          {/* Description */}
          <DxcTypography fontSize="12px" color="#000000">
            {requirement.description}
          </DxcTypography>

          {/* Metadata */}
          <DxcFlex gap="var(--spacing-gap-m)" alignItems="center" wrap="wrap">
            {requirement.dueDate && (
              <>
                <DxcTypography fontSize="12px" color="#000000">
                  Due: {new Date(requirement.dueDate).toLocaleDateString()}
                </DxcTypography>
                {isOverdue && !isSatisfied && (
                  <DxcTypography fontSize="12px" color="#000000" fontWeight="font-weight-semibold">
                    OVERDUE
                  </DxcTypography>
                )}
              </>
            )}
            {requirement.documents && requirement.documents.length > 0 && (
              <DxcTypography fontSize="12px" color="#000000">
                Documents: {requirement.documents.length}
              </DxcTypography>
            )}
          </DxcFlex>

          {/* Waived/Overridden Info */}
          {requirement.waived && (
            <DxcContainer
              style={{ backgroundColor: "var(--color-bg-warning-lightest)" }}
              padding="var(--spacing-padding-xs)"
            >
              <DxcTypography fontSize="12px" color="var(--color-fg-warning-darker)">
                Waived by {requirement.waivedBy}: {requirement.waivedReason}
              </DxcTypography>
            </DxcContainer>
          )}

          {requirement.overridden && (
            <DxcContainer
              style={{ backgroundColor: "var(--color-bg-info-lightest)" }}
              padding="var(--spacing-padding-xs)"
            >
              <DxcTypography fontSize="12px" color="var(--color-fg-info-darker)">
                Overridden by {requirement.overriddenBy}: {requirement.overriddenReason}
              </DxcTypography>
            </DxcContainer>
          )}

          {/* Actions */}
          {!isSatisfied && (
            <DxcFlex gap="var(--spacing-gap-s)">
              {onUpload && (
                <DxcButton
                  label="Upload Document"
                  mode="secondary"
                  icon={iconEl("upload_file")}
                  size="small"
                  onClick={() => onUpload(requirement)}
                />
              )}
              {onWaive && requirement.level === RequirementLevel.OPTIONAL && (
                <DxcButton
                  label="Waive"
                  mode="tertiary"
                  size="small"
                  onClick={() => onWaive(requirement)}
                />
              )}
              {onOverride && (
                <DxcButton
                  label="Override"
                  mode="tertiary"
                  size="small"
                  onClick={() => onOverride(requirement)}
                />
              )}
            </DxcFlex>
          )}
        </DxcFlex>
      </DxcInset>
    </DxcContainer>
  );
};

/**
 * Requirements Tracker
 */
const RequirementsTracker = ({
  requirements = [],
  onUpload,
  onWaive,
  onOverride,
  showProgress = true,
  compact = false
}) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const total = requirements.length;
    const satisfied = requirements.filter(r =>
      r.status === RequirementStatus.SATISFIED || r.waived || r.overridden
    ).length;
    const pending = requirements.filter(r => r.status === RequirementStatus.PENDING).length;
    const inReview = requirements.filter(r => r.status === RequirementStatus.IN_REVIEW).length;
    const rejected = requirements.filter(r => r.status === RequirementStatus.REJECTED).length;
    const overdue = requirements.filter(r => r.isOverdue && r.isOverdue()).length;
    const mandatory = requirements.filter(r => r.level === RequirementLevel.MANDATORY).length;
    const mandatorySatisfied = requirements.filter(r =>
      r.level === RequirementLevel.MANDATORY &&
      (r.status === RequirementStatus.SATISFIED || r.waived || r.overridden)
    ).length;

    const completionPercentage = total > 0 ? Math.round((satisfied / total) * 100) : 0;

    return {
      total,
      satisfied,
      pending,
      inReview,
      rejected,
      overdue,
      mandatory,
      mandatorySatisfied,
      completionPercentage
    };
  }, [requirements]);

  // Group requirements by status
  const groupedRequirements = useMemo(() => {
    const groups = {
      pending: [],
      inReview: [],
      satisfied: [],
      rejected: [],
      waived: [],
      overridden: []
    };

    requirements.forEach(req => {
      if (req.waived) {
        groups.waived.push(req);
      } else if (req.overridden) {
        groups.overridden.push(req);
      } else {
        switch (req.status) {
          case RequirementStatus.PENDING:
            groups.pending.push(req);
            break;
          case RequirementStatus.IN_REVIEW:
            groups.inReview.push(req);
            break;
          case RequirementStatus.SATISFIED:
            groups.satisfied.push(req);
            break;
          case RequirementStatus.REJECTED:
            groups.rejected.push(req);
            break;
          default:
            groups.pending.push(req);
        }
      }
    });

    return groups;
  }, [requirements]);

  if (requirements.length === 0) {
    return (
      <DxcContainer
        style={{ backgroundColor: "var(--color-bg-neutral-lighter)" }}
        padding="var(--spacing-padding-l)"
      >
        <DxcTypography fontSize="font-scale-03" textAlign="center" color="#000000">
          No requirements generated yet
        </DxcTypography>
      </DxcContainer>
    );
  }

  return (
    <DxcFlex direction="column" gap="var(--spacing-gap-m)">
      {/* Progress Section */}
      {showProgress && (
        <DxcContainer
          style={{ backgroundColor: "var(--color-bg-neutral-lightest)" }}
          padding="var(--spacing-padding-m)"
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcFlex justifyContent="space-between" alignItems="center">
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                Requirements Progress
              </DxcTypography>
              <DxcTypography fontSize="font-scale-04" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                {stats.completionPercentage}%
              </DxcTypography>
            </DxcFlex>

            <DxcProgressBar
              value={stats.completionPercentage}
              showValue={false}
            />

            <DxcFlex gap="var(--spacing-gap-l)" wrap="wrap">
              <DxcFlex gap="var(--spacing-gap-xxs)" direction="column">
                <DxcTypography fontSize="12px" color="#000000">
                  Total
                </DxcTypography>
                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                  {stats.total}
                </DxcTypography>
              </DxcFlex>

              <DxcFlex gap="var(--spacing-gap-xxs)" direction="column">
                <DxcTypography fontSize="12px" color="#000000">
                  Satisfied
                </DxcTypography>
                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000">
                  {stats.satisfied}
                </DxcTypography>
              </DxcFlex>

              <DxcFlex gap="var(--spacing-gap-xxs)" direction="column">
                <DxcTypography fontSize="12px" color="#000000">
                  Pending
                </DxcTypography>
                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000">
                  {stats.pending}
                </DxcTypography>
              </DxcFlex>

              <DxcFlex gap="var(--spacing-gap-xxs)" direction="column">
                <DxcTypography fontSize="12px" color="#000000">
                  In Review
                </DxcTypography>
                <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000" /* BLOOM: Data values must be black */>
                  {stats.inReview}
                </DxcTypography>
              </DxcFlex>

              {stats.overdue > 0 && (
                <DxcFlex gap="var(--spacing-gap-xxs)" direction="column">
                  <DxcTypography fontSize="12px" color="#000000">
                    Overdue
                  </DxcTypography>
                  <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold" color="#000000">
                    {stats.overdue}
                  </DxcTypography>
                </DxcFlex>
              )}
            </DxcFlex>

            {/* Mandatory Requirements Alert */}
            {stats.mandatory > 0 && stats.mandatorySatisfied < stats.mandatory && (
              <DxcContainer
                style={{ backgroundColor: "var(--color-bg-warning-lightest)" }}
                padding="var(--spacing-padding-s)"
              >
                <DxcTypography fontSize="12px" color="var(--color-fg-warning-darker)">
                  {stats.mandatorySatisfied} of {stats.mandatory} mandatory requirements satisfied
                </DxcTypography>
              </DxcContainer>
            )}

            {stats.mandatory > 0 && stats.mandatorySatisfied === stats.mandatory && (
              <DxcContainer
                style={{ backgroundColor: "var(--color-bg-success-lightest)" }}
                padding="var(--spacing-padding-s)"
              >
                <DxcTypography fontSize="12px" color="var(--color-fg-success-darker)">
                  All mandatory requirements satisfied ✓
                </DxcTypography>
              </DxcContainer>
            )}
          </DxcFlex>
        </DxcContainer>
      )}

      {/* Requirements List */}
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Pending Requirements */}
        {groupedRequirements.pending.length > 0 && (
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Pending ({groupedRequirements.pending.length})
            </DxcTypography>
            {groupedRequirements.pending.map((req, index) => (
              <RequirementItem
                key={req.id || index}
                requirement={req}
                onUpload={onUpload}
                onWaive={onWaive}
                onOverride={onOverride}
                compact={compact}
              />
            ))}
          </DxcFlex>
        )}

        {/* In Review Requirements */}
        {groupedRequirements.inReview.length > 0 && (
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              In Review ({groupedRequirements.inReview.length})
            </DxcTypography>
            {groupedRequirements.inReview.map((req, index) => (
              <RequirementItem
                key={req.id || index}
                requirement={req}
                onUpload={onUpload}
                onWaive={onWaive}
                onOverride={onOverride}
                compact={compact}
              />
            ))}
          </DxcFlex>
        )}

        {/* Rejected Requirements */}
        {groupedRequirements.rejected.length > 0 && (
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Rejected ({groupedRequirements.rejected.length})
            </DxcTypography>
            {groupedRequirements.rejected.map((req, index) => (
              <RequirementItem
                key={req.id || index}
                requirement={req}
                onUpload={onUpload}
                onWaive={onWaive}
                onOverride={onOverride}
                compact={compact}
              />
            ))}
          </DxcFlex>
        )}

        {/* Satisfied Requirements */}
        {groupedRequirements.satisfied.length > 0 && (
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Satisfied ({groupedRequirements.satisfied.length})
            </DxcTypography>
            {groupedRequirements.satisfied.map((req, index) => (
              <RequirementItem
                key={req.id || index}
                requirement={req}
                compact={compact}
              />
            ))}
          </DxcFlex>
        )}

        {/* Waived/Overridden Requirements */}
        {(groupedRequirements.waived.length > 0 || groupedRequirements.overridden.length > 0) && (
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Waived/Overridden ({groupedRequirements.waived.length + groupedRequirements.overridden.length})
            </DxcTypography>
            {[...groupedRequirements.waived, ...groupedRequirements.overridden].map((req, index) => (
              <RequirementItem
                key={req.id || index}
                requirement={req}
                compact={compact}
              />
            ))}
          </DxcFlex>
        )}
      </DxcFlex>
    </DxcFlex>
  );
};

export default RequirementsTracker;
export { RequirementItem };
