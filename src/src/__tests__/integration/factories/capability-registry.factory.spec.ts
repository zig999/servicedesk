// Proof through the module's real wiring: a capability registered over a
// fresh data directory lands as a plain JSON file holding the record the
// registry accepted, and a re-registration under the same name and version
// replaces it in that file (constraints/the-mvp-persists-to-no-database).
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import type { CapabilityRegistration } from '../../../capability-registry/capability.js';
import { createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';

/** The one plain JSON file the registrations land in, spelled here so a renamed file fails the proof. */
const CAPABILITY_FILE = 'capability.json';

/** A registration declaring the whole contract, as a caller would submit it. */
function completeRegistration(overrides: CapabilityRegistration = {}): CapabilityRegistration {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5000,
    connector: 'a-connector',
    concept: 'a-concept',
    ...overrides,
  };
}

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'capability-registry-factory-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

it('persists a registered capability as a plain JSON file under the data directory', async () => {
  const dataDirectory = join(directory, 'data');
  const registry = createCapabilityRegistry(dataDirectory);

  await registry.registerCapability(completeRegistration());

  const text = await readFile(join(dataDirectory, CAPABILITY_FILE), 'utf8');
  expect(JSON.parse(text)).toEqual([completeRegistration()]);
});

it('replaces the persisted record when the same name and version register again through the real wiring', async () => {
  const dataDirectory = join(directory, 'data');
  const registry = createCapabilityRegistry(dataDirectory);
  await registry.registerCapability(completeRegistration({ connector: 'an-old-connector' }));

  await registry.registerCapability(completeRegistration({ connector: 'a-new-connector' }));

  const text = await readFile(join(dataDirectory, CAPABILITY_FILE), 'utf8');
  expect(JSON.parse(text)).toEqual([completeRegistration({ connector: 'a-new-connector' })]);
});
