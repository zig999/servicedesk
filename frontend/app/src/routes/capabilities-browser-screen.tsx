import { useState, type JSX } from "react";
import { Button } from "@tui/ui/button";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import { useCapabilities, type Capability } from "../hooks/use-capabilities";
import type { CapabilityFormTarget } from "../hooks/use-capability-form";
import { CapabilityFormDialog } from "./capability-form-dialog";

/**
 * The Capabilities Browser screen (task/glossary-and-capabilities-browser/
 * capabilities-browser-screen, the scope's section 2.9): every capability
 * GET /v1/capabilities returns, one row each.
 *
 * task/capability-authoring/capability-create-edit-form widens this screen
 * from read-only to one that also creates and edits a capability
 * (contracts/integration/capability-registry's own register-capability
 * operation, PUT /v1/capabilities/{name}/{version}) -- criterion 2 replaces
 * this screen's own original row-selection detail panel
 * (CapabilityDetailPanel, this screen's own prior delivery) with the same
 * create/edit form (criterion 1's "New capability" action, criterion 2's
 * per-row "Edit" action) pre-filled from that row's own already-loaded
 * data, so selecting a row still issues no second network request -- the
 * one property that panel's own header comment named as this screen's own
 * inference, kept true here the same way: every field the form edits
 * (criterion 1's full field list) is already present on the row
 * useCapabilities returned.
 *
 * Mirrors glossary-browser-screen.tsx's own ConceptsPanel composition
 * exactly: both actions open one shared Dialog, parametrized by
 * `formTarget`'s own nullable-identity shape (CapabilityFormTarget: `null`
 * closed, `{ mode: "create" }`, or `{ mode: "edit", capability }`) rather
 * than each action owning its own trigger-adjacent Dialog.
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
  { key: "actions", header: "" },
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
 * `onEdit` renders as this row's own "Edit" action cell (criterion 2),
 * a plain Button element -- the same convention
 * glossary-browser-screen.tsx's own toConceptRow already established for a
 * cell holding a caller-composed action rather than plain text
 * (status-table.tsx's own renderCellContent renders such a value exactly
 * as given).
 */
function toRow(capability: Capability, onEdit: (capability: Capability) => void): StatusTableRow {
  return {
    id: capabilityKey(capability),
    name: capability.name,
    version: capability.version,
    nature: capability.nature,
    connector: capability.connector,
    concept: capability.concept,
    timeout: formatTimeout(capability.timeout),
    actions: (
      <Button type="button" variant="secondary" onClick={() => onEdit(capability)}>
        Edit
      </Button>
    ),
  };
}

export function CapabilitiesBrowserScreen(): JSX.Element {
  const { capabilities, isLoading, isError, refetch } = useCapabilities();
  const [formTarget, setFormTarget] = useState<CapabilityFormTarget | null>(null);

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
        rows={capabilities.map((capability) =>
          toRow(capability, (target) => setFormTarget({ mode: "edit", capability: target })),
        )}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Capabilities</h1>
        {/*
          "New capability" renders unconditionally, ahead of the
          loading/error/empty branches above, so criterion 1 holds
          regardless of whichever of those three states the capability list
          itself is currently in -- this screen's own inference, disclosed
          in its delivery record, mirroring glossary-browser-screen.tsx's
          own "New concept" action for the same reason: hiding a create
          action behind an unrelated read failure would block authoring a
          capability for a reason that has nothing to do with it.
        */}
        <Button type="button" onClick={() => setFormTarget({ mode: "create" })}>
          New capability
        </Button>
      </div>
      {renderBody()}
      {formTarget !== null && (
        <CapabilityFormDialog target={formTarget} onClose={() => setFormTarget(null)} />
      )}
    </div>
  );
}
