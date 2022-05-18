import { Readable } from 'stream';

export interface AddAssetOpts {
  keepName?: boolean;
}

export interface DeploymentBundleAsset {
  name: string;
  size: number;
  createReadStream(encoding?: BufferEncoding): Readable;
}

export interface DeploymentBundle {
  addAsset(
    fileName: string,
    stream: Readable,
    opts?: AddAssetOpts,
  ): PromiseLike<string>;
  assets: DeploymentBundleAsset[];
}
