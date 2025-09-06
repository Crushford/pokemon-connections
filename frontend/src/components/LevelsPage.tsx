import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPuzzles } from '../lib/api'

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
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadPuzzles = async () => {
      try {
        const data = await fetchPuzzles()
        setPuzzlesData(data)
      } catch (error) {
        console.error('Failed to load puzzles:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPuzzles()
  }, [])

  const handleLevelSelect = (puzzleIndex: number) => {
    navigate(`/levels/${puzzleIndex}`)
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
            {puzzlesData.puzzles.map((_, index) => (
              <button
                key={index}
                onClick={() => handleLevelSelect(index)}
                className="group relative bg-white border-2 border-zinc-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
              >
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-2">
                    {index + 1}
                  </div>
                  <div className="text-xs text-zinc-500">Level {index + 1}</div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-indigo-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">
                    Play
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
