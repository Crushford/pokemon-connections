import { readFile } from 'node:fs/promises';
import { type Group } from '../data/types.js';

export async function overlapScore(pool: number[]): Promise<number> {
  const raw = await readFile('data/groupBank.json', 'utf8');
  const bank = JSON.parse(raw) as Group[];
  const inPool = new Set(pool);
  const candidates = bank.filter(g => g.members.every(id => inPool.has(id)));

  const countByMon: Record<number, number> = {};
  for (const g of candidates) {
    for (const id of g.members) countByMon[id] = (countByMon[id] ?? 0) + 1;
  }
  const shared = Object.values(countByMon).filter(c => c >= 2).length;
  return shared;
}
