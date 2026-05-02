/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F0F2F5', // Softer, more modern slate background (like Image 1)
        surface: '#FFFFFF', // Pure white
        border: '#EAECEF', // Very soft border
        foreground: '#0F172A', // Slate 900
        muted: '#64748B', // Slate 500
        accent: {
          primary: '#3B82F6',   // Blue 500 (Clean, professional blue like references)
          secondary: '#60A5FA', // Blue 400
          glow: 'rgba(59, 130, 246, 0.15)',
        },
        status: {
          up: '#10B981', // Emerald 500
          down: '#EF4444', // Red 500
          warn: '#F59E0B', // Amber 500
        }
      },
      borderRadius: {
        'bento': '24px',
        'premium': '16px',
        'pill': '9999px',
        'xl': '12px',
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'floating': '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 10px 15px -3px rgba(0, 0, 0, 0.04)',
        'accent-glow': '0 8px 20px 0 rgba(59, 130, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
