import { z } from 'zod';

export const PokemonSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  types: z.array(z.string()).min(1).max(2),
  baseStats: z.object({
    hp: z.number(),
    attack: z.number(),
    defense: z.number(),
    spAttack: z.number(),
    spDefense: z.number(),
    speed: z.number()
  }),
  height: z.number(), // meters
  weight: z.number(), // kg
  eggGroups: z.array(z.string()).optional(),
  evoStage: z.number().int().min(1).max(3).optional(),
  evoLineId: z.string().optional(),
  color: z.string().optional(),
  habitat: z.string().optional(),
  generation: z.number().int(),
  /** NEW: default form sprite */
  spriteUrl: z.string().url().optional()
});

export type Pokemon = z.infer<typeof PokemonSchema>;

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(z.number()).length(4), // store Pokémon by numeric id (1..151)
  tags: z.array(z.string()).default([])
});
export type Group = z.infer<typeof GroupSchema>;

export const PuzzleSchema = z.object({
  groups: z.array(GroupSchema).length(4),
  pool: z.array(z.number()).length(16) // union of all member ids
});
export type Puzzle = z.infer<typeof PuzzleSchema>;
