import { MergedRollupOptions, rollup } from 'rollup';
import { BatchWarnings } from 'rollup/loadConfigFile';
import { ZipAssetEntry } from '../zip/ZipAssetEntry.js';

const SourceMapUrl = 'sourceMappingURL';

export async function* rollupPackageEntries(
  options: MergedRollupOptions[],
  warnings: BatchWarnings,
): AsyncIterableIterator<ZipAssetEntry> {
  for (const inputOptions of options) {
    const bundle = await rollup(inputOptions);

    for (const outputOptions of inputOptions.output) {
      const output = await bundle.generate(outputOptions);

      for (const chunkOrAsset of output.output) {
        let content: Buffer;

        if (chunkOrAsset.type === 'asset') {
          content = Buffer.from(chunkOrAsset.source);
        } else if (chunkOrAsset.type === 'chunk') {
          let code = chunkOrAsset.code;

          if (chunkOrAsset.map) {
            const url = `${chunkOrAsset.fileName}.map`;

            yield {
              archivePath: url,
              content: chunkOrAsset.map.toString(),
            };
            code += `//# ${SourceMapUrl}=${url}\n`;
          }

          content = Buffer.from(code);
        } else {
          continue;
        }

        yield { archivePath: chunkOrAsset.fileName, content };
        warnings?.flush();
      }
    }
  }
  warnings?.flush();
}
