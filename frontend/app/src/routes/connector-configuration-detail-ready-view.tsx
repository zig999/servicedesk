import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
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

const INVALID_CONFIGURATION_WARNING =
  "This connector configuration's stored value must be a JSON object. Correct it before Save can succeed.";

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
      <ConnectorTestPanel
        connector={connector}
        configurationText={state.registeredConfigurationText}
      />
      <ConnectorConfigurationFormFields
        form={state.form}
        configuration={state.configuration}
        isEditingIdentity
        isSubmitting={state.isSubmitting}
        onSubmit={state.onSubmit}
        isDirty={state.isDirty}
        trailingActions={
          <>
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

              <p role="status" className="text-sm text-foreground">
                Saved.
              </p>
            )}
            <Button type="button" variant="secondary" onClick={state.onCancel}>
              Cancel
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/connectors">Connectors</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
