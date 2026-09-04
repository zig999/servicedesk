import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { Resolution } from './case.js';

export type CaseVersionState = 'draft' | 'released';

export const HYPOTHESIS_REVISION_STATES = ['draft', 'released'] as const;

export type HypothesisRevisionState = (typeof HYPOTHESIS_REVISION_STATES)[number];

export type HypothesisRevisionContent = {
  readonly hypothesis_name: string;
  readonly revision: number;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

export type ManifestEntry = {
  readonly position: number;
  readonly hypothesis_revision: HypothesisRevisionContent;
};

export type AssembledCaseVersion = {
  readonly slug: string;
  readonly version: number;
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: string;
  readonly subject: string;
  readonly fallback: Resolution;
  readonly consolidation_register?: ConsolidationRegister;
  readonly state: CaseVersionState;

  readonly released_at?: string;
  readonly manifest: readonly ManifestEntry[];
};

export type CreateDraftInput = {
  readonly slug: string;
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: string;
  readonly subject: string;
  readonly fallback: Resolution;
  readonly consolidation_register?: ConsolidationRegister;

  readonly source_version?: number;
};

export type HypothesisRevisionInput = {
  readonly slug: string;
  readonly hypothesis_name: string;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

export type OverwriteHypothesisRevisionInput = HypothesisRevisionInput & {
  readonly revision: number;
};

export type UpdateDraftInput = {
  readonly title: string;
  readonly when_to_use: string;
  readonly subject: string;
  readonly fallback: Resolution;
  readonly consolidation_register?: ConsolidationRegister;
};

export type PlaceHypothesisInput = {
  readonly slug: string;
  readonly version: number;
  readonly hypothesis_name: string;
  readonly revision: number;
  readonly position: number;
};

export type CaseIdentity = {
  readonly slug: string;
};

export type CaseSummary = {
  readonly current_state?: CaseVersionState;
  readonly version_count: number;
  readonly last_updated?: string;
  readonly title?: string;
  readonly when_to_use?: string;
  readonly released_version?: number;
};

export type CaseCatalogEntry = CaseIdentity & CaseSummary;

export type CaseVersionListItem = {
  readonly version: number;
  readonly state: CaseVersionState;
};

export type HypothesisIdentity = {
  readonly name: string;
};

export type HypothesisRevisionListItem = {
  readonly revision: number;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
  readonly state: HypothesisRevisionState;
};

export interface ICaseStore {

  assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion | undefined>;

  findDraftVersion(slug: string): Promise<number | undefined>;

  listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>>;

  listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;

  listHypotheses(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>>;

  listHypothesisRevisions(
    slug: string,
    hypothesisName: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<HypothesisRevisionListItem>>;

  createDraft(input: CreateDraftInput): Promise<number>;

  insertHypothesisRevision(input: HypothesisRevisionInput): Promise<number>;

  placeHypothesis(input: PlaceHypothesisInput): Promise<void>;

  removeManifestEntry(slug: string, version: number, hypothesisName: string): Promise<void>;

  release(slug: string, version: number): Promise<void>;

  discard(slug: string, version: number): Promise<void>;

  updateDraft(slug: string, version: number, attributes: UpdateDraftInput): Promise<void>;
}
