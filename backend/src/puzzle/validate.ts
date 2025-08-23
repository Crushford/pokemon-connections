import { readFile } from 'node:fs/promises';
import { countSolutions } from './solver.js';

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: yarn validate <path-to-puzzle.json>');
    process.exit(1);
  }
  const raw = await readFile(path, 'utf8');
  const puzzle = JSON.parse(raw) as { pool: number[] };
  const res = await countSolutions(puzzle.pool);
  console.log('Unique:', res.isUnique, 'Solutions:', res.solutions);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
