// Wire shapes for GET /v1/cases/{slug}/hypotheses/{name}/revisions
// (task/case-query-http/list-hypothesis-revisions-route, contracts/knowledge/case-query):
// the path-parameter and query-string DTOs the route validates its raw
// :slug, :name and offset/limit against (DTO-01/02/03), named for this use
// case the same way list-hypotheses.dto.ts's own listHypothesesParamsSchema
// and listHypothesesQuerySchema already are.
//
// This route names two path segments rather than list-hypotheses's own one:
// :slug, the case's own identity, and :name, the hypothesis's own bare name
// within that case (domain/knowledge/hypothesis). Both arrive as URL
// segments, so both are strings; listHypothesisRevisionsParamsSchema
// requires each non-empty the same way every other :slug- or :name-bearing
// route in this codebase already does — listHypothesesParamsSchema's own
// :slug (z.string().min(1), EDG-01, DTO-01) and
// read-vocabulary-term.dto.ts's own :name (also z.string().min(1)) are the
// two existing precedents this schema follows; there is no separate
// URL-safe-character convention for a hypothesis name anywhere in this
// codebase to diverge from, so this task keeps the same plain non-empty-string
// rule both existing precedents already use rather than inventing a
// narrower one.
//
// offset and limit are query-string segments, coerced and left optional the
// same way listHypothesesQuerySchema already keeps them — EDG-01 refuses
// input that is present but malformed, never input that is simply absent,
// and bounding an absent or oversized limit against a configured default
// and maximum is left to the controller
// (list-hypothesis-revisions.controller.ts), never hardcoded here (API-04).
//
// This module declares no response schema: GET
// /v1/cases/{slug}/hypotheses/{name}/revisions answers the shared
// PaginatedResponse<HypothesisRevisionListItem> src/types/pagination.ts and
// case-store.port.ts already declare (API-01 — "never redeclared per
// module"), so list-hypothesis-revisions.controller.ts types its own answer
// against those imported types directly rather than a second Zod-inferred
// shape this file would have to keep in step with them.

import { z } from 'zod';

/**
 * The two path parameters this route reads: the case's own slug identity
 * (domain/knowledge/case) and the hypothesis's own bare name within that
 * case (domain/knowledge/hypothesis) — both required non-empty, the same
 * convention listHypothesesParamsSchema keeps for its own :slug and
 * read-vocabulary-term.dto.ts's own readVocabularyTermParamsSchema keeps
 * for its own :name.
 */
export const listHypothesisRevisionsParamsSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
});

export type ListHypothesisRevisionsParamsDto = z.infer<typeof listHypothesisRevisionsParamsSchema>;

/**
 * The two query-string parameters GET
 * /v1/cases/{slug}/hypotheses/{name}/revisions accepts, each optional and
 * coerced from the raw string (or absence) a query string carries —
 * identical in shape and intent to listHypothesesQuerySchema
 * (list-hypotheses.dto.ts), duplicated here rather than imported since this
 * route's own path parameters sit alongside it in a distinct schema
 * (MNT-03 kept in spirit; the two schemas answer different routes, so
 * sharing one object would couple this route's query validation to
 * list-hypotheses's own, which this task does not touch).
 */
export const listHypothesisRevisionsQuerySchema = z.object({
  offset: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type ListHypothesisRevisionsQueryDto = z.infer<typeof listHypothesisRevisionsQuerySchema>;
