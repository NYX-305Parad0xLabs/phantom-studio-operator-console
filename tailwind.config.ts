import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./docs/**/*.md",
  ],
  theme: {
    extend: {
      colors: {
        "paradox-gray": {
          900: "#050510",
          800: "#111124",
          700: "#1e1f3e",
          600: "#27284b",
          500: "#31325a",
        },
        "paradox-accent": "#7c5cff",
        "paradox-emerald": "#29d398",
        "paradox-amber": "#f5a524",
        "paradox-surface": "#13132a",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
