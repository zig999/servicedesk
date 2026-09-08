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
import { CapabilityFormFields } from "./capability-form-fields";
import type { CapabilityDetailViewState } from "../hooks/use-capability-detail-view";

const INVALID_INPUT_SCHEMA_WARNING =
  "This capability's stored input schema is not valid JSON. Correct it before Save can succeed.";
const INVALID_OUTPUT_SCHEMA_WARNING =
  "This capability's stored output schema is not valid JSON. Correct it before Save can succeed.";

const DISCARD_DIALOG_DESCRIPTION =
  "Every unsaved change to this capability will be lost. This cannot be undone.";

export type CapabilityDetailReadyViewProps = {
  readonly state: Extract<CapabilityDetailViewState, { phase: "ready" }>;
};

export function CapabilityDetailReadyView({
  state,
}: CapabilityDetailReadyViewProps): JSX.Element {
  return (
    <div className="flex flex-1 flex-col gap-4">
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
              <Link to="/capabilities">Capabilities</Link>
            </Button>
          </>
        }
      />
    </div>
  );
}
