interface CompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onNextPuzzle: () => void
  stats: {
    incorrectAttempts: number
    totalGroups: number
    completedGroups: number
  }
  currentPuzzleIndex: number
  totalPuzzles: number
}

export default function CompletionModal({
  isOpen,
  onClose,
  onNextPuzzle,
  stats,
  currentPuzzleIndex,
  totalPuzzles
}: CompletionModalProps) {
  if (!isOpen) return null

  const isLastPuzzle = currentPuzzleIndex >= totalPuzzles - 1

  return (
    <div className="h-dvh fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background-card rounded-2xl shadow-2xl max-w-md w-full mx-4 h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-4 md:py-6 text-center flex-shrink-0">
          <div className="text-3xl md:text-5xl mb-1 md:mb-2">🎉</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
            Puzzle Complete!
          </h2>
          <p className="text-green-100 text-xs md:text-sm">
            Great job finding all the connections!
          </p>
        </div>

        {/* Stats Section - Scrollable */}
        <div className="px-4 py-3 md:py-4 overflow-y-auto flex-1 min-h-0">
          <h3 className="text-lg font-bold text-text mb-3 text-center">
            Your Performance
          </h3>

          <div className="space-y-2 md:space-y-3">
            {stats.incorrectAttempts === 0 ? (
              /* Perfect Score */
              <div className="flex items-center justify-center p-2 md:p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs md:text-sm">
                      ⭐
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-text text-sm md:text-base">
                      Perfect!
                    </p>
                    <p className="text-xs md:text-sm text-secondary">
                      You did it without any mistakes
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Incorrect Attempts */
              <div className="flex items-center justify-between p-2 md:p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs md:text-sm">
                      ❌
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-text text-sm md:text-base">
                      Wrong Attempts
                    </p>
                    <p className="text-xs md:text-sm text-secondary">
                      Times you guessed incorrectly
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl md:text-2xl font-bold text-orange-600">
                    {stats.incorrectAttempts}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 bg-background-secondary border-t border-border flex-shrink-0">
          <div className="flex flex-col md:flex-row gap-2">
            {!isLastPuzzle ? (
              <>
                <button
                  onClick={onNextPuzzle}
                  className="flex-1 bg-indigo-600 text-white font-semibold py-2 md:py-3 px-4 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                >
                  Next Puzzle ({currentPuzzleIndex + 2}/{totalPuzzles})
                </button>
                <button
                  onClick={onClose}
                  className="px-4 md:px-6 py-2 md:py-3 border-2 border-border bg-background-card text-text font-semibold rounded-lg hover:bg-background-secondary hover:border-border-secondary active:bg-background-tertiary transition-all duration-200 text-sm md:text-base"
                >
                  Stay Here
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full bg-indigo-600 text-white font-semibold py-2 md:py-3 px-4 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
              >
                🎉 All Puzzles Complete!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
