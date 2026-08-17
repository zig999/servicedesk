// Maps one validated list-hypothesis-revisions request to the published
// ICaseQuery call, and answers with whatever page it resolves, unchanged
// (task/case-query-http/list-hypothesis-revisions-route,
// contracts/knowledge/case-query): transport in, transport out, no business
// decision of its own — the one thing this controller itself decides is
// resolving the query's own optional offset/limit against the configured
// default and maximum this route's own wiring supplies, the same API-04
// bounding list-hypotheses.controller.ts's own resolvePagination already
// keeps (its own header comment), duplicated here rather than shared since
// the two controllers answer different routes and neither depends on the
// other's module (MNT-03 kept in spirit). Receives every dependency as an
// interface or a plain configured value (ARC-01); constructs none of it
// itself (ARC-02) — whichever factory eventually wires this route
// (mirroring createCaseQuery for read-case-route) is where caseQuery,
// defaultLimit and maxLimit are built.
//
// list-hypothesis-revisions carries both a :slug and a :name path
// parameter, naming a case and a hypothesis within it, so it can raise
// CaseNotFoundError for either half naming nothing this case has
// originated — this controller leaves it to propagate unchanged, the same
// convention list-hypotheses.controller.ts already keeps for its own
// :slug: the domain's own CaseQueryService.listHypothesisRevisions is a
// pass-through onto the case store, which raises the typed error itself
// (case-store.port.ts's own header comment), and the shared status map
// already resolves it to 404 (task/case-lifecycle-http/status-map,
// error-handler.middleware.ts). CaseNotFoundError here covers both an
// unknown slug and an unknown hypothesis name under a known slug — there is
// no separate "hypothesis not found under this case" distinction, since a
// single existence check against the hypotheses identity row answers both
// absences at once (case-store.port.ts's own header comment,
// relational-case-store.repository.ts's own listHypothesisRevisions).

import type { ICaseQuery } from '../case/case-query.port.js';
import type { HypothesisRevisionListItem } from '../case/case-store.port.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListHypothesisRevisionsQueryDto } from './dto/list-hypothesis-revisions.dto.js';

/**
 * Everything the controller needs beyond one request's own path and query
 * string: the published knowledge-context read, and the configured
 * pagination bound (API-04) this route's own wiring supplies rather than
 * this file hardcoding either figure.
 */
export type ListHypothesisRevisionsControllerDependencies = {
  readonly caseQuery: ICaseQuery;
  /** Applied where the request names no limit at all. */
  readonly defaultLimit: number;
  /** The most any single page may ever carry, whatever limit the request named. */
  readonly maxLimit: number;
};

/**
 * Handles one list-hypothesis-revisions request end to end: resolves the
 * query's own optional offset/limit against the configured bound
 * (resolvePagination below), reads the named hypothesis's page of
 * revisions through the published case-query contract, and answers with it
 * exactly as read — every field src/types/pagination.ts's own
 * PaginatedResponse<T> declares, computed by the store this contract
 * composes and never recomputed or dropped here. A slug or hypothesis name
 * naming nothing this case has originated is left to raise
 * CaseNotFoundError, uncaught.
 */
export async function handleListHypothesisRevisionsRequest(
  dependencies: ListHypothesisRevisionsControllerDependencies,
  slug: string,
  hypothesisName: string,
  query: ListHypothesisRevisionsQueryDto,
): Promise<PaginatedResponse<HypothesisRevisionListItem>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.caseQuery.listHypothesisRevisions(slug, hypothesisName, pagination);
}

/**
 * Resolves the query's own optional offset/limit into the PaginationRequest
 * the domain expects: offset defaults to 0 — the starting point of a
 * listing, not a business figure API-04 requires be configured — limit
 * defaults to the configured defaultLimit where the request names none,
 * and is otherwise capped at the configured maxLimit rather than refused,
 * so a caller naming an oversized limit still gets the largest page this
 * route allows instead of an error over a request that named nothing
 * malformed — the same inference list-hypotheses.controller.ts's own
 * resolvePagination already discloses in its delivery record, carried here
 * unchanged.
 */
function resolvePagination(
  query: ListHypothesisRevisionsQueryDto,
  bounds: Pick<ListHypothesisRevisionsControllerDependencies, 'defaultLimit' | 'maxLimit'>,
): PaginationRequest {
  const requestedLimit = query.limit ?? bounds.defaultLimit;
  return {
    offset: query.offset ?? 0,
    limit: Math.min(requestedLimit, bounds.maxLimit),
  };
}
