import { expect, it } from 'vitest';
import { simulateCaseResponseSchema } from '../../../../http/dto/simulate-case.dto.js';

function aValidAssessment(): Record<string, unknown> {
  return {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a drafted text',
    register: 'formal',
    usage: { input_tokens: 10, output_tokens: 5 },
    elapsed_ms: 120,
    prompt: 'a drafted prompt',
  };
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
  };
}

function aValidResponse(): Record<string, unknown> {
  return {
    evidence: [],
    evaluations: [],
    resolved: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' } },
    assessment: aValidAssessment(),
    cost: { calls: 1, input_tokens: 1, output_tokens: 1 },
    durations: { collection: 10, judgment: 20, total: 30 },
  };
}

it('validates a response whose durations carries no writing field at all, matching a run whose own consolidation has not yet happened', () => {
  const response = aValidResponse();

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it("validates a confirmed evaluation's citation that carries no field key at all, since the shared citation schema now leaves field optional for every verdict branch, not narrowed to the inconclusive branch alone", () => {
  const response = {
    ...aValidResponse(),
    evaluations: [
      { hypothesis: 'a-hypothesis', verdict: 'confirmed', citations: [{ concept: 'a-concept' }] },
    ],
  };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it('refuses a citation whose field is the empty string, on every verdict branch, even though field is now optional', () => {
  const response = {
    ...aValidResponse(),
    evaluations: [
      { hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'no-data', citations: [{ concept: 'a-concept', field: '' }] },
    ],
  };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an assessment missing register, now that assessmentSchema requires it', () => {
  const assessment = {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a drafted text',
    usage: { input_tokens: 10, output_tokens: 5 },
    elapsed_ms: 120,
    prompt: 'a drafted prompt',
  };
  const response = { ...aValidResponse(), assessment };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an assessment whose register is not one of the consolidation-register enum values', () => {
  const assessment = { ...aValidAssessment(), register: 'unknown-register' };
  const response = { ...aValidResponse(), assessment };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an assessment missing usage, now that assessmentSchema requires it', () => {
  const assessment = {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a drafted text',
    register: 'formal',
    elapsed_ms: 120,
    prompt: 'a drafted prompt',
  };
  const response = { ...aValidResponse(), assessment };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an assessment whose usage carries no output_tokens, since usage keeps the shared usage shape', () => {
  const assessment = { ...aValidAssessment(), usage: { input_tokens: 10 } };
  const response = { ...aValidResponse(), assessment };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an assessment whose usage is not an object, since usage keeps the shared usage shape', () => {
  const assessment = { ...aValidAssessment(), usage: 'not-an-object' };
  const response = { ...aValidResponse(), assessment };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an assessment missing elapsed_ms, now that assessmentSchema requires it', () => {
  const assessment = {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a drafted text',
    register: 'formal',
    usage: { input_tokens: 10, output_tokens: 5 },
    prompt: 'a drafted prompt',
  };
  const response = { ...aValidResponse(), assessment };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an assessment whose elapsed_ms is not an integer', () => {
  const assessment = { ...aValidAssessment(), elapsed_ms: 12.5 };
  const response = { ...aValidResponse(), assessment };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an assessment missing prompt, now that assessmentSchema requires it', () => {
  const assessment = {
    outcome: 'an-outcome',
    referral: { action: 'an-action', recipient: 'a-recipient' },
    text: 'a drafted text',
    register: 'formal',
    usage: { input_tokens: 10, output_tokens: 5 },
    elapsed_ms: 120,
  };
  const response = { ...aValidResponse(), assessment };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an assessment whose prompt is not a string', () => {
  const assessment = { ...aValidAssessment(), prompt: 42 };
  const response = { ...aValidResponse(), assessment };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('validates an assessment whose prompt is the empty string, since prompt carries no minimum length', () => {
  const assessment = { ...aValidAssessment(), prompt: '' };
  const response = { ...aValidResponse(), assessment };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
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

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('validates an evidence item whose fields is an empty array, matching a concept whose capability never resolved', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: [] };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it('rejects an evidence item whose fields is not an array', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: 'not-an-array' };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an evidence item whose fields entry is missing its name', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: [{ type: 'string' }] };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('validates an evidence item whose fields entry supplies only a name, leaving type and description absent', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: [{ name: 'a-field' }] };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateCaseResponseSchema.safeParse(response);

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

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('rejects an evidence item whose concept_description is not a string', () => {
  const evidenceItem = { ...aValidEvidenceItem(), concept_description: 42 };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});

it('validates an evidence item whose concept_description is the empty string, matching a concept collected before it declared one', () => {
  const evidenceItem = { ...aValidEvidenceItem(), concept_description: '' };
  const response = { ...aValidResponse(), evidence: [evidenceItem] };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it('validates a production-shaped response with no field stripped from its assessment or its evidence', () => {
  const assessment = aValidAssessment();
  const evidenceItem = aValidEvidenceItem();
  const response = { ...aValidResponse(), assessment, evidence: [evidenceItem] };

  const result = simulateCaseResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
  expect(result.data?.assessment).toEqual(assessment);
  expect(result.data?.evidence[0]).toEqual(evidenceItem);
});
