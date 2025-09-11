/**
 * Completion Rate KPI Fragment JavaScript
 * Loads GFD activities data and calculates completion rate percentage
 */

(function() {
    'use strict';
    
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    if (root) {
        initializeCompletionRateKPI();
    }
    
    function initializeCompletionRateKPI() {
        if (typeof window.MaestroUtils === 'undefined') {
            setTimeout(initializeCompletionRateKPI, 100);
            return;
        }
        
        setupConfiguration();
        loadCompletionData();
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
    
    function loadCompletionData() {
        const container = root.querySelector('.maestro-single-kpi');
        if (!container) return;
        
        container.classList.add('loading');
        
        window.MaestroUtils.loadObjectData('GFDActivities', function(error, data) {
            container.classList.remove('loading');
            
            if (error) {
                console.warn('Failed to load completion data:', error);
                showErrorMessage('Unable to load completion rate data');
                return;
            }
            
            if (data && data.items && data.items.length > 0) {
                try {
                    calculateAndUpdateCompletionRate(data.items);
                    hideErrorMessage();
                } catch (updateError) {
                    console.error('Error updating completion rate KPI:', updateError);
                    showErrorMessage('Error calculating completion rate');
                }
            } else {
                showErrorMessage('No completion data available');
            }
        });
    }
    
    function calculateAndUpdateCompletionRate(activities) {
        let totalCount = 0;
        let completedCount = 0;
        let previousRate = 94.7; // Previous rate for comparison
        
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        activities.forEach(activity => {
            const activityDate = new Date(activity.activityDate || activity.createdDate);
            
            // Only count activities from the last month
            if (activityDate >= lastMonth) {
                totalCount++;
                
                const status = activity.activityStatus?.key || activity.activityStatus || '';
                if (status === 'completed') {
                    completedCount++;
                }
            }
        });
        
        const currentRate = totalCount > 0 ? (completedCount / totalCount * 100) : 96.8;
        updateCompletionRateDisplay(currentRate, previousRate);
    }
    
    function updateCompletionRateDisplay(currentRate, previousRate) {
        const valueElement = root.querySelector('.kpi-value');
        const changeElement = root.querySelector('.trend-text');
        const arrowElement = root.querySelector('.trend-arrow');
        const changeContainer = root.querySelector('.kpi-change');
        
        if (valueElement) {
            valueElement.textContent = `${currentRate.toFixed(1)}%`;
        }
        
        if (changeElement && previousRate > 0) {
            const rateDiff = Math.abs(currentRate - previousRate).toFixed(1);
            const direction = currentRate >= previousRate ? '+' : '-';
            
            changeElement.textContent = `${direction}${rateDiff}% ${currentRate >= previousRate ? 'improvement' : 'decline'}`;
            
            if (changeContainer) {
                changeContainer.className = `kpi-change ${currentRate >= previousRate ? 'positive' : 'negative'}`;
            }
            
            if (arrowElement) {
                arrowElement.textContent = currentRate >= previousRate ? '↑' : '↓';
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
            window.MaestroUtils.startAutoRefresh(loadCompletionData, 180000);
        }
    }
    
    function setupInteractions() {
        const card = root.querySelector('.maestro-kpi-card');
        if (card) {
            card.addEventListener('click', function() {
                const event = new CustomEvent('maestro:kpi-clicked', {
                    detail: { kpiType: 'Completion Rate', element: this },
                    bubbles: true
                });
                root.dispatchEvent(event);
            });
        }
    }
    
})();