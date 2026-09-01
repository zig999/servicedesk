import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSimulationSubject,
  type SimulationSubjectSource,
  type SimulationSubjectState,
} from "./use-simulation-subject";
import { useSimulateCase, type SimulateCaseResult } from "./use-simulate-case";
import { useSimulateHypothesis, type SimulateHypothesisResult } from "./use-simulate-hypothesis";
import { useCaseSimulationHistory } from "./use-case-simulation-history";
import type { CaseVersionRecord } from "../services/case-version-record";
import type { CaseResultRun } from "../routes/case-simulation-case-result-types";
import type {
  SimulationManifestRow,
  SimulationRunSummary,
  SimulationDurations,
} from "../routes/case-simulation-hypotheses-table-row";
import type { CaseSimulationDetailPanelProps } from "../routes/case-simulation-detail-types";
import {
  fromCaseEvaluation,
  fromHypothesisEvaluation,
  toDetailEvaluation,
  toDetailEvidence,
  toDurations,
  toHypothesisRevisionSummary,
  toManifestRows,
  toNewCaseResultRun,
  toRunSummary,
  type CockpitEvaluation,
} from "../routes/case-simulation-cockpit-adapters";

const visitedSimulationRoutes = new Set<string>();

export type CaseSimulationCockpitState = {
  readonly subject: SimulationSubjectState;
  readonly canSimulateCase: boolean;
  readonly onSimulateCase: () => void;
  readonly dispatchError: string | null;
  readonly hypothesesRows: readonly SimulationManifestRow[];
  readonly hypothesesSummary?: SimulationRunSummary;
  readonly lastRunDurations?: SimulationDurations;
  readonly disableSimulateHypothesis: boolean;
  readonly onSimulateHypothesis: (hypothesisName: string) => void;
  readonly onSelectHypothesis: (hypothesisName: string) => void;
  readonly detail?: CaseSimulationDetailPanelProps;
  readonly caseResultRuns: readonly CaseResultRun[];
};

export function useCaseSimulationCockpit(
  slug: string,
  version: number,
  record: CaseVersionRecord,
): CaseSimulationCockpitState {
  const queryClient = useQueryClient();

  const subjectSource: SimulationSubjectSource = {
    subject: record.subject,
  };
  const subjectState = useSimulationSubject(subjectSource, slug, version);
  const caseSim = useSimulateCase();
  const hypSim = useSimulateHypothesis(slug, version);
  const history = useCaseSimulationHistory();

  const [evaluations, setEvaluations] = useState<Readonly<Record<string, CockpitEvaluation>>>({});
  const [lastCaseResult, setLastCaseResult] = useState<SimulateCaseResult | null>(null);
  const [selectedHypothesisName, setSelectedHypothesisName] = useState<string | null>(null);

  const previousCaseResultRef = useRef<SimulateCaseResult | null>(null);
  const previousHypothesisResultRef = useRef<SimulateHypothesisResult | null>(null);

  useEffect(() => {
    const result = caseSim.result;
    if (result && result !== previousCaseResultRef.current) {
      previousCaseResultRef.current = result;
      setEvaluations((current) => ({
        ...current,
        ...Object.fromEntries(
          result.evaluations.map((evaluation) => [
            evaluation.hypothesis,
            fromCaseEvaluation(evaluation),
          ]),
        ),
      }));
      setLastCaseResult(result);
      history.recordRun(toNewCaseResultRun(result));
    }
  }, [caseSim.result]);

  useEffect(() => {
    const result = hypSim.result;
    if (result && result !== previousHypothesisResultRef.current) {
      previousHypothesisResultRef.current = result;
      setEvaluations((current) => ({
        ...current,
        [result.evaluation.hypothesis]: fromHypothesisEvaluation(
          result.evaluation,
          result.evidence,
        ),
      }));
    }
  }, [hypSim.result]);

  useEffect(() => {
    const visitedKey = `${slug}:${version}`;
    const isReturn = visitedSimulationRoutes.has(visitedKey);
    visitedSimulationRoutes.add(visitedKey);
    if (isReturn) {
      void queryClient.invalidateQueries({ queryKey: ["case-version", slug, version] });
      history.markLastRunStale();

      setEvaluations((current) =>
        Object.fromEntries(
          Object.entries(current).map(([hypothesisName, evaluation]) => [
            hypothesisName,
            { ...evaluation, stale: true },
          ]),
        ),
      );
    }
    // Intentionally empty: this effect is meant to run once per mount only
    // (this file's own header comment on criterion 6's return detection).
  }, []);

  const anySimulating = caseSim.isSimulating || hypSim.isSimulating;
  const canSimulateNow = subjectState.isReady && !anySimulating;

  function onSimulateCase(): void {
    if (!canSimulateNow) {
      return;
    }
    caseSim.onSimulate({
      case: { slug, version },
      subject: subjectState.subject,
      requester: subjectState.requester,
    });
  }

  function onSimulateHypothesis(hypothesisName: string): void {
    if (!canSimulateNow) {
      return;
    }

    hypSim.onSimulate(hypothesisName, subjectState.subject, subjectState.requester);
  }

  function onSelectHypothesis(hypothesisName: string): void {
    setSelectedHypothesisName(hypothesisName);
  }

  const hypothesesRows = toManifestRows(record.manifest, evaluations);
  const hypothesesSummary = lastCaseResult ? toRunSummary(lastCaseResult) : undefined;
  const lastRunDurations = lastCaseResult ? toDurations(lastCaseResult) : undefined;

  const selectedEvaluation = selectedHypothesisName
    ? evaluations[selectedHypothesisName]
    : undefined;
  const hypothesisRevision = selectedHypothesisName
    ? toHypothesisRevisionSummary(record.manifest, selectedHypothesisName)
    : undefined;

  const detail: CaseSimulationDetailPanelProps | undefined =
    selectedEvaluation && hypothesisRevision
      ? {
          hypothesisRevision,
          evaluation: toDetailEvaluation(selectedEvaluation),
          evidence:
            selectedEvaluation.source === "case" && lastCaseResult
              ? toDetailEvidence(lastCaseResult.evidence)
              : (selectedEvaluation.evidence ?? []),
          rawResponse: selectedEvaluation.raw,
        }
      : undefined;

  return {
    subject: subjectState,
    canSimulateCase: canSimulateNow,
    onSimulateCase,
    dispatchError: caseSim.simulateError ?? hypSim.simulationError,
    hypothesesRows,
    hypothesesSummary,
    lastRunDurations,
    disableSimulateHypothesis: !canSimulateNow,
    onSimulateHypothesis,
    onSelectHypothesis,
    detail,
    caseResultRuns: history.runs,
  };
}
