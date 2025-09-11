/**
 * Boots Partner Portal - Global JavaScript
 * Provides shared functionality for all fragments
 */

(function() {
    'use strict';

    // Global Boots namespace
    window.Boots = window.Boots || {};

    /**
     * Left sliding menu controller
     */
    Boots.SlidingMenu = {
        isOpen: false,
        
        init: function() {
            this.bindEvents();
        },
        
        bindEvents: function() {
            // Listen for menu toggle events
            document.addEventListener('boots:toggle-menu', this.toggle.bind(this));
            document.addEventListener('boots:close-menu', this.close.bind(this));
            document.addEventListener('boots:open-menu', this.open.bind(this));
            
            // Close menu on overlay click
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('boots-overlay')) {
                    Boots.SlidingMenu.close();
                }
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && Boots.SlidingMenu.isOpen) {
                    Boots.SlidingMenu.close();
                }
            });
        },
        
        toggle: function() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        },
        
        open: function() {
            const mainContent = document.querySelector('#wrapper .boots-main-content');
            const overlay = document.querySelector('#wrapper .boots-overlay');
            const menuButton = document.querySelector('#wrapper .boots-menu-toggle');
            
            if (mainContent) {
                mainContent.classList.add('menu-open');
            }
            
            if (overlay) {
                overlay.classList.add('show');
            }
            
            if (menuButton) {
                menuButton.setAttribute('aria-expanded', 'true');
                menuButton.classList.add('active');
            }
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            this.isOpen = true;
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('boots:menu-opened'));
        },
        
        close: function() {
            const mainContent = document.querySelector('#wrapper .boots-main-content');
            const overlay = document.querySelector('#wrapper .boots-overlay');
            const menuButton = document.querySelector('#wrapper .boots-menu-toggle');
            
            if (mainContent) {
                mainContent.classList.remove('menu-open');
            }
            
            if (overlay) {
                overlay.classList.remove('show');
            }
            
            if (menuButton) {
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.classList.remove('active');
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            this.isOpen = false;
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('boots:menu-closed'));
        }
    };

    /**
     * Chart utilities using Chart.js
     */
    Boots.Charts = {
        defaultOptions: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: 'system-ui, -apple-system, sans-serif'
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f2f5'
                    },
                    ticks: {
                        font: {
                            family: 'system-ui, -apple-system, sans-serif'
                        }
                    }
                },
                x: {
                    grid: {
                        color: '#f1f2f5'
                    },
                    ticks: {
                        font: {
                            family: 'system-ui, -apple-system, sans-serif'
                        }
                    }
                }
            }
        },
        
        colors: {
            primary: '#184290',
            secondary: '#2563eb',
            success: '#287d3c',
            warning: '#b95000',
            info: '#2e5aac',
            light: '#f1f2f5',
            dark: '#272833'
        },
        
        createLineChart: function(ctx, data, options = {}) {
            const config = {
                type: 'line',
                data: data,
                options: Object.assign({}, this.defaultOptions, options)
            };
            
            return new Chart(ctx, config);
        },
        
        createBarChart: function(ctx, data, options = {}) {
            const config = {
                type: 'bar',
                data: data,
                options: Object.assign({}, this.defaultOptions, options)
            };
            
            return new Chart(ctx, config);
        },
        
        createDoughnutChart: function(ctx, data, options = {}) {
            const config = {
                type: 'doughnut',
                data: data,
                options: Object.assign({}, this.defaultOptions, {
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }, options)
            };
            
            return new Chart(ctx, config);
        }
    };

    /**
     * Utility functions
     */
    Boots.Utils = {
        /**
         * Format number with commas
         */
        formatNumber: function(num) {
            return new Intl.NumberFormat('en-GB').format(num);
        },
        
        /**
         * Format currency in GBP
         */
        formatCurrency: function(amount) {
            return new Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: 'GBP'
            }).format(amount);
        },
        
        /**
         * Format date
         */
        formatDate: function(date, options = {}) {
            const defaultOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            
            return new Intl.DateTimeFormat('en-GB', Object.assign(defaultOptions, options))
                .format(new Date(date));
        },
        
        /**
         * Debounce function
         */
        debounce: function(func, wait, immediate) {
            let timeout;
            return function executedFunction() {
                const context = this;
                const args = arguments;
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },
        
        /**
         * Animate counter
         */
        animateCounter: function(element, start, end, duration = 2000) {
            let current = start;
            const increment = (end - start) / (duration / 16);
            const timer = setInterval(function() {
                current += increment;
                element.textContent = Math.floor(current);
                if (current >= end) {
                    element.textContent = end;
                    clearInterval(timer);
                }
            }, 16);
        }
    };

    /**
     * Form validation utilities
     */
    Boots.Validation = {
        /**
         * Validate email address
         */
        isValidEmail: function(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        /**
         * Validate required field
         */
        isRequired: function(value) {
            return value && value.trim().length > 0;
        },
        
        /**
         * Show validation error
         */
        showError: function(field, message) {
            field.classList.add('is-invalid');
            let errorElement = field.parentNode.querySelector('.invalid-feedback');
            
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'invalid-feedback';
                field.parentNode.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
        },
        
        /**
         * Clear validation error
         */
        clearError: function(field) {
            field.classList.remove('is-invalid');
            const errorElement = field.parentNode.querySelector('.invalid-feedback');
            if (errorElement) {
                errorElement.remove();
            }
        }
    };

    /**
     * Initialize global functionality when DOM is ready
     */
    function init() {
        Boots.SlidingMenu.init();
        
        // Add loading states to buttons
        document.addEventListener('click', function(e) {
            if (e.target.matches('.boots-btn[data-loading]')) {
                e.target.innerHTML = '<span class="boots-loading"></span> Loading...';
                e.target.disabled = true;
            }
        });
        
        // Initialize counter animations on scroll
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.dataset.target) || 0;
                    Boots.Utils.animateCounter(counter, 0, target);
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('[data-counter]').forEach(function(counter) {
            observer.observe(counter);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
