export type BaseStats = {
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
}

export type Pokemon = {
  id: number
  name: string
  types: string[]
  baseStats: BaseStats
  height: number // meters
  weight: number // kg
  eggGroups?: string[]
  evoStage: number
  evoLineId: string
  color?: string
  habitat?: string
  generation: number
  spriteUrl?: string
}

// Keep PokemonLite for backward compatibility if needed
export type PokemonLite = {
  id: number
  name: string
  types: string[]
  baseStats: BaseStats
  height: number // meters
  weight: number // kg
  spriteUrl?: string
}
