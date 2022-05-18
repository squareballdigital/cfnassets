import { Readable } from 'stream';

export interface AddAssetOpts {
  keepName?: boolean;
}

export interface DeploymentBundle {
  addAsset(
    fileName: string,
    stream: Readable,
    opts?: AddAssetOpts,
  ): PromiseLike<string>;
}
