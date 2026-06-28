import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  // darkMode disabled
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF8",
        surface: "#FFFFFF",
        "surface-muted": "#F4F4F1",
        border: "#E8E8E3",
        primary: {
          DEFAULT: "#34D399",
          dark: "#059669",
          light: "#ECFDF5",
        },
        "text-primary": "#111210",
        "text-secondary": "#6B7280",
        "text-muted": "#9CA3AF",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 30s linear infinite",
        "fade-up": "fade-up 0.3s ease-out forwards",
      },
    },
  },
  plugins: [animate],
};

export default config;
