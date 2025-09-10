/**
 * KPI Cards Fragment JavaScript
 * Handles dynamic data loading and real-time updates
 */

(function() {
    'use strict';
    
    const fragmentElement = fragmentElement || document.currentScript.parentElement;
    
    // Initialize KPI cards when fragment loads
    if (fragmentElement) {
        initializeKPICards();
    }
    
    function initializeKPICards() {
        // Wait for global utilities to be available
        if (typeof window.MaestroUtils === 'undefined') {
            setTimeout(initializeKPICards, 100);
            return;
        }
        
        loadKPIData();
        setupAutoRefresh();
        setupResponsiveKPIs();
    }
    
    function loadKPIData() {
        const dashboard = fragmentElement.querySelector('.maestro-kpi-dashboard');
        if (!dashboard) return;
        
        dashboard.classList.add('loading');
        
        // Load Performance KPI data from Liferay Objects
        window.MaestroUtils.loadObjectData('PerformanceKPI', function(error, data) {
            dashboard.classList.remove('loading');
            
            if (error) {
                console.warn('Failed to load KPI data, using defaults:', error);
                return;
            }
            
            if (data && data.items && data.items.length > 0) {
                updateKPICards(data.items);
            }
        });
    }
    
    function updateKPICards(kpiData) {
        const cards = fragmentElement.querySelectorAll('.maestro-kpi-card');
        
        // Map KPI data to cards
        const kpiMapping = {
            'Total Loan Portfolio': 'totalLoanPortfolio',
            'Active Deals': 'activeDeals',
            'Risk Exposure': 'riskExposure',
            'Monthly Revenue': 'monthlyRevenue',
            'Credit Approval Rate': 'creditApprovalRate',
            'Average Deal Size': 'averageDealSize'
        };
        
        cards.forEach(card => {
            const titleElement = card.querySelector('.kpi-title');
            const valueElement = card.querySelector('.kpi-value');
            const changeElement = card.querySelector('.kpi-change span:last-child');
            
            if (!titleElement || !valueElement) return;
            
            const title = titleElement.textContent.trim();
            const kpiKey = kpiMapping[title];
            
            if (kpiKey && kpiData[0] && kpiData[0][kpiKey]) {
                const kpiItem = kpiData[0][kpiKey];
                
                // Update value with proper formatting
                if (title.includes('Portfolio') || title.includes('Revenue') || title.includes('Size')) {
                    valueElement.textContent = window.MaestroUtils.formatCurrency(kpiItem.value);
                } else if (title.includes('Rate')) {
                    valueElement.textContent = window.MaestroUtils.formatPercent(kpiItem.value / 100);
                } else {
                    valueElement.textContent = window.MaestroUtils.formatLargeNumber(kpiItem.value);
                }
                
                // Update trend information
                if (changeElement && kpiItem.change) {
                    const changePercent = ((kpiItem.change / kpiItem.value) * 100).toFixed(1);
                    const direction = kpiItem.change >= 0 ? '+' : '';
                    changeElement.textContent = `${direction}${changePercent}% vs last period`;
                    
                    const changeContainer = changeElement.parentElement;
                    changeContainer.className = `kpi-change ${kpiItem.change >= 0 ? 'positive' : 'negative'}`;
                    
                    const arrow = changeContainer.querySelector('span:first-child');
                    if (arrow) {
                        arrow.textContent = kpiItem.change >= 0 ? '↑' : '↓';
                    }
                }
            }
        });
    }
    
    function setupAutoRefresh() {
        // Refresh KPI data every 5 minutes
        if (window.MaestroUtils && window.MaestroUtils.startAutoRefresh) {
            window.MaestroUtils.startAutoRefresh(loadKPIData, 300000);
        }
    }
    
    function setupResponsiveKPIs() {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            const dashboard = fragmentElement.querySelector('.maestro-kpi-dashboard');
            
            if (dashboard) {
                if (isMobile) {
                    dashboard.classList.add('maestro-mobile');
                } else {
                    dashboard.classList.remove('maestro-mobile');
                }
            }
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
    }
    
    // Add click handlers for interactive KPI cards
    fragmentElement.querySelectorAll('.maestro-kpi-card').forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.kpi-title')?.textContent.trim();
            
            // Emit custom event for dashboard integration
            const event = new CustomEvent('maestro:kpi-clicked', {
                detail: {
                    kpiType: title,
                    element: this
                },
                bubbles: true
            });
            
            fragmentElement.dispatchEvent(event);
        });
    });
    
})();