import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { manifestEntryNamed } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { Evaluation } from './evaluation.js';
import { collectEvidence } from './evidence-collection-stage.js';
import type { Evidence } from './evidence.js';
import type { IHypothesisEvaluator } from './hypothesis-evaluator.port.js';
import { JUDGMENT_STAGE_BUDGET_MS, maxElapsedMs, readClockMs } from './investigation-pipeline.js';
import { judgeHypotheses } from './judgment-stage.js';
import type { IObservationSource } from './observation-source.port.js';
import { buildSubject } from './subject.js';
import type { SubjectAttributeValue } from './subject-attribute-value.js';

export type SimulateHypothesisPipelineOptions = {
  readonly subjectType: string;
  readonly subjectAttributes: readonly SubjectAttributeValue[];
  readonly case: Case;
  readonly requester: string;

  readonly hypothesis: string;
  readonly capabilities: ICapabilityQuery;

  readonly glossary: IGlossaryQuery;
  readonly observationSource: IObservationSource;
  readonly evaluator: IHypothesisEvaluator;
  readonly poolSize: number;
  readonly now: number;
  readonly deadline: number;
};

export type SimulateHypothesisDurations = {
  readonly collection: number;
  readonly judgment: number;
  readonly total: number;
};

export type SimulateHypothesisPipelineResult = {
  readonly evidence: readonly Evidence[];
  readonly evaluation: Evaluation;
  readonly durations: SimulateHypothesisDurations;
};

export async function runSimulateHypothesisPipeline(
  options: SimulateHypothesisPipelineOptions,
): Promise<SimulateHypothesisPipelineResult> {
  const pipelineStartedAtMs = readClockMs();
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
  const judgmentBeginsAtMs = options.now + (readClockMs() - pipelineStartedAtMs);
  const evaluations = await judgeHypotheses({
    case: narrowedCase,
    evidenceByHypothesis: new Map([[options.hypothesis, evidence]]),
    evaluator: options.evaluator,
    poolSize: options.poolSize,
    now: judgmentBeginsAtMs,
    deadline: Math.min(options.deadline, judgmentBeginsAtMs + JUDGMENT_STAGE_BUDGET_MS),
  });
  const evaluation = onlyEvaluationOf(evaluations);
  const totalElapsedMs = readClockMs() - pipelineStartedAtMs;
  return { evidence, evaluation, durations: durationsOf(evidence, evaluation, totalElapsedMs) };
}

function onlyEvaluationOf(evaluations: readonly Evaluation[]): Evaluation {
  const [evaluation] = evaluations;
  if (evaluation === undefined || evaluations.length !== 1) {
    throw new Error(`expected exactly one evaluation for one named hypothesis, got ${evaluations.length}`);
  }
  return evaluation;
}

function durationsOf(evidence: readonly Evidence[], evaluation: Evaluation, totalElapsedMs: number): SimulateHypothesisDurations {
  const collection = maxElapsedMs(evidence.map((item) => item.elapsed_ms));
  const judgment = maxElapsedMs(evaluation.elapsed_ms === undefined ? [] : [evaluation.elapsed_ms]);
  return { collection, judgment, total: totalElapsedMs };
}
