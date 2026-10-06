import React from 'react';
import { RotateCcw, BarChart3, Trophy } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  lines: number;
  level: number;
  highScore: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onOpenStats: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  lines,
  level,
  highScore,
  isNewHighScore,
  onPlayAgain,
  onOpenStats,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-xl border border-slate-300 bg-white text-slate-800 p-6 shadow-2xl text-center">
        <h2 id="game-over-title" className="text-2xl font-bold tracking-tight text-red-600 uppercase mb-1">
          Game Over
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Better luck on the next drop!
        </p>

        {isNewHighScore && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        <div className="rounded-xl p-4 mb-6 border bg-slate-50 border-slate-200 flex flex-col gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider block mb-0.5 text-slate-500">
              FINAL SCORE
            </span>
            <span className="text-3xl font-mono font-bold tabular-nums tracking-tight text-slate-900">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider block text-slate-500">
                LINES
              </span>
              <span className="text-lg font-mono font-bold tabular-nums text-emerald-700">
                {lines}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider block text-slate-500">
                LEVEL
              </span>
              <span className="text-lg font-mono font-bold tabular-nums text-cyan-700">
                {level}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-slate-500 flex items-center justify-between text-xs">
            <span>All-time Best:</span>
            <span className="font-mono font-semibold text-amber-600 tabular-nums">
              {Math.max(score, highScore).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            type="button"
            onClick={onOpenStats}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border font-medium transition-colors text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Statistics</span>
          </button>
        </div>
      </div>
    </div>
  );
};
