import type { JSX } from "react";
import { useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { useCaseSimulationVersion } from "../hooks/use-case-simulation-version";
import { CaseSimulationReadyView } from "./case-simulation-ready-view";

/**
 * The Simulation Cockpit (task/simulation-cockpit/case-simulation-route): the
 * curator's own entry to the same engine a diagnosis runs
 * (contracts/investigation/case-simulation), open on a case version in either
 * draft or released state (domain/knowledge/case-version-state). This task
 * builds the route and its header only -- loads the addressed version through
 * GET /v1/cases/{slug}/versions/{version} (contracts/knowledge/case-lifecycle's
 * own read side, domain/knowledge/case-version), and renders the loading/
 * load-error states this route itself owns (EDG-01, EDG-02), delegating the
 * "ready" phase's own markup whole to CaseSimulationReadyView (ARC-02,
 * ARC-03) -- the same screen/ready-view/hooks triad every other routed detail
 * screen in this area already follows (case-version-editor-screen.tsx,
 * version-manifest-screen.tsx).
 *
 * Wired in as route-tree.tsx's own new
 * "/cases/$slug/versions/$version/simulate" route's `component`.
 */
export function CaseSimulationScreen(): JSX.Element {
  const { slug, version } = useParams({
    from: "/cases/$slug/versions/$version/simulate",
  });
  const state = useCaseSimulationVersion(slug, Number(version));

  if (state.phase === "loading") {
    return <p>Loading version {version}…</p>;
  }

  if (state.phase === "load-error") {
    return (
      <section>
        <p>Unable to load this version right now.</p>
        <Button type="button" onClick={state.retryLoad}>
          Retry
        </Button>
      </section>
    );
  }

  return <CaseSimulationReadyView slug={slug} version={Number(version)} state={state} />;
}
