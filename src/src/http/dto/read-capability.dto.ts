// Wire shapes for GET /v1/capabilities/{concept} (task/capability-registry-http/read-capability-route,
// contracts/integration/capability-registry): the path-parameter and response DTOs the route
// validates and serializes against (DTO-02/DTO-03), named for this use case. The response schema
// carries exactly domain/integration/capability's own eight attributes — every one of them, since
// criterion 1 asks for the capability "with its declared contract" — spelled with the same
// attribute names the capability element and the registry's own store hold them under
// (capability.ts), so the wire shape and the domain shape agree rather than duplicating the
// vocabulary under a second set of names.

import { z } from 'zod';
import { CAPABILITY_NATURES } from '../../capability-registry/capability.js';

/**
 * The one path parameter this route reads: the concept named in the URL, resolved through
 * ICapabilityQuery.readCapability exactly as the request spelled it — never trusted empty
 * (EDG-01), though Fastify's own route matching already refuses an empty path segment before
 * this schema is ever reached.
 */
export const readCapabilityParamsSchema = z.object({
  concept: z.string().min(1),
});

export type ReadCapabilityParamsDto = z.infer<typeof readCapabilityParamsSchema>;

/**
 * The capability currently answering the named concept, whole — domain/integration/capability's
 * own name, version, nature, both schemas, timeout in milliseconds, connector and the concept it
 * answers — exactly as CapabilityResolution's held branch carries it, with no field of its own.
 */
export const readCapabilityResponseSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  nature: z.enum(CAPABILITY_NATURES),
  input_schema: z.string().min(1),
  output_schema: z.string().min(1),
  timeout: z.int().positive(),
  connector: z.string().min(1),
  concept: z.string().min(1),
});

export type ReadCapabilityResponseDto = z.infer<typeof readCapabilityResponseSchema>;
