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
// array of non-empty names, never whole subject-type records); and ttl
// optional (a registration that states none takes the glossary's own default
// — terms.ts's own DEFAULT_CONCEPT_TTL_SECONDS, applied by
// GlossaryService.registerConcept itself — this schema states only the
// shape, never that default).
//
// This module declares no response schema (MNT-03, kept in spirit with
// register-capability.dto.ts's own reasoning): the controller answers with
// the domain's own Concept type directly (terms.ts), the same three
// attributes read-concept.dto.ts's own readConceptResponseSchema already
// wire-encodes, so a second Zod-inferred shape is not declared here to keep
// in step with it.

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
 * registration that states none takes the glossary's own default.
 */
export const registerConceptBodySchema = z.object({
  accepts: z.array(z.string().min(1)),
  ttl: z.number().int().positive().optional(),
});

export type RegisterConceptBodyDto = z.infer<typeof registerConceptBodySchema>;
