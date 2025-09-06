import type { PokemonLite } from '../types'

export default function PokemonCard({
  mon,
  selected,
  onSelect,
  onPokedexLookup,
  shake = false,
  disabled = false
}: {
  mon: PokemonLite
  selected: boolean
  onSelect: () => void
  onPokedexLookup: () => void
  shake?: boolean
  disabled?: boolean
}) {
  return (
    <div
      role="group"
      aria-roledescription="Pokémon card"
      tabIndex={0}
      className={[
        'relative w-full h-full',
        'border-2 bg-white',
        disabled
          ? 'border-zinc-300 bg-zinc-100 opacity-60 cursor-not-allowed'
          : selected
          ? 'border-indigo-600 shadow-lg shadow-indigo-200'
          : 'border-zinc-200 hover:border-zinc-400 hover:shadow-md',
        !disabled &&
          'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1',
        !disabled && 'cursor-pointer transition-all duration-200 ease-in-out',
        !disabled && 'hover:scale-[1.02] active:scale-[0.98]',
        shake ? 'animate-shake' : ''
      ].join(' ')}
      onClick={disabled ? undefined : onSelect}
    >
      {/* Pokedex lookup icon - top right corner */}
      <button
        type="button"
        aria-label="Pokedex"
        title="You can click this to learn more about this pokemon"
        onClick={e => {
          e.stopPropagation()
          onPokedexLookup()
        }}
        className="absolute top-1 right-1 z-10 h-6 w-6 flex items-center justify-center hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition-all duration-150"
      >
        <img
          src="/src/assets/pokedex.png"
          alt="Pokedex"
          width="16"
          height="16"
        />
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
      <div className="absolute inset-0 flex items-center justify-center">
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
