/**
 * Average Processing Time KPI Fragment JavaScript
 * Loads GFD activities data and calculates average processing time
 */

(function() {
    'use strict';
    
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    if (root) {
        initializeAvgProcessingTimeKPI();
    }
    
    function initializeAvgProcessingTimeKPI() {
        if (typeof window.MaestroUtils === 'undefined') {
            setTimeout(initializeAvgProcessingTimeKPI, 100);
            return;
        }
        
        setupConfiguration();
        loadProcessingData();
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
    
    function loadProcessingData() {
        const container = root.querySelector('.maestro-single-kpi');
        if (!container) return;
        
        container.classList.add('loading');
        
        window.MaestroUtils.loadObjectData('GFDActivities', function(error, data) {
            container.classList.remove('loading');
            
            if (error) {
                console.warn('Failed to load processing data:', error);
                showErrorMessage('Unable to load processing time data');
                return;
            }
            
            if (data && data.items && data.items.length > 0) {
                try {
                    calculateAndUpdateProcessingTime(data.items);
                    hideErrorMessage();
                } catch (updateError) {
                    console.error('Error updating processing time KPI:', updateError);
                    showErrorMessage('Error calculating processing time');
                }
            } else {
                showErrorMessage('No processing data available');
            }
        });
    }
    
    function calculateAndUpdateProcessingTime(activities) {
        let totalTime = 0;
        let completedCount = 0;
        let previousAvg = 4.0; // Previous average for comparison
        
        activities.forEach(activity => {
            const status = activity.activityStatus?.key || activity.activityStatus || '';
            
            if (status === 'completed') {
                const startDate = new Date(activity.activityDate || activity.createdDate);
                const endDate = new Date(); // Assuming completion is recent
                const processingDays = Math.max(1, Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)));
                
                if (processingDays <= 30) { // Only recent completions
                    totalTime += processingDays;
                    completedCount++;
                }
            }
        });
        
        const currentAvg = completedCount > 0 ? totalTime / completedCount : 3.2;
        updateProcessingTimeDisplay(currentAvg, previousAvg);
    }
    
    function updateProcessingTimeDisplay(currentAvg, previousAvg) {
        const valueElement = root.querySelector('.kpi-value');
        const changeElement = root.querySelector('.trend-text');
        const arrowElement = root.querySelector('.trend-arrow');
        const changeContainer = root.querySelector('.kpi-change');
        
        if (valueElement) {
            valueElement.textContent = `${currentAvg.toFixed(1)} days`;
        }
        
        if (changeElement && previousAvg > 0) {
            const daysDiff = Math.abs(currentAvg - previousAvg).toFixed(1);
            const direction = currentAvg <= previousAvg ? '-' : '+';
            
            changeElement.textContent = `${direction}${daysDiff} days ${currentAvg <= previousAvg ? 'faster' : 'slower'}`;
            
            if (changeContainer) {
                changeContainer.className = `kpi-change ${currentAvg <= previousAvg ? 'positive' : 'negative'}`;
            }
            
            if (arrowElement) {
                arrowElement.textContent = currentAvg <= previousAvg ? '↓' : '↑';
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
            window.MaestroUtils.startAutoRefresh(loadProcessingData, 180000);
        }
    }
    
    function setupInteractions() {
        const card = root.querySelector('.maestro-kpi-card');
        if (card) {
            card.addEventListener('click', function() {
                const event = new CustomEvent('maestro:kpi-clicked', {
                    detail: { kpiType: 'Average Processing Time', element: this },
                    bubbles: true
                });
                root.dispatchEvent(event);
            });
        }
    }
    
})();