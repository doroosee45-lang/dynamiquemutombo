/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rdc: {
          rouge: '#CE1126',
          bleu: '#007FFF',
          vert: '#009A44',
          jaune: '#F7D618',
        },
        dark: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a24',
          600: '#22222f',
          500: '#2d2d3d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-up': 'fade-up 0.4s ease-out',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(206, 17, 38, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(206, 17, 38, 0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-up': {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: []
};
