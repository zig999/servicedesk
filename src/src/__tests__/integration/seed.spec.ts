// Proof for task/case-authoring/curated-data-seeded, against a real, externally provisioned
// PostgreSQL database (constraints/the-database-is-externally-provisioned) — seed.ts is what is
// under test, so nothing here stands in for it (TST-03).
//
// seed.ts exports nothing: every function it declares is module-private, and its own sequence
// (loadEnv, one DatabaseConnection, the five seed steps, the self-check read) runs unconditionally
// at module-evaluation time. Reaching that real sequence without reinventing it (MNT-03), and
// without a build step this project's own registry never runs (standards/backend-node-service.yaml's
// own `commands` name install, typecheck, lint, secret-scan and test — no build — so dist/seed.js
// cannot be relied on to exist), rules out a compiled-subprocess run; asking for an export is not
// this role's to add. What is left, and what this file uses, is a dynamic `import()` of seed.ts's
// own module specifier: vitest already transpiles this project's .ts sources on import through the
// same pipeline it transpiles this very test file with, so importing seed.ts here executes its own
// real top-level code, unedited, exactly the way "node dist/seed.js" would run its compiled form. A
// dynamic import caches by specifier, so the second run this file's own rerun test needs (below) is
// forced fresh by a distinguishing query string on the same URL — the same cache-busting a dev
// server's own module graph invalidation already relies on.
//
// seed.ts's own top-level loadEnv() reads DATABASE_URL and six other application variables straight
// from process.env, with no override parameter; DATABASE_URL is already the real connection every
// sibling integration file in this tree assumes present, and the other six are set here to the same
// kind of placeholder value diagnose-server.factory.spec.ts's own Env object already uses, restored
// again once this file is done — seed.ts's own code only ever reads env.DATABASE_URL from the
// parsed result, so the placeholders never influence what it writes.
//
// This file wipes, then re-seeds (through seed.ts itself, never through a helper of this file's
// own), the exact fixture rows case-fixture-reads-clean.spec.ts's own
// ensureFixtureSeeded/cleanupFixtureSeeded, diagnose-server.factory.spec.ts's own
// ensureFixtureSeeded/cleanupFixtureSeeded and diagnose-e2e.spec.ts already seed for their own
// purposes, over the same real tables — the identical case, the identical five vocabularies, the
// identical concepts and the identical two capabilities. Following the same convention those three
// files already disclose at length: every row this file's own run leaves behind is removed again in
// its own afterAll, restoring the tables to the state those siblings expect, and the two
// non-conclusion outcomes are deliberately excluded from that removal — they are the glossary's own
// suite-wide seed (vitest-global-setup.ts), and by the time this file's own afterAll runs, seed.ts's
// own seedOutcomes has already written them back as part of the real "outcome" vocabulary it
// replaces whole, so nothing here needs to restore them itself.
//
// Wiping the five vocabulary tables, "concepts"/"concept_accepts" and the fixture's own two
// capabilities to establish a genuinely empty starting point is safe for the same reason
// relational-glossary-store.repository.spec.ts's own wholesale wipe already is: fileParallelism:
// false (vitest.config.ts) means no other file's own row can be present while this file's tests
// run, so nothing here can delete a row a concurrently running sibling still depends on.
//
// Criterion 1's own ordering claim — that the two non-conclusion outcomes are written before the
// case, rather than merely present once the case is authored — is disclosed as not provable by any
// test in this file (see this delivery's own proof record, `untested`): GlossaryService's own
// withNonConclusionOutcomes (glossary/glossary.service.ts) tops the two names up on every read of
// the outcome vocabulary, including the one release's own coherence check makes while releasing the
// case (task/case-lifecycle-operations/wire-and-retire-author-case-version), so a variant of seed.ts
// that never wrote them at all would reach the exact
// same end state this file can observe. What this file proves instead is the real, falsifiable half
// of that claim: starting from a database this file has itself emptied of both names and of the
// case (checked defensively in beforeAll below, before seed.ts ever runs), a full run of seed.ts
// leaves both names, and the case, present.
//
// Divergence disclosed here for the same reason every sibling integration proof already discloses
// it: (STK-08) DATABASE_URL is read directly from process.env below rather than through
// config/env.ts's loadEnv, because loadEnv refuses unless every other application variable is
// configured too, which this file's own connection has no use for — seed.ts's own loadEnv call, a
// few lines below, is the one place in this file that genuinely needs the wider schema, and it is
// given real placeholder values for exactly that reason.
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

/** The fixture's own committed case document, exactly as seed.ts itself reads it — read fresh here rather than duplicated, so this file never drifts from what the fixture actually declares. */
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

/** One entry of the fixture's own committed concept.json, read fresh rather than duplicated. */
interface IConceptFixture {
  readonly name: string;
  readonly accepts: readonly string[];
  readonly ttl: number;
}

/** One entry of the fixture's own committed capability.json, read fresh rather than duplicated. */
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

/**
 * Removes every row this file's own fixture-owned data could hold, in an order that always
 * satisfies their own foreign keys, so seed.ts's own upcoming run starts from a database genuinely
 * lacking all of it — including, deliberately, the two non-conclusion outcomes (see this file's own
 * header). Table set and order rewired against the case-version-lifecycle schema
 * (task/case-lifecycle-persistence/case-version-lifecycle-schema): the flat
 * hypothesis_collects/hypotheses pair this file used to delete is gone, replaced by
 * hypothesis_revision_collects, case_version_hypotheses, hypothesis_revisions and the now
 * identity-only hypotheses — the same table set and order release.operation.spec.ts's own afterEach
 * already established for cleaning up after a released version.
 */
const FOREIGN_KEY_VIOLATION = '23503';

/** Whether a failure the driver raised is Postgres' own foreign-key-violation code (the same instanceof-plus-'in' guard create-draft.operation.spec.ts's own isForeignKeyViolation already establishes for this codebase). */
function isForeignKeyViolation(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === FOREIGN_KEY_VIOLATION;
}

/** Runs one cleanup DELETE, tolerating a foreign-key violation — seed.ts's own seedCase releases the case for real, so migrations/0009's own release-conditioned rules make that row (and whatever it still references) permanent; the same tolerance create-draft.operation.spec.ts's own deleteTolerantly already establishes for this migration's consequence. */
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
  // One deleteTolerantly call per name, not one batched ANY($1) array, the same per-row shape the
  // capability and concept loops above already use — found live, running this exact file against a
  // database where the fixture case already stands released: a single batched DELETE targeting both
  // the two case-specific outcome names (still referenced by the released case's own permanent
  // hypothesis_revisions rows, migration 0009) and the two non-conclusion names fails atomically on
  // the case-specific names alone, and Postgres' own all-or-nothing statement semantics then leave
  // even the otherwise perfectly removable non-conclusion names undeleted too. One DELETE per name
  // lets deleteTolerantly's own foreign-key tolerance apply per name instead of to the whole array.
  for (const outcomeName of await readGlossaryFixtureNames('outcome.json')) {
    await deleteTolerantly(connection, 'DELETE FROM outcomes WHERE name = $1', [outcomeName]);
  }
  await deleteTolerantly(connection, 'DELETE FROM actions WHERE name = ANY($1)', [await readGlossaryFixtureNames('action.json')]);
  await deleteTolerantly(connection, 'DELETE FROM recipients WHERE name = ANY($1)', [await readGlossaryFixtureNames('recipient.json')]);
}

/**
 * Whether the named outcome is permanently referenced by a released case version anywhere in this
 * database, through either of the two paths the schema actually declares a NOT NULL FK to
 * outcomes(name) for — domain/knowledge/hypothesis-revision's and domain/knowledge/case-version's
 * own "once any case version in released state manifests it, this content never changes again"
 * propagating onto the outcome row either column names:
 *
 *   1. case_versions.fallback_outcome (migration 0004) directly, combined with
 *      case_versions_no_delete_when_released (migration 0009) — the path actually populated in this
 *      database today: every case fixture across this suite that declares this name as its own
 *      case-level fallback pins it the moment that version is released for real, with no
 *      hypothesis-revision involved at all.
 *   2. hypothesis_revisions.resolution_outcome (migration 0009), reached from a hypothesis-revision
 *      to case_versions.state the same way migration 0009's own
 *      case_version_hypotheses_no_update_when_released rule and migration 0010's own
 *      hypothesis_revision_collects_no_delete_when_released rule already do — real per the schema
 *      even though nothing in this database currently populates it for either non-conclusion name.
 *
 * Neither is scoped to this file's own SLUG: any case anywhere in this shared database
 * (diagnose-e2e.spec.ts's and diagnose-server.factory.spec.ts's own fixture seeding included) may
 * hold the released version or revision that made this particular name permanent.
 */
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

/**
 * Confirms the wipe above genuinely left the database lacking the case and both non-conclusion
 * outcomes, before seed.ts ever runs — not itself a test (see this file's own header on why
 * criterion 1's own "before" cannot be asserted as one), a loud failure of this file's own
 * arrangement rather than a silently wrong premise for every it() below.
 *
 * A case this wipe cannot actually remove is tolerated here rather than treated as the wipe's own
 * failure: rules/knowledge/a-case-version-is-written-once (case-store.port.ts's own release())
 * makes a genuinely released version permanent once release.operation.spec.ts, or any sibling
 * integration file run earlier in the same suite, has released it for real — wipeFixtureOwnedRows'
 * own deleteTolerantly already tolerates the same foreign-key violation that permanence raises.
 * assembleVersion's own AssembledCaseVersion.state names exactly the two states
 * domain/knowledge/case-version-state holds, so a released state is the one defined-but-not-throw
 * case; a draft state is still this file's own wipe genuinely failing to remove something it
 * should have been able to, and still throws.
 *
 * A remaining non-conclusion outcome row is tolerated the same way, and for the same reason, once
 * isPermanentlyReferencedByAReleasedCaseVersion confirms release-immutability elsewhere in this
 * shared database is exactly why it survived the wipe above — never merely because it is still
 * present: a name present for any other reason still throws, the same as before this task.
 */
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

/** Removes every row seed.ts's own run wrote, the same way wipeFixtureOwnedRows empties them, except the two non-conclusion outcomes (see this file's own header) — table set and order rewired the same way wipeFixtureOwnedRows was, above. */
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

/**
 * Every application variable seed.ts's own loadEnv() call requires besides DATABASE_URL, set to the
 * same kind of placeholder value diagnose-server.factory.spec.ts's own Env object already uses —
 * seed.ts never reads any of these itself, only env.DATABASE_URL.
 *
 * Sibling fix, disclosed in task/case-lifecycle-http/register-routes-in-build-app's own proof
 * record: envSchema now also requires PAGINATION_DEFAULT_LIMIT and PAGINATION_MAX_LIMIT (both
 * coerced positive integers) for seed.ts's own loadEnv() call to keep succeeding, so both are named
 * here too.
 */
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

/** Runs seed.ts's own real, unexported top-level script by dynamically importing it — the technique this file's own header discloses and explains. A distinguishing query string forces a fresh module instance, and therefore a fresh execution of that top-level code, past whatever the dynamic import cache already holds under an earlier run's own specifier. */
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

// ---------------------------------------------------------------- criterion 1

it(
  'holds both non-conclusion outcomes, having run against a database this file had itself confirmed lacked them beforehand',
  async () => {
    const nonConclusionNames = NON_CONCLUSION_OUTCOMES.map((outcome) => outcome.name);
    const { rows } = await connection.query<{ name: string }>('SELECT name FROM outcomes WHERE name = ANY($1)', [nonConclusionNames]);

    expect(rows.map((row) => row.name).sort()).toEqual([...nonConclusionNames].sort());
  },
);

// ---------------------------------------------------------------- criterion 2

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

// ---------------------------------------------------------------- criterion 3

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

// ---------------------------------------------------------------- criterion 4, and this task's own UNDERDETERMINED note

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

// ---------------------------------------------------------------- criterion 5

it('the case is stored, once seed.ts has run against a database this file had confirmed lacked it beforehand', async () => {
  const stored = await createCaseStore(connection).assembleVersion(SLUG, VERSION);

  expect(stored).toBeDefined();
});

// ---------------------------------------------------------------- criterion 6, and this task's own UNDERDETERMINED note

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
    // case.ts's own Hypothesis projection carries name/criterion/collects/resolution only — position
    // now belongs to the manifest entry, not the hypothesis, since the case-lifecycle domain-model
    // rewrite split a hypothesis's stable identity from its numbered content
    // (task/case-lifecycle-persistence/case-version-lifecycle-schema, disclosed as this delivery's
    // own adaptation of a pre-existing assertion the domain-model split already invalidated,
    // independent of this task's own wiring). The fixture document's own committed "hypotheses"
    // array still declares "position" (case-fixture-reads-clean.spec.ts's own header on the same
    // fixture predating that split), so this compares every field but that one.
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

// ---------------------------------------------------------------- this delivery's own disclosed inference: a rerun is guarded before any write, rather than by catching a write-once refusal

it('resolves without rejecting when seed.ts is run a second time against a database it has already seeded', async () => {
  await expect(runSeedScript(2)).resolves.toBeUndefined();
});

// ---------------------------------------------------------------- task/seed-already-seeded-guard-hotfix/narrow-the-guard's own criterion 4: the second run above must not have drafted a new version behind that resolved promise

it('holds no second case version, having run seed.ts a second time in a row against the version it already released', async () => {
  const secondVersion = await createCaseStore(connection).assembleVersion(SLUG, VERSION + 1);

  expect(secondVersion).toBeUndefined();
});
