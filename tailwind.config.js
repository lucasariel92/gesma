/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066B3',
          light: '#3385C7',
          dark: '#004D87',
        },
        accent: {
          DEFAULT: '#C4D600',
          light: '#D4E333',
          dark: '#A3B300',
        },
        dark: {
          DEFAULT: '#1A1A1A',
          light: '#2D2D2D',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      }
    },
  },
  plugins: [],
}