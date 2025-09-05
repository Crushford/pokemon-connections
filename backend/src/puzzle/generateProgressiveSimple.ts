import { readFile } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { type Group, type Pokemon, PuzzleSchema } from '../data/types.js';
import { unique } from '../utils/arrays.js';
import { validateProgressivePuzzle } from './validateProgressive.js';
import { predicateFor } from './rules.js';

/**
 * Simplified progressive puzzle generator that focuses on the core pruning concept.
 * This version is more likely to succeed by being less strict about constraints.
 */
async function main() {
  console.log('Loading data...');
  
  // Load Pokémon data and filter to Gen-1 base-stage
  const pokemonRaw = await readFile('data/pokemon.json', 'utf8');
  const allPokemon = JSON.parse(pokemonRaw) as Pokemon[];
  const baseStagePokemon = allPokemon.filter(m => m.generation === 1 && m.evoStage === 1);
  
  console.log(`Found ${baseStagePokemon.length} Gen-1 base-stage Pokémon`);
  
  // Load group bank and filter to valid candidates
  const groupsRaw = await readFile('data/groupBank.json', 'utf8');
  const allGroups = JSON.parse(groupsRaw) as Group[];
  
  // Filter groups to only include those with members in our base-stage pool
  const baseStageIds = new Set(baseStagePokemon.map(m => m.id));
  const validGroups = allGroups.filter(g => 
    g.members.every(id => baseStageIds.has(id)) && g.members.length === 4
  );
  
  console.log(`Found ${validGroups.length} valid groups for base-stage Pokémon`);
  
  // Try to generate puzzles with a simpler approach
  const puzzles: any[] = [];
  const targetPuzzleCount = 1;
  const maxAttempts = 50;
  
  for (let puzzleIndex = 0; puzzleIndex < targetPuzzleCount; puzzleIndex++) {
    console.log(`\nGenerating puzzle ${puzzleIndex + 1}/${targetPuzzleCount}...`);
    
    let found = false;
    for (let attempt = 0; attempt < maxAttempts && !found; attempt++) {
      if (attempt % 10 === 0) console.log(`  Attempt ${attempt}/${maxAttempts}`);
      
      const result = await generateSimplePuzzle(validGroups, baseStagePokemon, baseStageIds);
      
      if (result) {
        puzzles.push(result);
        console.log(`  Generated puzzle ${puzzleIndex + 1}`);
        found = true;
      } else if (attempt % 10 === 0) {
        console.log(`    No valid puzzle found in attempt ${attempt}`);
      }
    }
    
    if (!found) {
      console.log(`  Failed to generate puzzle ${puzzleIndex + 1} after ${maxAttempts} attempts`);
    }
  }
  
  if (puzzles.length === 0) {
    console.error('No valid puzzles found');
    process.exit(1);
  }
  
  // Write puzzles to file
  const fname = `data/puzzles-progressive-simple.json`;
  await writeFile(fname, JSON.stringify({ puzzles }, null, 2), 'utf8');
  console.log(`\nWrote ${puzzles.length} puzzles to ${fname}`);
}

/**
 * Generate a single puzzle using a simplified approach:
 * 1. Pick 4 groups randomly
 * 2. Apply pruning to remove extra matches
 * 3. Validate uniqueness
 */
async function generateSimplePuzzle(
  candidates: Group[],
  pokemon: Pokemon[],
  validIds: Set<number>
): Promise<any | null> {
  const pokemonMap = new Map(pokemon.map(p => [p.id, p]));
  
  // Randomly select 4 groups
  const selectedGroups: Group[] = [];
  const usedMembers = new Set<number>();
  const usedDimensions = new Set<string>();
  
  // Try to select 4 groups with some diversity
  for (let i = 0; i < 4; i++) {
    const availableCandidates = candidates.filter(candidate => {
      // Must not overlap with already selected groups
      if (candidate.members.some(id => usedMembers.has(id))) return false;
      
      // For now, allow all groups to be the same dimension (type)
      // TODO: Add more dimension types to enable diversity
      
      return true;
    });
    
    if (availableCandidates.length === 0) {
      console.log(`    No candidates available at step ${i + 1}`);
      console.log(`    Used members so far: ${Array.from(usedMembers).join(', ')}`);
      console.log(`    Used dimensions so far: ${Array.from(usedDimensions).join(', ')}`);
      return null; // Can't find valid groups
    }
    
    // Randomly select from available candidates
    const selected = availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
    selectedGroups.push(selected);
    
    // Update tracking sets
    selected.members.forEach(id => usedMembers.add(id));
    usedDimensions.add(selected.dimension);
  }
  
  // Apply pruning: remove Pokémon that match any group's rule (except the locked 4)
  const lockedMembers = new Set(selectedGroups.flatMap(g => g.members));
  let prunedPool = Array.from(validIds);
  
  // For each group, remove all Pokémon that match its rule (except the 4 locked members)
  for (const group of selectedGroups) {
    const predicate = predicateFor(group);
    const groupLockedMembers = new Set(group.members);
    
    prunedPool = prunedPool.filter(id => {
      const pokemon = pokemonMap.get(id);
      if (!pokemon) return false;
      
      // Always keep the 4 locked members for this group
      if (groupLockedMembers.has(id)) return true;
      
      // Remove Pokémon that match this group's rule
      return !predicate(pokemon);
    });
  }
  
  // Final pool should be exactly the 16 locked members
  const finalPool = Array.from(lockedMembers);
  
  if (finalPool.length !== 16) {
    console.log(`    Invalid pool size: ${finalPool.length} (expected 16)`);
    return null;
  }
  
  console.log(`    Pool size OK: ${finalPool.length}`);
  
  // Validate uniqueness with progressive validation
  console.log('    Validating uniqueness...');
  const { isUnique } = await validateProgressivePuzzle(selectedGroups, finalPool);
  if (!isUnique) {
    console.log('    Puzzle not unique, rejecting');
    return null;
  }
  
  console.log('    Uniqueness validation passed');
  
  // Validate pruning worked
  console.log('    Validating pruning...');
  if (!validatePruning(selectedGroups, pokemonMap, finalPool)) {
    console.log('    Pruning validation failed, rejecting');
    return null;
  }
  
  console.log('    Pruning validation passed');
  
  console.log(`    Success! Dimensions: ${Array.from(usedDimensions).join(', ')}`);
  
  return PuzzleSchema.parse({
    groups: selectedGroups,
    pool: finalPool
  });
}

/**
 * Validate that pruning worked correctly - the pool should only contain the 16 locked members.
 */
function validatePruning(groups: Group[], pokemonMap: Map<number, Pokemon>, pool: number[]): boolean {
  const expectedMembers = new Set(groups.flatMap(g => g.members));
  const actualMembers = new Set(pool);
  
  // Check that pool contains exactly the expected 16 members
  if (expectedMembers.size !== actualMembers.size) {
    console.log(`    Pool size mismatch: expected ${expectedMembers.size}, got ${actualMembers.size}`);
    return false;
  }
  
  for (const member of expectedMembers) {
    if (!actualMembers.has(member)) {
      console.log(`    Missing expected member: ${member}`);
      return false;
    }
  }
  
  for (const member of actualMembers) {
    if (!expectedMembers.has(member)) {
      console.log(`    Unexpected member in pool: ${member}`);
      return false;
    }
  }
  
  return true;
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
