import { stat } from 'fs/promises';
import { dirname, join } from 'path';

export async function findUpTree(
  childPath: string,
  from = process.cwd(),
): Promise<string | undefined> {
  for (let dir = from; dirname(dir) !== dir; dir = dirname(dir)) {
    const search = join(dir, childPath);

    try {
      const stats = await stat(search);
      if ((childPath.endsWith('/') && stats.isDirectory()) || stats.isFile()) {
        return search;
      }
    } catch (err) {}
  }
}
