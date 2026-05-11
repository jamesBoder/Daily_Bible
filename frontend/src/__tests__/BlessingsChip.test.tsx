/**
 * BlessingsChip component tests — Phase 7
 *
 * Covers (Phase 7 additions):
 * - showZero=false (default): chip hidden when blessings_balance = 0
 * - showZero=true: chip visible even when blessings_balance = 0
 * - SoundService.play('blessings-earned') called when balance increases
 * - SoundService.play NOT called when balance decreases
 * - SoundService.play NOT called on initial mount (no previous value yet)
 * - Chip is hidden when streakData is null/undefined
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlessingsChip from '../components/BlessingsChip';
import { SoundService } from '../services/SoundService';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (opts?.count !== undefined) return `balance: ${opts.count}`;
      return key;
    },
  }),
}));

// Mock SoundService to track play() calls without touching Web Audio API.
// Use jest.fn() inline — never reference outer const/let inside a hoisted factory.
jest.mock('../services/SoundService', () => ({
  SoundService: {
    play: jest.fn(),
    setEnabled: jest.fn(),
    isEnabled: jest.fn().mockReturnValue(true),
    loadPreference: jest.fn(),
  },
}));

// StreakContext is controlled per-test via mockUseStreak
let mockStreakData: any = { blessings_balance: 100, current_streak: 3, grace_days_remaining: 2 };
jest.mock('../contexts/StreakContext', () => ({
  useStreak: () => ({ streakData: mockStreakData }),
  StreakProvider: ({ children }: any) => children,
}));

// Typed reference to the inline jest.fn() created in the factory above.
const mockPlay = SoundService.play as jest.Mock;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Renders BlessingsChip with optional showZero prop */
const renderChip = (showZero?: boolean) =>
  render(<BlessingsChip showZero={showZero} />);

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockStreakData = { blessings_balance: 100, current_streak: 3, grace_days_remaining: 2 };
});

// ── showZero prop ─────────────────────────────────────────────────────────────

describe('BlessingsChip — showZero prop', () => {
  it('is hidden when balance=0 and showZero is not set (default false)', () => {
    mockStreakData = { blessings_balance: 0 };
    const { container } = renderChip();
    expect(container).toBeEmptyDOMElement();
  });

  it('is hidden when balance=0 and showZero=false', () => {
    mockStreakData = { blessings_balance: 0 };
    const { container } = renderChip(false);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders when balance=0 and showZero=true', () => {
    mockStreakData = { blessings_balance: 0 };
    renderChip(true);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders normally when balance > 0 (showZero irrelevant)', () => {
    mockStreakData = { blessings_balance: 250 };
    renderChip();
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('is hidden when streakData is null', () => {
    mockStreakData = null;
    const { container } = renderChip();
    expect(container).toBeEmptyDOMElement();
  });
});

// ── blessings-earned sound ────────────────────────────────────────────────────

describe('BlessingsChip — blessings-earned sound', () => {
  it('does NOT play sound on initial mount', () => {
    mockStreakData = { blessings_balance: 100 };
    renderChip();
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('plays "blessings-earned" when balance increases', () => {
    mockStreakData = { blessings_balance: 100 };
    const { rerender } = render(<BlessingsChip />);

    mockStreakData = { blessings_balance: 150 };
    rerender(<BlessingsChip />);

    expect(mockPlay).toHaveBeenCalledWith('blessings-earned');
  });

  it('does NOT play sound when balance decreases', () => {
    mockStreakData = { blessings_balance: 100 };
    const { rerender } = render(<BlessingsChip />);

    mockStreakData = { blessings_balance: 50 };
    rerender(<BlessingsChip />);

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('does NOT play sound when balance stays the same', () => {
    mockStreakData = { blessings_balance: 100 };
    const { rerender } = render(<BlessingsChip />);

    mockStreakData = { blessings_balance: 100 };
    rerender(<BlessingsChip />);

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('plays sound on each distinct increase', () => {
    mockStreakData = { blessings_balance: 100 };
    const { rerender } = render(<BlessingsChip />);

    mockStreakData = { blessings_balance: 150 };
    rerender(<BlessingsChip />);

    mockStreakData = { blessings_balance: 200 };
    rerender(<BlessingsChip />);

    expect(mockPlay).toHaveBeenCalledTimes(2);
    expect(mockPlay).toHaveBeenNthCalledWith(1, 'blessings-earned');
    expect(mockPlay).toHaveBeenNthCalledWith(2, 'blessings-earned');
  });
});
