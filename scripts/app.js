const squares = document.querySelectorAll('.square');
const turnIndicator = document.getElementById('turnIndicator');
const restartButton = document.getElementById('restartButton');
const scoreboard = document.getElementById('scoreboard');
const toggleThemeButton = document.getElementById('toggleTheme');
const resetScoresButton = document.getElementById('resetScoresButton');
const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');
const difficultySection = document.querySelector('.difficulty-mode');
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
const modeSubtitle = document.getElementById('modeSubtitle');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let scores = { X: 0, O: 0, Draws: 0 };
let gameActive = true;
let playerNames = { X: 'Player X', O: 'Player O' };
let playWithAI = false;
let aiDifficulty = 'easy';

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Initialize Game
function initGame() {
  board.fill('');
  gameActive = true;
  currentPlayer = 'X';
  squares.forEach(sq => {
    sq.textContent = '';
    sq.classList.remove('x','o','winning');
  });
  updateTurnIndicator();
  updateScoreboard();
  if (playWithAI && currentPlayer === 'O') {
    setTimeout(aiMove, 400);
  }
}

function makeMove(index, player) {
  board[index] = player;
  squares[index].textContent = player;
  squares[index].classList.add(player.toLowerCase());
  checkResult();
}

function handleSquareClick(event) {
  const index = Array.from(squares).indexOf(event.target);
  if (board[index] !== '' || !gameActive) return;
  if (playWithAI && currentPlayer === 'O') return;
  makeMove(index, currentPlayer);
}

function handleKeyPress(event) {
  if(event.key === 'Enter') {
    handleSquareClick({target: event.currentTarget});
  }
}

function checkResult() {
  let roundWon = false;
  for(let combo of winningCombinations) {
    const [a,b,c] = combo;
    if(board[a] && board[a] === board[b] && board[b] === board[c]) {
      roundWon = true;
      break;
    }
  }
  if(roundWon) {
    gameActive = false;
    turnIndicator.textContent = `${playerNames[currentPlayer]} wins!`;
    highlightWinningCombination();
    scores[currentPlayer]++;
    updateScoreboard();
    return;
  }
  if(board.every(cell => cell !== '')) {
    gameActive = false;
    turnIndicator.textContent = "It's a draw!";
    scores.Draws++;
    updateScoreboard();
    return;
  }
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateTurnIndicator();
  if(playWithAI && currentPlayer === 'O' && gameActive) {
    setTimeout(aiMove, 400);
  }
}

function highlightWinningCombination() {
  for(let combo of winningCombinations) {
    const [a,b,c] = combo;
    if(board[a] && board[a] === board[b] && board[b] === board[c]) {
      squares[a].classList.add('winning');
      squares[b].classList.add('winning');
      squares[c].classList.add('winning');
      break;
    }
  }
}

function updateTurnIndicator() {
  turnIndicator.textContent = `${playerNames[currentPlayer]}'s turn`;
}

function updateScoreboard() {
  scoreboard.textContent = `X: ${scores.X} | O: ${scores.O} | Draws: ${scores.Draws}`;
}

// AI Move based on difficulty
function aiMove() {
  if (!gameActive) return;

  if (aiDifficulty === 'easy') {
    // Random move
    const emptyIndices = board.reduce((acc, val, idx) => {
      if (val === '') acc.push(idx);
      return acc;
    }, []);
    const randomMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    makeMove(randomMove, 'O');
  } else if (aiDifficulty === 'medium') {
    // Medium: 70% optimal using minimax, 30% random
    if (Math.random() < 0.7) {
      const bestMove = minimax(board.slice(), 'O').index;
      makeMove(bestMove, 'O');
    } else {
      const emptyIndices = board.reduce((acc, val, idx) => {
        if (val === '') acc.push(idx);
        return acc;
      }, []);
      const randomMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      makeMove(randomMove, 'O');
    }
  } else {
    // Hard: always minimax
    const bestMove = minimax(board.slice(), 'O').index;
    makeMove(bestMove, 'O');
  }
}

function minimax(newBoard, player) {
  var availSpots = newBoard.reduce((acc, val, idx) => {
    if(val === '') acc.push(idx);
    return acc;
  }, []);

  if(checkWin(newBoard, 'X')) {
    return {score: -10};
  } else if(checkWin(newBoard, 'O')) {
    return {score: 10};
  } else if(availSpots.length === 0) {
    return {score: 0};
  }

  var moves = [];

  for(var i=0; i<availSpots.length; i++) {
    var move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    if(player === 'O') {
      var result = minimax(newBoard, 'X');
      move.score = result.score;
    } else {
      var result = minimax(newBoard, 'O');
      move.score = result.score;
    }

    newBoard[availSpots[i]] = '';
    moves.push(move);
  }

  var bestMove;
  if(player === 'O') {
    var bestScore = -Infinity;
    for(var i=0; i<moves.length; i++) {
      if(moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    var bestScore = Infinity;
    for(var i=0; i<moves.length; i++) {
      if(moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}

function checkWin(boardCheck, player) {
  for(let combo of winningCombinations) {
    const [a,b,c] = combo;
    if (boardCheck[a] === player && boardCheck[b] === player && boardCheck[c] === player) {
      return true;
    }
  }
  return false;
}

squares.forEach(sq => {
  sq.addEventListener('click', handleSquareClick);
  sq.addEventListener('keydown', handleKeyPress);
});

restartButton.addEventListener('click', initGame);

toggleThemeButton.addEventListener('click', () => {
  let currentTheme = document.body.getAttribute('data-theme');
  let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

resetScoresButton.addEventListener('click', () => {
  scores = { X:0, O:0, Draws:0 };
  updateScoreboard();
});

gameModeRadios.forEach(radio => {
  radio.addEventListener('change', e => {
    playWithAI = e.target.value === 'pvc';
    playerNames.O = playWithAI ? 'Computer' : 'Player O';
    modeSubtitle.textContent = playWithAI ? 'Player X vs AI' : 'Player X vs Player O';
    difficultySection.style.display = playWithAI ? 'flex' : 'none';
    initGame();
  });
});

difficultyRadios.forEach(radio => {
  radio.addEventListener('change', e => {
    aiDifficulty = e.target.value;
  });
});

window.onload = () => {
  let savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
  difficultySection.style.display = 'none';
  initGame();
};
