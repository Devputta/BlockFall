import { BOARD_WIDTH, TOTAL_ROWS } from './constants';
import { TETROMINO_SHAPES } from './pieces';
import { ActivePiece, BoardGrid, RotationIndex } from './types';

export function checkCollision(
  board: BoardGrid,
  piece: ActivePiece,
  offset: { dx?: number; dy?: number; rotation?: RotationIndex } = {}
): boolean {
  const dx = offset.dx ?? 0;
  const dy = offset.dy ?? 0;
  const rotation = offset.rotation ?? piece.rotation;

  const shape = TETROMINO_SHAPES[piece.type][rotation];
  const targetX = piece.x + dx;
  const targetY = piece.y + dy;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const boardX = targetX + c;
        const boardY = targetY + r;

        // Out of horizontal bounds (left/right walls)
        if (boardX < 0 || boardX >= BOARD_WIDTH) {
          return true;
        }

        // Out of vertical bounds (below bottom floor)
        if (boardY >= TOTAL_ROWS) {
          return true;
        }

        // Check occupied cell on board (if inside visible/hidden board)
        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }

  return false;
}
