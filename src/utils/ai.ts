import { Player, Difficulty, BoardSize } from '../types';

// Helper to check for a winner and return the winning line indices dynamically per dimension
export function checkWinner(board: (Player | null)[], size: BoardSize): { winner: Player | null, pattern: number[] | null } {
  const winPatterns: number[][] = [];

  // 1. Dynamic Rows
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      row.push(r * size + c);
    }
    winPatterns.push(row);
  }

  // 2. Dynamic Columns
  for (let c = 0; c < size; c++) {
    const col: number[] = [];
    for (let r = 0; r < size; r++) {
      col.push(r * size + c);
    }
    winPatterns.push(col);
  }

  // 3. Diagonal 1 (Top-Left to Bottom-Right)
  const diag1: number[] = [];
  for (let i = 0; i < size; i++) {
    diag1.push(i * size + i);
  }
  winPatterns.push(diag1);

  // 4. Diagonal 2 (Top-Right to Bottom-Left)
  const diag2: number[] = [];
  for (let i = 0; i < size; i++) {
    diag2.push(i * size + (size - 1 - i));
  }
  winPatterns.push(diag2);

  // Check victory status
  for (const pattern of winPatterns) {
    const firstVal = board[pattern[0]];
    if (firstVal && pattern.every((idx) => board[idx] === firstVal)) {
      return { winner: firstVal, pattern };
    }
  }

  return { winner: null, pattern: null };
}

// Check if there are no empty spots left on the board
export function isBoardFull(board: (Player | null)[]): boolean {
  return board.every((cell) => cell !== null);
}

// Evaluate a board position from the point of view of the AI (used in heuristic depth cuts)
function evaluateBoard(board: (Player | null)[], aiPlayer: Player, size: BoardSize): number {
  const huPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';
  const check = checkWinner(board, size);
  if (check.winner === aiPlayer) return 1000;
  if (check.winner === huPlayer) return -1000;

  let score = 0;
  const lines: number[][] = [];

  // Generate lines dynamically to avoid static limits
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      row.push(r * size + c);
    }
    lines.push(row);
  }
  for (let c = 0; c < size; c++) {
    const col: number[] = [];
    for (let r = 0; r < size; r++) {
      col.push(r * size + c);
    }
    lines.push(col);
  }
  const d1: number[] = [];
  const d2: number[] = [];
  for (let i = 0; i < size; i++) {
    d1.push(i * size + i);
    d2.push(i * size + (size - 1 - i));
  }
  lines.push(d1, d2);

  for (const line of lines) {
    let aiCount = 0;
    let huCount = 0;
    let emptyCount = 0;

    for (const idx of line) {
      if (board[idx] === aiPlayer) aiCount++;
      else if (board[idx] === huPlayer) huCount++;
      else emptyCount++;
    }

    // Weight lines dynamically based on size
    if (size === 3) {
      if (aiCount === 2 && emptyCount === 1) score += 10;
      else if (huCount === 2 && emptyCount === 1) score -= 10;
    } else if (size === 4) {
      if (aiCount === 3 && emptyCount === 1) score += 50;
      else if (huCount === 3 && emptyCount === 1) score -= 50;
      else if (aiCount === 2 && emptyCount === 2) score += 5;
      else if (huCount === 2 && emptyCount === 2) score -= 5;
    } else {
      // 5x5 dynamic weights
      if (aiCount === 4 && emptyCount === 1) score += 150;
      else if (huCount === 4 && emptyCount === 1) score -= 150;
      else if (aiCount === 3 && emptyCount === 2) score += 20;
      else if (huCount === 3 && emptyCount === 2) score -= 20;
      else if (aiCount === 2 && emptyCount === 3) score += 4;
      else if (huCount === 2 && emptyCount === 3) score -= 4;
    }
  }

  // Slight favor to center/sub-center cells to gain early tactical position
  if (size === 3) {
    const centers = [4];
    for (const c of centers) {
      if (board[c] === aiPlayer) score += 2;
      else if (board[c] === huPlayer) score -= 2;
    }
  } else if (size === 4) {
    const centers = [5, 6, 9, 10];
    for (const c of centers) {
      if (board[c] === aiPlayer) score += 5;
      else if (board[c] === huPlayer) score -= 5;
    }
  } else {
    // 5x5 centers
    const exactCenter = [12];
    for (const c of exactCenter) {
      if (board[c] === aiPlayer) score += 15;
      else if (board[c] === huPlayer) score -= 15;
    }
    const surrounding = [6, 7, 8, 11, 13, 16, 17, 18];
    for (const c of surrounding) {
      if (board[c] === aiPlayer) score += 3;
      else if (board[c] === huPlayer) score -= 3;
    }
  }

  return score;
}

// Alpha-beta Minimax recursive algorithm
function minimax(
  board: (Player | null)[],
  depth: number,
  isMax: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player,
  size: BoardSize,
  maxDepth: number
): number {
  const huPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';
  const check = checkWinner(board, size);

  if (check.winner === aiPlayer) return 1000 - depth;
  if (check.winner === huPlayer) return -1000 + depth;
  if (isBoardFull(board) || depth >= maxDepth) {
    return evaluateBoard(board, aiPlayer, size);
  }

  const emptyIndices = board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((v): v is number => v !== null);

  if (isMax) {
    let maxEval = -Infinity;
    for (const idx of emptyIndices) {
      board[idx] = aiPlayer;
      const score = minimax(board, depth + 1, false, alpha, beta, aiPlayer, size, maxDepth);
      board[idx] = null;
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Beta cut-off
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const idx of emptyIndices) {
      board[idx] = huPlayer;
      const score = minimax(board, depth + 1, true, alpha, beta, aiPlayer, size, maxDepth);
      board[idx] = null;
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return minEval;
  }
}

// Public API solver to yield the optimal AI move index
export function getBestMove(
  board: (Player | null)[],
  aiPlayer: Player,
  difficulty: Difficulty,
  size: BoardSize
): number {
  const emptyIndices = board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((v): v is number => v !== null);

  if (emptyIndices.length === 0) return -1;

  // Easy difficulty: Pure stochastic selection
  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * emptyIndices.length);
    return emptyIndices[randomIndex];
  }

  const huPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

  // Medium and Unbeatable benefit from direct tactical scanners
  // 1. Can AI win immediately? Take it!
  for (const idx of emptyIndices) {
    const copyBoard = [...board];
    copyBoard[idx] = aiPlayer;
    if (checkWinner(copyBoard, size).winner === aiPlayer) {
      return idx;
    }
  }

  // 2. Clear immediate threat? (Block human win) Take it!
  for (const idx of emptyIndices) {
    const copyBoard = [...board];
    copyBoard[idx] = huPlayer;
    if (checkWinner(copyBoard, size).winner === huPlayer) {
      return idx;
    }
  }

  // Medium difficulty: 50% smart move / 50% random
  if (difficulty === 'medium') {
    if (Math.random() > 0.5) {
      const maxDepth = size === 3 ? 9 : size === 4 ? 4 : 2;
      let optimalMove = -1;
      let maxEval = -Infinity;
      
      for (const idx of emptyIndices) {
        const copyBoard = [...board];
        copyBoard[idx] = aiPlayer;
        const score = minimax(copyBoard, 0, false, -Infinity, Infinity, aiPlayer, size, maxDepth);
        if (score > maxEval) {
          maxEval = score;
          optimalMove = idx;
        }
      }
      return optimalMove !== -1 ? optimalMove : emptyIndices[0];
    } else {
      const randomIndex = Math.floor(Math.random() * emptyIndices.length);
      return emptyIndices[randomIndex];
    }
  }

  // Unbeatable difficulty: Perfect mathematical selection
  // Set appropriate depth limits based on grid size starting state count to be completely responsive
  const maxDepth = size === 3 ? 9 : size === 4 ? 5 : 2;
  let bestMove = -1;
  let maxScore = -Infinity;

  // Shuffle empty indices slightly to avoid playing standard deterministic corners all the time
  const shuffledSpots = [...emptyIndices].sort(() => Math.random() - 0.5);

  for (const idx of shuffledSpots) {
    const copyBoard = [...board];
    copyBoard[idx] = aiPlayer;
    const score = minimax(copyBoard, 0, false, -Infinity, Infinity, aiPlayer, size, maxDepth);
    if (score > maxScore) {
      maxScore = score;
      bestMove = idx;
    }
  }

  return bestMove !== -1 ? bestMove : emptyIndices[0];
}
