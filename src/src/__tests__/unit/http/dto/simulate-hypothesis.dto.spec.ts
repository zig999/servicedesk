import { expect, it } from 'vitest';
import { simulateHypothesisRequestSchema, simulateHypothesisResponseSchema } from '../../../../http/dto/simulate-hypothesis.dto.js';
import { VERDICTS } from '../../../../investigation/verdict.js';

function validSimulateHypothesisRequestBody(): Record<string, unknown> {
  return {
    case: { slug: 'a-case', version: 1 },
    subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute', value: 'a-value' }] },
    requester: 'a-requester',
    hypothesis: 'a-hypothesis',
  };
}

function simulateHypothesisRequestBodyWithoutSubject(): Record<string, unknown> {
  return { case: { slug: 'a-case', version: 1 }, requester: 'a-requester', hypothesis: 'a-hypothesis' };
}

function aValidEvidenceItem(): Record<string, unknown> {
  return {
    concept: 'a-concept',
    inputs: 'an-input',
    observation: 'an-observation',
    observed_at: '2026-01-01T00:00:00.000Z',
    ttl: 60,
    origin: 'a-capability',
    result: 'ok',
    capability_name: 'a-capability',
    capability_version: '1.0.0',
    elapsed_ms: 50,
    fields: [{ name: 'a-field', type: 'string', description: 'a description' }],
    concept_description: 'a description of the concept',
    capability_payload_notes: '',
  };
}

function aConfirmedEvaluation(): Record<string, unknown> {
  return {
    hypothesis: 'a-hypothesis',
    verdict: VERDICTS[0],
    citations: [{ concept: 'a-concept' }],
  };
}

function aRefutedEvaluation(): Record<string, unknown> {
  return {
    hypothesis: 'a-hypothesis',
    verdict: VERDICTS[1],
    citations: [{ concept: 'a-concept' }],
  };
}

function anInconclusiveEvaluation(): Record<string, unknown> {
  return {
    hypothesis: 'a-hypothesis',
    verdict: VERDICTS[2],
    reason: 'no-data',
    citations: [],
  };
}

function aValidDurations(): Record<string, unknown> {
  return { collection: 10, judgment: 20, total: 30 };
}

function aValidResponse(): Record<string, unknown> {
  return {
    evidence: [],
    evaluation: aConfirmedEvaluation(),
    durations: aValidDurations(),
  };
}

it("validates a response whose evaluation carries VERDICTS' first entry as its verdict, on the confirmed branch", () => {
  const response = aValidResponse();

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it("validates a response whose evaluation carries VERDICTS' second entry as its verdict, on the refuted branch", () => {
  const response = { ...aValidResponse(), evaluation: aRefutedEvaluation() };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it("validates a response whose evaluation carries VERDICTS' third entry as its verdict, on the inconclusive branch", () => {
  const response = { ...aValidResponse(), evaluation: anInconclusiveEvaluation() };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it('rejects an evaluation whose verdict is not one of the shared VERDICTS values', () => {
  const evaluation = {
    hypothesis: 'a-hypothesis',
    verdict: 'unknown-verdict',
    citations: [{ concept: 'a-concept' }],
  };
  const response = { ...aValidResponse(), evaluation };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('validates a production-shaped response with no field stripped from its evidence or its evaluation', () => {
  const evidenceItem = aValidEvidenceItem();
  const evaluation = anInconclusiveEvaluation();
  const response = { evidence: [evidenceItem], evaluation, durations: aValidDurations() };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
  expect(result.data?.evidence[0]).toEqual(evidenceItem);
  expect(result.data?.evaluation).toEqual(evaluation);
});

it('rejects a response whose evaluation usage carries a fractional input_tokens', () => {
  const evaluation = { ...aConfirmedEvaluation(), usage: { input_tokens: 10.5, output_tokens: 5 } };
  const response = { ...aValidResponse(), evaluation };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects a response whose evaluation usage carries a fractional output_tokens', () => {
  const evaluation = { ...aConfirmedEvaluation(), usage: { input_tokens: 10, output_tokens: 5.5 } };
  const response = { ...aValidResponse(), evaluation };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects a response whose evaluation elapsed_ms is fractional', () => {
  const evaluation = { ...aConfirmedEvaluation(), elapsed_ms: 12.5 };
  const response = { ...aValidResponse(), evaluation };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects a response whose durations.collection is fractional', () => {
  const response = { ...aValidResponse(), durations: { collection: 10.5, judgment: 20, total: 30 } };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects a response whose durations.judgment is fractional', () => {
  const response = { ...aValidResponse(), durations: { collection: 10, judgment: 20.5, total: 30 } };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects a response whose durations.total is fractional', () => {
  const response = { ...aValidResponse(), durations: { collection: 10, judgment: 20, total: 30.5 } };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('validates a response whose evaluation carries usage and elapsed_ms as integers, matching a completed simulation that made a model call', () => {
  const evaluation = {
    ...aConfirmedEvaluation(),
    usage: { input_tokens: 10, output_tokens: 5 },
    elapsed_ms: 120,
  };
  const response = { ...aValidResponse(), evaluation };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it('validates a response whose durations.collection is zero, matching a stage measured below one millisecond', () => {
  const response = { ...aValidResponse(), durations: { collection: 0, judgment: 20, total: 30 } };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it('validates a response whose evaluation carries neither usage nor elapsed_ms, matching a run that made no model call', () => {
  const response = { ...aValidResponse(), evaluation: aConfirmedEvaluation() };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it('accepts a request whose subject carries an empty attributes array, since the schema no longer requires at least one entry', () => {
  const request = { ...validSimulateHypothesisRequestBody(), subject: { type: 'a-subject-type', attributes: [] } };

  const result = simulateHypothesisRequestSchema.safeParse(request);

  expect(result.success).toBe(true);
});

it.each<[string, Record<string, unknown>]>([
  ['a missing subject', simulateHypothesisRequestBodyWithoutSubject()],
  ['a subject missing its type', { ...validSimulateHypothesisRequestBody(), subject: { attributes: [{ attribute: 'an-attribute', value: 'a-value' }] } }],
  ["an attribute entry missing its own attribute name", { ...validSimulateHypothesisRequestBody(), subject: { type: 'a-subject-type', attributes: [{ value: 'a-value' }] } }],
  ["an attribute entry missing its own value", { ...validSimulateHypothesisRequestBody(), subject: { type: 'a-subject-type', attributes: [{ attribute: 'an-attribute' }] } }],
])('still rejects a request with %s, unaffected by the attributes array no longer requiring a minimum length', (_description, request) => {
  const result = simulateHypothesisRequestSchema.safeParse(request);

  expect(result.success).toBe(false);
});
