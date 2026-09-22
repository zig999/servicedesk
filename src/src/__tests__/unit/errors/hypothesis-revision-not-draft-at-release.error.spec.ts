import { expect, it } from 'vitest';
import { HypothesisRevisionNotDraftAtReleaseError } from '../../../errors/hypothesis-revision-not-draft-at-release.error.js';

const FIXED_MESSAGE =
  'esta revisão não está em estado de rascunho, e a liberação é o único gatilho que move uma revisão para fora do rascunho';

it('carries no context property at all, taking no constructor argument to build one from', () => {
  const error = new HypothesisRevisionNotDraftAtReleaseError();

  expect('context' in error).toBe(false);
});

it('answers its own condition through a fixed name and message, unshaped by any argument', () => {
  const error = new HypothesisRevisionNotDraftAtReleaseError();

  expect(error.name).toBe('HypothesisRevisionNotDraftAtReleaseError');
  expect(error.message).toBe(FIXED_MESSAGE);
});

it('names the revision and the draft state with their fixed Portuguese words, using no English domain noun for either', () => {
  const error = new HypothesisRevisionNotDraftAtReleaseError();

  expect(error.message).toMatch(/\brevisão\b/);
  expect(error.message).toMatch(/\brascunho\b/);
  expect(error.message).not.toMatch(/\brevision\b/i);
  expect(error.message).not.toMatch(/\bdraft\b/i);
});

it('carries no language distinguishing which of its two triggers — an already-released revision or an identity nothing was ever stored for — raised it', () => {
  const error = new HypothesisRevisionNotDraftAtReleaseError();

  expect(error.message).not.toMatch(/armazenad/i);
  expect(error.message).not.toMatch(/\bliberada\b/i);
  expect(error.message).not.toMatch(/existe/i);
  expect(error.message).not.toMatch(/identidade/i);
});
