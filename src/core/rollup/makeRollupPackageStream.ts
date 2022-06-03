import { InputOptions } from 'rollup';
import { Readable } from 'stream';
import { getPackageEntries } from '../zip/getPackageEntries.js';
import { makeZipPackageStream } from '../zip/makeZipPackageStream.js';
import { ZipAssetEntry } from '../zip/ZipAssetEntry.js';
import { rollupPackageEntries } from './rollupPackageEntries.js';

export interface RollupPackageOptions {
  ignore?: string[];
  inputOptions: InputOptions;
  installPackages?: string[];
  packageFilePath?: string;
  packageInstallImage?: string;
  packageInstallPlatform?: string;
  packageLockPath?: string;
}

export async function makeRollupPackageStream({
  ignore,
  inputOptions,
  installPackages,
  packageFilePath,
  packageInstallImage,
  packageInstallPlatform,
  packageLockPath,
}: RollupPackageOptions): Promise<Readable> {
  const entries: ZipAssetEntry[] = [];

  for await (const entry of rollupPackageEntries(inputOptions)) {
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
      packageFilePath,
      packageInstallImage,
      packageInstallPlatform,
      packageLockPath,
      packageNames: installPackages,
    });

    for await (const entry of packageFiles) {
      entries.push(entry);
    }
  }
  return makeZipPackageStream(entries);
}
