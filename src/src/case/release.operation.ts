import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { CaseNotFoundError } from '../errors/case-not-found.error.js';
import { CaseVersionNotDraftAtReleaseError } from '../errors/case-version-not-draft-at-release.error.js';
import { CaseVersionNotReleasableError } from '../errors/case-version-not-releasable.error.js';
import { InvalidCaseDocumentError } from '../errors/invalid-case-document.error.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { Case } from './case.js';
import type { AssembledCaseVersion, ICaseStore } from './case-store.port.js';
import type { IHypothesisRevisionOwnStateQuery } from './hypothesis-revision-own-state.port.js';
import { parseCaseDocument } from './parse-case-document.js';
import { caseCoherenceViolations } from './validate-case-coherence.js';

const RELEASED_STATE = 'released';

export interface IRelease {

  release(slug: string, version: number): Promise<void>;
}

export class ReleaseOperation implements IRelease {
  public constructor(
    private readonly caseStore: ICaseStore & IHypothesisRevisionOwnStateQuery,
    private readonly glossary: IGlossaryQuery,
    private readonly capabilities: ICapabilityQuery,
  ) {}

  public async release(slug: string, version: number): Promise<void> {
    const assembled = await heldAssembledVersion(this.caseStore, slug, version);
    refuseNonDraft(assembled);
    const violations = await releaseViolations(assembled, {
      glossary: this.glossary,
      capabilities: this.capabilities,
      hypothesisRevisions: this.caseStore,
    });
    if (violations.length > 0) {
      throw new CaseVersionNotReleasableError(slug, version, violations);
    }
    await this.caseStore.release(slug, version);
  }
}

async function heldAssembledVersion(
  caseStore: ICaseStore,
  slug: string,
  version: number,
): Promise<AssembledCaseVersion> {
  const assembled = await caseStore.assembleVersion(slug, version);
  if (assembled === undefined) {
    throw new CaseNotFoundError(slug, version);
  }
  return assembled;
}

function refuseNonDraft(assembled: AssembledCaseVersion): void {
  if (assembled.state !== 'draft') {
    throw new CaseVersionNotDraftAtReleaseError(assembled.slug, assembled.version, assembled.state);
  }
}

type StructuralOutcome =
  | { readonly kind: 'parsed'; readonly theCase: Case }
  | { readonly kind: 'invalid'; readonly problems: readonly string[] };

type ReleaseViolationSources = {
  readonly glossary: IGlossaryQuery;
  readonly capabilities: ICapabilityQuery;
  readonly hypothesisRevisions: IHypothesisRevisionOwnStateQuery;
};

async function releaseViolations(
  assembled: AssembledCaseVersion,
  sources: ReleaseViolationSources,
): Promise<readonly string[]> {
  const structural = structuralOutcome(assembled);
  if (structural.kind === 'invalid') {
    return structural.problems;
  }
  return [
    ...(await caseCoherenceViolations(structural.theCase, sources.glossary, sources.capabilities)),
    ...(await manifestOwnStateViolations(assembled, sources.hypothesisRevisions)),
  ];
}

async function manifestOwnStateViolations(
  assembled: AssembledCaseVersion,
  hypothesisRevisions: IHypothesisRevisionOwnStateQuery,
): Promise<string[]> {
  const violations: string[] = [];
  for (const entry of assembled.manifest) {
    const { hypothesis_name: hypothesisName, revision } = entry.hypothesis_revision;
    const ownState = await hypothesisRevisions.readHypothesisRevisionOwnState(
      assembled.slug,
      hypothesisName,
      revision,
    );
    if (ownState !== RELEASED_STATE) {
      violations.push(`the hypothesis "${hypothesisName}" is manifested at a revision that is not released`);
    }
  }
  return violations;
}

function structuralOutcome(assembled: AssembledCaseVersion): StructuralOutcome {
  try {
    const theCase = parseCaseDocument(assembledAsDocument(assembled), assembled.slug);
    return { kind: 'parsed', theCase };
  } catch (error) {
    if (error instanceof InvalidCaseDocumentError) {
      return { kind: 'invalid', problems: error.context.problems };
    }
    throw error;
  }
}

function assembledAsDocument(assembled: AssembledCaseVersion): unknown {
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
