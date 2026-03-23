type AudioCue =
  | 'milestone'
  | 'journal-save'
  | 'streak-confirm'
  | 'blessings-earned'
  | 'manna-solve'
  | 'manna-fail'
  | 'manna-tile-absent'
  | 'manna-tile-present'
  | 'manna-tile-correct'
  | 'manna-tile-fail-resolve'
  | 'manna-invalid'
  | 'manna-key'
  | 'checkout-tap'
  | 'subscription-success'
  | 'purchase-success'
  | 'payment-alert';

class SoundServiceClass {
  private ctx: AudioContext | null = null;
  private enabled = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume if the browser suspended the context due to autoplay policy.
    // When called from inside a user-gesture handler this resolves immediately.
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Call once on app mount. Registers one-shot listeners so the AudioContext
  // is unlocked on the very first user interaction, even if sounds haven't
  // played yet. This prevents the browser autoplay-policy console warning.
  unlockOnGesture(): void {
    const unlock = () => {
      if (!this.ctx) {
        // Pre-create and immediately suspend — avoids the warning on first play.
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      document.removeEventListener('click',      unlock, true);
      document.removeEventListener('keydown',    unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    };
    document.addEventListener('click',      unlock, { capture: true, once: true });
    document.addEventListener('keydown',    unlock, { capture: true, once: true });
    document.addEventListener('touchstart', unlock, { capture: true, once: true });
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
        case 'manna-solve':          return this.playMannaSolve();
        case 'manna-fail':           return this.playMannaFail();
        case 'manna-tile-absent':       return this.playMannaTileAbsent();
        case 'manna-tile-present':      return this.playMannaTilePresent();
        case 'manna-tile-correct':      return this.playMannaTileCorrect();
        case 'manna-tile-fail-resolve': return this.playMannaFailResolve();
        case 'manna-invalid':           return this.playMannaInvalid();
        case 'manna-key':            return this.playMannaKey();
        case 'checkout-tap':         return this.playCheckoutTap();
        case 'subscription-success': return this.playSubscriptionSuccess();
        case 'purchase-success':     return this.playPurchaseSuccess();
        case 'payment-alert':        return this.playPaymentAlert();
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
  // Ascending C→E→G (do-mi-sol) — gentle fanfare for solving today's Manna
  private playMannaSolve(): void {
    const ctx = this.getCtx();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.14, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  }

  // Per-tile reveal tones — staggered by the caller at 120 ms intervals.
  // Absent: low & muted, barely audible
  private playMannaTileAbsent(): void {
    this.playTone(220, 0.04, 0.18, 'sine');
  }
  // Present: warm mid tone — "close"
  private playMannaTilePresent(): void {
    this.playTone(349, 0.06, 0.22, 'sine');
  }
  // Correct: bright bell-like tone
  private playMannaTileCorrect(): void {
    this.playTone(523, 0.09, 0.30, 'sine');
  }

  // M-15: Failed resolve — a short quiet descending arpeggio instead of per-tile reveals.
  // Tonally congruent with losing: three notes stepping down, at half the solve volume.
  private playMannaFailResolve(): void {
    const ctx = this.getCtx();
    [392, 330, 262].forEach((freq, i) => { // G4 → E4 → C4 descending
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.06, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);
      osc.start(start);
      osc.stop(start + 0.38);
    });
  }

  // Row-shake: a quick low thud — word not valid
  private playMannaInvalid(): void {
    this.playTone(150, 0.07, 0.15, 'triangle');
  }

  // Key press: nearly silent click, just tactile feedback
  private playMannaKey(): void {
    this.playTone(1200, 0.025, 0.05, 'triangle');
  }

  // Shared helper for one-shot tones
  private playTone(freq: number, peakGain: number, duration: number, type: OscillatorType): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(peakGain, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  // §8.18.3: Very short tap click — immediate feedback on checkout button press
  private playCheckoutTap(): void {
    this.playTone(800, 0.03, 0.06, 'triangle');
  }

  // §8.18.3: Warm celebratory bell — C5→E5→G5→C6 ascending, marks becoming premium
  private playSubscriptionSuccess(): void {
    const ctx = this.getCtx();
    [523, 659, 784, 1047].forEach((freq, i) => { // C5 E5 G5 C6
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);
      osc.start(start);
      osc.stop(start + 0.8);
    });
  }

  // §8.18.3: Lighter reward chime — C5→G5, distinct from subscription sound
  private playPurchaseSuccess(): void {
    const ctx = this.getCtx();
    [[523, 0], [784, 0.18]] .forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.13, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  }

  // §8.18.3: Neutral attention-getter — two equal tones, not alarming
  private playPaymentAlert(): void {
    const ctx = this.getCtx();
    [440, 440].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.25;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  // Soft descending tone — quiet acknowledgment of a completed game
  private playMannaFail(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 330;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  }
}

export const SoundService = new SoundServiceClass();
