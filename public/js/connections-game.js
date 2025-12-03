function clearMessage() {
  const messageElement = document.getElementById('message');
  if (messageElement) messageElement.textContent = '';
}

function displayCorrectCategory(categoryName, words, colorClass) {
  const container = document.getElementById('correct-guess-container');
  const newLine = document.createElement('div');
  newLine.classList.add('correct-guess', colorClass);
  newLine.innerHTML = '<strong>' + categoryName + ':</strong> ' + words.join(', ');
  container.appendChild(newLine);
}

function submitGuess() {
  clearMessage();
  var selectedTiles = document.querySelectorAll('.grid-item.selected');
  var selectedWords = Array.from(selectedTiles).map(tile => tile.dataset.word);

  if (selectedWords.length === 0) {
    alert("No words selected!");
    return;
  }

  const submittedGroups = getSubmittedGroups();
  const selectionKey = JSON.stringify(selectedWords.sort());
  if (submittedGroups.has(selectionKey)) {
    document.getElementById('submit-button').classList.add('disabled');
    const messageElement = document.getElementById('message');
    messageElement.textContent = 'This group has already been submitted.';
    return;
  }

  fetch('/connections/submit_guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedWords: selectedWords })
  })
  .then(r => r.json())
  .then(data => {
    if (data.result === 'success') {
      selectedTiles.forEach(tile => {
        tile.classList.remove('selected');
        tile.classList.add(data.color);
        tile.style.pointerEvents = 'none';
      });
      displayCorrectCategory(data.category, data.words, data.color);
      checkGameCompletion();
      markGroupAsSubmitted(selectedWords);
    } else {
      const messageElement = document.getElementById('message');
      messageElement.textContent = data.message || 'Something went wrong. Please try again.';
      if ('mistakes' in data) updateMistakes(data.mistakes);
    }
  }).catch(err => {
    console.error(err);
  });
}

function updateMistakes(mistakesRemaining) {
  const mistakeSquares = document.querySelectorAll('.mistake-square');
  mistakeSquares.forEach((square, index) => {
    if (index < mistakesRemaining) square.classList.add('mistake'); else square.classList.remove('mistake');
  });
  if (mistakesRemaining === 0) gameOver();
}

function markGroupAsSubmitted(group) {
  const submittedGroups = getSubmittedGroups();
  const selectionKey = JSON.stringify(group.sort());
  submittedGroups.add(selectionKey);
  localStorage.setItem('submittedGroups', JSON.stringify(Array.from(submittedGroups)));
}
function getSubmittedGroups() { const submittedGroups = localStorage.getItem('submittedGroups'); return new Set(submittedGroups ? JSON.parse(submittedGroups) : []); }
async function startNewGame() {
  // Ask server to reset the session game state, then clear client state and reload
  try {
    const resp = await fetch('/connections/new', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const data = await resp.json();
    if (data && data.result === 'ok') {
      // clear client-submitted groups and UI markings
      resetSubmittedGroups();
      document.querySelectorAll('.grid-item.green, .grid-item.yellow, .grid-item.purple, .grid-item.blue').forEach(el => {
        el.classList.remove('green', 'yellow', 'purple', 'blue');
        el.style.pointerEvents = '';
      });
      const container = document.getElementById('correct-guess-container'); if (container) container.innerHTML = '';
      // reload so server builds a fresh grid
      window.location.reload();
    } else {
      alert((data && data.message) || 'Unable to start a new game');
    }
  } catch (e) {
    console.error('startNewGame error', e);
    alert('Network error while starting a new game');
  }
}
function resetSubmittedGroups() { localStorage.removeItem('submittedGroups'); document.getElementById('submit-button').classList.remove('disabled'); }

function checkGameCompletion() {
  const totalTiles = document.querySelectorAll('.grid-item').length;
  const guessedTiles = document.querySelectorAll('.grid-item.green, .grid-item.yellow, .grid-item.purple, .grid-item.blue').length;
  if (totalTiles === guessedTiles) triggerConfetti();
}


function toggleTile(element) {
  clearMessage();
  const selectedTiles = document.querySelectorAll('.grid-item.selected').length;
  if (selectedTiles >= 4 && !element.classList.contains('selected')) return;
  element.classList.toggle('selected');
  if (document.querySelectorAll('.grid-item.selected').length >= 4) document.querySelectorAll('.grid-item:not(.selected)').forEach(tile => tile.classList.add('disable-hover')); else document.querySelectorAll('.grid-item').forEach(tile => tile.classList.remove('disable-hover'));
}

function gameOver() { const gameOverContainer = document.getElementById('game-over-container'); gameOverContainer.style.display = 'block'; }
function triggerConfetti() { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); }

document.addEventListener('DOMContentLoaded', function () {
  // Sync client-side submittedGroups with server state to avoid stale localStorage
  try {
    if (window.serverSubmittedKeys && Array.isArray(window.serverSubmittedKeys)) {
      // overwrite localStorage with server canonical view
      localStorage.setItem('submittedGroups', JSON.stringify(window.serverSubmittedKeys));
    }
  } catch (e) {
    console.warn('Could not sync submittedGroups with server', e);
  }

  if (document.querySelectorAll('.grid-item.selected').length >= 4) document.querySelectorAll('.grid-item:not(.selected)').forEach(tile => tile.classList.add('disable-hover'));
});
