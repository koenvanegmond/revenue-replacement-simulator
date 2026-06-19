// Background audio manager for game mode with preloading and true crossfade.
// Tracks are preloaded on first interaction so subsequent screen changes start
// the new track in parallel with the old one fading out — no audible gap.

type TrackEntry = { el: HTMLAudioElement; fadeTimer: ReturnType<typeof setInterval> | null };

class AudioManager {
  private tracks: Map<string, TrackEntry> = new Map();
  private currentSrc: string | null = null;
  private targetVolume = 0.35;

  get nowPlaying(): string | null {
    const entry = this.currentSrc ? this.tracks.get(this.currentSrc) : null;
    return entry && !entry.el.paused ? this.currentSrc : null;
  }

  preload(srcs: string[]) {
    if (typeof window === 'undefined') return;
    srcs.forEach((src) => {
      if (this.tracks.has(src)) return;
      const el = new Audio(src);
      el.loop = true;
      el.preload = 'auto';
      el.volume = 0;
      this.tracks.set(src, { el, fadeTimer: null });
    });
  }

  play(src: string, { volume = 0.35, fadeMs = 400 }: { volume?: number; fadeMs?: number } = {}) {
    if (typeof window === 'undefined') return;
    this.targetVolume = volume;
    this.preload([src]);
    const incoming = this.tracks.get(src)!;

    // Fade out any other playing track in parallel (true crossfade).
    this.tracks.forEach((entry, otherSrc) => {
      if (otherSrc !== src && !entry.el.paused) this.fadeTo(entry, 0, fadeMs, true);
    });

    // Start incoming immediately at 0 and fade up.
    this.currentSrc = src;
    incoming.el.currentTime = incoming.el.currentTime || 0;
    incoming.el.volume = 0;
    incoming.el.play().catch(() => {
      // Autoplay blocked — caller retries on user gesture.
    });
    this.fadeTo(incoming, volume, fadeMs, false);
  }

  stop() {
    this.tracks.forEach((entry) => {
      if (entry.fadeTimer) clearInterval(entry.fadeTimer);
      entry.fadeTimer = null;
      entry.el.pause();
      entry.el.currentTime = 0;
      entry.el.volume = 0;
    });
    this.currentSrc = null;
  }

  // Legacy API kept for compatibility — callers can still await this, but
  // play() now handles crossfade internally so most callers don't need it.
  fadeOut(_durationMs = 400): Promise<void> {
    return Promise.resolve();
  }

  private fadeTo(entry: TrackEntry, to: number, durationMs: number, pauseAtEnd: boolean) {
    const el = entry.el;
    if (entry.fadeTimer) clearInterval(entry.fadeTimer);
    const from = el.volume;
    const steps = 12;
    const stepMs = Math.max(16, Math.floor(durationMs / steps));
    let i = 0;
    entry.fadeTimer = setInterval(() => {
      i++;
      const v = from + (to - from) * (i / steps);
      el.volume = Math.max(0, Math.min(1, v));
      if (i >= steps) {
        if (entry.fadeTimer) clearInterval(entry.fadeTimer);
        entry.fadeTimer = null;
        if (pauseAtEnd) el.pause();
      }
    }, stepMs);
  }
}

export const audioManager = new AudioManager();
