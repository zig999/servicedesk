import type { JSX } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@tui/ui/dialog";
import {
  useConnectorConfigurationForm,
  type ConnectorConfigurationFormTarget,
} from "../hooks/use-connector-configuration-form";
import { ConnectorConfigurationFormFields } from "./connector-configuration-form-fields";
import { ConnectorTestPanel } from "./connector-test-panel";

/**
 * The Connector Configuration create/edit form's own Dialog
 * (task/connector-configuration-authoring/connector-configuration-create-edit-form),
 * composed over useConnectorConfigurationForm the same way
 * capability-form-dialog.tsx composes its own sibling over
 * useCapabilityForm -- entirely controlled from the caller's own state
 * (`target`, `onClose`) rather than a DialogTrigger, since this Dialog is
 * opened from two distinct actions (the Connector Configurations screen's
 * own "New connector configuration" button, criterion 2, and each row's own
 * "Edit" action, criterion 3) that share one form rather than each owning
 * its own trigger-adjacent Dialog.
 *
 * `target` selects which mode useConnectorConfigurationForm runs in
 * (create/`null`, or edit/the connector configuration being edited) --
 * connector-configurations-screen.tsx renders this component only while a
 * target is set, so this file's own body assumes one is always present.
 * Unlike capability-form-dialog.tsx, this form needs no loading/load-error
 * phase of its own: it reads no dependent vocabulary, so
 * useConnectorConfigurationForm always returns a ready state.
 *
 * In edit mode this Dialog also renders ConnectorTestPanel
 * (task/connector-configuration-authoring/test-connector-debug-panel),
 * scoped to `target.connectorConfiguration.connector` -- a debug-style Test
 * section reached from this same screen, cut apart from this create/edit
 * task because issuing a live diagnostic call and rendering raw transport
 * detail is a distinct falsifiable outcome from persisting a configuration.
 * Never rendered in create mode: nothing yet names the connector being
 * created as its own, so there is no registered capability to test through
 * yet (rules/integration/a-connector-configuration-is-tested-through-a-registered-capability).
 */

export type ConnectorConfigurationFormDialogProps = {
  readonly target: ConnectorConfigurationFormTarget;
  readonly onClose: () => void;
};

export function ConnectorConfigurationFormDialog({
  target,
  onClose,
}: ConnectorConfigurationFormDialogProps): JSX.Element {
  const state = useConnectorConfigurationForm(
    target.mode === "edit" ? target.connectorConfiguration : null,
    onClose,
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {target.mode === "edit"
              ? `Edit connector configuration "${target.connectorConfiguration.connector}"`
              : "New connector configuration"}
          </DialogTitle>
        </DialogHeader>
        <ConnectorConfigurationFormFields
          form={state.form}
          configuration={state.configuration}
          isEditingIdentity={state.isEditingIdentity}
          isSubmitting={state.isSubmitting}
          onSubmit={state.onSubmit}
        />
        {target.mode === "edit" && (
          <ConnectorTestPanel connector={target.connectorConfiguration.connector} />
        )}
      </DialogContent>
    </Dialog>
  );
}
