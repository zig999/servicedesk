// The text-production step (task/assessment-drafting/draft-assessment-text):
// assembles the whole Assessment (domain/investigation/assessment) from the
// resolved outcome and the narrowed input a prior step already produced
// (task/assessment-consolidation/resolve-and-narrow-input) — copying outcome
// and referral through unchanged and setting determining_hypothesis present
// exactly where resolved.determining is defined
// (rules/investigation/the-outcome-comes-from-the-case), and drafting text,
// the one field this step decides, deterministically from narrowedInput
// alone (rules/investigation/the-writing-input-is-narrowed).
//
// DISCLOSED DIVERGENCE, disposable scaffolding — not this task's own
// delivery: resolve-and-narrow-input's confirmed/fallback split
// (task/assessment-consolidation/resolve-and-narrow-input-unconditional-breadth)
// removed ConfirmedNarrowedInput/FallbackNarrowedInput/FallbackEvaluationSummary
// and narrowedInput.basis, which this module's draftText() branched on; left
// alone this file would not compile against the new unconditional
// NarrowedInput. draftText() below is patched, mechanically, to read
// narrowedInput.evaluations and narrowedInput.evidence together in one
// unconditional body instead of branching — nothing here decides a domain
// fact, the exact wording remains this module's own free choice, never a
// domain fact this module states (this task's own rationale) — so the tree
// keeps compiling. This module's real rework belongs to
// task/assessment-consolidation/draft-assessment-text-consumes-consolidator,
// which replaces this whole template-based approach with a call to the
// assessment-consolidator port and will rewrite this file's logic again from
// a clean context; nothing about this patch's specific wording or shape
// should be read as a decision that task is bound by.
//
// No domain-model node names a dedicated writing port for this step, unlike
// hypothesis-evaluator's own port and fake, so this module owns a small
// template-based generator directly rather than inventing an ungoverned
// port. Pure and synchronous, importing nothing but the case-resolution
// module's own ResolvedOutcome and this context's own sibling plain-data
// types (constraints/the-domain-depends-on-no-infrastructure).

import type { ResolvedOutcome } from '../case/case-resolution.js';
import type { Assessment } from './assessment.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { NarrowedInput } from './resolve-and-narrow-input.js';

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
 * followed by one unconditional body built from narrowedInput's own
 * evaluations and evidence together, whether or not a hypothesis confirmed
 * (rules/investigation/the-writing-input-is-narrowed's current
 * unconditional-breadth shape) — noting resolved.determining, already given
 * and never recomputed here, only to say whether one did. Deterministic and
 * template-based; the exact wording is this module's own free choice, not a
 * domain fact, and — per this file's own disclosed divergence above — this
 * particular body shape is disposable scaffolding rather than a decision the
 * consolidator rework is bound by.
 */
function draftText(resolved: ResolvedOutcome, narrowedInput: NarrowedInput): string {
  const opening = `The investigation concluded ${resolved.outcome}, referred to ${resolved.referral.recipient} for ${resolved.referral.action}.`;
  const determination = resolved.determining === undefined ? 'No hypothesis confirmed.' : `Hypothesis ${resolved.determining} confirmed.`;
  const body = `${determination} Every required hypothesis's own verdict: ${summarizeEvaluations(narrowedInput.evaluations)}. Evidence: ${summarizeEvidence(narrowedInput.evidence)}.`;
  return `${opening} ${body}`;
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
function summarizeEvaluations(evaluations: readonly Evaluation[]): string {
  if (evaluations.length === 0) {
    return NO_EVALUATIONS_LABEL;
  }
  return evaluations.map(summarizeOneEvaluation).join(SUMMARY_SEPARATOR);
}

/** One evaluation's own contribution: its hypothesis and verdict always, its reason only where the verdict is inconclusive — citations omitted from this summary line, the same convention this module kept before this patch. */
function summarizeOneEvaluation(evaluation: Evaluation): string {
  return evaluation.verdict === 'inconclusive'
    ? `${evaluation.hypothesis}: ${evaluation.verdict} (${evaluation.reason})`
    : `${evaluation.hypothesis}: ${evaluation.verdict}`;
}
