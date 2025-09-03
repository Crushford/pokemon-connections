import { useMemo, useState, useEffect } from 'react'
import PokemonCard from './components/PokemonCard'
import Pokedex from './components/Pokedex'
import type { PokemonLite } from './types'

// Global type declaration for Pokemon pool data
declare global {
  interface Window {
    __POKEMON_POOL__?: PokemonLite[]
  }
}

type PuzzleGroup = {
  id: string
  name: string
  members: number[]
  tags: string[]
}

type PuzzleData = {
  groups: PuzzleGroup[]
  pool: number[]
}

export default function App() {
  const pool = useMemo<PokemonLite[]>(() => window.__POKEMON_POOL__ ?? [], [])
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch puzzle data on component mount
  useEffect(() => {
    fetch('/puzzle.json')
      .then(response => response.json())
      .then(data => {
        setPuzzleData(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to load puzzle data:', error)
        setIsLoading(false)
      })
  }, [])

  const [selectedIdx, setSelectedIdx] = useState<number[]>([])
  const [pokedexPokemon, setPokedexPokemon] = useState<PokemonLite | null>(null)
  const [attempts, setAttempts] = useState<number>(0)
  const [showToast, setShowToast] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string>('')
  const [shakeCards, setShakeCards] = useState<boolean>(false)

  function toggleSelect(i: number) {
    setSelectedIdx(prev => {
      if (prev.includes(i)) return prev.filter(n => n !== i)
      if (prev.length === 4) return prev // limit 4
      return [...prev, i]
    })
  }

  function displayToast(message: string) {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  function triggerShake() {
    setShakeCards(true)
    setTimeout(() => setShakeCards(false), 600)
  }

  function validateSelection(selectedPokemon: PokemonLite[]): {
    isCorrect: boolean
    groupName?: string
  } {
    if (!puzzleData || selectedPokemon.length !== 4) {
      console.log(
        'Validation failed: No puzzle data or wrong number of Pokemon'
      )
      return { isCorrect: false }
    }

    // Get the IDs of selected Pokemon
    const selectedIds = selectedPokemon.map(p => p.id).sort((a, b) => a - b)
    console.log('Selected Pokemon IDs:', selectedIds)

    // Check if the selected IDs match any of the valid groups
    for (const group of puzzleData.groups) {
      const groupIds = [...group.members].sort((a, b) => a - b)
      console.log(`Checking group "${group.name}":`, groupIds)

      // Check if the selected IDs exactly match the group IDs
      if (
        selectedIds.length === groupIds.length &&
        selectedIds.every((id, index) => id === groupIds[index])
      ) {
        console.log('Match found!', group.name)
        return { isCorrect: true, groupName: group.name }
      }
    }

    console.log('No matching group found')
    return { isCorrect: false }
  }

  function submit() {
    if (selectedIdx.length !== 4) return

    // Increment attempts
    setAttempts(prev => prev + 1)

    // Get the selected Pokemon objects
    const selectedPokemon = selectedIdx.map(i => pool[i])

    // Validate the selection
    const { isCorrect, groupName } = validateSelection(selectedPokemon)

    if (!isCorrect) {
      // Show feedback for incorrect selection
      displayToast(
        "Not quite right! These Pokémon aren't connected. Try again!"
      )
      triggerShake()
    } else {
      // Show success message
      displayToast(`Congratulations! You found the connection: ${groupName}!`)
    }

    setSelectedIdx([])
  }

  function handlePokedexLookup(pokemon: PokemonLite) {
    setPokedexPokemon(pokemon)
  }

  // Get color for attempts counter based on performance
  function getAttemptsColor() {
    if (attempts === 0) return 'text-zinc-600'
    if (attempts <= 3) return 'text-green-600'
    if (attempts <= 6) return 'text-yellow-600'
    if (attempts <= 9) return 'text-orange-600'
    return 'text-red-600'
  }

  // Show loading state while puzzle data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading puzzle...</p>
        </div>
      </div>
    )
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
          <div className="mb-3 text-center space-y-2">
            <div>
              <span className="text-sm font-medium text-zinc-600">
                {selectedIdx.length === 0
                  ? 'Click Pokémon to select them'
                  : `${selectedIdx.length}/4 Pokémon selected`}
              </span>
            </div>
            <div>
              <span className={`text-sm font-semibold ${getAttemptsColor()}`}>
                Attempts: {attempts}
              </span>
            </div>
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
                  shake={shakeCards && selectedIdx.includes(i)}
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

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-zinc-800 text-white px-6 py-3 rounded-lg shadow-lg border border-zinc-700 animate-bounce">
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}
