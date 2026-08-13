// Proof for task/relational-stores/case-store, over a stand-in for DatabaseConnection — the driver
// boundary TST-03 permits a stand-in for — so RelationalCaseStore's own mechanics are observed
// independently of any real database: which statement text and params reach the connection, exactly
// when BEGIN/SET LOCAL/COMMIT/ROLLBACK/release happen relative to readVersion's own assembly and
// writeVersion's own ordered inserts, how a read row maps onto a Case, and how a driver failure or a
// malformed document reaches the caller as this store's own typed error. The real-effect half — that
// a write actually persists and is read back whole, that write-once is refused by a real primary-key
// violation and leaves the stored version untouched, and above all that a write commits or rolls back
// as one whole rather than in separate transactions (this task's own UNDERDETERMINED note) — is proven
// separately, against a real database, in this file's own integration-level sibling.
import { createHash } from 'node:crypto';
import { expect, it, vi } from 'vitest';
import type { Case, Hypothesis } from '../../../case/case.js';
import { CaseStoreError } from '../../../errors/case-store.error.js';
import { CaseVersionAlreadyStoredError } from '../../../errors/case-version-already-stored.error.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCaseStore } from '../../../persistence/relational-case-store.repository.js';

/** A bare connection whose own query() is backed by the given implementation — the shape listVersions calls directly, with no transaction opened. */
function fakeBareConnection(query: DatabaseConnection['query']): DatabaseConnection {
  return { query } as unknown as DatabaseConnection;
}

interface IFakeClient {
  readonly query: ReturnType<typeof vi.fn>;
  readonly release: ReturnType<typeof vi.fn>;
}

/** A fake DatabaseConnection whose connect() checks out one fake client backed by handleQuery, tracking every call to release() — the shape readVersion's and writeVersion's own transactions run through (database-access.spec.ts's own established convention). */
function fakeTransactionConnection(
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: unknown[] }>,
): { connection: DatabaseConnection; client: IFakeClient } {
  const client: IFakeClient = { query: vi.fn(handleQuery), release: vi.fn() };
  const connect = vi.fn().mockResolvedValue(client);
  return { connection: { connect } as unknown as DatabaseConnection, client };
}

/** Every statement text a fake transaction connection recorded, whitespace-collapsed so a multi-line SQL template compares the same as its single-line equivalent. */
function collapsedTexts(recorded: readonly { text: string }[]): string[] {
  return recorded.map((entry) => entry.text.replace(/\s+/g, ' ').trim());
}

interface IRoutedRows {
  readonly caseVersions: readonly unknown[];
  readonly hypotheses: readonly unknown[];
  readonly collects: readonly unknown[];
}

/** A handleQuery that answers each of readVersion's own three SELECTs from the given rows, recording every statement it saw in order — one row set per table, routed by which table the statement names. */
function recordingQuery(rows: IRoutedRows): {
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: unknown[] }>;
  recorded: { text: string; params?: readonly unknown[] }[];
} {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const handleQuery = async (text: string, params?: readonly unknown[]): Promise<{ rows: unknown[] }> => {
    recorded.push({ text, params });
    if (text.includes('FROM public.hypothesis_collects')) return { rows: [...rows.collects] };
    if (text.includes('FROM public.hypotheses')) return { rows: [...rows.hypotheses] };
    if (text.includes('FROM public.case_versions')) return { rows: [...rows.caseVersions] };
    return { rows: [] };
  };
  return { handleQuery, recorded };
}

/** One row of "case_versions", matching the default Case aCase() below builds. */
function caseVersionRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    title: 'A title',
    when_to_use: 'A use',
    authored_at: new Date('2024-01-01T00:00:00.000Z'),
    subject: 'a-subject-type',
    fallback_outcome: 'a-fallback-outcome',
    fallback_action: 'a-fallback-action',
    fallback_recipient: 'a-fallback-recipient',
    consolidation_register: null,
    ...overrides,
  };
}

/** One row of "hypotheses", matching aCase()'s own default hypothesis. */
function aHypothesisRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: 'a-hypothesis',
    position: 1,
    criterion: 'a criterion',
    resolution_outcome: 'an-outcome',
    resolution_action: 'an-action',
    resolution_recipient: 'a-recipient',
    ...overrides,
  };
}

/** One row of "hypothesis_collects", matching aCase()'s own default hypothesis's own collects. */
function aCollectRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { hypothesis_name: 'a-hypothesis', concept_name: 'a-concept', ...overrides };
}

interface IHypothesisOptions {
  readonly name: string;
  readonly position: number;
  readonly collects: readonly string[];
}

/** One hypothesis as writeVersion's own caller would submit it, its resolution held fixed since no test here varies it. */
function aHypothesis(options: IHypothesisOptions): Hypothesis {
  return {
    name: options.name,
    position: options.position,
    criterion: 'a criterion',
    collects: options.collects,
    resolution: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' } },
  };
}

/** A whole Case, exactly the shape caseVersionRow()/aHypothesisRow()/aCollectRow() together assemble back into by default, so a test may build one side from the document and the other from the rows and compare them directly. */
function aCase(overrides: Partial<Case> = {}): Case {
  return {
    slug: 'a-slug',
    title: 'A title',
    when_to_use: 'A use',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'a-subject-type',
    fallback: { outcome: 'a-fallback-outcome', referral: { action: 'a-fallback-action', recipient: 'a-fallback-recipient' } },
    hypotheses: [aHypothesis({ name: 'a-hypothesis', position: 1, collects: ['a-concept'] })],
    ...overrides,
  };
}

// ---------------------------------------------------------------- criterion 1, criterion 2

it('assembles the case root together with its hypotheses and their resolutions and referrals, all through the one transaction it opens', async () => {
  const { handleQuery, recorded } = recordingQuery({
    caseVersions: [caseVersionRow()],
    hypotheses: [aHypothesisRow()],
    collects: [aCollectRow()],
  });
  const { connection, client } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.readVersion('a-slug', 1);

  const texts = collapsedTexts(recorded);
  expect(texts).toEqual([
    'BEGIN',
    'SET LOCAL search_path TO public',
    'SELECT title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient, consolidation_register FROM public.case_versions WHERE slug = $1 AND version = $2',
    'SELECT name, position, criterion, resolution_outcome, resolution_action, resolution_recipient FROM public.hypotheses WHERE case_slug = $1 AND case_version = $2 ORDER BY position',
    'SELECT hypothesis_name, concept_name FROM public.hypothesis_collects WHERE case_slug = $1 AND case_version = $2 ORDER BY hypothesis_name, concept_name',
    'COMMIT',
  ]);
  expect(recorded.slice(2, 5).map((entry) => entry.params)).toEqual([['a-slug', 1], ['a-slug', 1], ['a-slug', 1]]);
  expect(answered?.document).toEqual(aCase());
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- criterion 3

it('answers undefined and reads no further, when case_versions holds no row for the given slug and version', async () => {
  const { handleQuery, recorded } = recordingQuery({ caseVersions: [], hypotheses: [], collects: [] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.readVersion('an-absent-slug', 1);

  expect(answered).toBeUndefined();
  expect(collapsedTexts(recorded)).toEqual([
    'BEGIN',
    'SET LOCAL search_path TO public',
    'SELECT title, when_to_use, authored_at, subject, fallback_outcome, fallback_action, fallback_recipient, consolidation_register FROM public.case_versions WHERE slug = $1 AND version = $2',
    'COMMIT',
  ]);
});

it("raises this store's own typed error, carrying the driver failure as its cause, when a read is refused", async () => {
  const driverFailure = new Error('the driver refused this read');
  const handleQuery = async (): Promise<{ rows: unknown[] }> => {
    throw driverFailure;
  };
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const rejection = store.readVersion('a-slug', 1);

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: driverFailure });
});

// ---------------------------------------------------------------- write mechanics: ordered inserts inside one transaction

it("runs the case identity insert, the version insert, and each hypothesis immediately followed by its own collects, as one unit of work — the identity insert's own idempotent ON CONFLICT never refusing an already-held slug", async () => {
  const { handleQuery, recorded } = recordingQuery({ caseVersions: [], hypotheses: [], collects: [] });
  const { connection, client } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);
  const theCase = aCase({
    hypotheses: [
      aHypothesis({ name: 'first', position: 1, collects: ['concept-a', 'concept-b'] }),
      aHypothesis({ name: 'second', position: 2, collects: ['concept-c'] }),
    ],
  });

  await store.writeVersion('a-slug', 1, theCase);

  const texts = collapsedTexts(recorded);
  expect(texts).toEqual([
    'BEGIN',
    'SET LOCAL search_path TO public',
    'INSERT INTO public.cases (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING',
    expect.stringContaining('INSERT INTO public.case_versions'),
    expect.stringContaining('INSERT INTO public.hypotheses'),
    expect.stringContaining('INSERT INTO public.hypothesis_collects'),
    expect.stringContaining('INSERT INTO public.hypothesis_collects'),
    expect.stringContaining('INSERT INTO public.hypotheses'),
    expect.stringContaining('INSERT INTO public.hypothesis_collects'),
    'COMMIT',
  ]);
  expect(recorded[2]?.params).toEqual(['a-slug']);
  expect(recorded[4]?.params).toEqual(['a-slug', 1, 'first', 1, 'a criterion', 'an-outcome', 'an-action', 'a-recipient']);
  expect(recorded[5]?.params).toEqual(['a-slug', 1, 'first', 'concept-a']);
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- criterion 4

// Sibling fix, disclosed in task/case-authoring/author-case-version-command's own proof record:
// this test used to assert the generic CaseStoreError, which is what every version-insert failure
// raised before that task's own extension of this store. The version-insert statement's own
// unique-violation is now distinguished into this store's own CaseVersionAlreadyStoredError instead
// (task/case-authoring/author-case-version-command's own criterion 2), so the driver failure below
// now carries the real Postgres unique-violation code (relational-investigation-store.repository.spec.ts's
// own established convention for faking one) rather than a bare Error with none, and the assertion
// is updated to match the behavior this store now actually has.
it("raises this store's own CaseVersionAlreadyStoredError, naming the slug and version, and rolls back, when a duplicate version violates the primary key", async () => {
  const driverFailure = Object.assign(
    new Error('duplicate key value violates unique constraint "case_versions_pkey"'),
    { code: '23505' },
  );
  const handleQuery = async (text: string): Promise<{ rows: unknown[] }> => {
    if (text.includes('INSERT INTO public.case_versions')) throw driverFailure;
    return { rows: [] };
  };
  const { connection, client } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const rejection = store.writeVersion('a-slug', 1, aCase());

  await expect(rejection).rejects.toBeInstanceOf(CaseVersionAlreadyStoredError);
  await expect(rejection).rejects.toMatchObject({ context: { slug: 'a-slug', version: 1 } });
  expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  expect(client.release).toHaveBeenCalledTimes(1);
});

it("still raises the generic CaseStoreError, carrying the driver failure as its cause, for a version-insert failure that is not a real unique-constraint violation", async () => {
  const driverFailure = new Error('the connection to the database was lost');
  const handleQuery = async (text: string): Promise<{ rows: unknown[] }> => {
    if (text.includes('INSERT INTO public.case_versions')) throw driverFailure;
    return { rows: [] };
  };
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const rejection = store.writeVersion('a-slug', 1, aCase());

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.not.toBeInstanceOf(CaseVersionAlreadyStoredError);
  await expect(rejection).rejects.toMatchObject({ cause: driverFailure });
});

// ---------------------------------------------------------------- criterion 6

it("answers exactly the version numbers the query answered, in the order it answered them, trusting the database's own ORDER BY", async () => {
  const query = vi.fn().mockResolvedValue({ rows: [{ version: 1 }, { version: 3 }, { version: 2 }] });
  const store = new RelationalCaseStore(fakeBareConnection(query));

  const versions = await store.listVersions('a-slug');

  expect(versions).toEqual([1, 3, 2]);
  expect(query).toHaveBeenCalledWith('SELECT version FROM public.case_versions WHERE slug = $1 ORDER BY version', ['a-slug']);
});

it("raises this store's own typed error, carrying the driver failure as its cause, when listing versions is refused", async () => {
  const driverFailure = new Error('the driver refused this read');
  const query = vi.fn().mockRejectedValue(driverFailure);
  const store = new RelationalCaseStore(fakeBareConnection(query));

  const rejection = store.listVersions('a-slug');

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: driverFailure });
});

// ---------------------------------------------------------------- edge case: no version ever written under a slug

it('answers no versions at all for a slug nothing was ever written under', async () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const store = new RelationalCaseStore(fakeBareConnection(query));

  await expect(store.listVersions('an-absent-slug')).resolves.toEqual([]);
});

// ---------------------------------------------------------------- inference: a malformed document is wrapped the same way a driver failure is

it("wraps a failure while mapping a malformed document into statements into this store's own typed error, the same way a driver failure already is", async () => {
  const { connection } = fakeTransactionConnection(async () => ({ rows: [] }));
  const store = new RelationalCaseStore(connection);
  const malformedDocument = { slug: 'a-slug' };

  const rejection = store.writeVersion('a-slug', 1, malformedDocument);

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
});

// ---------------------------------------------------------------- inference: the hash is sha256 of the assembled document's own JSON

it("computes StoredCaseVersion's own hash as sha256 of the assembled document's own JSON serialization", async () => {
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow()], hypotheses: [aHypothesisRow()], collects: [aCollectRow()] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.readVersion('a-slug', 1);

  const expectedHash = createHash('sha256').update(JSON.stringify(aCase()), 'utf8').digest('hex');
  expect(answered?.hash).toBe(expectedHash);
});

// ---------------------------------------------------------------- inference: authored_at is read back as a Date, converted with toISOString()

it('reads authored_at back as the Date column parses to, converted with its own toISOString()', async () => {
  const authoredAt = new Date('2024-03-01T10:15:30.250Z');
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow({ authored_at: authoredAt })], hypotheses: [], collects: [] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.readVersion('a-slug', 1);

  expect((answered?.document as Case).authored_at).toBe('2024-03-01T10:15:30.250Z');
});

// ---------------------------------------------------------------- inference: slug and version come from the given key, never from a row

it("takes the document's own slug and version from the given key, never from a column of case_versions", async () => {
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow()], hypotheses: [], collects: [] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.readVersion('the-given-slug', 42);

  expect((answered?.document as Case).slug).toBe('the-given-slug');
  expect((answered?.document as Case).version).toBe(42);
});

// ---------------------------------------------------------------- inference: consolidation_register is re-narrowed against its own enumeration

it('leaves consolidation_register out of the assembled document entirely when the stored value is null', async () => {
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow({ consolidation_register: null })], hypotheses: [], collects: [] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.readVersion('a-slug', 1);

  expect(answered?.document).not.toHaveProperty('consolidation_register');
});

it("carries a stored consolidation_register through unchanged when it is one of the enumeration's own declared values", async () => {
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow({ consolidation_register: 'formal' })], hypotheses: [], collects: [] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.readVersion('a-slug', 1);

  expect((answered?.document as Case).consolidation_register).toBe('formal');
});

it("raises this store's own typed error rather than answering a row whose consolidation_register is outside the declared enumeration", async () => {
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow({ consolidation_register: 'not-a-register' })], hypotheses: [], collects: [] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  await expect(store.readVersion('a-slug', 1)).rejects.toBeInstanceOf(CaseStoreError);
});
