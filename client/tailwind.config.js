/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#e8edf4', 100: '#c5d0e0', 200: '#9eafca', 300: '#7790b4', 400: '#5a79a4', 500: '#3d6294', 600: '#2d4a73', 700: '#1e3352', 800: '#152742', 900: '#0D1B2A' },
        gold: { 50: '#fff9e6', 100: '#ffedb3', 200: '#ffe180', 300: '#ffd54d', 400: '#ffca28', 500: '#F9A825', 600: '#e09520', 700: '#c7821b', 800: '#a86e17', 900: '#8a5a12' },
        dark: '#1A1A2E',
        softwhite: '#F5F7FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
