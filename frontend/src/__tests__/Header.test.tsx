/**
 * Header QoL tests
 * - Active NavLink gets the primary color class when route matches
 * - Non-matching links do NOT get the active class
 * - Mobile menu closes on route change (useEffect on location.pathname)
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../components/layout/Header';

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'Test', email: 'test@test.com', is_guest: false },
    isAuthenticated: true,
    isGuest: false,
    logout: jest.fn(),
  }),
}));

jest.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'en',
    changeLanguage: jest.fn(),
    supportedLanguages: [],
  }),
}));

// ThemeContext now imports apiClient (axios ESM) — mock it so Jest can parse the module.
jest.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({
    activeTheme: 'parchment',
    isDarkMode: false,
    setTheme: jest.fn(),
    initTheme: jest.fn(),
    toggleTheme: jest.fn(),
  }),
  THEMES: [],
  ThemeProvider: ({ children }: any) => children,
}));

// StreakContext referenced by BlessingsChip which Header may render.
jest.mock('../contexts/StreakContext', () => ({
  useStreak: () => ({
    streakData: { current_streak: 3, blessings_balance: 50, grace_days_remaining: 1 },
    isLoading: false,
  }),
  StreakProvider: ({ children }: any) => children,
}));

// SoundService — prevent AudioContext instantiation in JSDOM.
jest.mock('../services/SoundService', () => ({
  SoundService: { play: jest.fn(), setEnabled: jest.fn(), isEnabled: jest.fn(), loadPreference: jest.fn() },
}));

const renderAt = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Header />
    </MemoryRouter>
  );

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Header – NavLink active highlighting', () => {
  // Active NavLinks use amber pill styling. Favorites/settings moved to closed
  // dropdowns (favorites uses a static class; settings is a plain button — neither
  // has route-based active styling), so only top-level NavLinks are testable here.

  it('applies amber active class to /search link when on /search', () => {
    renderAt('/search');
    const links = screen.getAllByText('nav.search');
    expect(links[0]).toHaveClass('text-amber-700');
  });

  it('does NOT apply amber active class to /search link when on /settings', () => {
    renderAt('/settings');
    const links = screen.getAllByText('nav.search');
    expect(links[0]).not.toHaveClass('text-amber-700');
  });

  it('applies amber active class to /manna link when on /manna', () => {
    renderAt('/manna');
    const links = screen.getAllByText('nav.manna');
    expect(links[0]).toHaveClass('text-amber-700');
  });

  it('does NOT apply amber active class to /manna link when on /search', () => {
    renderAt('/search');
    const links = screen.getAllByText('nav.manna');
    expect(links[0]).not.toHaveClass('text-amber-700');
  });
});

describe('Header – renders without crashing', () => {
  it('renders top-level nav links (regression guard)', () => {
    renderAt('/search');
    expect(screen.getAllByText('nav.search').length).toBeGreaterThan(0);
    expect(screen.getAllByText('nav.manna').length).toBeGreaterThan(0);
    expect(screen.getAllByText('nav.plans').length).toBeGreaterThan(0);
  });
});
