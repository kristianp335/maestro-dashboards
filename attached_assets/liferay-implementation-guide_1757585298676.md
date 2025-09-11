# Liferay Fragment & Client Extension Implementation Guide

## Overview

This guide provides comprehensive best practices, architectural patterns, and optimization techniques for creating production-ready Liferay implementations using fragments and client extensions. It covers responsive design, performance optimization, and advanced functionality integration.

## User Preferences & Project Setup

### Communication Guidelines
- Use simple, everyday language for non-technical stakeholders
- Document all architectural decisions and user preferences
- Maintain clear project context and progress tracking

### Fragment Image Editing Requirements
- All images in fragments must be made editable using Liferay's inline editing system
- Required attributes for editable images:
  ```html
  <img
     src="placeholder.jpg"
     alt="Placeholder"
     data-lfr-editable-id="img1"
     data-lfr-editable-type="image"
  >
  ```
- Apply to all images where content editors should be able to customize them

### Modal Implementation Requirements (Login, Search, etc.)
- Modal buttons must open overlay with embedded Liferay portlets
- Use FreeMarker template to embed portlets: `[@liferay_portlet["runtime"] portletName="PORTLET_NAME" /]`
- Modal should check user login status and show appropriate content
- Include proper modal structure with overlay, close button, and escape key handling
- Modal should prevent background scrolling when open
- Use `themeDisplay.isSignedIn()` to conditionally show different content

### Modal Theme Styling Implementation
- **Problem**: Embedded Liferay portlets inherit global Liferay styles instead of custom theme
- **Solution**: Comprehensive CSS overrides with `!important` declarations target actual DOM structure
- **Key CSS Targets**:
  - `.form-control`, `input.field`, `.clearable.form-control` - Input field styling with brand colors
  - `.control-label` - Label styling with brand colors
  - `.btn-primary` - Primary button with brand background and hover effects
  - `.lfr-btn-label` - Button text styling
  - `.taglib-text a` - Footer links with brand colors and hover effects
  - `.portlet`, `.portlet-content`, `.portlet-body` - Remove unwanted portlet container styling
- **Implementation**: All styling scoped to modal content class to prevent interference

### Navigation Implementation Requirements
- **Problem**: Navigation dropdowns may not work due to API structure mismatch
- **Root Cause**: Code may look for `item.children` but Liferay API returns `item.navigationMenuItems`
- **Solution**: Update navigation functions to handle both API and fallback structures
- **Key Features**:
  - **API Support**: Handle `navigationMenuItems` from Liferay Headless Delivery API
  - **Fallback Support**: Maintain `children` compatibility for manual navigation
  - **Property Mapping**: Support both `item.link || item.url` and `item.name || item.title`
  - **Dropdown Behavior**: Hover to show, click to toggle, keyboard navigation (Enter/Space/Escape)
  - **Outside Click**: Close all dropdowns when clicking outside navigation
  - **Multiple Dropdown Management**: Close other dropdowns when opening new ones

### Fragment Dropdown Scoping Requirements
- **Problem**: Fragment dropdown code can interfere with other Liferay functionality
- **Solution**: Strictly scope all dropdown functionality to only affect navigation within the fragment
- **Key Features**:
  - **Fragment-Only Scope**: All dropdown queries strictly limited to `fragmentElement`
  - **No Global Interference**: Remove all document-wide dropdown handling
  - **Native Liferay Compatibility**: Allow Liferay's native dropdown systems to work uninterrupted
- **Implementation**: All dropdown selectors use `fragmentElement.querySelectorAll()` exclusively

### Header JavaScript Scoping Requirements
- **Critical Rule**: All JavaScript in header fragment must be scoped ONLY to navigation functionality
- **Scope Limitation**: JavaScript must only affect elements within the header fragment's navigation area
- **DOM Query Requirements**:
  - Use `fragmentElement.querySelector()` for all DOM queries
  - Never use `document.querySelector()` or global selectors
  - Scope all event listeners to elements within the fragment
- **Timing Requirements**:
  - Initialize dropdowns AFTER navigation rendering is complete
  - Use `setTimeout()` delay to ensure DOM elements exist before attaching handlers
- **Event Handler Scoping**:
  - All event handlers must be scoped to fragment elements only
  - Outside click detection limited to fragment scope
  - No interference with Liferay's global event systems

### CSS Wrapper Scoping Requirements
- **Critical Rule**: ALL CSS must be scoped to `#wrapper` to prevent interference with Liferay admin interface
- **Global CSS Scoping**: Every selector in global CSS client extension must be prefixed with `#wrapper`
- **Fragment CSS Scoping**: Every selector in fragment CSS files must be prefixed with `#wrapper`
- **Scope Coverage**:
  - Typography: `#wrapper h1`, `#wrapper h2`, etc.
  - Buttons: `#wrapper .brand-btn`
  - Utilities: `#wrapper .brand-*`
  - Grids: `#wrapper .brand-grid`
  - Responsive: `@media { #wrapper .class }`
  - Custom scrollbars: `#wrapper ::-webkit-scrollbar`
- **Admin Interface Protection**: Ensures Liferay admin interface styling remains unaffected
- **Implementation Pattern**: 
  - Before: `.brand-btn { ... }`
  - After: `#wrapper .brand-btn { ... }`

### Liferay Edit Mode Z-Index Requirements (Conservative Approach)
- **Critical Rule**: Avoid overriding Liferay's built-in z-index hierarchy to prevent control menu interference
- **Problem**: Aggressive z-index overrides can cause Liferay's control menu and admin interface to malfunction
- **Conservative Z-Index Strategy**: Use standard Bootstrap modal values that don't conflict with Liferay admin interface
- **Fragment Z-Index Implementation**:
  ```css
  /* Fragment modal and search suggestions z-index limits - conservative approach */
  #wrapper .modal-backdrop,
  #wrapper .modal {
      z-index: 1050 !important;
  }
  
  #wrapper .search-bar-suggestions-dropdown-menu,
  #wrapper .dropdown-menu.show {
      z-index: 1060 !important;
  }
  ```
- **Key Principle**: Let Liferay manage edit mode element priorities, only override fragment-specific modals
- **Fragment Z-Index Limits**: Fragment elements should use standard Bootstrap z-index values (1050-1060)
- **Modal Z-Index**: Application modals use z-index 1050 (Bootstrap standard)
- **Search Suggestions**: Use z-index 1060 for dropdown suggestions
- **Lesson Learned**: High z-index values (9999+) on Liferay admin elements cause interface conflicts

### Liferay Dropzone Implementation Guide

**Overview**: Dropzones allow content editors to add Liferay portlets or fragments dynamically within existing fragments.

#### HTML Implementation

**Modal Dropzone Example**:
```html
<div class="modal-content">
    <lfr-drop-zone data-lfr-drop-zone-id="modal-content">
    </lfr-drop-zone>
</div>
```

**Header Actions Dropzone Example**:
```html
<div class="header-dropzone">
    <lfr-drop-zone data-lfr-drop-zone-id="header-extra">
    </lfr-drop-zone>
</div>
```

#### CSS Implementation

**Modal Dropzone Styling**:
```css
#wrapper .modal-content {
    padding: var(--spacing-lg);
    min-height: 200px;
    height: auto;
    transition: min-height 0.3s ease;
}

/* Dynamic height expansion when dropdown suggestions appear */
#wrapper .modal-content:has(.dropdown-menu.suggestions-dropdown.show) {
    min-height: 500px;
}
```

**Header Dropzone Base Styling**:
```css
#wrapper .header-dropzone {
    display: flex;
    align-items: center;
    margin-left: var(--spacing-md);
}

#wrapper .header-dropzone lfr-drop-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    min-width: 100px;
    border: 2px dashed transparent;
    border-radius: 4px;
    transition: all 0.3s ease;
    padding: 8px 16px;
    box-sizing: border-box;
}
```

#### Edit Mode Detection and Styling

**Multiple Edit Mode Selectors** (comprehensive coverage):
```css
/* Show dropzone in edit mode */
#wrapper .header-dropzone lfr-drop-zone[data-editor-enabled="true"],
#wrapper .is-edit-mode .header-dropzone lfr-drop-zone,
body.has-edit-mode-menu .header-dropzone lfr-drop-zone {
    border-color: #your-brand-color !important;
    background-color: rgba(your-brand-rgb, 0.05) !important;
    position: relative;
    min-width: 120px !important;
    min-height: 40px !important;
    width: auto;
    display: flex !important;
    visibility: visible !important;
}
```

**Edit Mode Placeholder Text**:
```css
#wrapper .header-dropzone lfr-drop-zone[data-editor-enabled="true"]:before,
#wrapper .is-edit-mode .header-dropzone lfr-drop-zone:before,
body.has-edit-mode-menu .header-dropzone lfr-drop-zone:before {
    content: "Drop content here";
    color: #your-brand-color;
    font-size: 0.75rem;
    font-weight: 500;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    pointer-events: none;
    z-index: 1;
    display: block !important;
}

/* Hide placeholder when content is present */
#wrapper .header-dropzone lfr-drop-zone:not(:empty):before {
    display: none;
}
```

#### Key CSS Classes and Selectors

**Edit Mode Detection Classes**:
- `[data-editor-enabled="true"]` - Liferay's standard edit mode attribute
- `.is-edit-mode` - Custom edit mode class detection
- `body.has-edit-mode-menu` - Body-level edit mode detection (most reliable)

**Dropzone Container Classes**:
- `.header-dropzone` - Header dropzone wrapper
- `.modal-content` - Modal dropzone container
- `lfr-drop-zone` - Liferay's standard dropzone element

**Visual State Classes**:
- `:before` pseudo-element for placeholder text
- `:not(:empty)` selector to hide placeholder when content exists
- Brand color scheme for borders and text

#### Edit Mode Behavior Features

**Visual Indicators**:
- Brand color dashed border
- Light brand color background
- "Drop content here" placeholder text
- Minimum size enforcement (120px width, 40px height)

**Responsive Behavior**:
- Dropzones expand with content (`width: auto`)
- Modal grows dynamically with dropdown suggestions
- Smooth transitions (`transition: all 0.3s ease`)

**Content Integration**:
- Placeholder text disappears when content is dropped
- Maintains layout flow and alignment
- Proper spacing and margins for visual hierarchy

#### Implementation Notes

**Important Declarations**: All edit mode styling uses `!important` to override Liferay's default dropzone styles.

**Multiple Selector Strategy**: Uses three different edit mode detection methods to ensure dropzones appear across different Liferay versions and configurations.

**Scoped Styling**: All dropzone CSS is scoped with `#wrapper` to prevent interference with Liferay admin interface.

### Above-the-Fold Performance Optimizations

**Overview**: Critical performance optimizations for achieving optimal Lighthouse scores, focusing on Largest Contentful Paint (LCP) and Core Web Vitals.

#### Inline SVG Implementation for Zero Network Requests

**Problem**: External SVG files and base64 data URLs cause network delays and LCP performance issues.

**Solution**: Implement pure inline SVG directly in HTML:
```html
<div class="hero-image">
    <svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
        <!-- Complete SVG markup inline -->
        <circle cx="150" cy="150" r="120" fill="#f0f8ff" stroke="#brand-color"/>
        <!-- Additional SVG elements... -->
    </svg>
</div>
```

**Performance Benefits**:
- **Zero Network Requests**: No external file downloads required
- **Instant Rendering**: SVG parsed with HTML, no loading delays  
- **Critical Resource Elimination**: Removes render-blocking resource dependencies
- **LCP Optimization**: Image available immediately during HTML parsing

#### Animation Performance Optimization

**Problem**: Complex animations (rotation, scaling, sliding) cause performance bottlenecks and poor Lighthouse scores.

**Solution**: Eliminate complex animations, implement simple fade-in only:
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.content {
    animation: fadeIn 0.2s ease-out;
}
```

**Avoid These Animations**:
- ❌ Rotation transforms with `rotate()`
- ❌ Scale transforms and complex keyframes
- ❌ Sliding animations with `translateX/Y`
- ❌ Multiple simultaneous animation properties

**Performance Impact**:
- **Reduced JavaScript Execution**: Simpler animations require less CPU
- **Improved Paint Performance**: No complex transform calculations
- **Better Frame Rate**: Consistent 60fps with minimal GPU usage

#### Hardware Acceleration and GPU Optimization

**Implementation**:
```css
.performance-optimized {
    transform: translateZ(0);
    will-change: auto;
    backface-visibility: hidden;
}
```

**GPU Compositing Features**:
- **`transform: translateZ(0)`**: Forces GPU layer creation
- **`will-change: auto`**: Optimizes for expected changes
- **`backface-visibility: hidden`**: Prevents unnecessary backface rendering

#### CSS Containment for Rendering Performance

**Problem**: Complex layouts cause unnecessary reflows and repaints.

**Solution**: Apply CSS containment properties:
```css
.main-section {
    contain: layout style paint;
}

.image-container {
    contain: size layout style;
}
```

**Containment Benefits**:
- **Layout Isolation**: Prevents layout thrashing outside contained sections
- **Paint Optimization**: Limits repaint areas to contained elements
- **Style Recalculation**: Reduces DOM traversal for style changes

#### Critical Rendering Path Optimization

**Eliminate Blocking Resources**:
- ❌ External SVG file requests
- ❌ Base64 data URL processing delays
- ❌ Font loading dependencies for SVG text
- ❌ Complex animation JavaScript calculations

**Inline Resource Strategy**:
- ✅ SVG markup in HTML (instant availability)
- ✅ Critical CSS inlined in fragment
- ✅ Minimal JavaScript for essential functionality only
- ✅ Preloaded font fallbacks for text content

#### Lighthouse Score Impact

**Core Web Vitals Improvements**:
- **LCP (Largest Contentful Paint)**: Sub-2-second achievement
- **FID (First Input Delay)**: Minimal JavaScript execution
- **CLS (Cumulative Layout Shift)**: Stable layout, no content shifts

**Performance Category Optimizations**:
- **Render-blocking Resources**: Eliminated external dependencies
- **Image Optimization**: SVG scaling without quality loss
- **Animation Performance**: 60fps with minimal CPU usage
- **Paint Performance**: Contained rendering areas

### Liferay Fragment ZIP Structure Requirements

**Individual Fragment ZIP Structure:**
```
fragment-name/
├── fragment.json          # Main fragment metadata
├── configuration.json     # Fragment configuration schema  
├── index.html            # FreeMarker template
├── index.css             # Fragment styles
├── index.js              # Fragment JavaScript
└── thumbnail.png         # Fragment thumbnail (REQUIRED)
```

**Fragment Collection ZIP Structure:**
```
collection-name/           # Root directory REQUIRED for proper import
├── collection.json       # Collection metadata (name, description)
├── fragments/
│   ├── fragment-name-1/
│   │   ├── fragment.json
│   │   ├── configuration.json
│   │   ├── index.html
│   │   ├── index.css
│   │   ├── index.js
│   │   └── thumbnail.png
│   └── ...
└── resources/            # Optional shared resources
    ├── icon-1.svg
    ├── logo.png
    └── ...
```

**Critical ZIP Creation (Python Implementation):**
```python
import zipfile
import os

with zipfile.ZipFile('collection.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipf.write('collection.json', 'collection-name/collection.json')
    zipf.write('resources', 'collection-name/resources/')
    # Add all files with collection-name/ prefix
```

**Fragment Collection Resources Implementation:**
- **Resources Directory**: Place all shared assets (SVG, PNG, etc.) in `resources/` at collection root
- **Reference Syntax**: Use `[resources:filename.svg]` in fragment HTML to reference collection resources
- **Performance Benefits**: Resources are cached and shared across all fragments in the collection

**Key Requirements:**
- Fragment ZIP: Must contain fragment folder with all files inside
- Collection ZIP: Must have proper root directory structure containing collection.json + fragments/ + resources/
- Fragment.json: Must include thumbnailPath (thumbnails are REQUIRED)
- Collection.json: Simple object with name and description only
- Thumbnail files: Every fragment must have thumbnail.png file (70+ bytes) and thumbnailPath reference
- Select field typeOptions: Must be object with validValues array, not direct array

### Liferay Client Extension YAML Structure Requirements

**Working Client Extension YAML Format:**
```yaml
assemble:
  - from: src
    into: static

extension-name:
  name: Human Readable Name
  type: globalCSS  # or globalJS
  url: css/file.css  # single file reference
  # For JS only:
  async: true
  data-senna-track: permanent
  fetchpriority: low
```

**Common Issues to Avoid:**
- Missing `name` field causes blank deployment
- Using `cssURLs: [array]` instead of `url: file.css` breaks loading
- Must use single file reference, not array format
- JS extensions should include async, data-senna-track attributes for SPA compatibility

## System Architecture Best Practices

### Authentication & Security
- **CSRF Protection**: All API calls secured with `?p_auth={Liferay.authtoken}` parameter
- **Conditional Rendering**: Authentication-aware UI components using `themeDisplay.isSignedIn()`
- **Native Portlet Integration**: Leverage Liferay's built-in portlets

### API Integration
- **Headless Delivery API**: Dynamic content loading from Liferay's REST APIs
- **Navigation API**: `/o/headless-delivery/v1.0/navigation-menus/{menuId}?nestedFields=true`
- **Authenticated Requests**: Consistent security parameter usage across all API calls

### Fragment Configuration System
- **Type-Safe Configuration**: Structured configuration.json with proper field types
- **Default Value Patterns**: `${configuration.fieldName!'defaultValue'}` syntax for null safety
- **Boolean Configuration**: Explicit true/false defaults for boolean fields
- **Select Options**: Dropdown configuration fields with predefined options
- **Conditional Rendering**: FreeMarker conditionals based on configuration values

### Fragment Instance Management
- **Built-in fragmentElement**: Automatic fragment container reference provided by Liferay
- **Scoped DOM Queries**: All queries use `fragmentElement.querySelector()` for instance isolation
- **Multiple Instance Support**: Prevents conflicts when same fragment appears multiple times
- **CSS Scoping**: Fragment-specific styling using `[data-lfr-fragment-entry-link-id]` selectors

### Fragment Collection Resources System
- **Shared Asset Management**: Resources directory enables sharing assets across multiple fragments
- **Reference Syntax**: `[resources:filename.ext]` in FreeMarker templates automatically resolves to collection resources
- **Performance Optimization**: Resources are cached by Liferay and served efficiently
- **Asset Organization**: Supports subdirectories within resources/ for organized asset structure

## Data Flow Pattern

1. **Fragment Initialization**: Liferay provides `fragmentElement` and `configuration` objects
2. **Configuration Processing**: Fragment reads settings from configuration.json values
3. **API Authentication**: Security token retrieved from `Liferay.authtoken`
4. **Data Fetching**: Authenticated API calls to Liferay's Headless Delivery endpoints
5. **DOM Manipulation**: Updates scoped to fragment instance using `fragmentElement`
6. **Event Handling**: SennaJS navigation events ensure proper lifecycle management

## External Dependencies

### Liferay Platform Services
- **Headless Delivery API**: RESTful content and navigation services
- **Authentication System**: CSRF token generation and user session management
- **Portlet Framework**: Native Liferay components
- **SennaJS**: Single Page Application navigation library
- **FreeMarker**: Server-side templating engine

### Frontend Technologies
- **Vanilla JavaScript**: No external framework dependencies for fragment logic
- **CSS3**: Modern styling with fragment-scoped selectors
- **Responsive Design**: Mobile-optimized layouts with media queries

## Implementation Best Practices

### Performance Rules
1. **Inline Critical Resources**: SVG, CSS, essential JavaScript
2. **Eliminate Network Dependencies**: No external files for above-fold content
3. **Minimize Animation Complexity**: Simple opacity transitions only
4. **Optimize Layout Stability**: Fixed proportions prevent shifts
5. **Hardware Acceleration**: GPU compositing for smooth rendering
6. **CSS Containment**: Isolated rendering performance

### Code Quality Guidelines
- Use semantic HTML structure
- Implement proper ARIA attributes for accessibility
- Follow progressive enhancement principles
- Maintain consistent naming conventions
- Document all configuration options
- Test across different screen sizes and devices

### Deployment Checklist
- [ ] All fragments have required thumbnail.png files
- [ ] Fragment collection has proper ZIP structure with root directory
- [ ] CSS is scoped with #wrapper to prevent admin interface conflicts
- [ ] JavaScript is scoped to fragmentElement for proper isolation
- [ ] All images have editable attributes where appropriate
- [ ] Client extensions use proper YAML format with name field
- [ ] Performance optimizations applied (inline SVG, simple animations)
- [ ] Cross-browser compatibility tested
- [ ] Responsive design verified on mobile devices
- [ ] Accessibility standards met (WCAG compliance)