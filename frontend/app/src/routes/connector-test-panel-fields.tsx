import type { JSX } from "react";
import { Label } from "@tui/ui/label";
import { Input } from "@tui/ui/input";
import { Select } from "@tui/ui/select";
import { Button } from "@tui/ui/button";
import type { TestConnectorPanelState } from "../hooks/use-test-connector-panel";

/**
 * The Test section's own inputs
 * (task/connector-configuration-authoring/test-connector-debug-panel): the
 * capability picker scoped to this connector configuration (criterion 1),
 * the subject assembled by hand -- a type plus typed attribute-value pairs,
 * no list of existing subjects offered (criterion 2) -- and the chosen
 * capability's own input_schema shown read-only alongside it. Presentation
 * only: every value and handler comes from useTestConnectorPanel
 * (ARC-02/ARC-03).
 *
 * The Select fields wrap their own Label rather than using htmlFor/id --
 * this app's own established convention, since TUI's Select only spreads
 * caller props onto its outer wrapper and not its inner interactive element
 * (case-version-editor-form-fields.tsx). Every other field here (a plain
 * Input) keeps the ordinary htmlFor/id linkage.
 *
 * Each attribute row's own Attribute field is `disabled readOnly` (task/
 * connector-test-panel-attribute-readonly/make-attribute-field-readonly),
 * carrying no onChange at all -- the same fixed-value convention this app
 * already established for a derived field on hypothesis-revision-form-
 * fields.tsx (its own Subject type field). The name it displays is exactly
 * the one useTestConnectorPanel's own onAddAttribute reconciliation already
 * derived from Configuration's `${subject:<attribute-name>}` placeholders
 * (rules/integration/an-http-connector-configuration-declares-its-call's
 * own placeholder clause); the operator can no longer type over it, only
 * remove the row (onRemoveAttribute) or edit its Value.
 */

export type ConnectorTestPanelFieldsProps = {
  readonly state: TestConnectorPanelState;
};

export function ConnectorTestPanelFields({ state }: ConnectorTestPanelFieldsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <Label className="flex flex-col gap-1">
          Capability
          <Select
            options={state.capabilityOptions}
            value={state.selectedCapabilityKey ?? ""}
            onChange={state.onSelectCapability}
          />
        </Label>

        <Label className="flex flex-col gap-1">
          Subject type
          <Select
            options={state.subjectTypeOptions}
            value={state.subjectType}
            onChange={state.onSubjectTypeChange}
          />
        </Label>

        <div className="flex flex-col gap-1">
          <Label htmlFor="test-connector-requester">Requester</Label>
          <Input
            id="test-connector-requester"
            value={state.requester}
            onChange={(event) => state.onRequesterChange(event.target.value)}
          />
        </div>
      </div>

      {state.isLoadingCapabilities && <p>Loading registered capabilities…</p>}
      {state.isCapabilitiesError && (
        <p role="alert" className="text-sm text-destructive">Could not load the capabilities registered with this connector.</p>
      )}

      {state.selectedCapability !== undefined && (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Input schema (reference)</p>
          <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono overflow-x-auto">{formatSchemaForDisplay(state.selectedCapability.input_schema)}</pre>
        </div>
      )}

      <div className="flex flex-col gap-3 min-w-0">
        {state.attributes.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${row.id}-attribute`}>Attribute</Label>
              <Input id={`${row.id}-attribute`} value={row.attribute} disabled readOnly />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${row.id}-value`}>Value</Label>
              <Input
                id={`${row.id}-value`}
                value={row.value}
                onChange={(event) => state.onAttributeChange(row.id, "value", event.target.value)}
              />
            </div>
            <Button type="button" variant="secondary" onClick={() => state.onRemoveAttribute(row.id)}>
              Remove attribute
            </Button>
          </div>
        ))}
        <div>
          <Button type="button" variant="secondary" onClick={state.onAddAttribute}>
            Add attribute
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={state.onTest} disabled={!state.canTest || state.isTesting}>
          Test
        </Button>
      </div>
    </div>
  );
}

/** The chosen capability's own input_schema, pretty-printed for read-only reference; falls back to the raw stored text if it somehow does not parse as JSON. */
function formatSchemaForDisplay(schema: string): string {
  try {
    return JSON.stringify(JSON.parse(schema), null, 2);
  } catch {
    return schema;
  }
}
