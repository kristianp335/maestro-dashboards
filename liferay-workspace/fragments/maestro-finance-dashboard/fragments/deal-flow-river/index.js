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
      this.tooltip = this.container.querySelector('#dealTooltip');
      this.loading = this.container.querySelector('#riverLoading');
      
      this.init();
    }
    
    async init() {
      try {
        await this.loadDeals();
        this.createParticles();
        this.startAnimation();
        this.setupEventListeners();
        this.hideLoading();
      } catch (error) {
        console.error('Failed to initialize Deal Flow River:', error);
        this.showError();
      }
    }
    
    async loadDeals() {
      try {
        const response = await fetch(`${LIFERAY_HOST}/o/c/maestrodeals`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        this.deals = data.items || [];
        
        // If no data from API, use sample data for demonstration
        if (this.deals.length === 0) {
          this.deals = this.getSampleDeals();
        }
        
        console.log(`Loaded ${this.deals.length} deals for flow visualization`);
      } catch (error) {
        console.error('Error loading deals, using sample data:', error);
        this.deals = this.getSampleDeals();
      }
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
      
      // Create particles for each deal
      Object.keys(dealsByStatus).forEach(status => {
        const channelDeals = dealsByStatus[status];
        const channel = this.container.querySelector(`.channel[data-stage="${status}"]`);
        
        if (channel && channelDeals.length > 0) {
          const particleContainer = channel.querySelector('.deal-particles');
          
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
      });
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
    
    setupEventListeners() {
      // Tooltip on particle hover
      this.particles.forEach(particle => {
        particle.element.addEventListener('mouseenter', (e) => {
          this.showTooltip(e, particle.deal);
        });
        
        particle.element.addEventListener('mouseleave', () => {
          this.hideTooltip();
        });
      });
    }
    
    showTooltip(event, deal) {
      if (!config.showTooltips) return;
      
      const clientName = deal.clientName || 'Unknown Client';
      const dealValue = parseFloat(deal.dealValue) || 0;
      const status = deal.dealStatus || 'Unknown';
      const probability = deal.dealProbability || 0;
      
      this.tooltip.querySelector('.deal-client').textContent = clientName;
      this.tooltip.querySelector('.deal-value').textContent = `€${this.formatCurrency(dealValue)}`;
      this.tooltip.querySelector('.deal-status').textContent = `Status: ${status}`;
      this.tooltip.querySelector('.deal-probability').textContent = `Probability: ${probability}%`;
      
      this.tooltip.style.left = event.pageX + 'px';
      this.tooltip.style.top = event.pageY + 'px';
      this.tooltip.classList.add('show');
    }
    
    hideTooltip() {
      this.tooltip.classList.remove('show');
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