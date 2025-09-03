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
        'relative w-full h-full overflow-hidden',
        'border border-zinc-300 bg-zinc-50',
        selected ? 'ring-2 ring-indigo-500 border-indigo-500' : '',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500',
        'cursor-pointer'
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
          'absolute top-2 right-2 z-20',
          'h-6 w-6 rounded-full border border-zinc-300 bg-white',
          'flex items-center justify-center text-zinc-600 text-xs',
          'hover:bg-zinc-100 hover:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500',
          'transition-colors duration-150'
        ].join(' ')}
      >
        ℹ
      </button>

      {/* Pokemon image and name */}
      <div className="absolute inset-0 p-3 flex flex-col justify-between items-center">
        <div className="flex-1 flex items-center justify-center pt-8">
          {mon.spriteUrl ? (
            <img
              src={mon.spriteUrl}
              alt={mon.name}
              className="h-16 w-16 object-contain sm:h-20 sm:w-20"
            />
          ) : (
            <div className="h-16 w-16 bg-zinc-200 rounded sm:h-20 sm:w-20" />
          )}
        </div>

        <div className="text-center">
          <div className="text-base font-semibold capitalize">{mon.name}</div>
        </div>
      </div>
    </div>
  )
}
