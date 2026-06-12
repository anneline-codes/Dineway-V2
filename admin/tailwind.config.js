/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#C9A84C',
        'gold-light': '#E0BE6A',
        surface: '#1A1A1A',
        'surface-2': '#111111',
        border: '#222222',
      },
    },
  },
  plugins: [],
};
