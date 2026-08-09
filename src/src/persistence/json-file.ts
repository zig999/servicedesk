import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

/** How reading one plain JSON file can fail, for a store to name in its own words. */
export type JsonFileFailure = 'unreadable' | 'not-json';

/**
 * One plain JSON file's content, both parsed and as the exact text it holds
 * — the text is what a store pins by hashing, so it hashes precisely the
 * bytes a read found on disk, never a re-serialization of the parsed value.
 */
export type JsonFileContent = { readonly text: string; readonly data: unknown };

const JSON_INDENT = 2;

/**
 * Reads one plain JSON file, answering undefined where the file does not
 * exist — an absent file is data, never a failure, and JSON.parse can never
 * answer undefined itself. Every other failure is raised through the
 * caller's own typed error, so each file store keeps raising the data
 * errors its module declares. Shared by every file store
 * (constraints/the-mvp-persists-to-no-database — the records land as plain
 * files), so the handling exists once and is called, never copied.
 */
export async function readJsonFileOrAbsent(
  file: string,
  raise: (failure: JsonFileFailure, cause: unknown) => Error,
): Promise<unknown> {
  const read = await readJsonFileWithTextOrAbsent(file, raise);
  return read?.data;
}

/**
 * Reads one plain JSON file as both its parsed content and its exact text,
 * answering undefined where the file does not exist — the same absence rule
 * as readJsonFileOrAbsent, extended with the raw text a store needs to pin
 * what it read by hashing exactly the bytes on disk
 * (constraints/a-case-is-stored-as-one-json-document — pinning it is
 * hashing one file).
 */
export async function readJsonFileWithTextOrAbsent(
  file: string,
  raise: (failure: JsonFileFailure, cause: unknown) => Error,
): Promise<JsonFileContent | undefined> {
  const text = await readTextOrAbsent(file, raise);
  if (text === undefined) {
    return undefined;
  }
  try {
    return { text, data: JSON.parse(text) as unknown };
  } catch (error) {
    throw raise('not-json', error);
  }
}

/** Writes records as one plain JSON file, creating the directory it sits in. */
export async function writeJsonFile(file: string, records: unknown): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(records, null, JSON_INDENT)}\n`, 'utf8');
}

/** Reads a file's text, answering undefined where the file does not exist. */
async function readTextOrAbsent(
  file: string,
  raise: (failure: JsonFileFailure, cause: unknown) => Error,
): Promise<string | undefined> {
  try {
    return await readFile(file, 'utf8');
  } catch (error) {
    if (isAbsence(error)) {
      return undefined;
    }
    throw raise('unreadable', error);
  }
}

/**
 * Whether a filesystem error says the path does not exist — a file or a
 * directory alike, shared by any store that must read an absent path as
 * data rather than failure (a listing of a case that was never written,
 * the same way an absent file is answered above).
 */
export function isAbsence(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}
