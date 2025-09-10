# Boots Optician Partner Portal

## Overview
This project aims to recreate the Boots Optician partner portal using a comprehensive Liferay fragment collection. Its purpose is to provide modular, configurable, and responsive dashboard components, including navigation, various widgets, training modules, performance analytics, and case management tools. The system facilitates easy content editing and deployment, adhering to Boots' branding guidelines, offering a complete solution for partner engagement and a frictionless user experience. The business vision is to enhance partner interaction, streamline operations, and provide robust tools for opticians.

## User Preferences
- Use simple, everyday language for communication
- Focus on practical implementation over technical details
- Ensure all fragments are properly editable via Liferay's inline editing system
- Work independently for extended periods without constant check-ins
- Document all architectural decisions and changes with dates
- **CRITICAL**: Always verify ZIP packaging correctness - check that updated code is actually included in generated ZIPs before considering deployment ready

## System Architecture

### Dual-Deployment Strategy
- **Client Extension**: Global CSS and JavaScript for site-wide functionality.
- **Fragment Collection**: Individual UI components for dashboard features.

### Key Architectural Decisions
- **Color System**: Exclusive use of Liferay Classic theme frontend tokens with Boots brand colors (Primary: `var(--brand-color-1)` - Boots blue; Secondary: `var(--brand-color-2)` - Secondary blue-gray).
- **Navigation System**: Left-sliding menu with API-driven and fallback navigation.
- **Fragment Modularity**: Each dashboard component is an independent Liferay fragment with configuration options, responsive design, and edit mode styling.
- **CSS Scoping**: All styles scoped under `#wrapper` to prevent Liferay admin interface conflicts.
- **JavaScript Isolation**: Fragment-scoped event handling using `fragmentElement`.
- **Mobile-First Design**: Responsive breakpoints with touch-friendly interactions.
- **Content Management**: All content editable via Liferay's inline editing system using `data-lfr-editable` attributes.
- **Modal System**: Centralized system for login, search, and video modals, embedding Liferay portlets with CSS overrides.
- **FreeMarker Templates**: Uses bracket syntax (`[#if]`) and `configuration.variableName` for accessing fragment configurations with default values.
- **Performance Optimization**: Inline SVG, CSS containment, limited animations, inline critical CSS, eager loading for hero images.
- **Accessibility**: WCAG AA standards compliant with proper alt text, ARIA labels, and keyboard navigation.
- **Z-Index Strategy**: Conservative z-index use (1050 for fragment modals, 1060 for dropdowns) to avoid conflicts with Liferay's admin interface.
- **Edit Mode Detection**: Uses multiple selectors for robust edit mode detection.
- **Mandatory Fragment Requirements**: Every Liferay fragment with configuration options MUST include `"configurationPath": "configuration.json"` and `thumbnail.png`.
- **Critical ZIP Structure Requirements**: Fragment collection ZIPs MUST include collection name as root directory (e.g., `collection-name/collection.json`).

### Core Components
- **Header Fragment**: Logo, configurable navigation, left-sliding menu, user profile, search/sign-in modals.
- **Hero Fragment**: Configurable component for login/landing pages with editable content and custom backgrounds.
- **Dashboard Overview**: KPI cards, quick actions, performance metrics (decomposed into individual KPI Card, Chart Widget, Progress Widget, Stats Card, Data Table fragments).
- **Training Module Fragment**: Training progress, courses, certifications.
- **Case Management Fragment**: Active cases, recent activity, statistics.
- **Performance Analytics**: Charts, trends, goal tracking.
- **Announcements Fragment**: Latest updates, broadcasts.
- **Footer Fragment**: Links, support information.
- **Custom Widget Container Fragment**: Configurable drag-and-drop widget container integrating with the Custom Widget Container client extension.
- **Form Fragments Collection**: Includes Autocomplete Fields, Confirmation Field, Rating Components, Selection Controls (multi-select, toggles, sliders), Advanced Fields (segmented numeric, user field selectors), Submit Controls, and Hidden Fields.
- **Boots Onboarding Tasks Fragment**: Manages onboarding tasks, including overdue detection and contract dropzone visibility.

### Client Extensions
- **Boots Frontend Client Extension**: Global CSS and JavaScript for site-wide functionality.
- **InvoiceManager Client Extension**: Custom element client extension providing invoice data table functionality with React and Tailwind CSS.
- **Custom Widget Container Client Extension**: React-based drag-and-drop widget customization system with user-specific persistence via Liferay object storage.

## External Dependencies
- **Liferay DXP/Portal**: Core platform for fragment rendering, theme system, and content management.
- **Liferay Classic Theme**: Provides frontend tokens and base styling.
- **Liferay Headless Delivery API**: Used for fetching navigation menu structures and content data.
- **Liferay Login Portlet**: Embedded in modal overlays.
- **Liferay Search Portlet**: Integrated into search modal functionality.
- **Chart.js**: Integrated for charting functionalities.
- **Browser APIs**: Intersection Observer, Fetch API, Local Storage for enhanced functionality.