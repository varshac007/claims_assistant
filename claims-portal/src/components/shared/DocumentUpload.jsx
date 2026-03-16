/**
 * DocumentUpload Component
 *
 * Drag-and-drop document upload with file validation and preview
 * Features:
 * - Drag-and-drop zone
 * - Multiple file upload
 * - File type validation (PDF, JPG, PNG, etc.)
 * - File size validation (10MB limit)
 * - Upload progress tracking
 * - Preview before submission
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  DxcFlex,
  DxcContainer,
  DxcButton,
  DxcTypography,
  DxcProgressBar,
  DxcAlert,
  DxcInset
} from '@dxc-technology/halstack-react';
import serviceNowService from '../../services/api/serviceNowService';
import idpService from '../../services/api/idpService';
import './DocumentUpload.css';

const DocumentUpload = ({
  claimId,
  tableName = 'x_dxcis_claims_a_0_claims_fnol',
  tableSysId,
  requirementId,
  onUploadComplete,
  acceptedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  maxFileSize = 10 * 1024 * 1024, // 10MB in bytes
  multiple = true
}) => {
  // Use claimId as fallback if tableSysId is not provided
  const actualTableSysId = tableSysId || claimId;

  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState({});
  const [viewerDoc, setViewerDoc] = useState(null);   // { fileName, blobUrl } | null
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState(null);
  const [idpResultsByDoc, setIdpResultsByDoc] = useState({});   // fileName → IDP result
  const [idpPendingDocs, setIdpPendingDocs] = useState({});     // fileName → submissionId
  const [blobUrls, setBlobUrls] = useState({});                 // sys_id → blobUrl | 'error'
  const [blobLoading, setBlobLoading] = useState({});           // sys_id → bool
  const [fieldEdits, setFieldEdits] = useState({});             // `${fileName}__${sec}__${label}` → corrected value
  const fileInputRef = useRef(null);
  const idpPollRef = useRef(null);
  const idpPendingRef = useRef({});  // mirror of idpPendingDocs for use inside interval

  const toggleDoc = (index, attachment) => {
    const willExpand = !expandedDocs[index];
    setExpandedDocs(prev => ({ ...prev, [index]: !prev[index] }));
    if (willExpand && attachment?.sys_id) {
      const sid = attachment.sys_id;
      if (!blobUrls[sid] && !blobLoading[sid]) {
        setBlobLoading(pl => ({ ...pl, [sid]: true }));
        const rawType = attachment.content_type?.display_value || attachment.content_type || 'application/pdf';
        serviceNowService.fetchAttachmentBlob(sid, rawType)
          .then(url => setBlobUrls(bu => ({ ...bu, [sid]: url })))
          .catch(() => setBlobUrls(bu => ({ ...bu, [sid]: 'error' })))
          .finally(() => setBlobLoading(pl => ({ ...pl, [sid]: false })));
      }
    }
  };

  const openViewer = async (attachment) => {
    const fileName = attachment.file_name?.display_value || attachment.file_name || 'Document';
    // Get content_type — may be a display_value object or plain string
    const rawType = attachment.content_type?.display_value || attachment.content_type || 'application/pdf';
    setViewerDoc({ fileName, blobUrl: null });
    setViewerLoading(true);
    setViewerError(null);
    try {
      const blobUrl = await serviceNowService.fetchAttachmentBlob(attachment.sys_id, rawType);
      setViewerDoc({ fileName, blobUrl });
    } catch (err) {
      setViewerError(err.message);
    } finally {
      setViewerLoading(false);
    }
  };

  const closeViewer = () => {
    if (viewerDoc?.blobUrl) URL.revokeObjectURL(viewerDoc.blobUrl);
    setViewerDoc(null);
    setViewerError(null);
  };

  // Parse IDP extraction result from a work note string
  const parseIDPFromWorknote = (noteText) => {
    try {
      if (!noteText || (!noteText.includes('submission_id') && !noteText.includes('Claim form extraction'))) return null;
      const jsonMatch = noteText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      const data = JSON.parse(jsonMatch[0]);
      if (data.submission_id && data.intents) return data;
      return null;
    } catch {
      return null;
    }
  };

  // Scan work notes and update idpResultsByDoc for any matched pending docs
  const scanWorkNotesForIDP = useCallback(async (pendingMap) => {
    if (!actualTableSysId || Object.keys(pendingMap).length === 0) return pendingMap;
    try {
      const notes = await serviceNowService.getWorkNotes(actualTableSysId);
      const newResults = {};
      const stillPending = { ...pendingMap };

      for (const note of notes) {
        const idpData = parseIDPFromWorknote(note.value || '');
        if (!idpData) continue;

        for (const [fileName, submissionId] of Object.entries(pendingMap)) {
          // Match by submission_id
          if (idpData.submission_id === submissionId) {
            newResults[fileName] = idpData;
            delete stillPending[fileName];
            continue;
          }
          // Fallback: match by document name inside the IDP response
          if (idpData.documents?.some(d => d.name === fileName || d.name?.startsWith(fileName.replace(/\.[^.]+$/, '')))) {
            newResults[fileName] = idpData;
            delete stillPending[fileName];
          }
        }
      }

      if (Object.keys(newResults).length > 0) {
        setIdpResultsByDoc(prev => ({ ...prev, ...newResults }));
      }
      return stillPending;
    } catch (err) {
      console.error('[DocumentUpload] IDP work note scan error:', err);
      return pendingMap;
    }
  }, [actualTableSysId]);

  // Start polling work notes for IDP results
  const startIDPPolling = useCallback(() => {
    if (idpPollRef.current) return;
    let attempts = 0;
    const MAX_ATTEMPTS = 24; // 2 min at 5s intervals

    idpPollRef.current = setInterval(async () => {
      attempts++;
      const pending = idpPendingRef.current;

      if (Object.keys(pending).length === 0 || attempts > MAX_ATTEMPTS) {
        clearInterval(idpPollRef.current);
        idpPollRef.current = null;
        if (attempts > MAX_ATTEMPTS) {
          idpPendingRef.current = {};
          setIdpPendingDocs({});
        }
        return;
      }

      const stillPending = await scanWorkNotesForIDP(pending);
      idpPendingRef.current = stillPending;
      setIdpPendingDocs(stillPending);
    }, 5000);
  }, [scanWorkNotesForIDP]);

  // Confidence colour helper
  const confidenceColor = (val) => {
    const n = parseFloat(val);
    if (n >= 0.8) return '#1b7a4b';
    if (n >= 0.6) return '#b45309';
    return '#c0392b';
  };

  // ── Demo IDP fields per document type ──────────────────────
  const getDemoSections = (fileName) => {
    const n = (fileName || '').toLowerCase();
    if (n.includes('death_cert')) return {
      intent: 'death_certificate',
      classification: 'Death Certificate',
      sections: [
        { title: 'Insured Information', fields: [
          { label: 'Full Name',      value: 'Robert Jones',     conf: 0.96 },
          { label: 'Date of Birth',  value: '1958-06-15',       conf: 0.95 },
          { label: 'Date of Death',  value: '2026-01-15',       conf: 0.97 },
          { label: 'Age at Death',   value: '67',               conf: 0.99 },
          { label: 'SSN (last 4)',   value: '****-4821',        conf: 0.93 },
        ]},
        { title: 'Death Information', fields: [
          { label: 'Cause of Death',   value: 'Natural Causes', conf: 0.94 },
          { label: 'Manner of Death',  value: 'Natural',        conf: 0.96 },
          { label: 'State of Death',   value: 'Illinois',       conf: 0.98 },
          { label: 'Place of Death',   value: 'Springfield, IL',conf: 0.91 },
          { label: 'Certificate No.',  value: 'IL-2026-48291',  conf: 0.99 },
        ]},
        { title: 'Verification', fields: [
          { label: 'Source',           value: 'LexisNexis',     conf: 0.99 },
          { label: 'Match Points',     value: 'SSN · Name · DOB', conf: 0.95 },
          { label: 'Issue Date',       value: '2026-01-18',     conf: 0.99 },
        ]},
      ],
    };
    if (n.includes('claimant_statement') || n.includes('claim_form')) return {
      intent: 'claimant_statement',
      classification: 'Claimant Statement',
      sections: [
        { title: 'Policy Information', fields: [
          { label: 'Policy Number',  value: 'POL-847291',          conf: 0.98 },
          { label: 'Policy Type',    value: 'Term Life',           conf: 0.96 },
          { label: 'Insured Name',   value: 'Robert Jones',        conf: 0.95 },
          { label: 'Date of Death',  value: '2026-01-15',          conf: 0.97 },
        ]},
        { title: 'Claimant Information', fields: [
          { label: 'Claimant Name',  value: 'Elizabeth Jones',     conf: 0.94 },
          { label: 'Relationship',   value: 'Spouse',              conf: 0.92 },
          { label: 'Phone',          value: '312-555-0147',        conf: 0.89 },
          { label: 'Email',          value: 'elizabeth.jones@email.com', conf: 0.91 },
        ]},
        { title: 'Checklist', checklist: [
          { label: 'All pages included',     value: true,  conf: 0.88 },
          { label: 'Signature present',      value: false, conf: 0.78 },
          { label: 'Notary stamp visible',   value: false, conf: 0.81 },
          { label: 'Date completed',         value: true,  conf: 0.90 },
        ]},
      ],
    };
    if (n.includes('drivers_license') || n.includes('dl_') || n.includes('photo_id') || n.includes('govt_id')) return {
      intent: 'government_id',
      classification: 'Driver\'s License',
      sections: [
        { title: 'Identity', fields: [
          { label: 'Last Name',    value: 'Jones',            conf: 0.98 },
          { label: 'First Name',   value: 'Elizabeth',        conf: 0.97 },
          { label: 'Date of Birth',value: '1960-03-22',       conf: 0.96 },
          { label: 'DL Number',    value: 'J423-5718-9210',   conf: 0.99 },
          { label: 'Expiry',       value: '2028-03-22',       conf: 0.98 },
          { label: 'State',        value: 'Illinois',         conf: 0.99 },
        ]},
        { title: 'Address', fields: [
          { label: 'Street',       value: '742 Maple Drive',  conf: 0.93 },
          { label: 'City',         value: 'Springfield',      conf: 0.95 },
          { label: 'State',        value: 'IL',               conf: 0.99 },
          { label: 'Zip Code',     value: '62704',            conf: 0.97 },
        ]},
        { title: 'Verification', fields: [
          { label: 'ID Class',     value: 'D — Non-Commercial', conf: 0.99 },
          { label: 'Restrictions', value: 'None',               conf: 0.99 },
        ]},
      ],
    };
    if (n.includes('w9') || n.includes('w-9')) return {
      intent: 'tax_form_w9',
      classification: 'IRS Form W-9',
      sections: [
        { title: 'Taxpayer Information', fields: [
          { label: 'Full Name',        value: 'Elizabeth Jones',          conf: 0.97 },
          { label: 'Business Name',    value: '—',                        conf: 0.99 },
          { label: 'Classification',   value: 'Individual / Sole proprietor', conf: 0.95 },
          { label: 'TIN (SSN)',        value: '***-**-7193',              conf: 0.92 },
          { label: 'Exempt Code',      value: 'None',                     conf: 0.99 },
        ]},
        { title: 'Address', fields: [
          { label: 'Street',           value: '742 Maple Drive',          conf: 0.94 },
          { label: 'City / State / Zip', value: 'Springfield, IL 62704', conf: 0.93 },
        ]},
        { title: 'Certification', checklist: [
          { label: 'TIN is correct',             value: true,  conf: 0.97 },
          { label: 'Not subject to backup withholding', value: true, conf: 0.93 },
          { label: 'Signature present',           value: true,  conf: 0.91 },
        ]},
      ],
    };
    if (n.includes('aps') || n.includes('physician')) return {
      intent: 'attending_physician_statement',
      classification: 'APS — Medical',
      sections: [
        { title: 'Patient', fields: [
          { label: 'Patient Name',   value: 'Robert Jones',    conf: 0.91 },
          { label: 'Date of Birth',  value: '1958-06-15',      conf: 0.88 },
          { label: 'Date of Death',  value: '2026-01-15',      conf: 0.85 },
          { label: 'Date Last Seen', value: '2026-01-14',      conf: 0.79 },
        ]},
        { title: 'Clinical', fields: [
          { label: 'Diagnosis',      value: 'Natural Causes',  conf: 0.72 },
          { label: 'Manner',         value: 'Natural',         conf: 0.74 },
          { label: 'ICD-10 Code',    value: 'R99',             conf: 0.44 },
        ]},
        { title: 'Checklist', checklist: [
          { label: 'Physician signature',  value: true,  conf: 0.67 },
          { label: 'NPI number visible',   value: false, conf: 0.44 },
          { label: 'Legible document',     value: false, conf: 0.44 },
          { label: 'Date completed',       value: true,  conf: 0.71 },
        ]},
      ],
    };
    // Generic
    return {
      intent: 'document',
      classification: 'Uploaded Document',
      sections: [
        { title: 'Document Details', fields: [
          { label: 'File Name',    value: fileName,         conf: 0.99 },
          { label: 'Status',       value: 'Processing…',   conf: null },
        ]},
      ],
    };
  };

  // ── Render right-side staged document preview ────────────────
  const renderDocPreview = (fileName) => {
    const n = (fileName || '').toLowerCase();
    if (n.includes('death_cert')) return (
      <div className="du-staged du-staged-cert">
        <div className="du-staged-cert-hdr">
          <div className="du-staged-cert-seal">⚖️</div>
          <div>
            <div className="du-staged-state">STATE OF ILLINOIS</div>
            <div className="du-staged-title">CERTIFICATE OF DEATH</div>
            <div className="du-staged-sub">Office of Vital Records · File No. IL-2026-48291</div>
          </div>
          <div className="du-staged-cert-seal">⚖️</div>
        </div>
        <div className="du-staged-fields">
          <div className="du-staged-field du-full"><span>Full Legal Name</span><strong>Robert Jones</strong></div>
          <div className="du-staged-field"><span>Date of Birth</span><strong>June 15, 1958</strong></div>
          <div className="du-staged-field"><span>Date of Death</span><strong>January 15, 2026</strong></div>
          <div className="du-staged-field"><span>Age</span><strong>67</strong></div>
          <div className="du-staged-field"><span>Place of Death</span><strong>Springfield, IL</strong></div>
          <div className="du-staged-field du-full"><span>Cause of Death</span><strong>Natural Causes</strong></div>
          <div className="du-staged-field"><span>Manner</span><strong>Natural</strong></div>
          <div className="du-staged-field"><span>Proof Received</span><strong>Jan 18, 2026</strong></div>
        </div>
        <div className="du-staged-cert-footer">
          <div className="du-staged-stamp">✅ CERTIFIED COPY</div>
          <div className="du-staged-sig">
            <div className="du-staged-sig-line" />
            <div>State Registrar of Vital Records</div>
          </div>
        </div>
      </div>
    );
    if (n.includes('claimant_statement') || n.includes('claim_form')) return (
      <div className="du-staged du-staged-form">
        <div className="du-staged-form-hdr">
          <div className="du-staged-form-logo">🌸 Bloom Insurance</div>
          <div>
            <div className="du-staged-title" style={{ textAlign: 'right', fontSize: 13 }}>CLAIMANT'S STATEMENT</div>
            <div className="du-staged-sub" style={{ textAlign: 'right' }}>Form BLM-1042 (Rev. 01/2026)</div>
          </div>
        </div>
        <div className="du-staged-section-label">A. INSURED INFORMATION — THE DECEASED PERSON</div>
        <table className="du-staged-table">
          <tbody>
            <tr><td>Name</td><td><strong>Robert Jones</strong></td><td>Date of Death</td><td><strong>01/15/2026</strong></td></tr>
            <tr><td>Address</td><td colSpan={3}><strong>742 Maple Drive, Springfield, IL 62704</strong></td></tr>
            <tr><td>Date of Birth</td><td><strong>06/15/1958</strong></td><td>Place of Birth</td><td><strong>Chicago, IL</strong></td></tr>
            <tr><td>Cause of Death</td><td><strong>Natural Causes</strong></td><td>Manner</td><td><strong>☑ Natural</strong></td></tr>
          </tbody>
        </table>
        <div className="du-staged-section-label" style={{ marginTop: 10 }}>B. CLAIMANT INFORMATION</div>
        <table className="du-staged-table">
          <tbody>
            <tr><td>Claimant Name</td><td><strong>Elizabeth Jones</strong></td><td>Relationship</td><td><strong>Spouse</strong></td></tr>
            <tr><td>Policy No.</td><td><strong>POL-847291</strong></td><td>Phone</td><td><strong>312-555-0147</strong></td></tr>
          </tbody>
        </table>
        <div className="du-staged-nigo-note">⚠️ IDP: Signature missing on page 3 — confidence 78%</div>
        <div className="du-staged-sig-row">
          <div><div className="du-staged-sig-line" style={{ borderStyle: 'dashed' }} /><div className="du-staged-sig-label">Claimant Signature</div></div>
          <div><div className="du-staged-sig-line" /><div className="du-staged-sig-label">Date</div></div>
        </div>
      </div>
    );
    if (n.includes('drivers_license') || n.includes('dl_') || n.includes('photo_id') || n.includes('govt_id')) return (
      <div className="du-staged du-staged-id">
        <div className="du-staged-id-hdr">
          <span>🇺🇸 ILLINOIS</span><span>DRIVER LICENSE</span>
        </div>
        <div className="du-staged-id-body">
          <div className="du-staged-id-photo">👤</div>
          <div className="du-staged-id-fields">
            <div className="du-staged-id-row"><span>LN</span><strong>JONES</strong></div>
            <div className="du-staged-id-row"><span>FN</span><strong>ELIZABETH</strong></div>
            <div className="du-staged-id-row"><span>DOB</span><strong>03/22/1960</strong></div>
            <div className="du-staged-id-row"><span>EXP</span><strong>03/22/2028</strong></div>
            <div className="du-staged-id-row"><span>DLN</span><strong>J423-5718-9210</strong></div>
            <div className="du-staged-id-row"><span>CLASS</span><strong>D</strong></div>
          </div>
        </div>
        <div className="du-staged-id-addr">742 Maple Drive, Springfield, IL 62704</div>
        <div className="du-staged-id-verified">✅ IDP Verified — 96% confidence · Name & DOB matched</div>
      </div>
    );
    if (n.includes('w9') || n.includes('w-9')) return (
      <div className="du-staged du-staged-irs">
        <div className="du-staged-irs-hdr">
          <div className="du-staged-sub" style={{ color: 'rgba(255,255,255,0.8)' }}>Department of the Treasury — IRS</div>
          <div className="du-staged-title" style={{ fontSize: 22, letterSpacing: 1 }}>Form W-9</div>
          <div className="du-staged-sub" style={{ color: 'rgba(255,255,255,0.85)' }}>Request for Taxpayer Identification Number</div>
        </div>
        <div className="du-staged-fields">
          <div className="du-staged-field du-full"><span>1. Name</span><strong>Elizabeth Jones</strong></div>
          <div className="du-staged-field du-full"><span>2. Business name</span><strong>—</strong></div>
          <div className="du-staged-field"><span>3. Federal tax classification</span><strong>☑ Individual</strong></div>
          <div className="du-staged-field"><span>Part I — SSN</span><strong>***–**–7193</strong></div>
          <div className="du-staged-field du-full"><span>5. Address</span><strong>742 Maple Drive, Springfield, IL 62704</strong></div>
        </div>
        <div className="du-staged-sig-row" style={{ marginTop: 12 }}>
          <div><div className="du-staged-sig-line du-signed">Elizabeth Jones</div><div className="du-staged-sig-label">Signature</div></div>
          <div><div className="du-staged-sig-line" /><div className="du-staged-sig-label">Date</div></div>
        </div>
      </div>
    );
    if (n.includes('aps') || n.includes('physician')) return (
      <div className="du-staged du-staged-medical">
        <div className="du-staged-medical-hdr">
          <div className="du-staged-title" style={{ fontSize: 14, letterSpacing: 1 }}>ATTENDING PHYSICIAN STATEMENT</div>
          <div className="du-staged-sub" style={{ color: 'rgba(255,255,255,0.8)' }}>Life Insurance Claim — Confidential</div>
        </div>
        <div className="du-staged-fields">
          <div className="du-staged-field"><span>Patient Name</span><strong>Robert Jones</strong></div>
          <div className="du-staged-field"><span>Date of Birth</span><strong>1958-06-15</strong></div>
          <div className="du-staged-field"><span>Date of Death</span><strong>2026-01-15</strong></div>
          <div className="du-staged-field du-full"><span>Primary Diagnosis</span><strong>Natural Causes</strong></div>
          <div className="du-staged-field du-full"><span>Manner of Death</span><strong>Natural</strong></div>
        </div>
        <div className="du-staged-nigo-note">⚠️ NIGO: Document quality insufficient. Resubmit at 300 dpi minimum.</div>
      </div>
    );
    return (
      <div className="du-staged du-staged-form" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{fileName}</div>
        <div style={{ fontSize: 11, color: '#888' }}>Document uploaded to claim.<br />Extraction in progress.</div>
      </div>
    );
  };

  // ── Render split-pane extracted + preview ────────────────────
  const renderDocumentSplitView = (fileName, idpData, isPending, sysId, blobUrl, blobIsLoading) => {
    const demoData = getDemoSections(fileName);
    const sections = idpData
      ? (() => {
          // Convert real IDP data to section format
          const fields = idpData.intents?.[0]?.data || {};
          const intent = idpData.intents?.[0]?.intent || '';
          const personal = [], checklist = [];
          for (const [key, meta] of Object.entries(fields)) {
            if (key === 'headers' || typeof meta !== 'object' || meta === null) continue;
            const label = key.replace(/_/g, ' ');
            const conf = parseFloat(meta.confidence ?? '0');
            if (key.startsWith('Checklist_')) checklist.push({ label: label.replace('Checklist ', ''), value: meta.value === 'True', conf });
            else personal.push({ label, value: meta.value ?? '', conf });
          }
          const result = [{ title: 'Extracted Information', fields: personal }];
          if (checklist.length) result.push({ title: 'Checklist', checklist });
          return { intent: idpData.intents?.[0]?.intent || '', classification: idpData.documents?.[0]?.classification || '', sections: result };
        })()
      : demoData;

    const hasEdits = Object.keys(fieldEdits).some(k => k.startsWith(`${fileName}__`));
    const handleSaveEdits = () => {
      setFieldEdits(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => { if (k.startsWith(`${fileName}__`)) delete next[k]; });
        return next;
      });
    };

    return (
      <div className="du-split">
        {/* LEFT: Fields */}
        <div className="du-split__fields">
          <div className="du-split__fields-hdr">
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#0067b3' }}>smart_toy</span>
            <span className="du-split__fields-title">Extracted Fields</span>
            {sections.intent && <span className="du-split__badge du-split__badge--intent">{sections.intent.replace(/_/g, ' ')}</span>}
            {sections.classification && <span className="du-split__badge du-split__badge--class">{sections.classification}</span>}
            {isPending && !idpData && <span className="du-split__badge du-split__badge--processing">⏳ Processing…</span>}
            {hasEdits && (
              <button className="du-split__save-btn" onClick={handleSaveEdits}>
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>save</span>
                Save
              </button>
            )}
          </div>

          {sections.sections.map((sec, si) => (
            <div key={si} className="du-split__section">
              <div className="du-split__section-title">{sec.title}</div>
              {sec.fields?.map((f, fi) => {
                const editKey = `${fileName}__${sec.title}__${f.label}`;
                return (
                  <div key={fi} className="du-split__field">
                    <span className="du-split__field-label">{f.label}</span>
                    <input
                      className="du-split__field-input"
                      value={fieldEdits[editKey] !== undefined ? fieldEdits[editKey] : (f.value || '')}
                      onChange={e => setFieldEdits(prev => ({ ...prev, [editKey]: e.target.value }))}
                    />
                    {f.conf != null && (
                      <span className="du-split__conf" style={{ color: confidenceColor(f.conf) }}>
                        {Math.round(f.conf * 100)}%
                      </span>
                    )}
                  </div>
                );
              })}
              {sec.checklist?.map((f, fi) => (
                <div key={fi} className="du-split__check-row">
                  <span className={`du-split__check-icon ${f.value ? 'du-split__check-icon--yes' : 'du-split__check-icon--no'}`}>
                    <span className="material-symbols-outlined">{f.value ? 'check_circle' : 'cancel'}</span>
                  </span>
                  <span className="du-split__check-label">{f.label}</span>
                  {f.conf != null && (
                    <span className="du-split__conf" style={{ color: confidenceColor(f.conf) }}>
                      {Math.round(f.conf * 100)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* RIGHT: Document Preview */}
        <div className="du-split__preview">
          <div className="du-split__preview-hdr">
            <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#555' }}>description</span>
            Source Document — {fileName}
          </div>
          <div className={`du-split__preview-body${blobUrl && blobUrl !== 'error' ? ' du-split__preview-body--iframe' : ''}`}>
            {blobIsLoading ? (
              <div className="du-split__preview-loading">
                <span className="material-symbols-outlined du-split__preview-spin">sync</span>
                Loading document…
              </div>
            ) : blobUrl && blobUrl !== 'error' ? (
              <iframe src={blobUrl} className="du-split__preview-iframe" title={fileName} />
            ) : blobUrl === 'error' ? (
              <div className="du-split__preview-error">
                <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 6 }}>error_outline</span>
                Unable to load document
              </div>
            ) : (
              renderDocPreview(fileName)
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render IDP extracted fields — matches screenshot layout
  const renderIDPFields = (idpData) => {
    const fields = idpData.intents?.[0]?.data || {};
    const intent = idpData.intents?.[0]?.intent || '';
    const personal = [];
    const checklist = [];

    for (const [key, meta] of Object.entries(fields)) {
      if (key === 'headers') continue;
      if (typeof meta !== 'object' || meta === null) continue;
      const label = key.replace(/_/g, ' ');
      const conf = parseFloat(meta.confidence ?? '0');
      const entry = { key, label, value: meta.value ?? '', confidence: conf };
      if (key.startsWith('Checklist_')) checklist.push(entry);
      else personal.push(entry);
    }

    return (
      <div className="doc-idp-results">
        {/* Header bar */}
        <div className="doc-idp-header">
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="doc-idp-header-title">Extracted Fields</span>
          {intent && <span className="doc-idp-intent">{intent.replace(/_/g, ' ')}</span>}
          {idpData.documents?.[0]?.classification && (
            <span className="doc-idp-classification">{idpData.documents[0].classification}</span>
          )}
        </div>

        {/* Extracted information */}
        {personal.length > 0 && (
          <div className="doc-idp-section">
            <div className="doc-idp-section-title">Extracted Information</div>
            <div className="doc-idp-fields">
              {personal.map(f => (
                <div key={f.key} className="doc-idp-field">
                  <span className="doc-idp-field-label">{f.label}:</span>
                  <span className="doc-idp-field-value">{f.value || '—'}</span>
                  <span className="doc-idp-confidence" style={{ color: confidenceColor(f.confidence) }}>
                    {Math.round(f.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist items */}
        {checklist.length > 0 && (
          <div className="doc-idp-section">
            <div className="doc-idp-section-title">Checklist Items</div>
            <div className="doc-idp-checklist">
              {checklist.map(f => (
                <div key={f.key} className="doc-idp-checklist-item">
                  <span className={`doc-idp-check-icon ${f.value === 'True' ? 'doc-idp-check-icon--yes' : 'doc-idp-check-icon--no'}`}>
                    <span className="material-symbols-outlined">{f.value === 'True' ? 'check_circle' : 'cancel'}</span>
                  </span>
                  <span className="doc-idp-checklist-label">
                    {f.label.replace('Checklist ', '')}:
                  </span>
                  <span className="doc-idp-confidence" style={{ color: confidenceColor(f.confidence) }}>
                    {Math.round(f.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (idpPollRef.current) clearInterval(idpPollRef.current);
    };
  }, []);

  // Debug: Log props on mount and changes
  useEffect(() => {
    console.log('[DocumentUpload] Component mounted/updated');
    console.log('[DocumentUpload] Props:', { claimId, tableName, tableSysId, requirementId });
  }, [claimId, tableName, tableSysId, requirementId]);

  // Load existing attachments on mount
  useEffect(() => {
    console.log('[DocumentUpload] Checking if should load attachments:', { actualTableSysId, tableName });
    if (actualTableSysId && tableName) {
      console.log('[DocumentUpload] Loading attachments...');
      loadExistingAttachments();
    } else {
      console.warn('[DocumentUpload] Cannot load attachments - missing actualTableSysId or tableName');
    }
  }, [actualTableSysId, tableName]);

  // Load existing attachments from ServiceNow
  const loadExistingAttachments = async () => {
    try {
      setLoadingAttachments(true);
      const attachments = await serviceNowService.getAttachments(tableName, actualTableSysId);
      setExistingAttachments(attachments);

      // Scan work notes for any existing IDP results for these attachments
      if (attachments.length > 0 && actualTableSysId) {
        const fileNames = attachments.reduce((acc, a) => {
          const name = a.file_name?.display_value || a.file_name || '';
          if (name) acc[name] = name; // use file name as both key and placeholder submissionId
          return acc;
        }, {});
        await scanWorkNotesForIDP(fileNames);
      }
    } catch (err) {
      console.error('Error loading attachments:', err);
    } finally {
      setLoadingAttachments(false);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate file type
  const isValidFileType = (file) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return acceptedFileTypes.includes(fileExtension);
  };

  // Validate file size
  const isValidFileSize = (file) => {
    return file.size <= maxFileSize;
  };

  // Handle file validation
  const validateFiles = (fileList) => {
    const validFiles = [];
    const errors = [];

    Array.from(fileList).forEach(file => {
      if (!isValidFileType(file)) {
        errors.push(`${file.name}: Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`);
      } else if (!isValidFileSize(file)) {
        errors.push(`${file.name}: File size exceeds ${formatFileSize(maxFileSize)} limit`);
      } else {
        validFiles.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        });
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return [];
    }

    return validFiles;
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(e.dataTransfer.files);
      if (validFiles.length > 0) {
        if (multiple) {
          setFiles(prev => [...prev, ...validFiles]);
        } else {
          setFiles(validFiles);
        }
      }
    }
  };

  // Handle file input change
  const handleFileInput = (e) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(e.target.files);
      if (validFiles.length > 0) {
        if (multiple) {
          setFiles(prev => [...prev, ...validFiles]);
        } else {
          setFiles(validFiles);
        }
      }
    }
  };

  // Remove file from list
  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL if it exists
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Upload files to ServiceNow and trigger IDP processing
  const handleUpload = async () => {
    console.log('[DocumentUpload] handleUpload called');
    console.log('[DocumentUpload] actualTableSysId:', actualTableSysId);
    console.log('[DocumentUpload] tableName:', tableName);
    console.log('[DocumentUpload] files:', files);

    if (files.length === 0) {
      console.error('[DocumentUpload] No files selected');
      return;
    }
    if (!actualTableSysId || !tableName) {
      const errorMsg = `Missing required parameters: actualTableSysId=${actualTableSysId}, tableName=${tableName}`;
      console.error('[DocumentUpload]', errorMsg);
      setError(errorMsg);
      alert(errorMsg); // Show alert for immediate feedback
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploadResults = [];
      const totalFiles = files.length;
      let completedServiceNowUploads = 0;
      let completedIDPUploads = 0;

      // Step 1: Upload all files to ServiceNow in parallel (faster!)
      // This triggers BOTH: ServiceNow attachment + docintel_attachment flag (old flow)
      console.log('[DocumentUpload] ========================================');
      console.log('[DocumentUpload] DUAL FLOW MODE: Running both DocIntel (old) + IDP (new)');
      console.log('[DocumentUpload] ========================================');
      console.log('[DocumentUpload] Step 1: Uploading', totalFiles, 'file(s) to ServiceNow in parallel...');
      console.log('[DocumentUpload] → This will set docintel_attachment flag (triggers old DocIntel flow)');
      const snowPromises = files.map(async (fileData) => {
        try {
          const result = await serviceNowService.uploadDocument(
            fileData.file,
            tableName,
            actualTableSysId
          );
          completedServiceNowUploads++;
          setUploadProgress(Math.round((completedServiceNowUploads / totalFiles) * 50)); // 0-50%
          return { success: true, fileName: fileData.name, result };
        } catch (error) {
          completedServiceNowUploads++;
          setUploadProgress(Math.round((completedServiceNowUploads / totalFiles) * 50));
          return { success: false, fileName: fileData.name, error: error.message };
        }
      });

      const snowResults = await Promise.all(snowPromises);
      console.log('[DocumentUpload] ServiceNow uploads complete:', snowResults);

      // Step 2 & 3: Send all files to IDP for processing in parallel (faster!)
      console.log('[DocumentUpload] Step 2 & 3: Sending', totalFiles, 'file(s) to IDP in parallel...');
      console.log('[DocumentUpload] → IDP will process and callback to ServiceNow (new IDP flow)');
      const idpFilesToUpload = files
        .map(f => f.file)
        .filter((file, index) => snowResults[index].success); // Only process files that uploaded to ServiceNow

      let idpResults = [];
      if (idpFilesToUpload.length > 0) {
        try {
          idpResults = await idpService.uploadAndProcessBatch(
            idpFilesToUpload,
            actualTableSysId,
            (completed, total) => {
              completedIDPUploads = completed;
              // Progress: 50-100% (50% for ServiceNow done, 50% for IDP)
              setUploadProgress(50 + Math.round((completed / total) * 50));
            }
          );
          console.log('[DocumentUpload] IDP batch processing complete:', idpResults);
        } catch (idpError) {
          console.warn('[DocumentUpload] IDP batch processing failed (non-fatal):', idpError);
          // Create failed results for all IDP uploads
          idpResults = idpFilesToUpload.map(file => ({
            success: false,
            fileName: file.name,
            error: idpError.message
          }));
        }
      }

      // Combine results
      let idpIndex = 0;
      for (let i = 0; i < snowResults.length; i++) {
        const snowResult = snowResults[i];

        if (snowResult.success) {
          const idpResult = idpResults[idpIndex++];

          uploadResults.push({
            success: true,
            fileName: snowResult.fileName,
            attachmentSysId: snowResult.result.attachmentSysId,
            idpProcessing: idpResult?.success ? {
              submissionId: idpResult.submissionId,
              status: 'processing'
            } : {
              status: 'failed',
              error: idpResult?.error || 'IDP processing not available'
            }
          });
        } else {
          uploadResults.push({
            success: false,
            fileName: snowResult.fileName,
            error: snowResult.error
          });
        }
      }

      // Check for any failed uploads
      const failedUploads = uploadResults.filter(r => !r.success);
      if (failedUploads.length > 0) {
        setError(`Failed to upload ${failedUploads.length} file(s): ${failedUploads.map(f => f.fileName).join(', ')}`);
      }

      // Call success callback
      if (onUploadComplete) {
        onUploadComplete({
          claimId,
          requirementId,
          tableSysId: actualTableSysId,
          results: uploadResults,
          totalFiles: totalFiles,
          successCount: uploadResults.filter(r => r.success).length
        });
      }

      // Reload existing attachments to show newly uploaded files
      await loadExistingAttachments();

      // Start polling work notes for IDP extraction results
      const newPending = {};
      uploadResults.forEach(r => {
        if (r.success && r.idpProcessing?.submissionId) {
          newPending[r.fileName] = r.idpProcessing.submissionId;
        }
      });
      if (Object.keys(newPending).length > 0) {
        idpPendingRef.current = { ...idpPendingRef.current, ...newPending };
        setIdpPendingDocs(prev => ({ ...prev, ...newPending }));
        startIDPPolling();
      }

      // Clear files after successful upload
      files.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setFiles([]);
      setUploadProgress(0);

      // Show success message if all uploaded successfully
      if (failedUploads.length === 0) {
        console.log(`Successfully uploaded ${totalFiles} file(s) to ServiceNow`);
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Delete attachment from ServiceNow
  const handleDeleteAttachment = async (attachmentSysId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await serviceNowService.deleteAttachment(attachmentSysId);
      console.log('Attachment deleted:', fileName);

      // Reload attachments
      await loadExistingAttachments();
    } catch (err) {
      console.error('Error deleting attachment:', err);
      setError(`Failed to delete ${fileName}: ${err.message}`);
    }
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <DxcContainer
      padding="var(--spacing-padding-l)"
      style={{ backgroundColor: 'var(--color-bg-neutral-lightest)' }}
    >
      <DxcFlex direction="column" gap="var(--spacing-gap-m)">
        {/* Debug Info - Remove in production */}
        {(!actualTableSysId || !tableName) && (
          <DxcAlert
            type="warning"
            inlineText={`Configuration Issue: ${!actualTableSysId ? 'tableSysId is missing' : ''} ${!tableName ? 'tableName is missing' : ''}`}
          />
        )}

        {/* Upload Zone */}
        <div
          className={`document-upload-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <DxcFlex direction="column" gap="var(--spacing-gap-m)" alignItems="center">
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '48px',
                color: dragActive ? 'var(--color-fg-secondary-medium)' : 'var(--color-fg-neutral-dark)'
              }}
            >
              cloud_upload
            </span>
            <DxcFlex direction="column" gap="var(--spacing-gap-xs)" alignItems="center">
              <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
                {dragActive ? 'Drop files here' : 'Drag and drop files here'}
              </DxcTypography>
              <DxcTypography fontSize="12px" color="#000000">
                or
              </DxcTypography>
              <DxcButton
                label="Browse Files"
                mode="secondary"
                size="small"
                onClick={handleBrowseClick}
                disabled={uploading}
              />
            </DxcFlex>
            <DxcTypography fontSize="12px" color="#000000">
              Accepted: {acceptedFileTypes.join(', ')} • Max size: {formatFileSize(maxFileSize)}
            </DxcTypography>
          </DxcFlex>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes.join(',')}
            multiple={multiple}
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>

        {/* Error Display */}
        {error && (
          <DxcAlert
            type="error"
            inlineText={error}
            onClose={() => setError(null)}
          />
        )}

        {/* File List */}
        {files.length > 0 && (
          <DxcFlex direction="column" gap="var(--spacing-gap-s)">
            <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
              Selected Files ({files.length})
            </DxcTypography>
            {files.map((file, index) => (
              <DxcContainer
                key={index}
                style={{
                  backgroundColor: 'var(--color-bg-neutral-lightest)',
                  border: '1px solid var(--border-color-neutral-lighter)'
                }}
              >
                <DxcInset space="var(--spacing-padding-s)">
                  <DxcFlex justifyContent="space-between" alignItems="center">
                    <DxcFlex gap="var(--spacing-gap-m)" alignItems="center">
                      {/* Preview thumbnail for images */}
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      ) : (
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '48px', color: 'var(--color-fg-neutral-dark)' }}
                        >
                          description
                        </span>
                      )}
                      <DxcFlex direction="column" gap="var(--spacing-gap-xxs)">
                        <DxcTypography fontSize="font-scale-02" fontWeight="font-weight-semibold">
                          {file.name}
                        </DxcTypography>
                        <DxcTypography fontSize="12px" color="#000000">
                          {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                        </DxcTypography>
                      </DxcFlex>
                    </DxcFlex>
                    {!uploading && (
                      <DxcButton
                        label="Remove"
                        mode="tertiary"
                        size="small"
                        onClick={() => removeFile(index)}
                      />
                    )}
                  </DxcFlex>
                </DxcInset>
              </DxcContainer>
            ))}
          </DxcFlex>
        )}

        {/* Upload Progress */}
        {uploading && (
          <DxcProgressBar
            label="Uploading files..."
            value={uploadProgress}
            showValue
          />
        )}

        {/* Action Buttons */}
        {files.length > 0 && !uploading && (
          <DxcFlex justifyContent="flex-end" gap="var(--spacing-gap-s)">
            <DxcButton
              label="Clear All"
              mode="secondary"
              onClick={() => {
                files.forEach(f => {
                  if (f.preview) URL.revokeObjectURL(f.preview);
                });
                setFiles([]);
                setError(null);
              }}
            />
            <DxcButton
              label={`Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
              mode="primary"
              onClick={handleUpload}
            />
          </DxcFlex>
        )}

        {/* Existing Attachments from ServiceNow */}
        {existingAttachments.length > 0 && (
          <div className="doc-list">
            <DxcTypography fontSize="font-scale-03" fontWeight="font-weight-semibold">
              Uploaded Documents ({existingAttachments.length})
            </DxcTypography>
            {existingAttachments.map((attachment, index) => {
              const fileName = attachment.file_name?.display_value || attachment.file_name || 'Unknown';
              const fileSize = attachment.size_bytes ? formatFileSize(parseInt(attachment.size_bytes)) : 'Size unknown';
              const fileDate = attachment.sys_created_on ? new Date(attachment.sys_created_on).toLocaleDateString() : 'Date unknown';
              const fileType = attachment.content_type || attachment.file_name?.split('.').pop()?.toUpperCase() || 'FILE';
              const isExpanded = !!expandedDocs[index];

              return (
                <div key={index} className={`doc-row ${isExpanded ? 'doc-row--expanded' : ''}`}>
                  {/* Row Header */}
                  <div className="doc-row__header" onClick={() => toggleDoc(index, attachment)}>
                    <button className={`doc-row__chevron ${isExpanded ? 'doc-row__chevron--open' : ''}`}>
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                    <span className="material-symbols-outlined doc-row__icon">description</span>
                    <span className="doc-row__name">{fileName}</span>
                    <span className="doc-row__meta">{fileSize} • {fileDate}</span>
                    <button
                      className="doc-row__delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAttachment(attachment.sys_id, fileName);
                      }}
                      title="Delete"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>

                  {/* Expanded Details — split-pane: left = extracted fields, right = document preview */}
                  {isExpanded && (
                    <div className="doc-row__expanded">
                      {renderDocumentSplitView(
                        fileName,
                        idpResultsByDoc[fileName],
                        !!idpPendingDocs[fileName],
                        attachment.sys_id,
                        blobUrls[attachment.sys_id],
                        !!blobLoading[attachment.sys_id]
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {loadingAttachments && (
          <DxcFlex justifyContent="center">
            <DxcTypography fontSize="12px" color="#000000">
              Loading existing documents...
            </DxcTypography>
          </DxcFlex>
        )}
      </DxcFlex>

    </DxcContainer>
  );
};

export default DocumentUpload;
