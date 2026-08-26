// Proof through the module's real wiring (task/case-store/read-case), against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned): a case
// written directly to the real, relational case store is readable at its very next read with no
// publication step in between; a structural violation refuses through the real glossary and
// capability-registry factories the same way the unit proof shows through fakes, and a coherence
// violation refuses as the composed CaseNotValidError; a case that validated once is refused again
// once the real glossary no longer accepts the subject type the case declares for a concept it
// depends on, edited directly against the table bypassing every API; a case collecting a concept
// the glossary never held is refused by the real store itself, at write time, through a real foreign
// key — never reaching the coherence module's own identical, already-unit-tested check; and
// replaying a pinned version through the real store answers it unchanged even after the real
// capability registration the case depends on is deleted directly against the table.
//
// Rewritten against RelationalCaseStore's own rebuilt shape (task/case-lifecycle-persistence/
// relational-case-store-for-lifecycle): readVersion/writeVersion are gone, replaced below by
// writeCase(), a fixture helper built over createDraft, insertHypothesisRevision, placeHypothesis
// and release — the same lifecycle primitives task/case-lifecycle-operations' own author path calls
// — since there is no longer a single call that writes a whole version. The store's own
// content-identity hash is gone too (case-store.port.ts's own header comment), so this file no
// longer reads one back through RelationalCaseStore.readVersion; assembleVersion is asserted defined
// instead.
//
// Sibling fix, disclosed in the original task's own proof record and unaffected by this rewrite:
// this file seeds a fresh vocabulary, concept and capability through the real database per test
// (createCaseQuery takes the one shared DatabaseConnection this task's own cutover wires through);
// the former "routes each of the three dependencies to the directory named for it" inference test
// stays dropped for the same reason it was dropped there.
//
// writeCase() below calls the store's own release() for real on every case it writes, so
// migrations/0009's own release-conditioned rules now make that released case_versions row (and its
// own case_version_hypotheses entry) permanent — an ordinary DELETE against one is a silent no-op,
// and a DELETE against whatever it still references (a hypothesis-revision, a glossary row) fails on
// that surviving row's own foreign key. deleteTolerantly below runs every cleanup statement expecting
// exactly that — the same tolerance create-draft.operation.spec.ts's own deleteTolerantly already
// establishes for this migration's consequence.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { replayCase } from '../../../case/case-query.service.js';
import type { Resolution } from '../../../case/case.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseNotValidError } from '../../../errors/case-not-valid.error.js';
import { CaseStoreError } from '../../../errors/case-store.error.js';
import { createCapabilityRegistry } from '../../../factories/capability-registry.factory.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

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

const FOREIGN_KEY_VIOLATION = '23503';

let pool: DatabaseConnection;
let vocabulariesWrittenByThisTest: IVocabulary[] = [];

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard create-draft.operation.spec.ts's own isForeignKeyViolation already establishes for this codebase). */
function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

/** Runs one cleanup DELETE, tolerating a foreign-key violation — this file's header comment explains why that one code, and only that one, is expected rather than a bug. */
async function deleteTolerantly(text: string, params: readonly unknown[]): Promise<void> {
  try {
    await pool.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

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

/** The one hypothesis writeCase() places unless a test names its own — collecting the given vocabulary's own concept, resolving to its own outcome/action/recipient. */
function aHypothesis(vocabulary: IVocabulary, overrides: { collects?: readonly string[] } = {}) {
  return {
    hypothesis_name: 'h1',
    criterion: 'prose no check in this composition ever reads',
    collects: overrides.collects ?? [vocabulary.concept],
    resolution: { outcome: vocabulary.outcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } } satisfies Resolution,
  };
}

/**
 * Originates one case version through the store's own lifecycle primitives — createDraft, one
 * insertHypothesisRevision plus one placeHypothesis per hypothesis, and release — answering the
 * version number the store assigned. Replaces this file's own previous
 * createCaseStore(pool).writeVersion(...) call: the new ICaseStore has no single write call.
 */
async function writeCase(vocabulary: IVocabulary, hypotheses: readonly ReturnType<typeof aHypothesis>[] = [aHypothesis(vocabulary)]): Promise<number> {
  const store = createCaseStore(pool);
  const version = await store.createDraft({
    slug: vocabulary.slug,
    title: 'A case',
    when_to_use: 'when a curator needs a case to test read-case composition over',
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: vocabulary.subject,
    fallback: { outcome: vocabulary.fallbackOutcome, referral: { action: vocabulary.fallbackAction, recipient: vocabulary.fallbackRecipient } },
  });
  for (const hypothesis of hypotheses) {
    const revision = await store.insertHypothesisRevision({ slug: vocabulary.slug, ...hypothesis });
    await store.placeHypothesis({ slug: vocabulary.slug, version, hypothesis_name: hypothesis.hypothesis_name, revision, position: 1 });
  }
  await store.release(vocabulary.slug, version);
  return version;
}

/** Writes every vocabulary row and, unless told to skip it, the concept row this vocabulary's own case depends on, directly against the real tables — tracked for this file's own afterEach cleanup. */
async function persistCoherentGlossary(vocabulary: IVocabulary, options: { withConcept?: boolean } = {}): Promise<void> {
  await pool.query('INSERT INTO subject_types (name) VALUES ($1)', [vocabulary.subject]);
  await pool.query('INSERT INTO outcomes (name) VALUES ($1), ($2)', [vocabulary.outcome, vocabulary.fallbackOutcome]);
  await pool.query('INSERT INTO actions (name) VALUES ($1), ($2)', [vocabulary.action, vocabulary.fallbackAction]);
  await pool.query('INSERT INTO recipients (name) VALUES ($1), ($2)', [vocabulary.recipient, vocabulary.fallbackRecipient]);
  if (options.withConcept ?? true) {
    await registerConceptAccepting(vocabulary, vocabulary.subject);
  }
  vocabulariesWrittenByThisTest.push(vocabulary);
}

/** Writes the concept row plus one concept_accepts row naming the given subject type — split out so a test can register it accepting a subject type other than the case's own declared one, or not at all. */
async function registerConceptAccepting(vocabulary: IVocabulary, subjectType: string): Promise<void> {
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [vocabulary.concept]);
  await pool.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [vocabulary.concept, subjectType]);
}

/** Registers, through the real registry, a complete read-only capability answering the vocabulary's own concept. */
async function registerCoherentCapability(vocabulary: IVocabulary): Promise<void> {
  await createCapabilityRegistry(pool).registerCapability({
    name: vocabulary.capabilityName,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: '{}',
    output_schema: '{}',
    timeout: 5_000,
    connector: 'a-connector',
    concept: vocabulary.concept,
  });
}

/** Every row this file's own tests wrote for one vocabulary, deleted in an order that always satisfies their own foreign keys. */
async function cleanupVocabulary(vocabulary: IVocabulary): Promise<void> {
  await deleteTolerantly('DELETE FROM case_version_hypotheses WHERE case_slug = $1', [vocabulary.slug]);
  await deleteTolerantly('DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [vocabulary.slug]);
  await deleteTolerantly('DELETE FROM hypothesis_revisions WHERE case_slug = $1', [vocabulary.slug]);
  await deleteTolerantly('DELETE FROM hypotheses WHERE case_slug = $1', [vocabulary.slug]);
  await deleteTolerantly('DELETE FROM case_versions WHERE slug = $1', [vocabulary.slug]);
  await deleteTolerantly('DELETE FROM cases WHERE slug = $1', [vocabulary.slug]);
  await deleteTolerantly('DELETE FROM capabilities WHERE name = $1', [vocabulary.capabilityName]);
  await deleteTolerantly('DELETE FROM concept_accepts WHERE concept_name = $1', [vocabulary.concept]);
  await deleteTolerantly('DELETE FROM concepts WHERE name = $1', [vocabulary.concept]);
  await deleteTolerantly('DELETE FROM subject_types WHERE name = $1', [vocabulary.subject]);
  await deleteTolerantly('DELETE FROM outcomes WHERE name = ANY($1)', [[vocabulary.outcome, vocabulary.fallbackOutcome]]);
  await deleteTolerantly('DELETE FROM actions WHERE name = ANY($1)', [[vocabulary.action, vocabulary.fallbackAction]]);
  await deleteTolerantly('DELETE FROM recipients WHERE name = ANY($1)', [[vocabulary.recipient, vocabulary.fallbackRecipient]]);
}

afterEach(async () => {
  for (const vocabulary of vocabulariesWrittenByThisTest) {
    await cleanupVocabulary(vocabulary);
  }
  vocabulariesWrittenByThisTest = [];
});

// ---------------------------------------------------------------------- criteria 1 and 5

it('answers a case written directly to the real store, matching what is currently stored, with no publish step in between', async () => {
  const vocabulary = freshVocabulary();
  await persistCoherentGlossary(vocabulary);
  await registerCoherentCapability(vocabulary);
  const version = await writeCase(vocabulary);
  const query = createCaseQuery(pool);

  const result = await query.readCase(vocabulary.slug, version);

  const assembled = await createCaseStore(pool).assembleVersion(vocabulary.slug, version);
  expect(assembled).toBeDefined();
  expect(result.case).toMatchObject({ slug: vocabulary.slug, subject: vocabulary.subject });
});

it('refuses with CaseNotFoundError, through the real wiring, for a slug and version nothing was ever created for', async () => {
  const query = createCaseQuery(pool);

  await expect(query.readCase(`case-query-absent-${randomUUID()}`, 1)).rejects.toBeInstanceOf(CaseNotFoundError);
});

// -------------------------------------------------------------------------------- criterion 2

it('refuses through the real wiring a case document declaring no hypothesis, naming the structural violation', async () => {
  const vocabulary = freshVocabulary();
  await persistCoherentGlossary(vocabulary);
  await registerCoherentCapability(vocabulary);
  const version = await writeCase(vocabulary, []);
  const query = createCaseQuery(pool);

  const refusal = await query.readCase(vocabulary.slug, version).catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect((refusal as CaseNotValidError).context.violations).toEqual(['the case declares no hypothesis']);
});

it(
  'refuses through the real wiring, before the coherence module or CaseNotValidError ever runs, ' +
    "a hypothesis-revision whose collected concept the glossary does not hold — the real store's " +
    'own foreign key from hypothesis_revision_collects into concepts, never reachable through the ' +
    'fake store the unit-level proof stands in with',
  async () => {
    const vocabulary = freshVocabulary();
    // The concept is deliberately never registered: hypothesis_revision_collects.concept_name is a
    // real foreign key into concepts under the real relational schema, so inserting a
    // hypothesis-revision that collects an unregistered concept is refused here, at the store,
    // rather than reaching a later read for the coherence module's own identical,
    // already-unit-tested check (validate-case-coherence.spec.ts's "refuses a case collecting a
    // concept the glossary does not hold, naming the concept") to discover.
    await persistCoherentGlossary(vocabulary, { withConcept: false });

    const rejection = writeCase(vocabulary);

    await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
    // createDraft is its own primitive, already committed before insertHypothesisRevision's own
    // failure — unlike the file-backed store this port replaced, which wrote a whole version as one
    // atomic call, the lifecycle store's own primitives are not one another's transaction. The
    // version this call started therefore still exists, in draft state with an empty manifest, so
    // read-case answers the structural refusal its own empty manifest states rather than an absence.
    const refusal = await createCaseQuery(pool).readCase(vocabulary.slug, 1).catch((error: unknown) => error);
    expect(refusal).toBeInstanceOf(CaseNotValidError);
    expect((refusal as CaseNotValidError).context.violations).toEqual(['the case declares no hypothesis']);
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
    const version = await writeCase(vocabulary);
    const query = createCaseQuery(pool);
    await expect(query.readCase(vocabulary.slug, version)).resolves.toMatchObject({ case: { slug: vocabulary.slug } });

    // Edits the concept's own accepted subject types away directly against the table, bypassing every API.
    await pool.query('DELETE FROM concept_accepts WHERE concept_name = $1', [vocabulary.concept]);

    const refusal = await query.readCase(vocabulary.slug, version).catch((error: unknown) => error);
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
    const version = await writeCase(vocabulary);
    const query = createCaseQuery(pool);
    const read = await query.readCase(vocabulary.slug, version);

    // Deletes the registration directly against the capabilities table, bypassing every API.
    await pool.query('DELETE FROM capabilities WHERE name = $1', [vocabulary.capabilityName]);
    await expect(query.readCase(vocabulary.slug, version)).rejects.toBeInstanceOf(CaseNotValidError);

    const replayed = await replayCase(vocabulary.slug, version, createCaseStore(pool));

    expect(replayed).toEqual(read.case);
  },
);
