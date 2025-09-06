import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CompletionModal from './CompletionModal'

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

  const [puzzlesData, setPuzzlesData] = useState<PuzzlesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    incorrectAttempts: 0,
    totalGroups: 0,
    completedGroups: 0
  })

  // Fetch puzzle data to get stats
  useEffect(() => {
    fetch('/puzzle.json')
      .then(response => response.json())
      .then((puzzlesData: PuzzlesData) => {
        setPuzzlesData(puzzlesData)

        // For now, we'll use placeholder stats since we don't have access to the actual game state
        // In a real implementation, you might want to pass these through URL params or localStorage
        const currentPuzzle = puzzlesData.puzzles[currentPuzzleIndex]
        if (currentPuzzle) {
          setStats({
            incorrectAttempts: 0, // This would come from game state
            totalGroups: currentPuzzle.groups.length,
            completedGroups: currentPuzzle.groups.length // Assuming all groups were completed
          })
        }

        setIsLoading(false)
      })
      .catch(error => {
        console.error('❌ Failed to load puzzle data:', error)
        setIsLoading(false)
      })
  }, [currentPuzzleIndex])

  function handleNextPuzzle() {
    if (puzzlesData && currentPuzzleIndex < puzzlesData.puzzles.length - 1) {
      navigate(`/${currentPuzzleIndex + 1}`)
    } else {
      // No more puzzles, go back to home (which redirects to first puzzle)
      navigate('/')
    }
  }

  function handleClose() {
    // Go back to the current puzzle
    navigate(`/${currentPuzzleIndex}`)
  }

  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading completion...</p>
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
        stats={stats}
        currentPuzzleIndex={currentPuzzleIndex}
        totalPuzzles={puzzlesData?.puzzles.length || 0}
      />
    </div>
  )
}
