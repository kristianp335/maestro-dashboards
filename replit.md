# Maestro GFD Cockpit Finance Dashboard

## Overview
This project creates a comprehensive Liferay-based finance dashboard for Credit Agricole CIB's Maestro GFD (Global Finance Data) Cockpit. The system provides modular, configurable dashboard components for loan management, deal tracking, risk analysis, and performance monitoring, following CA-CIB's professional banking aesthetic.

## User Preferences
- Use simple, everyday language for communication
- Focus on practical implementation over technical details
- Ensure all fragments are properly editable via Liferay's inline editing system
- Work independently for extended periods without constant check-ins
- Document all architectural decisions and changes with dates
- **CRITICAL**: Always verify ZIP packaging correctness - check that updated code is actually included in generated ZIPs before considering deployment ready

## System Architecture

### Dual-Deployment Strategy
- **Frontend Client Extension**: Global CSS and JavaScript for CA-CIB branding and site-wide functionality
- **Fragment Collection**: Individual UI components for finance dashboard features
- **Batch Objects Client Extension**: Data import system for Liferay Objects

### Key Architectural Decisions
- **Color System**: CA-CIB brand colors (Primary: Professional Green #00A651; Secondary: Dark Blue #003366; Accent: Light Gray #F5F5F5)
- **Financial Data Structure**: Comprehensive Liferay Objects for Loans, Deals, Clients, Risk Metrics, and Performance KPIs
- **Fragment Modularity**: Each dashboard component is an independent Liferay fragment with configuration options, responsive design, and edit mode styling
- **CSS Scoping**: All styles scoped under `#wrapper` to prevent Liferay admin interface conflicts
- **JavaScript Isolation**: Fragment-scoped event handling using `fragmentElement`
- **Mobile-First Design**: Responsive breakpoints optimized for banking professionals
- **Content Management**: All content editable via Liferay's inline editing system using `data-lfr-editable` attributes
- **Chart Integration**: Chart.js for financial data visualizations and analytics
- **FreeMarker Templates**: Uses bracket syntax (`[#if]`) and `configuration.variableName` for accessing fragment configurations
- **Performance Optimization**: Inline SVG, CSS containment, limited animations, inline critical CSS
- **Accessibility**: WCAG AA standards compliant with proper financial data presentation
- **Edit Mode Detection**: Uses multiple selectors for robust edit mode detection
- **Mandatory Fragment Requirements**: Every Liferay fragment with configuration options MUST include `"configurationPath": "configuration.json"` and `thumbnail.png`
- **Critical ZIP Structure Requirements**: Fragment collection ZIPs MUST include collection name as root directory

### Core Finance Dashboard Components
- **Finance Dashboard Collection**: Main fragment collection containing all dashboard components
- **KPI Cards Fragment**: Key performance indicators with configurable metrics
- **Loan Analytics Fragment**: Chart.js-powered loan volume trends and analysis
- **Deal Management Fragment**: Opportunity tracking and client relationship management
- **Risk Dashboard Fragment**: Credit risk metrics and portfolio analysis
- **GFD Tracking Fragment**: Global Finance Data origination and workflow status
- **Performance Metrics Fragment**: Financial performance tracking and reporting

### Liferay Objects Data Structure
- **Loan Objects**: Loan details, terms, status, and financial metrics
- **Deal Objects**: Business opportunities, pipeline tracking, client information
- **Client Objects**: Corporate client data, relationships, and credit profiles
- **Risk Objects**: Credit scores, risk assessments, and compliance metrics
- **Performance Objects**: KPIs, targets, actual vs projected performance

### Client Extensions
- **Maestro Frontend Client Extension**: Global CSS for CA-CIB branding and JavaScript functionality
- **Batch Objects Client Extension**: Data import system for populating Liferay Objects with financial data

## External Dependencies
- **Liferay DXP/Portal**: Core platform for fragment rendering and content management
- **Liferay Classic Theme**: Provides frontend tokens and base styling
- **Liferay Headless Delivery API**: Used for data fetching and API integration
- **Chart.js**: Financial data visualization and analytics charts
- **Liferay Objects**: Data persistence for all financial entities
- **Batch Engine Framework**: Data import and export capabilities

## Project Goals
- Create professional finance dashboard matching CA-CIB's banking standards
- Provide modular, configurable components for different user roles
- Ensure seamless integration with Liferay's content management system
- Support responsive design for desktop and mobile banking professionals
- Enable easy data import and management through Liferay Objects
- Follow established Liferay development patterns and best practices

## Recent Changes
- 2025-09-10: Project initialization with comprehensive architecture planning
- 2025-09-10: Established CA-CIB branding guidelines and color system
- 2025-09-10: Defined Liferay Objects structure for financial data management