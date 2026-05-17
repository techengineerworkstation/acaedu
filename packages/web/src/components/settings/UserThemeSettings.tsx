'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { THEME_PRESETS } from '@/lib/theme';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const THEME_OPTIONS = [
  { id: 'turquoise', name: 'Turquoise', colors: { primary: '#14b8a6', secondary: '#8b5cf6' } },
  { id: 'blue', name: 'Ocean Blue', colors: { primary: '#3b82f6', secondary: '#6366f1' } },
  { id: 'purple', name: 'Royal Purple', colors: { primary: '#8b5cf6', secondary: '#d946ef' } },
  { id: 'pink', name: 'Rose Pink', colors: { primary: '#ec4899', secondary: '#f43f5e' } },
  { id: 'orange', name: 'Sunset Orange', colors: { primary: '#f97316', secondary: '#ea580c' } },
  { id: 'green', name: 'Forest Green', colors: { primary: '#22c55e', secondary: '#10b981' } },
  { id: 'red', name: 'Cherry Red', colors: { primary: '#ef4444', secondary: '#dc2626' } },
  { id: 'cyan', name: 'Teal Cyan', colors: { primary: '#06b6d4', secondary: '#0891b2' } },
];

export default function UserThemeSettings() {
  const { currentColors, setThemePreset, updateSettings } = useTheme();

  const handleThemeChange = async (preset: string) => {
    setThemePreset(preset);
    try {
      await updateSettings({ theme_preset: preset });
      toast.success('Theme updated');
    } catch (e) {
      toast.error('Failed to save theme');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose Theme</h3>
      <div className="grid grid-cols-4 gap-3">
        {THEME_OPTIONS.map((theme) => (
          <motion.button
            key={theme.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleThemeChange(theme.id)}
            className={`p-3 rounded-xl border-2 transition-all ${
              currentColors.primary.toLowerCase() === theme.colors.primary.toLowerCase()
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex gap-1 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: theme.colors.secondary }}
              />
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {theme.name}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}