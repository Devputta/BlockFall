import React from 'react';
import { TetrominoType } from '../game/types';
import { PiecePreview } from './PiecePreview';

interface HoldPanelProps {
  heldPiece: TetrominoType | null;
  canHold: boolean;
}

export const HoldPanel: React.FC<HoldPanelProps> = ({ heldPiece, canHold }) => {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl border bg-white border-slate-200 text-slate-800 shadow-sm">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          HOLD
        </span>
        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
          [C]
        </span>
      </div>
      <PiecePreview
        type={heldPiece}
        size={76}
        dimmed={!canHold && heldPiece !== null}
      />
      <span
        className={`mt-2 text-[10px] font-mono font-medium tracking-tight ${
          canHold ? 'text-emerald-600' : 'text-slate-400'
        }`}
      >
        {canHold ? 'READY' : 'LOCKED'}
      </span>
    </div>
  );
};
