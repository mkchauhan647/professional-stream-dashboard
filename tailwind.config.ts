/** @type {import('tailwindcss').Config} */
export default {
  // The 'content' array is no longer needed in v4 with the Vite plugin!
  // content: [
  //   "./index.html",
  //   "./src/**/*.{js,ts,jsx,tsx}",
  // ],
  theme: {
    extend: {
      colors: {
        primary: '#6a11cb',
        secondary: '#2575fc',
        danger: {
          DEFAULT: '#ff416c',
          hover: '#ff4b2b',
        },
        success: '#00b09b',
        warning: '#ff8c00',
        dark: '#121212',
        darker: '#0a0a0a',
        light: '#f8f9fa',
        gray: {
          DEFAULT: '#2d2d2d',
          dark: 'rgba(20, 20, 20, 0.6)',
          light: 'rgba(30, 30, 30, 0.4)'
        },
        border: 'rgba(255,255,255,0.1)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        pulse: 'pulse 1.5s infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}