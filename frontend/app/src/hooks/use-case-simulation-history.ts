import { useRef, useState } from "react";
import type { CaseResultRun } from "../routes/case-simulation-case-result-types";

/**
 * task/simulation-cockpit/case-result-panel: this session's own in-memory
 * run history (criterion 3) -- every full-case run this session is
 * appended here through `recordRun`, kept only in plain React state: no
 * useQueryClient, no invalidateQueries, no apiFetch, no
 * localStorage/sessionStorage anywhere in this file. Nothing this hook
 * holds is ever persisted, sent to any endpoint, or read from a cache,
 * satisfying rules/investigation/a-simulation-writes-no-investigation's own
 * "nothing it collects ever enters a cache" for this region's own state --
 * the same way use-simulate-case.ts's own header doc already reads that
 * rule for its own dispatch.
 *
 * A caller supplies only the domain facts a completed full-case run holds
 * (domain/investigation/assessment's own outcome, referral,
 * determining_hypothesis and text/register, plus, per judged hypothesis,
 * domain/investigation/evaluation's own verdict) -- `id`, `ranAt` and
 * `stale` are this hook's own bookkeeping, assigned here rather than by the
 * caller, since none of the three is a fact any specification node states.
 *
 * `markLastRunStale` (criterion 5) flips the last run's own `stale` flag in
 * place, appending nothing -- callable at any point
 * task/simulation-cockpit/screen-assembly is told the underlying case
 * version changed (its own criterion 6, contracts/knowledge/case-lifecycle's
 * own update-draft/revise-hypothesis/place-hypothesis/remove-hypothesis/
 * release/discard), independent of whether a new full-case run is ever
 * dispatched again. This is exactly criterion 5's own "without requiring a
 * new run to clear the marking itself": marking is a standalone action,
 * never a side effect of `recordRun`.
 */

export type NewCaseResultRun = Omit<CaseResultRun, "id" | "ranAt" | "stale">;

export type CaseSimulationHistoryState = {
  /** Every full-case run this session has completed, oldest first -- never empty until the first recordRun call (criterion 1's own "renders nothing until at least one has"). */
  readonly runs: readonly CaseResultRun[];
  /** Appends one newly-completed full-case run to the end of `runs`. */
  readonly recordRun: (run: NewCaseResultRun) => void;
  /** Marks the current last run "stale" in place; a no-op when no run has completed yet. */
  readonly markLastRunStale: () => void;
};

export function useCaseSimulationHistory(): CaseSimulationHistoryState {
  const [runs, setRuns] = useState<readonly CaseResultRun[]>([]);
  const nextIdRef = useRef(0);

  function recordRun(run: NewCaseResultRun): void {
    nextIdRef.current += 1;
    const newRun: CaseResultRun = {
      ...run,
      id: `run-${nextIdRef.current}`,
      ranAt: new Date().toISOString(),
      stale: false,
    };
    setRuns((previous) => [...previous, newRun]);
  }

  function markLastRunStale(): void {
    setRuns((previous) => {
      if (previous.length === 0) {
        return previous;
      }
      const lastIndex = previous.length - 1;
      return previous.map((run, index) => (index === lastIndex ? { ...run, stale: true } : run));
    });
  }

  return { runs, recordRun, markLastRunStale };
}
