# Bloom Claims Assistant Portal — Scope of Work

**Client:** Bloom Insurance
**Author:** DXC Technology — Smart Apps
**Version:** 1.0
**Date:** March 17, 2026
**Status:** Draft

---

## Executive Summary

Bloom Insurance currently manages life and annuity claims through a legacy ServiceNow UI that was not designed for high-volume claims operations. Examiners navigate disconnected screens to locate policy data, manually key information from paper and scanned documents, and rely on ad-hoc processes to prioritize work. These inefficiencies drive extended claim cycle times, inconsistent SLA adherence, and examiner frustration — all at a time when beneficiary experience and operational speed are competitive differentiators.

DXC Technology Smart Apps proposes a modern React + MUI v5 Claims Assistant Portal that serves as a System of Engagement layered over ServiceNow FSO as the System of Action. The portal presents claims examiners, supervisors, intake specialists, and managers with purpose-built, role-specific workspaces that surface exactly the right information and actions at each step of the claims lifecycle — without replacing the existing ServiceNow investment.

The expected business value is measurable and near-term: a 30%+ reduction in average claim processing time, AI-accelerated routing and decisions through a FastTrack / Straight-Through Processing engine, full SLA visibility across every open claim, and Intelligent Document Processing (IDP) that eliminates manual data entry on common document types. Management gains real-time analytics and operational dashboards to drive continuous performance improvement.

---

## Project Objectives

1. **Reduce average claim processing time by 30%** through streamlined examiner workflows, contextual data surfacing, and FastTrack routing for eligible claims.
2. **Reduce manual data entry via IDP auto-population** — OCR extraction and field mapping from uploaded documents directly into claim and policy records.
3. **Achieve FastTrack / Straight-Through Processing routing for 40%+ of eligible claims** using a rules-based eligibility engine that bypasses non-essential requirements.
4. **Achieve 100% SLA visibility across all open claims** with real-time indicators, breach alerts, and at-risk flagging on all dashboards.
5. **Reduce beneficiary conflict resolution time by 50%** through AI-powered conflict detection, competing claim identification, and suggested resolution paths.
6. **Provide real-time analytics for management decision-making** — written premium YTD, approval/decline rates, FastTrack percentage, SLA trends, and team performance metrics.

---

## Scope Boundaries

### In Scope

- React portal built on MUI v5 (Material UI)
- All 4 phases of feature delivery
- ServiceNow FSO integration — claims, policies, parties, requirements, and documents
- Multi-persona dashboards: Examiner, Supervisor, Manager, and Intake Specialist
- FNOL intake wizard with document upload
- Claims Workbench (Timeline, Policy 360, Requirements, Documents)
- AI Insights Panel — anomaly detection and risk scoring
- Beneficiary analysis and party management
- Related policies discovery and aggregation
- Intelligent document processing (IDP) integration
- Financial calculators (PMI, tax withholding)
- FastTrack / Straight-Through Processing routing
- Requirements engine (rules-based, decision table)
- RBAC, ServiceNow OAuth 2.0, and JWT token management
- L&A primary product line; P&C secondary
- Demo data, persona switching, and training support

### Out of Scope

- ServiceNow platform configuration and FSO setup
- LexisNexis contract, credentials, or account setup
- Azure Form Recognizer / AWS Textract provisioning
- Document storage infrastructure (S3 / Azure Blob)
- CI/CD pipeline build-out beyond Jenkinsfile scaffold
- Native mobile application (iOS / Android)
- Payment disbursement execution (portal authorizes; payment system executes)
- Custom ServiceNow FSO table creation or schema changes
- Third-party policy administration system integration
- Claims litigation or legal hold management
- End-user training delivery (train-the-trainer only)
- Production infrastructure provisioning and sizing

---

## Effort Summary

| Phase | Name | Duration |
|---|---|---|
| Phase 1 | Foundation & Shell | 6–8 weeks |
| Phase 2 | Core Claims Processing | 6–8 weeks |
| Phase 3 | AI, IDP & Advanced Features | 8–10 weeks |
| Phase 4 | Analytics, Queues & Operational Readiness | 6–8 weeks |
| **Total** | | **26–34 weeks** |

---

## Phased Feature Delivery

### Phase 1 — Foundation & Shell (6–8 Weeks)

| Feature | Description | Priority | Effort |
|---|---|---|---|
| App Shell & Navigation | DxcApplicationLayout with sidebar nav, header, product line switcher (L&A / P&C), light/dark theme | Must Have | 1 wk |
| Authentication & RBAC | ServiceNow OAuth 2.0, JWT token management, role retrieval, persona switching for demo | Must Have | 1–2 wks |
| Examiner Dashboard | Assigned claims queue, SLA indicators, FastTrack badges, search & filter | Must Have | 1.5 wks |
| Claims List & Search | Multi-criteria search, column sort, pagination, status filter, product line filter | Must Have | 1 wk |
| Context & State Management | AppContext, ClaimsContext, PolicyContext, WorkflowContext providers; service layer scaffold | Must Have | 0.5 wk |
| Demo Data Layer | Sample claims, policies, parties, personas with realistic L&A data | Must Have | 0.5 wk |

### Phase 2 — Core Claims Processing (6–8 Weeks)

| Feature | Description | Priority | Effort |
|---|---|---|---|
| Claims Workbench (4-tab) | Timeline, Policy 360, Requirements, Documents tabs. Claim header, progress bar, SLA, FastTrack badge. Approve/Deny/Hold actions. | Must Have | 2.5 wks |
| FNOL Intake Wizard | 3-step form: claim info → claimant info → document upload. Drag-and-drop, real-time validation, claim number generation. | Must Have | 1.5 wks |
| Death Event Panel | Capture/edit: date/time, manner, state, proof date, incident description. LexisNexis hook. | Must Have | 1 wk |
| Beneficiary & Party Management | Add/edit insured, claimant, beneficiary. Masked SSN, relationship, allocation %, birth dates. | Must Have | 1 wk |
| Requirements Engine | Rules-based generation by claim type, policy type, state, amount. IGO tracking, status management. | Must Have | 1.5 wks |
| Document Management | Upload, classify, view documents. Accordion grouping by type. | Must Have | 1 wk |
| Work Notes | Threaded notes/comments per claim with timestamps and author attribution. | Must Have | 0.5 wk |
| Policy Summary & Policy 360 | Policy overview panel and detailed view: coverages, status, dates, beneficiary allocations. | Must Have | 0.5 wk |

### Phase 3 — AI, IDP & Advanced Features (8–10 Weeks)

| Feature | Description | Priority | Effort |
|---|---|---|---|
| AI Insights Panel | Compact card + expandable modal. Anomaly detection, HIGH/MEDIUM/LOW severity, evidence-based recommendations, agential claim summary. | Must Have | 2 wks |
| Beneficiary Analyzer | AI-powered conflict detection. Flags competing claims, legal risks. Suggests resolution paths. | Must Have | 1.5 wks |
| Intelligent Document Processing | Auto-classify, OCR extraction, confidence scoring, auto-populate claim fields. Azure Form Recognizer or AWS Textract. | Must Have | 2 wks |
| Related Policies Discovery | Auto-search for other policies on deceased. Multi-policy grouping, total death benefit aggregation, warning alerts, quick-action to initiate claims. | Must Have | 1 wk |
| FastTrack / STP Routing | Eligibility analysis engine. Determines STP-eligible claims. Bypasses non-essential requirements. | Must Have | 1 wk |
| LexisNexis Death Verification | Trigger death record verification on FNOL submit. Return verification status to claim record. | Should Have | 1 wk |
| Financial Calculators | PMI Calculator (monthly payment, LTV) and Tax Withholding Calculator (gross benefit, federal/state tax, net benefit). | Should Have | 0.5 wk |
| Payment Quick View | Disbursement summary panel. Authorization action (execution by external payment system). | Should Have | 0.5 wk |

### Phase 4 — Analytics, Queues & Operational Readiness (6–8 Weeks)

| Feature | Description | Priority | Effort |
|---|---|---|---|
| Supervisor Dashboard | Team queue overview, performance metrics, claim assignment management, SLA at-risk alerting. | Must Have | 1.5 wks |
| Manager / Risk Dashboard | Advanced analytics: written premium YTD, approval/decline rates, SLA trends, FastTrack %. Executive-level view. | Must Have | 2 wks |
| Queue Management | Pending Claims Review, Requirements Received workspace, claim assignment and routing, Claims Handler personal queue. | Must Have | 1.5 wks |
| FNOL Workspace | Dedicated workspace for claim notifications and in-progress FNOL intake management. | Should Have | 0.5 wk |
| Reports Module | Claims metrics and performance reporting. Export to CSV/PDF. Filterable by date range, examiner, product line, status. | Should Have | 1 wk |
| Real-Time Updates (WebSocket) | Live claim status updates, requirement receipt notifications, SLA breach alerts via WebSocket. | Nice to Have | 1 wk |
| P&C Product Line Support | Separate data, UI variations, and persona context for Property & Casualty claims. | Nice to Have | 1.5 wks |
| Production Hardening | Performance optimization, error handling, caching, WCAG 2.1 AA audit, security review, deployment docs. | Must Have | 1.5 wks |

---

## Integration Requirements

| System | Purpose | Type | Complexity |
|---|---|---|---|
| ServiceNow FSO | Primary system of action. Claims, policies, parties, requirements, documents. Full CRUD via REST APIs. | Required | High |
| ServiceNow OAuth 2.0 | Authentication, JWT token lifecycle, user role/profile retrieval, SSO support. | Required | Medium |
| Azure Form Recognizer / AWS Textract | Intelligent document processing — OCR, field extraction, document classification, confidence scoring. | Required | Medium |
| LexisNexis | Death record verification on FNOL submission. Returns verification status to claim. | Phase 3 | Medium |
| Document Storage (S3 / Azure Blob) | Persistent document storage for uploaded files. Referenced by ServiceNow document records. | Required | Low |
| Agentic AI Service | Powers AI Insights Panel — anomaly detection, risk scoring, claim summaries, beneficiary conflict analysis. | Required | High |
| CDN / Static Hosting | Frontend static asset delivery. Vite build artifacts deployed to S3 or Azure Blob with CDN. | Infra | Low |

---

## User Roles & Permissions

| Role | Primary View | Key Capabilities | ServiceNow Role |
|---|---|---|---|
| Claims Examiner | Examiner Dashboard | View assigned claims, full workbench access, approve/deny/hold, add work notes, upload documents | `sn_fso.claims_examiner` |
| Claims Supervisor | Supervisor Dashboard | All examiner capabilities + team queue management, claim assignment, performance reporting | `sn_fso.claims_supervisor` |
| Claims Manager | Manager / Risk Dashboard | All supervisor capabilities + advanced analytics, risk dashboard, executive reports | `sn_fso.claims_manager` |
| Intake Specialist / CSR | FNOL Workspace | Submit FNOL, upload documents, track intake status. No workbench access. | `sn_fso.intake_specialist` |

---

## Assumptions & Dependencies

### Client Responsibilities

- ServiceNow FSO instance provisioned with Insurance Data Model installed
- ServiceNow OAuth 2.0 provider configured before Phase 1 start
- LexisNexis contract and API credentials provided before Phase 3
- IDP service (Azure Form Recognizer or AWS Textract) provisioned before Phase 3
- Document storage (S3 or Azure Blob) provisioned and accessible
- Agentic AI service architecture decision made before Phase 3 design
- UAT resources available at end of each phase

### Technical Assumptions

- ServiceNow FSO Insurance Data Model tables used as-is (no custom schema changes)
- React 18 + Vite + MUI v5 as mandated tech stack
- Browser targets: Chrome, Edge, Safari (latest 2 versions)
- No IE11 or legacy browser support required
- Demo data layer maintained for all phases to support parallel sales demos
- Role-based access controlled at ServiceNow; portal enforces UI-level only

### Design & UX Assumptions

- MUI v5 (Material UI) is the primary component library
- MUI theming system used for all customization (no external CSS frameworks)
- WCAG 2.1 AA accessibility compliance
- Light and dark mode supported via MUI theme
- Responsive layout for desktop and tablet; mobile not in scope

### Project & Delivery Assumptions

- Phases are sequential; Phase N+1 begins after Phase N UAT sign-off
- Weekly sprint cadence with fortnightly stakeholder demos
- Change requests outside this scope require formal scope change process
- Training is train-the-trainer; end-user training delivery out of scope
- Effort estimates assume 2–3 front-end developers + 1 tech lead

---

## Risks & Mitigations

| Risk | Severity | Probability | Mitigation |
|---|---|---|---|
| ServiceNow FSO API access delayed | High | Medium | Demo data layer allows full UI development without live ServiceNow. API integration layered in once access is confirmed. |
| Agentic AI service architecture undefined | High | Medium | Decision required by end of Phase 2. Mock response layer allows UI development to proceed independently. |
| IDP accuracy below threshold | Medium | Medium | Custom model training on sample documents prior to Phase 3. Confidence thresholds visible to examiners; manual override always available. |
| LexisNexis contract delay | Medium | Low | Stub mock service returns configurable verification status. Soft-launches when credentials available with no code change. |
| Scope creep on AI features | Medium | High | AI features scoped to defined outputs only. Additional capabilities logged as Phase 5 backlog. |
| MUI component gaps for edge cases | Low | Low | MUI has a broad component library; custom styled components used as last resort only. |

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
