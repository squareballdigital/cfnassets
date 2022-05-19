import { TemplateBuilder } from '@squareball/cfntemplate';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { basename, dirname, join } from 'path';
import { AssetAttributes } from './AssetAttributes.js';
import { AssetBase } from './AssetBase.js';
import { AssetOutput } from './AssetOutput.js';

export class PackageAsset extends AssetBase {
  constructor(
    name: string,
    private readonly packagePath: string,
    private readonly assetName: string,
  ) {
    super(name);
  }

  public override async generate(): Promise<AssetOutput> {
    const pkg = JSON.parse(await readFile(this.packagePath, 'utf8'));

    if (!pkg.bundles || !pkg.bundles[this.assetName]?.path) {
      throw new Error(
        `expected package.json to have a bundles entry for '${this.assetName}'`,
      );
    }
    const assetPath = pkg.bundles[this.assetName].path;

    return {
      content: createReadStream(join(dirname(this.packagePath), assetPath)),
      fileName: basename(assetPath),
    };
  }
}

export function makeAssetFromPackage(
  name: string,
  packagePath: string,
  assetName: string,
): [TemplateBuilder, AssetAttributes] {
  const asset = new PackageAsset(name, packagePath, assetName);
  return [asset, asset];
}
