/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Soft, user-friendly status colors (neither too bright nor too dark)
        status: {
          offer: {
            bg: '#f0fdf4',
            border: '#86efac',
            text: '#14532d',
            badge: '#15803d',
          },
          interview: {
            bg: '#fefce8',
            border: '#fde047',
            text: '#854d0e',
            badge: '#b45309',
          },
          rejected: {
            bg: '#fff1f2',
            border: '#fecdd3',
            text: '#881337',
            badge: '#be123c',
          },
          applied: {
            bg: '#f0f9ff',
            border: '#bae6fd',
            text: '#075985',
            badge: '#0369a1',
          },
          saved: {
            bg: '#f8fafc',
            border: '#e2e8f0',
            text: '#334155',
            badge: '#64748b',
          }
        }
      }
    },
  },
  plugins: [],
};
