// Maps one validated list-cases request to the published ICaseQuery call,
// and answers with whatever page it resolves, unchanged
// (task/case-query-http/list-cases-route, contracts/knowledge/case-query):
// transport in, transport out, no business decision of its own — the one
// thing this controller itself decides is resolving the query's own
// optional offset/limit against the configured default and maximum this
// route's own wiring supplies, since the standard's own API-04 assigns that
// bounding to "a controller/route concern" and forbids writing either figure
// in source (src/types/pagination.ts's own header comment). Receives every
// dependency as an interface or a plain configured value (ARC-01);
// constructs none of it itself (ARC-02) — whichever factory eventually
// wires this route (mirroring createCaseQuery for read-case-route) is where
// caseQuery, defaultLimit and maxLimit are built.
//
// list-cases carries no path or body parameter naming a case, so it raises
// no CaseNotFoundError and needs no status-map entry of its own
// (task/case-lifecycle-http/status-map) — every domain error this route
// could ever propagate is answered already, by whatever this app's shared
// error handler resolves for anything CaseQueryService.listCases might
// raise (none, today: it is a bare pass-through onto the case store's own
// listCases, which answers an empty page rather than an error for an empty
// store).

import type { ICaseQuery } from '../case/case-query.port.js';
import type { CaseIdentity } from '../case/case-store.port.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListCasesQueryDto } from './dto/list-cases.dto.js';

/**
 * Everything the controller needs beyond one request's own query string:
 * the published knowledge-context read, and the configured pagination
 * bound (API-04) this route's own wiring supplies rather than this file
 * hardcoding either figure.
 */
export type ListCasesControllerDependencies = {
  readonly caseQuery: ICaseQuery;
  /** Applied where the request names no limit at all. */
  readonly defaultLimit: number;
  /** The most any single page may ever carry, whatever limit the request named. */
  readonly maxLimit: number;
};

/**
 * Handles one list-cases request end to end: resolves the query's own
 * optional offset/limit against the configured bound (resolvePagination
 * below), reads the page through the published case-query contract, and
 * answers with it exactly as read — every field src/types/pagination.ts's
 * own PaginatedResponse<T> declares, computed by the store this contract
 * composes and never recomputed or dropped here.
 */
export async function handleListCasesRequest(
  dependencies: ListCasesControllerDependencies,
  query: ListCasesQueryDto,
): Promise<PaginatedResponse<CaseIdentity>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.caseQuery.listCases(pagination);
}

/**
 * Resolves the query's own optional offset/limit into the PaginationRequest
 * the domain expects: offset defaults to 0 — the starting point of a
 * listing, not a business figure API-04 requires be configured — limit
 * defaults to the configured defaultLimit where the request names none,
 * and is otherwise capped at the configured maxLimit rather than refused,
 * so a caller naming an oversized limit still gets the largest page this
 * route allows instead of an error over a request that named nothing
 * malformed (this task's own inference, disclosed in its delivery record).
 */
function resolvePagination(
  query: ListCasesQueryDto,
  bounds: Pick<ListCasesControllerDependencies, 'defaultLimit' | 'maxLimit'>,
): PaginationRequest {
  const requestedLimit = query.limit ?? bounds.defaultLimit;
  return {
    offset: query.offset ?? 0,
    limit: Math.min(requestedLimit, bounds.maxLimit),
  };
}
