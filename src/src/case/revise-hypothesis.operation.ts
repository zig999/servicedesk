// revise-hypothesis (contracts/knowledge/case-lifecycle, domain/knowledge/hypothesis's
// own revise operation): the one entrance that originates a hypothesis's own
// identity — the first time its name is used for its case — or a new
// numbered revision of an already-named hypothesis, without altering any
// existing revision and without touching any version's manifest
// (domain/knowledge/hypothesis's own description, domain/knowledge/hypothesis-revision's
// own "once any case version in released state manifests it, this content
// never changes again").
//
// Every identity-claim and numbering decision belongs to the store's own
// insertHypothesisRevision primitive (case-store.port.ts) and is never
// re-decided here (rules/knowledge/a-hypothesis-name-is-unique-within-its-case,
// rules/knowledge/a-hypothesis-revision-number-is-never-reused): it creates
// the hypothesis's own identity row only the first time this case ever uses
// its name, and numbers the new revision one past that hypothesis's own
// highest existing revision, or 1 where none exists yet. This operation's
// own job is the three checks the specification places before that call
// rather than inside it: a revision naming no concept is refused
// (rules/knowledge/a-hypothesis-collects-at-least-one-concept), a named
// concept the glossary does not currently hold is refused
// (rules/knowledge/case-terms-exist-in-the-glossary), and a named concept
// that does not accept the declared subject type is refused
// (rules/knowledge/a-concept-accepts-the-declared-subject-type) — all three
// checked, and the store never reached at all, before any of them fails.
//
// rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft states
// that a hypothesis is revised only while its case holds a draft version,
// and that the concept-acceptance check above reads that draft version's own
// declared subject type. reviseHypothesis now reads the case's own current
// draft through ICaseStore.findDraftVersion before doing anything else,
// refusing through CaseHoldsNoDraftError where the case holds none
// (work/revise-hypothesis-draft-gate/task/revise-hypothesis-draft-gate/refuse-without-draft,
// closing this file's own former UNDERDETERMINED note: "the whole 'revised
// only against a draft' gate belongs to a broader check this task does not
// close"). The second half of the rule stays exactly as before: this
// operation still takes the subject type to check against as part of its
// own input rather than reading it back off the draft itself, supplied by
// whichever caller has already anchored it to the case's own current draft
// — the draft the gate above has by then already confirmed exists.
//
// validate-case-coherence.ts's own conceptViolations() checks this same pair
// of rules, but over a whole assembled Case's own collection plan
// (case-resolution.ts's collectionPlan) — reusing it here would mean
// assembling a fake Case just to reach it, which is more coupling than the
// glossary reads below cost, so this operation reads the glossary directly
// through the same published IGlossaryQuery.readConcept() port instead
// (MNT-03's own reading: nothing here duplicates a block of logic that
// already exists, since assembling a whole Case to call a whole-case check
// is a different block, not a copy of this one).

import { CaseHoldsNoDraftError } from '../errors/case-holds-no-draft.error.js';
import { ConceptNotInGlossaryError } from '../errors/concept-not-in-glossary.error.js';
import { ConceptRefusesSubjectTypeError } from '../errors/concept-refuses-subject-type.error.js';
import { HypothesisRevisionCollectsNoConceptError } from '../errors/hypothesis-revision-collects-no-concept.error.js';
import type { ConceptResolution, IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { HypothesisRevisionInput, ICaseStore } from './case-store.port.js';

/**
 * What revise-hypothesis needs beyond the store's own HypothesisRevisionInput:
 * the case version's own declared subject type the new revision's collected
 * concepts are checked against
 * (rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft) —
 * supplied by the caller, which is responsible for anchoring it to the
 * case's own current draft (this file's own header comment).
 */
export type ReviseHypothesisInput = HypothesisRevisionInput & {
  readonly subject: string;
};

/**
 * What revise-hypothesis answers on a successful origination: the identity a
 * curator can place into a draft's manifest next — the hypothesis name it
 * was asked to revise and the revision number the store's own counter
 * assigned. Mirrors create-draft.operation.ts's own CreatedDraft convention,
 * since no node names a shape for this answer either (disclosed as an
 * inference in this task's delivery record, the same way
 * create-draft.operation.ts discloses its own).
 */
export type RevisedHypothesis = {
  readonly hypothesis_name: string;
  readonly revision: number;
};

/**
 * The published revise-hypothesis operation (contracts/knowledge/case-lifecycle,
 * domain/knowledge/hypothesis's own revise): originate a hypothesis's own
 * identity and its first revision, or a new revision of an already-named
 * hypothesis, refused where the revision collects no concept, names a
 * concept the glossary does not hold, or names a concept that does not
 * accept the declared subject type.
 */
export interface IReviseHypothesis {
  reviseHypothesis(input: ReviseHypothesisInput): Promise<RevisedHypothesis>;
}

/**
 * The revise-hypothesis operation's one implementation: validates the three
 * checks the specification places before any write, then delegates the
 * whole identity-claim and numbering decision to the case store's own
 * insertHypothesisRevision primitive, and only shapes its answer.
 */
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

  /**
   * Refuses before anything else where the named case currently holds no
   * version in draft state — never drafted, or its only draft already
   * released or discarded
   * (rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft) —
   * through CaseHoldsNoDraftError, closing this file's own former
   * UNDERDETERMINED note (this task's own delivery record).
   */
  private async refuseWithoutDraft(slug: string): Promise<void> {
    const draftVersion = await this.caseStore.findDraftVersion(slug);
    if (draftVersion === undefined) {
      throw new CaseHoldsNoDraftError(slug);
    }
  }

  /**
   * Refuses, in order, an empty collects list (criterion 3), a named concept
   * the glossary does not currently hold (criterion 4), and a named concept
   * that does not accept the declared subject type (criterion 5) — the store
   * is never reached where any of the three fails.
   */
  private async refuseInvalidCollects(input: ReviseHypothesisInput): Promise<void> {
    refuseEmptyCollects(input);
    const resolutions = await this.resolveConcepts(input.collects);
    refuseUnknownConcepts(input, resolutions);
    refuseConceptsRefusingSubject(input, resolutions);
  }

  /** Every named concept resolved against the glossary's current holding, once each, in the order named. */
  private async resolveConcepts(collects: readonly string[]): Promise<readonly ConceptResolution[]> {
    return Promise.all(collects.map((name) => this.glossary.readConcept(name)));
  }
}

/** Refuses a revision naming no concept at all (rules/knowledge/a-hypothesis-collects-at-least-one-concept). */
function refuseEmptyCollects(input: ReviseHypothesisInput): void {
  if (input.collects.length === 0) {
    throw new HypothesisRevisionCollectsNoConceptError(input.slug, input.hypothesis_name);
  }
}

/** Whether a resolution names a concept the glossary does not hold — narrows to that branch's own `name` field. */
function isUnheld(resolution: ConceptResolution): resolution is Extract<ConceptResolution, { held: false }> {
  return !resolution.held;
}

/** Every resolution the glossary answered as absent. */
function unknownConceptsOf(resolutions: readonly ConceptResolution[]): readonly string[] {
  return resolutions.filter(isUnheld).map((resolution) => resolution.name);
}

/** Refuses every named concept the glossary does not currently hold, named together (rules/knowledge/case-terms-exist-in-the-glossary). */
function refuseUnknownConcepts(input: ReviseHypothesisInput, resolutions: readonly ConceptResolution[]): void {
  const unknown = unknownConceptsOf(resolutions);
  if (unknown.length > 0) {
    throw new ConceptNotInGlossaryError(input.slug, input.hypothesis_name, unknown);
  }
}

/** Whether a resolution names a concept the glossary holds — narrows to that branch's own `concept` field. */
function isHeld(resolution: ConceptResolution): resolution is Extract<ConceptResolution, { held: true }> {
  return resolution.held;
}

/** Every held concept's own name whose accepts does not carry the given subject type. */
function conceptsRefusingSubjectOf(resolutions: readonly ConceptResolution[], subject: string): readonly string[] {
  return resolutions
    .filter(isHeld)
    .map((resolution) => resolution.concept)
    .filter((concept) => !concept.accepts.includes(subject))
    .map((concept) => concept.name);
}

/**
 * Refuses every named concept that does not accept the declared subject
 * type, named together with it
 * (rules/knowledge/a-concept-accepts-the-declared-subject-type). Reached
 * only once refuseUnknownConcepts has already held, so every resolution here
 * is known to carry a concept.
 */
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
