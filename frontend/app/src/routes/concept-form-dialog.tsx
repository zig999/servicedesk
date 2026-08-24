import type { JSX } from "react";
import { Button } from "@tui/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@tui/ui/dialog";
import { useConceptForm, type ConceptFormTarget } from "../hooks/use-concept-form";
import { ConceptFormFields } from "./concept-form-fields";

/**
 * The Concept create/edit form's own Dialog
 * (task/concept-authoring/concept-create-edit-form), composed over
 * useConceptForm the same way case-version-editor-ready-view.tsx composes
 * its own Release/Discard Dialogs over @tui/ui/dialog -- entirely controlled
 * from the caller's own state (`target`, `onClose`) rather than a
 * DialogTrigger, since this Dialog is opened from two distinct actions (the
 * Concepts tab's own "New concept" button, and each row's own "Edit" action)
 * that share one form rather than each owning its own trigger-adjacent
 * Dialog.
 *
 * `target` selects which mode useConceptForm runs in (create/`null`, or
 * edit/the concept being edited) -- glossary-browser-screen.tsx's own
 * ConceptsPanel renders this component only while a target is set, so this
 * file's own body assumes one is always present.
 */

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
          // EDG-02, the same convention every load failure in this app keeps
          // (glossary-browser-screen.tsx's own ConceptsPanel/VocabularyPanel):
          // a typed error state with an explicit retry, rather than an
          // indefinite loading state or a blank Dialog.
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
