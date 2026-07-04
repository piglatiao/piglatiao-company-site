/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1A1A1A',
          light: '#3D3D3D',
          muted: '#6B6B6B',
          faint: '#9A9A95',
        },
        paper: {
          DEFAULT: '#FAFAF7',
          warm: '#F5F3EE',
          card: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#C8553D',
          light: '#D9705B',
          dark: '#A04432',
          subtle: '#FDF0ED',
        },
        line: {
          DEFAULT: '#E5E3DE',
          warm: '#D9D6D0',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Noto Serif SC"', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
        reading: '680px',
      },
      letterSpacing: {
        tightest: '-0.04em',
        editorial: '-0.02em',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-in': 'slideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
