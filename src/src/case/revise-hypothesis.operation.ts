import { CaseHoldsNoDraftError } from '../errors/case-holds-no-draft.error.js';
import { ConceptNotInGlossaryError } from '../errors/concept-not-in-glossary.error.js';
import { ConceptRefusesSubjectTypeError } from '../errors/concept-refuses-subject-type.error.js';
import { HypothesisRevisionCollectsNoConceptError } from '../errors/hypothesis-revision-collects-no-concept.error.js';
import type { ConceptResolution, IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type {
  DraftVersion,
  HypothesisRevisionInput,
  ICaseStore,
  OverwriteHypothesisRevisionInput,
} from './case-store.port.js';
import type { IHypothesisRevisionOverwrite } from './hypothesis-revision-overwrite.port.js';
import type { IHighestRevisionReleaseStateQuery } from './hypothesis-revision-release-state.port.js';

export type ReviseHypothesisInput = HypothesisRevisionInput & {
  readonly subject: string;
};

export type RevisedHypothesis = {
  readonly hypothesis_name: string;
  readonly revision: number;
};

export interface IReviseHypothesis {
  reviseHypothesis(input: ReviseHypothesisInput): Promise<RevisedHypothesis>;
}

export type ReviseHypothesisStore = ICaseStore & IHighestRevisionReleaseStateQuery & IHypothesisRevisionOverwrite;

export class ReviseHypothesisOperation implements IReviseHypothesis {
  public constructor(
    private readonly caseStore: ReviseHypothesisStore,
    private readonly glossary: IGlossaryQuery,
  ) {}

  public async reviseHypothesis(input: ReviseHypothesisInput): Promise<RevisedHypothesis> {
    const draftVersion = await this.requireDraftVersion(input.slug);
    await this.refuseInvalidCollects(input, draftVersion.subject);
    const revision = await this.writeRevision(input);
    return { hypothesis_name: input.hypothesis_name, revision };
  }

  private async writeRevision(input: ReviseHypothesisInput): Promise<number> {
    const highest = await this.caseStore.readHighestRevisionReleaseState(input.slug, input.hypothesis_name);
    if (highest.revision !== undefined && highest.state === 'draft') {
      await this.caseStore.overwriteHypothesisRevision(overwriteInputOf(input, highest.revision));
      return highest.revision;
    }
    return this.caseStore.insertHypothesisRevision(input);
  }

  private async requireDraftVersion(slug: string): Promise<DraftVersion> {
    const draftVersion = await this.caseStore.findDraftVersion(slug);
    if (draftVersion === undefined) {
      throw new CaseHoldsNoDraftError(slug);
    }
    return draftVersion;
  }

  private async refuseInvalidCollects(input: ReviseHypothesisInput, subject: string): Promise<void> {
    refuseEmptyCollects(input);
    const resolutions = await this.resolveConcepts(input.collects);
    refuseUnknownConcepts(input, resolutions);
    refuseConceptsRefusingSubject(input, resolutions, subject);
  }

  private async resolveConcepts(collects: readonly string[]): Promise<readonly ConceptResolution[]> {
    return Promise.all(collects.map((name) => this.glossary.readConcept(name)));
  }
}

function overwriteInputOf(input: ReviseHypothesisInput, revision: number): OverwriteHypothesisRevisionInput {
  return {
    slug: input.slug,
    hypothesis_name: input.hypothesis_name,
    criterion: input.criterion,
    collects: input.collects,
    resolution: input.resolution,
    revision,
  };
}

function refuseEmptyCollects(input: ReviseHypothesisInput): void {
  if (input.collects.length === 0) {
    throw new HypothesisRevisionCollectsNoConceptError(input.slug, input.hypothesis_name);
  }
}

function isUnheld(resolution: ConceptResolution): resolution is Extract<ConceptResolution, { held: false }> {
  return !resolution.held;
}

function unknownConceptsOf(resolutions: readonly ConceptResolution[]): readonly string[] {
  return resolutions.filter(isUnheld).map((resolution) => resolution.name);
}

function refuseUnknownConcepts(input: ReviseHypothesisInput, resolutions: readonly ConceptResolution[]): void {
  const unknown = unknownConceptsOf(resolutions);
  if (unknown.length > 0) {
    throw new ConceptNotInGlossaryError(input.slug, input.hypothesis_name, unknown);
  }
}

function isHeld(resolution: ConceptResolution): resolution is Extract<ConceptResolution, { held: true }> {
  return resolution.held;
}

function conceptsRefusingSubjectOf(resolutions: readonly ConceptResolution[], subject: string): readonly string[] {
  return resolutions
    .filter(isHeld)
    .map((resolution) => resolution.concept)
    .filter((concept) => !concept.accepts.includes(subject))
    .map((concept) => concept.name);
}

function refuseConceptsRefusingSubject(
  input: ReviseHypothesisInput,
  resolutions: readonly ConceptResolution[],
  subject: string,
): void {
  const refusing = conceptsRefusingSubjectOf(resolutions, subject);
  if (refusing.length > 0) {
    throw new ConceptRefusesSubjectTypeError({
      slug: input.slug,
      hypothesis_name: input.hypothesis_name,
      subject,
      concepts: refusing,
    });
  }
}
