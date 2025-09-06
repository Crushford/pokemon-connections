import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PlayerProvider } from './contexts/PlayerContext'
import MenuButton from './components/MenuButton'
import HomePage from './components/HomePage'
import LevelsPage from './components/LevelsPage'
import PuzzlePage from './components/PuzzlePage'
import CompletionPage from './components/CompletionPage'

export default function App() {
  return (
    <PlayerProvider>
      <Router>
        <MenuButton />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/levels" element={<LevelsPage />} />
          <Route path="/levels/:puzzleId" element={<PuzzlePage />} />
          <Route
            path="/levels/:puzzleId/complete"
            element={<CompletionPage />}
          />
        </Routes>
      </Router>
    </PlayerProvider>
  )
}
