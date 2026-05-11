/**
 * MilestoneCelebrationModal — Phase 7 tests
 *
 * Phase 7 added:
 *  1. celebrationAnimEnabled localStorage gate — particles only render when the
 *     key is absent or set to anything other than 'false'.
 *  2. SoundService.play('milestone') fires at animation step 3 (emotional peak).
 *  3. SoundService.play('milestone') also fires immediately when
 *     prefersReducedMotion is true (skips to step 5 instantly).
 *
 * Covers:
 * - Modal does not render when there is no pending milestone
 * - Modal renders the milestone name and blessings amount when pending
 * - Particles render by default (celebrationAnimEnabled absent from localStorage)
 * - Particles are hidden when celebrationAnimEnabled='false'
 * - Particles render when celebrationAnimEnabled='true'
 * - Sound fires at step 3 (after ~1800ms with fake timers)
 * - Sound fires immediately when prefersReducedMotion is true
 * - Sound does NOT fire when modal is not shown
 * - Clicking Continue calls dismissMilestone
 * - ESC key calls dismissMilestone
 */
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── matchMedia mock ───────────────────────────────────────────────────────────

// JSDOM does not implement window.matchMedia. We provide a controllable mock.
let mockPrefersReducedMotion = false;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce') && mockPrefersReducedMotion,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

// Use jest.fn() inline — never reference outer const/let inside a hoisted factory.
jest.mock('../services/SoundService', () => ({
  SoundService: {
    play: jest.fn(),
    setEnabled: jest.fn(),
    isEnabled: jest.fn(),
    loadPreference: jest.fn(),
  },
}));

// useStreak is mocked as jest.fn() so withMilestone/withNoMilestone helpers can
// swap its return value without using spyOn (which interacts badly with clearAllMocks).
jest.mock('../contexts/StreakContext', () => ({
  useStreak: jest.fn(),
  StreakProvider: ({ children }: any) => children,
}));

// ── Imports after mocks ───────────────────────────────────────────────────────
import MilestoneCelebrationModal from '../features/streak/MilestoneCelebrationModal';
import { SoundService } from '../services/SoundService';
import { useStreak } from '../contexts/StreakContext';

// Typed references to the inline jest.fn() stubs created in the factories above.
const mockPlay = SoundService.play as jest.Mock;
const mockDismissMilestone = jest.fn();

// ── Helpers ───────────────────────────────────────────────────────────────────

const MILESTONE = {
  key: 'week_in_word',
  name: 'Week in the Word',
  blessings_awarded: 50,
};

/** Injects a pending milestone into the StreakContext mock */
const withMilestone = (milestone = MILESTONE) =>
  (useStreak as jest.Mock).mockReturnValue({
    streakData: { newly_achieved_milestone: milestone },
    dismissMilestone: mockDismissMilestone,
  });

/** Injects a null milestone (modal should not show) */
const withNoMilestone = () =>
  (useStreak as jest.Mock).mockReturnValue({
    streakData: { newly_achieved_milestone: null },
    dismissMilestone: mockDismissMilestone,
  });

const renderModal = () => render(<MilestoneCelebrationModal />);

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  mockPrefersReducedMotion = false;
  mockDismissMilestone.mockResolvedValue(undefined);
});

// ── Visibility ────────────────────────────────────────────────────────────────

describe('MilestoneCelebrationModal — visibility', () => {
  it('renders nothing when no milestone is pending', () => {
    withNoMilestone();
    const { container } = renderModal();
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when streakData is null', () => {
    (useStreak as jest.Mock).mockReturnValue({
      streakData: null,
      dismissMilestone: mockDismissMilestone,
    });
    const { container } = renderModal();
    expect(container.firstChild).toBeNull();
  });

  it('renders the milestone name when a milestone is pending', () => {
    mockPrefersReducedMotion = true; // skip animation for content tests
    withMilestone();
    renderModal();
    expect(screen.getByText('Week in the Word')).toBeInTheDocument();
  });

  it('renders the blessings amount when a milestone is pending', () => {
    mockPrefersReducedMotion = true;
    withMilestone();
    renderModal();
    expect(screen.getByText(/\+50/)).toBeInTheDocument();
  });

  it('renders the Continue button when a milestone is pending', () => {
    mockPrefersReducedMotion = true;
    withMilestone();
    renderModal();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });
});

// ── Phase 7: celebrationAnimEnabled gate ──────────────────────────────────────

describe('MilestoneCelebrationModal — Phase 7: particle gate', () => {
  // We use reduced motion = false so the animation runs and particles CAN appear.
  // With fake timers, we advance to step 3 (1800ms) where particles first render.

  beforeEach(() => {
    jest.useFakeTimers();
    mockPrefersReducedMotion = false;
    withMilestone();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('particles render at step 3 when celebrationAnimEnabled is absent (default on)', () => {
    // localStorage key is absent → celebrationEnabled defaults to true
    renderModal();
    act(() => { jest.advanceTimersByTime(1800); });
    // Particles are <span> elements with animation styles
    const particles = document.querySelectorAll('span[style*="animation"]');
    expect(particles.length).toBeGreaterThan(0);
  });

  it('particles render when celebrationAnimEnabled="true"', () => {
    localStorage.setItem('celebrationAnimEnabled', 'true');
    renderModal();
    act(() => { jest.advanceTimersByTime(1800); });
    const particles = document.querySelectorAll('span[style*="animation"]');
    expect(particles.length).toBeGreaterThan(0);
  });

  it('particles are hidden when celebrationAnimEnabled="false"', () => {
    localStorage.setItem('celebrationAnimEnabled', 'false');
    renderModal();
    act(() => { jest.advanceTimersByTime(1800); });
    const particles = document.querySelectorAll('span[style*="animation"]');
    expect(particles.length).toBe(0);
  });
});

// ── Phase 7: sound fires at step 3 ───────────────────────────────────────────

describe('MilestoneCelebrationModal — Phase 7: milestone sound', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    withMilestone();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does NOT play sound before step 3 (< 1800ms)', () => {
    mockPrefersReducedMotion = false;
    renderModal();
    act(() => { jest.advanceTimersByTime(1799); });
    expect(mockPlay).not.toHaveBeenCalledWith('milestone');
  });

  it('plays "milestone" sound at step 3 (1800ms)', () => {
    mockPrefersReducedMotion = false;
    renderModal();
    act(() => { jest.advanceTimersByTime(1800); });
    expect(mockPlay).toHaveBeenCalledWith('milestone');
  });

  it('plays "milestone" sound immediately when prefersReducedMotion=true', () => {
    mockPrefersReducedMotion = true;
    renderModal();
    // With reduced motion, step jumps to 5 immediately — sound should fire on mount
    expect(mockPlay).toHaveBeenCalledWith('milestone');
  });

  it('does NOT play sound when there is no milestone', () => {
    withNoMilestone();
    renderModal();
    act(() => { jest.advanceTimersByTime(2000); });
    expect(mockPlay).not.toHaveBeenCalled();
  });
});

// ── Dismiss behaviour ─────────────────────────────────────────────────────────

describe('MilestoneCelebrationModal — dismiss', () => {
  beforeEach(() => {
    mockPrefersReducedMotion = true; // skip animation so Continue button renders
    withMilestone();
  });

  it('clicking Continue calls dismissMilestone with the milestone key', async () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(mockDismissMilestone).toHaveBeenCalledWith('week_in_word');
    });
  });

  it('pressing ESC calls dismissMilestone', async () => {
    renderModal();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(mockDismissMilestone).toHaveBeenCalled();
    });
  });

  it('modal is session-deduplicated — same milestone key not shown twice', async () => {
    // Pre-populate sessionStorage with the dismissed key
    sessionStorage.setItem('dismissedMilestones', JSON.stringify(['week_in_word']));
    const { container } = renderModal();
    // Modal already dismissed in this session — should not render
    expect(container.firstChild).toBeNull();
  });
});
