import { expect, it } from 'vitest';
import { simulateCaseResponseSchema } from '../../../../http/dto/simulate-case.dto.js';

function aValidResponse(): Record<string, unknown> {
  return {
    evidence: [],
    evaluations: [],
    resolved: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' } },
    assessment: { outcome: 'an-outcome', referral: { action: 'an-action', recipient: 'a-recipient' }, text: 'a drafted text' },
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
