import type { JSX } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { useCapabilityDetailView } from "../hooks/use-capability-detail-view";
import { CapabilityDetailReadyView } from "./capability-detail-ready-view";

export function CapabilityDetailScreen(): JSX.Element {
  const { name, version } = useParams({ from: "/capabilities/$name/$version" });
  const state = useCapabilityDetailView(name, version);

  if (state.phase === "loading") {
    return (
      <section className="flex flex-col gap-4">
        <Link to="/capabilities">Back to capabilities</Link>
        <p>
          Loading capability {name} {version}…
        </p>
      </section>
    );
  }

  if (state.phase === "load-error") {
    return (
      <section className="flex flex-col gap-4">
        <Link to="/capabilities">Back to capabilities</Link>
        <p>Unable to load this capability right now.</p>
        <Button type="button" onClick={state.retryLoad}>
          Retry
        </Button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <Link to="/capabilities">Back to capabilities</Link>
      <h1 className="text-lg font-semibold text-foreground">
        Capability {name} {version}
      </h1>
      <CapabilityDetailReadyView state={state} />
    </section>
  );
}
