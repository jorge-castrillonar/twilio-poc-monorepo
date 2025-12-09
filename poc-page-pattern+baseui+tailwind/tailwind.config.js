/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Twilio Design System color tokens
        'twilio-blue': '#0263E0',
        'twilio-blue-dark': '#001489',
        'twilio-red': '#F22F46',
        'twilio-green': '#14B053',
        'twilio-purple': '#6E40C0',
        'twilio-gray': {
          50: '#F7F7F7',
          100: '#EAEAEA',
          200: '#CACACA',
          300: '#A0A0A0',
          400: '#707070',
          500: '#4A4A4A',
          600: '#2A2A2A',
          700: '#1A1A1A',
          800: '#0A0A0A',
          900: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
