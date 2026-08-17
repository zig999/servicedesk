// Wire shapes for GET /v1/cases/{slug}/versions
// (task/case-query-http/list-case-versions-route, contracts/knowledge/case-query):
// the path-parameter and query-string DTOs the route validates its raw
// :slug and offset/limit against (DTO-01/02/03), named for this use case
// the same way list-cases.dto.ts's own listCasesQuerySchema and
// read-case.dto.ts's own readCaseParamsSchema are.
//
// :slug is a URL segment, so it arrives as a string; listCaseVersionsParamsSchema
// requires it non-empty the same way readCaseParamsSchema already requires
// its own :slug non-empty (z.string().min(1)) — EDG-01, DTO-01. Unlike
// read-case's :slug, this route names no :version segment at all: it lists
// every version a case holds rather than reading one.
//
// offset and limit are query-string segments, coerced and left optional the
// same way listCasesQuerySchema already keeps them — EDG-01 refuses input
// that is present but malformed, never input that is simply absent, and
// bounding an absent or oversized limit against a configured default and
// maximum is left to the controller (list-case-versions.controller.ts),
// never hardcoded here (API-04).
//
// This module declares no response schema: GET /v1/cases/{slug}/versions
// answers the shared PaginatedResponse<CaseVersionListItem>
// src/types/pagination.ts and case-store.port.ts already declare (API-01 —
// "never redeclared per module"), so list-case-versions.controller.ts types
// its own answer against those imported types directly rather than a second
// Zod-inferred shape this file would have to keep in step with them.

import { z } from 'zod';

/** The one path parameter this route reads: the case's own slug identity (domain/knowledge/case), the same non-empty-string convention readCaseParamsSchema already keeps for its own :slug. */
export const listCaseVersionsParamsSchema = z.object({
  slug: z.string().min(1),
});

export type ListCaseVersionsParamsDto = z.infer<typeof listCaseVersionsParamsSchema>;

/**
 * The two query-string parameters GET /v1/cases/{slug}/versions accepts,
 * each optional and coerced from the raw string (or absence) a query string
 * carries — identical in shape and intent to listCasesQuerySchema
 * (list-cases.dto.ts), duplicated here rather than imported since this
 * route's own path parameter sits alongside it in a distinct schema
 * (MNT-03 kept in spirit; the two schemas answer different routes, so
 * sharing one object would couple this route's query validation to
 * list-cases's own, which this task does not touch).
 */
export const listCaseVersionsQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListCaseVersionsQueryDto = z.infer<typeof listCaseVersionsQuerySchema>;
