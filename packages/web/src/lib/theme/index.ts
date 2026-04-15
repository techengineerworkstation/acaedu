export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
}

export interface InstitutionSettings {
  institution_name: string;
  motto: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_primary_color: string;
  text_secondary_color: string;
  theme_preset: string;
  website_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  support_email: string | null;
  contact_phone: string | null;
  address: string | null;
  default_currency_code?: string;
  tax_rate?: number;
  currency_position?: 'before' | 'after';
  paystack_key?: string;
  paypal_client_id?: string;
  hubspot_key?: string;
  salesforce_url?: string;
  zendesk_subdomain?: string;
}

export const THEME_PRESETS: Record<string, ThemeColors> = {
  // Core presets
  turquoise: {
    primary: '#0ea5e9',
    secondary: '#6366f1',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
  },

  // Metallic family - professional & sophisticated
  metallic_turquoise: {
    primary: '#0d9488',
    secondary: '#14b8a6',
    accent: '#fbbf24',
    background: '#f0fdfa',
    surface: '#ccfbf1',
    textPrimary: '#064e3b',
    textSecondary: '#5f9ea0',
  },
  metallic_slate: {
    primary: '#475569',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
  },
  metallic_plum: {
    primary: '#6b21a8',
    secondary: '#9333ea',
    accent: '#fbbf24',
    background: '#faf5ff',
    surface: '#f3e8ff',
    textPrimary: '#581c87',
    textSecondary: '#a855f7',
  },

  // African-inspired vibrant palettes
  african_sunset: {
    primary: '#dc2626',
    secondary: '#ea580c',
    accent: '#fbbf24',
    background: '#fff7ed',
    surface: '#fed7aa',
    textPrimary: '#7f1d1d',
    textSecondary: '#9a3412',
  },
  african_dawn: {
    primary: '#f97316',
    secondary: '#ec4899',
    accent: '#8b5cf6',
    background: '#fff1f2',
    surface: '#ffe4e6',
    textPrimary: '#881337',
    textSecondary: '#9f1239',
  },
  savanna_gold: {
    primary: '#d97706',
    secondary: '#f59e0b',
    accent: '#10b981',
    background: '#fffbeb',
    surface: '#fef3c7',
    textPrimary: '#78350f',
    textSecondary: '#b45309',
  },
  kalahari_dunes: {
    primary: '#b45309',
    secondary: '#92400e',
    accent: '#059669',
    background: '#fffbeb',
    surface: '#fef3c7',
    textPrimary: '#78350f',
    textSecondary: '#a16207',
  },

  // Nature-inspired
  ocean_depth: {
    primary: '#0284c7',
    secondary: '#0369a1',
    accent: '#06b6d4',
    background: '#f0f9ff',
    surface: '#dbeafe',
    textPrimary: '#1e40af',
    textSecondary: '#3b82f6',
  },
  nile_blue: {
    primary: '#0891b2',
    secondary: '#0e7490',
    accent: '#f59e0b',
    background: '#ecfeff',
    surface: '#cffafe',
    textPrimary: '#164e63',
    textSecondary: '#0e7490',
  },

  // Jungle & forest
  jungle_green: {
    primary: '#059669',
    secondary: '#10b981',
    accent: '#f59e0b',
    background: '#f0fdf4',
    surface: '#dcfce7',
    textPrimary: '#064e3b',
    textSecondary: '#6b7280',
  },
  congo_green: {
    primary: '#065f46',
    secondary: '#047857',
    accent: '#d97706',
    background: '#f0fdf4',
    surface: '#d1fae5',
    textPrimary: '#064e3b',
    textSecondary: '#059669',
  },

  // Night & elegant
  sahara_night: {
    primary: '#1e293b',
    secondary: '#334155',
    accent: '#fbbf24',
    background: '#0f172a',
    surface: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
  },
  ethiopian_midnight: {
    primary: '#4c1d95',
    secondary: '#6d28d9',
    accent: '#fbbf24',
    background: '#faf5ff',
    surface: '#ede9fe',
    textPrimary: '#4c1d95',
    textSecondary: '#7c3aed',
  },

  // Earth tones
  ethiopian_earth: {
    primary: '#b45309',
    secondary: '#a16207',
    accent: '#065f46',
    background: '#fffbeb',
    surface: '#fef3c7',
    textPrimary: '#78350f',
    textSecondary: '#b45309',
  }
};

export const THEME_PRESET_LABELS: Record<string, string> = {
  turquoise: 'Ocean Turquoise',
  metallic_turquoise: 'Metallic Turquoise',
  metallic_slate: 'Metallic Slate',
  metallic_plum: 'Metallic Plum',
  african_sunset: 'African Sunset',
  african_dawn: 'African Dawn',
  savanna_gold: 'Savanna Gold',
  kalahari_dunes: 'Kalahari Dunes',
  ocean_depth: 'Ocean Depth',
  nile_blue: 'Nile Blue',
  jungle_green: 'Jungle Green',
  congo_green: 'Congo Green',
  sahara_night: 'Sahara Night',
  ethiopian_midnight: 'Ethiopian Midnight',
  ethiopian_earth: 'Ethiopian Earth'
};

export const getThemeColors = (preset: string): ThemeColors => {
  return THEME_PRESETS[preset] || THEME_PRESETS.turquoise;
};

export const applyThemeToDOM = (colors: ThemeColors) => {
  const root = document.documentElement;

  // Set CSS variables
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);

  // Also set Tailwind-friendly variants
  root.style.setProperty('--color-primary-50', `${colors.primary}1a`);
  root.style.setProperty('--color-primary-100', `${colors.primary}33`);
  root.style.setProperty('--color-primary-200', `${colors.primary}4d`);
  root.style.setProperty('--color-primary-300', `${colors.primary}66`);
  root.style.setProperty('--color-primary-400', `${colors.primary}80`);
  root.style.setProperty('--color-primary-500', colors.primary);
  root.style.setProperty('--color-primary-600', colors.primary);
};
