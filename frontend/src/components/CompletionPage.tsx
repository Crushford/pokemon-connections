import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CompletionModal from './CompletionModal'
import { usePlayer } from '../contexts/PlayerContext'

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

export default function CompletionPage() {
  const { puzzleId } = useParams<{ puzzleId: string }>()
  const navigate = useNavigate()
  const currentPuzzleIndex = parseInt(puzzleId || '0', 10)
  const { getLevelProgress } = usePlayer()

  const [puzzlesData, setPuzzlesData] = useState<PuzzlesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    incorrectAttempts: 0,
    totalGroups: 0,
    completedGroups: 0,
    timeSpent: 0,
    pokedexUsage: 0
  })

  // Fetch puzzle data and get actual player stats
  useEffect(() => {
    fetch('/puzzle.json')
      .then(response => response.json())
      .then((puzzlesData: PuzzlesData) => {
        setPuzzlesData(puzzlesData)

        const currentPuzzle = puzzlesData.puzzles[currentPuzzleIndex]
        const levelId = currentPuzzleIndex + 1
        const levelProgress = getLevelProgress(levelId)

        if (currentPuzzle && levelProgress?.bestScore) {
          // Use actual player stats from the completed level
          setStats({
            incorrectAttempts: levelProgress.bestScore.incorrectAttempts,
            totalGroups: levelProgress.bestScore.totalGroups,
            completedGroups: levelProgress.bestScore.completedGroups,
            timeSpent: levelProgress.bestScore.timeSpent || 0,
            pokedexUsage: levelProgress.bestScore.pokedexUsage || 0
          })
        } else if (currentPuzzle) {
          // Fallback to puzzle data if no player stats available
          setStats({
            incorrectAttempts: 0,
            totalGroups: currentPuzzle.groups.length,
            completedGroups: currentPuzzle.groups.length,
            timeSpent: 0,
            pokedexUsage: 0
          })
        }

        setIsLoading(false)
      })
      .catch(error => {
        console.error('❌ Failed to load puzzle data:', error)
        setIsLoading(false)
      })
  }, [currentPuzzleIndex, getLevelProgress])

  function handleNextPuzzle() {
    if (puzzlesData && currentPuzzleIndex < puzzlesData.puzzles.length - 1) {
      navigate(`/levels/${currentPuzzleIndex + 1}`)
    } else {
      // No more puzzles, go back to levels page
      navigate('/levels')
    }
  }

  function handleClose() {
    // Go back to the current puzzle
    navigate(`/levels/${currentPuzzleIndex}`)
  }

  function handleGoToLevels() {
    // Navigate to the levels page
    navigate('/levels')
  }

  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center p-4 bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading completion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh w-screen">
      <CompletionModal
        isOpen={true}
        onClose={handleClose}
        onNextPuzzle={handleNextPuzzle}
        onGoToLevels={handleGoToLevels}
        stats={stats}
        currentPuzzleIndex={currentPuzzleIndex}
        totalPuzzles={puzzlesData?.puzzles.length || 0}
      />
    </div>
  )
}
