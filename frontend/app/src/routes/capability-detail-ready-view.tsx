import type { JSX } from "react";
import { Button } from "@tui/ui/button";
import { CapabilityFormFields } from "./capability-form-fields";
import type { CapabilityDetailViewState } from "../hooks/use-capability-detail-view";

/**
 * The capability detail route's own "ready" phase markup
 * (task/connector-capability-detail-editing/capability-detail-route),
 * factored out of capability-detail-screen.tsx the same way
 * connector-configuration-detail-ready-view.tsx is factored out of
 * connector-configuration-detail-screen.tsx.
 *
 * CapabilityFormFields (criterion 6) is composed exactly as
 * capability-form-dialog.tsx already composes it -- `form`, `conceptOptions`,
 * `inputSchema`, `outputSchema`, `isSubmitting`, `onSubmit` unchanged,
 * `isEditingIdentity` always true (this route never offers create mode; see
 * use-capability-detail.ts's own header comment), plus the one new optional
 * `isDirty` prop that file's own header comment now documents (criterion
 * 4).
 *
 * The two invalid-JSON warnings below (criterion 8) sit above the fields,
 * distinct from JsonTextareaField's own inline "Invalid JSON: <message>"
 * text beside each textarea itself (json-textarea-field.tsx's own header
 * comment, confirmed already covers the parse-error display) -- this is
 * this task's own additional, plain wording naming the consequence
 * (rules/integration/a-capability-declares-well-formed-schemas: the
 * registry refuses to register or update a capability whose schema is not
 * syntactically valid JSON) rather than only the parser's own message,
 * since no criterion or node states this exact wording and no such banner
 * exists anywhere else in this app to reuse -- mirroring
 * connector-configuration-detail-ready-view.tsx's own identical
 * INVALID_CONFIGURATION_WARNING for the identical reason, one warning each
 * for input_schema and output_schema since a capability declares two
 * schemas rather than the connector configuration's one field. Disclosed as
 * this task's own inference in its delivery record.
 */

const INVALID_INPUT_SCHEMA_WARNING =
  "This capability's stored input schema is not valid JSON. Correct it before Save can succeed.";
const INVALID_OUTPUT_SCHEMA_WARNING =
  "This capability's stored output schema is not valid JSON. Correct it before Save can succeed.";

export type CapabilityDetailReadyViewProps = {
  readonly state: Extract<CapabilityDetailViewState, { phase: "ready" }>;
};

export function CapabilityDetailReadyView({
  state,
}: CapabilityDetailReadyViewProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      {!state.inputSchema.isValid && (
        <p role="alert" className="text-sm text-destructive">
          {INVALID_INPUT_SCHEMA_WARNING}
        </p>
      )}
      {!state.outputSchema.isValid && (
        <p role="alert" className="text-sm text-destructive">
          {INVALID_OUTPUT_SCHEMA_WARNING}
        </p>
      )}
      <CapabilityFormFields
        form={state.form}
        conceptOptions={state.conceptOptions}
        inputSchema={state.inputSchema}
        outputSchema={state.outputSchema}
        isEditingIdentity
        isSubmitting={state.isSubmitting}
        onSubmit={state.onSubmit}
        isDirty={state.isDirty}
      />
      <div className="flex items-center gap-3">
        {/*
          Discard (criterion 5) resets every field, including both JSON
          schemas, back to the originally loaded (or most recently saved)
          values and re-disables Save -- use-capability-detail-view.ts's own
          header comment on how it derives what to reset back to. Disabled
          while there is nothing to discard or a save is already in flight,
          the same convention every other action in this app disables
          itself under (e.g. JsonTextareaField's own Beautify button,
          disabled while there is nothing valid to beautify).
        */}
        <Button
          type="button"
          variant="secondary"
          onClick={state.onDiscard}
          disabled={!state.isDirty || state.isSubmitting}
        >
          Discard changes
        </Button>
        {state.justSaved && (
          // criterion 7's success acknowledgement -- role="status" (an
          // implicit aria-live="polite" region) rather than a visual-only
          // message, so a screen-reader user is told the save landed
          // without needing to notice the text appear (ACC-07, mirroring
          // connector-configuration-detail-ready-view.tsx's own identical
          // use).
          <p role="status" className="text-sm text-foreground">
            Saved.
          </p>
        )}
      </div>
    </div>
  );
}
