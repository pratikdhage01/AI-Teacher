let currentDate = new Date();

document.addEventListener('DOMContentLoaded', () => {
    // Initialize buttons
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    
    // Navigation button handlers
    document.getElementById('teacherBtn').addEventListener('click', function() {
        window.location.href = 'index.html'; // Redirects to teacher/avatar page
    });

    document.getElementById('chatbotBtn').addEventListener('click', function() {
        window.location.href = 'chatbot.html'; // Redirects to chatbot page
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        window.location.href = 'signup.html'; // Redirects to signup page
    });
    
    // Initial render
    renderMonth();
});

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderMonth();
}

function renderMonth() {
    const grid = document.getElementById('activityGrid');
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    document.getElementById('currentMonth').textContent = monthYear;
    
    // Clear existing boxes
    grid.innerHTML = '';
    
    // Get days in month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get stored activities
    const activities = JSON.parse(localStorage.getItem('userActivities') || '{}');
    
    // Create boxes for each day
    for (let i = 1; i <= daysInMonth; i++) {
        const box = document.createElement('div');
        box.className = 'activity-box';
        
        const date = new Date(year, month, i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Check if it's today
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        
        if (isToday) {
            box.className += ' medium-activity';
        } else if (date < today) {
            // Past days - check stored activities
            const activity = activities[dateStr];
            if (activity) {
                box.className += getActivityClass(activity);
            } else {
                box.className += ' no-activity';
            }
        } else {
            box.className += ' no-activity';
        }
        
        // Add tooltip
        const tooltipDate = date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric' 
        });
        
        box.addEventListener('mouseover', (e) => {
            showTooltip(e, tooltipDate);
        });
        box.addEventListener('mouseout', hideTooltip);
        
        grid.appendChild(box);
    }
    
    // Disable next month button if it's current month
    const today = new Date();
    document.getElementById('nextMonth').disabled = 
        currentDate.getMonth() === today.getMonth() && 
        currentDate.getFullYear() === today.getFullYear();
}

function getActivityClass(activity) {
    if (!activity) return ' no-activity';
    if (activity < 5) return ' low-activity';
    if (activity < 15) return ' medium-activity';
    return ' high-activity';
}

function showTooltip(event, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY + 10 + 'px';
    document.body.appendChild(tooltip);
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) tooltip.remove();
} 