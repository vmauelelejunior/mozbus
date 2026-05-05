/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        aura: {
          bg: "var(--aura-bg)",
          surface: "var(--aura-surface)",
          border: "var(--aura-border)",
          text: "var(--aura-text)",
          muted: "var(--aura-muted)",
          accent: "var(--aura-accent)",
        },
        primary: {
          DEFAULT: "#f97316",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0f172a",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};
