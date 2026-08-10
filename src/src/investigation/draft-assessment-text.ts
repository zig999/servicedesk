// The text-production step (task/assessment-drafting/draft-assessment-text):
// assembles the whole Assessment (domain/investigation/assessment) from the
// resolved outcome and the narrowed writing input a prior step already
// produced (task/assessment-drafting/resolve-and-narrow-input) — copying
// outcome and referral through unchanged and setting determining_hypothesis
// present exactly where resolved.determining is defined
// (rules/investigation/the-outcome-comes-from-the-case), and drafting text,
// the one field this step decides, deterministically from narrowedInput
// alone (rules/investigation/the-writing-input-is-narrowed). No
// domain-model node names a dedicated writing port for this step, unlike
// hypothesis-evaluator's own port and fake, so this module owns a small
// template-based generator directly rather than inventing an ungoverned
// port; the exact wording is an open implementation choice, never a domain
// fact this module states (this task's own rationale). Pure and
// synchronous, importing nothing but the case-resolution module's own
// ResolvedOutcome and this context's own sibling plain-data types
// (constraints/the-domain-depends-on-no-infrastructure).

import type { ResolvedOutcome } from '../case/case-resolution.js';
import type { Assessment } from './assessment.js';
import type { Evidence } from './evidence.js';
import type {
  ConfirmedNarrowedInput,
  FallbackEvaluationSummary,
  FallbackNarrowedInput,
  NarrowedInput,
} from './resolve-and-narrow-input.js';

/** What a summary reads where the narrowed input carried no evidence at all — narrowedInput's own shape admits this, an empty array is not itself invalid. */
const NO_EVIDENCE_LABEL = 'no evidence';

/** What a summary reads where the narrowed input carried no evaluations at all. */
const NO_EVALUATIONS_LABEL = 'no evaluations';

/** Joins one summary's own per-item lines into the one sentence fragment draftText embeds. */
const SUMMARY_SEPARATOR = '; ';

/**
 * Drafts the whole Assessment from resolved and narrowedInput alone
 * (task/assessment-drafting/draft-assessment-text): outcome and referral
 * are exactly resolved's own values, copied unchanged and never recomputed
 * here; determining_hypothesis is present exactly where resolved.determining
 * is defined and absent otherwise
 * (rules/investigation/the-outcome-comes-from-the-case); text is drafted by
 * draftText from narrowedInput and resolved's own outcome/referral alone,
 * never from the case's own hypotheses or criteria, which narrowedInput
 * structurally cannot carry (rules/investigation/the-writing-input-is-narrowed).
 */
export function draftAssessment(resolved: ResolvedOutcome, narrowedInput: NarrowedInput): Assessment {
  const base = { outcome: resolved.outcome, referral: resolved.referral, text: draftText(resolved, narrowedInput) };
  return resolved.determining === undefined ? base : { ...base, determining_hypothesis: resolved.determining };
}

/**
 * The text itself: a sentence naming the resolved outcome and referral,
 * followed by narrowedInput's own basis — the determining hypothesis's own
 * evidence where one confirmed, or every evaluation's verdict and reason
 * where none did. Deterministic and template-based; the exact wording is
 * this module's own free choice, not a domain fact.
 */
function draftText(resolved: ResolvedOutcome, narrowedInput: NarrowedInput): string {
  const opening = `The investigation concluded ${resolved.outcome}, referred to ${resolved.referral.recipient} for ${resolved.referral.action}.`;
  const body = narrowedInput.basis === 'confirmed' ? confirmedBody(narrowedInput) : fallbackBody(narrowedInput);
  return `${opening} ${body}`;
}

/** The confirmed-path body: the determining hypothesis's own evidence, and nothing narrowedInput did not carry. */
function confirmedBody(confirmed: ConfirmedNarrowedInput): string {
  return `A hypothesis confirmed it, grounded in: ${summarizeEvidence(confirmed.evidence)}.`;
}

/** The fallback-path body: every evaluation's own verdict and reason, and nothing narrowedInput did not carry. */
function fallbackBody(fallback: FallbackNarrowedInput): string {
  return `No hypothesis confirmed; every hypothesis's own verdict: ${summarizeEvaluations(fallback.evaluations)}.`;
}

/** One line per evidence item, joined deterministically; the empty list reads as NO_EVIDENCE_LABEL rather than an empty fragment. */
function summarizeEvidence(evidence: readonly Evidence[]): string {
  if (evidence.length === 0) {
    return NO_EVIDENCE_LABEL;
  }
  return evidence.map(summarizeOneEvidenceItem).join(SUMMARY_SEPARATOR);
}

/** One evidence item's own contribution: its concept and result always, its observation only where non-empty. */
function summarizeOneEvidenceItem(item: Evidence): string {
  return item.observation === '' ? `${item.concept}: ${item.result}` : `${item.concept}: ${item.result} (${item.observation})`;
}

/** One line per evaluation, joined deterministically; the empty list reads as NO_EVALUATIONS_LABEL rather than an empty fragment. */
function summarizeEvaluations(evaluations: readonly FallbackEvaluationSummary[]): string {
  if (evaluations.length === 0) {
    return NO_EVALUATIONS_LABEL;
  }
  return evaluations.map(summarizeOneEvaluation).join(SUMMARY_SEPARATOR);
}

/** One evaluation's own contribution: its hypothesis and verdict always, its reason only where the verdict declared one. */
function summarizeOneEvaluation(evaluation: FallbackEvaluationSummary): string {
  return evaluation.reason === undefined
    ? `${evaluation.hypothesis}: ${evaluation.verdict}`
    : `${evaluation.hypothesis}: ${evaluation.verdict} (${evaluation.reason})`;
}
