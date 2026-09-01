import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { Concept } from '../glossary/terms.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListConceptsQueryDto } from './dto/list-concepts.dto.js';

export type ListConceptsControllerDependencies = {
  readonly glossaryQuery: IGlossaryQuery;

  readonly defaultLimit: number;

  readonly maxLimit: number;
};

export async function handleListConceptsRequest(
  dependencies: ListConceptsControllerDependencies,
  query: ListConceptsQueryDto,
): Promise<PaginatedResponse<Concept>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.glossaryQuery.listConcepts(pagination);
}

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
