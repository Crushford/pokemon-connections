import { readFile } from 'node:fs/promises';
import { type Group, type Pokemon } from '../data/types.js';

/**
 * Debug script to understand the group structure and constraints.
 */
async function main() {
  console.log('Loading data...');
  
  // Load Pokémon data and filter to Gen-1 base-stage
  const pokemonRaw = await readFile('data/pokemon.json', 'utf8');
  const allPokemon = JSON.parse(pokemonRaw) as Pokemon[];
  const baseStagePokemon = allPokemon.filter(m => m.generation === 1 && m.evoStage === 1);
  
  console.log(`Found ${baseStagePokemon.length} Gen-1 base-stage Pokémon`);
  console.log('Base-stage Pokémon:', baseStagePokemon.map(p => `${p.name}(${p.id})`).slice(0, 10).join(', '));
  
  // Load group bank and filter to valid candidates
  const groupsRaw = await readFile('data/groupBank.json', 'utf8');
  const allGroups = JSON.parse(groupsRaw) as Group[];
  
  // Filter groups to only include those with members in our base-stage pool
  const baseStageIds = new Set(baseStagePokemon.map(m => m.id));
  const validGroups = allGroups.filter(g => 
    g.members.every(id => baseStageIds.has(id)) && g.members.length === 4
  );
  
  console.log(`Found ${validGroups.length} valid groups for base-stage Pokémon`);
  
  // Analyze group dimensions
  const dimensionCounts = new Map<string, number>();
  for (const group of validGroups) {
    dimensionCounts.set(group.dimension, (dimensionCounts.get(group.dimension) || 0) + 1);
  }
  
  console.log('Dimension distribution:');
  for (const [dim, count] of dimensionCounts.entries()) {
    console.log(`  ${dim}: ${count} groups`);
  }
  
  // Try to find 4 non-overlapping groups
  console.log('\nTrying to find 4 non-overlapping groups...');
  
  const selectedGroups: Group[] = [];
  const usedMembers = new Set<number>();
  
  for (let i = 0; i < 4; i++) {
    const availableCandidates = validGroups.filter(candidate => {
      return !candidate.members.some(id => usedMembers.has(id));
    });
    
    console.log(`Step ${i + 1}: ${availableCandidates.length} available candidates`);
    
    if (availableCandidates.length === 0) {
      console.log(`Failed at step ${i + 1} - no available candidates`);
      break;
    }
    
    // Pick the first available candidate
    const selected = availableCandidates[0];
    selectedGroups.push(selected);
    
    console.log(`Selected: ${selected.name} (${selected.members.join(', ')})`);
    
    // Update used members
    selected.members.forEach(id => usedMembers.add(id));
  }
  
  console.log(`\nSuccessfully selected ${selectedGroups.length} groups`);
  
  if (selectedGroups.length === 4) {
    const allMembers = Array.from(usedMembers);
    console.log(`Total unique members: ${allMembers.length}`);
    console.log(`Members: ${allMembers.join(', ')}`);
    
    // Check if we can find any groups that would work with these members
    const remainingCandidates = validGroups.filter(g => 
      g.members.every(id => allMembers.includes(id))
    );
    console.log(`Groups that could work with these members: ${remainingCandidates.length}`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
