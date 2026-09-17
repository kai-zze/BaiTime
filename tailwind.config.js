/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF5B00",
          orangeHover: "#E05000",
          navy: "#0B152C",
          navyCard: "#121F3E",
          navyBorder: "#1D2D54",
          lightBg: "#F8FAFC",
          lightCard: "#FFFFFF",
          lightBorder: "#E2E8F0",
        },
        defense: {
          bg: "#0B152C",
          card: "#121F3E",
          cardBorder: "#1D2D54",
          primary: "#FF5B00",
          accent: "#38BDF8",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          overtime: "#DC2626",
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-orange': 'glowOrange 2s infinite alternate',
      },
      keyframes: {
        glowOrange: {
          '0%': { boxShadow: '0 0 15px rgba(255, 91, 0, 0.4)' },
          '100%': { boxShadow: '0 0 35px rgba(255, 91, 0, 0.9)' },
        }
      }
    },
  },
  plugins: [],
}
