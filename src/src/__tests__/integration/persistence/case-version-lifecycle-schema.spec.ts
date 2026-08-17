// Proof for task/case-lifecycle-persistence/case-version-lifecycle-schema, against a real,
// externally provisioned PostgreSQL database reached through DATABASE_URL — the schema this task
// ships is the thing under test, so nothing here stands in for the store itself (TST-03).
//
// Follows the established pattern of schema-migrations.spec.ts and migration-runner.spec.ts: one
// disposable schema, created and dropped by this file alone, holding every migration script this
// project ships applied in the order their own file names number them (MIG-01). Every ordinary test
// runs inside its own transaction (BEGIN in beforeEach, ROLLBACK in afterEach) against that one
// schema, seeded once in beforeAll with the glossary rows the new tables' foreign keys need; nothing
// a test writes outlives it, and no test depends on another having run first. Two tests — the ones
// proving the backfill inference below — apply a subset of the migrations to their own private,
// self-contained schema instead, because observing a backfill requires inserting a row before the
// migration that adds the backfilled column runs; each creates and drops that schema entirely within
// its own body.
//
// Divergences from the project's standard, disclosed here for the same reason schema-migrations.spec.ts
// already discloses them:
//   - STK-08 ("boundary input ... is parsed by a Zod schema") is departed from below: DATABASE_URL is
//     read directly from process.env rather than through config/env.ts's loadEnv, because loadEnv
//     refuses unless every other application variable is also configured, which would couple this
//     schema-only suite to the whole application's environment for a value it uses once, verbatim.
//   - TST-04 ("mirrors the path of the unit under test") is departed from below: the unit under test
//     is migrations/0009-case-version-lifecycle-schema.sql, a file sitting outside src/src entirely,
//     so there is no single TypeScript path for this file to mirror; it is named for the migration
//     artifact instead, exactly as schema-migrations.spec.ts already is.
import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../../../migrations', import.meta.url));
const TARGET_MIGRATION = '0009-case-version-lifecycle-schema.sql';

const FOREIGN_KEY_VIOLATION = '23503';
const UNIQUE_VIOLATION = '23505';
const CHECK_VIOLATION = '23514';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

/** Every migration file's own name, in the order their zero-padded prefix numbers them. */
async function migrationFilesInOrder(): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIR);
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

/** Applies exactly the given migration files' text, verbatim, in the order given. */
async function applyMigrationFiles(client: Client, files: readonly string[]): Promise<void> {
  for (const file of files) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
    await client.query(sql);
  }
}

interface IGlossary {
  subjectType: string;
  outcome: string;
  action: string;
  recipient: string;
  concept: string;
}

async function seedGlossary(client: Client, glossary: IGlossary): Promise<void> {
  await client.query('INSERT INTO subject_types (name) VALUES ($1)', [glossary.subjectType]);
  await client.query('INSERT INTO outcomes (name) VALUES ($1)', [glossary.outcome]);
  await client.query('INSERT INTO actions (name) VALUES ($1)', [glossary.action]);
  await client.query('INSERT INTO recipients (name) VALUES ($1)', [glossary.recipient]);
  await client.query('INSERT INTO concepts (name, ttl) VALUES ($1, 60)', [glossary.concept]);
}

async function insertCase(client: Client, slug: string): Promise<void> {
  await client.query('INSERT INTO cases (slug) VALUES ($1)', [slug]);
}

interface ICaseVersionOptions {
  slug: string;
  version: number;
  state: string;
  releasedAt?: string | null;
  title?: string;
}

async function insertCaseVersion(client: Client, glossary: IGlossary, options: ICaseVersionOptions): Promise<void> {
  const title = options.title ?? 'A stored case title';
  const releasedAt = options.releasedAt ?? null;
  await client.query(
    `INSERT INTO case_versions
       (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient, state, released_at)
     VALUES ($1, $2, $3, 'When to use it', now(), $4, $5, $6, $7, $8, $9)`,
    [options.slug, options.version, title, glossary.subjectType, glossary.outcome, glossary.action, glossary.recipient, options.state, releasedAt],
  );
}

interface IHypothesisOptions {
  slug: string;
  name: string;
}

async function insertHypothesis(client: Client, options: IHypothesisOptions): Promise<void> {
  await client.query('INSERT INTO hypotheses (case_slug, name) VALUES ($1, $2)', [options.slug, options.name]);
}

interface IRevisionOptions {
  slug: string;
  hypothesisName: string;
  revision: number;
  criterion?: string;
}

async function insertHypothesisRevision(client: Client, glossary: IGlossary, options: IRevisionOptions): Promise<void> {
  const criterionText = options.criterion ?? 'A representative criterion.';
  await client.query(
    `INSERT INTO hypothesis_revisions
       (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [options.slug, options.hypothesisName, options.revision, criterionText, glossary.outcome, glossary.action, glossary.recipient],
  );
}

interface ICollectOptions {
  slug: string;
  hypothesisName: string;
  revision: number;
  conceptName: string;
}

async function insertRevisionCollect(client: Client, options: ICollectOptions): Promise<void> {
  await client.query(
    'INSERT INTO hypothesis_revision_collects (case_slug, hypothesis_name, revision, concept_name) VALUES ($1,$2,$3,$4)',
    [options.slug, options.hypothesisName, options.revision, options.conceptName],
  );
}

interface IManifestOptions {
  slug: string;
  version: number;
  hypothesisName: string;
  revision: number;
  position: number;
}

async function insertManifestEntry(client: Client, options: IManifestOptions): Promise<void> {
  await client.query(
    `INSERT INTO case_version_hypotheses (case_slug, case_version, hypothesis_name, revision, position)
     VALUES ($1, $2, $3, $4, $5)`,
    [options.slug, options.version, options.hypothesisName, options.revision, options.position],
  );
}

let client: Client;
let schemaName: string;
let glossary: IGlossary;

beforeAll(async () => {
  client = new Client({ connectionString: requireDatabaseUrl() });
  await client.connect();
  schemaName = `case_version_lifecycle_test_${randomUUID().replace(/-/g, '_')}`;
  await client.query(`CREATE SCHEMA "${schemaName}"`);
  await client.query(`SET search_path TO "${schemaName}"`);
  await applyMigrationFiles(client, await migrationFilesInOrder());

  glossary = {
    subjectType: 'a-subject-type',
    outcome: 'an-outcome',
    action: 'an-action',
    recipient: 'a-recipient',
    concept: 'a-concept',
  };
  await seedGlossary(client, glossary);
});

afterAll(async () => {
  await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  await client.end();
});

beforeEach(async () => {
  await client.query('BEGIN');
});

afterEach(async () => {
  await client.query('ROLLBACK');
});

// ---------------------------------------------------------------- criterion 1: state / released_at

it('stores a draft case_versions row with released_at absent', async () => {
  const slug = 'a-draft-case';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'draft' });

  const { rows } = await client.query<{ state: string; released_at: string | null }>(
    'SELECT state, released_at FROM case_versions WHERE slug = $1 AND version = 1', [slug],
  );
  expect(rows).toEqual([{ state: 'draft', released_at: null }]);
});

it('stores a released case_versions row with released_at present', async () => {
  const slug = 'a-released-case';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });

  const { rows } = await client.query<{ state: string; released_at: Date | null }>(
    'SELECT state, released_at FROM case_versions WHERE slug = $1 AND version = 1', [slug],
  );
  expect(rows[0]?.state).toBe('released');
  expect(rows[0]?.released_at).not.toBeNull();
});

it('refuses a case_versions row whose state names a value outside draft or released', async () => {
  const slug = 'a-case-with-an-invalid-state';
  await insertCase(client, slug);

  await expect(
    insertCaseVersion(client, glossary, { slug, version: 1, state: 'archived' }),
  ).rejects.toMatchObject({ code: CHECK_VIOLATION });
});

// ---------------------------------------------------------------- criterion 2: durable version counter

it("keeps cases.next_version writable to a value independent of any stored case_versions row, proving it is a stored counter rather than one computed from MAX(version)", async () => {
  const slug = 'a-case-with-an-independent-counter';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 5, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });

  await client.query('UPDATE cases SET next_version = 99 WHERE slug = $1', [slug]);

  const { rows } = await client.query<{ next_version: number }>('SELECT next_version FROM cases WHERE slug = $1', [slug]);
  expect(rows[0]?.next_version).toBe(99);
});

// ---------------------------------------------------------------- inference: DEFAULT 1 kept for a genuinely new case

it('defaults a newly created case row (no case_versions row at all) to next_version 1', async () => {
  const slug = 'a-brand-new-case';
  await insertCase(client, slug);

  const { rows } = await client.query<{ next_version: number }>('SELECT next_version FROM cases WHERE slug = $1', [slug]);
  expect(rows[0]?.next_version).toBe(1);
});

// ---------------------------------------------------------------- criterion 3: at most one draft per case

it('refuses inserting a second draft case_versions row for a case that already has one', async () => {
  const slug = 'a-case-with-a-draft-already';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'draft' });

  await expect(
    insertCaseVersion(client, glossary, { slug, version: 2, state: 'draft' }),
  ).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
});

it('permits two released case_versions rows to coexist for the same case, since the one-draft constraint is scoped to draft state alone', async () => {
  const slug = 'a-case-with-two-released-versions';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });

  await expect(
    insertCaseVersion(client, glossary, { slug, version: 2, state: 'released', releasedAt: '2026-01-02T00:00:00Z' }),
  ).resolves.toBeUndefined();
});

// ---------------------------------------------------------------- criterion 4: hypotheses, identity-only

it('shapes hypotheses as exactly case_slug and name, carrying no content column', async () => {
  const { rows } = await client.query<{ column_name: string }>(
    'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY column_name',
    [schemaName, 'hypotheses'],
  );
  expect(rows.map((row) => row.column_name)).toEqual(['case_slug', 'name']);
});

it('stores and reads back a hypothesis by its identity alone', async () => {
  const slug = 'a-case-with-a-named-hypothesis';
  await insertCase(client, slug);
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });

  const { rows } = await client.query<{ name: string }>('SELECT name FROM hypotheses WHERE case_slug = $1', [slug]);
  expect(rows).toEqual([{ name: 'the-hypothesis' }]);
});

it('refuses a second hypothesis stored under an already-used (case_slug, name) key', async () => {
  const slug = 'a-case-with-a-duplicated-hypothesis-name';
  await insertCase(client, slug);
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });

  await expect(
    insertHypothesis(client, { slug, name: 'the-hypothesis' }),
  ).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
});

// ---------------------------------------------------------------- criterion 5: hypothesis_revisions

it("stores and reads back a hypothesis revision's own criterion and resolution", async () => {
  const slug = 'a-case-with-a-revised-hypothesis';
  await insertCase(client, slug);
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1, criterion: 'A real criterion.' });

  const { rows } = await client.query<{ criterion: string; resolution_outcome: string }>(
    'SELECT criterion, resolution_outcome FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
    [slug, 'the-hypothesis'],
  );
  expect(rows).toEqual([{ criterion: 'A real criterion.', resolution_outcome: glossary.outcome }]);
});

it('refuses a second row under an already-used (case_slug, hypothesis_name, revision) key', async () => {
  const slug = 'a-case-with-a-duplicated-revision-number';
  await insertCase(client, slug);
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });

  await expect(
    insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 }),
  ).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
});

it("leaves an already-stored hypothesis revision's own columns unchanged after an ordinary UPDATE attempts to alter them", async () => {
  const slug = 'an-immutable-hypothesis-revision';
  await insertCase(client, slug);
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1, criterion: 'Original.' });

  await client.query('SAVEPOINT before_update');
  try {
    await client.query(
      "UPDATE hypothesis_revisions SET criterion = 'Nothing should have written this.' WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1",
      [slug, 'the-hypothesis'],
    );
  } catch {
    await client.query('ROLLBACK TO SAVEPOINT before_update');
  }

  const { rows } = await client.query<{ criterion: string }>(
    'SELECT criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1', [slug, 'the-hypothesis'],
  );
  expect(rows[0]?.criterion).toBe('Original.');
});

// ---------------------------------------------------------------- criterion 6: hypothesis_revision_collects

it('stores and reads back the concepts one hypothesis revision collects, referencing that exact revision', async () => {
  const slug = 'a-case-with-a-collecting-revision';
  await insertCase(client, slug);
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
  await insertRevisionCollect(client, { slug, hypothesisName: 'the-hypothesis', revision: 1, conceptName: glossary.concept });

  const { rows } = await client.query<{ concept_name: string }>(
    'SELECT concept_name FROM hypothesis_revision_collects WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = 1',
    [slug, 'the-hypothesis'],
  );
  expect(rows).toEqual([{ concept_name: glossary.concept }]);
});

it('refuses a collect row naming a revision that was never stored', async () => {
  const slug = 'a-case-with-no-such-revision';
  await insertCase(client, slug);
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });

  await expect(
    insertRevisionCollect(client, { slug, hypothesisName: 'the-hypothesis', revision: 7, conceptName: glossary.concept }),
  ).rejects.toMatchObject({ code: FOREIGN_KEY_VIOLATION });
});

// ---------------------------------------------------------------- criterion 7: case_version_hypotheses (manifest)

it("stores and reads back a manifest entry's hypothesis, revision and position", async () => {
  const slug = 'a-case-with-a-manifest-entry';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'draft' });
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
  await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

  const { rows } = await client.query<{ hypothesis_name: string; revision: number; position: number }>(
    'SELECT hypothesis_name, revision, position FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = 1', [slug],
  );
  expect(rows).toEqual([{ hypothesis_name: 'the-hypothesis', revision: 1, position: 1 }]);
});

it("refuses a second manifest entry at a position already used within the same case version's manifest", async () => {
  const slug = 'a-case-with-two-hypotheses-at-one-manifest-position';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'draft' });
  await insertHypothesis(client, { slug, name: 'first' });
  await insertHypothesis(client, { slug, name: 'second' });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'first', revision: 1 });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'second', revision: 1 });
  await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'first', revision: 1, position: 1 });

  await expect(
    insertManifestEntry(client, { slug, version: 1, hypothesisName: 'second', revision: 1, position: 1 }),
  ).rejects.toMatchObject({ code: UNIQUE_VIOLATION });
});

it("permits the same position to be reused across two different case versions of the same case, since uniqueness is scoped per version", async () => {
  const slug = 'a-case-reusing-a-position-across-versions';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });
  await insertCaseVersion(client, glossary, { slug, version: 2, state: 'draft' });
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
  await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

  await expect(
    insertManifestEntry(client, { slug, version: 2, hypothesisName: 'the-hypothesis', revision: 1, position: 1 }),
  ).resolves.toBeUndefined();
});

// ---------------------------------------------------------------- criterion 8: UPDATE refused once released

it("leaves a released case_versions row's own columns unchanged after an ordinary UPDATE attempts to alter them", async () => {
  const slug = 'a-released-immutable-case';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z', title: 'Original title' });

  await client.query('SAVEPOINT before_update');
  try {
    await client.query('UPDATE case_versions SET title = $1 WHERE slug = $2 AND version = 1', ['Nothing should have written this.', slug]);
  } catch {
    await client.query('ROLLBACK TO SAVEPOINT before_update');
  }

  const { rows } = await client.query<{ title: string }>('SELECT title FROM case_versions WHERE slug = $1 AND version = 1', [slug]);
  expect(rows[0]?.title).toBe('Original title');
});

// ---------------------------------------------------------------- criterion 9: draft UPDATE not blocked

it('changes an ordinary column of a still-draft case_versions row on UPDATE', async () => {
  const slug = 'a-still-draft-case';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'draft', title: 'Original draft title' });

  await client.query('UPDATE case_versions SET title = $1 WHERE slug = $2 AND version = 1', ['A revised draft title', slug]);

  const { rows } = await client.query<{ title: string }>('SELECT title FROM case_versions WHERE slug = $1 AND version = 1', [slug]);
  expect(rows[0]?.title).toBe('A revised draft title');
});

it('lets an UPDATE transition a draft case_versions row to released', async () => {
  const slug = 'a-case-being-released';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'draft' });

  await client.query("UPDATE case_versions SET state = 'released', released_at = now() WHERE slug = $1 AND version = 1", [slug]);

  const { rows } = await client.query<{ state: string }>('SELECT state FROM case_versions WHERE slug = $1 AND version = 1', [slug]);
  expect(rows[0]?.state).toBe('released');
});

// ---------------------------------------------------------------- criterion 10: old tables dropped

it('drops hypothesis_collects (migration 0004) entirely, leaving no table for any old row to have been carried into', async () => {
  const { rows } = await client.query<{ exists: boolean }>("SELECT to_regclass('hypothesis_collects') IS NOT NULL AS exists");
  expect(rows[0]?.exists).toBe(false);
});

// ---------------------------------------------------------------- criterion 11: numbered next, 0006 untouched

it("arrives as the next-numbered script after 0008, with 0006's own file still holding its original, unconditional rule text", async () => {
  const files = await migrationFilesInOrder();
  const priorToTarget = files.filter((name) => name < TARGET_MIGRATION);
  const zeroSix = priorToTarget.find((name) => name.startsWith('0006-'));
  if (!zeroSix) {
    throw new Error('expected a migration file named 0006-*.sql to exist under migrations/');
  }
  expect(files).toContain(TARGET_MIGRATION);
  expect(priorToTarget[priorToTarget.length - 1]?.startsWith('0008-')).toBe(true);

  const zeroSixText = await readFile(join(MIGRATIONS_DIR, zeroSix), 'utf8');
  expect(zeroSixText).not.toContain('WHERE');
});

// ---------------------------------------------------------------- UNDERDETERMINED: manifest immutability on release

it('refuses to alter a manifest entry belonging to a released case version', async () => {
  const slug = 'a-released-case-with-a-manifest-entry';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
  await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

  await client.query('SAVEPOINT before_update');
  try {
    await client.query(
      'UPDATE case_version_hypotheses SET position = 2 WHERE case_slug = $1 AND case_version = 1 AND hypothesis_name = $2',
      [slug, 'the-hypothesis'],
    );
  } catch {
    await client.query('ROLLBACK TO SAVEPOINT before_update');
  }

  const { rows } = await client.query<{ position: number }>(
    'SELECT position FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = 1', [slug],
  );
  expect(rows[0]?.position).toBe(1);
});

it('refuses to delete a manifest entry belonging to a released case version', async () => {
  const slug = 'a-released-case-whose-manifest-entry-cannot-be-removed';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
  await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

  await client.query('SAVEPOINT before_delete');
  try {
    await client.query('DELETE FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = 1', [slug]);
  } catch {
    await client.query('ROLLBACK TO SAVEPOINT before_delete');
  }

  const { rows } = await client.query<{ present: number }>(
    'SELECT 1 AS present FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = 1', [slug],
  );
  expect(rows).toHaveLength(1);
});

it("updates a draft case version's own manifest entry ordinarily", async () => {
  const slug = 'a-draft-case-with-an-editable-manifest-entry';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'draft' });
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
  await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

  await client.query(
    'UPDATE case_version_hypotheses SET position = 2 WHERE case_slug = $1 AND case_version = 1 AND hypothesis_name = $2',
    [slug, 'the-hypothesis'],
  );

  const { rows } = await client.query<{ position: number }>(
    'SELECT position FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = 1', [slug],
  );
  expect(rows[0]?.position).toBe(2);
});

it("deletes a draft case version's own manifest entry ordinarily", async () => {
  const slug = 'a-draft-case-with-a-removable-manifest-entry';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'draft' });
  await insertHypothesis(client, { slug, name: 'the-hypothesis' });
  await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
  await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

  await client.query('DELETE FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = 1', [slug]);

  const { rows } = await client.query<{ present: number }>(
    'SELECT 1 AS present FROM case_version_hypotheses WHERE case_slug = $1 AND case_version = 1', [slug],
  );
  expect(rows).toHaveLength(0);
});

// ---------------------------------------------------------------- UNDERDETERMINED: DELETE refused on a released case_versions row

it('refuses to delete a released case_versions row', async () => {
  const slug = 'a-released-case-that-cannot-be-discarded';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });

  await client.query('SAVEPOINT before_delete');
  try {
    await client.query('DELETE FROM case_versions WHERE slug = $1 AND version = 1', [slug]);
  } catch {
    await client.query('ROLLBACK TO SAVEPOINT before_delete');
  }

  const { rows } = await client.query<{ present: number }>(
    'SELECT 1 AS present FROM case_versions WHERE slug = $1 AND version = 1', [slug],
  );
  expect(rows).toHaveLength(1);
});

it('permits deleting a draft case_versions row that carries no manifest entries', async () => {
  const slug = 'a-discardable-draft-case';
  await insertCase(client, slug);
  await insertCaseVersion(client, glossary, { slug, version: 1, state: 'draft' });

  await client.query('DELETE FROM case_versions WHERE slug = $1 AND version = 1', [slug]);

  const { rows } = await client.query<{ present: number }>(
    'SELECT 1 AS present FROM case_versions WHERE slug = $1 AND version = 1', [slug],
  );
  expect(rows).toHaveLength(0);
});

// ---------------------------------------------------------------- inference: backfill value and dropped default

it("backfills every pre-existing case_versions row's state to 'released' when migration 0009 adds the column", async () => {
  const priorSchema = `case_version_lifecycle_backfill_${randomUUID().replace(/-/g, '_')}`;
  const priorClient = new Client({ connectionString: requireDatabaseUrl() });
  await priorClient.connect();
  try {
    await priorClient.query(`CREATE SCHEMA "${priorSchema}"`);
    await priorClient.query(`SET search_path TO "${priorSchema}"`);
    const files = await migrationFilesInOrder();
    await applyMigrationFiles(priorClient, files.filter((name) => name < TARGET_MIGRATION));
    await seedGlossary(priorClient, glossary);
    await priorClient.query('INSERT INTO cases (slug) VALUES ($1)', ['a-pre-existing-case']);
    await priorClient.query(
      `INSERT INTO case_versions (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient)
       VALUES ($1, 1, 't', 'w', now(), $2, $3, $4, $5)`,
      ['a-pre-existing-case', glossary.subjectType, glossary.outcome, glossary.action, glossary.recipient],
    );

    await applyMigrationFiles(priorClient, [TARGET_MIGRATION]);

    const { rows } = await priorClient.query<{ state: string; released_at: string | null }>(
      "SELECT state, released_at FROM case_versions WHERE slug = 'a-pre-existing-case'",
    );
    expect(rows).toEqual([{ state: 'released', released_at: null }]);
  } finally {
    await priorClient.query(`DROP SCHEMA IF EXISTS "${priorSchema}" CASCADE`);
    await priorClient.end();
  }
});

it("defaults a newly-inserted case_versions row that does not name its own state to 'released', since the column's own DEFAULT is kept permanently rather than dropped after backfill — every currently-shipped write path that inserts without naming state depends on this", async () => {
  const slug = 'a-case-omitting-its-own-state';
  await insertCase(client, slug);

  const result = await client.query(
    `INSERT INTO case_versions (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient)
     VALUES ($1, 1, 't', 'w', now(), $2, $3, $4, $5) RETURNING state`,
    [slug, glossary.subjectType, glossary.outcome, glossary.action, glossary.recipient],
  );

  expect(result.rows[0].state).toBe('released');
});
