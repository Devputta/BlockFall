import { STORAGE_KEY } from '../game/constants';
import { GameSettings, GameStats, TetrominoType } from '../game/types';

export interface PersistentData {
  stats: GameStats;
  settings: GameSettings;
}

const DEFAULT_PIECE_COUNTS: Record<TetrominoType, number> = {
  I: 0,
  J: 0,
  L: 0,
  O: 0,
  S: 0,
  T: 0,
  Z: 0,
};

const DEFAULT_STATS: GameStats = {
  highScore: 0,
  bestLines: 0,
  bestLevel: 1,
  gamesPlayed: 0,
  totalLines: 0,
  pieceCounts: { ...DEFAULT_PIECE_COUNTS },
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  volume: 0.6,
  ghostPieceEnabled: true,
  boardSize: 'normal',
};

// Secure integer sanitizer preventing prototype injection, negative values, and integer overflows
function sanitizeSafeInt(val: unknown, min: number = 0, max: number = 999_999_999): number {
  if (typeof val !== 'number' || !Number.isFinite(val) || Number.isNaN(val)) {
    return min;
  }
  return Math.floor(Math.max(min, Math.min(max, val)));
}

export function loadPersistentData(): PersistentData {
  if (typeof window === 'undefined') {
    return { stats: DEFAULT_STATS, settings: DEFAULT_SETTINGS };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { stats: DEFAULT_STATS, settings: DEFAULT_SETTINGS };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { stats: DEFAULT_STATS, settings: DEFAULT_SETTINGS };
    }

    // Safely extract and sanitize stats against tampered/malformed data
    const stats: GameStats = {
      highScore: sanitizeSafeInt(parsed.stats?.highScore, 0, 999_999_999),
      bestLines: sanitizeSafeInt(parsed.stats?.bestLines, 0, 999_999),
      bestLevel: sanitizeSafeInt(parsed.stats?.bestLevel, 1, 30),
      gamesPlayed: sanitizeSafeInt(parsed.stats?.gamesPlayed, 0, 999_999),
      totalLines: sanitizeSafeInt(parsed.stats?.totalLines, 0, 999_999_999),
      pieceCounts: {
        I: sanitizeSafeInt(parsed.stats?.pieceCounts?.I, 0, 999_999),
        J: sanitizeSafeInt(parsed.stats?.pieceCounts?.J, 0, 999_999),
        L: sanitizeSafeInt(parsed.stats?.pieceCounts?.L, 0, 999_999),
        O: sanitizeSafeInt(parsed.stats?.pieceCounts?.O, 0, 999_999),
        S: sanitizeSafeInt(parsed.stats?.pieceCounts?.S, 0, 999_999),
        T: sanitizeSafeInt(parsed.stats?.pieceCounts?.T, 0, 999_999),
        Z: sanitizeSafeInt(parsed.stats?.pieceCounts?.Z, 0, 999_999),
      },
    };

    // Safely extract and validate settings
    const rawVolume = typeof parsed.settings?.volume === 'number' && Number.isFinite(parsed.settings.volume)
      ? Math.max(0, Math.min(1, parsed.settings.volume))
      : 0.6;

    const settings: GameSettings = {
      soundEnabled: Boolean(parsed.settings?.soundEnabled ?? true),
      volume: rawVolume,
      ghostPieceEnabled: Boolean(parsed.settings?.ghostPieceEnabled ?? true),
      boardSize: ['compact', 'normal', 'large'].includes(parsed.settings?.boardSize)
        ? parsed.settings.boardSize
        : 'normal',
    };

    return { stats, settings };
  } catch {
    // If corrupt or tampered, fall back safely to defaults
    return { stats: DEFAULT_STATS, settings: DEFAULT_SETTINGS };
  }
}

export function savePersistentData(data: PersistentData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Gracefully handle storage quota or private browsing errors
  }
}
