import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="h-dvh w-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text">Connections</h1>
          <p className="text-secondary text-sm mt-2">Choose a game to play</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Link
            to="/pokemon/levels"
            className="block p-5 rounded-xl border-2 border-border bg-background-card hover:border-primary hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text">
                  Pokémon Connections
                </h2>
                <p className="text-secondary text-sm">
                  Sort Pokémon into groups
                </p>
              </div>
              <span className="text-2xl">⚡️</span>
            </div>
          </Link>

          <Link
            to="/animals"
            className="block p-5 rounded-xl border-2 border-border bg-background-card hover:border-primary hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text">
                  Animals Connections
                </h2>
                <p className="text-secondary text-sm">
                  Sort animals into groups
                </p>
              </div>
              <span className="text-2xl">🦁</span>
            </div>
          </Link>
        </div>

        <p className="text-center text-xs text-secondary mt-6">
          Tip: Click the info icon on a card to learn more
        </p>
      </div>
    </div>
  );
}
