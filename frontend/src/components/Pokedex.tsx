import type { PokemonLite } from '../types'

function TypeBadge({ t }: { t: string }) {
  return (
    <span className="px-2 py-1 text-xs rounded-full border border-zinc-300 bg-white text-zinc-700 uppercase tracking-wide font-medium">
      {t}
    </span>
  )
}

function Stat({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 py-2">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <span className="font-bold text-lg text-zinc-900">{v}</span>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 py-2">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <span className="font-semibold text-zinc-900">{value}</span>
    </div>
  )
}

export default function Pokedex({
  selectedPokemon
}: {
  selectedPokemon: PokemonLite | null
}) {
  return (
    <div className="w-80 h-[70vh] bg-gradient-to-b from-red-600 to-red-700 rounded-2xl p-6 shadow-2xl border-4 border-red-800">
      {/* Pokedex top section */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Pokédex</h2>
        <p className="text-red-200 text-sm">National Pokédex</p>
      </div>

      {/* Screen area */}
      <div className="bg-white rounded-xl p-4 h-96 overflow-y-auto">
        {selectedPokemon ? (
          <div className="space-y-4">
            {/* Pokemon header */}
            <div className="text-center border-b border-zinc-200 pb-4">
              <div className="flex justify-center mb-3">
                {selectedPokemon.spriteUrl ? (
                  <img
                    src={selectedPokemon.spriteUrl}
                    alt={selectedPokemon.name}
                    className="h-24 w-24 object-contain"
                  />
                ) : (
                  <div className="h-24 w-24 bg-zinc-200 rounded flex items-center justify-center">
                    <span className="text-zinc-400 text-sm">No Image</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 capitalize mb-2">
                {selectedPokemon.name}
              </h3>
              <div className="text-sm text-zinc-600 mb-3">
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
              <h4 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">
                Base Stats
              </h4>
              <div className="space-y-1">
                <Stat label="HP" v={selectedPokemon.baseStats.hp} />
                <Stat label="Attack" v={selectedPokemon.baseStats.attack} />
                <Stat label="Defense" v={selectedPokemon.baseStats.defense} />
                <Stat label="Sp. Atk" v={selectedPokemon.baseStats.spAttack} />
                <Stat label="Sp. Def" v={selectedPokemon.baseStats.spDefense} />
                <Stat label="Speed" v={selectedPokemon.baseStats.speed} />
              </div>
            </div>

            {/* Physical characteristics */}
            <div className="space-y-3">
              <h4 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-2">
                Physical
              </h4>
              <div className="space-y-1">
                <Meta label="Height" value={`${selectedPokemon.height}m`} />
                <Meta label="Weight" value={`${selectedPokemon.weight}kg`} />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-zinc-500">
              <div className="text-6xl mb-4">?</div>
              <p className="text-lg font-medium">Select a Pokémon</p>
              <p className="text-sm">Click the info icon on any Pokémon card</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <div className="w-8 h-8 bg-white rounded-full"></div>
        <div className="w-8 h-8 bg-white rounded-full"></div>
        <div className="w-8 h-8 bg-white rounded-full"></div>
      </div>
    </div>
  )
}
