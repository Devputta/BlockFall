import React from 'react';
import { Eye, EyeOff, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { GameEngine } from '../game/gameEngine';
import { BoardSize } from '../game/types';
import { getLevelTitle } from '../game/constants';

interface PauseModalProps {
  engine: GameEngine;
  onResume: () => void;
  onRestart: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ghostEnabled: boolean;
  onToggleGhost: () => void;
  boardSize: BoardSize;
  onSetBoardSize: (size: BoardSize) => void;
  startLevel: number;
  onSetStartLevel: (lvl: number) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  engine,
  onResume,
  onRestart,
  soundEnabled,
  onToggleSound,
  ghostEnabled,
  onToggleGhost,
  boardSize,
  onSetBoardSize,
  startLevel,
  onSetStartLevel,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-xl border border-slate-300 bg-white text-slate-800 p-6 shadow-2xl">
        <h2
          id="pause-title"
          className="text-xl font-bold text-center tracking-tight mb-6 uppercase text-slate-900"
        >
          Game Paused
        </h2>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold transition-colors shadow-sm"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Resume Game</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border font-medium transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Game</span>
          </button>
        </div>

        {/* Board Size selection */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Board Size
            </span>
            <span className="text-xs font-mono font-medium text-cyan-600 capitalize">
              {boardSize}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
            {(['compact', 'normal', 'large'] as BoardSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onSetBoardSize(size)}
                className={`py-1.5 text-xs font-medium rounded capitalize transition-all ${
                  boardSize === size
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Starting Level selection for new games */}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Start Level
            </span>
            <span className="text-xs font-mono font-medium text-cyan-600">
              Lvl {startLevel} · {getLevelTitle(startLevel)}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
            {[1, 5, 10, 15, 20].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onSetStartLevel(lvl)}
                className={`py-1 text-xs font-mono font-medium rounded transition-all ${
                  startLevel === lvl
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onToggleSound}
            className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-sm">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span>Sound Effects</span>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">
              {soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleGhost}
            className="flex items-center justify-between w-full py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-sm">
              {ghostEnabled ? (
                <Eye className="w-4 h-4 text-cyan-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-400" />
              )}
              <span>Ghost Piece Preview</span>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">
              {ghostEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <span className="text-xs text-slate-400 font-mono">Press [P] or [Esc] to resume</span>
        </div>
      </div>
    </div>
  );
};
