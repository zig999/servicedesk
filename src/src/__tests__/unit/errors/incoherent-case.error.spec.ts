import { expect, it } from 'vitest';
import { IncoherentCaseError } from '../../../errors/incoherent-case.error.js';

it('still answers in English, left untouched by this initiative\'s Portuguese rewrite of the case and case-version refusals', () => {
  const error = new IncoherentCaseError('a-slug', ['a violation']);

  expect(error.message).toBe('the case "a-slug" violates its coherence rules: a violation');
});
