'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';
import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { applyThemeToDOM } from '@/lib/theme';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { settings } = useTheme();

  useEffect(() => {
    if (settings) {
      // Apply theme colors from institution settings
      const themeColors = {
        primary: settings.primary_color || '#0ea5e9',
        secondary: settings.secondary_color || '#6366f1',
        accent: settings.accent_color || '#f59e0b',
        background: settings.background_color || '#ffffff',
        surface: settings.surface_color || '#f8fafc',
        textPrimary: settings.text_primary_color || '#1e293b',
        textSecondary: settings.text_secondary_color || '#64748b',
      };
      applyThemeToDOM(themeColors);
    }
  }, [settings]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
