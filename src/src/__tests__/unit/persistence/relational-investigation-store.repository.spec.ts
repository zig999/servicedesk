// Proof for task/relational-stores/investigation-store, over a stand-in for DatabaseConnection — the
// driver boundary TST-03 permits a stand-in for — so RelationalInvestigationStore's own mechanics are
// observed independently of any real database: which statement text and params reach the connection,
// exactly when BEGIN/SET LOCAL/COMMIT/ROLLBACK/release happen relative to write()'s own ordered
// inserts and read()'s own whole assembly, how a stored row maps back onto an Investigation and its
// parts, and how a driver failure or an unrecognized enumeration value reaches the caller as this
// store's own typed error.
//
// This file is also where this task's own UNDERDETERMINED note is partly excluded: a store persisting
// only the eight fields criterion 6 names, with no capability pin, would still pass a test that never
// looks at capability_name/capability_version — "carries each evidence item's capability_name and
// capability_version pin" below asserts the pin travels through write()'s own params and read()'s own
// assembled Evidence, not only the eight named fields. The other half — that a write naming a
// capability/version the real capabilities table does not hold is refused by a real foreign key — is
// proven separately, against a real database, in this file's own integration-level sibling; so is the
// real-effect half of write-once (a real primary-key violation leaving the stored record untouched)
// and of criterion 2 (a real constraint violation partway through a multi-statement write leaving
// nothing behind).
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it, vi } from 'vitest';
import { InvestigationAlreadyStoredError } from '../../../errors/investigation-already-stored.error.js';
import { InvestigationStoreError } from '../../../errors/investigation-store.error.js';
import type { Citation } from '../../../investigation/citation.js';
import type { EvaluationReason } from '../../../investigation/evaluation-reason.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import type { Investigation } from '../../../investigation/investigation.js';
import type { DatabaseConnection } from '../../../persistence/database-connection.js';
import { RelationalInvestigationStore } from '../../../persistence/relational-investigation-store.repository.js';

/** The path of the module under test, read as text below for this file's own criterion-10 check. */
const MODULE_SOURCE_PATH = fileURLToPath(new URL('../../../persistence/relational-investigation-store.repository.ts', import.meta.url));

interface IFakeClient {
  readonly query: ReturnType<typeof vi.fn>;
  readonly release: ReturnType<typeof vi.fn>;
}

/** A fake DatabaseConnection whose connect() checks out one fake client backed by handleQuery, tracking every call to release() — the shape write() and read() both run their one transaction through (database-access.spec.ts's own established convention). */
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
  readonly investigation?: Record<string, unknown>;
  readonly attributes?: readonly unknown[];
  readonly evidence?: readonly unknown[];
  readonly evaluations?: readonly unknown[];
  readonly citations?: readonly unknown[];
}

/** A handleQuery that answers read()'s five SELECTs from the given rows and lets every write INSERT succeed with no rows, recording every statement it saw in order — one row set per table, routed by which table the statement names. */
function recordingQuery(rows: IRoutedRows): {
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: unknown[] }>;
  recorded: { text: string; params?: readonly unknown[] }[];
} {
  const recorded: { text: string; params?: readonly unknown[] }[] = [];
  const handleQuery = async (text: string, params?: readonly unknown[]): Promise<{ rows: unknown[] }> => {
    recorded.push({ text, params });
    if (text.includes('FROM investigation_evaluation_citations')) return { rows: [...(rows.citations ?? [])] };
    if (text.includes('FROM investigation_evaluations')) return { rows: [...(rows.evaluations ?? [])] };
    if (text.includes('FROM investigation_evidence')) return { rows: [...(rows.evidence ?? [])] };
    if (text.includes('FROM investigation_subject_attribute_values')) return { rows: [...(rows.attributes ?? [])] };
    if (text.includes('FROM investigations')) return { rows: rows.investigation ? [rows.investigation] : [] };
    return { rows: [] };
  };
  return { handleQuery, recorded };
}

/** One row of "investigations", matching the default Investigation anInvestigation() below builds. */
function investigationRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    requester: 'a-requester',
    ticket_ref: 'a-ticket-ref',
    narrative: 'a narrative',
    subject_type: 'a-subject-type',
    prompt_version: 'a-prompt-version',
    model: 'a-model',
    pinned_case_slug: 'a-case-slug',
    pinned_case_version: 1,
    assessment_outcome: 'an-outcome',
    assessment_action: 'an-action',
    assessment_recipient: 'a-recipient',
    assessment_determining_hypothesis: 'a-hypothesis',
    assessment_text: 'assessment text',
    cost_calls: 3,
    cost_input_tokens: 100,
    cost_output_tokens: 50,
    durations_collection: 10,
    durations_judgment: 20,
    durations_writing: 5,
    durations_total: 35,
    written_at: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

/** One row of "investigation_evidence", matching anEvidence()'s own defaults. */
function evidenceRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    concept: 'a-concept',
    inputs: 'serialized-inputs',
    observation: 'an-observation',
    observed_at: new Date('2024-01-01T00:00:00.000Z'),
    ttl: 60,
    origin: 'a-connector',
    result: 'ok',
    result_detail: null,
    capability_name: 'a-capability',
    capability_version: '1.0.0',
    elapsed_ms: 12,
    ...overrides,
  };
}

/** One row of "investigation_evaluations". */
function evaluationRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { hypothesis: 'a-hypothesis', verdict: 'confirmed', reason: null, ...overrides };
}

/** One row of "investigation_evaluation_citations". */
function citationRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { hypothesis: 'a-hypothesis', concept: 'a-concept', field: 'a-field', ...overrides };
}

/** One Evidence item, matching evidenceRow()'s own defaults, so a test may build one side from the document and the other from the row and compare them directly. */
function anEvidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    concept: 'a-concept',
    inputs: 'serialized-inputs',
    observation: 'an-observation',
    observed_at: '2024-01-01T00:00:00.000Z',
    ttl: 60,
    origin: 'a-connector',
    result: 'ok',
    capability_name: 'a-capability',
    capability_version: '1.0.0',
    elapsed_ms: 12,
    ...overrides,
  };
}

interface IDecidedOverrides {
  readonly hypothesis?: string;
  readonly verdict?: 'confirmed' | 'refuted';
  readonly citations?: readonly [Citation, ...Citation[]];
}

/** One confirmed or refuted Evaluation, its citations required non-empty by the type itself. */
function aDecidedEvaluation(overrides: IDecidedOverrides = {}): Evaluation {
  const hypothesis = overrides.hypothesis ?? 'a-hypothesis';
  const citations = overrides.citations ?? [{ concept: 'a-concept', field: 'a-field' }];
  return overrides.verdict === 'refuted' ? { hypothesis, verdict: 'refuted', citations } : { hypothesis, verdict: 'confirmed', citations };
}

interface IInconclusiveOverrides {
  readonly hypothesis?: string;
  readonly reason?: EvaluationReason;
  readonly citations?: readonly Citation[];
}

/** One inconclusive Evaluation, carrying a reason and whatever citations it grounds on, possibly none. */
function anInconclusiveEvaluation(overrides: IInconclusiveOverrides = {}): Evaluation {
  return {
    hypothesis: overrides.hypothesis ?? 'a-hypothesis',
    verdict: 'inconclusive',
    reason: overrides.reason ?? 'no-data',
    citations: overrides.citations ?? [],
  };
}

/** A whole Investigation, matching investigationRow()/evidenceRow()/evaluationRow() together by default. */
function anInvestigation(overrides: Partial<Investigation> = {}): Investigation {
  return {
    id: 'an-investigation-id',
    requester: 'a-requester',
    ticket_ref: 'a-ticket-ref',
    narrative: 'a narrative',
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
    pinned_case: { slug: 'a-case-slug', version: 1 },
    prompt_version: 'a-prompt-version',
    model: 'a-model',
    evidence: [anEvidence()],
    evaluations: [aDecidedEvaluation()],
    assessment: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' }, determining_hypothesis: 'a-hypothesis', text: 'assessment text' },
    cost: { calls: 3, input_tokens: 100, output_tokens: 50 },
    durations: { collection: 10, judgment: 20, writing: 5, total: 35 },
    written_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------- criterion 1

it("sends every declared attribute of the root row — identity, subject type, prompt version, model, pinned case, assessment, cost, durations and written_at — as the root insert's own params, in order", async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.write(anInvestigation());

  const rootInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigations'));
  expect(rootInsert?.params).toEqual([
    'an-investigation-id', 'a-requester', 'a-ticket-ref', 'a narrative', 'a-subject-type', 'a-prompt-version', 'a-model',
    'a-case-slug', 1,
    'an-outcome', 'an-action', 'a-recipient', 'a-hypothesis', 'assessment text',
    3, 100, 50,
    10, 20, 5, 35,
    '2024-01-01T00:00:00.000Z',
  ]);
});

it('inserts the root row first, then every subject attribute-value, every evidence item, and each evaluation immediately followed by its own citations, all through the one transaction it opens', async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection, client } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);
  const investigation = anInvestigation({
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'attribute-a', value: 'value-a' }, { attribute: 'attribute-b', value: 'value-b' }] },
    evidence: [anEvidence({ concept: 'concept-a' }), anEvidence({ concept: 'concept-b' })],
    evaluations: [aDecidedEvaluation({ hypothesis: 'first' }), anInconclusiveEvaluation({ hypothesis: 'second' })],
  });

  await store.write(investigation);

  expect(collapsedTexts(recorded)).toEqual([
    'BEGIN',
    expect.stringContaining('INSERT INTO investigations'),
    expect.stringContaining('INSERT INTO investigation_subject_attribute_values'),
    expect.stringContaining('INSERT INTO investigation_subject_attribute_values'),
    expect.stringContaining('INSERT INTO investigation_evidence'),
    expect.stringContaining('INSERT INTO investigation_evidence'),
    expect.stringContaining('INSERT INTO investigation_evaluations'),
    expect.stringContaining('INSERT INTO investigation_evaluation_citations'),
    expect.stringContaining('INSERT INTO investigation_evaluations'),
    'COMMIT',
  ]);
  expect(client.release).toHaveBeenCalledTimes(1);
});

it("inserts one row per subject attribute-value the investigation's subject carries", async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);
  const investigation = anInvestigation({
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'attribute-a', value: 'value-a' }, { attribute: 'attribute-b', value: 'value-b' }] },
  });

  await store.write(investigation);

  const attributeInserts = recorded.filter((entry) => entry.text.includes('INSERT INTO investigation_subject_attribute_values'));
  expect(attributeInserts.map((entry) => entry.params)).toEqual([
    [investigation.id, 'attribute-a', 'value-a'],
    [investigation.id, 'attribute-b', 'value-b'],
  ]);
});

it("carries each evidence item's capability_name and capability_version pin into its own insert row, not only the eight fields criterion 6 names explicitly", async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);
  const investigation = anInvestigation({ evidence: [anEvidence({ concept: 'a-concept', capability_name: 'a-registered-capability', capability_version: '2.0.0' })] });

  await store.write(investigation);

  const evidenceInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigation_evidence'));
  expect(evidenceInsert?.params).toEqual([
    investigation.id, 'a-concept', 'serialized-inputs', 'an-observation', '2024-01-01T00:00:00.000Z', 60, 'a-connector', 'ok', null,
    'a-registered-capability', '2.0.0', 12,
  ]);
});

// ---------------------------------------------------------------- criterion 2

it("rolls back and raises this store's own typed error, carrying the driver failure as its cause, when an evidence insert fails after the root row and the subject attribute-values already succeeded", async () => {
  const driverFailure = new Error('the driver refused this insert');
  const handleQuery = async (text: string): Promise<{ rows: unknown[] }> => {
    if (text.includes('INSERT INTO investigation_evidence')) throw driverFailure;
    return { rows: [] };
  };
  const { connection, client } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const rejection = store.write(anInvestigation());

  await expect(rejection).rejects.toBeInstanceOf(InvestigationStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: driverFailure });
  expect(client.query).toHaveBeenCalledWith('ROLLBACK');
  expect(client.release).toHaveBeenCalledTimes(1);
});

// ---------------------------------------------------------------- criterion 3

it("refuses a second write of an id already stored through InvestigationAlreadyStoredError, mapped from the root insert's own unique-violation, without any SELECT ever run before it", async () => {
  const driverFailure = Object.assign(new Error('duplicate key value violates unique constraint "investigations_pkey"'), { code: '23505' });
  const recorded: { text: string }[] = [];
  const handleQuery = async (text: string): Promise<{ rows: unknown[] }> => {
    recorded.push({ text });
    if (text.includes('INSERT INTO investigations')) throw driverFailure;
    return { rows: [] };
  };
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const rejection = store.write(anInvestigation({ id: 'an-already-stored-id' }));

  await expect(rejection).rejects.toBeInstanceOf(InvestigationAlreadyStoredError);
  await expect(rejection).rejects.toMatchObject({ context: { id: 'an-already-stored-id' } });
  expect(recorded.some((entry) => entry.text.includes('SELECT'))).toBe(false);
});

// ---------------------------------------------------------------- criterion 5

it('answers absence, not a rejection, and reads no further, when investigations holds no row for the given id', async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = await store.read('an-absent-id');

  expect(answered).toBeUndefined();
  expect(collapsedTexts(recorded)).toEqual(['BEGIN', expect.stringContaining('FROM investigations'), 'COMMIT']);
});

it('answers one evidence item for every evidence row and one evaluation for every evaluation row a read finds, unfiltered', async () => {
  const { handleQuery } = recordingQuery({
    investigation: investigationRow(),
    attributes: [{ attribute: 'an-attribute', value: 'a-value' }],
    evidence: [evidenceRow({ concept: 'concept-a' }), evidenceRow({ concept: 'concept-b' }), evidenceRow({ concept: 'concept-c' })],
    evaluations: [evaluationRow({ hypothesis: 'first' }), evaluationRow({ hypothesis: 'second', verdict: 'inconclusive', reason: 'no-data' })],
    citations: [citationRow({ hypothesis: 'first' })],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.evidence).toHaveLength(3);
  expect(answered.evaluations).toHaveLength(2);
});

it("reads back the subject's whole attribute-value set, paired with its type", async () => {
  const { handleQuery } = recordingQuery({
    investigation: investigationRow({ subject_type: 'a-subject-type' }),
    attributes: [{ attribute: 'attribute-a', value: 'value-a' }, { attribute: 'attribute-b', value: 'value-b' }],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.subject).toEqual({
    type: 'a-subject-type',
    attributes: [{ attribute: 'attribute-a', value: 'value-a' }, { attribute: 'attribute-b', value: 'value-b' }],
  });
});

it("raises this store's own typed error, carrying the driver failure as its cause, when a read is refused", async () => {
  const driverFailure = new Error('the driver refused this read');
  const handleQuery = async (): Promise<{ rows: unknown[] }> => {
    throw driverFailure;
  };
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const rejection = store.read('an-investigation-id');

  await expect(rejection).rejects.toBeInstanceOf(InvestigationStoreError);
  await expect(rejection).rejects.toMatchObject({ cause: driverFailure });
});

// ---------------------------------------------------------------- criterion 6

it('assembles each evidence item with its concept, inputs, observation, observed_at, ttl, origin, result and its capability pin, including result_detail when it carried one', async () => {
  const { handleQuery } = recordingQuery({
    investigation: investigationRow(),
    evidence: [evidenceRow({ concept: 'concept-a' }), evidenceRow({ concept: 'concept-b', result: 'timeout', result_detail: 'the call did not answer in time' })],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.evidence).toEqual([
    anEvidence({ concept: 'concept-a' }),
    anEvidence({ concept: 'concept-b', result: 'timeout', result_detail: 'the call did not answer in time' }),
  ]);
});

it("raises this store's own typed error rather than answering a row whose result is outside evidence-result's declared enumeration", async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow(), evidence: [evidenceRow({ result: 'not-a-result' })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await expect(store.read('an-investigation-id')).rejects.toBeInstanceOf(InvestigationStoreError);
});

// ---------------------------------------------------------------- criterion 7

it('assembles a confirmed evaluation with its hypothesis, verdict and citations, and no reason', async () => {
  const { handleQuery } = recordingQuery({
    investigation: investigationRow(),
    evaluations: [evaluationRow({ hypothesis: 'a-hypothesis', verdict: 'confirmed', reason: null })],
    citations: [citationRow({ hypothesis: 'a-hypothesis', concept: 'a-concept', field: 'a-field' })],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.evaluations).toEqual([aDecidedEvaluation()]);
  expect(answered.evaluations[0]).not.toHaveProperty('reason');
});

it('assembles an inconclusive evaluation with its hypothesis, verdict, reason and whatever citations it carried', async () => {
  const { handleQuery } = recordingQuery({
    investigation: investigationRow(),
    evaluations: [evaluationRow({ hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'deadline-exceeded' })],
    citations: [citationRow({ hypothesis: 'a-hypothesis', concept: 'a-concept', field: 'a-field' })],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.evaluations).toEqual([anInconclusiveEvaluation({ reason: 'deadline-exceeded', citations: [{ concept: 'a-concept', field: 'a-field' }] })]);
});

it("raises this store's own typed error rather than answering a row whose verdict is outside verdict's declared enumeration", async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow(), evaluations: [evaluationRow({ verdict: 'not-a-verdict' })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await expect(store.read('an-investigation-id')).rejects.toBeInstanceOf(InvestigationStoreError);
});

it("raises this store's own typed error rather than answering a confirmed evaluation whose citation set is empty", async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow(), evaluations: [evaluationRow({ verdict: 'confirmed' })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await expect(store.read('an-investigation-id')).rejects.toBeInstanceOf(InvestigationStoreError);
});

it("raises this store's own typed error rather than answering a refuted evaluation whose citation set is empty", async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow(), evaluations: [evaluationRow({ verdict: 'refuted' })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await expect(store.read('an-investigation-id')).rejects.toBeInstanceOf(InvestigationStoreError);
});

it("raises this store's own typed error rather than answering an inconclusive evaluation whose reason column is null", async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow(), evaluations: [evaluationRow({ verdict: 'inconclusive', reason: null })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await expect(store.read('an-investigation-id')).rejects.toBeInstanceOf(InvestigationStoreError);
});

it("raises this store's own typed error rather than answering an inconclusive evaluation whose reason is outside evaluation-reason's declared enumeration", async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow(), evaluations: [evaluationRow({ verdict: 'inconclusive', reason: 'not-a-reason' })] });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await expect(store.read('an-investigation-id')).rejects.toBeInstanceOf(InvestigationStoreError);
});

// ---------------------------------------------------------------- criterion 8

it('assembles the assessment with its outcome, referral, determining_hypothesis and text, when a hypothesis was named', async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow({ assessment_determining_hypothesis: 'a-hypothesis' }) });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.assessment).toEqual({
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    determining_hypothesis: 'a-hypothesis',
    text: 'assessment text',
  });
});

it('leaves determining_hypothesis out of the assembled assessment when the fallback answered and no hypothesis was named', async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow({ assessment_determining_hypothesis: null }) });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.assessment).not.toHaveProperty('determining_hypothesis');
});

// ---------------------------------------------------------------- criterion 9

it('issues no UPDATE statement anywhere while writing a whole investigation', async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.write(anInvestigation({ evidence: [anEvidence({ concept: 'concept-a' })], evaluations: [aDecidedEvaluation()] }));

  expect(recorded.some((entry) => entry.text.includes('UPDATE'))).toBe(false);
});

// ---------------------------------------------------------------- criterion 10

it('opens no file of any kind: this module names no filesystem import and calls no filesystem function', async () => {
  const source = await readFile(MODULE_SOURCE_PATH, 'utf8');

  const filesystemReaches = [/['"]node:fs(?:\/promises)?['"]/, /\breadFileSync\b/, /\bwriteFileSync\b/, /\breadFile\s*\(/, /\bwriteFile\s*\(/];
  expect(filesystemReaches.some((pattern) => pattern.test(source))).toBe(false);
});

// ---------------------------------------------------------------- inference: deterministic ordering on read

it('reads evidence ordered by concept, evaluations ordered by hypothesis, citations ordered by hypothesis then concept then field, and subject attribute-values ordered by attribute then value', async () => {
  const { handleQuery, recorded } = recordingQuery({ investigation: investigationRow() });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.read('an-investigation-id');

  const texts = collapsedTexts(recorded);
  expect(texts.some((text) => text.includes('FROM investigation_subject_attribute_values') && text.includes('ORDER BY attribute, value'))).toBe(true);
  expect(texts.some((text) => text.includes('FROM investigation_evidence') && text.includes('ORDER BY concept'))).toBe(true);
  expect(texts.some((text) => text.includes('FROM investigation_evaluations') && text.includes('ORDER BY hypothesis'))).toBe(true);
  expect(texts.some((text) => text.includes('FROM investigation_evaluation_citations') && text.includes('ORDER BY hypothesis, concept, field'))).toBe(true);
});

// ---------------------------------------------------------------- inference: the hash is sha256 of the assembled document's own JSON

it("computes StoredInvestigation's own hash as sha256 of the assembled document's own JSON serialization", async () => {
  const { handleQuery } = recordingQuery({
    investigation: investigationRow(),
    attributes: [{ attribute: 'an-attribute', value: 'a-value' }],
    evidence: [evidenceRow()],
    evaluations: [evaluationRow()],
    citations: [citationRow()],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = await store.read('an-investigation-id');

  const expectedDocument = anInvestigation({ id: 'an-investigation-id' });
  const expectedHash = createHash('sha256').update(JSON.stringify(expectedDocument), 'utf8').digest('hex');
  expect(answered?.hash).toBe(expectedHash);
});

// ---------------------------------------------------------------- inference: ticket_ref travels unchanged, including the empty string

it('sends ticket_ref exactly as the given investigation holds it, including the empty string used where no ticket was given', async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.write(anInvestigation({ ticket_ref: '' }));

  const rootInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigations'));
  expect(rootInsert?.params?.[2]).toBe('');
});

// This store's own write() is unmodified by task/case-and-investigation-model/ticket-ref-is-optional
// (that task's own recorded deferral), but Investigation.ticket_ref is now optional, so a caller may
// now pass it an Investigation whose ticket_ref is undefined rather than the empty string; the test
// below is the fast, DB-independent half of that task's own recorded inference — that write() still
// forwards the value unmodified rather than choking on it or coercing it into something else — the
// other half (that node-postgres itself serializes an undefined bound parameter to a real SQL NULL)
// needs a live connection and is proven separately, in this file's own integration-level sibling.
it('sends ticket_ref as undefined in the root insert\'s own params when the given investigation carries no ticket_ref at all', async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.write(anInvestigation({ ticket_ref: undefined }));

  const rootInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigations'));
  expect(rootInsert?.params?.[2]).toBeUndefined();
});

it('answers ticket_ref as the empty string when the stored column itself is a SQL NULL', async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow({ ticket_ref: null }) });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.ticket_ref).toBe('');
});

// ---------------------------------------------------------------- task/investigation-telemetry/evidence-collection-measures-elapsed-ms
//
// The whole-object tests above (criterion 1's own params assertion, criterion 6's own read
// assembly) already carry elapsed_ms through their fixtures' shared defaults, but a mismatch
// on any of their other eleven fields would fail them for that unrelated reason too. The two
// tests below isolate this task's own persistence-round-trip inference — that
// RelationalInvestigationStore's evidenceStatement() and evidenceOf(row) needed to change even
// though this file sits outside this task's own inventory node area — to elapsed_ms alone, on
// each side of the round trip.

it("sends the evidence item's own elapsed_ms as the evidence insert's own last param, not silently dropped from the row this store persists", async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);
  const investigation = anInvestigation({ evidence: [anEvidence({ elapsed_ms: 4_321 })] });

  await store.write(investigation);

  const evidenceInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigation_evidence'));
  expect(evidenceInsert?.params?.at(-1)).toBe(4_321);
});

it("assembles the stored row's own elapsed_ms into the read Evidence's own elapsed_ms, rather than a value carried over from another column", async () => {
  const { handleQuery } = recordingQuery({
    investigation: investigationRow(),
    evidence: [evidenceRow({ elapsed_ms: 777 })],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.evidence[0]?.elapsed_ms).toBe(777);
});

