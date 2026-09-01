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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
