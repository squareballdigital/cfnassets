import archiver from 'archiver';
import stream from 'stream';
import { ZipAssetEntry } from './ZipAssetEntry.js';

export async function makeZipPackageStream(
  entries: AsyncIterable<ZipAssetEntry> | Iterable<ZipAssetEntry>,
): Promise<stream.Readable> {
  const zip = archiver('zip', { zlib: { level: 9 } });
  let error: unknown;

  zip.on('warning', (err: unknown) => {
    console.error(`rollupPackage: WARN: `, err);
  });

  zip.on('error', (err: unknown) => {
    error = err || new Error(`unknown error occurred`);
  });

  const sortedEntries: ZipAssetEntry[] = [];
  for await (const entry of entries) {
    sortedEntries.push(entry);
  }
  sortedEntries.sort((a, b) => a.archivePath.localeCompare(b.archivePath));

  for await (const entry of sortedEntries) {
    if (error) {
      throw error;
    }

    const content =
      typeof entry.content === 'function'
        ? await entry.content()
        : entry.content;

    zip.append(content, { name: entry.archivePath, date: new Date(0) });
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  zip.finalize();
  return zip;
}
