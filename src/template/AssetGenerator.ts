import { AssetOutput } from './AssetOutput.js';

export interface AssetGenerator {
  (): PromiseLike<AssetOutput> | AssetOutput;
}
