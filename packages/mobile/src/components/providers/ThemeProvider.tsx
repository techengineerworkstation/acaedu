import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from '../../constants/theme';

type Theme = 'light' | 'dark';

interface InstitutionBranding {
  institution_name: string;
  motto: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_primary_color: string;
  text_secondary_color: string;
  theme_preset: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof COLORS;
  branding: InstitutionBranding | null;
  isLoading: boolean;
  setThemePreset: (preset: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const INSTITUTION_SETTINGS_KEY = 'institution_settings';

// Preset definitions (matching web)
const THEME_PRESETS: Record<string, Partial<InstitutionBranding>> = {
  metallic_turquoise: {
    primary_color: '#0d9488',
    secondary_color: '#14b8a6',
    accent_color: '#fbbf24',
    background_color: '#f0fdfa',
    surface_color: '#ccfbf1',
    text_primary_color: '#064e3b',
    text_secondary_color: '#5f9ea0',
    theme_preset: 'metallic_turquoise'
  },
  african_sunset: {
    primary_color: '#dc2626',
    secondary_color: '#ea580c',
    accent_color: '#fbbf24',
    background_color: '#fff7ed',
    surface_color: '#fed7aa',
    text_primary_color: '#7f1d1d',
    text_secondary_color: '#9a3412',
    theme_preset: 'african_sunset'
  },
  savanna_gold: {
    primary_color: '#d97706',
    secondary_color: '#f59e0b',
    accent_color: '#10b981',
    background_color: '#fffbeb',
    surface_color: '#fef3c7',
    text_primary_color: '#78350f',
    text_secondary_color: '#b45309',
    theme_preset: 'savanna_gold'
  },
  ocean_depth: {
    primary_color: '#0284c7',
    secondary_color: '#0369a1',
    accent_color: '#06b6d4',
    background_color: '#f0f9ff',
    surface_color: '#dbeafe',
    text_primary_color: '#1e40af',
    text_secondary_color: '#3b82f6',
    theme_preset: 'ocean_depth'
  },
  jungle_green: {
    primary_color: '#059669',
    secondary_color: '#10b981',
    accent_color: '#f59e0b',
    background_color: '#f0fdf4',
    surface_color: '#dcfce7',
    text_primary_color: '#064e3b',
    text_secondary_color: '#6b7280',
    theme_preset: 'jungle_green'
  },
  sahara_night: {
    primary_color: '#1e293b',
    secondary_color: '#334155',
    accent_color: '#fbbf24',
    background_color: '#0f172a',
    surface_color: '#1e293b',
    text_primary_color: '#f8fafc',
    text_secondary_color: '#cbd5e1',
    theme_preset: 'sahara_night'
  },
  turquoise: {
    primary_color: '#0ea5e9',
    secondary_color: '#6366f1',
    accent_color: '#f59e0b',
    background_color: '#ffffff',
    surface_color: '#f8fafc',
    text_primary_color: '#1e293b',
    text_secondary_color: '#64748b',
    theme_preset: 'turquoise'
  },
  midnight: {
    primary_color: '#3b82f6',
    secondary_color: '#8b5cf6',
    accent_color: '#06b6d4',
    background_color: '#0f172a',
    surface_color: '#1e293b',
    text_primary_color: '#f1f5f9',
    text_secondary_color: '#94a3b8',
    theme_preset: 'midnight'
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme() || 'light';
  const [theme, setTheme] = useState<Theme>(systemTheme);
  const [branding, setBranding] = useState<InstitutionBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      // In mobility we'd ideally fetch from API, for now use caching
      // Would call: const response = await fetch('/api/institution-settings');
      const defaultBranding: InstitutionBranding = {
        institution_name: 'Acaedu',
        motto: 'Empowering Future Leaders Through Technology',
        logo_url: null,
        primary_color: '#0d9488',
        secondary_color: '#14b8a6',
        accent_color: '#fbbf24',
        background_color: '#ffffff',
        surface_color: '#f0fdfa',
        text_primary_color: '#064e3b',
        text_secondary_color: '#5f9ea0',
        theme_preset: 'metallic_turquoise'
      };

      setBranding(defaultBranding);
    } catch (e) {
      console.error('Error fetching institution settings:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setThemePreset = (preset: string) => {
    if (THEME_PRESETS[preset]) {
      const newBranding = { ...branding, ...THEME_PRESETS[preset] } as InstitutionBranding;
      setBranding(newBranding);
    }
  };

  // Build dynamic colors from branding
  const buildColors = (brandingData: InstitutionBranding | null, currentTheme: Theme) => {
    const baseColors = brandingData ? {
      primary: {
        50: brandingData.primary_color + '15',
        100: brandingData.primary_color + '33',
        200: brandingData.primary_color + '4d',
        300: brandingData.primary_color + '66',
        400: brandingData.primary_color + '80',
        500: brandingData.primary_color,
        600: brandingData.primary_color,
        700: brandingData.primary_color,
        800: brandingData.primary_color,
        900: brandingData.primary_color
      },
      secondary: {
        50: brandingData.secondary_color + '15',
        100: brandingData.secondary_color + '33',
        500: brandingData.secondary_color,
        600: brandingData.secondary_color
      },
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: brandingData.primary_color,
      background: brandingData.background_color,
      surface: brandingData.surface_color,
      'surface-variant': brandingData.surface_color + '40',
      text: {
        primary: brandingData.text_primary_color,
        secondary: brandingData.text_secondary_color,
        disabled: COLORS.gray[500],
        inverse: brandingData.background_color
      },
      border: brandingData.primary_color + '20',
      'border-focus': brandingData.primary_color,
      overlay: 'rgba(0, 0, 0, 0.5)',
      shadow: 'rgba(0, 0, 0, 0.1)'
    } : COLORS;

    // Dark mode overrides
    return currentTheme === 'dark' ? {
      ...baseColors,
      background: '#0f172a',
      surface: '#1e293b',
      'surface-variant': '#334155',
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        disabled: '#64748b',
        inverse: '#0f172a'
      }
    } : baseColors;
  };

  const colors = buildColors(branding, theme);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      colors,
      branding,
      isLoading,
      setThemePreset
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
