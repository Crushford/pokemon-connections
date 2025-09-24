import { createServer } from 'http';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

type Animal = {
  wikipediaUrl: string;
  categories: string[];
};

type AnimalsData = {
  animals: Record<string, Animal>;
  categories: Record<string, { description?: string; difficulty?: number }>;
  puzzles: Array<{ id: string; categories: string[]; createdAt: string }>;
};

const DATA_DIR = join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'animals.json');

async function ensureDataFile(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    const initial: AnimalsData = { animals: {}, categories: {}, puzzles: [] };
    await writeFile(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

async function loadData(): Promise<AnimalsData> {
  await ensureDataFile();
  const raw = await readFile(DATA_FILE, 'utf8');
  const parsed = JSON.parse(raw) as AnimalsData;
  // sanity fallbacks
  parsed.animals ||= {};
  parsed.categories ||= {};
  parsed.puzzles ||= [];
  return parsed;
}

async function saveData(data: AnimalsData): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function send(res: any, status: number, body: unknown) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(json);
}

function parseJson(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => (data += chunk.toString('utf8')));
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function notFound(res: any) {
  send(res, 404, { error: 'Not found' });
}

function ok(res: any, body: unknown) {
  send(res, 200, body);
}

function created(res: any, body: unknown) {
  send(res, 201, body);
}

const server = createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  const url = new URL(req.url ?? '/', 'http://localhost');

  try {
    if (req.method === 'GET' && url.pathname === '/api/animals') {
      const data = await loadData();
      return ok(res, { animals: data.animals });
    }

    if (req.method === 'POST' && url.pathname === '/api/animals') {
      const body = await parseJson(req);
      const name = String(body?.name ?? '').trim();
      const wikipediaUrl = String(body?.wikipediaUrl ?? '').trim();
      const categories = Array.isArray(body?.categories)
        ? body.categories.map((c: any) => String(c))
        : [];
      if (!name) return send(res, 400, { error: 'name required' });
      const data = await loadData();
      data.animals[name] = { wikipediaUrl, categories };
      await saveData(data);
      return created(res, { ok: true, name });
    }

    if (req.method === 'GET' && url.pathname === '/api/categories') {
      const data = await loadData();
      return ok(res, { categories: data.categories });
    }

    if (req.method === 'POST' && url.pathname === '/api/categories') {
      const body = await parseJson(req);
      const name = String(body?.name ?? '').trim();
      const description = body?.description ? String(body.description) : undefined;
      const difficultyRaw = body?.difficulty;
      const difficulty =
        typeof difficultyRaw === 'number'
          ? difficultyRaw
          : typeof difficultyRaw === 'string' && difficultyRaw.trim() !== ''
            ? Number(difficultyRaw)
            : undefined;
      const members: string[] = Array.isArray(body?.members)
        ? body.members.map((m: any) => String(m).trim()).filter(Boolean)
        : [];
      if (!name) return send(res, 400, { error: 'name required' });
      const data = await loadData();
      if (!data.categories[name]) data.categories[name] = {};
      if (description) data.categories[name].description = description;
      if (
        typeof difficulty === 'number' &&
        Number.isFinite(difficulty) &&
        difficulty >= 1 &&
        difficulty <= 4
      ) {
        data.categories[name].difficulty = difficulty;
      }

      // Auto-apply category to member animals if provided
      let updatedAnimals: string[] = [];
      let createdAnimals: string[] = [];
      let alreadyHadCategory: string[] = [];
      if (members.length > 0) {
        for (const animalName of members) {
          const existing = data.animals[animalName];
          if (existing) {
            const set = new Set<string>(existing.categories ?? []);
            const beforeSize = set.size;
            set.add(name);
            if (set.size > beforeSize) {
              updatedAnimals.push(animalName);
            } else {
              alreadyHadCategory.push(animalName);
            }
            existing.categories = Array.from(set);
            data.animals[animalName] = existing;
          } else {
            data.animals[animalName] = { wikipediaUrl: '', categories: [name] };
            createdAnimals.push(animalName);
          }
        }
      }

      await saveData(data);
      return created(res, {
        ok: true,
        name,
        membersUpdated: updatedAnimals.length + createdAnimals.length,
        updatedAnimals,
        createdAnimals,
        alreadyHadCategory,
      });
    }

    if (req.method === 'GET' && url.pathname === '/api/puzzles') {
      const data = await loadData();
      return ok(res, { puzzles: data.puzzles });
    }

    if (req.method === 'POST' && url.pathname === '/api/puzzles') {
      const body = await parseJson(req);
      const categories = Array.isArray(body?.categories)
        ? body.categories.map((c: any) => String(c))
        : [];
      if (categories.length !== 4)
        return send(res, 400, { error: 'categories must be an array of 4 names' });
      const data = await loadData();
      const id = `pz-${Date.now()}`;
      data.puzzles.push({ id, categories, createdAt: new Date().toISOString() });
      await saveData(data);
      return created(res, { ok: true, id });
    }

    if (req.method === 'GET' && url.pathname === '/api/dev/summary') {
      const data = await loadData();
      const counts = {
        animalCount: Object.keys(data.animals).length,
        categoryCount: Object.keys(data.categories).length,
        puzzleCount: data.puzzles.length,
      };
      return ok(res, counts);
    }

    return notFound(res);
  } catch (e: any) {
    return send(res, 500, { error: String(e?.message ?? e) });
  }
});

const PORT = Number(process.env.PORT ?? 8787);
server.listen(PORT, () => {
  console.log(`Animals API listening on http://localhost:${PORT}`);
});
