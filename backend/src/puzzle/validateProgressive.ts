import { readFile } from 'node:fs/promises';
import { type Group, type Pokemon } from '../data/types.js';
import { combinations } from '../utils/arrays.js';

/**
 * Simplified validation for progressive puzzles.
 * Since we construct puzzles by design, we only need to check if there are
 * alternative ways to group the same 16 Pokémon.
 */
export async function validateProgressivePuzzle(
  selectedGroups: Group[],
  pool: number[]
): Promise<{ isUnique: boolean; alternativeSolutions: Group[][] }> {
  // Load group bank
  const raw = await readFile('data/groupBank.json', 'utf8');
  const allGroups = JSON.parse(raw) as Group[];
  
  // Find all groups that could work with this pool
  const poolSet = new Set(pool);
  const candidates = allGroups.filter(g => 
    g.members.every(id => poolSet.has(id)) && g.members.length === 4
  );
  
  // Limit candidates to prevent memory issues
  const limitedCandidates = candidates.slice(0, 100); // Only check first 100 candidates
  
  console.log(`    Checking ${limitedCandidates.length} candidate groups for alternatives`);
  
  const solutions: Group[][] = [];
  const selectedGroupIds = new Set(selectedGroups.map(g => g.id));
  
  // Try all combinations of 4 groups
  for (const combo of combinations(limitedCandidates, 4)) {
    // Check if this combination covers exactly the pool
    const allMembers = new Set(combo.flatMap(g => g.members));
    
    // Must cover exactly 16 with no overlap
    if (allMembers.size !== pool.length) continue;
    
    // Check disjointness
    const seen = new Set<number>();
    let disjoint = true;
    for (const g of combo) {
      for (const id of g.members) {
        if (seen.has(id)) { 
          disjoint = false; 
          break; 
        }
        seen.add(id);
      }
      if (!disjoint) break;
    }
    if (!disjoint) continue;
    
    // Check if union equals pool
    if (Array.from(allMembers).every(id => poolSet.has(id))) {
      solutions.push(combo);
      
      // If we find a different solution, we can stop
      if (combo.some(g => !selectedGroupIds.has(g.id))) {
        console.log(`    Found alternative solution with different groups`);
        return { isUnique: false, alternativeSolutions: solutions };
      }
    }
  }
  
  // If we only found the original solution (or no solutions), it's unique
  const isUnique = solutions.length <= 1 || 
    solutions.every(sol => sol.every(g => selectedGroupIds.has(g.id)));
  
  return { isUnique, alternativeSolutions: solutions };
}
