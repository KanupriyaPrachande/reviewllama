/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#F7F5EF',
          panel: '#FFFFFF',
          raised: '#FBFAF6',
          inset: '#EFEBE1',
        },
        border: {
          DEFAULT: '#E3DECE',
          subtle: '#ECE7DA',
        },
        text: {
          primary: '#1A1916',
          secondary: '#4A4538',
          tertiary: '#7A7464',
        },
        sage: {
          DEFAULT: '#5C6B4F',
          deep: '#3F4A38',
          bg: '#E8EBE0',
        },
        brass: {
          DEFAULT: '#B8893F',
          deep: '#92692C',
          bg: '#F3E8D3',
        },
        teal: {
          DEFAULT: '#2C5F5A',
          deep: '#1E4642',
          bg: '#DEEAE8',
        },
        diff: {
          add: '#4F7A4A',
          addBg: '#E5EEE0',
          remove: '#A8463B',
          removeBg: '#F3E2DE',
        },
        severity: {
          critical: '#A8463B',
          criticalBg: '#F3E2DE',
          warning: '#B8893F',
          warningBg: '#F3E8D3',
          info: '#2C5F5A',
          infoBg: '#DEEAE8',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Source Serif 4"', 'Georgia', 'serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
