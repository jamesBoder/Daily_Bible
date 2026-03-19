type AudioCue = 'milestone' | 'journal-save' | 'streak-confirm' | 'blessings-earned';

class SoundServiceClass {
  private ctx: AudioContext | null = null;
  private enabled = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('soundEffectsEnabled', String(enabled));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  loadPreference(): void {
    this.enabled = localStorage.getItem('soundEffectsEnabled') === 'true';
  }

  play(cue: AudioCue): void {
    if (!this.enabled) return;
    try {
      switch (cue) {
        case 'milestone':       return this.playMilestone();
        case 'journal-save':    return this.playJournalSave();
        case 'streak-confirm':  return this.playStreakConfirm();
        case 'blessings-earned': return this.playBlessingsEarned();
      }
    } catch {
      // Web Audio failures are non-critical — never surface to user
    }
  }

  // Three ascending notes — a brief, gentle chord of gratitude
  private playMilestone(): void {
    const ctx = this.getCtx();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  }

  // A single soft bell tone — quiet confirmation of a saved thought
  private playJournalSave(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880; // A5
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.10, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  }

  // Two notes — a gentle upward step, marking continuity
  private playStreakConfirm(): void {
    const ctx = this.getCtx();
    ([[440, 0], [554.37, 0.15]] as [number, number][]).forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  }

  // Two soft ascending notes — gentler than milestone, like a quiet chime
  private playBlessingsEarned(): void {
    const ctx = this.getCtx();
    ([[523.25, 0], [659.25, 0.1]] as [number, number][]).forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  }
}

export const SoundService = new SoundServiceClass();
