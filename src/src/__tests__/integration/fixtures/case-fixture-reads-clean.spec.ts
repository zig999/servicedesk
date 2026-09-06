import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { HypothesisRevisionNotDraftAtReleaseError } from '../../../errors/hypothesis-revision-not-draft-at-release.error.js';
import { createCaseLifecycle, type CaseLifecycleOperations } from '../../../factories/case-lifecycle.factory.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { NON_CONCLUSION_OUTCOMES } from '../../../glossary/terms.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const SLUG = 'intermittent-connection-outage';
const VERSION = 1;
const RELEASED_REVISION_STATE = 'released';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

async function readTermNames(file: string): Promise<readonly string[]> {
  const raw = await readFile(join(FIXTURES_ROOT, 'glossary', file), 'utf8');
  const records = JSON.parse(raw) as ReadonlyArray<{ name: string }>;
  return records.map((record) => record.name);
}

async function insertTerms(connection: DatabaseConnection, table: string, names: readonly string[]): Promise<void> {
  for (const name of names) {
    await connection.query(`INSERT INTO ${table} (name) VALUES ($1) ON CONFLICT DO NOTHING`, [name]);
  }
}

async function insertConcepts(connection: DatabaseConnection): Promise<void> {
  const raw = await readFile(join(FIXTURES_ROOT, 'glossary', 'concept.json'), 'utf8');
  const concepts = JSON.parse(raw) as ReadonlyArray<{ name: string; accepts: readonly string[]; ttl: number }>;
  for (const concept of concepts) {
    await connection.query('INSERT INTO concepts (name, ttl) VALUES ($1, $2) ON CONFLICT DO NOTHING', [concept.name, concept.ttl]);
    for (const subjectType of concept.accepts) {
      await connection.query(
        'INSERT INTO concept_accepts (concept_name, subject_type_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [concept.name, subjectType],
      );
    }
  }
}

async function insertCapabilities(connection: DatabaseConnection): Promise<void> {
  const raw = await readFile(join(FIXTURES_ROOT, 'capability', 'capability.json'), 'utf8');
  const capabilities = JSON.parse(raw) as ReadonlyArray<Record<string, unknown>>;
  for (const capability of capabilities) {
    await connection.query(
      `INSERT INTO capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
      [capability.name, capability.version, capability.nature, capability.input_schema, capability.output_schema, capability.timeout, capability.connector, capability.concept],
    );
  }
}

type CaseFixtureManifestEntry = {
  readonly position: number;
  readonly hypothesis_name: string;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: { readonly outcome: string; readonly referral: { readonly action: string; readonly recipient: string } };
};

type CaseFixtureDocument = {
  readonly slug: string;
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: string;
  readonly subject: string;
  readonly consolidation_register?: 'formal' | 'plain';
  readonly fallback: { readonly outcome: string; readonly referral: { readonly action: string; readonly recipient: string } };
  readonly manifest: readonly CaseFixtureManifestEntry[];
};

type PlacedRevision = {
  readonly hypothesis_name: string;
  readonly revision: number;
};

async function placeFixtureHypotheses(
  lifecycle: CaseLifecycleOperations,
  fixture: CaseFixtureDocument,
  version: number,
): Promise<readonly PlacedRevision[]> {
  const placed: PlacedRevision[] = [];
  for (const entry of fixture.manifest) {
    const revised = await lifecycle.reviseHypothesis({
      slug: fixture.slug,
      hypothesis_name: entry.hypothesis_name,
      criterion: entry.criterion,
      collects: entry.collects,
      resolution: entry.resolution,
      subject: fixture.subject,
    });
    await lifecycle.placeHypothesis({
      slug: fixture.slug,
      version,
      hypothesis_name: revised.hypothesis_name,
      revision: revised.revision,
      position: entry.position,
    });
    placed.push({ hypothesis_name: revised.hypothesis_name, revision: revised.revision });
  }
  return placed;
}

async function releaseManifestedRevisions(
  lifecycle: CaseLifecycleOperations,
  slug: string,
  revisions: readonly PlacedRevision[],
): Promise<void> {
  for (const revision of revisions) {
    await lifecycle.releaseHypothesisRevision(slug, revision.hypothesis_name, revision.revision);
  }
}

async function insertFixtureCase(connection: DatabaseConnection): Promise<void> {
  const store = createCaseStore(connection);
  const alreadyStored = await store.assembleVersion(SLUG, VERSION);
  if (alreadyStored !== undefined) {
    return;
  }
  const raw = await readFile(join(FIXTURES_ROOT, 'case', SLUG, `${VERSION}.json`), 'utf8');
  const fixture = JSON.parse(raw) as CaseFixtureDocument;
  const lifecycle = createCaseLifecycle(connection);
  const draft = await lifecycle.createDraft({
    slug: fixture.slug,
    title: fixture.title,
    when_to_use: fixture.when_to_use,
    authored_at: fixture.authored_at,
    subject: fixture.subject,
    fallback: fixture.fallback,
    consolidation_register: fixture.consolidation_register,
  });
  const placed = await placeFixtureHypotheses(lifecycle, fixture, draft.version);
  await releaseManifestedRevisions(lifecycle, fixture.slug, placed);
  await lifecycle.release(fixture.slug, draft.version);
}

async function ensureFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  await insertTerms(connection, 'subject_types', await readTermNames('subject-type.json'));
  await insertTerms(connection, 'subject_attributes', await readTermNames('subject-attribute.json'));
  await insertTerms(connection, 'outcomes', await readTermNames('outcome.json'));
  await insertTerms(connection, 'actions', await readTermNames('action.json'));
  await insertTerms(connection, 'recipients', await readTermNames('recipient.json'));
  await insertConcepts(connection);
  await insertCapabilities(connection);
  await insertFixtureCase(connection);
}

const FOREIGN_KEY_VIOLATION = '23503';

function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

async function deleteTolerantly(connection: DatabaseConnection, text: string, params: readonly unknown[]): Promise<void> {
  try {
    await connection.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

async function cleanupFixtureSeeded(connection: DatabaseConnection): Promise<void> {

  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revisions WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypotheses WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_versions WHERE slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM cases WHERE slug = $1', [SLUG]);
  const capabilities = JSON.parse(await readFile(join(FIXTURES_ROOT, 'capability', 'capability.json'), 'utf8')) as ReadonlyArray<{ name: string; version: string }>;
  for (const capability of capabilities) {
    await deleteTolerantly(connection, 'DELETE FROM capabilities WHERE name = $1 AND version = $2', [capability.name, capability.version]);
  }
  const concepts = JSON.parse(await readFile(join(FIXTURES_ROOT, 'glossary', 'concept.json'), 'utf8')) as ReadonlyArray<{ name: string }>;
  for (const concept of concepts) {
    await deleteTolerantly(connection, 'DELETE FROM concept_accepts WHERE concept_name = $1', [concept.name]);
    await deleteTolerantly(connection, 'DELETE FROM concepts WHERE name = $1', [concept.name]);
  }
  await deleteTolerantly(connection, 'DELETE FROM subject_types WHERE name = ANY($1)', [await readTermNames('subject-type.json')]);
  await deleteTolerantly(connection, 'DELETE FROM subject_attributes WHERE name = ANY($1)', [await readTermNames('subject-attribute.json')]);

  const nonConclusionNames = new Set(NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name));
  const fixtureOwnedOutcomes = (await readTermNames('outcome.json')).filter((name) => !nonConclusionNames.has(name));
  await deleteTolerantly(connection, 'DELETE FROM outcomes WHERE name = ANY($1)', [fixtureOwnedOutcomes]);
  await deleteTolerantly(connection, 'DELETE FROM actions WHERE name = ANY($1)', [await readTermNames('action.json')]);
  await deleteTolerantly(connection, 'DELETE FROM recipients WHERE name = ANY($1)', [await readTermNames('recipient.json')]);
}

let connection: DatabaseConnection;

beforeAll(async () => {
  connection = createDatabaseConnection(requireDatabaseUrl());
  await ensureFixtureSeeded(connection);
});

afterAll(async () => {
  await cleanupFixtureSeeded(connection);
  await connection.end();
}, 30000);

it(
  "reads the fixture case whole, with no coherence violation, through the real case-query wiring over " +
    "the fixture's own glossary and capability data",
  async () => {
    const query = createCaseQuery(connection);

    const result = await query.readCase(SLUG, VERSION);

    expect(result.case.slug).toBe(SLUG);
    expect(result.case.hypotheses.length).toBeGreaterThanOrEqual(1);
  },
);

it(
  "reads back every hypothesis-revision the released case version's manifest references with its own state released",
  async () => {
    const { rows } = await connection.query<{ state: string }>(
      `SELECT hr.state
         FROM hypothesis_revisions hr
         JOIN case_version_hypotheses cvh
           ON cvh.case_slug = hr.case_slug AND cvh.hypothesis_name = hr.hypothesis_name AND cvh.revision = hr.revision
         JOIN case_versions cv
           ON cv.slug = cvh.case_slug AND cv.version = cvh.case_version
        WHERE cv.slug = $1 AND cv.version = $2 AND cv.state = 'released'`,
      [SLUG, VERSION],
    );

    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows.every((row) => row.state === RELEASED_REVISION_STATE)).toBe(true);
  },
);

it(
  "reads every manifest entry's revision back collecting at least one concept",
  async () => {
    const query = createCaseQuery(connection);

    const result = await query.readCase(SLUG, VERSION);

    expect(result.case.hypotheses.length).toBeGreaterThanOrEqual(1);
    expect(result.case.hypotheses.every((hypothesis) => hypothesis.collects.length >= 1)).toBe(true);
  },
);

type OwnedRevisionOptions = {
  readonly slug: string;
  readonly hypothesisName: string;
  readonly concept: string;
};

type OwnedReleasedRevision = {
  readonly version: number;
  readonly hypothesisName: string;
  readonly revision: number;
};

async function releaseOwnedHypothesisRevision(
  lifecycle: CaseLifecycleOperations,
  options: OwnedRevisionOptions,
): Promise<OwnedReleasedRevision> {
  const draft = await lifecycle.createDraft({
    slug: options.slug,
    title: "A case owned exclusively by one of this file's own dedicated proof tests",
    when_to_use: "Exercised only by a dedicated instance this file's own proof tests build.",
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'contract',
    fallback: {
      outcome: 'inconclusive-hypotheses-exhausted',
      referral: { action: 'escalate-to-specialist', recipient: 'tier-two-support-queue' },
    },
  });
  const revised = await lifecycle.reviseHypothesis({
    slug: options.slug,
    hypothesis_name: options.hypothesisName,
    criterion: 'A representative criterion exercised only by this proof.',
    collects: [options.concept],
    resolution: {
      outcome: 'issue-equipment-fault',
      referral: { action: 'schedule-technician-visit', recipient: 'field-service-queue' },
    },
    subject: 'contract',
  });
  await lifecycle.releaseHypothesisRevision(options.slug, revised.hypothesis_name, revised.revision);
  return { version: draft.version, hypothesisName: revised.hypothesis_name, revision: revised.revision };
}

async function releaseOwnedCaseVersionAfterItsRevision(
  lifecycle: CaseLifecycleOperations,
  options: OwnedRevisionOptions,
): Promise<void> {
  const released = await releaseOwnedHypothesisRevision(lifecycle, options);
  await lifecycle.placeHypothesis({
    slug: options.slug,
    version: released.version,
    hypothesis_name: released.hypothesisName,
    revision: released.revision,
    position: 1,
  });
  await lifecycle.release(options.slug, released.version);
}

async function cleanupOwnedInstance(connection: DatabaseConnection, slug: string): Promise<void> {
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [slug]);
  await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE case_slug = $1', [slug]);
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revisions WHERE case_slug = $1', [slug]);
  await deleteTolerantly(connection, 'DELETE FROM hypotheses WHERE case_slug = $1', [slug]);
  await deleteTolerantly(connection, 'DELETE FROM case_versions WHERE slug = $1', [slug]);
  await deleteTolerantly(connection, 'DELETE FROM cases WHERE slug = $1', [slug]);
}

it(
  "leaves a released hypothesis-revision's own collects in place after an ordinary DELETE against those exact rows is attempted, exercised against a case this test owns exclusively rather than the shared canonical fixture every other file also reads",
  async () => {
    const lifecycle = createCaseLifecycle(connection);
    const ownedSlug = `${SLUG}-collects-delete-proof-${randomUUID()}`;
    const hypothesisName = 'a-hypothesis-owned-by-this-test-alone';
    const collectedConcept = 'equipment-status';

    try {
      await releaseOwnedHypothesisRevision(lifecycle, { slug: ownedSlug, hypothesisName, concept: collectedConcept });

      await connection.query(
        'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2',
        [ownedSlug, hypothesisName],
      );

      const { rows } = await connection.query<{ concept_name: string }>(
        'SELECT concept_name FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2',
        [ownedSlug, hypothesisName],
      );
      expect(rows.map((row) => row.concept_name)).toEqual([collectedConcept]);
    } finally {
      await cleanupOwnedInstance(connection, ownedSlug);
    }
  },
);

it(
  "releases a freshly drafted case version without throwing CaseVersionNotReleasableError, once its own " +
    'manifested hypothesis-revision has already been released through the lifecycle operation',
  async () => {
    const lifecycle = createCaseLifecycle(connection);
    const ownedSlug = `${SLUG}-release-ordering-proof-${randomUUID()}`;
    const hypothesisName = 'a-hypothesis-owned-by-the-release-ordering-proof';

    try {
      await expect(
        releaseOwnedCaseVersionAfterItsRevision(lifecycle, {
          slug: ownedSlug,
          hypothesisName,
          concept: 'equipment-status',
        }),
      ).resolves.toBeUndefined();
    } finally {
      await cleanupOwnedInstance(connection, ownedSlug);
    }
  },
);

it(
  "refuses releasing an already-released manifested hypothesis-revision a second time with " +
    "HypothesisRevisionNotDraftAtReleaseError, the exact refusal an unconditional release over every " +
    "manifested revision on a second seeding run would meet without this file's own idempotency guard",
  async () => {
    const lifecycle = createCaseLifecycle(connection);
    const ownedSlug = `${SLUG}-second-invocation-proof-${randomUUID()}`;
    const hypothesisName = 'a-hypothesis-owned-by-the-second-invocation-proof';

    try {
      const released = await releaseOwnedHypothesisRevision(lifecycle, {
        slug: ownedSlug,
        hypothesisName,
        concept: 'equipment-status',
      });

      const refusal = await lifecycle
        .releaseHypothesisRevision(ownedSlug, released.hypothesisName, released.revision)
        .catch((error: unknown) => error);

      expect(refusal).toBeInstanceOf(HypothesisRevisionNotDraftAtReleaseError);
    } finally {
      await cleanupOwnedInstance(connection, ownedSlug);
    }
  },
);

it(
  "reads the shared canonical fixture case whole with no CaseVersionNotValidError, and with every hypothesis still " +
    "collecting at least one concept, once this file's own collects-survive-DELETE test has already run",
  async () => {
    const query = createCaseQuery(connection);

    const result = await query.readCase(SLUG, VERSION);

    expect(result.case.hypotheses.length).toBeGreaterThanOrEqual(1);
    expect(result.case.hypotheses.every((hypothesis) => hypothesis.collects.length >= 1)).toBe(true);
  },
);
