/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Identidad Centro Cristiano Cordero — teal/petrol oscuro
        primary: { DEFAULT: '#0E7773', light: '#DEF1EF', dark: '#08504D' },
        // Acento verde menta para resaltar ofrendas, reportes positivos
        teal:    { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#065F46' },
      },
      fontFamily: { sans: ['Inter', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
}
