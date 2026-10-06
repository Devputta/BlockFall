import React from 'react';
import { X } from 'lucide-react';
import { GameStats, TetrominoType } from '../game/types';
import { PiecePreview } from './PiecePreview';
import { TETROMINO_TYPES } from '../game/pieces';

interface StatsModalProps {
  stats: GameStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const totalPieces = Object.values(stats.pieceCounts).reduce((a, b) => a + b, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-300 bg-white text-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <h2 id="stats-title" className="text-lg font-bold uppercase tracking-tight text-slate-900">
            Statistics & Records
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close statistics"
            className="p-1 rounded-lg transition-colors text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="p-3 rounded-xl border bg-slate-50 border-slate-200">
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-slate-500">
              High Score
            </span>
            <span className="text-lg font-mono font-bold text-amber-600 tabular-nums">
              {stats.highScore.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl border bg-slate-50 border-slate-200">
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-slate-500">
              Games Played
            </span>
            <span className="text-lg font-mono font-bold text-cyan-700 tabular-nums">
              {stats.gamesPlayed.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl border bg-slate-50 border-slate-200">
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-slate-500">
              Best Lines
            </span>
            <span className="text-lg font-mono font-bold text-emerald-700 tabular-nums">
              {stats.bestLines.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl border bg-slate-50 border-slate-200">
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-slate-500">
              Total Lines Cleared
            </span>
            <span className="text-lg font-mono font-bold text-indigo-700 tabular-nums">
              {stats.totalLines.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Piece distribution */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Piece Distribution
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              Total: {totalPieces}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 p-2 rounded-xl border bg-slate-50 border-slate-200">
            {TETROMINO_TYPES.map((type: TetrominoType) => {
              const count = stats.pieceCounts[type] || 0;
              const pct = totalPieces > 0 ? Math.round((count / totalPieces) * 100) : 0;
              return (
                <div key={type} className="flex flex-col items-center">
                  <div className="scale-75 origin-center">
                    <PiecePreview type={type} size={42} />
                  </div>
                  <span className="text-[11px] font-mono font-bold mt-1 tabular-nums text-slate-800">
                    {count}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 tabular-nums">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl font-medium transition-colors border bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};
