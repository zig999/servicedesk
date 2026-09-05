import { expect, it } from 'vitest';
import { HypothesisRevisionNotDraftAtReleaseError } from '../../../errors/hypothesis-revision-not-draft-at-release.error.js';

const FIXED_MESSAGE =
  'this hypothesis-revision is not in draft state, and release is the one trigger that only ever moves a hypothesis-revision out of draft';

it('carries no context property at all, taking no constructor argument to build one from', () => {
  const error = new HypothesisRevisionNotDraftAtReleaseError();

  expect('context' in error).toBe(false);
});

it('answers its own condition through a fixed name and message, unshaped by any argument', () => {
  const error = new HypothesisRevisionNotDraftAtReleaseError();

  expect(error.name).toBe('HypothesisRevisionNotDraftAtReleaseError');
  expect(error.message).toBe(FIXED_MESSAGE);
});
