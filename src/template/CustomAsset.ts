import { AssetBase } from './AssetBase.js';
import { AssetGenerator } from './AssetGenerator.js';

export class CustomAsset extends AssetBase {
  constructor(name: string, public readonly generate: AssetGenerator) {
    super(name);
  }
}
