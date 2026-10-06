class SoundSystem {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Lazily init AudioContext on first user interaction
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, endFreq?: number, gainMultiplier = 1) {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      }

      const peakGain = 0.25 * this.volume * gainMultiplier;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // Audio playback error handled gracefully
    }
  }

  public playMove() {
    this.playTone(320, 'square', 0.03, 280, 0.4);
  }

  public playRotate() {
    this.playTone(480, 'triangle', 0.045, 620, 0.6);
  }

  public playSoftDrop() {
    this.playTone(220, 'sine', 0.02, 180, 0.3);
  }

  public playHardDrop() {
    this.playTone(160, 'triangle', 0.09, 50, 0.9);
  }

  public playHold() {
    this.playTone(350, 'sine', 0.06, 500, 0.7);
  }

  public playLock() {
    this.playTone(240, 'triangle', 0.06, 120, 0.6);
  }

  public playLineClear(isTetris: boolean) {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    if (isTetris) {
      // Four-line clear chord fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.22, freq * 1.05, 0.8);
        }, idx * 60);
      });
    } else {
      // Regular line clear chime
      this.playTone(587.33, 'triangle', 0.08, 659.25, 0.7);
      setTimeout(() => {
        this.playTone(783.99, 'triangle', 0.12, 880, 0.8);
      }, 70);
    }
  }

  public playLevelUp() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.15, freq, 0.8);
      }, idx * 70);
    });
  }

  public playGameOver() {
    const notes = [392, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.25, freq * 0.9, 0.5);
      }, idx * 110);
    });
  }

  public playButtonClick() {
    this.playTone(600, 'sine', 0.03, 400, 0.4);
  }
}

export const sound = new SoundSystem();
