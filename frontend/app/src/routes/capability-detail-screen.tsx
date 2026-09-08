import type { JSX } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { ButtonFooter } from "../shared/components/button-footer";
import { useCapabilityDetailView } from "../hooks/use-capability-detail-view";
import { CapabilityDetailReadyView } from "./capability-detail-ready-view";

export function CapabilityDetailScreen(): JSX.Element {
  const { name, version } = useParams({ from: "/capabilities/$name/$version" });
  const state = useCapabilityDetailView(name, version);

  if (state.phase === "loading") {
    return (
      <section className="flex flex-col gap-4">
        <p>
          Loading capability {name} {version}…
        </p>
        <ButtonFooter>
          <Button type="button" variant="secondary" onClick={state.onCancel}>
            Cancel
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/capabilities">Capabilities</Link>
          </Button>
        </ButtonFooter>
      </section>
    );
  }

  if (state.phase === "load-error") {
    return (
      <section className="flex flex-col gap-4">
        <p>Unable to load this capability right now.</p>
        <ButtonFooter>
          <Button type="button" onClick={state.retryLoad}>
            Retry
          </Button>
          <Button type="button" variant="secondary" onClick={state.onCancel}>
            Cancel
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/capabilities">Capabilities</Link>
          </Button>
        </ButtonFooter>
      </section>
    );
  }

  if (state.phase === "not-registered") {
    return (
      <section className="flex flex-col gap-4">
        <p>Unable to load this capability right now.</p>
        <ButtonFooter>
          <Button type="button" variant="secondary" onClick={state.onCancel}>
            Cancel
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/capabilities">Capabilities</Link>
          </Button>
        </ButtonFooter>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">
        Capability {name} {version}
      </h1>
      <CapabilityDetailReadyView state={state} />
    </section>
  );
}
