import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import type { ResolvedOutcome } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { Assessment } from './assessment.js';
import type { IAssessmentConsolidator } from './assessment-consolidator.port.js';
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

export const JUDGMENT_STAGE_BUDGET_MS = 5_000;

export type InvestigationPipelineOptions = {

  readonly subjectType: string;

  readonly subjectAttributes: readonly SubjectAttributeValue[];

  readonly case: Case;
  readonly requester: string;
  readonly capabilities: ICapabilityQuery;

  readonly glossary: IGlossaryQuery;
  readonly observationSource: IObservationSource;
  readonly evaluator: IHypothesisEvaluator;

  readonly poolSize: number;
  readonly consolidator: IAssessmentConsolidator;

  readonly defaultConsolidationRegister: ConsolidationRegister;

  readonly now: number;

  readonly deadline: number;
};

export type InvestigationPipelinePrompts = {
  readonly writing: string;
};

export type InvestigationPipelineResult = {
  readonly evidence: readonly Evidence[];
  readonly evaluations: readonly Evaluation[];

  readonly resolved: ResolvedOutcome;
  readonly assessment: Assessment;
  readonly cost: Cost;
  readonly durations: Durations;
  readonly prompts: InvestigationPipelinePrompts;
};

export async function runInvestigationPipeline(options: InvestigationPipelineOptions): Promise<InvestigationPipelineResult> {
  const subject = buildSubject(options.subjectType, options.subjectAttributes);
  const evidence = await collectEvidence(collectEvidenceOptions(options, subject));
  const evidenceByHypothesis = evidenceByHypothesisOf(options.case, evidence);
  const evaluations = await judgeHypotheses(judgeHypothesesOptions(options, evidenceByHypothesis));
  const { resolved, narrowedInput } = resolveAndNarrow({ case: options.case, evaluations, evidenceByHypothesis });
  const assessment = await draftAssessment({
    resolved,
    narrowedInput,
    consolidationRegister: options.case.consolidation_register ?? options.defaultConsolidationRegister,
    consolidator: options.consolidator,
  });
  const cost = costOf(evaluations, assessment.usage);
  const durations = durationsOf(evidence, evaluations, assessment.elapsed_ms);
  return { evidence, evaluations, resolved, assessment, cost, durations, prompts: { writing: assessment.prompt } };
}

function costOf(evaluations: readonly Evaluation[], consolidationUsage: Usage): Cost {
  const judgmentUsages = evaluations.flatMap((evaluation): Usage[] => (evaluation.usage === undefined ? [] : [evaluation.usage]));
  const usages = [...judgmentUsages, consolidationUsage];
  return {
    calls: judgmentUsages.length + 1,
    input_tokens: usages.reduce((sum, usage) => sum + usage.input_tokens, 0),
    output_tokens: usages.reduce((sum, usage) => sum + usage.output_tokens, 0),
  };
}

function durationsOf(evidence: readonly Evidence[], evaluations: readonly Evaluation[], writingElapsedMs: number): Durations {
  const collection = maxElapsedMs(evidence.map((item) => item.elapsed_ms));
  const judgment = maxElapsedMs(evaluations.flatMap((evaluation) => (evaluation.elapsed_ms === undefined ? [] : [evaluation.elapsed_ms])));
  return { collection, judgment, writing: writingElapsedMs, total: collection + judgment + writingElapsedMs };
}

export function maxElapsedMs(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.max(...values);
}

export function readClockMs(): number {
  return Date.now();
}

function collectEvidenceOptions(options: InvestigationPipelineOptions, subject: Subject): CollectEvidenceOptions {
  return {
    case: options.case,
    subject,
    requester: options.requester,
    capabilities: options.capabilities,
    glossary: options.glossary,
    observationSource: options.observationSource,
    now: options.now,
    deadline: options.deadline,
  };
}

function judgeHypothesesOptions(
  options: InvestigationPipelineOptions,
  evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>,
): JudgeHypothesesOptions {
  return {
    case: options.case,
    evidenceByHypothesis,
    evaluator: options.evaluator,
    poolSize: options.poolSize,
    now: options.now,
    deadline: Math.min(options.deadline, options.now + JUDGMENT_STAGE_BUDGET_MS),
  };
}

function evidenceByHypothesisOf(theCase: Case, evidence: readonly Evidence[]): ReadonlyMap<string, readonly Evidence[]> {
  const byHypothesis = new Map<string, readonly Evidence[]>();
  for (const hypothesis of theCase.hypotheses) {
    byHypothesis.set(hypothesis.name, evidence.filter((item) => hypothesis.collects.includes(item.concept)));
  }
  return byHypothesis;
}
