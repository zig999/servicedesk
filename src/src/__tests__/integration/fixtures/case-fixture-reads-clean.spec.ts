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

/** One manifest entry exactly as the committed fixture document declares it — its own declared position and hypothesis name alongside the content revise-hypothesis needs, the same flat shape seed.ts's own CaseFixtureManifestEntry reads (task/case-lifecycle-operations/wire-and-retire-author-case-version). */
type CaseFixtureManifestEntry = {
  readonly position: number;
  readonly hypothesis_name: string;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: { readonly outcome: string; readonly referral: { readonly action: string; readonly recipient: string } };
};

/** The committed fixture case document's own whole shape, read exactly as committed — mirrors seed.ts's own CaseFixture. */
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

/**
 * Revises then places every fixture-declared hypothesis at its own fixture-declared position, in
 * the fixture's own declared order — the per-hypothesis half of insertFixtureCase's own sequence
 * below, pulled out into its own function only so that insertFixtureCase's own body stays inside
 * the standard's max-lines-per-function rule; the sequence and behavior are exactly what
 * insertFixtureCase's own loop ran before this split (this delivery's own inference — the
 * extraction changes nothing but where the lines are counted), the same split seed.ts's own
 * seedCase already made into placeFixtureHypotheses.
 */
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

/**
 * Writes the fixture case's own committed document through the six published case-lifecycle
 * operations — createDraft, then revise-and-place every declared hypothesis at its own declared
 * position (placeFixtureHypotheses above), then release — exactly the sequence seed.ts itself runs
 * (task/case-lifecycle-operations/wire-and-retire-author-case-version), rather than through the
 * store directly, which no longer takes a whole document. assembleVersion answers undefined for an
 * unstored version, so this checks the case is not already stored first, the same idempotency guard
 * seed.ts's own alreadySeeded() keeps.
 */
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

/** Inserts every row the committed fixture's own case, glossary and capability data need, each guarded by ON CONFLICT DO NOTHING so a row already present (seeded by this same file's own earlier run, or left behind by a crash) never fails or duplicates. */
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

/** Removes every row this file's own beforeAll seeded, in an order that always satisfies their own foreign keys — so this file leaves the glossary and capability tables exactly as it found them, and a sibling suite that owns one of those tables wholesale (relational-glossary-store.repository.spec.ts) never meets a row this file left behind. */
const FOREIGN_KEY_VIOLATION = '23503';

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard create-draft.operation.spec.ts's own isForeignKeyViolation already establishes for this codebase). */
function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

/** Runs one cleanup DELETE, tolerating a foreign-key violation — this fixture releases the seeded version for real, so migrations/0009's own release-conditioned rules make that row (and whatever it still references) permanent; the same tolerance create-draft.operation.spec.ts's own deleteTolerantly already establishes for this migration's consequence. */
async function deleteTolerantly(connection: DatabaseConnection, text: string, params: readonly unknown[]): Promise<void> {
  try {
    await connection.query(text, params);
  } catch (error) {
    if (!isForeignKeyViolation(error)) throw error;
  }
}

async function cleanupFixtureSeeded(connection: DatabaseConnection): Promise<void> {
  // Table set and order rewired against the case-version-lifecycle schema
  // (task/case-lifecycle-persistence/case-version-lifecycle-schema): the flat
  // hypothesis_collects/hypotheses pair this file used to delete is gone, replaced by
  // hypothesis_revision_collects, case_version_hypotheses, hypothesis_revisions and the now
  // identity-only hypotheses — the same table set and order release.operation.spec.ts's own
  // afterEach already established for cleaning up after a released version.
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
  // The fixture's own outcome.json happens to list both non-conclusion outcomes among its own
  // terms; excluded here rather than deleted, since they are the glossary's own suite-wide seed
  // (vitest-global-setup.ts), never this fixture's own to remove — deleting them mid-suite races
  // GlossaryService.withNonConclusionOutcomes' own top-up against any other file's currently-live
  // hypothesis row (task/service-on-the-database/store-wiring, disclosed in that task's own delivery).
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

/** Raised from vitest's own 10000ms hookTimeout default, the same plain per-hook-argument
 * mechanism seed.spec.ts's own beforeAll/afterAll and diagnose-server.factory.spec.ts's own
 * afterAll already establish (30000ms there, for the identical reason): this file's own
 * cleanupFixtureSeeded issues 12+ sequential deleteTolerantly round-trips against the real,
 * pooled Neon connection, which have very little headroom left under the 10-second default once
 * the rest of the full 89-file suite has already put load on that same connection — this file
 * passes cleanly in isolation, so the failure is accumulated latency under the suite's load
 * rather than a genuine hang. 30000ms gives real headroom without masking one. */
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
