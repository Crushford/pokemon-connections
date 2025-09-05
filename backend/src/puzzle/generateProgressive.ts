import { readFile } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { type Group, type Pokemon, PuzzleSchema } from '../data/types.js';
import { unique } from '../utils/arrays.js';
import { countSolutions } from './solver.js';
import { predicateFor } from './rules.js';

type SearchState = {
  selectedGroups: Group[];
  usedDimensions: Set<string>;
  remainingPool: number[];
  candidates: Group[];
};

/**
 * Progressive puzzle generator with backtracking and rule-based pruning.
 * 
 * Algorithm:
 * 1. Filter to Gen-1 base-stage Pokémon (evoStage === 1)
 * 2. Select 4 groups sequentially with backtracking
 * 3. After each selection, prune remaining Pokémon that match the group's rule
 * 4. Ensure dimension diversity (≥3 different dimensions)
 * 5. Validate uniqueness with existing solver
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
  
  // Order candidates by most constraining first (type and evo dimensions prune more)
  const orderedCandidates = orderCandidatesByConstraint(validGroups, baseStagePokemon);
  
  // Limit candidates to make search more manageable
  const limitedCandidates = orderedCandidates.slice(0, 500); // Only use top 500 candidates
  console.log(`Using top ${limitedCandidates.length} candidates for search`);
  
  // Try to generate puzzles
  const puzzles: any[] = [];
  const targetPuzzleCount = 1; // Start with just 1 puzzle for testing
  const maxAttempts = 100;
  
  for (let puzzleIndex = 0; puzzleIndex < targetPuzzleCount; puzzleIndex++) {
    console.log(`\nGenerating puzzle ${puzzleIndex + 1}/${targetPuzzleCount}...`);
    
    let found = false;
    for (let attempt = 0; attempt < maxAttempts && !found; attempt++) {
      if (attempt % 10 === 0) console.log(`  Attempt ${attempt}/${maxAttempts}`);
      
      const result = await generateSinglePuzzle(
        limitedCandidates,
        baseStagePokemon,
        baseStageIds
      );
      
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
  const fname = `data/puzzles-progressive.json`;
  await writeFile(fname, JSON.stringify({ puzzles }, null, 2), 'utf8');
  console.log(`\nWrote ${puzzles.length} puzzles to ${fname}`);
}

/**
 * Order candidates by how constraining they are (most constraining first).
 * Type and evolution dimensions tend to prune more Pokémon.
 */
function orderCandidatesByConstraint(groups: Group[], pokemon: Pokemon[]): Group[] {
  const pokemonMap = new Map(pokemon.map(p => [p.id, p]));
  
  return groups.sort((a, b) => {
    // Prefer type and evo dimensions (they prune more)
    const aDimScore = a.dimension === 'type' || a.dimension === 'evo' ? 1 : 0;
    const bDimScore = b.dimension === 'type' || b.dimension === 'evo' ? 1 : 0;
    if (aDimScore !== bDimScore) return bDimScore - aDimScore;
    
    // For type groups, prefer rarer types (fewer members)
    if (a.dimension === 'type' && b.dimension === 'type') {
      const aTypeCount = pokemon.filter(p => p.types.includes(a.rule.value)).length;
      const bTypeCount = pokemon.filter(p => p.types.includes(b.rule.value)).length;
      return aTypeCount - bTypeCount; // Rarer types first
    }
    
    return 0;
  });
}

/**
 * Generate a single puzzle using backtracking search.
 */
async function generateSinglePuzzle(
  candidates: Group[],
  pokemon: Pokemon[],
  validIds: Set<number>
): Promise<any | null> {
  const pokemonMap = new Map(pokemon.map(p => [p.id, p]));
  
  // Start with all base-stage Pokémon as the initial pool
  const initialPool = Array.from(validIds);
  
  // Add timeout to prevent infinite loops
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), 5000); // 5 second timeout
  });
  
  const searchPromise = backtrackSearch({
    selectedGroups: [],
    usedDimensions: new Set(),
    remainingPool: initialPool,
    candidates
  }, pokemonMap);
  
  const result = await Promise.race([searchPromise, timeoutPromise]);
  
  if (!result) return null;
  
  // Validate uniqueness
  const finalPool = unique(result.flatMap(g => g.members));
  const { isUnique } = await countSolutions(finalPool);
  
  if (!isUnique) {
    console.log('    Puzzle not unique, rejecting');
    return null;
  }
  
  // Validate pruning worked correctly
  if (!validatePruning(result, pokemonMap)) {
    console.log('    Pruning validation failed, rejecting');
    return null;
  }
  
  // Validate dimension diversity
  const dimensions = new Set(result.map(g => g.dimension));
  if (dimensions.size < 3) {
    console.log('    Insufficient dimension diversity, rejecting');
    return null;
  }
  
  return PuzzleSchema.parse({
    groups: result,
    pool: finalPool
  });
}

/**
 * Backtracking search to find valid group combinations.
 */
async function backtrackSearch(
  state: SearchState,
  pokemonMap: Map<number, Pokemon>
): Promise<Group[] | null> {
  // Base case: we have 4 groups
  if (state.selectedGroups.length === 4) {
    return state.selectedGroups;
  }
  
  const depth = state.selectedGroups.length;
  if (depth === 0) {
    console.log(`    Starting search with ${state.candidates.length} candidates and ${state.remainingPool.length} Pokémon`);
  }
  
  const remainingSlots = 4 - depth;
  
  // Prune candidates that can't work
  const validCandidates = state.candidates.filter(candidate => {
    // Must have all members in remaining pool
    if (!candidate.members.every(id => state.remainingPool.includes(id))) {
      return false;
    }
    
    // Must not overlap with already selected groups
    const selectedMembers = new Set(state.selectedGroups.flatMap(g => g.members));
    if (candidate.members.some(id => selectedMembers.has(id))) {
      return false;
    }
    
    // Check dimension diversity feasibility
    const newUsedDimensions = new Set([...state.usedDimensions, candidate.dimension]);
    const remainingDimensions = new Set(['type', 'stat', 'evo', 'habitat', 'color', 'egg', 'mechanic']);
    newUsedDimensions.forEach(d => remainingDimensions.delete(d));
    
    // If we need 3+ dimensions and only have 1-2 slots left, we need at least 2 more dimensions
    if (remainingSlots <= 2 && newUsedDimensions.size < 2) {
      return false;
    }
    
    return true;
  });
  
  // Try each valid candidate
  for (const candidate of validCandidates) {
    // Create new state with this candidate
    const newSelectedGroups = [...state.selectedGroups, candidate];
    const newUsedDimensions = new Set([...state.usedDimensions, candidate.dimension]);
    
    // Prune remaining pool based on this group's rule
    const predicate = predicateFor(candidate);
    const lockedMembers = new Set(candidate.members);
    const newRemainingPool = state.remainingPool.filter(id => {
      const pokemon = pokemonMap.get(id);
      if (!pokemon) return false;
      
      // Keep locked members
      if (lockedMembers.has(id)) return true;
      
      // Remove Pokémon that match the rule
      return !predicate(pokemon);
    });
    
    // Recompute candidates for new pool
    const newCandidates = state.candidates.filter(c => 
      c.members.every(id => newRemainingPool.includes(id)) &&
      !newSelectedGroups.some(g => g.id === c.id)
    );
    
    const newState: SearchState = {
      selectedGroups: newSelectedGroups,
      usedDimensions: newUsedDimensions,
      remainingPool: newRemainingPool,
      candidates: newCandidates
    };
    
    // Recursive call
    const result = await backtrackSearch(newState, pokemonMap);
    if (result) {
      return result;
    }
  }
  
  return null;
}

/**
 * Validate that pruning worked correctly - no extra matches should exist.
 */
function validatePruning(groups: Group[], pokemonMap: Map<number, Pokemon>): boolean {
  const allMembers = new Set(groups.flatMap(g => g.members));
  
  for (const group of groups) {
    const predicate = predicateFor(group);
    const lockedMembers = new Set(group.members);
    
    // Check that no other Pokémon in the pool matches this group's rule
    for (const memberId of allMembers) {
      if (lockedMembers.has(memberId)) continue;
      
      const pokemon = pokemonMap.get(memberId);
      if (pokemon && predicate(pokemon)) {
        console.log(`    Validation failed: ${pokemon.name} matches rule for ${group.name} but wasn't pruned`);
        return false;
      }
    }
  }
  
  return true;
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
