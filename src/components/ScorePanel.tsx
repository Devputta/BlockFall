import React from 'react';
import { getLevelTitle } from '../game/constants';

interface ScorePanelProps {
  score: number;
  highScore: number;
  level: number;
  lines: number;
}

export const ScorePanel: React.FC<ScorePanelProps> = ({
  score,
  highScore,
  level,
  lines,
}) => {
  const levelTitle = getLevelTitle(level);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border bg-white border-slate-200 text-slate-800 shadow-sm">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          SCORE
        </div>
        <div className="text-xl sm:text-2xl font-mono font-bold tracking-tight tabular-nums text-slate-900">
          {score.toLocaleString()}
        </div>
      </div>

      <div className="pt-1 border-t border-slate-100">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
          HIGH SCORE
        </div>
        <div className="text-base sm:text-lg font-mono font-semibold tracking-tight tabular-nums text-amber-600">
          {Math.max(score, highScore).toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            LEVEL
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-mono font-bold tabular-nums text-cyan-700">
              {level}
            </span>
          </div>
          <span className="text-[10px] font-medium text-cyan-600 block truncate" title={levelTitle}>
            {levelTitle}
          </span>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            LINES
          </div>
          <div className="text-base sm:text-lg font-mono font-bold tabular-nums text-emerald-700">
            {lines}
          </div>
          <span className="text-[10px] text-slate-400 block">
            {(lines % 10)}/10 to next
          </span>
        </div>
      </div>
    </div>
  );
};
