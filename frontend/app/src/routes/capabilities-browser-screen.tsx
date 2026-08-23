import { useState, type JSX } from "react";
import { Panel } from "@tui/ui/panel";
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
 * GET /v1/capabilities returns, one row each, and a client-side
 * row-selection detail panel showing that same row's own full contract.
 *
 * StatusTable's own onRowClick composes this screen's row-selection
 * interaction (this codebase's first click-row/detail-panel-below
 * composition -- every existing onRowClick consumer instead navigates to
 * another route, per this app's own inventory). Selecting a row never
 * issues a second network request: GET /v1/capabilities/:concept looks up
 * by *concept* name, not capability name, and this task's own criterion 5
 * forbids issuing it at all -- the row already loaded (via useCapabilities)
 * carries every field the detail panel shows, so selection is pure
 * client-side state (`selectedKey`), derived against the already-fetched
 * list rather than a second fetch.
 *
 * Wired in as route-tree.tsx's "/capabilities" route's own `component`,
 * replacing CapabilitiesPlaceholder (left in place, unused, in
 * route-placeholders.tsx -- that file's own established precedent for this
 * exact kind of change).
 */

const COLUMNS: StatusTableColumn[] = [
  { key: "name", header: "Name" },
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
 * convention) and, doubling as this screen's selection key, is what a
 * click's row-selection matches against rather than name alone -- this
 * screen's own inference, disclosed in its delivery record, since no
 * criterion states what identifies one row among several sharing a name.
 */
function capabilityKey(capability: Capability): string {
  return `${capability.name}::${capability.version}`;
}

function toRow(capability: Capability): StatusTableRow {
  return {
    id: capabilityKey(capability),
    name: capability.name,
    nature: capability.nature,
    connector: capability.connector,
    concept: capability.concept,
    timeout: formatTimeout(capability.timeout),
  };
}

/**
 * The detail panel for one selected capability: its own version,
 * input_schema and output_schema, exactly as GET /v1/capabilities already
 * returned them -- no field this app derives or re-labels.
 */
function CapabilityDetailPanel({
  capability,
}: {
  readonly capability: Capability;
}): JSX.Element {
  return (
    <Panel title={capability.name}>
      <dl className="flex flex-col gap-2 text-sm text-foreground">
        <div>
          <dt className="font-medium">Version</dt>
          <dd>{capability.version}</dd>
        </div>
        <div>
          <dt className="font-medium">Input schema</dt>
          <dd>{capability.input_schema}</dd>
        </div>
        <div>
          <dt className="font-medium">Output schema</dt>
          <dd>{capability.output_schema}</dd>
        </div>
      </dl>
    </Panel>
  );
}

export function CapabilitiesBrowserScreen(): JSX.Element {
  const { capabilities, isLoading, isError, refetch } = useCapabilities();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  function handleRowClick(row: StatusTableRow): void {
    const key = row.id;
    if (typeof key !== "string") {
      return;
    }
    setSelectedKey(key);
  }

  if (isLoading) {
    return <p>Loading capabilities…</p>;
  }

  if (isError) {
    // GET /v1/capabilities throws no domain error error-ui-state.ts names
    // (this app's own inventory), so a load failure falls through to this
    // screen's own generic fallback -- the same convention cases-list-screen
    // and case-detail-screen's VersionsPanel already keep for their own
    // listing reads. EDG-02 still asks for an explicit retry action rather
    // than only useCapabilities' own toast-triggering error state, matching
    // glossary-browser-screen.tsx's own convention for a hook that already
    // wraps its refetch in a void-returning function: passed to onClick
    // directly, with no extra wrapper here.
    return (
      <section>
        <p>Capabilities could not be loaded.</p>
        <Button type="button" onClick={refetch}>
          Retry
        </Button>
      </section>
    );
  }

  const hasNoCapabilities = capabilities.length === 0;
  const selectedCapability = capabilities.find(
    (capability) => capabilityKey(capability) === selectedKey,
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-foreground">Capabilities</h1>
      {hasNoCapabilities ? (
        <p>No capabilities are currently registered.</p>
      ) : (
        <StatusTable
          columns={COLUMNS}
          rows={capabilities.map(toRow)}
          onRowClick={handleRowClick}
        />
      )}
      {/*
        ACC-07: the detail panel mounts with no page navigation when a row is
        clicked, so its own appearance is announced through aria-live rather
        than left to a sighted user's own glance at the page -- the smaller,
        more idiomatic fix here since this component is a plain function with
        no existing ref/focus-management machinery to move focus through.
      */}
      <div aria-live="polite">
        {selectedCapability !== undefined && (
          <CapabilityDetailPanel capability={selectedCapability} />
        )}
      </div>
    </div>
  );
}
