import { BOARD_WIDTH, TOTAL_ROWS } from './constants';
import { TETROMINO_SHAPES } from './pieces';
import { checkCollision } from './collision';
import { ActivePiece, BoardGrid, CellValue } from './types';

export function createEmptyBoard(): BoardGrid {
  const board: BoardGrid = [];
  for (let r = 0; r < TOTAL_ROWS; r++) {
    const row: CellValue[] = new Array(BOARD_WIDTH).fill(null);
    board.push(row);
  }
  return board;
}

export function cloneBoard(board: BoardGrid): BoardGrid {
  return board.map((row) => [...row]);
}

/**
 * Calculates how far down the active piece can drop before collision.
 * Returns the ghost piece position (same x and rotation, minimum legal y).
 */
export function getGhostPiece(board: BoardGrid, piece: ActivePiece): ActivePiece {
  let dropDistance = 0;
  while (!checkCollision(board, piece, { dy: dropDistance + 1 })) {
    dropDistance++;
  }
  return {
    ...piece,
    y: piece.y + dropDistance,
  };
}

/**
 * Merges the active piece into the board grid and returns the new board.
 */
export function mergePieceIntoBoard(board: BoardGrid, piece: ActivePiece): BoardGrid {
  const newBoard = cloneBoard(board);
  const shape = TETROMINO_SHAPES[piece.type][piece.rotation];

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const boardX = piece.x + c;
        const boardY = piece.y + r;
        if (boardY >= 0 && boardY < TOTAL_ROWS && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.type;
        }
      }
    }
  }

  return newBoard;
}

/**
 * Checks for filled rows, clears them, adds empty rows to the top,
 * and returns the cleared rows information.
 */
export function clearCompletedRows(board: BoardGrid): {
  newBoard: BoardGrid;
  clearedRows: number[];
  linesCleared: number;
} {
  const clearedRows: number[] = [];
  const remainingRows: CellValue[][] = [];

  for (let r = 0; r < TOTAL_ROWS; r++) {
    const isFull = board[r].every((cell) => cell !== null);
    if (isFull) {
      clearedRows.push(r);
    } else {
      remainingRows.push([...board[r]]);
    }
  }

  const linesCleared = clearedRows.length;
  if (linesCleared === 0) {
    return { newBoard: board, clearedRows: [], linesCleared: 0 };
  }

  // Prepend new empty rows at the top
  const newBoard: BoardGrid = [];
  for (let i = 0; i < linesCleared; i++) {
    newBoard.push(new Array(BOARD_WIDTH).fill(null));
  }
  newBoard.push(...remainingRows);

  return {
    newBoard,
    clearedRows,
    linesCleared,
  };
}
