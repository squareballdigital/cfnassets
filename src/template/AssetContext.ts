import { AssetDefinition } from './AssetDefinition.js';

export class AssetContext {
  public static readonly ContextKey = 'AssetContext';

  public readonly assets: AssetDefinition[] = [];

  public addAsset(name: string, value: AssetDefinition): boolean {
    const add = !this.assets.find((x) => x.name === name);
    if (add) {
      this.assets.push(value);
    }
    return add;
  }
}
