// The one factory that can build a valid Investigation, and the one place
// that refuses an invalid one (task/investigation-lifecycle/investigation-factory,
// task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject):
// given every completed stage's own output, assembles the subject from the
// raw entry-point input and checks the given evidence and evaluations
// against the pinned case's own collection plan and required hypotheses
// (case-resolution.ts's own collectionPlan/requiresEvaluationOf,
// rules/investigation/one-evidence-per-collected-concept,
// rules/investigation/one-evaluation-per-required-hypothesis), throwing a
// typed error before constructing anything — the same factory-plus-validator
// separation case/parse-case-document.ts already establishes for its own
// context. Every attribute beyond the four replay pins
// (rules/investigation/replay-is-pinned) is copied straight from the given
// options; this module computes nothing about the world, resolves no
// hypothesis and drafts no text — that is explicitly upstream of it (this
// task's own objective).
//
// Assembling the subject means calling subject.ts's own buildSubject, which
// is the one place rules/investigation/a-subject-carries-at-least-one-attribute
// is enforced — reused here rather than re-decided, per that module's own
// module comment. Whether every named attribute is one the glossary actually
// holds (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary)
// is checked here, through the consumed glossary-source port
// (contracts/investigation/glossary-source) the caller supplies — the one
// reason this module is no longer pure and synchronous: infrastructure still
// reaches it only through that port, never a concrete client
// (constraints/the-domain-depends-on-no-infrastructure), and it imports
// nothing else beyond the case aggregate's own types, its resolution
// behavior, this context's own sibling plain-data types and the typed
// errors.

import { collectionPlan, requiresEvaluationOf } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import { InvestigationNotBuildableError } from '../errors/investigation-not-buildable.error.js';
import { SubjectAttributeNotInGlossaryError } from '../errors/subject-attribute-not-in-glossary.error.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { Assessment } from './assessment.js';
import type { Cost } from './cost.js';
import type { Durations } from './durations.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Investigation, PinnedCase } from './investigation.js';
import { buildSubject, type Subject } from './subject.js';
import type { SubjectAttributeValue } from './subject-attribute-value.js';

export type BuildInvestigationOptions = {
  readonly id: string;
  readonly requester: string;
  readonly ticket_ref: string;
  readonly narrative: string;
  /**
   * The subject's governed type, exactly as the entry point assembled it —
   * raw, unvalidated input, not an already-built Subject. This call is what
   * turns it into one, refusing before it does
   * (task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject).
   */
  readonly subjectType: string;
  /**
   * The subject's whole attribute-value set, exactly as the entry point
   * assembled it — raw, unvalidated input, the other half of the subject
   * this call assembles and validates.
   */
  readonly subjectAttributes: readonly SubjectAttributeValue[];
  /**
   * The pinned case, whole — the source of both the collection plan and
   * the required hypotheses this call checks totality against, and of the
   * built value's own pinned_case (slug, version, hash). Never held onto
   * beyond this call: only these three identifying attributes travel into
   * the built Investigation.
   */
  readonly case: Case;
  readonly prompt_version: string;
  readonly model: string;
  readonly evidence: readonly Evidence[];
  readonly evaluations: readonly Evaluation[];
  readonly assessment: Assessment;
  readonly cost: Cost;
  readonly durations: Durations;
  /**
   * The consumed glossary-source port (contracts/investigation/glossary-source),
   * read once to check that every attribute the subject names is one the
   * glossary holds (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary).
   * Bundled into this same options object rather than a second positional
   * parameter, the same convention CollectEvidenceOptions and
   * JudgeHypothesesOptions already keep for a stage's own port collaborators.
   */
  readonly glossary: IGlossaryQuery;
};

/**
 * Builds the whole Investigation from every completed stage's own output
 * (task/investigation-lifecycle/investigation-factory): assembles the
 * subject from the given raw type and attribute-value set, refusing where it
 * carries no attribute-value at all
 * (rules/investigation/a-subject-carries-at-least-one-attribute, enforced by
 * subject.ts's own buildSubject) or where it names an attribute the glossary
 * does not hold (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary,
 * checked through the given glossary-source port); then refuses, throwing
 * the one typed error naming every totality violation together, where the
 * given evidence does not cover the case's collection plan exactly once per
 * concept or the given evaluations do not cover its required hypotheses
 * exactly once each (rules/investigation/one-evidence-per-collected-concept,
 * rules/investigation/one-evaluation-per-required-hypothesis); otherwise
 * assembles the whole value, carrying the built subject unchanged, pinning
 * the case by slug, version and hash alongside the model, the prompt version
 * and the evidence (rules/investigation/replay-is-pinned), and copying every
 * other attribute from the given options unchanged.
 */
export async function buildInvestigation(options: BuildInvestigationOptions): Promise<Investigation> {
  const { case: theCase, evidence, evaluations, subjectType, subjectAttributes, glossary } = options;
  const subject = buildSubject(subjectType, subjectAttributes);
  await refuseAttributesNotInGlossary(subject, glossary);
  refuseTotalityViolations(theCase, evidence, evaluations);
  return {
    id: options.id,
    requester: options.requester,
    ticket_ref: options.ticket_ref,
    narrative: options.narrative,
    subject,
    pinned_case: pinnedCaseOf(theCase),
    prompt_version: options.prompt_version,
    model: options.model,
    evidence: [...evidence],
    evaluations: [...evaluations],
    assessment: options.assessment,
    cost: options.cost,
    durations: options.durations,
  };
}

/**
 * Refuses a subject naming an attribute the glossary's own subject-attribute
 * vocabulary does not hold (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary),
 * checking every distinct attribute name, once each, through the given
 * glossary-source port — the same distinct-name-then-check shape
 * validate-case-coherence.ts's own vocabularyViolations already keeps for a
 * case's own named terms — and throwing once with every offending name
 * together, the same refuse-once-with-every-violation-named convention
 * refuseTotalityViolations below already keeps, rather than on the first one
 * found.
 */
async function refuseAttributesNotInGlossary(subject: Subject, glossary: IGlossaryQuery): Promise<void> {
  const missing: string[] = [];
  for (const name of new Set(subject.attributes.map((pair) => pair.attribute))) {
    const resolution = await glossary.readVocabularyTerm('subject-attribute', name);
    if (!resolution.held) {
      missing.push(name);
    }
  }
  if (missing.length > 0) {
    throw new SubjectAttributeNotInGlossaryError(subject.type, missing);
  }
}

/** The pinned-case relationship materialized from the given case's own three identifying attributes, never the whole case (domain/investigation/investigation, src/case/case.ts). */
function pinnedCaseOf(theCase: Case): PinnedCase {
  return { slug: theCase.slug, version: theCase.version, hash: theCase.hash };
}

/**
 * Refuses a build whose evidence or evaluations violate either totality
 * rule, once, with every violation named
 * (rules/investigation/one-evidence-per-collected-concept,
 * rules/investigation/one-evaluation-per-required-hypothesis) — the checks
 * below are the whole of what this assertion claims, and this is the only
 * place either is called before anything is constructed.
 */
function refuseTotalityViolations(
  theCase: Case,
  evidence: readonly Evidence[],
  evaluations: readonly Evaluation[],
): void {
  const violations = [
    ...evidenceTotalityViolations(theCase, evidence),
    ...evaluationTotalityViolations(theCase, evaluations),
  ];
  if (violations.length > 0) {
    throw new InvestigationNotBuildableError(theCase.slug, violations);
  }
}

/**
 * How the given evidence departs from exactly one entry per concept in the
 * case's collection plan (rules/investigation/one-evidence-per-collected-concept):
 * a plan concept with no matching evidence, a plan concept with more than
 * one (the rule's own "exactly one" still fails where there are two), and
 * an evidence entry naming a concept the plan does not hold at all.
 */
function evidenceTotalityViolations(theCase: Case, evidence: readonly Evidence[]): string[] {
  const plan = collectionPlan(theCase);
  const counts = countsByKey(evidence.map((item) => item.concept));
  const violations: string[] = [];
  for (const concept of plan) {
    const count = counts.get(concept) ?? 0;
    if (count === 0) {
      violations.push(`the collection plan's concept "${concept}" has no matching evidence`);
    } else if (count > 1) {
      violations.push(`the collection plan's concept "${concept}" has ${count} evidence entries; exactly one is required`);
    }
  }
  const planConcepts = new Set(plan);
  for (const concept of counts.keys()) {
    if (!planConcepts.has(concept)) {
      violations.push(`evidence names the concept "${concept}", which the collection plan does not hold`);
    }
  }
  return violations;
}

/**
 * How the given evaluations depart from exactly one entry per hypothesis
 * the case requires (rules/investigation/one-evaluation-per-required-hypothesis):
 * a required hypothesis with no matching evaluation, one with more than
 * one, and an evaluation naming a hypothesis the case does not require at
 * all.
 */
function evaluationTotalityViolations(theCase: Case, evaluations: readonly Evaluation[]): string[] {
  const required = requiresEvaluationOf(theCase);
  const counts = countsByKey(evaluations.map((item) => item.hypothesis));
  const violations: string[] = [];
  for (const name of required) {
    const count = counts.get(name) ?? 0;
    if (count === 0) {
      violations.push(`the required hypothesis "${name}" has no matching evaluation`);
    } else if (count > 1) {
      violations.push(`the required hypothesis "${name}" has ${count} evaluations; exactly one is required`);
    }
  }
  const requiredNames = new Set(required);
  for (const name of counts.keys()) {
    if (!requiredNames.has(name)) {
      violations.push(`an evaluation names the hypothesis "${name}", which the case does not require`);
    }
  }
  return violations;
}

/** How many times each key occurs in a list, keyed by the key itself — shared by both totality checks above. */
function countsByKey(keys: readonly string[]): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const key of keys) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
