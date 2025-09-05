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
  const accuracy = stats.completedGroups > 0 
    ? Math.round((stats.completedGroups / (stats.completedGroups + stats.incorrectAttempts)) * 100)
    : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Puzzle Complete!
          </h2>
          <p className="text-green-100 text-lg">
            Great job finding all the connections!
          </p>
        </div>

        {/* Stats Section */}
        <div className="px-6 py-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Your Performance
          </h3>
          
          <div className="space-y-4">
            {/* Accuracy */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🎯</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Accuracy</p>
                  <p className="text-sm text-gray-600">Correct vs Total Attempts</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{accuracy}%</p>
                <p className="text-sm text-gray-600">
                  {stats.completedGroups}/{stats.completedGroups + stats.incorrectAttempts}
                </p>
              </div>
            </div>

            {/* Incorrect Attempts */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">❌</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Wrong Attempts</p>
                  <p className="text-sm text-gray-600">Times you guessed incorrectly</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">{stats.incorrectAttempts}</p>
              </div>
            </div>

            {/* Groups Found */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">✅</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Groups Found</p>
                  <p className="text-sm text-gray-600">Connections you discovered</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{stats.completedGroups}</p>
                <p className="text-sm text-gray-600">out of {stats.totalGroups}</p>
              </div>
            </div>
          </div>

          {/* Performance Rating */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Performance Rating</p>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl ${
                      star <= Math.ceil(accuracy / 20) 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {accuracy >= 80 ? 'Excellent!' : 
                 accuracy >= 60 ? 'Good Job!' : 
                 accuracy >= 40 ? 'Not Bad!' : 
                 'Keep Trying!'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-3">
            {!isLastPuzzle ? (
              <>
                <button
                  onClick={onNextPuzzle}
                  className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Next Puzzle ({currentPuzzleIndex + 2}/{totalPuzzles})
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-all duration-200"
                >
                  Stay Here
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 shadow-md hover:shadow-lg"
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
