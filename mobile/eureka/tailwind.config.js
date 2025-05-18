const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#ffffff',
          dark: '#020617', // slate-950
        },
        foreground: {
          DEFAULT: '#0f172a', // slate-900
          dark: '#ffffff',
        },
        'muted-foreground': {
          DEFAULT: '#64748b', // slate-500
          dark: '#94a3b8', // slate-400
        },
        card: {
          DEFAULT: '#ffffff',
          dark: '#1e293b', // slate-800
        },
        primary: {
          DEFAULT: '#7c3aed', // violet-600
          dark: '#8b5cf6', // violet-500
        },
        border: {
          DEFAULT: '#e2e8f0', // slate-200
          dark: '#334155', // slate-700
        },
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
