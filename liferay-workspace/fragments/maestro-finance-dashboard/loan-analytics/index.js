/**
 * Loan Analytics Fragment JavaScript
 * Handles Chart.js integration and loan data visualization
 */

(function() {
    'use strict';
    
    const fragmentElement = fragmentElement || document.currentScript.parentElement;
    let chartInstance = null;
    
    // Initialize loan analytics when fragment loads
    if (fragmentElement) {
        initializeLoanAnalytics();
    }
    
    function initializeLoanAnalytics() {
        // Wait for Chart.js and global utilities to be available
        if (typeof Chart === 'undefined' || typeof window.MaestroUtils === 'undefined') {
            loadChartJS();
            return;
        }
        
        setupChart();
        loadLoanData();
        setupTimeRangeSelector();
    }
    
    function loadChartJS() {
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
            script.onload = () => {
                setTimeout(initializeLoanAnalytics, 100);
            };
            document.head.appendChild(script);
        } else {
            initializeLoanAnalytics();
        }
    }
    
    function setupChart() {
        const canvas = fragmentElement.querySelector('#loanAnalyticsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Default chart configuration
        const chartConfig = {
            type: 'line', // Will be updated from configuration
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
                            padding: 20,
                            font: {
                                family: 'var(--font-family-primary)'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 51, 102, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'var(--ca-cib-green)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                return context.dataset.label + ': ' + window.MaestroUtils.formatCurrency(value * 1000000);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '€' + value + 'M';
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
        
        chartInstance = new Chart(ctx, chartConfig);
    }
    
    function loadLoanData() {
        const timeRange = getSelectedTimeRange();
        
        // Load loan data from Liferay Objects
        window.MaestroUtils.loadObjectData('LoanAnalytics', function(error, data) {
            if (error) {
                console.warn('Failed to load loan analytics data, using mock data:', error);
                updateChartWithMockData(timeRange);
                return;
            }
            
            if (data && data.items && data.items.length > 0) {
                updateChart(data.items, timeRange);
            } else {
                updateChartWithMockData(timeRange);
            }
        });
    }
    
    function updateChart(loanData, timeRange) {
        if (!chartInstance) return;
        
        // Process data based on time range
        const processedData = processLoanDataByTimeRange(loanData, timeRange);
        
        chartInstance.data.labels = processedData.labels;
        chartInstance.data.datasets = [
            {
                label: 'Loan Volume',
                data: processedData.volumes,
                borderColor: 'var(--ca-cib-green)',
                backgroundColor: 'rgba(0, 166, 81, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            },
            {
                label: 'Approved Loans',
                data: processedData.approved,
                borderColor: 'var(--ca-cib-dark-blue)',
                backgroundColor: 'rgba(0, 51, 102, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5]
            }
        ];
        
        chartInstance.update('active');
    }
    
    function updateChartWithMockData(timeRange) {
        if (!chartInstance) return;
        
        const mockData = generateMockLoanData(timeRange);
        
        chartInstance.data.labels = mockData.labels;
        chartInstance.data.datasets = [
            {
                label: 'Total Loan Volume (€M)',
                data: mockData.volumes,
                borderColor: '#00A651',
                backgroundColor: 'rgba(0, 166, 81, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            },
            {
                label: 'Approved Loans (€M)',
                data: mockData.approved,
                borderColor: '#003366',
                backgroundColor: 'rgba(0, 51, 102, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5]
            },
            {
                label: 'Pipeline (€M)',
                data: mockData.pipeline,
                borderColor: '#17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.1)',
                borderWidth: 2,
                pointStyle: 'circle'
            }
        ];
        
        chartInstance.update('active');
    }
    
    function generateMockLoanData(timeRange) {
        const dataPoints = {
            '7d': 7,
            '30d': 30,
            '3m': 12, // Weekly data for 3 months
            '12m': 12  // Monthly data for 12 months
        };
        
        const points = dataPoints[timeRange] || 30;
        const labels = [];
        const volumes = [];
        const approved = [];
        const pipeline = [];
        
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
            
            // Generate realistic loan data
            const baseVolume = 180 + Math.sin(i * 0.3) * 30 + Math.random() * 20;
            const approvedRate = 0.85 + Math.random() * 0.1;
            const pipelineMultiplier = 0.3 + Math.random() * 0.2;
            
            volumes.push(Math.round(baseVolume));
            approved.push(Math.round(baseVolume * approvedRate));
            pipeline.push(Math.round(baseVolume * pipelineMultiplier));
        }
        
        return { labels, volumes, approved, pipeline };
    }
    
    function processLoanDataByTimeRange(loanData, timeRange) {
        // Process real loan data from Liferay Objects
        // This would be implemented based on the actual data structure
        return {
            labels: [],
            volumes: [],
            approved: []
        };
    }
    
    function setupTimeRangeSelector() {
        const selector = fragmentElement.querySelector('#timeRangeSelect');
        if (!selector) return;
        
        selector.addEventListener('change', function() {
            loadLoanData();
        });
    }
    
    function getSelectedTimeRange() {
        const selector = fragmentElement.querySelector('#timeRangeSelect');
        return selector ? selector.value : '30d';
    }
    
    // Auto-refresh data every 10 minutes
    if (window.MaestroUtils && window.MaestroUtils.startAutoRefresh) {
        window.MaestroUtils.startAutoRefresh(loadLoanData, 600000);
    }
    
})();