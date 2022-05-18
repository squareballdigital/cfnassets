import path from 'path';
import { InputOptions, rollup } from 'rollup';
import { ZipAssetEntry } from '../zip/ZipAssetEntry.js';

const SourceMapUrl = 'sourceMappingURL';

export async function* rollupPackageEntries(
  inputOptions: InputOptions,
): AsyncIterableIterator<ZipAssetEntry> {
  const bundle = await rollup({
    ...inputOptions,
    onwarn: (warning) => {
      if (warning.loc) {
        console.error(
          `%s (%d, %d): %s`,
          warning.loc.file &&
            path.relative(path.resolve('.'), warning.loc.file),
          warning.loc.line,
          warning.loc.column,
          warning.message,
        );
      } else {
        console.error(warning.message);
      }
    },
  });

  const output = await bundle.generate({
    file: 'index.js',
    format: 'cjs',
    sourcemap: true,
  });

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
  }
}
