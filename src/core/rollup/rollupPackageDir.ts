import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname, resolve } from 'path';
import { pipeline } from 'stream/promises';
import { addBundleInfoToPackageJson } from '../../internal/addBundleInfoToPackageJson.js';
import { readDotIgnoreForFolder } from '../../internal/readDotIgnoreForFolder.js';
import { makeRollupPackageStream } from './makeRollupPackageStream.js';

export interface RollupPackageDirOptions {
  bundleName?: string;
  entrypoint?: string;
  ignorePaths?: string[];
  installPackages?: string[];
  outputPath?: string;
  packageFilePath?: string;
  packageInstallImage?: string;
  packageLockPath?: string;
  rollupConfigPath?: string;
}

export async function rollupPackageDir(
  dirPath: string,
  opts?: RollupPackageDirOptions,
): Promise<void> {
  const outputPath =
    opts?.outputPath || `dist/${opts?.bundleName || 'bundle'}.zip`;
  const fullOutputPath = resolve(outputPath);
  const installPackages = opts?.installPackages || [];

  const ignorePaths = opts?.ignorePaths || [];
  ignorePaths.push(...(await readDotIgnoreForFolder(dirPath)));

  const rollupConfigPath = opts?.rollupConfigPath || 'rollup.config.js';

  let rollupConfig = await import(resolve(dirPath, rollupConfigPath));
  const externals = rollupConfig?.external;

  if (rollupConfig?.default) {
    rollupConfig = rollupConfig.default;
  }

  if (opts?.entrypoint) {
    rollupConfig = {
      ...rollupConfig,
      input: opts.entrypoint,
    };
  }

  if (
    Array.isArray(externals) &&
    externals.every((x: unknown) => typeof x === 'string')
  ) {
    installPackages.push(...externals);
  }

  const output = await makeRollupPackageStream({
    ignore: ignorePaths,
    inputOptions: rollupConfig,
    installPackages,
    packageFilePath: opts?.packageFilePath,
    packageInstallImage: opts?.packageInstallImage,
    packageLockPath: opts?.packageLockPath,
  });

  await mkdir(dirname(fullOutputPath), { recursive: true });
  await pipeline(output, createWriteStream(fullOutputPath));

  await addBundleInfoToPackageJson(dirPath, {
    name: opts?.bundleName,
    path: outputPath,
  });
}
