import { checkCollision } from './collision';
import { getWallKicks } from './srsKicks';
import { ActivePiece, BoardGrid, RotationIndex } from './types';

export function attemptRotation(
  board: BoardGrid,
  piece: ActivePiece,
  direction: 1 | -1 // 1 = clockwise, -1 = counter-clockwise
): ActivePiece | null {
  const currentRotation = piece.rotation;
  const targetRotation = ((currentRotation + direction + 4) % 4) as RotationIndex;

  const kicks = getWallKicks(piece.type, currentRotation, targetRotation);

  for (const [dx, dy] of kicks) {
    if (!checkCollision(board, piece, { dx, dy, rotation: targetRotation })) {
      return {
        ...piece,
        rotation: targetRotation,
        x: piece.x + dx,
        y: piece.y + dy,
      };
    }
  }

  // No kick offset was valid; rotation blocked
  return null;
}
