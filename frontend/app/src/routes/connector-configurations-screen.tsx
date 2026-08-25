import { useState, type JSX } from "react";
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
import type { ConnectorConfigurationFormTarget } from "../hooks/use-connector-configuration-form";
import { ConnectorConfigurationFormDialog } from "./connector-configuration-form-dialog";

/**
 * The Connector Configurations screen
 * (task/connector-configuration-authoring/connector-configuration-create-edit-form):
 * every connector configuration GET /v1/connectors returns, one row each
 * (criterion 1), and a "New connector configuration" action (criterion 2)
 * that opens the shared create/edit Dialog in create mode, parametrized by
 * `formTarget`'s own nullable-identity shape (ConnectorConfigurationFormTarget:
 * `null` closed, or `{ mode: "create" }` here -- `{ mode: "edit", ... }`
 * stays part of that shared type for connector-configuration-form-dialog.tsx's
 * own sake, but this screen never constructs one, see below).
 *
 * task/connector-capability-detail-editing/connector-configuration-detail-route
 * (criteria 2 and 9) replaces this screen's own former per-row "Edit" action
 * -- which opened that same Dialog in edit mode -- with a row click that
 * navigates to the new routed detail/edit screen instead
 * (route-tree.tsx's own "/connectors/$connector"), mirroring
 * cases-list-screen.tsx's own established "clicking a row navigates"
 * convention (StatusTable's own `onRowClick`, a plain function reading the
 * clicked row's own identity field and calling `navigate`) rather than a
 * second, hand-rolled row-link pattern. The popup Dialog's own "New
 * connector configuration" creation path (criterion 2) is untouched: that
 * action still opens the Dialog in create mode exactly as before.
 *
 * Wired in as route-tree.tsx's "/connectors" route's own `component`
 * (this task's own inference on the route's path and this screen's own name,
 * disclosed in its delivery record: no criterion or reference states either).
 */

const COLUMNS: StatusTableColumn[] = [{ key: "connector", header: "Connector" }];

/**
 * `connector` is domain/integration/connector-configuration's own one
 * identifying attribute, used directly as the row's own `id` (StatusTable's
 * own row-key convention, MNT-04) -- unlike capabilities-browser-screen.tsx's
 * own composite key, a connector configuration's identity is this one field
 * alone.
 */
function toRow(connectorConfiguration: ConnectorConfiguration): StatusTableRow {
  return {
    id: connectorConfiguration.connector,
    connector: connectorConfiguration.connector,
  };
}

export function ConnectorConfigurationsScreen(): JSX.Element {
  const navigate = useNavigate();
  const { connectorConfigurations, isLoading, isError, refetch } = useConnectorConfigurations();
  const [formTarget, setFormTarget] = useState<ConnectorConfigurationFormTarget | null>(null);

  /**
   * Clicking a row navigates to that connector's own detail/edit route
   * (criterion 2) rather than opening the popup Dialog's edit mode
   * (criterion 9) -- the same `typeof ... !== "string"` guard
   * cases-list-screen.tsx's own handleRowClick already keeps before
   * trusting a StatusTableRow's untyped `Record<string, unknown>` value.
   */
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
      // GET /v1/connectors throws no domain error error-ui-state.ts names,
      // so a load failure falls through to this screen's own generic
      // fallback -- the same convention capabilities-browser-screen.tsx
      // already keeps for its own listing read. EDG-02 still asks for an
      // explicit retry action rather than only useConnectorConfigurations'
      // own toast-triggering error state.
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
      // API-04: an empty response renders its own explicit empty state,
      // never treated as still loading or as a failure.
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
          the loading/error/empty branches above, so criterion 2 holds
          regardless of whichever of those three states the list itself is
          currently in -- this screen's own inference, disclosed in its
          delivery record, mirroring capabilities-browser-screen.tsx's own
          "New capability" action for the same reason: hiding a create
          action behind an unrelated read failure would block authoring a
          connector configuration for a reason that has nothing to do with
          it.
        */}
        <Button type="button" onClick={() => setFormTarget({ mode: "create" })}>
          New connector configuration
        </Button>
      </div>
      {renderBody()}
      {formTarget !== null && (
        <ConnectorConfigurationFormDialog
          target={formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}
    </div>
  );
}
