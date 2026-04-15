'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { ThemeColors } from '@/lib/theme';
import { InstitutionSettings, THEME_PRESETS, applyThemeToDOM } from '@/lib/theme';

interface ThemeContextType {
  settings: InstitutionSettings | null;
  isLoading: boolean;
  updateSettings: (updates: Partial<InstitutionSettings>) => Promise<{ error?: string }>;
  setThemePreset: (preset: string) => void;
  currentColors: ThemeColors;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Apply default theme colors immediately on module load
if (typeof window !== 'undefined') {
  applyThemeToDOM(THEME_PRESETS.turquoise);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<InstitutionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentColors, setCurrentColors] = useState<ThemeColors>(THEME_PRESETS.turquoise);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(false);

  // Handle dark mode
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (stored) {
      setThemeState(stored);
    }
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
    const handler = () => updateDarkMode();
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpuhdybttdaxirinrcsp.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdWhkeWJ0dGRheGlyaW5yY3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDUzNjQsImV4cCI6MjA5MDgyMTM2NH0.r5a0fJwurwyYaUbWxjJTK_-cBklbLLZIUv4WceEUCPM'
      );

      const { data, error } = await supabase
        .from('institution_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Failed to fetch settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
        const colors = THEME_PRESETS[data.theme_preset] || THEME_PRESETS.turquoise;
        setCurrentColors(colors);
        applyThemeToDOM(colors);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates: Partial<InstitutionSettings>) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpuhdybttdaxirinrcsp.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdWhkeWJ0dGRheGlyaW5yY3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDUzNjQsImV4cCI6MjA5MDgyMTM2NH0.r5a0fJwurwyYaUbWxjJTK_-cBklbLLZIUv4WceEUCPM'
      );

      const { error } = await supabase
        .from('institution_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (error) throw error;

      await fetchSettings();
      return {};
    } catch (e: any) {
      console.error('Update settings failed:', e);
      return { error: e.message };
    }
  };

  const setThemePreset = (preset: string) => {
    const colors = THEME_PRESETS[preset] || THEME_PRESETS.turquoise;
    setCurrentColors(colors);
    applyThemeToDOM(colors);
    updateSettings({ theme_preset: preset });
  };

  return (
    <ThemeContext.Provider value={{
      settings,
      isLoading,
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
      } as ThemeColors,
      theme: 'system' as const,
      setTheme: () => {},
      isDark: false,
      updateSettings: async () => ({ error: 'Not in provider' }),
      setThemePreset: () => {}
    };
  }
  return context;
}
