/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,html}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d8f0ff',
          200: '#b9e7ff',
          300: '#89d8ff',
          400: '#52bfff',
          500: '#2a9dff',
          600: '#147bea',
          700: '#1262bd',
          800: '#15539a',
          900: '#17467a',
          950: '#102d4f'
        },
        accent: {
          400: '#38d9a9',
          500: '#20c997',
          600: '#12b886'
        }
      },
      boxShadow: {
        soft: '0 20px 45px -25px rgba(15, 23, 42, .35)',
        glow: '0 0 40px rgba(42, 157, 255, .16)'
      },
      animation: {
        'fade-in': 'fadeIn .24s ease-out',
        'slide-up': 'slideUp .28s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '.65' },
          '50%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
};
