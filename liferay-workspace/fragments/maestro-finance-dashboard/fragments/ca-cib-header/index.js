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
            'Main': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'Dashboard': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'KPI': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="13" width="4" height="8" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="10" y="3" width="4" height="18" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="17" y="8" width="4" height="13" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'Risk': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="1"/></svg>',
            'Your dashboard': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'Know Your Customer': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 16C8 14.5 9.5 14 12 14C14.5 14 16 14.5 16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'KYC': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 16C8 14.5 9.5 14 12 14C14.5 14 16 14.5 16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'Portfolio': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'Petitions': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            'Loan': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'Deal': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'Workflow': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="5" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="19" cy="5" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="19" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 7L10.5 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16.5 7L13.5 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            'GFD': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="5" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="19" cy="5" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="19" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 7L10.5 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16.5 7L13.5 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
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