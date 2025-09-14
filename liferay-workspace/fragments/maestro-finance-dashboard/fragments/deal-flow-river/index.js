(function() {
  const LIFERAY_HOST = window.location.origin;
  
  // Get configuration from Liferay fragment configuration
  const config = typeof configuration !== 'undefined' ? configuration : {
    riverSpeed: 'normal',
    showTooltips: true,
    particleSize: 'medium', 
    showLostDrain: true
  };
  
  // Time Controller for temporal visualization
  class TimeController {
    constructor(riverInstance) {
      this.river = riverInstance;
      this.container = riverInstance.container;
      this.sweepElement = null;
      this.timeHudElement = null;
      this.cycleDuration = 8; // seconds
      this.isPaused = false;
      this.currentSpeed = 'normal';
    }
    
    start() {
      this.sweepElement = this.container.querySelector('.now-sweep');
      this.timeHudElement = this.container.querySelector('.current-time');
      this.updateTimeDisplay();
      this.updateSweepAnimation();
    }
    
    stop() {
      // Time visualization stops with main animation
    }
    
    setPaused(paused) {
      this.isPaused = paused;
      if (this.sweepElement) {
        this.sweepElement.style.animationPlayState = paused ? 'paused' : 'running';
      }
    }
    
    updateSpeed(speed) {
      this.currentSpeed = speed;
      this.updateSweepAnimation();
    }
    
    updateSweepSpeed(cycleDuration) {
      this.cycleDuration = cycleDuration;
      this.updateSweepAnimation();
    }
    
    updateSweepAnimation() {
      if (this.sweepElement) {
        this.sweepElement.style.animationDuration = `${this.cycleDuration}s`;
      }
    }
    
    updateTimeDisplay() {
      if (this.timeHudElement) {
        const today = new Date();
        const options = { day: '2-digit', month: 'short' };
        const dateStr = today.toLocaleDateString('en-GB', options);
        this.timeHudElement.textContent = `Today ${dateStr}`;
      }
    }
  }

  // Deal Flow River Animation Controller
  class DealFlowRiver {
    constructor(containerElement) {
      this.container = containerElement;
      this.deals = [];
      this.particles = [];
      this.animationId = null;
      this.isPaused = false;
      this.tooltip = this.container.querySelector('#dealTooltip');
      this.loading = this.container.querySelector('#riverLoading');
      
      // Time controller for visualization
      this.timeController = new TimeController(this);
      
      this.init();
    }
    
    async init() {
      try {
        this.startTime = Date.now();
        this.lastUpdateSecond = -1;
        await this.loadDeals();
        this.generateDealTimeline();
        this.timeController = new TimeController(this);
        this.timeController.start();
        this.setupTimeControls();
        this.startAnimation();
        this.hideLoading();
      } catch (error) {
        console.error('Failed to initialize Deal Flow River:', error);
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
        
        console.log(`Loaded ${this.deals.length} deals for flow visualization (${page - 1} pages)`);
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
        relationshipManager: deal.relationshipManager || 'Unknown Manager'
      };
    }
    
    getSampleDeals() {
      return [
        {
          dealName: "Air France-KLM Digital Project",
          clientName: "Air France-KLM", 
          dealValue: 1140348138,
          dealStatus: "prospect",
          dealProbability: 25
        },
        {
          dealName: "Intesa Sanpaolo Sustainability",
          clientName: "Intesa Sanpaolo",
          dealValue: 568427960,
          dealStatus: "qualified", 
          dealProbability: 65
        },
        {
          dealName: "Schneider Electric Expansion",
          clientName: "Schneider Electric",
          dealValue: 890000000,
          dealStatus: "proposal",
          dealProbability: 80
        },
        {
          dealName: "Total Energies Green Finance",
          clientName: "Total Energies",
          dealValue: 1250000000,
          dealStatus: "negotiation",
          dealProbability: 90
        },
        {
          dealName: "Vivendi Media Partnership",
          clientName: "Vivendi",
          dealValue: 420000000,
          dealStatus: "closedwon",
          dealProbability: 100
        },
        {
          dealName: "Failed Telecom Deal",
          clientName: "Orange",
          dealValue: 75000000,
          dealStatus: "closedlost",
          dealProbability: 0
        },
        {
          dealName: "BNP Paribas Digital Bank",
          clientName: "BNP Paribas",
          dealValue: 2400000000,
          dealStatus: "negotiation",
          dealProbability: 85
        },
        {
          dealName: "Carrefour Supply Chain",
          clientName: "Carrefour",
          dealValue: 650000000,
          dealStatus: "qualified",
          dealProbability: 70
        }
      ];
    }
    
    createParticles(dealGroups) {
      // Accept pre-grouped deals or create initial grouping
      if (!dealGroups) {
        const timeRatio = this.getCurrentTimeRatio();
        dealGroups = this.groupDealsByCurrentTime(timeRatio);
      }
      
      this.particles = []; // Reset particles array
      const dealsByStatus = dealGroups;
      
      console.log(`Creating particles for ${this.deals.length} deals in river`);
      
      // Create particles for each deal
      Object.keys(dealsByStatus).forEach(status => {
        const channelDeals = dealsByStatus[status];
        const channel = this.container.querySelector(`.channel[data-stage="${status}"]`);
        
        if (channel && channelDeals.length > 0) {
          const particleContainer = channel.querySelector('.deal-particles');
          
          // Ensure particle container has dimensions
          if (particleContainer) {
            console.log(`Creating ${channelDeals.length} particles for ${status} channel`);
            
            channelDeals.forEach((deal, index) => {
              const particle = this.createParticle(deal, status, index, channelDeals.length);
              particleContainer.appendChild(particle);
              this.particles.push({
                element: particle,
                deal: deal,
                status: status,
                startTime: Date.now() + (index * 800) // Stagger particle creation
              });
            });
          }
        }
      });
      
      console.log(`Total particles created: ${this.particles.length}`);
    }
    
    createParticle(deal, status, index, totalInChannel) {
      const particle = document.createElement('div');
      particle.className = `deal-particle particle-${status}`;
      
      // Dynamic size based on deal value - continuous scaling
      const dealValue = parseFloat(deal.dealValue) || 1000000; // Default 1M if no value
      
      // Calculate size scaling: more reasonable range for channel layout
      const minSize = 20;
      const maxSize = 50;
      const minValue = 500000;   // €500K minimum
      const maxValue = 50000000; // €50M maximum
      
      // Use logarithmic scaling for better visual distribution
      const logValue = Math.log(Math.max(dealValue, minValue));
      const logMin = Math.log(minValue);
      const logMax = Math.log(maxValue);
      const sizeRatio = Math.min(1, Math.max(0, (logValue - logMin) / (logMax - logMin)));
      const calculatedSize = minSize + (maxSize - minSize) * sizeRatio;
      
      // Apply size directly to particle
      particle.style.width = `${calculatedSize}px`;
      particle.style.height = `${calculatedSize}px`;
      
      // Store size for positioning calculations
      particle.calculatedSize = calculatedSize;
      
      // Position within channel (quadrupled height) - side by side arrangement
      const channelHeight = 160;
      
      // Position deals in date order across the channel (earliest to latest)
      if (totalInChannel > 1) {
        // Position deals with guaranteed non-overlapping layout
        const sequencePosition = deal.sequenceInChannel || 0;
        const position = this.calculateNonOverlappingPosition(
          sequencePosition, 
          totalInChannel, 
          calculatedSize, 
          channelHeight
        );
        
        particle.style.top = `${position.top}px`;
        particle.style.left = `${position.left}%`;
        if (position.transform) {
          particle.style.transform = position.transform;
        }
        if (position.display) {
          particle.style.display = position.display;
        }
        
        // Apply adjusted particle size if provided
        if (position.adjustedSize && position.adjustedSize !== calculatedSize) {
          particle.style.width = `${position.adjustedSize}px`;
          particle.style.height = `${position.adjustedSize}px`;
        }
      } else {
        // Single deal: center in channel
        const verticalPosition = (channelHeight / 2) - (calculatedSize / 2);
        particle.style.top = `${verticalPosition}px`;
        particle.style.left = '50%';
        particle.style.transform = 'translateX(-50%)';
      }
      
      // Store deal data for tooltip
      particle.dealData = deal;
      
      // Create deal value label above particle
      const valueLabel = document.createElement('div');
      valueLabel.className = 'deal-value-label';
      valueLabel.textContent = `€${this.formatCurrency(dealValue)}`;
      valueLabel.style.cssText = `
        position: absolute;
        top: -45px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 16px;
        color: #00A651;
        font-weight: 700;
        white-space: nowrap;
        pointer-events: none;
        z-index: 30;
        background: rgba(0, 0, 0, 0.8);
        padding: 2px 6px;
        border-radius: 4px;
      `;
      particle.appendChild(valueLabel);
      
      // Create date label below the value
      const dateLabel = document.createElement('div');
      dateLabel.className = 'deal-date-label';
      // Use expected closing date or last updated date
      const dateToShow = deal.expectedClosingDate || deal.lastUpdated || deal.dateCreated;
      let formattedDate = '';
      if (dateToShow) {
        const date = new Date(dateToShow);
        formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
      } else {
        // Generate a realistic future date for demo
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 90) + 30); // 30-120 days from now
        formattedDate = futureDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
      }
      dateLabel.textContent = formattedDate;
      dateLabel.style.cssText = `
        position: absolute;
        top: -22px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 13px;
        color: #ffffff;
        font-weight: 600;
        white-space: nowrap;
        pointer-events: none;
        z-index: 30;
        background: rgba(0, 0, 0, 0.8);
        padding: 1px 4px;
        border-radius: 3px;
      `;
      particle.appendChild(dateLabel);
      
      return particle;
    }
    
    calculateNonOverlappingPosition(sequencePosition, totalInChannel, particleSize, channelHeight) {
      if (totalInChannel === 1) {
        // Single deal: center in channel
        const verticalPosition = (channelHeight / 2) - (particleSize / 2);
        return {
          top: Math.max(5, Math.min(channelHeight - particleSize - 5, verticalPosition)),
          left: 50,
          transform: 'translateX(-50%)'
        };
      }
      
      // Capacity-aware grid system - guaranteed zero overlap
      const containerWidth = this.container.clientWidth || 800; // Fallback width
      const channelWidthPx = containerWidth * 0.90; // 90% of container width in pixels
      const startMarginPx = containerWidth * 0.05; // 5% left margin in pixels
      
      // Calculate adaptive sizing to fit all deals
      let adjustedParticleSize = particleSize;
      let minSpacingPx = Math.max(adjustedParticleSize + 10, 35);
      let rowHeight = adjustedParticleSize + 15;
      
      // Calculate maximum possible grid capacity
      let maxCols = Math.max(1, Math.floor(channelWidthPx / minSpacingPx));
      let maxRows = Math.max(1, Math.floor((channelHeight - 10) / rowHeight));
      let maxCapacity = maxCols * maxRows;
      
      // Reduce particle size if needed to fit all deals
      while (maxCapacity < totalInChannel && adjustedParticleSize > 20) {
        adjustedParticleSize = Math.max(20, adjustedParticleSize - 5);
        minSpacingPx = Math.max(adjustedParticleSize + 8, 30);
        rowHeight = adjustedParticleSize + 12;
        maxCols = Math.max(1, Math.floor(channelWidthPx / minSpacingPx));
        maxRows = Math.max(1, Math.floor((channelHeight - 10) / rowHeight));
        maxCapacity = maxCols * maxRows;
      }
      
      // Calculate required columns for this channel
      const neededCols = Math.min(maxCols, Math.ceil(totalInChannel / maxRows));
      
      // Calculate grid position (no modulo wrapping - guaranteed unique positions)
      const row = Math.floor(sequencePosition / neededCols);
      const col = sequencePosition % neededCols;
      
      // If still exceeding capacity, use overflow paging
      if (sequencePosition >= maxCapacity) {
        // Hide overflow particles - they'll be shown in next animation cycle
        return {
          top: -1000, // Hide offscreen
          left: -1000,
          display: 'none'
        };
      }
      
      // Calculate horizontal position (center-based)
      const colSpacing = neededCols > 1 ? channelWidthPx / (neededCols - 1) : 0;
      const horizontalPositionPx = startMarginPx + (col * colSpacing);
      const horizontalPositionPercent = (horizontalPositionPx / containerWidth) * 100;
      
      // Calculate vertical position
      const verticalPosition = 10 + (row * rowHeight) + (rowHeight / 2) - (adjustedParticleSize / 2);
      
      return {
        top: Math.max(5, Math.min(channelHeight - adjustedParticleSize - 5, verticalPosition)),
        left: Math.max(5, Math.min(95, horizontalPositionPercent)),
        transform: 'translateX(-50%)', // Center particles horizontally
        adjustedSize: adjustedParticleSize // Return adjusted size for particle rendering
      };
    }
    
    getSameTimeOffset(deal, index, totalInChannel) {
      // Create slight vertical offset for deals with same dates to avoid overlap
      // Group by date and create small vertical spacing within each date group
      const dealDate = this.getDealDate(deal).toDateString();
      const sameTimeDeals = [];
      
      // Find all deals with same date in current group (simplified approach)
      const hash = this.hashCode(dealDate + deal.dealName);
      const offset = (hash % 5) - 2; // Random offset between -2 and +2
      
      return offset * 3; // Multiply by 3px for subtle separation
    }
    
    generateDealTimeline() {
      // Create synthetic timeline where all deals start in qualified and progress to final state
      this.dealTimeline = [];
      
      this.deals.forEach(deal => {
        const finalStatus = (deal.dealStatus?.key || deal.dealStatus || 'qualified').toLowerCase();
        if (finalStatus === 'prospect') return; // Skip prospects
        
        const progression = this.createDealProgression(deal, finalStatus);
        this.dealTimeline.push(...progression);
      });
      
      // Sort all timeline events by timestamp
      this.dealTimeline.sort((a, b) => a.timestamp - b.timestamp);
    }
    
    createDealProgression(deal, finalStatus) {
      const baseDate = this.getDealDate(deal);
      const events = [];
      
      // Define progression path to final status
      const progressionPath = this.getProgressionPath(finalStatus);
      
      // Generate timeline events for each stage
      progressionPath.forEach((status, index) => {
        // Space events over 30-90 days before final date
        const daysBeforeEnd = (progressionPath.length - index - 1) * 20 + Math.random() * 20;
        const eventDate = new Date(baseDate.getTime() - (daysBeforeEnd * 24 * 60 * 60 * 1000));
        
        events.push({
          deal: deal,
          status: status,
          timestamp: eventDate.getTime(),
          eventType: index === 0 ? 'entry' : 'transition'
        });
      });
      
      return events;
    }
    
    getProgressionPath(finalStatus) {
      // Define realistic progression paths to each final status
      const paths = {
        'qualified': ['qualified'],
        'proposal': ['qualified', 'proposal'],
        'negotiation': ['qualified', 'proposal', 'negotiation'],
        'closedwon': ['qualified', 'proposal', 'negotiation', 'closedwon'],
        'closedlost': Math.random() > 0.5 
          ? ['qualified', 'closedlost'] // Early loss
          : ['qualified', 'proposal', 'closedlost'] // Later loss
      };
      
      return paths[finalStatus] || ['qualified'];
    }
    
    getTimelineCurrentTime(timeRatio) {
      // Convert animation time ratio (0-1) to actual timeline timestamp
      if (!this.dealTimeline || this.dealTimeline.length === 0) return Date.now();
      
      const earliest = this.dealTimeline[0].timestamp;
      const latest = this.dealTimeline[this.dealTimeline.length - 1].timestamp;
      const timeRange = latest - earliest;
      
      return earliest + (timeRange * timeRatio);
    }
    
    groupDealsByCurrentTime(currentTimeRatio) {
      // Group deals by their current status at this point in the timeline
      const currentTime = this.getTimelineCurrentTime(currentTimeRatio);
      const groups = {
        qualified: [],
        proposal: [],
        negotiation: [],
        closedwon: [],
        closedlost: []
      };
      
      // Find what status each deal should be in at current time
      this.deals.forEach(deal => {
        const currentStatus = this.getDealStatusAtTime(deal, currentTime);
        if (currentStatus && groups[currentStatus]) {
          // Add deal with its last event timestamp for ordering
          const lastEventTime = this.getLastEventTimeForDeal(deal, currentTime);
          groups[currentStatus].push({
            ...deal,
            lastEventTime: lastEventTime
          });
        }
      });
      
      // Sort each group chronologically and assign sequence positions
      Object.keys(groups).forEach(status => {
        groups[status].sort((a, b) => a.lastEventTime - b.lastEventTime);
        groups[status].forEach((deal, index) => {
          deal.sequenceInChannel = index;
        });
      });
      
      return groups;
    }
    
    getLastEventTimeForDeal(deal, currentTime) {
      // Find the most recent event for this deal before current time
      const dealEvents = this.dealTimeline.filter(event => 
        event.deal === deal && event.timestamp <= currentTime
      );
      
      if (dealEvents.length === 0) return 0;
      return dealEvents[dealEvents.length - 1].timestamp;
    }
    
    getCurrentTimeRatio() {
      if (!this.startTime) return 0;
      const currentTime = Date.now();
      const speedMultiplier = config.riverSpeed === 'slow' ? 1.5 : 
                             config.riverSpeed === 'fast' ? 0.5 : 1.0;
      const cycleDuration = 8 * speedMultiplier;
      const elapsed = (currentTime - this.startTime) / 1000;
      return (elapsed % cycleDuration) / cycleDuration;
    }
    
    getDealDate(deal) {
      // Try to get a meaningful date from the deal
      const dateStr = deal.expectedClosingDate || deal.lastUpdated || deal.dateCreated;
      if (dateStr) {
        return new Date(dateStr);
      }
      
      // Generate consistent fake dates based on deal name for demo
      const hash = this.hashCode(deal.dealName || 'Unknown');
      const baseDate = new Date();
      const daysOffset = (hash % 120) - 60; // ±60 days from now
      baseDate.setDate(baseDate.getDate() + daysOffset);
      return baseDate;
    }
    
    hashCode(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    }
    
    startAnimation() {
      const animate = () => {
        this.updateParticles();
        this.animationId = requestAnimationFrame(animate);
      };
      animate();
    }
    
    updateParticles() {
      if (this.isPaused) return; // Pause animation when hovering
      
      const currentTime = Date.now();
      const speedMultiplier = config.riverSpeed === 'slow' ? 1.5 : 
                             config.riverSpeed === 'fast' ? 0.5 : 1.0;
      const cycleDuration = 8 * speedMultiplier;
      
      // Calculate current time ratio for timeline progression
      const elapsed = (currentTime - this.startTime) / 1000;
      const timeRatio = (elapsed % cycleDuration) / cycleDuration;
      
      // Update particles based on timeline - refresh deal states
      if (Math.floor(elapsed) !== this.lastUpdateSecond) {
        this.lastUpdateSecond = Math.floor(elapsed);
        this.updateParticlesForTimeline(timeRatio);
      }
    }
    
    updateParticlesForTimeline(timeRatio) {
      // Get current deal grouping based on timeline position
      const currentGroups = this.groupDealsByCurrentTime(timeRatio);
      
      // Clear existing particles
      this.particles.forEach(particle => {
        if (particle.element && particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
      });
      this.particles = [];
      
      // Create new particles for current timeline state
      this.createParticles(currentGroups);
      
      // Set up event handlers for new particles
      this.setupParticleEventHandlers();
    }
    
    moveToLostDrain(particle) {
      const drainParticles = this.container.querySelector('.drain-particles');
      if (drainParticles && particle.element.parentNode) {
        particle.element.style.transition = 'all 1s ease-in';
        particle.element.style.transform = 'scale(0.5) translateY(200px)';
        particle.element.style.opacity = '0.5';
        
        setTimeout(() => {
          if (particle.element.parentNode) {
            drainParticles.appendChild(particle.element);
            particle.element.style.position = 'absolute';
            particle.element.style.bottom = '0';
            particle.element.style.left = `${Math.random() * 80 + 10}%`;
          }
        }, 1000);
      }
    }
    
    
    setupParticleEventHandlers() {
      // Set up particle interaction events after particles are created
      console.log(`Setting up event handlers for ${this.particles.length} particles`);
      
      this.particles.forEach((particle, index) => {
        particle.element.addEventListener('mouseenter', (e) => {
          console.log(`Particle ${index} hovered:`, particle.deal.dealName);
          this.isPaused = true; // Pause animation on hover
          this.showTooltip(e, particle.deal);
        });
        
        particle.element.addEventListener('mouseleave', () => {
          this.isPaused = false; // Resume animation
          this.hideTooltip();
        });
        
        particle.element.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log(`Particle clicked:`, particle.deal.dealName);
          this.showDetailedTooltip(e, particle.deal);
        });
      });
    }
    
    createSafeTooltipContent(deal) {
      // Create safe DOM structure to prevent XSS
      const container = document.createElement('div');
      
      // Header
      const header = document.createElement('div');
      header.style.cssText = 'color: #00A651; font-weight: 600; margin-bottom: 4px; font-size: 0.85rem;';
      header.textContent = deal.dealName || 'Unknown Deal';
      container.appendChild(header);
      
      // Content wrapper
      const content = document.createElement('div');
      content.style.color = '#ffffff';
      
      // Client row
      const clientRow = document.createElement('div');
      clientRow.style.marginBottom = '2px';
      const clientLabel = document.createElement('strong');
      clientLabel.style.color = '#cccccc';
      clientLabel.textContent = 'Client: ';
      clientRow.appendChild(clientLabel);
      clientRow.appendChild(document.createTextNode(deal.clientName || 'Unknown Client'));
      content.appendChild(clientRow);
      
      // Value row
      const valueRow = document.createElement('div');
      valueRow.style.marginBottom = '2px';
      const valueLabel = document.createElement('strong');
      valueLabel.style.color = '#cccccc';
      valueLabel.textContent = 'Value: ';
      valueRow.appendChild(valueLabel);
      valueRow.appendChild(document.createTextNode(`€${this.formatCurrency(parseFloat(deal.dealValue) || 0)}`));
      content.appendChild(valueRow);
      
      // Status row
      const statusRow = document.createElement('div');
      statusRow.style.marginBottom = '2px';
      const statusLabel = document.createElement('strong');
      statusLabel.style.color = '#cccccc';
      statusLabel.textContent = 'Status: ';
      statusRow.appendChild(statusLabel);
      statusRow.appendChild(document.createTextNode(deal.dealStatus?.name || deal.dealStatus || 'Unknown'));
      content.appendChild(statusRow);
      
      // Probability row
      const probRow = document.createElement('div');
      const probLabel = document.createElement('strong');
      probLabel.style.color = '#cccccc';
      probLabel.textContent = 'Probability: ';
      probRow.appendChild(probLabel);
      probRow.appendChild(document.createTextNode(`${deal.dealProbability || this.calculateProbabilityFromStatus(deal.dealStatus?.key || deal.dealStatus)}%`));
      content.appendChild(probRow);
      
      container.appendChild(content);
      return container;
    }
    
    showTooltip(event, deal) {
      if (!config.showTooltips) return;
      
      // Create tooltip in document.body to avoid clipping
      let tooltip = document.body.querySelector('.river-deal-tooltip');
      if (!tooltip) {
        console.log('Creating new tooltip element in body');
        tooltip = document.createElement('div');
        tooltip.className = 'river-deal-tooltip';
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
      
      // Clear previous content and add safe content
      tooltip.innerHTML = '';
      tooltip.appendChild(this.createSafeTooltipContent(deal));
      
      // Position tooltip using getBoundingClientRect for accurate positioning
      const rect = event.target.getBoundingClientRect();
      const tooltipWidth = 250;
      const tooltipHeight = 100;
      
      let left = rect.right + 10;
      let top = rect.top;
      
      // Clamp to viewport boundaries
      if (left + tooltipWidth > window.innerWidth) {
        left = rect.left - tooltipWidth - 10;
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
      
      console.log(`✅ River tooltip positioned at (${left}, ${top}) for particle`);
    }
    
    hideTooltip() {
      const tooltip = document.body.querySelector('.river-deal-tooltip');
      if (tooltip) {
        tooltip.style.display = 'none';
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
        console.log('River tooltip hidden');
      }
    }
    
    showDetailedTooltip(event, deal) {
      // Enhanced tooltip for click events - use same unified system
      if (!config.showTooltips) return;
      
      // Create enhanced tooltip content with manager info
      let tooltip = document.body.querySelector('.river-deal-tooltip');
      if (!tooltip) {
        // Create if doesn't exist
        this.showTooltip(event, deal);
        tooltip = document.body.querySelector('.river-deal-tooltip');
      }
      
      // Clear and add enhanced content
      tooltip.innerHTML = '';
      const enhancedContent = this.createSafeTooltipContent(deal);
      
      // Add manager info for detailed view
      const managerRow = document.createElement('div');
      managerRow.style.marginTop = '4px';
      managerRow.style.borderTop = '1px solid rgba(0, 166, 81, 0.3)';
      managerRow.style.paddingTop = '4px';
      const managerLabel = document.createElement('strong');
      managerLabel.style.color = '#cccccc';
      managerLabel.textContent = 'Manager: ';
      managerRow.appendChild(managerLabel);
      managerRow.appendChild(document.createTextNode(deal.relationshipManager || 'Unassigned'));
      enhancedContent.appendChild(managerRow);
      
      tooltip.appendChild(enhancedContent);
      
      // Position tooltip
      const rect = event.target.getBoundingClientRect();
      const tooltipWidth = 250;
      const tooltipHeight = 120; // Slightly taller for enhanced content
      
      let left = rect.right + 10;
      let top = rect.top;
      
      // Clamp to viewport boundaries
      if (left + tooltipWidth > window.innerWidth) {
        left = rect.left - tooltipWidth - 10;
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
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        this.hideTooltip();
      }, 3000);
    }
    
    formatCurrency(value) {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'K';
      } else {
        return value.toLocaleString();
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
      // Apply lost drain visibility
      const lostDrain = this.container.querySelector('.lost-drain');
      if (lostDrain) {
        lostDrain.style.display = config.showLostDrain ? 'flex' : 'none';
      }
      
      // Apply particle size scaling
      const sizeMultiplier = config.particleSize === 'small' ? 0.8 : 
                           config.particleSize === 'large' ? 1.2 : 1.0;
      const root = this.container.closest('#wrapper') || document.documentElement;
      root.style.setProperty('--particle-size-multiplier', sizeMultiplier);
      
      // Apply animation speed
      const speedMultiplier = config.riverSpeed === 'slow' ? 1.5 : 
                            config.riverSpeed === 'fast' ? 0.5 : 1.0;
      root.style.setProperty('--flow-duration', (4 * speedMultiplier) + 's');
    }
    
    showError() {
      if (this.loading) {
        this.loading.querySelector('.loading-text').textContent = 'Error loading deal data';
        this.loading.querySelector('.loading-river').style.display = 'none';
      }
    }
    
    setupTimeControls() {
      const playPauseBtn = this.container.querySelector('#playPauseBtn');
      const speedBtn = this.container.querySelector('#speedBtn');
      
      if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
          this.isPaused = !this.isPaused;
          playPauseBtn.textContent = this.isPaused ? '▶️' : '⏸️';
          this.timeController.setPaused(this.isPaused);
        });
      }
      
      if (speedBtn) {
        speedBtn.addEventListener('click', () => {
          // Cycle through speeds: 1x -> 2x -> 0.5x -> 1x
          const speeds = ['normal', 'fast', 'slow'];
          const speedLabels = ['1x', '2x', '0.5x'];
          
          const currentIndex = speeds.indexOf(config.riverSpeed);
          const nextIndex = (currentIndex + 1) % speeds.length;
          
          config.riverSpeed = speeds[nextIndex];
          speedBtn.textContent = speedLabels[nextIndex];
          
          this.timeController.updateSpeed(config.riverSpeed);
        });
      }
    }
    
    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      this.timeController.stop();
    }
  }
  
  // Initialize Deal Flow River
  const riverInstance = new DealFlowRiver(fragmentElement);
  
  // Cleanup on fragment removal
  if (fragmentElement.addEventListener) {
    fragmentElement.addEventListener('beforeunload', () => {
      riverInstance.destroy();
    });
  }
})();