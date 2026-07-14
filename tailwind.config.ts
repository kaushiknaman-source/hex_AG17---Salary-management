import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Arial", "Helvetica", "sans-serif"],
      },
      colors: {
        // Hexagon official brand palette (see Hexagon_Colours.txt) — exact hex values,
        // unaltered. On light surfaces, components use the "-dark" variant for text/
        // icons per the brand guide's own hyperlink standard ("Light Mode Only: Primary
        // Sky Dark"), and the DEFAULT/accent tones for fills, charts, and tinted chips.
        sky: {
          DEFAULT: "#01ADFF",
          dark: "#005198",
          accent: "#99D6FF",
        },
        land: {
          DEFAULT: "#83C410",
          dark: "#28721E",
          accent: "#DFF73F",
        },
        sea: {
          DEFAULT: "#04D0E6",
          dark: "#106B73",
          accent: "#7DFFFC",
        },
        bg: {
          dark: "#00284C",
          white: "#FFFFFF",
        },
        neutral: {
          100: "#E7E8E9",
          400: "#B9B9BD",
          600: "#71737B",
          800: "#41454F",
          950: "#000000",
        },
        warn: "#FFC505",
        danger: "#FA4C40",
        // Semantic tokens — light, minimal content surface. Sidebar / floating
        // widgets hardcode their own dark surface independent of these tokens.
        border: "#1E2A3E",
        input: "#1E2A3E",
        ring: "#01ADFF",
        background: "#0A1220",
        foreground: "#EAF2FA",
        card: {
          DEFAULT: "#101B2E",
          foreground: "#EAF2FA",
        },
        popover: {
          DEFAULT: "#101B2E",
          foreground: "#EAF2FA",
        },
        primary: {
          DEFAULT: "#01ADFF",
          foreground: "#00161F",
        },
        secondary: {
          DEFAULT: "#16233A",
          foreground: "#EAF2FA",
        },
        muted: {
          DEFAULT: "#16233A",
          foreground: "#8DA3BB",
        },
        accent: {
          DEFAULT: "#04D0E6",
          foreground: "#00161F",
        },
        destructive: {
          DEFAULT: "#FA4C40",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "6px",
        xl: "12px",
        "2xl": "12px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(16,24,40,0.05)",
        sm: "0 1px 2px rgba(16,24,40,0.06), 0 1px 1px rgba(16,24,40,0.04)",
        card: "0 1px 2px rgba(16,24,40,0.04)",
      },
      backgroundImage: {
        "hex-grid":
          "radial-gradient(circle at 1px 1px, rgba(1,173,255,0.14) 1px, transparent 0)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(3deg)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(4,208,230,0.45)" },
          "100%": { boxShadow: "0 0 0 14px rgba(4,208,230,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 8s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
