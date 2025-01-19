/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: '#FFCCE1',
        teal: '#B2E4E5',
        cream: '#FFF5D7',
        darkText: '#333333',
        tealDark: '#037c6e'
      },
      fontFamily: {
        'playwrite-in': ['"Playwrite IN"', 'serif'],
      },
    },
  },
  plugins: [],
}

