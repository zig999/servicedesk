// Wire shapes for GET /v1/glossary/concepts/{name} (task/glossary-query-http/read-concept-route,
// contracts/glossary/glossary-query): the path-parameter and response DTOs the route validates
// and serializes against (DTO-01/02/03), named for this use case the same way
// read-capability.dto.ts's own readCapabilityParamsSchema/ResponseSchema are.
//
// readConceptResponseSchema carries domain/glossary/concept's own attributes — name, the subject
// types it accepts (by name), its ttl in seconds and its description — since criterion 1 asks for
// the concept "exactly as the glossary currently holds it, including its accepted subject types
// and its ttl", and the read-concept-returns-description task widens that to the description a
// held concept publishes, empty for a legacy concept holding none
// (scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone) rather
// than absent. accepts is spelled as a plain array of names (glossary-query.port.ts's own
// ConceptResolution carries Concept.accepts the same way — names, never whole subject-type
// records), so the wire shape agrees with the domain shape rather than duplicating it under a
// second set of names.
//
// ttl is required positive: rules/knowledge/a-collected-concept-declares-a-ttl guarantees every
// held concept carries one (the default of sixty seconds fills a registration that stated none
// before the glossary ever answers a read), so the wire shape never has to represent its absence.

import { z } from 'zod';

/**
 * The one path parameter this route reads: the concept named in the URL, resolved through
 * IGlossaryQuery.readConcept exactly as the request spelled it — never trusted empty (EDG-01),
 * though Fastify's own route matching already refuses an empty path segment before this schema is
 * ever reached.
 */
export const readConceptParamsSchema = z.object({
  name: z.string().min(1),
});

export type ReadConceptParamsDto = z.infer<typeof readConceptParamsSchema>;

/**
 * The concept currently held by the glossary, whole — domain/glossary/concept's own name, the
 * subject types it accepts, its ttl in seconds and its description — exactly as ConceptResolution's
 * held branch carries it, with no field of its own. description is a plain, always-present string
 * (never optional): GlossaryService.concepts() already defaults an absent stored value to the
 * empty string, so a legacy concept with none answers `''` here rather than an absent key
 * (scenarios/investigation/a-legacy-concept-without-a-description-judges-by-name-alone).
 */
export const readConceptResponseSchema = z.object({
  name: z.string().min(1),
  accepts: z.array(z.string().min(1)).readonly(),
  ttl: z.int().positive(),
  description: z.string(),
});

export type ReadConceptResponseDto = z.infer<typeof readConceptResponseSchema>;
