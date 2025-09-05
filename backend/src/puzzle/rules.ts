import { type Group, type Pokemon } from '../data/types.js';

/**
 * Returns a predicate function that tests if a Pokémon matches the group's rule.
 * This is used for pruning - when a group is selected, all remaining Pokémon
 * that match its rule (except the 4 locked members) are removed from the pool.
 */
export function predicateFor(group: Group): (mon: Pokemon) => boolean {
  switch (group.rule.kind) {
    case 'typeEquals':
      return (mon: Pokemon) => mon.types.includes(group.rule.value);
    
    // Future rule types can be added here:
    // case 'statGreaterThan':
    //   return (mon: Pokemon) => mon.baseStats[group.rule.stat] > group.rule.value;
    // case 'evolutionStage':
    //   return (mon: Pokemon) => mon.evoStage === group.rule.value;
    // case 'habitat':
    //   return (mon: Pokemon) => mon.habitat === group.rule.value;
    
    default:
      // Fallback: return false for unknown rule types
      return () => false;
  }
}
