/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', '"Noto Sans SC"', "sans-serif"],
        body: ['"DM Sans"', '"Noto Sans SC"', "sans-serif"],
      },
      colors: {
        ink: "#07111f",
        sand: "#f5efe6",
        ember: "#fb7c32",
        tide: "#0f766e",
        sky: "#0d5c9c",
        aurora: "#1b2940",
        pearl: "#fff8f1",
        mist: "#edf4fb",
        gold: "#d9b36c",
      },
      boxShadow: {
        glow: "0 28px 80px rgba(8, 17, 31, 0.12)",
        luxe: "0 36px 100px rgba(9, 20, 38, 0.18)",
      },
    },
  },
  plugins: [],
};
