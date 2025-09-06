import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPuzzles } from '../lib/api'
import { usePlayer } from '../contexts/PlayerContext'
import type { PokemonLite } from '../types'

interface Puzzle {
  groups: {
    id: string
    name: string
    members: number[]
    tags: string[]
  }[]
  pool: number[]
}

interface PuzzlesData {
  puzzles: Puzzle[]
}

export default function LevelsPage() {
  const [puzzlesData, setPuzzlesData] = useState<PuzzlesData | null>(null)
  const [pokemonData, setPokemonData] = useState<PokemonLite[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { isLevelCompleted, isLevelFailed } = usePlayer()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [puzzlesData, pokemonResponse] = await Promise.all([
          fetchPuzzles(),
          fetch('/pokemon.json').then(response => response.json())
        ])

        // Extract Pokemon array from the response
        let actualPokemonData = pokemonResponse
        if (
          pokemonResponse &&
          typeof pokemonResponse === 'object' &&
          !Array.isArray(pokemonResponse)
        ) {
          if (
            pokemonResponse.pokemon &&
            Array.isArray(pokemonResponse.pokemon)
          ) {
            actualPokemonData = pokemonResponse.pokemon
          }
        }

        setPuzzlesData(puzzlesData)
        setPokemonData(actualPokemonData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLevelSelect = (puzzleIndex: number) => {
    const levelId = puzzleIndex + 1
    const isCompleted = isLevelCompleted(levelId)

    if (isCompleted) {
      // For completed levels, show the solved puzzle
      navigate(`/levels/${puzzleIndex}/complete`)
    } else {
      // For new or failed levels, start the puzzle
      navigate(`/levels/${puzzleIndex}`)
    }
  }

  const getPokemonById = (id: number): PokemonLite | null => {
    return pokemonData.find(pokemon => pokemon.id === id) || null
  }

  if (loading) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className=" text-muted">Loading levels...</p>
        </div>
      </div>
    )
  }

  if (!puzzlesData) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center">
          <p className="text-error mb-4">Failed to load levels</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary  text-inverse rounded-lg hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh w-screen overflow-hidden flex flex-col p-4 bg-background">
      <header className="flex-shrink-0 text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text">
          Pokémon Connections
        </h1>
        <p className="text-xs md:text-sm text-secondary mt-2">
          Select a level to play
        </p>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {puzzlesData.puzzles.map((_, index) => {
              const pokemonId = index + 1
              const pokemon = getPokemonById(pokemonId)
              const levelId = index + 1
              const isCompleted = isLevelCompleted(levelId)
              const isFailed = isLevelFailed(levelId)

              return (
                <button
                  key={index}
                  onClick={() => handleLevelSelect(index)}
                  className={`group relative rounded-xl p-3 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isCompleted
                      ? 'bg-success-light border-2 border-success hover:border-success-dark'
                      : isFailed
                      ? 'bg-error-light border-2 border-error hover:border-error-dark'
                      : 'bg-background-card border-2 border-border hover:border-primary'
                  }`}
                >
                  {/* Pokemon sprite */}
                  <div className="flex justify-center mb-2">
                    {pokemon?.spriteUrl ? (
                      <img
                        src={pokemon.spriteUrl}
                        alt={pokemon.name}
                        className="object-contain"
                      />
                    ) : (
                      <div className="h-12 w-12 md:h-16 md:w-16 bg-background-tertiary rounded-full flex items-center justify-center">
                        <span className=" text-muted text-xs font-medium">
                          ?
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Status indicators */}
                  {isCompleted && (
                    <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-success border-2 border-success-light flex items-center justify-center shadow-md">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {isFailed && (
                    <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-error border-2 border-error-light flex items-center justify-center shadow-md">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Level number and Pokedex icon in bottom right */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <img
                      src="/src/assets/pokedex.png"
                      alt="Pokedex"
                      width="12"
                      height="12"
                      className="opacity-60"
                    />
                    <span className="text-xs font-medium text-secondary">
                      {index + 1}
                    </span>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-primary-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {isCompleted
                        ? 'View Solution'
                        : isFailed
                        ? 'Retry'
                        : 'Play'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
