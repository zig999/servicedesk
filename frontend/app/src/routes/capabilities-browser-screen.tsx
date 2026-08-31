import type { JSX } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import { useCapabilities, type Capability } from "../hooks/use-capabilities";

/**
 * The Capabilities Browser screen (task/glossary-and-capabilities-browser/
 * capabilities-browser-screen, the scope's section 2.9): every capability
 * GET /v1/capabilities returns, one row each.
 *
 * task/capability-authoring/capability-create-edit-form widened this screen
 * from read-only to one that also created and edited a capability
 * (contracts/integration/capability-registry's own register-capability
 * operation, PUT /v1/capabilities/{name}/{version}) -- replacing this
 * screen's own original row-selection detail panel (CapabilityDetailPanel)
 * with the shared create/edit form, opened either by the "New capability"
 * action or (at that task's own delivery) each row's own "Edit" action,
 * both parametrized by a `formTarget` state of a nullable-identity shape
 * (CapabilityFormTarget: `null` closed, `{ mode: "create" }`, or `{ mode:
 * "edit", capability }`).
 *
 * task/connector-capability-detail-editing/capability-detail-route
 * (criteria 2 and 9) replaced this screen's own former per-row "Edit"
 * action -- which opened that same Dialog in edit mode -- with a row click
 * that navigates to the routed detail/edit screen instead
 * (route-tree.tsx's own "/capabilities/$name/$version"), mirroring
 * connector-configurations-screen.tsx's own identical row-click convention
 * (StatusTable's own `onRowClick`, a plain function reading the clicked
 * row's own identity fields and calling `navigate`) rather than a second,
 * hand-rolled row-link pattern.
 *
 * task/connector-capability-create-detail-route/
 * capabilities-browser-create-action's own criteria: "New capability" now
 * navigates to the routed create screen (route-tree.tsx's own
 * "/capabilities/new", CapabilityCreateScreen) instead of opening the popup
 * Dialog's create mode -- this screen no longer holds a `formTarget` state
 * of its own to host that Dialog, and no longer imports either
 * CapabilityFormDialog or CapabilityFormTarget. The Dialog component and its
 * type are untouched: CapabilityFormTarget's `{ mode: "edit", ... }` variant,
 * and the Dialog itself, stay reachable for whatever still constructs them
 * (this task's own Notes: the Dialog's edit-mode branch is a separate
 * task's concern, not this one's), the same convention
 * connector-configurations-screen.tsx's own sibling task already
 * established for ConnectorConfigurationFormDialog /
 * ConnectorConfigurationFormTarget.
 *
 * Wired in as route-tree.tsx's "/capabilities" route's own `component`,
 * unchanged from this screen's own prior delivery -- only this file's own
 * body changed, not how it is reached.
 */

const COLUMNS: StatusTableColumn[] = [
  { key: "name", header: "Name" },
  { key: "version", header: "Version" },
  { key: "nature", header: "Nature" },
  { key: "connector", header: "Connector" },
  { key: "concept", header: "Concept" },
  { key: "timeout", header: "Timeout" },
];

/**
 * Formats a capability's own timeout (domain/integration/capability: "its
 * timeout is its own budget ... in milliseconds") with its declared unit --
 * this screen's own inference, disclosed in its delivery record, since no
 * criterion mandates a display format and the raw number alone would leave
 * the unit ambiguous to whoever reads it.
 */
function formatTimeout(timeoutMs: number): string {
  return `${timeoutMs} ms`;
}

/**
 * domain/integration/capability's own stated identity is "name and version"
 * together, never name alone -- the registry's contract does not guarantee
 * only one version of a given name is ever registered at once. This
 * composite is used as the row's own `id` (StatusTable's own row-key
 * convention) -- this screen's own inference, disclosed in its delivery
 * record, since no criterion states what identifies one row among several
 * sharing a name. `version` is also its own column now (this screen's own
 * inference too): the prior read-only delivery showed it only inside the
 * detail panel this task removes, and an operator opening the "Edit"
 * action still needs to see which version a row names before choosing it.
 */
function capabilityKey(capability: Capability): string {
  return `${capability.name}::${capability.version}`;
}

/**
 * `id` is the row's own composite identity (capabilityKey above); `name`
 * and `version` are also each their own column, read straight back out by
 * handleRowClick below rather than re-parsed from the composite id.
 */
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

  /**
   * Clicking a row navigates to that capability's own detail/edit route
   * (criterion 2) rather than opening the popup Dialog's edit mode
   * (criterion 9) -- the same `typeof ... !== "string"` guard
   * connector-configurations-screen.tsx's own handleRowClick already keeps
   * before trusting a StatusTableRow's untyped `Record<string, unknown>`
   * value.
   */
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
      // GET /v1/capabilities throws no domain error error-ui-state.ts
      // names (this app's own inventory), so a load failure falls through
      // to this screen's own generic fallback -- the same convention
      // cases-list-screen and case-detail-screen's VersionsPanel already
      // keep for their own listing reads. EDG-02 still asks for an
      // explicit retry action rather than only useCapabilities' own
      // toast-triggering error state, matching
      // glossary-browser-screen.tsx's own convention for a hook that
      // already wraps its refetch in a void-returning function: passed to
      // onClick directly, with no extra wrapper here.
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
      // API-04: an empty response renders its own explicit empty state,
      // never treated as still loading or as a failure.
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
