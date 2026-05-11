/**
 * Settings page — Phase 7 tests
 *
 * Phase 7 replaced the tabbed layout with a single scrollable page of sections.
 * These tests verify the new layout and the active_theme sync behavior.
 *
 * Covers:
 * - Four section headings render (My Journey, Devotion & Notifications, Appearance, Account)
 * - "My Journey" section is visible for authenticated users
 * - About link is preserved in the Account section
 * - initTheme is called with active_theme on load
 * - initTheme is NOT called when active_theme is absent from API response
 * - No tabs exist in the Phase 7 layout
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'Test', email: 'test@test.com' },
    isAuthenticated: true,
    isGuest: false,
    logout: jest.fn(),
  }),
}));

jest.mock('../contexts/StreakContext', () => ({
  useStreak: () => ({
    streakData: { current_streak: 5, blessings_balance: 100, grace_days_remaining: 2 },
    isLoading: false,
  }),
  StreakProvider: ({ children }: any) => children,
}));

// useTheme is mocked as jest.fn() so we can swap its return value per-test
// with mockReturnValue. This avoids the TDZ error that arises when an outer
// const is referenced inside a hoisted jest.mock() factory.
jest.mock('../contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
  THEMES: [],
  ThemeProvider: ({ children }: any) => children,
}));

jest.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'en',
    changeLanguage: jest.fn(),
    supportedLanguages: [{ code: 'en', name: 'English' }],
  }),
}));

jest.mock('../services/api/settings', () => ({
  settingsService: {
    getSettings: jest.fn(),
    updateSettings: jest.fn().mockResolvedValue({}),
  },
}));

// Stub all sub-components that make their own API calls or context reads
jest.mock('../features/profile/Profile', () => ({
  Profile: () => <div data-testid="profile-component" />,
}));
jest.mock('../features/profile/TranslationPicker', () => ({
  TranslationPicker: () => <div data-testid="translation-picker" />,
}));
jest.mock('../features/profile/AccountManagement', () => ({
  AccountManagement: () => <div data-testid="account-management" />,
}));
jest.mock('../features/profile/GuestAccountManagement', () => ({
  GuestAccountManagement: () => <div data-testid="guest-account-management" />,
}));
jest.mock('../features/settings/GraceDaySettings', () => ({
  GraceDaySettings: () => <div data-testid="grace-day-settings" />,
}));
jest.mock('../features/settings/NotificationSettings', () => ({
  NotificationSettings: () => <div data-testid="notification-settings" />,
}));
jest.mock('../features/settings/LanguageSettings', () => ({
  LanguageSettings: () => <div data-testid="language-settings" />,
}));
jest.mock('../features/settings/AppearanceSettings', () => ({
  AppearanceSettings: () => <div data-testid="appearance-settings" />,
}));
jest.mock('../features/settings/ThemePicker', () => ({
  ThemePicker: () => <div data-testid="theme-picker" />,
}));

// ── Imports after mocks ───────────────────────────────────────────────────────
import { Settings } from '../features/profile/Settings';
import { useTheme } from '../contexts/ThemeContext';
import { settingsService } from '../services/api/settings';

// Typed references to the jest.fn() stubs created inside the factories above.
// Assigned once at module level (safe — mock factories already ran by import time).
const mockGetSettings = settingsService.getSettings as jest.Mock;
// mockInitTheme is per-test (see beforeEach) because it must be fresh for each assertion.
let mockInitTheme: jest.Mock;

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Fresh initTheme spy for each test so assertions are isolated.
  mockInitTheme = jest.fn();
  (useTheme as jest.Mock).mockReturnValue({
    activeTheme: 'parchment',
    setTheme: jest.fn(),
    initTheme: mockInitTheme,
    isDarkMode: false,
    toggleTheme: jest.fn(),
  });
  mockGetSettings.mockResolvedValue({
    email_notifications: true,
    daily_verse_reminder: true,
    preferred_language: 'en',
    active_theme: 'midnight',
  });
});

const renderSettings = () =>
  render(<MemoryRouter><Settings /></MemoryRouter>);

// ── Layout: Phase 7 sections ──────────────────────────────────────────────────

describe('Settings — Phase 7 section layout', () => {
  it('renders the "My Journey" section heading', async () => {
    renderSettings();
    expect(await screen.findByText('My Journey')).toBeInTheDocument();
  });

  it('renders the "Devotion & Notifications" section heading', async () => {
    renderSettings();
    expect(await screen.findByText('Devotion & Notifications')).toBeInTheDocument();
  });

  it('renders the "Appearance" section heading', async () => {
    renderSettings();
    expect(await screen.findByText('Appearance')).toBeInTheDocument();
  });

  it('renders the Account section', async () => {
    renderSettings();
    // Our t() mock returns the fallback if present, otherwise the key.
    // settings.tabs.account has no fallback in the component so the key is returned.
    expect(await screen.findByText('settings.tabs.account')).toBeInTheDocument();
  });

  it('has NO tab buttons — tab layout was removed in Phase 7', () => {
    renderSettings();
    expect(screen.queryByText('settings.tabs.preferences')).not.toBeInTheDocument();
    expect(screen.queryByText('settings.tabs.profile')).not.toBeInTheDocument();
  });

  it('renders all four sub-component stubs (smoke test)', async () => {
    renderSettings();
    expect(await screen.findByTestId('profile-component')).toBeInTheDocument();
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
    expect(screen.getByTestId('language-settings')).toBeInTheDocument();
    expect(screen.getByTestId('appearance-settings')).toBeInTheDocument();
    expect(screen.getByTestId('account-management')).toBeInTheDocument();
  });

  it('renders GraceDaySettings inside My Journey section', async () => {
    renderSettings();
    expect(await screen.findByTestId('grace-day-settings')).toBeInTheDocument();
  });
});

// ── About link preserved ──────────────────────────────────────────────────────

describe('Settings — About link', () => {
  it('preserves the /about NavLink in the Account section', async () => {
    renderSettings();
    const aboutLink = await screen.findByRole('link', { name: /nav\.about/i });
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink).toHaveAttribute('href', '/about');
  });
});

// ── Phase 7: initTheme synced from API on load ────────────────────────────────

describe('Settings — Phase 7: initTheme sync on load', () => {
  it('calls initTheme with active_theme from the API response', async () => {
    mockGetSettings.mockResolvedValue({ active_theme: 'midnight' });
    renderSettings();
    await waitFor(() => {
      expect(mockInitTheme).toHaveBeenCalledWith('midnight');
    });
  });

  it('does NOT call initTheme when API response has no active_theme field', async () => {
    mockGetSettings.mockResolvedValue({ email_notifications: true, daily_verse_reminder: true });
    renderSettings();
    await waitFor(() => expect(mockGetSettings).toHaveBeenCalled());
    expect(mockInitTheme).not.toHaveBeenCalled();
  });

  it('calls initTheme once per mount, not on re-renders', async () => {
    mockGetSettings.mockResolvedValue({ active_theme: 'sanctuary' });
    const { rerender } = renderSettings();
    await waitFor(() => expect(mockInitTheme).toHaveBeenCalledTimes(1));
    rerender(<MemoryRouter><Settings /></MemoryRouter>);
    // Still only called once — useEffect only runs on mount
    expect(mockInitTheme).toHaveBeenCalledTimes(1);
  });

  it('calls initTheme with each of the 6 valid themes', async () => {
    const themes = ['parchment', 'midnight', 'sanctuary', 'desert-sand', 'celestial', 'scarlet-grace'];
    for (const theme of themes) {
      mockInitTheme.mockClear();
      mockGetSettings.mockResolvedValue({ active_theme: theme });
      const { unmount } = renderSettings();
      await waitFor(() => expect(mockInitTheme).toHaveBeenCalledWith(theme));
      unmount();
    }
  });
});
