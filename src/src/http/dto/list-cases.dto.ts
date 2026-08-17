// Wire shapes for GET /v1/cases (task/case-query-http/list-cases-route,
// contracts/knowledge/case-query): the query-string DTO the route validates
// its raw offset/limit against (DTO-01/02/03), named for this use case the
// same way read-case.dto.ts's own readCaseParamsSchema is.
//
// offset and limit are query-string segments, so they arrive as strings or
// as absent keys entirely; listCasesQuerySchema coerces each the same way
// readCaseParamsSchema already coerces :version (z.coerce.number()), and
// leaves both optional — EDG-01 refuses input that is present but malformed
// (a non-numeric or negative value), never input that is simply absent, since
// an absent limit or offset is not a request "missing" anything a listing
// needs: the standard's own API-04 presupposes exactly this absence by
// requiring a configured default for it. Bounding an absent or oversized
// limit against that configured default and maximum is left to the
// controller (list-cases.controller.ts), not to this schema — the
// project's own src/types/pagination.ts states plainly that "bounding a
// limit against a configured default and maximum ... is a controller/route
// concern", and API-04 forbids writing either figure in source, which this
// schema — a fixed, static Zod object with no parameter of its own,
// matching every sibling DTO's own shape — has no way to do without
// hardcoding one.
//
// This module declares no response schema: GET /v1/cases answers the
// shared PaginatedResponse<CaseIdentity> src/types/pagination.ts already
// declares (API-01 — "never redeclared per module"), so list-cases.controller.ts
// types its own answer against that imported type directly rather than a
// second Zod-inferred shape this file would have to keep in step with it.

import { z } from 'zod';

/**
 * The two query-string parameters GET /v1/cases accepts, each optional and
 * coerced from the raw string (or absence) a query string carries: offset,
 * how many matching cases precede the first one this page returns, and
 * limit, the most cases this page may carry before the controller's own
 * configured default and maximum are applied.
 */
export const listCasesQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListCasesQueryDto = z.infer<typeof listCasesQuerySchema>;
