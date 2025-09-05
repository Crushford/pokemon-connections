import { writeJson } from './writeJson.js';
import { get } from '../utils/http.js';
import { PokemonSchema, type Pokemon } from './types.js';

type Stat = { base_stat: number; stat: { name: string } };
type Poke = {
  id: number; name: string;
  types: { slot: number; type: { name: string } }[];
  stats: Stat[];
  height: number; weight: number;
  forms: { name: string; url: string }[]; // we will call this
};
type Species = {
  color?: { name: string };
  habitat?: { name: string };
  egg_groups: { name: string }[];
  generation: { name: string };
  evolution_chain: { url: string };
};
type PokemonForm = {
  is_default: boolean;
  name: string;
  sprites: {
    front_default: string | null;
    // other sprite fields exist but we only need this one
  };
};

type EvolutionChain = {
  id: number;
  chain: {
    species: { name: string };
    evolves_to: Array<{
      species: { name: string };
      evolves_to: Array<{
        species: { name: string };
        evolves_to: any[];
      }>;
    }>;
  };
};

function stat(stats: Stat[], key: string) {
  return stats.find(s => s.stat.name === key)?.base_stat ?? 0;
}
function genNumber(genName: string): number {
  const roman = (genName.match(/generation-(\w+)/)?.[1] ?? 'i').toLowerCase();
  const list = ['i','ii','iii','iv','v','vi','vii','viii','ix'];
  return list.indexOf(roman) + 1;
}

function extractEvolutionChainId(url: string): string {
  const match = url.match(/evolution-chain\/(\d+)\//);
  return match ? match[1] : 'unknown';
}

function findEvolutionStage(chain: EvolutionChain, pokemonName: string): number {
  const base = chain.chain.species.name;
  const firstEvo = chain.chain.evolves_to[0]?.species.name;
  const secondEvo = chain.chain.evolves_to[0]?.evolves_to[0]?.species.name;
  
  if (pokemonName === base) return 1;
  if (pokemonName === firstEvo) return 2;
  if (pokemonName === secondEvo) return 3;
  
  // Fallback: if not found in chain, assume base stage
  return 1;
}

async function fetchSpriteFromDefaultForm(formUrls: string[]): Promise<string | undefined> {
  // Strategy: hit forms in order; pick the first with is_default === true; fallback to first.
  for (let i = 0; i < formUrls.length; i++) {
    const url = formUrls[i];
    try {
      const f = await get<PokemonForm>(url); // absolute URL works with axios
      if (f.is_default && f.sprites?.front_default) return f.sprites.front_default;
      // keep a fallback if this is the first form and has a sprite
      if (i === 0 && f.sprites?.front_default) var fallback = f.sprites.front_default; // eslint-disable-line
    } catch {
      // ignore and try next
    }
  }
  // @ts-expect-error fallback var defined conditionally above
  return fallback;
}

async function fetchOne(id: number): Promise<Pokemon> {
  const p = await get<Poke>(`/pokemon/${id}`);
  const s = await get<Species>(`/pokemon-species/${id}`);

  // Fetch evolution chain data
  const evolutionChain = await get<EvolutionChain>(s.evolution_chain.url);
  const evoLineId = extractEvolutionChainId(s.evolution_chain.url);
  const evoStage = findEvolutionStage(evolutionChain, p.name);

  let spriteUrl: string | undefined;
  if (Array.isArray(p.forms) && p.forms.length > 0) {
    const formUrls = p.forms.map(f => f.url);
    spriteUrl = await fetchSpriteFromDefaultForm(formUrls);
  }

  const normalized = PokemonSchema.parse({
    id: p.id,
    name: p.name,
    types: p.types.sort((a,b)=>a.slot-b.slot).map(t => t.type.name),
    baseStats: {
      hp: stat(p.stats, 'hp'),
      attack: stat(p.stats, 'attack'),
      defense: stat(p.stats, 'defense'),
      spAttack: stat(p.stats, 'special-attack'),
      spDefense: stat(p.stats, 'special-defense'),
      speed: stat(p.stats, 'speed')
    },
    height: p.height / 10,
    weight: p.weight / 10,
    eggGroups: s.egg_groups?.map(e => e.name),
    evoStage,
    evoLineId,
    color: s.color?.name,
    habitat: s.habitat?.name,
    generation: genNumber(s.generation.name),
    spriteUrl
  });

  return normalized;
}

async function main() {
  const out: Pokemon[] = [];
  for (let id = 1; id <= 151; id++) {
    const mon = await fetchOne(id);
    out.push(mon);
    if (id % 25 === 0) console.log('Fetched', id);
  }
  await writeJson('data/pokemon.json', out);
  
  // Copy to frontend for serving
  const { execSync } = await import('child_process');
  try {
    execSync('./scripts/copy-data.sh', { stdio: 'inherit' });
  } catch (error) {
    console.warn('Failed to copy data to frontend:', error);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
