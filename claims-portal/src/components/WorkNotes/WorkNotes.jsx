import { iconEl } from '../../utils/iconEl';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DxcHeading,
  DxcFlex,
  DxcContainer,
  DxcTypography,
  DxcButton,
  DxcBadge,
  DxcTextarea,
  DxcAlert,
  DxcSpinner,
  DxcInset
} from '@dxc-technology/halstack-react';
import serviceNowService from '../../services/api/serviceNowService';
import eventBus, { EventTypes } from '../../services/sync/eventBus';
import './WorkNotes.css';

const POLL_INTERVAL = 30000; // 30 seconds

const WorkNotes = ({ claimSysId, fnolNumber, isDemo = false, demoWorkNotes = [] }) => {
  const [workNotes, setWorkNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const pollRef = useRef(null);
  const previousCountRef = useRef(0);

  const fetchWorkNotes = useCallback(async () => {
    if (isDemo) {
      setWorkNotes(demoWorkNotes);
      return;
    }

    if (!claimSysId) return;

    try {
      setLoading(true);
      setError(null);
      const notes = await serviceNowService.getWorkNotes(claimSysId);
      setWorkNotes(notes);

      // Check for new notes and publish event
      if (previousCountRef.current > 0 && notes.length > previousCountRef.current) {
        eventBus.publish(EventTypes.WORKNOTE_RECEIVED, {
          claimSysId,
          newCount: notes.length - previousCountRef.current
        });
      }
      previousCountRef.current = notes.length;
    } catch (err) {
      console.error('[WorkNotes] Error fetching work notes:', err);
      setError(err.message);
      // Fall back to demo notes if available
      if (demoWorkNotes.length > 0) {
        setWorkNotes(demoWorkNotes);
      }
    } finally {
      setLoading(false);
    }
  }, [claimSysId, isDemo, demoWorkNotes]);

  // Initial fetch and polling
  useEffect(() => {
    fetchWorkNotes();

    // Set up polling
    pollRef.current = setInterval(fetchWorkNotes, POLL_INTERVAL);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [fetchWorkNotes]);

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;

    if (isDemo || !claimSysId) {
      // Demo mode: add locally
      const demoNote = {
        sys_id: `wn-local-${Date.now()}`,
        element: 'work_notes',
        element_id: claimSysId || 'demo',
        name: 'x_dxcis_claims_a_0_claims_fnol',
        value: newNoteText.trim(),
        sys_created_on: new Date().toISOString().replace('T', ' ').substring(0, 19),
        sys_created_by: 'current.user'
      };
      setWorkNotes(prev => [demoNote, ...prev]);
      setNewNoteText('');
      eventBus.publish(EventTypes.WORKNOTE_ADDED, { claimSysId, note: demoNote });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await serviceNowService.addWorkNote(claimSysId, newNoteText.trim());
      setNewNoteText('');

      // Refresh notes to get the newly added one
      await fetchWorkNotes();

      eventBus.publish(EventTypes.WORKNOTE_ADDED, {
        claimSysId,
        noteText: newNoteText.trim()
      });
    } catch (err) {
      console.error('[WorkNotes] Error adding work note:', err);
      setError(`Failed to add work note: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp.replace(' ', 'T'));
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <DxcContainer
      padding="0"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      {/* Header - always visible */}
      <div
        className="worknotes-header"
        onClick={() => setCollapsed(!collapsed)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setCollapsed(!collapsed)}
      >
        <DxcFlex justifyContent="space-between" alignItems="center">
          <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
            <DxcTypography
              fontSize="16px"
              fontWeight="font-weight-semibold"
              color="var(--color-fg-neutral-darkest)"
            >
              {collapsed ? '\u25B6' : '\u25BC'} Work Notes
            </DxcTypography>
            <DxcBadge
              label={String(workNotes.length)}
              notificationBadge
            />
            {fnolNumber && (
              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                {fnolNumber}
              </DxcTypography>
            )}
          </DxcFlex>
          <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
            {loading && (
              <DxcTypography fontSize="12px" color="var(--color-fg-neutral-dark)">
                Refreshing...
              </DxcTypography>
            )}
            <DxcButton
              label="Refresh"
              mode="tertiary"
              size="small"
              icon={iconEl("refresh")}
              onClick={(e) => {
                e.stopPropagation();
                fetchWorkNotes();
              }}
            />
          </DxcFlex>
        </DxcFlex>
      </div>

      {/* Collapsible content */}
      {!collapsed && (
        <DxcInset space="var(--spacing-padding-m)">
          <DxcFlex direction="column" gap="var(--spacing-gap-m)">
            {/* Error display */}
            {error && (
              <DxcAlert
                type="warning"
                inlineText={error}
              />
            )}

            {/* Add Note Section */}
            <DxcContainer
              padding="var(--spacing-padding-m)"
              style={{
                backgroundColor: 'var(--color-bg-neutral-lighter)',
                borderLeft: '3px solid var(--color-fg-secondary-medium)'
              }}
            >
              <DxcFlex direction="column" gap="var(--spacing-gap-s)">
                <DxcTypography
                  fontSize="12px"
                  fontWeight="font-weight-semibold"
                  color="var(--color-fg-neutral-stronger)"
                >
                  ADD WORK NOTE
                </DxcTypography>
                <DxcTextarea
                  label=""
                  placeholder="Enter your work note..."
                  value={newNoteText}
                  onChange={({ value }) => setNewNoteText(value)}
                  rows={3}
                />
                <DxcFlex justifyContent="flex-end">
                  <DxcButton
                    label={submitting ? 'Adding...' : 'Add Note'}
                    mode="primary"
                    size="small"
                    icon={iconEl("send")}
                    onClick={handleAddNote}
                    disabled={!newNoteText.trim() || submitting}
                  />
                </DxcFlex>
              </DxcFlex>
            </DxcContainer>

            {/* Notes List */}
            {loading && workNotes.length === 0 ? (
              <DxcFlex justifyContent="center" alignItems="center" style={{ padding: 'var(--spacing-padding-l)' }}>
                <DxcSpinner label="Loading work notes..." mode="small" />
              </DxcFlex>
            ) : workNotes.length === 0 ? (
              <DxcContainer
                padding="var(--spacing-padding-m)"
                style={{ backgroundColor: 'var(--color-bg-neutral-lighter)' }}
              >
                <DxcTypography
                  fontSize="font-scale-02"
                  color="var(--color-fg-neutral-dark)"
                >
                  No work notes available for this claim.
                </DxcTypography>
              </DxcContainer>
            ) : (
              <div className="worknotes-list">
                {workNotes.map((note, index) => (
                  <DxcContainer
                    key={note.sys_id || index}
                    style={{
                      backgroundColor: 'var(--color-bg-neutral-lighter)',
                      borderLeft: '3px solid var(--color-fg-info-medium)'
                    }}
                  >
                    <DxcInset space="var(--spacing-padding-m)">
                      <DxcFlex direction="column" gap="var(--spacing-gap-xs)">
                        <DxcFlex justifyContent="space-between" alignItems="center">
                          <DxcFlex gap="var(--spacing-gap-s)" alignItems="center">
                            <DxcTypography
                              fontSize="font-scale-02"
                              fontWeight="font-weight-semibold"
                              color="#000000" /* BLOOM: Data values must be black */
                            >
                              {note.sys_created_by || 'Unknown'}
                            </DxcTypography>
                          </DxcFlex>
                          <DxcTypography
                            fontSize="12px"
                            color="var(--color-fg-neutral-dark)"
                          >
                            {formatTimestamp(note.sys_created_on)}
                          </DxcTypography>
                        </DxcFlex>
                        <DxcTypography fontSize="font-scale-03">
                          {note.value || 'No content'}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcInset>
                  </DxcContainer>
                ))}
              </div>
            )}
          </DxcFlex>
        </DxcInset>
      )}
    </DxcContainer>
  );
};

export default WorkNotes;
