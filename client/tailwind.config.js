/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
      },
      colors: {
        slate: '#496580',
        peach: '#FFDBBB',
        sky: '#BADDFF',
        mint: '#BAFFF5',
        tint: '#E6F4FE',
        canvas: '#FDFDFD',
      },
    },
  },
  plugins: [],
}