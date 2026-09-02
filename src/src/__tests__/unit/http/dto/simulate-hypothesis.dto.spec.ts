import { expect, it } from 'vitest';
import { simulateHypothesisResponseSchema } from '../../../../http/dto/simulate-hypothesis.dto.js';
import { VERDICTS } from '../../../../investigation/verdict.js';

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

it('rejects an evidence item missing fields, now that evidenceSchema requires it', () => {
  const evidenceItem = {
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
    concept_description: 'a description of the concept',
  };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('validates an evidence item whose fields is an empty array, matching a concept whose capability never resolved', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: [] };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it('rejects an evidence item whose fields is not an array', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: 'not-an-array' };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an evidence item whose fields entry is missing its name', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: [{ type: 'string' }] };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('validates an evidence item whose fields entry supplies only a name, leaving type and description absent', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: [{ name: 'a-field' }] };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it('rejects an evidence item missing concept_description, now that evidenceSchema requires it', () => {
  const evidenceItem = {
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
    fields: [],
  };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an evidence item whose concept_description is not a string', () => {
  const evidenceItem = { ...aValidEvidenceItem(), concept_description: 42 };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('validates an evidence item whose concept_description is the empty string, matching a concept collected before it declared one', () => {
  const evidenceItem = { ...aValidEvidenceItem(), concept_description: '' };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
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
