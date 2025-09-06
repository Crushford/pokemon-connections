import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'

export default function MenuButton() {
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { resetProgress } = usePlayer()

  // Check if we're on a puzzle page
  const isPuzzlePage =
    location.pathname.includes('/levels/') &&
    !location.pathname.includes('/complete')

  // Extract puzzle index from URL if on puzzle page
  const puzzleIndex = isPuzzlePage
    ? parseInt(location.pathname.split('/levels/')[1] || '0', 10)
    : 0

  function handleMenuToggle() {
    setShowMenu(!showMenu)
  }

  function handleGoToLevelSelection() {
    navigate('/levels')
    setShowMenu(false)
  }

  function handleNextLevel() {
    navigate(`/levels/${puzzleIndex + 1}`)
    setShowMenu(false)
  }

  function handleResetProgress() {
    if (
      window.confirm(
        'Are you sure you want to reset all your progress? This will clear all completed and failed levels.'
      )
    ) {
      resetProgress()
      setShowMenu(false)
      // Navigate to levels page to show the reset state
      navigate('/levels')
    }
  }

  // Close menu when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowMenu(false)
    }
  }

  return (
    <>
      {/* Menu button */}
      <button
        onClick={handleMenuToggle}
        className="fixed top-4 right-4 z-40 p-2 bg-white border border-zinc-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
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
        <div className="fixed inset-0 z-50" onClick={handleBackdropClick}>
          <div className="absolute top-16 right-4 w-64 bg-white border border-zinc-200 rounded-lg shadow-lg">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-zinc-800 mb-2">Menu</h3>
                {isPuzzlePage && (
                  <p className="text-sm text-zinc-600">
                    Level: {puzzleIndex + 1}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {/* Show level selection button if not already on levels page */}
                {!location.pathname.includes('/levels') && (
                  <button
                    onClick={handleGoToLevelSelection}
                    className="w-full px-3 py-2 text-left text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                  >
                    Level Selection
                  </button>
                )}

                {/* Show puzzle-specific options only on puzzle pages */}
                {isPuzzlePage && (
                  <>
                    <button
                      onClick={handleGoToLevelSelection}
                      className="w-full px-3 py-2 text-left text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                    >
                      To Level Selection
                    </button>

                    <button
                      onClick={handleNextLevel}
                      className="w-full px-3 py-2 text-left text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200"
                    >
                      Next Level
                    </button>
                  </>
                )}

                {/* Always show reset progress button */}
                <button
                  onClick={handleResetProgress}
                  className="w-full px-3 py-2 text-left text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200"
                >
                  Reset All Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
