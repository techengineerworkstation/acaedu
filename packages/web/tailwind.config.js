/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // These will be overridden by CSS variables at runtime
        primary: {
          50: 'var(--color-primary-50, #EFF6FF)',
          100: 'var(--color-primary-100, #DBEAFE)',
          200: 'var(--color-primary-200, #BFDBFE)',
          300: 'var(--color-primary-300, #93C5FD)',
          400: 'var(--color-primary-400, #60A5FA)',
          500: 'var(--color-primary-500, #3B82F6)',
          600: 'var(--color-primary-600, #2563EB)',
          700: 'var(--color-primary-700, #1D4ED8)',
          800: 'var(--color-primary-800, #1E40AF)',
          900: 'var(--color-primary-900, #1E3A8A)',
        },
        secondary: {
          50: 'var(--color-secondary-50, #f5f3ff)',
          100: 'var(--color-secondary-100, #ede9fe)',
          200: 'var(--color-secondary-200, #ddd6fe)',
          300: 'var(--color-secondary-300, #c4b5fd)',
          400: 'var(--color-secondary-400, #a78bfa)',
          500: 'var(--color-secondary-500, #8b5cf6)',
          600: 'var(--color-secondary-600, #7c3aed)',
          700: 'var(--color-secondary-700, #6d28d9)',
          800: 'var(--color-secondary-800, #5b21b6)',
          900: 'var(--color-secondary-900, #4c1d95)',
        },
        accent: {
          50: 'var(--color-accent-50, #fffbeb)',
          100: 'var(--color-accent-100, #fef3c7)',
          200: 'var(--color-accent-200, #fde68a)',
          300: 'var(--color-accent-300, #fcd34d)',
          400: 'var(--color-accent-400, #fbbf24)',
          500: 'var(--color-accent-500, #f59e0b)',
          600: 'var(--color-accent-600, #d97706)',
          700: 'var(--color-accent-700, #b45309)',
          800: 'var(--color-accent-800, #92400e)',
          900: 'var(--color-accent-900, #78350f)',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669'
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706'
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      // African-inspired border radius (slightly more organic)
      borderRadius: {
        'african': '0.75rem', // slightly softer
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
};
