#!/bin/bash
# Copy Pokémon data to frontend public directory for serving

echo "Copying Pokémon data to frontend..."
cp data/pokemon.json ../frontend/public/

echo "Copying puzzle data to frontend..."
# Priority order: progressive puzzles, then regular puzzles, then individual files
if [ -f "data/puzzles-progressive-simple.json" ]; then
    cp data/puzzles-progressive-simple.json ../frontend/public/puzzle.json
    echo "✅ Progressive puzzles data copied successfully!"
elif [ -f "data/puzzles.json" ]; then
    cp data/puzzles.json ../frontend/public/puzzle.json
    echo "✅ Regular puzzles data copied successfully!"
else
    # Fallback to individual puzzle files
    LATEST_PUZZLE=$(ls -t data/puzzles/*.json | head -1)
    if [ -n "$LATEST_PUZZLE" ]; then
        cp "$LATEST_PUZZLE" ../frontend/public/puzzle.json
        echo "✅ Individual puzzle data copied successfully!"
    else
        echo "⚠️  No puzzle files found in data/puzzles/ or data/puzzles.json"
    fi
fi

echo "✅ Data copied successfully!"
