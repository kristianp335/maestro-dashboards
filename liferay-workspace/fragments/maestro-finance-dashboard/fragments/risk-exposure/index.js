/**
 * Risk Exposure KPI Fragment JavaScript
 * Loads loan data and calculates risk exposure metrics
 */

(function() {
    'use strict';
    
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    if (root) {
        initializeRiskExposureKPI();
    }
    
    function initializeRiskExposureKPI() {
        if (typeof window.MaestroUtils === 'undefined') {
            setTimeout(initializeRiskExposureKPI, 100);
            return;
        }
        
        setupConfiguration();
        loadRiskData();
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
    
    function loadRiskData() {
        const container = root.querySelector('.maestro-single-kpi');
        if (!container) return;
        
        container.classList.add('loading');
        
        // Load loan data to calculate risk exposure
        window.MaestroUtils.loadObjectData('MaestroLoan', function(error, data) {
            container.classList.remove('loading');
            
            if (error) {
                console.warn('Failed to load risk data:', error);
                showErrorMessage('Unable to load risk exposure data');
                return;
            }
            
            if (data && data.items && data.items.length > 0) {
                try {
                    calculateAndUpdateRiskExposure(data.items);
                    hideErrorMessage();
                } catch (updateError) {
                    console.error('Error updating risk exposure KPI:', updateError);
                    showErrorMessage('Error calculating risk exposure');
                }
            } else {
                showErrorMessage('No risk data available');
            }
        });
    }
    
    function calculateAndUpdateRiskExposure(loans) {
        let currentRisk = 0;
        let previousRisk = 0;
        const currentDate = new Date();
        const lastMonthDate = new Date(currentDate);
        lastMonthDate.setMonth(currentDate.getMonth() - 1);
        
        loans.forEach(loan => {
            const loanAmount = parseFloat(loan.loanAmount) || 0;
            const riskRating = loan.riskRating?.key || loan.riskRating || 'BBB';
            
            // Calculate risk weight based on rating
            let riskWeight = 0.1; // Default 10%
            if (riskRating.includes('BBB') || riskRating.includes('BB')) riskWeight = 0.15;
            if (riskRating.includes('B') || riskRating.includes('CCC')) riskWeight = 0.25;
            
            const riskAmount = loanAmount * riskWeight;
            currentRisk += riskAmount;
            
            // Calculate previous month for trend
            const loanDate = new Date(loan.originationDate || loan.createdDate);
            if (loanDate < lastMonthDate) {
                previousRisk += riskAmount;
            }
        });
        
        updateRiskDisplay(currentRisk, previousRisk);
    }
    
    function updateRiskDisplay(currentRisk, previousRisk) {
        const valueElement = root.querySelector('.kpi-value');
        const changeElement = root.querySelector('.trend-text');
        const arrowElement = root.querySelector('.trend-arrow');
        const changeContainer = root.querySelector('.kpi-change');
        
        if (valueElement) {
            valueElement.textContent = window.MaestroUtils.formatCurrency(currentRisk);
        }
        
        if (changeElement && previousRisk > 0) {
            const changePercent = ((currentRisk - previousRisk) / previousRisk * 100).toFixed(1);
            const direction = currentRisk <= previousRisk ? '-' : '+';
            
            changeElement.textContent = `${direction}${Math.abs(changePercent)}% ${currentRisk <= previousRisk ? 'reduced exposure' : 'increased exposure'}`;
            
            if (changeContainer) {
                changeContainer.className = `kpi-change ${currentRisk <= previousRisk ? 'positive' : 'negative'}`;
            }
            
            if (arrowElement) {
                arrowElement.textContent = currentRisk <= previousRisk ? '↓' : '↑';
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
            window.MaestroUtils.startAutoRefresh(loadRiskData, 300000);
        }
    }
    
    function setupInteractions() {
        const card = root.querySelector('.maestro-kpi-card');
        if (card) {
            card.addEventListener('click', function() {
                const event = new CustomEvent('maestro:kpi-clicked', {
                    detail: { kpiType: 'Risk Exposure', element: this },
                    bubbles: true
                });
                root.dispatchEvent(event);
            });
        }
    }
    
})();