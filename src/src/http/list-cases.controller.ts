import type { ICaseQuery } from '../case/case-query.port.js';
import type { CaseIdentity } from '../case/case-store.port.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListCasesQueryDto } from './dto/list-cases.dto.js';

export type ListCasesControllerDependencies = {
  readonly caseQuery: ICaseQuery;

  readonly defaultLimit: number;

  readonly maxLimit: number;
};

export async function handleListCasesRequest(
  dependencies: ListCasesControllerDependencies,
  query: ListCasesQueryDto,
): Promise<PaginatedResponse<CaseIdentity>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.caseQuery.listCases(pagination);
}

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
