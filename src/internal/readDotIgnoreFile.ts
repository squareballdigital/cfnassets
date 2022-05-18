import { readFile } from 'fs/promises';

export async function readDotIgnoreFile(
  filename: string,
  ignoreMissing = false,
): Promise<string[]> {
  try {
    return (await readFile(filename, 'utf8')).split('\n');
  } catch (err: any) {
    if (!ignoreMissing || err.code !== 'ENOENT') {
      throw err;
    }
    return [];
  }
}
