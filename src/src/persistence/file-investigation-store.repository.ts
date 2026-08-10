import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { InvestigationAlreadyStoredError } from '../errors/investigation-already-stored.error.js';
import { InvestigationStoreError } from '../errors/investigation-store.error.js';
import type { IInvestigationStore, StoredInvestigation } from '../investigation/investigation-store.port.js';
import type { Investigation } from '../investigation/investigation.js';
import { readJsonFileOrAbsent, readJsonFileWithTextOrAbsent, writeJsonFile, type JsonFileFailure } from './json-file.js';

/** What each way of failing to read an investigation file says, in this store's own words. */
const READ_FAILURE_MESSAGES: Readonly<Record<JsonFileFailure, string>> = {
  unreadable: 'the investigation file could not be read',
  'not-json': 'the investigation file is not valid JSON',
};

/**
 * The ending an investigation's one JSON file carries. This store's own
 * file-layout choice — no specification node names an investigation's file
 * name, unlike the case module's rules/knowledge/the-slug-matches-the-file-name
 * — so it stays local to this repository rather than shared the way
 * CASE_DOCUMENT_ENDING is.
 */
const INVESTIGATION_DOCUMENT_ENDING = '.json';

/**
 * The file-backed store for a built investigation: one plain JSON document
 * per investigation id, at <directory>/<id>.json, so a written investigation
 * has nowhere to be overwritten
 * (rules/investigation/an-investigation-is-written-once). write checks for
 * an existing file by the given investigation's own id before touching the
 * filesystem, refusing rather than writing where one is already there —
 * check then refuse, since the shared writer offers no atomic
 * exclusive-create primitive. Content is pinned by hashing the exact bytes
 * a read finds on disk, the same convention FileCaseStore already
 * establishes. The one investigation-lifecycle component that touches the
 * filesystem (constraints/the-mvp-persists-to-no-database).
 */
export class FileInvestigationStore implements IInvestigationStore {
  public constructor(private readonly directory: string) {}

  public async write(investigation: Investigation): Promise<void> {
    const file = this.investigationFile(investigation.id);
    const existing = await readJsonFileOrAbsent(file, raiseReadFailure(file));
    if (existing !== undefined) {
      throw new InvestigationAlreadyStoredError(investigation.id);
    }
    await writeJsonFile(file, investigation);
  }

  public async read(id: string): Promise<StoredInvestigation | undefined> {
    const file = this.investigationFile(id);
    const read = await readJsonFileWithTextOrAbsent(file, raiseReadFailure(file));
    return read === undefined ? undefined : { document: read.data, hash: contentHash(read.text) };
  }

  private investigationFile(id: string): string {
    return join(this.directory, `${id}${INVESTIGATION_DOCUMENT_ENDING}`);
  }
}

/** Raises this store's own typed data error for a failure to read the given file, naming the file in its context. */
function raiseReadFailure(file: string): (failure: JsonFileFailure, cause: unknown) => Error {
  return (failure, cause) => new InvestigationStoreError(READ_FAILURE_MESSAGES[failure], { file }, { cause });
}

/** The content identity of one investigation's document: sha256 of the exact bytes a read found on disk. */
function contentHash(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}
