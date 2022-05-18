import path from 'path';
import { readDotIgnoreFile } from './readDotIgnoreFile.js';

export async function readDotIgnoreForFolder(
  dirname: string,
): Promise<string[]> {
  return await readDotIgnoreFile(path.resolve(dirname, '.assetignore'), true);
}
