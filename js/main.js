// Course data - All 12 courses as requested
const courses = [
    { id: 'python', name: 'Python Programming', icon: '🐍' },
    { id: 'webdev', name: 'Web Development', icon: '🌐' },
    { id: 'datascience', name: 'Data Science with Python', icon: '📊' },
    { id: 'mlai', name: 'Machine Learning & AI', icon: '🤖' },
    { id: 'mern', name: 'Full Stack (MERN)', icon: '⚛️' },
    { id: 'java', name: 'Java Programming', icon: '☕' },
    { id: 'powerbi', name: 'Power BI', icon: '📈' },
    { id: 'data-analyst', name: 'Data Analyst', icon: '🔍' },
    { id: 'aws', name: 'Cloud Computing with AWS', icon: '☁️' },
    { id: 'C_programming', name: 'C programming Basics', icon: '📑' },
    { id: 'cpp', name: 'C++ Programming', icon: '💻' },
    { id: 'DSA', name: 'Data Structure and Algorithms', icon: '📚' },
    { id: 'Flutter', name: 'Mobile App Development', icon: '📱' }

];

// Global variables
let currentPage = 'homepage';
let currentCourse = null;

// DOM elements
const pages = document.querySelectorAll('.page');
const coursesGrid = document.getElementById('courses-grid');
const studentForm = document.getElementById('student-form');
const quizPage = document.getElementById('quiz-page');
const resultPage = document.getElementById('result-page');

// Initialize the application
function init() {
    renderCourses();
    setupEventListeners();

    // Check if there's an active quiz in sessionStorage
    const activeQuiz = sessionStorage.getItem('activeQuiz');
    if (activeQuiz) {
        // If there's an active quiz, redirect to it
        const quizData = JSON.parse(activeQuiz);
        startQuiz(quizData.course, quizData.studentInfo);
    }
}

// Render course cards
function renderCourses() {
    coursesGrid.innerHTML = '';
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="course-icon">${course.icon}</div>
            <div class="course-content">
                <h3>${course.name}</h3>
                <p>Test your knowledge in ${course.name}. This quiz contains 30 questions with a 30-minute time limit.</p>
                <button class="btn btn-block start-quiz-btn" data-course="${course.id}">Start Quiz</button>
            </div>
        `;
        coursesGrid.appendChild(courseCard);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('home-link').addEventListener('click', () => showPage('homepage'));
    document.getElementById('home-btn').addEventListener('click', () => showPage('homepage'));

    // Course selection
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('start-quiz-btn')) {
            const courseId = e.target.getAttribute('data-course');
            selectCourse(courseId);
        }
    });

    // Student info form
    document.getElementById('student-info-form').addEventListener('submit', handleStudentInfoSubmit);
}

// Show specific page and hide others
function showPage(pageId) {
    // Clear timer if moving away from quiz
    if (currentPage === 'quiz-page' && pageId !== 'quiz-page') {
        if (window.quizTimerInterval) {
            clearInterval(window.quizTimerInterval);
        }
        sessionStorage.removeItem('activeQuiz');
    }

    // Update current page
    currentPage = pageId;

    // Hide all pages
    pages.forEach(page => page.classList.remove('active'));

    // Show the requested page
    document.getElementById(pageId).classList.add('active');
}

// Handle course selection
function selectCourse(courseId) {
    currentCourse = courseId;
    document.getElementById('course').value = courses.find(c => c.id === courseId).name;
    showPage('student-form');
}

// Handle student info form submission
function handleStudentInfoSubmit(e) {
    e.preventDefault();

    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;

    if (!fullName || !email) {
        alert('Please fill in all fields');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    const studentInfo = {
        fullName,
        email,
        course: currentCourse
    };

    startQuiz(currentCourse, studentInfo);
}

// Start the quiz
function startQuiz(courseId, studentInfo) {
    // Store active quiz in sessionStorage to prevent reload/back navigation issues
    sessionStorage.setItem('activeQuiz', JSON.stringify({
        course: courseId,
        studentInfo: studentInfo,
        startTime: new Date().getTime()
    }));

    // Update UI
    document.getElementById('quiz-title').textContent = `${courses.find(c => c.id === courseId).name} Quiz`;
    showPage('quiz-page');

    // Initialize quiz
    if (window.initQuiz) {
        window.initQuiz(courseId, studentInfo);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Load admin functionality on main website
function loadAdminFunctionality() {
    // Check if admin functions are available
    if (typeof loadAdminPanel === 'function') {
        console.log('Admin functions loaded successfully');

        // Start real-time updates
        setInterval(() => {
            const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
            console.log('Current results count:', results.length);
        }, 5000);
    } else {
        console.log('Admin functions not available');
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    init();
    loadAdminFunctionality();
});


// Real-time results update function (har 5 second mein check karega)
function startResultsUpdate() {
    setInterval(() => {
        // Check if admin panel is open
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            // Refresh results data
            updateAdminResults();
        }
    }, 5000);
}

// Admin results update function
function updateAdminResults() {
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    console.log('Real-time update: Total results -', results.length);

    // Agar admin panel open hai to refresh karo
    if (window.adminRefreshInterval && typeof loadAdminPanel === 'function') {
        loadAdminPanel();
    }
}

// Initialize real-time updates
document.addEventListener('DOMContentLoaded', () => {
    startResultsUpdate();
});

// Load admin functionality on main website
function loadAdminFunctionality() {
    // Check if admin functions are available
    if (typeof loadAdminPanel === 'function') {
        console.log('Admin functions loaded successfully');

        // Start real-time updates
        setInterval(() => {
            const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
            console.log('Current results count:', results.length);
        }, 5000);
    } else {
        console.log('Admin functions not available');
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    init();
    loadAdminFunctionality();
});

// Real-time results update function (har 5 second mein check karega)
function startResultsUpdate() {
    setInterval(() => {
        // Check if admin panel is open
        if (sessionStorage.getItem('adminLoggedIn') === 'true') {
            // Refresh results data
            updateAdminResults();
        }
    }, 5000);
}

// Admin results update function
function updateAdminResults() {
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    console.log('Real-time update: Total results -', results.length);

    // Agar admin panel open hai to refresh karo
    if (window.adminRefreshInterval && typeof loadAdminPanel === 'function') {
        loadAdminPanel();
    }
}

// Initialize real-time updates
document.addEventListener('DOMContentLoaded', () => {
    startResultsUpdate();
});