/**
 * Risk Dashboard Fragment JavaScript
 * Handles risk data loading and chart visualization
 */

(function() {
    'use strict';
    
    // Use Liferay-provided fragmentElement (preferred) or fallback to script parent
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    if (!root) {
        console.error('Risk Dashboard: Could not determine fragment root element');
        return;
    }
    
    let riskChartInstance = null;
    
    // Initialize risk dashboard when fragment loads
    initializeRiskDashboard();
    
    function initializeRiskDashboard() {
        waitForDependencies(() => {
            loadRiskData();
            setupRiskChart();
            setupTimeRangeSelector();
            setupHeatmapInteraction();
        });
    }
    
    function waitForDependencies(callback, retries = 50) {
        if (typeof window.MaestroUtils !== 'undefined') {
            callback();
        } else if (retries > 0) {
            setTimeout(() => waitForDependencies(callback, retries - 1), 100);
        } else {
            console.warn('Risk Dashboard: MaestroUtils not available, using fallback');
            callback();
        }
    }
    
    function loadRiskData() {
        const dashboard = root.querySelector('.maestro-risk-dashboard');
        if (!dashboard) return;
        
        dashboard.classList.add('loading');
        
        // Load risk data from Liferay Objects
        if (window.MaestroUtils && window.MaestroUtils.loadObjectData) {
            window.MaestroUtils.loadObjectData('RiskMetrics', function(error, data) {
                dashboard.classList.remove('loading');
                
                if (error) {
                    console.warn('Failed to load risk data, using mock data:', error);
                    updateRiskCardsWithMockData();
                    return;
                }
                
                if (data && data.items && data.items.length > 0) {
                    updateRiskCards(data.items);
                } else {
                    updateRiskCardsWithMockData();
                }
            });
        } else {
            dashboard.classList.remove('loading');
            updateRiskCardsWithMockData();
        }
    }
    
    function updateRiskCards(riskData) {
        // Update risk overview cards with real data
        const totalRiskEl = root.querySelector('[data-lfr-editable-id="total-risk"]');
        const highRiskLoansEl = root.querySelector('[data-lfr-editable-id="high-risk-loans"]');
        const creditAvgEl = root.querySelector('[data-lfr-editable-id="credit-avg"]');
        const coverageRatioEl = root.querySelector('[data-lfr-editable-id="coverage-ratio"]');
        
        if (riskData[0]) {
            const risk = riskData[0];
            
            if (totalRiskEl && risk.totalRiskExposure) {
                totalRiskEl.textContent = formatCurrency(risk.totalRiskExposure);
            }
            
            if (highRiskLoansEl && risk.highRiskLoans) {
                highRiskLoansEl.textContent = risk.highRiskLoans.toString();
            }
            
            if (creditAvgEl && risk.averageCreditScore) {
                creditAvgEl.textContent = Math.round(risk.averageCreditScore).toString();
            }
            
            if (coverageRatioEl && risk.coverageRatio) {
                coverageRatioEl.textContent = (risk.coverageRatio * 100).toFixed(1) + '%';
            }
        }
    }
    
    function updateRiskCardsWithMockData() {
        // Mock data is already in the HTML, but we can update trends
        const riskCards = root.querySelectorAll('.risk-card');
        
        riskCards.forEach((card, index) => {
            const trendEl = card.querySelector('.risk-trend span:last-child');
            if (trendEl) {
                const trends = [
                    '-2.1% this month',
                    'Stable count',
                    '+8 points',
                    '+1.3% improved'
                ];
                
                if (trends[index]) {
                    trendEl.textContent = trends[index];
                }
            }
        });
    }
    
    function setupRiskChart() {
        const canvas = root.querySelector('#riskChart');
        if (!canvas) return;
        
        // Wait for Chart.js to be available
        if (typeof Chart === 'undefined') {
            loadChartJS(() => setupRiskChart());
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        const chartConfig = {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(220, 53, 69, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'var(--danger-red)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                return context.dataset.label + ': ' + value.toFixed(2) + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                family: 'var(--font-family-numbers)'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        };
        
        riskChartInstance = new Chart(ctx, chartConfig);
        loadRiskChartData();
    }
    
    function loadChartJS(callback) {
        // Use the shared Chart.js dependency loader if available
        if (window.MaestroUtils && window.MaestroUtils.ensureChartJS) {
            window.MaestroUtils.ensureChartJS(callback);
            return;
        }
        
        // Fallback to direct loading
        if (root.closest('#wrapper')?.querySelector('script[src*="chart.js"]') || document.querySelector('script[src*="chart.js"]')) {
            callback();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        script.onload = () => {
            setTimeout(callback, 100);
        };
        script.onerror = () => {
            console.error('Risk Dashboard: Failed to load Chart.js');
            // Show user-friendly error message
            const canvas = root.querySelector('#riskChart');
            if (canvas && canvas.parentElement) {
                canvas.parentElement.innerHTML = '<div class="chart-error">Unable to load chart library. Please refresh the page.</div>';
            }
        };
        document.head.appendChild(script);
    }
    
    function loadRiskChartData() {
        if (!riskChartInstance) return;
        
        const timeRange = getSelectedTimeRange();
        const mockData = generateMockRiskData(timeRange);
        
        riskChartInstance.data.labels = mockData.labels;
        riskChartInstance.data.datasets = [
            {
                label: 'Credit Risk (%)',
                data: mockData.creditRisk,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            },
            {
                label: 'Market Risk (%)',
                data: mockData.marketRisk,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5]
            },
            {
                label: 'Operational Risk (%)',
                data: mockData.operationalRisk,
                borderColor: '#17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.1)',
                borderWidth: 2,
                pointStyle: 'circle'
            }
        ];
        
        riskChartInstance.update('active');
    }
    
    function generateMockRiskData(timeRange) {
        const dataPoints = {
            '7d': 7,
            '30d': 30,
            '3m': 12,
            '12m': 12
        };
        
        const points = dataPoints[timeRange] || 30;
        const labels = [];
        const creditRisk = [];
        const marketRisk = [];
        const operationalRisk = [];
        
        const now = new Date();
        
        for (let i = points - 1; i >= 0; i--) {
            let date;
            if (timeRange === '7d') {
                date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            } else if (timeRange === '30d') {
                date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            } else if (timeRange === '3m') {
                date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
                labels.push('Week ' + (points - i));
            } else {
                date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
            }
            
            // Generate realistic risk data (0-8%)
            const baseCreditRisk = 3.5 + Math.sin(i * 0.3) * 1.5 + Math.random() * 0.8;
            const baseMarketRisk = 2.8 + Math.sin(i * 0.2) * 1.2 + Math.random() * 0.6;
            const baseOpRisk = 1.9 + Math.sin(i * 0.4) * 0.8 + Math.random() * 0.4;
            
            creditRisk.push(Math.max(0, Math.min(8, baseCreditRisk)).toFixed(2));
            marketRisk.push(Math.max(0, Math.min(6, baseMarketRisk)).toFixed(2));
            operationalRisk.push(Math.max(0, Math.min(4, baseOpRisk)).toFixed(2));
        }
        
        return { labels, creditRisk, marketRisk, operationalRisk };
    }
    
    function setupTimeRangeSelector() {
        const selector = root.querySelector('#riskTimeRange');
        if (!selector) return;
        
        selector.addEventListener('change', function() {
            loadRiskChartData();
        });
    }
    
    function setupHeatmapInteraction() {
        const riskCells = root.querySelectorAll('.risk-cell');
        
        riskCells.forEach(cell => {
            cell.addEventListener('click', function() {
                const riskValue = this.dataset.risk;
                const sector = this.closest('.heatmap-row').querySelector('.sector-label').textContent;
                
                // Emit custom event for risk cell interaction
                const event = new CustomEvent('maestro:risk-cell-clicked', {
                    detail: {
                        sector: sector,
                        riskValue: riskValue,
                        element: this
                    },
                    bubbles: true
                });
                
                root.dispatchEvent(event);
            });
            
            // Add hover effect
            cell.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.transition = 'transform 0.2s ease';
            });
            
            cell.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    function getSelectedTimeRange() {
        const selector = root.querySelector('#riskTimeRange');
        return selector ? selector.value : '30d';
    }
    
    function formatCurrency(amount) {
        if (window.MaestroUtils && window.MaestroUtils.formatCurrency) {
            return window.MaestroUtils.formatCurrency(amount);
        }
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        }).format(amount);
    }
    
    function getConfiguration(key, defaultValue) {
        if (typeof configuration !== 'undefined' && configuration[key] !== undefined) {
            return configuration[key];
        }
        return defaultValue;
    }
    
    // Auto-refresh risk data every 15 minutes
    if (window.MaestroUtils && window.MaestroUtils.startAutoRefresh) {
        window.MaestroUtils.startAutoRefresh(loadRiskData, 900000);
    }
    
})();