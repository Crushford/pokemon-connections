import { readFile } from 'node:fs/promises';
import { countSolutions } from './solver.js';
import { PuzzlesSchema, PuzzleSchema } from '../data/types.js';

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: yarn validate <path-to-puzzle.json>');
    process.exit(1);
  }
  const raw = await readFile(path, 'utf8');
  const data = JSON.parse(raw);

  // Check if it's a puzzles array format
  if (data.puzzles && Array.isArray(data.puzzles)) {
    console.log(`Validating ${data.puzzles.length} puzzles...`);
    const puzzlesData = PuzzlesSchema.parse(data);
    
    for (let i = 0; i < puzzlesData.puzzles.length; i++) {
      const puzzle = puzzlesData.puzzles[i];
      if (puzzle) {
        const res = await countSolutions(puzzle.pool);
        console.log(`Puzzle ${i + 1}: Unique: ${res.isUnique}, Solutions: ${res.solutions.length}`);
        if (!res.isUnique) {
          console.log(`  Warning: Puzzle ${i + 1} has multiple solutions!`);
        }
      }
    }
  } else {
    // Handle individual puzzle format
    const puzzle = PuzzleSchema.parse(data);
    const res = await countSolutions(puzzle.pool);
    console.log('Unique:', res.isUnique, 'Solutions:', res.solutions.length);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
