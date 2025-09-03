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
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Pokémon Connections</h1>
        <p className="text-sm text-zinc-600">
          Select 4 related Pokémon. Click the info icon to view details in the
          Pokédex.
        </p>
      </header>

      <main className="flex gap-8 justify-center items-start">
        {/* Pokemon grid */}
        <div className="h-[70vh] max-w-[min(90vw,32rem)] w-auto">
          <div className="grid grid-cols-4 gap-0 border border-zinc-300 rounded-lg overflow-hidden w-full h-full">
            {pool.map((mon, i) => (
              <div key={mon.id} className="aspect-square w-full h-full">
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

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={submit}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50"
          disabled={selectedIdx.length !== 4}
        >
          Submit
        </button>
        <button
          onClick={() => setSelectedIdx([])}
          className="px-4 py-2 rounded-xl border border-zinc-300 bg-white"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
