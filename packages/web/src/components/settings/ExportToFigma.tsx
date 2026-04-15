'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ExportToFigma() {
  const { currentColors } = useTheme();
  const [copied, setCopied] = useState(false);

  // Complete CSS variables for Figma
  const cssVariables = `:root {
  /* Primary Colors */
  --color-primary: ${currentColors.primary};
  --color-primary-hover: ${currentColors.primary}dd;
  --color-primary-light: ${currentColors.primary}22;
  --color-secondary: ${currentColors.secondary || currentColors.primary};
  --color-secondary-hover: ${(currentColors.secondary || currentColors.primary)}dd;
  --color-accent: ${currentColors.accent || currentColors.primary};
  
  /* Background Colors */
  --color-background: ${currentColors.background || '#ffffff'};
  --color-surface: ${currentColors.surface || '#f3f4f6'};
  --color-surface-hover: ${currentColors.surface || '#e5e7eb'};
  
  /* Text Colors */
  --color-text-primary: ${currentColors.textPrimary || '#1f2937'};
  --color-text-secondary: ${currentColors.textSecondary || '#6b7280'};
  --color-text-inverse: ${currentColors.background || '#ffffff'};
  
  /* Semantic Colors */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Border Colors */
  --color-border: #e5e7eb;
  --color-border-focus: ${currentColors.primary};
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary || currentColors.primary});
  --gradient-surface: linear-gradient(180deg, ${currentColors.surface || '#f3f4f6'} 0%, ${currentColors.background || '#ffffff'} 100%);
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  
  /* Typography */
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  
  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
}

/* Button Component Tokens */
.btn {
  --btn-primary-bg: var(--color-primary);
  --btn-primary-text: white;
  --btn-primary-hover: var(--color-primary-hover);
  --btn-secondary-bg: var(--color-surface);
  --btn-secondary-text: var(--color-text-primary);
  --btn-outline-border: var(--color-border);
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: 500;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  cursor: pointer;
}

.btn-primary {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: none;
}

.btn-primary:hover {
  background: var(--btn-primary-hover);
}

/* Card Component Tokens */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}

/* Input Component Tokens */
.input {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-primary);
}

.input:focus {
  border-color: var(--color-border-focus);
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

/* Badge Component Tokens */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border-radius: var(--radius-full);
}

.badge-success {
  background: #dcfce7;
  color: #166534;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-error {
  background: #fee2e2);
  color: #991b1b;
}

.badge-info {
  background: #dbeafe);
  color: #1e40af;
}

/* Spinner Component Tokens */
.spinner {
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Toast/Notification Tokens */
.toast {
  background: #1f2937;
  color: white;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
}`;

  const handleCopyCSS = async () => {
    await navigator.clipboard.writeText(cssVariables);
    setCopied(true);
    toast.success('Full CSS exported to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Full Theme to Figma</h3>
        <button
          onClick={handleCopyCSS}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {copied ? 'Copied!' : 'Copy All CSS'}
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Exports all CSS custom properties, component tokens, shadows, and colors for use in Figma design files.
      </p>

      <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 font-mono text-xs max-h-64 overflow-auto">
        <pre className="text-green-400 whitespace-pre-wrap">{cssVariables}</pre>
      </div>

      {/* Color Swatches */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: currentColors.primary }}>
          <p className="text-white text-xs font-bold">Primary</p>
          <p className="text-white/80 text-xs">{currentColors.primary}</p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: currentColors.secondary || currentColors.primary }}>
          <p className="text-white text-xs font-bold">Secondary</p>
          <p className="text-white/80 text-xs">{currentColors.secondary || currentColors.primary}</p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: currentColors.background || '#ffffff', border: '1px solid #e5e7eb' }}>
          <p className="text-gray-900 text-xs font-bold">Background</p>
          <p className="text-gray-500 text-xs">{currentColors.background || '#fff'}</p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ backgroundColor: currentColors.surface || '#f3f4f6', border: '1px solid #e5e7eb' }}>
          <p className="text-gray-900 text-xs font-bold">Surface</p>
          <p className="text-gray-500 text-xs">{currentColors.surface || '#f3f4f6'}</p>
        </div>
      </div>
    </motion.div>
  );
}