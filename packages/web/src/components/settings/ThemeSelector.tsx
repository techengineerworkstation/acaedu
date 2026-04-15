'use client';

import React, { useState } from 'react';
import { THEME_PRESETS, THEME_PRESET_LABELS, type ThemeColors } from '@/lib/theme';

interface ThemeSelectorProps {
  currentPreset: string;
  onSelect: (preset: string) => void;
  onSave?: () => void;
}

export default function ThemeSelector({ currentPreset, onSelect, onSave }: ThemeSelectorProps) {
  const [previewMode, setPreviewMode] = useState<'card' | 'full'>('card');
  const presets = Object.entries(THEME_PRESETS);

  return (
    <div className="space-y-6">
      {/* Preview Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Theme Presets</h3>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setPreviewMode('card')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              previewMode === 'card'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Card View
          </button>
          <button
            onClick={() => setPreviewMode('full')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              previewMode === 'full'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Full Preview
          </button>
        </div>
      </div>

      {/* Theme Grid */}
      {previewMode === 'card' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {presets.map(([key, colors]) => (
            <ThemeCard
              key={key}
              name={THEME_PRESET_LABELS[key] || key}
              isSelected={currentPreset === key}
              colors={colors}
              onClick={() => {
                onSelect(key);
                onSave?.();
              }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presets.map(([key, colors]) => (
            <ThemePreview
              key={key}
              name={THEME_PRESET_LABELS[key] || key}
              isSelected={currentPreset === key}
              colors={colors}
              onSelect={() => {
                onSelect(key);
                onSave?.();
              }}
            />
          ))}
        </div>
      )}

      {/* Custom Colors Section */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Color Scheme</h3>
        <p className="text-sm text-gray-500 mb-4">
          Fine-tune individual colors for a fully customized brand experience.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ColorPicker
            label="Primary Color"
            color={THEME_PRESETS[currentPreset]?.primary || '#0ea5e9'}
          />
          <ColorPicker
            label="Secondary Color"
            color={THEME_PRESETS[currentPreset]?.secondary || '#6366f1'}
          />
          <ColorPicker
            label="Accent Color"
            color={THEME_PRESETS[currentPreset]?.accent || '#f59e0b'}
          />
          <ColorPicker
            label="Background"
            color={THEME_PRESETS[currentPreset]?.background || '#ffffff'}
          />
          <ColorPicker
            label="Surface"
            color={THEME_PRESETS[currentPreset]?.surface || '#f8fafc'}
          />
          <ColorPicker
            label="Text Primary"
            color={THEME_PRESETS[currentPreset]?.textPrimary || '#1e293b'}
          />
        </div>
      </div>
    </div>
  );
}

interface ThemeCardProps {
  name: string;
  isSelected: boolean;
  colors: ThemeColors;
  onClick: () => void;
}

function ThemeCard({ name, isSelected, colors, onClick }: ThemeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-primary-500 text-white rounded-full p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Color Swatches */}
      <div className="flex gap-1 mb-3">
        <div
          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: colors.primary }}
          title="Primary"
        />
        <div
          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: colors.secondary }}
          title="Secondary"
        />
        <div
          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: colors.accent }}
          title="Accent"
        />
      </div>

      {/* Preview Elements */}
      <div className="space-y-2">
        <div
          className="h-4 rounded"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="h-3 rounded w-2/3"
          style={{ backgroundColor: colors.textSecondary }}
        />
      </div>

      <p className={`mt-3 text-sm font-medium ${isSelected ? 'text-primary-600' : 'text-gray-700'}`}>
        {name}
      </p>
    </button>
  );
}

interface ThemePreviewProps {
  name: string;
  isSelected: boolean;
  colors: ThemeColors;
  onSelect: () => void;
}

function ThemePreview({ name, isSelected, colors, onSelect }: ThemePreviewProps) {
  return (
    <div
      onClick={onSelect}
      className={`relative p-0 rounded-xl overflow-hidden cursor-pointer border-4 transition-all duration-200 ${
        isSelected
          ? 'border-primary-500 shadow-xl scale-[1.02]'
          : 'border-transparent shadow-md hover:shadow-lg'
      }`}
    >
      {/* Mini App Preview */}
      <div
        className="p-4"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
          <div className="h-2 w-16 rounded" style={{ backgroundColor: colors.textSecondary }} />
        </div>

        {/* Content Cards */}
        <div className="space-y-2">
          <div
            className="h-8 rounded-lg"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.primary}20` }}
          />
          <div className="h-6 w-3/4 rounded" style={{ backgroundColor: colors.textSecondary + '40' }} />
          <div className="h-6 w-1/2 rounded" style={{ backgroundColor: colors.textSecondary + '30' }} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <div
            className="h-6 rounded px-3"
            style={{ backgroundColor: colors.primary }}
          />
          <div
            className="h-6 rounded px-3 border"
            style={{
              borderColor: colors.primary,
              color: colors.primary
            }}
          />
        </div>
      </div>

      {/* Label */}
      <div
        className="px-4 py-2 border-t"
        style={{ backgroundColor: colors.surface, borderColor: colors.primary + '20' }}
      >
        <p className={`font-medium text-sm ${isSelected ? 'text-primary-600' : 'text-gray-700'}`}>
          {name}
        </p>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  color: string;
}

function ColorPicker({ label, color }: ColorPickerProps) {
  const [value, setValue] = useState(color);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
