import type { JSX } from "react";
import type { SimulationJudgmentCall } from "./case-simulation-detail-types";

/**
 * The Prompt tab's own body (task/simulation-cockpit/detail-panel,
 * criterion 4): the evaluation's own prompt exactly as materialized, in a
 * monospace <pre> -- the same convention connector-test-panel-result.tsx's
 * own request/response blocks already render raw transport data in --
 * for an evaluation a judgment call happened for. For reason `no-data`
 * (domain/investigation/evaluation-reason), no prompt exists to show
 * (domain/investigation/evaluation's own description: prompt is "absent
 * when reason no-data means judgment was never called at all"), so this
 * tab states that instead, reading `judgmentCall.called` -- which, per that
 * same description, is exactly the no-data condition -- rather than a
 * second reason field this task's own types module deliberately does not
 * carry.
 */
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
