import { expect, it } from 'vitest';
import { simulateHypothesisResponseSchema } from '../../../../http/dto/simulate-hypothesis.dto.js';

function aValidResponse(): Record<string, unknown> {
  return {
    evidence: [],
    evaluation: { hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'no-data', citations: [] },
    durations: { collection: 10, judgment: 20, total: 30 },
  };
}

it('validates a response whose evaluation carries no citations at all', () => {
  const response = aValidResponse();

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it("validates a confirmed evaluation's citation that carries no field key at all, since the shared citation schema now leaves field optional for every verdict branch, not narrowed to the inconclusive branch alone", () => {
  const response = {
    ...aValidResponse(),
    evaluation: { hypothesis: 'a-hypothesis', verdict: 'confirmed', citations: [{ concept: 'a-concept' }] },
  };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(true);
});

it('refuses a citation whose field is the empty string, even though field is now optional', () => {
  const response = {
    ...aValidResponse(),
    evaluation: { hypothesis: 'a-hypothesis', verdict: 'inconclusive', reason: 'no-data', citations: [{ concept: 'a-concept', field: '' }] },
  };

  const result = simulateHypothesisResponseSchema.safeParse(response);

  expect(result.success).toBe(false);
});
