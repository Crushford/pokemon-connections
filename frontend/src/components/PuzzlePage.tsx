import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PokemonCard from './PokemonCard'
import Pokedex from './Pokedex'
import type { PokemonLite } from '../types'

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

export default function PuzzlePage() {
  const { puzzleId } = useParams<{ puzzleId: string }>()
  const navigate = useNavigate()
  const currentPuzzleIndex = parseInt(puzzleId || '0', 10)

  const [puzzlesData, setPuzzlesData] = useState<PuzzlesData | null>(null)
  const [pokemonData, setPokemonData] = useState<PokemonData>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completedGroups, setCompletedGroups] = useState<PuzzleGroup[]>([])
  const [remainingPokemon, setRemainingPokemon] = useState<PokemonLite[]>([])

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
        const puzzlePokemon = pokemonData
          .filter((pokemon: any) => puzzlePokemonIds.has(pokemon.id))
          .map(
            (pokemon: any): PokemonLite => ({
              id: pokemon.id,
              name: pokemon.name,
              types: pokemon.types,
              baseStats: pokemon.baseStats,
              height: pokemon.height,
              weight: pokemon.weight,
              spriteUrl: pokemon.spriteUrl
            })
          )
        setRemainingPokemon(puzzlePokemon)
        setCompletedGroups([]) // Reset completed groups for new puzzle
        setIncorrectAttempts(0) // Reset attempts for new puzzle
        setSelectedIdx([]) // Clear selection
        setIsGameFinished(false) // Reset game finished state
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
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false)
  const [showMenu, setShowMenu] = useState<boolean>(false)

  function toggleSelect(i: number) {
    if (isGameFinished) return // Don't allow selection when game is finished

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

  function revealAllGroups() {
    if (!puzzlesData) return

    const currentPuzzle = puzzlesData.puzzles[currentPuzzleIndex]
    if (!currentPuzzle) return

    // Get all groups that haven't been completed yet
    const completedGroupIds = new Set(completedGroups.map(g => g.id))
    const remainingGroups = currentPuzzle.groups.filter(
      g => !completedGroupIds.has(g.id)
    )

    // Add all remaining groups to completed groups
    setCompletedGroups(prev => [...prev, ...remainingGroups])

    // Remove all remaining Pokemon from the pool
    setRemainingPokemon([])
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
    if (selectedIdx.length !== 4 || isGameFinished) return

    // Get the selected Pokemon objects from the remaining pool (not full pool)
    const selectedPokemon = selectedIdx.map(i => remainingPokemon[i])

    // Validate the selection
    const { isCorrect, groupName, group } = validateSelection(selectedPokemon)

    if (!isCorrect) {
      // Increment incorrect attempts only when wrong
      const newAttempts = incorrectAttempts + 1
      setIncorrectAttempts(newAttempts)

      // Check if we've reached the 4-attempt limit
      if (newAttempts >= 4) {
        // Game finished - reveal all remaining groups
        setIsGameFinished(true)
        revealAllGroups()
        displayToast('Game Over! All groups have been revealed.')
      } else {
        // Show feedback for incorrect selection
        const remainingAttempts = 4 - newAttempts
        displayToast(
          `Not quite right! These Pokémon aren't connected. Try again! (${remainingAttempts} attempts remaining)`
        )
        triggerShake()
      }
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
          // Puzzle is complete! Navigate to completion page
          setTimeout(() => {
            navigate(`/levels/${currentPuzzleIndex}/complete`)
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
      navigate(`/levels/${currentPuzzleIndex + 1}`)
    } else {
      // No more puzzles, show end message
      displayToast("🎉 Congratulations! You've completed all puzzles!")
    }
  }

  function handleMenuToggle() {
    setShowMenu(!showMenu)
  }

  function handleGoToLevelSelection() {
    navigate('/levels')
  }

  function handleNextLevel() {
    handleNextPuzzle()
    setShowMenu(false)
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
      <div className="h-dvh flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading puzzle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh w-screen overflow-hidden flex flex-col p-4">
      <header className="flex-shrink-0 relative">
        {/* Menu button - top right */}
        <button
          onClick={handleMenuToggle}
          className="absolute top-0 right-0 p-2 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          aria-label="Open menu"
        >
          <svg
            className="h-5 w-5 text-zinc-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Menu dropdown */}
        {showMenu && (
          <div className="absolute top-12 right-0 z-50 w-64 bg-white border border-zinc-200 rounded-lg shadow-lg">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-zinc-800 mb-2">Level Info</h3>
                <p className="text-sm text-zinc-600">
                  Level: {currentPuzzleIndex + 1} of{' '}
                  {puzzlesData?.puzzles.length || 0}
                </p>
                <p className="text-sm text-zinc-600">
                  Puzzle Index: {currentPuzzleIndex}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleGoToLevelSelection}
                  className="w-full px-3 py-2 text-left text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                >
                  To Level Selection
                </button>

                {puzzlesData &&
                  currentPuzzleIndex < puzzlesData.puzzles.length - 1 && (
                    <button
                      onClick={handleNextLevel}
                      className="w-full px-3 py-2 text-left text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200"
                    >
                      Next Level
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Main header content */}
        <div className="text-center pr-16">
          <h1 className="text-2xl md:text-3xl font-bold">
            Pokémon Connections
          </h1>
          <p className="text-xs md:text-sm text-zinc-600">
            Below are 16 Pokémon, you need to sort them into 4 groups of 4. If
            you're feeling stuck, you can click on the Pokedex to learn more
            about each Pokémon.
          </p>
          {puzzlesData && (
            <p className="text-xs md:text-sm text-indigo-600 font-medium mt-1">
              Puzzle {currentPuzzleIndex + 1} of {puzzlesData.puzzles.length}
            </p>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-4 md:gap-8 justify-center items-start overflow-hidden">
        {/* Pokemon grid */}
        <div className="flex-1 md:max-w-[40rem] w-full  flex flex-col">
          <div className="flex-shrink-0 flex justify-between items-center mb-3">
            <div className="w-1/2 text-left">
              <span className="text-xs md:text-sm font-medium text-zinc-600">
                {selectedIdx.length > 0 &&
                  `${selectedIdx.length}/4 Pokémon selected`}
              </span>
            </div>
            <div className="w-1/2 text-right">
              <span className="text-xs md:text-sm font-semibold text-orange-600">
                Attempts remaining: {Math.max(0, 4 - incorrectAttempts)}
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
              <div className="grid grid-cols-4 gap-1 md:gap-2">
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
                      disabled={isGameFinished}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons - directly below the grid */}
          <div className="flex-shrink-0 mt-4 flex flex-wrap justify-center items-center gap-1 md:gap-2 max-w-full overflow-hidden">
            <button
              onClick={submit}
              className="px-2 md:px-4 py-2 md:py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 shadow-md hover:shadow-lg text-xs md:text-sm"
              disabled={selectedIdx.length !== 4 || isGameFinished}
            >
              Submit Selection
            </button>
            <button
              onClick={() => setSelectedIdx([])}
              className="px-2 md:px-4 py-2 md:py-3 rounded-xl border-2 border-zinc-300 bg-white text-zinc-700 font-semibold hover:bg-zinc-50 hover:border-zinc-400 active:bg-zinc-100 transition-all duration-200 shadow-sm hover:shadow-md text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGameFinished}
            >
              Clear Selection
            </button>
            <button
              onClick={() => {
                setRemainingPokemon(prev =>
                  [...prev].sort(() => Math.random() - 0.5)
                )
              }}
              className="px-2 md:px-4 py-2 md:py-3 rounded-xl border-2 border-zinc-300 bg-white text-zinc-700 font-semibold hover:bg-zinc-50 hover:border-zinc-400 active:bg-zinc-100 transition-all duration-200 shadow-sm hover:shadow-md text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGameFinished}
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
    </div>
  )
}
