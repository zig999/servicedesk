import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { Capability } from '../capability-registry/capability.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListCapabilitiesQueryDto } from './dto/list-capabilities.dto.js';

export type ListCapabilitiesControllerDependencies = {
  readonly capabilityQuery: ICapabilityQuery;

  readonly defaultLimit: number;

  readonly maxLimit: number;
};

export async function handleListCapabilitiesRequest(
  dependencies: ListCapabilitiesControllerDependencies,
  query: ListCapabilitiesQueryDto,
): Promise<PaginatedResponse<Capability>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.capabilityQuery.listCapabilities(pagination);
}

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
