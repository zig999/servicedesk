// Proof that the fixture case validates without a coherence violation when read through the
// knowledge context's own case-reading path, composed exactly as production wires it — the real
// relational case, glossary and capability-registry stores, never a fake port — over the fixture's
// own glossary and capability data, against a real, externally provisioned PostgreSQL database
// (constraints/the-database-is-externally-provisioned, contracts/knowledge/case-query,
// contracts/system/case-authoring, task/case-fixture/author-diagnose-fixture-case). The fixture's
// own committed case, glossary and capability data is seeded into the real tables once, so this
// proof reads the fixture's own committed bytes without ever writing back into the files that
// hold them — including through the glossary service's own non-conclusion-outcome top-up, which
// the fixture's own outcome.json already declares both of, so nothing here ever needs to top
// anything up — and every row this file seeds is removed again in its own afterAll, so a sibling
// integration file that wipes a glossary table wholesale (relational-glossary-store.repository.spec.ts's
// own wipeGlossaryTables()) never meets a foreign key this file's own rows still hold open.
//
// Sibling fix, disclosed in this task's own proof record: this file used to seed three fresh temp
// directories per test, copy the fixture's own committed directories into them and pass those
// directories to createCaseQuery; createCaseQuery now takes the one shared DatabaseConnection this
// task's own cutover wires everywhere (task/service-on-the-database/store-wiring), so this file
// seeds the fixture's own case, glossary and capability data into the real tables once instead,
// and removes every row it seeded once its own tests are done.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file has no use for.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, it } from 'vitest';
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
    await connection.query('INSERT INTO public.concepts (name, ttl) VALUES ($1, $2) ON CONFLICT DO NOTHING', [concept.name, concept.ttl]);
    for (const subjectType of concept.accepts) {
      await connection.query(
        'INSERT INTO public.concept_accepts (concept_name, subject_type_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
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
      `INSERT INTO public.capabilities (name, version, nature, input_schema, output_schema, timeout, connector, concept)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING`,
      [capability.name, capability.version, capability.nature, capability.input_schema, capability.output_schema, capability.timeout, capability.connector, capability.concept],
    );
  }
}

/** Writes the fixture case's own committed document through the real store exactly once — writeVersion refuses a second write under the same slug and version, so this checks it is not already stored first. */
async function insertFixtureCase(connection: DatabaseConnection): Promise<void> {
  const store = createCaseStore(connection);
  const alreadyStored = await store.readVersion(SLUG, VERSION);
  if (alreadyStored !== undefined) {
    return;
  }
  const raw = await readFile(join(FIXTURES_ROOT, 'case', SLUG, `${VERSION}.json`), 'utf8');
  await store.writeVersion(SLUG, VERSION, JSON.parse(raw));
}

/** Inserts every row the committed fixture's own case, glossary and capability data need, each guarded by ON CONFLICT DO NOTHING so a row already present (seeded by this same file's own earlier run, or left behind by a crash) never fails or duplicates. */
async function ensureFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  await insertTerms(connection, 'public.subject_types', await readTermNames('subject-type.json'));
  await insertTerms(connection, 'public.subject_attributes', await readTermNames('subject-attribute.json'));
  await insertTerms(connection, 'public.outcomes', await readTermNames('outcome.json'));
  await insertTerms(connection, 'public.actions', await readTermNames('action.json'));
  await insertTerms(connection, 'public.recipients', await readTermNames('recipient.json'));
  await insertConcepts(connection);
  await insertCapabilities(connection);
  await insertFixtureCase(connection);
}

/** Removes every row this file's own beforeAll seeded, in an order that always satisfies their own foreign keys — so this file leaves the glossary and capability tables exactly as it found them, and a sibling suite that owns one of those tables wholesale (relational-glossary-store.repository.spec.ts) never meets a row this file left behind. */
async function cleanupFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  await connection.query('DELETE FROM public.hypothesis_collects WHERE case_slug = $1', [SLUG]);
  await connection.query('DELETE FROM public.hypotheses WHERE case_slug = $1', [SLUG]);
  await connection.query('DELETE FROM public.case_versions WHERE slug = $1', [SLUG]);
  await connection.query('DELETE FROM public.cases WHERE slug = $1', [SLUG]);
  const capabilities = JSON.parse(await readFile(join(FIXTURES_ROOT, 'capability', 'capability.json'), 'utf8')) as ReadonlyArray<{ name: string; version: string }>;
  for (const capability of capabilities) {
    await connection.query('DELETE FROM public.capabilities WHERE name = $1 AND version = $2', [capability.name, capability.version]);
  }
  const concepts = JSON.parse(await readFile(join(FIXTURES_ROOT, 'glossary', 'concept.json'), 'utf8')) as ReadonlyArray<{ name: string }>;
  for (const concept of concepts) {
    await connection.query('DELETE FROM public.concept_accepts WHERE concept_name = $1', [concept.name]);
    await connection.query('DELETE FROM public.concepts WHERE name = $1', [concept.name]);
  }
  await connection.query('DELETE FROM public.subject_types WHERE name = ANY($1)', [await readTermNames('subject-type.json')]);
  await connection.query('DELETE FROM public.subject_attributes WHERE name = ANY($1)', [await readTermNames('subject-attribute.json')]);
  // The fixture's own outcome.json happens to list both non-conclusion outcomes among its own
  // terms; excluded here rather than deleted, since they are the glossary's own suite-wide seed
  // (vitest-global-setup.ts), never this fixture's own to remove — deleting them mid-suite races
  // GlossaryService.withNonConclusionOutcomes' own top-up against any other file's currently-live
  // hypothesis row (task/service-on-the-database/store-wiring, disclosed in that task's own delivery).
  const nonConclusionNames = new Set(NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name));
  const fixtureOwnedOutcomes = (await readTermNames('outcome.json')).filter((name) => !nonConclusionNames.has(name));
  await connection.query('DELETE FROM public.outcomes WHERE name = ANY($1)', [fixtureOwnedOutcomes]);
  await connection.query('DELETE FROM public.actions WHERE name = ANY($1)', [await readTermNames('action.json')]);
  await connection.query('DELETE FROM public.recipients WHERE name = ANY($1)', [await readTermNames('recipient.json')]);
}

let connection: DatabaseConnection;

beforeAll(async () => {
  connection = createDatabaseConnection(requireDatabaseUrl());
  await ensureFixtureSeeded(connection);
});

afterAll(async () => {
  await cleanupFixtureSeeded(connection);
  await connection.end();
});

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
