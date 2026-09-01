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

function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

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

function aHypothesis(vocabulary: IVocabulary, overrides: { collects?: readonly string[] } = {}) {
  return {
    hypothesis_name: 'h1',
    criterion: 'prose no check in this composition ever reads',
    collects: overrides.collects ?? [vocabulary.concept],
    resolution: { outcome: vocabulary.outcome, referral: { action: vocabulary.action, recipient: vocabulary.recipient } } satisfies Resolution,
  };
}

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

async function registerConceptAccepting(vocabulary: IVocabulary, subjectType: string): Promise<void> {
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [vocabulary.concept]);
  await pool.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [vocabulary.concept, subjectType]);
}

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

    await persistCoherentGlossary(vocabulary, { withConcept: false });

    const rejection = writeCase(vocabulary);

    await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);

    const refusal = await createCaseQuery(pool).readCase(vocabulary.slug, 1).catch((error: unknown) => error);
    expect(refusal).toBeInstanceOf(CaseNotValidError);
    expect((refusal as CaseNotValidError).context.violations).toEqual(['the case declares no hypothesis']);
  },
);

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

    await pool.query('DELETE FROM concept_accepts WHERE concept_name = $1', [vocabulary.concept]);

    const refusal = await query.readCase(vocabulary.slug, version).catch((error: unknown) => error);
    expect(refusal).toBeInstanceOf(CaseNotValidError);
  },
);

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

    await pool.query('DELETE FROM capabilities WHERE name = $1', [vocabulary.capabilityName]);
    await expect(query.readCase(vocabulary.slug, version)).rejects.toBeInstanceOf(CaseNotValidError);

    const replayed = await replayCase(vocabulary.slug, version, createCaseStore(pool));

    expect(replayed).toEqual(read.case);
  },
);
