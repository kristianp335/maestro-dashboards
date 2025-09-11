/**
 * Maestro GFD Cockpit - Frontend Client Extension JavaScript
 * Global functionality for Finance Dashboard
 */

(function() {
    'use strict';
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMaestro);
    } else {
        initializeMaestro();
    }
    
    function initializeMaestro() {
        initializeFinancialFormatting();
        initializeChartDefaults();
        initializeTableSorting();
        initializeResponsiveHandling();
    }
    
    // Financial number formatting utilities
    function initializeFinancialFormatting() {
        window.MaestroUtils = window.MaestroUtils || {};
        
        window.MaestroUtils.formatCurrency = function(amount, currency = 'EUR') {
            return new Intl.NumberFormat('en-EU', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(amount);
        };
        
        window.MaestroUtils.formatLargeNumber = function(num) {
            if (num >= 1e9) {
                return (num / 1e9).toFixed(1) + 'B';
            } else if (num >= 1e6) {
                return (num / 1e6).toFixed(1) + 'M';
            } else if (num >= 1e3) {
                return (num / 1e3).toFixed(1) + 'K';
            }
            return num.toString();
        };
        
        window.MaestroUtils.formatPercent = function(value, decimals = 1) {
            return (value * 100).toFixed(decimals) + '%';
        };
        
        window.MaestroUtils.getRiskColor = function(riskLevel) {
            switch(riskLevel?.toLowerCase()) {
                case 'low': return 'var(--success-green)';
                case 'medium': return 'var(--warning-orange)';
                case 'high': return 'var(--danger-red)';
                default: return 'var(--ca-cib-dark-gray)';
            }
        };
    }
    
    // Chart.js default configuration
    function initializeChartDefaults() {
        if (typeof Chart !== 'undefined') {
            Chart.defaults.font.family = 'var(--font-family-primary)';
            Chart.defaults.color = 'var(--ca-cib-dark-gray)';
            Chart.defaults.plugins.legend.position = 'bottom';
            Chart.defaults.plugins.legend.labels.usePointStyle = true;
            Chart.defaults.plugins.legend.labels.padding = 20;
            
            // CA-CIB color palette for charts
            window.MaestroChartColors = {
                primary: ['#00A651', '#003366', '#17a2b8', '#ffc107', '#28a745'],
                gradients: {
                    green: 'linear-gradient(135deg, #00A651 0%, #28a745 100%)',
                    blue: 'linear-gradient(135deg, #003366 0%, #17a2b8 100%)',
                    neutral: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)'
                }
            };
        }
    }
    
    // Enhanced table sorting for financial data
    function initializeTableSorting() {
        document.querySelectorAll('.maestro-data-table th[data-sortable]').forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', function() {
                const table = this.closest('table');
                const tbody = table.querySelector('tbody');
                const columnIndex = Array.from(this.parentNode.children).indexOf(this);
                const currentSort = this.getAttribute('data-sort') || 'none';
                const newSort = currentSort === 'asc' ? 'desc' : 'asc';
                
                // Clear other sort indicators
                table.querySelectorAll('th').forEach(th => {
                    th.removeAttribute('data-sort');
                    th.innerHTML = th.innerHTML.replace(/ ↑| ↓/g, '');
                });
                
                // Set new sort
                this.setAttribute('data-sort', newSort);
                this.innerHTML += newSort === 'asc' ? ' ↑' : ' ↓';
                
                // Sort the table
                const rows = Array.from(tbody.querySelectorAll('tr'));
                rows.sort((a, b) => {
                    const aVal = a.children[columnIndex].textContent.trim();
                    const bVal = b.children[columnIndex].textContent.trim();
                    
                    // Handle numerical values (remove currency symbols and commas)
                    const aNum = parseFloat(aVal.replace(/[€$,]/g, ''));
                    const bNum = parseFloat(bVal.replace(/[€$,]/g, ''));
                    
                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        return newSort === 'asc' ? aNum - bNum : bNum - aNum;
                    }
                    
                    // Handle text values
                    return newSort === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                });
                
                // Re-append sorted rows
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    }
    
    // Responsive handling for financial dashboards
    function initializeResponsiveHandling() {
        // Handle mobile navigation for dashboard components
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            const dashboards = document.querySelectorAll('.maestro-dashboard');
            
            dashboards.forEach(dashboard => {
                if (isMobile) {
                    dashboard.classList.add('maestro-mobile');
                } else {
                    dashboard.classList.remove('maestro-mobile');
                }
            });
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        
        // Handle overflow tables on mobile
        document.querySelectorAll('.maestro-data-table').forEach(table => {
            const wrapper = document.createElement('div');
            wrapper.className = 'maestro-table-wrapper';
            wrapper.style.overflowX = 'auto';
            wrapper.style.webkitOverflowScrolling = 'touch';
            
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }
    
    // Auto-refresh data for real-time dashboards
    window.MaestroUtils = window.MaestroUtils || {};
    window.MaestroUtils.startAutoRefresh = function(refreshFunction, intervalMs = 30000) {
        const interval = setInterval(refreshFunction, intervalMs);
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            clearInterval(interval);
        });
        
        return interval;
    };
    
    // Utility for loading Liferay Object data
    window.MaestroUtils.loadObjectData = function(objectName, callback) {
        if (typeof Liferay !== 'undefined' && Liferay.authToken) {
            // Map object names to correct API endpoints
            const objectEndpoints = {
                'MaestroLoan': '/o/c/maestroloans/',
                'MaestroDeal': '/o/c/maestrodeals/',
                'MaestroClient': '/o/c/maestroclients/',
                'PerformanceKPI': '/o/c/performancekpis/',
                'RiskMetrics': '/o/c/riskmetrics/',
                'WorkflowMetrics': '/o/c/workflowmetrics/',
                'GFDActivities': '/o/c/gfdactivities/'
            };
            
            // Use Liferay's Object REST API with proper authentication
            const apiUrl = objectEndpoints[objectName] || `/o/c/${objectName.toLowerCase()}s/`;
            
            fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': Liferay.authToken
                },
                credentials: 'same-origin'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Transform response to consistent format
                const transformedData = {
                    items: data.items || data.data || (Array.isArray(data) ? data : [])
                };
                callback(null, transformedData);
            })
            .catch(error => {
                console.warn(`Failed to load ${objectName} data from Liferay Objects:`, error);
                // Fallback to mock data for development/demo purposes
                generateMockObjectData(objectName, callback);
            });
        } else if (typeof Liferay !== 'undefined' && Liferay.Service) {
            // Map object names to GraphQL field names
            const graphqlFields = {
                'MaestroLoan': 'maestroloans',
                'MaestroDeal': 'maestrodeals', 
                'MaestroClient': 'maestroclients',
                'PerformanceKPI': 'performancekpis',
                'RiskMetrics': 'riskmetrics',
                'WorkflowMetrics': 'workflowmetrics',
                'GFDActivities': 'gfdactivities'
            };
            
            // Fallback to GraphQL API if available
            const graphqlFieldName = graphqlFields[objectName] || objectName.toLowerCase() + 's';
            const query = `{
                ${graphqlFieldName} {
                    items {
                        id
                        dateCreated
                        dateModified
                    }
                }
            }`;
            
            fetch('/o/graphql', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': Liferay.authToken
                },
                credentials: 'same-origin',
                body: JSON.stringify({ query })
            })
            .then(response => response.json())
            .then(data => {
                if (data.errors) {
                    throw new Error('GraphQL errors: ' + JSON.stringify(data.errors));
                }
                callback(null, { items: data.data?.[graphqlFieldName]?.items || [] });
            })
            .catch(error => {
                console.warn(`Failed to load ${objectName} data via GraphQL:`, error);
                generateMockObjectData(objectName, callback);
            });
        } else {
            console.warn('Liferay services not available - using mock data for development');
            generateMockObjectData(objectName, callback);
        }
    };
    
    // Generate mock data for development/demo purposes
    function generateMockObjectData(objectName, callback) {
        let mockData = { items: [] };
        
        switch(objectName) {
            case 'PerformanceKPI':
                mockData = {
                    items: [{
                        totalLoanPortfolio: { value: 2470000000, change: 128600000 },
                        activeDeals: { value: 147, change: 12 },
                        riskExposure: { value: 156000000, change: -3276000 },
                        monthlyRevenue: { value: 45200000, change: 3645000 },
                        creditApprovalRate: { value: 87.3, change: 2.8 },
                        averageDealSize: { value: 16800000, change: 850000 }
                    }]
                };
                break;
                
            case 'LoanAnalytics':
                const currentDate = new Date();
                const mockAnalytics = [];
                for (let i = 29; i >= 0; i--) {
                    const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
                    mockAnalytics.push({
                        date: date.toISOString().split('T')[0],
                        volume: Math.round(180 + Math.sin(i * 0.3) * 30 + Math.random() * 20),
                        approved: Math.round((180 + Math.sin(i * 0.3) * 30) * (0.85 + Math.random() * 0.1)),
                        pipeline: Math.round((180 + Math.sin(i * 0.3) * 30) * (0.3 + Math.random() * 0.2))
                    });
                }
                mockData = { items: mockAnalytics };
                break;
                
            default:
                mockData = { items: [] };
        }
        
        // Simulate API delay for realistic behavior
        setTimeout(() => callback(null, mockData), 200);
    }
    
})();