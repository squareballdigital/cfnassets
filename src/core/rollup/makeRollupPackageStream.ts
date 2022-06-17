import { MergedRollupOptions } from 'rollup';
import { BatchWarnings } from 'rollup/loadConfigFile';
import { Readable } from 'stream';
import { getPackageEntries } from '../zip/getPackageEntries.js';
import { makeZipPackageStream } from '../zip/makeZipPackageStream.js';
import { ZipAssetEntry } from '../zip/ZipAssetEntry.js';
import { rollupPackageEntries } from './rollupPackageEntries.js';

export interface RollupPackageOptions {
  ignore?: string[];
  installPackages?: string[];
  options: MergedRollupOptions[];
  packageArch?: string;
  packageFilePath?: string;
  packagePlatform?: string;
  packageLockPath?: string;
  warnings: BatchWarnings;
}

export async function makeRollupPackageStream({
  ignore,
  installPackages,
  options,
  packageArch,
  packageFilePath,
  packagePlatform,
  packageLockPath,
  warnings,
}: RollupPackageOptions): Promise<Readable> {
  const entries: ZipAssetEntry[] = [];

  for await (const entry of rollupPackageEntries(options, warnings)) {
    entries.push(entry);
  }
  if (installPackages?.length) {
    if (!packageFilePath || !packageLockPath) {
      throw new Error(
        `must specify package lock path and package.json path when installing packages`,
      );
    }
    const packageFiles = getPackageEntries({
      ignorePaths: ignore,
      packageArch,
      packageFilePath,
      packagePlatform,
      packageLockPath,
      packageNames: installPackages,
    });

    for await (const entry of packageFiles) {
      entries.push(entry);
    }
  }
  return makeZipPackageStream(entries);
}
