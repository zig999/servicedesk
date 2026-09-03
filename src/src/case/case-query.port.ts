import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { Case } from './case.js';
import type {
  CaseCatalogEntry,
  CaseVersionListItem,
  HypothesisIdentity,
  HypothesisRevisionListItem,
} from './case-store.port.js';

export type ReadCaseResult = {
  readonly case: Case;
};

export interface ICaseQuery {

  readCase(slug: string, version: number): Promise<ReadCaseResult>;

  listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>;

  listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;

  listHypotheses(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>>;

  listHypothesisRevisions(
    slug: string,
    hypothesisName: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;
}
