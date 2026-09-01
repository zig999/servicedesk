import type { ConnectorConfiguration } from '../connector-registry/connector-configuration.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListConnectorConfigurationsQueryDto } from './dto/list-connector-configurations.dto.js';
import type { ReadConnectorConfigurationResponseDto } from './dto/read-connector-configuration.dto.js';
import { toReadConnectorConfigurationResponse } from './read-connector-configuration.controller.js';

export type ListConnectorConfigurationsControllerDependencies = {
  readonly listConnectorConfigurations: (
    pagination: PaginationRequest,
  ) => Promise<PaginatedResponse<ConnectorConfiguration>>;

  readonly defaultLimit: number;

  readonly maxLimit: number;
};

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
