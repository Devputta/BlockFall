import React, { useRef } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronsDown,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { GameEngine } from '../game/gameEngine';

interface MobileControlsProps {
  engine: GameEngine;
  status: string;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  engine,
  status,
}) => {
  const leftRepeatRef = useRef<number | null>(null);
  const rightRepeatRef = useRef<number | null>(null);
  const dropRepeatRef = useRef<number | null>(null);

  const startLeft = (e: React.PointerEvent) => {
    e.preventDefault();
    if (engine.status !== 'PLAYING') return;
    engine.moveLeft();
    stopLeft();
    leftRepeatRef.current = window.setInterval(() => {
      engine.moveLeft();
    }, 70);
  };

  const stopLeft = () => {
    if (leftRepeatRef.current) {
      clearInterval(leftRepeatRef.current);
      leftRepeatRef.current = null;
    }
  };

  const startRight = (e: React.PointerEvent) => {
    e.preventDefault();
    if (engine.status !== 'PLAYING') return;
    engine.moveRight();
    stopRight();
    rightRepeatRef.current = window.setInterval(() => {
      engine.moveRight();
    }, 70);
  };

  const stopRight = () => {
    if (rightRepeatRef.current) {
      clearInterval(rightRepeatRef.current);
      rightRepeatRef.current = null;
    }
  };

  const startDrop = (e: React.PointerEvent) => {
    e.preventDefault();
    if (engine.status !== 'PLAYING') return;
    engine.isSoftDropping = true;
    engine.softDropStep();
    stopDrop();
    dropRepeatRef.current = window.setInterval(() => {
      engine.softDropStep();
    }, 60);
  };

  const stopDrop = () => {
    engine.isSoftDropping = false;
    if (dropRepeatRef.current) {
      clearInterval(dropRepeatRef.current);
      dropRepeatRef.current = null;
    }
  };

  const btnBg = 'bg-white border-slate-300 text-slate-800 active:bg-slate-100 shadow-xs';
  const arrowBg = 'bg-white border-slate-300 text-slate-800 active:bg-cyan-100 active:border-cyan-500 shadow-xs';

  return (
    <div className="w-full max-w-md mx-auto pt-2 pb-2 select-none touch-none">
      <div className="grid grid-cols-2 gap-3 px-2">
        {/* Left Side: Directional D-Pad & Hold */}
        <div className="flex flex-col gap-2">
          {/* Top row: Hold & Pause */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => engine.hold()}
              disabled={status !== 'PLAYING' || !engine.canHold}
              aria-label="Hold Piece"
              className={`flex-1 flex items-center justify-center gap-1.5 h-12 rounded-xl border disabled:opacity-40 text-xs font-semibold uppercase tracking-wider transition-colors ${btnBg}`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>HOLD</span>
            </button>

            <button
              type="button"
              onClick={() => engine.togglePause()}
              aria-label={status === 'PAUSED' ? 'Resume Game' : 'Pause Game'}
              className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-colors ${btnBg}`}
            >
              {status === 'PAUSED' ? (
                <Play className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              ) : (
                <Pause className="w-5 h-5 text-slate-500" />
              )}
            </button>
          </div>

          {/* D-Pad Horizontal: Left, Down, Right */}
          <div className="grid grid-cols-3 gap-1.5 h-14">
            <button
              type="button"
              onPointerDown={startLeft}
              onPointerUp={stopLeft}
              onPointerCancel={stopLeft}
              onPointerLeave={stopLeft}
              aria-label="Move Left"
              className={`flex items-center justify-center rounded-xl border transition-colors ${arrowBg}`}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onPointerDown={startDrop}
              onPointerUp={stopDrop}
              onPointerCancel={stopDrop}
              onPointerLeave={stopDrop}
              aria-label="Soft Drop"
              className={`flex items-center justify-center rounded-xl border transition-colors ${arrowBg}`}
            >
              <ArrowDown className="w-6 h-6" />
            </button>

            <button
              type="button"
              onPointerDown={startRight}
              onPointerUp={stopRight}
              onPointerCancel={stopRight}
              onPointerLeave={stopRight}
              aria-label="Move Right"
              className={`flex items-center justify-center rounded-xl border transition-colors ${arrowBg}`}
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right Side: Rotations & Hard Drop */}
        <div className="flex flex-col gap-2">
          {/* Rotation Buttons */}
          <div className="grid grid-cols-2 gap-2 h-12">
            <button
              type="button"
              onClick={() => engine.rotateCounterClockwise()}
              disabled={status !== 'PLAYING'}
              aria-label="Rotate Counter Clockwise"
              className={`flex items-center justify-center gap-1 rounded-xl border transition-colors ${btnBg}`}
            >
              <RotateCcw className="w-5 h-5 text-indigo-500" />
              <span className="text-[11px] font-medium">CCW</span>
            </button>

            <button
              type="button"
              onClick={() => engine.rotateClockwise()}
              disabled={status !== 'PLAYING'}
              aria-label="Rotate Clockwise"
              className={`flex items-center justify-center gap-1 rounded-xl border transition-colors ${btnBg}`}
            >
              <RotateCw className="w-5 h-5 text-cyan-500" />
              <span className="text-[11px] font-medium">CW</span>
            </button>
          </div>

          {/* Hard Drop Button */}
          <button
            type="button"
            onClick={() => engine.hardDrop()}
            disabled={status !== 'PLAYING'}
            aria-label="Hard Drop"
            className="flex items-center justify-center gap-2 h-14 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 active:from-cyan-500 active:to-blue-500 border border-cyan-400/50 text-white font-bold tracking-wide transition-all shadow-md shadow-cyan-900/20"
          >
            <ChevronsDown className="w-6 h-6" />
            <span className="text-sm uppercase tracking-wider">HARD DROP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
