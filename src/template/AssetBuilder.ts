import { TemplateBuilder } from '@squareball/cfntemplate';
import { AssetAttributes } from './AssetAttributes.js';
import { AssetDefinition } from './AssetDefinition.js';

export interface AssetBuilder
  extends AssetDefinition,
    TemplateBuilder,
    AssetAttributes {}
