import type { JSX } from "react";
import type { CaseResultCost } from "./case-simulation-case-result-types";
import type { SimulationDurations } from "./case-simulation-hypotheses-table-row";

export type CaseSimulationCaseResultTotalsTabProps = {
  readonly cost: CaseResultCost;
  readonly durations: SimulationDurations;
};

export function CaseSimulationCaseResultTotalsTab({
  cost,
  durations,
}: CaseSimulationCaseResultTotalsTabProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {cost.calls} calls · {cost.inputTokens} tokens in / {cost.outputTokens} tokens out
      </p>
      <p className="text-sm text-muted-foreground">
        Collection {durations.collectionMs}ms · Judgment {durations.judgmentMs}ms
        {durations.writingMs !== undefined ? ` · Writing ${durations.writingMs}ms` : ""} · Total{" "}
        {durations.totalMs}ms
      </p>
    </div>
  );
}
