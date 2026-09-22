import { expect, it } from 'vitest';
import { InvalidCaseDocumentError } from '../../../errors/invalid-case-document.error.js';

it('still answers in English, left untouched by this initiative\'s Portuguese rewrite of the case and case-version refusals', () => {
  const error = new InvalidCaseDocumentError('a-file', ['a problem']);

  expect(error.message).toBe('the case document "a-file" violates its structural rules: a problem');
});
