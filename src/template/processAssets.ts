import {
  BuilderContext,
  Template,
  TemplateFragment,
} from '@squareball/cfntemplate';
import { AssetContext } from './AssetContext.js';
import { AssetManifest, AssetManifestMetadataKey } from './AssetManifest.js';
import { DeploymentBundle } from './DeploymentBundle.js';

export async function processAssets(
  template: Template,
  ctx: BuilderContext,
  bundle: DeploymentBundle,
): Promise<Template> {
  const assets = ctx.get(AssetContext).assets;
  if (!assets?.length) {
    return template;
  }

  const manifest: AssetManifest = {
    assets: [],
  };

  for (const asset of assets) {
    const output = await asset.generate();
    const key = await bundle.addAsset(output.fileName, output.content);

    manifest.assets.push({
      bucketParam: asset.parameters.S3Bucket,
      key,
      keyParam: asset.parameters.S3Key,
      name: asset.name,
    });
  }

  return TemplateFragment.metadata(AssetManifestMetadataKey, manifest).build(
    template,
    ctx,
  );
}
