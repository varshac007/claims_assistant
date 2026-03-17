# Bloom Claims Assistant Portal — User Stories

**Client:** Bloom Insurance
**Author:** DXC Technology — Smart Apps
**Version:** 1.0
**Date:** March 17, 2026

**Summary:** 14 Epics · 60 Stories · 247 Story Points

> **Priority:** `Must Have` = required for go-live · `Should Have` = important, deferrable · `Nice to Have` = future enhancement
> **Story Points:** 1=trivial · 2=small · 3=medium · 5=large · 8=complex · 13=very complex

---

## Table of Contents
- [Epic 1: Application Foundation & Authentication](#epic-1-application-foundation--authentication)
- [Epic 2: Dashboards & Claim Search](#epic-2-dashboards--claim-search)
- [Epic 3: Claims Workbench](#epic-3-claims-workbench)
- [Epic 4: FNOL & Intake](#epic-4-fnol--intake)
- [Epic 5: Death Claim Processing](#epic-5-death-claim-processing)
- [Epic 6: Beneficiary Analysis & Party Management](#epic-6-beneficiary-analysis--party-management)
- [Epic 7: Intelligent Document Processing](#epic-7-intelligent-document-processing)
- [Epic 8: AI Insights & Anomaly Detection](#epic-8-ai-insights--anomaly-detection)
- [Epic 9: Related Policies](#epic-9-related-policies)
- [Epic 10: Requirements Engine](#epic-10-requirements-engine)
- [Epic 11: Financial Calculations](#epic-11-financial-calculations)
- [Epic 12: Queue Management](#epic-12-queue-management)
- [Epic 13: Reports & Analytics](#epic-13-reports--analytics)
- [Epic 14: Non-Functional & Accessibility](#epic-14-non-functional--accessibility)
- [Sprint Planning Guide](#sprint-planning-guide)

---

## Epic 1: Application Foundation & Authentication

**Phase 1 · Total: 17 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP1-US001 | As a **claims examiner**, I want to log in using my company credentials so that I can securely access the claims portal | OAuth 2.0 SSO redirects to ServiceNow login; JWT token stored securely; failed login shows error message; session expires after inactivity | Must Have | 5 |
| EP1-US002 | As a **system admin**, I want user roles automatically assigned from ServiceNow so that access control is consistent with enterprise permissions | Role retrieved from ServiceNow profile on login; examiner/supervisor/manager roles map to correct views; role displayed in user menu | Must Have | 3 |
| EP1-US003 | As a **demo presenter**, I want to switch between user personas so that I can demonstrate different role experiences without multiple logins | Persona switcher visible in demo mode; switching loads correct dashboard and permissions; demo badge visible when active | Must Have | 2 |
| EP1-US004 | As **any user**, I want a consistent navigation sidebar so that I can quickly move between portal sections | Sidebar shows only permitted nav items per role; active section highlighted; collapses to icon-only mode; keyboard accessible | Must Have | 3 |
| EP1-US005 | As **any user**, I want to toggle between light and dark mode so that I can work comfortably in different environments | Toggle persists across sessions; all MUI components respect theme; charts and badges adapt to theme | Should Have | 2 |
| EP1-US006 | As **any user**, I want to switch between L&A and P&C product lines so that I can view claims relevant to my current work context | Product line switcher in header; all data and labels update on switch; defaults to L&A on login | Should Have | 2 |

---

## Epic 2: Dashboards & Claim Search

**Phase 1 · Total: 26 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP2-US001 | As a **claims examiner**, I want to see my assigned claims on my dashboard so that I can prioritize my work queue | Only assigned claims shown; sorted by SLA urgency by default; claim count in header; loads within 3 seconds | Must Have | 5 |
| EP2-US002 | As a **claims examiner**, I want to see SLA status badges on each claim so that I immediately know which claims are at risk | On-track (green), At-risk (amber), Overdue (red) badges; days remaining shown; tooltip explains SLA rule | Must Have | 3 |
| EP2-US003 | As a **claims examiner**, I want to see FastTrack/STP eligibility on each claim so that I can prioritize straight-through processing | FastTrack badge for eligible claims; STP badge for fully automated; clicking badge shows eligibility criteria | Must Have | 2 |
| EP2-US004 | As **any user**, I want to search for claims by ID, insured name, policy number, status, or date range so that I can quickly locate specific claims | Results within 2 seconds; partial name/ID match supported; no-results state displayed clearly | Must Have | 3 |
| EP2-US005 | As a **claims supervisor**, I want to see all my team's claims in my dashboard so that I can manage workload distribution | All team claims visible; filterable by examiner; team metrics shown (total open, SLA at-risk count) | Must Have | 5 |
| EP2-US006 | As a **claims manager**, I want a risk management dashboard with performance analytics so that I can make informed operational decisions | Written premium YTD, approval/decline rates, SLA compliance %, FastTrack %; date range filter; product line filter | Must Have | 8 |

---

## Epic 3: Claims Workbench

**Phase 2 · Total: 28 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP3-US001 | As a **claims examiner**, I want to open a claim workbench with a full timeline so that I can see the complete history of a claim | Timeline shows all events chronologically; each event has timestamp, actor, description; scrollable; printable | Must Have | 5 |
| EP3-US002 | As a **claims examiner**, I want to view the Policy 360 tab so that I can see all policy details relevant to the claim | Shows: policy number, type, status, effective/term dates, face amount, riders, beneficiary list with allocation %; sourced from ServiceNow | Must Have | 5 |
| EP3-US003 | As a **claims examiner**, I want to track requirements in the workbench so that I can manage what is still outstanding | Requirements listed with status (Pending/Received/In Progress/Complete); status updatable; received date auto-stamped; IGO flag visible | Must Have | 5 |
| EP3-US004 | As a **claims examiner**, I want to view and manage documents in the workbench so that all claim documents are in one place | Documents grouped by type in accordion; shows name, type, upload date; in-panel viewer; upload button available | Must Have | 5 |
| EP3-US005 | As a **claims examiner**, I want to see a claim progress bar so that I understand how complete the claim processing is | Progress % calculated from completed requirements and steps; visible at top of workbench; updates on requirement completion | Must Have | 2 |
| EP3-US006 | As a **claims examiner**, I want to Approve, Deny, or Hold a claim so that I can take action on processed claims | Action buttons in workbench header; confirm dialog before action; status updates in ServiceNow; audit trail entry created | Must Have | 5 |
| EP3-US007 | As a **claims examiner**, I want to add work notes to a claim so that I can document my investigation | Notes threaded by date; shows author and timestamp; rich text entry; syncs to ServiceNow | Must Have | 3 |

---

## Epic 4: FNOL & Intake

**Phase 2 · Total: 21 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP4-US001 | As an **intake specialist**, I want a 3-step FNOL wizard so that I can capture all required claim information in a guided process | Step 1: claim type, policy #, insured name, DOD, description; Step 2: claimant name, email, phone, relationship; Step 3: document upload; cannot advance with validation errors | Must Have | 8 |
| EP4-US002 | As an **intake specialist**, I want to drag and drop documents during FNOL so that I can upload death certificates and IDs quickly | Drag-and-drop zone accepts PDF, JPG, PNG; max 25MB; shows upload progress; lists uploaded files; can remove before submit | Must Have | 3 |
| EP4-US003 | As an **intake specialist**, I want to receive a claim number after FNOL submission so that I can provide confirmation to the claimant | Claim number displayed on confirmation screen; next-steps message shown; option to print or email confirmation | Must Have | 2 |
| EP4-US004 | As a **claims examiner**, I want to use an FNOL Workspace so that I can manage all incoming claim notifications in one view | Lists all new FNOL submissions; can open any submission; shows submission date, claimant name, claim type; filterable by status | Should Have | 5 |
| EP4-US005 | As an **intake specialist**, I want FNOL submission to trigger death verification so that accuracy is validated at intake | LexisNexis verification triggered on submit; status stored on claim; examiner notified of result; stub mode available before credentials configured | Should Have | 3 |

---

## Epic 5: Death Claim Processing

**Phase 2 · Total: 8 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP5-US001 | As a **claims examiner**, I want to capture and edit death event details so that the claim record has accurate death information | Fields: date/time of death, manner, state, death in USA (Y/N), proof date, incident description; saves to ServiceNow; each edit audit logged | Must Have | 3 |
| EP5-US002 | As a **claims examiner**, I want death case records auto-loaded from ServiceNow when I open a claim so that I don't have to look them up manually | Death case record fetched on workbench open; populated into Death Event Panel; error state shown if no record found | Must Have | 2 |
| EP5-US003 | As a **claims examiner**, I want to see the LexisNexis death verification status on the claim so that I can confirm the death is verified before proceeding | Verification status badge (Verified/Unverified/Pending) in claim header; timestamp of last verification; re-trigger button available | Should Have | 3 |

---

## Epic 6: Beneficiary Analysis & Party Management

**Phase 3 · Total: 18 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP6-US001 | As a **claims examiner**, I want to view all beneficiaries with their details so that I can assess who is entitled to the benefit | Shows: name, masked SSN (reveal on click), relationship, allocation %, birth date, status; sourced from ServiceNow FSO | Must Have | 3 |
| EP6-US002 | As a **claims examiner**, I want to add or edit parties on a claim so that I can correct or update party information | Party form: name, SSN, DOB, relationship, contact info; validates required fields; saves to ServiceNow; audit trail entry created | Must Have | 5 |
| EP6-US003 | As a **claims examiner**, I want the system to automatically analyze beneficiaries for conflicts so that I can identify disputes early | AI analysis auto-triggers on workbench open; findings show conflict description, severity, recommended resolution; examiner can acknowledge with note | Must Have | 8 |
| EP6-US004 | As a **claims examiner**, I want to see beneficiary conflict severity levels so that I can triage disputes appropriately | HIGH conflicts shown as red alert; MEDIUM as amber; LOW as informational; counts shown in workbench header badge | Must Have | 2 |

---

## Epic 7: Intelligent Document Processing

**Phase 3 · Total: 24 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP7-US001 | As a **claims examiner**, I want uploaded documents to be automatically classified by type so that I don't have to manually tag every document | Classification runs within 30 seconds; document type label applied; confidence score shown; examiner can correct classification | Must Have | 8 |
| EP7-US002 | As a **claims examiner**, I want key fields extracted from uploaded documents so that I don't have to manually re-key data | Extracted fields shown alongside source document; each field has confidence %; mapped to claim form fields | Must Have | 8 |
| EP7-US003 | As a **claims examiner**, I want extracted data to auto-populate claim fields so that data entry is minimized | Auto-populated fields highlighted; examiner reviews and confirms or edits; confirmation required before saving | Must Have | 5 |
| EP7-US004 | As a **claims examiner**, I want to review and override auto-populated data so that I maintain control over what is saved | All auto-populated fields editable; override saves new value and logs original extraction; confidence score visible throughout | Must Have | 3 |

---

## Epic 8: AI Insights & Anomaly Detection

**Phase 3 · Total: 23 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP8-US001 | As a **claims examiner**, I want an AI Insights panel in the workbench so that I can quickly see if there are risk indicators on the claim | AI panel visible on workbench; shows overall risk level (HIGH/MEDIUM/LOW/CLEAR); expandable to full modal; loads within 5 seconds | Must Have | 8 |
| EP8-US002 | As a **claims examiner**, I want each AI finding to include a description, evidence, and recommendation so that I understand why a risk was flagged | Finding card shows: severity badge, title, evidence bullets, recommended action, PASS/FAIL indicator; can be dismissed with note | Must Have | 5 |
| EP8-US003 | As a **claims examiner**, I want an AI-generated claim summary so that I can quickly understand the key facts without reading the full file | Summary auto-generated; includes: insured, claim type, amount, key dates, active risk count; refreshes when claim data changes | Must Have | 5 |
| EP8-US004 | As a **claims manager**, I want anomaly trends in the manager dashboard so that I can see if risk patterns are increasing | Anomaly count by severity over time chart; top anomaly types listed; filterable by date range and examiner | Nice to Have | 5 |

---

## Epic 9: Related Policies

**Phase 3 · Total: 13 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP9-US001 | As a **claims examiner**, I want the system to automatically find other policies on the deceased insured so that no eligible claim is missed | Search triggers on claim open; finds policies by insured SSN and name; results shown in Related Policies panel | Must Have | 5 |
| EP9-US002 | As a **claims examiner**, I want to see total aggregated death benefit across related policies so that I understand the full exposure | Total death benefit sum displayed prominently; breakdown by policy; cash values and loan balances noted | Must Have | 3 |
| EP9-US003 | As a **claims examiner**, I want to be alerted when related policies are found so that I don't miss the notification | Alert banner shown when related policies discovered; persists until acknowledged; count shown | Must Have | 2 |
| EP9-US004 | As a **claims examiner**, I want to initiate a new claim from the related policies panel so that I can start related claims without leaving the workbench | "Initiate Claim" button per related policy; pre-populates FNOL with insured and policy data; opens in new tab or modal | Must Have | 3 |

---

## Epic 10: Requirements Engine

**Phase 2 · Total: 16 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP10-US001 | As a **claims examiner**, I want requirements auto-generated when a claim is created so that I have a complete checklist without manual setup | Requirements generated based on: claim type, policy type, state, amount thresholds; list appears in Requirements tab; each defaults to Pending | Must Have | 8 |
| EP10-US002 | As a **claims examiner**, I want to update requirement status as items are received so that the claim progress reflects current state | Status dropdown: Pending, Received, In Progress, Complete; received date auto-stamped on change to Received; progress bar updates | Must Have | 3 |
| EP10-US003 | As a **claims examiner**, I want FastTrack-eligible claims to have non-essential requirements automatically waived so that simple claims process faster | Waived requirements marked "Waived — STP" with reason; examiner can override waiver; audit trail records decision | Must Have | 5 |

---

## Epic 11: Financial Calculations

**Phase 3 · Total: 9 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP11-US001 | As a **claims examiner**, I want a PMI calculator so that I can compute mortgage insurance amounts for applicable claims | Inputs: loan amount, property value, interest rate, loan term; outputs: monthly payment, P&I split, LTV ratio; results copyable | Should Have | 3 |
| EP11-US002 | As a **claims examiner**, I want a tax withholding calculator so that I can determine net benefit amounts | Inputs: gross benefit, federal/state withholding rates; outputs: federal tax, state tax, net benefit; state dropdown pre-loaded | Should Have | 3 |
| EP11-US003 | As a **claims examiner**, I want a payment quick view panel so that I can see disbursement summary and authorize payment | Shows: payee, amount, method, status; Authorize button sends approval to ServiceNow; execution by external system only | Should Have | 3 |

---

## Epic 12: Queue Management

**Phase 4 · Total: 14 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP12-US001 | As a **claims supervisor**, I want a Pending Claims Review workspace so that I can manage claims awaiting examiner action | Lists all pending claims; sortable by SLA, date, examiner; bulk reassign supported; shows days in pending status | Must Have | 5 |
| EP12-US002 | As a **claims supervisor**, I want a Requirements Received workspace so that I can ensure received items are processed promptly | Lists claims with recently received requirements; shows requirement name, received date, assigned examiner; one-click to open workbench | Must Have | 3 |
| EP12-US003 | As a **claims examiner**, I want a personal claims handler queue so that I have a focused view of just my current workload | Shows only my assigned open claims; sorted by priority; quick actions: open workbench, add note, update status | Must Have | 3 |
| EP12-US004 | As a **claims supervisor**, I want to reassign claims between examiners so that I can balance team workload | Reassign action on each claim; examiner dropdown shows active team members; notification sent to new assignee; audit log updated | Should Have | 3 |

---

## Epic 13: Reports & Analytics

**Phase 4 · Total: 13 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP13-US001 | As a **claims manager**, I want a reports module with filterable claims metrics so that I can produce operational reports | Filters: date range, product line, examiner, claim type, status; metrics: open/closed claims, avg processing time, SLA compliance; export to CSV | Should Have | 8 |
| EP13-US002 | As a **claims manager**, I want to filter all dashboards by product line (L&A vs P&C) so that I can analyze each book separately | Product line filter applies to all metrics; persists for session; resets on logout | Should Have | 2 |
| EP13-US003 | As a **claims manager**, I want to see FastTrack routing rate trends so that I can measure STP program effectiveness | Line chart of FastTrack % over time; breakdown by claim type; target threshold line shown | Nice to Have | 3 |

---

## Epic 14: Non-Functional & Accessibility

**All Phases · Total: 15 points**

| Story ID | User Story | Acceptance Criteria | Priority | Points |
|---|---|---|---|---|
| EP14-US001 | As **any user**, I want the portal to be keyboard navigable so that users with motor impairments can use all features | All interactive elements reachable by Tab; focus indicators visible; no keyboard traps; all modals closeable with Escape | Must Have | 5 |
| EP14-US002 | As **any user**, I want all PII fields (SSN, DOB) masked by default so that sensitive data is not exposed on screen | SSN shows as \*\*\*-\*\*-XXXX; DOB shows as \*\*/\*\*/XXXX; reveal icon toggles visibility; reveal action logged in audit trail | Must Have | 3 |
| EP14-US003 | As **any user**, I want the portal to load in under 3 seconds so that productivity is not impacted | Lighthouse performance score ≥ 80; dashboard TTI ≤ 3s on 10Mbps; lazy loading on non-critical components | Must Have | 5 |
| EP14-US004 | As **any user**, I want the portal to work on Chrome, Edge, and Safari (latest 2 versions) so that all staff can use their preferred browser | E2E tests pass on all 3 browsers; no layout breaks; no browser-specific JavaScript errors | Must Have | 2 |

---

## Sprint Planning Guide

### Team Configuration
- **Team Size:** 3 front-end developers + 1 tech lead
- **Sprint Length:** 2 weeks
- **Assumed Velocity:** 30–40 story points per sprint

### Phase Sprint Breakdown

| Phase | Sprints | Stories | Focus |
|---|---|---|---|
| Phase 1 — Foundation | Sprints 1–4 | Epics 1, 2, 14 (partial) | App shell, auth, dashboards, demo data |
| Phase 2 — Core Claims | Sprints 5–8 | Epics 3, 4, 5, 10 | Workbench, FNOL, death claim, requirements |
| Phase 3 — AI & IDP | Sprints 9–14 | Epics 6, 7, 8, 9, 11 | Beneficiary analysis, IDP, AI insights, related policies, calculators |
| Phase 4 — Analytics & Ops | Sprints 15–18 | Epics 12, 13, 14 (remaining) | Queues, dashboards, reports, production hardening |

### Key Notes
- The **demo data layer** (`VITE_USE_MOCK_API=true`) allows all UI development to proceed ahead of ServiceNow integration, enabling parallel sales demo delivery from Sprint 1
- ServiceNow integration can be layered in incrementally per epic as API access becomes available
- Must Have stories (44 of 60) represent the minimum viable product (MVP) for go-live

---

*Confidential & Proprietary — DXC Technology Smart Apps · March 2026*
