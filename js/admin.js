// Admin panel functionality with password protection
const ADMIN_PASSWORD = (() => {
    const parts = ['5202', 'art', 'necxalatrop'];
    return parts.join('').split('').reverse().join('');
})();


document.addEventListener('DOMContentLoaded', () => {
    checkAdminLogin();
    setupAdminEventListeners();
});

// Check if admin is already logged in
function checkAdminLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showAdminContent();
    } else {
        showLoginForm();
    }
}

// Show login form
function showLoginForm() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('admin-content').style.display = 'none';
}

// Show admin content
function showAdminContent() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
    loadAdminPanel();

    // Refresh results every 5 seconds for real-time updates
    if (window.adminRefreshInterval) {
        clearInterval(window.adminRefreshInterval);
    }
    window.adminRefreshInterval = setInterval(loadAdminPanel, 5000);
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();

    const password = document.getElementById('admin-password').value;
    const errorElement = document.getElementById('login-error');

    if (password === ADMIN_PASSWORD) {
        // Successful login
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminContent();
        errorElement.style.display = 'none';
    } else {
        // Failed login
        errorElement.style.display = 'block';
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
    }
}

// Handle logout
function handleLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    if (window.adminRefreshInterval) {
        clearInterval(window.adminRefreshInterval);
    }
    showLoginForm();
}

// Load admin panel with results
function loadAdminPanel() {
    // Get results from localStorage
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');

    // Populate course filter
    const courseFilter = document.getElementById('course-filter');
    const currentFilter = courseFilter.value;
    courseFilter.innerHTML = '<option value="all">All Courses</option>';

    const uniqueCourses = [...new Set(results.map(r => r.course))];
    uniqueCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseFilter.appendChild(option);
    });

    // Restore previous filter selection
    if (currentFilter && uniqueCourses.includes(currentFilter)) {
        courseFilter.value = currentFilter;
    }

    // Display results
    displayResults(results);
}

// Display results in admin panel
function displayResults(results) {
    const tableBody = document.getElementById('results-table-body');
    tableBody.innerHTML = '';

    if (results.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" class="text-center">No results found</td>`;
        tableBody.appendChild(row);
        return;
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp - a.timestamp);

    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.name}</td>
            <td>${result.email}</td>
            <td>${result.course}</td>
            <td>${result.score}/30</td>
            <td>${result.date}</td>
            <td>${result.timeTaken}</td>
            <td class="${result.passed ? 'pass' : 'fail'}">${result.passed ? 'Pass' : 'Fail'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter results in admin panel
function filterResults() {
    const courseFilter = document.getElementById('course-filter').value;
    const resultFilter = document.getElementById('result-filter').value;
    const scoreRange = document.getElementById('score-range').value;

    let results = JSON.parse(localStorage.getItem('quizResults') || '[]');

    // Apply filters
    if (courseFilter !== 'all') {
        results = results.filter(r => r.course === courseFilter);
    }

    if (resultFilter !== 'all') {
        const passed = resultFilter === 'pass';
        results = results.filter(r => r.passed === passed);
    }

    if (scoreRange !== 'all') {
        const [min, max] = scoreRange.split('-').map(Number);
        results = results.filter(r => r.score >= min && r.score <= max);
    }

    displayResults(results);
}

// Export results to Excel
function exportToExcel() {
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');

    if (results.length === 0) {
        alert('No results to export.');
        return;
    }

    // Create CSV content
    let csv = 'Name,Email,Course,Score,Date,Time Taken,Result\n';

    results.forEach(result => {
        csv += `"${result.name}","${result.email}","${result.course}",${result.score},"${result.date}","${result.timeTaken}","${result.passed ? 'Pass' : 'Fail'}"\n`;
    });

    // Create and download CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axcentra-quiz-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Results exported successfully!');
}

// Clear all results
function clearAllResults() {
    if (confirm('Are you sure you want to clear ALL quiz results? This action cannot be undone.')) {
        localStorage.removeItem('quizResults');
        loadAdminPanel();
        alert('All results have been cleared.');
    }
}

// Set up admin event listeners
function setupAdminEventListeners() {
    // Login form
    document.getElementById('admin-login-form').addEventListener('submit', handleAdminLogin);

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Filters
    document.getElementById('course-filter').addEventListener('change', filterResults);
    document.getElementById('result-filter').addEventListener('change', filterResults);
    document.getElementById('score-range').addEventListener('change', filterResults);

    // Buttons
    document.getElementById('export-btn').addEventListener('click', exportToExcel);
    document.getElementById('refresh-btn').addEventListener('click', () => loadAdminPanel());
    document.getElementById('clear-results-btn').addEventListener('click', clearAllResults);

    // Auto-focus on password field
    document.getElementById('admin-password').focus();
}
// Auto logout after 30 minutes of inactivity
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        alert('Session expired due to inactivity');
        handleLogout();
    }, 30 * 60 * 1000); // 30 minutes
}

// Event listeners for user activity
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Initialize timer

resetInactivityTimer();
