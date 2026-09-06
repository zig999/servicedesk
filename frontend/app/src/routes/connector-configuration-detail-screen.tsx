import type { JSX } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { ButtonFooter } from "../shared/components/button-footer";
import { useConnectorConfigurationDetailView } from "../hooks/use-connector-configuration-detail-view";
import { ConnectorConfigurationDetailReadyView } from "./connector-configuration-detail-ready-view";

export function ConnectorConfigurationDetailScreen(): JSX.Element {
  const { connector } = useParams({ from: "/connectors/$connector" });
  const state = useConnectorConfigurationDetailView(connector);

  if (state.phase === "loading") {
    return (
      <section className="flex flex-col gap-4">
        <p>Loading connector configuration {connector}…</p>
        <ButtonFooter>
          <Button variant="secondary" asChild>
            <Link to="/connectors">Cancel</Link>
          </Button>
        </ButtonFooter>
      </section>
    );
  }

  if (state.phase === "load-error") {
    return (
      <section className="flex flex-col gap-4">
        <p>Unable to load this connector configuration right now.</p>
        <ButtonFooter>
          <Button type="button" onClick={state.retryLoad}>
            Retry
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/connectors">Cancel</Link>
          </Button>
        </ButtonFooter>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Connector {connector}</h1>
      <ConnectorConfigurationDetailReadyView state={state} connector={connector} />
    </section>
  );
}
