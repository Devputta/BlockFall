import { useEffect, useRef } from 'react';
import { GameEngine } from './gameEngine';

interface ControlsProps {
  engine: GameEngine;
  enabled: boolean;
}

const DAS_DELAY_MS = 160; // Initial delay before auto-repeat begins
const ARR_INTERVAL_MS = 40; // Auto-repeat interval while holding

export function useControls({ engine, enabled }: ControlsProps) {
  const leftHoldTimer = useRef<number | null>(null);
  const leftRepeatInterval = useRef<number | null>(null);

  const rightHoldTimer = useRef<number | null>(null);
  const rightRepeatInterval = useRef<number | null>(null);

  const keysDown = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const stopLeftRepeat = () => {
      if (leftHoldTimer.current) clearTimeout(leftHoldTimer.current);
      if (leftRepeatInterval.current) clearInterval(leftRepeatInterval.current);
      leftHoldTimer.current = null;
      leftRepeatInterval.current = null;
    };

    const stopRightRepeat = () => {
      if (rightHoldTimer.current) clearTimeout(rightHoldTimer.current);
      if (rightRepeatInterval.current) clearInterval(rightRepeatInterval.current);
      rightHoldTimer.current = null;
      rightRepeatInterval.current = null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;

      // Prevent page scrolling on game controls
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Space',
          'KeyW',
          'KeyS',
          'KeyA',
          'KeyD',
          'KeyC',
          'KeyP',
          'KeyZ',
          'KeyX',
          'KeyR',
        ].includes(code)
      ) {
        e.preventDefault();
      }

      // Handle pause/restart keys even if repeated or status is paused
      if (code === 'KeyP' || code === 'Escape') {
        if (!keysDown.current.has(code)) {
          keysDown.current.add(code);
          engine.togglePause();
        }
        return;
      }

      if (code === 'KeyR') {
        if (!keysDown.current.has(code)) {
          keysDown.current.add(code);
          engine.startGame();
        }
        return;
      }

      if (engine.status !== 'PLAYING') return;

      if (keysDown.current.has(code)) {
        return; // Ignore default OS key repeats; we use DAS/ARR for silky smooth motion
      }
      keysDown.current.add(code);

      switch (code) {
        case 'ArrowLeft':
        case 'KeyA': {
          engine.moveLeft();
          stopLeftRepeat();
          leftHoldTimer.current = window.setTimeout(() => {
            leftRepeatInterval.current = window.setInterval(() => {
              if (keysDown.current.has(code)) {
                engine.moveLeft();
              }
            }, ARR_INTERVAL_MS);
          }, DAS_DELAY_MS);
          break;
        }

        case 'ArrowRight':
        case 'KeyD': {
          engine.moveRight();
          stopRightRepeat();
          rightHoldTimer.current = window.setTimeout(() => {
            rightRepeatInterval.current = window.setInterval(() => {
              if (keysDown.current.has(code)) {
                engine.moveRight();
              }
            }, ARR_INTERVAL_MS);
          }, DAS_DELAY_MS);
          break;
        }

        case 'ArrowDown':
        case 'KeyS': {
          engine.isSoftDropping = true;
          engine.softDropStep();
          break;
        }

        case 'ArrowUp':
        case 'KeyW':
        case 'KeyX': {
          engine.rotateClockwise();
          break;
        }

        case 'KeyZ': {
          engine.rotateCounterClockwise();
          break;
        }

        case 'Space': {
          engine.hardDrop();
          break;
        }

        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight': {
          engine.hold();
          break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      keysDown.current.delete(code);

      if (code === 'ArrowLeft' || code === 'KeyA') {
        stopLeftRepeat();
      }

      if (code === 'ArrowRight' || code === 'KeyD') {
        stopRightRepeat();
      }

      if (code === 'ArrowDown' || code === 'KeyS') {
        engine.isSoftDropping = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      stopLeftRepeat();
      stopRightRepeat();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, enabled]);
}
