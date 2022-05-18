import {
  BuilderContext,
  makeParameter,
  Template,
  TemplateBuilder,
  TemplateFragment,
} from '@squareball/cfntemplate';
import { AssetBuilder } from './AssetBuilder.js';
import { AssetContext } from './AssetContext.js';
import { AssetOutput } from './AssetOutput.js';
import { AssetRef } from './AssetRef.js';

export abstract class AssetBase implements AssetBuilder {
  public readonly name: string;
  public readonly parameters: AssetRef;
  public readonly ref: AssetRef;

  private readonly paramBuilder: TemplateBuilder;

  constructor(name: string) {
    this.name = name;

    const [bucketParamBuilder, bucketParam] = makeParameter(
      `${name}BucketName`,
      {
        Type: 'String',
      },
    );
    const [objectParamBuilder, objectParam] = makeParameter(
      `${name}ObjectKey`,
      {
        Type: 'String',
      },
    );

    this.paramBuilder = TemplateFragment.compose(
      bucketParamBuilder,
      objectParamBuilder,
    );

    this.parameters = {
      S3Bucket: bucketParam.name,
      S3Key: objectParam.name,
    };
    this.ref = {
      S3Bucket: bucketParam.ref,
      S3Key: objectParam.ref,
    };
  }

  public build(template: Template, ctx: BuilderContext): Template {
    const assets = ctx.get(AssetContext);
    if (!assets.addAsset(this.name, this)) {
      return template;
    }
    return this.paramBuilder.build(template, ctx);
  }

  public abstract generate(): PromiseLike<AssetOutput> | AssetOutput;
}
