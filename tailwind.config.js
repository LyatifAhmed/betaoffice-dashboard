/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./app/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          beta: {
            blue: "#2563eb",
            green: "#10b981",
            dark: "#1f2937",
          },
        },
      },
    },
    plugins: [],
  };
  