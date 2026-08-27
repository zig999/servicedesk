// Stages 1–4 of the investigation pipeline — buildSubject, collectEvidence,
// judgeHypotheses, resolveAndNarrow and draftAssessment — extracted into one
// shared, callable function
// (task/case-simulation-pipeline/extract-shared-investigation-pipeline) so
// diagnose's own composition (run-diagnosis.ts's own runDiagnosis) and,
// later, a simulate composition can each call exactly this rather than
// re-deciding any one stage's own logic a second time. Persistence
// (buildInvestigation, writeWithinDeadline) is deliberately excluded: this
// module writes nothing and knows nothing about writing at all, so
// rules/investigation/a-simulation-writes-no-investigation is not reached by
// it — a future simulate composition calls this same function and simply
// never adds the write step diagnose's own composition adds after it.
//
// Pure orchestration: every stage's own control flow, budgets, pool, retry
// and citation-validation logic stays exactly where it already lived
// (evidence-collection-stage.ts, judgment-stage.ts,
// resolve-and-narrow-input.ts, draft-assessment-text.ts, subject.ts) — this
// module only sequences the five calls in order and assembles their
// combined record. `now` and `deadline` arrive as explicit parameters and
// are never read from the system clock here, the same discipline every
// stage this module composes already keeps
// (constraints/the-deadline-is-an-absolute-propagated-instant).
//
// The answered record carries evidence, evaluations, the resolved outcome,
// the assessment, the accumulated cost and durations, and the pipeline's own
// prompts — exactly the fields
// task/case-simulation-pipeline/extract-shared-investigation-pipeline's own
// first criterion names. cost and durations are computed here (moved
// unchanged from run-diagnosis.ts's own prior body,
// task/investigation-telemetry/diagnose-reports-real-cost-and-durations) from
// every judged evaluation's own usage and elapsed_ms, the one consolidation
// call's own usage/elapsed_ms/prompt, and every concept's own already-measured
// elapsed_ms — never a fresh clock read of this module's own.

import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { ResolvedOutcome } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import type { Assessment } from './assessment.js';
import type { ConsolidationOutcome, IAssessmentConsolidator } from './assessment-consolidator.port.js';
import type { ConsolidationRegister } from './consolidation-register.js';
import type { Cost } from './cost.js';
import { draftAssessment } from './draft-assessment-text.js';
import type { Durations } from './durations.js';
import type { Evaluation } from './evaluation.js';
import { collectEvidence, type CollectEvidenceOptions } from './evidence-collection-stage.js';
import type { Evidence } from './evidence.js';
import type { IHypothesisEvaluator } from './hypothesis-evaluator.port.js';
import { judgeHypotheses, type JudgeHypothesesOptions } from './judgment-stage.js';
import type { IObservationSource, Subject } from './observation-source.port.js';
import { resolveAndNarrow } from './resolve-and-narrow-input.js';
import { buildSubject } from './subject.js';
import type { SubjectAttributeValue } from './subject-attribute-value.js';
import type { Usage } from './usage.js';

/**
 * Judgment's own nominal budget inside the declared total deadline
 * (rules/investigation/an-answer-arrives-within-the-declared-deadline's own
 * five-second slice). judgment-stage.ts owns no such constant itself — its
 * own module comment trusts whoever composes it to intersect the overall
 * deadline with this stage's own share before calling it, the same
 * intersection evidence-collection-stage.ts already performs on its own
 * behalf with COLLECTION_STAGE_BUDGET_MS. Moved here unchanged from
 * run-diagnosis.ts, since judgeHypothesesOptions below is the one place it
 * is used.
 */
const JUDGMENT_STAGE_BUDGET_MS = 5_000;

/**
 * Everything stages 1–4 need to run, whatever composes them afterwards
 * (diagnose's own write-then-respond composition today, a future simulate
 * composition that never writes): the subject's raw, unvalidated type and
 * attribute-value set, the pinned case, the requester (collectEvidence's own
 * required correlation), every port stage 1–4 reads through, the configured
 * judgment pool bound, the register to fall back to where the pinned case
 * leaves consolidation_register undeclared, and the propagated (now,
 * deadline) pair. Deliberately excludes everything only persistence needs
 * (id, ticket_ref, narrative, prompt_version, model, glossary, store) —
 * run-diagnosis.ts's own RunDiagnosisOptions extends this shape with exactly
 * those.
 */
export type InvestigationPipelineOptions = {
  /** The subject's governed type, exactly as this call's own caller assembled it — raw, unvalidated input. */
  readonly subjectType: string;
  /** The subject's whole attribute-value set, exactly as this call's own caller assembled it — raw, unvalidated input. */
  readonly subjectAttributes: readonly SubjectAttributeValue[];
  /** The pinned case, already read and validated by this call's own caller — never fetched or re-resolved here (contracts/investigation/case-source). */
  readonly case: Case;
  readonly requester: string;
  readonly capabilities: ICapabilityQuery;
  readonly observationSource: IObservationSource;
  readonly evaluator: IHypothesisEvaluator;
  /** The configured pool bound judgeHypotheses judges under (constraints/hypotheses-are-judged-in-isolated-parallel-calls' own "the pool bound is configuration") — never a number this module invents. */
  readonly poolSize: number;
  readonly consolidator: IAssessmentConsolidator;
  /**
   * The register to consolidate in where the pinned case leaves
   * consolidation_register undeclared (domain/knowledge/case's own "the
   * consolidation step keeps whatever register its own adapter defaults
   * to"): the published assessment-consolidator port always requires a
   * concrete formal-or-plain value, so this call's own caller supplies the
   * fallback rather than this module deciding one of its own.
   */
  readonly defaultConsolidationRegister: ConsolidationRegister;
  /** The instant this whole run starts, as epoch milliseconds — read once by this call's own caller, never by this module. */
  readonly now: number;
  /** The absolute deadline instant propagated from the whole request, as epoch milliseconds (constraints/the-deadline-is-an-absolute-propagated-instant). */
  readonly deadline: number;
};

/**
 * The pipeline's own prompts, as they were actually materialized for this
 * run. Every judged hypothesis's own judgment prompt already travels inline
 * on its own Evaluation (domain/investigation/evaluation's own optional
 * prompt attribute, present exactly where a judgment call happened) and is
 * not repeated here. writing is the one consolidation call's own
 * materialized prompt — the one piece of this run's own prompt data with
 * nowhere else to live, since Assessment's own shape (outcome, referral,
 * determining_hypothesis, text) does not carry it
 * (draft-assessment-text.spec.ts's own already-delivered guarantee, left
 * untouched by this extraction).
 */
export type InvestigationPipelinePrompts = {
  readonly writing: string;
};

/**
 * Stages 1–4's own complete record
 * (task/case-simulation-pipeline/extract-shared-investigation-pipeline's own
 * first criterion): every stage's own answer, assembled together rather than
 * threaded piecemeal into whatever runs after it.
 */
export type InvestigationPipelineResult = {
  readonly evidence: readonly Evidence[];
  readonly evaluations: readonly Evaluation[];
  /** resolveAndNarrow's own resolved outcome, verbatim — never recomputed. */
  readonly resolved: ResolvedOutcome;
  readonly assessment: Assessment;
  readonly cost: Cost;
  readonly durations: Durations;
  readonly prompts: InvestigationPipelinePrompts;
};

/**
 * Runs buildSubject → collectEvidence → judgeHypotheses → resolveAndNarrow →
 * draftAssessment, in that order, and answers the complete record every one
 * of those stages produced together
 * (task/case-simulation-pipeline/extract-shared-investigation-pipeline):
 * assembles and validates the subject once up front (subject.ts's own
 * buildSubject, the one place a subject's own at-least-one-attribute
 * invariant is enforced, reused here rather than re-decided), collects
 * evidence, judges every required hypothesis, resolves the outcome and
 * drafts the assessment's text. Accumulates domain/investigation/cost from
 * every judged evaluation's own usage and the one consolidation call's own
 * usage, and assembles domain/investigation/durations from the same
 * already-measured, real wall-clock data evidence-collection-stage.ts and
 * judgment-stage.ts each already keep on their own items and the
 * consolidation call's own measured elapsed_ms — never a fresh clock read of
 * this module's own (constraints/the-deadline-is-an-absolute-propagated-instant).
 * Writes nothing and knows nothing about writing: buildInvestigation and any
 * write step are exactly what a caller (diagnose's own composition today)
 * adds after this answers.
 */
export async function runInvestigationPipeline(options: InvestigationPipelineOptions): Promise<InvestigationPipelineResult> {
  const subject = buildSubject(options.subjectType, options.subjectAttributes);
  const evidence = await collectEvidence(collectEvidenceOptions(options, subject));
  const evidenceByHypothesis = evidenceByHypothesisOf(options.case, evidence);
  const evaluations = await judgeHypotheses(judgeHypothesesOptions(options, evidenceByHypothesis));
  const { resolved, narrowedInput } = resolveAndNarrow({ case: options.case, evaluations, evidenceByHypothesis });
  const consolidationCapture: ConsolidationCapture = {};
  const assessment = await draftAssessment({
    resolved,
    narrowedInput,
    consolidationRegister: options.case.consolidation_register ?? options.defaultConsolidationRegister,
    consolidator: capturingConsolidator(options.consolidator, consolidationCapture),
  });
  const consolidation = consolidatedOutcomeOf(consolidationCapture);
  const cost = costOf(evaluations, consolidation.usage);
  const durations = durationsOf(evidence, evaluations, consolidation.elapsed_ms);
  return { evidence, evaluations, resolved, assessment, cost, durations, prompts: { writing: consolidation.prompt } };
}

/** Holds the one ConsolidationOutcome capturingConsolidator below records, once draftAssessment has called consolidate() through it. */
type ConsolidationCapture = { outcome?: ConsolidationOutcome };

/**
 * Wraps the given consolidator so this pipeline can read its one call's own
 * ConsolidationOutcome — usage, elapsed_ms and prompt — for cost, durations
 * and prompts, without ever changing what draftAssessment itself calls or
 * answers: draftAssessment keeps calling consolidate() exactly once,
 * unchanged (this codebase's own must-not-duplicate convention for
 * draftAssessment), and its own answered Assessment still carries no usage,
 * elapsed_ms or prompt property (draft-assessment-text.spec.ts's own
 * delivered guarantee) — this wrapper only ever forwards to the real
 * consolidator and records what it answered, as a side effect invisible to
 * draftAssessment.
 */
function capturingConsolidator(consolidator: IAssessmentConsolidator, capture: ConsolidationCapture): IAssessmentConsolidator {
  return {
    consolidate: async (evaluations, evidence, consolidationRegister) => {
      const outcome = await consolidator.consolidate(evaluations, evidence, consolidationRegister);
      capture.outcome = outcome;
      return outcome;
    },
  };
}

/**
 * The captured consolidation outcome, once draftAssessment has resolved —
 * never absent in practice, since draftAssessment always calls consolidate()
 * exactly once through capturingConsolidator's own wrapper before it can
 * answer at all; thrown rather than silently treated as a zero-cost,
 * zero-duration, empty-prompt call if this invariant is ever violated.
 */
function consolidatedOutcomeOf(capture: ConsolidationCapture): ConsolidationOutcome {
  if (capture.outcome === undefined) {
    throw new Error('draftAssessment resolved without ever calling consolidate()');
  }
  return capture.outcome;
}

/**
 * What this investigation cost at the provider (domain/investigation/cost):
 * one judgment call per required hypothesis actually judged — an Evaluation
 * carrying usage, present exactly where the underlying evaluate() call's own
 * answer was threaded through (judgment-stage.ts's own asEvaluation/callRecordOf),
 * never for a hypothesis that degraded to no-data, deadline-exceeded or
 * judgment-failure without an answer to thread through — plus exactly one
 * consolidation call, which always happens
 * (constraints/hypotheses-are-judged-in-isolated-parallel-calls' own "one
 * provider call per hypothesis appears in the recorded cost"; cost.ts's own
 * "one writing call, linear in hypotheses").
 */
function costOf(evaluations: readonly Evaluation[], consolidationUsage: Usage): Cost {
  const judgmentUsages = evaluations.flatMap((evaluation): Usage[] => (evaluation.usage === undefined ? [] : [evaluation.usage]));
  const usages = [...judgmentUsages, consolidationUsage];
  return {
    calls: judgmentUsages.length + 1,
    input_tokens: usages.reduce((sum, usage) => sum + usage.input_tokens, 0),
    output_tokens: usages.reduce((sum, usage) => sum + usage.output_tokens, 0),
  };
}

/**
 * How long each stage took (domain/investigation/durations), from
 * already-measured, real wall-clock data alone — never a fresh clock read of
 * this module's own: collection and judgment each run their own units
 * (concepts, hypotheses) in parallel, so a stage is not done until its
 * slowest unit is — the largest of every concept's own Evidence.elapsed_ms
 * (evidence-collection-stage.ts) for collection, and the largest of every
 * judged hypothesis's own Evaluation.elapsed_ms (judgment-stage.ts) for
 * judgment. writing is the one consolidation call's own measured elapsed_ms
 * directly, there being exactly one. total is the sum of the three: the
 * whole time from the first delivery through the end of writing.
 */
function durationsOf(evidence: readonly Evidence[], evaluations: readonly Evaluation[], writingElapsedMs: number): Durations {
  const collection = maxElapsedMs(evidence.map((item) => item.elapsed_ms));
  const judgment = maxElapsedMs(evaluations.flatMap((evaluation) => (evaluation.elapsed_ms === undefined ? [] : [evaluation.elapsed_ms])));
  return { collection, judgment, writing: writingElapsedMs, total: collection + judgment + writingElapsedMs };
}

/** The largest of the given elapsed_ms readings, or 0 where there are none — a stage with nothing to time took no time. */
function maxElapsedMs(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.max(...values);
}

/** collectEvidence's own options, assembled from this call's given options and the subject already built above. */
function collectEvidenceOptions(options: InvestigationPipelineOptions, subject: Subject): CollectEvidenceOptions {
  return {
    case: options.case,
    subject,
    requester: options.requester,
    capabilities: options.capabilities,
    observationSource: options.observationSource,
    now: options.now,
    deadline: options.deadline,
  };
}

/**
 * judgeHypotheses's own options: the same (now, deadline) pair given to this
 * whole run, its own deadline tightened to no more than
 * JUDGMENT_STAGE_BUDGET_MS beyond now — evidence-collection-stage.ts's own
 * COLLECTION_STAGE_BUDGET_MS intersection, mirrored here since
 * judgment-stage.ts performs no such intersection on its own behalf.
 */
function judgeHypothesesOptions(
  options: InvestigationPipelineOptions,
  evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>,
): JudgeHypothesesOptions {
  return {
    case: options.case,
    evidenceByHypothesis,
    evaluator: options.evaluator,
    capabilities: options.capabilities,
    poolSize: options.poolSize,
    now: options.now,
    deadline: Math.min(options.deadline, options.now + JUDGMENT_STAGE_BUDGET_MS),
  };
}

/**
 * Every required hypothesis's own collected evidence, matched by concept to
 * that hypothesis's own collects — judgment-stage.ts's and
 * resolve-and-narrow-input.ts's own shared evidenceByHypothesis convention,
 * built here since neither stage reaches the other's output on its own and
 * this module is the one place that holds both the case and collectEvidence's
 * own flat, by-concept result.
 */
function evidenceByHypothesisOf(theCase: Case, evidence: readonly Evidence[]): ReadonlyMap<string, readonly Evidence[]> {
  const byHypothesis = new Map<string, readonly Evidence[]>();
  for (const hypothesis of theCase.hypotheses) {
    byHypothesis.set(hypothesis.name, evidence.filter((item) => hypothesis.collects.includes(item.concept)));
  }
  return byHypothesis;
}
