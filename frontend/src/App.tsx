import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import PuzzlePage from './components/PuzzlePage'
import CompletionPage from './components/CompletionPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:puzzleId" element={<PuzzlePage />} />
        <Route path="/:puzzleId/complete" element={<CompletionPage />} />
      </Routes>
    </Router>
  )
}
