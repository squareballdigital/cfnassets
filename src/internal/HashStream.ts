import { BinaryToTextEncoding, createHash, Hash } from 'crypto';
import { Transform, TransformCallback, TransformOptions } from 'stream';

export class HashStream extends Transform {
  private readonly hash: Hash;

  constructor(algorithm?: string | Hash, options?: TransformOptions) {
    super(options);

    if (!algorithm) {
      algorithm = 'sha1';
    }
    this.hash =
      typeof algorithm === 'string' ? createHash(algorithm) : algorithm;
  }

  public digest(): Buffer;
  public digest(encoding: BinaryToTextEncoding): string;
  public digest(encoding?: BinaryToTextEncoding): Buffer | string {
    return encoding ? this.hash.digest(encoding) : this.hash.digest();
  }

  public override _transform(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    try {
      this.hash.update(chunk);
      callback(null, chunk);
    } catch (err: any) {
      callback(err);
    }
  }
}
