/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        rainbowOrbit: {
          '0%':   { boxShadow: '0 0 30px 10px rgba(255,0,122,0.95)' },
          '20%':  { boxShadow: '0 0 35px 12px rgba(0,200,255,0.95)' },
          '40%':  { boxShadow: '0 0 35px 12px rgba(0,255,133,0.95)' },
          '60%':  { boxShadow: '0 0 35px 12px rgba(255,255,0,0.95)' },
          '80%':  { boxShadow: '0 0 35px 12px rgba(255,102,0,0.95)' },
          '100%': { boxShadow: '0 0 30px 10px rgba(255,0,122,0.95)' },
        },
        breath: {
          '0%, 100%': {
            boxShadow: '0 0 30px rgba(0, 195, 255, 0.1)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 195, 255, 0.2)',
          },
        },
        excite: {
          '0%': {
            boxShadow: '0 0 0 rgba(0,195,255,0)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(0,195,255,0.3)',
            transform: 'scale(1.02)',
          },
          '100%': {
            boxShadow: '0 0 50px rgba(0,195,255,0.4)',
            transform: 'scale(1)',
          },
        },
      },
      animation: {
        rainbowOrbit: 'rainbowOrbit 5s linear infinite',
        breath: 'breath 3s ease-in-out infinite',
        excite: 'excite 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};
