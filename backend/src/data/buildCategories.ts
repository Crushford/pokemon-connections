import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { get } from '../utils/http.js';
import { type Pokemon, type PokemonData } from './types.js';

type TypeInfo = {
  id: number;
  name: string;
  pokemon: Array<{
    pokemon: { name: string; url: string };
    slot: number;
  }>;
};

type Category = {
  id: string;
  name: string;
  description: string;
  pokemon: number[]; // Pokemon IDs
  categoryType: 'type' | 'stat' | 'evolution' | 'habitat' | 'color' | 'egg-group' | 'generation';
  type: string;
  metadata?: Record<string, any>;
};



/**
 * Load existing Pokemon data from pokemon.json
 */
async function loadPokemonData(): Promise<PokemonData> {
  try {
    const pokemonPath = join(process.cwd(), 'data', 'pokemon.json');
    const raw = await readFile(pokemonPath, 'utf8');
    const pokemonData = JSON.parse(raw) as PokemonData;
    
    // Check if the data structure is correct
    if (!pokemonData.pokemon || !Array.isArray(pokemonData.pokemon)) {
      throw new Error('Invalid pokemon.json structure - missing or invalid pokemon array');
    }
    
    if (!pokemonData.generation || !pokemonData.generation.availableTypes) {
      throw new Error('Invalid pokemon.json structure - missing generation metadata');
    }
    
    console.log(`Loaded ${pokemonData.pokemon.length} Pokemon from Generation ${pokemonData.generation.id}`);
    return pokemonData;
  } catch (error) {
    console.error('Error loading Pokemon data:', error);
    console.log('Make sure to run the fetch script first to generate pokemon.json');
    throw error;
  }
}

/**
 * Fetch detailed type information from PokeAPI
 */
async function fetchTypeInfo(typeName: string): Promise<TypeInfo> {
  console.log(`Fetching type info for: ${typeName}`);
  const typeData = await get<TypeInfo>(`/type/${typeName}`);
  return typeData;
}

/**
 * Fetch all Generation I types with detailed information
 */
async function fetchAllTypes(typeNames: string[]): Promise<TypeInfo[]> {
  console.log(`Fetching detailed info for ${typeNames.length} types...`);
  const types: TypeInfo[] = [];
  
  for (const typeName of typeNames) {
    try {
      const typeInfo = await fetchTypeInfo(typeName);
      types.push(typeInfo);
      console.log(`  ✓ ${typeName} (${typeInfo.pokemon.length} Pokemon)`);
    } catch (error) {
      console.error(`  ✗ Failed to fetch ${typeName}:`, error);
    }
  }
  
  return types;
}


/**
 * Create type categories from type info
 */
function createTypeCategories(typeInfo: TypeInfo[]): Category[] {
  const categories: Category[] = [];
  
  for (const type of typeInfo) {
    // Extract Pokemon IDs from the type's pokemon list
    const pokemonIds = type.pokemon
      .map(p => {
        // Extract ID from URL like "https://pokeapi.co/api/v2/pokemon/1/"
        const match = p.pokemon.url.match(/\/pokemon\/(\d+)\//);
        return match ? parseInt(match[1]) : null;
      })
      .filter((id): id is number => id !== null && id <= 151); // Only Gen 1 Pokemon
    
    if (pokemonIds.length > 0) {
      categories.push({
        id: `type-${type.name}`,
        name: `${type.name.charAt(0).toUpperCase() + type.name.slice(1)} Type`,
        description: `Pokemon with ${type.name} type`,
        pokemon: pokemonIds,
        categoryType: 'type',
        type: type.name,
        metadata: {
          typeName: type.name,
          pokemonCount: pokemonIds.length
        }
      });
    }
  }
  
  return categories;
}

/**
 * Save categories data to file
 */
async function saveCategories(categoriesData: any): Promise<void> {
  const outputPath = join(process.cwd(), 'data', 'categories.json');
  await writeFile(outputPath, JSON.stringify(categoriesData, null, 2), 'utf8');
  console.log(`Saved ${categoriesData.categories.length} categories to ${outputPath}`);
}


async function main() {
  try {
    console.log('Starting categories builder...');
    
    const pokemonData = await loadPokemonData();
    console.log(`Found ${pokemonData.generation.availableTypes.length} types:`, pokemonData.generation.availableTypes);
    
    const typeInfo = await fetchAllTypes(pokemonData.generation.availableTypes);
    console.log(`Successfully fetched ${typeInfo.length} type details`);
    
    // Create type categories
    const typeCategories = createTypeCategories(typeInfo);
    console.log(`Created ${typeCategories.length} type categories`);
    
    // Create the final data structure
    const categoriesData = {
      generation: pokemonData.generation,
      categories: typeCategories
    };
    
    // Save to file
    await saveCategories(categoriesData);
    
    console.log('Categories builder completed successfully!');
  } catch (error) {
    console.error('Categories builder failed:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(e => {
  console.error(e);
  process.exit(1);
});
