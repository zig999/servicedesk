// Maps one validated list-capabilities request to the published ICapabilityQuery call, and
// answers with whatever page it resolves, unchanged (task/capability-registry-http/list-capabilities-route,
// contracts/integration/capability-registry): transport in, transport out, no business decision
// of its own — the one thing this controller itself decides is resolving the query's own
// optional offset/limit against the configured default and maximum this route's own wiring
// supplies, since the standard's own API-04 assigns that bounding to "a controller/route
// concern" and forbids writing either figure in source (src/types/pagination.ts's own header
// comment), mirroring list-cases.controller.ts's own resolvePagination verbatim. Receives every
// dependency as an interface or a plain configured value (ARC-01); constructs none of it itself
// (ARC-02) — whichever factory eventually wires this route (mirroring createCapabilityQuery for
// read-capability-route) is where capabilityQuery, defaultLimit and maxLimit are built.
//
// list-capabilities carries no path or body parameter naming a capability, so it raises no
// domain error of its own and needs no status-map entry of its own
// (task/case-lifecycle-http/status-map) — every domain error this route could ever propagate is
// answered already, by whatever this app's shared error handler resolves for anything
// ICapabilityQuery.listCapabilities might raise (none, today: it is a bare read of the registry,
// same as listCases, answering an empty page rather than an error for an empty registry).

import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { Capability } from '../capability-registry/capability.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListCapabilitiesQueryDto } from './dto/list-capabilities.dto.js';

/**
 * Everything the controller needs beyond one request's own query string: the published
 * capability-registry read, and the configured pagination bound (API-04) this route's own wiring
 * supplies rather than this file hardcoding either figure.
 */
export type ListCapabilitiesControllerDependencies = {
  readonly capabilityQuery: ICapabilityQuery;
  /** Applied where the request names no limit at all. */
  readonly defaultLimit: number;
  /** The most any single page may ever carry, whatever limit the request named. */
  readonly maxLimit: number;
};

/**
 * Handles one list-capabilities request end to end: resolves the query's own optional
 * offset/limit against the configured bound (resolvePagination below), reads the page through
 * the published capability-registry contract, and answers with it exactly as read — every field
 * src/types/pagination.ts's own PaginatedResponse<T> declares, computed by the registry this
 * contract composes and never recomputed or dropped here.
 */
export async function handleListCapabilitiesRequest(
  dependencies: ListCapabilitiesControllerDependencies,
  query: ListCapabilitiesQueryDto,
): Promise<PaginatedResponse<Capability>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.capabilityQuery.listCapabilities(pagination);
}

/**
 * Resolves the query's own optional offset/limit into the PaginationRequest the domain expects:
 * offset defaults to 0 — the starting point of a listing, not a business figure API-04 requires
 * be configured — limit defaults to the configured defaultLimit where the request names none,
 * and is otherwise capped at the configured maxLimit rather than refused, so a caller naming an
 * oversized limit still gets the largest page this route allows instead of an error over a
 * request that named nothing malformed (this task's own inference, disclosed in its delivery
 * record, mirroring list-cases.controller.ts's own resolvePagination and its own stated
 * inference).
 */
function resolvePagination(
  query: ListCapabilitiesQueryDto,
  bounds: Pick<ListCapabilitiesControllerDependencies, 'defaultLimit' | 'maxLimit'>,
): PaginationRequest {
  const requestedLimit = query.limit ?? bounds.defaultLimit;
  return {
    offset: query.offset ?? 0,
    limit: Math.min(requestedLimit, bounds.maxLimit),
  };
}
