import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PokemonCard from './PokemonCard'
import Pokedex from './Pokedex'
import { usePlayer } from '../contexts/PlayerContext'
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
  const { completeLevel, failLevel, updateAttempts } = usePlayer()

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

      // Track attempts in player context
      const levelId = currentPuzzleIndex + 1
      updateAttempts(levelId, newAttempts)

      // Check if we've reached the 4-attempt limit
      if (newAttempts >= 4) {
        // Game finished - reveal all remaining groups
        setIsGameFinished(true)
        revealAllGroups()

        // Track failure in player context
        const levelId = currentPuzzleIndex + 1
        failLevel(levelId, newAttempts)

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
          // Track player progress
          const levelId = currentPuzzleIndex + 1
          completeLevel(levelId, {
            incorrectAttempts,
            totalGroups: puzzlesData.puzzles[currentPuzzleIndex].groups.length,
            completedGroups: newCompletedGroups.length
          })

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

  function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      normal: 'bg-secondary-400',
      fire: 'bg-pokemon-fire',
      water: 'bg-pokemon-water',
      electric: 'bg-pokemon-electric',
      grass: 'bg-pokemon-grass',
      ice: 'bg-pokemon-ice',
      fighting: 'bg-pokemon-fighting',
      poison: 'bg-pokemon-poison',
      ground: 'bg-pokemon-ground',
      flying: 'bg-pokemon-flying',
      psychic: 'bg-pokemon-psychic',
      bug: 'bg-pokemon-bug',
      rock: 'bg-pokemon-rock',
      ghost: 'bg-pokemon-ghost',
      dragon: 'bg-pokemon-dragon',
      dark: 'bg-pokemon-dark',
      steel: 'bg-pokemon-steel',
      fairy: 'bg-pokemon-fairy'
    }
    return colors[type] || 'bg-secondary-400'
  }

  // Show loading state while puzzle data is being fetched
  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center p-4 bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading puzzle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh w-screen overflow-hidden flex flex-col p-4 bg-background">
      <header className="flex-shrink-0">
        {/* Main header content */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-text">
            Pokémon Connections
          </h1>
          <p className="text-xs md:text-sm text-secondary">
            Below are 16 Pokémon, you need to sort them into 4 groups of 4. If
            you're feeling stuck, you can click on the Pokedex to learn more
            about each Pokémon.
          </p>
          {puzzlesData && (
            <p className="text-xs md:text-sm text-primary font-medium mt-1">
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
              <span className="text-xs md:text-sm font-medium text-secondary">
                {selectedIdx.length > 0 &&
                  `${selectedIdx.length}/4 Pokémon selected`}
              </span>
            </div>
            <div className="w-1/2 text-right">
              <span className="text-xs md:text-sm font-semibold text-warning">
                Attempts remaining: {Math.max(0, 4 - incorrectAttempts)}
              </span>
            </div>
          </div>

          {/* Grid Container with Completed Groups and Remaining Pokemon */}
          <div className=" border border-border rounded-lg overflow-hidden bg-background-secondary flex flex-col">
            {/* Completed Groups Section */}
            {completedGroups && completedGroups.length > 0 && (
              <div className="flex-shrink-0 p-2 md:p-4 border-b border-border bg-success-light">
                <h3 className="text-sm md:text-lg font-semibold mb-2 text-center text-success-dark">
                  Completed Groups
                </h3>
                <div className="space-y-2">
                  {completedGroups.map(group => (
                    <div
                      key={group.id}
                      className="bg-background-card p-2 md:p-3 rounded-lg shadow-sm border-l-4 border-success"
                    >
                      <h4 className="text-xs md:text-sm font-medium mb-1 text-center text-success-dark">
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
              className="px-2 md:px-4 py-2 md:py-3 rounded-xl border-2 border-border bg-background-card text-text font-semibold hover:bg-background-secondary hover:border-border-secondary active:bg-background-tertiary transition-all duration-200 shadow-sm hover:shadow-md text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="px-2 md:px-4 py-2 md:py-3 rounded-xl border-2 border-border bg-background-card text-text font-semibold hover:bg-background-secondary hover:border-border-secondary active:bg-background-tertiary transition-all duration-200 shadow-sm hover:shadow-md text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-background-modal text-inverse px-6 py-3 rounded-lg shadow-lg border border-border animate-bounce">
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
