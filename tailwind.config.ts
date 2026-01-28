import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        'primary-light': '#14b8a6',
        'primary-dark': '#0d5c56',
        secondary: '#14b8a6',
        accent: '#5eead4',
        background: '#020617',
        surface: '#0f172a',
        'surface-hover': '#1e293b',
        'surface-active': '#334155',
        'text-primary': '#e5e7eb',
        'text-secondary': '#9ca3af',
        'text-muted': '#6b7280',
      },
    },
  },
  plugins: [],
};

export default config;
