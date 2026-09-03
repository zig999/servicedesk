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

  readonly runs: readonly CaseResultRun[];
};

export function CaseSimulationCaseResultPanel({
  runs,
}: CaseSimulationCaseResultPanelProps): JSX.Element | null {
  const [selectedRunIds, setSelectedRunIds] = useState<readonly string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

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
        <div className="flex flex-col gap-2">
          {lastRun.text.split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>
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
