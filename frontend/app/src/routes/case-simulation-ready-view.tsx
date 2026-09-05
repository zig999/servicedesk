import type { JSX } from "react";
import { CaseSimulationHeader } from "./case-simulation-header";
import { CaseSimulationSubjectPanel } from "./case-simulation-subject-panel";
import { CaseSimulationHypothesesTable } from "./case-simulation-hypotheses-table";
import { CaseSimulationDetailPanel } from "./case-simulation-detail-panel";
import { CaseSimulationCaseResultPanel } from "./case-simulation-case-result-panel";
import { useCaseSimulationCockpit } from "../hooks/use-case-simulation-cockpit";
import type { CaseSimulationVersionState } from "../hooks/use-case-simulation-version";

export type CaseSimulationReadyViewProps = {
  readonly slug: string;
  readonly version: number;
  readonly state: Extract<CaseSimulationVersionState, { phase: "ready" }>;
};

export function CaseSimulationReadyView({
  slug,
  version,
  state,
}: CaseSimulationReadyViewProps): JSX.Element {
  const {
    canSimulateCase,
    onSimulateCase,
    dispatchError,
    subject,
    hypothesesRows,
    hypothesesSummary,
    lastRunDurations,
    disableSimulateHypothesis,
    onSimulateHypothesis,
    onSelectHypothesis,
    detail,
    caseResultRuns,
  } = useCaseSimulationCockpit(slug, version, state.record);

  return (
    <section className="flex flex-col gap-6">
      <CaseSimulationHeader
        slug={slug}
        version={version}
        whenToUse={state.record.when_to_use}
        versionState={state.versionState}
        canSimulate={canSimulateCase}
        onSimulateCase={onSimulateCase}
      />

      {dispatchError && (
        <p role="alert" className="text-sm text-destructive">
          {dispatchError}
        </p>
      )}

      <CaseSimulationSubjectPanel state={subject} />

      <CaseSimulationHypothesesTable
        slug={slug}
        version={version}
        rows={hypothesesRows}
        summary={hypothesesSummary}
        lastRunDurations={lastRunDurations}
        disableSimulate={disableSimulateHypothesis}
        onSimulateHypothesis={onSimulateHypothesis}
        onSelectHypothesis={onSelectHypothesis}
      />

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <h2 className="text-lg font-semibold text-foreground">Debug</h2>
        <details>
          <summary className="cursor-pointer text-sm text-muted-foreground">
            View subject JSON
          </summary>
          <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">
            {JSON.stringify(subject.subject, null, 2)}
          </pre>
        </details>
      </div>

      {detail ? (
        <CaseSimulationDetailPanel {...detail} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a hypothesis with a result to see its detail.
        </p>
      )}

      <CaseSimulationCaseResultPanel runs={caseResultRuns} />
    </section>
  );
}
