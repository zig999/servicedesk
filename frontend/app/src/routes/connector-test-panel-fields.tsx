import type { JSX } from "react";
import { Label } from "@tui/ui/label";
import { Input } from "@tui/ui/input";
import { Select } from "@tui/ui/select";
import { Button } from "@tui/ui/button";
import { JsonTextareaField } from "../shared/components/json-textarea-field";
import type { TestConnectorPanelState } from "../hooks/use-test-connector-panel";

/**
 * The Test section's own inputs
 * (task/connector-configuration-authoring/test-connector-debug-panel): the
 * capability picker scoped to this connector configuration (criterion 1),
 * the subject assembled by hand -- a type plus typed attribute-value pairs,
 * no list of existing subjects offered (criterion 2) -- and the sample
 * input edited through the shared JSON beautify/minify textarea, captioned
 * with the chosen capability's own input_schema shown read-only alongside
 * it (criterion 3). Presentation only: every value and handler comes from
 * useTestConnectorPanel (ARC-02/ARC-03).
 *
 * The Select fields wrap their own Label rather than using htmlFor/id --
 * this app's own established convention, since TUI's Select only spreads
 * caller props onto its outer wrapper and not its inner interactive element
 * (case-version-editor-form-fields.tsx). Every other field here (a plain
 * Input) keeps the ordinary htmlFor/id linkage.
 */

export type ConnectorTestPanelFieldsProps = {
  readonly state: TestConnectorPanelState;
};

export function ConnectorTestPanelFields({ state }: ConnectorTestPanelFieldsProps): JSX.Element {
  return (
    <div>
      <Label>
        Capability
        <Select
          options={state.capabilityOptions}
          value={state.selectedCapabilityKey ?? ""}
          onChange={state.onSelectCapability}
        />
      </Label>
      {state.isLoadingCapabilities && <p>Loading registered capabilities…</p>}
      {state.isCapabilitiesError && (
        <p role="alert">Could not load the capabilities registered with this connector.</p>
      )}

      {state.selectedCapability !== undefined && (
        <div>
          <p>Input schema (reference)</p>
          <pre>{formatSchemaForDisplay(state.selectedCapability.input_schema)}</pre>
        </div>
      )}

      <Label>
        Subject type
        <Select
          options={state.subjectTypeOptions}
          value={state.subjectType}
          onChange={state.onSubjectTypeChange}
        />
      </Label>

      <div>
        {state.attributes.map((row) => (
          <div key={row.id}>
            <Label htmlFor={`${row.id}-attribute`}>Attribute</Label>
            <Input
              id={`${row.id}-attribute`}
              value={row.attribute}
              onChange={(event) =>
                state.onAttributeChange(row.id, "attribute", event.target.value)
              }
            />
            <Label htmlFor={`${row.id}-value`}>Value</Label>
            <Input
              id={`${row.id}-value`}
              value={row.value}
              onChange={(event) => state.onAttributeChange(row.id, "value", event.target.value)}
            />
            <Button type="button" onClick={() => state.onRemoveAttribute(row.id)}>
              Remove attribute
            </Button>
          </div>
        ))}
        <Button type="button" onClick={state.onAddAttribute}>
          Add attribute
        </Button>
      </div>

      <Label htmlFor="test-connector-requester">Requester</Label>
      <Input
        id="test-connector-requester"
        value={state.requester}
        onChange={(event) => state.onRequesterChange(event.target.value)}
      />

      <JsonTextareaField
        id="test-connector-sample-input"
        label="Sample input"
        value={state.sampleInput}
        onChange={state.onSampleInputChange}
      />

      <Button type="button" onClick={state.onTest} disabled={!state.canTest || state.isTesting}>
        Test
      </Button>
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
