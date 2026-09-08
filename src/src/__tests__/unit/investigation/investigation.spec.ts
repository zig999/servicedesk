import { expectTypeOf, it } from 'vitest';
import type { Investigation } from '../../../investigation/investigation.js';

function validInvestigationAttributesExceptWrittenAt(): Omit<Investigation, 'written_at'> {
  return {
    id: 'investigation-1',
    requester: 'requester-1',
    narrative: 'a narrative',
    subject: { type: 'ont', attributes: [{ attribute: 'id', value: 'subject-1' }] },
    pinned_case: { slug: 'a-case', version: 1 },
    prompt_version: 'prompt-v1',
    model: 'model-x',
    evidence: [],
    evaluations: [],
    assessment: {
      outcome: 'an-outcome',
      referral: { action: 'refer', recipient: 'a-queue' },
      text: 'the assessment text',
      register: 'plain',
      usage: { input_tokens: 1, output_tokens: 1 },
      elapsed_ms: 1,
      prompt: 'a prompt',
    },
    cost: { calls: 1, input_tokens: 10, output_tokens: 5 },
    durations: { collection: 1, judgment: 1, total: 2 },
  };
}

it("declares written_at as a required string, matching domain/investigation/investigation's own required attribute", () => {
  expectTypeOf<Investigation['written_at']>().toEqualTypeOf<string>();
});

it('refuses an object literal omitting written_at as an Investigation, even though every other declared attribute is present', () => {
  // @ts-expect-error — Investigation now declares written_at required; an object naming every other attribute but this one is not an Investigation

  const invalid: Investigation = validInvestigationAttributesExceptWrittenAt();
  void invalid;
});

it('assigns to Investigation once written_at is supplied alongside every other declared attribute, proving the refusal above is written_at and nothing else', () => {
  const stillValid: Investigation = {
    ...validInvestigationAttributesExceptWrittenAt(),
    written_at: '2024-01-01T00:00:00.000Z',
  };
  void stillValid;
});

it('refuses a written_at value that is not the string datetime representation the domain model already declares', () => {
  const invalid: Investigation = {
    ...validInvestigationAttributesExceptWrittenAt(),
    // @ts-expect-error — written_at stays string; this task does not widen it to accept a number timestamp or a Date instance
    written_at: 1704067200000,
  };
  void invalid;
});
