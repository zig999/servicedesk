import { expect, it } from 'vitest';
import { TERM_VOCABULARIES } from '../../../glossary/terms.js';

it('lists exactly the four term vocabularies subject-type, outcome, action and recipient, in that order, holding no fifth entry', () => {
  expect(TERM_VOCABULARIES).toEqual(['subject-type', 'outcome', 'action', 'recipient']);
});
