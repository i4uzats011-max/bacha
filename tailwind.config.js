/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bubble: ['Fredoka', 'sans-serif'],
        reading: ['Nunito', 'sans-serif'],
      },
      colors: {
        kidYellow: '#FFD124',
        kidOrange: '#FF6B35',
        kidPink: '#FF4D80',
        kidPurple: '#7B2CBF',
        kidBlue: '#2A9D8F',
        kidSky: '#3A86FF',
        kidGreen: '#06D6A0',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}
