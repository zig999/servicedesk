import type { JSX } from "react";
import { useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { useCaseSimulationVersion } from "../hooks/use-case-simulation-version";
import { CaseSimulationReadyView } from "./case-simulation-ready-view";

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
