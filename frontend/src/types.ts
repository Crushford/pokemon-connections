export type BaseStats = {
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
}

export type PokemonLite = {
  id: number
  name: string
  types: string[]
  baseStats: BaseStats
  height: number // meters
  weight: number // kg
  spriteUrl?: string
}
