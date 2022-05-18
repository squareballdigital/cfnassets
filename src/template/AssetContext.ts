import { AssetDefinition } from './AssetDefinition.js';

export class AssetContext {
  public readonly assets: AssetDefinition[] = [];

  public addAsset(name: string, value: AssetDefinition): boolean {
    const exists = !!this.assets.find((x) => x.name === name);
    if (!exists) {
      this.assets.push(value);
    }
    return exists;
  }
}
