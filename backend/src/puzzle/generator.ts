import { readFile } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { type Group, PuzzleSchema } from '../data/types.js';
import { unique } from '../utils/arrays.js';
import { countSolutions } from './solver.js';
import { overlapScore } from './score.js';

function randInt(n: number) { return Math.floor(Math.random() * n); }

async function main() {
  const raw = await readFile('data/groupBank.json', 'utf8');
  const bank = JSON.parse(raw) as Group[];

  console.log(`Trying to generate puzzle from ${bank.length} groups...`);

  // Try random combinations instead of all combinations
  const maxAttempts = 10000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt % 1000 === 0) console.log(`Attempt ${attempt}/${maxAttempts}`);
    
    // Randomly select 4 groups
    const combo: Group[] = [];
    const used = new Set<number>();
    
    for (let i = 0; i < 4; i++) {
      let group: Group;
      do {
        group = bank[randInt(bank.length)];
      } while (combo.some(g => g.id === group.id));
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

    const fname = `data/puzzles/${Date.now()}.json`;
    await writeFile(fname, JSON.stringify(puzzle, null, 2), 'utf8');
    console.log('Wrote puzzle', fname, 'solution ids:', solutions[0]);
    return;
  }

  console.error('No valid puzzle found with current group bank.');
  process.exit(1);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
