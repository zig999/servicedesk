import type { JSX } from "react";
import { Button } from "@tui/ui/button";
import { ConnectorConfigurationFormFields } from "./connector-configuration-form-fields";
import { ConnectorTestPanel } from "./connector-test-panel";
import type { ConnectorConfigurationDetailViewState } from "../hooks/use-connector-configuration-detail-view";

/**
 * The connector-configuration detail route's own "ready" phase markup
 * (task/connector-capability-detail-editing/connector-configuration-detail-route),
 * factored out of connector-configuration-detail-screen.tsx the same way
 * case-version-editor-ready-view.tsx is factored out of
 * case-version-editor-screen.tsx.
 *
 * ConnectorConfigurationFormFields (criterion 6) is composed exactly as
 * connector-configuration-form-dialog.tsx already composes it -- `form`,
 * `configuration`, `isSubmitting`, `onSubmit` unchanged, `isEditingIdentity`
 * always true (this route never offers create mode; see
 * use-connector-configuration-detail.ts's own header comment), plus the one
 * new optional `isDirty` prop that file's own header comment now documents
 * (criterion 4). ConnectorTestPanel (criterion 6) is composed unchanged,
 * scoped to this route's own `connector` identity, the same way
 * connector-configuration-form-dialog.tsx already scopes it in edit mode.
 *
 * The invalid-JSON warning below (criterion 8) sits above the fields,
 * distinct from JsonTextareaField's own inline "Invalid JSON: <message>"
 * text beside the textarea itself (json-textarea-field.tsx's own header
 * comment, confirmed already covers the parse-error display) -- this is
 * this task's own additional, plain wording naming the consequence
 * (rules/integration/a-connector-configuration-holds-a-well-formed-object:
 * the registry refuses to persist it) rather than only the parser's own
 * message, since no criterion or node states this exact wording and no
 * such banner exists anywhere else in this app to reuse. Disclosed as this
 * task's own inference in its delivery record.
 */

const INVALID_CONFIGURATION_WARNING =
  "This connector configuration's stored value is not valid JSON. Correct it before Save can succeed.";

export type ConnectorConfigurationDetailReadyViewProps = {
  readonly state: Extract<ConnectorConfigurationDetailViewState, { phase: "ready" }>;
  readonly connector: string;
};

export function ConnectorConfigurationDetailReadyView({
  state,
  connector,
}: ConnectorConfigurationDetailReadyViewProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      {!state.configuration.isValid && (
        <p role="alert" className="text-sm text-destructive">
          {INVALID_CONFIGURATION_WARNING}
        </p>
      )}
      <ConnectorConfigurationFormFields
        form={state.form}
        configuration={state.configuration}
        isEditingIdentity
        isSubmitting={state.isSubmitting}
        onSubmit={state.onSubmit}
        isDirty={state.isDirty}
      />
      <div className="flex items-center gap-3">
        {/*
          Discard (criterion 5) resets every field, including configuration,
          back to the originally loaded (or most recently saved) values and
          re-disables Save -- use-connector-configuration-detail-view.ts's
          own header comment on how it derives what to reset back to.
          Disabled while there is nothing to discard or a save is already
          in flight, the same convention every other action in this app
          disables itself under (e.g. JsonTextareaField's own Beautify
          button, disabled while there is nothing valid to beautify).
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
          // case-version-editor-ready-view.tsx's own role="alert" use for
          // content that changes without a navigation).
          <p role="status" className="text-sm text-foreground">
            Saved.
          </p>
        )}
      </div>
      <ConnectorTestPanel connector={connector} />
    </div>
  );
}
