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
