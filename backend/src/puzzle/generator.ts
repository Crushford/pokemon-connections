import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { type Pokemon, type PokemonData, type Group, type Puzzle } from '../data/types.js';

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
 * Removes other Pokemon from the same category from all other categories
 */
function removeOtherPokemonInThisCategoryFromAllCategories(
  pokemonIds: number[], 
  categories: Category[], 
  excludeCategoryId: string
): Category[] {
  return categories.map(category => {
    if (category.id === excludeCategoryId) {
      return category;
    }
    return {
      ...category,
      pokemon: category.pokemon.filter(p => !pokemonIds.includes(p))
    };
  });
}

/**
 * Validates a puzzle to ensure it meets the requirements
 */
function validatePuzzle(puzzle: Puzzle): void {
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
  
  for (let i = 0; i < 4; i++) {
    // Randomly select a category
    const randomIndex = Math.floor(Math.random() * remainingCategories.length);
    const selectedCategory = remainingCategories[randomIndex];
    
    if (!selectedCategory) {
      throw new Error(`No category available for group ${i + 1}`);
    }
    
    console.log(`Generating group ${i + 1} from category: ${selectedCategory.name}`);
    
    // Generate group from category
    const group = generateGroupFromCategory(selectedCategory, pokemonData);
    groups.push(group);
    
    // Remove this category from remaining options
    remainingCategories = remainingCategories.filter(cat => cat.id !== selectedCategory.id);
    
    // Remove Pokemon from this group from all remaining categories
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

  // Validate and save the puzzle
  validatePuzzle(puzzle);
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
