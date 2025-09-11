/**
 * Exceptions KPI Fragment JavaScript
 * Loads GFD activities data and counts exceptions/errors
 */

(function() {
    'use strict';
    
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    if (root) {
        initializeExceptionsKPI();
    }
    
    function initializeExceptionsKPI() {
        if (typeof window.MaestroUtils === 'undefined') {
            setTimeout(initializeExceptionsKPI, 100);
            return;
        }
        
        setupConfiguration();
        loadExceptionsData();
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
    
    function loadExceptionsData() {
        const container = root.querySelector('.maestro-single-kpi');
        if (!container) return;
        
        container.classList.add('loading');
        
        window.MaestroUtils.loadObjectData('GFDActivities', function(error, data) {
            container.classList.remove('loading');
            
            if (error) {
                console.warn('Failed to load exceptions data:', error);
                showErrorMessage('Unable to load exceptions data');
                return;
            }
            
            if (data && data.items && data.items.length > 0) {
                try {
                    calculateAndUpdateExceptions(data.items);
                    hideErrorMessage();
                } catch (updateError) {
                    console.error('Error updating exceptions KPI:', updateError);
                    showErrorMessage('Error calculating exceptions');
                }
            } else {
                showErrorMessage('No exceptions data available');
            }
        });
    }
    
    function calculateAndUpdateExceptions(activities) {
        let currentExceptions = 0;
        let resolvedToday = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        activities.forEach(activity => {
            const status = activity.activityStatus?.key || activity.activityStatus || '';
            const activityDate = new Date(activity.activityDate || activity.createdDate);
            
            // Count exceptions (cancelled or on_hold activities)
            if (status === 'cancelled' || status === 'on_hold') {
                currentExceptions++;
                
                // Check if resolved today
                if (activityDate >= today) {
                    resolvedToday++;
                }
            }
        });
        
        updateExceptionsDisplay(currentExceptions, resolvedToday);
    }
    
    function updateExceptionsDisplay(currentExceptions, resolvedToday) {
        const valueElement = root.querySelector('.kpi-value');
        const changeElement = root.querySelector('.trend-text');
        const arrowElement = root.querySelector('.trend-arrow');
        const changeContainer = root.querySelector('.kpi-change');
        
        if (valueElement) {
            valueElement.textContent = window.MaestroUtils.formatLargeNumber(currentExceptions);
        }
        
        if (changeElement) {
            const direction = resolvedToday > 0 ? '-' : '';
            changeElement.textContent = `${direction}${resolvedToday} resolved today`;
            
            if (changeContainer) {
                changeContainer.className = `kpi-change ${resolvedToday > 0 ? 'positive' : 'neutral'}`;
            }
            
            if (arrowElement) {
                arrowElement.textContent = resolvedToday > 0 ? '↓' : '→';
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
            window.MaestroUtils.startAutoRefresh(loadExceptionsData, 180000);
        }
    }
    
    function setupInteractions() {
        const card = root.querySelector('.maestro-kpi-card');
        if (card) {
            card.addEventListener('click', function() {
                const event = new CustomEvent('maestro:kpi-clicked', {
                    detail: { kpiType: 'Exceptions', element: this },
                    bubbles: true
                });
                root.dispatchEvent(event);
            });
        }
    }
    
})();