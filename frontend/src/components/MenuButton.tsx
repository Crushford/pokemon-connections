import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { usePlayer } from '../contexts/PlayerContext'
import { useTheme } from '../contexts/ThemeContext'

export default function MenuButton() {
  const [showMenu, setShowMenu] = useState<boolean>(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { resetProgress } = usePlayer()
  const { isDarkMode, toggleTheme } = useTheme()

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

  function handleThemeToggle() {
    toggleTheme()
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
        className="fixed top-4 right-4 z-40 p-2 bg-background-card border border-border rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Open menu"
      >
        <svg
          className="h-5 w-5 text-text"
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
          <div className="absolute top-16 right-4 w-64 bg-background-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-text mb-2">Menu</h3>
                {isPuzzlePage && (
                  <p className="text-sm text-secondary">
                    Level: {puzzleIndex + 1}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {/* Theme toggle button */}
                <button
                  onClick={handleThemeToggle}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                    isDarkMode
                      ? 'bg-background-tertiary  text hover:bg-background-secondary'
                      : 'bg-background-tertiary  text hover:bg-background-secondary'
                  }`}
                >
                  {isDarkMode ? (
                    <>
                      <span className="text-lg">☀️</span>
                      Light Mode
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🌙</span>
                      Dark Mode
                    </>
                  )}
                </button>

                {/* Show level selection button if not already on levels page */}
                {!location.pathname.includes('/levels') && (
                  <button
                    onClick={handleGoToLevelSelection}
                    className="w-full px-3 py-2 text-left text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors duration-200"
                  >
                    Level Selection
                  </button>
                )}

                {/* Show puzzle-specific options only on puzzle pages */}
                {isPuzzlePage && (
                  <>
                    <button
                      onClick={handleGoToLevelSelection}
                      className="w-full px-3 py-2 text-left text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors duration-200"
                    >
                      To Level Selection
                    </button>

                    <button
                      onClick={handleNextLevel}
                      className="w-full px-3 py-2 text-left text-sm bg-success-light text-success-dark rounded-lg hover:bg-success transition-colors duration-200"
                    >
                      Next Level
                    </button>
                  </>
                )}

                {/* Always show reset progress button */}
                <button
                  onClick={handleResetProgress}
                  className="w-full px-3 py-2 text-left text-sm bg-error-light text-error-dark rounded-lg hover:bg-error transition-colors duration-200"
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
