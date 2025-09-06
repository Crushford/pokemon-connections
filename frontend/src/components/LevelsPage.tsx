import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPuzzles } from '../lib/api'
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
    navigate(`/levels/${puzzleIndex}`)
  }

  const getPokemonById = (id: number): PokemonLite | null => {
    return pokemonData.find(pokemon => pokemon.id === id) || null
  }

  if (loading) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading levels...</p>
        </div>
      </div>
    )
  }

  if (!puzzlesData) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load levels</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh w-screen overflow-hidden flex flex-col p-4">
      <header className="flex-shrink-0 text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Pokémon Connections</h1>
        <p className="text-xs md:text-sm text-zinc-600 mt-2">
          Select a level to play
        </p>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {puzzlesData.puzzles.map((_, index) => {
              const pokemonId = index + 1
              const pokemon = getPokemonById(pokemonId)

              return (
                <button
                  key={index}
                  onClick={() => handleLevelSelect(index)}
                  className="group relative bg-white border-2 border-zinc-200 rounded-xl p-3 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
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
                      <div className="h-12 w-12 md:h-16 md:w-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-zinc-500 text-xs font-medium">
                          ?
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Level number and Pokedex icon in bottom right */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <img
                      src="/src/assets/pokedex.png"
                      alt="Pokedex"
                      width="12"
                      height="12"
                      className="opacity-60"
                    />
                    <span className="text-xs font-medium text-zinc-600">
                      {index + 1}
                    </span>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-indigo-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-sm">
                      Play
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
