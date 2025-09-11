/**
 * Active Deals KPI Fragment JavaScript
 * Loads deal data and displays count of active deals with trends
 */

(function() {
    'use strict';
    
    // Use Liferay-provided fragmentElement (preferred) or fallback to script parent
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    // Initialize the KPI when fragment loads
    if (root) {
        initializeActiveDealsKPI();
    }
    
    function initializeActiveDealsKPI() {
        // Wait for global utilities to be available
        if (typeof window.MaestroUtils === 'undefined') {
            setTimeout(initializeActiveDealsKPI, 100);
            return;
        }
        
        setupConfiguration();
        loadDealsData();
        setupAutoRefresh();
        setupInteractions();
    }
    
    function setupConfiguration() {
        // Read configuration from fragment configuration system
        const config = getFragmentConfiguration();
        
        // Apply show trends configuration
        if (config.showTrends !== undefined) {
            applyShowTrends(config.showTrends);
        }
    }
    
    function getFragmentConfiguration() {
        let config = {};
        
        // Try to get configuration from global variable (set by Liferay)
        if (typeof fragmentConfiguration !== 'undefined') {
            config = fragmentConfiguration;
        }
        
        // Fallback: read from data attributes
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
    
    function loadDealsData() {
        const container = root.querySelector('.maestro-single-kpi');
        if (!container) {
            console.error('Active Deals KPI container not found');
            return;
        }
        
        container.classList.add('loading');
        
        // Load deal data from Maestro Deals API
        window.MaestroUtils.loadObjectData('MaestroDeal', function(error, data) {
            container.classList.remove('loading');
            
            if (error) {
                console.warn('Failed to load deals data:', error);
                showErrorMessage('Unable to load deals data');
                return;
            }
            
            if (data && data.items && data.items.length > 0) {
                try {
                    calculateAndUpdateActiveDeals(data.items);
                    hideErrorMessage();
                } catch (updateError) {
                    console.error('Error updating active deals KPI:', updateError);
                    showErrorMessage('Error calculating active deals');
                }
            } else {
                console.warn('No deals data received');
                showErrorMessage('No deals data available');
            }
        });
    }
    
    function calculateAndUpdateActiveDeals(deals) {
        // Count active deals (not closed)
        let activeCount = 0;
        let lastWeekCount = 0;
        const currentDate = new Date();
        const lastWeekDate = new Date(currentDate);
        lastWeekDate.setDate(currentDate.getDate() - 7);
        
        deals.forEach(deal => {
            const status = deal.dealStatus?.key || deal.dealStatus || '';
            
            // Count as active if not closed
            if (status !== 'closedwon' && status !== 'closedlost') {
                activeCount++;
                
                // Check if deal was created this week for trend calculation
                const dealDate = new Date(deal.lastUpdated || deal.createdDate);
                if (dealDate >= lastWeekDate) {
                    lastWeekCount++;
                }
            }
        });
        
        // Update the KPI display
        updateActiveDealsDisplay(activeCount, lastWeekCount);
    }
    
    function updateActiveDealsDisplay(activeCount, newThisWeek) {
        const valueElement = root.querySelector('.kpi-value');
        const changeElement = root.querySelector('.trend-text');
        const arrowElement = root.querySelector('.trend-arrow');
        const changeContainer = root.querySelector('.kpi-change');
        
        if (valueElement) {
            valueElement.textContent = window.MaestroUtils.formatLargeNumber(activeCount);
        }
        
        // Update trend information
        if (changeElement && newThisWeek >= 0) {
            const direction = newThisWeek > 0 ? '+' : '';
            changeElement.textContent = `${direction}${newThisWeek} new this week`;
            
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
        
        // Remove existing error
        const existingError = container.querySelector('.maestro-error-banner');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error banner
        const errorBanner = document.createElement('div');
        errorBanner.className = 'maestro-error-banner';
        errorBanner.textContent = message;
        container.insertBefore(errorBanner, container.firstChild);
        
        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            if (errorBanner.parentNode) {
                errorBanner.remove();
            }
        }, 8000);
    }
    
    function hideErrorMessage() {
        const errorBanner = root.querySelector('.maestro-error-banner');
        if (errorBanner) {
            errorBanner.remove();
        }
    }
    
    function setupAutoRefresh() {
        // Refresh deals data every 3 minutes
        if (window.MaestroUtils && window.MaestroUtils.startAutoRefresh) {
            window.MaestroUtils.startAutoRefresh(loadDealsData, 180000);
        }
    }
    
    function setupInteractions() {
        const card = root.querySelector('.maestro-kpi-card');
        if (card) {
            card.addEventListener('click', function() {
                // Emit custom event for dashboard integration
                const event = new CustomEvent('maestro:kpi-clicked', {
                    detail: {
                        kpiType: 'Active Deals',
                        element: this
                    },
                    bubbles: true
                });
                
                root.dispatchEvent(event);
            });
        }
    }
    
})();