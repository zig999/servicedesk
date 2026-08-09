import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { GlossaryStoreError } from '../errors/glossary-store.error.js';
import type { IGlossaryStore } from '../glossary/glossary-store.port.js';
import type { ConceptRegistration, GlossaryTerm, TermVocabulary } from '../glossary/terms.js';

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

const JSON_INDENT = 2;

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
    await mkdir(this.directory, { recursive: true });
    await writeFile(this.fileOf(`${vocabulary}.json`), `${JSON.stringify(terms, null, JSON_INDENT)}\n`, 'utf8');
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
    const text = await readFileOrAbsent(file);
    if (text === undefined) {
      return [];
    }
    const records = parse(jsonOf(file, text));
    if (!records.success) {
      throw new GlossaryStoreError('the vocabulary file does not hold the records the store port promises', {
        file,
        issues: records.error.issues,
      });
    }
    return records.data;
  }
}

/** Reads a file's text, answering undefined where the file does not exist. */
async function readFileOrAbsent(file: string): Promise<string | undefined> {
  try {
    return await readFile(file, 'utf8');
  } catch (error) {
    if (isAbsence(error)) {
      return undefined;
    }
    throw new GlossaryStoreError('the vocabulary file could not be read', { file }, { cause: error });
  }
}

/** Parses a vocabulary file's text as JSON, refusing anything that is not. */
function jsonOf(file: string, text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw new GlossaryStoreError('the vocabulary file is not valid JSON', { file }, { cause: error });
  }
}

/** Whether a filesystem error says the file does not exist. */
function isAbsence(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}
