import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { type Pokemon, type PokemonData, type Group, type Puzzle } from '../data/types.js';
import { validatePuzzle as validatePuzzleDetailed } from './validatePuzzle.js';

type Category = {
  id: string;
  name: string;
  description: string;
  pokemon: number[];
  categoryType: 'type' | 'stat' | 'evolution' | 'habitat' | 'color' | 'egg-group' | 'generation';
  type: string;
  metadata?: Record<string, any>;
};

type CategoriesData = {
  generation: {
    id: number;
    name: string;
    availableTypes: string[];
    pokemonCount: number;
  };
  categories: Category[];
};

async function loadPokemon(): Promise<PokemonData> {
  try {
    const pokemonPath = join(process.cwd(), 'data', 'pokemon.json');
    const raw = await readFile(pokemonPath, 'utf8');
    const pokemonData = JSON.parse(raw) as PokemonData;
    console.log(`Loaded ${pokemonData.pokemon.length} Pokemon from Generation ${pokemonData.generation.id} (${pokemonData.generation.name})`);
    console.log(`Available types: ${pokemonData.generation.availableTypes.join(', ')}`);
    return pokemonData;
  } catch (error) {
    console.error('Error loading Pokemon data:', error);
    throw error;
  }
}

async function loadCategories(): Promise<CategoriesData> {
  try {
    const categoriesPath = join(process.cwd(), 'data', 'categories.json');
    const raw = await readFile(categoriesPath, 'utf8');
    const categoriesData = JSON.parse(raw) as CategoriesData;
    console.log(`Loaded ${categoriesData.categories.length} categories`);
    return categoriesData;
  } catch (error) {
    console.error('Error loading categories data:', error);
    throw error;
  }
}

/**
 * Filters Pokemon to only include evolution stage 1 Pokemon
 */
function filterEvolutionStage1Pokemon(pokemon: Pokemon[]): Pokemon[] {
  return pokemon.filter(p => p.evoStage === 1);
}

/**
 * Filters categories to only include those with at least 4 Pokemon
 */
function filterCategoriesWithMinPokemon(categories: Category[], minPokemon: number = 4): Category[] {
  return categories.filter(category => category.pokemon.length >= minPokemon);
}

/**
 * Removes Pokemon from all categories except the specified category
 */
function removePokemonFromOtherCategories(
  pokemonId: number, 
  categories: Category[], 
  excludeCategoryId: string
): Category[] {
  return categories.map(category => {
    if (category.id === excludeCategoryId) {
      return category;
    }
    return {
      ...category,
      pokemon: category.pokemon.filter(p => p !== pokemonId)
    };
  });
}

/**
 * Removes categories that contain any of the specified Pokemon
 */
function removeCategoriesContainingPokemon(categories: Category[], pokemonIds: number[]): Category[] {
  return categories.filter(category => 
    !category.pokemon.some(p => pokemonIds.includes(p))
  );
}

/**
 * Checks if a category would conflict with already selected Pokemon
 */
function categoryHasConflictsWithSelectedPokemon(
  category: Category,
  selectedPokemonIds: number[],
  pokemonData: PokemonData
): boolean {
  // Get the Pokemon objects for the selected Pokemon
  const selectedPokemon = selectedPokemonIds.map(id => 
    pokemonData.pokemon.find(p => p.id === id)
  ).filter(Boolean);
  
  // Check if any selected Pokemon would also belong to this category
  for (const pokemon of selectedPokemon) {
    if (pokemon && category.pokemon.includes(pokemon.id)) {
      console.log(`  ⚠️  Conflict: Pokemon ${pokemon.id} (${pokemon.name}) is already selected and also belongs to category ${category.name}`);
      return true;
    }
  }
  
  return false;
}

/**
 * Removes other Pokemon from the same category from all other categories
 */
function removeOtherPokemonInThisCategoryFromAllCategories(
  pokemonIds: number[], 
  categories: Category[], 
  excludeCategoryId: string
): Category[] {
  console.log(`🔍 Removing Pokemon ${pokemonIds.join(', ')} from all categories except ${excludeCategoryId}`);
  
  return categories.map(category => {
    if (category.id === excludeCategoryId) {
      console.log(`  ✅ Keeping category ${category.id} unchanged`);
      return category;
    }
    
    const originalCount = category.pokemon.length;
    const filteredPokemon = category.pokemon.filter(p => !pokemonIds.includes(p));
    const removedCount = originalCount - filteredPokemon.length;
    
    if (removedCount > 0) {
      console.log(`  🗑️  Removed ${removedCount} Pokemon from category ${category.id} (${category.name})`);
      console.log(`     Original: ${originalCount}, Remaining: ${filteredPokemon.length}`);
    }
    
    return {
      ...category,
      pokemon: filteredPokemon
    };
  });
}

/**
 * Validates a puzzle to ensure it meets the requirements
 */
function validatePuzzle(puzzle: Puzzle, pokemonData: PokemonData): void {
  // Basic structure validation
  if (puzzle.groups.length !== 4) {
    throw new Error('Puzzle must have exactly 4 groups');
  }
  
  for (const group of puzzle.groups) {
    if (group.members.length !== 4) {
      throw new Error(`Group ${group.id} must have exactly 4 members`);
    }
  }
  
  // Check for duplicate Pokemon across groups
  const allMembers = puzzle.groups.flatMap((g: Group) => g.members);
  const uniqueMembers = new Set(allMembers);
  if (allMembers.length !== uniqueMembers.size) {
    throw new Error('Puzzle contains duplicate Pokemon across groups');
  }
  
  // Run comprehensive validation with detailed logging
  console.log('\n🔍 Running comprehensive puzzle validation...');
  const validationResult = validatePuzzleDetailed(puzzle, pokemonData);
  
  if (!validationResult.isValid) {
    console.log('\n❌ Puzzle validation failed!');
    throw new Error('Generated puzzle failed validation');
  }
  
  console.log('Puzzle validation passed');
}

/**
 * Saves a puzzle to the puzzles.json file
 */
async function savePuzzle(puzzle: Puzzle): Promise<void> {
  try {
    const puzzlesPath = join(process.cwd(), 'data', 'puzzles.json');
    
    // Load existing puzzles
    let existingPuzzles: { puzzles: Puzzle[] } = { puzzles: [] };
    try {
      const raw = await readFile(puzzlesPath, 'utf8');
      existingPuzzles = JSON.parse(raw);
    } catch (error) {
      // File doesn't exist or is empty, start fresh
      console.log('Creating new puzzles file');
    }
    
    // Add new puzzle
    existingPuzzles.puzzles.push(puzzle);
    
    // Save back to file
    await writeFile(puzzlesPath, JSON.stringify(existingPuzzles, null, 2));
    console.log(`Puzzle saved successfully. Total puzzles: ${existingPuzzles.puzzles.length}`);
  } catch (error) {
    console.error('Error saving puzzle:', error);
    throw error;
  }
}

/**
 * Generates a single group from a category
 */
function generateGroupFromCategory(category: Category, pokemonData: PokemonData): Group {
  const availablePokemon = category.pokemon.filter(pokemonId => 
    pokemonData.pokemon.some((p: Pokemon) => p.id === pokemonId)
  );
  
  if (availablePokemon.length < 4) {
    throw new Error(`Category ${category.name} doesn't have enough Pokemon (${availablePokemon.length}/4)`);
  }
  
  // Randomly select 4 Pokemon from the category
  const selectedPokemon: number[] = [];
  const shuffled = [...availablePokemon].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < 4; i++) {
    const pokemonId = shuffled[i];
    if (pokemonId !== undefined) {
      selectedPokemon.push(pokemonId);
    }
  }
  
  return {
    id: category.id,
    name: category.name,
    members: selectedPokemon,
    tags: [category.categoryType]
  };
}

async function main() {
  console.log('Loading Pokemon and categories data...');
  
  const pokemonData = await loadPokemon();
  const categoriesData = await loadCategories();
  
  // Get evolution stage 1 Pokemon IDs to keep in categories
  const evoStage1Pokemon = filterEvolutionStage1Pokemon(pokemonData.pokemon);
  const evoStage1PokemonIds = evoStage1Pokemon.map(p => p.id);
  console.log(`Found ${evoStage1Pokemon.length} evolution stage 1 Pokemon to keep in categories`);

  // Remove everything that is NOT evolution stage 1 from all categories
  const categoriesWithOnlyEvoStage1 = categoriesData.categories.map(category => ({
    ...category,
    pokemon: category.pokemon.filter(pokemonId => evoStage1PokemonIds.includes(pokemonId))
  }));
  
  // Filter categories to only include those with Pokemon remaining after removal
  const categoriesWithFilteredPokemon = categoriesWithOnlyEvoStage1.filter(category => 
    category.pokemon.length > 0
  );
  
  // Filter categories to only include those with at least 4 Pokemon
  const validCategories = filterCategoriesWithMinPokemon(categoriesWithFilteredPokemon);
  console.log(`Found ${validCategories.length} valid categories with at least 4 Pokemon`);

  if (validCategories.length < 4) {
    throw new Error(`Not enough valid categories (${validCategories.length}/4) to generate a puzzle`);
  }

  // Generate 4 groups from different categories
  const groups: Group[] = [];
  let remainingCategories = [...validCategories];
  const allSelectedPokemonIds: number[] = [];
  
  for (let i = 0; i < 4; i++) {
    // Filter out categories that would conflict with already selected Pokemon
    const nonConflictingCategories = remainingCategories.filter(category => {
      const hasConflict = categoryHasConflictsWithSelectedPokemon(category, allSelectedPokemonIds, pokemonData);
      if (hasConflict) {
        console.log(`  🚫 Skipping category ${category.name} due to conflicts with selected Pokemon`);
      }
      return !hasConflict;
    });
    
    if (nonConflictingCategories.length === 0) {
      throw new Error(`No non-conflicting categories available for group ${i + 1}`);
    }
    
    // Randomly select a category from non-conflicting ones
    const randomIndex = Math.floor(Math.random() * nonConflictingCategories.length);
    const selectedCategory = nonConflictingCategories[randomIndex];
    
    console.log(`\n🎯 Generating group ${i + 1} from category: ${selectedCategory.name} (${selectedCategory.id})`);
    console.log(`   Available Pokemon in this category: ${selectedCategory.pokemon.join(', ')}`);
    
    // Generate group from category
    const group = generateGroupFromCategory(selectedCategory, pokemonData);
    console.log(`   Selected Pokemon for group: ${group.members.join(', ')}`);
    groups.push(group);
    
    // Add selected Pokemon to the list of all selected Pokemon
    allSelectedPokemonIds.push(...group.members);
    
    // Remove this category from remaining options
    remainingCategories = remainingCategories.filter(cat => cat.id !== selectedCategory.id);
    console.log(`   Remaining categories after removal: ${remainingCategories.length}`);
    
    // Remove Pokemon from this group from all remaining categories
    console.log(`   Removing Pokemon ${group.members.join(', ')} from all remaining categories...`);
    remainingCategories = removeOtherPokemonInThisCategoryFromAllCategories(
      group.members, 
      remainingCategories, 
      selectedCategory.id
    );
    
    // Filter out categories that no longer have enough Pokemon
    remainingCategories = filterCategoriesWithMinPokemon(remainingCategories);
  }

  // Create the puzzle
  const allPokemonIds = groups.flatMap(g => g.members);
  const puzzle: Puzzle = {
    groups,
    pool: allPokemonIds
  };

  // Validate puzzle structure and type correctness
  validatePuzzle(puzzle, pokemonData);
  
  await savePuzzle(puzzle);

  console.log('Puzzle generated successfully!');
  console.log('Groups:');
  groups.forEach((group, index) => {
    console.log(`  ${index + 1}. ${group.name} (${group.members.join(', ')})`);
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
