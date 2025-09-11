/**
 * CA-CIB Maestro Footer Fragment JavaScript
 * Handles footer functionality and responsive behavior
 */
(function() {
    'use strict';
    
    // Use the fragmentElement provided by Liferay
    if (!fragmentElement) {
        return;
    }
    
    // Initialize footer functionality
    initializeFooter();
    
    function initializeFooter() {
        applyConfiguration();
        setupLinkHandlers();
        setupResponsiveBehavior();
    }
    
    function applyConfiguration() {
        try {
            const config = (typeof configuration !== 'undefined') ? configuration : {};
            
            // Show/hide sections based on configuration
            const sections = {
                'maestro-footer-section': {
                    showDashboardLinks: config.showDashboardLinks !== false,
                    showSupportLinks: config.showSupportLinks !== false,
                    showLegalLinks: config.showLegalLinks !== false,
                    showContactInfo: config.showContactInfo !== false
                }
            };
            
            // Apply footer style
            const footer = fragmentElement.querySelector('.maestro-footer');
            if (footer && config.footerStyle === 'dark') {
                footer.classList.add('maestro-footer-dark');
            }
            
        } catch (error) {
            console.warn('Footer configuration error:', error);
        }
    }
    
    function setupLinkHandlers() {
        // Handle footer links
        const footerLinks = fragmentElement.querySelectorAll('.maestro-footer-links a');
        
        footerLinks.forEach(link => {
            // Add smooth scroll for anchor links
            if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
                link.addEventListener('click', function(e) {
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            }
            
            // Add external link handling
            if (link.getAttribute('href') && link.getAttribute('href').startsWith('http')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
        
        // Handle social links
        const socialLinks = fragmentElement.querySelectorAll('.maestro-footer-social a');
        socialLinks.forEach(link => {
            if (link.getAttribute('href') && link.getAttribute('href').startsWith('http')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
    
    function setupResponsiveBehavior() {
        // Handle footer responsive behavior
        function handleResize() {
            const isMobile = window.innerWidth < 768;
            const footer = fragmentElement.querySelector('.maestro-footer');
            
            if (footer) {
                if (isMobile) {
                    footer.classList.add('maestro-footer-mobile');
                } else {
                    footer.classList.remove('maestro-footer-mobile');
                }
            }
        }
        
        // Initial check
        handleResize();
        
        // Listen for resize events
        window.addEventListener('resize', debounce(handleResize, 250));
    }
    
    // Utility function to debounce events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Add copyright year auto-update
    function updateCopyrightYear() {
        const copyrightText = fragmentElement.querySelector('[data-lfr-editable-id="copyright-text"]');
        if (copyrightText && !isInEditMode()) {
            const currentYear = new Date().getFullYear();
            const text = copyrightText.textContent;
            
            // Update year if it contains a year pattern
            const yearPattern = /© \d{4}/;
            if (yearPattern.test(text)) {
                copyrightText.textContent = text.replace(yearPattern, `© ${currentYear}`);
            }
        }
    }
    
    function isInEditMode() {
        const body = document.body;
        
        // Only check for Liferay's built-in edit mode class - do not modify it
        return body.classList.contains('has-edit-mode-menu');
    }
    
    // Initialize copyright year update
    updateCopyrightYear();
    
    // Add accessibility enhancements
    function enhanceAccessibility() {
        // Add skip link functionality
        const footerLinks = fragmentElement.querySelectorAll('a[href^="#"]');
        footerLinks.forEach(link => {
            link.addEventListener('focus', function() {
                this.style.outline = '2px solid var(--brand-color-1, #00A651)';
                this.style.outlineOffset = '2px';
            });
            
            link.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });
        
        // Enhance social link accessibility
        const socialLinks = fragmentElement.querySelectorAll('.maestro-footer-social a');
        socialLinks.forEach(link => {
            if (!link.getAttribute('aria-label')) {
                const href = link.getAttribute('href') || '';
                if (href.includes('linkedin')) {
                    link.setAttribute('aria-label', 'Follow us on LinkedIn');
                } else if (href.includes('twitter')) {
                    link.setAttribute('aria-label', 'Follow us on Twitter');
                }
            }
        });
    }
    
    // Initialize accessibility enhancements
    enhanceAccessibility();
    
})();