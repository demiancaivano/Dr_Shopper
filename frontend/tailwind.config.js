/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-main': '#2563eb',
        'blue-accent': '#3b82f6',
        'blue-light': '#60a5fa',
        'blue-dark': '#1e293b',
        'blue-back': '#11182c',
        'blue-azure': '#007FFF',
        'blue-border': '#1e40af',
        'blue-muted': '#64748b',
        white: '#ffffff',
        black: '#0a0a0a',
        primary: "#1e293b",
        accent: "#3b82f6",
        back: "#11182c",
        azure: {
          DEFAULT: "#007FFF",      // Azure Radiance
          light: "#60AFFF",
          dark: "#0059B2",
        },
        success: "#22c55e",
        warning: "#facc15",
        danger: "#ef4444",
        info: "#0ea5e9",
        mariner: {
          50: '#f2f7fd',
          100: '#e4edfa',
          200: '#c3d9f4',
          300: '#8fbbea',
          400: '#5397dd',
          500: '#2a73c0',
          600: '#1d5eac',
          700: '#194c8b',
          800: '#184174',
          900: '#1a3860',
          950: '#112340',
        },
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

