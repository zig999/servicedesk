import type { JSX } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { useCapabilityDetailView } from "../hooks/use-capability-detail-view";
import { CapabilityDetailReadyView } from "./capability-detail-ready-view";

/**
 * The capability detail/edit route
 * (task/connector-capability-detail-editing/capability-detail-route): loads
 * the capability named by this route's own two path params through
 * useCapabilityDetailView (which itself composes useCapabilityDetail,
 * task/connector-capability-detail-editing/capability-detail-hook, already
 * delivered), and renders each phase explicitly -- the same convention
 * connector-configuration-detail-screen.tsx already establishes for a
 * routed detail screen (useParams, a phase-union hook, one branch per
 * phase), mirrored closely per this task's own instruction.
 *
 * Wired in as route-tree.tsx's own "/capabilities/$name/$version" route's
 * `component` (criterion 1).
 *
 * A "Back to capabilities" Link (criterion 3) renders in every phase, not
 * only "ready" -- an operator who lands on a load-error phase still needs a
 * way back to the list, and criterion 3 names no phase it is scoped to,
 * mirroring connector-configuration-detail-screen.tsx's own identical
 * reasoning: this route's own hook reports one undifferentiated load-error
 * for both "the GET failed" and "the (name, version) capability does not
 * exist", so this screen offers Retry and the same Back link rather than
 * inventing an automatic redirect the hook gives it no signal to
 * distinguish.
 */
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
