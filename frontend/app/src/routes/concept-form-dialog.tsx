import type { JSX } from "react";
import { Button } from "@tui/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@tui/ui/dialog";
import { useConceptForm, type ConceptFormTarget } from "../hooks/use-concept-form";
import { ConceptFormFields } from "./concept-form-fields";

export type ConceptFormDialogProps = {
  readonly target: ConceptFormTarget;
  readonly onClose: () => void;
};

export function ConceptFormDialog({ target, onClose }: ConceptFormDialogProps): JSX.Element {
  const state = useConceptForm(target.mode === "edit" ? target.concept : null, onClose);

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
            {target.mode === "edit" ? `Edit concept "${target.concept.name}"` : "New concept"}
          </DialogTitle>
        </DialogHeader>
        {state.phase === "loading" && <p>Loading…</p>}
        {state.phase === "load-error" && (

          <section>
            <p>Unable to load subject types.</p>
            <Button type="button" onClick={state.retryLoad}>
              Retry
            </Button>
          </section>
        )}
        {state.phase === "ready" && (
          <ConceptFormFields
            form={state.form}
            subjectTypeOptions={state.subjectTypeOptions}
            isEditingName={state.isEditingName}
            isSubmitting={state.isSubmitting}
            onSubmit={state.onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
