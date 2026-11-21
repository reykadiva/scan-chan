'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { THEMES, THEME_LIST, type ThemeId, type ThemeDefinition, normalizeThemeId } from '@/lib/theme-config';
import { usePlayerStore } from '@/stores/player-store';

interface ThemeContextType {
  currentTheme: ThemeId;
  themeDef: ThemeDefinition;
  allThemes: ThemeDefinition[];
  setTheme: (themeId: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY_THEME = 'scan_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const storeTheme = usePlayerStore((s) => s.selectedTheme);
  const selectStoreTheme = usePlayerStore((s) => s.selectTheme);
  const [currentTheme, setCurrentThemeState] = useState<ThemeId>('pink');

  // Load from store or localStorage on mount
  useEffect(() => {
    let initial: ThemeId = 'pink';
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved) {
        initial = normalizeThemeId(saved);
      } else if (storeTheme) {
        initial = normalizeThemeId(storeTheme);
      }
    } catch {
      if (storeTheme) initial = normalizeThemeId(storeTheme);
    }
    setCurrentThemeState(initial);
    applyThemeToDOM(initial);
  }, [storeTheme]);

  // Apply CSS custom properties and data attribute to document root
  const applyThemeToDOM = useCallback((themeId: ThemeId) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const theme = THEMES[themeId] || THEMES.pink;

    root.setAttribute('data-app-theme', theme.id);

    // Explicitly apply custom properties for immediate CSS cascade
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-surface-inner', theme.colors.surfaceInner);
    root.style.setProperty('--theme-surface', theme.colors.surfaceInner);
    root.style.setProperty('--theme-surface-card', theme.colors.surfaceCard);
    root.style.setProperty('--theme-border', theme.colors.border);
    root.style.setProperty('--theme-dark', theme.colors.border);
    root.style.setProperty('--theme-text-dark', theme.colors.border);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-shadow', theme.colors.shadow);

    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--border', theme.colors.border);
    root.style.setProperty('--foreground', theme.colors.border);
    root.style.setProperty('--secondary', theme.colors.surfaceInner);
    root.style.setProperty('--secondary-foreground', theme.colors.border);
  }, []);

  const setTheme = useCallback((themeId: ThemeId) => {
    const validId = normalizeThemeId(themeId);
    setCurrentThemeState(validId);
    applyThemeToDOM(validId);

    try {
      localStorage.setItem(STORAGE_KEY_THEME, validId);
    } catch {}

    selectStoreTheme(validId);
  }, [applyThemeToDOM, selectStoreTheme]);

  const themeDef = THEMES[currentTheme] || THEMES.pink;

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeDef,
        allThemes: THEME_LIST,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}
