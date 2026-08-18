// Wire shapes for GET /v1/glossary/concepts (task/glossary-query-http/list-concepts-route,
// contracts/glossary/glossary-query): the query-string DTO the route validates its raw
// offset/limit against (DTO-01/02/03), named for this use case the same way list-cases.dto.ts's
// own listCasesQuerySchema is.
//
// offset and limit are query-string segments, so they arrive as strings or as absent keys
// entirely; listConceptsQuerySchema coerces each exactly as listCasesQuerySchema already does
// (z.coerce.number()), and leaves both optional — EDG-01 refuses input that is present but
// malformed (a non-numeric or negative value), never input that is simply absent, since an
// absent limit or offset is not a request "missing" anything a listing needs: the standard's own
// API-04 presupposes exactly this absence by requiring a configured default for it. Bounding an
// absent or oversized limit against that configured default and maximum is left to the
// controller (list-concepts.controller.ts), not to this schema — mirroring list-cases.dto.ts's
// own reasoning for why that bounding belongs there rather than here.
//
// This module declares no response schema: GET /v1/glossary/concepts answers the shared
// PaginatedResponse<Concept> src/types/pagination.ts already declares (API-01 — "never
// redeclared per module"), so list-concepts.controller.ts types its own answer against that
// imported type directly rather than a second Zod-inferred shape this file would have to keep in
// step with it.

import { z } from 'zod';

/**
 * The two query-string parameters GET /v1/glossary/concepts accepts, each optional and coerced
 * from the raw string (or absence) a query string carries: offset, how many matching concepts
 * precede the first one this page returns, and limit, the most concepts this page may carry
 * before the controller's own configured default and maximum are applied.
 */
export const listConceptsQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListConceptsQueryDto = z.infer<typeof listConceptsQuerySchema>;
