(function() {
  const LIFERAY_HOST = window.location.origin;
  
  // Get configuration from Liferay fragment configuration
  const config = typeof configuration !== 'undefined' ? configuration : {
    riverSpeed: 'normal',
    showTooltips: true,
    particleSize: 'medium', 
    showLostDrain: true
  };
  
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
      
      this.init();
    }
    
    async init() {
      try {
        await this.loadDeals();
        this.createParticles();
        this.setupParticleEventHandlers();
        this.setupStatusFilters();
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
      
      // Size based on deal value
      const dealValue = parseFloat(deal.dealValue) || 0;
      if (dealValue > 10000000) {
        particle.classList.add('mega-deal');
      } else if (dealValue > 5000000) {
        particle.classList.add('large-deal');
      }
      
      // Position within channel
      const channelHeight = 40;
      const verticalPosition = (channelHeight / 2) - 6; // Center vertically
      const horizontalSpacing = 100 / Math.max(totalInChannel, 1);
      const horizontalPosition = (index * horizontalSpacing) + (Math.random() * 20 - 10);
      
      particle.style.top = `${verticalPosition}px`;
      particle.style.left = `${Math.max(0, Math.min(95, horizontalPosition))}%`;
      
      // Store deal data for tooltip
      particle.dealData = deal;
      
      // Create deal value label above particle
      const valueLabel = document.createElement('div');
      valueLabel.className = 'deal-value-label';
      valueLabel.textContent = `€${this.formatCurrency(dealValue)}`;
      valueLabel.style.cssText = `
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        color: #00A651;
        font-weight: 600;
        white-space: nowrap;
        text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
        pointer-events: none;
        z-index: 30;
      `;
      particle.appendChild(valueLabel);
      
      return particle;
    }
    
    groupDealsByStatus() {
      const groups = {
        prospect: [],
        qualified: [],
        proposal: [],
        negotiation: [],
        closedwon: [],
        closedlost: []
      };
      
      this.deals.forEach(deal => {
        const status = deal.dealStatus?.toLowerCase() || 'prospect';
        if (groups[status]) {
          groups[status].push(deal);
        } else {
          groups.prospect.push(deal); // Default fallback
        }
      });
      
      return groups;
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
    
    setupStatusFilters() {
      // Set up click handlers for stage labels to filter particles
      const stageLabels = this.container.querySelectorAll('.stage-label');
      console.log(`Setting up status filters for ${stageLabels.length} stage labels`);
      
      stageLabels.forEach(label => {
        label.style.cursor = 'pointer';
        label.addEventListener('click', (e) => {
          const targetStatus = label.dataset.stage;
          console.log(`Filtering particles for status: ${targetStatus}`);
          this.filterParticlesByStatus(targetStatus);
          
          // Update active state
          stageLabels.forEach(l => l.classList.remove('active'));
          label.classList.add('active');
        });
      });
      
      // Add "All" button functionality if needed
      const allButton = document.createElement('div');
      allButton.className = 'stage-label active';
      allButton.textContent = 'All';
      allButton.style.cursor = 'pointer';
      allButton.addEventListener('click', () => {
        console.log('Showing all particles');
        this.showAllParticles();
        stageLabels.forEach(l => l.classList.remove('active'));
        allButton.classList.add('active');
      });
      
      const stageContainer = this.container.querySelector('.pipeline-stages');
      if (stageContainer) {
        stageContainer.insertBefore(allButton, stageContainer.firstChild);
      }
    }
    
    filterParticlesByStatus(targetStatus) {
      this.particles.forEach(particle => {
        if (particle.status === targetStatus) {
          particle.element.style.display = 'block';
          particle.element.style.opacity = '1';
        } else {
          particle.element.style.opacity = '0.3';
        }
      });
    }
    
    showAllParticles() {
      this.particles.forEach(particle => {
        particle.element.style.display = 'block';
        particle.element.style.opacity = '1';
      });
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
      
      const clientName = deal.clientName || 'Unknown Client';
      const dealValue = parseFloat(deal.dealValue) || 0;
      const status = deal.dealStatus || 'Unknown';
      const probability = deal.dealProbability || 0;
      
      tooltip.innerHTML = `
        <div style="color: #00A651; font-weight: 600; margin-bottom: 4px; font-size: 0.85rem;">
          ${deal.dealName || 'Unknown Deal'}
        </div>
        <div style="color: #ffffff;">
          <div style="margin-bottom: 2px;"><strong style="color: #cccccc;">Client:</strong> ${clientName}</div>
          <div style="margin-bottom: 2px;"><strong style="color: #cccccc;">Value:</strong> €${this.formatCurrency(dealValue)}</div>
          <div style="margin-bottom: 2px;"><strong style="color: #cccccc;">Status:</strong> ${status}</div>
          <div><strong style="color: #cccccc;">Probability:</strong> ${probability}%</div>
        </div>
      `;
      
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
      // Enhanced tooltip for click events
      if (!config.showTooltips) return;
      
      const clientName = deal.clientName || 'Unknown Client';
      const dealValue = parseFloat(deal.dealValue) || 0;
      const status = deal.dealStatus || 'Unknown';
      const probability = deal.dealProbability || 0;
      const manager = deal.relationshipManager || 'Unassigned';
      
      this.tooltip.querySelector('.deal-client').textContent = deal.dealName || 'Unknown Deal';
      this.tooltip.querySelector('.deal-value').textContent = `€${this.formatCurrency(dealValue)}`;
      this.tooltip.querySelector('.deal-status').textContent = `Status: ${status} (${probability}%)`;
      this.tooltip.querySelector('.deal-probability').textContent = `Manager: ${manager}`;
      
      // Position tooltip
      const rect = event.target.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      this.tooltip.style.left = (rect.left - containerRect.left + rect.width + 10) + 'px';
      this.tooltip.style.top = (rect.top - containerRect.top) + 'px';
      this.tooltip.classList.add('show');
      
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
    
    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
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