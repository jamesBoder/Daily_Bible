/**
 * BlessingsToast (center-screen blessings burst) tests
 *
 * Covers:
 * - showBlessingsToast renders a centered burst with the +amount and reason text
 * - non-positive amounts are ignored
 * - duplicate bursts within 5s are de-duped
 * - the burst auto-removes after its lifetime
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlessingsToast, { showBlessingsToast } from '../components/BlessingsToast';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

jest.mock('@phosphor-icons/react', () => ({
  Star: () => <span data-testid="star-icon" />,
}));

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

describe('BlessingsToast — center-screen burst', () => {
  it('renders nothing until a burst is fired', () => {
    const { container } = render(<BlessingsToast />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a burst with the +amount and reason text', () => {
    render(<BlessingsToast />);
    act(() => {
      showBlessingsToast(5, 'verse_shared');
    });
    expect(screen.getByText('+5')).toBeInTheDocument();
    expect(screen.getByText('Verse shared')).toBeInTheDocument();
  });

  it('ignores non-positive amounts', () => {
    render(<BlessingsToast />);
    act(() => {
      showBlessingsToast(0, 'daily_view');
      showBlessingsToast(-3, 'daily_view');
    });
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('de-dupes identical bursts fired within 5s', () => {
    // Distinct amount avoids the module-global queue colliding with other tests.
    render(<BlessingsToast />);
    act(() => {
      showBlessingsToast(9, 'manna_solved');
      showBlessingsToast(9, 'manna_solved');
    });
    expect(screen.getAllByText('+9')).toHaveLength(1);
  });

  it('auto-removes the burst after its lifetime', () => {
    render(<BlessingsToast />);
    act(() => {
      showBlessingsToast(7, 'journal_entry_written');
    });
    expect(screen.getByText('+7')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2600);
    });
    expect(screen.queryByText('+7')).not.toBeInTheDocument();
  });
});
