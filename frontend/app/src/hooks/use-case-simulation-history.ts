import { useRef, useState } from "react";
import type { CaseResultRun } from "../routes/case-simulation-case-result-types";

export type NewCaseResultRun = Omit<CaseResultRun, "id" | "ranAt" | "stale">;

export type CaseSimulationHistoryState = {

  readonly runs: readonly CaseResultRun[];

  readonly recordRun: (run: NewCaseResultRun) => void;

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
