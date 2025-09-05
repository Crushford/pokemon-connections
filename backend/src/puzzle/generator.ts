import { readFile } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { type Group, PuzzleSchema, PuzzlesSchema } from '../data/types.js';
import { unique } from '../utils/arrays.js';
import { countSolutions } from './solver.js';
import { overlapScore } from './score.js';

function randInt(n: number) { return Math.floor(Math.random() * n); }

async function main() {
  const raw = await readFile('data/groupBank.json', 'utf8');
  const bank = JSON.parse(raw) as Group[];

  console.log(`Trying to generate puzzles from ${bank.length} groups...`);

  const puzzles: any[] = [];
  const targetPuzzleCount = 5; // Generate 5 puzzles by default
  const maxAttempts = 10000;

  for (let puzzleIndex = 0; puzzleIndex < targetPuzzleCount; puzzleIndex++) {
    console.log(`\nGenerating puzzle ${puzzleIndex + 1}/${targetPuzzleCount}...`);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt % 1000 === 0) console.log(`  Attempt ${attempt}/${maxAttempts}`);
      
      // Randomly select 4 groups
      const combo: Group[] = [];
      const used = new Set<number>();
      
      for (let i = 0; i < 4; i++) {
        let group: Group | undefined;
        do {
          group = bank[randInt(bank.length)];
        } while (!group || combo.some(g => g.id === group!.id));
        combo.push(group);
      }

      const pool = unique(combo.flatMap(g => g.members));
      if (pool.length !== 16) continue;

      const overlap = await overlapScore(pool);
      if (overlap < 4 || overlap > 10) continue;

      const { isUnique, solutions } = await countSolutions(pool);
      if (!isUnique) continue;

      const puzzle = PuzzleSchema.parse({
        groups: combo,
        pool
      });

      puzzles.push(puzzle);
      console.log(`  Generated puzzle ${puzzleIndex + 1}, solution ids:`, solutions[0]);
      break; // Move to next puzzle
    }

    if (puzzles.length === puzzleIndex) {
      console.error(`Failed to generate puzzle ${puzzleIndex + 1} after ${maxAttempts} attempts.`);
      break;
    }
  }

  if (puzzles.length === 0) {
    console.error('No valid puzzles found with current group bank.');
    process.exit(1);
  }

  const puzzlesData = PuzzlesSchema.parse({ puzzles });
  const fname = `data/puzzles.json`;
  await writeFile(fname, JSON.stringify(puzzlesData, null, 2), 'utf8');
  console.log(`\nWrote ${puzzles.length} puzzles to ${fname}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
