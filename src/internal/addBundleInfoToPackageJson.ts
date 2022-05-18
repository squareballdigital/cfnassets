import { readFile, writeFile } from 'fs/promises';
import { basename, resolve } from 'path';

const PackageJsonName = 'package.json';

export interface BundleInfo {
  name?: string;
  path: string;
}

export async function addBundleInfoToPackageJson(
  packagePath: string,
  info: BundleInfo,
): Promise<void> {
  const packageFilePath =
    basename(packagePath) !== PackageJsonName
      ? resolve(packagePath, PackageJsonName)
      : packagePath;

  const pkg = JSON.parse(await readFile(packageFilePath, 'utf8'));

  if (info.name) {
    if (
      pkg.bundles &&
      pkg.bundles[info.name] &&
      pkg.bundles[info.name].path === info.path
    ) {
      // don't touch the file if it isn't going to change.
      return;
    }

    if (!pkg.bundles || typeof pkg.bundles !== 'object') {
      pkg.bundles = {};
    }
    if (!pkg.bundles[info.name] || typeof pkg.bundles[info.name] !== 'object') {
      pkg.bundles[info.name] = {};
    }
    pkg.bundles[info.name].path = info.path;
  } else {
    if (pkg.bundle?.path === info.path) {
      // don't touch the file if it isn't going to change.
      return;
    }

    if (!pkg.bundle || typeof pkg.bundle !== 'object') {
      pkg.bundle = {};
    }
    pkg.bundle.path = info.path;
  }

  await writeFile(packageFilePath, JSON.stringify(pkg, null, 2) + '\n');
}
