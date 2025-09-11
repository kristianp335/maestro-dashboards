/**
 * Monthly Revenue KPI Fragment JavaScript
 * Loads deal data and calculates monthly revenue metrics
 */

(function() {
    'use strict';
    
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    if (root) {
        initializeMonthlyRevenueKPI();
    }
    
    function initializeMonthlyRevenueKPI() {
        if (typeof window.MaestroUtils === 'undefined') {
            setTimeout(initializeMonthlyRevenueKPI, 100);
            return;
        }
        
        setupConfiguration();
        loadRevenueData();
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
    
    function loadRevenueData() {
        const container = root.querySelector('.maestro-single-kpi');
        if (!container) return;
        
        container.classList.add('loading');
        
        // Load deal data to calculate monthly revenue from closed deals
        window.MaestroUtils.loadObjectData('MaestroDeal', function(error, data) {
            container.classList.remove('loading');
            
            if (error) {
                console.warn('Failed to load revenue data:', error);
                showErrorMessage('Unable to load revenue data');
                return;
            }
            
            if (data && data.items && data.items.length > 0) {
                try {
                    calculateAndUpdateRevenue(data.items);
                    hideErrorMessage();
                } catch (updateError) {
                    console.error('Error updating revenue KPI:', updateError);
                    showErrorMessage('Error calculating revenue');
                }
            } else {
                showErrorMessage('No revenue data available');
            }
        });
    }
    
    function calculateAndUpdateRevenue(deals) {
        let currentRevenue = 0;
        let targetRevenue = 42000000; // €42M target
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        deals.forEach(deal => {
            const status = deal.dealStatus?.key || deal.dealStatus || '';
            
            if (status === 'closedwon') {
                const dealValue = parseFloat(deal.dealValue) || 0;
                const dealDate = new Date(deal.lastUpdated || deal.expectedClosingDate);
                
                // Only count deals closed this month
                if (dealDate.getMonth() === currentMonth && dealDate.getFullYear() === currentYear) {
                    // Assume 3% commission rate
                    currentRevenue += dealValue * 0.03;
                }
            }
        });
        
        updateRevenueDisplay(currentRevenue, targetRevenue);
    }
    
    function updateRevenueDisplay(currentRevenue, targetRevenue) {
        const valueElement = root.querySelector('.kpi-value');
        const changeElement = root.querySelector('.trend-text');
        const arrowElement = root.querySelector('.trend-arrow');
        const changeContainer = root.querySelector('.kpi-change');
        
        if (valueElement) {
            valueElement.textContent = window.MaestroUtils.formatCurrency(currentRevenue);
        }
        
        if (changeElement && targetRevenue > 0) {
            const percentVsTarget = ((currentRevenue - targetRevenue) / targetRevenue * 100).toFixed(1);
            const direction = currentRevenue >= targetRevenue ? '+' : '';
            
            changeElement.textContent = `${direction}${percentVsTarget}% ${currentRevenue >= targetRevenue ? 'above target' : 'below target'}`;
            
            if (changeContainer) {
                changeContainer.className = `kpi-change ${currentRevenue >= targetRevenue ? 'positive' : 'negative'}`;
            }
            
            if (arrowElement) {
                arrowElement.textContent = currentRevenue >= targetRevenue ? '↑' : '↓';
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
            window.MaestroUtils.startAutoRefresh(loadRevenueData, 300000);
        }
    }
    
    function setupInteractions() {
        const card = root.querySelector('.maestro-kpi-card');
        if (card) {
            card.addEventListener('click', function() {
                const event = new CustomEvent('maestro:kpi-clicked', {
                    detail: { kpiType: 'Monthly Revenue', element: this },
                    bubbles: true
                });
                root.dispatchEvent(event);
            });
        }
    }
    
})();