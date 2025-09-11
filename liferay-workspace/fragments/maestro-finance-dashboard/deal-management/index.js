/**
 * Deal Management Fragment JavaScript
 * Handles deal data loading, filtering, and management
 */

(function() {
    'use strict';
    
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    if (!root) {
        console.error('Deal Management: Could not determine fragment root element');
        return;
    }
    
    let dealsData = [];
    let filteredDeals = [];
    let currentPage = 1;
    
    // Initialize deal management when fragment loads
    initializeDealManagement();
    
    function initializeDealManagement() {
        // Wait for global utilities to be available
        waitForDependencies(() => {
            loadDealsData();
            setupFilters();
            setupPagination();
            setupViewModeHandlers();
        });
    }
    
    function waitForDependencies(callback, retries = 50) {
        if (typeof window.MaestroUtils !== 'undefined') {
            callback();
        } else if (retries > 0) {
            setTimeout(() => waitForDependencies(callback, retries - 1), 100);
        } else {
            console.warn('Deal Management: MaestroUtils not available, using fallback');
            callback();
        }
    }
    
    function loadDealsData() {
        const dealContainer = root.querySelector('.deal-content');
        if (!dealContainer) return;
        
        // Add loading state
        dealContainer.classList.add('loading');
        
        // Load deal data from Liferay Objects
        if (window.MaestroUtils && window.MaestroUtils.loadObjectData) {
            window.MaestroUtils.loadObjectData('MaestroDeal', function(error, data) {
                dealContainer.classList.remove('loading');
                
                if (error) {
                    console.warn('Failed to load deals data, using mock data:', error);
                    generateMockDealsData();
                    return;
                }
                
                if (data && data.items && data.items.length > 0) {
                    dealsData = data.items;
                    applyFilters();
                } else {
                    generateMockDealsData();
                }
            });
        } else {
            dealContainer.classList.remove('loading');
            generateMockDealsData();
        }
    }
    
    function generateMockDealsData() {
        const clients = [
            'TotalEnergies SE', 'EDF Group', 'Schneider Electric', 'LVMH Group', 'L\'Oréal S.A.',
            'Airbus SE', 'Sanofi', 'Orange S.A.', 'Danone', 'Michelin', 'Renault Group',
            'Thales Group', 'Veolia', 'Carrefour', 'Publicis Groupe'
        ];
        
        const dealNames = [
            'Project Meridian', 'Infrastructure Finance', 'Green Bond Facility', 'Digital Transformation',
            'Supply Chain Optimization', 'Renewable Energy Initiative', 'Market Expansion Program',
            'Technology Upgrade', 'Acquisition Financing', 'Working Capital Facility',
            'Export Credit Line', 'Real Estate Development', 'Innovation Partnership'
        ];
        
        const statuses = ['negotiation', 'due-diligence', 'approval', 'closing'];
        const statusLabels = {
            'negotiation': 'Negotiation',
            'due-diligence': 'Due Diligence', 
            'approval': 'Approval',
            'closing': 'Closing'
        };
        const priorities = ['high', 'medium', 'low'];
        
        dealsData = [];
        
        for (let i = 0; i < 147; i++) {
            const client = clients[Math.floor(Math.random() * clients.length)];
            const dealName = dealNames[Math.floor(Math.random() * dealNames.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            const value = (Math.random() * 80 + 5) * 1000000; // 5M to 85M
            
            // Generate closing date (next 3-12 months)
            const closingDate = new Date();
            closingDate.setMonth(closingDate.getMonth() + Math.floor(Math.random() * 9) + 3);
            
            dealsData.push({
                id: i + 1,
                dealName: `${dealName} ${String.fromCharCode(65 + (i % 26))}`,
                client: client,
                value: value,
                status: status,
                statusLabel: statusLabels[status],
                priority: priority,
                closingDate: closingDate.toISOString().split('T')[0],
                lastUpdate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        }
        
        applyFilters();
    }
    
    function setupFilters() {
        const searchInput = root.querySelector('#dealSearch');
        const statusFilter = root.querySelector('#statusFilter');
        const priorityFilter = root.querySelector('#priorityFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', applyFilters);
        }
        
        if (priorityFilter) {
            priorityFilter.addEventListener('change', applyFilters);
        }
    }
    
    function applyFilters() {
        const searchTerm = root.querySelector('#dealSearch')?.value.toLowerCase() || '';
        const statusFilter = root.querySelector('#statusFilter')?.value || 'all';
        const priorityFilter = root.querySelector('#priorityFilter')?.value || 'all';
        
        filteredDeals = dealsData.filter(deal => {
            const matchesSearch = !searchTerm || 
                deal.dealName.toLowerCase().includes(searchTerm) ||
                deal.client.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || deal.priority === priorityFilter;
            
            return matchesSearch && matchesStatus && matchesPriority;
        });
        
        currentPage = 1;
        updateDisplay();
        updatePagination();
    }
    
    function updateDisplay() {
        const viewMode = getConfiguration('viewMode', 'table');
        
        if (viewMode === 'table') {
            updateTableView();
        } else if (viewMode === 'cards') {
            updateCardsView();
        }
        
        updateStatistics();
    }
    
    function updateTableView() {
        const tableBody = root.querySelector('#dealTableBody');
        if (!tableBody) return;
        
        const dealsPerPage = parseInt(getConfiguration('dealsPerPage', '10'));
        const startIndex = (currentPage - 1) * dealsPerPage;
        const endIndex = startIndex + dealsPerPage;
        const pageDeals = filteredDeals.slice(startIndex, endIndex);
        
        const showActions = getConfiguration('showActions', 'true') === 'true';
        
        tableBody.innerHTML = pageDeals.map(deal => `
            <tr>
                <td><strong>${deal.dealName}</strong></td>
                <td>${deal.client}</td>
                <td class="maestro-amount medium">${formatCurrency(deal.value)}</td>
                <td><span class="maestro-status-badge ${getStatusClass(deal.status)}">${deal.statusLabel}</span></td>
                <td><span class="maestro-risk-indicator ${deal.priority}">${capitalize(deal.priority)}</span></td>
                <td>${formatDate(deal.closingDate)}</td>
                ${showActions ? `<td><button class="maestro-btn-sm" onclick="viewDeal(${deal.id})">View</button></td>` : ''}
            </tr>
        `).join('');
    }
    
    function updateCardsView() {
        const cardsGrid = root.querySelector('#dealCardsGrid');
        if (!cardsGrid) return;
        
        const dealsPerPage = parseInt(getConfiguration('dealsPerPage', '10'));
        const startIndex = (currentPage - 1) * dealsPerPage;
        const endIndex = startIndex + dealsPerPage;
        const pageDeals = filteredDeals.slice(startIndex, endIndex);
        
        const showActions = getConfiguration('showActions', 'true') === 'true';
        
        cardsGrid.innerHTML = pageDeals.map(deal => `
            <div class="deal-card ${deal.priority === 'high' ? 'high-priority' : ''}">
                <div class="deal-card-header">
                    <h4>${deal.dealName}</h4>
                    <span class="maestro-status-badge ${getStatusClass(deal.status)}">${deal.statusLabel}</span>
                </div>
                <div class="deal-card-body">
                    <div class="deal-client">${deal.client}</div>
                    <div class="deal-value maestro-amount large">${formatCurrency(deal.value)}</div>
                    <div class="deal-meta">
                        <span class="maestro-risk-indicator ${deal.priority}">${capitalize(deal.priority)} Priority</span>
                        <span class="deal-date">Closing: ${formatDate(deal.closingDate)}</span>
                    </div>
                </div>
                ${showActions ? `
                <div class="deal-card-actions">
                    <button class="maestro-btn-primary" onclick="viewDeal(${deal.id})">View Details</button>
                    <button class="maestro-btn-secondary" onclick="editDeal(${deal.id})">Update</button>
                </div>` : ''}
            </div>
        `).join('');
    }
    
    function updateStatistics() {
        const activeDealsEl = root.querySelector('[data-lfr-editable-id="active-deals"]');
        const pipelineValueEl = root.querySelector('[data-lfr-editable-id="pipeline-value"]');
        const avgCycleEl = root.querySelector('[data-lfr-editable-id="avg-cycle"]');
        const successRateEl = root.querySelector('[data-lfr-editable-id="success-rate"]');
        
        if (activeDealsEl) activeDealsEl.textContent = filteredDeals.length;
        
        if (pipelineValueEl) {
            const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
            pipelineValueEl.textContent = formatCurrency(totalValue);
        }
        
        // These would be calculated from historical data in a real implementation
        if (avgCycleEl) avgCycleEl.textContent = '45 days';
        if (successRateEl) successRateEl.textContent = '87.3%';
    }
    
    function setupPagination() {
        const prevBtn = root.querySelector('.pagination-controls button:first-child');
        const nextBtn = root.querySelector('.pagination-controls button:last-child');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateDisplay();
                    updatePagination();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const dealsPerPage = parseInt(getConfiguration('dealsPerPage', '10'));
                const totalPages = Math.ceil(filteredDeals.length / dealsPerPage);
                
                if (currentPage < totalPages) {
                    currentPage++;
                    updateDisplay();
                    updatePagination();
                }
            });
        }
    }
    
    function updatePagination() {
        const dealsPerPage = parseInt(getConfiguration('dealsPerPage', '10'));
        const totalPages = Math.ceil(filteredDeals.length / dealsPerPage);
        const startIndex = (currentPage - 1) * dealsPerPage + 1;
        const endIndex = Math.min(currentPage * dealsPerPage, filteredDeals.length);
        
        const paginationInfo = root.querySelector('.pagination-info span');
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${filteredDeals.length} deals`;
        }
        
        const prevBtn = root.querySelector('.pagination-controls button:first-child');
        const nextBtn = root.querySelector('.pagination-controls button:last-child');
        
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    }
    
    function setupViewModeHandlers() {
        // This would be used to handle view mode changes if needed
        // Currently handled via Liferay fragment configuration
    }
    
    // Utility functions
    function getConfiguration(key, defaultValue) {
        // Try to get configuration from various sources
        if (typeof configuration !== 'undefined' && configuration[key] !== undefined) {
            return configuration[key];
        }
        
        // Check data attributes
        const configAttr = root.dataset[key];
        if (configAttr !== undefined) {
            return configAttr;
        }
        
        // Check for class-based configuration
        const dealContent = root.querySelector('.deal-content');
        if (dealContent) {
            if (key === 'viewMode') {
                if (dealContent.classList.contains('deal-cards-view')) return 'cards';
                if (dealContent.classList.contains('deal-list-view')) return 'list';
                return 'table';
            }
        }
        
        return defaultValue;
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
    
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    function getStatusClass(status) {
        const statusClasses = {
            'negotiation': 'in-review',
            'due-diligence': 'pending',
            'approval': 'approved',
            'closing': 'approved'
        };
        return statusClasses[status] || 'pending';
    }
    
    function capitalize(str) {
        if (!str || typeof str !== 'string') {
            return str || '';
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // Global functions for button handlers
    window.viewDeal = function(dealId) {
        const deal = dealsData.find(d => d.id === dealId);
        if (deal) {
            const event = new CustomEvent('maestro:deal-view', {
                detail: { deal: deal },
                bubbles: true
            });
            root.dispatchEvent(event);
        }
    };
    
    window.editDeal = function(dealId) {
        const deal = dealsData.find(d => d.id === dealId);
        if (deal) {
            const event = new CustomEvent('maestro:deal-edit', {
                detail: { deal: deal },
                bubbles: true
            });
            root.dispatchEvent(event);
        }
    };
    
})();