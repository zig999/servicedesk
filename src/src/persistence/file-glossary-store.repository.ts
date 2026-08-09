import { join } from 'node:path';
import { z } from 'zod';
import { GlossaryStoreError } from '../errors/glossary-store.error.js';
import type { IGlossaryStore } from '../glossary/glossary-store.port.js';
import type { ConceptRegistration, GlossaryTerm, TermVocabulary } from '../glossary/terms.js';
import { readJsonFileOrAbsent, writeJsonFile, type JsonFileFailure } from './json-file.js';

/** The records of one term vocabulary, as its file holds them. */
const termRecordsSchema = z.array(z.object({ name: z.string().min(1) }));

/**
 * The concept registrations, as their file holds them: ttl optional here,
 * defaulted by the domain and never by the store.
 */
const conceptRecordsSchema = z.array(
  z.object({
    name: z.string().min(1),
    accepts: z.array(z.string().min(1)),
    ttl: z.int().optional(),
  }),
);

/** The file the concept registrations persist in, beside the four term vocabulary files. */
const CONCEPT_FILE = 'concept.json';

/** What each way of failing to read a vocabulary file says, in this store's words. */
const READ_FAILURE_MESSAGES: Readonly<Record<JsonFileFailure, string>> = {
  unreadable: 'the vocabulary file could not be read',
  'not-json': 'the vocabulary file is not valid JSON',
};

/**
 * The file-backed adapter of the glossary's store port: one plain JSON file
 * per vocabulary under one directory, an absent file reading as the empty
 * vocabulary (constraints/the-mvp-persists-to-no-database — no database, no
 * driver; the records land as files). The one glossary module that touches
 * the filesystem.
 */
export class FileGlossaryStore implements IGlossaryStore {
  public constructor(private readonly directory: string) {}

  public async readTerms(vocabulary: TermVocabulary): Promise<readonly GlossaryTerm[]> {
    return this.readRecords(this.fileOf(`${vocabulary}.json`), (data) => termRecordsSchema.safeParse(data));
  }

  public async writeTerms(vocabulary: TermVocabulary, terms: readonly GlossaryTerm[]): Promise<void> {
    await writeJsonFile(this.fileOf(`${vocabulary}.json`), terms);
  }

  public async readConcepts(): Promise<readonly ConceptRegistration[]> {
    return this.readRecords(this.fileOf(CONCEPT_FILE), (data) => conceptRecordsSchema.safeParse(data));
  }

  private fileOf(name: string): string {
    return join(this.directory, name);
  }

  private async readRecords<T>(
    file: string,
    parse: (data: unknown) => z.ZodSafeParseResult<T[]>,
  ): Promise<readonly T[]> {
    const data = await readJsonFileOrAbsent(
      file,
      (failure, cause) => new GlossaryStoreError(READ_FAILURE_MESSAGES[failure], { file }, { cause }),
    );
    if (data === undefined) {
      return [];
    }
    const records = parse(data);
    if (!records.success) {
      throw new GlossaryStoreError('the vocabulary file does not hold the records the store port promises', {
        file,
        issues: records.error.issues,
      });
    }
    return records.data;
  }
}
