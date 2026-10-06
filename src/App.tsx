/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Github,
  HelpCircle,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Announcer } from './components/Announcer';
import { CanvasBoard } from './components/CanvasBoard';
import { ControlsGuideModal } from './components/ControlsGuideModal';
import { GameOverModal } from './components/GameOverModal';
import { HoldPanel } from './components/HoldPanel';
import { MobileControls } from './components/MobileControls';
import { NextQueuePanel } from './components/NextQueuePanel';
import { PauseModal } from './components/PauseModal';
import { ScorePanel } from './components/ScorePanel';
import { StatsModal } from './components/StatsModal';
import { sound } from './game/audio';
import { getLevelTitle } from './game/constants';
import { GameEngine } from './game/gameEngine';
import { BoardSize } from './game/types';
import { useControls } from './game/useControls';
import { loadPersistentData, savePersistentData } from './lib/storage';

export default function App() {
  const initialData = useMemo(() => loadPersistentData(), []);

  // Persistent settings state
  const [soundEnabled, setSoundEnabled] = useState(initialData.settings.soundEnabled);
  const [ghostEnabled, setGhostEnabled] = useState(initialData.settings.ghostPieceEnabled);
  const [boardSize, setBoardSize] = useState<BoardSize>(initialData.settings.boardSize);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startLevel, setStartLevel] = useState<number>(1);
  const [levelUpToast, setLevelUpToast] = useState<{ level: number; title: string } | null>(null);

  // Modals state
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [stateTick, setStateTick] = useState(0);

  const prevHighScoreRef = useRef(initialData.stats.highScore);

  const triggerUpdate = useCallback(() => {
    setStateTick((t) => t + 1);
  }, []);

  // Initialize engine once
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    sound.setSoundEnabled(initialData.settings.soundEnabled);
    sound.setVolume(initialData.settings.volume);

    engineRef.current = new GameEngine(
      initialData.stats,
      initialData.settings,
      {
        onMove: () => sound.playMove(),
        onRotate: () => sound.playRotate(),
        onSoftDrop: () => sound.playSoftDrop(),
        onHardDrop: () => sound.playHardDrop(),
        onHold: () => sound.playHold(),
        onLock: () => sound.playLock(),
        onLineClear: (ev) => sound.playLineClear(ev.isTetris),
        onLevelUp: (lvl) => {
          sound.playLevelUp();
          const title = getLevelTitle(lvl);
          setLevelUpToast({ level: lvl, title });
          setTimeout(() => setLevelUpToast(null), 2400);
        },
        onGameOver: () => sound.playGameOver(),
        onAnnounce: (msg) => setAnnouncement(msg),
        onStateChange: triggerUpdate,
      }
    );
  }

  const engine = engineRef.current;

  // Sync settings with storage
  useEffect(() => {
    sound.setSoundEnabled(soundEnabled);
    engine.settings.soundEnabled = soundEnabled;
    engine.settings.ghostPieceEnabled = ghostEnabled;
    engine.settings.boardSize = boardSize;

    savePersistentData({
      stats: engine.stats,
      settings: engine.settings,
    });
  }, [soundEnabled, ghostEnabled, boardSize, engine]);

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    sound.playButtonClick();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported or blocked in iframe
    }
  };

  // Save stats on game over or changes
  useEffect(() => {
    if (engine.status === 'GAME_OVER') {
      savePersistentData({
        stats: engine.stats,
        settings: engine.settings,
      });
    }
  }, [stateTick, engine]);

  // Bind keyboard controls
  useControls({
    engine,
    enabled: !isStatsOpen && !isControlsOpen,
  });

  // Game Loop using requestAnimationFrame
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const gameLoop = (currentTime: number) => {
      const delta = Math.min(100, currentTime - lastTime);
      lastTime = currentTime;

      if (engine.status === 'PLAYING') {
        engine.update(delta);
      }

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [engine]);

  const handleStartGame = () => {
    sound.playButtonClick();
    prevHighScoreRef.current = engine.stats.highScore;
    engine.startGame(startLevel);
  };

  const handleResumeGame = () => {
    sound.playButtonClick();
    engine.resumeGame();
  };

  const handleToggleSound = () => {
    sound.playButtonClick();
    setSoundEnabled((prev) => !prev);
  };

  const handleToggleGhost = () => {
    sound.playButtonClick();
    setGhostEnabled((prev) => !prev);
  };

  const cycleBoardSize = () => {
    sound.playButtonClick();
    setBoardSize((curr) => {
      if (curr === 'compact') return 'normal';
      if (curr === 'normal') return 'large';
      return 'compact';
    });
  };

  const isNewHighScore =
    engine.status === 'GAME_OVER' &&
    engine.score > prevHighScoreRef.current &&
    engine.score > 0;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-100 text-slate-900 selection:bg-cyan-500 selection:text-white">
      <Announcer message={announcement} />

      {/* Celebratory Level-Up Banner Toast */}
      {levelUpToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 border-2 border-white">
            <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200" />
            <span>LEVEL UP! LEVEL {levelUpToast.level} · {levelUpToast.title}</span>
          </div>
        </div>
      )}

      {/* Top Bar Contract: Zone 1 (Wordmark), Zone 2 (Nav links), Zone 3 (Actions) */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 border-b border-slate-200 bg-white/95 text-slate-800 sticky top-0 z-40 backdrop-blur-md shadow-xs">
        {/* Zone 1: Single text wordmark */}
        <a href="/" className="text-xl font-black tracking-tight flex items-center gap-1.5 shrink-0 text-slate-900">
          <span className="text-cyan-600">BLOCK</span>FALL
        </a>

        {/* Zone 2: Clean unboxed nav controls & Quick board sizing */}
        <nav className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-slate-600">
          {/* Board Size Toggle button */}
          <button
            type="button"
            onClick={cycleBoardSize}
            title="Toggle Board Size (Compact / Normal / Large)"
            className="px-2 py-1 rounded-md text-[11px] font-mono border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>Size:</span>
            <span className="font-bold text-cyan-700 capitalize">{boardSize}</span>
          </button>

          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>

          <button
            type="button"
            onClick={() => {
              sound.playButtonClick();
              setIsControlsOpen(true);
            }}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>

          <button
            type="button"
            onClick={() => {
              sound.playButtonClick();
              setIsStatsOpen(true);
            }}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Stats</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* GitHub Repository Link */}
          <a
            href="https://github.com/Devputta/BackFall.git"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source repository on GitHub"
            title="GitHub Repository: Devputta/BackFall"
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs flex items-center justify-center"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Play / Restart button */}
          {engine.status === 'IDLE' ? (
            <button
              type="button"
              onClick={handleStartGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>PLAY</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartGame}
              aria-label="Restart Game"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restart</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Game Arena with zero wasted space */}
      <main className="flex-1 flex flex-col items-center justify-center p-1 sm:p-3 max-w-5xl mx-auto w-full">
        <div className="w-full flex flex-col items-center">
          {/* Mobile Top Score Bar (Compact on mobile) */}
          <div className="w-full max-w-sm grid grid-cols-4 gap-1.5 mb-1.5 lg:hidden text-center rounded-xl p-2 text-xs border border-slate-200 bg-white shadow-xs">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">SCORE</span>
              <span className="font-mono font-bold tabular-nums text-slate-900">
                {engine.score}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-amber-600 block">BEST</span>
              <span className="font-mono font-bold text-amber-600 tabular-nums">
                {Math.max(engine.score, engine.stats.highScore)}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-cyan-700 block">LVL</span>
              <span className="font-mono font-bold text-cyan-700 tabular-nums">{engine.level}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-emerald-700 block">LINES</span>
              <span className="font-mono font-bold text-emerald-700 tabular-nums">{engine.lines}</span>
            </div>
          </div>

          {/* Desktop & Tablet Tri-Column Layout */}
          <div className="flex items-start justify-center gap-3 sm:gap-6 w-full">
            {/* Left Side Panel (Hold & Score on desktop) */}
            <div className="hidden lg:flex flex-col gap-3 w-44 shrink-0">
              <HoldPanel heldPiece={engine.heldPiece} canHold={engine.canHold} />
              <ScorePanel
                score={engine.score}
                highScore={engine.stats.highScore}
                level={engine.level}
                lines={engine.lines}
              />
            </div>

            {/* Center: The Game Board */}
            <div className="relative flex flex-col items-center">
              {/* Mobile Hold & Next compact strip */}
              <div className="flex items-center justify-between w-full max-w-[320px] mb-1.5 lg:hidden px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">HOLD</span>
                  <div className="scale-75 origin-left">
                    <HoldPanel heldPiece={engine.heldPiece} canHold={engine.canHold} />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="scale-75 origin-right">
                    <NextQueuePanel queue={engine.nextQueue} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">NEXT</span>
                </div>
              </div>

              {/* Direct 4-Way Tap Guidance */}
              <div className="mb-1 text-[11px] text-slate-500 text-center select-none hidden sm:block">
                <span>Tap Left/Right to steer · Tap Top to rotate · Tap Bottom to drop · Double-tap hard drop</span>
              </div>

              {/* Canvas Board Component with Celebrations & 4-Way Screen Taps */}
              <CanvasBoard
                engine={engine}
                showGhost={ghostEnabled}
                boardSize={boardSize}
              />

              {/* Start Screen Overlay with Starting Level Selector */}
              {engine.status === 'IDLE' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-5 backdrop-blur-xs rounded-xl text-center border border-slate-200 bg-white/95 text-slate-900 shadow-xl">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 text-slate-900">
                    <span className="text-cyan-600">BLOCK</span>FALL
                  </h1>
                  <p className="text-xs text-slate-600 max-w-xs mb-4 leading-relaxed">
                    Falling-block puzzle with 7-bag randomizer, 30+ levels, line clear celebrations, and 4-way screen tap controls.
                  </p>

                  {/* Starting Level Selector */}
                  <div className="w-full max-w-xs mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[11px] font-semibold uppercase text-slate-500">START LEVEL</span>
                      <span className="text-[11px] font-mono font-bold text-cyan-700">
                        Lvl {startLevel} · {getLevelTitle(startLevel)}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 5, 10, 15, 20].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setStartLevel(lvl)}
                          className={`py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                            startLevel === lvl
                              ? 'bg-cyan-600 text-white shadow-xs scale-105'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartGame}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-cyan-900/20 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>START GAME</span>
                  </button>

                  <div className="mt-4 flex flex-wrap justify-center items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>4-way screen taps or arrows</span>
                    <span>·</span>
                    <span>Space to drop</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Panel (Next Queue on desktop) */}
            <div className="hidden lg:flex flex-col gap-3 w-44 shrink-0">
              <NextQueuePanel queue={engine.nextQueue} />

              {/* Quick hotkey reminder card */}
              <div className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] space-y-1 font-mono shadow-xs">
                <div className="flex justify-between">
                  <span>Tap L / R</span>
                  <span className="text-cyan-700">Steer</span>
                </div>
                <div className="flex justify-between">
                  <span>Tap Up</span>
                  <span className="text-indigo-700">Rotate</span>
                </div>
                <div className="flex justify-between">
                  <span>Tap Down</span>
                  <span className="text-amber-700">Drop</span>
                </div>
                <div className="flex justify-between">
                  <span>Double-Tap</span>
                  <span className="text-emerald-700">Hard Drop</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <span>Keys</span>
                  <span className="text-slate-800">WASD / Arrows</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Touch Controls with zero wasted space */}
          <div className="w-full mt-1.5 lg:hidden">
            <MobileControls engine={engine} status={engine.status} />
          </div>
        </div>
      </main>

      {/* Modals */}
      {engine.status === 'PAUSED' && (
        <PauseModal
          engine={engine}
          onResume={handleResumeGame}
          onRestart={handleStartGame}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          ghostEnabled={ghostEnabled}
          onToggleGhost={handleToggleGhost}
          boardSize={boardSize}
          onSetBoardSize={(s) => setBoardSize(s)}
          startLevel={startLevel}
          onSetStartLevel={(lvl) => setStartLevel(lvl)}
        />
      )}

      {engine.status === 'GAME_OVER' && (
        <GameOverModal
          score={engine.score}
          lines={engine.lines}
          level={engine.level}
          highScore={engine.stats.highScore}
          isNewHighScore={isNewHighScore}
          onPlayAgain={handleStartGame}
          onOpenStats={() => setIsStatsOpen(true)}
        />
      )}

      {isStatsOpen && (
        <StatsModal
          stats={engine.stats}
          onClose={() => setIsStatsOpen(false)}
        />
      )}

      {isControlsOpen && (
        <ControlsGuideModal
          onClose={() => setIsControlsOpen(false)}
        />
      )}
    </div>
  );
}
