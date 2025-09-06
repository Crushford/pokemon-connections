const BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8787' // change when backend serves HTTP

export async function fetchTodayPuzzle() {
  const res = await fetch(`${BASE}/api/puzzle/today`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<{
    pool: number[]
    groups: { id: string; name: string; members: number[] }[]
  }>
}

export async function fetchPuzzles() {
  const res = await fetch('/puzzle.json')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<{
    puzzles: {
      groups: {
        id: string
        name: string
        members: number[]
        tags: string[]
      }[]
      pool: number[]
    }[]
  }>
}
