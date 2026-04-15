'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface FigmaColorInput {
  name: string;
  key: string;
}

const colorFields: FigmaColorInput[] = [
  { name: 'Primary Color', key: 'primary' },
  { name: 'Secondary Color', key: 'secondary' },
  { name: 'Accent Color', key: 'accent' },
  { name: 'Background', key: 'background' },
  { name: 'Surface', key: 'surface' },
  { name: 'Text Primary', key: 'textPrimary' },
  { name: 'Text Secondary', key: 'textSecondary' },
];

export default function ImportFromFigma() {
  const { currentColors, setThemePreset, updateSettings } = useTheme();
  const [colors, setColors] = useState({
    primary: currentColors.primary,
    secondary: currentColors.secondary || currentColors.primary,
    accent: currentColors.accent || currentColors.primary,
    background: currentColors.background || '#ffffff',
    surface: currentColors.surface || '#f3f4f6',
    textPrimary: currentColors.textPrimary || '#1f2937',
    textSecondary: currentColors.textSecondary || '#6b7280',
  });
  const [isImporting, setIsImporting] = useState(false);

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = async () => {
    setIsImporting(true);
    try {
      // Update the theme preset to custom
      await updateSettings({
        theme_preset: 'custom',
        primary_color: colors.primary,
        secondary_color: colors.secondary,
        accent_color: colors.accent,
        background_color: colors.background,
        surface_color: colors.surface,
        text_primary_color: colors.textPrimary,
        text_secondary_color: colors.textSecondary,
      });
      setThemePreset('custom');
      toast.success('Theme colors imported from Figma!');
    } catch (e) {
      toast.error('Failed to apply colors');
    } finally {
      setIsImporting(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Try to parse CSS variables or JSON
      if (text.includes(':')) {
        const newColors = { ...colors };
        
        // Extract colors from CSS
        const matches = text.match(/--[\w-]+:\s*#[0-9a-fA-F]{3,6}/g);
        if (matches) {
          matches.forEach((match: string) => {
            const [key, value] = match.split(':').map(s => s.trim());
            const colorKey = key.replace('--color-', '').replace('--', '');
            if (colorKey in newColors) {
              newColors[colorKey as keyof typeof newColors] = value;
            }
          });
          setColors(newColors);
          toast.success('Colors extracted from clipboard!');
        }
      }
    } catch (e) {
      toast.error('Could not read clipboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import Theme from Figma</h3>
        <button
          onClick={handlePaste}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200"
        >
          Paste from Clipboard
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Enter colors from your Figma design tokens. You can copy CSS variables or individual hex colors.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {colorFields.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.name}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={colors[field.key as keyof typeof colors]}
                onChange={(e) => handleColorChange(field.key, e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={colors[field.key as keyof typeof colors]}
                onChange={(e) => handleColorChange(field.key, e.target.value)}
                placeholder="#000000"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview</p>
        <div className="flex gap-3">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: colors.primary }}
          >
            Primary
          </div>
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: colors.secondary }}
          >
            Secondary
          </div>
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: colors.accent }}
          >
            Accent
          </div>
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-xs font-medium border"
            style={{ backgroundColor: colors.background, borderColor: colors.textSecondary }}
          >
            BG
          </div>
        </div>
      </div>

      <button
        onClick={handleApply}
        disabled={isImporting}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {isImporting ? 'Applying...' : 'Apply Theme Colors'}
      </button>

      {/* Quick presets from Figma export */}
      <div className="border-t pt-4 mt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Presets</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Default Blue', primary: '#3b82f6', secondary: '#6366f1' },
            { name: 'Turquoise', primary: '#14b8a6', secondary: '#8b5cf6' },
            { name: 'Purple', primary: '#8b5cf6', secondary: '#d946ef' },
            { name: 'Orange', primary: '#f97316', secondary: '#ea580c' },
            { name: 'Green', primary: '#22c55e', secondary: '#10b981' },
            { name: 'Pink', primary: '#ec4899', secondary: '#f43f5e' },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setColors({
                  ...colors,
                  primary: preset.primary,
                  secondary: preset.secondary,
                  accent: preset.primary,
                });
              }}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400"
            >
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
              </div>
              <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}