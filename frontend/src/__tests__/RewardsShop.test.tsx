/**
 * RewardsShop component tests
 *
 * Covers:
 * - Page renders with translated title and subtitle
 * - BlessingsChip is present
 * - ThemePicker is rendered inside the shop section
 * - Route is accessible only to authenticated users (GuestBlockedRoute wraps it in App.tsx — tested separately)
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'shop.title':    'Gifts of Faithfulness',
        'shop.subtitle': 'Spend your Blessings to unlock new appearances for your devotional journey.',
      };
      return map[key] ?? key;
    },
  }),
}));

// ThemePicker makes real API calls — stub it out
jest.mock('../features/settings/ThemePicker', () => ({
  ThemePicker: () => <div data-testid="theme-picker" />,
}));

// BlessingsChip reads from StreakContext + makes API calls — stub it out
jest.mock('../components/BlessingsChip', () => ({
  __esModule: true,
  default: () => <div data-testid="blessings-chip" />,
}));

// ── Imports after mocks ───────────────────────────────────────────────────────
import { RewardsShop } from '../features/shop/RewardsShop';

const renderShop = () =>
  render(
    <MemoryRouter>
      <RewardsShop />
    </MemoryRouter>
  );

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RewardsShop — rendering', () => {
  it('renders the page title', () => {
    renderShop();
    expect(screen.getByRole('heading', { name: /Gifts of Faithfulness/i })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderShop();
    expect(screen.getByText(/Spend your Blessings to unlock new appearances/i)).toBeInTheDocument();
  });

  it('renders the BlessingsChip', () => {
    renderShop();
    expect(screen.getByTestId('blessings-chip')).toBeInTheDocument();
  });

  it('renders the ThemePicker', () => {
    renderShop();
    expect(screen.getByTestId('theme-picker')).toBeInTheDocument();
  });

  it('ThemePicker is inside a section element', () => {
    renderShop();
    const picker = screen.getByTestId('theme-picker');
    expect(picker.closest('section')).not.toBeNull();
  });
});
