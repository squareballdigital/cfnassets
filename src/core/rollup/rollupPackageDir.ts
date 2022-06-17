import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname, resolve } from 'path';
import { MergedRollupOptions } from 'rollup';
import loadConfigFile from 'rollup/loadConfigFile';
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
  packageArch?: string;
  packageFilePath?: string;
  packagePlatform?: string;
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

  const { options, warnings } = await loadConfigFile(
    resolve(dirPath, rollupConfigPath),
  );

  const output = await makeRollupPackageStream({
    ignore: ignorePaths,
    installPackages,
    options: opts?.entrypoint
      ? options.map(
          (x): MergedRollupOptions => ({ ...x, input: opts.entrypoint }),
        )
      : options,
    packageArch: opts?.packageArch,
    packageFilePath: opts?.packageFilePath,
    packagePlatform: opts?.packagePlatform,
    packageLockPath: opts?.packageLockPath,
    warnings,
  });

  await mkdir(dirname(fullOutputPath), { recursive: true });
  await pipeline(output, createWriteStream(fullOutputPath));

  await addBundleInfoToPackageJson(dirPath, {
    name: opts?.bundleName,
    path: outputPath,
  });
}
