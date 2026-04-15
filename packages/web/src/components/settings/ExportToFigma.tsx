'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export default function ExportToFigma() {
  const { currentColors } = useTheme();
  const [copied, setCopied] = useState(false);

  const cssVariables = {
    '--color-primary': currentColors.primary,
    '--color-secondary': currentColors.secondary || currentColors.primary,
    '--color-accent': currentColors.accent || currentColors.primary,
    '--color-background': currentColors.background || '#ffffff',
    '--color-surface': currentColors.surface || '#f3f4f6',
    '--color-text-primary': currentColors.textPrimary || '#1f2937',
    '--color-text-secondary': currentColors.textSecondary || '#6b7280',
  };

  const tailwindClasses = {
    primary: `bg-[${currentColors.primary}]`,
    secondary: `bg-[${currentColors.secondary || currentColors.primary}]`,
    text: `text-[${currentColors.textPrimary || '#1f2937'}]`,
    background: `bg-[${currentColors.background || '#ffffff'}]`,
  };

  const handleCopyCSS = async () => {
    const css = `:root {
  --color-primary: ${currentColors.primary};
  --color-secondary: ${currentColors.secondary || currentColors.primary};
  --color-accent: ${currentColors.accent || currentColors.primary};
  --color-background: ${currentColors.background || '#ffffff'};
  --color-surface: ${currentColors.surface || '#f3f4f6'};
  --color-text-primary: ${currentColors.textPrimary || '#1f2937'};
  --color-text-secondary: ${currentColors.textSecondary || '#6b7280'};
}`;
    await navigator.clipboard.writeText(css);
    setCopied(true);
    toast.success('CSS copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export to Figma</h3>
        <button
          onClick={handleCopyCSS}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {copied ? 'Copied!' : 'Copy CSS'}
        </button>
      </div>

      <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 font-mono text-sm">
        <pre className="text-green-400 overflow-x-auto">
{`:root {
  --color-primary: ${currentColors.primary};
  --color-secondary: ${currentColors.secondary || currentColors.primary};
  --color-accent: ${currentColors.accent || currentColors.primary};
  --color-background: ${currentColors.background || '#ffffff'};
  --color-surface: ${currentColors.surface || '#f3f4f6'};
  --color-text-primary: ${currentColors.textPrimary || '#1f2937'};
  --color-text-secondary: ${currentColors.textSecondary || '#6b7280'};
}`}
        </pre>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg" style={{ backgroundColor: currentColors.primary }}>
          <p className="text-white text-sm font-medium">Primary</p>
          <p className="text-white/80 text-xs">{currentColors.primary}</p>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: currentColors.secondary || currentColors.primary }}>
          <p className="text-white text-sm font-medium">Secondary</p>
          <p className="text-white/80 text-xs">{currentColors.secondary || currentColors.primary}</p>
        </div>
      </div>
    </div>
  );
}