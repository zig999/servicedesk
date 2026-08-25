import type { JSX } from "react";
import { Button } from "@tui/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tui/ui/dialog";
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
 *
 * Discard now opens a confirmation Dialog first
 * (task/detail-screen-corrections/discard-confirmation-dialog), reusing
 * @tui/ui/dialog's own primitives composed directly here -- the same
 * Dialog/DialogTrigger/DialogContent/DialogHeader/DialogTitle/
 * DialogDescription/DialogFooter/DialogClose set case-version-editor-
 * ready-view.tsx's own Release dialog already composes, in that dialog's
 * plain two-button shape (its own Discard dialog additionally requires
 * typing the case's slug, a heavier precedent this task's own criterion 7
 * explicitly says not to follow). Uncontrolled (no `open`/`onOpenChange`
 * state on `Dialog` itself, unlike Release's): state.onDiscard is a
 * synchronous form-state reset with no loading state, no server round trip
 * and no failure branch to keep the dialog open over (unlike Release's
 * checklist/violations or Discard's typed-slug validation), so the confirm
 * button is wrapped in its own DialogClose the same way the Cancel button
 * is -- clicking it both calls state.onDiscard and dismisses the dialog,
 * and there is nothing left for controlled state to coordinate. Disclosed
 * as this task's own inference in its delivery record. The trigger keeps
 * the same disabled condition the un-confirmed Button carried
 * (!state.isDirty || state.isSubmitting), per this task's own criterion 3
 * intent: nothing to discard, or a save in flight, still disables opening
 * the dialog the same way it always disabled the action itself.
 */

const INVALID_CONFIGURATION_WARNING =
  "This connector configuration's stored value is not valid JSON. Correct it before Save can succeed.";

const DISCARD_DIALOG_DESCRIPTION =
  "Every unsaved change to this connector configuration will be lost. This cannot be undone.";

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
          Confirmed through a Dialog before it runs -- this file's own
          header comment above.
        */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              disabled={!state.isDirty || state.isSubmitting}
            >
              Discard changes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Discard changes?</DialogTitle>
            </DialogHeader>
            <DialogDescription>{DISCARD_DIALOG_DESCRIPTION}</DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Keep editing
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="button" variant="destructive" onClick={state.onDiscard}>
                  Discard changes
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
