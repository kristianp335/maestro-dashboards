/**
 * Active Workflows KPI Fragment JavaScript
 * Loads GFD activities data and counts active workflows
 */

(function() {
    'use strict';
    
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    if (root) {
        initializeActiveWorkflowsKPI();
    }
    
    function initializeActiveWorkflowsKPI() {
        if (typeof window.MaestroUtils === 'undefined') {
            setTimeout(initializeActiveWorkflowsKPI, 100);
            return;
        }
        
        setupConfiguration();
        loadWorkflowData();
        setupAutoRefresh();
        setupInteractions();
    }
    
    function setupConfiguration() {
        const config = getFragmentConfiguration();
        if (config.showTrends !== undefined) {
            applyShowTrends(config.showTrends);
        }
    }
    
    function getFragmentConfiguration() {
        let config = {};
        if (typeof fragmentConfiguration !== 'undefined') {
            config = fragmentConfiguration;
        }
        if (root && root.dataset) {
            config.showTrends = root.dataset.showTrends !== 'false';
        }
        return config;
    }
    
    function applyShowTrends(showTrends) {
        const changeElement = root.querySelector('.kpi-change');
        if (changeElement) {
            changeElement.style.display = showTrends ? 'flex' : 'none';
        }
    }
    
    function loadWorkflowData() {
        const container = root.querySelector('.maestro-single-kpi');
        if (!container) return;
        
        container.classList.add('loading');
        
        // Load GFD activities to count active workflows
        window.MaestroUtils.loadObjectData('GFDActivities', function(error, data) {
            container.classList.remove('loading');
            
            if (error) {
                console.warn('Failed to load workflow data:', error);
                showErrorMessage('Unable to load workflow data');
                return;
            }
            
            if (data && data.items && data.items.length > 0) {
                try {
                    calculateAndUpdateWorkflows(data.items);
                    hideErrorMessage();
                } catch (updateError) {
                    console.error('Error updating workflows KPI:', updateError);
                    showErrorMessage('Error calculating workflows');
                }
            } else {
                showErrorMessage('No workflow data available');
            }
        });
    }
    
    function calculateAndUpdateWorkflows(activities) {
        let activeCount = 0;
        let newThisWeek = 0;
        const currentDate = new Date();
        const lastWeekDate = new Date(currentDate);
        lastWeekDate.setDate(currentDate.getDate() - 7);
        
        activities.forEach(activity => {
            const status = activity.activityStatus?.key || activity.activityStatus || '';
            
            // Count as active if in progress
            if (status === 'in_progress' || status === 'planned') {
                activeCount++;
                
                // Check if activity started this week
                const activityDate = new Date(activity.activityDate || activity.createdDate);
                if (activityDate >= lastWeekDate && status === 'in_progress') {
                    newThisWeek++;
                }
            }
        });
        
        updateWorkflowsDisplay(activeCount, newThisWeek);
    }
    
    function updateWorkflowsDisplay(activeCount, newThisWeek) {
        const valueElement = root.querySelector('.kpi-value');
        const changeElement = root.querySelector('.trend-text');
        const arrowElement = root.querySelector('.trend-arrow');
        const changeContainer = root.querySelector('.kpi-change');
        
        if (valueElement) {
            valueElement.textContent = window.MaestroUtils.formatLargeNumber(activeCount);
        }
        
        if (changeElement) {
            const direction = newThisWeek > 0 ? '+' : '';
            changeElement.textContent = `${direction}${newThisWeek} this week`;
            
            if (changeContainer) {
                changeContainer.className = `kpi-change ${newThisWeek > 0 ? 'positive' : 'neutral'}`;
            }
            
            if (arrowElement) {
                arrowElement.textContent = newThisWeek > 0 ? '↑' : '→';
            }
        }
    }
    
    function showErrorMessage(message) {
        const container = root.querySelector('.maestro-single-kpi');
        if (!container) return;
        
        const existingError = container.querySelector('.maestro-error-banner');
        if (existingError) existingError.remove();
        
        const errorBanner = document.createElement('div');
        errorBanner.className = 'maestro-error-banner';
        errorBanner.textContent = message;
        container.insertBefore(errorBanner, container.firstChild);
        
        setTimeout(() => {
            if (errorBanner.parentNode) errorBanner.remove();
        }, 8000);
    }
    
    function hideErrorMessage() {
        const errorBanner = root.querySelector('.maestro-error-banner');
        if (errorBanner) errorBanner.remove();
    }
    
    function setupAutoRefresh() {
        if (window.MaestroUtils && window.MaestroUtils.startAutoRefresh) {
            window.MaestroUtils.startAutoRefresh(loadWorkflowData, 180000);
        }
    }
    
    function setupInteractions() {
        const card = root.querySelector('.maestro-kpi-card');
        if (card) {
            card.addEventListener('click', function() {
                const event = new CustomEvent('maestro:kpi-clicked', {
                    detail: { kpiType: 'Active Workflows', element: this },
                    bubbles: true
                });
                root.dispatchEvent(event);
            });
        }
    }
    
})();