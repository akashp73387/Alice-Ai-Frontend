/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark_background: '#343541',
        dark_textcolor: '#ECECF1'
      }
    },
  },
  plugins: [],
};