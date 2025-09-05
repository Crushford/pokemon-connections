import { readFile } from 'node:fs/promises';
import { combinations } from '../../utils/arrays.js';
import { GroupSchema, type Group, type Pokemon } from '../../data/types.js';

export async function groupsByType(): Promise<Group[]> {
  const raw = await readFile('data/pokemon.json', 'utf8');
  const mons = JSON.parse(raw) as Pokemon[];

  const byType = new Map<string, number[]>();
  for (const m of mons) {
    for (const t of m.types) {
      if (!byType.has(t)) byType.set(t, []);
      byType.get(t)!.push(m.id);
    }
  }

  const groups: Group[] = [];
  for (const [type, ids] of byType.entries()) {
    if (ids.length < 4) continue;
    for (const combo of combinations(ids, 4)) {
      groups.push(
        GroupSchema.parse({
          id: `type:${type}:${combo.slice().sort((a,b)=>a-b).join('-')}`,
          name: `Type: ${type}`,
          members: combo,
          tags: ['type'],
          dimension: 'type',
          rule: {
            kind: 'typeEquals',
            value: type
          }
        })
      );
    }
  }
  return groups;
}
