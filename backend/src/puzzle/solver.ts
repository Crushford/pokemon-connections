import { readFile } from 'node:fs/promises';
import { combinations, unique } from '../utils/arrays.js';
import { type Group } from '../data/types.js';

export type SolveResult = {
  isUnique: boolean;
  solutions: string[][]; // arrays of group ids
};

export async function countSolutions(pool: number[]): Promise<SolveResult> {
  const raw = await readFile('data/groupBank.json', 'utf8');
  const bank = JSON.parse(raw) as Group[];

  const poolSet = new Set(pool);
  const candidates = bank.filter(g => g.members.every(id => poolSet.has(id)));

  const sols: string[][] = [];
  for (const combo of combinations(candidates, 4)) {
    const allMembers = unique(combo.flatMap(g => g.members));
    if (allMembers.length !== pool.length) continue; // must cover exactly 16 with no overlap
    // Also ensure disjointness:
    const seen = new Set<number>();
    let disjoint = true;
    for (const g of combo) {
      for (const id of g.members) {
        if (seen.has(id)) { disjoint = false; break; }
        seen.add(id);
      }
      if (!disjoint) break;
    }
    if (!disjoint) continue;

    // Check union equals pool
    if (allMembers.every(id => poolSet.has(id))) {
      sols.push(combo.map(g => g.id));
      if (sols.length > 1) break;
    }
  }

  return { isUnique: sols.length === 1, solutions: sols };
}
