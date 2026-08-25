import type { JSX } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { useConnectorConfigurationDetailView } from "../hooks/use-connector-configuration-detail-view";
import { ConnectorConfigurationDetailReadyView } from "./connector-configuration-detail-ready-view";

/**
 * The connector-configuration detail/edit route
 * (task/connector-capability-detail-editing/connector-configuration-detail-route):
 * loads the connector configuration named by this route's own path param
 * through useConnectorConfigurationDetailView (which itself composes
 * useConnectorConfigurationDetail, task/connector-capability-detail-editing/
 * connector-configuration-detail-hook, already delivered), and renders each
 * phase explicitly -- the same convention case-version-editor-screen.tsx
 * already establishes for a routed detail screen (useParams, a
 * phase-union hook, one branch per phase).
 *
 * Wired in as route-tree.tsx's own "/connectors/$connector" route's
 * `component` (criterion 1).
 *
 * A "Back to connector configurations" Link (criterion 3) renders in every
 * phase, not only "ready" -- an operator who lands on a load-error phase
 * still needs a way back to the list, and criterion 3 names no phase it is
 * scoped to. Unlike case-version-editor-screen.tsx's own load-error branch
 * (whose hook auto-navigates away on a 404 kind it can distinguish), this
 * route's own hook reports one undifferentiated load-error for both "the
 * GET failed" and "the connector configuration does not exist"
 * (connector-configuration-detail-hook's own criterion 7) -- so this
 * screen offers Retry and the same Back link rather than inventing an
 * automatic redirect the hook gives it no signal to distinguish.
 */
export function ConnectorConfigurationDetailScreen(): JSX.Element {
  const { connector } = useParams({ from: "/connectors/$connector" });
  const state = useConnectorConfigurationDetailView(connector);

  if (state.phase === "loading") {
    return (
      <section className="flex flex-col gap-4">
        <Link to="/connectors">Back to connector configurations</Link>
        <p>Loading connector configuration {connector}…</p>
      </section>
    );
  }

  if (state.phase === "load-error") {
    return (
      <section className="flex flex-col gap-4">
        <Link to="/connectors">Back to connector configurations</Link>
        <p>Unable to load this connector configuration right now.</p>
        <Button type="button" onClick={state.retryLoad}>
          Retry
        </Button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <Link to="/connectors">Back to connector configurations</Link>
      <h1 className="text-lg font-semibold text-foreground">Connector {connector}</h1>
      <ConnectorConfigurationDetailReadyView state={state} connector={connector} />
    </section>
  );
}
