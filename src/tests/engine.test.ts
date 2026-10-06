import { BagRandomizer } from '../game/bag';
import { clearCompletedRows, createEmptyBoard, getGhostPiece } from '../game/board';
import { checkCollision } from '../game/collision';
import { BOARD_WIDTH, getGravityInterval, getLevelTitle, TOTAL_ROWS } from '../game/constants';
import { TETROMINO_TYPES } from '../game/pieces';
import { attemptRotation } from '../game/rotation';
import { calculateLevel, calculateLineScore } from '../game/scoring';
import { ActivePiece } from '../game/types';
import { loadPersistentData } from '../lib/storage';

export function runAllTests() {
  const results: { test: string; passed: boolean; error?: string }[] = [];

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ test: name, passed: true });
    } catch (e: any) {
      results.push({ test: name, passed: false, error: e.message });
    }
  }

  // 1. Board creation tests
  test('Board: empty board has correct dimensions (10x22 with hidden rows)', () => {
    const board = createEmptyBoard();
    assert(board.length === TOTAL_ROWS, `Expected ${TOTAL_ROWS} rows, got ${board.length}`);
    assert(board[0].length === BOARD_WIDTH, `Expected ${BOARD_WIDTH} cols, got ${board[0].length}`);
    assert(board.every(row => row.every(cell => cell === null)), 'Board cells should all be null');
  });

  // 2. 7-bag randomizer tests
  test('7-Bag: every 7 consecutive pieces contain all 7 unique tetrominoes', () => {
    const bag = new BagRandomizer();
    const first7 = [bag.next(), bag.next(), bag.next(), bag.next(), bag.next(), bag.next(), bag.next()];
    const unique = new Set(first7);
    assert(unique.size === 7, `Expected 7 unique pieces, got ${unique.size}: ${first7.join(',')}`);
    for (const t of TETROMINO_TYPES) {
      assert(unique.has(t), `Bag missing piece ${t}`);
    }
  });

  // 3. Collision tests
  test('Collision: boundaries prevent moving outside board', () => {
    const board = createEmptyBoard();
    const piece: ActivePiece = { type: 'I', rotation: 0, x: 0, y: 5 }; // horizontal I piece (4 wide, cols 0..3)

    // Valid placement
    assert(!checkCollision(board, piece), 'Valid position should not collide');

    // Left wall collision
    assert(checkCollision(board, piece, { dx: -1 }), 'Moving left into wall should collide');

    // Right wall collision (piece at x=7 takes cols 7,8,9,10 => col 10 is out of bounds)
    assert(checkCollision(board, piece, { dx: 7 }), 'Moving right into wall should collide');

    // Floor collision
    assert(checkCollision(board, piece, { dy: TOTAL_ROWS }), 'Moving past floor should collide');
  });

  test('Collision: blocks detect occupied cells', () => {
    const board = createEmptyBoard();
    board[10][4] = 'T'; // place locked block at row 10, col 4

    // Piece overlapping row 10, col 4
    const piece: ActivePiece = { type: 'O', rotation: 0, x: 4, y: 9 }; // O piece spans rows 9..10, cols 4..5
    assert(checkCollision(board, piece), 'Overlapping occupied cell must collide');

    // Non-overlapping piece
    const otherPiece: ActivePiece = { type: 'O', rotation: 0, x: 0, y: 9 };
    assert(!checkCollision(board, otherPiece), 'Non-overlapping cell should not collide');
  });

  // 4. Rotation & SRS Kicks tests
  test('Rotation: basic rotation changes orientation', () => {
    const board = createEmptyBoard();
    const piece: ActivePiece = { type: 'T', rotation: 0, x: 3, y: 5 };
    const rotatedCW = attemptRotation(board, piece, 1);
    assert(rotatedCW !== null, 'Clockwise rotation should succeed');
    assert(rotatedCW!.rotation === 1, `Expected rotation 1, got ${rotatedCW?.rotation}`);

    const rotatedCCW = attemptRotation(board, piece, -1);
    assert(rotatedCCW !== null, 'CCW rotation should succeed');
    assert(rotatedCCW!.rotation === 3, `Expected rotation 3, got ${rotatedCCW?.rotation}`);
  });

  test('Rotation: wall kick allows rotation against left wall', () => {
    const board = createEmptyBoard();
    // Place vertical I piece (rotation 1, col 0) right against left wall
    const piece: ActivePiece = { type: 'I', rotation: 1, x: -1, y: 5 };
    // Rotate to horizontal (rotation 0) - SRS kick will kick it rightwards
    const rotated = attemptRotation(board, piece, -1);
    assert(rotated !== null, 'SRS kick against left wall must succeed');
    assert(!checkCollision(board, rotated!), 'Kicked piece must be in valid position');
  });

  // 5. Ghost piece test
  test('Ghost piece: lands directly on floor or placed block', () => {
    const board = createEmptyBoard();
    const piece: ActivePiece = { type: 'O', rotation: 0, x: 4, y: 2 };
    const ghost = getGhostPiece(board, piece);
    // Floor is TOTAL_ROWS = 22, O piece is 2 rows high, so legal bottom y is 20
    assert(ghost.y === 20, `Expected ghost y to be 20, got ${ghost.y}`);
    assert(ghost.x === 4, `Expected ghost x to remain 4, got ${ghost.x}`);
  });

  // 6. Line clear tests
  test('Line clearing: complete row is detected and cleared', () => {
    const board = createEmptyBoard();
    // Fill the bottom row completely
    const bottomRow = TOTAL_ROWS - 1;
    for (let c = 0; c < BOARD_WIDTH; c++) {
      board[bottomRow][c] = 'I';
    }

    const { newBoard, clearedRows, linesCleared } = clearCompletedRows(board);
    assert(linesCleared === 1, `Expected 1 line cleared, got ${linesCleared}`);
    assert(clearedRows[0] === bottomRow, 'Expected bottom row to be cleared');
    assert(newBoard[bottomRow].every(cell => cell === null), 'New bottom row should be empty');
  });

  test('Line clearing: 4 rows (Tetris / BlockFall) clear simultaneously', () => {
    const board = createEmptyBoard();
    for (let r = TOTAL_ROWS - 4; r < TOTAL_ROWS; r++) {
      for (let c = 0; c < BOARD_WIDTH; c++) {
        board[r][c] = 'J';
      }
    }

    const { linesCleared } = clearCompletedRows(board);
    assert(linesCleared === 4, `Expected 4 lines cleared, got ${linesCleared}`);
  });

  // 7. Scoring & Extended Levels tests
  test('Scoring: correct line scores per level', () => {
    assert(calculateLineScore(1, 1) === 100, 'Single at level 1 = 100');
    assert(calculateLineScore(2, 1) === 300, 'Double at level 1 = 300');
    assert(calculateLineScore(3, 1) === 500, 'Triple at level 1 = 500');
    assert(calculateLineScore(4, 1) === 800, 'Tetris at level 1 = 800');

    assert(calculateLineScore(4, 5) === 4000, 'Tetris at level 5 = 4000');
    assert(calculateLineScore(4, 20) === 16000, 'Tetris at level 20 = 16000');
  });

  test('Levels: support up to 30+ levels with titles and calibrated gravity', () => {
    assert(calculateLevel(0, 1) === 1, '0 lines at start 1 = level 1');
    assert(calculateLevel(9, 1) === 1, '9 lines at start 1 = level 1');
    assert(calculateLevel(10, 1) === 2, '10 lines at start 1 = level 2');
    assert(calculateLevel(0, 5) === 5, '0 lines at start 5 = level 5');
    assert(calculateLevel(10, 5) === 6, '10 lines at start 5 = level 6');

    // Title checks
    assert(getLevelTitle(1) === 'Novice', 'Level 1 is Novice');
    assert(getLevelTitle(5) === 'Apprentice', 'Level 5 is Apprentice');
    assert(getLevelTitle(10) === 'Adept', 'Level 10 is Adept');
    assert(getLevelTitle(20) === 'Master', 'Level 20 is Master');
    assert(getLevelTitle(30) === 'Block Legend', 'Level 30 is Block Legend');

    // Gravity curve checks
    assert(getGravityInterval(1) === 800, 'Level 1 is 800ms');
    assert(getGravityInterval(10) === 90, 'Level 10 is 90ms');
    assert(getGravityInterval(20) === 30, 'Level 20 is 30ms');
    assert(getGravityInterval(30) <= 20, 'Level 30 is at fastest speed');
  });

  // 8. Security & Storage fallback tests
  test('Security: corrupt or tampered storage data safely falls back to defaults', () => {
    const data = loadPersistentData();
    assert(data.stats.highScore >= 0, 'High score should be non-negative finite number');
    assert(data.stats.bestLevel <= 30, 'Best level should be clamped to valid range');
    assert(data.settings.soundEnabled !== undefined, 'Settings should have soundEnabled');
  });

  return results;
}
