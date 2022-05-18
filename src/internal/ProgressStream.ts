import stream from 'stream';

export class ProgressStream extends stream.Transform {
  private _transferred = 0;

  constructor(listener?: (total: number, delta: number) => void) {
    super();
    if (listener) {
      this.on('progress', listener);
    }
  }

  public get transferred(): number {
    return this._transferred;
  }

  public override _transform(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    chunk: any,
    encoding: BufferEncoding,
    callback: stream.TransformCallback,
  ): void {
    const delta = this.writableObjectMode ? 1 : chunk.length;
    this._transferred += delta;
    this.emit('progress', this._transferred, delta);
    callback(null, chunk);
  }

  public override eventNames(): (string | symbol)[] {
    return [...super.eventNames(), 'progress'];
  }
}
