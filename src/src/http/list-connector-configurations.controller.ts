// Maps one validated list-connector-configurations request to the published
// listConnectorConfigurations call, and answers with whatever page it
// resolves, each entry projected onto the wire shape
// (task/connector-configuration-authoring/list-connector-configurations-route,
// task/registry-reads/connector-configuration-response-wire-type,
// contracts/integration/connector-configuration-registry): transport in,
// transport out, no business decision of its own — the one thing this
// controller itself decides is resolving the query's own optional
// offset/limit against the configured default and maximum this route's own
// wiring supplies, since the standard's own API-04 assigns that bounding to
// "a controller/route concern" and forbids writing either figure in source
// (src/types/pagination.ts's own header comment), mirroring
// list-capabilities.controller.ts's own resolvePagination verbatim.
// Receives its one read dependency as a plain function type (ARC-01) — the
// listConnectorConfigurations operation alone — rather than constructing
// ConnectorConfigurationRegistryService or its store itself (ARC-02), the
// same shape read-connector-configuration.controller.ts's own
// ReadConnectorConfigurationControllerDependencies already takes for this
// registry's other read; the composition root that builds it is
// build-app.factory.ts's own composeResources, reusing the same
// ConnectorConfigurationRegistryService instance registerConnector and
// readConnectorConfiguration already share.
//
// Each entry's configuration is answered exactly as the registry now holds
// it — JSON object text, the type domain/integration/connector-configuration
// declares
// (task/connector-configuration-registration-conformance/configuration-held-as-text)
// — through handleListConnectorConfigurationsRequest mapping every entry
// through read-connector-configuration.controller.ts's own exported
// toReadConnectorConfigurationResponse (MNT-03 — the identical per-entry
// projection is called, not restated a second time) before the page ever
// answers.
//
// list-connector-configurations carries no path or body parameter naming a
// connector, so it raises no domain error of its own and needs no
// status-map entry of its own — every domain error this route could ever
// propagate is answered already, by whatever this app's shared error
// handler resolves for anything listConnectorConfigurations might raise
// (none, today: it is a bare read of the registry, same as
// listCapabilities, answering an empty page rather than an error for an
// empty registry).

import type { ConnectorConfiguration } from '../connector-registry/connector-configuration.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListConnectorConfigurationsQueryDto } from './dto/list-connector-configurations.dto.js';
import type { ReadConnectorConfigurationResponseDto } from './dto/read-connector-configuration.dto.js';
import { toReadConnectorConfigurationResponse } from './read-connector-configuration.controller.js';

/**
 * Everything the controller needs beyond one request's own query string: the
 * published listConnectorConfigurations read, and the configured pagination
 * bound (API-04) this route's own wiring supplies rather than this file
 * hardcoding either figure.
 */
export type ListConnectorConfigurationsControllerDependencies = {
  readonly listConnectorConfigurations: (
    pagination: PaginationRequest,
  ) => Promise<PaginatedResponse<ConnectorConfiguration>>;
  /** Applied where the request names no limit at all. */
  readonly defaultLimit: number;
  /** The most any single page may ever carry, whatever limit the request named. */
  readonly maxLimit: number;
};

/**
 * Handles one list-connector-configurations request end to end: resolves
 * the query's own optional offset/limit against the configured bound
 * (resolvePagination below), reads the page through the published
 * connector-configuration-registry read, and answers with it projected onto
 * the wire shape — every pagination field src/types/pagination.ts's own
 * PaginatedResponse<T> declares, computed by the registry this contract
 * composes and never recomputed or dropped here, alongside a data array
 * whose every entry is mapped through
 * read-connector-configuration.controller.ts's own
 * toReadConnectorConfigurationResponse (MNT-03) so each entry's
 * configuration answers as the JSON string
 * domain/integration/connector-configuration declares — exactly what the
 * registry now holds it as internally too
 * (task/connector-configuration-registration-conformance/configuration-held-as-text).
 */
export async function handleListConnectorConfigurationsRequest(
  dependencies: ListConnectorConfigurationsControllerDependencies,
  query: ListConnectorConfigurationsQueryDto,
): Promise<PaginatedResponse<ReadConnectorConfigurationResponseDto>> {
  const pagination = resolvePagination(query, dependencies);
  const page = await dependencies.listConnectorConfigurations(pagination);
  return {
    ...page,
    data: page.data.map(toReadConnectorConfigurationResponse),
  };
}

/**
 * Resolves the query's own optional offset/limit into the PaginationRequest
 * the domain expects: offset defaults to 0 — the starting point of a
 * listing, not a business figure API-04 requires be configured — limit
 * defaults to the configured defaultLimit where the request names none, and
 * is otherwise capped at the configured maxLimit rather than refused, so a
 * caller naming an oversized limit still gets the largest page this route
 * allows instead of an error over a request that named nothing malformed
 * (mirroring list-capabilities.controller.ts's own resolvePagination and its
 * own stated inference).
 */
function resolvePagination(
  query: ListConnectorConfigurationsQueryDto,
  bounds: Pick<ListConnectorConfigurationsControllerDependencies, 'defaultLimit' | 'maxLimit'>,
): PaginationRequest {
  const requestedLimit = query.limit ?? bounds.defaultLimit;
  return {
    offset: query.offset ?? 0,
    limit: Math.min(requestedLimit, bounds.maxLimit),
  };
}
