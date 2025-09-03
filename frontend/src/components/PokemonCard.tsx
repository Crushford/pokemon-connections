import type { PokemonLite } from '../types'

export default function PokemonCard({
  mon,
  selected,
  onSelect,
  onPokedexLookup
}: {
  mon: PokemonLite
  selected: boolean
  onSelect: () => void
  onPokedexLookup: () => void
}) {
  return (
    <div
      role="group"
      aria-roledescription="Pokémon card"
      tabIndex={0}
      className={[
        'relative w-full h-full',
        'border-2 bg-white',
        selected
          ? 'border-indigo-600 shadow-lg shadow-indigo-200'
          : 'border-zinc-200 hover:border-zinc-400 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1',
        'cursor-pointer transition-all duration-200 ease-in-out',
        'hover:scale-[1.02] active:scale-[0.98]'
      ].join(' ')}
      onClick={onSelect}
    >
      {/* Pokedex lookup icon - top right corner */}
      <button
        type="button"
        aria-label={`Look up ${mon.name} in Pokédex`}
        title="Look up in Pokédex"
        onClick={e => {
          e.stopPropagation()
          onPokedexLookup()
        }}
        className={[
          'absolute top-2 right-2 z-10',
          'h-7 w-7 rounded-full border-2 border-blue-300 bg-blue-500',
          'flex items-center justify-center text-white text-sm font-bold',
          'hover:bg-blue-600 hover:border-blue-400 hover:scale-110',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1',
          'transition-all duration-150 shadow-md hover:shadow-lg'
        ].join(' ')}
      >
        ℹ
      </button>

      {/* Selection indicator - top left corner */}
      {selected && (
        <div className="absolute top-2 left-2 z-10 h-7 w-7 rounded-full bg-green-500 border-2 border-green-400 flex items-center justify-center shadow-md">
          <svg
            className="h-4 w-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Pokemon image - centered and maximized */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {mon.spriteUrl ? (
          <img
            src={mon.spriteUrl}
            alt={mon.name}
            className="h-full w-full object-contain max-h-full max-w-full"
          />
        ) : (
          <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-zinc-500 text-xs font-medium">?</span>
          </div>
        )}
      </div>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-400"></div>
      </div>
    </div>
  )
}
