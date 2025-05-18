const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');
const sidebar = document.getElementById('sidebar');
let gameOver = false;

function disableInput() {
  gameOver = true;
}


menuToggle.addEventListener('click', () => {
  sidebar.classList.remove('hidden');
  menuToggle.style.display = 'none';  // hide hamburger
  menuClose.style.display = 'block';  // show close button
});

menuClose.addEventListener('click', () => {
  sidebar.classList.add('hidden');
  menuClose.style.display = 'none';   // hide close button
  menuToggle.style.display = 'block'; // show hamburger
});

// Initialize close button hidden on load
menuClose.style.display = 'none';

let currentRow = 0;
let currentCol = 0;
let answerWord = '';
let guessGrid = [];
let validWords = [];

// Load today's answer and start game
async function loadTodayAnswer() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDy2C-qFssOvthzToyoWzPws6QCH8frjF9qR1Ebf2yO4QKLNL9R-gr-LMn4JQPl4WkOcayNde5mDQU/pub?output=csv';
  const response = await fetch(url);
  const csvText = await response.text();
  const rows = csvText.trim().split('\n').map(row => row.split(','));

  const headers = rows[0];
  const dateIdx = headers.indexOf('Date');
  const answerIdx = headers.indexOf('Answer');

  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  const dataRows = rows.slice(1);
  const todayRow = dataRows.find(row => row[dateIdx] === todayStr);

  if (todayRow) {
    await loadValidWords();
    const answer = todayRow[answerIdx];
    createWordleGrid(answer);
  } else {
    document.getElementById('game-window').innerHTML = `<h2>No puzzle found for today (${todayStr})</h2>`;
  }
}

// Load valid word list from CSV
async function loadValidWords() {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDy2C-qFssOvthzToyoWzPws6QCH8frjF9qR1Ebf2yO4QKLNL9R-gr-LMn4JQPl4WkOcayNde5mDQU/pub?gid=668776686&single=true&output=csv';
  const response = await fetch(csvUrl);
  const csvText = await response.text();
  validWords = csvText
    .split('\n')
    .map(w => w.trim().toUpperCase())
    .filter(Boolean);
}

// Show "Invalid word" popup
function showInvalidPopup() {
  const popup = document.getElementById('invalid-popup');
  popup.style.display = 'block';
  popup.style.opacity = '1';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 2000);
}

// Create empty wordle grid
function createWordleGrid(answer) {
  const gridContainer = document.getElementById('wordle-grid');
  gridContainer.innerHTML = '';
  answerWord = answer.toUpperCase();
  guessGrid = Array.from({ length: 8 }, () => Array(5).fill(''));

  for (let r = 0; r < 8; r++) {
    const row = document.createElement('div');
    row.className = 'wordle-row';
    for (let c = 0; c < 5; c++) {
      const box = document.createElement('div');
      box.className = 'wordle-box';
      box.id = `box-${r}-${c}`;
      row.appendChild(box);
    }
    gridContainer.appendChild(row);
  }
}

// Evaluate guess result (green/yellow/gray)
function evaluateGuess(guess) {
  const answerArr = answerWord.split('');
  const guessArr = guess.split('');
  const result = Array(5).fill('absent');

  // Green pass
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === answerArr[i]) {
      result[i] = 'correct';
      answerArr[i] = null;
      guessArr[i] = null;
    }
  }

  // Yellow pass
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] && answerArr.includes(guessArr[i])) {
      result[i] = 'present';
      answerArr[answerArr.indexOf(guessArr[i])] = null;
    }
  }

  return result;
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
  if (gameOver) return;
  if (!answerWord) return;

  const key = e.key.toUpperCase();

  if (key >= 'A' && key <= 'Z' && key.length === 1) {
    if (currentCol < 5) {
      guessGrid[currentRow][currentCol] = key;
      const box = document.getElementById(`box-${currentRow}-${currentCol}`);
      box.textContent = key;
      box.classList.add('filled');
      currentCol++;
    }
  } else if (key === 'BACKSPACE') {
    if (currentCol > 0) {
      currentCol--;
      guessGrid[currentRow][currentCol] = '';
      const box = document.getElementById(`box-${currentRow}-${currentCol}`);
      box.textContent = '';
      box.classList.remove('filled');
    }
  } else if (key === 'ENTER') {
    const guess = guessGrid[currentRow].join('');
    if (guess.length !== 5) return;

    if (!validWords.includes(guess)) {
      showInvalidPopup();
      return;
    }

    const result = evaluateGuess(guess);
    

    for (let i = 0; i < 5; i++) {
      const box = document.getElementById(`box-${currentRow}-${i}`);
      box.classList.add(result[i]);
    }

    if (guess === answerWord) {
        setTimeout(() => showResults(true), 100);
        disableInput();
        saveProgress();
        document.getElementById('share-trigger').style.display = 'block';

        return;
    }
    saveProgress(); 
    currentRow++;
    currentCol = 0;
    
    
    
      
    if (currentRow === 8) {
        setTimeout(() => showResults(false), 100);
        disableInput();
        saveProgress();
    
    }
    
  }
});
function checkNewDay() {
    const memory = JSON.parse(localStorage.getItem('wordleMemory')) || {};
    const lastDate = memory?.daily?.date;
    const todayStr = new Date().toISOString().split('T')[0];
  
    if (lastDate !== todayStr) {
      console.log('New day detected, resetting daily game state.');
      if (!memory.daily) memory.daily = {};
      memory.daily = {
        date: todayStr,
        guesses: Array.from({ length: 8 }, () => Array(5).fill('')),
        complete: false,
        results: null,
      };
      localStorage.setItem('wordleMemory', JSON.stringify(memory));
    }
}
  
function saveProgress() {
    const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const memory = JSON.parse(localStorage.getItem('wordleMemory')) || {};
    const savedGrid = memory.daily?.guesses || Array.from({ length: 8 }, () => Array(5).fill(''));
  
    savedGrid[currentRow] = [...guessGrid[currentRow]];
  
    memory.daily = {
      ...memory.daily,
      date: todayStr,
      guesses: savedGrid,
      complete: gameOver
    };
  
    localStorage.setItem('wordleMemory', JSON.stringify(memory));
  }
  

function showResults(win) {
    const resultText = generateResultsText(win);
    document.getElementById('share-trigger').style.display = 'block';

    document.getElementById('results-text').textContent = resultText;
    document.getElementById('results-modal').classList.remove('hidden');
  }
  
  function closeResults() {
    document.getElementById('results-modal').classList.add('hidden');
  }
  
  function copyResults() {
    const text = document.getElementById('results-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert("Results copied to clipboard!");
    });
  }
  
  function generateResultsText(win) {
    let result = `Wordle Clone - ${win ? currentRow + 1 : 'X'}/8\n\n`;
  
    for (let r = 0; r < currentRow+1; r++) {
      const guess = guessGrid[r].join('');
      const evaluation = evaluateGuess(guess);
  
      const resultRow = evaluation.map(status => {
        if (status === 'correct') return '🟩';
        if (status === 'present') return '🟨';
        return '⬜';
      }).join('');
  
      result += resultRow + '\n';
    }
  
    return result;
  }
  
  
  function showResults(win) {
    document.getElementById('share-trigger').classList.remove('hidden');
  
    const resultText = generateResultsText(win);
    document.getElementById('results-text').textContent = resultText;
    document.getElementById('results-modal').classList.remove('hidden');
  
    const memory = JSON.parse(localStorage.getItem('wordleMemory')) || {};
    memory.daily = {
      ...memory.daily,
      results: {
        text: resultText,
        show: true
      }
    };
    localStorage.setItem('wordleMemory', JSON.stringify(memory));
  }
  
  function openResults() {
    const memory = JSON.parse(localStorage.getItem('wordleMemory'));
    const results = memory?.daily?.results;
  
    if (results?.text) {
      document.getElementById('results-text').textContent = results.text;
      document.getElementById('results-modal').classList.remove('hidden');
    }
  }
  
  
  function closeResults() {
    document.getElementById('results-modal').classList.add('hidden');
  
    // Do not remove results from storage, just hide
    const stored = localStorage.getItem('wordleResults');
    if (stored) {
      const data = JSON.parse(stored);
      data.show = false;
      localStorage.setItem('wordleResults', JSON.stringify(data));
    }
  }
  
  function copyResults() {
    const text = document.getElementById('results-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert("Results copied to clipboard!");
    });
  }
  
  function restoreResultsIfNeeded() {
    const memory = JSON.parse(localStorage.getItem('wordleMemory'));
    const results = memory?.daily?.results;
  
    if (results?.text) {
      if (gameOver) {
        document.getElementById('results-text').textContent = results.text;
        document.getElementById('share-trigger').style.display = 'block';
      }
    }
  }
  
  function restoreGuesses() {
    const memory = JSON.parse(localStorage.getItem('wordleMemory'));
    const storedGuesses = memory?.daily?.guesses;
    const complete = memory?.daily?.complete;
  
    if (storedGuesses && Array.isArray(storedGuesses)) {
      guessGrid = storedGuesses;
  
      createWordleGrid(answerWord, true);
  
      storedGuesses.forEach((guessArr, rowIndex) => {
        guessArr.forEach((letter, colIndex) => {
          const cell = document.getElementById(`box-${rowIndex}-${colIndex}`);
          cell.textContent = letter;
  
          if (letter) {
            const actualLetter = answerWord[colIndex];
            if (letter === actualLetter) {
              cell.classList.add('correct');
            } else if (answerWord.includes(letter)) {
              cell.classList.add('present');
            } else {
              cell.classList.add('absent');
            }
          }
        });
      });
  
      currentRow = storedGuesses.findIndex(row => row.join('') === '');
      if (currentRow === -1) currentRow = 8;
      currentCol = 0;
  
      if (complete) {
        disableInput();
        document.getElementById('share-trigger').classList.remove('hidden');
      }
    }
  }

  const keyLayout = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['ENTER','Z','X','C','V','B','N','M','BACK']
  ];
  
  function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyLayout.forEach((rowKeys, rowIndex) => {
      const row = document.getElementById(`row-${rowIndex + 1}`);
      row.innerHTML = '';
      rowKeys.forEach(key => {
        const keyButton = document.createElement('button');
        keyButton.textContent = key === 'BACK' ? '⌫' : key;
        keyButton.className = 'key';
        keyButton.dataset.key = key;
        keyButton.addEventListener('click', () => handleKeyInput(key));
        row.appendChild(keyButton);
      });
    });
  }
  
  function handleKeyInput(key) {
    const simulatedEvent = new KeyboardEvent('keydown', {
      key: key === 'BACK' ? 'Backspace' : key === 'ENTER' ? 'Enter' : key
    });
    document.dispatchEvent(simulatedEvent);
  }
  
  
document.getElementById('close-modal').addEventListener('click', closeResults);
document.getElementById('share-trigger').style.display = 'none'; 
// Start the game
window.onload = async () => {
    checkNewDay();
    await loadTodayAnswer();
    restoreGuesses();
    restoreResultsIfNeeded();
    createKeyboard(); 
    
    
};
  