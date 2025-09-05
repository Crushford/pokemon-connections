import type { PokemonLite } from '../types'

function TypeBadge({ t }: { t: string }) {
  // Pokemon type colors - using custom colors from Tailwind config
  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400 border-gray-500 text-white',
    fire: 'bg-pokemon-fire border-red-600 text-white',
    water: 'bg-pokemon-water border-blue-600 text-white',
    electric: 'bg-pokemon-electric border-yellow-500 text-gray-900',
    grass: 'bg-pokemon-grass border-green-600 text-white',
    ice: 'bg-pokemon-ice border-cyan-400 text-gray-900',
    fighting: 'bg-pokemon-fighting border-red-800 text-white',
    poison: 'bg-pokemon-poison border-purple-600 text-white',
    ground: 'bg-pokemon-ground border-amber-700 text-white',
    flying: 'bg-pokemon-flying border-indigo-500 text-white',
    psychic: 'bg-pokemon-psychic border-pink-600 text-white',
    bug: 'bg-pokemon-bug border-lime-600 text-white',
    rock: 'bg-pokemon-rock border-amber-900 text-white',
    ghost: 'bg-pokemon-ghost border-purple-800 text-white',
    dragon: 'bg-pokemon-dragon border-indigo-800 text-white',
    dark: 'bg-pokemon-dark border-gray-800 text-white',
    steel: 'bg-pokemon-steel border-gray-600 text-white',
    fairy: 'bg-pokemon-fairy border-pink-400 text-gray-900'
  }

  const colors =
    typeColors[t.toLowerCase()] || 'bg-gray-400 border-gray-500 text-white'

  return (
    <span
      className={`px-3 py-1.5 text-xs rounded-full border-2 font-bold uppercase tracking-wide shadow-sm ${colors}`}
    >
      {t}
    </span>
  )
}

function Stat({ label, v }: { label: string; v: number }) {
  // Color code stats based on value ranges
  const getStatColor = (value: number) => {
    if (value >= 120) return 'text-red-600'
    if (value >= 100) return 'text-orange-600'
    if (value >= 80) return 'text-yellow-600'
    if (value >= 60) return 'text-green-600'
    return 'text-blue-600'
  }

  return (
    <div className="flex items-center justify-between border-b border-zinc-200 py-2.5">
      <span className="text-sm font-semibold text-zinc-700">{label}</span>
      <span className={`font-bold text-lg ${getStatColor(v)}`}>{v}</span>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 py-2.5">
      <span className="text-sm font-semibold text-zinc-700">{label}</span>
      <span className="font-semibold text-zinc-900">{value}</span>
    </div>
  )
}

export default function Pokedex({
  selectedPokemon,
  isOpen = false,
  onClose
}: {
  selectedPokemon: PokemonLite | null
  isOpen?: boolean
  onClose?: () => void
}) {
  const PokedexContent = () => (
    <div className="w-80 h-[70vh] bg-red-600 rounded-3xl p-6 shadow-2xl border-4 border-red-800 relative overflow-hidden">
      {/* Close button for mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 md:hidden"
          aria-label="Close Pokédex"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Decorative elements */}
      <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-300 rounded-full shadow-lg"></div>
      <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-300 rounded-full shadow-lg"></div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full shadow-lg"></div>

      {/* Pokedex top section */}
      <div className="text-center mb-6 relative z-10">
        <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border-4 border-blue-700">
          <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
            <div className="w-8 h-8 bg-white rounded-full shadow-inner"></div>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
          Pokédex
        </h2>
        <p className="text-red-100 text-sm font-medium">National Pokédex</p>
      </div>

      {/* Screen area */}
      <div className="bg-white rounded-2xl p-5 h-96 overflow-y-auto shadow-inner border-2 border-gray-300 relative z-10">
        {selectedPokemon ? (
          <div className="space-y-5">
            {/* Pokemon header */}
            <div className="text-center border-b-2 border-blue-200 pb-5">
              <div className="flex justify-center mb-4">
                {selectedPokemon.spriteUrl ? (
                  <img
                    src={selectedPokemon.spriteUrl}
                    alt={selectedPokemon.name}
                    className="h-28 w-28 object-contain drop-shadow-lg"
                  />
                ) : (
                  <div className="h-28 w-28 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-medium">
                      No Image
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                {selectedPokemon.name}
              </h3>
              <div className="text-lg font-bold text-blue-600 mb-4 bg-blue-50 px-4 py-2 rounded-full inline-block">
                #{selectedPokemon.id.toString().padStart(3, '0')}
              </div>
              <div className="flex justify-center gap-3">
                {selectedPokemon.types.map(t => (
                  <TypeBadge key={t} t={t} />
                ))}
              </div>
            </div>

            {/* Stats section */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-900 border-b-2 border-green-200 pb-2 bg-green-50 px-3 py-2 rounded-lg">
                Base Stats
              </h4>
              <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
                <Stat label="HP" v={selectedPokemon.baseStats.hp} />
                <Stat label="Attack" v={selectedPokemon.baseStats.attack} />
                <Stat label="Defense" v={selectedPokemon.baseStats.defense} />
                <Stat label="Sp. Atk" v={selectedPokemon.baseStats.spAttack} />
                <Stat label="Sp. Def" v={selectedPokemon.baseStats.spDefense} />
                <Stat label="Speed" v={selectedPokemon.baseStats.speed} />
              </div>
            </div>

            {/* Physical characteristics */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-900 border-b-2 border-purple-200 pb-2 bg-purple-50 px-3 py-2 rounded-lg">
                Physical
              </h4>
              <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
                <Meta label="Height" value={`${selectedPokemon.height}m`} />
                <Meta label="Weight" value={`${selectedPokemon.weight}kg`} />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-7xl mb-6 text-blue-400">?</div>
              <p className="text-xl font-bold text-gray-700 mb-2">
                Select a Pokémon
              </p>
              <p className="text-sm text-gray-500">
                Click the info icon on any Pokémon card
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="flex justify-center gap-6 mt-5 relative z-10">
        <div className="w-10 h-10 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-500"></div>
        <div className="w-10 h-10 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-500"></div>
        <div className="w-10 h-10 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-500"></div>
      </div>
    </div>
  )

  // Desktop layout - always visible
  if (!onClose) {
    return <PokedexContent />
  }

  // Mobile layout - modal with slide-up animation
  return (
    <>
      {/* Backdrop - only render when modal is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 modal-backdrop open md:hidden"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 modal-slide-up ${
          isOpen ? 'open' : ''
        } md:hidden`}
      >
        <div className="w-full h-[85vh] bg-red-600 rounded-t-3xl p-6 shadow-2xl border-t-4 border-red-800 relative overflow-hidden">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 bg-red-700 hover:bg-red-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
            aria-label="Close Pokédex"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-300 rounded-full shadow-lg"></div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full shadow-lg"></div>

          {/* Pokedex top section */}
          <div className="text-center mb-6 relative z-10">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg border-4 border-blue-700">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner">
                <div className="w-6 h-6 bg-white rounded-full shadow-inner"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
              Pokédex
            </h2>
            <p className="text-red-100 text-sm font-medium">National Pokédex</p>
          </div>

          {/* Screen area */}
          <div className="bg-white rounded-2xl p-4 h-[calc(85vh-12rem)] overflow-y-auto shadow-inner border-2 border-gray-300 relative z-10">
            {selectedPokemon ? (
              <div className="space-y-4">
                {/* Pokemon header */}
                <div className="text-center border-b-2 border-blue-200 pb-4">
                  <div className="flex justify-center mb-3">
                    {selectedPokemon.spriteUrl ? (
                      <img
                        src={selectedPokemon.spriteUrl}
                        alt={selectedPokemon.name}
                        className="h-20 w-20 object-contain drop-shadow-lg"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs font-medium">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 capitalize mb-2">
                    {selectedPokemon.name}
                  </h3>
                  <div className="text-base font-bold text-blue-600 mb-3 bg-blue-50 px-3 py-1 rounded-full inline-block">
                    #{selectedPokemon.id.toString().padStart(3, '0')}
                  </div>
                  <div className="flex justify-center gap-2">
                    {selectedPokemon.types.map(t => (
                      <TypeBadge key={t} t={t} />
                    ))}
                  </div>
                </div>

                {/* Stats section */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-gray-900 border-b-2 border-green-200 pb-2 bg-green-50 px-2 py-1 rounded-lg">
                    Base Stats
                  </h4>
                  <div className="space-y-1 bg-gray-50 p-2 rounded-lg">
                    <Stat label="HP" v={selectedPokemon.baseStats.hp} />
                    <Stat label="Attack" v={selectedPokemon.baseStats.attack} />
                    <Stat
                      label="Defense"
                      v={selectedPokemon.baseStats.defense}
                    />
                    <Stat
                      label="Sp. Atk"
                      v={selectedPokemon.baseStats.spAttack}
                    />
                    <Stat
                      label="Sp. Def"
                      v={selectedPokemon.baseStats.spDefense}
                    />
                    <Stat label="Speed" v={selectedPokemon.baseStats.speed} />
                  </div>
                </div>

                {/* Physical characteristics */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-gray-900 border-b-2 border-purple-200 pb-2 bg-purple-50 px-2 py-1 rounded-lg">
                    Physical
                  </h4>
                  <div className="space-y-1 bg-gray-50 p-2 rounded-lg">
                    <Meta label="Height" value={`${selectedPokemon.height}m`} />
                    <Meta
                      label="Weight"
                      value={`${selectedPokemon.weight}kg`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-5xl mb-4 text-blue-400">?</div>
                  <p className="text-lg font-bold text-gray-700 mb-2">
                    Select a Pokémon
                  </p>
                  <p className="text-sm text-gray-500">
                    Click the info icon on any Pokémon card
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom buttons */}
          <div className="flex justify-center gap-4 mt-4 relative z-10">
            <div className="w-8 h-8 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-500"></div>
            <div className="w-8 h-8 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-500"></div>
            <div className="w-8 h-8 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-500"></div>
          </div>
        </div>
      </div>
    </>
  )
}
