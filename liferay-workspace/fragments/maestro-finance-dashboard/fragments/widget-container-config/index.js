/**
 * Widget Container Configuration Fragment JavaScript
 * Imports and initializes the custom widget container
 */

import 'customWidgetContainerCX';

// Additional initialization if needed
(function() {
    'use strict';
    
    // Use Liferay-provided fragmentElement (preferred) or fallback to script parent
    const root = (typeof fragmentElement !== 'undefined') ? fragmentElement : 
                 (document.currentScript ? document.currentScript.parentElement : null);
    
    if (root) {
        initializeWidgetContainer();
    }
    
    function initializeWidgetContainer() {
        // Wait for the custom element to be defined
        if (typeof customElements !== 'undefined') {
            customElements.whenDefined('custom-widget-container').then(() => {
                console.log('Custom widget container is ready');
                
                // Any additional setup can go here
                setupWidgetContainerEvents();
            });
        }
    }
    
    function setupWidgetContainerEvents() {
        // Set up any additional event listeners or configuration
        const container = root.querySelector('custom-widget-container');
        
        if (container) {
            // Listen for widget assignment changes
            container.addEventListener('widget-assigned', function(event) {
                console.log('Widget assigned:', event.detail);
            });
            
            container.addEventListener('widget-removed', function(event) {
                console.log('Widget removed:', event.detail);
            });
        }
    }
    
})();