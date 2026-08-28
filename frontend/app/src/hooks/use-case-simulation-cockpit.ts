/**
 * task/simulation-cockpit/screen-assembly: composes the six pieces this task
 * depends on that are not themselves route markup -- use-simulation-subject,
 * use-simulate-case, use-simulate-hypothesis, use-case-simulation-history,
 * and the pure adapters in ../routes/case-simulation-cockpit-adapters.ts --
 * into the cockpit's own cross-region state: one shared subject, one
 * dispatch-at-a-time gate, the latest per-hypothesis evaluation whichever run
 * produced it, the Case result region's own run history, and the
 * return-from-editing staleness marker. Kept out of
 * case-simulation-ready-view.tsx's own JSX per ARC-02/ARC-03 -- a route's own
 * ready-view composes feature components and reads state; it does not itself
 * hold this cross-region business logic.
 *
 * ---- Criterion 3: one subject, shared ----
 * useSimulationSubject is called exactly once, here, and its returned
 * `subject`/`requester` feed both onSimulate calls below unchanged -- neither
 * dispatch hook is given a copy or a re-derived value, so there is no second,
 * independent subject anywhere in this cockpit.
 *
 * ---- Criteria 1-2: gating ----
 * `canSimulateNow` is `subjectState.isReady && !anySimulating`, where
 * `anySimulating` is true while *either* dispatch hook reports its own
 * pending state. Both `canSimulateCase` (the header action) and
 * `disableSimulateHypothesis` (every row's own action, case-simulation-
 * hypotheses-table.tsx) are derived from this one value, never two
 * independently computed gates that could disagree -- satisfying "only one
 * dispatch may be in flight at a time" by construction.
 *
 * ---- Criterion 4: Detail follows the latest evaluation, whichever run produced it ----
 * `evaluations` is a plain per-hypothesis map, written by *both* dispatch
 * hooks' own completion effects below: a full-case run's own `evaluations`
 * array overwrites every hypothesis it names; a single-hypothesis run
 * overwrites only the one it named. Selecting a row (`onSelectHypothesis`)
 * always reads whatever this map currently holds for that hypothesis,
 * regardless of which kind of run produced it.
 *
 * ---- Criterion 5: only a full-case run populates Case result ----
 * `history.recordRun` is called from the case-level completion effect only;
 * the hypothesis-level completion effect never calls it --
 * scenarios/investigation/a-single-hypothesis-is-simulated's own "no outcome
 * and no assessment are resolved" means a single-hypothesis run could not be
 * shaped into a CaseResultRun even if this file tried (case-result-panel's
 * own delivery record already establishes this: CaseResultRun requires
 * outcome/referral).
 *
 * ---- Criterion 6: return-from-editing staleness ----
 * CaseVersionRecord (../services/case-version-record.ts) carries no hash or
 * updated_at field, so D8's own "otherwise always mark stale on return" is
 * the branch that always applies here -- no comparison is computed because
 * there is nothing on this record to compare.
 * "Return" is detected without touching the three editing screens themselves
 * (Version Editor, Manifest, Revise Hypothesis -- all outside this task's own
 * depends_on and file set): `visitedSimulationRoutes`, a plain module-level
 * Set (this file's own singleton, never react-query's cache and never
 * browser storage -- neither holds simulation data, so neither of
 * rules/investigation/a-simulation-writes-no-investigation's own "nothing it
 * collects reaches a cache" concerns is implicated here), records which
 * `slug:version` pairs this cockpit has already mounted for once, this tab's
 * session. A mount that finds its own key already recorded is treated as a
 * return: this route's only current entry points are a first visit or a
 * return from one of the three editing links this screen itself renders
 * (case-simulation-header.tsx's "Edit version"/"Manifest",
 * case-simulation-hypotheses-table.tsx's own row "Edit" link). On that mount,
 * the version's own query is invalidated (reloading the header, the Subject
 * region's own derivation and the Hypotheses table's own manifest rows
 * together, since all three read the same `["case-version", slug, version]`
 * query, use-case-simulation-version.ts's own key) and `markLastRunStale()`
 * is called.
 * A limitation this mechanism does not hide: `useCaseSimulationHistory`'s own
 * run list is component-scoped React state (use-case-simulation-history.ts,
 * reused rather than duplicated here), so a genuine full-route navigation to
 * any of the three editing routes and back unmounts and remounts this whole
 * cockpit, resetting `evaluations`/`runs` to empty before `markLastRunStale`
 * is ever called against them -- the call is correct and fires, but has
 * nothing to mark on a real round trip today (markLastRunStale's own "a
 * no-op when no run has completed yet" applies). Fixing that needs either
 * widening use-case-simulation-history.ts's own signature to accept a seed,
 * or lifting this cockpit's session state above the router's Outlet
 * (app-shell.tsx) -- both outside this task's own file and reach; recorded
 * as a deferred limitation in this task's own delivery record.
 */

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

/**
 * This tab's own "already visited this slug/version's simulate route" marker
 * (this file's own header comment on criterion 6) -- never simulation data,
 * never react-query's cache, never browser storage.
 */
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

/** Composes this cockpit's cross-region state for the case version `record` (this file's own header comment). */
export function useCaseSimulationCockpit(
  slug: string,
  version: number,
  record: CaseVersionRecord,
): CaseSimulationCockpitState {
  const queryClient = useQueryClient();

  const subjectSource: SimulationSubjectSource = {
    subject: record.subject,
    manifest: record.manifest,
  };
  const subjectState = useSimulationSubject(subjectSource);
  const caseSim = useSimulateCase();
  const hypSim = useSimulateHypothesis(slug, version);
  const history = useCaseSimulationHistory();

  const [evaluations, setEvaluations] = useState<Readonly<Record<string, CockpitEvaluation>>>({});
  const [lastCaseResult, setLastCaseResult] = useState<SimulateCaseResult | null>(null);
  const [selectedHypothesisName, setSelectedHypothesisName] = useState<string | null>(null);

  const previousCaseResultRef = useRef<SimulateCaseResult | null>(null);
  const previousHypothesisResultRef = useRef<SimulateHypothesisResult | null>(null);

  // A completed full-case run overwrites every hypothesis it names (criterion
  // 4) and is the only source that ever populates Case result (criterion 5).
  // `history.recordRun` is recreated every render (use-case-simulation-history.ts
  // returns a fresh object each call) but behaves identically each time, so
  // this effect depends only on `caseSim.result` -- depending on `history`
  // itself would re-run it, and re-record the same run, on every render.
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

  // A completed single-hypothesis run overwrites only the one hypothesis it
  // named (criterion 4) and never records a Case result run (criterion 5).
  useEffect(() => {
    const result = hypSim.result;
    if (result && result !== previousHypothesisResultRef.current) {
      previousHypothesisResultRef.current = result;
      setEvaluations((current) => ({
        ...current,
        [result.evaluation.hypothesis]: fromHypothesisEvaluation(result.evaluation),
      }));
    }
  }, [hypSim.result]);

  // Criterion 6: return-from-editing detection (this file's own header
  // comment). Deliberately fires once per mount only -- `queryClient`,
  // `history`, `slug` and `version` are read fresh from this render's own
  // closure, and none of their identities changing should re-trigger it.
  useEffect(() => {
    const visitedKey = `${slug}:${version}`;
    const isReturn = visitedSimulationRoutes.has(visitedKey);
    visitedSimulationRoutes.add(visitedKey);
    if (isReturn) {
      void queryClient.invalidateQueries({ queryKey: ["case-version", slug, version] });
      history.markLastRunStale();
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
    // fix-use-simulate-hypothesis-dispatch: hypSim.onSimulate now dispatches
    // against the live POST /v1/simulate/hypothesis route, whose body
    // requires a requester the same way caseSim.onSimulate's body already
    // does (this file's own header comment, "Criterion 3: one subject,
    // shared" -- subjectState.requester feeds both onSimulate calls
    // unchanged) -- forwarded through here rather than dropped as it was
    // before this fix.
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
              : [],
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
