/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coffee: {
          50:  '#FDF5E6',
          100: '#FAE9C8',
          200: '#F5D099',
          300: '#EDB96B',
          400: '#D2691E',
          500: '#A0522D',
          600: '#8B4513',
          700: '#6B3410',
          800: '#5C3317',
          900: '#2C1810',
        },
        cream: {
          50:  '#FFFEF9',
          100: '#FDF5E6',
          200: '#F5ECD6',
        },
        steam: {
          100: '#E8F4F8',
          200: '#C5DDE8',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'coffee': '0 4px 20px -2px rgba(92, 51, 23, 0.25)',
        'coffee-lg': '0 10px 40px -4px rgba(92, 51, 23, 0.35)',
        'card': '0 2px 12px rgba(44, 24, 16, 0.08)',
        'card-hover': '0 8px 24px rgba(44, 24, 16, 0.15)',
      },
      backgroundImage: {
        'coffee-gradient': 'linear-gradient(135deg, #5C3317 0%, #8B4513 50%, #A0522D 100%)',
        'cream-gradient': 'linear-gradient(180deg, #FDF5E6 0%, #FAE9C8 100%)',
        'warm-gradient': 'linear-gradient(135deg, #2C1810 0%, #5C3317 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.25s ease-out',
        'bounce-gentle': 'bounceGentle 0.4s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        bounceGentle: {
          '0%': { transform: 'scale(0.95)' },
          '60%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
