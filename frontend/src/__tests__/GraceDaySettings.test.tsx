/**
 * GraceDaySettings component tests — Phase 7
 *
 * Covers:
 * - Renders "X of 2" grace days count
 * - Renders exhausted message when grace_days_remaining = 0
 * - "Use a Grace Day" button is shown when remaining > 0
 * - First click shows confirmation text ("Confirm — use a Grace Day?")
 * - Second click (confirm) calls applyGraceDay from StreakContext
 * - applyGraceDay is NOT called on the first click
 * - Button is disabled during loading
 * - After confirmation completes, confirming state resets
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GraceDaySettings } from '../features/settings/GraceDaySettings';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

jest.mock('@phosphor-icons/react', () => ({
  CalendarCheck: () => <span data-testid="icon-calendar-check" />,
}));

// Use a module-level variable for grace_days_remaining so renderWithRemaining()
// can mutate it without spyOn (which interacts badly with jest.clearAllMocks()).
// The mock factory closes over mockGraceDaysRemaining by reference, so
// useStreak() always reads the current value at call time.
let mockGraceDaysRemaining = 2;
const mockApplyGraceDay = jest.fn();

jest.mock('../contexts/StreakContext', () => ({
  useStreak: () => ({
    streakData: { current_streak: 5, blessings_balance: 100, grace_days_remaining: mockGraceDaysRemaining },
    useGraceDay: mockApplyGraceDay,
  }),
  StreakProvider: ({ children }: any) => children,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const renderComponent = () => render(<GraceDaySettings />);

// Mutate the module-level variable so useStreak() returns a different remaining count.
const renderWithRemaining = (remaining: number) => {
  mockGraceDaysRemaining = remaining;
  return render(<GraceDaySettings />);
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockGraceDaysRemaining = 2; // reset to default before each test
  mockApplyGraceDay.mockResolvedValue({ success: true });
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('GraceDaySettings — rendering', () => {
  it('shows grace days remaining count', () => {
    renderComponent();
    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/of 2/)).toBeInTheDocument();
  });

  it('shows "Use a Grace Day" button when remaining > 0', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /use a grace day/i })).toBeInTheDocument();
  });

  it('shows exhausted message when grace_days_remaining = 0', () => {
    renderWithRemaining(0);
    expect(screen.getByText(/grace days have been used/i)).toBeInTheDocument();
  });

  it('does NOT show "Use a Grace Day" button when remaining = 0', () => {
    renderWithRemaining(0);
    expect(screen.queryByRole('button', { name: /use a grace day/i })).not.toBeInTheDocument();
  });
});

// ── Two-step confirmation ─────────────────────────────────────────────────────

describe('GraceDaySettings — two-step confirmation', () => {
  it('first click shows confirm text', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /use a grace day/i }));
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('first click does NOT call applyGraceDay', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /use a grace day/i }));
    expect(mockApplyGraceDay).not.toHaveBeenCalled();
  });

  it('second click calls applyGraceDay', async () => {
    renderComponent();
    const btn = screen.getByRole('button', { name: /use a grace day/i });
    fireEvent.click(btn); // first click — confirms
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmBtn); // second click — submits
    await waitFor(() => {
      expect(mockApplyGraceDay).toHaveBeenCalledTimes(1);
    });
  });

  it('confirming state resets after applyGraceDay resolves', async () => {
    renderComponent();
    const btn = screen.getByRole('button', { name: /use a grace day/i });
    fireEvent.click(btn);
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    await waitFor(() => {
      // After resolution the button text reverts to the initial label
      expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
    });
  });
});

// ── Loading state ─────────────────────────────────────────────────────────────

describe('GraceDaySettings — loading state', () => {
  it('disables the button while applyGraceDay is in progress', async () => {
    // Make the mock never resolve so the component stays in loading state
    mockApplyGraceDay.mockReturnValue(new Promise(() => {}));
    renderComponent();
    const btn = screen.getByRole('button', { name: /use a grace day/i });
    fireEvent.click(btn); // → confirming state
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmBtn); // → loading state
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
