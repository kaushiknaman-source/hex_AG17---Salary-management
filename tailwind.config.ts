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
        // Hexagon official brand palette (see Hexagon_Colours.txt)
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
        border: "hsl(215 30% 22%)",
        input: "hsl(215 30% 22%)",
        ring: "#01ADFF",
        background: "#03101F",
        foreground: "#EAF2FA",
        card: {
          DEFAULT: "#0A1B30",
          foreground: "#EAF2FA",
        },
        popover: {
          DEFAULT: "#0A1B30",
          foreground: "#EAF2FA",
        },
        primary: {
          DEFAULT: "#01ADFF",
          foreground: "#00161F",
        },
        secondary: {
          DEFAULT: "#122A44",
          foreground: "#EAF2FA",
        },
        muted: {
          DEFAULT: "#122A44",
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
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
        xl: "1.25rem",
        "2xl": "1.75rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(1,173,255,0.15), 0 8px 40px -8px rgba(1,173,255,0.35)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -20px rgba(0,0,0,0.6)",
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
