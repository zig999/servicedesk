// Proof over the file adapter against a real temporary directory: the
// glossary's records persist as plain JSON files, an absent file reads as the
// empty vocabulary, a stated ttl passes through the store untouched, and a
// file that is not what the port promises is refused as a data error.
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { GlossaryStoreError } from '../../../errors/glossary-store.error.js';
import { FileGlossaryStore } from '../../../persistence/file-glossary-store.repository.js';

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'glossary-store-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

it('persists a written vocabulary as a plain JSON file named for it', async () => {
  const store = new FileGlossaryStore(directory);
  const terms = [{ name: 'first-term' }, { name: 'second-term' }];

  await store.writeTerms('subject-type', terms);

  const text = await readFile(join(directory, 'subject-type.json'), 'utf8');
  expect(JSON.parse(text)).toEqual(terms);
});

it('answers a written vocabulary back exactly as persisted', async () => {
  const store = new FileGlossaryStore(directory);
  await store.writeTerms('recipient', [{ name: 'a-recipient' }]);

  const answered = await store.readTerms('recipient');

  expect(answered).toEqual([{ name: 'a-recipient' }]);
});

it('answers an absent vocabulary file as the empty vocabulary', async () => {
  const store = new FileGlossaryStore(directory);

  const answered = await store.readTerms('action');

  expect(answered).toEqual([]);
});

it('creates the data directory on the first write', async () => {
  const store = new FileGlossaryStore(join(directory, 'not-yet-created'));

  await store.writeTerms('outcome', [{ name: 'a-conclusion' }]);

  expect(await store.readTerms('outcome')).toEqual([{ name: 'a-conclusion' }]);
});

it('answers a concept registration without a ttl exactly as the file states it', async () => {
  const store = new FileGlossaryStore(directory);
  const persisted = [
    { name: 'a-concept', accepts: ['a-subject-type'], ttl: 120 },
    { name: 'an-undeclared-ttl-concept', accepts: ['a-subject-type'] },
  ];
  await writeFile(join(directory, 'concept.json'), JSON.stringify(persisted), 'utf8');

  const answered = await store.readConcepts();

  expect(answered).toEqual(persisted);
});

it('refuses a vocabulary file that does not hold valid JSON', async () => {
  const store = new FileGlossaryStore(directory);
  await writeFile(join(directory, 'action.json'), 'not json at all', 'utf8');

  await expect(store.readTerms('action')).rejects.toBeInstanceOf(GlossaryStoreError);
});

it('refuses a vocabulary file whose content is not the promised records', async () => {
  const store = new FileGlossaryStore(directory);
  await writeFile(join(directory, 'outcome.json'), JSON.stringify([{ label: 'no-name-field' }]), 'utf8');

  await expect(store.readTerms('outcome')).rejects.toBeInstanceOf(GlossaryStoreError);
});
