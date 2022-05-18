import { createReadStream } from 'fs';
import { readdir } from 'fs/promises';
import ignore from 'ignore';
import { join, relative, resolve } from 'path';
import { ZipAssetEntry } from './ZipAssetEntry.js';

export interface FolderEntriesOptions {
  archivePath?: string;
  ignore?: string[];
  source: string;
}

export async function* getFolderEntries({
  archivePath: archiveBasePath = '/',
  source,
  ignore: ignorePaths,
}: FolderEntriesOptions): AsyncIterableIterator<ZipAssetEntry> {
  const work = [resolve(source)];
  const ig = ignore().add(ignorePaths || []);

  while (work.length) {
    const curr = work.pop() as string;

    const entries = await readdir(curr, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(curr, entry.name);

      let archivePath = relative(source, entryPath);
      if (entry.isDirectory()) {
        archivePath += '/';
      }
      if (ig.ignores(archivePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        work.push(entryPath);
      } else if (entry.isFile()) {
        yield {
          archivePath: join(archiveBasePath, archivePath),
          content: () => createReadStream(entryPath),
        };
      }
    }
  }
}
