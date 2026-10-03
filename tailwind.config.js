/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4DA8FF',
          strong: '#2B8CEB',
          soft: '#E8F3FF',
          wash: '#F5FAFF',
        },
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#0F1B2D',
          muted: '#5B6B80',
        },
        border: {
          DEFAULT: '#E3ECF5',
        },
        success: '#22B07D',
        warning: '#F5A524',
        danger: '#E5484D',
        women: {
          DEFAULT: '#B084F5',
          bg: '#F3ECFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(43, 140, 235, 0.10)',
        'sheet': '0 -8px 32px rgba(15, 27, 45, 0.08)',
        'floating': '0 4px 16px rgba(15, 27, 45, 0.12)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '14px',
        'sheet': '24px',
      },
      transitionTimingFunction: {
        'out-smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
