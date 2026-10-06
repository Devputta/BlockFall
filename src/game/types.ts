export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type RotationIndex = 0 | 1 | 2 | 3; // 0 = spawn, 1 = 90 deg CW, 2 = 180 deg, 3 = 270 deg CW

export type CellValue = TetrominoType | null;

// Board is a 2D array: board[row][col], where row 0 is the top (or hidden) and row 19 is bottom
export type BoardGrid = CellValue[][];

export interface Position {
  x: number; // column index (0 to BOARD_WIDTH - 1)
  y: number; // row index (0 to TOTAL_ROWS - 1)
}

export interface ActivePiece {
  type: TetrominoType;
  rotation: RotationIndex;
  x: number;
  y: number;
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface GameStats {
  highScore: number;
  bestLines: number;
  bestLevel: number;
  gamesPlayed: number;
  totalLines: number;
  pieceCounts: Record<TetrominoType, number>;
}

export type BoardSize = 'compact' | 'normal' | 'large';

export interface GameSettings {
  soundEnabled: boolean;
  volume: number; // 0 to 1
  ghostPieceEnabled: boolean;
  boardSize: BoardSize;
}

export interface LineClearEvent {
  rows: number[];
  count: number;
  isTetris: boolean;
  scoreGained: number;
}
