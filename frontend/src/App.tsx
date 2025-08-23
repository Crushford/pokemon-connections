import { useState, useEffect } from 'react'

type PokemonId = number

type Pokemon = {
  id: number
  name: string
  spriteUrl?: string
}

type Puzzle = {
  pool: PokemonId[] // 16 ids
  groups: { id: string; name: string; members: PokemonId[] }[] // hidden names for now
}

function Card({
  pokemon,
  selected,
  onToggle
}: {
  pokemon: Pokemon
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={[
        'rounded-2xl p-4 shadow-sm border w-full aspect-square',
        'transition-transform flex flex-col items-center justify-center',
        selected
          ? 'ring-2 ring-indigo-500 border-indigo-500 scale-[0.99]'
          : 'hover:scale-[1.01]'
      ].join(' ')}
    >
      {pokemon.spriteUrl && (
        <img
          src={pokemon.spriteUrl}
          alt={pokemon.name}
          className="w-16 h-16 mb-2"
        />
      )}
      <div className="text-sm font-semibold text-center capitalize">
        {pokemon.name}
      </div>
    </button>
  )
}

export default function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPokemon() {
      try {
        // Load the first 16 Pokémon from the public data
        const response = await fetch('/pokemon.json')
        const allPokemon = await response.json()
        setPokemon(allPokemon.slice(0, 16))
      } catch (error) {
        console.error('Failed to load Pokémon data:', error)
        // Fallback to placeholder data
        setPokemon(
          Array.from({ length: 16 }, (_, i) => ({
            id: i + 1,
            name: `pokemon-${i + 1}`,
            spriteUrl: undefined
          }))
        )
      } finally {
        setLoading(false)
      }
    }

    loadPokemon()
  }, [])

  function toggle(index: number) {
    setSelected(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : prev.length < 4
        ? [...prev, index]
        : prev
    )
  }

  function submit() {
    if (selected.length !== 4) return
    // TODO: call backend to validate; for now, just clear the selection
    setSelected([])
  }

  if (loading) {
    return (
      <div className="min-h-dvh mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">Loading Pokémon...</div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Pokémon Connections</h1>
        <p className="text-sm text-zinc-600">
          Select 4 related Pokémon, then submit.
        </p>
      </header>

      <main className="grid grid-cols-4 gap-3">
        {pokemon.map((p, i) => (
          <Card
            key={p.id}
            pokemon={p}
            selected={selected.includes(i)}
            onToggle={() => toggle(i)}
          />
        ))}
      </main>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={submit}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50"
          disabled={selected.length !== 4}
        >
          Submit
        </button>
        <button
          onClick={() => setSelected([])}
          className="px-4 py-2 rounded-xl bg-zinc-200 font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
