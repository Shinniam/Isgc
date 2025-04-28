/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "media", // システムのダークモードに応じて切り替え
  theme: {
    extend: {},
  },
  plugins: [],
};
