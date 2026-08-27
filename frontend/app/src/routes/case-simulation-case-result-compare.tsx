import type { JSX } from "react";
import { CaseSimulationStatusDot } from "./case-simulation-status-dot";
import {
  VERDICT_CELL,
  formatRunTime,
  hypothesisNamesAcross,
  verdictForHypothesis,
  type CaseResultRun,
} from "./case-simulation-case-result-types";

export type CaseSimulationCaseResultCompareProps = {
  readonly runs: readonly [CaseResultRun, CaseResultRun];
};

/**
 * task/simulation-cockpit/case-result-panel, criterion 4: shows two runs
 * from the in-memory history side by side, hypothesis by hypothesis. Every
 * hypothesis either run judged gets exactly one row; a hypothesis only one
 * of the two runs judged renders a plain placeholder on the other side
 * rather than being dropped from the comparison silently (this file's own
 * header import of hypothesisNamesAcross, case-simulation-case-result-types.ts).
 * Verdicts render through CaseSimulationStatusDot (VERDICT_CELL), the same
 * dot-plus-label idiom every other status cell in this epic already uses
 * (ACC-08: color is never shown alone).
 */
export function CaseSimulationCaseResultCompare({
  runs,
}: CaseSimulationCaseResultCompareProps): JSX.Element {
  const [first, second] = runs;
  const hypotheses = hypothesisNamesAcross(runs);

  return (
    <div
      className="flex flex-col gap-2 rounded-md border border-border p-3"
      aria-label="Compare runs"
    >
      <div className="grid grid-cols-3 gap-2 text-sm font-medium text-foreground">
        <span>Hypothesis</span>
        <span>{formatRunTime(first.ranAt)}</span>
        <span>{formatRunTime(second.ranAt)}</span>
      </div>
      {hypotheses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Neither run judged a hypothesis.</p>
      ) : (
        hypotheses.map((hypothesis) => {
          const onFirst = verdictForHypothesis(first, hypothesis);
          const onSecond = verdictForHypothesis(second, hypothesis);
          return (
            <div key={hypothesis} className="grid grid-cols-3 items-center gap-2 text-sm">
              <span>{hypothesis}</span>
              <span>
                {onFirst ? <CaseSimulationStatusDot {...VERDICT_CELL[onFirst.verdict]} /> : "—"}
              </span>
              <span>
                {onSecond ? <CaseSimulationStatusDot {...VERDICT_CELL[onSecond.verdict]} /> : "—"}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
