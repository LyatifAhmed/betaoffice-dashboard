// tailwind.config.js
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
      },
      animation: {
        rainbowOrbit: 'rainbowOrbit 5s linear infinite',
      },
    },
  },
  plugins: [],
};
