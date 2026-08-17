// Wire shapes for GET /v1/cases/{slug}/hypotheses
// (task/case-query-http/list-hypotheses-route, contracts/knowledge/case-query):
// the path-parameter and query-string DTOs the route validates its raw
// :slug and offset/limit against (DTO-01/02/03), named for this use case
// the same way list-case-versions.dto.ts's own listCaseVersionsParamsSchema
// and listCaseVersionsQuerySchema already are.
//
// :slug is a URL segment, so it arrives as a string; listHypothesesParamsSchema
// requires it non-empty the same way listCaseVersionsParamsSchema and
// readCaseParamsSchema already require their own :slug non-empty
// (z.string().min(1)) — EDG-01, DTO-01. This route names no other segment:
// it lists every hypothesis a case has ever originated rather than reading
// one version or one hypothesis.
//
// offset and limit are query-string segments, coerced and left optional the
// same way listCaseVersionsQuerySchema already keeps them — EDG-01 refuses
// input that is present but malformed, never input that is simply absent,
// and bounding an absent or oversized limit against a configured default
// and maximum is left to the controller (list-hypotheses.controller.ts),
// never hardcoded here (API-04).
//
// This module declares no response schema: GET /v1/cases/{slug}/hypotheses
// answers the shared PaginatedResponse<HypothesisIdentity>
// src/types/pagination.ts and case-store.port.ts already declare (API-01 —
// "never redeclared per module"), so list-hypotheses.controller.ts types
// its own answer against those imported types directly rather than a second
// Zod-inferred shape this file would have to keep in step with them.

import { z } from 'zod';

/** The one path parameter this route reads: the case's own slug identity (domain/knowledge/case), the same non-empty-string convention listCaseVersionsParamsSchema and readCaseParamsSchema already keep for their own :slug. */
export const listHypothesesParamsSchema = z.object({
  slug: z.string().min(1),
});

export type ListHypothesesParamsDto = z.infer<typeof listHypothesesParamsSchema>;

/**
 * The two query-string parameters GET /v1/cases/{slug}/hypotheses accepts,
 * each optional and coerced from the raw string (or absence) a query string
 * carries — identical in shape and intent to listCaseVersionsQuerySchema
 * (list-case-versions.dto.ts), duplicated here rather than imported since
 * this route's own path parameter sits alongside it in a distinct schema
 * (MNT-03 kept in spirit; the two schemas answer different routes, so
 * sharing one object would couple this route's query validation to
 * list-case-versions's own, which this task does not touch).
 */
export const listHypothesesQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListHypothesesQueryDto = z.infer<typeof listHypothesesQuerySchema>;
