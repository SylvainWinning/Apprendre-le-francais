// Main application logic for French Learning Adventure

// Global state
let currentLang = 'en'; // 'en' or 'fr'
let currentView = 'home';
let progress = {};
let totalScore = 0;

/**
 * Initialize the application: bind event listeners, load progress, render initial view.
 */
function initApp() {
  // Load stored progress from localStorage
  const storedProgress = localStorage.getItem('progress');
  if (storedProgress) {
    try {
      progress = JSON.parse(storedProgress);
    } catch (e) {
      progress = {};
    }
  }

  // Load total score from localStorage
  const storedScore = localStorage.getItem('totalScore');
  if (storedScore) {
    totalScore = parseInt(storedScore, 10) || 0;
  }

  // Event listeners for theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    toggleTheme();
  });

  // Event listener for language toggle
  const langToggle = document.getElementById('lang-toggle');
  langToggle.addEventListener('click', () => {
    toggleLanguage();
  });

  // Event listener for score reset
  const resetBtn = document.getElementById('reset-score');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetScore);
  }

  // Event listeners for navigation
  const navButtons = document.querySelectorAll('#main-nav button');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      if (view) {
        // Set active button
        document.querySelectorAll('#main-nav button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadView(view);
      }
    });
  });

  // Render initial view
  loadView('home');
  applyLanguage();
}

/**
 * Toggle between light and dark themes.
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

/**
 * Toggle between English and French interface language.
 */
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fr' : 'en';
  applyLanguage();
  // Update language indicator button text
  const langToggle = document.getElementById('lang-toggle');
  langToggle.textContent = currentLang.toUpperCase();
  // Re-render current view to reflect language changes
  loadView(currentView);
}

/**
 * Apply translations to static interface elements based on current language.
 */
function applyLanguage() {
  const translations = {
    title: { en: 'French Learning Adventure', fr: 'Aventure d’apprentissage du français' },
    home: { en: 'Home', fr: 'Accueil' },
    daily: { en: 'Daily List', fr: 'Liste du jour' },
    flashcards: { en: 'Flashcards', fr: 'Cartes mémoire' },
    quiz: { en: 'Quiz', fr: 'Quiz' },
    dictation: { en: 'Dictation', fr: 'Dictée' },
    snake: { en: 'Game', fr: 'Jeu' },
    progressInfo: { en: 'Welcome! Ready to embark on your French learning journey.', fr: 'Bienvenue ! Prêt à embarquer pour votre aventure en français.' }
  };

  // Title
  document.getElementById('title').textContent = translations.title[currentLang];
  // Nav buttons
  const navButtons = document.querySelectorAll('#main-nav button');
  navButtons.forEach(btn => {
    const key = btn.getAttribute('data-view');
    if (translations[key]) {
      btn.textContent = translations[key][currentLang];
    }
  });
  // Footer progress info
  document.getElementById('progress-info').textContent = translations.progressInfo[currentLang];
  const resetBtn = document.getElementById('reset-score');
  if (resetBtn) {
    resetBtn.textContent = currentLang === 'en' ? 'Reset Score' : 'Réinitialiser le score';
  }
  updateScoreDisplay();
}

function updateScoreDisplay() {
  const label = currentLang === 'en' ? 'Total Score' : 'Score total';
  const el = document.getElementById('total-score-display');
  if (el) {
    el.textContent = `${label}: ${totalScore}`;
  }
}

function incrementTotalScore() {
  totalScore++;
  localStorage.setItem('totalScore', totalScore);
  updateScoreDisplay();
}

function resetScore() {
  totalScore = 0;
  localStorage.setItem('totalScore', totalScore);
  updateScoreDisplay();
}

/**
 * Load a specific view into the main content area.
 * @param {string} viewName - The name of the view to load.
 */
function loadView(viewName) {
  currentView = viewName;
  const content = document.getElementById('app-content');
  content.innerHTML = '';
  switch (viewName) {
    case 'home':
      renderHome(content);
      break;
    case 'daily':
      renderDaily(content);
      break;
    case 'flashcards':
      renderFlashcards(content);
      break;
    case 'quiz':
      renderQuiz(content);
      break;
    case 'dictation':
      renderDictation(content);
      break;
    case 'snake':
      renderGame(content);
      break;
    default:
      renderHome(content);
  }
}

/**
 * Render the home page.
 * Displays summary progress and guidance.
 */
function renderHome(container) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <h2>${currentLang === 'en' ? 'Welcome' : 'Bienvenue'}</h2>
    <p>${currentLang === 'en' ? 'Choose a module from the navigation above to start learning.' : 'Choisissez un module dans la navigation ci-dessus pour commencer à apprendre.'}</p>
    <p>${currentLang === 'en' ? 'Your progress is saved locally and will adapt to your learning pace.' : 'Vos progrès sont enregistrés localement et s’adapteront à votre rythme d’apprentissage.'}</p>
  `;
  container.appendChild(div);
}

/**
 * Render the daily list of vocabulary or phrases due for review.
 */
function renderDaily(container) {
  const list = getDailyList(5);
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    const learned = progress[item.id] && progress[item.id].learned;
    card.innerHTML = `
      <div class="daily-item">
        <h3>${item.fr}</h3>
        <p><em>${item.ipa}</em></p>
        <p>${item.en}</p>
        <button class="play-audio" data-text="${item.fr}"><i class="fa-solid fa-volume-high"></i> ${currentLang === 'en' ? 'Listen' : 'Écouter'}</button>
        <button class="mark-learned" data-id="${item.id}" data-learned="${learned ? 'true' : 'false'}"><i class="fa-solid fa-check"></i> ${currentLang === 'en' ? (learned ? 'Marked' : 'Learned') : (learned ? 'Marqué' : 'Appris')}</button>
      </div>
    `;
    container.appendChild(card);
  });
  // Attach audio playback handlers
  container.querySelectorAll('.play-audio').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-text');
      speak(text);
    });
  });
  // Attach mark learned handlers
  container.querySelectorAll('.mark-learned').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      const isLearned = btn.getAttribute('data-learned') === 'true';
      const newState = !isLearned;
      updateDifficulty(id, newState);
      btn.setAttribute('data-learned', newState);
      btn.textContent = currentLang === 'en' ? (newState ? 'Marked' : 'Learned') : (newState ? 'Marqué' : 'Appris');
      if (!progress[id]) {
        progress[id] = {};
      }
      progress[id].learned = newState;
      localStorage.setItem('progress', JSON.stringify(progress));
    });
  });
}

/**
 * Render flashcards for the current daily list.
 */
function renderFlashcards(container) {
  const list = getDailyList(5);
  list.forEach(item => {
    const flashcard = document.createElement('div');
    flashcard.className = 'flashcard card';
    flashcard.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-side flashcard-front">
          <h3>${item.fr}</h3>
          <p><em>${item.ipa}</em></p>
          <button class="play-audio" data-text="${item.fr}"><i class="fa-solid fa-volume-high"></i> ${currentLang === 'en' ? 'Listen' : 'Écouter'}</button>
        </div>
        <div class="flashcard-side flashcard-back">
          <p>${item.en}</p>
          <button class="mark-learned" data-id="${item.id}"><i class="fa-solid fa-check"></i> ${currentLang === 'en' ? 'Got it' : 'Compris'}</button>
        </div>
      </div>
    `;
    // Flip on click
    flashcard.addEventListener('click', () => {
      flashcard.classList.toggle('flip');
    });
    container.appendChild(flashcard);
  });
  // Add audio event listeners
  container.querySelectorAll('.play-audio').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btn.getAttribute('data-text');
      speak(text);
    });
  });
  // Add mark learned handlers
  container.querySelectorAll('.mark-learned').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      updateDifficulty(id, true);
      btn.disabled = true;
      btn.textContent = currentLang === 'en' ? 'Marked' : 'Marqué';
    });
  });
}

/**
 * Render quiz module. Generates multiple choice questions from vocabulary.
 */
function renderQuiz(container) {
  const allItems = [...vocabularyData];
  // Shuffle and take some for questions
  const questions = allItems.sort(() => Math.random() - 0.5).slice(0, 5);
  let currentQuestionIndex = 0;
  let score = 0;

  const quizContainer = document.createElement('div');
  quizContainer.className = 'card';
  container.appendChild(quizContainer);

  function showQuestion() {
    const q = questions[currentQuestionIndex];
    quizContainer.innerHTML = '';
    const qDiv = document.createElement('div');
    qDiv.innerHTML = `
      <div class="quiz-question">${currentLang === 'en' ? 'Translate:' : 'Traduire :'} <strong>${q.fr}</strong></div>
      <div class="quiz-options"></div>
    `;
    quizContainer.appendChild(qDiv);
    const optionsDiv = qDiv.querySelector('.quiz-options');
    // build options: correct answer + 3 random incorrect
    const options = [q.en];
    while (options.length < 4) {
      const random = allItems[Math.floor(Math.random() * allItems.length)].en;
      if (!options.includes(random)) options.push(random);
    }
    // shuffle options
    options.sort(() => Math.random() - 0.5);
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (btn.classList.contains('answered')) return;
        if (opt === q.en) {
          btn.classList.add('correct');
          score++;
          incrementTotalScore();
        } else {
          btn.classList.add('incorrect');
        }
        btn.classList.add('answered');
        // After short delay, show next question or finish
        setTimeout(() => {
          currentQuestionIndex++;
          if (currentQuestionIndex < questions.length) {
            showQuestion();
          } else {
            showResult();
          }
        }, 1000);
      });
      optionsDiv.appendChild(btn);
    });
  }

  function showResult() {
    quizContainer.innerHTML = '';
    const resultDiv = document.createElement('div');
    resultDiv.innerHTML = `
      <h3>${currentLang === 'en' ? 'Quiz Complete!' : 'Quiz terminé !'}</h3>
      <p>${currentLang === 'en' ? 'Your score:' : 'Votre score :'} ${score}/${questions.length}</p>
    `;
    quizContainer.appendChild(resultDiv);
  }

  showQuestion();
}

/**
 * Render dictation module.
 * Plays audio for a random phrase and asks user to type what they hear.
 */
function renderDictation(container) {
  const items = getDailyList(3);
  let index = 0;
  let score = 0;
  const dictationDiv = document.createElement('div');
  dictationDiv.className = 'card';
  container.appendChild(dictationDiv);

  function showPrompt() {
    dictationDiv.innerHTML = '';
    const item = items[index];
    const title = document.createElement('h3');
    title.textContent = `${currentLang === 'en' ? 'Listen and type the phrase' : 'Écoutez et tapez la phrase'}`;
    const playBtn = document.createElement('button');
    playBtn.innerHTML = `<i class="fa-solid fa-volume-high"></i> ${currentLang === 'en' ? 'Play' : 'Jouer'}`;
    playBtn.addEventListener('click', () => {
      speak(item.fr);
    });
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = currentLang === 'en' ? 'Type here...' : 'Tapez ici...';
    input.style.width = '100%';
    input.style.padding = '0.5rem';
    input.style.marginTop = '0.5rem';
    const feedback = document.createElement('p');
    feedback.style.marginTop = '0.5rem';
    const submitBtn = document.createElement('button');
    submitBtn.textContent = currentLang === 'en' ? 'Submit' : 'Valider';
    submitBtn.style.marginTop = '0.5rem';
    submitBtn.addEventListener('click', () => {
      const val = input.value.trim().toLowerCase();
      const isCorrect = val === item.fr.toLowerCase();
      feedback.textContent = isCorrect ? 'Correct' : 'Incorrect';
      feedback.style.color = isCorrect ? 'green' : 'red';
      input.style.borderColor = isCorrect ? 'green' : 'red';
      input.style.color = isCorrect ? 'green' : 'red';
      if (isCorrect) {
        score++;
        incrementTotalScore();
      }
      index++;
      setTimeout(() => {
        if (index < items.length) {
          showPrompt();
        } else {
          showDictationResult();
        }
      }, 800);
    });
    dictationDiv.appendChild(title);
    dictationDiv.appendChild(playBtn);
    dictationDiv.appendChild(input);
    dictationDiv.appendChild(feedback);
    dictationDiv.appendChild(submitBtn);
  }

  function showDictationResult() {
    dictationDiv.innerHTML = '';
    dictationDiv.innerHTML = `
      <h3>${currentLang === 'en' ? 'Dictation Complete!' : 'Dictée terminée !'}</h3>
      <p>${currentLang === 'en' ? 'Your score:' : 'Votre score :'} ${score}/${items.length}</p>
    `;
  }

  showPrompt();
}

/**
 * Render the snake game view.
 * The actual game logic is contained in snake.js.
 */
function renderGame(container) {
  const gameContainer = document.createElement('div');
  gameContainer.id = 'game-container';
  const canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  gameContainer.appendChild(canvas);
  const info = document.createElement('div');
  info.id = 'game-info';
  info.textContent = currentLang === 'en' ? 'Use arrow keys or swipe to move.' : 'Utilisez les flèches ou faites glisser pour bouger.';
  container.appendChild(gameContainer);
  container.appendChild(info);
  // Initialize snake game after the DOM elements exist
  initSnakeGame(canvas, info);
}

/**
 * Speak a given text in French using the Web Speech API.
 * @param {string} text - The French text to vocalize.
 */
function speak(text) {
  if (!('speechSynthesis' in window)) {
    alert(currentLang === 'en' ? 'Speech synthesis not supported in this browser.' : 'La synthèse vocale n’est pas prise en charge dans ce navigateur.');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  // Try to find a French voice
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find(v => v.lang && v.lang.startsWith('fr'));
  if (frVoice) utterance.voice = frVoice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

/**
 * Update the difficulty score of a vocabulary item.
 * @param {number} id - The vocabulary item ID.
 * @param {boolean} success - Whether the user successfully recalled the item.
 */
function updateDifficulty(id, success) {
  const item = vocabularyData.find(i => i.id === id);
  if (!item) return;
  // Load progress or create entry
  if (!progress[id]) {
    progress[id] = { difficulty: item.difficulty };
  }
  if (success) {
    progress[id].difficulty = (progress[id].difficulty || item.difficulty) + 1;
  } else {
    progress[id].difficulty = Math.max(1, (progress[id].difficulty || item.difficulty) - 1);
  }
  // Persist progress
  localStorage.setItem('progress', JSON.stringify(progress));
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);