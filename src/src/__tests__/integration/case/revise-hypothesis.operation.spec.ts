// Proof for task/case-lifecycle-operations/revise-hypothesis-operation, against a real, externally
// provisioned PostgreSQL database (constraints/the-database-is-externally-provisioned) reached
// through DATABASE_URL, the real RelationalCaseStore (persistence/relational-case-store.repository.ts)
// and the real glossary read (factories/glossary.factory.ts) — ReviseHypothesisOperation is what is
// under test, so nothing here stands in for the store or the glossary it depends on (TST-03).
//
// Every case, hypothesis and glossary row this file writes carries a
// revise-hypothesis-operation-prefixed marker plus a fresh randomUUID(), so no test here can
// collide with a row another suite file wrote, and every row a test actually commits is deleted
// again in this file's own afterEach.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
//
// This file's own last test answers this task's own UNDERDETERMINED note: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
// requires a hypothesis to be revised only while its case holds a draft version, and no criterion
// 1 through 6 refuses revising for a case that currently holds none at all — only the
// subject-type-anchoring half of that same rule is answered, by criterion 5. The implementation's
// own header comment discloses that it never reads a case version or checks one exists in draft
// state, deferring that whole gate to "a broader check this task does not close" — so the test
// below, exercised directly against ReviseHypothesisOperation exactly as every other test here
// does, is expected to fail against the delivered implementation: it asserts the refusal the
// specification's rule requires and the implementation's own disclosed scope does not provide.
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import type { ReviseHypothesisInput } from '../../../case/revise-hypothesis.operation.js';
import { ReviseHypothesisOperation } from '../../../case/revise-hypothesis.operation.js';
import { ConceptNotInGlossaryError } from '../../../errors/concept-not-in-glossary.error.js';
import { ConceptRefusesSubjectTypeError } from '../../../errors/concept-refuses-subject-type.error.js';
import { HypothesisRevisionCollectsNoConceptError } from '../../../errors/hypothesis-revision-collects-no-concept.error.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { createGlossaryQuery } from '../../../factories/glossary.factory.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

interface IFixture {
  readonly slug: string;
  readonly subjectType: string;
  readonly otherSubjectType: string;
  readonly outcome: string;
  readonly action: string;
  readonly recipient: string;
  readonly concept: string;
  readonly unregisteredConcept: string;
}

let pool: DatabaseConnection;
let fixturesWrittenByThisTest: IFixture[] = [];

beforeAll(() => {
  pool = createDatabaseConnection(requireDatabaseUrl());
});

afterAll(async () => {
  await pool.end();
});

/** Every distinct, freshly generated name one test's own case and glossary need — nothing here shared with any other test or any other suite file. */
function freshFixture(): IFixture {
  const id = randomUUID();
  return {
    slug: `revise-hypothesis-case-${id}`,
    subjectType: `revise-hypothesis-subject-${id}`,
    otherSubjectType: `revise-hypothesis-other-subject-${id}`,
    outcome: `revise-hypothesis-outcome-${id}`,
    action: `revise-hypothesis-action-${id}`,
    recipient: `revise-hypothesis-recipient-${id}`,
    concept: `revise-hypothesis-concept-${id}`,
    unregisteredConcept: `revise-hypothesis-unregistered-concept-${id}`,
  };
}

/** Claims the case's own identity row — hypotheses.case_slug foreign-keys into cases (slug), so insertHypothesisRevision needs this row to exist before it ever runs. */
async function persistCase(fixture: IFixture): Promise<void> {
  await pool.query('INSERT INTO public.cases (slug) VALUES ($1)', [fixture.slug]);
  fixturesWrittenByThisTest.push(fixture);
}

/** Every glossary row a hypothesis-revision's own resolution and the case version's declared subject type need, under fresh, uniquely named rows. Both subject types this fixture carries are seeded, so a test can register a concept accepting either one. */
async function persistGlossaryVocabulary(fixture: IFixture): Promise<void> {
  await pool.query('INSERT INTO public.subject_types (name) VALUES ($1), ($2)', [fixture.subjectType, fixture.otherSubjectType]);
  await pool.query('INSERT INTO public.outcomes (name) VALUES ($1)', [fixture.outcome]);
  await pool.query('INSERT INTO public.actions (name) VALUES ($1)', [fixture.action]);
  await pool.query('INSERT INTO public.recipients (name) VALUES ($1)', [fixture.recipient]);
}

/** Registers the fixture's own concept, accepting exactly the given subject type — split out so a test can register it accepting a subject type other than the one it later declares, or not register it at all. */
async function registerConceptAccepting(fixture: IFixture, subjectType: string): Promise<void> {
  await pool.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, 60)', [fixture.concept]);
  await pool.query('INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [fixture.concept, subjectType]);
}

/** Seeds one draft case_versions row directly against the table — criterion 6's own test needs a real version to check the manifest of. */
async function seedDraftCaseVersion(fixture: IFixture): Promise<void> {
  await pool.query(
    `INSERT INTO public.case_versions
       (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient, state)
     VALUES ($1, 1, 'A title', 'A use', now(), $2, $3, $4, $5, 'draft')`,
    [fixture.slug, fixture.subjectType, fixture.outcome, fixture.action, fixture.recipient],
  );
}

/** Seeds one already-manifested hypothesis-revision directly against the tables, at position 1 of the fixture's own draft version — the entry criterion 6's own test holds fixed to prove revise-hypothesis moves nothing here. */
async function seedAlreadyPlacedManifestEntry(fixture: IFixture): Promise<void> {
  await pool.query('INSERT INTO public.hypotheses (case_slug, name) VALUES ($1, $2)', [fixture.slug, 'an-already-placed-hypothesis']);
  await pool.query(
    `INSERT INTO public.hypothesis_revisions
       (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient)
     VALUES ($1, $2, 1, $3, $4, $5, $6)`,
    [fixture.slug, 'an-already-placed-hypothesis', 'the already-placed criterion', fixture.outcome, fixture.action, fixture.recipient],
  );
  await pool.query(
    `INSERT INTO public.case_version_hypotheses (case_slug, case_version, hypothesis_name, revision, position)
     VALUES ($1, 1, $2, 1, 1)`,
    [fixture.slug, 'an-already-placed-hypothesis'],
  );
}

/** The resolution every revision below uses, reusing the one glossary triple a fixture seeds. */
function aResolution(fixture: IFixture): Resolution {
  return { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient } };
}

/** A revise-hypothesis input naming the fixture's own concept and declared subject type, departed from one field at a time by a test's own overrides. */
function reviseInput(fixture: IFixture, overrides: Partial<ReviseHypothesisInput> = {}): ReviseHypothesisInput {
  return {
    slug: fixture.slug,
    hypothesis_name: 'the-hypothesis',
    criterion: 'a representative criterion',
    collects: [fixture.concept],
    resolution: aResolution(fixture),
    subject: fixture.subjectType,
    ...overrides,
  };
}

/** Every row this file's own tests wrote for one fixture, deleted in an order that always satisfies their own foreign keys. concepts that were never registered (the "unregistered" one) need no cleanup, since nothing was ever inserted for them. */
async function cleanupFixture(fixture: IFixture): Promise<void> {
  await pool.query('DELETE FROM public.hypothesis_revision_collects WHERE case_slug = $1', [fixture.slug]);
  await pool.query('DELETE FROM public.case_version_hypotheses WHERE case_slug = $1', [fixture.slug]);
  await pool.query('DELETE FROM public.hypothesis_revisions WHERE case_slug = $1', [fixture.slug]);
  await pool.query('DELETE FROM public.hypotheses WHERE case_slug = $1', [fixture.slug]);
  await pool.query('DELETE FROM public.case_versions WHERE slug = $1', [fixture.slug]);
  await pool.query('DELETE FROM public.cases WHERE slug = $1', [fixture.slug]);
  await pool.query('DELETE FROM public.concept_accepts WHERE concept_name = $1', [fixture.concept]);
  await pool.query('DELETE FROM public.concepts WHERE name = $1', [fixture.concept]);
  await pool.query('DELETE FROM public.subject_types WHERE name = ANY($1)', [[fixture.subjectType, fixture.otherSubjectType]]);
  await pool.query('DELETE FROM public.outcomes WHERE name = $1', [fixture.outcome]);
  await pool.query('DELETE FROM public.actions WHERE name = $1', [fixture.action]);
  await pool.query('DELETE FROM public.recipients WHERE name = $1', [fixture.recipient]);
}

afterEach(async () => {
  for (const fixture of fixturesWrittenByThisTest) {
    await cleanupFixture(fixture);
  }
  fixturesWrittenByThisTest = [];
});

// ---------------------------------------------------------------------- criterion 1

it("originates a never-named hypothesis's own identity and its first revision, numbered 1", async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);
  await registerConceptAccepting(fixture, fixture.subjectType);
  const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

  const answered = await operation.reviseHypothesis(reviseInput(fixture));

  expect(answered).toEqual({ hypothesis_name: 'the-hypothesis', revision: 1 });
  const { rows: identityRows } = await pool.query(
    'SELECT name FROM public.hypotheses WHERE case_slug = $1 AND name = $2',
    [fixture.slug, 'the-hypothesis'],
  );
  expect(identityRows).toEqual([{ name: 'the-hypothesis' }]);
  const { rows: revisionRows } = await pool.query(
    'SELECT revision, criterion FROM public.hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2',
    [fixture.slug, 'the-hypothesis'],
  );
  expect(revisionRows).toEqual([{ revision: 1, criterion: 'a representative criterion' }]);
});

// ---------------------------------------------------------------------- criterion 2

it("numbers a new revision of an already-named hypothesis one past its own highest existing revision, and leaves the earlier revision's own row unaltered", async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);
  await registerConceptAccepting(fixture, fixture.subjectType);
  const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));
  const first = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the first revision text' }));
  expect(first.revision).toBe(1);

  const second = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the second revision text' }));

  expect(second).toEqual({ hypothesis_name: 'the-hypothesis', revision: 2 });
  const { rows } = await pool.query(
    'SELECT revision, criterion FROM public.hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 ORDER BY revision',
    [fixture.slug, 'the-hypothesis'],
  );
  expect(rows).toEqual([
    { revision: 1, criterion: 'the first revision text' },
    { revision: 2, criterion: 'the second revision text' },
  ]);
});

// ---------------------------------------------------------------------- criterion 3

it('refuses revising with an empty collects list, naming that the revision collects no concept, and never reaches the store', async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);
  const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

  const rejection = operation.reviseHypothesis(reviseInput(fixture, { collects: [] }));

  await expect(rejection).rejects.toBeInstanceOf(HypothesisRevisionCollectsNoConceptError);
  await expect(rejection).rejects.toMatchObject({ context: { slug: fixture.slug, hypothesis_name: 'the-hypothesis' } });
  const { rows } = await pool.query('SELECT name FROM public.hypotheses WHERE case_slug = $1', [fixture.slug]);
  expect(rows).toEqual([]);
});

// ---------------------------------------------------------------------- criterion 4

it('refuses revising with a collected concept the glossary does not currently hold, naming the concept, and never reaches the store', async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);
  // fixture.unregisteredConcept is deliberately never inserted into public.concepts.
  const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

  const rejection = operation.reviseHypothesis(reviseInput(fixture, { collects: [fixture.unregisteredConcept] }));

  await expect(rejection).rejects.toBeInstanceOf(ConceptNotInGlossaryError);
  await expect(rejection).rejects.toMatchObject({
    context: { slug: fixture.slug, hypothesis_name: 'the-hypothesis', concepts: [fixture.unregisteredConcept] },
  });
  const { rows } = await pool.query('SELECT name FROM public.hypotheses WHERE case_slug = $1', [fixture.slug]);
  expect(rows).toEqual([]);
});

// ---------------------------------------------------------------------- criterion 5

it('refuses revising with a collected concept that does not accept the declared subject type, naming both the concept and the subject type, and never reaches the store', async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);
  await registerConceptAccepting(fixture, fixture.otherSubjectType); // accepts a different subject type than the one declared below
  const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

  const rejection = operation.reviseHypothesis(reviseInput(fixture, { subject: fixture.subjectType }));

  await expect(rejection).rejects.toBeInstanceOf(ConceptRefusesSubjectTypeError);
  await expect(rejection).rejects.toMatchObject({
    context: {
      slug: fixture.slug,
      hypothesis_name: 'the-hypothesis',
      subject: fixture.subjectType,
      concepts: [fixture.concept],
    },
  });
  const { rows } = await pool.query('SELECT name FROM public.hypotheses WHERE case_slug = $1', [fixture.slug]);
  expect(rows).toEqual([]);
});

// ---------------------------------------------------------------------- criterion 6

it("changes no version's manifest on its own — an existing manifest entry stays exactly as it was, and the newly originated revision is placed nowhere", async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);
  await registerConceptAccepting(fixture, fixture.subjectType);
  await seedDraftCaseVersion(fixture);
  await seedAlreadyPlacedManifestEntry(fixture);
  const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

  await operation.reviseHypothesis(reviseInput(fixture, { hypothesis_name: 'a-freshly-revised-hypothesis' }));

  const { rows } = await pool.query(
    'SELECT hypothesis_name, revision, position FROM public.case_version_hypotheses WHERE case_slug = $1 AND case_version = 1',
    [fixture.slug],
  );
  expect(rows).toEqual([{ hypothesis_name: 'an-already-placed-hypothesis', revision: 1, position: 1 }]);
});

// ---------------------------------------------------------------------- this task's own UNDERDETERMINED note

it(
  'excludes an implementation that originates a hypothesis identity and revision for a case ' +
    'holding no draft version at all, without refusing',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture); // the case exists, but no case_versions row — draft or otherwise — is ever inserted for it
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    const rejection = operation.reviseHypothesis(reviseInput(fixture));

    await expect(rejection).rejects.toBeInstanceOf(Error);
    const { rows } = await pool.query('SELECT name FROM public.hypotheses WHERE case_slug = $1', [fixture.slug]);
    expect(rows).toEqual([]);
  },
);
