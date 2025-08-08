/*
 * Snake-like game: control a mouse, collect cheese pieces containing words from the daily list.
 * Each cheese triggers audio playback of the word, shows its spelling and IPA, and updates the score.
 * The game gradually increases in speed. Colliding with walls ends the game.
 */

function initSnakeGame(canvas, infoContainer) {
  const ctx = canvas.getContext('2d');
  let width = canvas.width;
  let height = canvas.height;
  // Define grid size
  const cols = 20;
  const rows = 20;
  let cellSize = Math.min(width / cols, height / rows);
  // Adjust canvas resolution for retina displays
  canvas.width = cellSize * cols;
  canvas.height = cellSize * rows;

  // Mouse (snake) state
  let mouse = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let speed = 300; // initial speed in ms
  let gameLoop;
  let score = 0;
  // Words for cheese
  const cheeseItems = getDailyList(5);
  let cheeseIndex = 0;
  let cheese = randomCheese();
  // Overlay for word display
  let overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '10px';
  overlay.style.left = '50%';
  overlay.style.transform = 'translateX(-50%)';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
  overlay.style.color = '#fff';
  overlay.style.padding = '0.5rem 1rem';
  overlay.style.borderRadius = '8px';
  overlay.style.display = 'none';
  overlay.style.zIndex = '10';
  infoContainer.parentElement.appendChild(overlay);
  // Controls container
  const controls = document.createElement('div');
  controls.style.marginTop = '0.5rem';
  controls.style.display = 'flex';
  controls.style.justifyContent = 'center';
  controls.style.gap = '0.5rem';
  infoContainer.appendChild(controls);
  const repeatBtn = document.createElement('button');
  repeatBtn.textContent = currentLang === 'en' ? 'Repeat' : 'Répéter';
  controls.appendChild(repeatBtn);
  const slowBtn = document.createElement('button');
  slowBtn.textContent = currentLang === 'en' ? 'Slow' : 'Lent';
  controls.appendChild(slowBtn);
  const muteBtn = document.createElement('button');
  muteBtn.textContent = currentLang === 'en' ? 'Mute' : 'Silencieux';
  controls.appendChild(muteBtn);
  let muted = false;
  let lastSpokenText = '';
  // Event listeners for controls
  repeatBtn.addEventListener('click', () => {
    if (lastSpokenText && !muted) {
      speak(lastSpokenText);
    }
  });
  slowBtn.addEventListener('click', () => {
    if (lastSpokenText && !muted) {
      speakSlow(lastSpokenText);
    }
  });
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    muteBtn.textContent = muted ? (currentLang === 'en' ? 'Unmute' : 'Son') : (currentLang === 'en' ? 'Mute' : 'Silencieux');
  });

  function randomCheese() {
    // Generate random position not on the mouse
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (mouse.some(seg => seg.x === pos.x && seg.y === pos.y));
    return pos;
  }

  function draw() {
    // Clear canvas
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--card-bg-light');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw mouse segments
    ctx.fillStyle = '#555';
    mouse.forEach((seg, idx) => {
      ctx.fillStyle = idx === 0 ? '#333' : '#555';
      ctx.beginPath();
      ctx.arc(seg.x * cellSize + cellSize / 2, seg.y * cellSize + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
    });
    // Draw cheese
    ctx.fillStyle = '#f4c542';
    ctx.beginPath();
    ctx.rect(cheese.x * cellSize + 4, cheese.y * cellSize + 4, cellSize - 8, cellSize - 8);
    ctx.fill();
    // Score display
    infoContainer.textContent = `${currentLang === 'en' ? 'Score' : 'Score'}: ${score}`;
    // Add controls again (because text replacement removed them)
    infoContainer.appendChild(controls);
  }

  function update() {
    // Update direction
    direction = nextDirection;
    const head = { x: mouse[0].x + direction.x, y: mouse[0].y + direction.y };
    // Check wall collision
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      return gameOver();
    }
    // Check self collision
    if (mouse.some(seg => seg.x === head.x && seg.y === head.y)) {
      return gameOver();
    }
    // Move mouse
    mouse.unshift(head);
    // Check cheese collision
    if (head.x === cheese.x && head.y === cheese.y) {
      // Increase score
      score++;
      // Play audio and show overlay
      const item = cheeseItems[cheeseIndex % cheeseItems.length];
      showWord(item);
      cheeseIndex++;
      cheese = randomCheese();
      // Increase speed slightly
      if (speed > 100) {
        speed -= 10;
        clearInterval(gameLoop);
        gameLoop = setInterval(gameTick, speed);
      }
    } else {
      // Remove tail
      mouse.pop();
    }
    draw();
  }

  function gameTick() {
    update();
  }

  function gameOver() {
    clearInterval(gameLoop);
    overlay.style.display = 'block';
    overlay.textContent = currentLang === 'en' ? `Game Over! Final score: ${score}` : `Fin du jeu ! Score final : ${score}`;
    // Remove overlay after 3 seconds and reset game
    setTimeout(() => {
      overlay.style.display = 'none';
      resetGame();
    }, 3000);
  }

  function resetGame() {
    mouse = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    speed = 300;
    score = 0;
    cheeseIndex = 0;
    cheese = randomCheese();
    draw();
    clearInterval(gameLoop);
    gameLoop = setInterval(gameTick, speed);
  }

  function showWord(item) {
    overlay.textContent = `${item.fr} — ${item.en} [${item.ipa}]`;
    overlay.style.display = 'block';
    // speak word if not muted
    lastSpokenText = item.fr;
    if (!muted) {
      speak(item.fr);
    }
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 3000);
  }

  // Handle keyboard input
  window.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowUp':
        if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
        if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
        if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
        if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
        break;
      default:
        break;
    }
  });

  // Handle touch swipes for mobile
  let touchStartX, touchStartY;
  canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  });
  canvas.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        if (dx > 0 && direction.x !== -1) nextDirection = { x: 1, y: 0 };
        else if (dx < 0 && direction.x !== 1) nextDirection = { x: -1, y: 0 };
      } else {
        if (dy > 0 && direction.y !== -1) nextDirection = { x: 0, y: 1 };
        else if (dy < 0 && direction.y !== 1) nextDirection = { x: 0, y: -1 };
      }
    }
  });

  /**
   * Speak the text slowly by adjusting speech synthesis rate.
   * @param {string} text
   */
  function speakSlow(text) {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.6;
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang && v.lang.startsWith('fr'));
    if (frVoice) utterance.voice = frVoice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  // Kick off the game
  draw();
  clearInterval(gameLoop);
  gameLoop = setInterval(gameTick, speed);
}