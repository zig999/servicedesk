// Proof over the file adapter against a real temporary directory: a built
// investigation persists as its own plain JSON file, an already-stored
// identity is refused rather than overwritten, and the store's write goes
// through no writing routine but the one every file store in this tree
// already shares (rules/investigation/an-investigation-is-written-once,
// constraints/the-mvp-persists-to-no-database). Mirrors
// file-case-store.repository.spec.ts's own setup, naming and style, since
// this is the same kind of store.
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { InvestigationAlreadyStoredError } from '../../../errors/investigation-already-stored.error.js';
import { InvestigationStoreError } from '../../../errors/investigation-store.error.js';
import type { Assessment } from '../../../investigation/assessment.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import type { Investigation } from '../../../investigation/investigation.js';
import { FileInvestigationStore } from '../../../persistence/file-investigation-store.repository.js';

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'investigation-store-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

/** The sha256 hex of exactly the bytes a file holds, computed independently of the store under test. */
async function independentHashOf(file: string): Promise<string> {
  const bytes = await readFile(file, 'utf8');
  return createHash('sha256').update(bytes, 'utf8').digest('hex');
}

/** One collected concept's whole Evidence record, for the fixture below. */
function anEvidence(): Evidence {
  return {
    concept: 'concept-a',
    inputs: 'an-input',
    observation: 'an-observation',
    observed_at: '2024-01-01T00:00:00.000Z',
    ttl: 60,
    origin: 'a-connector',
    result: 'ok',
    capability_name: 'capability-for-concept-a',
    capability_version: '1.0.0',
  };
}

/** One decided, confirmed Evaluation, for the fixture below. */
function aConfirmedEvaluation(): Evaluation {
  return { hypothesis: 'h1', verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'a-field' }] };
}

/** A whole Assessment, for the fixture below. */
function anAssessment(): Assessment {
  return {
    outcome: 'an-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    determining_hypothesis: 'h1',
    text: 'the drafted assessment text',
  };
}

/** A whole, structurally valid Investigation, defaulted so a test states only what it departs from. */
function anInvestigation(overrides: Partial<Investigation> = {}): Investigation {
  return {
    id: 'investigation-1',
    requester: 'requester-1',
    ticket_ref: 'TICKET-1',
    narrative: 'the narrative the requester submitted',
    subject: { type: 'ont', attributes: [{ attribute: 'id', value: 'subject-1' }] },
    pinned_case: { slug: 'a-case', version: 3, hash: 'a-hash' },
    prompt_version: 'prompt-v1',
    model: 'model-x',
    evidence: [anEvidence()],
    evaluations: [aConfirmedEvaluation()],
    assessment: anAssessment(),
    cost: { calls: 3, input_tokens: 100, output_tokens: 50 },
    durations: { collection: 10, judgment: 20, writing: 5, total: 35 },
    ...overrides,
  };
}

// ---------------------------------------------------------------- criterion 3: file layout, .json ending

it('persists a written investigation as a plain JSON file at <id>.json directly under the data directory', async () => {
  const store = new FileInvestigationStore(directory);
  const investigation = anInvestigation({ id: 'investigation-1' });

  await store.write(investigation);

  const text = await readFile(join(directory, 'investigation-1.json'), 'utf8');
  expect(JSON.parse(text)).toEqual(investigation);
});

// ---------------------------------------------------------------- criterion: write reuses the shared JSON-file writer

it('creates the data directory when it does not yet exist, the way the shared JSON-file writer does for every other file store', async () => {
  const store = new FileInvestigationStore(join(directory, 'nested', 'investigations'));
  const investigation = anInvestigation();

  await store.write(investigation);

  const read = await store.read(investigation.id);
  expect(read?.document).toEqual(investigation);
});

it('resolves write with nothing, leaving hashing to a subsequent read', async () => {
  const store = new FileInvestigationStore(directory);

  const result = await store.write(anInvestigation());

  expect(result).toBeUndefined();
});

// ---------------------------------------------------------------- criterion: a written investigation is retrievable, whole and unchanged

it('answers the written investigation by its id, whole and unchanged', async () => {
  const store = new FileInvestigationStore(directory);
  const investigation = anInvestigation();

  await store.write(investigation);
  const read = await store.read(investigation.id);

  expect(read?.document).toEqual(investigation);
});

it('answers a stored investigation with a hash equal to the sha256 of the exact bytes its file holds', async () => {
  const store = new FileInvestigationStore(directory);
  const investigation = anInvestigation();
  await store.write(investigation);

  const read = await store.read(investigation.id);

  const expectedHash = await independentHashOf(join(directory, 'investigation-1.json'));
  expect(read?.hash).toBe(expectedHash);
});

it('answers read() with whatever valid JSON a file holds, without validating it against the Investigation shape', async () => {
  const store = new FileInvestigationStore(directory);
  const notAnInvestigation = { unrelated: 'shape', nothing: 'to do with Investigation' };
  await writeFile(join(directory, 'investigation-1.json'), JSON.stringify(notAnInvestigation), 'utf8');

  const read = await store.read('investigation-1');

  expect(read?.document).toEqual(notAnInvestigation);
});

// ---------------------------------------------------------------- criterion: an already-stored identity is refused rather than overwritten

it('refuses to write an investigation whose id is already stored, rather than overwriting the earlier file', async () => {
  const store = new FileInvestigationStore(directory);
  const first = anInvestigation({ id: 'investigation-1', narrative: 'the original narrative' });
  const second = anInvestigation({ id: 'investigation-1', narrative: 'a completely different narrative' });
  await store.write(first);

  await expect(store.write(second)).rejects.toBeInstanceOf(InvestigationAlreadyStoredError);
});

it("leaves the first write's file exactly as it was after a refused second write to the same id", async () => {
  const store = new FileInvestigationStore(directory);
  const first = anInvestigation({ id: 'investigation-1', narrative: 'the original narrative' });
  const second = anInvestigation({ id: 'investigation-1', narrative: 'a completely different narrative' });
  const file = join(directory, 'investigation-1.json');
  await store.write(first);
  const hashBefore = await independentHashOf(file);

  await expect(store.write(second)).rejects.toBeInstanceOf(InvestigationAlreadyStoredError);

  const hashAfter = await independentHashOf(file);
  expect(hashAfter).toBe(hashBefore);
  const text = await readFile(file, 'utf8');
  expect(JSON.parse(text)).toEqual(first);
});

// ---------------------------------------------------------------- edge cases

it('answers undefined for an investigation id that was never written', async () => {
  const store = new FileInvestigationStore(directory);
  await store.write(anInvestigation({ id: 'investigation-1' }));

  const read = await store.read('investigation-never-written');

  expect(read).toBeUndefined();
});

it('writes two different investigation ids independently, with neither affecting the other', async () => {
  const store = new FileInvestigationStore(directory);
  const first = anInvestigation({ id: 'investigation-1', narrative: 'first narrative' });
  const second = anInvestigation({ id: 'investigation-2', narrative: 'second narrative' });

  await store.write(first);
  await store.write(second);

  expect((await store.read('investigation-1'))?.document).toEqual(first);
  expect((await store.read('investigation-2'))?.document).toEqual(second);
});

it('answers a different content hash for two investigations written to two different ids', async () => {
  const store = new FileInvestigationStore(directory);
  const first = anInvestigation({ id: 'investigation-1', narrative: 'first narrative' });
  const second = anInvestigation({ id: 'investigation-2', narrative: 'a narrative that differs from the first' });
  await store.write(first);
  await store.write(second);

  const readFirst = await store.read('investigation-1');
  const readSecond = await store.read('investigation-2');

  expect(readFirst?.hash).not.toBe(readSecond?.hash);
});

it('refuses with an InvestigationStoreError when an investigation file does not hold valid JSON', async () => {
  const store = new FileInvestigationStore(directory);
  await writeFile(join(directory, 'investigation-1.json'), 'not json at all', 'utf8');

  await expect(store.read('investigation-1')).rejects.toBeInstanceOf(InvestigationStoreError);
});
