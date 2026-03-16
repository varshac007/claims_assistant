# Bloom Claims Assistant Portal

A modern React-based claims management portal for life and annuity insurance claims, built exclusively with DXC Halstack Design System components.

## Overview

This portal provides a comprehensive interface for managing the entire claims lifecycle, from intake through processing to resolution. It implements the Phase 1 feature set for claims automation and workbench management.

## Features Implemented

### Phase 1A - Intake & Triage
- **Portal FNOL**: First Notice of Loss submission with guided forms
- **Multi-step Intake Forms**: Step-by-step claim submission process
- **Document Upload**: Support for death certificates, IDs, and supporting documents
- **Claim Type Selection**: Death claims, maturity claims, and surrenders

### Phase 1B - Processing & Automation
- **Requirements Tracking**: IGO (In Good Order) status monitoring
- **FastTrack Indicators**: Visual indicators for STP-eligible claims
- **Rules Engine Integration Points**: Structured for automatic requirement generation
- **Status Management**: Real-time claim status updates

### Workbench & Experience
- **Claims Dashboard**:
  - Key metrics: Written Premium YTD, Pending Review, Approval/Decline rates
  - Multi-tab interface (Submissions, Quotes, Renewals)
  - Advanced search functionality
  - Queue management

- **Claims Workbench**:
  - **Timeline View**: Complete audit trail of claim activities
  - **Policy 360**: Full policy details and beneficiary information
  - **Requirements Tab**: Track all requirements with status indicators
  - **Documents Tab**: Organized document management with accordion view
  - **Progress Tracking**: Visual SLA monitoring and completion metrics
  - **Action Buttons**: Approve, Deny, Hold workflows

- **Multi-Persona Support**:
  - Examiner view with full claim details
  - Supervisor view with queue oversight
  - Status-based navigation

## Technology Stack

- **React 18.3.1**: Core framework
- **DXC Halstack React 16.0.0**: Complete UI component library
- **Vite**: Build tool and development server
- **Emotion**: CSS-in-JS styling (Halstack dependency)

## DXC Halstack Components Used

The portal is built **exclusively** with Halstack components:

- `DxcApplicationLayout` - Main app structure with header, sidebar, and content
- `DxcCard` - Content containers and metric displays
- `DxcTable` - Data grids for submissions and requirements
- `DxcNavTabs` & `DxcTabs` - Navigation and content organization
- `DxcButton` - Actions and navigation
- `DxcBadge` - Status indicators
- `DxcTextInput` - Form inputs
- `DxcSelect` - Dropdown selections
- `DxcDateInput` - Date pickers
- `DxcTextarea` - Multi-line text input
- `DxcRadioGroup` - Radio button groups
- `DxcFileInput` - Document uploads
- `DxcProgressBar` - Progress and completion tracking
- `DxcAlert` - Notifications and messages
- `DxcAccordion` - Collapsible document sections
- `DxcFlex` - Layout and alignment

## Project Structure

```
claims-portal/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx       # Main dashboard with metrics and tables
│   │   │   └── Dashboard.css
│   │   ├── ClaimsWorkbench/
│   │   │   ├── ClaimsWorkbench.jsx # Detailed claim view with tabs
│   │   │   └── ClaimsWorkbench.css
│   │   └── IntakeForms/
│   │       ├── IntakeForms.jsx     # Multi-step intake form
│   │       └── IntakeForms.css
│   ├── App.jsx                      # Main application with routing
│   ├── App.css                      # Global styles
│   └── main.jsx                     # Application entry point
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd claims_halstack/claims-portal
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Key User Flows

### 1. Dashboard View
- View key metrics and KPIs
- Search and filter claims
- Access claims by status (In-Progress, Quote Required, New Submission)
- Navigate to detailed claim workbench

### 2. Claims Workbench
- **Timeline**: View complete claim history with timestamps
- **Policy 360**: Access policy details, coverage amounts, and beneficiary information
- **Requirements**: Track status of all claim requirements (Received, Pending, In Progress)
- **Documents**: Review uploaded documents organized by type
- Take actions: Approve, Deny, or Hold claims

### 3. New Claim Submission
- **Step 1**: Enter claim information (type, policy number, insured details, date of death)
- **Step 2**: Provide claimant information (name, contact details, relationship)
- **Step 3**: Upload required documents (death certificate, ID, additional documents)
- Submit and receive claim number

## Integration Points (Ready for Implementation)

The portal is structured to integrate with:

1. **LexisNexis Death Verification** - Automatic verification upon claim submission
2. **Rules Engine** - Automatic requirement generation based on policy/state
3. **Document IDP** - Intelligent document processing for uploaded files
4. **Assure BPM Toolkit** - Workflow orchestration
5. **FastTrack STP Engine** - Straight-through processing for eligible claims
6. **ACE Letter Generation** (Phase 2) - Automated correspondence

## Design System Alignment

The portal follows Halstack Design System principles:

- **Accessible**: WCAG 2.1 AA compliant components
- **Consistent**: Uniform spacing, typography, and color system
- **Intuitive**: Clear navigation and user flows
- **Responsive**: Adapts to different screen sizes

## Color Scheme

Primary colors aligned with Bloom branding:
- Primary Purple: `#5f249f`
- Info Blue: `#0095FF`
- Success Green: `#24A148`
- Warning Orange: `#FF6B00`
- Error Red: `#D0021B`

## Future Enhancements (Phase 2+)

- SSO/MFA authentication integration
- Real-time SLA monitoring with alerts
- Advanced fraud detection indicators
- Settlement and disbursement workflows
- ACE letter generation integration
- Analytics and reporting dashboards
- Mobile responsive optimizations
- Predictive analytics for claim outcomes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - DXC Technology

## Support

For questions or issues, contact the development team.

---

Built with DXC Halstack Design System - [Documentation](https://developer.dxc.com/halstack/)
