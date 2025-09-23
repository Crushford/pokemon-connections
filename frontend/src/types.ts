export type BaseStats = {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
};

// Game mode discriminator for rendering and data handling
export type GameMode = "pokemon" | "animals";

export type Pokemon = {
  id: number;
  name: string;
  types: string[];
  baseStats: BaseStats;
  height: number; // meters
  weight: number; // kg
  eggGroups?: string[];
  evoStage: number;
  evoLineId: string;
  color?: string;
  habitat?: string;
  generation: number;
  spriteUrl?: string;
};

// Keep PokemonLite for backward compatibility if needed
export type PokemonLite = {
  id: number;
  name: string;
  types: string[];
  baseStats: BaseStats;
  height: number; // meters
  weight: number; // kg
  spriteUrl?: string;
};

// Generic item shown on the board (supports Pokémon and non-Pokémon)
export type GameItem = {
  id?: number;
  name: string;
  imageUrl?: string;
  // Optional Pokémon-specific fields
  types?: string[];
  baseStats?: BaseStats;
  height?: number;
  weight?: number;
  // Optional Animals-specific fields
  wikiUrl?: string;
};

// Generic puzzle data types to support both schemas
export type GenericPuzzleGroup = {
  id: string;
  name: string;
  members: (number | string)[];
  tags: string[];
};

export type GenericPuzzleData = {
  groups: GenericPuzzleGroup[];
  pool: (number | string)[];
};
