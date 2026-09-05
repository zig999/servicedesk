import type { JSX } from "react";
import { Label } from "@tui/ui/label";
import { Input } from "@tui/ui/input";
import { Select } from "@tui/ui/select";
import { Button } from "@tui/ui/button";
import type { TestConnectorPanelState } from "../hooks/use-test-connector-panel";

export type ConnectorTestPanelFieldsProps = {
  readonly state: TestConnectorPanelState;
};

export function ConnectorTestPanelFields({ state }: ConnectorTestPanelFieldsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
          <pre className="rounded-md border border-border bg-muted p-3 text-sm font-mono whitespace-pre-wrap break-words">{formatSchemaForDisplay(state.selectedCapability.input_schema)}</pre>
        </div>
      )}

      <div className="flex flex-col gap-3 min-w-0">
        {state.attributes.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_1fr_auto]"
          >
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
        <Button
          type="button"
          onClick={state.onTest}
          disabled={!state.canTest || state.testOutcome.kind === "pending"}
        >
          Test
        </Button>
      </div>
    </div>
  );
}

function formatSchemaForDisplay(schema: string): string {
  try {
    return JSON.stringify(JSON.parse(schema), null, 2);
  } catch {
    return schema;
  }
}
