import { createReadStream, createWriteStream } from 'fs';
import { mkdir, rename, stat } from 'fs/promises';
import { basename, dirname, extname, join } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { temporaryDirectory } from 'tempy';
import { TypedEmitter } from 'tiny-typed-emitter';
import { hash } from '../internal/hash.js';
import { HashStream } from '../internal/HashStream.js';
import { ProgressStream } from '../internal/ProgressStream.js';
import {
  AddAssetOpts,
  DeploymentBundle,
  DeploymentBundleAsset,
} from './DeploymentBundle.js';
import { ProgressStats } from './ProgressStats.js';

export interface FileSystemBundleOptions {
  stagingDirectory?: string;
}

export interface FileSystemDeploymentBundleEvents {
  assetProgress(name: string, stats: ProgressStats): void;
  assetRename(oldName: string, rename: string): void;
}

export class FileSystemDeploymentBundle
  extends TypedEmitter<FileSystemDeploymentBundleEvents>
  implements DeploymentBundle
{
  private readonly outputDir: string;
  public readonly assets: DeploymentBundleAsset[] = [];

  constructor(options: FileSystemBundleOptions) {
    super();
    this.outputDir = options.stagingDirectory ?? temporaryDirectory();
  }

  public async addAsset(
    fileName: string,
    content: Readable,
    opts: AddAssetOpts = {},
  ): Promise<string> {
    if (dirname(fileName) !== '.') {
      throw new Error(`the fileName must not be within a directory`);
    }

    this.emit('assetProgress', fileName, {});

    const outDir = await this.getOutputDir();
    const originalExt = extname(fileName);
    const originalBasename = basename(fileName, originalExt);
    const stagingExt = `.stagingprogress_${hash([
      `${Date.now()}`,
      fileName,
      `${Math.random()}`,
    ])}`;

    const outPath = join(outDir, fileName + stagingExt);
    const outStream = createWriteStream(outPath);

    const progress = new ProgressStream((total) =>
      this.emit('assetProgress', fileName, { total }),
    );
    progress.on('finish', () =>
      this.emit('assetProgress', fileName, { complete: true }),
    );

    if (opts.keepName) {
      await pipeline(content, progress, outStream);

      const finalPath = join(outDir, originalBasename + originalExt);
      await rename(outPath, finalPath);

      this.assets.push({
        name: fileName,
        size: (await stat(finalPath)).size,
        createReadStream: (encoding) => createReadStream(finalPath, encoding),
      });
      return fileName;
    } else {
      const hashStream = new HashStream();

      await pipeline(content, progress, hashStream, outStream);
      const sha = hashStream.digest('hex');

      const finalBasename = originalBasename + `.${sha}` + originalExt;
      const finalPath = join(outDir, finalBasename);

      await rename(outPath, finalPath);
      this.emit('assetRename', fileName, finalBasename);

      this.assets.push({
        name: finalBasename,
        size: (await stat(finalPath)).size,
        createReadStream: (encoding) => createReadStream(finalPath, encoding),
      });
      return finalBasename;
    }
  }

  private getOutputDir = (() => {
    let created = false;
    return async () => {
      if (!created) {
        await mkdir(this.outputDir, { recursive: true });
        created = true;
      }
      return this.outputDir;
    };
  })();
}
