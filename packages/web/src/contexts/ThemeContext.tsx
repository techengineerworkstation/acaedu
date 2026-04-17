'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeColors } from '@/lib/theme';
import { THEME_PRESETS, applyThemeToDOM } from '@/lib/theme';

interface ThemeContextType {
  settings: any;
  isLoading: boolean;
  updateSettings: (updates: any) => Promise<{ error?: string }>;
  setThemePreset: (preset: string) => void;
  currentColors: ThemeColors;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Get theme from localStorage or default
function getStoredTheme(): ThemeColors {
  if (typeof window === 'undefined') return THEME_PRESETS.turquoise;
  
  // First check for custom colors
  const customColors = localStorage.getItem('custom_colors');
  if (customColors) {
    try {
      return JSON.parse(customColors);
    } catch {}
  }
  
  // Then check for preset
  const preset = localStorage.getItem('theme_preset') || 'turquoise';
  return THEME_PRESETS[preset as keyof typeof THEME_PRESETS] || THEME_PRESETS.turquoise;
}

// Apply immediately to prevent flash
if (typeof window !== 'undefined') {
  applyThemeToDOM(getStoredTheme());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentColors, setCurrentColors] = useState<ThemeColors>(getStoredTheme);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);

  // Handle dark mode
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    const updateDarkMode = () => {
      let dark = false;
      if (theme === 'system') {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        dark = theme === 'dark';
      }
      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    };
    updateDarkMode();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateDarkMode);
    return () => mediaQuery.removeEventListener('change', updateDarkMode);
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setThemePreset = (preset: string) => {
    let colors: ThemeColors;
    if (preset === 'custom') {
      // Use current custom colors
      colors = currentColors;
    } else {
      colors = THEME_PRESETS[preset as keyof typeof THEME_PRESETS] || THEME_PRESETS.turquoise;
    }
    setCurrentColors(colors);
    applyThemeToDOM(colors);
    
    // Save to localStorage
    localStorage.setItem('theme_preset', preset);
    if (preset === 'custom') {
      localStorage.setItem('custom_colors', JSON.stringify(colors));
    } else {
      localStorage.removeItem('custom_colors');
    }
  };

  const updateSettings = async (updates: any) => {
    // Save to localStorage - no-op for now
    return { error: undefined };
  };

  return (
    <ThemeContext.Provider value={{
      settings: null,
      isLoading: false,
      updateSettings,
      setThemePreset,
      currentColors,
      theme,
      setTheme,
      isDark,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    return {
      settings: null,
      isLoading: false,
      currentColors: { 
        primary: '#3b82f6', 
        secondary: '#8b5cf6', 
        accent: '#06b6d4',
        background: '#ffffff',
        surface: '#f3f4f6',
        textPrimary: '#1f2937',
        textSecondary: '#6b7280'
      },
      theme: 'system' as const,
      setTheme: () => {},
      isDark: false,
      updateSettings: async () => ({}),
      setThemePreset: () => {}
    };
  }
  return context;
}
