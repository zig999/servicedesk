// Maps one validated list-concepts request to the published IGlossaryQuery call, and answers with
// whatever page it resolves, unchanged (task/glossary-query-http/list-concepts-route,
// contracts/glossary/glossary-query): transport in, transport out, no business decision of its
// own — the one thing this controller itself decides is resolving the query's own optional
// offset/limit against the configured default and maximum this route's own wiring supplies, since
// the standard's own API-04 assigns that bounding to "a controller/route concern" and forbids
// writing either figure in source (src/types/pagination.ts's own header comment), exactly as
// list-cases.controller.ts already resolves its own. Receives every dependency as an interface or
// a plain configured value (ARC-01); constructs none of it itself (ARC-02) — whichever factory
// eventually wires this route (src/factories/glossary.factory.ts's own createGlossaryQuery) is
// where glossaryQuery, defaultLimit and maxLimit are built.
//
// list-concepts carries no path or body parameter naming a concept, so it raises no domain error
// of its own and needs no status-map entry of its own (task/case-lifecycle-http/status-map) —
// every domain error this route could ever propagate is answered already, by whatever this app's
// shared error handler resolves for anything GlossaryService.listConcepts might raise (none,
// today: it is a bare pass-through onto the glossary's own held concepts, which answers an empty
// page rather than an error for an empty holding).

import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { Concept } from '../glossary/terms.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListConceptsQueryDto } from './dto/list-concepts.dto.js';

/**
 * Everything the controller needs beyond one request's own query string: the published
 * glossary-query read, and the configured pagination bound (API-04) this route's own wiring
 * supplies rather than this file hardcoding either figure.
 */
export type ListConceptsControllerDependencies = {
  readonly glossaryQuery: IGlossaryQuery;
  /** Applied where the request names no limit at all. */
  readonly defaultLimit: number;
  /** The most any single page may ever carry, whatever limit the request named. */
  readonly maxLimit: number;
};

/**
 * Handles one list-concepts request end to end: resolves the query's own optional offset/limit
 * against the configured bound (resolvePagination below), reads the page through the published
 * glossary-query contract, and answers with it exactly as read — every field
 * src/types/pagination.ts's own PaginatedResponse<T> declares, computed by the service this
 * contract composes and never recomputed or dropped here.
 */
export async function handleListConceptsRequest(
  dependencies: ListConceptsControllerDependencies,
  query: ListConceptsQueryDto,
): Promise<PaginatedResponse<Concept>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.glossaryQuery.listConcepts(pagination);
}

/**
 * Resolves the query's own optional offset/limit into the PaginationRequest the domain expects:
 * offset defaults to 0 — the starting point of a listing, not a business figure API-04 requires
 * be configured — limit defaults to the configured defaultLimit where the request names none,
 * and is otherwise capped at the configured maxLimit rather than refused, so a caller naming an
 * oversized limit still gets the largest page this route allows instead of an error over a
 * request that named nothing malformed (mirroring list-cases.controller.ts's own inference,
 * disclosed in that task's own delivery record and reused here rather than re-decided).
 */
function resolvePagination(
  query: ListConceptsQueryDto,
  bounds: Pick<ListConceptsControllerDependencies, 'defaultLimit' | 'maxLimit'>,
): PaginationRequest {
  const requestedLimit = query.limit ?? bounds.defaultLimit;
  return {
    offset: query.offset ?? 0,
    limit: Math.min(requestedLimit, bounds.maxLimit),
  };
}
