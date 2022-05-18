import { Readable } from 'stream';

export interface AssetOutput {
  content: Readable;
  fileName: string;
}
