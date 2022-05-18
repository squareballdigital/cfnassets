import { TemplateBuilder } from '@squareball/cfntemplate';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { basename, dirname, join } from 'path';
import { findUpTree } from '../internal/findUpTree.js';
import { AssetAttributes } from './AssetAttributes.js';
import { AssetBase } from './AssetBase.js';
import { AssetOutput } from './AssetOutput.js';

export class PackageAsset extends AssetBase {
  constructor(
    name: string,
    private readonly packageName: string,
    private readonly assetName: string,
    private readonly resolveRoot?: string,
  ) {
    super(name);
  }

  public override async generate(): Promise<AssetOutput> {
    const packagePath = await findUpTree(
      join('node_modules', this.packageName, 'package.json'),
      this.resolveRoot,
    );
    if (!packagePath) {
      throw new Error(
        `can't find package file for ${this.packageName} from ${this.resolveRoot}`,
      );
    }

    const pkg = JSON.parse(await readFile(packagePath, 'utf8'));

    if (!pkg.bundles || !pkg.bundles[this.assetName]?.path) {
      throw new Error(
        `expected package.json to have a bundles entry for '${this.assetName}'`,
      );
    }
    const pkgPath = pkg.bundles[this.assetName].path;

    return {
      content: createReadStream(join(dirname(packagePath), pkgPath)),
      fileName: basename(pkgPath),
    };
  }
}

export function makeAssetFromPackage(
  name: string,
  packageName: string,
  assetName: string,
  resolveRoot?: string,
): [TemplateBuilder, AssetAttributes] {
  const asset = new PackageAsset(name, packageName, assetName, resolveRoot);
  return [asset, asset];
}
