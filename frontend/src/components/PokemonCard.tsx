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
        'border-2 border-zinc-300 bg-white',
        selected
          ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-lg'
          : 'hover:border-zinc-400 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-indigo-400',
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
