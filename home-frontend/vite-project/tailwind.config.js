/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1220',
        surface: '#111827',
        border: '#1F2937',
        foreground: '#E2E8F0',
        muted: '#94A3B8',
        accent: {
          primary: '#6366F1',   // Indigo 500
          secondary: '#A855F7', // Purple 500
          glow: 'rgba(99, 102, 241, 0.15)',
        },
        status: {
          up: '#22C55E',
          down: '#EF4444',
          warn: '#F59E0B',
        }
      },
      borderRadius: {
        'premium': '16px',
        'xl': '12px',
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
        'accent-glow': '0 0 20px rgba(99, 102, 241, 0.3)',
      }
    },
  },
  plugins: [],
}
