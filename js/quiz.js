// Quiz functionality
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStartTime = null;
let timeRemaining = 30 * 60; // 30 minutes in seconds

// Initialize quiz
function initQuiz(courseId, studentInfo) {
    // Load questions for the selected course
    loadQuestions(courseId)
        .then(questions => {
            currentQuestions = questions;
            currentQuestionIndex = 0;
            userAnswers = new Array(30).fill(null);
            timeRemaining = 30 * 60;
            quizStartTime = new Date();

            // Start timer
            startTimer();

            // Display first question
            displayQuestion();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            alert('Error loading quiz questions. Please try again.');
            showPage('homepage');
        });
}

// Load questions from JSON file
async function loadQuestions(courseId) {
    try {
        const response = await fetch(`data/${courseId}.json`);
        if (!response.ok) {
            throw new Error('Failed to load questions');
        }
        const questions = await response.json();

        // Randomize question order and ensure we have exactly 30 questions
        const shuffledQuestions = shuffleArray(questions);
        if (shuffledQuestions.length < 30) {
            console.warn(`Only ${shuffledQuestions.length} questions found for ${courseId}, using sample questions to fill`);
            const sampleQuestions = generateSampleQuestions(30 - shuffledQuestions.length, courseId);
            return [...shuffledQuestions, ...sampleQuestions].slice(0, 30);
        }
        return shuffledQuestions.slice(0, 30);
    } catch (error) {
        // Fallback to sample questions if JSON file doesn't exist
        console.warn('Using sample questions as fallback');
        return generateSampleQuestions(30, courseId);
    }
}

// Generate sample questions (fallback)
function generateSampleQuestions(count, courseId) {
    const questions = [];
    const courseName = courseId.charAt(0).toUpperCase() + courseId.slice(1);

    for (let i = 1; i <= count; i++) {
        questions.push({
            question: `${courseName} Sample Question ${i}: What is the main concept being tested here?`,
            options: [
                `Basic ${courseName} Concept A`,
                `Advanced ${courseName} Technique B`,
                `${courseName} Framework Approach C`,
                `Core ${courseName} Principle D`
            ],
            correct: Math.floor(Math.random() * 4)
        });
    }
    return questions;
}

// Display current question
function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];

    // Update question number and text
    document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1} of 30`;
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('question-counter').textContent = `Question ${currentQuestionIndex + 1} of 30`;

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / 30) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    // Display options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        if (userAnswers[currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
    });

    // Update next button text for last question
    if (currentQuestionIndex === 29) {
        document.getElementById('next-btn').textContent = 'Submit Quiz';
    } else {
        document.getElementById('next-btn').textContent = 'Next Question';
    }
}

// Select an option
function selectOption(optionIndex) {
    // Remove selected class from all options
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));

    // Add selected class to clicked option
    options[optionIndex].classList.add('selected');

    // Store the answer
    userAnswers[currentQuestionIndex] = optionIndex;
}

// Go to next question or submit quiz
function goToNextQuestion() {
    // If no option selected, show alert
    if (userAnswers[currentQuestionIndex] === null) {
        alert('Please select an answer before proceeding.');
        return;
    }

    // If this is the last question, submit the quiz
    if (currentQuestionIndex === 29) {
        submitQuiz();
        return;
    }

    // Otherwise, go to next question
    currentQuestionIndex++;
    displayQuestion();
}

// Start the countdown timer
function startTimer() {
    updateTimerDisplay();

    window.quizTimerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        // Change timer color when 5 minutes left
        const timerElement = document.getElementById('timer');
        if (timeRemaining <= 300) { // 5 minutes
            timerElement.classList.add('danger');
        } else if (timeRemaining <= 600) { // 10 minutes
            timerElement.classList.add('warning');
            timerElement.classList.remove('danger');
        } else {
            timerElement.classList.remove('warning', 'danger');
        }

        // If time is up, submit the quiz
        if (timeRemaining <= 0) {
            clearInterval(window.quizTimerInterval);
            submitQuiz();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Submit the quiz
function submitQuiz() {
    clearInterval(window.quizTimerInterval);

    // Calculate score
    let score = 0;
    for (let i = 0; i < 30; i++) {
        if (userAnswers[i] === currentQuestions[i].correct) {
            score++;
        }
    }

    // Calculate time taken
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - quizStartTime) / 1000); // in seconds
    const minutesTaken = Math.floor(timeTaken / 60);
    const secondsTaken = timeTaken % 60;
    const timeTakenStr = `${minutesTaken}m ${secondsTaken}s`;

    // Get student info
    const studentInfo = JSON.parse(sessionStorage.getItem('activeQuiz')).studentInfo;

    // Determine pass/fail
    const passed = score >= 13;

    // Display results
    document.getElementById('result-name').textContent = studentInfo.fullName;
    document.getElementById('result-email').textContent = studentInfo.email;
    document.getElementById('result-course').textContent = courses.find(c => c.id === currentCourse).name;
    document.getElementById('result-score').textContent = `${score}/30`;
    document.getElementById('result-time').textContent = timeTakenStr;

    if (passed) {
        document.getElementById('result-icon').textContent = '✅';
        document.getElementById('result-title').textContent = 'Congratulations!';
        document.getElementById('result-score').className = 'result-score result-pass';
        document.getElementById('result-message').textContent =
            'You have passed. Your certificate will be processed soon.';
    } else {
        document.getElementById('result-icon').textContent = '❌';
        document.getElementById('result-title').textContent = 'Quiz Completed';
        document.getElementById('result-score').className = 'result-score result-fail';
        document.getElementById('result-message').textContent =
            'You did not reach the passing score. Please try again.';
    }

    // Store result
    const result = {
        name: studentInfo.fullName,
        email: studentInfo.email,
        course: courses.find(c => c.id === currentCourse).name,
        score: score,
        date: new Date().toLocaleDateString(),
        timeTaken: timeTakenStr,
        passed: passed,
        timestamp: new Date().getTime()
    };

    storeResult(result);

    // Clear active quiz from sessionStorage
    sessionStorage.removeItem('activeQuiz');

    // Show result page
    showPage('result-page');
}

// Store result in localStorage and simulate Google Sheets submission
function storeResult(result) {
    // Get existing results from localStorage
    let results = JSON.parse(localStorage.getItem('quizResults') || '[]');

    // Add new result
    results.push(result);

    // Store back to localStorage
    localStorage.setItem('quizResults', JSON.stringify(results));

    // Simulate Google Sheets submission (in a real implementation, this would use fetch)
    console.log('Result would be submitted to Google Sheets:', result);

    // In a real implementation, you would use:
    // fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(result)
    // });
}

// Utility function to shuffle array (for randomizing questions)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Set up quiz event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('next-btn').addEventListener('click', goToNextQuestion);

    // Prevent right-click and copy-paste during quiz
    document.addEventListener('contextmenu', (e) => {
        if (document.getElementById('quiz-page').classList.contains('active')) {
            e.preventDefault();
            return false;
        }
    });

    document.addEventListener('copy', (e) => {
        if (document.getElementById('quiz-page').classList.contains('active')) {
            e.preventDefault();
            return false;
        }
    });

    // Prevent going back during quiz
    window.addEventListener('popstate', (e) => {
        if (document.getElementById('quiz-page').classList.contains('active')) {
            // If user tries to go back during quiz, restart the quiz
            alert('Going back during the quiz is not allowed. The quiz will be restarted.');
            showPage('homepage');
            clearInterval(window.quizTimerInterval);
            sessionStorage.removeItem('activeQuiz');
        }
    });

    // Handle page reload/close during quiz
    window.addEventListener('beforeunload', (e) => {
        if (document.getElementById('quiz-page').classList.contains('active')) {
            e.preventDefault();
            e.returnValue = 'Your quiz progress will be lost if you leave this page. Are you sure?';
        }
    });
});

// Make functions available globally
window.initQuiz = initQuiz;
window.showPage = showPage;