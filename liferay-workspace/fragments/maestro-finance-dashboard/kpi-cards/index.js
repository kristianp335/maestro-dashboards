/**
 * KPI Cards Fragment JavaScript
 * Handles dynamic data loading and real-time updates
 */

(function() {
    'use strict';
    
    const fragmentElement = document.currentScript ? document.currentScript.parentElement : 
                           (document.querySelector('.maestro-kpi-dashboard')?.closest('.fragment') || 
                            document.querySelector('.maestro-kpi-dashboard'));
    
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
        
        setupConfigurationHandling();
        loadKPIData();
        setupAutoRefresh();
        setupResponsiveKPIs();
    }
    
    function setupConfigurationHandling() {
        // Read configuration from the fragment's configuration system
        const config = getFragmentConfiguration();
        
        // Apply display style configuration
        if (config.displayStyle) {
            applyDisplayStyle(config.displayStyle);
        }
        
        // Apply cards to show configuration
        if (config.cardsToShow) {
            applyCardsToShow(config.cardsToShow);
        }
        
        // Apply show trends configuration
        if (config.showTrends !== undefined) {
            applyShowTrends(config.showTrends);
        }
    }
    
    function getFragmentConfiguration() {
        // In Liferay, configuration is typically available via global variables or data attributes
        let config = {};
        
        // Try to get configuration from a global variable (set by Liferay)
        if (typeof fragmentConfiguration !== 'undefined') {
            config = fragmentConfiguration;
        }
        
        // Fallback: read from data attributes on the fragment element
        if (fragmentElement && fragmentElement.dataset) {
            config.displayStyle = fragmentElement.dataset.displayStyle || 'grid';
            config.cardsToShow = fragmentElement.dataset.cardsToShow || '4';
            config.showTrends = fragmentElement.dataset.showTrends !== 'false';
        }
        
        // Final fallback: read from CSS classes that might indicate configuration
        const dashboard = fragmentElement.querySelector('.maestro-kpi-dashboard');
        if (dashboard) {
            if (dashboard.classList.contains('maestro-row-layout')) {
                config.displayStyle = 'row';
            } else if (dashboard.classList.contains('maestro-stack-layout')) {
                config.displayStyle = 'stack';
            }
        }
        
        return config;
    }
    
    function applyDisplayStyle(style) {
        const dashboard = fragmentElement.querySelector('.maestro-kpi-dashboard');
        if (!dashboard) return;
        
        // Remove existing layout classes
        dashboard.classList.remove('maestro-row-layout', 'maestro-stack-layout');
        
        // Apply new layout class
        switch(style) {
            case 'row':
                dashboard.classList.add('maestro-row-layout');
                break;
            case 'stack':
                dashboard.classList.add('maestro-stack-layout');
                break;
            case 'grid':
            default:
                // Default grid layout - no additional class needed
                break;
        }
    }
    
    function applyCardsToShow(numberOfCards) {
        const cards = fragmentElement.querySelectorAll('.maestro-kpi-card');
        const cardsToShow = parseInt(numberOfCards) || 4;
        
        cards.forEach((card, index) => {
            if (index < cardsToShow) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Adjust grid layout based on number of cards
        const dashboard = fragmentElement.querySelector('.maestro-dashboard-grid');
        if (dashboard) {
            dashboard.className = dashboard.className.replace(/maestro-cards-\d+/, '');
            dashboard.classList.add(`maestro-cards-${cardsToShow}`);
        }
    }
    
    function applyShowTrends(showTrends) {
        const changeElements = fragmentElement.querySelectorAll('.kpi-change');
        
        changeElements.forEach(element => {
            if (showTrends) {
                element.style.display = 'flex';
            } else {
                element.style.display = 'none';
            }
        });
    }
    
    function loadKPIData() {
        const dashboard = fragmentElement.querySelector('.maestro-kpi-dashboard');
        if (!dashboard) {
            console.error('KPI dashboard element not found');
            return;
        }
        
        dashboard.classList.add('loading');
        showLoadingIndicator();
        
        // Add timeout for API calls
        const loadTimeout = setTimeout(() => {
            dashboard.classList.remove('loading');
            hideLoadingIndicator();
            showErrorMessage('Data loading timeout - please refresh the page');
        }, 10000); // 10 second timeout
        
        // Load Performance KPI data from Liferay Objects
        window.MaestroUtils.loadObjectData('PerformanceKPI', function(error, data) {
            clearTimeout(loadTimeout);
            dashboard.classList.remove('loading');
            hideLoadingIndicator();
            
            if (error) {
                console.warn('Failed to load KPI data:', error);
                showErrorMessage('Unable to load latest data - displaying cached values');
                loadFallbackData();
                return;
            }
            
            if (data && data.items && data.items.length > 0) {
                try {
                    updateKPICards(data.items);
                    hideErrorMessage();
                } catch (updateError) {
                    console.error('Error updating KPI cards:', updateError);
                    showErrorMessage('Error displaying data - please refresh the page');
                }
            } else {
                console.warn('No KPI data received, using fallback');
                loadFallbackData();
            }
        });
    }
    
    function showLoadingIndicator() {
        const dashboard = fragmentElement.querySelector('.maestro-kpi-dashboard');
        if (!dashboard) return;
        
        // Add loading overlay if it doesn't exist
        let loadingOverlay = dashboard.querySelector('.maestro-loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'maestro-loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="maestro-loading-spinner">
                    <div class="spinner"></div>
                    <span>Loading KPI data...</span>
                </div>
            `;
            dashboard.appendChild(loadingOverlay);
        }
        loadingOverlay.style.display = 'flex';
    }
    
    function hideLoadingIndicator() {
        const loadingOverlay = fragmentElement.querySelector('.maestro-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    function showErrorMessage(message) {
        const dashboard = fragmentElement.querySelector('.maestro-kpi-dashboard');
        if (!dashboard) return;
        
        // Remove existing error message
        const existingError = dashboard.querySelector('.maestro-error-banner');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorBanner = document.createElement('div');
        errorBanner.className = 'maestro-error-banner';
        errorBanner.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
                <button class="error-dismiss" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        dashboard.insertBefore(errorBanner, dashboard.firstChild);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (errorBanner.parentNode) {
                errorBanner.remove();
            }
        }, 10000);
    }
    
    function hideErrorMessage() {
        const errorBanner = fragmentElement.querySelector('.maestro-error-banner');
        if (errorBanner) {
            errorBanner.remove();
        }
    }
    
    function loadFallbackData() {
        // Use the fallback data from the HTML or generate basic fallback
        console.info('Using fallback KPI data');
        
        try {
            // Try to extract data from existing HTML elements as fallback
            const cards = fragmentElement.querySelectorAll('.maestro-kpi-card');
            cards.forEach(card => {
                const valueElement = card.querySelector('.kpi-value');
                if (valueElement && !valueElement.textContent.trim()) {
                    // Set default values if empty
                    const title = card.querySelector('.kpi-title')?.textContent.trim() || '';
                    switch(title) {
                        case 'Total Loan Portfolio':
                            valueElement.textContent = '€2.47B';
                            break;
                        case 'Active Deals':
                            valueElement.textContent = '147';
                            break;
                        case 'Risk Exposure':
                            valueElement.textContent = '€156M';
                            break;
                        case 'Monthly Revenue':
                            valueElement.textContent = '€45.2M';
                            break;
                        default:
                            valueElement.textContent = 'N/A';
                    }
                }
            });
        } catch (fallbackError) {
            console.error('Error loading fallback data:', fallbackError);
            showErrorMessage('Critical error - please contact system administrator');
        }
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