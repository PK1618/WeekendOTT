/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "sans-serif"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      aspectRatio: {
        "2/3": "2 / 3",
      },
    },
  },
  plugins: [],
};
