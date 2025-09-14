(function() {
  const LIFERAY_HOST = window.location.origin;
  
  // Get configuration from Liferay fragment configuration
  const config = typeof configuration !== 'undefined' ? configuration : {
    showConnections: true,
    starAnimation: 'normal',
    galaxyLayout: 'spiral',
    showLegend: true,
    interactiveZoom: true
  };
  
  // Deal Constellation Controller
  class DealConstellation {
    constructor(containerElement) {
      this.container = containerElement;
      this.deals = [];
      this.stars = [];
      this.connections = [];
      this.canvas = this.container.querySelector('#constellationCanvas');
      this.svg = this.container.querySelector('#connectionSvg');
      this.detailPanel = this.container.querySelector('#dealDetailPanel');
      this.loading = this.container.querySelector('#constellationLoading');
      
      this.zoomLevel = 1;
      this.panX = 0;
      this.panY = 0;
      this.showConnections = config.showConnections;
      this.selectedStar = null;
      
      this.init();
    }
    
    async init() {
      try {
        await this.loadDeals();
        this.setupRenderController();
        this.setupEventListeners();
        this.hideLoading();
      } catch (error) {
        console.error('Failed to initialize Deal Constellation:', error);
        this.showError();
      }
    }
    
    async loadDeals() {
      try {
        this.deals = [];
        let page = 1;
        let hasMorePages = true;
        const pageSize = 20; // Default Liferay page size
        
        // Fetch all pages of deals
        while (hasMorePages) {
          const response = await fetch(`${LIFERAY_HOST}/o/c/maestrodeals?page=${page}&pageSize=${pageSize}&p_auth=${Liferay.authToken}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          const pageDeals = data.items || [];
          
          if (pageDeals.length > 0) {
            // Normalize deal data structure
            const normalizedDeals = pageDeals.map(deal => this.normalizeDeal(deal));
            this.deals.push(...normalizedDeals);
            page++;
            
            // Check if we have more pages (if we got less than pageSize, we're done)
            hasMorePages = pageDeals.length === pageSize;
          } else {
            hasMorePages = false;
          }
        }
        
        // If no data from API, use sample data for demonstration
        if (this.deals.length === 0) {
          this.deals = this.getSampleDeals();
        }
        
        console.log(`Loaded ${this.deals.length} deals for constellation visualization (${page - 1} pages)`);
      } catch (error) {
        console.error('Error loading deals, using sample data:', error);
        this.deals = this.getSampleDeals();
      }
    }
    
    normalizeDeal(deal) {
      // Handle Liferay object field structure where some fields are {key, name} objects
      return {
        dealName: deal.dealName || 'Unknown Deal',
        clientName: deal.clientName || 'Unknown Client',
        dealValue: parseFloat(deal.dealValue) || 0,
        dealStatus: deal.dealStatus?.key || deal.dealStatus || 'prospect',
        dealProbability: parseFloat(deal.dealProbability) || 0,
        priority: deal.priority?.key || deal.priority || 'medium',
        relationshipManager: deal.relationshipManager || 'Unknown Manager',
        expectedClosingDate: deal.expectedClosingDate || '',
        lastUpdated: deal.lastUpdated || '',
        dealType: deal.dealType?.key || deal.dealType || 'Unknown',
        sector: deal.sector?.key || deal.sector || 'Unknown'
      };
    }
    
    getSampleDeals() {
      return [
        {
          dealName: "Air France-KLM Digital Project",
          clientName: "Air France-KLM", 
          dealValue: 1140348138,
          dealStatus: "prospect",
          dealProbability: 25,
          relationshipManager: "Marie Dubois"
        },
        {
          dealName: "Intesa Sanpaolo Sustainability",
          clientName: "Intesa Sanpaolo",
          dealValue: 568427960,
          dealStatus: "qualified", 
          dealProbability: 65,
          relationshipManager: "Isabelle Roux"
        },
        {
          dealName: "Schneider Electric Expansion",
          clientName: "Schneider Electric",
          dealValue: 890000000,
          dealStatus: "proposal",
          dealProbability: 80,
          relationshipManager: "Philippe Martin"
        },
        {
          dealName: "Total Energies Green Finance",
          clientName: "Total Energies",
          dealValue: 1250000000,
          dealStatus: "negotiation",
          dealProbability: 90,
          relationshipManager: "Sophie Blanc"
        },
        {
          dealName: "Vivendi Media Partnership",
          clientName: "Vivendi",
          dealValue: 420000000,
          dealStatus: "closedwon",
          dealProbability: 100,
          relationshipManager: "Jean Moreau"
        },
        {
          dealName: "Failed Telecom Deal",
          clientName: "Orange",
          dealValue: 75000000,
          dealStatus: "closedlost",
          dealProbability: 0,
          relationshipManager: "Claire Petit"
        },
        {
          dealName: "BNP Paribas Digital Bank",
          clientName: "BNP Paribas",
          dealValue: 2400000000,
          dealStatus: "negotiation",
          dealProbability: 85,
          relationshipManager: "Antoine Durand"
        },
        {
          dealName: "Carrefour Supply Chain",
          clientName: "Carrefour",
          dealValue: 650000000,
          dealStatus: "qualified",
          dealProbability: 70,
          relationshipManager: "Nathalie Girard"
        },
        {
          dealName: "Sanofi Research Grant",
          clientName: "Sanofi",
          dealValue: 980000000,
          dealStatus: "proposal",
          dealProbability: 75,
          relationshipManager: "Laurent Bernard"
        },
        {
          dealName: "Airbus Innovation Fund",
          clientName: "Airbus",
          dealValue: 1800000000,
          dealStatus: "negotiation",
          dealProbability: 95,
          relationshipManager: "Céline Dubois"
        }
      ];
    }
    
    setupRenderController() {
      const viewport = this.container.querySelector('.universe-viewport');
      if (!viewport) {
        console.error('Universe viewport not found');
        return;
      }

      // ResizeObserver for robust dimension tracking
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            console.log(`🌟 VIEWPORT RESIZED: ${width}x${height}`);
            this.render(width, height);
          }
        }
      });

      this.resizeObserver.observe(viewport);
      
      // Initial render if dimensions are already available
      if (viewport.clientWidth > 0 && viewport.clientHeight > 0) {
        this.render(viewport.clientWidth, viewport.clientHeight);
      }
    }

    render(viewportWidth, viewportHeight) {
      // Apply padding to ensure stars stay well inside the universe viewport
      const padding = 30; // Reduced padding since container overflow is now hidden
      const canvasWidth = Math.max(viewportWidth - (padding * 2), 200);
      const canvasHeight = Math.max(viewportHeight - (padding * 2), 200);
      
      console.log(`🎯 RENDERING: viewport ${viewportWidth}x${viewportHeight} → canvas ${canvasWidth}x${canvasHeight} (${padding}px padding)`);
      
      // Clear existing stars
      this.canvas.innerHTML = '';
      this.stars = [];
      
      // Position deals using spiral galaxy pattern
      this.deals.forEach((deal, index) => {
        const star = this.createStar(deal, index, canvasWidth, canvasHeight, padding);
        this.canvas.appendChild(star.element);
        this.stars.push(star);
      });
      
      console.log(`✅ Created ${this.stars.length} stars inside ${canvasWidth}x${canvasHeight} canvas area`);
      
      // Create connections AFTER stars are built
      this.createConnections();
      
      // Set up event handlers for all stars
      this.setupStarEventHandlers();
    }
    
    createStar(deal, index, canvasWidth, canvasHeight, padding) {
      const element = document.createElement('div');
      element.className = 'deal-star';
      
      // Determine size based on deal value
      const dealValue = parseFloat(deal.dealValue) || 0;
      let sizeClass = 'size-small';
      if (dealValue > 50000000) sizeClass = 'size-mega';
      else if (dealValue > 20000000) sizeClass = 'size-huge';
      else if (dealValue > 10000000) sizeClass = 'size-large';
      else if (dealValue > 5000000) sizeClass = 'size-medium';
      
      // Determine color based on status
      const status = deal.dealStatus?.toLowerCase() || 'prospect';
      const colorClass = `star-${status}`;
      
      element.className += ` ${sizeClass} ${colorClass}`;
      
      // Position using selected galaxy layout algorithm
      const position = this.calculatePosition(index, this.deals.length, canvasWidth, canvasHeight, dealValue);
      
      // Add padding offset to position inside the viewport
      element.style.left = (position.x + padding) + 'px';
      element.style.top = (position.y + padding) + 'px';
      
      console.log(`⭐ Star ${index}: ${deal.dealName} → (${position.x + padding}, ${position.y + padding}) in ${canvasWidth + padding * 2}x${canvasHeight + padding * 2} viewport`);
      
      // Store deal data
      element.dealData = deal;
      
      return {
        element: element,
        deal: deal,
        x: position.x + padding,
        y: position.y + padding,
        size: this.getSizeValue(sizeClass),
        status: status
      };
    }
    
    calculatePosition(index, total, canvasWidth, canvasHeight, dealValue) {
      switch (config.galaxyLayout) {
        case 'scattered':
          return this.calculateScatteredPosition(index, total, canvasWidth, canvasHeight, dealValue);
        case 'clustered':
          return this.calculateClusteredPosition(index, total, canvasWidth, canvasHeight, dealValue);
        default: // 'spiral'
          return this.calculateSpiralPosition(index, total, canvasWidth, canvasHeight, dealValue);
      }
    }
    
    calculateSpiralPosition(index, total, canvasWidth, canvasHeight, dealValue) {
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      
      // Create spiral arms based on deal status
      const spiralArms = 5;
      const armIndex = index % spiralArms;
      const armAngle = (armIndex * 2 * Math.PI) / spiralArms;
      
      // Distance from center based on deal progress and value
      const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.4;
      const progressFactor = this.getProgressFactor(index, total);
      const valueFactor = Math.log(dealValue + 1) / Math.log(100000000); // Normalize large values
      const radius = (progressFactor * 0.7 + valueFactor * 0.3) * maxRadius;
      
      // Add spiral twist
      const spiralTight = 0.3;
      const angle = armAngle + (radius * spiralTight);
      
      // Add some randomness for organic feel
      const randomOffset = 20;
      const randomAngle = Math.random() * Math.PI * 2;
      const randomRadius = Math.random() * randomOffset;
      
      const x = centerX + Math.cos(angle) * radius + Math.cos(randomAngle) * randomRadius;
      const y = centerY + Math.sin(angle) * radius + Math.sin(randomAngle) * randomRadius;
      
      // Keep within bounds
      return {
        x: Math.max(20, Math.min(canvasWidth - 40, x)),
        y: Math.max(20, Math.min(canvasHeight - 40, y))
      };
    }
    
    getProgressFactor(index, total) {
      // Distribute based on index with some clustering
      const base = index / total;
      const cluster = Math.sin(base * Math.PI * 3) * 0.2; // Create clusters
      return Math.max(0.1, Math.min(0.9, base + cluster));
    }
    
    calculateScatteredPosition(index, total, canvasWidth, canvasHeight, dealValue) {
      // Random but weighted by value
      const padding = 30;
      const valueFactor = Math.log(dealValue + 1) / Math.log(100000000);
      
      // Higher value deals get better positions (center area)
      const centerWeight = valueFactor * 0.6 + 0.2;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.4;
      
      const angle = Math.random() * Math.PI * 2;
      const radius = (1 - centerWeight) * maxRadius + Math.random() * maxRadius * 0.3;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      return {
        x: Math.max(padding, Math.min(canvasWidth - padding, x)),
        y: Math.max(padding, Math.min(canvasHeight - padding, y))
      };
    }
    
    calculateClusteredPosition(index, total, canvasWidth, canvasHeight, dealValue) {
      // Group by deal status for clustering
      const padding = 30;
      const clusterCenters = [
        { x: canvasWidth * 0.25, y: canvasHeight * 0.3 }, // Prospect cluster
        { x: canvasWidth * 0.75, y: canvasHeight * 0.3 }, // Qualified cluster
        { x: canvasWidth * 0.25, y: canvasHeight * 0.7 }, // Proposal cluster
        { x: canvasWidth * 0.75, y: canvasHeight * 0.7 }, // Negotiation cluster
        { x: canvasWidth * 0.5, y: canvasHeight * 0.5 }   // Closed deals center
      ];
      
      const statusOrder = ['prospect', 'qualified', 'proposal', 'negotiation', 'closedwon'];
      const deal = this.deals[index];
      const status = deal.dealStatus?.toLowerCase() || 'prospect';
      const clusterIndex = statusOrder.indexOf(status);
      const center = clusterCenters[clusterIndex] || clusterCenters[0];
      
      // Add randomness within cluster
      const clusterRadius = 60;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * clusterRadius;
      
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;
      
      return {
        x: Math.max(padding, Math.min(canvasWidth - padding, x)),
        y: Math.max(padding, Math.min(canvasHeight - padding, y))
      };
    }
    
    getSizeValue(sizeClass) {
      const sizes = {
        'size-small': 8,
        'size-medium': 12,
        'size-large': 16,
        'size-huge': 20,
        'size-mega': 24
      };
      return sizes[sizeClass] || 8;
    }
    
    createConnections() {
      if (!this.showConnections) return;
      
      // Clear existing connections
      this.svg.innerHTML = '';
      this.connections = [];
      
      // Create connections between deals of the same client
      const clientGroups = this.groupByClient();
      
      Object.keys(clientGroups).forEach(clientName => {
        const clientDeals = clientGroups[clientName];
        if (clientDeals.length > 1) {
          this.connectStars(clientDeals);
        }
      });
      
      // Create weak connections between similar value deals
      this.createValueConnections();
    }
    
    groupByClient() {
      const groups = {};
      this.stars.forEach(star => {
        const clientName = star.deal.clientName || 'Unknown';
        if (!groups[clientName]) {
          groups[clientName] = [];
        }
        groups[clientName].push(star);
      });
      return groups;
    }
    
    connectStars(stars) {
      for (let i = 0; i < stars.length - 1; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const line = this.createConnectionLine(stars[i], stars[j], 'strong');
          this.svg.appendChild(line);
          this.connections.push(line);
        }
      }
    }
    
    createValueConnections() {
      // Connect deals with similar values (loose connections)
      const sortedStars = [...this.stars].sort((a, b) => {
        const valueA = parseFloat(a.deal.dealValue) || 0;
        const valueB = parseFloat(b.deal.dealValue) || 0;
        return valueB - valueA;
      });
      
      // Create connections between every 3rd similar-value deal
      for (let i = 0; i < sortedStars.length - 3; i += 3) {
        const star1 = sortedStars[i];
        const star2 = sortedStars[i + 3];
        
        const value1 = parseFloat(star1.deal.dealValue) || 0;
        const value2 = parseFloat(star2.deal.dealValue) || 0;
        
        // Only connect if values are within similar range
        if (Math.abs(value1 - value2) / Math.max(value1, value2) < 0.5) {
          const line = this.createConnectionLine(star1, star2, 'weak');
          this.svg.appendChild(line);
          this.connections.push(line);
        }
      }
    }
    
    createConnectionLine(star1, star2, strength) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      
      line.setAttribute('x1', star1.x + star1.size / 2);
      line.setAttribute('y1', star1.y + star1.size / 2);
      line.setAttribute('x2', star2.x + star2.size / 2);
      line.setAttribute('y2', star2.y + star2.size / 2);
      line.classList.add('connection-line');
      
      if (strength === 'strong') {
        line.classList.add('strong');
      }
      
      return line;
    }
    
    setupEventListeners() {
      // Control buttons
      const zoomIn = this.container.querySelector('#zoomIn');
      const zoomOut = this.container.querySelector('#zoomOut');
      const resetView = this.container.querySelector('#resetView');
      const toggleConnections = this.container.querySelector('#toggleConnections');
      const closePanel = this.container.querySelector('#closePanel');
      
      zoomIn?.addEventListener('click', () => this.zoom(1.2));
      zoomOut?.addEventListener('click', () => this.zoom(0.8));
      resetView?.addEventListener('click', () => this.resetView());
      toggleConnections?.addEventListener('click', () => this.toggleConnections());
      closePanel?.addEventListener('click', () => this.hideDealDetails());
    }
    
    setupStarEventHandlers() {
      // Star interaction events - set up after stars are created
      this.stars.forEach(star => {
        star.element.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectStar(star);
          this.showDealDetails(star.deal);
          console.log('Star clicked:', star.deal.dealName);
        });
        
        star.element.addEventListener('mouseenter', (e) => {
          this.highlightConnectedStars(star);
          this.showTooltip(star, e);
        });
        
        star.element.addEventListener('mouseleave', () => {
          this.clearHighlights();
          this.hideTooltip();
        });
      });
    }
    
    showTooltip(star, event) {
      console.log('Showing tooltip for:', star.deal.dealName);
      
      // Create tooltip element in document.body to avoid clipping
      let tooltip = document.body.querySelector('.constellation-star-tooltip');
      if (!tooltip) {
        console.log('Creating new tooltip element in body');
        tooltip = document.createElement('div');
        tooltip.className = 'constellation-star-tooltip';
        tooltip.style.cssText = `
          position: fixed;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid rgba(0, 166, 81, 0.5);
          border-radius: 6px;
          padding: 8px 12px;
          z-index: 99999;
          pointer-events: none;
          backdrop-filter: blur(10px);
          max-width: 250px;
          font-size: 0.8rem;
          color: white;
          font-family: Arial, sans-serif;
          display: none;
        `;
        document.body.appendChild(tooltip);
      }
      
      // Update tooltip content
      const deal = star.deal;
      tooltip.innerHTML = `
        <div style="color: #00A651; font-weight: 600; margin-bottom: 4px; font-size: 0.85rem;">
          ${deal.dealName || 'Unknown Deal'}
        </div>
        <div style="color: #ffffff;">
          <div style="margin-bottom: 2px;"><strong style="color: #cccccc;">Client:</strong> ${deal.clientName || 'Unknown'}</div>
          <div style="margin-bottom: 2px;"><strong style="color: #cccccc;">Value:</strong> ${this.formatCurrency(parseFloat(deal.dealValue) || 0)}</div>
          <div style="margin-bottom: 2px;"><strong style="color: #cccccc;">Status:</strong> ${deal.dealStatus?.name || deal.dealStatus || 'Unknown'}</div>
          <div><strong style="color: #cccccc;">Probability:</strong> ${deal.dealProbability || this.calculateProbabilityFromStatus(deal.dealStatus?.key || deal.dealStatus)}%</div>
        </div>
      `;
      
      // Position tooltip using getBoundingClientRect for accurate positioning
      const rect = star.element.getBoundingClientRect();
      const tooltipWidth = 250; // max-width
      const tooltipHeight = 100; // estimated height
      
      // Position to the right of the star, but clamp within viewport
      let left = rect.right + 10;
      let top = rect.top;
      
      // Clamp to viewport boundaries
      if (left + tooltipWidth > window.innerWidth) {
        left = rect.left - tooltipWidth - 10; // Show on left side
      }
      if (top + tooltipHeight > window.innerHeight) {
        top = window.innerHeight - tooltipHeight - 10;
      }
      if (left < 0) left = 10;
      if (top < 0) top = 10;
      
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
      
      console.log(`✅ Tooltip positioned at (${left}, ${top}) for star at (${rect.left}, ${rect.top})`);
    }
    
    hideTooltip() {
      const tooltip = document.body.querySelector('.constellation-star-tooltip');
      if (tooltip) {
        tooltip.style.display = 'none';
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
        console.log('Tooltip hidden');
      }
    }
    
    selectStar(star) {
      // Clear previous selection
      this.stars.forEach(s => s.element.classList.remove('selected'));
      
      // Select new star
      star.element.classList.add('selected');
      this.selectedStar = star;
    }
    
    showDealDetails(deal) {
      const clientName = deal.clientName || 'Unknown Client';
      const dealValue = parseFloat(deal.dealValue) || 0;
      const statusName = deal.dealStatus?.name || deal.dealStatus || 'Unknown';
      const probability = deal.dealProbability || this.calculateProbabilityFromStatus(deal.dealStatus?.key || deal.dealStatus);
      const manager = deal.relationshipManager || 'Unassigned';
      
      this.detailPanel.querySelector('.deal-title').textContent = deal.dealId || 'Deal';
      this.detailPanel.querySelector('.deal-client').textContent = clientName;
      this.detailPanel.querySelector('.deal-value').textContent = this.formatCurrency(dealValue);
      this.detailPanel.querySelector('.deal-status').textContent = status;
      this.detailPanel.querySelector('.deal-probability').textContent = probability + '%';
      this.detailPanel.querySelector('.deal-manager').textContent = manager;
      
      this.detailPanel.classList.add('show');
    }
    
    hideDealDetails() {
      this.detailPanel.classList.remove('show');
      if (this.selectedStar) {
        this.selectedStar.element.classList.remove('selected');
        this.selectedStar = null;
      }
    }
    
    highlightConnectedStars(targetStar) {
      // Find connections involving this star
      const connectedLines = Array.from(this.svg.querySelectorAll('.connection-line'));
      const targetX = targetStar.x + targetStar.size / 2;
      const targetY = targetStar.y + targetStar.size / 2;
      
      connectedLines.forEach(line => {
        const x1 = parseInt(line.getAttribute('x1'));
        const y1 = parseInt(line.getAttribute('y1'));
        const x2 = parseInt(line.getAttribute('x2'));
        const y2 = parseInt(line.getAttribute('y2'));
        
        if ((Math.abs(x1 - targetX) < 5 && Math.abs(y1 - targetY) < 5) ||
            (Math.abs(x2 - targetX) < 5 && Math.abs(y2 - targetY) < 5)) {
          line.classList.add('active');
        }
      });
    }
    
    clearHighlights() {
      const activeLines = this.svg.querySelectorAll('.connection-line.active');
      activeLines.forEach(line => line.classList.remove('active'));
    }
    
    zoom(factor) {
      this.zoomLevel *= factor;
      this.zoomLevel = Math.max(0.5, Math.min(3, this.zoomLevel));
      this.updateTransform();
    }
    
    resetView() {
      this.zoomLevel = 1;
      this.panX = 0;
      this.panY = 0;
      this.updateTransform();
    }
    
    updateTransform() {
      const transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel})`;
      this.canvas.style.transform = transform;
      this.svg.style.transform = transform;
    }
    
    toggleConnections() {
      this.showConnections = !this.showConnections;
      if (this.showConnections) {
        this.createConnections();
        this.svg.style.display = 'block';
      } else {
        this.svg.style.display = 'none';
      }
    }
    
    formatCurrency(value) {
      if (value >= 1000000) {
        return '€' + (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return '€' + (value / 1000).toFixed(0) + 'K';
      } else {
        return '€' + value.toLocaleString();
      }
    }
    
    calculateProbabilityFromStatus(status) {
      // Generate sensible probability percentages based on deal status
      const statusKey = (status || 'prospect').toLowerCase();
      const probabilities = {
        'prospect': Math.floor(Math.random() * 11) + 15,     // 15-25%
        'qualified': Math.floor(Math.random() * 11) + 35,    // 35-45%
        'proposal': Math.floor(Math.random() * 11) + 55,     // 55-65%
        'negotiation': Math.floor(Math.random() * 11) + 75,  // 75-85%
        'closedwon': 100,                                    // 100%
        'closedlost': 0                                      // 0%
      };
      
      return probabilities[statusKey] || probabilities['prospect'];
    }
    
    hideLoading() {
      if (this.loading) {
        this.loading.style.display = 'none';
      }
      
      // Apply configuration settings
      this.applyConfiguration();
    }
    
    applyConfiguration() {
      // Apply legend visibility
      const legend = this.container.querySelector('.constellation-legend');
      if (legend) {
        legend.style.display = config.showLegend ? 'block' : 'none';
      }
      
      // Apply zoom controls visibility
      const controls = this.container.querySelector('.constellation-controls');
      if (controls) {
        controls.style.display = config.interactiveZoom ? 'flex' : 'none';
      }
      
      // Apply star animation intensity
      const animationClasses = ['star-animation-none', 'star-animation-subtle', 'star-animation-normal', 'star-animation-intense'];
      animationClasses.forEach(cls => this.canvas.classList.remove(cls));
      const animationClass = 'star-animation-' + config.starAnimation;
      this.canvas.classList.add(animationClass);
      
      // Apply connection visibility
      if (this.svg) {
        this.svg.style.display = config.showConnections ? 'block' : 'none';
      }
    }
    
    showError() {
      if (this.loading) {
        this.loading.querySelector('.loading-text').textContent = 'Error mapping deal universe';
        this.loading.querySelector('.loading-stars').style.display = 'none';
      }
    }
  }
  
  // Initialize Deal Constellation
  const constellationInstance = new DealConstellation(fragmentElement);
  
  // Handle resize events
  window.addEventListener('resize', () => {
    setTimeout(() => {
      // Stars are created automatically by the render method when ResizeObserver detects viewport changes
      constellationInstance.createConnections();
    }, 100);
  });
})();