import type { JSX } from "react";
import { Button } from "@tui/ui/button";
import { Input } from "@tui/ui/input";
import { Label } from "@tui/ui/label";
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
import type { CaseDeleteControlState } from "../services/case-delete-confirmation";

const CASE_DELETE_DIALOG_DESCRIPTION =
  "This removes the case together with every hypothesis referencing it, every hypothesis-revision of those hypotheses and every collect those revisions hold. This cannot be undone.";

export type CaseDeleteDialogProps = {
  readonly control: CaseDeleteControlState;
};

export function CaseDeleteDialog({ control }: CaseDeleteDialogProps): JSX.Element {
  return (
    <Dialog open={control.isOpen} onOpenChange={control.onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          Delete case
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this case?</DialogTitle>
        </DialogHeader>
        <DialogDescription>{CASE_DELETE_DIALOG_DESCRIPTION}</DialogDescription>
        <Label className="flex flex-col gap-1">
          <span>Type {control.slug} to confirm</span>
          <div className="normal-case tracking-normal font-normal text-foreground">
            <Input
              value={control.slugConfirmation}
              onChange={(event) => control.onSlugConfirmationChange(event.target.value)}
              aria-invalid={control.errorMessage !== null}
              aria-describedby={control.errorMessage !== null ? "case-delete-error" : undefined}
            />
          </div>
        </Label>
        {control.errorMessage !== null && (
          <p id="case-delete-error" role="alert" className="text-sm text-destructive">
            {control.errorMessage}
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={control.isDeleting}>
              Keep case
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            loading={control.isDeleting}
            disabled={!control.isConfirmEnabled || control.isDeleting}
            onClick={control.onConfirm}
          >
            Delete case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
