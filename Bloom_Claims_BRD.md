# Bloom Claims Assistant Portal — Business Requirements Document (BRD)

**Client:** Bloom Insurance
**Author:** DXC Technology — Smart Apps
**Version:** 0.1 (Draft)
**Date:** March 17, 2026
**Status:** Draft

---

## Document Control

| Version | Date | Author | Description |
|---|---|---|---|
| 0.1 | March 17, 2026 | DXC Smart Apps | Initial draft |

---

## Executive Summary

Bloom Insurance's existing ServiceNow portal presents significant friction for claims examiners managing life and annuity claims. The legacy interface requires manual data re-entry from paper documents — including death certificates, government IDs, and ACORD forms — and provides no consolidated view of beneficiary conflicts, related policies, or SLA status. Claims supervisors and managers lack real-time analytics, making it difficult to identify at-risk claims, monitor team performance, or respond to SLA breaches before they occur. These inefficiencies drive up processing costs, slow claim resolution for beneficiaries, and create compliance exposure.

The proposed solution is the **Bloom Claims Assistant Portal** — a modern React 18 + MUI v5 portal serving as the **System of Engagement**, layered over ServiceNow FSO (Financial Services Operations) as the **System of Action**. The portal embeds AI-powered insights, intelligent document processing (IDP), and FastTrack/Straight-Through Processing (STP) routing throughout the full claims lifecycle — from First Notice of Loss (FNOL) through payment authorization. All data and business logic remain in ServiceNow FSO; the React portal provides a purpose-built, role-aware interface that surfaces the right information at the right time.

The expected business value is substantial: a **30% reduction in average claim processing time**, a **40%+ FastTrack routing rate** for eligible claims, and the **elimination of manual document re-keying** through IDP auto-population. Every claim will carry full SLA visibility with on-track, at-risk, and overdue indicators, enabling proactive management intervention. AI-powered beneficiary conflict analysis is projected to reduce resolution time by **50%**, and the manager dashboard will provide real-time written premium, approval/decline, and SLA compliance metrics that currently require manual report generation.

---

## Business Objectives

1. **Reduce average claim processing time by 30%** — achieved through IDP auto-population, FastTrack/STP routing, and AI-driven triage
2. **Eliminate manual document re-keying** — intelligent document processing extracts and auto-populates claim fields from uploaded death certificates, IDs, and ACORD forms
3. **Achieve FastTrack/STP routing for 40%+ of eligible claims** — rules-based routing engine bypasses non-essential requirements for low-risk, straightforward claims
4. **Provide 100% SLA visibility across all open claims** — every claim displays on-track/at-risk/overdue status with days remaining
5. **Reduce beneficiary conflict resolution time by 50%** — AI-powered beneficiary analyzer surfaces conflicts and recommends resolution paths at claim open
6. **Enable real-time management analytics** — manager dashboard provides written premium YTD, approval/decline rates, SLA compliance, and anomaly trends

---

## Stakeholders

| Role | Name | Department | Influence |
|---|---|---|---|
| Claims Examiner | | Claims Operations | High |
| Claims Supervisor | | Claims Operations | High |
| Claims Manager | | Claims Operations | High |
| Intake Specialist / CSR | | Customer Service | Medium |
| IT / ServiceNow Admin | | Information Technology | High |
| Compliance Officer | | Legal & Compliance | Medium |
| Project Sponsor | | Executive | High |

---

## Business Requirements

> **Priority Key:** Must Have = required for go-live · Should Have = important but deferrable · Nice to Have = future enhancement

### BR-100s: Authentication & Access Control

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-101 | The system must authenticate users via ServiceNow OAuth 2.0 | Must Have | OAuth flow redirects to ServiceNow login; JWT token stored securely; session expires after inactivity timeout |
| BR-102 | The system must enforce role-based access control for Examiner, Supervisor, Manager, and Intake Specialist roles | Must Have | Each role sees only permitted navigation items, data, and actions; unauthorized routes redirect to dashboard |
| BR-103 | The system must display only features and data permitted for the authenticated user's role | Must Have | Examiner cannot access manager analytics; intake specialist cannot access workbench; enforced on every page load |
| BR-104 | The system must support demo persona switching for training and demonstrations | Must Have | Persona switcher visible in demo mode; switching loads correct dashboard/permissions; demo badge displayed when active |

### BR-200s: Claims Dashboard & Search

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-201 | Claims examiners must see only their assigned claims on the dashboard | Must Have | Claims filtered by assigned examiner on login; claim count displayed; loads within 3 seconds |
| BR-202 | Claims supervisors must see their full team's claim queue | Must Have | All team claims visible regardless of individual assignment; filterable by examiner; team SLA metrics displayed |
| BR-203 | Claims managers must see all claims with risk and performance analytics | Must Have | Manager dashboard shows written premium YTD, approval/decline rates, SLA compliance %, FastTrack %; date range and product line filters |
| BR-204 | All users must be able to search claims by: claim ID, insured name, policy number, status, and date range | Must Have | Search returns results within 2 seconds; partial name/ID match supported; empty-state message displayed when no results |
| BR-205 | The dashboard must display SLA status for each claim (on-track, at-risk, overdue) | Must Have | Green/amber/red status badges per claim; days remaining shown; tooltip explains SLA rule |
| BR-206 | The dashboard must display FastTrack/STP eligibility badge per claim | Must Have | FastTrack badge shown for eligible claims; STP badge for fully automated; badge links to eligibility criteria |

### BR-300s: Claims Workbench

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-301 | The workbench must provide a Timeline tab with full claim audit trail | Must Have | All events shown chronologically; each event has timestamp, actor, description; scrollable; printable |
| BR-302 | The workbench must provide a Policy 360 tab with policy details and beneficiary allocations | Must Have | Shows: policy number, type, status, effective/term dates, face amount, riders, beneficiary list with allocation %; sourced from ServiceNow FSO |
| BR-303 | The workbench must provide a Requirements tab with IGO tracking | Must Have | Requirements listed with status (Pending/Received/In Progress/Complete); status updatable; received date auto-stamped; IGO flag visible |
| BR-304 | The workbench must provide a Documents tab with upload, view, and classification | Must Have | Documents grouped by type in accordion; each shows name, type, upload date; in-panel viewer; upload button available |
| BR-305 | The workbench must display a claim progress percentage | Must Have | Progress % calculated from completed requirements and steps; displayed at top of workbench; updates on requirement completion |
| BR-306 | Examiners must be able to Approve, Deny, or Hold a claim from the workbench | Must Have | Action buttons in workbench header; confirm dialog before action; status updates in ServiceNow; audit trail entry created |
| BR-307 | The workbench must support threaded Work Notes with author and timestamp | Must Have | Notes threaded by date; shows author name and timestamp; rich text entry; notes sync to ServiceNow |

### BR-400s: FNOL & Intake

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-401 | The system must provide a 3-step FNOL wizard: claim information, claimant information, and document upload | Must Have | Cannot advance to next step with validation errors; progress indicator shows current step; back navigation supported |
| BR-402 | FNOL form must validate all required fields in real time before submission | Must Have | Inline error messages on blur; submit blocked until all required fields valid; error summary at top on attempted invalid submit |
| BR-403 | FNOL submission must create a claim record in ServiceNow FSO | Must Have | Record created in sn_insurance_claim table; all FNOL fields mapped; status set to "New"; examiner auto-assigned per routing rules |
| BR-404 | FNOL submission must trigger LexisNexis death verification | Should Have | Verification API called on submit; status stored on claim record; examiner notified of result; stub mode available before credentials configured |
| BR-405 | Document upload must support drag-and-drop and accept PDF, JPG, and PNG formats up to 25MB | Must Have | Drag-and-drop zone with format/size validation; upload progress shown; uploaded files listed with remove option |
| BR-406 | The system must generate and display a claim number upon successful FNOL submission | Must Have | Claim number displayed on confirmation screen; next-steps message shown; option to print or email confirmation |

### BR-500s: Death Claim Processing

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-501 | The system must capture: date/time of death, manner of death, state, death in USA flag, proof of death date, and incident description | Must Have | All fields available in Death Event Panel; saves to ServiceNow death case record; each edit creates audit log entry |
| BR-502 | Death verification status from LexisNexis must be stored on the claim record | Should Have | Verification status (Verified/Unverified/Pending) stored on claim; timestamp of last verification recorded |
| BR-503 | Death case records must auto-load from ServiceNow when a claim is opened | Must Have | Death case record fetched on workbench open; populated into Death Event Panel; error state shown if no record found |

### BR-600s: Beneficiary & Party Management

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-601 | The system must display all beneficiaries with: name, masked SSN, relationship, allocation %, birth date, and status | Must Have | SSN displayed as \*\*\*-\*\*-XXXX by default; reveal on icon click; data sourced from ServiceNow FSO party records |
| BR-602 | Examiners must be able to add, edit, and update parties (insured, claimant, beneficiary) | Must Have | Party form with: name, SSN, DOB, relationship, contact info; validates required fields; saves to ServiceNow; audit trail entry created |
| BR-603 | The system must trigger AI beneficiary conflict analysis and display results | Must Have | Analysis auto-triggers on workbench open; findings show conflict description, severity, and recommended resolution; examiner can acknowledge with note |
| BR-604 | Beneficiary conflicts must display severity level (HIGH, MEDIUM, LOW) and recommended resolution | Must Have | HIGH shown as red alert; MEDIUM as amber warning; LOW as informational; counts shown in workbench header badge |

### BR-700s: Intelligent Document Processing

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-701 | The system must automatically classify uploaded documents by type (death certificate, government ID, ACORD form, etc.) | Must Have | Classification runs within 30 seconds of upload; document type label applied; confidence score shown; examiner can correct classification |
| BR-702 | The system must extract key fields from uploaded documents using OCR | Must Have | Extracted fields displayed alongside source document; each field shows confidence %; unmapped fields flagged for manual review |
| BR-703 | Extracted fields must display confidence scores | Must Have | Confidence % shown per field; fields below 70% threshold highlighted for review; overall document confidence score displayed |
| BR-704 | The system must auto-populate claim form fields from extracted document data | Must Have | Auto-populated fields highlighted in form; examiner reviews and confirms or edits; confirmation required before saving |
| BR-705 | Examiners must be able to review and override any auto-populated data | Must Have | All auto-populated fields editable; override saves new value and logs original extraction value in audit |

### BR-800s: AI Insights & Anomaly Detection

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-801 | The system must display an AI Insights panel on the Claims Workbench | Must Have | AI panel visible on workbench; shows overall risk level (HIGH/MEDIUM/LOW/CLEAR); expandable to full modal; loads within 5 seconds |
| BR-802 | AI analysis must return risk findings categorized as HIGH, MEDIUM, or LOW severity | Must Have | Each finding includes: severity badge, title, evidence bullets, recommended action, PASS/FAIL indicator |
| BR-803 | Each AI finding must include a description, supporting evidence, and recommended action | Must Have | Finding card shows all three elements; examiner can dismiss finding with note; dismissed findings visible in audit trail |
| BR-804 | The AI must generate a plain-language claim summary | Must Have | Summary paragraph auto-generated; includes: insured name, claim type, amount, key dates, active risk count; refreshes when claim data changes |
| BR-805 | The AI must flag anomalies including: policy age at death, claim amount outliers, and beneficiary changes near date of death | Must Have | Anomaly types configurable in rules engine; each flag includes specific evidence from claim data |

### BR-900s: Related Policies

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-901 | The system must automatically search for other policies on the deceased insured when a claim is opened | Must Have | Search triggers on claim open; finds policies by insured SSN and name match; results shown in Related Policies panel |
| BR-902 | The system must display total aggregated death benefit across all related policies | Must Have | Total death benefit sum displayed prominently; breakdown by policy shown; cash values and loan balances noted |
| BR-903 | The system must alert the examiner when related policies are discovered | Must Have | Alert banner shown when related policies found; persists until acknowledged; count of related policies shown |
| BR-904 | Examiners must be able to initiate a new claim from the related policies panel | Must Have | "Initiate Claim" button per related policy; pre-populates FNOL with insured and policy data; opens FNOL in new tab or modal |

### BR-1000s: Requirements Engine

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-1001 | The system must auto-generate claim requirements based on claim type, policy type, state of loss, and claim amount | Must Have | Requirements generated at claim creation; list appears in Requirements tab; each defaults to Pending status |
| BR-1002 | Examiners must be able to update requirement status as items are received | Must Have | Status dropdown: Pending, Received, In Progress, Complete; received date auto-stamped on status change to Received; progress bar updates |
| BR-1003 | FastTrack-eligible claims must have non-essential requirements automatically waived | Must Have | Waived requirements marked "Waived — STP" with reason; examiner can override waiver; audit trail records waiver decision |

### BR-1100s: Financial Calculations

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-1101 | The system must provide a PMI calculator | Should Have | Inputs: loan amount, property value, interest rate, loan term; outputs: monthly payment, P&I split, LTV ratio; results copyable to clipboard |
| BR-1102 | The system must provide a tax withholding calculator | Should Have | Inputs: gross benefit amount, federal/state withholding rates; outputs: federal tax, state tax, net benefit; state dropdown pre-loaded with all 50 states |
| BR-1103 | The system must display a payment quick view with disbursement summary and authorization action | Should Have | Shows: payee, amount, payment method, status; Authorize button sends approval to ServiceNow; payment execution by external system only |

### BR-1200s: Analytics & Reporting

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-1201 | The manager dashboard must display: written premium YTD, approval/decline rates, SLA trends, and FastTrack % | Must Have | All metrics visible on manager dashboard; date range filterable; updates on filter change |
| BR-1202 | The reports module must support export to CSV | Should Have | Export button generates CSV of current filtered results; filename includes date and filter context |
| BR-1203 | All dashboards must support filtering by date range, product line (L&A / P&C), examiner, and claim status | Must Have | Filter panel on each dashboard; filters persist for session; "Clear Filters" button resets all |

### BR-1300s: Non-Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| BR-1301 | The portal must achieve WCAG 2.1 AA accessibility compliance | Must Have | Accessibility audit passes; all interactive elements keyboard navigable; screen reader compatible; color contrast ratios meet AA standard |
| BR-1302 | The portal must support Chrome, Edge, and Safari (latest 2 major versions) | Must Have | E2E tests pass on all 3 browsers; no layout breaks; no browser-specific JavaScript errors |
| BR-1303 | The portal must load the initial dashboard within 3 seconds on a standard enterprise network | Must Have | Lighthouse performance score ≥ 80; dashboard TTI ≤ 3s on 10Mbps connection; lazy loading on non-critical components |
| BR-1304 | All PII fields (SSN, DOB) must be masked by default with examiner-controlled reveal | Must Have | SSN displays as \*\*\*-\*\*-XXXX; DOB displays as \*\*/\*\*/XXXX; reveal icon toggles visibility; reveal action logged in audit trail |
| BR-1305 | All API calls must use TLS 1.3 | Must Have | Network requests inspected in security review; no plaintext API calls; certificate validation enforced |
| BR-1306 | The system must maintain a full audit log of all claim state changes | Must Have | Every approve/deny/hold action, status change, field edit, and note addition logged with actor, timestamp, and before/after values |
| BR-1307 | The portal must support light and dark mode | Must Have | Theme toggle available in user menu; all MUI components adapt to theme; preference persists across sessions |

---

## Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend Framework | React 18 + Vite + TypeScript | |
| UI Components | **MUI v5 (Material UI)** | Primary component library — replaces DXC Halstack |
| State Management | React Context API + hooks | Scalable to Redux if needed |
| Authentication | ServiceNow OAuth 2.0 / JWT | |
| System of Action | ServiceNow FSO (Financial Services Operations) | Insurance Data Model required |
| Intelligent Document Processing | Azure Form Recognizer or AWS Textract | Client choice; one provider required |
| Death Verification | LexisNexis | Client contract required before Phase 3 |
| Document Storage | AWS S3 or Azure Blob Storage | Client to provision |
| AI / Agentic Service | ServiceNow Now Assist or Claude API | Architecture TBD — decision required before Phase 3 |
| Deployment | Static hosting (S3/Azure Blob) + CDN | CloudFront or Azure CDN |

---

## Success Criteria / KPIs

| KPI | Baseline | Target | Measurement Method |
|---|---|---|---|
| Average claim processing time | TBD | 30% reduction | ServiceNow reporting — claim open to close date |
| FNOL submission time (minutes) | TBD | < 10 minutes | Portal analytics — form start to submission timestamp |
| IDP auto-population accuracy rate | N/A | ≥ 85% | IDP service confidence scores vs. manual review sample |
| FastTrack routing rate | TBD | ≥ 40% of eligible claims | ServiceNow routing engine metrics |
| SLA compliance rate | TBD | ≥ 95% | Dashboard SLA tracking |
| Examiner satisfaction score (CSAT) | TBD | ≥ 4.0 / 5.0 | Post-launch survey |
| Document classification accuracy | N/A | ≥ 90% | IDP classification vs. manual review sample |

---

## Constraints

- ServiceNow FSO Insurance Data Model must be installed and configured before Phase 1 integration begins
- UI must be built exclusively with **MUI v5** components and theming system — no external CSS frameworks
- LexisNexis contract must be in place before Phase 3
- IDP service (Azure Form Recognizer or AWS Textract) must be provisioned by client before Phase 3
- Browser support: Chrome, Edge, Safari (latest 2 major versions) — no IE11
- Mobile application is out of scope
- Portal authorizes payments only; payment execution is handled by an external payment system
- All data at rest and in transit must comply with applicable insurance data privacy regulations

---

## Glossary

| Term | Definition |
|---|---|
| ACORD | Association for Cooperative Operations Research and Development — standard insurance form formats |
| BRD | Business Requirements Document |
| FNOL | First Notice of Loss — initial claim intake notification |
| FSO | Financial Services Operations — ServiceNow module for insurance and financial services |
| IDP | Intelligent Document Processing — AI-powered document classification and data extraction |
| IGO | In Good Order — all required documents and information received and complete |
| JWT | JSON Web Token — used for secure API authentication |
| L&A | Life & Annuity — primary insurance product line |
| LexisNexis | Third-party data provider used for death record verification |
| MUI | Material UI (MUI v5) — React component library |
| OCR | Optical Character Recognition — technology used to extract text from scanned documents |
| OAuth 2.0 | Open Authorization protocol used for secure delegated access |
| P&C | Property & Casualty — secondary insurance product line |
| RBAC | Role-Based Access Control |
| SLA | Service Level Agreement — defines time-based processing targets for claims |
| SSN | Social Security Number |
| STP | Straight-Through Processing — fully automated claim processing without manual intervention |
| FastTrack | Claims eligible for accelerated processing with reduced requirements |
| ServiceNow FSO | ServiceNow Financial Services Operations platform module |
| System of Action | The backend system (ServiceNow) where data is stored and business logic executes |
| System of Engagement | The frontend portal (React + MUI) where users interact with the system |

---

## Document Approval

| Role | Name | Organization | Date | Signature |
|---|---|---|---|---|
| Solution Architect | | DXC Technology | | |
| Project Sponsor | | Bloom Insurance | | |
| IT Lead | | Bloom Insurance | | |
| Claims Operations Lead | | Bloom Insurance | | |
| Compliance Officer | | Bloom Insurance | | |

---

*Confidential & Proprietary — DXC Technology Smart Apps · March 2026*
