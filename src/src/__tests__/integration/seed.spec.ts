import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createCaseQuery } from '../../factories/case-query.factory.js';
import { createCaseStore } from '../../factories/case-store.factory.js';
import { NON_CONCLUSION_OUTCOMES } from '../../glossary/terms.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../persistence/database-connection.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../fixtures/', import.meta.url));
const SEED_MODULE_URL = new URL('../../seed.ts', import.meta.url).href;
const SLUG = 'intermittent-connection-outage';
const VERSION = 1;

interface ICaseFixtureDocument {
  readonly slug: string;
  readonly title: string;
  readonly when_to_use: string;
  readonly version: number;
  readonly authored_at: string;
  readonly subject: string;
  readonly consolidation_register?: string;
  readonly fallback: { readonly outcome: string; readonly referral: { readonly action: string; readonly recipient: string } };
  readonly manifest: ReadonlyArray<{
    readonly position: number;
    readonly hypothesis_name: string;
    readonly criterion: string;
    readonly collects: readonly string[];
    readonly resolution: { readonly outcome: string; readonly referral: { readonly action: string; readonly recipient: string } };
  }>;
}

interface IConceptFixture {
  readonly name: string;
  readonly accepts: readonly string[];
  readonly ttl: number;
}

interface ICapabilityFixture {
  readonly name: string;
  readonly version: string;
  readonly nature: string;
  readonly input_schema: string;
  readonly output_schema: string;
  readonly timeout: number;
  readonly connector: string;
  readonly concept: string;
}

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

async function readGlossaryFixtureNames(file: string): Promise<readonly string[]> {
  const raw = await readFile(join(FIXTURES_ROOT, 'glossary', file), 'utf8');
  const records = JSON.parse(raw) as ReadonlyArray<{ name: string }>;
  return records.map((record) => record.name);
}

async function readConceptFixture(): Promise<readonly IConceptFixture[]> {
  const raw = await readFile(join(FIXTURES_ROOT, 'glossary', 'concept.json'), 'utf8');
  return JSON.parse(raw) as readonly IConceptFixture[];
}

async function readCapabilityFixture(): Promise<readonly ICapabilityFixture[]> {
  const raw = await readFile(join(FIXTURES_ROOT, 'capability', 'capability.json'), 'utf8');
  return JSON.parse(raw) as readonly ICapabilityFixture[];
}

async function readCaseFixture(): Promise<ICaseFixtureDocument> {
  const raw = await readFile(join(FIXTURES_ROOT, 'case', SLUG, `${VERSION}.json`), 'utf8');
  return JSON.parse(raw) as ICaseFixtureDocument;
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

async function wipeFixtureOwnedRows(connection: DatabaseConnection): Promise<void> {
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revisions WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypotheses WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_versions WHERE slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM cases WHERE slug = $1', [SLUG]);
  for (const capability of await readCapabilityFixture()) {
    await deleteTolerantly(connection, 'DELETE FROM capabilities WHERE name = $1 AND version = $2', [capability.name, capability.version]);
  }
  for (const concept of await readConceptFixture()) {
    await deleteTolerantly(connection, 'DELETE FROM concept_accepts WHERE concept_name = $1', [concept.name]);
    await deleteTolerantly(connection, 'DELETE FROM concepts WHERE name = $1', [concept.name]);
  }
  await deleteTolerantly(connection, 'DELETE FROM subject_types WHERE name = ANY($1)', [await readGlossaryFixtureNames('subject-type.json')]);
  await deleteTolerantly(connection, 'DELETE FROM subject_attributes WHERE name = ANY($1)', [await readGlossaryFixtureNames('subject-attribute.json')]);

  for (const outcomeName of await readGlossaryFixtureNames('outcome.json')) {
    await deleteTolerantly(connection, 'DELETE FROM outcomes WHERE name = $1', [outcomeName]);
  }
  await deleteTolerantly(connection, 'DELETE FROM actions WHERE name = ANY($1)', [await readGlossaryFixtureNames('action.json')]);
  await deleteTolerantly(connection, 'DELETE FROM recipients WHERE name = ANY($1)', [await readGlossaryFixtureNames('recipient.json')]);
}

async function isPermanentlyReferencedByAReleasedCaseVersion(connection: DatabaseConnection, outcomeName: string): Promise<boolean> {
  const { rows } = await connection.query(
    `SELECT 1
       FROM case_versions cv
      WHERE cv.fallback_outcome = $1 AND cv.state = 'released'
      UNION
     SELECT 1
       FROM hypothesis_revisions hr
       JOIN case_version_hypotheses cvh
         ON cvh.case_slug = hr.case_slug AND cvh.hypothesis_name = hr.hypothesis_name AND cvh.revision = hr.revision
       JOIN case_versions cv2
         ON cv2.slug = cvh.case_slug AND cv2.version = cvh.case_version
      WHERE hr.resolution_outcome = $1 AND cv2.state = 'released'
      LIMIT 1`,
    [outcomeName],
  );
  return rows.length > 0;
}

async function assertGenuinelyEmpty(connection: DatabaseConnection): Promise<void> {
  const storedCase = await createCaseStore(connection).assembleVersion(SLUG, VERSION);
  if (storedCase !== undefined && storedCase.state !== 'released') {
    throw new Error("this file's own wipe left the fixture case stored; the transition this file proves would not be genuine");
  }
  const nonConclusionNames = NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name);
  const { rows } = await connection.query<{ name: string }>('SELECT name FROM outcomes WHERE name = ANY($1)', [nonConclusionNames]);
  for (const row of rows) {
    if (!(await isPermanentlyReferencedByAReleasedCaseVersion(connection, row.name))) {
      throw new Error("this file's own wipe left a non-conclusion outcome stored; the transition this file proves would not be genuine");
    }
  }
}

async function cleanupSeededRows(connection: DatabaseConnection): Promise<void> {
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revision_collects WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_version_hypotheses WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypothesis_revisions WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM hypotheses WHERE case_slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM case_versions WHERE slug = $1', [SLUG]);
  await deleteTolerantly(connection, 'DELETE FROM cases WHERE slug = $1', [SLUG]);
  for (const capability of await readCapabilityFixture()) {
    await deleteTolerantly(connection, 'DELETE FROM capabilities WHERE name = $1 AND version = $2', [capability.name, capability.version]);
  }
  for (const concept of await readConceptFixture()) {
    await deleteTolerantly(connection, 'DELETE FROM concept_accepts WHERE concept_name = $1', [concept.name]);
    await deleteTolerantly(connection, 'DELETE FROM concepts WHERE name = $1', [concept.name]);
  }
  await deleteTolerantly(connection, 'DELETE FROM subject_types WHERE name = ANY($1)', [await readGlossaryFixtureNames('subject-type.json')]);
  await deleteTolerantly(connection, 'DELETE FROM subject_attributes WHERE name = ANY($1)', [await readGlossaryFixtureNames('subject-attribute.json')]);
  const nonConclusionNames = new Set(NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name));
  const fixtureOwnedOutcomes = (await readGlossaryFixtureNames('outcome.json')).filter((name) => !nonConclusionNames.has(name));
  await deleteTolerantly(connection, 'DELETE FROM outcomes WHERE name = ANY($1)', [fixtureOwnedOutcomes]);
  await deleteTolerantly(connection, 'DELETE FROM actions WHERE name = ANY($1)', [await readGlossaryFixtureNames('action.json')]);
  await deleteTolerantly(connection, 'DELETE FROM recipients WHERE name = ANY($1)', [await readGlossaryFixtureNames('recipient.json')]);
}

const PLACEHOLDER_ENV: Readonly<Record<string, string>> = {
  OBSERVATIONS_FIXTURE_FILE: join(FIXTURES_ROOT, 'observations.json'),
  EVALUATOR_MODEL: 'a-test-evaluator-model',
  CONSOLIDATOR_MODEL: 'a-test-consolidator-model',
  CONSOLIDATOR_MAX_TOKENS: '256',
  POOL_SIZE: '2',
  DEFAULT_CONSOLIDATION_REGISTER: 'plain',
  PROMPT_VERSION: 'prompt-v1',
  PAGINATION_DEFAULT_LIMIT: '20',
  PAGINATION_MAX_LIMIT: '100',
};

const savedEnv = new Map<string, string | undefined>();

function installPlaceholderEnv(): void {
  for (const [key, value] of Object.entries(PLACEHOLDER_ENV)) {
    savedEnv.set(key, process.env[key]);
    process.env[key] = value;
  }
}

function restoreEnv(): void {
  for (const [key, original] of savedEnv) {
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
}

async function runSeedScript(runId: number): Promise<void> {
  await import(/* @vite-ignore */ `${SEED_MODULE_URL}?run=${runId}`);
}

let connection: DatabaseConnection;

beforeAll(async () => {
  connection = createDatabaseConnection(requireDatabaseUrl());
  installPlaceholderEnv();
  await wipeFixtureOwnedRows(connection);
  await assertGenuinelyEmpty(connection);
  await runSeedScript(1);
}, 60000);

afterAll(async () => {
  await cleanupSeededRows(connection);
  restoreEnv();
  await connection.end();
}, 60000);

it(
  'holds both non-conclusion outcomes, having run against a database this file had itself confirmed lacked them beforehand',
  async () => {
    const nonConclusionNames = NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name);
    const { rows } = await connection.query<{ name: string }>('SELECT name FROM outcomes WHERE name = ANY($1)', [nonConclusionNames]);

    expect(rows.map((row) => row.name).sort()).toEqual([...nonConclusionNames].sort());
  },
);

it("holds exactly the fixture's own outcome names, the case-specific ones and the two non-conclusion ones together", async () => {
  const expected = await readGlossaryFixtureNames('outcome.json');
  const { rows } = await connection.query<{ name: string }>('SELECT name FROM outcomes WHERE name = ANY($1)', [expected]);

  expect(rows.map((row) => row.name).sort()).toEqual([...expected].sort());
});

it('holds exactly the fixture\'s own subject-type name, the one the curated case declares as its subject', async () => {
  const expected = await readGlossaryFixtureNames('subject-type.json');
  const { rows } = await connection.query<{ name: string }>('SELECT name FROM subject_types WHERE name = ANY($1)', [expected]);

  expect(rows.map((row) => row.name).sort()).toEqual([...expected].sort());
});

it("holds exactly the fixture's own subject-attribute name, even though the curated case document names no subject attribute of its own", async () => {
  const expected = await readGlossaryFixtureNames('subject-attribute.json');
  expect(expected.length).toBeGreaterThan(0);
  const { rows } = await connection.query<{ name: string }>('SELECT name FROM subject_attributes');

  expect(rows.map((row) => row.name).sort()).toEqual([...expected].sort());
});

it("holds exactly the fixture's own action names, every one the curated case's hypotheses and fallback declare", async () => {
  const expected = await readGlossaryFixtureNames('action.json');
  const { rows } = await connection.query<{ name: string }>('SELECT name FROM actions WHERE name = ANY($1)', [expected]);

  expect(rows.map((row) => row.name).sort()).toEqual([...expected].sort());
});

it("holds exactly the fixture's own recipient names, every one the curated case's hypotheses and fallback declare", async () => {
  const expected = await readGlossaryFixtureNames('recipient.json');
  const { rows } = await connection.query<{ name: string }>('SELECT name FROM recipients WHERE name = ANY($1)', [expected]);

  expect(rows.map((row) => row.name).sort()).toEqual([...expected].sort());
});

it('holds every concept the curated case collects, each with the subject types it accepts and its ttl, matching the fixture exactly', async () => {
  const expected = await readConceptFixture();
  const conceptNames = expected.map((concept) => concept.name);
  const { rows: conceptRows } = await connection.query<{ name: string; ttl: number }>(
    'SELECT name, ttl FROM concepts WHERE name = ANY($1)',
    [conceptNames],
  );
  const { rows: acceptRows } = await connection.query<{ concept_name: string; subject_type_name: string }>(
    'SELECT concept_name, subject_type_name FROM concept_accepts WHERE concept_name = ANY($1)',
    [conceptNames],
  );

  const answered = conceptRows
    .map((row) => ({
      name: row.name,
      ttl: row.ttl,
      accepts: acceptRows.filter((accept) => accept.concept_name === row.name).map((accept) => accept.subject_type_name).sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const expectedSorted = expected
    .map((concept) => ({ name: concept.name, ttl: concept.ttl, accepts: [...concept.accepts].sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));

  expect(answered).toEqual(expectedSorted);
});

it(
  'registers one read-only capability, with every attribute the fixture declares, for each of the two concepts the curated case collects',
  async () => {
    const expected = await readCapabilityFixture();
    const { rows } = await connection.query<ICapabilityFixture>(
      'SELECT name, version, nature, input_schema, output_schema, timeout, connector, concept FROM capabilities WHERE concept = ANY($1)',
      [expected.map((capability) => capability.concept)],
    );

    expect(rows).toHaveLength(expected.length);
    for (const capability of expected) {
      const stored = rows.find((row) => row.concept === capability.concept);
      expect(stored, `no capability registered for concept "${capability.concept}"`).toBeDefined();
      expect(stored).toEqual(capability);
    }
  },
);

it('the case is stored, once seed.ts has run against a database this file had confirmed lacked it beforehand', async () => {
  const stored = await createCaseStore(connection).assembleVersion(SLUG, VERSION);

  expect(stored).toBeDefined();
});

it(
  "reads the seeded version back whole, matching every field the fixture document itself declares — not only the case's root and its hypotheses' names",
  async () => {
    const fixture = await readCaseFixture();
    const query = createCaseQuery(connection);

    const result = await query.readCase(SLUG, VERSION);

    expect(result.case.slug).toBe(fixture.slug);
    expect(result.case.title).toBe(fixture.title);
    expect(result.case.when_to_use).toBe(fixture.when_to_use);
    expect(result.case.version).toBe(fixture.version);
    expect(result.case.authored_at).toBe(fixture.authored_at);
    expect(result.case.subject).toBe(fixture.subject);
    expect(result.case.consolidation_register).toBe(fixture.consolidation_register);
    expect(result.case.fallback).toEqual(fixture.fallback);

    expect(result.case.hypotheses).toEqual(
      fixture.manifest.map((entry) => ({
        name: entry.hypothesis_name,
        criterion: entry.criterion,
        collects: entry.collects,
        resolution: entry.resolution,
      })),
    );
  },
);

it('resolves without rejecting when seed.ts is run a second time against a database it has already seeded', async () => {
  await expect(runSeedScript(2)).resolves.toBeUndefined();
});

it('holds no second case version, having run seed.ts a second time in a row against the version it already released', async () => {
  const secondVersion = await createCaseStore(connection).assembleVersion(SLUG, VERSION + 1);

  expect(secondVersion).toBeUndefined();
});

it(
  "leaves every hypothesis-revision the released version's manifest references with its own state released, once seed.ts has run",
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
    expect(rows.every((row) => row.state === 'released')).toBe(true);
  },
);
