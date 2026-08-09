// Proof over the file adapter against a real temporary directory: the
// registry's registrations persist as one plain JSON file, an absent file
// reads as the empty registry, and a file that is not what the port promises
// is refused as a data error (constraints/the-mvp-persists-to-no-database —
// no database and no driver; the registrations land as a file).
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import { CapabilityStoreError } from '../../../errors/capability-store.error.js';
import { FileCapabilityStore } from '../../../persistence/file-capability-store.repository.js';

/** The one plain JSON file the adapter persists in, spelled here so a renamed file fails the proof. */
const CAPABILITY_FILE = 'capability.json';

/** One registration as the registry holds it, for writing through the store. */
function capabilityRecord(overrides: Partial<Capability> = {}): Capability {
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
  directory = await mkdtemp(join(tmpdir(), 'capability-store-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

it('persists written registrations as a plain JSON file named capability.json', async () => {
  const store = new FileCapabilityStore(directory);
  const capabilities = [capabilityRecord()];

  await store.writeCapabilities(capabilities);

  const text = await readFile(join(directory, CAPABILITY_FILE), 'utf8');
  expect(JSON.parse(text)).toEqual(capabilities);
});

it('answers written registrations back exactly as persisted', async () => {
  const store = new FileCapabilityStore(directory);
  await store.writeCapabilities([capabilityRecord()]);

  const answered = await store.readCapabilities();

  expect(answered).toEqual([capabilityRecord()]);
});

it('answers an absent capability file as the empty registry', async () => {
  const store = new FileCapabilityStore(directory);

  const answered = await store.readCapabilities();

  expect(answered).toEqual([]);
});

it('creates the data directory on the first write', async () => {
  const store = new FileCapabilityStore(join(directory, 'not-yet-created'));

  await store.writeCapabilities([capabilityRecord()]);

  expect(await store.readCapabilities()).toEqual([capabilityRecord()]);
});

it('replaces the persisted registrations whole on the next write', async () => {
  const store = new FileCapabilityStore(directory);
  await store.writeCapabilities([capabilityRecord({ name: 'an-earlier-capability' })]);

  await store.writeCapabilities([capabilityRecord({ name: 'a-later-capability' })]);

  expect(await store.readCapabilities()).toEqual([capabilityRecord({ name: 'a-later-capability' })]);
});

it('refuses a capability file that does not hold valid JSON', async () => {
  const store = new FileCapabilityStore(directory);
  await writeFile(join(directory, CAPABILITY_FILE), 'not json at all', 'utf8');

  await expect(store.readCapabilities()).rejects.toBeInstanceOf(CapabilityStoreError);
});

it('refuses a capability file whose content is not the promised records', async () => {
  const store = new FileCapabilityStore(directory);
  await writeFile(join(directory, CAPABILITY_FILE), JSON.stringify([{ name: 'a-capability' }]), 'utf8');

  await expect(store.readCapabilities()).rejects.toBeInstanceOf(CapabilityStoreError);
});

it('refuses a capability file whose timeout is not an integer count of milliseconds', async () => {
  const store = new FileCapabilityStore(directory);
  const records = [capabilityRecord({ timeout: 0.5 })];
  await writeFile(join(directory, CAPABILITY_FILE), JSON.stringify(records), 'utf8');

  await expect(store.readCapabilities()).rejects.toBeInstanceOf(CapabilityStoreError);
});
