/**
 * Boots Header Fragment JavaScript
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
     * DEFINED FIRST TO PREVENT REFERENCE ERRORS
     */
    function renderNavigationToSlidingMenu(navigationItems) {
        const menuList = fragmentElement.querySelector('#boots-menu-list');
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
                <li class="boots-menu-item">
                    <a href="${itemUrl}" class="boots-menu-link">
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
        
        // Initialize navigation from API
        loadNavigationMenu();
        
        initializeMobileMenu();
        initializeModals();
    }
    
    /**
     * Adjust navigation position based on Liferay control menu presence
     */
    function adjustNavigationForControlMenu() {
        const controlMenu = document.querySelector('.control-menu-level-1-nav.control-menu-nav');
        const navigation = fragmentElement.querySelector('#boots-sliding-menu');
        
        if (!controlMenu && navigation) {
            // Control menu not present, adjust navigation position
            navigation.style.marginTop = '-60px';
        }
    }

    /**
     * Get sample navigation for edit mode
     */
    function getSampleNavigation() {
        return [
            {
                name: 'Dashboard',
                url: '/dashboard',
                children: [
                    { name: 'Performance Overview', url: '/dashboard/performance' },
                    { name: 'Analytics', url: '/dashboard/analytics' }
                ]
            },
            {
                name: 'Training',
                url: '/training'
            },
            {
                name: 'Cases',
                url: '/cases'
            }
        ];
    }
    
    function isInEditMode() {
        const body = document.body;
        
        // Check for specific Liferay edit mode indicators
        const hasEditModeMenu = body.classList.contains('has-edit-mode-menu');
        const isEditMode = body.classList.contains('is-edit-mode');
        const hasControlMenu = document.querySelector('.control-menu');
        const hasPageEditor = document.querySelector('.page-editor__sidebar, .page-editor-sidebar, [data-qa-id="pageEditor"]');
        const hasFragmentEntryProcessorEditable = document.querySelector('.fragment-entry-processor-editable');
        const hasEditableElements = document.querySelector('[contenteditable="true"], .lfr-editable-field');
        
        // Must have both control menu AND active page editor OR actively editable elements
        const inEditMode = (hasEditModeMenu || isEditMode) && (hasPageEditor || hasEditableElements);
        
        // Add/remove body class to help with dropzone visibility
        if (inEditMode) {
            body.classList.add('has-edit-mode-menu');
            fragmentElement.classList.add('boots-edit-mode');
        } else {
            body.classList.remove('has-edit-mode-menu');
            fragmentElement.classList.remove('boots-edit-mode');
        }
        
        return inEditMode;
    }
    
    function ensureModalsHidden() {
        const searchOverlay = fragmentElement.querySelector('#boots-search-overlay');
        const loginOverlay = fragmentElement.querySelector('#boots-login-overlay');
        
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
        
        const header = fragmentElement.querySelector('.boots-header');
        const searchBtn = fragmentElement.querySelector('.boots-search-btn');
        const userProfileWidget = fragmentElement.querySelector('.boots-user-profile-widget');
        const loginBtn = fragmentElement.querySelector('.boots-login-btn');
        const menuToggle = fragmentElement.querySelector('.boots-menu-toggle');
        const slidingMenu = fragmentElement.querySelector('.boots-sliding-menu');
        const overlay = fragmentElement.querySelector('.boots-overlay');
        const accountSelectorDropzone = fragmentElement.querySelector('.boots-account-selector-dropzone');
        
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
        
        
        
        // Skip API call if no valid menu ID is provided
        if (!menuId || menuId === 'primary-menu' || menuId === 'undefined' || menuId === undefined || typeof menuId !== 'string') {
            
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
                
                
                
                // Extract navigation items from API response - handle multiple possible structures
                let navItems = [];
                
                if (data.navigationMenuItems && Array.isArray(data.navigationMenuItems)) {
                    navItems = data.navigationMenuItems;
                    
                } else if (data.items && Array.isArray(data.items)) {
                    navItems = data.items;
                    
                } else if (Array.isArray(data)) {
                    navItems = data;
                    
                } else {
                    
                    
                }
                
                
                navItems.forEach((item, index) => {
                    
                });
                
                if (navItems.length > 0) {
                    renderNavigationToSlidingMenu(navItems);
                } else {
                    
                }
            })
            .catch(error => {
                
                
            });
    }
    
    /**
     * Create sliding menu item from API data
     */
    function createSlidingMenuItemFromAPI(item) {
        if (!item || (!item.name && !item.title)) {
            
            return null;
        }
        
        const li = document.createElement('li');
        li.className = 'boots-menu-item';
        
        // Get configuration to access site prefix
        const config = getFragmentConfiguration();
        const sitePrefix = config.sitePrefix || '';
        
        // Handle both API and fallback structure
        const itemName = item.name || item.title || '';
        const baseUrl = item.link || item.url || '#';
        const itemUrl = baseUrl === '#' ? baseUrl : sitePrefix + baseUrl;
        const hasChildren = (item.children && item.children.length > 0) || 
                           (item.navigationMenuItems && item.navigationMenuItems.length > 0);
        
        if (hasChildren) {
            li.classList.add('has-submenu');
        }
        
        // Create the main link
        const link = document.createElement('a');
        link.href = itemUrl;
        link.className = 'boots-menu-link';
        link.textContent = itemName;
        
        // Add icon based on item name
        const icon = getMenuIcon(itemName);
        if (icon) {
            link.insertAdjacentHTML('afterbegin', icon + ' ');
        }
        
        li.appendChild(link);
        
        // Add submenu if children exist
        if (hasChildren) {
            const submenu = document.createElement('ul');
            submenu.className = 'boots-submenu';
            
            const children = item.children || item.navigationMenuItems || [];
            children.forEach(child => {
                const childLi = document.createElement('li');
                childLi.className = 'boots-submenu-item';
                
                const childLink = document.createElement('a');
                const childBaseUrl = child.link || child.url || '#';
                const childUrl = childBaseUrl === '#' ? childBaseUrl : sitePrefix + childBaseUrl;
                childLink.href = childUrl;
                childLink.className = 'boots-submenu-link';
                childLink.textContent = child.name || child.title || '';
                
                childLi.appendChild(childLink);
                submenu.appendChild(childLi);
            });
            
            li.appendChild(submenu);
        }
        
        return li;
    }
    
    /**
     * Get menu icon for navigation items
     */
    function getMenuIcon(itemName) {
        const iconMap = {
            'Dashboard': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
            'Training': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 3H6C7.1 3 8.1 3.4 8.8 4.1L10 5.3C10.7 6 11.7 6.4 12.8 6.4H18V15C18 16.1 17.1 17 16 17H4C2.9 17 2 16.1 2 15V3Z" stroke="currentColor" stroke-width="2"/></svg>',
            'Cases': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 3H17C18.1 3 19 3.9 19 5V15C19 16.1 18.1 17 17 17H7C5.9 17 5 16.1 5 15V12M1 12V5C1 3.9 1.9 3 3 3H5V15C5 16.1 5.9 17 7 17H17" stroke="currentColor" stroke-width="2"/></svg>',
            'Resources': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H14C14.5304 18 15.0391 17.7893 15.4142 17.4142C15.7893 17.0391 16 16.5304 16 16V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2Z" stroke="currentColor" stroke-width="2"/></svg>',
            'Support': '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21S3 16.9706 3 12S7.02944 3 12 3S21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/></svg>'
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
        return '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="2"/></svg>';
    }
    
    /**
     * Initialize submenu functionality
     */
    function initializeSubmenus() {
        
        
        const submenuItems = fragmentElement.querySelectorAll('.boots-menu-item.has-submenu');
        
        submenuItems.forEach(item => {
            const link = item.querySelector('.boots-menu-link');
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
        
        
        const menuToggle = fragmentElement.querySelector('#boots-menu-toggle');
        const menuClose = fragmentElement.querySelector('#boots-menu-close');
        const slidingMenu = fragmentElement.querySelector('#boots-sliding-menu');
        const overlay = fragmentElement.querySelector('#boots-overlay');
        const mainContent = document.querySelector('#wrapper');
        
        if (!menuToggle || !slidingMenu) {
            
            return;
        }
        
        let isMenuOpen = false;
        
        function openMenu() {
            
            isMenuOpen = true;
            slidingMenu.classList.add('active');
            slidingMenu.setAttribute('aria-hidden', 'false');
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.classList.add('active');
            
            if (overlay) {
                overlay.classList.add('active');
            }
            
            if (mainContent) {
                mainContent.classList.add('menu-open');
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
            slidingMenu.classList.remove('active');
            slidingMenu.setAttribute('aria-hidden', 'true');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.classList.remove('active');
            
            if (overlay) {
                overlay.classList.remove('active');
            }
            
            if (mainContent) {
                mainContent.classList.remove('menu-open');
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
        const searchBtn = fragmentElement.querySelector('.boots-search-btn');
        const searchOverlay = fragmentElement.querySelector('#boots-search-overlay');
        const searchClose = fragmentElement.querySelector('#boots-close-search');
        
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
        const loginBtn = fragmentElement.querySelector('.boots-login-btn');
        const loginOverlay = fragmentElement.querySelector('#boots-login-overlay');
        const loginClose = fragmentElement.querySelector('#boots-close-login');
        
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
                if (searchOverlay && searchOverlay.classList.contains('active')) {
                    
                    searchOverlay.style.display = 'none';
                    searchOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
                if (loginOverlay && loginOverlay.classList.contains('active')) {
                    
                    loginOverlay.style.display = 'none';
                    loginOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
        
        
    }
    
})();