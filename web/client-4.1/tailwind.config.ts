import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

export default {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/components/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/pages/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/**/*.{ts,tsx,js,jsx,mdx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ff7f32", // laranja vibrante
          50: "#fff8f3",
          100: "#ffe0c2",
          200: "#ffd580",
          300: "#ffb347",
          400: "#ff9800",
          500: "#ff7f32",
          600: "#e86c1a",
          700: "#b45309",
          800: "#8a3c00",
          900: "#5a2600",
          foreground: "#fff"
        },
        secondary: {
          DEFAULT: "#ffb347",
          50: "#fff8f3",
          100: "#ffe0c2",
          200: "#ffd580",
          300: "#ffb347",
          400: "#ff9800",
          500: "#ff7f32",
          600: "#e86c1a",
          700: "#b45309",
          800: "#8a3c00",
          900: "#5a2600",
          foreground: "#1e293b"
        },
        accent: {
          DEFAULT: "#ffd580",
          100: "#fff8f3",
          200: "#ffe0c2",
          300: "#ffd580",
          400: "#ffb347",
          500: "#ff9800",
          600: "#ff7f32",
          700: "#e86c1a",
          800: "#b45309",
          900: "#8a3c00",
          foreground: "#1e293b"
        },
        background: "#fff8f3",
        card: "#fff",
        border: "#ffe0c2",
        muted: "#b45309"
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["Fira Mono", ...defaultTheme.fontFamily.mono]
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.25rem",
        lg: "1rem"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config
