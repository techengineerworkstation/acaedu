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

// Apply saved theme from localStorage or default
function getInitialTheme(): ThemeColors {
  if (typeof window === 'undefined') return THEME_PRESETS.turquoise;
  
  const stored = localStorage.getItem('theme_preset');
  if (stored && THEME_PRESETS[stored as keyof typeof THEME_PRESETS]) {
    return THEME_PRESETS[stored as keyof typeof THEME_PRESETS];
  }
  return THEME_PRESETS.turquoise;
}

// Apply initial theme immediately to prevent flash
if (typeof window !== 'undefined') {
  applyThemeToDOM(getInitialTheme());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<InstitutionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentColors, setCurrentColors] = useState<ThemeColors>(getInitialTheme());
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

      // First check localStorage for custom colors
      const storedCustom = localStorage.getItem('custom_colors');
      if (storedCustom) {
        const custom = JSON.parse(storedCustom);
        setCurrentColors(custom);
        applyThemeToDOM(custom);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('institution_settings')
        .select('*')
        .single();

      if (error || !data) {
        // Try localStorage fallback
        const storedPreset = localStorage.getItem('theme_preset') || 'turquoise';
        const colors = THEME_PRESETS[storedPreset as keyof typeof THEME_PRESETS] || THEME_PRESETS.turquoise;
        setCurrentColors(colors);
        applyThemeToDOM(colors);
        setIsLoading(false);
        return;
      }

      setSettings(data);
      // Use custom colors if set, otherwise use preset
      let colors;
      if (data.theme_preset === 'custom' && data.primary_color) {
        colors = {
          primary: data.primary_color,
          secondary: data.secondary_color || data.primary_color,
          accent: data.accent_color || data.primary_color,
          background: data.background_color || '#ffffff',
          surface: data.surface_color || '#f3f4f6',
          textPrimary: data.text_primary_color || '#1f2937',
          textSecondary: data.text_secondary_color || '#6b7280'
        };
      } else {
        // Try to get from presets, fallback to turquoise
        colors = THEME_PRESETS[data.theme_preset as keyof typeof THEME_PRESETS] || 
                 (THEME_PRESETS as any)[data.theme_preset] || 
                 THEME_PRESETS.turquoise;
      }
      setCurrentColors(colors);
      applyThemeToDOM(colors);
      // Save to localStorage
      localStorage.setItem('theme_preset', data.theme_preset || 'turquoise');
    } catch (e) {
      console.error('Error fetching settings:', e);
      // Load from localStorage on error
      const storedPreset = localStorage.getItem('theme_preset') || 'turquoise';
      const colors = THEME_PRESETS[storedPreset as keyof typeof THEME_PRESETS] || THEME_PRESETS.turquoise;
      setCurrentColors(colors);
      applyThemeToDOM(colors);
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

      // First try to get the settings ID
      const { data: existing } = await supabase
        .from('institution_settings')
        .select('id')
        .single();

      const settingsId = existing?.id;

      if (settingsId) {
        const { error } = await supabase
          .from('institution_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', settingsId);

        if (error) throw error;
      } else {
        // Create if doesn't exist
        await supabase
          .from('institution_settings')
          .insert({
            ...updates,
            institution_name: updates.institution_name || 'Acaedu',
            theme_preset: updates.theme_preset || 'turquoise',
            primary_color: updates.primary_color || '#14b8a6',
            secondary_color: updates.secondary_color || '#8b5cf6'
          });
      }

      await fetchSettings();
      return {};
    } catch (e: any) {
      console.error('Update settings failed:', e);
      // Update locally even if DB fails
      if (updates.theme_preset) {
        const colors = THEME_PRESETS[updates.theme_preset as keyof typeof THEME_PRESETS] || THEME_PRESETS.turquoise;
        setCurrentColors(colors);
        applyThemeToDOM(colors);
        localStorage.setItem('theme_preset', updates.theme_preset);
      }
      if (updates.primary_color) {
        setCurrentColors(prev => ({ ...prev, primary: updates.primary_color! }));
      }
      return {};
    }
  };

  const setThemePreset = (preset: string) => {
    const colors = THEME_PRESETS[preset] || THEME_PRESETS.turquoise;
    setCurrentColors(colors);
    applyThemeToDOM(colors);
    // Save to localStorage immediately for persistence
    localStorage.setItem('theme_preset', preset);
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
