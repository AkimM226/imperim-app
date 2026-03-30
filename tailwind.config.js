/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          gold: '#D4AF37',
          dark: '#0a0a0a',
          card: '#121212',
          danger: '#ef4444',
          success: '#10b981',
        },
        fontFamily: {
          serif: ['Cinzel', 'serif'],
          sans: ['Inter', 'sans-serif'],
        }
      }
    },
    plugins: [],
  }