import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "./contexts/PlayerContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import MenuButton from "./components/MenuButton";
import HomePage from "./components/HomePage";
import LevelsPage from "./components/LevelsPage";
import PuzzlePage from "./components/PuzzlePage";
import CompletionPage from "./components/CompletionPage";
import DevPage from "./components/DevPage";

export default function App() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <Router>
          <MenuButton />
          <Routes>
            {/* Home allows choosing game mode */}
            <Route path="/" element={<HomePage />} />

            {/* Legacy redirect for backward compatibility */}
            <Route path="/levels" element={<HomePage />} />

            {/* Pokémon mode routes */}
            <Route path="/pokemon/levels" element={<LevelsPage />} />
            <Route path="/pokemon/:puzzleId" element={<PuzzlePage />} />
            <Route
              path="/pokemon/:puzzleId/complete"
              element={<CompletionPage />}
            />

            {/* Animals mode - single puzzle loads directly */}
            <Route path="/animals" element={<PuzzlePage />} />
            <Route path="/animals/complete" element={<CompletionPage />} />
            <Route path="/dev" element={<DevPage />} />
          </Routes>
        </Router>
      </PlayerProvider>
    </ThemeProvider>
  );
}
