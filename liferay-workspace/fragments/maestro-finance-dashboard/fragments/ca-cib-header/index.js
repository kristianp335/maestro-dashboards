/**
 * CA-CIB Maestro Header Fragment JavaScript
 * Navigation system with API integration and modal management
 */
(function() {
    'use strict';
    
    // Use the fragmentElement provided by Liferay
    if (!fragmentElement) {
        return;
    }
    
    /**
     * Render navigation to the left sliding menu
     */
    function renderNavigationToSlidingMenu(navigationItems) {
        const menuList = fragmentElement.querySelector('#maestro-menu-list');
        if (!menuList) {
            return;
        }
        
        // Build HTML string for navigation items
        let menuHTML = '';
        
        navigationItems.forEach((item, index) => {
            // Get configuration to access site prefix
            const config = getFragmentConfiguration();
            const sitePrefix = config.sitePrefix || '';
            
            // Handle API data structure
            const itemName = item.name || item.title || '';
            const baseUrl = item.link || item.url || '#';
            const itemUrl = baseUrl === '#' ? baseUrl : sitePrefix + baseUrl;
            
            // Add icon based on item name
            const icon = getMenuIcon(itemName);
            const iconHTML = icon ? icon + ' ' : '';
            
            // Build menu item HTML
            const menuItemHTML = `
                <li class="maestro-menu-item">
                    <a href="${itemUrl}" class="maestro-menu-link">
                        ${iconHTML}${itemName}
                    </a>
                </li>
            `;
            
            menuHTML += menuItemHTML;
        });
        
        // Set innerHTML directly
        menuList.innerHTML = menuHTML;
        
        // Initialize submenu functionality
        initializeSubmenus();
    }
    
    // Initialize on DOM ready and SPA navigation events
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }
    
    // Initial load
    ready(initializeHeader);
    
    function initializeHeader() {
        // Get configuration values
        const config = getFragmentConfiguration();
        
        // Check if we're in edit mode
        const editMode = isInEditMode();
        
        // Check for Liferay control menu and adjust navigation positioning
        adjustNavigationForControlMenu();
        
        if (editMode) {
            // Apply configuration settings even in edit mode
            applyConfiguration(config);
            // Load sample navigation for edit mode preview
            const sampleNav = getSampleNavigation();
            renderNavigationToSlidingMenu(sampleNav);
            // Initialize mobile menu and modals for edit mode
            initializeMobileMenu();
            initializeModals();
            return;
        }
        
        // Full initialization for live mode
        ensureModalsHidden();
        applyConfiguration(config);
        
        // Initialize navigation from API only if useHeadlessAPI is enabled
        const useHeadlessAPI = config.useHeadlessAPI !== false; // default to true
        if (useHeadlessAPI) {
            loadNavigationMenu();
        }
        
        initializeMobileMenu();
        initializeModals();
    }
    
    /**
     * Adjust navigation position based on Liferay control menu presence
     */
    function adjustNavigationForControlMenu() {
        const hasControlMenu = document.body.classList.contains('has-control-menu');
        const navigation = fragmentElement.querySelector('#maestro-sliding-menu');
        
        if (!hasControlMenu && navigation) {
            // Control menu not present, use default top positioning
            navigation.style.top = '0';
            navigation.style.marginTop = '0';
        } else if (hasControlMenu && navigation) {
            // Control menu present, use default positioning
            navigation.style.top = '';
            navigation.style.marginTop = '';
        }
    }

    /**
     * Get sample navigation for edit mode (Finance Dashboard specific)
     */
    function getSampleNavigation() {
        return [
            {
                name: 'Dashboard Overview',
                url: '/dashboard',
                children: [
                    { name: 'KPI Summary', url: '/dashboard/kpis' },
                    { name: 'Performance Analytics', url: '/dashboard/analytics' }
                ]
            },
            {
                name: 'Loan Management',
                url: '/loans'
            },
            {
                name: 'Deal Tracking',
                url: '/deals'
            },
            {
                name: 'Risk Assessment',
                url: '/risk'
            },
            {
                name: 'GFD Workflows',
                url: '/workflows'
            }
        ];
    }
    
    function isInEditMode() {
        const body = document.body;
        
        // Only check for Liferay's built-in edit mode class - do not modify it
        const hasEditModeMenu = body.classList.contains('has-edit-mode-menu');
        
        // Add fragment-specific class for internal logic (without affecting Liferay classes)
        if (hasEditModeMenu) {
            fragmentElement.classList.add('maestro-edit-mode');
        } else {
            fragmentElement.classList.remove('maestro-edit-mode');
        }
        
        return hasEditModeMenu;
    }
    
    function ensureModalsHidden() {
        const searchOverlay = fragmentElement.querySelector('#maestro-search-overlay');
        const loginOverlay = fragmentElement.querySelector('#maestro-login-overlay');
        
        if (searchOverlay) {
            searchOverlay.classList.remove('active');
            searchOverlay.style.display = 'none';
        }
        
        if (loginOverlay) {
            loginOverlay.classList.remove('active');
            loginOverlay.style.display = 'none';
        }
    }
    
    function getFragmentConfiguration() {
        try {
            return (typeof configuration !== 'undefined') ? configuration : {};
        } catch (error) {
            // Configuration loading failed
            return {};
        }
    }
    
    function applyConfiguration(config) {
        const header = fragmentElement.querySelector('.maestro-header');
        const searchBtn = fragmentElement.querySelector('.maestro-search-btn');
        const userProfileWidget = fragmentElement.querySelector('.maestro-user-profile-widget');
        const loginBtn = fragmentElement.querySelector('.maestro-login-btn');
        const menuToggle = fragmentElement.querySelector('.maestro-menu-toggle');
        const slidingMenu = fragmentElement.querySelector('.maestro-sliding-menu');
        const overlay = fragmentElement.querySelector('.maestro-overlay');
        const accountSelectorDropzone = fragmentElement.querySelector('.maestro-account-selector-dropzone');
        
        // Show/hide account selector dropzone
        if (accountSelectorDropzone) {
            const showAccountSelector = config.showAccountSelector !== false; // default to true
            accountSelectorDropzone.style.display = showAccountSelector ? 'block' : 'none';
        }
        
        // Show/hide search button
        if (searchBtn) {
            const showSearch = config.showSearch !== false; // default to true
            searchBtn.style.display = showSearch ? 'flex' : 'none';
        }
        
        // Show/hide navigation menu components
        const showNavigation = config.showNavigation !== false; // default to true
        if (menuToggle) {
            menuToggle.style.display = showNavigation ? 'flex' : 'none';
        }
        if (slidingMenu) {
            slidingMenu.style.display = showNavigation ? 'block' : 'none';
        }
        if (overlay) {
            overlay.style.display = showNavigation ? 'block' : 'none';
        }
        
        // Show/hide user menu components
        const showUserProfile = config.showUserProfile !== false; // default to true
        if (userProfileWidget) {
            userProfileWidget.style.display = showUserProfile ? 'block' : 'none';
        }
        if (loginBtn) {
            loginBtn.style.display = showUserProfile ? 'flex' : 'none';
        }
    }
    
    /**
     * Load navigation menu from Liferay API
     */
    function loadNavigationMenu() {
        const config = getFragmentConfiguration();
        const menuId = config.navigationMenuId;
        
        // Skip API call if no valid menu ID is provided or in edit mode
        if (!menuId || menuId === 'primary-menu' || menuId === 'undefined' || menuId === undefined || typeof menuId !== 'string') {
            // Don't render sample navigation in live mode
            return;
        }
        
        // Check if authentication token is available
        if (typeof Liferay === 'undefined' || !Liferay.authToken) {
            return;
        }
        
        const apiUrl = `/o/headless-delivery/v1.0/navigation-menus/${menuId}?nestedFields=true&p_auth=${Liferay.authToken}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Extract navigation items from API response
                let navItems = [];
                
                if (data.navigationMenuItems && Array.isArray(data.navigationMenuItems)) {
                    navItems = data.navigationMenuItems;
                } else if (data.items && Array.isArray(data.items)) {
                    navItems = data.items;
                } else if (Array.isArray(data)) {
                    navItems = data;
                }
                
                if (navItems.length > 0) {
                    renderNavigationToSlidingMenu(navItems);
                }
            })
            .catch(error => {
                console.warn('Failed to load navigation menu:', error);
            });
    }
    
    /**
     * Get menu icon for navigation items (Finance Dashboard specific)
     */
    function getMenuIcon(itemName) {
        const iconMap = {
            'Dashboard': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/></svg>',
            'Loans': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 16h6" stroke="currentColor" stroke-width="2"/></svg>',
            'Deals': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M8 7h12l-2 8H6L4 3H2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="9" cy="20" r="1" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="20" r="1" stroke="currentColor" stroke-width="2"/></svg>',
            'Risk': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="currentColor" stroke-width="2"/></svg>',
            'GFD': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2"/><polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" stroke-width="2"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" stroke-width="2"/></svg>',
            'Workflow': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2"/></svg>',
            'Analytics': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="2"/></svg>'
        };
        
        // Try exact match first
        if (iconMap[itemName]) {
            return iconMap[itemName];
        }
        
        // Try partial matches
        for (const [key, icon] of Object.entries(iconMap)) {
            if (itemName.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }
        
        // Default icon
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>';
    }
    
    /**
     * Initialize submenu functionality
     */
    function initializeSubmenus() {
        const submenuItems = fragmentElement.querySelectorAll('.maestro-menu-item.has-submenu');
        
        submenuItems.forEach(item => {
            const link = item.querySelector('.maestro-menu-link');
            if (link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Close other open submenus
                    submenuItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('open');
                        }
                    });
                    
                    // Toggle this submenu
                    item.classList.toggle('open');
                });
            }
        });
    }
    
    /**
     * Initialize mobile menu functionality
     */
    function initializeMobileMenu() {
        const menuToggle = fragmentElement.querySelector('#maestro-menu-toggle');
        const menuClose = fragmentElement.querySelector('#maestro-menu-close');
        const slidingMenu = fragmentElement.querySelector('#maestro-sliding-menu');
        const overlay = fragmentElement.querySelector('#maestro-overlay');
        const mainContent = fragmentElement.closest('#wrapper') || document.querySelector('#wrapper');
        
        if (!menuToggle || !slidingMenu) {
            return;
        }
        
        let isMenuOpen = false;
        
        function openMenu() {
            isMenuOpen = true;
            slidingMenu.classList.add('show');
            slidingMenu.setAttribute('aria-hidden', 'false');
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.classList.add('active');
            
            if (overlay) {
                overlay.classList.add('show');
            }
            
            if (mainContent) {
                mainContent.classList.add('menu-open');
            }
            
            // Integrate with global Boots sliding menu if available
            if (typeof window.Boots !== 'undefined' && window.Boots.SlidingMenu) {
                document.dispatchEvent(new CustomEvent('boots:menu-opened'));
            }
            
            // Focus management
            setTimeout(() => {
                const firstFocusableElement = slidingMenu.querySelector('a, button');
                if (firstFocusableElement) {
                    firstFocusableElement.focus();
                }
            }, 300);
        }
        
        function closeMenu() {
            isMenuOpen = false;
            slidingMenu.classList.remove('show');
            slidingMenu.setAttribute('aria-hidden', 'true');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.classList.remove('active');
            
            if (overlay) {
                overlay.classList.remove('show');
            }
            
            if (mainContent) {
                mainContent.classList.remove('menu-open');
            }
            
            // Integrate with global Boots sliding menu if available
            if (typeof window.Boots !== 'undefined' && window.Boots.SlidingMenu) {
                document.dispatchEvent(new CustomEvent('boots:menu-closed'));
            }
            
            // Return focus to toggle button
            menuToggle.focus();
        }
        
        // Menu toggle click
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (isMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Menu close click
        if (menuClose) {
            menuClose.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeMenu();
            });
        }
        
        // Overlay click
        if (overlay) {
            overlay.addEventListener('click', function() {
                closeMenu();
            });
        }
        
        // Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        });
    }
    
    /**
     * Initialize modal functionality
     */
    function initializeModals() {
        // Search modal
        const searchBtn = fragmentElement.querySelector('.maestro-search-btn');
        const searchOverlay = fragmentElement.querySelector('#maestro-search-overlay');
        const searchClose = fragmentElement.querySelector('#maestro-close-search');
        
        if (searchBtn && searchOverlay) {
            searchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Prevent opening modal in edit mode
                if (isInEditMode()) {
                    return;
                }
                
                searchOverlay.style.display = 'flex';
                searchOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (searchClose) {
            searchClose.addEventListener('click', function(e) {
                e.preventDefault();
                searchOverlay.style.display = 'none';
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        if (searchOverlay) {
            // Click outside to close
            searchOverlay.addEventListener('click', function(e) {
                if (e.target === searchOverlay) {
                    searchOverlay.style.display = 'none';
                    searchOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Login modal
        const loginBtn = fragmentElement.querySelector('.maestro-login-btn');
        const loginOverlay = fragmentElement.querySelector('#maestro-login-overlay');
        const loginClose = fragmentElement.querySelector('#maestro-close-login');
        
        if (loginBtn && loginOverlay) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                loginOverlay.style.display = 'flex';
                loginOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (loginClose) {
            loginClose.addEventListener('click', function(e) {
                e.preventDefault();
                loginOverlay.style.display = 'none';
                loginOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        if (loginOverlay) {
            // Click outside to close
            loginOverlay.addEventListener('click', function(e) {
                if (e.target === loginOverlay) {
                    loginOverlay.style.display = 'none';
                    loginOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Escape key for modals
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const activeModal = fragmentElement.querySelector('.maestro-search-overlay.active, .maestro-login-overlay.active');
                if (activeModal) {
                    activeModal.style.display = 'none';
                    activeModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }
})();