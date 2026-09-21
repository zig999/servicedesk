import { expectTypeOf, it } from 'vitest';
import type { IGlossaryStore } from '../../../glossary/glossary-store.port.js';

it('declares deleteConcept keyed by the concept name alone, returning Promise<void>, alongside the existing read and write methods', () => {
  expectTypeOf<IGlossaryStore['deleteConcept']>().parameters.toEqualTypeOf<[string]>();
  expectTypeOf<IGlossaryStore['deleteConcept']>().returns.toEqualTypeOf<Promise<void>>();
});
