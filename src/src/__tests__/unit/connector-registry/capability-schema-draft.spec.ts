import { expect, it } from 'vitest';
import { CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS } from '../../../connector-registry/capability-schema-draft.js';

it('declares the closed set of unresolved reasons as exactly schema-not-reducible-to-a-type and name-claimed-by-another-parameter', () => {
  expect(CAPABILITY_SCHEMA_DRAFT_UNRESOLVED_REASONS).toEqual([
    'schema-not-reducible-to-a-type',
    'name-claimed-by-another-parameter',
  ]);
});
