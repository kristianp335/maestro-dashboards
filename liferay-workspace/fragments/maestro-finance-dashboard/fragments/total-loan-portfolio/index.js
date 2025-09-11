/**
 * Total Loan Portfolio KPI Fragment JavaScript
 * Loads portfolio data and displays total loan value with trends
 */

(function() {
    'use strict';
    
    // Use Liferay-provided fragmentElement (preferred) or fallback to script parent
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    // Initialize the KPI when fragment loads
    if (root) {
        initializeTotalLoanPortfolioKPI();
    }
    
    function initializeTotalLoanPortfolioKPI() {
        // Wait for global utilities to be available
        if (typeof window.MaestroUtils === 'undefined') {
            setTimeout(initializeTotalLoanPortfolioKPI, 100);
            return;
        }
        
        setupConfiguration();
        loadPortfolioData();
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
    
    function loadPortfolioData() {
        const container = root.querySelector('.maestro-single-kpi');
        if (!container) {
            console.error('Portfolio KPI container not found');
            return;
        }
        
        container.classList.add('loading');
        
        // Load loan data to calculate total portfolio value
        window.MaestroUtils.loadObjectData('MaestroLoan', function(error, data) {
            container.classList.remove('loading');
            
            if (error) {
                console.warn('Failed to load loan data:', error);
                showErrorMessage('Unable to load portfolio data');
                return;
            }
            
            if (data && data.items && data.items.length > 0) {
                try {
                    calculateAndUpdatePortfolio(data.items);
                    hideErrorMessage();
                } catch (updateError) {
                    console.error('Error updating portfolio KPI:', updateError);
                    showErrorMessage('Error calculating portfolio value');
                }
            } else {
                console.warn('No loan data received');
                showErrorMessage('No portfolio data available');
            }
        });
    }
    
    function calculateAndUpdatePortfolio(loans) {
        // Calculate total portfolio value from all active loans
        let totalValue = 0;
        let previousValue = 0;
        const currentDate = new Date();
        const lastMonthDate = new Date(currentDate);
        lastMonthDate.setMonth(currentDate.getMonth() - 1);
        
        loans.forEach(loan => {
            if (loan.loanStatus && 
                (loan.loanStatus.key === 'active' || loan.loanStatus.key === 'approved')) {
                const loanAmount = parseFloat(loan.loanAmount) || 0;
                totalValue += loanAmount;
                
                // Calculate previous month value for trend
                const loanDate = new Date(loan.originationDate || loan.createdDate);
                if (loanDate < lastMonthDate) {
                    previousValue += loanAmount;
                }
            }
        });
        
        // Update the KPI display
        updatePortfolioDisplay(totalValue, previousValue);
    }
    
    function updatePortfolioDisplay(currentValue, previousValue) {
        const valueElement = root.querySelector('.kpi-value');
        const changeElement = root.querySelector('.trend-text');
        const arrowElement = root.querySelector('.trend-arrow');
        const changeContainer = root.querySelector('.kpi-change');
        
        if (valueElement) {
            valueElement.textContent = window.MaestroUtils.formatCurrency(currentValue);
        }
        
        // Calculate and display trend
        if (changeElement && previousValue > 0) {
            const changePercent = ((currentValue - previousValue) / previousValue * 100).toFixed(1);
            const direction = currentValue >= previousValue ? '+' : '';
            
            changeElement.textContent = `${direction}${changePercent}% vs last month`;
            
            if (changeContainer) {
                changeContainer.className = `kpi-change ${currentValue >= previousValue ? 'positive' : 'negative'}`;
            }
            
            if (arrowElement) {
                arrowElement.textContent = currentValue >= previousValue ? '↑' : '↓';
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
        // Refresh portfolio data every 5 minutes
        if (window.MaestroUtils && window.MaestroUtils.startAutoRefresh) {
            window.MaestroUtils.startAutoRefresh(loadPortfolioData, 300000);
        }
    }
    
    function setupInteractions() {
        const card = root.querySelector('.maestro-kpi-card');
        if (card) {
            card.addEventListener('click', function() {
                // Emit custom event for dashboard integration
                const event = new CustomEvent('maestro:kpi-clicked', {
                    detail: {
                        kpiType: 'Total Loan Portfolio',
                        element: this
                    },
                    bubbles: true
                });
                
                root.dispatchEvent(event);
            });
        }
    }
    
})();