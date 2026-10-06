import { RotationIndex, TetrominoType } from './types';

export type KickOffset = readonly [dx: number, dy: number];

type TransitionKey = `${RotationIndex}->${RotationIndex}`;

// SRS Kick data in screen coordinates (+x is right, +y is down)
const JLSTZ_KICKS: Partial<Record<TransitionKey, readonly KickOffset[]>> = {
  '0->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1->0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1->2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3->2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3->0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

const I_KICKS: Partial<Record<TransitionKey, readonly KickOffset[]>> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

export function getWallKicks(
  type: TetrominoType,
  fromRotation: RotationIndex,
  toRotation: RotationIndex
): readonly KickOffset[] {
  if (type === 'O') {
    return [[0, 0]];
  }
  const key: TransitionKey = `${fromRotation}->${toRotation}`;
  if (type === 'I') {
    return I_KICKS[key] || [[0, 0]];
  }
  return JLSTZ_KICKS[key] || [[0, 0]];
}
