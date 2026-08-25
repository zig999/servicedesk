// Wire shapes for GET /v1/capabilities/{name}/{version}
// (task/registry-reads/read-capability-by-identity-route,
// contracts/integration/capability-registry, domain/integration/capability):
// the path-parameter and response DTOs the route validates and types against
// (DTO-01/02/03), named for this use case the same way read-capability.dto.ts's
// own readCapabilityParamsSchema/readCapabilityResponseSchema and
// read-connector-configuration.dto.ts's own
// readConnectorConfigurationParamsSchema/readConnectorConfigurationResponseSchema
// already are.
//
// readCapabilityByIdentityParamsSchema carries the capability's own two
// identifying attributes, name and version (domain/integration/capability),
// read from the path the same way register-capability.dto.ts's own
// registerCapabilityParamsSchema already reads them for the write side of
// this same identity — never duplicated into a body, since this route
// carries none. readCapabilityByIdentityResponseSchema carries exactly
// domain/integration/capability's own eight attributes — every one of them,
// since criterion 1 asks for the capability "with its declared contract" —
// spelled with the same attribute names capability.ts's own Capability type
// holds them under, the identical shape read-capability.dto.ts's own
// readCapabilityResponseSchema already carries for the concept-keyed sibling
// route, since both answer the same domain type in full.

import { z } from 'zod';
import { CAPABILITY_NATURES } from '../../capability-registry/capability.js';

/**
 * The two path parameters this route reads: the capability's own identity,
 * name and version (domain/integration/capability), resolved through
 * CapabilityRegistryService's own readCapabilityByIdentity exactly as the
 * request spelled them — never trusted empty (EDG-01), though Fastify's own
 * route matching already refuses an empty path segment before this schema is
 * ever reached.
 */
export const readCapabilityByIdentityParamsSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

export type ReadCapabilityByIdentityParamsDto = z.infer<typeof readCapabilityByIdentityParamsSchema>;

/**
 * The capability currently registered under the named identity, whole —
 * domain/integration/capability's own name, version, nature, both schemas,
 * timeout in milliseconds, connector and the concept it answers — exactly as
 * CapabilityIdentityResolution's held branch carries it, with no field of
 * its own.
 */
export const readCapabilityByIdentityResponseSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  nature: z.enum(CAPABILITY_NATURES),
  input_schema: z.string().min(1),
  output_schema: z.string().min(1),
  timeout: z.int().positive(),
  connector: z.string().min(1),
  concept: z.string().min(1),
});

export type ReadCapabilityByIdentityResponseDto = z.infer<typeof readCapabilityByIdentityResponseSchema>;
