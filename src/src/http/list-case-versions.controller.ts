import type { ICaseQuery } from '../case/case-query.port.js';
import type { CaseVersionListItem } from '../case/case-store.port.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListCaseVersionsQueryDto } from './dto/list-case-versions.dto.js';

export type ListCaseVersionsControllerDependencies = {
  readonly caseQuery: ICaseQuery;

  readonly defaultLimit: number;

  readonly maxLimit: number;
};

export async function handleListCaseVersionsRequest(
  dependencies: ListCaseVersionsControllerDependencies,
  slug: string,
  query: ListCaseVersionsQueryDto,
): Promise<PaginatedResponse<CaseVersionListItem>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.caseQuery.listCaseVersions(slug, pagination);
}

function resolvePagination(
  query: ListCaseVersionsQueryDto,
  bounds: Pick<ListCaseVersionsControllerDependencies, 'defaultLimit' | 'maxLimit'>,
): PaginationRequest {
  const requestedLimit = query.limit ?? bounds.defaultLimit;
  return {
    offset: query.offset ?? 0,
    limit: Math.min(requestedLimit, bounds.maxLimit),
  };
}
