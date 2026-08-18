// Maps one validated list-vocabulary-terms request to the published IGlossaryQuery call, and
// answers with whatever page it resolves, unchanged (task/glossary-query-http/list-vocabulary-terms-route,
// contracts/glossary/glossary-query): transport in, transport out, no business decision of its own
// — the one thing this controller itself decides is resolving the query's own optional
// offset/limit against the configured default and maximum this route's own wiring supplies, since
// the standard's own API-04 assigns that bounding to "a controller/route concern" and forbids
// writing either figure in source (src/types/pagination.ts's own header comment), exactly as
// list-cases.controller.ts and list-concepts.controller.ts already resolve their own. Receives
// every dependency as an interface or a plain configured value (ARC-01); constructs none of it
// itself (ARC-02) — whichever factory eventually wires this route
// (src/factories/glossary.factory.ts's own createGlossaryQuery) is where glossaryQuery,
// defaultLimit and maxLimit are built.
//
// Which vocabulary to list arrives already validated against TERM_VOCABULARIES by this route's own
// DTO (list-vocabulary-terms.dto.ts) before this controller is ever reached, so this controller
// raises no domain error of its own and needs no status-map entry of its own
// (task/case-lifecycle-http/status-map) — IGlossaryQuery.listVocabularyTerms raises none either for
// an unrecognized vocabulary (verified against glossary.service.ts and glossary-query.port.ts, and
// the query-extension task's own implementation and proof), and every domain error this route could
// otherwise ever propagate is answered already, by whatever this app's shared error handler
// resolves.

import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { GlossaryTerm } from '../glossary/terms.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListVocabularyTermsParamsDto, ListVocabularyTermsQueryDto } from './dto/list-vocabulary-terms.dto.js';

/**
 * Everything the controller needs beyond one request's own path parameter and query string: the
 * published glossary-query read, and the configured pagination bound (API-04) this route's own
 * wiring supplies rather than this file hardcoding either figure.
 */
export type ListVocabularyTermsControllerDependencies = {
  readonly glossaryQuery: IGlossaryQuery;
  /** Applied where the request names no limit at all. */
  readonly defaultLimit: number;
  /** The most any single page may ever carry, whatever limit the request named. */
  readonly maxLimit: number;
};

/**
 * Handles one list-vocabulary-terms request end to end: resolves the query's own optional
 * offset/limit against the configured bound (resolvePagination below), reads the page of the named
 * vocabulary through the published glossary-query contract, and answers with it exactly as read —
 * every field src/types/pagination.ts's own PaginatedResponse<T> declares, computed by the service
 * this contract composes and never recomputed or dropped here.
 */
export async function handleListVocabularyTermsRequest(
  dependencies: ListVocabularyTermsControllerDependencies,
  params: ListVocabularyTermsParamsDto,
  query: ListVocabularyTermsQueryDto,
): Promise<PaginatedResponse<GlossaryTerm>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.glossaryQuery.listVocabularyTerms(params.vocabulary, pagination);
}

/**
 * Resolves the query's own optional offset/limit into the PaginationRequest the domain expects:
 * offset defaults to 0 — the starting point of a listing, not a business figure API-04 requires be
 * configured — limit defaults to the configured defaultLimit where the request names none, and is
 * otherwise capped at the configured maxLimit rather than refused, so a caller naming an oversized
 * limit still gets the largest page this route allows instead of an error over a request that named
 * nothing malformed (mirroring list-cases.controller.ts's and list-concepts.controller.ts's own
 * inference, disclosed in list-cases-route's own delivery record and reused here rather than
 * re-decided).
 */
function resolvePagination(
  query: ListVocabularyTermsQueryDto,
  bounds: Pick<ListVocabularyTermsControllerDependencies, 'defaultLimit' | 'maxLimit'>,
): PaginationRequest {
  const requestedLimit = query.limit ?? bounds.defaultLimit;
  return {
    offset: query.offset ?? 0,
    limit: Math.min(requestedLimit, bounds.maxLimit),
  };
}
