import { expect, it } from 'vitest';
import { readCapabilityByIdentityResponseSchema } from '../../../../http/dto/read-capability-by-identity.dto.js';

const REQUIRED_ATTRIBUTES_OTHER_THAN_PAYLOAD_NOTES = [
  'nature',
  'input_schema',
  'output_schema',
  'timeout',
  'connector',
  'concept',
] as const;

function completeAnswer(): Record<string, unknown> {
  return {
    name: 'a-capability',
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5_000,
    connector: 'a-connector',
    concept: 'a-concept',
  };
}

it('does not refuse an answer in which payload_notes stands absent and every other declared attribute stands present', () => {
  const answer = completeAnswer();

  const result = readCapabilityByIdentityResponseSchema.safeParse(answer);

  expect(result.success).toBe(true);
});

it.each(REQUIRED_ATTRIBUTES_OTHER_THAN_PAYLOAD_NOTES)(
  'refuses an answer in which %s stands absent, since payload_notes is the only attribute this schema admits absent',
  (attribute) => {
    const answer = completeAnswer();
    delete answer[attribute];

    const result = readCapabilityByIdentityResponseSchema.safeParse(answer);

    expect(result.success).toBe(false);
  },
);
