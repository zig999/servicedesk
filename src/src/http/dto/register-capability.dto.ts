// Wire shapes for PUT /v1/capabilities/{name}/{version}
// (task/capability-authoring/register-capability-route,
// contracts/integration/capability-registry, domain/integration/capability):
// the path-parameter and request-body DTOs the route validates against
// (DTO-01/02/03), named for this use case the same way
// place-hypothesis.dto.ts's own placeHypothesisParamsSchema/placeHypothesisBodySchema
// are.
//
// registerCapabilityParamsSchema carries the capability's own two
// identifying attributes, name and version (domain/integration/capability),
// read from the path the same way place-hypothesis.dto.ts's own path
// segments are — never duplicated into the body. registerCapabilityBodySchema
// carries every other attribute domain/integration/capability declares plus
// the concept it answers: nature (capability.ts's own CAPABILITY_NATURES —
// an out-of-vocabulary nature answers 400 at this boundary; a vocabulary
// nature that is not read-only still reaches the registry, which refuses it,
// rules/integration/a-capability-is-read-only), input_schema, output_schema,
// connector and concept required and non-empty (EDG-01 refuses an absent or
// empty required attribute here, before the registry's own
// contract-completeness refusal is ever reached,
// rules/integration/a-capability-declares-its-contract), and timeout
// optional (a registration that states none takes the registry's own
// default of sixty seconds — capability.ts's own
// DEFAULT_CAPABILITY_TIMEOUT_MS — this schema states only the shape, never
// that default, criterion 6). timeout: z.number().int().positive() also
// refuses a declared-but-non-integer timeout — a decimal number or a numeric
// string alike — with this schema's own 400 VALIDATION_ERROR envelope, the
// same status and code for every non-integer value tested, distinct from
// the absent-timeout default above
// (task/capability-timeout-contract-refusal/non-integer-timeout-refusal,
// constraints/a-malformed-request-is-refused-with-a-validation-error): the
// value is declared, so it never reaches capability-registry.service.ts's
// own undeclared-attribute refusal
// (rules/integration/a-capability-declares-its-contract's own "absent or an
// empty string is undeclared", which a present, malformed value is not).
// This schema does not check input_schema or
// output_schema for JSON syntax
// (rules/integration/a-capability-declares-well-formed-schemas): that
// refusal belongs to the registry service alongside the refusals it already
// enforces (this task's own "What it is"), not to this boundary schema, so a
// syntactically invalid schema still reaches the controller and is refused
// there, through the registry's own typed error and the shared status map,
// rather than through this file's own VALIDATION_ERROR envelope.
//
// This module declares no response schema (MNT-03 kept in spirit with
// list-capabilities.dto.ts's own reasoning): the controller answers with the
// domain's own Capability type directly (capability.ts), the same eight
// attributes read-capability.dto.ts's own readCapabilityResponseSchema
// already wire-encodes, so a second Zod-inferred shape is not declared here
// to keep in step with it.

import { z } from 'zod';
import { CAPABILITY_NATURES } from '../../capability-registry/capability.js';

/**
 * The capability's own identity, read from the path
 * (domain/integration/capability) — never duplicated into the body.
 */
export const registerCapabilityParamsSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

export type RegisterCapabilityParamsDto = z.infer<typeof registerCapabilityParamsSchema>;

/**
 * Every attribute of the registration beyond its path-carried identity:
 * nature, both schemas, connector and the concept it answers required and
 * non-empty, timeout optional — a registration that states none takes the
 * registry's own default.
 */
export const registerCapabilityBodySchema = z.object({
  nature: z.enum(CAPABILITY_NATURES),
  input_schema: z.string().min(1),
  output_schema: z.string().min(1),
  timeout: z.number().int().positive().optional(),
  connector: z.string().min(1),
  concept: z.string().min(1),
});

export type RegisterCapabilityBodyDto = z.infer<typeof registerCapabilityBodySchema>;
