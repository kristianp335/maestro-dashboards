// Boots Contract Dropzone Fragment JavaScript
// Hide dropzone when not in edit mode unless onboarding tasks are completed

if (layoutMode !== 'edit') {
    function checkForCompletedTasks() {
        // Look for completed onboarding tasks on the page
        const completedTasks = document.querySelectorAll('.boots-task-card.boots-completed');
        return completedTasks.length > 0;
    }
    
    function manageDropzoneVisibility() {
        const contractDropZone = fragmentElement.querySelector('#contractDropZone');
        if (contractDropZone) {
            if (checkForCompletedTasks()) {
                // Show dropzone if there are completed tasks
                contractDropZone.style.display = 'block';
                contractDropZone.style.visibility = 'visible';
            } else {
                // Hide dropzone if no completed tasks
                contractDropZone.style.display = 'none';
            }
        }
    }
    
    // Initial check
    manageDropzoneVisibility();
    
    // Check again after a delay to catch late-loading task fragments
    setTimeout(manageDropzoneVisibility, 200);
    
    // Also check when page is fully loaded
    if (document.readyState !== 'complete') {
        window.addEventListener('load', manageDropzoneVisibility);
    }
}