import React, { useEffect, useRef, useState } from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH, HIDDEN_ROWS, PIECE_COLORS, TOTAL_ROWS } from '../game/constants';
import { TETROMINO_SHAPES } from '../game/pieces';
import { GameEngine } from '../game/gameEngine';
import { BoardSize, TetrominoType } from '../game/types';

interface CanvasBoardProps {
  engine: GameEngine;
  showGhost: boolean;
  boardSize: BoardSize;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  shape: 'rect' | 'circle' | 'star';
  rotation: number;
  rotationSpeed: number;
}

interface FloatingCelebration {
  text: string;
  subtext: string;
  y: number;
  targetY: number;
  alpha: number;
  color: string;
  isTetris: boolean;
  life: number;
}

const CONFETTI_COLORS = [
  '#06B6D4', // Cyan
  '#EAB308', // Amber
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#3B82F6', // Blue
  '#F43F5E', // Rose
];

export const CanvasBoard: React.FC<CanvasBoardProps> = ({
  engine,
  showGhost,
  boardSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Particle and celebration references
  const particlesRef = useRef<Particle[]>([]);
  const celebrationsRef = useRef<FloatingCelebration[]>([]);
  const screenShakeRef = useRef<{ intensity: number; decay: number }>({ intensity: 0, decay: 0.9 });
  const prevClearingRowsRef = useRef<number[]>([]);

  // Touch & tap tracking
  const lastTapTimeRef = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const [activeZone, setActiveZone] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  // Spawn celebration particles whenever line clears occur
  const triggerCelebration = (clearedRows: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / BOARD_WIDTH;
    const count = clearedRows.length;
    const isTetris = count === 4;

    // 1. Screen shake
    screenShakeRef.current.intensity = isTetris ? 7 : Math.min(5, count * 1.8);

    // 2. Spawn confetti burst across cleared rows
    const particles: Particle[] = [];
    clearedRows.forEach((rowIdx) => {
      const visibleRow = rowIdx - HIDDEN_ROWS;
      const centerY = (visibleRow + 0.5) * cellSize;

      const particleCount = isTetris ? 18 : 10;
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const centerX = (col + 0.5) * cellSize;

        for (let i = 0; i < particleCount / 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5 + 2;
          const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
          const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'circle', 'star'];

          particles.push({
            x: centerX + (Math.random() - 0.5) * cellSize,
            y: centerY + (Math.random() - 0.5) * cellSize,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (Math.random() * 2 + 1.5), // upward burst
            color,
            size: Math.random() * 4 + 3,
            alpha: 1.0,
            decay: Math.random() * 0.015 + 0.012,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            rotation: Math.random() * Math.PI,
            rotationSpeed: (Math.random() - 0.5) * 0.25,
          });
        }
      }
    });

    particlesRef.current.push(...particles);

    // 3. Floating celebratory text banner
    let title = '+100 SINGLE!';
    let color = '#059669'; // Emerald
    if (count === 2) {
      title = '+300 DOUBLE!';
      color = '#0284C7'; // Sky
    } else if (count === 3) {
      title = '+500 TRIPLE!';
      color = '#7C3AED'; // Purple
    } else if (count === 4) {
      title = '★ +800 TETRIS! ★';
      color = '#D97706'; // Golden Amber
    }

    const midRow = clearedRows.length > 0 ? (clearedRows[0] - HIDDEN_ROWS + 0.5) * cellSize : height * 0.5;
    celebrationsRef.current.push({
      text: title,
      subtext: isTetris ? 'MEGA LINE CLEAR' : `${count} ROWS CLEARED`,
      y: Math.max(80, Math.min(height - 80, midRow)),
      targetY: Math.max(50, midRow - 45),
      alpha: 1.0,
      color,
      isTetris,
      life: 1.0,
    });
  };

  // Watch for clearing rows changes from engine
  useEffect(() => {
    if (
      engine.clearingRows.length > 0 &&
      engine.clearingRows.length !== prevClearingRowsRef.current.length
    ) {
      triggerCelebration(engine.clearingRows);
    }
    prevClearingRowsRef.current = [...engine.clearingRows];
  }, [engine.clearingRows]);

  // Main high-performance render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cellSize = width / BOARD_WIDTH;

      // Calculate screen shake offset
      let shakeX = 0;
      let shakeY = 0;
      if (screenShakeRef.current.intensity > 0.1) {
        shakeX = (Math.random() - 0.5) * screenShakeRef.current.intensity * 2;
        shakeY = (Math.random() - 0.5) * screenShakeRef.current.intensity * 2;
        screenShakeRef.current.intensity *= screenShakeRef.current.decay;
      } else {
        screenShakeRef.current.intensity = 0;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Clear entire board canvas with crisp light surface
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(-10, -10, width + 20, height + 20);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
      ctx.lineWidth = 1;

      for (let c = 1; c < BOARD_WIDTH; c++) {
        const x = Math.floor(c * cellSize);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let r = 1; r < BOARD_HEIGHT; r++) {
        const y = Math.floor(r * cellSize);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Helper function to draw an arcade 3D shaded block
      const drawBlock = (col: number, visibleRow: number, type: TetrominoType, alpha = 1.0) => {
        const x = col * cellSize;
        const y = visibleRow * cellSize;
        const pad = Math.max(1, Math.floor(cellSize * 0.04));
        const bSize = cellSize - pad * 2;
        const colors = PIECE_COLORS[type];

        ctx.save();
        ctx.globalAlpha = alpha;

        // Base color
        ctx.fillStyle = colors.main;
        ctx.fillRect(x + pad, y + pad, bSize, bSize);

        // Highlight bevel (top & left)
        const bevel = Math.max(2, Math.floor(cellSize * 0.12));
        ctx.fillStyle = colors.light;
        ctx.beginPath();
        ctx.moveTo(x + pad, y + pad);
        ctx.lineTo(x + pad + bSize, y + pad);
        ctx.lineTo(x + pad + bSize - bevel, y + pad + bevel);
        ctx.lineTo(x + pad + bevel, y + pad + bevel);
        ctx.lineTo(x + pad + bevel, y + pad + bSize - bevel);
        ctx.lineTo(x + pad, y + pad + bSize);
        ctx.closePath();
        ctx.fill();

        // Shadow bevel (bottom & right)
        ctx.fillStyle = colors.dark;
        ctx.beginPath();
        ctx.moveTo(x + pad + bSize, y + pad);
        ctx.lineTo(x + pad + bSize, y + pad + bSize);
        ctx.lineTo(x + pad, y + pad + bSize);
        ctx.lineTo(x + pad + bevel, y + pad + bSize - bevel);
        ctx.lineTo(x + pad + bSize - bevel, y + pad + bSize - bevel);
        ctx.lineTo(x + pad + bSize - bevel, y + pad + bevel);
        ctx.closePath();
        ctx.fill();

        // Center jewel accent
        ctx.fillStyle = colors.main;
        ctx.fillRect(x + pad + bevel, y + pad + bevel, bSize - bevel * 2, bSize - bevel * 2);

        // Clean dark border for crisp contrast
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + pad + 0.5, y + pad + 0.5, bSize - 1, bSize - 1);

        ctx.restore();
      };

      // Draw locked board blocks
      for (let r = HIDDEN_ROWS; r < TOTAL_ROWS; r++) {
        const visibleRow = r - HIDDEN_ROWS;
        const isClearingRow = engine.clearingRows.includes(r);

        for (let c = 0; c < BOARD_WIDTH; c++) {
          const cell = engine.board[r][c];
          if (cell !== null) {
            if (isClearingRow) {
              // Glowing celebration flash on clearing line
              const x = c * cellSize;
              const y = visibleRow * cellSize;
              ctx.fillStyle = '#38BDF8';
              ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 2;
              ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
            } else {
              drawBlock(c, visibleRow, cell);
            }
          }
        }
      }

      // Draw ghost piece (preview landing position)
      if (showGhost && engine.ghostPiece && engine.activePiece && engine.status === 'PLAYING') {
        const ghost = engine.ghostPiece;
        const shape = TETROMINO_SHAPES[ghost.type][ghost.rotation];

        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 0) {
              const boardY = ghost.y + r;
              const boardX = ghost.x + c;
              if (boardY >= HIDDEN_ROWS && boardY < TOTAL_ROWS && boardX >= 0 && boardX < BOARD_WIDTH) {
                const visibleRow = boardY - HIDDEN_ROWS;
                const x = boardX * cellSize;
                const y = visibleRow * cellSize;
                const colors = PIECE_COLORS[ghost.type];

                ctx.save();
                ctx.strokeStyle = colors.dark;
                ctx.lineWidth = 1.5;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
                ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
                ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
                ctx.restore();
              }
            }
          }
        }
      }

      // Draw active piece
      if (engine.activePiece && engine.status === 'PLAYING') {
        const active = engine.activePiece;
        const shape = TETROMINO_SHAPES[active.type][active.rotation];

        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 0) {
              const boardY = active.y + r;
              const boardX = active.x + c;
              if (boardY >= HIDDEN_ROWS && boardY < TOTAL_ROWS && boardX >= 0 && boardX < BOARD_WIDTH) {
                const visibleRow = boardY - HIDDEN_ROWS;
                drawBlock(boardX, visibleRow, active.type);
              }
            }
          }
        }
      }

      // Update and render celebration particles
      const activeParticles: Particle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.vx *= 0.98; // air resistance
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;

        if (p.alpha > 0.05 && p.y < height + 20) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          } else if (p.shape === 'star') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          activeParticles.push(p);
        }
      }
      particlesRef.current = activeParticles;

      // Update and render floating celebratory text popups
      const activeCelebrations: FloatingCelebration[] = [];
      for (const c of celebrationsRef.current) {
        c.y += (c.targetY - c.y) * 0.1;
        c.life -= 0.016;
        c.alpha = Math.min(1.0, c.life * 1.5);

        if (c.life > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, c.alpha);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Background blur pill badge
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = 10;
          const bannerWidth = c.isTetris ? 230 : 190;
          const bannerHeight = 36;
          ctx.beginPath();
          ctx.roundRect(width / 2 - bannerWidth / 2, c.y - bannerHeight / 2, bannerWidth, bannerHeight, 18);
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.font = c.isTetris ? 'bold 16px monospace' : 'bold 14px monospace';
          ctx.fillStyle = c.color;
          ctx.fillText(c.text, width / 2, c.y);

          ctx.restore();
          activeCelebrations.push(c);
        }
      }
      celebrationsRef.current = activeCelebrations;

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine, showGhost]);

  // Handle 4-way screen taps: Left, Right, Up (Rotate), Down (Soft Drop)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (engine.status !== 'PLAYING') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const now = performance.now();

    touchStartPos.current = { x, y, time: now };

    // Check for double-tap anywhere on board -> Hard drop
    if (now - lastTapTimeRef.current < 280) {
      engine.hardDrop();
      lastTapTimeRef.current = 0;
      setActiveZone('down');
      setTimeout(() => setActiveZone(null), 150);
      return;
    }
    lastTapTimeRef.current = now;

    // Primary click / tap behavior across 4 screen directions
    if (e.button === 0) {
      const relX = x / rect.width;
      const relY = y / rect.height;

      // 1. Left tap (left 35% of board)
      if (relX < 0.35) {
        engine.moveLeft();
        setActiveZone('left');
      }
      // 2. Right tap (right 35% of board)
      else if (relX > 0.65) {
        engine.moveRight();
        setActiveZone('right');
      }
      // 3. Up tap (top 45% of center area) -> Rotate clockwise
      else if (relY < 0.45) {
        engine.rotateClockwise();
        setActiveZone('up');
      }
      // 4. Down tap (bottom 55% of center area) -> Soft drop
      else {
        engine.softDropStep();
        setActiveZone('down');
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setActiveZone(null);
    if (!touchStartPos.current || engine.status !== 'PLAYING') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const dx = endX - touchStartPos.current.x;
    const dy = endY - touchStartPos.current.y;
    const dt = performance.now() - touchStartPos.current.time;

    // Detect fast downward swipe for hard drop
    if (dy > 60 && Math.abs(dx) < 45 && dt < 320) {
      engine.hardDrop();
    }
    touchStartPos.current = null;
  };

  // Right-click on board -> Rotate clockwise (and prevent context menu)
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (engine.status === 'PLAYING') {
      engine.rotateClockwise();
      setActiveZone('up');
      setTimeout(() => setActiveZone(null), 150);
    }
  };

  // Responsive board max-width based on selected size
  const sizeClasses = {
    compact: 'max-w-[240px] sm:max-w-[270px]',
    normal: 'max-w-[300px] sm:max-w-[340px]',
    large: 'max-w-[360px] sm:max-w-[440px]',
  }[boardSize];

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      className={`relative mx-auto rounded-xl overflow-hidden border-2 border-slate-300 bg-white shadow-xl shadow-slate-200/80 transition-all select-none touch-none cursor-pointer max-h-[50vh] sm:max-h-none flex items-center justify-center ${sizeClasses}`}
      title="Tap Left: Move Left · Tap Right: Move Right · Tap Up: Rotate · Tap Down: Drop · Double-Tap: Hard Drop"
    >
      <canvas
        ref={canvasRef}
        width={300}
        height={600}
        className="block aspect-[1/2] w-full max-h-[50vh] sm:max-h-none h-auto object-contain touch-none select-none"
        aria-label="BlockFall 10 by 20 game board. Tap Left to move left, Tap Right to move right, Tap Up to rotate, Tap Down to drop, Double-tap to hard drop."
        role="img"
      />

      {/* 4-Way Directional Touch Feedback Zones */}
      {activeZone === 'left' && (
        <div className="absolute inset-y-0 left-0 w-[35%] bg-cyan-500/15 pointer-events-none transition-opacity" />
      )}
      {activeZone === 'right' && (
        <div className="absolute inset-y-0 right-0 w-[35%] bg-cyan-500/15 pointer-events-none transition-opacity" />
      )}
      {activeZone === 'up' && (
        <div className="absolute inset-x-0 top-0 h-[45%] bg-indigo-500/15 pointer-events-none transition-opacity" />
      )}
      {activeZone === 'down' && (
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-amber-500/15 pointer-events-none transition-opacity" />
      )}
    </div>
  );
};
