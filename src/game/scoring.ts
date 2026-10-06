export const LINE_POINTS: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export function calculateLineScore(linesCleared: number, level: number): number {
  const base = LINE_POINTS[linesCleared] || 0;
  return base * level;
}

export function calculateDropScore(cellsDropped: number, isHardDrop: boolean): number {
  return cellsDropped * (isHardDrop ? 2 : 1);
}

export function calculateLevel(totalLines: number, startingLevel: number = 1): number {
  return Math.floor(totalLines / 10) + Math.max(1, startingLevel);
}
