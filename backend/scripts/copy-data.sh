#!/bin/bash
# Copy Pokémon data to frontend public directory for serving

echo "Copying Pokémon data to frontend..."
cp data/pokemon.json ../frontend/public/
echo "✅ Data copied successfully!"
