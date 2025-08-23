import { writeJson } from '../data/writeJson.js';
import { groupsByType } from './generators/byType.js';
import { readFile } from 'node:fs/promises';
import { type Group, type Pokemon } from '../data/types.js';

async function main() {
  const raw = await readFile('data/pokemon.json', 'utf8');
  const mons = JSON.parse(raw) as Pokemon[];
  const validIds = new Set(mons.map(m => m.id));

  const groups: Group[] = [
    ...(await groupsByType())
    // Add more generators here later
  ].filter(g => g.members.every(id => validIds.has(id)));

  await writeJson('data/groupBank.json', groups);

  const p2g: Record<number, string[]> = {};
  for (const g of groups) {
    for (const id of g.members) {
      (p2g[id] ??= []).push(g.id);
    }
  }
  await writeJson('data/pokemonToGroups.json', p2g);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
