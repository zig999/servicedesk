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
} from "@tui/ui/dialog";
import type { GlossaryConcept } from "../hooks/use-glossary-concepts";

const CONCEPT_REMOVAL_DEFAULT_TITLE = "Remove concept?";
const CONCEPT_REMOVAL_DESCRIPTION =
  "This removes the concept's registration from the glossary.";
const CONCEPT_REMOVAL_CANCEL_BUTTON = "Cancel";
const CONCEPT_REMOVAL_CONFIRM_BUTTON = "Remove";

export type ConceptRemovalConfirmationDialogProps = {
  readonly concept: GlossaryConcept | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly onConfirm: () => void;
};

export function ConceptRemovalConfirmationDialog({
  concept,
  onOpenChange,
  onConfirm,
}: ConceptRemovalConfirmationDialogProps): JSX.Element {
  return (
    <Dialog open={concept !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {concept !== null ? `Remove concept "${concept.name}"?` : CONCEPT_REMOVAL_DEFAULT_TITLE}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>{CONCEPT_REMOVAL_DESCRIPTION}</DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {CONCEPT_REMOVAL_CANCEL_BUTTON}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" variant="destructive" onClick={onConfirm}>
              {CONCEPT_REMOVAL_CONFIRM_BUTTON}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
