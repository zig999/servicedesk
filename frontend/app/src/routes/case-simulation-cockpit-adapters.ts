/**
 * Pure, dependency-free adapters composing the case-simulation cockpit's own
 * region-shaped props (case-simulation-hypotheses-table-row.ts,
 * case-simulation-detail-types.ts, case-simulation-case-result-types.ts'
 * NewCaseResultRun) out of the two dispatch hooks' own typed responses
 * (use-simulate-case.ts's SimulateCaseResult, use-simulate-hypothesis.ts's
 * Evaluation) -- extracted out of use-case-simulation-cockpit.ts per
 * MNT-01/ARC-03, the same split every sibling region task in this epic
 * already establishes for its own pure types/helpers (case-simulation-
 * hypotheses-table-row.ts, case-simulation-case-result-types.ts).
 *
 * `CockpitEvaluation` is this module's own canonical, source-independent
 * shape for "one hypothesis's latest evaluation" -- task/simulation-cockpit/
 * screen-assembly's own criterion 4 needs one evaluation per hypothesis
 * regardless of whether a full-case run or a single-hypothesis run produced
 * it, and the two dispatch hooks' own response types (SimulateEvaluation,
 * Evaluation) are structurally close but not identical (the hypothesis-level
 * union's own inconclusive branch carries no `citations` field at all, unlike
 * the case-level union's). `fromCaseEvaluation`/`fromHypothesisEvaluation`
 * normalize both into one shape before this cockpit ever stores one in its
 * own per-hypothesis map, so every downstream adapter below reads one shape,
 * not two.
 */

import type { CaseVersionManifestEntry } from "../services/case-version-record";
import type { SimulateCaseResult, SimulateEvaluation, SimulateEvidenceItem } from "../hooks/use-simulate-case";
import type { Evaluation as HypothesisEvaluation } from "../hooks/use-simulate-hypothesis";
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

/** This cockpit's own canonical per-hypothesis evaluation shape (this file's own header comment). */
export type CockpitEvaluation = {
  readonly hypothesis: string;
  readonly verdict: "confirmed" | "refuted" | "inconclusive";
  readonly citations: readonly { readonly concept: string; readonly field: string }[];
  readonly reason?: "no-data" | "judgment-failure" | "deadline-exceeded";
  readonly usage?: { readonly input_tokens: number; readonly output_tokens: number };
  readonly elapsed_ms?: number;
  readonly prompt?: string;
  /** Which kind of dispatch produced this evaluation -- selects whether the Detail region can show evidence for it (only a full-case run's own response carries any). */
  readonly source: CockpitEvaluationSource;
  /** The exact wire object this evaluation was read from, unmodified -- the Detail region's own JSON tab renders this verbatim for the selected hypothesis. */
  readonly raw: unknown;
  /**
   * rules/investigation/a-simulation-result-is-stale-once-its-source-changes,
   * symmetric to the Case Result region's own `CaseResultRun.stale`
   * (use-case-simulation-history.ts) -- never part of either dispatch hook's
   * own wire response (there is no such fact to normalize out of it), always
   * `false` when this evaluation is freshly produced, and flipped to `true`
   * in place by use-case-simulation-cockpit.ts's own return-from-editing
   * effect, the same way `markLastRunStale()` flips a run's own flag rather
   * than appending a new entry. Optional rather than required: several
   * already-existing spec/fixture files across this cockpit's own test
   * suites construct a literal of this shape that predates this field
   * entirely and was never stale to begin with; every site that reads this
   * field (`row.evaluation?.stale`, `evaluation.stale &&`) already treats an
   * absent value the same as an explicit `false`, so optional states the
   * same fact those fixtures would state by omission without editing them
   * (this task never edits a `.spec.ts`/`.test-support.ts` file).
   */
  readonly stale?: boolean;
};

/** Normalizes one evaluation out of a completed full-case run (use-simulate-case.ts's own SimulateEvaluation). */
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

/** Normalizes the one evaluation out of a completed single-hypothesis run (use-simulate-hypothesis.ts's own Evaluation). */
export function fromHypothesisEvaluation(evaluation: HypothesisEvaluation): CockpitEvaluation {
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
    stale: false,
  };
}

/** Narrows a CockpitEvaluation to what one Hypotheses-table row reads (case-simulation-hypotheses-table-row.ts's own SimulationHypothesisEvaluation). */
export function toRowEvaluation(evaluation: CockpitEvaluation): SimulationHypothesisEvaluation {
  return {
    hypothesis: evaluation.hypothesis,
    verdict: evaluation.verdict,
    reason: evaluation.reason,
    usage: evaluation.usage,
    stale: evaluation.stale,
  };
}

/**
 * Builds one row per manifest entry, in the version's own manifest order
 * (case-simulation-hypotheses-table.tsx's own component re-sorts by
 * `position` regardless), attaching whichever evaluation this cockpit's own
 * per-hypothesis map currently holds for that hypothesis's name -- absent
 * when this session has not produced one yet (criterion 1 of task/
 * simulation-cockpit/hypotheses-table: every manifested hypothesis renders
 * whether or not it has run).
 */
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
      collects: entry.hypothesis_revision.collects,
      evaluation: evaluation ? toRowEvaluation(evaluation) : undefined,
    };
  });
}

/** The Hypotheses region's own determining/outcome/referral summary line, from the last completed full-case run. */
export function toRunSummary(result: SimulateCaseResult): SimulationRunSummary {
  return {
    outcome: result.assessment.outcome,
    referral: result.assessment.referral,
    determiningHypothesis: result.assessment.determining_hypothesis,
  };
}

/** The Hypotheses region's own last-run stage-durations line, from the last completed full-case run. */
export function toDurations(result: SimulateCaseResult): SimulationDurations {
  return {
    collectionMs: result.durations.collection,
    judgmentMs: result.durations.judgment,
    writingMs: result.durations.writing,
    totalMs: result.durations.total,
  };
}

/**
 * The Case result region's own new-run shape (use-case-simulation-history.ts's
 * own NewCaseResultRun) -- criterion 5 of this task: only a completed
 * full-case run is ever shaped into one of these; a single-hypothesis run's
 * own SimulateHypothesisResult resolves no outcome or assessment at all
 * (scenarios/investigation/a-single-hypothesis-is-simulated) and this
 * function is never called with one.
 */
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

/**
 * The Detail region's own SimulationJudgmentCall (case-simulation-detail-
 * types.ts) ties `model`/`promptVersion` to the same atomic "called" fact as
 * `usage`/`elapsedMs`/`prompt` -- domain/investigation/investigation's own two
 * required attributes, carried once per simulation run. Neither
 * use-simulate-case.ts nor use-simulate-hypothesis.ts (this epic's own
 * already-delivered dispatch hooks, neither of which implements that node)
 * ever returns a model or a prompt_version anywhere in its typed response, so
 * this composition has no honest value to supply for either field --
 * fabricating one would state a domain fact (which model answered, which
 * prompt version ran) nothing this delivery's data holds. This adapter
 * therefore always answers `{ called: false }`, even where usage/elapsed_ms/
 * prompt exist on the evaluation and the verdict itself implies a call
 * happened (any reason other than no-data). Disclosed as a deferred
 * limitation in this task's own delivery record, not fabricated here.
 */
export function toDetailJudgmentCall(): DetailJudgmentCall {
  return { called: false };
}

/** Narrows a CockpitEvaluation to what the Detail region reads (case-simulation-detail-types.ts's own SimulationEvaluation). */
export function toDetailEvaluation(evaluation: CockpitEvaluation): DetailEvaluation {
  return {
    hypothesis: evaluation.hypothesis,
    verdict: evaluation.verdict,
    citations: evaluation.citations,
    judgmentCall: toDetailJudgmentCall(),
    stale: evaluation.stale,
  };
}

/**
 * The Detail region's own evidence shape (case-simulation-detail-types.ts's
 * own SimulationEvidenceItem) -- only a full-case run's own response ever
 * carries evidence (use-simulate-hypothesis.ts's own SimulateHypothesisResult
 * carries none at all), so this is only ever called with a full-case run's
 * own `evidence` array.
 *
 * Reads `capability_name`/`capability_version` as the two flat fields
 * use-simulate-case.ts's own SimulateEvidenceItem actually declares them as
 * (flatten-detail-evidence-capability-reference, a corrective increment):
 * this function previously dereferenced a nested `item.capability.name`/
 * `item.capability.version` that no simulate response has ever sent,
 * throwing at render time on a real response's own evidence item.
 */
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
  }));
}

/** The Detail region's own hypothesis-revision summary (criterion, collects) for the named hypothesis, read from the version's own manifest. */
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
