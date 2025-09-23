const BASE = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787"; // change when backend serves HTTP

export async function fetchTodayPuzzle() {
  const res = await fetch(`${BASE}/api/puzzle/today`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{
    pool: number[];
    groups: { id: string; name: string; members: number[] }[];
  }>;
}

export async function fetchPuzzles() {
  const res = await fetch("/puzzle.json");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{
    puzzles: {
      groups: {
        id: string;
        name: string;
        members: number[];
        tags: string[];
      }[];
      pool: number[];
    }[];
  }>;
}

// Animals API
export async function listAnimals(): Promise<{
  animals: Record<string, { wikipediaUrl: string; categories: string[] }>;
}> {
  const res = await fetch(`${BASE}/api/animals`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function addAnimal(input: {
  name: string;
  wikipediaUrl: string;
  categories: string[];
}) {
  const res = await fetch(`${BASE}/api/animals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Categories API
export async function listCategories(): Promise<{
  categories: Record<string, { description?: string }>;
}> {
  const res = await fetch(`${BASE}/api/categories`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function addCategory(input: {
  name: string;
  description?: string;
  members?: string[];
}) {
  const res = await fetch(`${BASE}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Puzzles API
export async function listAnimalPuzzles(): Promise<{
  puzzles: { id: string; categories: string[]; createdAt: string }[];
}> {
  const res = await fetch(`${BASE}/api/puzzles`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function addAnimalPuzzle(input: { categories: string[] }) {
  const res = await fetch(`${BASE}/api/puzzles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
