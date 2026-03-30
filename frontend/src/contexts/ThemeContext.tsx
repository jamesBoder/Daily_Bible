import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/api/client';

export type ThemeId =
  | 'parchment'
  | 'midnight'
  | 'sanctuary'
  | 'desert-sand'
  | 'celestial'
  | 'scarlet-grace';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  isDark: boolean;
  unlockCost: number; // 0 = free
  previewColors: {
    background: string;
    foreground: string;
    accent: string;
  };
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'parchment',
    name: 'Parchment',
    description: 'Warm cream and amber. The classic morning devotion.',
    isDark: false,
    unlockCost: 0,
    previewColors: { background: '#faf8f3', foreground: '#1a1208', accent: '#f59e0b' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep navy and gold. For evening reflection.',
    isDark: true,
    unlockCost: 0,
    previewColors: { background: '#0f0e0c', foreground: '#e8d5b0', accent: '#fbbf24' },
  },
  {
    id: 'sanctuary',
    name: 'Sanctuary',
    description: 'Forest green and ivory. Evening chapel quiet.',
    isDark: true,
    unlockCost: 500,
    previewColors: { background: '#1a2620', foreground: '#e8e0d0', accent: '#c8a84b' },
  },
  {
    id: 'desert-sand',
    name: 'Desert Sand',
    description: 'Sienna and linen. Morning solitude in the wilderness.',
    isDark: false,
    unlockCost: 500,
    previewColors: { background: '#f5ede0', foreground: '#3d2b1a', accent: '#c97c2b' },
  },
  {
    id: 'celestial',
    name: 'Celestial',
    description: 'Indigo and silver. The clear night sky.',
    isDark: true,
    unlockCost: 750,
    previewColors: { background: '#0e1330', foreground: '#e8eaf8', accent: '#8899dd' },
  },
  {
    id: 'scarlet-grace',
    name: 'Scarlet Grace',
    description: 'Crimson and gold leaf. An illuminated manuscript.',
    isDark: true,
    unlockCost: 750,
    previewColors: { background: '#1a0505', foreground: '#f5e8d8', accent: '#c8862a' },
  },
];

export interface ThemeContextType {
  activeTheme: ThemeId;
  setTheme: (id: ThemeId) => void;
  /** Sets theme from API on load — no backend sync fired (value came FROM the API) */
  initTheme: (id: ThemeId) => void;
  isDarkMode: boolean;
  // Legacy compat — kept so existing toggleTheme() callers continue to work
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'activeTheme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    // Migrate existing localStorage 'isDarkMode' value on first load
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored) return stored;
    const wasDark = localStorage.getItem('isDarkMode') === 'true';
    return wasDark ? 'midnight' : 'parchment';
  });

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    root.classList.remove('dark');

    root.setAttribute('data-theme', activeTheme);

    const def = THEMES.find(t => t.id === activeTheme);
    if (def?.isDark) root.classList.add('dark');

    localStorage.setItem(STORAGE_KEY, activeTheme);
  }, [activeTheme]);

  const setTheme = useCallback((id: ThemeId) => {
    setActiveTheme(id);
    // Debounced backend sync — silently swallow failures; localStorage is the fallback
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      apiClient.put('/api/settings', { active_theme: id }).catch(() => {});
    }, 800);
  }, []);

  // Silent init — used when loading from API; no backend sync needed (value came from there)
  const initTheme = useCallback((id: ThemeId) => {
    setActiveTheme(id);
  }, []);

  // Legacy: maps the old toggle to parchment <-> midnight (syncs to backend via setTheme)
  const toggleTheme = useCallback(() => {
    setTheme(activeTheme === 'midnight' ? 'parchment' : 'midnight');
  }, [setTheme, activeTheme]);

  const isDarkMode = THEMES.find(t => t.id === activeTheme)?.isDark ?? false;

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, initTheme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
