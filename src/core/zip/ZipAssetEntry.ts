import { Readable } from 'stream';

export type EntryContent = Readable | string | Buffer;

export interface ZipAssetEntry {
  archivePath: string;
  content:
    | EntryContent
    | (() => EntryContent)
    | (() => PromiseLike<EntryContent>);
}
