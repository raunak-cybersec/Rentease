/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#080810',
        'indigo': '#6366f1',
        'emerald': '#10b981',
      },
      fontFamily: {
        'syne': ['Syne', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'lift': 'lift 0.3s ease-out',
      },
      keyframes: {
        lift: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-4px)' },
        },
      },
      backdropBlur: {
        'md': '10px',
      },
    },
  },
  plugins: [],
};
