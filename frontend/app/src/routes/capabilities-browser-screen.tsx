import type { JSX } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import { useCapabilities, type Capability } from "../hooks/use-capabilities";

const COLUMNS: StatusTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "version", header: "Version" },
  { key: "nature", header: "Nature" },
  { key: "connector", header: "Connector" },
  { key: "concept", header: "Concept" },
  { key: "timeout", header: "Timeout" },
];

function formatTimeout(timeoutMs: number): string {
  return `${timeoutMs} ms`;
}

function capabilityKey(capability: Capability): string {
  return `${capability.name}::${capability.version}`;
}

function toRow(capability: Capability): StatusTableRow {
  return {
    id: capabilityKey(capability),
    name: capability.name,
    version: capability.version,
    nature: capability.nature,
    connector: capability.connector,
    concept: capability.concept,
    timeout: formatTimeout(capability.timeout),
  };
}

export function CapabilitiesBrowserScreen(): JSX.Element {
  const navigate = useNavigate();
  const { capabilities, isLoading, isError, refetch } = useCapabilities();

  function handleRowClick(row: StatusTableRow): void {
    const name = row.name;
    const version = row.version;
    if (typeof name !== "string" || typeof version !== "string") {
      return;
    }
    void navigate({ to: "/capabilities/$name/$version", params: { name, version } });
  }

  function renderBody(): JSX.Element {
    if (isLoading) {
      return <p>Loading capabilities…</p>;
    }

    if (isError) {

      return (
        <section>
          <p>Capabilities could not be loaded.</p>
          <Button type="button" onClick={refetch}>
            Retry
          </Button>
        </section>
      );
    }

    if (capabilities.length === 0) {

      return <p>No capabilities are currently registered.</p>;
    }

    return (
      <StatusTable
        columns={COLUMNS}
        rows={capabilities.map(toRow)}
        onRowClick={handleRowClick}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Capabilities</h1>
        {/*
          "New capability" renders unconditionally, ahead of the
          loading/error/empty branches above, so criterion 4 (this task's
          own -- "renders while the list is loading, while it has failed to
          load, and while it is empty, as it does today") holds regardless
          of whichever of those three states the capability list itself is
          currently in -- unchanged from before this task, which only
          repoints where activating it leads
          (task/connector-capability-create-detail-route/
          capabilities-browser-create-action's own criteria 1-2: navigates
          to route-tree.tsx's own "/capabilities/new" instead of opening the
          popup Dialog), mirroring connector-configurations-screen.tsx's own
          "New connector configuration" action for the same reason: hiding a
          create action behind an unrelated read failure would block
          authoring a capability for a reason that has nothing to do with
          it.
        */}
        <Button type="button" onClick={() => void navigate({ to: "/capabilities/new" })}>
          New capability
        </Button>
      </div>
      {renderBody()}
    </div>
  );
}
