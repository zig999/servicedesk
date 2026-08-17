// Proof for task/case-lifecycle-persistence/relational-case-store-for-lifecycle, over a stand-in
// for DatabaseConnection — the driver boundary TST-03 permits a stand-in for — so
// RelationalCaseStore's own mechanics are observed independently of any real database: which
// statement text and params reach the connection, exactly when BEGIN/SET LOCAL/COMMIT/ROLLBACK/
// release happen relative to each store primitive's own unit of work, how a joined row set maps
// onto an AssembledCaseVersion, and how a driver failure — generic or a specific named constraint
// violation — reaches the caller as this store's own typed error. The real-effect half — that a
// draft's manifest is really copied, that a second draft is really refused by the schema's own
// partial unique index under a genuine race, that a released version's row and manifest entries
// really cannot be moved afterward, and that discard leaves a released version untouched — is
// proven separately, against a real database, in this file's own integration-level sibling.
//
// Full replacement of this file's previous content, which targeted readVersion/writeVersion/
// listVersions and StoredCaseVersion: none of the three exist anymore (case-store.port.ts's own
// header comment), replaced below by assembleVersion, createDraft, insertHypothesisRevision,
// placeHypothesis, removeManifestEntry, release and discard.
import { expect, it, vi } from 'vitest';
import {
  type AssembledCaseVersion,
  type CreateDraftInput,
  type HypothesisRevisionInput,
  type PlaceHypothesisInput,
} from '../../../case/case-store.port.js';
import type { Resolution } from '../../../case/case.js';
import { CaseAlreadyHasDraftError } from '../../../errors/case-already-has-draft.error.js';
import { CaseStoreError } from '../../../errors/case-store.error.js';
import { ManifestPositionOccupiedError } from '../../../errors/manifest-position-occupied.error.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalCaseStore } from '../../../persistence/relational-case-store.repository.js';

/** Postgres' own unique-violation SQLSTATE, the same code the adapter itself disambiguates by constraint name (TYP-04). */
const UNIQUE_VIOLATION_CODE = '23505';

type Row = Record<string, unknown>;

/** A bare connection whose own query() is backed by the given implementation — the shape placeHypothesis, removeManifestEntry and release each call directly, with no transaction opened. */
function fakeBareConnection(query: DatabaseConnection['query']): DatabaseConnection {
  return { query } as unknown as DatabaseConnection;
}

interface IFakeClient {
  readonly query: ReturnType<typeof vi.fn>;
  readonly release: ReturnType<typeof vi.fn>;
}

/** A fake DatabaseConnection whose connect() checks out one fake client backed by handleQuery, tracking every call to release() — the shape assembleVersion, createDraft, insertHypothesisRevision and discard each run their own unit of work through. */
function fakeTransactionConnection(
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: Row[] }>,
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
  readonly caseVersions?: readonly Row[];
  readonly manifest?: readonly Row[];
  readonly collects?: readonly Row[];
}

/** A handleQuery that answers assembleVersion's own three SELECTs from the given rows, routed by which table each statement names, recording every statement it saw in order. */
function recordingQuery(rows: IRoutedRows): {
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: Row[] }>;
  recorded: { text: string; params?: readonly unknown[] }[];
} {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const handleQuery = async (text: string, params?: readonly unknown[]): Promise<{ rows: Row[] }> => {
    recorded.push({ text, params });
    if (text.includes('hypothesis_revision_collects')) return { rows: [...(rows.collects ?? [])] };
    if (text.includes('hypothesis_revisions')) return { rows: [...(rows.manifest ?? [])] };
    if (text.includes('FROM public.case_versions')) return { rows: [...(rows.caseVersions ?? [])] };
    return { rows: [] };
  };
  return { handleQuery, recorded };
}

/** One row of "case_versions", matching aResolution()'s own default fallback triple. */
function caseVersionRow(overrides: Row = {}): Row {
  return {
    title: 'A title',
    when_to_use: 'A use',
    authored_at: new Date('2024-01-01T00:00:00.000Z'),
    subject: 'a-subject-type',
    fallback_outcome: 'a-fallback-outcome',
    fallback_action: 'a-fallback-action',
    fallback_recipient: 'a-fallback-recipient',
    consolidation_register: null,
    state: 'released',
    released_at: new Date('2024-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

/** One joined manifest row, position plus its adopted hypothesis-revision's own content. */
function manifestRow(overrides: Row = {}): Row {
  return {
    position: 1,
    hypothesis_name: 'a-hypothesis',
    revision: 1,
    criterion: 'a criterion',
    resolution_outcome: 'an-outcome',
    resolution_action: 'an-action',
    resolution_recipient: 'a-recipient',
    ...overrides,
  };
}

/** One row of a manifest entry's own adopted revision's collects. */
function collectRow(overrides: Row = {}): Row {
  return { hypothesis_name: 'a-hypothesis', concept_name: 'a-concept', ...overrides };
}

/** A resolution as any of the three shapes this store flattens carries it, its outcome/action/recipient held fixed since no test here varies them independently. */
function aResolution(overrides: Partial<Resolution> = {}): Resolution {
  return { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' }, ...overrides };
}

/** A driver failure carrying Postgres' own unique-violation code and, where named, the constraint that fired — the shape the adapter's own isConstraintViolation guard disambiguates by. */
function uniqueViolation(constraint?: string): Error {
  return Object.assign(new Error('duplicate key value violates unique constraint'), {
    code: UNIQUE_VIOLATION_CODE,
    ...(constraint !== undefined ? { constraint } : {}),
  });
}

// ================================================================== assembleVersion

// ---------------------------------------------------------------- criterion 1

it('assembles one version together with its manifest, joining each entry to its own adopted hypothesis-revision and its collects, all through the one transaction it opens, and delegates the ordering to the query it sends', async () => {
  // The rows here arrive already in the order the real SELECT's own ORDER BY cvh.position would
  // hand back (this file's own integration-level sibling proves that real ordering against a real
  // database); this test proves the store neither resorts nor reverses what the query answers, and
  // that the query it actually sends states that ordering itself.
  const { handleQuery, recorded } = recordingQuery({
    caseVersions: [caseVersionRow()],
    manifest: [
      manifestRow({ position: 1, hypothesis_name: 'first', revision: 3 }),
      manifestRow({ position: 2, hypothesis_name: 'second', revision: 1 }),
    ],
    collects: [collectRow({ hypothesis_name: 'first', concept_name: 'concept-a' }), collectRow({ hypothesis_name: 'second', concept_name: 'concept-b' })],
  });
  const { connection, client } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.assembleVersion('a-slug', 1);

  const texts = collapsedTexts(recorded);
  expect(texts[0]).toBe('BEGIN');
  expect(texts[1]).toBe('SET LOCAL search_path TO public');
  expect(texts).toContain('COMMIT');
  expect(texts.some((text) => text.includes('ORDER BY cvh.position'))).toBe(true);
  expect(answered?.manifest).toEqual([
    { position: 1, hypothesis_revision: expect.objectContaining({ hypothesis_name: 'first', revision: 3, collects: ['concept-a'] }) },
    { position: 2, hypothesis_revision: expect.objectContaining({ hypothesis_name: 'second', revision: 1, collects: ['concept-b'] }) },
  ]);
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- criterion 2

it('answers undefined and reads no manifest at all, when case_versions holds no row for the given slug and version', async () => {
  const { handleQuery, recorded } = recordingQuery({ caseVersions: [] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.assembleVersion('an-absent-slug', 1);

  expect(answered).toBeUndefined();
  expect(collapsedTexts(recorded)).toEqual([
    'BEGIN',
    'SET LOCAL search_path TO public',
    expect.stringContaining('FROM public.case_versions'),
    'COMMIT',
  ]);
});

it("raises this store's own typed error, carrying the driver failure as its cause, when a read is refused", async () => {
  const driverFailure = new Error('the driver refused this read');
  const { connection } = fakeTransactionConnection(async () => {
    throw driverFailure;
  });
  const store = new RelationalCaseStore(connection);

  const rejection = store.assembleVersion('a-slug', 1);

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: driverFailure });
});

// ---------------------------------------------------------------- inference: slug/version come from the given key

it('takes the assembled version\'s own slug and version from the given key', async () => {
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow()] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.assembleVersion('the-given-slug', 42);

  expect(answered?.slug).toBe('the-given-slug');
  expect(answered?.version).toBe(42);
});

// ---------------------------------------------------------------- inference: authored_at converted with toISOString()

it("reads authored_at back as the Date column parses to, converted with its own toISOString()", async () => {
  const authoredAt = new Date('2024-03-01T10:15:30.250Z');
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow({ authored_at: authoredAt })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.assembleVersion('a-slug', 1);

  expect(answered?.authored_at).toBe('2024-03-01T10:15:30.250Z');
});

// ---------------------------------------------------------------- inference: consolidation_register narrowed to its own enumeration

it('leaves consolidation_register out of the assembled version entirely when the stored value is null', async () => {
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow({ consolidation_register: null })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.assembleVersion('a-slug', 1);

  expect(answered).not.toHaveProperty('consolidation_register');
});

it("carries a stored consolidation_register through unchanged when it is one of the enumeration's own declared values", async () => {
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow({ consolidation_register: 'formal' })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.assembleVersion('a-slug', 1);

  expect(answered?.consolidation_register).toBe('formal');
});

it("raises this store's own typed error rather than answering a row whose consolidation_register is outside the declared enumeration", async () => {
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow({ consolidation_register: 'not-a-register' })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  await expect(store.assembleVersion('a-slug', 1)).rejects.toBeInstanceOf(CaseStoreError);
});

// ---------------------------------------------------------------- inference: state narrowed to its own enumeration, released_at present only when the row carries one

it('leaves released_at out of the assembled version entirely when the stored row is a draft with no released_at', async () => {
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow({ state: 'draft', released_at: null })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = await store.assembleVersion('a-slug', 1);

  expect(answered?.state).toBe('draft');
  expect(answered).not.toHaveProperty('released_at');
});

it("raises this store's own typed error rather than answering a row whose state is outside the declared enumeration", async () => {
  const { handleQuery } = recordingQuery({ caseVersions: [caseVersionRow({ state: 'archived' })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  await expect(store.assembleVersion('a-slug', 1)).rejects.toBeInstanceOf(CaseStoreError);
});

// ================================================================== createDraft

// ---------------------------------------------------------------- criterion 3, criterion 4

function aCreateDraftInput(overrides: Partial<CreateDraftInput> = {}): CreateDraftInput {
  return {
    slug: 'a-slug',
    title: 'A title',
    when_to_use: 'A use',
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'a-subject-type',
    fallback: aResolution(),
    ...overrides,
  };
}

it('runs the case-identity insert, assigns the next version off its own durable counter, and copies the named source version\'s manifest, as one unit of work', async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const handleQuery = async (text: string, params?: readonly unknown[]): Promise<{ rows: Row[] }> => {
    recorded.push({ text, params });
    if (text.includes('SET next_version')) return { rows: [{ version: 5 }] };
    return { rows: [] };
  };
  const { connection, client } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const version = await store.createDraft(aCreateDraftInput({ source_version: 3 }));

  expect(version).toBe(5);
  const texts = collapsedTexts(recorded);
  expect(texts[0]).toBe('BEGIN');
  expect(texts[2]).toContain('INSERT INTO public.cases');
  expect(texts[3]).toContain('SET next_version');
  expect(texts[4]).toContain('INSERT INTO public.case_versions');
  expect(texts[5]).toContain('INSERT INTO public.case_version_hypotheses');
  expect(texts.at(-1)).toBe('COMMIT');
  expect(recorded[5]?.params).toEqual(['a-slug', 5, 3]);
  expect(client.release).toHaveBeenCalledTimes(1);
});

it('skips copying any manifest when naming no source version and the case holds no released version yet', async () => {
  const recorded: string[] = [];
  const handleQuery = async (text: string): Promise<{ rows: Row[] }> => {
    recorded.push(text.replace(/\s+/g, ' ').trim());
    if (text.includes('SET next_version')) return { rows: [{ version: 1 }] };
    if (text.includes('MAX(version)')) return { rows: [{ version: null }] };
    return { rows: [] };
  };
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  await store.createDraft(aCreateDraftInput());

  expect(recorded.some((text) => text.includes('INSERT INTO public.case_version_hypotheses'))).toBe(false);
});

it("raises this store's own CaseAlreadyHasDraftError, naming the slug, and rolls back, when the one-draft-per-case constraint is violated", async () => {
  const handleQuery = async (text: string): Promise<{ rows: Row[] }> => {
    if (text.includes('SET next_version')) return { rows: [{ version: 2 }] };
    if (text.includes('INSERT INTO public.case_versions')) throw uniqueViolation('case_versions_one_draft_per_case');
    return { rows: [] };
  };
  const { connection, client } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const rejection = store.createDraft(aCreateDraftInput());

  await expect(rejection).rejects.toBeInstanceOf(CaseAlreadyHasDraftError);
  await expect(rejection).rejects.toMatchObject({ context: { slug: 'a-slug' } });
  expect(client.query).toHaveBeenCalledWith('ROLLBACK');
});

it('still raises the generic CaseStoreError for a draft-insert failure that is not that particular constraint violation', async () => {
  const driverFailure = new Error('the connection to the database was lost');
  const handleQuery = async (text: string): Promise<{ rows: Row[] }> => {
    if (text.includes('SET next_version')) return { rows: [{ version: 2 }] };
    if (text.includes('INSERT INTO public.case_versions')) throw driverFailure;
    return { rows: [] };
  };
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const rejection = store.createDraft(aCreateDraftInput());

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.not.toBeInstanceOf(CaseAlreadyHasDraftError);
});

// ================================================================== insertHypothesisRevision

// ---------------------------------------------------------------- criterion 6, criterion 7

function aHypothesisRevisionInput(overrides: Partial<HypothesisRevisionInput> = {}): HypothesisRevisionInput {
  return {
    slug: 'a-slug',
    hypothesis_name: 'a-hypothesis',
    criterion: 'a criterion',
    collects: ['concept-a', 'concept-b'],
    resolution: aResolution(),
    ...overrides,
  };
}

it("claims the hypothesis's own identity idempotently, inserts the revision numbered off its own highest existing revision, and inserts its own collects, as one unit of work", async () => {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const handleQuery = async (text: string, params?: readonly unknown[]): Promise<{ rows: Row[] }> => {
    recorded.push({ text, params });
    if (text.includes('INSERT INTO public.hypothesis_revisions')) return { rows: [{ revision: 4 }] };
    return { rows: [] };
  };
  const { connection, client } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const revision = await store.insertHypothesisRevision(aHypothesisRevisionInput());

  expect(revision).toBe(4);
  const texts = collapsedTexts(recorded);
  expect(texts[2]).toContain('INSERT INTO public.hypotheses');
  expect(texts[3]).toContain('INSERT INTO public.hypothesis_revisions');
  expect(texts[4]).toContain('INSERT INTO public.hypothesis_revision_collects');
  expect(texts[5]).toContain('INSERT INTO public.hypothesis_revision_collects');
  expect(recorded[2]?.params).toEqual(['a-slug', 'a-hypothesis']);
  expect(recorded[4]?.params).toEqual(['a-slug', 'a-hypothesis', 4, 'concept-a']);
  expect(client.release).toHaveBeenCalledTimes(1);
});

it("raises this store's own typed error, carrying the driver failure as its cause, when inserting a revision is refused", async () => {
  const driverFailure = new Error('the driver refused this write');
  const { connection } = fakeTransactionConnection(async () => {
    throw driverFailure;
  });
  const store = new RelationalCaseStore(connection);

  const rejection = store.insertHypothesisRevision(aHypothesisRevisionInput());

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: driverFailure });
});

// ================================================================== placeHypothesis / removeManifestEntry

// ---------------------------------------------------------------- criterion 8

function aPlaceHypothesisInput(overrides: Partial<PlaceHypothesisInput> = {}): PlaceHypothesisInput {
  return { slug: 'a-slug', version: 1, hypothesis_name: 'a-hypothesis', revision: 1, position: 1, ...overrides };
}

it('places one hypothesis-revision at one manifest position through a single statement against the connection, with no transaction opened', async () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const store = new RelationalCaseStore(fakeBareConnection(query));

  await store.placeHypothesis(aPlaceHypothesisInput({ position: 3 }));

  expect(query).toHaveBeenCalledTimes(1);
  expect(query.mock.calls[0]?.[0]).toContain('INSERT INTO public.case_version_hypotheses');
  expect(query.mock.calls[0]?.[1]).toEqual(['a-slug', 1, 'a-hypothesis', 1, 3]);
});

it("raises this store's own ManifestPositionOccupiedError, naming the slug, version and position, when the position-unique constraint is violated", async () => {
  const query = vi.fn().mockRejectedValue(uniqueViolation('case_version_hypotheses_position_unique'));
  const store = new RelationalCaseStore(fakeBareConnection(query));

  const rejection = store.placeHypothesis(aPlaceHypothesisInput({ position: 2 }));

  await expect(rejection).rejects.toBeInstanceOf(ManifestPositionOccupiedError);
  await expect(rejection).rejects.toMatchObject({ context: { slug: 'a-slug', version: 1, position: 2 } });
});

it('still raises the generic CaseStoreError for a place-hypothesis failure that is not that particular constraint violation', async () => {
  const query = vi.fn().mockRejectedValue(uniqueViolation('case_version_hypotheses_pkey'));
  const store = new RelationalCaseStore(fakeBareConnection(query));

  const rejection = store.placeHypothesis(aPlaceHypothesisInput());

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.not.toBeInstanceOf(ManifestPositionOccupiedError);
});

// ---------------------------------------------------------------- criterion 9

it('removes only the named manifest entry through a single statement, never touching the hypothesis-revision it referenced', async () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const store = new RelationalCaseStore(fakeBareConnection(query));

  await store.removeManifestEntry('a-slug', 1, 'a-hypothesis');

  expect(query).toHaveBeenCalledTimes(1);
  const [text, params] = query.mock.calls[0] as [string, readonly unknown[]];
  expect(text).toContain('DELETE FROM public.case_version_hypotheses');
  expect(text).not.toContain('hypothesis_revisions');
  expect(params).toEqual(['a-slug', 1, 'a-hypothesis']);
});

// ================================================================== release / discard

// ---------------------------------------------------------------- criterion 10

it('transitions the version to released, recording the instant of release, through a single statement', async () => {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const store = new RelationalCaseStore(fakeBareConnection(query));

  await store.release('a-slug', 1);

  expect(query).toHaveBeenCalledTimes(1);
  const [text, params] = query.mock.calls[0] as [string, readonly unknown[]];
  expect(text).toContain('SET state = $3, released_at = NOW()');
  expect(params).toEqual(['a-slug', 1, 'released']);
});

it("raises this store's own typed error, carrying the driver failure as its cause, when release is refused", async () => {
  const driverFailure = new Error('the driver refused this write');
  const query = vi.fn().mockRejectedValue(driverFailure);
  const store = new RelationalCaseStore(fakeBareConnection(query));

  const rejection = store.release('a-slug', 1);

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: driverFailure });
});

// ---------------------------------------------------------------- criterion 11

it("removes a draft version's own manifest entries before its own row, as one unit of work, never touching any hypothesis-revision", async () => {
  const recorded: { text: string }[] = [];
  const handleQuery = async (text: string): Promise<{ rows: Row[] }> => {
    recorded.push({ text });
    return { rows: [] };
  };
  const { connection, client } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  await store.discard('a-slug', 1);

  const texts = collapsedTexts(recorded);
  expect(texts[2]).toContain('DELETE FROM public.case_version_hypotheses');
  expect(texts[3]).toContain('DELETE FROM public.case_versions');
  expect(texts.some((text) => text.includes('hypothesis_revisions'))).toBe(false);
  expect(client.release).toHaveBeenCalledTimes(1);
});

it("raises this store's own typed error, carrying the driver failure as its cause, when discard is refused", async () => {
  const driverFailure = new Error('the driver refused this write');
  const { connection } = fakeTransactionConnection(async () => {
    throw driverFailure;
  });
  const store = new RelationalCaseStore(connection);

  const rejection = store.discard('a-slug', 1);

  await expect(rejection).rejects.toBeInstanceOf(CaseStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: driverFailure });
});

// ---------------------------------------------------------------- inference: an assembled version's own shape is stable end to end

it('answers an AssembledCaseVersion carrying exactly the manifest entries it was given, with no entry lost or duplicated', async () => {
  const { handleQuery } = recordingQuery({
    caseVersions: [caseVersionRow()],
    manifest: [manifestRow()],
    collects: [],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalCaseStore(connection);

  const answered = (await store.assembleVersion('a-slug', 1)) as AssembledCaseVersion;

  expect(answered.manifest).toHaveLength(1);
  expect(answered.manifest[0]?.hypothesis_revision.collects).toEqual([]);
});
