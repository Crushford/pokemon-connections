/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
        },
        'bounce-in': {
          '0%': { transform: 'translateY(-100px)', opacity: '0' },
          '50%': { transform: 'translateY(10px)', opacity: '1' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        shake: 'shake 0.6s ease-in-out',
        'bounce-in': 'bounce-in 0.6s ease-out'
      }
    }
  },
  plugins: []
}
