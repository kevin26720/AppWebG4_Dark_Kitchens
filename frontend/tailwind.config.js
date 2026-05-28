/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#E63946', // Rojo catering
        'primary-dark': '#D62828',
        'secondary': '#F5F5F5', // Gris claro
        'text-dark': '#333333',
        'text-light': '#666666',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
