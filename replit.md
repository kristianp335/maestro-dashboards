# Maestro GFD Cockpit Finance Dashboard

## Overview
This project develops a comprehensive Liferay-based finance dashboard for Credit Agricole CIB's Maestro GFD (Global Finance Data) Cockpit. It aims to provide modular, configurable dashboard components for critical financial operations like loan management, deal tracking, risk analysis, and performance monitoring, adhering to CA-CIB's professional banking aesthetic. The system is designed to streamline financial data visualization and management for banking professionals, improving efficiency and analytical capabilities within the organization, with a business vision to enhance efficiency and analytical capabilities within the organization, leading to improved decision-making and competitive advantage in the financial sector.

## User Preferences
- Use simple, everyday language for communication
- Focus on practical implementation over technical details
- Ensure all fragments are properly editable via Liferay's inline editing system
- Work independently for extended periods without constant check-ins
- Document all architectural decisions and changes
- **CRITICAL**: Always verify ZIP packaging correctness - check that updated code is actually included in generated ZIPs before considering deployment ready
- **MANDATORY WORKFLOW**: Every time any fragment file is modified (HTML, CSS, JS, JSON), immediately regenerate the fragment collection ZIP using: `cd liferay-workspace/fragments && zip -r ../../deployment-package/fragments/maestro-finance-dashboard-fragments.zip maestro-finance-dashboard/`

## System Architecture

### Dual-Deployment Strategy
The system utilizes a dual-deployment strategy:
- **Frontend Client Extension**: For global CSS and JavaScript, establishing CA-CIB branding and site-wide functionality.
- **Fragment Collection**: For individual UI components that make up the finance dashboard features.
- **Batch Objects Client Extension**: For the data import system populating Liferay Objects.

### Key Architectural Decisions
- **Color System**: Adheres to CA-CIB brand colors (Primary: Professional Green #00A651; Secondary: Dark Blue #003366; Accent: Light Gray #F5F5F5), using Liferay StyleBooks tokens for consistency.
- **Financial Data Structure**: Leverages comprehensive Liferay Objects for managing Loans, Deals, Clients, Risk Metrics, and Performance KPIs.
- **Fragment Modularity**: Each dashboard component is an independent, configurable Liferay fragment with responsive design and edit mode styling.
- **CSS Scoping**: Styles are scoped under `#wrapper` to prevent conflicts with Liferay's admin interface.
- **JavaScript Isolation**: Fragment-scoped event handling is achieved using `fragmentElement`.
- **Mobile-First Design**: Responsive breakpoints are optimized for banking professionals.
- **Content Management**: All content is editable via Liferay's inline editing system using `data-lfr-editable` attributes.
- **Chart Integration**: Chart.js is used for financial data visualizations.
- **FreeMarker Templates**: Utilizes bracket syntax (`[#if]`) and `configuration.variableName` for accessing fragment configurations.
- **Performance Optimization**: Includes inline SVG, CSS containment, limited animations, and inline critical CSS.
- **Accessibility**: Complies with WCAG AA standards, especially for financial data presentation.
- **Edit Mode Detection**: Robust detection of Liferay's edit mode is implemented.
- **Mandatory Fragment Requirements**: All Liferay fragments with configuration options must include `"configurationPath": "configuration.json"` and a `thumbnail.png`.
- **Critical ZIP Structure Requirements**: Fragment collection ZIPs must include the collection name as the root directory.

### Core Finance Dashboard Components
The system includes several core Liferay fragments:
- **KPI Cards Fragment**: Configurable key performance indicators.
- **Loan Analytics Fragment**: Chart.js-powered loan volume trends.
- **Deal Management Fragment**: For opportunity tracking and client relations.
- **Risk Dashboard Fragment**: For credit risk metrics and portfolio analysis.
- **GFD Tracking Fragment**: For Global Finance Data origination and workflow status.
- **Performance Metrics Fragment**: For financial performance tracking.

### Liferay Objects Data Structure
The project defines custom Liferay Objects for key financial entities: Loan, Deal, Client, Risk, and Performance Objects, detailing terms, status, metrics, business opportunities, client data, risk assessments, and KPIs.

### Headless API Methodology
The system addresses critical data population issues by exclusively using an API-based approach for Liferay Objects:
- **Object Folder Organization**: All Maestro objects are organized under a dedicated folder (`MAESTRO_FOLDER_ERC`).
- **Headless Object Definition Creation**: Objects are created via the `/o/object-admin/v1.0/object-definitions` API endpoint and immediately published.
- **Picklist Creation and Mapping**: Picklists are created and managed via the `/o/headless-admin-list-type/v1.0/list-type-definitions` API.
- **Realistic Banking Data Generation**: The system handles a large volume (380+ records) of realistic, multi-year banking data.
- **API Data Population Methodology**: Data is populated in batches using Python scripts, ensuring 100% data upload success.
- **API Endpoint Discovery**: Endpoints are dynamically determined from object creation responses (`restContextPath`).
- **Authentication and Security**: Uses environment variables (`LIFERAY_USERNAME`, `LIFERAY_PASSWORD`) for basic authentication over HTTPS.

## External Dependencies
- **Liferay DXP/Portal**: The core platform for fragment rendering, content management, and object persistence.
- **Liferay Classic Theme**: Provides base styling and frontend tokens.
- **Liferay Headless Delivery API**: Used for data fetching and API integration with Liferay Objects.
- **Chart.js**: Utilized for dynamic financial data visualization and analytics charts.
- **Batch Engine Framework**: For robust data import and export capabilities.