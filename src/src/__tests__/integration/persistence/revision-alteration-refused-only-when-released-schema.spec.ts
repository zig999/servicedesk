import { randomUUID } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

const MIGRATIONS_DIR = fileURLToPath(new URL('../../../../migrations', import.meta.url));

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must name a reachable PostgreSQL instance for this suite to run.');
  }
  return url;
}

async function migrationFilesInOrder(): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIR);
  return entries.filter((name) => name.endsWith('.sql')).sort();
}

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
}

async function seedGlossary(client: Client, glossary: IGlossary): Promise<void> {
  await client.query('INSERT INTO subject_types (name) VALUES ($1)', [glossary.subjectType]);
  await client.query('INSERT INTO outcomes (name) VALUES ($1)', [glossary.outcome]);
  await client.query('INSERT INTO actions (name) VALUES ($1)', [glossary.action]);
  await client.query('INSERT INTO recipients (name) VALUES ($1)', [glossary.recipient]);
}

async function insertCase(client: Client, slug: string): Promise<void> {
  await client.query('INSERT INTO cases (slug) VALUES ($1)', [slug]);
}

interface ICaseVersionOptions {
  slug: string;
  version: number;
  state: string;
  releasedAt?: string | null;
}

async function insertCaseVersion(client: Client, glossary: IGlossary, options: ICaseVersionOptions): Promise<void> {
  const releasedAt = options.releasedAt ?? null;
  await client.query(
    `INSERT INTO case_versions
       (slug, version, title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient, state, released_at)
     VALUES ($1, $2, 'A stored case title', 'When to use it', now(), $3, $4, $5, $6, $7, $8)`,
    [options.slug, options.version, glossary.subjectType, glossary.outcome, glossary.action, glossary.recipient, options.state, releasedAt],
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
  const criterionText = options.criterion ?? 'The original criterion text.';
  await client.query(
    `INSERT INTO hypothesis_revisions
       (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [options.slug, options.hypothesisName, options.revision, criterionText, glossary.outcome, glossary.action, glossary.recipient],
  );
}

async function readRevisionCriterion(client: Client, options: { slug: string; hypothesisName: string; revision: number }): Promise<string | undefined> {
  const { rows } = await client.query<{ criterion: string }>(
    'SELECT criterion FROM hypothesis_revisions WHERE case_slug = $1 AND hypothesis_name = $2 AND revision = $3',
    [options.slug, options.hypothesisName, options.revision],
  );
  return rows[0]?.criterion;
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
  schemaName = `revision_alteration_test_${randomUUID().replace(/-/g, '_')}`;
  await client.query(`CREATE SCHEMA "${schemaName}"`);
  await client.query(`SET search_path TO "${schemaName}"`);
  await applyMigrationFiles(client, await migrationFilesInOrder());

  glossary = {
    subjectType: 'a-subject-type',
    outcome: 'an-outcome',
    action: 'an-action',
    recipient: 'a-recipient',
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

it(
  'drops the unconditional hypothesis_revisions_no_update rule and installs the release-conditioned trigger on hypothesis_revisions once every migration script has been applied in its numbered order',
  async () => {
    const { rows: rules } = await client.query<{ rulename: string }>(
      'SELECT rulename FROM pg_rules WHERE schemaname = $1 AND tablename = $2',
      [schemaName, 'hypothesis_revisions'],
    );
    const { rows: triggers } = await client.query<{ tgname: string }>(
      `SELECT t.tgname
       FROM pg_trigger t
       JOIN pg_class c ON c.oid = t.tgrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = $1 AND c.relname = $2 AND NOT t.tgisinternal`,
      [schemaName, 'hypothesis_revisions'],
    );

    expect(rules).toHaveLength(0);
    expect(triggers).toEqual([{ tgname: 'hypothesis_revisions_no_update_when_released' }]);
  },
);

it(
  'leaves an update through unrefused on a hypothesis revision that no case version references at all',
  async () => {
    const slug = 'a-case-with-an-unmanifested-revision';
    await insertCase(client, slug);
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });

    await client.query(
      'UPDATE hypothesis_revisions SET criterion = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = 1',
      ['A criterion nothing should have refused writing.', slug, 'the-hypothesis'],
    );

    const criterion = await readRevisionCriterion(client, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    expect(criterion).toBe('A criterion nothing should have refused writing.');
  },
);

it(
  "leaves an update through unrefused on a hypothesis revision that only a draft-state case version's manifest references",
  async () => {
    const slug = 'a-draft-case-manifesting-a-revision';
    await insertCase(client, slug);
    await insertCaseVersion(client, glossary, { slug, version: 1, state: 'draft' });
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

    await client.query(
      'UPDATE hypothesis_revisions SET criterion = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = 1',
      ['A criterion a draft reference should not have refused writing.', slug, 'the-hypothesis'],
    );

    const criterion = await readRevisionCriterion(client, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    expect(criterion).toBe('A criterion a draft reference should not have refused writing.');
  },
);

it(
  "leaves an update through unrefused on a hypothesis revision that a released case version's manifest does not reference, even though that same released version's manifest references a different revision of the same hypothesis",
  async () => {
    const slug = 'a-released-case-manifesting-a-different-revision';
    await insertCase(client, slug);
    await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, {
      slug,
      hypothesisName: 'the-hypothesis',
      revision: 1,
      criterion: 'The revision the released version actually manifests.',
    });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 2 });
    await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

    await client.query(
      'UPDATE hypothesis_revisions SET criterion = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = 2',
      ['A criterion the unreferenced sibling revision should have been free to accept.', slug, 'the-hypothesis'],
    );

    const criterion = await readRevisionCriterion(client, { slug, hypothesisName: 'the-hypothesis', revision: 2 });
    expect(criterion).toBe('A criterion the unreferenced sibling revision should have been free to accept.');
  },
);

it(
  "leaves a hypothesis revision's stored content exactly as it was after an update attempts to change it, where a released case version's manifest still references that revision",
  async () => {
    const slug = 'a-released-case-manifesting-a-revision';
    await insertCase(client, slug);
    await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

    await client.query('SAVEPOINT before_update');
    try {
      await client.query(
        'UPDATE hypothesis_revisions SET criterion = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = 1',
        ['A title nothing should have been able to write.', slug, 'the-hypothesis'],
      );
    } catch {
      await client.query('ROLLBACK TO SAVEPOINT before_update');
    }

    const criterion = await readRevisionCriterion(client, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    expect(criterion).toBe('The original criterion text.');
  },
);

it(
  "rejects the update itself, raising ReleasedHypothesisRevisionNotAlterableError, rather than silently discarding it, where a released case version's manifest still references the revision",
  async () => {
    const slug = 'a-released-case-whose-update-must-be-refused-loudly';
    await insertCase(client, slug);
    await insertCaseVersion(client, glossary, { slug, version: 1, state: 'released', releasedAt: '2026-01-01T00:00:00Z' });
    await insertHypothesis(client, { slug, name: 'the-hypothesis' });
    await insertHypothesisRevision(client, glossary, { slug, hypothesisName: 'the-hypothesis', revision: 1 });
    await insertManifestEntry(client, { slug, version: 1, hypothesisName: 'the-hypothesis', revision: 1, position: 1 });

    await expect(
      client.query(
        'UPDATE hypothesis_revisions SET criterion = $1 WHERE case_slug = $2 AND hypothesis_name = $3 AND revision = 1',
        ['A title the schema must refuse rather than merely ignore.', slug, 'the-hypothesis'],
      ),
    ).rejects.toMatchObject({
      code: 'P0001',
      message: expect.stringContaining('ReleasedHypothesisRevisionNotAlterableError'),
    });
  },
);
