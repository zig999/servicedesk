import { CaseHoldsNoDraftError } from '../errors/case-holds-no-draft.error.js';
import { ConceptNotInGlossaryError } from '../errors/concept-not-in-glossary.error.js';
import { ConceptRefusesSubjectTypeError } from '../errors/concept-refuses-subject-type.error.js';
import { HypothesisRevisionCollectsNoConceptError } from '../errors/hypothesis-revision-collects-no-concept.error.js';
import type { ConceptResolution, IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { HypothesisRevisionInput, ICaseStore } from './case-store.port.js';

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

export class ReviseHypothesisOperation implements IReviseHypothesis {
  public constructor(
    private readonly caseStore: ICaseStore,
    private readonly glossary: IGlossaryQuery,
  ) {}

  public async reviseHypothesis(input: ReviseHypothesisInput): Promise<RevisedHypothesis> {
    await this.refuseWithoutDraft(input.slug);
    await this.refuseInvalidCollects(input);
    const revision = await this.caseStore.insertHypothesisRevision(input);
    return { hypothesis_name: input.hypothesis_name, revision };
  }

  private async refuseWithoutDraft(slug: string): Promise<void> {
    const draftVersion = await this.caseStore.findDraftVersion(slug);
    if (draftVersion === undefined) {
      throw new CaseHoldsNoDraftError(slug);
    }
  }

  private async refuseInvalidCollects(input: ReviseHypothesisInput): Promise<void> {
    refuseEmptyCollects(input);
    const resolutions = await this.resolveConcepts(input.collects);
    refuseUnknownConcepts(input, resolutions);
    refuseConceptsRefusingSubject(input, resolutions);
  }

  private async resolveConcepts(collects: readonly string[]): Promise<readonly ConceptResolution[]> {
    return Promise.all(collects.map((name) => this.glossary.readConcept(name)));
  }
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

function refuseConceptsRefusingSubject(input: ReviseHypothesisInput, resolutions: readonly ConceptResolution[]): void {
  const refusing = conceptsRefusingSubjectOf(resolutions, input.subject);
  if (refusing.length > 0) {
    throw new ConceptRefusesSubjectTypeError({
      slug: input.slug,
      hypothesis_name: input.hypothesis_name,
      subject: input.subject,
      concepts: refusing,
    });
  }
}
