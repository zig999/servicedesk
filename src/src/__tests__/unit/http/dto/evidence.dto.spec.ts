import { expect, it } from 'vitest';
import { evidenceSchema } from '../../../../http/dto/evidence.dto.js';

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

it('validates a well-formed evidence item', () => {
  const result = evidenceSchema.safeParse(aValidEvidenceItem());

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

  const result = evidenceSchema.safeParse(evidenceItem);

  expect(result.success).toBe(false);
});

it('validates an evidence item whose fields is an empty array, matching a concept whose capability never resolved', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: [] };

  const result = evidenceSchema.safeParse(evidenceItem);

  expect(result.success).toBe(true);
});

it('rejects an evidence item whose fields is not an array', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: 'not-an-array' };

  const result = evidenceSchema.safeParse(evidenceItem);

  expect(result.success).toBe(false);
});

it('rejects an evidence item whose fields entry is missing its name', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: [{ type: 'string' }] };

  const result = evidenceSchema.safeParse(evidenceItem);

  expect(result.success).toBe(false);
});

it('validates an evidence item whose fields entry supplies only a name, leaving type and description absent', () => {
  const evidenceItem = { ...aValidEvidenceItem(), fields: [{ name: 'a-field' }] };

  const result = evidenceSchema.safeParse(evidenceItem);

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

  const result = evidenceSchema.safeParse(evidenceItem);

  expect(result.success).toBe(false);
});

it('rejects an evidence item whose concept_description is not a string', () => {
  const evidenceItem = { ...aValidEvidenceItem(), concept_description: 42 };

  const result = evidenceSchema.safeParse(evidenceItem);

  expect(result.success).toBe(false);
});

it('validates an evidence item whose concept_description is the empty string, matching a concept collected before it declared one', () => {
  const evidenceItem = { ...aValidEvidenceItem(), concept_description: '' };

  const result = evidenceSchema.safeParse(evidenceItem);

  expect(result.success).toBe(true);
});
