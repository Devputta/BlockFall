import React from 'react';
import { PIECE_COLORS } from '../game/constants';
import { TETROMINO_SHAPES } from '../game/pieces';
import { TetrominoType } from '../game/types';

interface PiecePreviewProps {
  type: TetrominoType | null;
  size?: number; // width & height of the container in px
  dimmed?: boolean;
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({
  type,
  size = 76,
  dimmed = false,
}) => {
  if (!type) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-lg border bg-slate-100/80 border-slate-200 text-slate-400"
      >
        <span className="text-xs font-mono">-</span>
      </div>
    );
  }

  const shape = TETROMINO_SHAPES[type][0];
  const colors = PIECE_COLORS[type];

  // Calculate actual bounding box to center piece
  let minR = shape.length;
  let maxR = -1;
  let minC = shape[0].length;
  let maxC = -1;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }

  const pieceRows = maxR - minR + 1;
  const pieceCols = maxC - minC + 1;

  const blockSize = Math.floor(size / 4.4);
  const totalW = pieceCols * blockSize;
  const totalH = pieceRows * blockSize;
  const offsetX = (size - totalW) / 2;
  const offsetY = (size - totalH) / 2;

  const blocks: { x: number; y: number }[] = [];
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (shape[r][c] !== 0) {
        blocks.push({
          x: offsetX + (c - minC) * blockSize,
          y: offsetY + (r - minR) * blockSize,
        });
      }
    }
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-lg border overflow-hidden bg-slate-100 border-slate-200/90 ${
        dimmed ? 'opacity-40 grayscale' : 'opacity-100'
      }`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        {blocks.map((b, idx) => (
          <g key={idx}>
            <rect
              x={b.x + 1}
              y={b.y + 1}
              width={blockSize - 2}
              height={blockSize - 2}
              rx={1.5}
              fill={colors.main}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth={1}
            />
            {/* Top highlight */}
            <line
              x1={b.x + 1}
              y1={b.y + 2}
              x2={b.x + blockSize - 2}
              y2={b.y + 2}
              stroke={colors.light}
              strokeWidth={1.5}
            />
            {/* Bottom shadow */}
            <line
              x1={b.x + 1}
              y1={b.y + blockSize - 2}
              x2={b.x + blockSize - 2}
              y2={b.y + blockSize - 2}
              stroke={colors.dark}
              strokeWidth={1.5}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
