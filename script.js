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
let flashInterval = null; // 🆕 holds the interval so we can clear it later

let row8= "";
let lastletter ='';
let liesList=[];
let result =[];
let rowLabels =[];

let tolie=false;
let lied=0;
let lie =''
let regener =false;
function disableInput() {
  gameOver = true;
}
let calendar;
document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    dateClick: function (info) {
      const clickedDate = new Date(info.dateStr);
      const today = new Date();
    
      // Normalize both dates (set time to 00:00:00)
      clickedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
    
      if (clickedDate > today) {
        alert("Date is in the future");
        return;
      }
    
      if (clickedDate.getTime() === today.getTime()) {
        // Do nothing for today
        return;
      }
    
      // Format date as DD/MM/YYYY
      const day = String(clickedDate.getDate()).padStart(2, '0');
      const month = String(clickedDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const year = clickedDate.getFullYear();
    
      const formattedDate = `${day}/${month}/${year}`;
    
      // Build URL with formatted date
      const baseUrl = window.location.origin + window.location.pathname;
      const newUrl = `${baseUrl}?date=${encodeURIComponent(formattedDate)}`;
    
      window.location.href = newUrl;
    }
    
    
  });

  calendar.render();
  
});

function showTryAgain(show = true) {
  const btn = document.getElementById('try-again-btn');
  if (btn) {
    btn.classList.toggle('hidden', !show);
  }
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
const openExtraBtn1 = document.getElementById('open-extra-1');
const closeExtraBtn = document.getElementById('extra-close');
const closeExtraBtn1 = document.getElementById('extra-close-1');
const mainContent = document.getElementById('main-sidebar-content');
const extraWindow = document.getElementById('extra-window');
const extraWindow1 = document.getElementById('extra-window-1');

openExtraBtn.addEventListener('click', () => {
    mainContent.classList.add('hidden');
    extraWindow.classList.remove('hidden');

});
openExtraBtn1.addEventListener('click', () => {
  mainContent.classList.add('hidden');
  extraWindow1.classList.remove('hidden');
  calendar.render();
  calendar.updateSize();
});

closeExtraBtn.addEventListener('click', () => {
    extraWindow.classList.add('hidden');
    mainContent.classList.remove('hidden');
});
closeExtraBtn1.addEventListener('click', () => {
  extraWindow1.classList.add('hidden');
  mainContent.classList.remove('hidden');
});

// Initialize close button hidden on load
menuClose.style.display = 'none';
document.querySelectorAll('.menu-box').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault(); // stop the default link behavior

    const mode = link.getAttribute('data-mode');
    const date = link.getAttribute('data-date');
    const newUrl = new URL(window.location.href);

    if (mode) {
      // Set mode, remove date
      newUrl.searchParams.set('mode', mode);
      newUrl.searchParams.delete('date');

    } else if (date) {
      // Set date, remove mode
      newUrl.searchParams.set('date', date);
      newUrl.searchParams.delete('mode');

    } else {
      // Remove both if neither mode nor date present
      newUrl.searchParams.delete('mode');
      newUrl.searchParams.delete('date');

      if (menuClose) {
        menuClose.style.display = 'none';
      }
    }

    window.history.pushState({}, '', newUrl);

    // Optional: do something when mode is cleared or changed


    location.reload();
    
  });
});

let currentRow = 0;
let currentCol = 0;
let answerWord = '';
let guessGrid = [];
let validWords = [];
let answerWords = [];


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
  const urlParams = new URLSearchParams(window.location.search);
  let todayStr='';
  const date = urlParams.get('date');
  if(!date){
    const today = new Date();
    todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  }else{todayStr = date}
  

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
    document.getElementById('game-window').innerHTML = `<h2>No puzzle found for (${todayStr})</h2>`;
  }
}
async function createRandomAnswer() {

  const memory = JSON.parse(localStorage.getItem('wordleMemory')) || {};
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  
  const todayStr = new Date().toISOString().split('T')[0];
    if (mode !== memory?.mode?.current_mode){
      memory.mode = {
        date: todayStr,
        guesses: Array.from({ length: 8 }, () => Array(5).fill('')),
        complete: false,
        results: null,
        current_mode:mode,
        answer: null,
        rowlabels:[],
      };
      localStorage.setItem('wordleMemory', JSON.stringify(memory));
      

    }
    if( memory?.mode?.answer===null){
      await loadValidWords(); // Make sure answerWords is populated

      
      if (Array.isArray(answerWords) && answerWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * answerWords.length);
        const answer = answerWords[randomIndex];

        createWordleGridRandom(answer);
      } else {
        document.getElementById('game-window').innerHTML = `<h2>Random Puzzle Generation Failed</h2>`;
      }
    }else{
    if (memory?.mode?.answer!==null){
      await loadValidWords();
      answer=memory?.mode?.answer;
      
      createWordleGridRandom(answer)
    }
    
  }
  
}


// Load valid word list from CSV
async function loadValidWords() {

  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDy2C-qFssOvthzToyoWzPws6QCH8frjF9qR1Ebf2yO4QKLNL9R-gr-LMn4JQPl4WkOcayNde5mDQU/pub?gid=668776686&single=true&output=csv';
  const response = await fetch(csvUrl);
  const csvText = await response.text();

  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  const wordsIdx = headers.indexOf('Words');
  const wordsIdx1 = headers.indexOf('Answer-Words');
  if (wordsIdx === -1) {
    console.error("Column 'Words' not found.");
    return;
  }

  validWords = lines.slice(1) // skip header
    .map(line => line.split(',')[wordsIdx]?.trim().toUpperCase())
    .filter(word => word); // remove empty or undefined
  answerWords = lines.slice(1) // skip header
    .map(line => line.split(',')[wordsIdx1]?.trim().toUpperCase())
    .filter(word => word); // remove empty or undefined

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
    img.className = 'end-rows'; // Add your class name here
    
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
    else if (label==='Timer'){

      img.src='bomb.svg';
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

function createWordleGridRandom(answer) {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode'); // will be null if not present
  answerWord = answer.toUpperCase();
  const memory = JSON.parse(localStorage.getItem('wordleMemory')) || {};
  
  if (memory?.mode?.rowlabels && memory?.mode?.rowlabels.length <1){

  
    if (mode==='Snake'){
      rowLabels = ["Normal", "End", "End", "End", "End", "End","End", "Normal"];
    }
    if (mode==='Bomb'){
      rowLabels = ["Normal", "Timer", "Timer", "Timer", "Timer", "Timer","Timer", "Timer"];
    }
    else if (mode==='Walls'){
      let wallList = [];
      for (let i = 0; i < 8; i++) {
        const digits = [1, 2, 3, 4, 5];
        for (let j = digits.length - 1; j > 0; j--) {
          const rand = Math.floor(Math.random() * (j + 1));
          [digits[j], digits[rand]] = [digits[rand], digits[j]];
        }
        const count = Math.floor(Math.random() * 3) + 1;
        const suffix = digits.slice(0, count).join('');
        wallList.push("B" + suffix);
      }
      rowLabels=wallList;
      
    }
    else if (mode==='Lies'){
      let liesList = [];
      for (let i = 0; i < 8; i++) {
        const digits = [1, 2, 3, 4, 5];
        for (let j = digits.length - 1; j > 0; j--) {
          const rand = Math.floor(Math.random() * (j + 1));
          [digits[j], digits[rand]] = [digits[rand], digits[j]];
        }
        const count = 1;
        const suffix = digits.slice(0, count).join('');
        liesList.push("Lie" + suffix);
      }
      
      rowLabels=liesList;

    
    }
    else if (mode==='Equals'){
      let equalsList = [];
      for (let i = 0; i < 4; i++) {
        const digits = [1, 2, 3, 4, 5];
        for (let j = digits.length - 1; j > 0; j--) {
          const rand = Math.floor(Math.random() * (j + 1));
          [digits[j], digits[rand]] = [digits[rand], digits[j]];
        }
        const count = 2;
        const suffix = digits.slice(0, count).join('');
        equalsList.push("S" + suffix);
        equalsList.push("Normal");
      }
      
      rowLabels=equalsList;
    
      
    }
    else if (mode==='Must-Use'){
      let equalsList = [];
      for (let i = 0; i < 4; i++) {
        const digits = [1, 2, 3, 4, 5];
        for (let j = digits.length - 1; j > 0; j--) {
          const rand = Math.floor(Math.random() * (j + 1));
          [digits[j], digits[rand]] = [digits[rand], digits[j]];
        }
        const count = 1;
        const suffix = digits.slice(0, count).join('');
        const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        equalsList.push("M" + randomLetter+suffix);
        equalsList.push("Normal");
        
      }
      
      rowLabels=equalsList;
    
      
    }
    
  }else{
    rowLabels=memory?.mode?.rowlabels;
    
  }

  
  
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
    console.log(label)
    const img = document.createElement('img');
    img.className = 'end-rows'; // Add your class name here
    
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
    else if (label==='Timer'){

      img.src='bomb.svg';
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
    console.log(guess,currentRow);
    if (guessArr.length<1){
        const result1 = ['absent','absent','absent','absent','absent'];
        return result1;
    }
    const result = Array(5).fill('absent');
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const date = urlParams.get('date');
  
    if (!mode) {
      rowLabels = [row1, row2, row3, row4, row5, row6, row7, row8];
    }
    
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
        guessArr[i] = null;
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
    
      
    
   
    return result;
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
  if (gameOver) return;
  if (!answerWord) return;
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');


  if (!mode) {
    rowLabels = [row1, row2, row3, row4, row5, row6, row7, row8];
  }
  

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
    if (flashInterval) {
      const bomb = document.getElementById('bomb-timer');
      clearInterval(flashInterval);
      flashInterval = null;
      bomb.classList.add('hidden');
    
      
    }
    

    for (let i = 0; i < 5; i++) {
      const box = document.getElementById(`box-${currentRow}-${i}`);
      box.classList.add(result[i]);
    }

    if (guess === answerWord) {
        celebrateResult(true);
        setTimeout(() => showResults(true), 2000);
        disableInput();
        saveProgress();
        document.getElementById('share-trigger').style.display = 'block';

        return;
    }
    saveProgress(); 
    
    
    
    
      
    if (currentRow === 7) {
        celebrateResult(false);
        setTimeout(() => showResults(false), 2000);
        disableInput();
        saveProgress();
        document.getElementById('share-trigger').style.display = 'block';
    
    }
    currentRow++;
    currentCol = 0;
    handleTimer();
    
    
    
    
  }
});
function celebrateResult(win) {
  const body = document.body;

  if (win) {
    body.classList.add('celebrate');
    setTimeout(() => body.classList.remove('celebrate'), 2000);
  } else {
    body.classList.add('fail-flash');
    setTimeout(() => body.classList.remove('fail-flash'), 1000);
  }
}
function handleTimer(){
  if (rowLabels[currentRow] === 'Timer') {
        
    const bomb = document.getElementById('bomb-timer');
    const gameContainer = document.getElementById('wordle-grid');

    bomb.classList.remove('hidden');

    flashes = 0;
    flashInterval = setInterval(() => {
      // Flash red
      gameContainer.classList.add('flash-red');
      gameContainer.classList.add('shake');

      setTimeout(() => {
        gameContainer.classList.remove('flash-red');
        gameContainer.classList.remove('shake');
      }, 200); // remove after short flash/shake

      flashes++;

      if (flashes >= 8) {
        clearInterval(flashInterval);
        bomb.classList.add('hidden');
        console.log("here");
        guessGrid[currentRow]= ['Z','Z','Z','Z','Z'];
        const result = evaluateGuess('ZZZZZ',currentRow);
        for (let i = 0; i < 5; i++) {
          const box = document.getElementById(`box-${currentRow}-${i}`);
          box.textContent = 'Z';
          box.classList.add('filled');
          box.classList.add(result[i]);
        }
        saveProgress(); 
        currentRow++;
        currentCol = 0;
        handleTimer();
        if (currentRow === 8) {
          currentRow-=1;
          celebrateResult(false);
          setTimeout(() => showResults(false), 2000);
          disableInput();
          saveProgress();
          document.getElementById('share-trigger').style.display = 'block';
      
        }
        
      }
    }, 1000);
  }
}
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
function checkNewDay1() {
  const urlParams = new URLSearchParams(window.location.search);
  const dateKey = urlParams.get('date');  // e.g. "17/05/2025"
  if (!dateKey) return; // no date param, exit early

  const memory = JSON.parse(localStorage.getItem('wordleMemory')) || {};

  const todayStr = new Date().toISOString().split('T')[0]; // e.g. "2025-05-19"

  // Get stored current_date for this dateKey if exists
  const lastDate = memory[dateKey]?.current_date || null;

  if (lastDate !== todayStr) {
    console.log('New day detected, resetting daily game state for', dateKey);

    memory[dateKey] = {
      arch_date: dateKey,
      current_date: todayStr,
      guesses: Array.from({ length: 8 }, () => Array(5).fill('')),
      complete: false,
      results: null,
    };

    localStorage.setItem('wordleMemory', JSON.stringify(memory));
  }
}

  
function saveProgress() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const date = urlParams.get('date');
    if (!mode && !date){

    
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
        liesList: liesList,
        
      };
    
      localStorage.setItem('wordleMemory', JSON.stringify(memory));
    }
    else if(mode){
      const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
      const memory = JSON.parse(localStorage.getItem('wordleMemory')) || {};
      const savedGrid = memory.mode?.guesses || Array.from({ length: 8 }, () => Array(5).fill(''));
      
      

      
      savedGrid[currentRow] = [...guessGrid[currentRow]];
      
    
      memory.mode = {
        ...memory.mode,
        date: todayStr,
        guesses: savedGrid,
        complete: gameOver,
        lastletter:guessGrid[currentRow][4],
        liesList: liesList,
        current_mode: mode,
        answer:answerWord,
        rowlabels:rowLabels,

      };
    
      localStorage.setItem('wordleMemory', JSON.stringify(memory));

    }
    else if (date){
      const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
      const memory = JSON.parse(localStorage.getItem('wordleMemory')) || {};
      const savedGrid = memory[date]?.guesses || Array.from({ length: 8 }, () => Array(5).fill(''));
      console.log(savedGrid,[...guessGrid[currentRow]])
      
      

      
      savedGrid[currentRow] = [...guessGrid[currentRow]];
      
    
      memory[date] = {
        ...memory[date],
        date: todayStr,
        guesses: savedGrid,
        complete: gameOver,
        lastletter:guessGrid[currentRow][4],
        liesList: liesList,
        current_mode: mode,
        answer:answerWord,
        rowlabels:rowLabels,

      };
    
      localStorage.setItem('wordleMemory', JSON.stringify(memory));

    }

    
  }
  


  
  function closeResults() {
    document.getElementById('results-modal').classList.remove('show');
  }
  
  function copyResults() {
    const text = document.getElementById('results-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert("Results copied to clipboard!");
    });
  }
  
  function generateResultsText(win) {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const date = urlParams.get('date');
    let result='';
    if (!mode && !date){
      result = `Scandle - word: ${answerWord} - ${win ? currentRow + 1 : 'X'}/8\n\n`;
    }
    if (date){
      result = `Scandle (archive: ${date} word: ${answerWord})- ${win ? currentRow + 1 : 'X'}/8\n\n`;
    }
    if (mode){
      result = `Scandle (mode: ${mode} word: ${answerWord})- ${win ? currentRow + 1 : 'X'}/8\n\n`;
    }
    
    
 
    if (currentRow ===8){
      currentRow-=1;
    }
    for (let r = 0; r < currentRow+1; r++) {
      const guess = guessGrid[r].join('');

      const evaluation = evaluateGuess(guess,r);
  
      const resultRow = evaluation.map(status => {
        if (status === 'correct') return '🟩';
        if (status === 'present') return '🟨';
        return '⬜';
      }).join('');
  
      result += resultRow + '\n';
    }
  
    return result;
  }
  function restartGame(){
    const memory = JSON.parse(localStorage.getItem('wordleMemory')) || {};
    const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    memory.mode = {
      date: todayStr,
      guesses: Array.from({ length: 8 }, () => Array(5).fill('')),
      complete: false,
      results: null,
      current_mode:mode,
      answer: null,
      rowlabels:[],
    };
    localStorage.setItem('wordleMemory', JSON.stringify(memory));
    location.reload()
  }
  function showResults(win) {
    const resultText = generateResultsText(win);
    document.getElementById('results-text').textContent = resultText;
    document.getElementById('results-modal').classList.add('show');
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const date = urlParams.get('date');
    if(mode){
      showTryAgain(show = true);
      
    }
    else{
      
      showTryAgain(show = false);
    
    }
  
    // Set heading message based on win status
    const heading = document.querySelector('#results-modal h2');
    if (win) {
      heading.textContent = `Bravo! ${currentRow + 1}/8`;
    } else {
      heading.textContent = 'Game Over!';
    }
  
    // Show share button
    document.getElementById('share-trigger').classList.add('show');
  
    // Save results
    const memory = JSON.parse(localStorage.getItem('wordleMemory')) || {};
    if (!date && !mode){
      memory.daily = {
        ...memory.daily,
        results: {
          text: resultText,
          show: true
        }
      };
    }
    else if (mode){
      memory.mode = {
        ...memory.mode,
        results: {
          text: resultText,
          show: true
        }
      };
    }else{
      memory[date] = {
        ...memory[date],
        results: {
          text: resultText,
          show: true
        }
      };
    }
    localStorage.setItem('wordleMemory', JSON.stringify(memory));
  }
  
  
  function openResults() {
    const urlParams = new URLSearchParams(window.location.search);

    const date = urlParams.get('date');
    const mode = urlParams.get('mode');
    const memory = JSON.parse(localStorage.getItem('wordleMemory'));
    let results;
    if (!date&&!mode){
      results = memory?.daily?.results;
    }else if (date){
      results=memory[date]?.results;
    }else{results=memory?.mode?.results;}
    
  
    if (results?.text) {
      document.getElementById('results-text').textContent = results.text;
      document.getElementById('results-modal').classList.add('show');
    }
  }
  
  
  function closeResults() {
    document.getElementById('results-modal').classList.remove('show');
  
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
    const urlParams = new URLSearchParams(window.location.search);
    let results;
    let memory = JSON.parse(localStorage.getItem('wordleMemory'));
    const date = urlParams.get('date');
    const mode = urlParams.get('mode');
    if (!date&&!mode){
      
      results = memory?.daily?.results;
      showTryAgain(show = false);
    }else if (mode){
      console.log("here1");
      results = memory?.mode?.results;
      showTryAgain(show = true);
    }else if (date){
      console.log("here");
      results=memory[date]?.results;
      showTryAgain(show = false);
    }
    
    
    
    if (results?.text) {
      if (gameOver) {
        document.getElementById('results-text').textContent = results.text;
        document.getElementById('share-trigger').style.display = 'block';
      }
    }
  }
  
  function restoreGuesses() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const date = urlParams.get('date');
    if (!mode && !date){

    
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
    }else if (mode){
      const memory = JSON.parse(localStorage.getItem('wordleMemory'));
      const storedGuesses = memory?.mode?.guesses;
      const complete = memory?.mode?.complete;
      lastletter=memory?.mode?.lastletter;
      liesList = memory?.mode?.liesList ||[];
      
      
      
      if (storedGuesses && Array.isArray(storedGuesses)) {
        guessGrid = storedGuesses;
     
      
        storedGuesses.forEach((guessArr, rowIndex) => {
          const guess = guessArr.join('');
          
          
          const result = evaluateGuess(guess,rowIndex); // Use your custom evaluation logic
          
          guessArr.forEach((letter, colIndex) => {
            
            const cell = document.getElementById(`box-${rowIndex}-${colIndex}`);
            
            if (!guessArr.every(char => char === "")){
              cell.textContent = letter;
            }
           
    
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

    }else if (date){
      const memory = JSON.parse(localStorage.getItem('wordleMemory'));
      const storedGuesses= memory[date]?.guesses;

      const complete = memory[date]?.complete;
      lastletter=memory[date]?.lastletter;
      liesList = memory[date]?.liesList ||[];
      
    
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
        if (key === 'BACK') {
            keyButton.textContent = '⌫';
          } else if (key === 'ENTER') {
            keyButton.textContent = '✔';
          } else {
            keyButton.textContent = key;
        }
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
  
     
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const date = urlParams.get('date');
  console.log(date);
  if(mode){
    document.getElementById('game-title').textContent ="Scandle -  " + mode;
  }
  if(date){
    document.getElementById('game-title').textContent ="Scandle Archive- " + date;
  }
  if(!mode && !date){
    document.getElementById('game-title').textContent ="Daily Scandle";
  }
  

  if (!mode && !date) {
    // Only run this if there is NO ?mode=
    checkNewDay();
    await loadTodayAnswer();
    restoreGuesses();
    createKeyboard();
    restoreResultsIfNeeded();
  }
  if (mode){
    await createRandomAnswer();
    restoreGuesses();
    createKeyboard();
    restoreResultsIfNeeded();

  }
  if (date){
    checkNewDay1();
    await loadTodayAnswer();
    restoreGuesses();
    createKeyboard();
    restoreResultsIfNeeded();

    
  }

    
    
    
    
};
  