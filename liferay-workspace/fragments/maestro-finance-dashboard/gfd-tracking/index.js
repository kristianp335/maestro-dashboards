/**
 * GFD Tracking Fragment JavaScript
 * Handles workflow tracking, progress monitoring, and activity updates
 */

(function() {
    'use strict';
    
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    if (!root) {
        console.error('GFD Tracking: Could not determine fragment root element');
        return;
    }
    
    let activitiesData = [];
    let filteredActivities = [];
    
    // Initialize GFD tracking when fragment loads
    initializeGFDTracking();
    
    function initializeGFDTracking() {
        waitForDependencies(() => {
            loadGFDData();
            loadWorkflowProgress();
            loadActivitiesData();
            setupActivityFilters();
            setupProgressInteraction();
        });
    }
    
    function waitForDependencies(callback, retries = 50) {
        if (typeof window.MaestroUtils !== 'undefined') {
            callback();
        } else if (retries > 0) {
            setTimeout(() => waitForDependencies(callback, retries - 1), 100);
        } else {
            console.warn('GFD Tracking: MaestroUtils not available, using fallback');
            callback();
        }
    }
    
    function loadGFDData() {
        const dashboard = root.querySelector('.maestro-gfd-tracking');
        if (!dashboard) return;
        
        dashboard.classList.add('loading');
        
        // Load workflow statistics from Liferay Objects
        if (window.MaestroUtils && window.MaestroUtils.loadObjectData) {
            window.MaestroUtils.loadObjectData('WorkflowMetrics', function(error, data) {
                dashboard.classList.remove('loading');
                
                if (error) {
                    console.warn('Failed to load workflow data, using mock data:', error);
                    updateGFDStatisticsWithMockData();
                    return;
                }
                
                if (data && data.items && data.items.length > 0) {
                    updateGFDStatistics(data.items[0]);
                } else {
                    updateGFDStatisticsWithMockData();
                }
            });
        } else {
            dashboard.classList.remove('loading');
            updateGFDStatisticsWithMockData();
        }
    }
    
    function updateGFDStatistics(workflowData) {
        const activeWorkflowsEl = root.querySelector('[data-lfr-editable-id="active-workflows"]');
        const avgProcessingEl = root.querySelector('[data-lfr-editable-id="avg-processing"]');
        const completionRateEl = root.querySelector('[data-lfr-editable-id="completion-rate"]');
        const exceptionsEl = root.querySelector('[data-lfr-editable-id="exceptions"]');
        
        if (activeWorkflowsEl && workflowData.activeWorkflows) {
            activeWorkflowsEl.textContent = workflowData.activeWorkflows.toString();
        }
        
        if (avgProcessingEl && workflowData.avgProcessingTime) {
            avgProcessingEl.textContent = workflowData.avgProcessingTime + ' days';
        }
        
        if (completionRateEl && workflowData.completionRate) {
            completionRateEl.textContent = (workflowData.completionRate * 100).toFixed(1) + '%';
        }
        
        if (exceptionsEl && workflowData.exceptions) {
            exceptionsEl.textContent = workflowData.exceptions.toString();
        }
    }
    
    function updateGFDStatisticsWithMockData() {
        // Mock data is already in HTML, update with dynamic values
        const activeWorkflowsEl = root.querySelector('[data-lfr-editable-id="active-workflows"]');
        const avgProcessingEl = root.querySelector('[data-lfr-editable-id="avg-processing"]');
        const completionRateEl = root.querySelector('[data-lfr-editable-id="completion-rate"]');
        const exceptionsEl = root.querySelector('[data-lfr-editable-id="exceptions"]');
        
        // Generate realistic dynamic values
        const currentHour = new Date().getHours();
        const variance = Math.sin(currentHour * 0.1) * 5; // Small hourly variance
        
        if (activeWorkflowsEl) {
            const baseActive = 34;
            activeWorkflowsEl.textContent = Math.max(1, Math.floor(baseActive + variance)).toString();
        }
        
        if (avgProcessingEl) {
            const baseProcessing = 3.2;
            avgProcessingEl.textContent = (baseProcessing + variance * 0.1).toFixed(1) + ' days';
        }
        
        if (completionRateEl) {
            const baseRate = 96.8;
            completionRateEl.textContent = Math.max(90, Math.min(99, baseRate + variance * 0.2)).toFixed(1) + '%';
        }
        
        if (exceptionsEl) {
            const baseExceptions = 7;
            exceptionsEl.textContent = Math.max(0, Math.floor(baseExceptions + variance * 0.3)).toString();
        }
    }
    
    function loadWorkflowProgress() {
        // Update workflow progress bars dynamically
        const workflowItems = root.querySelectorAll('.workflow-item');
        
        workflowItems.forEach((item, index) => {
            const progressFill = item.querySelector('.progress-fill');
            const progressDetails = item.querySelector('.progress-details');
            
            if (progressFill && progressDetails) {
                // Generate realistic progress values
                const baseProgresses = [75, 60, 90]; // Origination, Credit, Distribution
                const currentProgress = baseProgresses[index] || 50;
                const variance = Math.random() * 10 - 5; // ±5% variance
                const finalProgress = Math.max(10, Math.min(100, currentProgress + variance));
                
                progressFill.style.width = finalProgress + '%';
                
                const progressSpan = progressDetails.querySelector('span:first-child');
                const timeSpan = progressDetails.querySelector('span:last-child');
                
                if (progressSpan) {
                    progressSpan.textContent = finalProgress.toFixed(0) + '% Complete';
                }
                
                if (timeSpan) {
                    const remainingTime = ((100 - finalProgress) / 100 * 3).toFixed(1); // Est. based on 3 day avg
                    timeSpan.textContent = `Est. ${remainingTime} days remaining`;
                }
            }
        });
    }
    
    function loadActivitiesData() {
        if (window.MaestroUtils && window.MaestroUtils.loadObjectData) {
            window.MaestroUtils.loadObjectData('GFDActivities', function(error, data) {
                if (error) {
                    console.warn('Failed to load activities data, using mock data:', error);
                    generateMockActivitiesData();
                    return;
                }
                
                if (data && data.items && data.items.length > 0) {
                    // Map API field names and handle picklist objects
                    activitiesData = data.items.map(activity => ({
                        ...activity,
                        title: activity.activityTitle,
                        description: activity.activityDescription,
                        type: typeof activity.activityType === 'object' ? activity.activityType.key : activity.activityType,
                        status: typeof activity.activityStatus === 'object' ? activity.activityStatus.key : activity.activityStatus,
                        time: activity.activityDate // Will be formatted later
                    }));
                    applyActivityFilters();
                } else {
                    generateMockActivitiesData();
                }
            });
        } else {
            generateMockActivitiesData();
        }
    }
    
    function generateMockActivitiesData() {
        const activities = [
            {
                id: 1,
                title: 'Loan LN-2025-0847 - Credit Approval Completed',
                description: 'TotalEnergies SE infrastructure loan approved for €45.2M',
                type: 'credit',
                status: 'completed',
                time: '2 hours ago'
            },
            {
                id: 2,
                title: 'Loan LN-2025-0848 - Due Diligence Review',
                description: 'EDF Group renewable energy facility under review',
                type: 'origination',
                status: 'in-progress',
                time: '4 hours ago'
            },
            {
                id: 3,
                title: 'Distribution Package DP-2025-0156 - Syndication Complete',
                description: 'Schneider Electric green bond distributed to 8 institutional investors',
                type: 'distribution',
                status: 'completed',
                time: '6 hours ago'
            },
            {
                id: 4,
                title: 'Loan LN-2025-0849 - Documentation Exception',
                description: 'Missing environmental compliance certificate for LVMH project',
                type: 'origination',
                status: 'exception',
                time: '8 hours ago'
            },
            {
                id: 5,
                title: 'System Integration - Real-time Data Sync',
                description: 'Successfully synchronized portfolio data with central risk system',
                type: 'system',
                status: 'completed',
                time: '1 day ago'
            }
        ];
        
        activitiesData = activities;
        applyActivityFilters();
    }
    
    function setupActivityFilters() {
        const typeFilter = root.querySelector('#activityTypeFilter');
        
        if (typeFilter) {
            typeFilter.addEventListener('change', applyActivityFilters);
        }
    }
    
    function applyActivityFilters() {
        const typeFilter = root.querySelector('#activityTypeFilter')?.value || 'all';
        
        filteredActivities = activitiesData.filter(activity => {
            return typeFilter === 'all' || activity.type === typeFilter;
        });
        
        updateActivitiesDisplay();
    }
    
    function updateActivitiesDisplay() {
        const activitiesList = root.querySelector('.activities-list');
        if (!activitiesList) return;
        
        // Update existing activity items with filtered data
        const activityItems = activitiesList.querySelectorAll('.activity-item');
        
        filteredActivities.forEach((activity, index) => {
            if (index < activityItems.length) {
                const item = activityItems[index];
                
                // Update activity classes
                item.className = `activity-item ${activity.status}`;
                
                // Update title
                const title = item.querySelector('.activity-title');
                if (title) title.textContent = activity.title;
                
                // Update description
                const description = item.querySelector('.activity-description');
                if (description) description.textContent = activity.description;
                
                // Update type
                const type = item.querySelector('.activity-type');
                if (type) type.textContent = capitalize(activity.type);
                
                // Update time
                const time = item.querySelector('.activity-time');
                if (time) time.textContent = activity.time;
                
                // Update status badge
                const statusBadge = item.querySelector('.maestro-status-badge');
                if (statusBadge) {
                    const statusClasses = {
                        'completed': 'approved',
                        'in-progress': 'pending',
                        'exception': 'rejected'
                    };
                    
                    statusBadge.className = `maestro-status-badge ${statusClasses[activity.status] || 'pending'}`;
                    statusBadge.textContent = capitalize(typeof activity.status === 'string' ? activity.status.replace('-', ' ') : activity.status);
                }
                
                item.style.display = 'flex';
            }
        });
        
        // Hide extra items
        for (let i = filteredActivities.length; i < activityItems.length; i++) {
            activityItems[i].style.display = 'none';
        }
    }
    
    function setupProgressInteraction() {
        const workflowItems = root.querySelectorAll('.workflow-item');
        
        workflowItems.forEach(item => {
            item.addEventListener('click', function() {
                const workflowType = this.classList.contains('origination') ? 'origination' :
                                   this.classList.contains('credit') ? 'credit' :
                                   this.classList.contains('distribution') ? 'distribution' : 'unknown';
                
                // Emit custom event for workflow interaction
                const event = new CustomEvent('maestro:workflow-clicked', {
                    detail: {
                        workflowType: workflowType,
                        element: this
                    },
                    bubbles: true
                });
                
                root.dispatchEvent(event);
            });
            
            // Add hover effect for progress bars
            item.addEventListener('mouseenter', function() {
                const progressFill = this.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.transform = 'scaleY(1.2)';
                    progressFill.style.transition = 'transform 0.2s ease';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                const progressFill = this.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.transform = 'scaleY(1)';
                }
            });
        });
    }
    
    function capitalize(str) {
        if (!str || typeof str !== 'string') {
            return str || '';
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    function getConfiguration(key, defaultValue) {
        if (typeof configuration !== 'undefined' && configuration[key] !== undefined) {
            return configuration[key];
        }
        
        // Check data attributes
        const configAttr = root.dataset[key];
        if (configAttr !== undefined) {
            return configAttr;
        }
        
        return defaultValue;
    }
    
    // Auto-refresh workflow data every 30 seconds
    if (window.MaestroUtils && window.MaestroUtils.startAutoRefresh) {
        window.MaestroUtils.startAutoRefresh(() => {
            loadGFDData();
            loadWorkflowProgress();
            loadActivitiesData();
        }, 30000);
    }
    
})();