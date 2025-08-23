import axios from 'axios';

export const http = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 15000
});

export async function get<T>(url: string, tries = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await http.get<T>(url);
      return res.data;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}
