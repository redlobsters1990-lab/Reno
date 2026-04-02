import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./server/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b1020",
        foreground: "#f8fafc",
        muted: "#94a3b8",
        card: "#111827",
        accent: "#8b5cf6",
        accentSoft: "#1f1538",
        border: "rgba(148,163,184,0.2)",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(139,92,246,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
