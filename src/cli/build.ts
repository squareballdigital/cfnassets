import {
  array,
  assert,
  choose,
  is,
  object,
  optional,
  record,
  text,
} from '@fmtk/decoders';
import { Command } from 'commander';
import fs from 'fs';
import { dirname, resolve } from 'path';
import { rollupPackageDir } from '../core/rollup/rollupPackageDir.js';
import { zipDir } from '../core/zip/zipDir.js';
import { getPackagePath } from '../internal/getPackagePath.js';

interface RollupOptions {
  type: 'rollup';
  options: {
    entrypoint: string;
    ignore?: string[];
    install?: string[];
    packageFilePath?: string;
    packageInstallImage?: string;
    packageLockPath?: string;
  };
}

interface ContentOptions {
  type: 'content';
  options: {
    source: string;
    ignore?: string[];
  };
}

const decodeOptions = choose(
  object<RollupOptions>({
    type: is('rollup'),
    options: object<RollupOptions['options']>({
      entrypoint: text,
      ignore: optional(array(text)),
      install: optional(array(text)),
      packageFilePath: optional(text),
      packageInstallImage: optional(text),
      packageLockPath: optional(text),
    }),
  }),
  object<ContentOptions>({
    type: is('content'),
    options: object<ContentOptions['options']>({
      source: text,
      ignore: optional(array(text)),
    }),
  }),
);

const decodeConfig = record(text, decodeOptions);

export function addBuildCommand(program: Command): void {
  program
    .command('build')
    .description('create one or more packages based on a config file')
    .requiredOption('-c, --config <name>', 'the config file')
    .option('--only <name...>', 'only process the named asset(s)')
    .option('-o, --output-dir <path>', 'the output directory')
    .action(
      async (options: {
        config: string;
        only?: string[];
        outputDir?: string;
      }): Promise<void> => {
        const cfg = assert(
          decodeConfig,
          JSON.parse(fs.readFileSync(options.config, 'utf8')),
        );

        const source = dirname(resolve(options.config));
        const filter = options.only && new Set(options.only);

        for (const key in cfg) {
          if (filter && !filter.has(key)) {
            continue;
          }
          const item = cfg[key];
          console.log(`Processing asset ${key}`);

          switch (item.type) {
            case 'content':
              await zipDir(item.options.source, {
                bundleName: key,
                packagePath: await getPackagePath(item.options.source),
                outputPath: options.outputDir,
                ignorePaths: item.options.ignore,
              });
              break;

            case 'rollup':
              await rollupPackageDir(source, {
                bundleName: key,
                entrypoint: item.options.entrypoint,
                ignorePaths: item.options.ignore,
                installPackages: item.options.install,
                outputPath: options.outputDir,
                packageFilePath:
                  item.options.packageFilePath &&
                  resolve(source, item.options.packageFilePath),
                packageInstallImage: item.options.packageInstallImage,
                packageLockPath:
                  item.options.packageLockPath &&
                  resolve(source, item.options.packageLockPath),
              });
              break;

            default:
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              throw new Error(`unknown asset type ${(item as any).type}`);
          }
        }
      },
    );
}
