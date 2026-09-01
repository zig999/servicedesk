import type { JSX } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import {
  useConnectorConfigurations,
  type ConnectorConfiguration,
} from "../hooks/use-connector-configurations";

const COLUMNS: StatusTableColumn[] = [{ key: "connector", header: "Connector" }];

function toRow(connectorConfiguration: ConnectorConfiguration): StatusTableRow {
  return {
    id: connectorConfiguration.connector,
    connector: connectorConfiguration.connector,
  };
}

export function ConnectorConfigurationsScreen(): JSX.Element {
  const navigate = useNavigate();
  const { connectorConfigurations, isLoading, isError, refetch } = useConnectorConfigurations();

  function handleRowClick(row: StatusTableRow): void {
    const connector = row.connector;
    if (typeof connector !== "string") {
      return;
    }
    void navigate({ to: "/connectors/$connector", params: { connector } });
  }

  function renderBody(): JSX.Element {
    if (isLoading) {
      return <p>Loading connector configurations…</p>;
    }

    if (isError) {

      return (
        <section>
          <p>Connector configurations could not be loaded.</p>
          <Button type="button" onClick={refetch}>
            Retry
          </Button>
        </section>
      );
    }

    if (connectorConfigurations.length === 0) {

      return <p>No connector configurations are currently registered.</p>;
    }

    return (
      <StatusTable
        columns={COLUMNS}
        rows={connectorConfigurations.map(toRow)}
        onRowClick={handleRowClick}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Connectors</h1>
        {/*
          "New connector configuration" renders unconditionally, ahead of
          the loading/error/empty branches above, so criterion 4 (this
          task's own -- "renders while the list is loading, while it has
          failed to load, and while it is empty, as it does today") holds
          regardless of whichever of those three states the list itself is
          currently in -- unchanged from before this task, which only
          repoints where activating it leads
          (task/connector-capability-create-detail-route/
          connector-configurations-list-create-action's own criteria 1-2:
          navigates to route-tree.tsx's own "/connectors/new" instead of
          opening the popup Dialog), mirroring
          capabilities-browser-screen.tsx's own "New capability" action for
          the same reason: hiding a create action behind an unrelated read
          failure would block authoring a connector configuration for a
          reason that has nothing to do with it.
        */}
        <Button type="button" onClick={() => void navigate({ to: "/connectors/new" })}>
          New connector configuration
        </Button>
      </div>
      {renderBody()}
    </div>
  );
}
