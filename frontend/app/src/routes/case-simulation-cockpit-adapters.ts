import type { CaseVersionManifestEntry } from "../services/case-version-record";
import type { SimulateCaseResult, SimulateEvaluation, SimulateEvidenceItem } from "../hooks/use-simulate-case";
import type {
  Evaluation as HypothesisEvaluation,
  Evidence as HypothesisEvidenceItem,
} from "../hooks/use-simulate-hypothesis";
import type { NewCaseResultRun } from "../hooks/use-case-simulation-history";
import type {
  SimulationHypothesisEvaluation,
  SimulationManifestRow,
  SimulationRunSummary,
  SimulationDurations,
} from "./case-simulation-hypotheses-table-row";
import type {
  SimulationEvaluation as DetailEvaluation,
  SimulationEvidenceItem as DetailEvidenceItem,
  SimulationHypothesisRevisionSummary as DetailHypothesisRevisionSummary,
  SimulationJudgmentCall as DetailJudgmentCall,
} from "./case-simulation-detail-types";

export type CockpitEvaluationSource = "case" | "hypothesis";

export type CockpitEvaluation = {
  readonly hypothesis: string;
  readonly verdict: "confirmed" | "refuted" | "inconclusive";
  readonly citations: readonly { readonly concept: string; readonly field: string }[];
  readonly reason?: "no-data" | "judgment-failure" | "deadline-exceeded";
  readonly usage?: { readonly input_tokens: number; readonly output_tokens: number };
  readonly elapsed_ms?: number;
  readonly prompt?: string;

  readonly source: CockpitEvaluationSource;

  readonly raw: unknown;

  readonly evidence?: readonly DetailEvidenceItem[];

  readonly stale?: boolean;
};

export function fromCaseEvaluation(evaluation: SimulateEvaluation): CockpitEvaluation {
  return {
    hypothesis: evaluation.hypothesis,
    verdict: evaluation.verdict,
    citations: evaluation.citations,
    reason: evaluation.verdict === "inconclusive" ? evaluation.reason : undefined,
    usage: evaluation.usage,
    elapsed_ms: evaluation.elapsed_ms,
    prompt: evaluation.prompt,
    source: "case",
    raw: evaluation,
    stale: false,
  };
}

export function fromHypothesisEvaluation(
  evaluation: HypothesisEvaluation,
  evidence: readonly HypothesisEvidenceItem[],
): CockpitEvaluation {
  return {
    hypothesis: evaluation.hypothesis,
    verdict: evaluation.verdict,
    citations: evaluation.verdict === "inconclusive" ? [] : evaluation.citations,
    reason: evaluation.verdict === "inconclusive" ? evaluation.reason : undefined,
    usage: evaluation.usage,
    elapsed_ms: evaluation.elapsed_ms,
    prompt: evaluation.prompt,
    source: "hypothesis",
    raw: evaluation,
    evidence: toDetailEvidence(evidence),
    stale: false,
  };
}

export function toRowEvaluation(evaluation: CockpitEvaluation): SimulationHypothesisEvaluation {
  return {
    hypothesis: evaluation.hypothesis,
    verdict: evaluation.verdict,
    reason: evaluation.reason,
    usage: evaluation.usage,
    stale: evaluation.stale,
  };
}

export function toManifestRows(
  manifest: readonly CaseVersionManifestEntry[] | undefined,
  evaluations: Readonly<Record<string, CockpitEvaluation>>,
): readonly SimulationManifestRow[] {
  if (!manifest) {
    return [];
  }
  return manifest.map((entry) => {
    const hypothesisName = entry.hypothesis_revision.hypothesis.name;
    const evaluation = evaluations[hypothesisName];
    return {
      position: entry.position,
      hypothesisName,
      revision: entry.hypothesis_revision.revision,
      collects: entry.hypothesis_revision.collects,
      evaluation: evaluation ? toRowEvaluation(evaluation) : undefined,
    };
  });
}

export function toRunSummary(result: SimulateCaseResult): SimulationRunSummary {
  return {
    outcome: result.assessment.outcome,
    referral: result.assessment.referral,
    determiningHypothesis: result.assessment.determining_hypothesis,
  };
}

export function toDurations(result: SimulateCaseResult): SimulationDurations {
  return {
    collectionMs: result.durations.collection,
    judgmentMs: result.durations.judgment,
    writingMs: result.durations.writing,
    totalMs: result.durations.total,
  };
}

export function toNewCaseResultRun(result: SimulateCaseResult): NewCaseResultRun {
  return {
    outcome: result.assessment.outcome,
    referral: result.assessment.referral,
    determiningHypothesis: result.assessment.determining_hypothesis,
    text: result.assessment.text,
    register: result.assessment.register,
    hypotheses: result.evaluations.map((evaluation) => ({
      hypothesis: evaluation.hypothesis,
      verdict: evaluation.verdict,
    })),
  };
}

export function toDetailJudgmentCall(evaluation: CockpitEvaluation): DetailJudgmentCall {
  if (
    evaluation.usage === undefined ||
    evaluation.elapsed_ms === undefined ||
    evaluation.prompt === undefined
  ) {
    return { called: false };
  }
  return {
    called: true,
    usage: {
      inputTokens: evaluation.usage.input_tokens,
      outputTokens: evaluation.usage.output_tokens,
    },
    elapsedMs: evaluation.elapsed_ms,
    prompt: evaluation.prompt,
  };
}

export function toDetailEvaluation(evaluation: CockpitEvaluation): DetailEvaluation {
  return {
    hypothesis: evaluation.hypothesis,
    verdict: evaluation.verdict,
    citations: evaluation.citations,
    judgmentCall: toDetailJudgmentCall(evaluation),
    stale: evaluation.stale,
  };
}

export function toDetailEvidence(
  evidence: readonly SimulateEvidenceItem[],
): readonly DetailEvidenceItem[] {
  return evidence.map((item) => ({
    concept: item.concept,
    result: item.result,
    resultDetail: item.result_detail,
    elapsedMs: item.elapsed_ms,
    observation: item.observation,
    capabilityName: item.capability_name,
    capabilityVersion: item.capability_version,
    connector: item.origin,

    fields: item.fields,
    conceptDescription: item.concept_description,
  }));
}

export function toHypothesisRevisionSummary(
  manifest: readonly CaseVersionManifestEntry[] | undefined,
  hypothesisName: string,
): DetailHypothesisRevisionSummary | undefined {
  const entry = manifest?.find(
    (candidate) => candidate.hypothesis_revision.hypothesis.name === hypothesisName,
  );
  if (!entry) {
    return undefined;
  }
  return {
    criterion: entry.hypothesis_revision.criterion,
    collects: entry.hypothesis_revision.collects,
  };
}
