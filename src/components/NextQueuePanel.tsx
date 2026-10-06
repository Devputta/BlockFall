import React from 'react';
import { TetrominoType } from '../game/types';
import { PiecePreview } from './PiecePreview';

interface NextQueuePanelProps {
  queue: TetrominoType[];
}

export const NextQueuePanel: React.FC<NextQueuePanelProps> = ({ queue }) => {
  const displayPieces = queue.slice(0, 3);

  return (
    <div className="flex flex-col items-center p-3 rounded-xl border bg-white border-slate-200 text-slate-800 shadow-sm">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          NEXT
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          QUEUE
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {displayPieces.map((type, idx) => (
          <PiecePreview
            key={idx}
            type={type}
            size={idx === 0 ? 76 : 60}
          />
        ))}
      </div>
    </div>
  );
};
