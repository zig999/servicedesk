import { expectTypeOf, it } from 'vitest';
import type { RegisterConceptBodyDto } from '../../../../http/dto/register-concept.dto.js';

it("declares description as a required string on the exported type, matching domain/glossary/concept's own required attribute", () => {
  expectTypeOf<RegisterConceptBodyDto['description']>().toEqualTypeOf<string>();
});

it("refuses a value naming no description as RegisterConceptBodyDto, even though registerConceptBodySchema's own inference still leaves it optional", () => {
  // @ts-expect-error — RegisterConceptBodyDto overrides the schema's optional description into a required string

  const invalid: RegisterConceptBodyDto = { accepts: ['a-subject-type'] };
  void invalid;
});

it('still assigns a value naming no ttl to RegisterConceptBodyDto, since only description was widened to required', () => {
  const stillValid: RegisterConceptBodyDto = { accepts: ['a-subject-type'], description: 'a description' };
  void stillValid;
});
