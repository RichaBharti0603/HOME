/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA', // Soft light gray
        surface: '#FFFFFF', // Pure white
        border: '#E5E7EB', // Gray 200
        foreground: '#111827', // Gray 900
        muted: '#6B7280', // Gray 500
        accent: {
          primary: '#4F46E5',   // Indigo 600
          secondary: '#818CF8', // Indigo 400
          glow: 'rgba(79, 70, 229, 0.15)',
        },
        status: {
          up: '#10B981', // Emerald 500
          down: '#EF4444', // Red 500
          warn: '#F59E0B', // Amber 500
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
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'accent-glow': '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
      }
    },
  },
  plugins: [],
}
