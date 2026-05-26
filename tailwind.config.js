/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Identidad Casas de Vida — azul índigo + naranja
        primary: { DEFAULT: '#3B3B8E', light: '#EBEBF8', dark: '#2A2A6B' },
        // Acento naranja para destacar ofrendas, reportes positivos
        teal:    { DEFAULT: '#F7941D', light: '#FEF3E2', dark: '#C4700A' },
        orange:  { DEFAULT: '#F7941D', light: '#FEF3E2' },
      },
      fontFamily: { sans: ['Inter', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
}
