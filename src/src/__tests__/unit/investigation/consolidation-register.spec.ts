import { expect, it } from 'vitest';
import { CONSOLIDATION_REGISTERS } from '../../../investigation/consolidation-register.js';

it('declares exactly the two registers formal and plain, nothing else', () => {
  expect(CONSOLIDATION_REGISTERS).toEqual(['formal', 'plain']);
});
