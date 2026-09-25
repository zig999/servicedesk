import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { Case, Resolution } from './case.js';
import type {
  CaseCatalogEntry,
  CaseVersionListItem,
  HypothesisIdentity,
  HypothesisRevisionListItem,
} from './case-store.port.js';

export type ReadCaseResult = {
  readonly case: Case;
};

export type CaseVersionAttributes = {
  readonly title: string;
  readonly when_to_use: string;
  readonly subject: string;
  readonly fallback: Resolution;
  readonly consolidation_register?: ConsolidationRegister;
};

export type ReadCaseVersionResult = {
  readonly version: CaseVersionAttributes;
};

export interface ICaseQuery {

  readCase(slug: string, version: number): Promise<ReadCaseResult>;

  readCaseVersion(slug: string, version: number): Promise<ReadCaseVersionResult>;

  listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>;

  listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;

  listHypotheses(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>>;

  listHypothesisRevisions(
    slug: string,
    hypothesisName: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;
}
