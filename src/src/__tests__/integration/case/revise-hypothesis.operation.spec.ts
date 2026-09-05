import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import type { Resolution } from '../../../case/case.js';
import type { ReviseHypothesisInput, ReviseHypothesisStore } from '../../../case/revise-hypothesis.operation.js';
import { ReviseHypothesisOperation } from '../../../case/revise-hypothesis.operation.js';
import { CaseHoldsNoDraftError } from '../../../errors/case-holds-no-draft.error.js';
import { ConceptNotInGlossaryError } from '../../../errors/concept-not-in-glossary.error.js';
import { ConceptRefusesSubjectTypeError } from '../../../errors/concept-refuses-subject-type.error.js';
import { HypothesisRevisionCollectsNoConceptError } from '../../../errors/hypothesis-revision-collects-no-concept.error.js';
import { ReleasedHypothesisRevisionNotAlterableError } from '../../../errors/released-hypothesis-revision-not-alterable.error.js';
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

interface ISeedHypothesisRevisionInput {
  readonly hypothesisName: string;
  readonly revision: number;
  readonly criterion: string;
}

async function seedHypothesisRevision(fixture: IFixture, input: ISeedHypothesisRevisionInput): Promise<void> {
  await pool.query('INSERT INTO hypotheses (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug, name) DO NOTHING', [
    fixture.slug,
    input.hypothesisName,
  ]);
  await pool.query(
    `INSERT INTO hypothesis_revisions
       (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [fixture.slug, input.hypothesisName, input.revision, input.criterion, fixture.outcome, fixture.action, fixture.recipient],
  );
}

interface ISeedManifestEntryInput {
  readonly version: number;
  readonly hypothesisName: string;
  readonly revision: number;
  readonly position: number;
}

async function seedManifestEntry(fixture: IFixture, input: ISeedManifestEntryInput): Promise<void> {
  await pool.query(
    `INSERT INTO case_version_hypotheses (case_slug, case_version, hypothesis_name, revision, position)
     VALUES ($1, $2, $3, $4, $5)`,
    [fixture.slug, input.version, input.hypothesisName, input.revision, input.position],
  );
}

async function seedReleasedReferencedHighestRevision(fixture: IFixture, criterion: string): Promise<void> {
  await seedHypothesisRevision(fixture, { hypothesisName: 'the-hypothesis', revision: 1, criterion });
  await seedCaseVersion(fixture, 1, 'released');
  await seedManifestEntry(fixture, { version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });
  await seedCaseVersion(fixture, 2, 'draft');
}

async function releaseHypothesisRevisionOwnState(fixture: IFixture, hypothesisName: string, revision: number): Promise<void> {
  await pool.query(
    "UPDATE hypothesis_revisions SET state = 'released' WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3",
    [fixture.slug, hypothesisName, revision],
  );
}

async function seedReleasedOwnStateReferencedHighestRevision(fixture: IFixture, criterion: string): Promise<void> {
  await seedHypothesisRevision(fixture, { hypothesisName: 'the-hypothesis', revision: 1, criterion });
  await releaseHypothesisRevisionOwnState(fixture, 'the-hypothesis', 1);
  await seedCaseVersion(fixture, 1, 'released');
  await seedManifestEntry(fixture, { version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });
  await seedCaseVersion(fixture, 2, 'draft');
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

it("reads back with its own state draft, the revision revise-hypothesis originates by inserting", async () => {
  const fixture = freshFixture();
  await persistCase(fixture);
  await persistGlossaryVocabulary(fixture);
  await registerConceptAccepting(fixture, fixture.subjectType);
  await seedDraftCaseVersion(fixture);
  const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

  const answered = await operation.reviseHypothesis(reviseInput(fixture));

  expect(answered).toEqual({ hypothesis_name: 'the-hypothesis', revision: 1 });
  const { rows } = await pool.query(
    'SELECT state FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3',
    [fixture.slug, 'the-hypothesis', 1],
  );
  expect(rows).toEqual([{ state: 'draft' }]);
});

it(
  "overwrites an already-named hypothesis's own highest revision in place, keeping its revision number " +
    'unchanged, when that revision is referenced by no case version in released state',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedDraftCaseVersion(fixture);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));
    const first = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the first revision text' }));
    expect(first.revision).toBe(1);

    const second = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the second revision text' }));

    expect(second).toEqual({ hypothesis_name: 'the-hypothesis', revision: 1 });
    const { rows } = await pool.query(
      'SELECT revision, criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 ORDER BY revision',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ revision: 1, criterion: 'the second revision text' }]);
  },
);

it(
  "creates the next revision rather than overwriting it, and leaves an already-released revision's own " +
    'state and content exactly as they were, when a further revise is attempted against it',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedDraftCaseVersion(fixture);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));
    const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the original text' }));
    expect(initial.revision).toBe(1);
    await releaseHypothesisRevisionOwnState(fixture, 'the-hypothesis', 1);

    const second = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the overwritten text' }));

    expect(second).toEqual({ hypothesis_name: 'the-hypothesis', revision: 2 });
    const { rows } = await pool.query(
      'SELECT state, criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3',
      [fixture.slug, 'the-hypothesis', 1],
    );
    expect(rows).toEqual([{ state: 'released', criterion: 'the original text' }]);
  },
);

it(
  'creates no revision at all — leaves the hypothesis holding only the revision it already had — when the ' +
    "highest existing revision's own state is released and no case version's manifest references it, other " +
    'than the one draft revision the create branch itself just wrote',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedDraftCaseVersion(fixture);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));
    const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the original text' }));
    await releaseHypothesisRevisionOwnState(fixture, 'the-hypothesis', initial.revision);

    await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the created text' }));

    const { rows } = await pool.query(
      'SELECT revision, criterion, state FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 ORDER BY revision',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([
      { revision: 1, criterion: 'the original text', state: 'released' },
      { revision: 2, criterion: 'the created text', state: 'draft' },
    ]);
  },
);

it(
  'leaves exactly the revision it held before three successive revises of an unreleased highest revision, ' +
    'reading the content of the most recent of them afterward',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedDraftCaseVersion(fixture);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));
    const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the original text' }));
    expect(initial.revision).toBe(1);

    const first = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the first successive revise text' }));
    const second = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the second successive revise text' }));
    const third = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the third successive revise text' }));

    expect([first.revision, second.revision, third.revision]).toEqual([1, 1, 1]);
    const { rows } = await pool.query(
      'SELECT revision, criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ revision: 1, criterion: 'the third successive revise text' }]);
  },
);

it(
  "replaces the highest existing revision's content in place, leaving its number unchanged, when that " +
    "revision's own state is draft even though a case version in released state references it",
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedReleasedReferencedHighestRevision(fixture, 'the released revision text');
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    const revised = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the next revision text' }));

    expect(revised).toEqual({ hypothesis_name: 'the-hypothesis', revision: 1 });
    const { rows } = await pool.query(
      'SELECT revision, criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ revision: 1, criterion: 'the next revision text' }]);
  },
);

it(
  "creates no second revision row at all when the highest existing revision's own state is draft, even " +
    'though a case version in released state references it',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedReleasedReferencedHighestRevision(fixture, 'the released revision text');
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the next revision text' }));

    const { rows } = await pool.query(
      'SELECT revision FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ revision: 1 }]);
  },
);

it(
  "leaves the released case version's manifest referencing the same revision number after a revise " +
    "replaces that revision's content in place — the manifest pins the revision number, not a copy of " +
    'its content',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedReleasedReferencedHighestRevision(fixture, 'the released revision text');
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the next revision text' }));

    const { rows } = await pool.query(
      'SELECT revision FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = 1 AND hypothesis_name = $2',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ revision: 1 }]);
  },
);

it(
  "rejects with the store's own typed ReleasedHypothesisRevisionNotAlterableError rather than silently " +
    "succeeding, when the read the write branch acted on had already gone stale — the revision's own " +
    'state was set to released for real between that read and the write it drove',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedReleasedReferencedHighestRevision(fixture, 'the released revision text');
    await releaseHypothesisRevisionOwnState(fixture, 'the-hypothesis', 1);
    const realStore = createCaseStore(pool);
    const staleReadStore = {
      findDraftVersion: realStore.findDraftVersion.bind(realStore),
      insertHypothesisRevision: realStore.insertHypothesisRevision.bind(realStore),
      overwriteHypothesisRevision: realStore.overwriteHypothesisRevision.bind(realStore),
      readHighestRevisionReleaseState: async () => ({ revision: 1, state: 'draft' }),
    } as unknown as ReviseHypothesisStore;
    const operation = new ReviseHypothesisOperation(staleReadStore, createGlossaryQuery(pool));

    const rejection = operation.reviseHypothesis(reviseInput(fixture, { criterion: 'an attempted overwrite text' }));

    await expect(rejection).rejects.toBeInstanceOf(ReleasedHypothesisRevisionNotAlterableError);
    const { rows } = await pool.query(
      'SELECT criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ criterion: 'the released revision text' }]);
  },
);

it(
  "leaves a draft manifest entry for the hypothesis referencing the same revision number it referenced " +
    "before a revise that replaced the highest revision's content in place",
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedDraftCaseVersion(fixture);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));
    const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the original text' }));
    expect(initial.revision).toBe(1);
    await seedManifestEntry(fixture, { version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

    await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the overwritten text' }));

    const { rows } = await pool.query(
      'SELECT revision FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = 1 AND hypothesis_name = $2',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ revision: 1 }]);
  },
);

it(
  'answers exactly hypothesis_name and revision — no field naming which branch ran — whether the revise ' +
    'replaced a revision in place or created the next one',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedDraftCaseVersion(fixture);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));
    const overwritten = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the first text' }));
    await releaseHypothesisRevisionOwnState(fixture, 'the-hypothesis', overwritten.revision);

    const created = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the second text' }));

    expect(Object.keys(overwritten).sort()).toEqual(['hypothesis_name', 'revision']);
    expect(Object.keys(created).sort()).toEqual(['hypothesis_name', 'revision']);
  },
);

it(
  "leaves a released case version's manifest referencing the same revision it referenced before a later " +
    "revise of the same hypothesis creates the next revision, when the referenced revision's own state " +
    'was already released',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedReleasedOwnStateReferencedHighestRevision(fixture, 'the released revision text');
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    const revised = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the next revision text' }));

    expect(revised).toEqual({ hypothesis_name: 'the-hypothesis', revision: 2 });
    const { rows } = await pool.query(
      'SELECT revision FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = 1 AND hypothesis_name = $2',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ revision: 1 }]);
  },
);

it(
  "leaves that already-referenced revision's own content reading exactly as it did before a later revise " +
    'of the same hypothesis creates the next revision',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedReleasedOwnStateReferencedHighestRevision(fixture, 'the released revision text');
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the next revision text' }));

    const { rows } = await pool.query(
      'SELECT criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ criterion: 'the released revision text' }]);
  },
);

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
  'leaves an already-existing revision of the hypothesis reading exactly as it did, refusing to alter it, ' +
    'when a later revise is refused for the case holding no draft version',
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedDraftCaseVersion(fixture);
    const store = createCaseStore(pool);
    const operation = new ReviseHypothesisOperation(store, createGlossaryQuery(pool));
    const initial = await operation.reviseHypothesis(reviseInput(fixture, { criterion: 'the original text' }));
    expect(initial.revision).toBe(1);
    await store.discard(fixture.slug, 1);

    const rejection = operation.reviseHypothesis(reviseInput(fixture, { criterion: 'an attempted overwrite text' }));

    await expect(rejection).rejects.toBeInstanceOf(CaseHoldsNoDraftError);
    const { rows } = await pool.query(
      'SELECT revision, criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ revision: 1, criterion: 'the original text' }]);
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
  "accepts a revise whose input.subject disagrees with the case's own draft version's declared " +
    "subject type, deciding the concept-acceptance check by the draft's own subject alone",
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.subjectType);
    await seedDraftCaseVersion(fixture);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    const answered = await operation.reviseHypothesis(reviseInput(fixture, { subject: fixture.otherSubjectType }));

    expect(answered).toEqual({ hypothesis_name: 'the-hypothesis', revision: 1 });
    const { rows } = await pool.query(
      'SELECT revision FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2',
      [fixture.slug, 'the-hypothesis'],
    );
    expect(rows).toEqual([{ revision: 1 }]);
  },
);

it(
  "refuses with ConceptRefusesSubjectTypeError naming the case's own draft version's declared " +
    "subject type — never the caller-supplied input.subject that disagrees with it — when the " +
    "collected concept refuses that draft's own subject even though it would accept input.subject",
  async () => {
    const fixture = freshFixture();
    await persistCase(fixture);
    await persistGlossaryVocabulary(fixture);
    await registerConceptAccepting(fixture, fixture.otherSubjectType);
    await seedDraftCaseVersion(fixture);
    const operation = new ReviseHypothesisOperation(createCaseStore(pool), createGlossaryQuery(pool));

    const rejection = operation.reviseHypothesis(reviseInput(fixture, { subject: fixture.otherSubjectType }));

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
