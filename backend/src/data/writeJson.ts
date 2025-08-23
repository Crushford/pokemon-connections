import { writeFile } from 'node:fs/promises';

export async function writeJson(path: string, data: unknown) {
  await writeFile(path, JSON.stringify(data, null, 2), 'utf8');
  console.log('Wrote', path);
}
