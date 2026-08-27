import type { JSX } from "react";
import { CaseSimulationHeader } from "./case-simulation-header";
import type { CaseSimulationVersionState } from "../hooks/use-case-simulation-version";

/**
 * The Simulation Cockpit's own "ready" phase markup (task/simulation-cockpit/
 * case-simulation-route), factored out of case-simulation-screen.tsx the same
 * way every other routed detail screen in this area delegates its own ready
 * phase whole to a *-ready-view.tsx component (case-version-editor-ready-
 * view.tsx, the inventory's own established triad convention).
 *
 * Renders only the header region today -- this task's own objective is the
 * route and the header, nothing else. The other four regions layout/
 * simulation-screen.md's own wireframe describes (subject, hypotheses,
 * detail, case result) belong to sibling tasks under this same epic
 * (subject-panel, hypotheses-table, detail-panel, case-result-panel), and
 * task/simulation-cockpit/screen-assembly is the one that composes them all
 * here, alongside this file, once every one of them exists -- this task
 * widens neither this component nor the screen to anticipate them.
 *
 * `canSimulate={false}` and the inert `onSimulateCase` below are this task's
 * own placeholder wiring for CaseSimulationHeader's two caller-supplied
 * props (case-simulation-header.tsx's own header comment): no subject-
 * derivation hook exists in this tree yet to report whether a subject is
 * ready (task/subject-derivation/subject-panel, outside this task's own
 * depends_on), and no simulate-case dispatch exists yet either
 * (task/simulation-cockpit/use-simulate-case, likewise outside this task's
 * own depends_on) -- so the control renders disabled and inert rather than
 * this task inventing a readiness computation or a dispatch call neither
 * criterion of its own asks for. screen-assembly (which depends on this task,
 * use-simulate-case and subject-panel together) replaces both values with the
 * real gate and the real dispatch once all three exist.
 */

export type CaseSimulationReadyViewProps = {
  readonly slug: string;
  readonly version: number;
  readonly state: Extract<CaseSimulationVersionState, { phase: "ready" }>;
};

/** Intentionally inert -- see this file's own header comment on `onSimulateCase`. */
function doNotDispatchSimulateCase(): void {
  // No-op: no simulate-case dispatch exists in this tree yet
  // (task/simulation-cockpit/use-simulate-case is a sibling task this one
  // does not depend on). screen-assembly replaces this handler once that
  // hook exists.
}

export function CaseSimulationReadyView({
  slug,
  version,
  state,
}: CaseSimulationReadyViewProps): JSX.Element {
  return (
    <section className="flex flex-col gap-4">
      <CaseSimulationHeader
        slug={slug}
        version={version}
        whenToUse={state.record.when_to_use}
        versionState={state.versionState}
        canSimulate={false}
        onSimulateCase={doNotDispatchSimulateCase}
      />
    </section>
  );
}
