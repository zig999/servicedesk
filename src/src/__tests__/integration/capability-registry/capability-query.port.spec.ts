// Proof for the published query over the real file store: a read answers the
// registration as capability.json states it at that moment — a registration
// made or changed since the previous read answers as it now stands, never as
// remembered — and a holding hand-edited into two answers for one concept is
// refused rather than resolved by any ordering, the file being the one plain
// JSON holding a person can edit (constraints/the-mvp-persists-to-no-database).
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import type { CapabilityRegistration } from '../../../capability-registry/capability.js';
import { DuplicateConceptAnswerError } from '../../../errors/duplicate-concept-answer.error.js';
import {
  createCapabilityQuery,
  createCapabilityRegistry,
} from '../../../factories/capability-registry.factory.js';

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
  directory = await mkdtemp(join(tmpdir(), 'capability-query-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

it('answers a capability registered since the previous read, never a remembered absence', async () => {
  const query = createCapabilityQuery(directory);
  await query.readCapability('a-concept'); // answers the absence, baiting a memory
  await createCapabilityRegistry(directory).registerCapability(completeRegistration());

  const resolution = await query.readCapability('a-concept');

  expect(resolution).toEqual({ held: true, capability: completeRegistration() });
});

it('answers a changed registration as it now stands, never the record it replaced', async () => {
  const registry = createCapabilityRegistry(directory);
  const query = createCapabilityQuery(directory);
  await registry.registerCapability(completeRegistration({ connector: 'an-old-connector' }));
  await query.readCapability('a-concept'); // answers the old connector, baiting a memory
  await registry.registerCapability(completeRegistration({ connector: 'a-new-connector' }));

  const resolution = await query.readCapability('a-concept');

  expect(resolution).toEqual({
    held: true,
    capability: completeRegistration({ connector: 'a-new-connector' }),
  });
});

it('refuses to resolve over a capability file hand-edited into two answers for one concept', async () => {
  const records = [completeRegistration(), completeRegistration({ name: 'another-capability' })];
  await writeFile(join(directory, CAPABILITY_FILE), JSON.stringify(records), 'utf8');
  const query = createCapabilityQuery(directory);

  await expect(query.readCapability('a-concept')).rejects.toBeInstanceOf(DuplicateConceptAnswerError);
});
