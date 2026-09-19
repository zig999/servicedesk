import { useState, type JSX } from "react";
import { Button } from "@tui/ui/button";
import { Checkbox } from "@tui/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tui/ui/tabs";
import { CaseSimulationStatusDot } from "./case-simulation-status-dot";
import { CaseSimulationCaseResultCompare } from "./case-simulation-case-result-compare";
import { CaseSimulationCaseResultDebugTab } from "./case-simulation-case-result-debug-tab";
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
  const [shownRunId, setShownRunId] = useState<string | null>(null);

  if (runs.length === 0) {
    return null;
  }

  const lastRun = runs[runs.length - 1];
  const shownRun = runs.find((run) => run.id === shownRunId) ?? lastRun;
  const compareRuns = resolveCompareRuns(runs, selectedRunIds);

  function handleToggleSelection(id: string): void {
    setSelectedRunIds((previous) => toggleCompareSelection(previous, id));
  }

  return (
    <section aria-label="Case result" className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">Case result</h2>

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-foreground">
          Outcome {shownRun.outcome} · Referral {shownRun.referral.action} /{" "}
          {shownRun.referral.recipient} · Determining{" "}
          {shownRun.determiningHypothesis ?? "Fallback"}
        </p>
        {shownRun.stale && <CaseSimulationStatusDot color="bg-warning" label="Stale" />}
      </div>

      <div className="rounded-md border border-border bg-muted p-3">
        <p className="text-sm text-muted-foreground">
          Customer-facing text ({shownRun.register})
        </p>
        <div className="flex flex-col gap-2">
          {shownRun.text.split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph} className="whitespace-pre-wrap text-sm">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <h2 className="text-lg font-semibold text-foreground">Debug</h2>
        <Tabs defaultValue="prompt">
          <TabsList>
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
          </TabsList>
          <TabsContent value="prompt">
            <CaseSimulationCaseResultDebugTab
              consolidationCall={shownRun.consolidationCall}
              register={shownRun.register}
            />
          </TabsContent>
        </Tabs>
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
              <Button
                type="button"
                variant="secondary"
                aria-pressed={run.id === shownRun.id}
                aria-label={`Show run #${index + 1}`}
                onClick={() => setShownRunId(run.id)}
              >
                {run.id === shownRun.id ? "Shown" : "Show"}
              </Button>
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
