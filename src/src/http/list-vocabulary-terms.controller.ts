import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { GlossaryTerm } from '../glossary/terms.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { ListVocabularyTermsParamsDto, ListVocabularyTermsQueryDto } from './dto/list-vocabulary-terms.dto.js';

export type ListVocabularyTermsControllerDependencies = {
  readonly glossaryQuery: IGlossaryQuery;

  readonly defaultLimit: number;

  readonly maxLimit: number;
};

export async function handleListVocabularyTermsRequest(
  dependencies: ListVocabularyTermsControllerDependencies,
  params: ListVocabularyTermsParamsDto,
  query: ListVocabularyTermsQueryDto,
): Promise<PaginatedResponse<GlossaryTerm>> {
  const pagination = resolvePagination(query, dependencies);
  return dependencies.glossaryQuery.listVocabularyTerms(params.vocabulary, pagination);
}

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
