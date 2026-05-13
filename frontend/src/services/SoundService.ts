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
  | 'payment-alert'
  | 'rosary-bead'
  | 'rosary-complete'
  | 'verse-favorite'
  | 'tutorial-next'
  | 'tutorial-done'
  | 'quiz-correct'
  | 'quiz-wrong'
  | 'card-flip'
  | 'plan-advance'
  | 'onboarding-appear'
  | 'word-tap';

class SoundServiceClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled = false;
  private volume = 1.0;

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

  // All oscillator chains route through this instead of directly to ctx.destination,
  // so setVolume() can adjust the whole mix without touching individual gain nodes.
  private getMasterGain(): GainNode {
    const ctx = this.getCtx();
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  // Call once on app mount. Registers one-shot listeners so the AudioContext
  // is unlocked on the very first user interaction, even if sounds haven't
  // played yet. This prevents the browser autoplay-policy console warning.
  unlockOnGesture(): void {
    const unlock = () => {
      if (!this.ctx) {
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

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    localStorage.setItem('soundVolume', String(this.volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  loadVolume(): void {
    const stored = parseFloat(localStorage.getItem('soundVolume') ?? '');
    if (!isNaN(stored)) {
      this.volume = Math.max(0, Math.min(1, stored));
    }
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
        case 'rosary-bead':          return this.playRosaryBead();
        case 'rosary-complete':      return this.playRosaryComplete();
        case 'verse-favorite':       return this.playVerseFavorite();
        case 'tutorial-next':        return this.playTutorialNext();
        case 'tutorial-done':        return this.playTutorialDone();
        case 'quiz-correct':         return this.playQuizCorrect();
        case 'quiz-wrong':           return this.playQuizWrong();
        case 'card-flip':            return this.playCardFlip();
        case 'plan-advance':         return this.playPlanAdvance();
        case 'onboarding-appear':    return this.playOnboardingAppear();
        case 'word-tap':             return this.playWordTap();
      }
    } catch {
      // Web Audio failures are non-critical — never surface to user
    }
  }

  // Three ascending notes — a brief, gentle chord of gratitude
  private playMilestone(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
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
    gain.connect(this.getMasterGain());
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
    const dest = this.getMasterGain();
    ([[440, 0], [554.37, 0.15]] as [number, number][]).forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
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

  // G5→C6 triangle tones — a higher, lighter tinkle; clearly smaller than milestone's sine chord
  private playBlessingsEarned(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    ([[784, 0], [1047, 0.1]] as [number, number][]).forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.06, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  // Ascending C→E→G (do-mi-sol) — gentle fanfare for solving today's Manna
  private playMannaSolve(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
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

  // Three descending notes — A4→E4→A3, somber and final, clearly heavier than tile-fail-resolve
  private playMannaFail(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    [440, 330, 220].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  }

  // Per-tile reveal tones — staggered by the caller at 120 ms intervals.
  // Absent: low & muted, barely audible
  private playMannaTileAbsent(): void {
    this.playTone(220, 0.04, 0.18, 'sine');
  }

  // Present: sine + triangle overtone — "close" feel with slight warmth
  private playMannaTilePresent(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.connect(g1); g1.connect(dest);
    osc1.type = 'sine';
    osc1.frequency.value = 349;
    g1.gain.setValueAtTime(0, ctx.currentTime);
    g1.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.22);
    // Warm overtone at the octave
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.connect(g2); g2.connect(dest);
    osc2.type = 'triangle';
    osc2.frequency.value = 698;
    g2.gain.setValueAtTime(0, ctx.currentTime);
    g2.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.14);
  }

  // Correct: bell tone — sine at C5 + sine octave shimmer at C6
  private playMannaTileCorrect(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.connect(g1); g1.connect(dest);
    osc1.type = 'sine';
    osc1.frequency.value = 523;
    g1.gain.setValueAtTime(0, ctx.currentTime);
    g1.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 0.02);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.35);
    // Octave shimmer
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.connect(g2); g2.connect(dest);
    osc2.type = 'sine';
    osc2.frequency.value = 1046;
    g2.gain.setValueAtTime(0, ctx.currentTime);
    g2.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.015);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.18);
  }

  // M-15: Failed resolve — a short quiet descending arpeggio instead of per-tile reveals.
  // Tonally congruent with losing: three notes stepping down, at half the solve volume.
  private playMannaFailResolve(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    [392, 330, 262].forEach((freq, i) => { // G4 → E4 → C4 descending
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
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

  // Shared helper for one-shot tones. attackTime defaults to 20ms; use a shorter
  // value (e.g. 0.005) for click-like sounds where the peak must arrive instantly.
  private playTone(freq: number, peakGain: number, duration: number, type: OscillatorType, attackTime = 0.02): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.getMasterGain());
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(peakGain, ctx.currentTime + attackTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  // Very short tap click — immediate feedback on checkout button press
  private playCheckoutTap(): void {
    this.playTone(800, 0.03, 0.06, 'triangle');
  }

  // Warm celebratory bell — C5→E5→G5→C6 ascending, marks becoming premium
  private playSubscriptionSuccess(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    [523, 659, 784, 1047].forEach((freq, i) => { // C5 E5 G5 C6
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
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

  // Lighter reward chime — C5→G5, distinct from subscription sound
  private playPurchaseSuccess(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    [[523, 0], [784, 0.18]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
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

  // Neutral attention-getter — two equal tones, not alarming
  private playPaymentAlert(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    [440, 440].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
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

  // Sharp transient with near-instant decay — feels like an actual wooden bead click
  private playRosaryBead(): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this.getMasterGain());
    osc.type = 'triangle';
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.07);
  }

  // Gentle ascending triad — quiet completion of the full Rosary
  private playRosaryComplete(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    [392, 523, 659].forEach((freq, i) => { // G4 C5 E5
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.2;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.10, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7);
      osc.start(start);
      osc.stop(start + 0.7);
    });
  }

  // Single forward chirp — light step-advance through a tutorial
  private playTutorialNext(): void {
    this.playTone(698, 0.05, 0.15, 'triangle');
  }

  // Two-note ascending resolution — tutorial fully completed
  private playTutorialDone(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    ([[440, 0], [523, 0.12]] as [number, number][]).forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  // E5→G5 triangle chime — bright but gentle, confirms a correct answer
  private playQuizCorrect(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    ([[659, 0], [784, 0.12]] as [number, number][]).forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      osc.start(start);
      osc.stop(start + 0.22);
    });
  }

  // Single low soft tone — acknowledges a wrong answer without being harsh
  private playQuizWrong(): void {
    this.playTone(311, 0.05, 0.45, 'sine');
  }

  // Quick whisper swish — card or step revealed
  private playCardFlip(): void {
    this.playTone(720, 0.022, 0.07, 'triangle', 0.005);
  }

  // Gentle read-completion chime — A4 sine with soft octave shimmer
  private playPlanAdvance(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.connect(g1); g1.connect(dest);
    osc1.type = 'sine';
    osc1.frequency.value = 440;
    g1.gain.setValueAtTime(0, ctx.currentTime);
    g1.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.03);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.55);
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.connect(g2); g2.connect(dest);
    osc2.type = 'sine';
    osc2.frequency.value = 880;
    g2.gain.setValueAtTime(0, ctx.currentTime);
    g2.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.28);
  }

  // Soft C major triad sounding simultaneously — warm welcoming chord on first launch
  private playOnboardingAppear(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    [523, 659, 784].forEach(freq => { // C5 E5 G5 — all at once, not staggered
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.4);
    });
  }

  // Barely-there micro-click — tapping a highlighted study word
  private playWordTap(): void {
    this.playTone(650, 0.018, 0.06, 'triangle', 0.005);
  }

  // G4→C5 triangle tones — warm ascending fourth, intimate and personal
  private playVerseFavorite(): void {
    const ctx = this.getCtx();
    const dest = this.getMasterGain();
    ([[392, 0], [523, 0.14]] as [number, number][]).forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(dest);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.07, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }
}

export const SoundService = new SoundServiceClass();
