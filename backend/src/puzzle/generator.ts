import { readFile } from 'fs/promises';
import { join } from 'path';
import { type Pokemon, type PokemonData } from '../data/types.js';

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

async function main() {
  const pokemonData = await loadPokemon();
  console.log('Generation info:', pokemonData.generation);
  console.log('First Pokemon:', pokemonData.pokemon[0]);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
