// Proof for the published query over the real file store: each read answers
// the holding as the files state it at that moment, so data changed between
// two reads answers the new holding, never a remembered one. Every test
// baits a cache with a first read before changing the file underneath it.
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { createGlossaryQuery } from '../../../factories/glossary.factory.js';

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'glossary-query-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

/** Writes one vocabulary's records the way the store persists them: a plain JSON file. */
async function persist(file: string, records: readonly unknown[]): Promise<void> {
  await writeFile(join(directory, file), JSON.stringify(records), 'utf8');
}

it('answers a term added to the data since the previous read', async () => {
  await persist('action.json', [{ name: 'first-term' }]);
  const query = createGlossaryQuery(directory);
  await query.readVocabularyTerm('action', 'later-term'); // arranged to bait a remembered holding
  await persist('action.json', [{ name: 'first-term' }, { name: 'later-term' }]);

  const resolution = await query.readVocabularyTerm('action', 'later-term');

  expect(resolution).toEqual({ held: true, term: { name: 'later-term' } });
});

it('no longer answers a term removed from the data since the previous read', async () => {
  await persist('action.json', [{ name: 'a-removed-term' }]);
  const query = createGlossaryQuery(directory);
  await query.readVocabularyTerm('action', 'a-removed-term'); // answers it held, baiting a memory
  await persist('action.json', [{ name: 'a-kept-term' }]);

  const resolution = await query.readVocabularyTerm('action', 'a-removed-term');

  expect(resolution).toEqual({ held: false, vocabulary: 'action', name: 'a-removed-term' });
});

it("answers a concept's ttl as the data now states it, not as it stood at the previous read", async () => {
  await persist('concept.json', [{ name: 'a-concept', accepts: ['a-subject-type'], ttl: 120 }]);
  const query = createGlossaryQuery(directory);
  await query.readConcept('a-concept'); // arranged to bait a remembered holding
  await persist('concept.json', [{ name: 'a-concept', accepts: ['a-subject-type'], ttl: 600 }]);

  const resolution = await query.readConcept('a-concept');

  expect(resolution).toEqual({
    held: true,
    concept: { name: 'a-concept', accepts: ['a-subject-type'], ttl: 600 },
  });
});
