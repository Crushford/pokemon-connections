import { useMemo, useState } from 'react'
import PokemonCard from './components/PokemonCard'
import Pokedex from './components/Pokedex'
import type { PokemonLite } from './types'

// TEMP: pass your 16 Pokémon objects in via a constant or fetched puzzle.
// This example expects a global window.__POKEMON_POOL__ loaded elsewhere.
// Replace with actual data loading you already have.
declare global {
  interface Window {
    __POKEMON_POOL__?: PokemonLite[]
  }
}

export default function App() {
  const pool = useMemo<PokemonLite[]>(() => window.__POKEMON_POOL__ ?? [], [])

  const [selectedIdx, setSelectedIdx] = useState<number[]>([])
  const [pokedexPokemon, setPokedexPokemon] = useState<PokemonLite | null>(null)

  function toggleSelect(i: number) {
    setSelectedIdx(prev => {
      if (prev.includes(i)) return prev.filter(n => n !== i)
      if (prev.length === 4) return prev // limit 4
      return [...prev, i]
    })
  }

  function submit() {
    if (selectedIdx.length !== 4) return
    // integrate with backend later
    setSelectedIdx([])
  }

  function handlePokedexLookup(pokemon: PokemonLite) {
    setPokedexPokemon(pokemon)
  }

  return (
    <div className="min-h-dvh mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Pokémon Connections</h1>
        <p className="text-sm text-zinc-600">
          Select 4 related Pokémon. Click the info icon to view details in the
          Pokédex.
        </p>
      </header>

      <main className="flex gap-8 justify-center items-start mb-8">
        {/* Pokemon grid */}
        <div className="max-w-[min(90vw,40rem)] w-auto min-h-[40rem]">
          <div className="mb-3 text-center">
            <span className="text-sm font-medium text-zinc-600">
              {selectedIdx.length === 0
                ? 'Click Pokémon to select them'
                : `${selectedIdx.length}/4 Pokémon selected`}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3 p-4 border border-zinc-300 rounded-lg overflow-hidden bg-zinc-50 h-full">
            {pool.map((mon, i) => (
              <div
                key={mon.id}
                className="aspect-square w-full h-full min-h-[8rem]"
              >
                <PokemonCard
                  mon={mon}
                  selected={selectedIdx.includes(i)}
                  onSelect={() => toggleSelect(i)}
                  onPokedexLookup={() => handlePokedexLookup(mon)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pokedex */}
        <Pokedex selectedPokemon={pokedexPokemon} />
      </main>

      <div className="mt-6 flex justify-center items-center gap-3">
        <button
          onClick={submit}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 shadow-md hover:shadow-lg"
          disabled={selectedIdx.length !== 4}
        >
          Submit Selection
        </button>
        <button
          onClick={() => setSelectedIdx([])}
          className="px-6 py-3 rounded-xl border-2 border-zinc-300 bg-white text-zinc-700 font-semibold hover:bg-zinc-50 hover:border-zinc-400 active:bg-zinc-100 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Clear Selection
        </button>
      </div>
    </div>
  )
}
