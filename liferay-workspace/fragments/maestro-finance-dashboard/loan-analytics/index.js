/**
 * Loan Analytics Fragment JavaScript
 * Handles Chart.js integration and loan data visualization
 */

(function() {
    'use strict';
    
    // Use Liferay-provided fragmentElement (preferred) or fallback to script parent
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    let chartInstance = null;
    
    // Initialize loan analytics when fragment loads
    if (root) {
        initializeLoanAnalytics();
    }
    
    function initializeLoanAnalytics() {
        // Check if all dependencies are available
        if (!checkDependencies()) {
            return; // Will retry via the dependency checker
        }
        
        setupChart();
        loadLoanData();
        setupTimeRangeSelector();
        setupConfigurationHandling();
    }
    
    function checkDependencies() {
        const hasChart = typeof Chart !== 'undefined';
        const hasMaestroUtils = typeof window.MaestroUtils !== 'undefined';
        
        if (!hasChart) {
            loadChartJS();
            return false;
        }
        
        if (!hasMaestroUtils) {
            // Wait for MaestroUtils to be available - retry every 100ms for up to 5 seconds
            retryDependencyCheck();
            return false;
        }
        
        return true;
    }
    
    function loadChartJS() {
        // Prevent loading Chart.js multiple times
        if (root.closest('#wrapper')?.querySelector('script[src*="chart.js"]') || document.querySelector('script[src*="chart.js"]')) {
            retryDependencyCheck();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        script.onload = () => {
            console.log('Chart.js loaded successfully');
            retryDependencyCheck();
        };
        script.onerror = () => {
            console.error('Failed to load Chart.js from CDN');
            // Fallback to a different CDN
            loadChartJSFallback();
        };
        document.head.appendChild(script);
    }
    
    function loadChartJSFallback() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.js';
        script.onload = () => {
            console.log('Chart.js loaded from fallback CDN');
            retryDependencyCheck();
        };
        script.onerror = () => {
            console.error('Failed to load Chart.js from fallback CDN - chart functionality will be limited');
            // Continue without Chart.js - show error message
            showChartError();
        };
        document.head.appendChild(script);
    }
    
    function retryDependencyCheck() {
        let retries = 0;
        const maxRetries = 50; // 5 seconds total
        
        const checkInterval = setInterval(() => {
            retries++;
            
            if (checkDependencies()) {
                clearInterval(checkInterval);
                initializeLoanAnalytics();
            } else if (retries >= maxRetries) {
                clearInterval(checkInterval);
                console.warn('Failed to load all dependencies for loan analytics after 5 seconds');
                showDependencyError();
            }
        }, 100);
    }
    
    function showChartError() {
        const canvas = root.querySelector('#loanAnalyticsChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6c757d';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Chart library failed to load', canvas.width / 2, canvas.height / 2);
            ctx.fillText('Please refresh the page or check your internet connection', canvas.width / 2, canvas.height / 2 + 25);
        }
    }
    
    function showDependencyError() {
        const dashboard = root.querySelector('.maestro-loan-analytics');
        if (dashboard) {
            dashboard.innerHTML = `
                <div class="maestro-error-message">
                    <h3>Unable to load dashboard components</h3>
                    <p>Some required resources failed to load. Please refresh the page.</p>
                    <button onclick="location.reload()" class="maestro-btn-primary">Refresh Page</button>
                </div>
            `;
        }
    }
    
    function setupConfigurationHandling() {
        // Read configuration from the fragment's configuration system
        const config = getFragmentConfiguration();
        
        // Apply chart type configuration
        if (config.chartType && config.chartType !== 'line') {
            updateChartType(config.chartType);
        }
        
        // Apply time range configuration  
        if (config.timeRange) {
            const selector = root.querySelector('#timeRangeSelect');
            if (selector) {
                selector.value = config.timeRange;
            }
        }
        
        // Apply show data labels configuration
        if (config.showDataLabels !== undefined) {
            toggleDataLabels(config.showDataLabels);
        }
    }
    
    function getFragmentConfiguration() {
        // In Liferay, configuration is typically available via global variables or data attributes
        // This function attempts to read configuration from various sources
        
        let config = {};
        
        // Try to get configuration from a global variable (set by Liferay)
        if (typeof fragmentConfiguration !== 'undefined') {
            config = fragmentConfiguration;
        }
        
        // Fallback: read from data attributes on the fragment element
        if (fragmentElement && root.dataset) {
            config.chartType = root.dataset.chartType || 'line';
            config.timeRange = root.dataset.timeRange || '30d';
            config.showDataLabels = root.dataset.showDataLabels === 'true';
        }
        
        // Final fallback: read from DOM elements that might contain configuration
        const timeSelector = root.querySelector('#timeRangeSelect');
        if (timeSelector) {
            const selectedOption = timeSelector.querySelector('option[selected]');
            if (selectedOption) {
                config.timeRange = selectedOption.value;
            }
        }
        
        return config;
    }
    
    function updateChartType(newType) {
        if (chartInstance && ['line', 'bar', 'pie', 'doughnut'].includes(newType)) {
            chartInstance.config.type = newType;
            
            // Adjust chart options based on type
            if (newType === 'pie' || newType === 'doughnut') {
                chartInstance.config.options.scales = {}; // Remove scales for pie/doughnut charts
                chartInstance.config.options.plugins.legend.position = 'right';
            } else {
                // Restore scales for line/bar charts
                chartInstance.config.options.scales = getDefaultScales();
                chartInstance.config.options.plugins.legend.position = 'bottom';
            }
            
            chartInstance.update('active');
        }
    }
    
    function toggleDataLabels(show) {
        if (chartInstance) {
            if (show) {
                // Add data labels plugin configuration
                chartInstance.config.options.plugins.datalabels = {
                    display: true,
                    color: '#003366',
                    font: {
                        weight: 'bold',
                        size: 10
                    },
                    formatter: function(value) {
                        return '€' + Math.round(value) + 'M';
                    }
                };
            } else {
                // Remove data labels
                if (chartInstance.config.options.plugins.datalabels) {
                    delete chartInstance.config.options.plugins.datalabels;
                }
            }
            chartInstance.update('active');
        }
    }
    
    function getDefaultScales() {
        return {
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
        };
    }
    
    function setupChart() {
        const canvas = root.querySelector('#loanAnalyticsChart');
        if (!canvas) return;
        
        // Destroy existing chart instance if it exists
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Get configuration before setting up chart
        const config = getFragmentConfiguration();
        
        // Default chart configuration
        const chartConfig = {
            type: config.chartType || 'line',
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
        window.MaestroUtils.loadObjectData('MaestroLoan', function(error, data) {
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
        
        const now = new Date();
        
        // Create time buckets
        for (let i = points - 1; i >= 0; i--) {
            let date;
            let bucketStart, bucketEnd;
            
            if (timeRange === '7d') {
                date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                bucketStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                bucketEnd = new Date(bucketStart.getTime() + 24 * 60 * 60 * 1000);
                labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            } else if (timeRange === '30d') {
                date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                bucketStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                bucketEnd = new Date(bucketStart.getTime() + 24 * 60 * 60 * 1000);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            } else if (timeRange === '3m') {
                date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
                bucketStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                bucketEnd = new Date(bucketStart.getTime() + 7 * 24 * 60 * 60 * 1000);
                labels.push('Week ' + (points - i));
            } else {
                date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                bucketStart = new Date(date.getFullYear(), date.getMonth(), 1);
                bucketEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
            }
            
            // Filter and aggregate loans for this time bucket
            let bucketVolume = 0;
            let bucketApproved = 0;
            
            loanData.forEach(loan => {
                const originationDate = new Date(loan.originationDate);
                
                // Check if loan falls within this time bucket
                if (originationDate >= bucketStart && originationDate < bucketEnd) {
                    // Convert loan amount to millions
                    const amountInMillions = (loan.loanAmount || 0) / 1000000;
                    bucketVolume += amountInMillions;
                    
                    // Count as approved if loan status is active or approved
                    const status = typeof loan.loanStatus === 'object' ? loan.loanStatus.key : loan.loanStatus;
                    if (status === 'active' || status === 'approved' || loan.status?.label === 'approved') {
                        bucketApproved += amountInMillions;
                    }
                }
            });
            
            volumes.push(Math.round(bucketVolume * 10) / 10); // Round to 1 decimal
            approved.push(Math.round(bucketApproved * 10) / 10);
        }
        
        return { labels, volumes, approved };
    }
    
    function setupTimeRangeSelector() {
        const selector = root.querySelector('#timeRangeSelect');
        if (!selector) return;
        
        selector.addEventListener('change', function() {
            loadLoanData();
        });
    }
    
    function getSelectedTimeRange() {
        const selector = root.querySelector('#timeRangeSelect');
        return selector ? selector.value : '30d';
    }
    
    // Auto-refresh data every 10 minutes
    if (window.MaestroUtils && window.MaestroUtils.startAutoRefresh) {
        window.MaestroUtils.startAutoRefresh(loadLoanData, 600000);
    }
    
})();