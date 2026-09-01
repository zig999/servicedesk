import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createCaseLifecycle, type CaseLifecycleOperations } from '../../../factories/case-lifecycle.factory.js';
import { createCaseQuery } from '../../../factories/case-query.factory.js';
import { createCaseStore } from '../../../factories/case-store.factory.js';
import { NON_CONCLUSION_OUTCOMES } from '../../../glossary/terms.js';
import { createDatabaseConnection, type DatabaseConnection } from '../../../persistence/database-connection.js';

const FIXTURES_ROOT = fileURLToPath(new URL('../../../fixtures/', import.meta.url));
const SLUG = 'intermittent-connection-outage';
const VERSION = 1;

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

async function placeFixtureHypotheses(
  lifecycle: CaseLifecycleOperations,
  fixture: CaseFixtureDocument,
  version: number,
): Promise<void> {
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
  await placeFixtureHypotheses(lifecycle, fixture, draft.version);
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
