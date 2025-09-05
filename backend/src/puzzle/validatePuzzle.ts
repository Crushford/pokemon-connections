import { type Pokemon, type PokemonData, type Puzzle } from '../data/types.js';

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  pokemonTypeConflicts: Array<{
    pokemonId: number;
    pokemonName: string;
    pokemonTypes: string[];
    currentCategory: string;
    conflictingCategories: string[];
  }>;
};

/**
 * Gets Pokemon by ID
 */
function getPokemonById(pokemonData: PokemonData, id: number): Pokemon | undefined {
  return pokemonData.pokemon.find(p => p.id === id);
}

/**
 * Extracts type from category name (e.g., "Fire Type" -> "fire")
 */
function extractTypeFromCategoryName(categoryName: string): string {
  const match = categoryName.match(/^(.+?)\s+Type$/i);
  if (match) {
    return match[1].toLowerCase();
  }
  return categoryName.toLowerCase();
}

/**
 * Validates a puzzle for type conflicts and returns detailed results
 */
export function validatePuzzle(puzzle: Puzzle, pokemonData: PokemonData): ValidationResult {
  console.log('\n🔍 Starting comprehensive puzzle validation...');
  console.log('=' .repeat(60));
  
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    pokemonTypeConflicts: []
  };
  
  console.log(`\n📋 Validating puzzle with ${puzzle.groups.length} groups:`);
  puzzle.groups.forEach((group, index) => {
    console.log(`   ${index + 1}. ${group.name} (${group.id}) - ${group.members.length} Pokemon`);
  });

  // Check each group
  for (let groupIndex = 0; groupIndex < puzzle.groups.length; groupIndex++) {
    const group = puzzle.groups[groupIndex];
    const groupType = extractTypeFromCategoryName(group.name);
    
    console.log(`\n🎯 Validating Group ${groupIndex + 1}: ${group.name}`);
    console.log(`   Category Type: ${groupType}`);
    console.log(`   Pokemon IDs: ${group.members.join(', ')}`);
    
    // Check each Pokemon in this group
    for (const pokemonId of group.members) {
      const pokemon = getPokemonById(pokemonData, pokemonId);
      
      if (!pokemon) {
        const error = `Pokemon with ID ${pokemonId} not found in Pokemon data`;
        console.log(`   ❌ ${error}`);
        result.errors.push(error);
        result.isValid = false;
        continue;
      }
      
      console.log(`   🐾 Checking Pokemon ${pokemonId}: ${pokemon.name}`);
      console.log(`      Types: ${pokemon.types.join(', ')}`);
      
      // Check if this Pokemon's types match the group's type
      const hasMatchingType = pokemon.types.some(type => 
        type.toLowerCase() === groupType.toLowerCase()
      );
      
      if (!hasMatchingType) {
        const error = `Pokemon ${pokemon.name} (ID: ${pokemonId}) in ${group.name} group doesn't have ${groupType} type. Has: ${pokemon.types.join(', ')}`;
        console.log(`   ❌ ${error}`);
        result.errors.push(error);
        result.isValid = false;
      } else {
        console.log(`   ✅ Pokemon ${pokemon.name} correctly placed in ${group.name} group`);
      }
      
      // Check if this Pokemon should be in other groups based on its types
      const conflictingGroups: string[] = [];
      for (let otherGroupIndex = 0; otherGroupIndex < puzzle.groups.length; otherGroupIndex++) {
        if (otherGroupIndex === groupIndex) continue;
        
        const otherGroup = puzzle.groups[otherGroupIndex];
        const otherGroupType = extractTypeFromCategoryName(otherGroup.name);
        
        // Check if this Pokemon has a type that matches the other group
        const shouldBeInOtherGroup = pokemon.types.some(type => 
          type.toLowerCase() === otherGroupType.toLowerCase()
        );
        
        if (shouldBeInOtherGroup) {
          conflictingGroups.push(otherGroup.name);
          console.log(`   ⚠️  Pokemon ${pokemon.name} also has ${otherGroupType} type and could be in ${otherGroup.name} group`);
        }
      }
      
      if (conflictingGroups.length > 0) {
        result.pokemonTypeConflicts.push({
          pokemonId: pokemon.id,
          pokemonName: pokemon.name,
          pokemonTypes: pokemon.types,
          currentCategory: group.name,
          conflictingCategories: conflictingGroups
        });
        
        const warning = `Pokemon ${pokemon.name} (${pokemon.types.join(', ')}) in ${group.name} could also belong to: ${conflictingGroups.join(', ')}`;
        console.log(`   ⚠️  ${warning}`);
        result.warnings.push(warning);
      }
    }
  }
  
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 VALIDATION SUMMARY:');
  console.log(`   ✅ Errors: ${result.errors.length}`);
  console.log(`   ⚠️  Warnings: ${result.warnings.length}`);
  console.log(`   🔍 Type Conflicts: ${result.pokemonTypeConflicts.length}`);
  console.log(`   🎯 Overall Valid: ${result.isValid ? 'YES' : 'NO'}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    result.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    result.warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
  }
  
  if (result.pokemonTypeConflicts.length > 0) {
    console.log('\n🔍 TYPE CONFLICTS:');
    result.pokemonTypeConflicts.forEach((conflict, index) => {
      console.log(`   ${index + 1}. ${conflict.pokemonName} (${conflict.pokemonTypes.join(', ')}) in ${conflict.currentCategory} could also be in: ${conflict.conflictingCategories.join(', ')}`);
    });
  }
  
  console.log('=' .repeat(60));
  
  return result;
}

/**
 * Simple boolean validation function for quick checks
 */
export function isPuzzleValid(puzzle: Puzzle, pokemonData: PokemonData): boolean {
  const result = validatePuzzle(puzzle, pokemonData);
  return result.isValid;
}
