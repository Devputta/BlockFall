import { TETROMINO_TYPES } from './pieces';
import { TetrominoType } from './types';

export class BagRandomizer {
  private queue: TetrominoType[] = [];
  private rng: () => number;

  constructor(rng: () => number = Math.random) {
    this.rng = rng;
    this.refill();
    this.refill(); // keep at least 14 pieces buffered
  }

  private refill(): void {
    const bag: TetrominoType[] = [...TETROMINO_TYPES];
    // Fisher-Yates shuffle
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    this.queue.push(...bag);
  }

  public next(): TetrominoType {
    if (this.queue.length <= 7) {
      this.refill();
    }
    return this.queue.shift()!;
  }

  public peek(count: number = 3): TetrominoType[] {
    while (this.queue.length < count + 3) {
      this.refill();
    }
    return this.queue.slice(0, count);
  }

  public reset(rng?: () => number): void {
    if (rng) {
      this.rng = rng;
    }
    this.queue = [];
    this.refill();
    this.refill();
  }
}
