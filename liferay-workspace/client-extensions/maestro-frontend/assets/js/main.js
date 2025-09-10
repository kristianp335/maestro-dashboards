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
        if (typeof Liferay !== 'undefined' && Liferay.Service) {
            // Use Liferay's headless API to fetch object data
            fetch(`/o/headless-admin-user/v1.0/object-entries/${objectName}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => callback(null, data))
            .catch(error => callback(error, null));
        } else {
            console.warn('Liferay services not available - using mock data');
            callback(null, { items: [] });
        }
    };
    
})();