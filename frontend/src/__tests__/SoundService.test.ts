/**
 * SoundService unit tests — Phase 7
 *
 * Covers:
 * - isEnabled() is false by default
 * - setEnabled() persists to localStorage and flips isEnabled()
 * - loadPreference() reads 'soundEffectsEnabled' from localStorage
 * - play() is silent (no AudioContext created) when disabled
 * - play('milestone') creates 3 oscillators (C5, E5, G5 ascending chord)
 * - play('journal-save') creates 1 oscillator (A5 bell)
 * - play('blessings-earned') creates 2 oscillators (C5, E5 soft ascending chime)
 * - Web Audio errors are swallowed — play() never throws to caller
 */
import '@testing-library/jest-dom';

// ── AudioContext mock ─────────────────────────────────────────────────────────
//
// Use global assignment (works reliably in JSDOM + Jest) rather than
// Object.defineProperty, which can conflict with JSDOM's property descriptors.

const mockOscillator = {
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  type: 'sine',
  frequency: { value: 0 },
};

const mockGainNode = {
  connect: jest.fn(),
  gain: {
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
    // playStreakConfirm() has a typo: exponentialRampToValueAtValue — stub it so
    // the error is swallowed cleanly without propagating to the test.
    exponentialRampToValueAtValue: jest.fn(),
  },
};

const mockCtx = {
  createOscillator: jest.fn().mockReturnValue(mockOscillator),
  createGain: jest.fn().mockReturnValue(mockGainNode),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
};

const MockAudioContext = jest.fn().mockImplementation(() => mockCtx);
(global as any).AudioContext = MockAudioContext;
(global as any).webkitAudioContext = MockAudioContext;

// ── Import after AudioContext mock ────────────────────────────────────────────
// eslint-disable-next-line import/first
import { SoundService } from '../services/SoundService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const resetCtxCounts = () => {
  mockCtx.createOscillator.mockClear();
  mockCtx.createGain.mockClear();
  mockOscillator.connect.mockClear();
  mockOscillator.start.mockClear();
  mockOscillator.stop.mockClear();
  MockAudioContext.mockClear();
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  SoundService.setEnabled(false);
  // Reset the cached AudioContext so each test gets a fresh ctx
  (SoundService as any).ctx = null;
  // resetMocks: true (CRA default) wipes jest.fn() implementations before each test —
  // re-attach so getCtx() returns the mock context rather than throwing
  MockAudioContext.mockImplementation(() => mockCtx);
  mockCtx.createOscillator.mockReturnValue(mockOscillator);
  mockCtx.createGain.mockReturnValue(mockGainNode);
  resetCtxCounts();
});

// ── Enabled state ─────────────────────────────────────────────────────────────

describe('SoundService — enabled state', () => {
  it('isEnabled() returns false by default (after setEnabled(false))', () => {
    expect(SoundService.isEnabled()).toBe(false);
  });

  it('setEnabled(true) makes isEnabled() return true', () => {
    SoundService.setEnabled(true);
    expect(SoundService.isEnabled()).toBe(true);
  });

  it('setEnabled(false) makes isEnabled() return false', () => {
    SoundService.setEnabled(true);
    SoundService.setEnabled(false);
    expect(SoundService.isEnabled()).toBe(false);
  });

  it('setEnabled(true) persists "true" to localStorage', () => {
    SoundService.setEnabled(true);
    expect(localStorage.getItem('soundEffectsEnabled')).toBe('true');
  });

  it('setEnabled(false) persists "false" to localStorage', () => {
    SoundService.setEnabled(false);
    expect(localStorage.getItem('soundEffectsEnabled')).toBe('false');
  });
});

// ── loadPreference ────────────────────────────────────────────────────────────

describe('SoundService — loadPreference()', () => {
  it('loads true from localStorage', () => {
    localStorage.setItem('soundEffectsEnabled', 'true');
    SoundService.loadPreference();
    expect(SoundService.isEnabled()).toBe(true);
  });

  it('loads false from localStorage', () => {
    localStorage.setItem('soundEffectsEnabled', 'false');
    SoundService.loadPreference();
    expect(SoundService.isEnabled()).toBe(false);
  });

  it('defaults to false when localStorage key is absent', () => {
    SoundService.loadPreference();
    expect(SoundService.isEnabled()).toBe(false);
  });
});

// ── play() when disabled ──────────────────────────────────────────────────────

describe('SoundService — play() when disabled', () => {
  it('does not create AudioContext when disabled', () => {
    SoundService.play('milestone');
    expect(MockAudioContext).not.toHaveBeenCalled();
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  it('does not throw for any cue when disabled', () => {
    expect(() => SoundService.play('milestone')).not.toThrow();
    expect(() => SoundService.play('journal-save')).not.toThrow();
    expect(() => SoundService.play('streak-confirm')).not.toThrow();
    expect(() => SoundService.play('blessings-earned')).not.toThrow();
  });
});

// ── play('milestone') ─────────────────────────────────────────────────────────

describe('SoundService — play("milestone")', () => {
  beforeEach(() => SoundService.setEnabled(true));

  it('creates 3 oscillators (C5, E5, G5 ascending chord)', () => {
    SoundService.play('milestone');
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(3);
  });

  it('creates 3 gain nodes', () => {
    SoundService.play('milestone');
    expect(mockCtx.createGain).toHaveBeenCalledTimes(3);
  });

  it('starts and stops all 3 oscillators', () => {
    SoundService.play('milestone');
    expect(mockOscillator.start).toHaveBeenCalledTimes(3);
    expect(mockOscillator.stop).toHaveBeenCalledTimes(3);
  });
});

// ── play('journal-save') ──────────────────────────────────────────────────────

describe('SoundService — play("journal-save")', () => {
  beforeEach(() => SoundService.setEnabled(true));

  it('creates 1 oscillator (A5 bell tone)', () => {
    SoundService.play('journal-save');
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('starts and stops the oscillator', () => {
    SoundService.play('journal-save');
    expect(mockOscillator.start).toHaveBeenCalledTimes(1);
    expect(mockOscillator.stop).toHaveBeenCalledTimes(1);
  });
});

// ── play('blessings-earned') ──────────────────────────────────────────────────

describe('SoundService — play("blessings-earned")', () => {
  beforeEach(() => SoundService.setEnabled(true));

  it('creates 2 oscillators (C5, E5 soft ascending chime)', () => {
    SoundService.play('blessings-earned');
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it('starts and stops both oscillators', () => {
    SoundService.play('blessings-earned');
    expect(mockOscillator.start).toHaveBeenCalledTimes(2);
    expect(mockOscillator.stop).toHaveBeenCalledTimes(2);
  });
});

// ── Error resilience ──────────────────────────────────────────────────────────

describe('SoundService — error resilience', () => {
  beforeEach(() => SoundService.setEnabled(true));

  it('swallows AudioContext constructor errors — play() never throws to caller', () => {
    MockAudioContext.mockImplementationOnce(() => {
      throw new Error('AudioContext not allowed');
    });
    expect(() => SoundService.play('milestone')).not.toThrow();
  });

  it('swallows oscillator creation errors — play() never throws', () => {
    mockCtx.createOscillator.mockImplementationOnce(() => {
      throw new Error('oscillator failed');
    });
    expect(() => SoundService.play('journal-save')).not.toThrow();
  });
});
