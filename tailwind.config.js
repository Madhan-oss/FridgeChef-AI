/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B35",
          50: "#FFF3EE",
          100: "#FFE4D6",
          200: "#FFC8AD",
          300: "#FFA876",
          400: "#FF8A4E",
          500: "#FF6B35",
          600: "#F04D12",
          700: "#C93D0C",
          800: "#A23012",
          900: "#842B14",
        },
        secondary: {
          DEFAULT: "#2D9C6B",
          50: "#EDFAF3",
          100: "#D3F4E3",
          200: "#A9E7C9",
          300: "#6FD4A6",
          400: "#3CBD83",
          500: "#2D9C6B",
          600: "#227D55",
          700: "#1C6345",
          800: "#175036",
          900: "#12402B",
        },
        accent: {
          DEFAULT: "#F7C948",
          50: "#FFFBEC",
          100: "#FFF5CC",
          200: "#FFE999",
          300: "#FFD952",
          400: "#F7C948",
          500: "#E5AF1F",
          600: "#C98B10",
          700: "#A36912",
          800: "#865316",
          900: "#714517",
        },
        surface: {
          DEFAULT: "#FDFCFB",
          100: "#FFF8F4",
          200: "#FFF2EA",
        },
        border: {
          DEFAULT: "#F0EAE4",
          light: "#F7F2EE",
        },
        textmuted: "#7A6A5A",
        textdark: "#1A1008",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        card: "0 2px 20px rgba(255, 107, 53, 0.06), 0 1px 4px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 40px rgba(255, 107, 53, 0.12), 0 2px 8px rgba(0,0,0,0.06)",
        glow: "0 0 30px rgba(255, 107, 53, 0.2)",
        "glow-green": "0 0 20px rgba(45, 156, 107, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        shimmer: "shimmer 1.5s linear infinite",
        "bounce-in": "bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceIn: {
          "0%": { transform: "scale(0)", opacity: 0 },
          "60%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
