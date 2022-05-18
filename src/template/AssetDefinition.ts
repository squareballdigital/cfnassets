import { AssetGenerator } from './AssetGenerator.js';
import { AssetRef } from './AssetRef.js';

export interface AssetDefinition {
  generate: AssetGenerator;
  name: string;
  parameters: AssetRef;
}
