// Proof for task/investigation-lifecycle/idempotency-window: idempotencyKeyOf's
// canonical form over the four values
// rules/investigation/an-investigation-is-idempotent-within-a-window names
// together — deterministic wherever every field repeats, so a lease or a
// completed-investigation lookup can ever find what an earlier request
// claimed, and distinct the moment any one of the four differs, so two keys
// the rule treats as different requests are never confused as one.
import { expect, it } from 'vitest';
import { idempotencyKeyOf, type IdempotencyKey } from '../../../investigation/idempotency-key.js';

/** A key with every one of its four fields distinct from the others, so varying exactly one at a time is unambiguous about which changed. */
const A_KEY: IdempotencyKey = {
  subjectType: 'ont',
  subjectId: 'subject-one',
  caseReference: 'case-one',
  ticketRef: 'ticket-one',
};

it('answers the identical string for two keys carrying the same four field values', () => {
  const repeated: IdempotencyKey = { ...A_KEY };

  expect(idempotencyKeyOf(repeated)).toBe(idempotencyKeyOf(A_KEY));
});

it('answers a different string when only the subject type differs from another key', () => {
  const varied: IdempotencyKey = { ...A_KEY, subjectType: 'ope' };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});

it('answers a different string when only the subject id differs from another key', () => {
  const varied: IdempotencyKey = { ...A_KEY, subjectId: 'subject-two' };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});

it('answers a different string when only the case reference differs from another key', () => {
  const varied: IdempotencyKey = { ...A_KEY, caseReference: 'case-two' };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});

it('answers a different string when only the ticket reference differs from another key', () => {
  const varied: IdempotencyKey = { ...A_KEY, ticketRef: 'ticket-two' };

  expect(idempotencyKeyOf(varied)).not.toBe(idempotencyKeyOf(A_KEY));
});
