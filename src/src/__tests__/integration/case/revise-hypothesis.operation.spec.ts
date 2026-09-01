import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import type { ReviseHypothesisInput } from '../../../case/revise-hypothesis.operation.js';
import { ReviseHypothesisOperation } from '../../../case/revise-hypothesis.operation.js';
import { CaseHoldsNoDraftError } from '../../../errors/case-holds-no-draft.error.js';
import { ConceptNotInGlossaryError } from '../../../errors/concept-not-in-glossary.error.js';
import { ConceptRefusesSubjectTypeError } from '../../../errors/concept-refuses-subject-type.error.js';
import { HypothesisRevisionCollectsNoConceptError } from '../../../errors/hypothesis-revision-collects-no-concept.error.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { createGlossaryQuery } from '../../../factories/glossary.factory.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

const FOREIGN_KEY_VIOLATION = '23503';

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

async function persistCase(fixture: IFixture): Promise<void> {
  await pool.query('INSERT INTO cases (slug) VALUES ($1)', [fixture.slug]);
  fixturesWrittenByThisTest.push(fixture);
}

async function persistGlossaryVocabulary(fixture: IFixture): Promise<void> {
  await pool.query('INSERT INTO subject_types (name) VALUES ($1), ($2)', [fixture.subjectType, fixture.otherSubjectType]);
  await pool.query('INSERT INTO outcomes (name) VALUES ($1)', [fixture.outcome]);
  await pool.query('INSERT INTO actions (name) VALUES ($1)', [fixture.action]);
  await pool.query('INSERT INTO recipients (name) VALUES ($1)', [fixture.recipient]);
}

async function registerConceptAccepting(fixture: IFixture, subjectType: string): Promise<void> {
  await pool.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [fixture.concept]);
  await pool.query('INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2)', [fixture.concept, subjectType]);
}

async function seedCaseVersion(fixture: IFixture, version: number, state: 'draft' | 'released'): Promise<void> {
  const releasedAt = state === 'released' ? new Date().toISOString() : null;
  await pool.query(
    `INSERT INTO case_versions
       (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient, state, released_at)
     VALUES ($1, $2, 'A title', 'A use', now(), $3, $4, $5, $6, $7, $8)`,
    [fixture.slug, version, fixture.subjectType, fixture.outcome, fixture.action, fixture.recipient, state, releasedAt],
  );
}

async function seedDraftCaseVersion(fixture: IFixture): Promise<void> {
  await seedCaseVersion(fixture, 1, 'draft');
}

async function seedReleasedCaseVersion(fixture: IFixture): Promise<void> {
  await seedCaseVersion(fixture, 1, 'released');
}

async function seedAlreadyPlacedManifestEntry(fixture: IFixture): Promise<void> {
  await pool.query('INSERT INTO hypotheses (case_slug, name) VALUES ($1, $2)', [fixture.slug, 'an-already-placed-hypothesis']);
  await pool.query(
    `INSERT INTO hypothesis_revisions
       (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient)
     VALUES ($1, $2, 1, $3, $4, $5, $6)`,
    [fixture.slug, 'an-already-placed-hypothesis', 'the already-placed criterion', fixture.outcome, fixture.action, fixture.recipient],
  );
  await pool.query(
    `INSERT INTO case_version_hypotheses (case_slug, case_version, hypothesis_name, revision, position)
     VALUES ($1, 1, $2, 1, 1)`,
    [fixture.slug, 'an-already-placed-hypothesis'],
  );
}

function aResolution(fixture: IFixture): Resolution {
  return { outcome: fixture.outcome, referral: { action: fixture.action, recipient: fixture.recipient } };
}

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

async function cleanupFixture(fixture: IFixture): Promise<void> {
  await deleteTolerantly('DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM case_version_hypotheses WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM hypothesis_revisions WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM hypotheses WHERE case_slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM case_versions WHERE slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM cases WHERE slug = $1', [fixture.slug]);
  await deleteTolerantly('DELETE FROM concept_accepts WHERE concept_name = $1', [fixture.concept]);
  await deleteTolerantly('DELETE FROM concepts WHERE name = $1', [fixture.concept]);
  await deleteTolerantly('DELETE FROM subject_types WHERE name = ANY($1)', [[fixture.subjectType, fixture.otherSubjectType]]);
  await deleteTolerantly('DELETE FROM outcomes WHERE name = $1', [fixture.outcome]);
  await deleteTolerantly('DELETE FROM actions WHERE name = $1', [fixture.action]);
  await deleteTolerantly('DELETE FROM recipients WHERE name = $1', [fixture.recipient]);
}

afterEach(async () => {
  for (const fixture of fixturesWrittenByThisTest) {
    await cleanupFixture(fixture);
  }
  fixturesWrittenByThisTest = [];
});

it("originates a never-named hypothesis's own identity and its first revision, numbered 1", async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);
  await registerConceptAccepting(fixture, fixture.subjectType);
  await seedDraftCaseVersion(fixture);
  const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

  const answered = await operation.reviseHypothesis(reviseInput(fixture));

  expect(answered).toEqual({ hypothesis_name: 'the-hypothesis', revision: 1 });
  const { rows: identityRows } = await pool.query(
    'SELECT name FROM hypotheses WHERE case_slug = $1 AND name = $2',
    [fixture.slug, 'the-hypothesis'],
  );
  expect(identityRows).toEqual([{ name: 'the-hypothesis' }]);
  const { rows: revisionRows } = await pool.query(
    'SELECT revision, criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2',
    [fixture.slug, 'the-hypothesis'],
  );
  expect(revisionRows).toEqual([{ revision: 1, criterion: 'a representative criterion' }]);
});

it("numbers a new revision of an already-named hypothesis one past its own highest existing revision, and leaves the earlier revision's own row unaltered", async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);
  await registerConceptAccepting(fixture, fixture.subjectType);
  await seedDraftCaseVersion(fixture);
  const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));
  const first = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the first revision text' }));
  expect(first.revision).toBe(1);

  const second = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the second revision text' }));

  expect(second).toEqual({ hypothesis_name: 'the-hypothesis', revision: 2 });
  const { rows } = await pool.query(
    'SELECT revision, criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 ORDER BY revision',
    [fixture.slug, 'the-hypothesis'],
  );
  expect(rows).toEqual([
    { revision: 1, criterion: 'the first revision text' },
    { revision: 2, criterion: 'the second revision text' },
  ]);
});

it('refuses revising with an empty collects list, naming that the revision collects no concept, and never reaches the store', async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);
  await seedDraftCaseVersion(fixture);
  const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

  const rejection = operation.reviseHypothesis(reviseInput(fixture, { collects: [] }));

  await expect(rejection).rejects.toBeInstanceOf(HypothesisRevisionCollectsNoConceptError);
  await expect(rejection).rejects.toMatchObject({ context: { slug: fixture.slug, hypothesis_name: 'the-hypothesis' } });
  const { rows } = await pool.query('SELECT name FROM hypotheses WHERE case_slug = $1', [fixture.slug]);
  expect(rows).toEqual([]);
});

it('refuses revising with a collected concept the glossary does not currently hold, naming the concept, and never reaches the store', async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);

  await seedDraftCaseVersion(fixture);
  const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

  const rejection = operation.reviseHypothesis(reviseInput(fixture, { collects: [fixture.unregisteredConcept] }));

  await expect(rejection).rejects.toBeInstanceOf(ConceptNotInGlossaryError);
  await expect(rejection).rejects.toMatchObject({
    context: { slug: fixture.slug, hypothesis_name: 'the-hypothesis', concepts: [fixture.unregisteredConcept] },
  });
  const { rows } = await pool.query('SELECT name FROM hypotheses WHERE case_slug = $1', [fixture.slug]);
  expect(rows).toEqual([]);
});

it('refuses revising with a collected concept that does not accept the declared subject type, naming both the concept and the subject type, and never reaches the store', async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);
  await registerConceptAccepting(fixture, fixture.otherSubjectType);
  await seedDraftCaseVersion(fixture);
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
  const { rows } = await pool.query('SELECT name FROM hypotheses WHERE case_slug = $1', [fixture.slug]);
  expect(rows).toEqual([]);
});

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
    'SELECT hypothesis_name, revision, position FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = 1',
    [fixture.slug],
  );
  expect(rows).toEqual([{ hypothesis_name: 'an-already-placed-hypothesis', revision: 1, position: 1 }]);
});

it(
  'refuses reviseHypothesis with the typed CaseHoldsNoDraftError, naming the slug, for a case ' +
    'that has never held any version at all, writing no hypothesis or revision row',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    const rejection = operation.reviseHypothesis(reviseInput(fixture));

    await expect(rejection).rejects.toBeInstanceOf(CaseHoldsNoDraftError);
    await expect(rejection).rejects.toMatchObject({ context: { slug: fixture.slug } });
    const { rows: hypothesisRows } = await pool.query('SELECT name FROM hypotheses WHERE case_slug = $1', [fixture.slug]);
    expect(hypothesisRows).toEqual([]);
    const { rows: revisionRows } = await pool.query(
      'SELECT revision FROM hypothesis_revisions WHERE case_slug = $1',
      [fixture.slug],
    );
    expect(revisionRows).toEqual([]);
  },
);

it(
  'refuses reviseHypothesis with the typed CaseHoldsNoDraftError, naming the slug, for a case ' +
    "whose only version is already released rather than in draft state, writing no hypothesis or " +
    'revision row',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedReleasedCaseVersion(fixture);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    const rejection = operation.reviseHypothesis(reviseInput(fixture));

    await expect(rejection).rejects.toBeInstanceOf(CaseHoldsNoDraftError);
    await expect(rejection).rejects.toMatchObject({ context: { slug: fixture.slug } });
    const { rows: hypothesisRows } = await pool.query('SELECT name FROM hypotheses WHERE case_slug = $1', [fixture.slug]);
    expect(hypothesisRows).toEqual([]);
    const { rows: revisionRows } = await pool.query(
      'SELECT revision FROM hypothesis_revisions WHERE case_slug = $1',
      [fixture.slug],
    );
    expect(revisionRows).toEqual([]);
  },
);

it(
  'refuses reviseHypothesis with the typed CaseHoldsNoDraftError, naming the slug, for a case ' +
    'whose only draft version has already been discarded, writing no hypothesis or revision row',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedDraftCaseVersion(fixture);
    const store = createCaseStore(pool);
    await store.discard(fixture.slug, 1);
    const operation = new ReviseHypothesisOperation(store, createGlossaryQuery(pool));

    const rejection = operation.reviseHypothesis(reviseInput(fixture));

    await expect(rejection).rejects.toBeInstanceOf(CaseHoldsNoDraftError);
    await expect(rejection).rejects.toMatchObject({ context: { slug: fixture.slug } });
    const { rows: hypothesisRows } = await pool.query('SELECT name FROM hypotheses WHERE case_slug = $1', [fixture.slug]);
    expect(hypothesisRows).toEqual([]);
  },
);

it(
  "succeeds for a case that holds both an already-released earlier version and a currently open " +
    "draft version — the draft gate finds the draft rather than being confused by the case's own " +
    'release history',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedCaseVersion(fixture, 1, 'released');
    await seedCaseVersion(fixture, 2, 'draft');
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    const answered = await operation.reviseHypothesis(reviseInput(fixture));

    expect(answered).toEqual({ hypothesis_name: 'the-hypothesis', revision: 1 });
    const { rows } = await pool.query('SELECT name FROM hypotheses WHERE case_slug = $1', [fixture.slug]);
    expect(rows).toEqual([{ name: 'the-hypothesis' }]);
  },
);

it(
  'excludes an implementation that originates a hypothesis identity and revision for a case ' +
    'holding no draft version at all, without refusing',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    const rejection = operation.reviseHypothesis(reviseInput(fixture));

    await expect(rejection).rejects.toBeInstanceOf(Error);
    const { rows } = await pool.query('SELECT name FROM hypotheses WHERE case_slug = $1', [fixture.slug]);
    expect(rows).toEqual([]);
  },
);
