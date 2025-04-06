// Add category mapping
const categories = {
    9: "General Knowledge",
    15: "Video Games",
    17: "Science",
    18: "Computers",
    22: "Geography",
    25: "Hinduism"
};

let selectedCategory = null;

// Add this at the top with other variables
let userAnswers = [];

// Add this new function to handle Hindu mythology questions
const hinduismQuestions = [
    {
        question: "Who is known as the Preserver in the Hindu Trinity (Trimurti)?",
        options: ["Vishnu", "Shiva", "Brahma", "Indra"],
        correct: 0
    },
    {
        question: "What is the sacred text of Hinduism called?",
        options: ["Vedas", "Bible", "Quran", "Torah"],
        correct: 0
    },
    {
        question: "Which Hindu God is known as the Remover of Obstacles?",
        options: ["Ganesha", "Krishna", "Hanuman", "Rama"],
        correct: 0
    },
    {
        question: "What is the concept of 'Karma' in Hinduism?",
        options: [
            "The law of cause and effect",
            "The cycle of birth and death",
            "The path of devotion",
            "The practice of meditation"
        ],
        correct: 0
    },
    {
        question: "Who wrote the epic Mahabharata?",
        options: ["Ved Vyasa", "Valmiki", "Tulsidas", "Kalidas"],
        correct: 0
    },
    // ... Add more questions here
];

// Modify fetchQuestions to use selected category
async function fetchQuestions(amount = 5) {
    try {
        if (selectedCategory === "25") {  // If Hinduism is selected
            // Shuffle and return Hindu questions
            return shuffleArray([...hinduismQuestions])
                .slice(0, amount)
                .map((q, index) => ({
                    question: q.question,
                    options: [...q.options],
                    correct: q.correct
                }));
        } else {
            // Use existing API for other categories
            const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${selectedCategory}&type=multiple`);
            const data = await response.json();
            
            if (data.results.length === 0) {
                throw new Error('No questions available for this category');
            }
            
            // Function to decode HTML entities
            function decodeHTML(html) {
                const txt = document.createElement('textarea');
                txt.innerHTML = html;
                return txt.value;
            }
            
            return data.results.map(q => ({
                question: decodeHTML(q.question),
                options: shuffleArray([...q.incorrect_answers, q.correct_answer])
                    .map(option => decodeHTML(option)),
                correct: shuffleArray([...q.incorrect_answers, q.correct_answer])
                    .indexOf(q.correct_answer)
            }));
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Unable to load questions for this category. Please try another category.');
        return [];
    }
}

let questions = [];
const numberOfQuestions = 5; // Number of questions per quiz

let currentQuestion = 0;
let canAnswer = true;

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const questionElement = document.getElementById('question');
const optionElements = document.querySelectorAll('.option');
const nextButton = document.getElementById('next-btn');

// Add category selection handling
const categoryScreen = document.getElementById('category-screen');
const categoryButtons = document.querySelectorAll('.category-btn');

categoryButtons.forEach(button => {
    button.addEventListener('click', async () => {
        selectedCategory = button.dataset.category;
        categoryScreen.classList.remove('active');
        
        // Remove the start screen step and start quiz directly
        quizScreen.classList.add('active');
        
        // Show loading state
        questionElement.textContent = "Loading questions...";
        
        // Fetch new questions
        questions = await fetchQuestions(numberOfQuestions);
        currentQuestion = 0;
        
        if (questions.length > 0) {
            loadQuestion();
        } else {
            questionElement.textContent = "Error loading questions. Please try again.";
        }
    });
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function loadQuestion() {
    const question = questions[currentQuestion];
    questionElement.textContent = question.question;
    
    let optionsWithAnswers = question.options.map((option, index) => ({
        text: option,
        isCorrect: index === question.correct
    }));
    
    optionsWithAnswers = shuffleArray(optionsWithAnswers);
    
    question.correct = optionsWithAnswers.findIndex(option => option.isCorrect);
    
    optionElements.forEach((option, index) => {
        // Remove all classes when loading new question
        option.classList.remove('correct', 'wrong', 'disabled');
        option.querySelector('.option-text').textContent = optionsWithAnswers[index].text;
        option.querySelector('.icon').innerHTML = '';
        option.addEventListener('click', () => checkAnswer(index));
    });
    
    canAnswer = true;
}

function checkAnswer(selectedIndex) {
    if (!canAnswer) return;
    
    canAnswer = false;
    const question = questions[currentQuestion];
    
    // Store the answer
    userAnswers.push({
        question: question.question,
        selectedAnswer: question.options[selectedIndex],
        correctAnswer: question.options[question.correct],
        isCorrect: selectedIndex === question.correct
    });

    optionElements.forEach((option, index) => {
        option.classList.add('disabled');
        
        if (index === question.correct) {
            option.classList.add('correct');
            option.querySelector('.icon').innerHTML = '<i class="fas fa-check"></i>';
        }
        if (index === selectedIndex && index !== question.correct) {
            option.classList.add('wrong');
            option.querySelector('.icon').innerHTML = '<i class="fas fa-times"></i>';
        }
    });
    
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

// Add this new function to show results
function showResults() {
    const resultsScreen = document.getElementById('results-screen');
    const summaryContainer = document.getElementById('results-summary');
    const scorePercent = document.getElementById('score-percent');
    
    // Calculate percentage
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    const percentage = Math.round((correctAnswers / userAnswers.length) * 100);
    
    // Display percentage
    scorePercent.textContent = percentage;
    
    // Clear previous results
    summaryContainer.innerHTML = '';
    
    // Add each question result
    userAnswers.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.isCorrect ? 'correct' : 'wrong'}`;
        
        resultItem.innerHTML = `
            <div>
                <i class="fas ${result.isCorrect ? 'fa-check' : 'fa-times'}"></i>
                <strong>Question ${index + 1}:</strong> ${result.question}
            </div>
            <div class="selected-answer">
                Your answer: ${result.selectedAnswer}
                ${!result.isCorrect ? `<br>Correct answer: ${result.correctAnswer}` : ''}
            </div>
        `;
        
        summaryContainer.appendChild(resultItem);
    });
    
    // Show results screen
    quizScreen.classList.remove('active');
    resultsScreen.classList.add('active');
}

// Add event listener for restart button
document.getElementById('restart-btn').addEventListener('click', () => {
    // Reset everything
    userAnswers = [];
    resetQuiz();
});

// Modify resetQuiz function
function resetQuiz() {
    currentQuestion = 0;
    questions = [];
    selectedCategory = null;
    userAnswers = [];
    document.getElementById('results-screen').classList.remove('active');
    categoryScreen.classList.add('active');
    quizScreen.classList.remove('active');
} 