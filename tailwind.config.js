/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'neon-cyan': '#29ABE2',
        'dark-blue': '#0A1628',
        'glow-blue': '#00D4FF',
        'background': '#030712',
        'space-black': '#030712',
        'space-dark': '#070b14',
        'dark-gray': '#0e131f',
        'cyber-purple': '#a855f7',
        'cyber-pink': '#ec4899',
        'cyber-emerald': '#10b981',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-purple': 'glow-purple 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'typing': 'typing 3s steps(40, end)',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          'from': { textShadow: '0 0 10px rgba(41,171,226,0.3), 0 0 20px rgba(41,171,226,0.2)' },
          'to': { textShadow: '0 0 20px rgba(41,171,226,0.6), 0 0 35px rgba(0,212,255,0.4)' },
        },
        'glow-purple': {
          'from': { textShadow: '0 0 10px rgba(168,85,247,0.3), 0 0 20px rgba(168,85,247,0.2)' },
          'to': { textShadow: '0 0 20px rgba(168,85,247,0.6), 0 0 35px rgba(236,72,153,0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.3', filter: 'blur(80px)' },
          '50%': { opacity: '0.6', filter: 'blur(110px)' },
        }
      }
    },
  },
  plugins: [],
};