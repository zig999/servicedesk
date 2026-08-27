import { useState, type JSX } from "react";
import { Button } from "@tui/ui/button";
import { Checkbox } from "@tui/ui/checkbox";
import { CaseSimulationStatusDot } from "./case-simulation-status-dot";
import { CaseSimulationCaseResultCompare } from "./case-simulation-case-result-compare";
import {
  formatRunTime,
  resolveCompareRuns,
  toggleCompareSelection,
  type CaseResultRun,
} from "./case-simulation-case-result-types";

export type CaseSimulationCaseResultPanelProps = {
  /** This session's own full-case run history, oldest first (use-case-simulation-history.ts's own `runs`). Empty until the first full-case run completes. */
  readonly runs: readonly CaseResultRun[];
};

/**
 * task/simulation-cockpit/case-result-panel: the "Case result" region of the
 * case-simulation cockpit's layout (intake/layout/simulation-screen.md's own
 * "Case result" section, including D9's tokens-not-currency -- honored here
 * by construction, since this region shows no price of any kind -- and D10's
 * in-memory-only history -- use-case-simulation-history.ts's own header
 * doc). It shows the outcome/referral/determining line and the
 * customer-facing text of the last full-case run this session (criteria 1
 * and 2), this session's own run history with a Compare action (criteria 3
 * and 4, criterion 3 itself proven by use-case-simulation-history.ts rather
 * than by this file), and the last run's own "stale" marker (criterion 5).
 *
 * Presentational and props-driven, per this epic's own established
 * convention (case-simulation-hypotheses-table.tsx, case-simulation-
 * detail-panel.tsx): every run comes from `runs`, appended and marked stale
 * by task/simulation-cockpit/screen-assembly's own use of
 * use-case-simulation-history.ts, neither of which this component calls or
 * imports. A single-hypothesis run can never appear in `runs` at all --
 * CaseResultRun requires outcome/referral, which
 * scenarios/investigation/a-single-hypothesis-is-simulated's own "no outcome
 * and no assessment are resolved" means a single-hypothesis run never has --
 * so this region structurally cannot be populated by one, matching
 * task/simulation-cockpit/screen-assembly's own criterion 5.
 *
 * This component's own local state (`selectedRunIds`, `compareOpen`) is
 * UI-only selection state (STA-02) -- which two runs are checked for
 * comparison, and whether the comparison is currently shown -- never a copy
 * of server or domain data. No criterion of this task names a selection
 * mechanism; checkboxes plus a gated "Compare" button is this task's own
 * inference (case-simulation-case-result-types.ts's own toggleCompareSelection
 * doc), since criterion 4 states only the resulting two-run view.
 */
export function CaseSimulationCaseResultPanel({
  runs,
}: CaseSimulationCaseResultPanelProps): JSX.Element | null {
  const [selectedRunIds, setSelectedRunIds] = useState<readonly string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  // Criterion 1: nothing renders until at least one full-case run has
  // completed this session.
  if (runs.length === 0) {
    return null;
  }

  const lastRun = runs[runs.length - 1];
  const compareRuns = resolveCompareRuns(runs, selectedRunIds);

  function handleToggleSelection(id: string): void {
    setSelectedRunIds((previous) => toggleCompareSelection(previous, id));
  }

  return (
    <section aria-label="Case result" className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">Case result</h2>

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-foreground">
          Outcome {lastRun.outcome} · Referral {lastRun.referral.action} /{" "}
          {lastRun.referral.recipient} · Determining{" "}
          {lastRun.determiningHypothesis ?? "Fallback"}
        </p>
        {lastRun.stale && <CaseSimulationStatusDot color="bg-warning" label="Stale" />}
      </div>

      <div className="rounded-md border border-border bg-muted p-3">
        <p className="text-sm text-muted-foreground">
          Customer-facing text ({lastRun.register})
        </p>
        <p>{lastRun.text}</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Runs this session</p>
        <ul className="flex flex-col gap-1">
          {runs.map((run, index) => (
            <li key={run.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selectedRunIds.includes(run.id)}
                onChange={() => handleToggleSelection(run.id)}
              >
                #{index + 1} {formatRunTime(run.ranAt)} · {run.outcome}
                {run.stale ? " · stale" : ""}
              </Checkbox>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          disabled={selectedRunIds.length !== 2}
          onClick={() => setCompareOpen(true)}
        >
          Compare
        </Button>
      </div>

      {compareOpen && compareRuns && <CaseSimulationCaseResultCompare runs={compareRuns} />}
    </section>
  );
}
