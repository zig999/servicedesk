// The one factory that can build a valid Investigation, and the one place
// that refuses an invalid one (task/investigation-lifecycle/investigation-factory):
// given every completed stage's own output, checks the given evidence and
// evaluations against the pinned case's own collection plan and required
// hypotheses (case-resolution.ts's own collectionPlan/requiresEvaluationOf,
// rules/investigation/one-evidence-per-collected-concept,
// rules/investigation/one-evaluation-per-required-hypothesis), throwing the
// one typed InvestigationNotBuildableError, naming every violation
// together, before constructing anything — the same factory-plus-validator
// separation case/parse-case-document.ts already establishes for its own
// context. Every attribute beyond the four replay pins
// (rules/investigation/replay-is-pinned) is copied straight from the given
// options; this module computes nothing about the world, resolves no
// hypothesis and drafts no text — that is explicitly upstream of it (this
// task's own objective). Pure and synchronous, importing nothing but the
// case aggregate's own types, its resolution behavior, this context's own
// sibling plain-data types and the typed error
// (constraints/the-domain-depends-on-no-infrastructure).

import { collectionPlan, requiresEvaluationOf } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import { InvestigationNotBuildableError } from '../errors/investigation-not-buildable.error.js';
import type { Assessment } from './assessment.js';
import type { Cost } from './cost.js';
import type { Durations } from './durations.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Investigation, PinnedCase } from './investigation.js';
import type { Subject } from './subject.js';

export type BuildInvestigationOptions = {
  readonly id: string;
  readonly requester: string;
  readonly ticket_ref: string;
  readonly narrative: string;
  readonly subject: Subject;
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
};

/**
 * Builds the whole Investigation from every completed stage's own output
 * (task/investigation-lifecycle/investigation-factory): refuses first,
 * throwing the one typed error naming every totality violation together,
 * where the given evidence does not cover the case's collection plan
 * exactly once per concept or the given evaluations do not cover its
 * required hypotheses exactly once each
 * (rules/investigation/one-evidence-per-collected-concept,
 * rules/investigation/one-evaluation-per-required-hypothesis); otherwise
 * assembles the whole value, pinning the case by slug, version and hash
 * alongside the model, the prompt version and the evidence
 * (rules/investigation/replay-is-pinned), and copying every other
 * attribute from the given options unchanged.
 */
export function buildInvestigation(options: BuildInvestigationOptions): Investigation {
  const { case: theCase, evidence, evaluations } = options;
  refuseTotalityViolations(theCase, evidence, evaluations);
  return {
    id: options.id,
    requester: options.requester,
    ticket_ref: options.ticket_ref,
    narrative: options.narrative,
    subject: options.subject,
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
