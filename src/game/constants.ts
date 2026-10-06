import { TetrominoType } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const HIDDEN_ROWS = 2;
export const TOTAL_ROWS = BOARD_HEIGHT + HIDDEN_ROWS;

// Standard colors with primary, highlight, and shadow tints for arcade 3D block shading
export const PIECE_COLORS: Record<TetrominoType, {
  main: string;
  light: string;
  dark: string;
  glow: string;
}> = {
  I: {
    main: '#06B6D4', // Cyan
    light: '#67E8F9',
    dark: '#0891B2',
    glow: 'rgba(6, 182, 212, 0.4)',
  },
  O: {
    main: '#EAB308', // Amber / Yellow
    light: '#FDE047',
    dark: '#CA8A04',
    glow: 'rgba(234, 179, 8, 0.4)',
  },
  T: {
    main: '#A855F7', // Purple
    light: '#D8B4FE',
    dark: '#9333EA',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
  S: {
    main: '#22C55E', // Green
    light: '#86EFAC',
    dark: '#16A34A',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  Z: {
    main: '#EF4444', // Red
    light: '#FCA5A5',
    dark: '#DC2626',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  J: {
    main: '#3B82F6', // Blue
    light: '#93C5FD',
    dark: '#2563EB',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  L: {
    main: '#F97316', // Orange
    light: '#FDBA74',
    dark: '#EA580C',
    glow: 'rgba(249, 115, 22, 0.4)',
  },
};

// Lock delay in milliseconds (time piece can rest on ground before locking)
export const LOCK_DELAY_MS = 500;
// Maximum move/rotate resets allowed before piece is forced to lock
export const MAX_LOCK_RESETS = 15;

// Extended gravity drop intervals across 30+ levels
export function getGravityInterval(level: number): number {
  if (level <= 1) return 800;
  if (level === 2) return 716;
  if (level === 3) return 632;
  if (level === 4) return 549;
  if (level === 5) return 465;
  if (level === 6) return 382;
  if (level === 7) return 298;
  if (level === 8) return 215;
  if (level === 9) return 131;
  if (level === 10) return 90;
  if (level === 11) return 80;
  if (level === 12) return 72;
  if (level === 13) return 65;
  if (level === 14) return 58;
  if (level === 15) return 52;
  if (level === 16) return 46;
  if (level === 17) return 41;
  if (level === 18) return 37;
  if (level === 19) return 33;
  if (level === 20) return 30;
  // Extreme levels 21-30+
  return Math.max(20, Math.floor(30 - (level - 20) * 1));
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice',
  2: 'Trainee',
  3: 'Scout',
  4: 'Runner',
  5: 'Apprentice',
  6: 'Specialist',
  7: 'Craftsman',
  8: 'Tactician',
  9: 'Strategist',
  10: 'Adept',
  11: 'Veteran',
  12: 'Elite',
  13: 'Vanguard',
  14: 'Commander',
  15: 'Expert',
  16: 'Champion',
  17: 'Hero',
  18: 'Warlord',
  19: 'Conqueror',
  20: 'Master',
  21: 'High Master',
  22: 'Archon',
  23: 'Ascendant',
  24: 'Sovereign',
  25: 'Grandmaster',
  26: 'Immortal',
  27: 'Transcendent',
  28: 'Mythic',
  29: 'Demi-God',
  30: 'Block Legend',
};

export function getLevelTitle(level: number): string {
  if (level >= 30) return 'Block Legend';
  return LEVEL_TITLES[level] || `Level ${level}`;
}

// Soft drop gravity speed in ms
export const SOFT_DROP_INTERVAL = 40;

// LocalStorage persistence key
export const STORAGE_KEY = 'blockfall:v1';
