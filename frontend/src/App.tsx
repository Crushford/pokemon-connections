import { useState, useEffect } from 'react'
import PokemonCard from './components/PokemonCard'
import Pokedex from './components/Pokedex'
import CompletionModal from './components/CompletionModal'
import type { PokemonLite } from './types'

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

type PuzzlesData = {
  puzzles: PuzzleData[]
}

type PokemonData = PokemonLite[]

export default function App() {
  const [puzzlesData, setPuzzlesData] = useState<PuzzlesData | null>(null)
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [pokemonData, setPokemonData] = useState<PokemonData>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completedGroups, setCompletedGroups] = useState<PuzzleGroup[]>([])
  const [remainingPokemon, setRemainingPokemon] = useState<PokemonLite[]>([])
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  // Fetch puzzle and Pokemon data on component mount
  useEffect(() => {
    Promise.all([
      fetch('/puzzle.json').then(response => response.json()),
      fetch('/pokemon.json').then(response => response.json())
    ])
      .then(([puzzlesData, pokemonData]) => {
        // Check if pokemonData is wrapped in an object
        let actualPokemonData = pokemonData
        if (
          pokemonData &&
          typeof pokemonData === 'object' &&
          !Array.isArray(pokemonData)
        ) {
          // Try to find the actual array
          if (pokemonData.pokemon && Array.isArray(pokemonData.pokemon)) {
            actualPokemonData = pokemonData.pokemon
          }
        }

        setPuzzlesData(puzzlesData)
        setPokemonData(actualPokemonData)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('❌ Failed to load data:', error)
        setIsLoading(false)
      })
  }, [])

  // Load current puzzle when puzzles data or current index changes
  useEffect(() => {
    if (puzzlesData && pokemonData.length > 0) {
      const currentPuzzle = puzzlesData.puzzles[currentPuzzleIndex]
      if (currentPuzzle) {
        // Filter Pokemon data to only include Pokemon in this puzzle
        const puzzlePokemonIds = new Set(currentPuzzle.pool)
        const puzzlePokemon = pokemonData.filter((pokemon: PokemonLite) =>
          puzzlePokemonIds.has(pokemon.id)
        )
        setRemainingPokemon(puzzlePokemon)
        setCompletedGroups([]) // Reset completed groups for new puzzle
        setIncorrectAttempts(0) // Reset attempts for new puzzle
        setSelectedIdx([]) // Clear selection
      }
    }
  }, [puzzlesData, pokemonData, currentPuzzleIndex])
  const [selectedIdx, setSelectedIdx] = useState<number[]>([])
  const [pokedexPokemon, setPokedexPokemon] = useState<PokemonLite | null>(null)
  const [showPokedexModal, setShowPokedexModal] = useState<boolean>(false)
  const [incorrectAttempts, setIncorrectAttempts] = useState<number>(0)
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
    group?: PuzzleGroup // Add this return type
  } {
    if (!puzzlesData || selectedPokemon.length !== 4) {
      console.log(
        'Validation failed: No puzzle data or wrong number of Pokemon'
      )
      return { isCorrect: false }
    }

    const currentPuzzle = puzzlesData.puzzles[currentPuzzleIndex]
    if (!currentPuzzle) {
      console.log('Validation failed: No current puzzle')
      return { isCorrect: false }
    }

    // Get the IDs of selected Pokemon
    const selectedIds = selectedPokemon.map(p => p.id).sort((a, b) => a - b)
    console.log('Selected Pokemon IDs:', selectedIds)

    // Check if the selected IDs match any of the valid groups
    for (const group of currentPuzzle.groups) {
      const groupIds = [...group.members].sort((a, b) => a - b)
      console.log(`Checking group "${group.name}":`, groupIds)

      // Check if the selected IDs exactly match the group IDs
      if (
        selectedIds.length === groupIds.length &&
        selectedIds.every((id, index) => id === groupIds[index])
      ) {
        console.log('Match found!', group.name)
        return { isCorrect: true, groupName: group.name, group } // Return the group object
      }
    }

    console.log('No matching group found')
    return { isCorrect: false }
  }

  function submit() {
    if (selectedIdx.length !== 4) return

    // Get the selected Pokemon objects from the remaining pool (not full pool)
    const selectedPokemon = selectedIdx.map(i => remainingPokemon[i])

    // Validate the selection
    const { isCorrect, groupName, group } = validateSelection(selectedPokemon)

    if (!isCorrect) {
      // Increment incorrect attempts only when wrong
      setIncorrectAttempts(prev => prev + 1)

      // Show feedback for incorrect selection
      displayToast(
        "Not quite right! These Pokémon aren't connected. Try again!"
      )
      triggerShake()
    } else {
      // Show success message
      displayToast(`Congratulations! You found the connection: ${groupName}!`)

      // Add to completed groups
      if (group) {
        setCompletedGroups(prev => [...prev, group])

        // Remove completed Pokemon from remaining pool
        const completedIds = group.members
        setRemainingPokemon(prev =>
          prev.filter(p => !completedIds.includes(p.id))
        )

        // Check if puzzle is complete (all groups found)
        const newCompletedGroups = [...completedGroups, group]
        if (
          puzzlesData &&
          newCompletedGroups.length ===
            puzzlesData.puzzles[currentPuzzleIndex].groups.length
        ) {
          // Puzzle is complete! Show completion modal
          setTimeout(() => {
            setShowCompletionModal(true)
          }, 1000) // Small delay to let the success message show
        }
      }
    }

    setSelectedIdx([])
  }

  function handlePokedexLookup(pokemon: PokemonLite) {
    setPokedexPokemon(pokemon)
    setShowPokedexModal(true)
  }

  function handleClosePokedex() {
    setShowPokedexModal(false)
  }

  function handleNextPuzzle() {
    if (puzzlesData && currentPuzzleIndex < puzzlesData.puzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1)
      setShowCompletionModal(false)
    } else {
      // No more puzzles, show end message
      setShowCompletionModal(false)
      displayToast("🎉 Congratulations! You've completed all puzzles!")
    }
  }

  function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-blue-200',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-green-400',
      rock: 'bg-yellow-700',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-700',
      dark: 'bg-gray-700',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300'
    }
    return colors[type] || 'bg-gray-400'
  }

  // Show loading state while puzzle data is being fetched
  if (isLoading) {
    return (
      <div className="h-screen-safe flex items-center justify-center p-safe-area">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading puzzle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen-safe w-screen-safe overflow-hidden flex flex-col p-safe-area">
      <header className="flex-shrink-0 mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold">Pokémon Connections</h1>
        <p className="text-xs md:text-sm text-zinc-600">
          Select 4 related Pokémon. Click the info icon to view details in the
          Pokédex.
        </p>
        {puzzlesData && (
          <p className="text-xs md:text-sm text-indigo-600 font-medium mt-1">
            Puzzle {currentPuzzleIndex + 1} of {puzzlesData.puzzles.length}
          </p>
        )}
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-4 md:gap-8 justify-center items-start overflow-hidden">
        {/* Pokemon grid */}
        <div className="flex-1 md:max-w-[40rem] w-full min-h-0 flex flex-col">
          <div className="flex-shrink-0 mb-3 text-center space-y-1">
            <div>
              <span className="text-xs md:text-sm font-medium text-zinc-600">
                {selectedIdx.length === 0
                  ? 'Click Pokémon to select them'
                  : `${selectedIdx.length}/4 Pokémon selected`}
              </span>
            </div>
            <div>
              <span className="text-xs md:text-sm font-semibold text-orange-600">
                Incorrect attempts: {incorrectAttempts}
              </span>
            </div>
            <div>
              <span className="text-xs md:text-sm font-medium text-zinc-600">
                {remainingPokemon.length} Pokémon remaining
              </span>
            </div>
          </div>

          {/* Grid Container with Completed Groups and Remaining Pokemon */}
          <div className=" border border-zinc-300 rounded-lg overflow-hidden bg-zinc-50 flex flex-col">
            {/* Completed Groups Section */}
            {completedGroups && completedGroups.length > 0 && (
              <div className="flex-shrink-0 p-2 md:p-4 border-b border-zinc-200 bg-green-50">
                <h3 className="text-sm md:text-lg font-semibold mb-2 text-center text-green-800">
                  Completed Groups
                </h3>
                <div className="space-y-2">
                  {completedGroups.map(group => (
                    <div
                      key={group.id}
                      className="bg-white p-2 md:p-3 rounded-lg shadow-sm border-l-4 border-green-500"
                    >
                      <h4 className="text-xs md:text-sm font-medium mb-1 text-center text-green-700">
                        {group.name}
                      </h4>
                      <div className="flex flex-wrap gap-1 md:gap-2 justify-center">
                        {group.members.map(id => {
                          const mon = pokemonData.find(p => p.id === id)
                          return mon ? (
                            <span
                              key={id}
                              className={`px-1 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium ${getTypeColor(
                                mon.types[0]
                              )} text-white shadow-sm`}
                            >
                              {mon.name}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remaining Pokemon Grid */}
            <div className="flex-1 p-2 md:p-4 overflow-auto">
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {remainingPokemon.map((mon, i) => (
                  <div
                    key={mon.id}
                    className="aspect-square w-full h-full min-h-[6rem] md:min-h-[8rem]"
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
          </div>

          {/* Action buttons - directly below the grid */}
          <div className="flex-shrink-0 mt-4 flex justify-center items-center gap-2 md:gap-3">
            <button
              onClick={submit}
              className="px-4 md:px-6 py-2 md:py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
              disabled={selectedIdx.length !== 4}
            >
              Submit Selection
            </button>
            <button
              onClick={() => setSelectedIdx([])}
              className="px-4 md:px-6 py-2 md:py-3 rounded-xl border-2 border-zinc-300 bg-white text-zinc-700 font-semibold hover:bg-zinc-50 hover:border-zinc-400 active:bg-zinc-100 transition-all duration-200 shadow-sm hover:shadow-md text-sm md:text-base"
            >
              Clear Selection
            </button>
            <button
              onClick={() => {
                setRemainingPokemon(prev =>
                  [...prev].sort(() => Math.random() - 0.5)
                )
              }}
              className="px-4 md:px-6 py-2 md:py-3 rounded-xl border-2 border-zinc-300 bg-white text-zinc-700 font-semibold hover:bg-zinc-50 hover:border-zinc-400 active:bg-zinc-100 transition-all duration-200 shadow-sm hover:shadow-md text-sm md:text-base"
            >
              🔀 Shuffle
            </button>
          </div>
        </div>

        {/* Pokedex - Desktop only */}
        <div className="hidden md:block flex-shrink-0">
          <Pokedex selectedPokemon={pokedexPokemon} />
        </div>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-zinc-800 text-white px-6 py-3 rounded-lg shadow-lg border border-zinc-700 animate-bounce">
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Mobile Pokedex Modal */}
      <Pokedex
        selectedPokemon={pokedexPokemon}
        isOpen={showPokedexModal}
        onClose={handleClosePokedex}
      />

      {/* Completion Modal */}
      {puzzlesData && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          onNextPuzzle={handleNextPuzzle}
          stats={{
            incorrectAttempts,
            totalGroups:
              puzzlesData.puzzles[currentPuzzleIndex]?.groups.length || 0,
            completedGroups: completedGroups.length
          }}
          currentPuzzleIndex={currentPuzzleIndex}
          totalPuzzles={puzzlesData.puzzles.length}
        />
      )}
    </div>
  )
}
