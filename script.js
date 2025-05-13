const startBtn = document.getElementById("start-btn");
const categorySelect = document.getElementById("category-select");
const startScreen = document.getElementById("start-screen");
const quizContainer = document.getElementById("quiz-container");
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const timerDisplay = document.getElementById("timer");

let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let timer;
let timeLeft = 10;

startBtn.addEventListener("click", async () => {
  const category = categorySelect.value;
  await fetchQuestions(category);
  startQuiz();
});

async function fetchQuestions(category) {
  const res = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`);
  const data = await res.json();
  questions = data.results.map(q => {
    const allAnswers = [...q.incorrect_answers];
    const correctIndex = Math.floor(Math.random() * 4);
    allAnswers.splice(correctIndex, 0, q.correct_answer);

    return {
      question: decodeHTML(q.question),
      answers: allAnswers.map(a => decodeHTML(a)),
      correctAnswer: decodeHTML(q.correct_answer)
    };
  });
}

function decodeHTML(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function startQuiz() {
  startScreen.style.display = "none";
  quizContainer.style.display = "block";
  score = 0;
  currentQuestionIndex = 0;
  showQuestion();
}

function showQuestion() {
  resetState();
  const current = questions[currentQuestionIndex];
  questionElement.innerText = `${currentQuestionIndex + 1}. ${current.question}`;
  current.answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerText = answer;
    button.classList.add("btn");
    if (answer === current.correctAnswer) {
      button.dataset.correct = true;
    }
    button.addEventListener("click", selectAnswer);
    answerButtons.appendChild(button);
  });

  startTimer();
}

function resetState() {
  clearInterval(timer);
  nextButton.style.display = "none";
  answerButtons.innerHTML = "";
  timerDisplay.innerText = "";
}

function startTimer() {
  timeLeft = 10;
  timerDisplay.innerText = `Time left: ${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  Array.from(answerButtons.children).forEach(btn => {
    if (btn.dataset.correct) {
      btn.classList.add("correct");
    }
    btn.disabled = true;
  });
  nextButton.style.display = "block";
}

function selectAnswer(e) {
  clearInterval(timer);
  const selected = e.target;
  const correct = selected.dataset.correct === "true";
  if (correct) {
    selected.classList.add("correct");
    score++;
  } else {
    selected.classList.add("incorrect");
  }

  Array.from(answerButtons.children).forEach(btn => {
    if (btn.dataset.correct === "true") btn.classList.add("correct");
    btn.disabled = true;
  });

  nextButton.style.display = "block";
}

nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
});

function showScore() {
  resetState();
  questionElement.innerText = `🎉 You scored ${score} out of ${questions.length}!`;
  nextButton.innerText = "Play Again";
  nextButton.style.display = "block";
  nextButton.onclick = () => location.reload();
}
