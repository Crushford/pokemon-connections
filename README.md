# Pokémon Connections

A puzzle game where players group 4 related Pokémon from a 4x4 grid.

## Project Structure

This is a monorepo containing both frontend and backend:

```
pokemon-connections/
├── backend/          # Node.js + TypeScript backend
│   ├── src/         # Source code
│   ├── data/        # Generated data files
│   └── scripts/     # Utility scripts
└── frontend/        # React + Vite + TypeScript frontend
    ├── src/         # Source code
    └── public/      # Static assets
```

## Quick Start

### Backend Setup
```bash
cd backend
yarn install
yarn etl        # Fetch Pokémon data from PokeAPI
yarn groups     # Generate group combinations
yarn generate   # Create a puzzle
```

### Frontend Setup
```bash
cd frontend
yarn install
yarn dev        # Start development server
```

## Development

- **Backend**: Runs ETL processes, generates puzzles, validates solutions
- **Frontend**: React app with Tailwind CSS for the game interface
- **Data Flow**: Backend generates data → copied to frontend/public → served by Vite

## Commands

### Backend
- `yarn etl` - Fetch Pokémon data from PokeAPI
- `yarn groups` - Build group combinations
- `yarn generate` - Create a new puzzle
- `yarn validate <file>` - Validate a puzzle solution

### Frontend
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
