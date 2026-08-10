// Proof for domain/knowledge/consolidation-register, the standalone
// vocabulary module this task adds under src/investigation/: a closed set
// of exactly two values, formal and plain — a fixed style choice, never a
// growing vocabulary a new case could extend the way concept or
// subject-attribute are.
import { expect, it } from 'vitest';
import { CONSOLIDATION_REGISTERS } from '../../../investigation/consolidation-register.js';

it('declares exactly the two registers formal and plain, nothing else', () => {
  expect(CONSOLIDATION_REGISTERS).toEqual(['formal', 'plain']);
});
