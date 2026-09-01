import type { JSX } from "react";
import type { SimulationJudgmentCall } from "./case-simulation-detail-types";

export type CaseSimulationDetailPromptTabProps = {
  readonly judgmentCall: SimulationJudgmentCall;
};

export function CaseSimulationDetailPromptTab({
  judgmentCall,
}: CaseSimulationDetailPromptTabProps): JSX.Element {
  if (!judgmentCall.called) {
    return <p>Judgment was never called for this hypothesis.</p>;
  }

  return (
    <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">
      {judgmentCall.prompt}
    </pre>
  );
}
