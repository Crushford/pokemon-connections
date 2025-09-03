/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom Pokemon type colors
        pokemon: {
          fire: '#ef4444',
          water: '#3b82f6',
          grass: '#10b981',
          electric: '#fbbf24',
          ice: '#06b6d4',
          fighting: '#dc2626',
          poison: '#8b5cf6',
          ground: '#d97706',
          flying: '#818cf8',
          psychic: '#ec4899',
          bug: '#84cc16',
          rock: '#92400e',
          ghost: '#7c3aed',
          dragon: '#4338ca',
          dark: '#374151',
          steel: '#6b7280',
          fairy: '#f9a8d4'
        }
      }
    }
  },
  plugins: []
}
