import fs from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { pipeline } from 'stream/promises';
import { addBundleInfoToPackageJson } from '../../internal/addBundleInfoToPackageJson.js';
import { readDotIgnoreForFolder } from '../../internal/readDotIgnoreForFolder.js';
import { getFolderEntries } from './getFolderEntries.js';
import { makeZipPackageStream } from './makeZipPackageStream.js';

export interface ZipDirOptions {
  bundleName?: string;
  ignorePaths?: string[];
  outputPath?: string;
  packagePath?: string;
}

export async function zipDir(
  dirname: string,
  opts?: ZipDirOptions,
): Promise<void> {
  const outputPath =
    opts?.outputPath || `dist/${opts?.bundleName || 'bundle'}.zip`;
  const fullOutputPath = path.resolve(outputPath);

  const ignorePaths = opts?.ignorePaths || [];
  ignorePaths.push(
    ...(await readDotIgnoreForFolder(opts?.packagePath || dirname)),
  );

  const zip = await makeZipPackageStream(
    getFolderEntries({ source: dirname, ignore: ignorePaths }),
  );

  await mkdir(path.dirname(fullOutputPath), { recursive: true });
  await pipeline(zip, fs.createWriteStream(fullOutputPath));

  if (opts?.packagePath) {
    await addBundleInfoToPackageJson(opts?.packagePath, {
      name: opts?.bundleName,
      path: outputPath,
    });
  }
}
