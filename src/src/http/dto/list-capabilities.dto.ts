// Wire shapes for GET /v1/capabilities (task/capability-registry-http/list-capabilities-route,
// contracts/integration/capability-registry): the query-string DTO the route validates its raw
// offset/limit against (DTO-01/02/03), named for this use case the same way
// list-cases.dto.ts's own listCasesQuerySchema is.
//
// offset and limit are query-string segments, so they arrive as strings or as absent keys
// entirely; listCapabilitiesQuerySchema coerces each the same way listCasesQuerySchema already
// coerces its own (z.coerce.number()), and leaves both optional — EDG-01 refuses input that is
// present but malformed (a non-numeric or negative value), never input that is simply absent,
// since an absent limit or offset is not a request "missing" anything a listing needs: the
// standard's own API-04 presupposes exactly this absence by requiring a configured default for
// it. Bounding an absent or oversized limit against that configured default and maximum is left
// to the controller (list-capabilities.controller.ts), not to this schema — mirroring
// list-cases.dto.ts's own reasoning, which cites src/types/pagination.ts's own header comment
// stating plainly that this bounding "is a controller/route concern".
//
// This module declares no response schema: GET /v1/capabilities answers the shared
// PaginatedResponse<Capability> src/types/pagination.ts already declares (API-01 — "never
// redeclared per module"), so list-capabilities.controller.ts types its own answer against that
// imported type directly rather than a second Zod-inferred shape this file would have to keep in
// step with it.

import { z } from 'zod';

/**
 * The two query-string parameters GET /v1/capabilities accepts, each optional and coerced from
 * the raw string (or absence) a query string carries: offset, how many matching capabilities
 * precede the first one this page returns, and limit, the most capabilities this page may carry
 * before the controller's own configured default and maximum are applied.
 */
export const listCapabilitiesQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListCapabilitiesQueryDto = z.infer<typeof listCapabilitiesQuerySchema>;
