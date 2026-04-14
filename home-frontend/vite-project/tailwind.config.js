/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ededed',
        accent: {
          primary: '#0070f3',
          secondary: '#7928ca',
        },
        card: {
          DEFAULT: 'rgba(17, 17, 17, 0.8)',
          hover: 'rgba(25, 25, 25, 0.9)',
        },
        border: 'rgba(255, 255, 255, 0.1)',
      },
      borderRadius: {
        'premium': '12px',
      },
      backdropBlur: {
        'glass': '12px',
      }
    },
  },
  plugins: [],
}
