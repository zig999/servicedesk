import type { JSX } from "react";
import { CaseSimulationHeader } from "./case-simulation-header";
import { CaseSimulationSubjectPanel } from "./case-simulation-subject-panel";
import { CaseSimulationHypothesesTable } from "./case-simulation-hypotheses-table";
import { CaseSimulationDetailPanel } from "./case-simulation-detail-panel";
import { CaseSimulationCaseResultPanel } from "./case-simulation-case-result-panel";
import { useCaseSimulationCockpit } from "../hooks/use-case-simulation-cockpit";
import type { CaseSimulationVersionState } from "../hooks/use-case-simulation-version";

/**
 * task/simulation-cockpit/screen-assembly: the Simulation Cockpit's own
 * "ready" phase markup, now composing every region the layout describes
 * (intake/layout/simulation-screen.md) into one working screen -- the header
 * (task/simulation-cockpit/case-simulation-route), the Subject region
 * (task/subject-derivation/subject-panel), the Hypotheses region
 * (task/simulation-cockpit/hypotheses-table), the Detail region
 * (task/simulation-cockpit/detail-panel) and the Case result region
 * (task/simulation-cockpit/case-result-panel) -- sharing one subject, one
 * dispatch-at-a-time gate and one per-hypothesis evaluation map, all computed
 * by useCaseSimulationCockpit (../hooks/use-case-simulation-cockpit.ts).
 *
 * This file itself only composes those five components and reads the
 * cockpit's own returned state (ARC-02, ARC-03): the cross-region logic --
 * gating, the shared subject, which run populates which region, the
 * return-from-editing staleness marker -- lives in that hook and in
 * ../routes/case-simulation-cockpit-adapters.ts, never inline here.
 *
 * Replaces this file's own previous placeholder wiring
 * (`canSimulate={false}`, an inert `onSimulateCase`, no other region
 * composed) now that every sibling region and both dispatch hooks exist.
 */

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
