#!/bin/bash
# Copy Pokémon data to frontend public directory for serving

echo "Copying Pokémon data to frontend..."
cp data/pokemon.json ../frontend/public/

echo "Copying puzzle data to frontend..."
# Copy the most recent puzzle file
LATEST_PUZZLE=$(ls -t data/puzzles/*.json | head -1)
if [ -n "$LATEST_PUZZLE" ]; then
    cp "$LATEST_PUZZLE" ../frontend/public/puzzle.json
    echo "✅ Puzzle data copied successfully!"
else
    echo "⚠️  No puzzle files found in data/puzzles/"
fi

echo "✅ Data copied successfully!"
