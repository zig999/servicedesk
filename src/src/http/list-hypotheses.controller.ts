import type { ICaseQuery } from '../case/case-query.port.js';
import type { HypothesisIdentity } from '../case/case-store.port.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListHypothesesQueryDto } from './dto/list-hypotheses.dto.js';

export type ListHypothesesControllerDependencies = {
  readonly caseQuery: ICaseQuery;

  readonly defaultLimit: number;

  readonly maxLimit: number;
};

export async function handleListHypothesesRequest(
  dependencies: ListHypothesesControllerDependencies,
  slug: string,
  query: ListHypothesesQueryDto,
): Promise<PaginatedResponse<HypothesisIdentity>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.caseQuery.listHypotheses(slug, pagination);
}

function resolvePagination(
  query: ListHypothesesQueryDto,
  bounds: Pick<ListHypothesesControllerDependencies, 'defaultLimit' | 'maxLimit'>,
): PaginationRequest {
  const requestedLimit = query.limit ?? bounds.defaultLimit;
  return {
    offset: query.offset ?? 0,
    limit: Math.min(requestedLimit, bounds.maxLimit),
  };
}
