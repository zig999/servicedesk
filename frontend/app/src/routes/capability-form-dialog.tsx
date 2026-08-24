import type { JSX } from "react";
import { Button } from "@tui/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@tui/ui/dialog";
import { useCapabilityForm, type CapabilityFormTarget } from "../hooks/use-capability-form";
import { CapabilityFormFields } from "./capability-form-fields";

/**
 * The Capability create/edit form's own Dialog
 * (task/capability-authoring/capability-create-edit-form), composed over
 * useCapabilityForm the same way concept-form-dialog.tsx composes its own
 * sibling over useConceptForm -- entirely controlled from the caller's own
 * state (`target`, `onClose`) rather than a DialogTrigger, since this
 * Dialog is opened from two distinct actions (the Capabilities Browser
 * screen's own "New capability" button, criterion 1, and each row's own
 * "Edit" action, criterion 2) that share one form rather than each owning
 * its own trigger-adjacent Dialog.
 *
 * `target` selects which mode useCapabilityForm runs in (create/`null`, or
 * edit/the capability being edited) -- capabilities-browser-screen.tsx
 * renders this component only while a target is set, so this file's own
 * body assumes one is always present.
 */

export type CapabilityFormDialogProps = {
  readonly target: CapabilityFormTarget;
  readonly onClose: () => void;
};

export function CapabilityFormDialog({
  target,
  onClose,
}: CapabilityFormDialogProps): JSX.Element {
  const state = useCapabilityForm(target.mode === "edit" ? target.capability : null, onClose);

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
              ? `Edit capability "${target.capability.name}"`
              : "New capability"}
          </DialogTitle>
        </DialogHeader>
        {state.phase === "loading" && <p>Loading…</p>}
        {state.phase === "load-error" && (
          // EDG-02, the same convention every load failure in this app
          // keeps (concept-form-dialog.tsx's own equivalent branch): a
          // typed error state with an explicit retry, rather than an
          // indefinite loading state or a blank Dialog.
          <section>
            <p>Unable to load concepts.</p>
            <Button type="button" onClick={state.retryLoad}>
              Retry
            </Button>
          </section>
        )}
        {state.phase === "ready" && (
          <CapabilityFormFields
            form={state.form}
            conceptOptions={state.conceptOptions}
            inputSchema={state.inputSchema}
            outputSchema={state.outputSchema}
            isEditingIdentity={state.isEditingIdentity}
            isSubmitting={state.isSubmitting}
            onSubmit={state.onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
