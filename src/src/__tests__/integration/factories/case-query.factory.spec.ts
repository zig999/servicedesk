// Proof through the module's real wiring (task/case-store/read-case), against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned): a case
// written directly to the real, relational case store is readable at its very next read with no
// publication step in between, pinned by the real store's own content-identity hash over what is
// currently stored; a structural violation refuses through the real glossary and
// capability-registry factories the same way the unit proof shows through fakes, and a coherence
// violation refuses as the composed CaseNotValidError; a case that validated once is refused again
// once the real glossary no longer accepts the subject type the case declares for a concept it
// depends on, edited directly against the table bypassing every API; a case collecting a concept
// the glossary never held is refused by the real store itself, at write time, through a real
// foreign key — never reaching the coherence module's own identical, already-unit-tested check
// (hypothesis_collects.concept_name → concepts.name is a real constraint the file-backed store this
// task retired never enforced, so this scenario used to be a read-time discovery and is now a
// write-time refusal instead); and replaying a pinned version through the real store answers it
// unchanged even after the real capability registration the case depends on is deleted directly
// against the table.
//
// Sibling fix, disclosed in this task's own proof record: this file used to seed three fresh temp
// directories per test and write plain JSON files the way the file-backed stores used to persist
// them; createCaseQuery now takes the one shared DatabaseConnection this task's own cutover wires
// through createCaseStore, createGlossaryQuery and createCapabilityQuery alike, so this file seeds
// a fresh vocabulary, concept and capability through the real database per test instead. The
// former "routes each of the three dependencies to the directory named for it" inference test is
// dropped rather than adapted: createCaseQuery no longer takes three independently routed
// directories at all, so its own premise — that the three could differ — no longer exists under
// this task's own single-connection signature. The "collected concept the glossary does not hold"
// test is rewritten for the same underlying reason: hypothesis_collects' own real foreign key into
// concepts refuses the write itself before a read could ever discover the absence, so what this
// test proves moved from a read-time CaseNotValidError to a write-time CaseStoreError — the
// coherence module's own identical check keeps its existing, unaffected unit-level proof.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { createHash, randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { replayCase } from '../../../case/case-query.service.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseNotValidError } from '../../../errors/case-not-valid.error.js';
import { CaseStoreError } from '../../../errors/case-store.error.js';
import { createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCaseStore } from '../../../persistence/relational-case-store.repository.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

const VERSION = 1;

interface IVocabulary {
  readonly slug: string;
  readonly subject: string;
  readonly concept: string;
  readonly outcome: string;
  readonly fallbackOutcome: string;
  readonly action: string;
  readonly fallbackAction: string;
  readonly recipient: string;
  readonly fallbackRecipient: string;
  readonly capabilityName: string;
}

let pool: DatabaseConnection;
let vocabulariesWrittenByThisTest: IVocabulary[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

/** Every distinct, freshly generated name one test's own case, glossary and capability need — nothing here shared with any other test or any other suite file. */
function freshVocabulary(): IVocabulary {
  const id = randomUUID();
  return {
    slug: `case-query-case-${id}`,
    subject: `case-query-subject-${id}`,
    concept: `case-query-concept-${id}`,
    outcome: `case-query-outcome-${id}`,
    fallbackOutcome: `case-query-fallback-outcome-${id}`,
    action: `case-query-action-${id}`,
    fallbackAction: `case-query-fallback-action-${id}`,
    recipient: `case-query-recipient-${id}`,
    fallbackRecipient: `case-query-fallback-recipient-${id}`,
    capabilityName: `case-query-capability-${id}`,
  };
}

/** A raw case document — every attribute parseCaseDocument requires — naming exactly the given vocabulary's own terms, for a test to depart from one attribute at a time. */
function validCaseDocument(vocabulary: IVocabulary, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug: vocabulary.slug,
    title: 'A case',
    when_to_use: 'when a curator needs a case to test read-case composition over',
    version: VERSION,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: vocabulary.subject,
    fallback: {
      outcome: vocabulary.fallbackOutcome,
      referral: { action: vocabulary.fallbackAction, recipient: vocabulary.fallbackRecipient },
    },
    hypotheses: [
      {
        name: 'h1',
        position: 1,
        criterion: 'prose no check in this composition ever reads',
        collects: [vocabulary.concept],
        resolution: { outcome: vocabulary.outcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } },
      },
    ],
    ...overrides,
  };
}

/** Writes every vocabulary row and, unless told to skip it, the concept row this vocabulary's own case depends on, directly against the real tables — tracked for this file's own afterEach cleanup. */
async function persistCoherentGlossary(vocabulary: IVocabulary, options: { withConcept?: boolean } = {}): Promise<void> {
  await pool.query('INSERT INTO public.subject_types (name) VALUES ($1)', [vocabulary.subject]);
  await pool.query('INSERT INTO public.outcomes (name) VALUES ($1), ($2)', [vocabulary.outcome, vocabulary.fallbackOutcome]);
  await pool.query('INSERT INTO public.actions (name) VALUES ($1), ($2)', [vocabulary.action, vocabulary.fallbackAction]);
  await pool.query('INSERT INTO public.recipients (name) VALUES ($1), ($2)', [vocabulary.recipient, vocabulary.fallbackRecipient]);
  if (options.withConcept ?? true) {
    await registerConceptAccepting(vocabulary, vocabulary.subject);
  }
  vocabulariesWrittenByThisTest.push(vocabulary);
}

/** Writes the concept row plus one concept_accepts row naming the given subject type — split out so a test can register it accepting a subject type other than the case's own declared one, or not at all. */
async function registerConceptAccepting(vocabulary: IVocabulary, subjectType: string): Promise<void> {
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [vocabulary.concept]);
  await pool.query('INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [vocabulary.concept, subjectType]);
}

/** Registers, through the real registry, a complete read-only capability answering the vocabulary's own concept. */
async function registerCoherentCapability(vocabulary: IVocabulary): Promise<void> {
  await createCapabilityRegistry(pool).registerCapability({
    name: vocabulary.capabilityName,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5_000,
    connector: 'a-connector',
    concept: vocabulary.concept,
  });
}

/** Every row this file's own tests wrote for one vocabulary, deleted in an order that always satisfies their own foreign keys. */
async function cleanupVocabulary(vocabulary: IVocabulary): Promise<void> {
  await pool.query('DELETE FROM public.hypothesis_collects WHERE case_slug = $1', [vocabulary.slug]);
  await pool.query('DELETE FROM public.hypotheses WHERE case_slug = $1', [vocabulary.slug]);
  await pool.query('DELETE FROM public.case_versions WHERE slug = $1', [vocabulary.slug]);
  await pool.query('DELETE FROM public.cases WHERE slug = $1', [vocabulary.slug]);
  await pool.query('DELETE FROM public.capabilities WHERE name = $1', [vocabulary.capabilityName]);
  await pool.query('DELETE FROM public.concept_accepts WHERE concept_name = $1', [vocabulary.concept]);
  await pool.query('DELETE FROM public.concepts WHERE name = $1', [vocabulary.concept]);
  await pool.query('DELETE FROM public.subject_types WHERE name = $1', [vocabulary.subject]);
  await pool.query('DELETE FROM public.outcomes WHERE name = ANY($1)', [[vocabulary.outcome, vocabulary.fallbackOutcome]]);
  await pool.query('DELETE FROM public.actions WHERE name = ANY($1)', [[vocabulary.action, vocabulary.fallbackAction]]);
  await pool.query('DELETE FROM public.recipients WHERE name = ANY($1)', [[vocabulary.recipient, vocabulary.fallbackRecipient]]);
}

afterEach(async () => {
  for (const vocabulary of vocabulariesWrittenByThisTest) {
    await cleanupVocabulary(vocabulary);
  }
  vocabulariesWrittenByThisTest = [];
});

// ---------------------------------------------------------------------- criteria 1 and 5

it('answers a case written directly to the real store, pinned by the store\'s own content-identity hash over what is currently stored, with no publish step in between', async () => {
  const vocabulary = freshVocabulary();
  await persistCoherentGlossary(vocabulary);
  await registerCoherentCapability(vocabulary);
  await createCaseStore(pool).writeVersion(vocabulary.slug, VERSION, validCaseDocument(vocabulary));
  const query = createCaseQuery(pool);

  const result = await query.readCase(vocabulary.slug, VERSION);

  const rawStored = await new RelationalCaseStore(pool).readVersion(vocabulary.slug, VERSION);
  expect(rawStored).toBeDefined();
  expect(result.hash).toBe(createHash('sha256').update(JSON.stringify(rawStored?.document), 'utf8').digest('hex'));
  expect(result.case).toMatchObject({ slug: vocabulary.slug, subject: vocabulary.subject });
});

// -------------------------------------------------------------------------------- criterion 2

it('refuses through the real wiring a case document declaring no hypothesis, naming the structural violation', async () => {
  const vocabulary = freshVocabulary();
  await persistCoherentGlossary(vocabulary);
  await registerCoherentCapability(vocabulary);
  await createCaseStore(pool).writeVersion(vocabulary.slug, VERSION, validCaseDocument(vocabulary, { hypotheses: [] }));
  const query = createCaseQuery(pool);

  const refusal = await query.readCase(vocabulary.slug, VERSION).catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect((refusal as CaseNotValidError).context.violations).toEqual(['the case declares no hypothesis']);
});

it(
  'refuses through the real wiring, before the coherence module or CaseNotValidError ever runs, ' +
    'a case document whose collected concept the glossary does not hold — the real store\'s own ' +
    'foreign key from hypothesis_collects into concepts, never reachable through the fake store this ' +
    'task retired',
  async () => {
    const vocabulary = freshVocabulary();
    // The concept is deliberately never registered: hypothesis_collects.concept_name is a real
    // foreign key into concepts under the real relational schema, so writing a case that collects an
    // unregistered concept is refused here, at the store, rather than reaching a later read for the
    // coherence module's own identical, already-unit-tested check
    // (validate-case-coherence.spec.ts's "refuses a case collecting a concept the glossary does not
    // hold, naming the concept") to discover — a stronger, real-effect guarantee the file-backed
    // store this task retired never enforced.
    await persistCoherentGlossary(vocabulary, { withConcept: false });

    const rejection = createCaseStore(pool).writeVersion(vocabulary.slug, VERSION, validCaseDocument(vocabulary));

    await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
    await expect(createCaseQuery(pool).readCase(vocabulary.slug, VERSION)).rejects.toBeInstanceOf(CaseNotFoundError);
  },
);

// -------------------------------------------------------------------------------- criterion 3

it(
  'refuses at a later read, through the real wiring, a case that validated earlier once the glossary no ' +
    'longer accepts the subject type it depends on for a collected concept, edited directly against the table',
  async () => {
    const vocabulary = freshVocabulary();
    await persistCoherentGlossary(vocabulary);
    await registerCoherentCapability(vocabulary);
    await createCaseStore(pool).writeVersion(vocabulary.slug, VERSION, validCaseDocument(vocabulary));
    const query = createCaseQuery(pool);
    await expect(query.readCase(vocabulary.slug, VERSION)).resolves.toMatchObject({ case: { slug: vocabulary.slug } });

    // Edits the concept's own accepted subject types away directly against the table, bypassing every API.
    await pool.query('DELETE FROM public.concept_accepts WHERE concept_name = $1', [vocabulary.concept]);

    const refusal = await query.readCase(vocabulary.slug, VERSION).catch((error: unknown) => error);
    expect(refusal).toBeInstanceOf(CaseNotValidError);
  },
);

// -------------------------------------------------------------------------------- criterion 4

it(
  'replays the pinned version through the real store, answering it unchanged even after the real ' +
    'capability registration the case depends on is deleted directly against the table',
  async () => {
    const vocabulary = freshVocabulary();
    await persistCoherentGlossary(vocabulary);
    await registerCoherentCapability(vocabulary);
    const store = createCaseStore(pool);
    await store.writeVersion(vocabulary.slug, VERSION, validCaseDocument(vocabulary));
    const query = createCaseQuery(pool);
    const read = await query.readCase(vocabulary.slug, VERSION);

    // Deletes the registration directly against the capabilities table, bypassing every API.
    await pool.query('DELETE FROM public.capabilities WHERE name = $1', [vocabulary.capabilityName]);
    await expect(query.readCase(vocabulary.slug, VERSION)).rejects.toBeInstanceOf(CaseNotValidError);

    const replayed = await replayCase(vocabulary.slug, VERSION, store);

    expect(replayed).toEqual(read.case);
  },
);
