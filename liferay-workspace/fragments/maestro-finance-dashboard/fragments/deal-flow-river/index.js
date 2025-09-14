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
        await this.loadDeals();
        this.createParticles();
        this.setupParticleEventHandlers();
        this.setupTimeControls();
        this.startAnimation();
        this.timeController.start();
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
    
    createParticles() {
      // Group deals by status for channel assignment
      const dealsByStatus = this.groupDealsByStatus();
      
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
        // Calculate horizontal position based on chronological order
        const channelWidth = 90; // Use 90% of channel width
        const startMargin = 5; // 5% left margin
        
        // Distribute deals evenly across time (channel width)
        const spacing = channelWidth / (totalInChannel - 1);
        const horizontalPosition = startMargin + (index * spacing);
        
        // For same dates, create slight vertical offset to avoid complete overlap
        const sameTimeOffset = this.getSameTimeOffset(deal, index, totalInChannel);
        const verticalPosition = (channelHeight / 2) - (calculatedSize / 2) + sameTimeOffset;
        
        particle.style.top = `${Math.max(5, Math.min(channelHeight - calculatedSize - 5, verticalPosition))}px`;
        particle.style.left = `${Math.min(95, horizontalPosition)}%`;
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
    
    groupDealsByStatus() {
      const groups = {
        qualified: [],
        proposal: [],
        negotiation: [],
        closedwon: [],
        closedlost: []
      };
      
      this.deals.forEach(deal => {
        const status = (deal.dealStatus?.key || deal.dealStatus || 'qualified').toLowerCase();
        // Skip prospect deals entirely
        if (status === 'prospect') {
          return;
        }
        if (groups[status]) {
          groups[status].push(deal);
        } else {
          groups.qualified.push(deal); // Default fallback to qualified instead of prospect
        }
      });
      
      // Sort each group by date (earliest first)
      Object.keys(groups).forEach(status => {
        groups[status].sort((a, b) => {
          const dateA = this.getDealDate(a);
          const dateB = this.getDealDate(b);
          return dateA - dateB;
        });
      });
      
      return groups;
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
      
      this.particles.forEach(particle => {
        const elapsed = (currentTime - particle.startTime) / 1000;
        
        if (elapsed > 0) {
          // Move particle from left to right
          const progress = (elapsed % cycleDuration) / cycleDuration;
          const newLeft = progress * 100;
          
          particle.element.style.left = `${newLeft}%`;
          
          // Add slight vertical bobbing
          const bob = Math.sin(elapsed * 2) * 3;
          const baseTop = parseInt(particle.element.style.top) || 14;
          particle.element.style.transform = `translateY(${bob}px)`;
          
          // Handle particles that reach the end
          if (progress > 0.95) {
            if (particle.status === 'closedwon') {
              // Victory animation
              particle.element.style.boxShadow = '0 0 20px rgba(0, 166, 81, 1)';
            } else if (particle.status === 'closedlost') {
              // Move to drain
              this.moveToLostDrain(particle);
            }
          }
        }
      });
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