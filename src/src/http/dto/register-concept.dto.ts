// Wire shapes for PUT /v1/glossary/concepts/{name}
// (task/concept-authoring/register-concept-route,
// contracts/glossary/glossary-authoring, domain/glossary/concept): the
// path-parameter and request-body DTOs the route validates against
// (DTO-01/02/03), named for this use case the same way
// register-capability.dto.ts's own registerCapabilityParamsSchema/
// registerCapabilityBodySchema are, and spelled under /glossary/concepts the
// same way read-concept.dto.ts's own path is.
//
// registerConceptParamsSchema carries the concept's own one identifying
// attribute, name (domain/glossary/concept), read from the path the same way
// register-capability.dto.ts's own :name segment is — never duplicated into
// the body. registerConceptBodySchema carries every other attribute
// domain/glossary/concept declares: accepts, required (EDG-01 refuses an
// absent body field here, before the service is ever reached), each named
// subject type non-empty (mirroring read-concept.dto.ts's own
// readConceptResponseSchema, which spells accepts the same way — a plain
// array of non-empty names, never whole subject-type records); ttl optional
// (a registration that states none takes the glossary's own default — terms.ts's
// own DEFAULT_CONCEPT_TTL_SECONDS, applied by GlossaryService.registerConcept
// itself — this schema states only the shape, never that default); and
// description optional at this boundary, deliberately not required here even
// though domain/glossary/concept declares it required
// (rules/glossary/a-concept-declares-its-description): the specification's
// own refusal for a registration naming none is a typed
// ConceptDescriptionRequiredError answered with HTTP 422 and that exact
// error name, not this route's own generic 400 VALIDATION_ERROR envelope
// (registerConceptHandler's own safeParse rejection above would answer the
// latter), so this schema lets an absent description reach
// GlossaryService.registerConcept, which is where that refusal is actually
// raised (task/concept-description/concept-registration-requires-a-description)
// — the same not-required-here-so-the-service-raises-its-own-typed-refusal
// reasoning register-capability.dto.ts and register-connector.dto.ts already
// state for input_schema/output_schema and configuration's own
// well-formedness refusals.
//
// This module declares no response schema (MNT-03, kept in spirit with
// register-capability.dto.ts's own reasoning): the controller answers with
// the domain's own Concept type directly (terms.ts), whole — now four
// attributes, description among them, since read-concept-returns-description
// (task/concept-description/read-concept-returns-description) is the sibling
// task that carries description onto GET /v1/glossary/concepts/{name}'s own
// response schema; this route's own response was never a second, narrower
// Zod-inferred shape, so it answers whatever GlossaryService.registerConcept
// resolves without waiting on that sibling task.

import { z } from 'zod';

/**
 * The concept's own identity, read from the path (domain/glossary/concept)
 * — never duplicated into the body.
 */
export const registerConceptParamsSchema = z.object({
  name: z.string().min(1),
});

export type RegisterConceptParamsDto = z.infer<typeof registerConceptParamsSchema>;

/**
 * Every attribute of the registration beyond its path-carried identity:
 * accepts required, each named subject type non-empty, ttl optional — a
 * registration that states none takes the glossary's own default —
 * and description optional here even though the domain declares it
 * required: an absent one is refused by GlossaryService.registerConcept
 * itself, with its own typed ConceptDescriptionRequiredError, never by this
 * schema (rules/glossary/a-concept-declares-its-description).
 */
export const registerConceptBodySchema = z.object({
  accepts: z.array(z.string().min(1)),
  ttl: z.number().int().positive().optional(),
  description: z.string().optional(),
});

export type RegisterConceptBodyDto = z.infer<typeof registerConceptBodySchema>;
