// The text-production step
// (task/assessment-consolidation/draft-assessment-text-consumes-consolidator):
// assembles the whole Assessment (domain/investigation/assessment) from the
// resolved outcome and the narrowed input a prior step already produced
// (task/assessment-consolidation/resolve-and-narrow-input-unconditional-breadth)
// — copying outcome and referral through unchanged and setting
// determining_hypothesis present exactly where resolved.determining is
// defined and absent otherwise
// (rules/investigation/the-outcome-comes-from-the-case) — none of the three
// affected in any way by the call below. text is the one field this step
// still decides, and it decides nothing itself: it is exactly what the
// assessment-consolidator port answers for narrowedInput's own evaluations
// and evidence, together with the given consolidation register
// (domain/investigation/assessment-consolidator,
// domain/knowledge/consolidation-register), the same unconditional breadth
// in every outcome that narrowedInput itself already carries
// (rules/investigation/the-writing-input-is-narrowed).
//
// This module calls only the published IAssessmentConsolidator interface,
// never an LLM or provider client directly — which concrete adapter answers
// consolidate() is this call's caller's own choice, made when it composes
// this function, not something this module decides
// (constraints/consolidation-runs-behind-a-port).
//
// consolidationRegister reaches this function as an explicit field of its
// options, read from the pinned case's own consolidation_register
// (domain/knowledge/case-version) by whoever calls draftAssessment — never by
// this module importing the case document module itself. This file therefore
// still imports nothing at all from the case module, preserving the
// zero-import guarantee draft-assessment-text-modules.spec.ts already
// asserts for it.
//
// Imports nothing but this context's own sibling plain-data types and the
// one port interface consolidation runs behind — no framework, driver,
// provider client or standard-library module
// (constraints/the-domain-depends-on-no-infrastructure).

import type { ResolvedOutcome } from '../case/case-resolution.js';
import type { Assessment } from './assessment.js';
import type { IAssessmentConsolidator } from './assessment-consolidator.port.js';
import type { ConsolidationRegister } from './consolidation-register.js';
import type { NarrowedInput } from './resolve-and-narrow-input.js';

/**
 * draftAssessment's own inputs, bundled as one object rather than four
 * positional parameters (this codebase's own three-positional-parameter
 * discipline, already kept by resolveAndNarrow's own
 * ResolveAndNarrowOptions and judgeHypotheses's own JudgeHypothesesOptions):
 * everything resolveAndNarrow already answered, plus the two inputs the
 * consolidator call itself needs.
 */
export type DraftAssessmentOptions = {
  /** Criterion 1's own source, unchanged: resolveAndNarrow's own ResolvedOutcome, read here and never recomputed. */
  readonly resolved: ResolvedOutcome;
  /** The narrowed input consolidation may see, the same shape in any outcome (rules/investigation/the-writing-input-is-narrowed). */
  readonly narrowedInput: NarrowedInput;
  /** The pinned case's own consolidation register, forwarded here by the caller — never read from a Case import in this module. */
  readonly consolidationRegister: ConsolidationRegister;
  /** The published assessment-consolidator port this call answers text through; which adapter implements it is this call's caller's own choice. */
  readonly consolidator: IAssessmentConsolidator;
};

/**
 * Drafts the whole Assessment from options.resolved and options.narrowedInput
 * alone, plus the two inputs the consolidator call itself needs
 * (task/assessment-consolidation/draft-assessment-text-consumes-consolidator):
 * outcome and referral are exactly resolved's own values, copied unchanged
 * and never recomputed here; determining_hypothesis is present exactly
 * where resolved.determining is defined and absent otherwise
 * (rules/investigation/the-outcome-comes-from-the-case); text is exactly
 * what consolidator.consolidate() answers for narrowedInput's own
 * evaluations and evidence together with consolidationRegister, never
 * assembled by this module itself
 * (domain/investigation/assessment-consolidator). The Assessment answered
 * carries only outcome, referral, determining_hypothesis and text — no
 * verdict and no evidence, so nothing beyond the text is exposed alongside
 * it (domain/investigation/assessment).
 */
export async function draftAssessment(options: DraftAssessmentOptions): Promise<Assessment> {
  const { resolved, narrowedInput, consolidationRegister, consolidator } = options;
  // consolidator.consolidate() now answers a ConsolidationOutcome rather
  // than the text alone (task/investigation-telemetry/widen-judgment-and-consolidation-ports),
  // so this call unwraps its own `text` field, unchanged from what
  // consolidate() always answered here — its usage/elapsed_ms/prompt are
  // task/investigation-telemetry/diagnose-reports-real-cost-and-durations's
  // own declared scope to carry into Assessment, not this task's.
  const { text } = await consolidator.consolidate(narrowedInput.evaluations, narrowedInput.evidence, consolidationRegister);
  const base = { outcome: resolved.outcome, referral: resolved.referral, text };
  return resolved.determining === undefined ? base : { ...base, determining_hypothesis: resolved.determining };
}
