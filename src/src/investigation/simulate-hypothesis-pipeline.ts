// simulate-hypothesis's own narrower composition of the shared engine
// (task/case-simulation-pipeline/simulate-hypothesis-operation,
// contracts/investigation/case-simulation): buildSubject, then collectEvidence
// restricted to exactly one named hypothesis's own revision, then
// judgeHypotheses restricted to exactly that one hypothesis — never
// resolveAndNarrow, never draftAssessment, and never
// investigation-pipeline.ts's own runInvestigationPipeline, which is scoped
// to the full five-stage record (resolved, assessment, cost, prompts) this
// operation's own response does not carry
// (scenarios/investigation/a-single-hypothesis-is-simulated's own "no outcome
// and no assessment are resolved").
//
// The narrowing itself is achieved by handing collectEvidence and
// judgeHypotheses a case whose own manifest holds exactly the one named
// hypothesis's own manifest entry, rather than by inventing a
// concept-filtering or hypothesis-filtering parameter neither stage's own
// options type declares: collectEvidence's own collectionPlan(theCase)
// (case-resolution.ts) reads theCase.manifest, so a manifest of one entry
// answers exactly that entry's own hypothesis-revision's own collects, and
// judgeHypotheses's own requiresEvaluationOf(theCase) reads the identical
// field, so it judges exactly that one hypothesis. Neither stage's own body
// changes at all (MNT-03) — only which Case this call hands them.
// case-resolution.ts's own manifestEntryNamed is the one place that lookup
// (and its own refusal,
// rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused)
// is decided, reused here rather than re-implemented.

import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { manifestEntryNamed } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { Evaluation } from './evaluation.js';
import { collectEvidence } from './evidence-collection-stage.js';
import type { Evidence } from './evidence.js';
import type { IHypothesisEvaluator } from './hypothesis-evaluator.port.js';
import { JUDGMENT_STAGE_BUDGET_MS, maxElapsedMs } from './investigation-pipeline.js';
import { judgeHypotheses } from './judgment-stage.js';
import type { IObservationSource } from './observation-source.port.js';
import { buildSubject } from './subject.js';
import type { SubjectAttributeValue } from './subject-attribute-value.js';

/**
 * Everything this narrower run needs: the same subject/case/requester/port
 * shape investigation-pipeline.ts's own InvestigationPipelineOptions
 * declares — including the published glossary-query read collectEvidence
 * itself now resolves each concept's own description through
 * (task/evidence-semantics-snapshot/evidence-collection-snapshots-concept-and-field-semantics),
 * which this narrower run needs for the identical reason — plus the one
 * hypothesis name this call narrows to, and minus every field only
 * consolidation needs (consolidator, defaultConsolidationRegister) — this
 * operation never consolidates (contracts/investigation/case-simulation).
 */
export type SimulateHypothesisPipelineOptions = {
  readonly subjectType: string;
  readonly subjectAttributes: readonly SubjectAttributeValue[];
  readonly case: Case;
  readonly requester: string;
  /** The one hypothesis name this run narrows to (domain/knowledge/hypothesis-revision, domain/knowledge/manifest-entry). */
  readonly hypothesis: string;
  readonly capabilities: ICapabilityQuery;
  /** The published glossary-query read collectEvidence resolves each concept's own description through, once per concept, at the moment of collection (domain/investigation/evidence). */
  readonly glossary: IGlossaryQuery;
  readonly observationSource: IObservationSource;
  readonly evaluator: IHypothesisEvaluator;
  readonly poolSize: number;
  readonly now: number;
  readonly deadline: number;
};

/**
 * How long collection and judgment took, in milliseconds
 * (domain/investigation/durations): writing carries no slot at all here,
 * since this operation never reaches consolidation and the node's own
 * writing attribute is now optional, present exactly when a consolidation
 * call happened (this task's own settled Notes entry).
 */
export type SimulateHypothesisDurations = {
  readonly collection: number;
  readonly judgment: number;
  readonly total: number;
};

/** This run's own whole record: the one named hypothesis's own evidence, its one evaluation, and how long each stage took. */
export type SimulateHypothesisPipelineResult = {
  readonly evidence: readonly Evidence[];
  readonly evaluation: Evaluation;
  readonly durations: SimulateHypothesisDurations;
};

/**
 * Runs buildSubject → collectEvidence → judgeHypotheses over exactly one
 * named hypothesis, in that order
 * (task/case-simulation-pipeline/simulate-hypothesis-operation,
 * scenarios/investigation/a-single-hypothesis-is-simulated): refuses first,
 * through manifestEntryNamed, where the named hypothesis is not in the
 * pinned case version's manifest at all
 * (rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused)
 * — before either stage ever runs, so no observation and no judgment call is
 * ever made for a name the manifest does not hold. Writes nothing, resolves
 * no outcome and drafts no assessment
 * (rules/investigation/a-simulation-writes-no-investigation).
 */
export async function runSimulateHypothesisPipeline(
  options: SimulateHypothesisPipelineOptions,
): Promise<SimulateHypothesisPipelineResult> {
  const subject = buildSubject(options.subjectType, options.subjectAttributes);
  const entry = manifestEntryNamed(options.case, options.hypothesis);
  const narrowedCase: Case = { ...options.case, manifest: [entry] };
  const evidence = await collectEvidence({
    case: narrowedCase,
    subject,
    requester: options.requester,
    capabilities: options.capabilities,
    glossary: options.glossary,
    observationSource: options.observationSource,
    now: options.now,
    deadline: options.deadline,
  });
  const evaluations = await judgeHypotheses({
    case: narrowedCase,
    evidenceByHypothesis: new Map([[options.hypothesis, evidence]]),
    evaluator: options.evaluator,
    capabilities: options.capabilities,
    poolSize: options.poolSize,
    now: options.now,
    deadline: Math.min(options.deadline, options.now + JUDGMENT_STAGE_BUDGET_MS),
  });
  const evaluation = onlyEvaluationOf(evaluations);
  return { evidence, evaluation, durations: durationsOf(evidence, evaluation) };
}

/**
 * The one Evaluation judgeHypotheses answers for this call — never absent or
 * plural in practice, since narrowedCase's own manifest holds exactly one
 * entry, so requiresEvaluationOf(narrowedCase) names exactly one hypothesis
 * (case-resolution.ts); thrown rather than silently read as the first of
 * several if this invariant is ever violated, the same defensive convention
 * investigation-pipeline.ts's own consolidatedOutcomeOf already keeps for its
 * own single-call invariant.
 */
function onlyEvaluationOf(evaluations: readonly Evaluation[]): Evaluation {
  const [evaluation] = evaluations;
  if (evaluation === undefined || evaluations.length !== 1) {
    throw new Error(`expected exactly one evaluation for one named hypothesis, got ${evaluations.length}`);
  }
  return evaluation;
}

/**
 * How long collection and judgment took (domain/investigation/durations),
 * from the same already-measured, real wall-clock data
 * investigation-pipeline.ts's own durationsOf reads — the largest of every
 * concept's own Evidence.elapsed_ms for collection, and this one evaluation's
 * own elapsed_ms for judgment, 0 where it never reached a call (a no-data
 * degradation never calls the evaluator at all). total is their sum; no
 * writing field, since this operation never consolidates.
 */
function durationsOf(evidence: readonly Evidence[], evaluation: Evaluation): SimulateHypothesisDurations {
  const collection = maxElapsedMs(evidence.map((item) => item.elapsed_ms));
  const judgment = maxElapsedMs(evaluation.elapsed_ms === undefined ? [] : [evaluation.elapsed_ms]);
  return { collection, judgment, total: collection + judgment };
}
