# Maestro GFD Cockpit - Deployment Guide

## Overview

The **Maestro GFD Cockpit** is a comprehensive finance dashboard solution designed specifically for Credit Agricole CIB's Global Finance Data (GFD) operations. This Liferay-based solution provides advanced analytics, deal management, risk monitoring, and KPI tracking capabilities.

## Package Contents

### Client Extensions
1. **maestro-frontend-client-extension.zip**
   - CA-CIB branded frontend assets
   - Global JavaScript utilities (MaestroUtils)
   - Professional green/dark blue styling
   - Chart.js integration support

2. **maestro-objects-client-extension.zip**
   - Complete Liferay Objects data model
   - 7 object definitions for financial data
   - Proper field types and validation rules
   - Company-scoped for multi-tenancy

3. **maestro-batch-objects-client-extension.zip**
   - Sample financial data import system
   - Realistic French corporate banking data
   - Batch import configuration for all objects
   - Production-ready data examples

### Fragment Collections
4. **maestro-finance-dashboard-fragments.zip**
   - 5 complete dashboard fragments
   - KPI Cards, Loan Analytics, Deal Management
   - Risk Dashboard, GFD Tracking
   - Responsive mobile-first design

## System Requirements

- **Liferay DXP 7.4+** (recommended: latest version)
- **Modern web browser** with JavaScript support
- **Database** for Liferay Objects storage
- **Network access** for CDN resources (Chart.js)

## Pre-Deployment Setup

### 1. Liferay Instance Preparation

1. Ensure your Liferay DXP instance is running and accessible
2. Verify you have administrative privileges
3. Confirm Object API and Fragment collections are enabled
4. Test that your instance supports Client Extensions

### 2. Required Permissions

Ensure the deploying user has:
- **System Administrator** role
- **Object Admin** permissions
- **Fragment Collection** management rights
- **Client Extension** deployment rights

## Deployment Instructions

### Phase 1: Frontend Client Extension

1. **Extract the frontend package:**
   ```bash
   unzip maestro-frontend-client-extension.zip
   ```

2. **Deploy via Liferay CLI or manually:**
   - Navigate to your Liferay workspace
   - Copy the extracted `maestro-frontend` folder to `client-extensions/`
   - Deploy using: `blade gw deploy`
   - Or upload via Control Panel > Apps > Client Extensions

3. **Verify deployment:**
   - Check Control Panel > Apps > Client Extensions
   - Confirm "Maestro Frontend" is listed and active
   - Test that CSS variables are available globally

### Phase 2: Object Definitions

1. **Extract and deploy objects:**
   ```bash
   unzip maestro-objects-client-extension.zip
   ```

2. **Deploy the objects client extension:**
   - Follow same deployment process as frontend
   - Allow time for object creation (may take 2-3 minutes)

3. **Verify object creation:**
   - Navigate to Control Panel > Objects
   - Confirm all 7 objects are created:
     - Maestro Loans
     - Maestro Deals  
     - Maestro Clients
     - Risk Metrics
     - Performance KPIs
     - Workflow Metrics
     - GFD Activities

### Phase 3: Fragment Collection

1. **Extract fragments:**
   ```bash
   unzip maestro-finance-dashboard-fragments.zip
   ```

2. **Import fragment collection:**
   - Navigate to Site Builder > Fragments
   - Click "Import" and upload the fragment collection
   - Or manually copy to fragments folder and deploy

3. **Verify fragments:**
   - Confirm "Maestro Finance Dashboard" collection exists
   - Check all 5 fragments are available:
     - KPI Cards
     - Loan Analytics
     - Deal Management
     - Risk Dashboard
     - GFD Tracking

### Phase 4: Sample Data Import (Optional)

**Important**: The batch client extension does NOT automatically import data when deployed. It only provides the sample data files. You must manually import the data using one of the methods below.

#### Method 1: REST API Import (Recommended)

1. **Extract sample data files:**
   ```bash
   unzip maestro-batch-objects-client-extension.zip
   cd client-extensions/maestro-batch-objects/batch/
   ```

2. **Set up authentication variables:**
   ```bash
   # Replace with your Liferay instance details
   LIFERAY_HOST="https://your-liferay-instance.com"
   # Use Basic Auth with admin credentials
   AUTH_HEADER="Authorization: Basic $(echo -n 'admin@liferay.com:password' | base64)"
   # Or use OAuth2 token if available
   # AUTH_HEADER="Authorization: Bearer your-oauth2-token"
   ```

3. **Import each data set using curl:**
   ```bash
   # Import Loans
   curl -X POST "$LIFERAY_HOST/o/object-admin/v1.0/object-definitions/by-externalReferenceCode/MaestroLoan/object-entries/batch" \
     -H "Content-Type: application/json" \
     -H "$AUTH_HEADER" \
     -d @maestro-loans-sample-data.json

   # Import Deals  
   curl -X POST "$LIFERAY_HOST/o/object-admin/v1.0/object-definitions/by-externalReferenceCode/MaestroDeal/object-entries/batch" \
     -H "Content-Type: application/json" \
     -H "$AUTH_HEADER" \
     -d @maestro-deals-sample-data.json

   # Import Clients
   curl -X POST "$LIFERAY_HOST/o/object-admin/v1.0/object-definitions/by-externalReferenceCode/MaestroClient/object-entries/batch" \
     -H "Content-Type: application/json" \
     -H "$AUTH_HEADER" \
     -d @maestro-clients-sample-data.json

   # Import Risk Metrics
   curl -X POST "$LIFERAY_HOST/o/object-admin/v1.0/object-definitions/by-externalReferenceCode/MaestroRiskMetrics/object-entries/batch" \
     -H "Content-Type: application/json" \
     -H "$AUTH_HEADER" \
     -d @maestro-risk-metrics-sample-data.json

   # Import Performance KPIs
   curl -X POST "$LIFERAY_HOST/o/object-admin/v1.0/object-definitions/by-externalReferenceCode/MaestroPerformanceKPIs/object-entries/batch" \
     -H "Content-Type: application/json" \
     -H "$AUTH_HEADER" \
     -d @maestro-performance-kpis-sample-data.json

   # Import Workflow Metrics
   curl -X POST "$LIFERAY_HOST/o/object-admin/v1.0/object-definitions/by-externalReferenceCode/MaestroWorkflowMetrics/object-entries/batch" \
     -H "Content-Type: application/json" \
     -H "$AUTH_HEADER" \
     -d @maestro-workflow-metrics-sample-data.json

   # Import GFD Activities
   curl -X POST "$LIFERAY_HOST/o/object-admin/v1.0/object-definitions/by-externalReferenceCode/MaestroGFDActivities/object-entries/batch" \
     -H "Content-Type: application/json" \
     -H "$AUTH_HEADER" \
     -d @maestro-gfd-activities-sample-data.json
   ```

#### Method 2: Liferay Batch Planner (Alternative)

1. **Access Batch Planner:**
   - Navigate to Global Menu > Commerce > Batch Planner
   - Or Control Panel > Object Admin > Import/Export

2. **Create import plans:**
   - Create a new batch plan for each object type
   - Upload the corresponding JSON file
   - Configure field mappings if needed
   - Execute the import plan

3. **Monitor import progress:**
   - Check Batch Planner logs for any errors
   - Verify import completion status
   - Review any failed entries

#### Data Import Verification

1. **Check each object for sample data:**
   - Navigate to Control Panel > Objects
   - Open each Maestro object definition
   - Verify entries were created successfully
   - Confirm data relationships are intact

2. **Test fragment functionality:**
   - Navigate to your dashboard page
   - Verify all fragments display data correctly
   - Check charts and visualizations load properly
   - Test filtering and interactive features

## Post-Deployment Configuration

### 1. Create Dashboard Page

1. **Create new page:**
   - Site Builder > Pages > Add Page
   - Choose "Content Page" type
   - Name: "Finance Dashboard" or similar

2. **Add fragments to page:**
   - Drag fragments from "Maestro Finance Dashboard" collection
   - Arrange in desired layout (recommended: KPI Cards at top)
   - Configure fragment settings as needed

3. **Configure fragment settings:**
   - Each fragment has configuration options
   - Set display preferences, filters, and chart options
   - Test responsive behavior on mobile devices

### 2. Set Permissions

1. **Object permissions:**
   - Configure read/write access for financial data objects
   - Set up appropriate user roles and permissions
   - Test data access with non-admin users

2. **Page permissions:**
   - Grant appropriate users access to dashboard page
   - Configure view permissions for different user roles

### 3. Customize Branding

1. **Verify CA-CIB branding:**
   - Check that green/dark blue theme is applied
   - Confirm logos and styling match corporate standards
   - Test across different browsers and devices

2. **Adjust styling if needed:**
   - Modify CSS custom properties in frontend client extension
   - Update colors, fonts, or spacing as required
   - Redeploy client extension after changes

## Troubleshooting

### Common Issues

1. **Charts not loading:**
   - Verify internet connection for Chart.js CDN
   - Check browser console for JavaScript errors
   - Ensure MaestroUtils is loaded before fragments

2. **No data displaying:**
   - Confirm object definitions are active
   - Check if sample data was imported correctly
   - Verify API permissions for object access

3. **Styling issues:**
   - Clear browser cache and refresh
   - Check that frontend client extension is deployed
   - Verify CSS custom properties are available

4. **Fragment configuration errors:**
   - Check fragment JavaScript console for errors
   - Verify Liferay APIs are accessible
   - Test fragment isolation and dependencies

### Support Resources

- **Liferay Documentation:** https://learn.liferay.com/
- **Object API Reference:** Available in your Liferay instance
- **Fragment Development Guide:** Liferay developer documentation
- **Client Extensions Guide:** Latest Liferay documentation

## Performance Optimization

### 1. Data Loading

- Configure appropriate pagination limits
- Implement caching where applicable
- Monitor object query performance
- Consider data archiving strategies

### 2. Frontend Performance

- Optimize fragment JavaScript loading
- Use efficient Chart.js configurations
- Implement progressive loading for large datasets
- Monitor page load times

### 3. System Resources

- Monitor Liferay server resources
- Scale database as data grows
- Consider CDN for static assets
- Regular performance audits

## Maintenance

### Regular Tasks

1. **Data Management:**
   - Regular backup of object data
   - Periodic data cleanup and archiving
   - Monitor data growth and performance

2. **System Updates:**
   - Keep Liferay DXP updated
   - Update client extensions as needed
   - Monitor for security updates

3. **User Training:**
   - Provide training on dashboard usage
   - Document custom configurations
   - Maintain user access documentation

## Security Considerations

1. **Data Protection:**
   - Ensure sensitive financial data is properly secured
   - Configure appropriate object permissions
   - Regular security audits

2. **Access Control:**
   - Implement role-based access control
   - Regular review of user permissions
   - Monitor access logs

3. **Network Security:**
   - Secure connections to external APIs
   - Validate all data inputs
   - Regular vulnerability assessments

---

**Version:** 1.0
**Date:** September 2025
**Contact:** Your Liferay Administrator

For technical support or questions about this deployment, please contact your Liferay system administrator or Credit Agricole CIB IT support team.