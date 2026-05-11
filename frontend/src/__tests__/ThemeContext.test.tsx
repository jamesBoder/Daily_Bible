/**
 * ThemeContext unit tests
 *
 * Covers:
 * - Defaults to 'parchment' when no localStorage key exists
 * - Migrates isDarkMode=true → 'midnight'
 * - Migrates isDarkMode=false → 'parchment'
 * - Prefers 'activeTheme' key over legacy 'isDarkMode'
 * - setTheme updates the active theme
 * - Dark themes add .dark class to documentElement
 * - Light themes do NOT add .dark class
 * - data-theme attribute is set on documentElement
 * - Legacy toggleTheme switches between parchment and midnight only
 * - isDarkMode derived correctly from active theme
 */
// ThemeContext now calls apiClient.put for debounced backend sync.
// Mock it before importing ThemeContext to prevent the axios ESM parse error.
// Note: jest.mock() is hoisted above const declarations — never reference outer
// const/let variables inside the factory (TDZ).  Use jest.fn() inline instead.
jest.mock('../services/api/client', () => ({
  default: { put: jest.fn().mockResolvedValue({}) },
}));

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme, THEMES } from '../contexts/ThemeContext';
import apiClient from '../services/api/client';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Renders a component that exposes the current ThemeContext values */
const ThemeInspector: React.FC = () => {
  const { activeTheme, isDarkMode } = useTheme();
  return (
    <div>
      <span data-testid="activeTheme">{activeTheme}</span>
      <span data-testid="isDarkMode">{String(isDarkMode)}</span>
    </div>
  );
};

const ThemeController: React.FC = () => {
  const { setTheme, toggleTheme } = useTheme();
  return (
    <>
      <button onClick={() => setTheme('sanctuary')}>set-sanctuary</button>
      <button onClick={() => setTheme('desert-sand')}>set-desert-sand</button>
      <button onClick={() => setTheme('celestial')}>set-celestial</button>
      <button onClick={() => setTheme('midnight')}>set-midnight</button>
      <button onClick={() => setTheme('parchment')}>set-parchment</button>
      <button onClick={toggleTheme}>toggle</button>
    </>
  );
};

const renderWithProvider = () =>
  render(
    <ThemeProvider>
      <ThemeInspector />
      <ThemeController />
    </ThemeProvider>
  );

// ── Setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  // Reset DOM attributes
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.classList.remove('dark');
});

// ── THEMES catalog ────────────────────────────────────────────────────────────

describe('THEMES catalog', () => {
  it('has exactly 6 themes', () => {
    expect(THEMES).toHaveLength(6);
  });

  it('includes parchment and midnight as free (unlockCost=0)', () => {
    const free = THEMES.filter(t => t.unlockCost === 0);
    expect(free.map(t => t.id).sort()).toEqual(['midnight', 'parchment']);
  });

  it('marks dark themes correctly', () => {
    const darkThemes = THEMES.filter(t => t.isDark).map(t => t.id).sort();
    expect(darkThemes).toEqual(['celestial', 'midnight', 'sanctuary', 'scarlet-grace']);
  });

  it('marks light themes correctly', () => {
    const lightThemes = THEMES.filter(t => !t.isDark).map(t => t.id).sort();
    expect(lightThemes).toEqual(['desert-sand', 'parchment']);
  });
});

// ── Default / migration behaviour ────────────────────────────────────────────

describe('ThemeContext — initial state', () => {
  it('defaults to parchment when localStorage is empty', () => {
    renderWithProvider();
    expect(screen.getByTestId('activeTheme').textContent).toBe('parchment');
  });

  it('migrates isDarkMode=true to midnight', () => {
    localStorage.setItem('isDarkMode', 'true');
    renderWithProvider();
    expect(screen.getByTestId('activeTheme').textContent).toBe('midnight');
  });

  it('migrates isDarkMode=false to parchment', () => {
    localStorage.setItem('isDarkMode', 'false');
    renderWithProvider();
    expect(screen.getByTestId('activeTheme').textContent).toBe('parchment');
  });

  it('prefers activeTheme key over legacy isDarkMode', () => {
    localStorage.setItem('isDarkMode', 'true');       // would migrate to midnight
    localStorage.setItem('activeTheme', 'celestial'); // but this wins
    renderWithProvider();
    expect(screen.getByTestId('activeTheme').textContent).toBe('celestial');
  });

  it('restores any valid stored theme on mount', () => {
    localStorage.setItem('activeTheme', 'sanctuary');
    renderWithProvider();
    expect(screen.getByTestId('activeTheme').textContent).toBe('sanctuary');
  });
});

// ── DOM side-effects ──────────────────────────────────────────────────────────

describe('ThemeContext — DOM side-effects', () => {
  it('sets data-theme attribute on documentElement', () => {
    renderWithProvider();
    expect(document.documentElement.getAttribute('data-theme')).toBe('parchment');
  });

  it('adds .dark class for dark themes', () => {
    localStorage.setItem('activeTheme', 'midnight');
    renderWithProvider();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes .dark class for light themes', () => {
    document.documentElement.classList.add('dark'); // simulate dirty state
    localStorage.setItem('activeTheme', 'parchment');
    renderWithProvider();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('updates data-theme when setTheme is called', () => {
    renderWithProvider();
    act(() => {
      screen.getByText('set-sanctuary').click();
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('sanctuary');
  });

  it('adds .dark after switching to a dark theme', () => {
    renderWithProvider(); // starts at parchment (light)
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    act(() => {
      screen.getByText('set-celestial').click();
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes .dark after switching to a light theme', () => {
    localStorage.setItem('activeTheme', 'midnight');
    renderWithProvider();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    act(() => {
      screen.getByText('set-desert-sand').click();
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists the new theme to localStorage', () => {
    renderWithProvider();
    act(() => {
      screen.getByText('set-sanctuary').click();
    });
    expect(localStorage.getItem('activeTheme')).toBe('sanctuary');
  });
});

// ── isDarkMode derived value ──────────────────────────────────────────────────

describe('ThemeContext — isDarkMode', () => {
  it('is false for parchment', () => {
    renderWithProvider();
    expect(screen.getByTestId('isDarkMode').textContent).toBe('false');
  });

  it('is true for midnight', () => {
    renderWithProvider();
    act(() => {
      screen.getByText('set-midnight').click();
    });
    expect(screen.getByTestId('isDarkMode').textContent).toBe('true');
  });

  it('is true for sanctuary', () => {
    renderWithProvider();
    act(() => {
      screen.getByText('set-sanctuary').click();
    });
    expect(screen.getByTestId('isDarkMode').textContent).toBe('true');
  });

  it('is false for desert-sand', () => {
    renderWithProvider();
    act(() => {
      screen.getByText('set-desert-sand').click();
    });
    expect(screen.getByTestId('isDarkMode').textContent).toBe('false');
  });
});

// ── Legacy toggleTheme ────────────────────────────────────────────────────────

describe('ThemeContext — legacy toggleTheme', () => {
  it('toggles from parchment to midnight', () => {
    renderWithProvider();
    act(() => {
      screen.getByText('toggle').click();
    });
    expect(screen.getByTestId('activeTheme').textContent).toBe('midnight');
  });

  it('toggles from midnight back to parchment', () => {
    localStorage.setItem('activeTheme', 'midnight');
    renderWithProvider();
    act(() => {
      screen.getByText('toggle').click();
    });
    expect(screen.getByTestId('activeTheme').textContent).toBe('parchment');
  });

  it('toggles from a non-midnight theme to midnight (treats any non-midnight as parchment)', () => {
    localStorage.setItem('activeTheme', 'sanctuary');
    renderWithProvider();
    act(() => {
      screen.getByText('toggle').click();
    });
    // toggleTheme: prev === 'midnight' ? 'parchment' : 'midnight'
    // sanctuary !== midnight → goes to midnight
    expect(screen.getByTestId('activeTheme').textContent).toBe('midnight');
  });
});

// ── Phase 7: initTheme (silent API-load sync) ─────────────────────────────────

/** Exposes initTheme via a button so tests can call it directly. */
const InitThemeController: React.FC = () => {
  const { initTheme } = useTheme();
  return <button onClick={() => initTheme('sanctuary')}>init-sanctuary</button>;
};

const renderWithInit = () =>
  render(
    <ThemeProvider>
      <ThemeInspector />
      <InitThemeController />
    </ThemeProvider>
  );

describe('ThemeContext — Phase 7: initTheme', () => {
  beforeEach(() => {
    (apiClient as any).put.mockClear();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('initTheme updates the active theme', () => {
    renderWithInit();
    act(() => { screen.getByText('init-sanctuary').click(); });
    expect(screen.getByTestId('activeTheme').textContent).toBe('sanctuary');
  });

  it('initTheme does NOT fire a backend PUT even after 800ms', () => {
    renderWithInit();
    act(() => {
      screen.getByText('init-sanctuary').click();
      jest.advanceTimersByTime(1000);
    });
    expect((apiClient as any).put).not.toHaveBeenCalled();
  });
});

// ── Phase 7: setTheme debounced backend sync ──────────────────────────────────

describe('ThemeContext — Phase 7: setTheme API sync', () => {
  beforeEach(() => {
    (apiClient as any).put.mockClear();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('setTheme does NOT fire PUT immediately', () => {
    renderWithProvider();
    act(() => { screen.getByText('set-sanctuary').click(); });
    expect((apiClient as any).put).not.toHaveBeenCalled();
  });

  it('setTheme fires PUT /api/settings after 800ms debounce', () => {
    renderWithProvider();
    act(() => {
      screen.getByText('set-sanctuary').click();
      jest.advanceTimersByTime(800);
    });
    expect((apiClient as any).put).toHaveBeenCalledWith(
      '/api/settings',
      { active_theme: 'sanctuary' }
    );
  });

  it('rapid theme switching fires only one PUT (debounce cancels previous)', () => {
    renderWithProvider();
    act(() => {
      screen.getByText('set-sanctuary').click();
      jest.advanceTimersByTime(400); // half-way — debounce timer resets
      screen.getByText('set-midnight').click();
      jest.advanceTimersByTime(800); // full debounce after last click
    });
    expect((apiClient as any).put).toHaveBeenCalledTimes(1);
    expect((apiClient as any).put).toHaveBeenCalledWith('/api/settings', { active_theme: 'midnight' });
  });

  it('PUT does not fire at 799ms (just before debounce)', () => {
    renderWithProvider();
    act(() => {
      screen.getByText('set-celestial').click();
      jest.advanceTimersByTime(799);
    });
    expect((apiClient as any).put).not.toHaveBeenCalled();
  });
});
