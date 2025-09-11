/**
 * Maestro GFD Hero Fragment
 * Credit Agricole Corporate & Investment Bank
 */

(function() {
    'use strict';
    
    const fragmentElement = fragmentElement;
    const configuration = configuration || {};
    
    // Initialize hero functionality
    initializeMaestroHero();
    
    function initializeMaestroHero() {
        setupHeroInteractions();
        setupKPIAnimations();
        setupResponsiveImage();
        registerGlobalHeroHandlers();
    }
    
    function setupHeroInteractions() {
        // Add smooth scroll behavior for CTA buttons
        const ctaButtons = fragmentElement.querySelectorAll('.maestro-hero-cta');
        
        ctaButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Add visual feedback
                this.style.transform = 'translateY(-2px) scale(0.98)';
                
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }
    
    function setupKPIAnimations() {
        const kpiItems = fragmentElement.querySelectorAll('.maestro-kpi-item');
        
        if (kpiItems.length === 0) return;
        
        // Animate KPIs with staggered delay
        kpiItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 400 + (index * 100));
        });
        
        // Add hover effects for KPI items
        kpiItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px) scale(1.05)';
                this.style.transition = 'transform 0.3s ease';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    function setupResponsiveImage() {
        const heroImage = fragmentElement.querySelector('.maestro-hero-bg-image');
        
        if (!heroImage) return;
        
        // Optimize image loading
        if (heroImage.complete) {
            handleImageLoad();
        } else {
            heroImage.addEventListener('load', handleImageLoad);
            heroImage.addEventListener('error', handleImageError);
        }
        
        function handleImageLoad() {
            heroImage.style.opacity = '1';
            heroImage.style.transition = 'opacity 0.5s ease';
        }
        
        function handleImageError() {
            console.warn('Maestro Hero: Background image failed to load');
            // Fallback to gradient background
            const heroSection = fragmentElement.querySelector('.maestro-hero');
            if (heroSection) {
                heroSection.style.background = 'linear-gradient(135deg, var(--brand-color-2, #003366) 0%, var(--brand-color-1, #00A651) 100%)';
            }
        }
    }
    
    function registerGlobalHeroHandlers() {
        // Register global handlers that can be called from CTA buttons
        if (!window.MaestroHero) {
            window.MaestroHero = {};
        }
        
        window.MaestroHero.handlePrimaryCTA = function() {
            // Emit custom event for primary CTA click
            const event = new CustomEvent('maestro:hero-primary-cta', {
                detail: {
                    source: 'hero-fragment',
                    timestamp: Date.now()
                },
                bubbles: true
            });
            
            fragmentElement.dispatchEvent(event);
            
            // Default action: scroll to dashboard content or navigate
            scrollToContent('.maestro-kpi-cards, .maestro-deal-management, #main-content');
        };
        
        window.MaestroHero.handleSecondaryCTA = function() {
            // Emit custom event for secondary CTA click
            const event = new CustomEvent('maestro:hero-secondary-cta', {
                detail: {
                    source: 'hero-fragment',
                    timestamp: Date.now()
                },
                bubbles: true
            });
            
            fragmentElement.dispatchEvent(event);
            
            // Default action: show more information or navigate to about
            showMoreInformation();
        };
    }
    
    function scrollToContent(selector) {
        const targetElement = document.querySelector(selector);
        
        if (targetElement) {
            const offset = 80; // Account for header height
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback: scroll to next section
            const heroSection = fragmentElement.querySelector('.maestro-hero');
            if (heroSection) {
                const nextElement = heroSection.parentElement.nextElementSibling;
                if (nextElement) {
                    nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }
    
    function showMoreInformation() {
        // Create and show information modal or expand content
        const infoModal = createInfoModal();
        document.body.appendChild(infoModal);
        
        // Show modal with animation
        setTimeout(() => {
            infoModal.classList.add('show');
        }, 10);
    }
    
    function createInfoModal() {
        const modal = document.createElement('div');
        modal.className = 'maestro-hero-info-modal';
        modal.innerHTML = `
            <div class="maestro-modal-backdrop">
                <div class="maestro-modal-content">
                    <div class="maestro-modal-header">
                        <h3>About Maestro GFD Cockpit</h3>
                        <button class="maestro-modal-close">&times;</button>
                    </div>
                    <div class="maestro-modal-body">
                        <p>The Maestro GFD (Global Finance Data) Cockpit is Credit Agricole CIB's comprehensive finance dashboard platform.</p>
                        <p>Key features include:</p>
                        <ul>
                            <li>Real-time loan portfolio management</li>
                            <li>Advanced deal tracking and analytics</li>
                            <li>Risk assessment and monitoring</li>
                            <li>Performance KPI visualization</li>
                            <li>Regulatory compliance reporting</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1050;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;
        
        // Handle modal interactions
        const backdrop = modal.querySelector('.maestro-modal-backdrop');
        const closeBtn = modal.querySelector('.maestro-modal-close');
        
        backdrop.addEventListener('click', function(e) {
            if (e.target === backdrop) {
                closeModal();
            }
        });
        
        closeBtn.addEventListener('click', closeModal);
        
        function closeModal() {
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
        
        return modal;
    }
    
    // Performance optimization: Lazy load non-critical functionality
    function loadEnhancedFeatures() {
        // Add parallax scrolling effect if performance allows
        if ('IntersectionObserver' in window) {
            setupParallaxEffect();
        }
        
        // Add advanced KPI animations
        setupAdvancedKPIEffects();
    }
    
    function setupParallaxEffect() {
        const heroBackground = fragmentElement.querySelector('.maestro-hero-background');
        
        if (!heroBackground) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener('scroll', handleParallaxScroll, { passive: true });
                } else {
                    window.removeEventListener('scroll', handleParallaxScroll);
                }
            });
        });
        
        observer.observe(fragmentElement);
        
        function handleParallaxScroll() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            heroBackground.style.transform = `translateY(${parallax}px)`;
        }
    }
    
    function setupAdvancedKPIEffects() {
        const kpiValues = fragmentElement.querySelectorAll('.maestro-kpi-value');
        
        kpiValues.forEach(value => {
            const finalValue = value.textContent;
            
            // Animate number counting effect
            if (finalValue.match(/^\d+/)) {
                animateNumber(value, finalValue);
            }
        });
    }
    
    function animateNumber(element, finalValue) {
        const numMatch = finalValue.match(/^\d+/);
        if (!numMatch) return;
        
        const finalNum = parseInt(numMatch[0]);
        const prefix = finalValue.replace(/^\d+/, '');
        let currentNum = 0;
        const increment = Math.ceil(finalNum / 30);
        
        const timer = setInterval(() => {
            currentNum += increment;
            if (currentNum >= finalNum) {
                currentNum = finalNum;
                clearInterval(timer);
            }
            element.textContent = currentNum + prefix;
        }, 50);
    }
    
    // Load enhanced features after initial render
    setTimeout(loadEnhancedFeatures, 1000);
    
    // Handle fragment lifecycle for SennaJS navigation
    if (typeof Liferay !== 'undefined' && Liferay.on) {
        Liferay.on('beforeNavigate', function() {
            // Clean up any global handlers or timers
            if (window.MaestroHero) {
                delete window.MaestroHero.handlePrimaryCTA;
                delete window.MaestroHero.handleSecondaryCTA;
            }
        });
    }
})();