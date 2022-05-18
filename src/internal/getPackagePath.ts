import path from 'path';
import { tryStat } from './tryStat.js';

export async function getPackagePath(
  search: string,
): Promise<string | undefined> {
  if (await tryStat(path.resolve(search, 'package.json'))) {
    return search;
  }
  if (await tryStat(path.resolve(process.cwd(), 'package.json'))) {
    return process.cwd();
  }
}
