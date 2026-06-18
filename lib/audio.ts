// Single-track background audio manager for game mode.
// Browsers block autoplay until the user interacts with the page — that's expected.

class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private currentSrc: string | null = null;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;

  get nowPlaying(): string | null {
    return this.audio && !this.audio.paused ? this.currentSrc : null;
  }

  play(src: string, { volume = 0.4, loop = true }: { volume?: number; loop?: boolean } = {}) {
    if (typeof window === 'undefined') return;
    if (this.currentSrc === src && this.audio && !this.audio.paused) return;

    this.stop();
    const el = new Audio(src);
    el.loop = loop;
    el.volume = volume;
    this.audio = el;
    this.currentSrc = src;
    el.play().catch(() => {
      // Autoplay blocked — caller should retry after a user gesture.
    });
  }

  stop() {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.currentSrc = null;
  }

  fadeOut(durationMs = 800): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audio) {
        resolve();
        return;
      }
      const el = this.audio;
      const startVolume = el.volume;
      const steps = 16;
      const stepMs = Math.max(20, Math.floor(durationMs / steps));
      let i = 0;
      if (this.fadeTimer) clearInterval(this.fadeTimer);
      this.fadeTimer = setInterval(() => {
        i++;
        const v = startVolume * (1 - i / steps);
        el.volume = Math.max(0, v);
        if (i >= steps) {
          if (this.fadeTimer) clearInterval(this.fadeTimer);
          this.fadeTimer = null;
          this.stop();
          resolve();
        }
      }, stepMs);
    });
  }
}

export const audioManager = new AudioManager();
