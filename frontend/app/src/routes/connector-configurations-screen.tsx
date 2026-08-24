import { useState, type JSX } from "react";
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
 * (criterion 1), a "New connector configuration" action (criterion 2) and a
 * per-row "Edit" action (criterion 3) that share one Dialog, parametrized by
 * `formTarget`'s own nullable-identity shape (ConnectorConfigurationFormTarget:
 * `null` closed, `{ mode: "create" }`, or
 * `{ mode: "edit", connectorConfiguration }`) -- mirroring
 * capabilities-browser-screen.tsx's own composition exactly, this task's own
 * inventory naming that screen as a reuse point rather than a pattern to
 * re-derive.
 *
 * Selecting a row's own "Edit" action issues no second network request: the
 * row it edits is already fully loaded (both of ConnectorConfiguration's own
 * two attributes), the same property capabilities-browser-screen.tsx's own
 * header comment names for its own row-edit action.
 *
 * Wired in as route-tree.tsx's new "/connectors" route's own `component`
 * (this task's own inference on the route's path and this screen's own name,
 * disclosed in its delivery record: no criterion or reference states either).
 */

const COLUMNS: StatusTableColumn[] = [
  { key: "connector", header: "Connector" },
  { key: "actions", header: "" },
];

/**
 * `connector` is domain/integration/connector-configuration's own one
 * identifying attribute, used directly as the row's own `id` (StatusTable's
 * own row-key convention, MNT-04) -- unlike capabilities-browser-screen.tsx's
 * own composite key, a connector configuration's identity is this one field
 * alone.
 */
function toRow(
  connectorConfiguration: ConnectorConfiguration,
  onEdit: (connectorConfiguration: ConnectorConfiguration) => void,
): StatusTableRow {
  return {
    id: connectorConfiguration.connector,
    connector: connectorConfiguration.connector,
    actions: (
      <Button
        type="button"
        variant="secondary"
        onClick={() => onEdit(connectorConfiguration)}
      >
        Edit
      </Button>
    ),
  };
}

export function ConnectorConfigurationsScreen(): JSX.Element {
  const { connectorConfigurations, isLoading, isError, refetch } = useConnectorConfigurations();
  const [formTarget, setFormTarget] = useState<ConnectorConfigurationFormTarget | null>(null);

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
        rows={connectorConfigurations.map((connectorConfiguration) =>
          toRow(connectorConfiguration, (target) =>
            setFormTarget({ mode: "edit", connectorConfiguration: target }),
          ),
        )}
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
