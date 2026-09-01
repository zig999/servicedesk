import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { CaseNotFoundError } from '../errors/case-not-found.error.js';
import { CaseNotValidError } from '../errors/case-not-valid.error.js';
import { InvalidCaseDocumentError } from '../errors/invalid-case-document.error.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import {
  deriveCaseInputRequirements,
  everyRegisteredCapability,
  type CaseInputRequirementsResult,
} from './case-input-requirements.js';
import type { ICaseInputRequirementsQuery } from './case-input-requirements.port.js';
import type { Case, Hypothesis, ManifestEntry } from './case.js';
import type { ICaseQuery, ReadCaseResult } from './case-query.port.js';
import type {
  AssembledCaseVersion,
  CaseIdentity,
  CaseVersionListItem,
  HypothesisIdentity,
  HypothesisRevisionListItem,
  ICaseStore,
  ManifestEntry as StoredManifestEntry,
} from './case-store.port.js';
import { parseCaseDocument } from './parse-case-document.js';
import { caseCoherenceViolations } from './validate-case-coherence.js';

export class CaseQueryService implements ICaseQuery, ICaseInputRequirementsQuery {
  public constructor(
    private readonly caseStore: ICaseStore,
    private readonly glossary: IGlossaryQuery,
    private readonly capabilities: ICapabilityQuery,
  ) {}

  public async readCase(slug: string, version: number): Promise<ReadCaseResult> {
    const assembled = await heldVersion(this.caseStore, slug, version);
    const theCase = structuralCase(assembled, slug, version);
    await this.refuseIncoherence(theCase, version);
    return { case: theCase };
  }

  public async readCaseInputRequirements(slug: string, version: number): Promise<CaseInputRequirementsResult> {
    const assembled = await heldVersion(this.caseStore, slug, version);
    const theCase = structuralCase(assembled, slug, version);
    const registeredCapabilities = await everyRegisteredCapability(this.capabilities);
    return deriveCaseInputRequirements(theCase, registeredCapabilities);
  }

  public async listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseIdentity>> {
    return this.caseStore.listCases(pagination);
  }

  public async listCaseVersions(
    slug: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<CaseVersionListItem>> {
    return this.caseStore.listCaseVersions(slug, pagination);
  }

  public async listHypotheses(
    slug: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<HypothesisIdentity>> {
    return this.caseStore.listHypotheses(slug, pagination);
  }

  public async listHypothesisRevisions(
    slug: string,
    hypothesisName: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<HypothesisRevisionListItem>> {
    return this.caseStore.listHypothesisRevisions(slug, hypothesisName, pagination);
  }

  private async refuseIncoherence(theCase: Case, version: number): Promise<void> {
    const violations = await caseCoherenceViolations(theCase, this.glossary, this.capabilities);
    if (violations.length > 0) {
      throw new CaseNotValidError(theCase.slug, version, violations);
    }
  }
}

export async function replayCase(slug: string, version: number, caseStore: ICaseStore): Promise<Case> {
  const assembled = await heldVersion(caseStore, slug, version);
  return trustedCaseOf(assembled);
}

function trustedCaseOf(assembled: AssembledCaseVersion): Case {
  const manifest = assembled.manifest.map(trustedManifestEntryOf);
  return {
    slug: assembled.slug,
    title: assembled.title,
    when_to_use: assembled.when_to_use,
    version: assembled.version,
    authored_at: assembled.authored_at,
    subject: assembled.subject,
    fallback: assembled.fallback,
    ...(assembled.consolidation_register !== undefined
      ? { consolidation_register: assembled.consolidation_register }
      : {}),
    state: assembled.state,
    ...(assembled.released_at !== undefined ? { released_at: assembled.released_at } : {}),
    manifest,
    hypotheses: manifest.map(trustedHypothesisOf),
  };
}

function trustedManifestEntryOf(entry: StoredManifestEntry): ManifestEntry {
  const content = entry.hypothesis_revision;
  return {
    position: entry.position,
    hypothesis_revision: {
      hypothesis: { name: content.hypothesis_name },
      revision: content.revision,
      criterion: content.criterion,
      collects: content.collects,
      resolution: content.resolution,
    },
  };
}

function trustedHypothesisOf(entry: ManifestEntry): Hypothesis {
  const revision = entry.hypothesis_revision;
  return {
    name: revision.hypothesis.name,
    criterion: revision.criterion,
    collects: revision.collects,
    resolution: revision.resolution,
  };
}

async function heldVersion(store: ICaseStore, slug: string, version: number): Promise<AssembledCaseVersion> {
  const assembled = await store.assembleVersion(slug, version);
  if (assembled === undefined) {
    throw new CaseNotFoundError(slug, version);
  }
  return assembled;
}

function structuralCase(assembled: AssembledCaseVersion, slug: string, version: number): Case {
  try {
    return parseCaseDocument(assembledAsRawDocument(assembled), slug);
  } catch (error) {
    if (error instanceof InvalidCaseDocumentError) {
      throw new CaseNotValidError(slug, version, error.context.problems);
    }
    throw error;
  }
}

function assembledAsRawDocument(assembled: AssembledCaseVersion): unknown {
  return {
    slug: assembled.slug,
    title: assembled.title,
    when_to_use: assembled.when_to_use,
    version: assembled.version,
    authored_at: assembled.authored_at,
    subject: assembled.subject,
    fallback: assembled.fallback,
    ...(assembled.consolidation_register !== undefined
      ? { consolidation_register: assembled.consolidation_register }
      : {}),
    state: assembled.state,
    ...(assembled.released_at !== undefined ? { released_at: assembled.released_at } : {}),
    manifest: assembled.manifest.map((entry) => ({
      position: entry.position,
      hypothesis_name: entry.hypothesis_revision.hypothesis_name,
      revision: entry.hypothesis_revision.revision,
      criterion: entry.hypothesis_revision.criterion,
      collects: entry.hypothesis_revision.collects,
      resolution: entry.hypothesis_revision.resolution,
    })),
  };
}
