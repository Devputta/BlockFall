import { BagRandomizer } from './bag';
import { clearCompletedRows, createEmptyBoard, getGhostPiece, mergePieceIntoBoard } from './board';
import { checkCollision } from './collision';
import {
  getGravityInterval,
  LOCK_DELAY_MS,
  MAX_LOCK_RESETS,
  SOFT_DROP_INTERVAL,
} from './constants';
import { getSpawnPosition } from './pieces';
import { attemptRotation } from './rotation';
import { calculateDropScore, calculateLevel, calculateLineScore } from './scoring';
import {
  ActivePiece,
  BoardGrid,
  GameSettings,
  GameStats,
  GameStatus,
  LineClearEvent,
  RotationIndex,
  TetrominoType,
} from './types';

export interface GameEngineEvents {
  onMove?: () => void;
  onRotate?: () => void;
  onSoftDrop?: () => void;
  onHardDrop?: () => void;
  onHold?: () => void;
  onLock?: () => void;
  onLineClear?: (event: LineClearEvent) => void;
  onLevelUp?: (level: number) => void;
  onGameOver?: (score: number) => void;
  onAnnounce?: (msg: string) => void;
  onStateChange?: () => void;
}

export class GameEngine {
  public board: BoardGrid;
  public activePiece: ActivePiece | null = null;
  public ghostPiece: ActivePiece | null = null;
  public heldPiece: TetrominoType | null = null;
  public canHold: boolean = true;
  public nextQueue: TetrominoType[] = [];
  public score: number = 0;
  public lines: number = 0;
  public level: number = 1;
  public startingLevel: number = 1;
  public status: GameStatus = 'IDLE';

  public clearingRows: number[] = []; // rows currently flashing/clearing
  public clearingTimer: number = 0;

  private bag: BagRandomizer;
  private gravityAccumulator: number = 0;
  private lockDelayAccumulator: number = 0;
  private isTouchingFloor: boolean = false;
  private lockResets: number = 0;
  public isSoftDropping: boolean = false;

  private events: GameEngineEvents;
  public stats: GameStats;
  public settings: GameSettings;

  constructor(
    initialStats: GameStats,
    initialSettings: GameSettings,
    events: GameEngineEvents = {},
    bagRng?: () => number
  ) {
    this.board = createEmptyBoard();
    this.stats = initialStats;
    this.settings = initialSettings;
    this.events = events;
    this.bag = new BagRandomizer(bagRng);
    this.nextQueue = this.bag.peek(4);
  }

  public setEvents(events: GameEngineEvents) {
    this.events = { ...this.events, ...events };
  }

  public startGame(startingLevel: number = 1) {
    this.board = createEmptyBoard();
    this.score = 0;
    this.lines = 0;
    this.startingLevel = Math.max(1, Math.min(30, startingLevel));
    this.level = this.startingLevel;
    this.heldPiece = null;
    this.canHold = true;
    this.clearingRows = [];
    this.clearingTimer = 0;
    this.gravityAccumulator = 0;
    this.lockDelayAccumulator = 0;
    this.lockResets = 0;
    this.isSoftDropping = false;

    this.bag.reset();
    this.nextQueue = this.bag.peek(4);
    this.status = 'PLAYING';

    this.events.onAnnounce?.('Game started. Good luck!');
    this.spawnNextPiece();
    this.notify();
  }

  public pauseGame() {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
      this.events.onAnnounce?.('Game paused');
      this.notify();
    }
  }

  public resumeGame() {
    if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
      this.events.onAnnounce?.('Game resumed');
      this.notify();
    }
  }

  public togglePause() {
    if (this.status === 'PLAYING') {
      this.pauseGame();
    } else if (this.status === 'PAUSED') {
      this.resumeGame();
    }
  }

  private spawnNextPiece(): boolean {
    const type = this.bag.next();
    this.nextQueue = this.bag.peek(4);
    const spawnPos = getSpawnPosition(type);

    const piece: ActivePiece = {
      type,
      rotation: 0,
      x: spawnPos.x,
      y: spawnPos.y,
    };

    // Track piece stats
    this.stats.pieceCounts[type] = (this.stats.pieceCounts[type] || 0) + 1;

    // Check collision on spawn (immediate game over)
    if (checkCollision(this.board, piece)) {
      this.activePiece = piece;
      this.updateGhostPiece();
      this.handleGameOver();
      return false;
    }

    this.activePiece = piece;
    this.canHold = true;
    this.lockResets = 0;
    this.lockDelayAccumulator = 0;
    this.isTouchingFloor = checkCollision(this.board, piece, { dy: 1 });
    this.updateGhostPiece();
    return true;
  }

  public updateGhostPiece() {
    if (!this.activePiece) {
      this.ghostPiece = null;
      return;
    }
    this.ghostPiece = getGhostPiece(this.board, this.activePiece);
  }

  public moveLeft(): boolean {
    if (this.status !== 'PLAYING' || !this.activePiece || this.clearingRows.length > 0) return false;
    if (!checkCollision(this.board, this.activePiece, { dx: -1 })) {
      this.activePiece.x -= 1;
      this.onPieceManipulated();
      this.events.onMove?.();
      this.notify();
      return true;
    }
    return false;
  }

  public moveRight(): boolean {
    if (this.status !== 'PLAYING' || !this.activePiece || this.clearingRows.length > 0) return false;
    if (!checkCollision(this.board, this.activePiece, { dx: 1 })) {
      this.activePiece.x += 1;
      this.onPieceManipulated();
      this.events.onMove?.();
      this.notify();
      return true;
    }
    return false;
  }

  public rotateClockwise(): boolean {
    if (this.status !== 'PLAYING' || !this.activePiece || this.clearingRows.length > 0) return false;
    const rotated = attemptRotation(this.board, this.activePiece, 1);
    if (rotated) {
      this.activePiece = rotated;
      this.onPieceManipulated();
      this.events.onRotate?.();
      this.notify();
      return true;
    }
    return false;
  }

  public rotateCounterClockwise(): boolean {
    if (this.status !== 'PLAYING' || !this.activePiece || this.clearingRows.length > 0) return false;
    const rotated = attemptRotation(this.board, this.activePiece, -1);
    if (rotated) {
      this.activePiece = rotated;
      this.onPieceManipulated();
      this.events.onRotate?.();
      this.notify();
      return true;
    }
    return false;
  }

  public hold(): boolean {
    if (this.status !== 'PLAYING' || !this.activePiece || !this.canHold || this.clearingRows.length > 0) {
      return false;
    }

    const currentType = this.activePiece.type;
    this.canHold = false;
    this.lockResets = 0;
    this.lockDelayAccumulator = 0;

    this.events.onHold?.();

    if (this.heldPiece === null) {
      this.heldPiece = currentType;
      this.spawnNextPiece();
    } else {
      const prevHeld = this.heldPiece;
      this.heldPiece = currentType;
      const spawnPos = getSpawnPosition(prevHeld);
      const piece: ActivePiece = {
        type: prevHeld,
        rotation: 0,
        x: spawnPos.x,
        y: spawnPos.y,
      };

      if (checkCollision(this.board, piece)) {
        this.handleGameOver();
        return false;
      }

      this.activePiece = piece;
      this.updateGhostPiece();
    }

    this.notify();
    return true;
  }

  public softDropStep(): boolean {
    if (this.status !== 'PLAYING' || !this.activePiece || this.clearingRows.length > 0) return false;

    if (!checkCollision(this.board, this.activePiece, { dy: 1 })) {
      this.activePiece.y += 1;
      this.score += calculateDropScore(1, false);
      this.updateGhostPiece();
      this.lockDelayAccumulator = 0;
      this.events.onSoftDrop?.();
      this.notify();
      return true;
    } else {
      // Reached floor
      this.isTouchingFloor = true;
      return false;
    }
  }

  public hardDrop(): boolean {
    if (this.status !== 'PLAYING' || !this.activePiece || this.clearingRows.length > 0) return false;

    let dropDistance = 0;
    while (!checkCollision(this.board, this.activePiece, { dy: dropDistance + 1 })) {
      dropDistance++;
    }

    this.activePiece.y += dropDistance;
    this.score += calculateDropScore(dropDistance, true);

    this.events.onHardDrop?.();
    this.lockPiece();
    return true;
  }

  private onPieceManipulated() {
    this.updateGhostPiece();
    const nowTouching = checkCollision(this.board, this.activePiece!, { dy: 1 });
    if (nowTouching) {
      if (this.lockResets < MAX_LOCK_RESETS) {
        this.lockDelayAccumulator = 0; // reset lock delay
        this.lockResets++;
      }
      this.isTouchingFloor = true;
    } else {
      this.isTouchingFloor = false;
      this.lockDelayAccumulator = 0;
    }
  }

  private lockPiece() {
    if (!this.activePiece) return;

    this.board = mergePieceIntoBoard(this.board, this.activePiece);
    this.activePiece = null;
    this.ghostPiece = null;
    this.events.onLock?.();

    // Check line clears
    const { newBoard, clearedRows, linesCleared } = clearCompletedRows(this.board);

    if (linesCleared > 0) {
      // Start line clear animation flash
      this.clearingRows = clearedRows;
      this.clearingTimer = 180; // ms to display flash before removing

      const gainedScore = calculateLineScore(linesCleared, this.level);
      this.score += gainedScore;
      this.lines += linesCleared;

      const newLevel = calculateLevel(this.lines, this.startingLevel);
      const isTetris = linesCleared === 4;

      const event: LineClearEvent = {
        rows: clearedRows,
        count: linesCleared,
        isTetris,
        scoreGained: gainedScore,
      };

      this.events.onLineClear?.(event);
      this.events.onAnnounce?.(
        isTetris
          ? `TETRIS! 4 lines cleared! +${gainedScore} points`
          : `${linesCleared} ${linesCleared === 1 ? 'line' : 'lines'} cleared! +${gainedScore} points`
      );

      if (newLevel > this.level) {
        this.level = newLevel;
        this.events.onLevelUp?.(newLevel);
        this.events.onAnnounce?.(`Level UP! Welcome to Level ${newLevel}!`);
      }

      // Schedule final board update after flash
      setTimeout(() => {
        this.board = newBoard;
        this.clearingRows = [];
        this.spawnNextPiece();
        this.notify();
      }, 160);
    } else {
      this.spawnNextPiece();
    }

    this.notify();
  }

  private handleGameOver() {
    this.status = 'GAME_OVER';
    this.activePiece = null;
    this.ghostPiece = null;

    // Update stats
    this.stats.gamesPlayed += 1;
    this.stats.totalLines += this.lines;
    if (this.score > this.stats.highScore) {
      this.stats.highScore = this.score;
    }
    if (this.lines > this.stats.bestLines) {
      this.stats.bestLines = this.lines;
    }
    if (this.level > this.stats.bestLevel) {
      this.stats.bestLevel = this.level;
    }

    this.events.onGameOver?.(this.score);
    this.events.onAnnounce?.(`Game over. Final score: ${this.score}. Lines: ${this.lines}.`);
    this.notify();
  }

  /**
   * Main game loop tick called via requestAnimationFrame with delta ms
   */
  public update(deltaMs: number) {
    if (this.status !== 'PLAYING' || !this.activePiece || this.clearingRows.length > 0) {
      return;
    }

    // Check if touching floor
    const isGrounded = checkCollision(this.board, this.activePiece, { dy: 1 });
    this.isTouchingFloor = isGrounded;

    if (isGrounded) {
      this.lockDelayAccumulator += deltaMs;
      if (this.lockDelayAccumulator >= LOCK_DELAY_MS) {
        this.lockPiece();
        return;
      }
    } else {
      this.lockDelayAccumulator = 0;
      // Gravity drop accumulator
      this.gravityAccumulator += deltaMs;
      const interval = this.isSoftDropping ? SOFT_DROP_INTERVAL : getGravityInterval(this.level);

      if (this.gravityAccumulator >= interval) {
        this.gravityAccumulator = 0;
        if (!checkCollision(this.board, this.activePiece, { dy: 1 })) {
          this.activePiece.y += 1;
          if (this.isSoftDropping) {
            this.score += 1;
          }
          this.notify();
        } else {
          this.isTouchingFloor = true;
        }
      }
    }
  }

  private notify() {
    this.events.onStateChange?.();
  }
}
