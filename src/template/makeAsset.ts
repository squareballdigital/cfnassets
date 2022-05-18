import { TemplateBuilder } from '@squareball/cfntemplate';
import { AssetAttributes } from './AssetAttributes.js';
import { AssetGenerator } from './AssetGenerator.js';
import { CustomAsset } from './CustomAsset.js';

export function makeAsset(
  name: string,
  generate: AssetGenerator,
): [TemplateBuilder, AssetAttributes] {
  const asset = new CustomAsset(name, generate);
  return [asset, asset];
}
