import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, expectTypeOf, it, vi } from 'vitest';
import { InvestigationAlreadyStoredError } from '../../../errors/investigation-already-stored.error.js';
import { InvestigationStoreError } from '../../../errors/investigation-store.error.js';
import type { Citation } from '../../../investigation/citation.js';
import type { Durations } from '../../../investigation/durations.js';
import type { EvaluationReason } from '../../../investigation/evaluation-reason.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import type { Investigation } from '../../../investigation/investigation.js';
import type { IConnectableQueryable } from '../../../persistence/database-access.js';
import { RelationalInvestigationStore } from '../../../persistence/relational-investigation-store.repository.js';

const MODULE_SOURCE_PATH = fileURLToPath(new URL('../../../persistence/relational-investigation-store.repository.ts', import.meta.url));

interface IFakeClient {
  readonly query: ReturnType<typeof vi.fn>;
  readonly release: ReturnType<typeof vi.fn>;
}

function fakeTransactionConnection(
  handleQuery: (text: string, params?: readonly unknown[]) => Promise<{ rows: unknown[] }>,
): { connection: IConnectableQueryable; client: IFakeClient } {
  const client: IFakeClient = { query: vi.fn(handleQuery), release: vi.fn() };
  const connect = vi.fn().mockResolvedValue(client);
  return { connection: { connect } as unknown as IConnectableQueryable, client };
}

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

function investigationRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    requester: 'a-requester', ticket_ref: 'a-ticket-ref', narrative: 'a narrative', subject_type: 'a-subject-type',
    prompt_version: 'a-prompt-version', model: 'a-model', pinned_case_slug: 'a-case-slug', pinned_case_version: 1,
    assessment_outcome: 'an-outcome', assessment_action: 'an-action', assessment_recipient: 'a-recipient',
    assessment_determining_hypothesis: 'a-hypothesis', assessment_text: 'assessment text', assessment_register: 'formal',
    assessment_usage_input_tokens: 8, assessment_usage_output_tokens: 4, assessment_elapsed_ms: 99,
    assessment_prompt: 'assessment prompt',
    cost_calls: 3, cost_input_tokens: 100, cost_output_tokens: 50,
    durations_collection: 10, durations_judgment: 20, durations_writing: 5, durations_total: 35,
    written_at: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

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
    fields: [],
    concept_description: '',
    ...overrides,
  };
}

function evaluationRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    hypothesis: 'a-hypothesis', verdict: 'confirmed', reason: null,
    input_tokens: null, output_tokens: null, elapsed_ms: null, prompt: null,
    ...overrides,
  };
}

function citationRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { hypothesis: 'a-hypothesis', concept: 'a-concept', field: 'a-field', ...overrides };
}

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
    fields: [],
    concept_description: '',
    ...overrides,
  };
}

interface IDecidedOverrides {
  readonly hypothesis?: string;
  readonly verdict?: 'confirmed' | 'refuted';
  readonly citations?: readonly [Citation, ...Citation[]];
}

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

function anInconclusiveEvaluation(overrides: IInconclusiveOverrides = {}): Evaluation {
  return {
    hypothesis: overrides.hypothesis ?? 'a-hypothesis',
    verdict: 'inconclusive',
    reason: overrides.reason ?? 'no-data',
    citations: overrides.citations ?? [],
  };
}

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
    assessment: {
      outcome: 'an-outcome',
      referral: { action: 'an-action', recipient: 'a-recipient' },
      determining_hypothesis: 'a-hypothesis',
      text: 'assessment text',
      register: 'formal',
      usage: { input_tokens: 8, output_tokens: 4 },
      elapsed_ms: 99,
      prompt: 'assessment prompt',
    },
    cost: { calls: 3, input_tokens: 100, output_tokens: 50 },
    durations: { collection: 10, judgment: 20, writing: 5, total: 35 },
    written_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

it("sends every declared attribute of the root row — identity, subject type, prompt version, model, pinned case, assessment, cost and durations — as the root insert's own params, in order, with written_at never among them", async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.write(anInvestigation());

  const rootInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigations'));
  expect(rootInsert?.params).toEqual([
    'an-investigation-id', 'a-requester', 'a-ticket-ref', 'a narrative', 'a-subject-type', 'a-prompt-version', 'a-model',
    'a-case-slug', 1,
    'an-outcome', 'an-action', 'a-recipient', 'a-hypothesis', 'assessment text',
    'formal', 8, 4, 99, 'assessment prompt',
    3, 100, 50,
    10, 20, 5, 35,
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
    'a-registered-capability', '2.0.0', 12, '[]', '',
  ]);
});

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

it("sends a judgment-failure evaluation's own usage, elapsed_ms and prompt as the evaluation insert's own additional params, present exactly when the evaluation carries them", async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);
  const judgmentFailure: Evaluation = {
    hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'judgment-failure', citations: [],
    usage: { input_tokens: 12, output_tokens: 34 }, elapsed_ms: 567, prompt: 'the judgment-failure prompt',
  };
  const investigation = anInvestigation({ evaluations: [judgmentFailure] });

  await store.write(investigation);

  const evaluationInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigation_evaluations'));
  expect(evaluationInsert?.params).toEqual([
    investigation.id, 'a-hypothesis', 'inconclusive', 'judgment-failure', 12, 34, 567, 'the judgment-failure prompt',
  ]);
});

it("sends null for usage's two columns, elapsed_ms and prompt on the evaluation insert when the evaluation given carries none of them", async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);
  const investigation = anInvestigation({ evaluations: [aDecidedEvaluation()] });

  await store.write(investigation);

  const evaluationInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigation_evaluations'));
  expect(evaluationInsert?.params).toEqual([investigation.id, 'a-hypothesis', 'confirmed', null, null, null, null, null]);
});

it("reconstructs usage, elapsed_ms and prompt onto a read-back inconclusive evaluation exactly as the row's own four columns hold them, for the judgment-failure reason", async () => {
  const { handleQuery } = recordingQuery({
    investigation: investigationRow(),
    evaluations: [evaluationRow({
      hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'judgment-failure',
      input_tokens: 12, output_tokens: 34, elapsed_ms: 567, prompt: 'the judgment-failure prompt',
    })],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.evaluations).toEqual([{
    hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'judgment-failure', citations: [],
    usage: { input_tokens: 12, output_tokens: 34 }, elapsed_ms: 567, prompt: 'the judgment-failure prompt',
  }]);
});

it("reconstructs usage, elapsed_ms and prompt onto a read-back confirmed evaluation too, not only onto an inconclusive one", async () => {
  const { handleQuery } = recordingQuery({
    investigation: investigationRow(),
    evaluations: [evaluationRow({
      hypothesis: 'a-hypothesis', verdict: 'confirmed',
      input_tokens: 5, output_tokens: 6, elapsed_ms: 78, prompt: 'the confirmed-call prompt',
    })],
    citations: [citationRow({ hypothesis: 'a-hypothesis' })],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.evaluations[0]).toMatchObject({
    usage: { input_tokens: 5, output_tokens: 6 }, elapsed_ms: 78, prompt: 'the confirmed-call prompt',
  });
});

it("leaves usage, elapsed_ms and prompt off a read-back no-data evaluation, unchanged by this fix, when the row's own four call-record columns are all null", async () => {
  const { handleQuery } = recordingQuery({
    investigation: investigationRow(),
    evaluations: [evaluationRow({ hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'no-data' })],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.evaluations[0]).not.toHaveProperty('usage');
  expect(answered.evaluations[0]).not.toHaveProperty('elapsed_ms');
  expect(answered.evaluations[0]).not.toHaveProperty('prompt');
});

it('omits usage entirely when only one of input_tokens or output_tokens is present on the row, never constructing a usage object with a missing token count', async () => {
  const { handleQuery } = recordingQuery({
    investigation: investigationRow(),
    evaluations: [evaluationRow({ hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'no-data', input_tokens: 12, output_tokens: null })],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.evaluations[0]).not.toHaveProperty('usage');
});

it('assembles the assessment with its outcome, referral, determining_hypothesis, text, register, usage, elapsed_ms and prompt, when a hypothesis was named', async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow({ assessment_determining_hypothesis: 'a-hypothesis' }) });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.assessment).toEqual({
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    determining_hypothesis: 'a-hypothesis',
    text: 'assessment text',
    register: 'formal',
    usage: { input_tokens: 8, output_tokens: 4 },
    elapsed_ms: 99,
    prompt: 'assessment prompt',
  });
});

it('leaves determining_hypothesis out of the assembled assessment when the fallback answered and no hypothesis was named', async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow({ assessment_determining_hypothesis: null }) });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.assessment).not.toHaveProperty('determining_hypothesis');
});

it('issues no UPDATE statement anywhere while writing a whole investigation', async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.write(anInvestigation({ evidence: [anEvidence({ concept: 'concept-a' })], evaluations: [aDecidedEvaluation()] }));

  expect(recorded.some((entry) => entry.text.includes('UPDATE'))).toBe(false);
});

it('opens no file of any kind: this module names no filesystem import and calls no filesystem function', async () => {
  const source = await readFile(MODULE_SOURCE_PATH, 'utf8');

  const filesystemReaches = [/['"]node:fs(?:\/promises)?['"]/, /\breadFileSync\b/, /\bwriteFileSync\b/, /\breadFile\s*\(/, /\bwriteFile\s*\(/];
  expect(filesystemReaches.some((pattern) => pattern.test(source))).toBe(false);
});

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

it("sends ticket_ref as undefined in the root insert's own params, never the empty string, when the given investigation carries ticket_ref as the empty string", async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.write(anInvestigation({ ticket_ref: '' }));

  const rootInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigations'));
  expect(rootInsert?.params?.[2]).toBeUndefined();
});

it('sends a ticket_ref holding only whitespace through unchanged, rather than treating it the same as the empty string', async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.write(anInvestigation({ ticket_ref: ' ' }));

  const rootInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigations'));
  expect(rootInsert?.params?.[2]).toBe(' ');
});

it('sends ticket_ref as undefined in the root insert\'s own params when the given investigation carries no ticket_ref at all', async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.write(anInvestigation({ ticket_ref: undefined }));

  const rootInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigations'));
  expect(rootInsert?.params?.[2]).toBeUndefined();
});

it('leaves ticket_ref out of the assembled investigation, rather than answering it as the empty string, when the stored column itself is a SQL NULL', async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow({ ticket_ref: null }) });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered).not.toHaveProperty('ticket_ref');
});

it('reads back the exact ticket_ref value the stored column holds, unchanged, when one was given at write', async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow({ ticket_ref: 'INC-4821' }) });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.ticket_ref).toBe('INC-4821');
});

it('records a diagnose call giving ticket_ref as the empty string and reads it back with no ticket_ref at all, never the empty string, matching an-empty-ticket-reference-is-no-ticket-reference', async () => {
  let insertedTicketRef: unknown;
  const handleQuery = async (text: string, params?: readonly unknown[]): Promise<{ rows: unknown[] }> => {
    if (text.includes('INSERT INTO investigations')) {
      insertedTicketRef = params?.[2];
      return { rows: [] };
    }
    if (text.includes('FROM investigations')) {
      return { rows: [investigationRow({ ticket_ref: insertedTicketRef ?? null })] };
    }
    return { rows: [] };
  };
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.write(anInvestigation({ ticket_ref: '' }));
  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered).not.toHaveProperty('ticket_ref');
});

it("sends the evidence item's own elapsed_ms as the evidence insert's own twelfth param, not silently dropped from the row this store persists — ahead of fields and concept_description, which migrations/0013 added after it", async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);
  const investigation = anInvestigation({ evidence: [anEvidence({ elapsed_ms: 4_321 })] });

  await store.write(investigation);

  const evidenceInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigation_evidence'));
  expect(evidenceInsert?.params?.[11]).toBe(4_321);
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

it("sends the evidence item's own fields, JSON-serialized, and its own concept_description as the evidence insert's own thirteenth and fourteenth params, when the given evidence carries non-empty values for both", async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);
  const fields = [{ name: 'a-field', type: 'string', description: 'a field description' }];
  const investigation = anInvestigation({
    evidence: [anEvidence({ fields, concept_description: 'a real description' })],
  });

  await store.write(investigation);

  const evidenceInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigation_evidence'));
  expect(evidenceInsert?.params?.slice(-2)).toEqual([JSON.stringify(fields), 'a real description']);
});

it("assembles the read evidence item's own fields and concept_description straight from the stored row's own two columns, carried through unchanged rather than a literal placeholder", async () => {
  const fields = [{ name: 'a-field', type: 'string', description: 'a field description' }];
  const { handleQuery } = recordingQuery({
    investigation: investigationRow(),
    evidence: [evidenceRow({ concept: 'concept-a', fields, concept_description: 'a real description' })],
  });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.evidence[0]).toMatchObject({ fields, concept_description: 'a real description' });
});

it('declares Durations.writing as optional, so an investigation may carry no durations.writing at all', () => {
  expectTypeOf<Durations>().toEqualTypeOf<{
    readonly collection: number;
    readonly judgment: number;
    readonly writing?: number;
    readonly total: number;
  }>();
});

it("sends durations.writing as undefined in the root insert's own params, never an invented duration, when the given investigation carries no durations.writing at all", async () => {
  const { handleQuery, recorded } = recordingQuery({});
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);
  const durationsWithoutWriting = { collection: 10, judgment: 20, total: 35 };

  await store.write(anInvestigation({ durations: durationsWithoutWriting }));

  const rootInsert = recorded.find((entry) => entry.text.includes('INSERT INTO investigations'));
  expect(rootInsert?.params).toEqual([
    'an-investigation-id', 'a-requester', 'a-ticket-ref', 'a narrative', 'a-subject-type', 'a-prompt-version', 'a-model',
    'a-case-slug', 1,
    'an-outcome', 'an-action', 'a-recipient', 'a-hypothesis', 'assessment text',
    'formal', 8, 4, 99, 'assessment prompt',
    3, 100, 50,
    10, 20, undefined, 35,
  ]);
});

it('reads back durations.writing absent, never an invented duration, when the stored durations_writing column is a SQL NULL', async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow({ durations_writing: null }) });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.durations).toEqual({ collection: 10, judgment: 20, total: 35 });
  expect(answered.durations).not.toHaveProperty('writing');
});

it('reads back the exact durations.writing value the stored column holds, unchanged, when one was present at write', async () => {
  const { handleQuery } = recordingQuery({ investigation: investigationRow({ durations_writing: 4321 }) });
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.durations.writing).toBe(4321);
});

it('writes a diagnosis and reads back durations.total exactly as the write recorded it, unchanged by the round trip', async () => {
  let insertedTotal: unknown;
  const handleQuery = async (text: string, params?: readonly unknown[]): Promise<{ rows: unknown[] }> => {
    if (text.includes('INSERT INTO investigations')) {
      insertedTotal = params?.[25];
      return { rows: [] };
    }
    if (text.includes('FROM investigations')) {
      return { rows: [investigationRow({ durations_total: insertedTotal })] };
    }
    return { rows: [] };
  };
  const { connection } = fakeTransactionConnection(handleQuery);
  const store = new RelationalInvestigationStore(connection);

  await store.write(anInvestigation({ durations: { collection: 10, judgment: 20, writing: 5, total: 6_172 } }));
  const answered = (await store.read('an-investigation-id'))?.document as Investigation;

  expect(answered.durations.total).toBe(6_172);
});

