import { useState, useEffect } from 'react'

type PokemonId = number

type Pokemon = {
  id: number
  name: string
  spriteUrl?: string
  types?: string[]
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
        'rounded-lg sm:rounded-xl p-1 sm:p-2 shadow-sm border w-full aspect-square',
        'transition-transform flex flex-col items-center justify-center',
        'min-w-0 min-h-0 overflow-hidden', // Allow shrinking and hide overflow
        selected
          ? 'ring-2 ring-indigo-500 border-indigo-500 scale-[0.99]'
          : 'hover:scale-[1.01]'
      ].join(' ')}
    >
      {pokemon.spriteUrl && (
        <img
          src={pokemon.spriteUrl}
          alt={pokemon.name}
          className="w-full h-auto max-w-full max-h-[60%] object-contain flex-shrink-0"
        />
      )}
      <div className="text-xs font-semibold text-center capitalize mt-1 leading-tight px-1 overflow-hidden text-ellipsis whitespace-nowrap w-full">
        {pokemon.name}
      </div>
    </button>
  )
}

export default function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Load puzzle data first
        const puzzleResponse = await fetch('/puzzle.json')
        const puzzleData: Puzzle = await puzzleResponse.json()
        setPuzzle(puzzleData)

        // Load all Pokémon data
        const pokemonResponse = await fetch('/pokemon.json')
        const allPokemon: Pokemon[] = await pokemonResponse.json()

        // Create a map for quick lookup
        const pokemonMap = new Map(allPokemon.map(p => [p.id, p]))

        // Get the Pokémon from the puzzle pool
        const puzzlePokemon = puzzleData.pool.map(id => {
          const pokemon = pokemonMap.get(id)
          if (!pokemon) {
            console.warn(`Pokémon with ID ${id} not found`)
            return {
              id,
              name: `pokemon-${id}`,
              spriteUrl: undefined
            }
          }
          return pokemon
        })

        setPokemon(puzzlePokemon)
      } catch (error) {
        console.error('Failed to load data:', error)
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

    loadData()
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
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">Loading Pokémon...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col p-2 sm:p-4 overflow-hidden">
      <header className="flex-shrink-0 mb-2 sm:mb-4">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-center">
          Pokémon Connections
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 text-center">
          Select 4 related Pokémon, then submit.
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center min-h-0 p-2">
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="grid grid-cols-4 gap-1 sm:gap-2"
            style={{
              width: 'min(70vh, 70vw)',
              height: 'min(70vh, 70vw)',
              aspectRatio: '1/1'
            }}
          >
            {pokemon.map((p, i) => (
              <Card
                key={p.id}
                pokemon={p}
                selected={selected.includes(i)}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </main>

      <div className="flex-shrink-0 mt-2 sm:mt-4 flex items-center justify-center gap-2 sm:gap-3">
        <button
          onClick={submit}
          className="px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50 text-sm sm:text-base"
          disabled={selected.length !== 4}
        >
          Submit
        </button>
        <button
          onClick={() => setSelected([])}
          className="px-3 sm:px-4 py-2 rounded-xl bg-zinc-200 font-medium text-sm sm:text-base"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
