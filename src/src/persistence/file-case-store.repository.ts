import { createHash } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { ICaseStore, StoredCaseVersion } from '../case/case-store.port.js';
import { CASE_DOCUMENT_ENDING } from '../case/case.js';
import { CaseStoreError } from '../errors/case-store.error.js';
import { isAbsence, readJsonFileWithTextOrAbsent, writeJsonFile, type JsonFileFailure } from './json-file.js';

/** What each way of failing to read a case version file says, in this store's words. */
const READ_FAILURE_MESSAGES: Readonly<Record<JsonFileFailure, string>> = {
  unreadable: 'the case version file could not be read',
  'not-json': 'the case version file is not valid JSON',
};

/** Digits only, the whole of a version file's name once its ending is removed. */
const VERSION_STEM = /^\d+$/;

/**
 * The file-backed store for every version of every case: one plain JSON
 * document per version, at <directory>/<slug>/<version>.json, so storing a
 * new version never touches an earlier one's file
 * (rules/knowledge/every-case-version-remains-readable) and loading a case
 * is reading exactly one file
 * (constraints/a-case-is-stored-as-one-json-document). The document is
 * stored and retrieved exactly as it arrives — structural and coherence
 * validation are no concern of this store — and content is pinned by
 * hashing the exact bytes a read finds on disk, never a hash the document
 * itself might declare. No separate index file is kept: the set of version
 * numbers is read from the directory's own entries, so no second store ever
 * holds any part of a case. The one case module that touches the
 * filesystem (constraints/the-mvp-persists-to-no-database).
 */
export class FileCaseStore implements ICaseStore {
  public constructor(private readonly directory: string) {}

  public async writeVersion(slug: string, version: number, document: unknown): Promise<void> {
    await writeJsonFile(this.versionFile(slug, version), document);
  }

  public async readVersion(slug: string, version: number): Promise<StoredCaseVersion | undefined> {
    const file = this.versionFile(slug, version);
    const read = await readJsonFileWithTextOrAbsent(
      file,
      (failure, cause) => new CaseStoreError(READ_FAILURE_MESSAGES[failure], { file }, { cause }),
    );
    return read === undefined ? undefined : { document: read.data, hash: contentHash(read.text) };
  }

  public async listVersions(slug: string): Promise<readonly number[]> {
    const names = await this.versionFileNames(slug);
    return names
      .map(versionOf)
      .filter((version): version is number => version !== undefined)
      .sort((left, right) => left - right);
  }

  private async versionFileNames(slug: string): Promise<readonly string[]> {
    try {
      return await readdir(this.slugDirectory(slug));
    } catch (error) {
      if (isAbsence(error)) {
        return [];
      }
      throw new CaseStoreError('the case directory could not be read', { slug }, { cause: error });
    }
  }

  private slugDirectory(slug: string): string {
    return join(this.directory, slug);
  }

  private versionFile(slug: string, version: number): string {
    return join(this.slugDirectory(slug), `${version}${CASE_DOCUMENT_ENDING}`);
  }
}

/** The content identity of one case version's document: sha256 of the exact bytes a read found on disk. */
function contentHash(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * The version number a directory entry names, or undefined where the entry
 * is not one of this store's own version files — the same
 * ending-then-stem reading rules/knowledge/the-slug-matches-the-file-name
 * uses for a case document's name.
 */
function versionOf(fileName: string): number | undefined {
  if (!fileName.endsWith(CASE_DOCUMENT_ENDING)) {
    return undefined;
  }
  const stem = fileName.slice(0, -CASE_DOCUMENT_ENDING.length);
  return VERSION_STEM.test(stem) ? Number(stem) : undefined;
}
