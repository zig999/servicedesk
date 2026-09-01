import type { ICaseQuery } from '../case/case-query.port.js';
import type { HypothesisRevisionListItem } from '../case/case-store.port.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListHypothesisRevisionsParamsDto, ListHypothesisRevisionsQueryDto } from './dto/list-hypothesis-revisions.dto.js';

export type ListHypothesisRevisionsControllerDependencies = {
  readonly caseQuery: ICaseQuery;

  readonly defaultLimit: number;

  readonly maxLimit: number;
};

export async function handleListHypothesisRevisionsRequest(
  dependencies: ListHypothesisRevisionsControllerDependencies,
  params: ListHypothesisRevisionsParamsDto,
  query: ListHypothesisRevisionsQueryDto,
): Promise<PaginatedResponse<HypothesisRevisionListItem>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.caseQuery.listHypothesisRevisions(params.slug, params.name, pagination);
}

function resolvePagination(
  query: ListHypothesisRevisionsQueryDto,
  bounds: Pick<ListHypothesisRevisionsControllerDependencies, 'defaultLimit' | 'maxLimit'>,
): PaginationRequest {
  const requestedLimit = query.limit ?? bounds.defaultLimit;
  return {
    offset: query.offset ?? 0,
    limit: Math.min(requestedLimit, bounds.maxLimit),
  };
}
