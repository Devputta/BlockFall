import React from 'react';
import { X, Keyboard, Smartphone, MousePointer } from 'lucide-react';

interface ControlsGuideModalProps {
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ onClose }) => {
  const keyboardControls = [
    { key: '← / A', action: 'Move Left' },
    { key: '→ / D', action: 'Move Right' },
    { key: '↓ / S', action: 'Soft Drop' },
    { key: '↑ / W / X', action: 'Rotate Clockwise' },
    { key: 'Z', action: 'Rotate Counter-Clockwise' },
    { key: 'Space', action: 'Hard Drop (instant)' },
    { key: 'C / Shift', action: 'Hold Piece' },
    { key: 'P / Esc', action: 'Pause / Resume' },
    { key: 'R', action: 'Restart Game' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="controls-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-300 bg-white text-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-600" />
            <h2 id="controls-guide-title" className="text-lg font-bold uppercase tracking-tight text-slate-900">
              Controls & Touch Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close controls guide"
            className="p-1 rounded-lg transition-colors text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Direct Board Tap & Mouse Gestures */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-700">
            <MousePointer className="w-3.5 h-3.5" />
            <span>Direct Board Touch & Clicks</span>
          </div>
          <div className="p-3 rounded-xl border bg-slate-50 border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between items-center py-0.5">
              <span>Tap Right Side of Board:</span>
              <span className="font-semibold text-cyan-700">Move Right</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Tap Left Side of Board:</span>
              <span className="font-semibold text-cyan-700">Move Left</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Right-Click / Tap Top:</span>
              <span className="font-semibold text-indigo-700">Rotate CW</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Swipe Down / Tap Bottom:</span>
              <span className="font-semibold text-amber-700">Drop</span>
            </div>
          </div>
        </div>

        {/* Keyboard layout */}
        <div className="mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
            Keyboard Shortcuts
          </span>
          <div className="space-y-1.5 p-3 rounded-xl border bg-slate-50 border-slate-200 text-xs">
            {keyboardControls.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1 border-b border-slate-200 last:border-none"
              >
                <span className="text-slate-700">{c.action}</span>
                <kbd className="px-2 py-0.5 rounded font-mono text-[11px] border bg-white border-slate-300 text-slate-800 shadow-xs">
                  {c.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile controls note */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <Smartphone className="w-3.5 h-3.5" />
            <span>On-Screen Touch Buttons</span>
          </div>
          <p className="text-xs p-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-600 leading-relaxed">
            Dedicated D-pad and action buttons appear below the board on mobile screens. Hold Left or Right arrows for continuous motion, or tap directly on either side of the board!
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
