// Wire shapes for GET /v1/cases/{slug}/versions/{version}/input-requirements
// (contracts/knowledge/case-input-requirements): the path-parameter and
// response DTOs the route validates and serializes against (DTO-01/02/03),
// named for this use case the same way read-case.dto.ts's own
// readCaseParamsSchema/readCaseResponseSchema already are.
//
// :slug and :version are URL segments, so caseInputRequirementsParamsSchema
// requires and coerces them exactly as readCaseParamsSchema already does
// (z.string().min(1), z.coerce.number().int().positive()) — EDG-01, DTO-01.
//
// The response mirrors domain/knowledge/case-input-requirement's own three
// attributes (attribute, required, capabilities) per entry, each capability
// named by its own bare identity (name, version) rather than its whole
// registration — domain/knowledge/case-input-requirement's own "a capability
// referenced here already carries its own name, version, connector and the
// concept it answers; nothing here restates them" — plus, apart from those
// entries, every capability the plan resolves whose own stored input schema
// does not currently hold a well-formed shape
// (contracts/knowledge/case-input-requirements's own "so an operator can
// find and re-register it"), by the same bare identity.

import { z } from 'zod';

/**
 * The two path parameters this route reads: the case's own slug identity
 * (domain/knowledge/case) and the numbered version to read
 * (domain/knowledge/case-version), coerced from the URL's string segments
 * into the integer the domain operation expects — the same convention
 * read-case.dto.ts's own readCaseParamsSchema already keeps.
 */
export const caseInputRequirementsParamsSchema = z.object({
  slug: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export type CaseInputRequirementsParamsDto = z.infer<typeof caseInputRequirementsParamsSchema>;

/** One currently registered capability's own bare identity — name and version — the shape every capability reference in this response carries. */
const capabilityIdentitySchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

/** domain/knowledge/case-input-requirement: one subject attribute the collection plan reaches, whether the case requires it, and every capability currently asking for it. */
const caseInputRequirementSchema = z.object({
  attribute: z.string().min(1),
  required: z.boolean(),
  capabilities: z.array(capabilityIdentitySchema).min(1).readonly(),
});

/**
 * What read-case-input-requirements answers whole
 * (contracts/knowledge/case-input-requirements): the derived requirements,
 * and, apart from them, every capability the plan resolves whose own stored
 * input schema does not currently hold a well-formed shape.
 */
export const caseInputRequirementsResponseSchema = z.object({
  requirements: z.array(caseInputRequirementSchema).readonly(),
  capabilities_with_malformed_input_schema: z.array(capabilityIdentitySchema).readonly(),
});

export type CaseInputRequirementsResponseDto = z.infer<typeof caseInputRequirementsResponseSchema>;
