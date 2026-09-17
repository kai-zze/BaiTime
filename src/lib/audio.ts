const STORAGE_KEY_MUTED = 'baitime_app_muted';
const MUTE_EVENT_NAME = 'baitime_mute_change';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
    }
  }

  public initAudio(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
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

  private getContext(): AudioContext | null {
    return this.initAudio();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MUTED, String(muted));
      window.dispatchEvent(
        new CustomEvent(MUTE_EVENT_NAME, { detail: { isMuted: muted } })
      );
    }
  }

  public getIsMuted(): boolean {
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
    }
    return this.isMuted;
  }

  public toggleMute(): boolean {
    const next = !this.getIsMuted();
    const ctx = this.initAudio(); // Warm up audio context inside click handler
    this.setMuted(next);
    if (!next && ctx) {
      // Play a quick pleasant sample chime when unmuted so the user confirms sound is active
      this.playSignalBeep();
    }
    return next;
  }

  // 30 Seconds Remaining Warning Ping
  public play30sWarning() {
    if (this.getIsMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio context play error fallback
    }
  }

  // Next Speaker Swap Bell (Double Ding)
  public playSpeakerSwapChime() {
    if (this.getIsMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);

        gain.gain.setValueAtTime(0.25, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.4);
      });
    } catch {
      // Audio fallback
    }
  }

  // Overtime Alert Buzzer
  public playOvertimeAlarm() {
    if (this.getIsMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.4);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio fallback
    }
  }

  // Stage Signal Ping
  public playSignalBeep() {
    if (this.getIsMuted()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio fallback
    }
  }
}

export const soundFx = new SoundSynthesizer();

export function subscribeMuteChange(callback: (isMuted: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const customEv = e as CustomEvent<{ isMuted: boolean }>;
    callback(customEv.detail?.isMuted ?? soundFx.getIsMuted());
  };
  window.addEventListener(MUTE_EVENT_NAME, handler);
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_MUTED) {
      callback(e.newValue === 'true');
    }
  };
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(MUTE_EVENT_NAME, handler);
    window.removeEventListener('storage', storageHandler);
  };
}

