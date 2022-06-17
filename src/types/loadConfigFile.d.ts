import { MergedRollupOptions, RollupWarning } from 'rollup';

declare module 'rollup/loadConfigFile' {
  export interface BatchWarnings {
    add: (warning: RollupWarning) => void;
    readonly count: number;
    flush: () => void;
    readonly warningOccurred: boolean;
  }

  export interface LoadConfigFileResult {
    options: MergedRollupOptions[];
    warnings: BatchWarnings;
  }

  export default function loadAndParseConfigFile(
    fileName: string,
    commandOptions?: any,
  ): Promise<LoadConfigFileResult>;
}
