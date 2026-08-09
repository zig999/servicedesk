import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

/** How reading one plain JSON file can fail, for a store to name in its own words. */
export type JsonFileFailure = 'unreadable' | 'not-json';

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
  const text = await readTextOrAbsent(file, raise);
  if (text === undefined) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
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

/** Whether a filesystem error says the file does not exist. */
function isAbsence(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}
