const board = document.querySelector('.board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');

let currentPlayer = 'X'; 
let gameState = Array(36).fill("");
let isGameActive = true;

const ROWS = 6;
const COLS = 6;
const SEQUENCE_TO_WIN = 4;
let winningConditions = [];

// Gera a matriz tridimensional de possibilidades na inicialização
function generateWinningConditions() {
    let conditions = [];
    // Horizontais
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c <= COLS - SEQUENCE_TO_WIN; c++) {
            let start = r * COLS + c;
            conditions.push([start, start + 1, start + 2, start + 3]);
        }
    }
    // Verticais
    for (let r = 0; r <= ROWS - SEQUENCE_TO_WIN; r++) {
        for (let c = 0; c < COLS; c++) {
            let start = r * COLS + c;
            conditions.push([start, start + COLS, start + (COLS * 2), start + (COLS * 3)]);
        }
    }
    // Diagonais (\)
    for (let r = 0; r <= ROWS - SEQUENCE_TO_WIN; r++) {
        for (let c = 0; c <= COLS - SEQUENCE_TO_WIN; c++) {
            let start = r * COLS + c;
            conditions.push([start, start + COLS + 1, start + (COLS * 2) + 2, start + (COLS * 3) + 3]);
        }
    }
    // Diagonais (/)
    for (let r = 0; r <= ROWS - SEQUENCE_TO_WIN; r++) {
        for (let c = SEQUENCE_TO_WIN - 1; c < COLS; c++) {
            let start = r * COLS + c;
            conditions.push([start, start + COLS - 1, start + (COLS * 2) - 2, start + (COLS * 3) - 3]);
        }
    }
    return conditions;
}

winningConditions = generateWinningConditions();

function handleCellClick(e) {
    const clickedCell = e.target;
    if (!clickedCell.classList.contains('cell')) return;

    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== "" || !isGameActive || currentPlayer !== 'X') {
        return;
    }

    makeMove(clickedCellIndex, 'X');

    if (checkResult('X')) return;

    currentPlayer = 'O';
    statusText.innerText = "IA pensando...";
    statusText.className = "status ia-turn"; 
    
    setTimeout(aiTurn, 300);
}

function makeMove(index, player) {
    gameState[index] = player;
    if (player === 'X') {
        cells[index].innerHTML = `<span class="x-symbol">X</span>`;
    } else {
        cells[index].innerHTML = `<span class="o-symbol">O</span>`;
    }
}

function aiTurn() {
    if (!isGameActive) return;

    const bestMove = evaluateTable();
    makeMove(bestMove, 'O');

    if (checkResult('O')) return;

    currentPlayer = 'X';
    statusText.innerText = "Sua vez! (Turno do X)";
    statusText.className = "status player-turn";
}

// Inteligência Artificial por Heurística Matricial de Pesos
function evaluateTable() {
    let cellWeights = Array(36).fill(0);

    for (let condition of winningConditions) {
        const values = condition.map(index => gameState[index]);
        const xCount = values.filter(v => v === 'X').length;
        const oCount = values.filter(v => v === 'O').length;
        const emptyCount = values.filter(v => v === '').length;

        if (xCount > 0 && oCount > 0) continue;

        let score = 0;

        // Pesos defensivos (Travar o jogador X)
        if (xCount === 3 && emptyCount === 1) score = 10000; 
        else if (xCount === 2 && emptyCount === 2) score = 400;   
        else if (xCount === 1 && emptyCount === 3) score = 10;    

        // Pesos ofensivos (Expandir a IA O)
        if (oCount === 3 && emptyCount === 1) score = 50000; 
        else if (oCount === 2 && emptyCount === 2) score = 600;   
        else if (oCount === 1 && emptyCount === 3) score = 20;    

        for (let index of condition) {
            if (gameState[index] === '') {
                cellWeights[index] += score;
            }
        }
    }

    // Posicionamento tático central
    const centerBonus = [14, 15, 20, 21, 7, 8, 9, 10, 16, 19, 25, 26, 27, 28];
    centerBonus.forEach((index, idx) => {
        if (gameState[index] === '') {
            cellWeights[index] += (idx < 4) ? 5 : 2;
        }
    });

    let maxScore = -Infinity;
    let bestMoves = [];

    for (let i = 0; i < 36; i++) {
        if (gameState[i] === '') {
            if (cellWeights[i] > maxScore) {
                maxScore = cellWeights[i];
                bestMoves = [i];
            } else if (cellWeights[i] === maxScore) {
                bestMoves.push(i);
            }
        }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function checkResult(player) {
    let winningLine = null;

    for (let condition of winningConditions) {
        if (condition.every(index => gameState[index] === player)) {
            winningLine = condition;
            break;
        }
    }

    if (winningLine) {
        statusText.innerText = player === 'X' ? "Você venceu! 🎉" : "A IA venceu! 🤖";
        statusText.className = player === 'X' ? 'status player-turn' : 'status ia-turn';
        isGameActive = false;

        const className = player === 'X' ? 'win-player' : 'win-ia';
        winningLine.forEach(index => {
            cells[index].classList.add(className);
        });

        return true;
    }

    if (!gameState.includes("")) {
        statusText.innerText = "Empate! 🤝";
        statusText.className = "status";
        isGameActive = false;
        return true;
    }

    return false;
}

function restartGame() {
    currentPlayer = 'X';
    gameState = Array(36).fill("");
    isGameActive = true;
    statusText.innerText = "Sua vez! (Turno do X)";
    statusText.className = "status player-turn";
    
    cells.forEach(cell => {
        cell.innerHTML = ""; 
        cell.classList.remove('win-player', 'win-ia');
    });
}

board.addEventListener('click', handleCellClick);
restartBtn.addEventListener('click', restartGame);

// Aplica o estado estético inicial do app
statusText.className = "status player-turn";