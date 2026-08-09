import { join } from 'node:path';
import { z } from 'zod';
import type { ICapabilityStore } from '../capability-registry/capability-store.port.js';
import { CAPABILITY_NATURES, type Capability } from '../capability-registry/capability.js';
import { CapabilityStoreError } from '../errors/capability-store.error.js';
import { readJsonFileOrAbsent, writeJsonFile, type JsonFileFailure } from './json-file.js';

/**
 * The registrations the registry holds, as their file holds them: every
 * attribute the capability element declares, spelled as the specification
 * spells it, the timeout an integer count of milliseconds
 * (domain/integration/capability), plus the concept the capability answers.
 */
const capabilityRecordsSchema = z.array(
  z.object({
    name: z.string().min(1),
    version: z.string().min(1),
    nature: z.enum(CAPABILITY_NATURES),
    input_schema: z.string().min(1),
    output_schema: z.string().min(1),
    timeout: z.int(),
    connector: z.string().min(1),
    concept: z.string().min(1),
  }),
);

/** The one plain JSON file the registry's registrations persist in. */
const CAPABILITY_FILE = 'capability.json';

/** What each way of failing to read the capability file says, in this store's words. */
const READ_FAILURE_MESSAGES: Readonly<Record<JsonFileFailure, string>> = {
  unreadable: 'the capability file could not be read',
  'not-json': 'the capability file is not valid JSON',
};

/**
 * The file-backed adapter of the registry's store port: every registration
 * in one plain JSON file under one directory, an absent file reading as the
 * empty registry (constraints/the-mvp-persists-to-no-database — no database,
 * no driver; the registrations land as a file). The one registry module that
 * touches the filesystem.
 */
export class FileCapabilityStore implements ICapabilityStore {
  public constructor(private readonly directory: string) {}

  public async readCapabilities(): Promise<readonly Capability[]> {
    const file = join(this.directory, CAPABILITY_FILE);
    const data = await readJsonFileOrAbsent(
      file,
      (failure, cause) => new CapabilityStoreError(READ_FAILURE_MESSAGES[failure], { file }, { cause }),
    );
    if (data === undefined) {
      return [];
    }
    const records = capabilityRecordsSchema.safeParse(data);
    if (!records.success) {
      throw new CapabilityStoreError('the capability file does not hold the records the store port promises', {
        file,
        issues: records.error.issues,
      });
    }
    return records.data;
  }

  public async writeCapabilities(capabilities: readonly Capability[]): Promise<void> {
    await writeJsonFile(join(this.directory, CAPABILITY_FILE), capabilities);
  }
}
