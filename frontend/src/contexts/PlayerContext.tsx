import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode
} from 'react'

// Types
interface PlayerStats {
  incorrectAttempts: number
  totalGroups: number
  completedGroups: number
  timeSpent?: number
  pokedexUsage?: number
}

interface LevelProgress {
  completed: boolean
  failed: boolean
  bestScore?: PlayerStats
  attempts: number
  completedAt?: string
  failedAt?: string
}

interface PlayerState {
  levels: Record<number, LevelProgress>
  totalPlayTime: number
  preferences: {
    soundEnabled: boolean
    showHints: boolean
  }
}

// Actions
type PlayerAction =
  | { type: 'COMPLETE_LEVEL'; levelId: number; stats: PlayerStats }
  | { type: 'FAIL_LEVEL'; levelId: number; attempts: number }
  | { type: 'UPDATE_ATTEMPTS'; levelId: number; attempts: number }
  | {
      type: 'UPDATE_PREFERENCES'
      preferences: Partial<PlayerState['preferences']>
    }
  | { type: 'RESET_PROGRESS' }
  | { type: 'LOAD_FROM_STORAGE'; data: PlayerState }

// Initial state
const initialState: PlayerState = {
  levels: {},
  totalPlayTime: 0,
  preferences: {
    soundEnabled: true,
    showHints: true
  }
}

// Reducer
function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'COMPLETE_LEVEL':
      return {
        ...state,
        levels: {
          ...state.levels,
          [action.levelId]: {
            completed: true,
            failed: false,
            bestScore: action.stats,
            attempts: (state.levels[action.levelId]?.attempts || 0) + 1,
            completedAt: new Date().toISOString()
          }
        }
      }

    case 'FAIL_LEVEL':
      return {
        ...state,
        levels: {
          ...state.levels,
          [action.levelId]: {
            completed: false,
            failed: true,
            attempts: action.attempts,
            failedAt: new Date().toISOString()
          }
        }
      }

    case 'UPDATE_ATTEMPTS':
      return {
        ...state,
        levels: {
          ...state.levels,
          [action.levelId]: {
            ...state.levels[action.levelId],
            attempts: action.attempts
          }
        }
      }

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.preferences
        }
      }

    case 'RESET_PROGRESS':
      return {
        ...initialState,
        preferences: state.preferences // Keep preferences
      }

    case 'LOAD_FROM_STORAGE':
      return action.data

    default:
      return state
  }
}

// Context
const PlayerContext = createContext<{
  state: PlayerState
  dispatch: React.Dispatch<PlayerAction>
  completeLevel: (levelId: number, stats: PlayerStats) => void
  failLevel: (levelId: number, attempts: number) => void
  updateAttempts: (levelId: number, attempts: number) => void
  updatePreferences: (preferences: Partial<PlayerState['preferences']>) => void
  resetProgress: () => void
  getLevelProgress: (levelId: number) => LevelProgress | undefined
  isLevelCompleted: (levelId: number) => boolean
  isLevelFailed: (levelId: number) => boolean
} | null>(null)

// Provider component
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('pokemon-connections-player-data')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        dispatch({ type: 'LOAD_FROM_STORAGE', data: parsedData })
      } catch (error) {
        console.error('Failed to load player data:', error)
      }
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(
      'pokemon-connections-player-data',
      JSON.stringify(state)
    )
  }, [state])

  // Helper functions
  const completeLevel = (levelId: number, stats: PlayerStats) => {
    dispatch({ type: 'COMPLETE_LEVEL', levelId, stats })
  }

  const failLevel = (levelId: number, attempts: number) => {
    dispatch({ type: 'FAIL_LEVEL', levelId, attempts })
  }

  const updateAttempts = (levelId: number, attempts: number) => {
    dispatch({ type: 'UPDATE_ATTEMPTS', levelId, attempts })
  }

  const updatePreferences = (
    preferences: Partial<PlayerState['preferences']>
  ) => {
    dispatch({ type: 'UPDATE_PREFERENCES', preferences })
  }

  const resetProgress = () => {
    dispatch({ type: 'RESET_PROGRESS' })
  }

  const getLevelProgress = (levelId: number): LevelProgress | undefined => {
    return state.levels[levelId]
  }

  const isLevelCompleted = (levelId: number): boolean => {
    return state.levels[levelId]?.completed || false
  }

  const isLevelFailed = (levelId: number): boolean => {
    return state.levels[levelId]?.failed || false
  }

  return (
    <PlayerContext.Provider
      value={{
        state,
        dispatch,
        completeLevel,
        failLevel,
        updateAttempts,
        updatePreferences,
        resetProgress,
        getLevelProgress,
        isLevelCompleted,
        isLevelFailed
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

// Hook to use the context
export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
