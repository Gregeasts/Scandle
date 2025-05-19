const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');
const sidebar = document.getElementById('sidebar');
let gameOver = false;
let row1= "";
let row2= "";
let row3= "";
let row4= "";
let row5= "";
let row6= "";
let row7= "";
let row8= "";
let lastletter ='';
let liesList=[];
let result =[];

let tolie=false;
let lied=0;
let lie =''
let regener =false;
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
const openExtraBtn = document.getElementById('open-extra');
const closeExtraBtn = document.getElementById('extra-close');
const mainContent = document.getElementById('main-sidebar-content');
const extraWindow = document.getElementById('extra-window');

openExtraBtn.addEventListener('click', () => {
    mainContent.classList.add('hidden');
    extraWindow.classList.remove('hidden');
});

closeExtraBtn.addEventListener('click', () => {
    extraWindow.classList.add('hidden');
    mainContent.classList.remove('hidden');
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
  const rows = csvText.trim().split('\n').map(row => row.split(',').map(cell => cell.trim()));

  const headers = rows[0];
  const dateIdx = headers.indexOf('Date');
  const answerIdx = headers.indexOf('Answer');
  const row1Idx = headers.indexOf('Row1');
  const row2Idx = headers.indexOf('Row2');
  const row3Idx = headers.indexOf('Row3');
  const row4Idx = headers.indexOf('Row4');
  const row5Idx = headers.indexOf('Row5');
  const row6Idx = headers.indexOf('Row6');
  const row7Idx = headers.indexOf('Row7');
  const row8Idx = headers.indexOf('Row8');

  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  const dataRows = rows.slice(1);
  const todayRow = dataRows.find(row => row[dateIdx] === todayStr);

  if (todayRow) {
    await loadValidWords();
    
    const answer = todayRow[answerIdx];
    row1= todayRow[row1Idx];
    row2= todayRow[row2Idx];
    row3= todayRow[row3Idx];
    row4= todayRow[row4Idx];
    row5= todayRow[row5Idx];
    row6= todayRow[row6Idx];
    row7= todayRow[row7Idx];
    row8= todayRow[row8Idx];
    
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
  
  const rowLabels = [row1, row2, row3, row4, row5, row6, row7, row8];
  const gridContainer = document.getElementById('wordle-grid');
  gridContainer.innerHTML = '';
  answerWord = answer.toUpperCase();
  guessGrid = Array.from({ length: 8 }, () => Array(5).fill(''));

  for (let r = 0; r < 8; r++) {
    const method = rowLabels[r];
    
    let blocks = [];
    let blocks1 = [];
    let blocks2=[];
    if (method.split("")[0]==='B'){
        blocks=method.split('').slice(1);
        
    }
    if (method.split("")[0]==='S'){
        blocks1=method.split('').slice(1);
        
    }
    if (method.split("")[0]==='M'){
        blocks2=method.split('').slice(2);
        
    }
    const row = document.createElement('div');
    row.className = 'wordle-row';
    for (let c = 0; c < 5; c++) {
      const box = document.createElement('div');
      box.className = 'wordle-box';
      box.id = `box-${r}-${c}`;
      if (blocks.includes(String(c + 1))) {
        box.style.backgroundColor = 'black'; // set color correctly via style
        box.style.borderColor = 'black'; // set color correctly via style
      }
      if (blocks1.includes(String(c + 1))) {
        box.style.border = '6px solid rgba(93, 3, 17, 0.8)'; 
      
      }
      if (blocks2.includes(String(c + 1))) {
        box.style.border = '6px solid rgba(19, 3, 93, 0.8)'; 
      
      }
      row.appendChild(box);
    }
    // Add SVG container
    const svgContainer = document.createElement('div');
    svgContainer.className = 'svg-box';
    const label = rowLabels[r] || 'Normal';
    const img = document.createElement('img');
    img.width = 60;
    img.height = 60;
    
    if (label === 'Normal') {
        img.src = 'normal.svg'; // Ensure this path is correct relative to your project    
    }
    else if (label.substring(0, 3) ==='Lie'){
        img.src='lie.svg';
    }
    else if (label ==='Locationless'){
        img.src='question.svg'
    }
    else if (label.split("")[0]==='B'){

        img.src='block.svg';
    }
    else if (label.split("")[0]==='S'){

        img.src='equal.svg';
    }
    else if (label==='End'){

        img.src='end.svg';
    }
    else if (label.startsWith('M')) {
        const letter = label[1]?.toUpperCase() || ''; // Get the letter after 'M'
 
        const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-6.96 -6.96 37.92 37.92" width="60" height="60">
                <path transform="translate(-6.96, -6.96), scale(1.185)" d="M16,30.616041195113212C18.461866825437493,30.327383836946805,20.24990310342244,28.291374849674096,22.255297327414155,26.834492787531126C24.066449526741117,25.51872398783943,25.974408444975687,24.338861794856467,27.210065667318876,22.472134430659935C28.49060936209617,20.53759634609542,29.05653113873198,18.29018353968556,29.42705658916384,16C29.849849642972558,13.386755238007112,31.06196518136196,10.346012081940618,29.520074881492267,8.194181127706546C27.94867060828306,6.00116106850192,24.510839624784943,6.5874112869604105,21.99128582957201,5.622788540513836C19.922310214374217,4.830671720442361,18.210284950442528,2.8671286673964294,16,3.0179583420976996C13.803191324634676,3.1678683968261363,12.486364424208878,5.541102960231769,10.462912902235988,6.409483820738625C8.073730877502918,7.43482093408955,4.494253423009985,6.3576327429976045,3.101905495878958,8.553281666012474C1.7297208290701722,10.717134340440095,3.6439764787096833,13.546090859669327,4.381186820100993,15.999999999999998C4.949542484030721,17.891852406795753,6.247332264238447,19.386126948456614,6.914877077551173,21.24529816489666C7.764704833757973,23.61214346391232,7.08580674703942,26.602361218326113,8.83630199171602,28.40788892042781C10.605791197792866,30.233007720297454,13.475219902977596,30.912075223122876,16,30.616041195113212" fill="#7ed0ec" strokewidth="0"></path>
                <text x="15%" y="55%" font-size="20" font-weight="bold" fill="#fff">${letter}</text>
            </svg>
        `;

        const encoded = encodeURIComponent(svgString).replace(/'/g, '%27').replace(/"/g, '%22');
        img.src = `data:image/svg+xml;charset=UTF-8,${encoded}`;
                
      
    }else{img.src='normal.svg'}

    svgContainer.appendChild(img);
    row.appendChild(svgContainer);
    gridContainer.appendChild(row);
  }
}

// Evaluate guess result (green/yellow/gray)
function evaluateGuess(guess,currentRow) {
    
    const answerArr = answerWord.split('');
    const guessArr = guess.split('');
    if (guessArr.length<1){
        result = ['absent','absent','absent','absent','absent'];
        return;
    }
    const result = Array(5).fill('absent');
    const rowLabels = [row1, row2, row3, row4, row5, row6, row7, row8];
    const method = rowLabels[currentRow];
    if (guessArr.length>0){
        
        lastletter=guessArr[4];
    }
    
  
    // Green pass
    
    tolie=false;
    lie='';
    if (method.substring(0, 3) === 'Lie') {
        tolie = true;
        lie = method[3]; // Gets the 4th character
        
    }
    for (let i = 0; i < 5; i++) {
        if (!answerArr.includes(guessArr[i])) {
            // mark as 'absent'
          if (tolie && i ===lie-1){
            if (!liesList.some(entry => entry.charAt(0) === String(currentRow))) {
                console.log("here",liesList,currentRow)
                lied = Math.floor(Math.random() * 2) + 1;
                if (lied===1){
                    result[i] = 'correct';
                    liesList.push(currentRow+ 'correct');
                }
                else if (lied===2){
                    result[i] = 'present';
                    liesList.push(currentRow + 'present')
                }   
            }else{
                const entry = liesList.find(e => e.charAt(0) === String(currentRow))
                result[i] = entry.substring(1);
                
            }
        }
        }  // Prevent reuse of this guess letter
    }
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] === answerArr[i]) {
        result[i] = 'correct';
        answerArr[i] = null;
        if (tolie && i ===lie-1){
            if (!liesList.some(entry => entry.charAt(0) === String(currentRow))) {
                lied = Math.floor(Math.random() * 2) + 1;
                
                if (lied===1){
                    result[i] = 'absent';
                    liesList.push(currentRow + 'absent')
                }
                else if (lied===2){
                    result[i] = 'present';
                    liesList.push(currentRow + 'present')
                    
                }   
        
            }else{
                const entry = liesList.find(e => e.charAt(0) === String(currentRow))
                result[i] = entry.substring(1);
                
            }
        }
        

        
      }
    }
  
    // Yellow pass
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] && answerArr.includes(guessArr[i])) {
        
          const matchIndex = answerArr.indexOf(guessArr[i]);
          result[i] = 'present';
          answerArr[matchIndex] = null;  // Mark this answer letter as used
          guessArr[i] = null;  
          
          if (tolie && i ===lie-1){
                if (!liesList.some(entry => entry.charAt(0) === String(currentRow))) {
                    lied = Math.floor(Math.random() * 2) + 1;
                    if (lied===1){
                        result[i] = 'correct';
                        liesList.push(currentRow + 'correct')
                    }
                    else if (lied===2){
                        result[i] = 'absent';
                        liesList.push(currentRow + 'absent')
                    }   
                    
                }else{
                    const entry = liesList.find(e => e.charAt(0) === String(currentRow))
                    result[i] = entry.substring(1);
                    
                }
            }
          // Prevent reuse of this guess letter
        }
    }
    
      
    
    console.log(liesList);
    return result;
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
  if (gameOver) return;
  if (!answerWord) return;
  const rowLabels = [row1, row2, row3, row4, row5, row6, row7, row8];
  

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
    
    const method = rowLabels[currentRow];
    if (method.split("")[0]==='M'){
        
        let mustuse = method.split("")[1].toUpperCase();
        let mustuseL = method.split("")[2]
        if (guess.split("")[mustuseL-1]!==mustuse){

            showInvalidPopup();
            return;
        }
    }
    if (method==='End'){
        
        if (!(guess.split("")[0]===lastletter)){

            showInvalidPopup();
            return;
        }
    }
    if (method.charAt(0) === 'S') {
        const equals = method.slice(1).split(""); // gets the rest after 'S'
        
        for (let i = 0; i < equals.length; i++) {
          for (let j = i + 1; j < equals.length; j++) {
            const posA = equals[i]-1; // convert 'a' to 0
            const posB = equals[j]-1;
      
            if (guess.charAt(posA) !== guess.charAt(posB)) {
              showInvalidPopup();
              return;
            }
          }
        }
    }
    if ((!validWords.includes(guess))) {
      showInvalidPopup();
      return;
    }

    const result = evaluateGuess(guess,currentRow);
    

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
      complete: gameOver,
      lastletter:guessGrid[currentRow][4],
      liesList: liesList
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
      const evaluation = evaluateGuess(guess,currentRow);
  
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
    lastletter=memory?.daily?.lastletter;
    liesList = memory?.daily?.liesList ||[];
    
  
    if (storedGuesses && Array.isArray(storedGuesses)) {
      guessGrid = storedGuesses;
      
      createWordleGrid(answerWord);
  
      storedGuesses.forEach((guessArr, rowIndex) => {
        const guess = guessArr.join('');
        const result = evaluateGuess(guess,rowIndex); // Use your custom evaluation logic
  
        guessArr.forEach((letter, colIndex) => {
          const cell = document.getElementById(`box-${rowIndex}-${colIndex}`);
          cell.textContent = letter;
  
          if (letter && result[colIndex]) {
            cell.classList.add(result[colIndex]); // 'correct', 'present', or 'absent'
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
    createKeyboard();
    restoreResultsIfNeeded();

    
    
    
    
};
  