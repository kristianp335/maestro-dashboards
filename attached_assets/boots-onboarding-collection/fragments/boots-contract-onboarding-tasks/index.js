// Boots Contract Onboarding Tasks Fragment JavaScript
// Handles completion status detection, overdue detection and styling

if (layoutMode !== 'edit') {
    const taskCard = fragmentElement.querySelector('.boots-task-card');
    
    if (taskCard) {
        // Check completion status from editable field
        const completionStatusElement = fragmentElement.querySelector('.boots-completion-status');
        
        if (completionStatusElement) {
            const completionStatus = completionStatusElement.textContent.trim().toLowerCase();
            
            if (completionStatus === 'true') {
                // Task is completed - apply completed styling
                taskCard.classList.add('boots-completed');
                taskCard.classList.remove('boots-overdue', 'boots-due-soon', 'boots-due-today');
                
                // Update status text for completed tasks
                const statusLabel = fragmentElement.querySelector('.boots-status-label');
                if (statusLabel) {
                    statusLabel.textContent = 'Completed';
                }
                
                // Set completion tooltip
                taskCard.setAttribute('title', 'This contract task has been completed');
                
            } else {
                // Task is not completed - proceed with normal overdue/outstanding logic
                taskCard.classList.remove('boots-completed');
                
                // Get the action by date from the displayed text (editable field)
                const deadlineDateElement = fragmentElement.querySelector('.boots-deadline-date');
                
                if (deadlineDateElement) {
                    const actionDateStr = deadlineDateElement.textContent.trim();
                    
                    try {
                        // Parse the action date - handle common date formats
                        let actionDate;
                        
                        // Try parsing as MM/DD/YY HH:MM AM/PM format first
                        if (actionDateStr.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}\s+(AM|PM)$/i)) {
                            actionDate = new Date(actionDateStr);
                        } else if (actionDateStr.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) {
                            // Handle MM/DD/YY format without time
                            actionDate = new Date(actionDateStr);
                        } else if (actionDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            // Handle YYYY-MM-DD format
                            actionDate = new Date(actionDateStr);
                        } else {
                            // Fallback - try direct parsing
                            actionDate = new Date(actionDateStr);
                        }
                        
                        const today = new Date();
                        
                        // Set both dates to midnight for accurate comparison
                        actionDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);
                        
                        // Check if the task is overdue
                        if (actionDate < today) {
                            // Add overdue class to trigger red border and problem icon
                            taskCard.classList.add('boots-overdue');
                            
                            // Update status text for overdue tasks
                            const statusLabel = fragmentElement.querySelector('.boots-status-label');
                            if (statusLabel) {
                                statusLabel.textContent = 'Overdue';
                            }
                            
                            // Calculate how many days overdue
                            const timeDiff = today.getTime() - actionDate.getTime();
                            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                            
                            // Add tooltip or additional info if needed
                            taskCard.setAttribute('title', `This contract task is ${daysDiff} day${daysDiff !== 1 ? 's' : ''} overdue`);
                        } else {
                            // Task is not overdue, ensure overdue class is removed
                            taskCard.classList.remove('boots-overdue');
                            
                            // Update status text to outstanding
                            const statusLabel = fragmentElement.querySelector('.boots-status-label');
                            if (statusLabel) {
                                statusLabel.textContent = 'Outstanding';
                            }
                            
                            // Calculate days remaining
                            const timeDiff = actionDate.getTime() - today.getTime();
                            const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
                            
                            if (daysRemaining <= 3 && daysRemaining > 0) {
                                // Add warning styling for tasks due soon
                                taskCard.classList.add('boots-due-soon');
                                taskCard.setAttribute('title', `Due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`);
                            } else if (daysRemaining === 0) {
                                // Due today
                                taskCard.classList.add('boots-due-today');
                                taskCard.setAttribute('title', 'Due today');
                            }
                        }
                        
                    } catch (error) {
                        console.warn('Invalid date format in contract onboarding task:', actionDateStr);
                    }
                }
            }
        }
    }
} else {
    // Edit mode - disable any dynamic functionality
    const taskCard = fragmentElement.querySelector('.boots-task-card');
    if (taskCard) {
        taskCard.classList.remove('boots-overdue', 'boots-due-soon', 'boots-due-today', 'boots-completed');
        taskCard.removeAttribute('title');
    }
}