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
import type { DiscardControlState } from "../services/discard-confirmation";

const DISCARD_DIALOG_DESCRIPTION =
  "This case's own hypotheses keep their content — only this draft and its manifest are removed. This cannot be undone.";

export type DiscardDraftDialogProps = {
  readonly discard: DiscardControlState;
  readonly slug: string;
  readonly disabled: boolean;
};

export function DiscardDraftDialog({
  discard,
  slug,
  disabled,
}: DiscardDraftDialogProps): JSX.Element {
  return (
    <Dialog open={discard.isOpen} onOpenChange={discard.onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive" disabled={disabled}>
          Discard draft
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Discard this draft?</DialogTitle>
        </DialogHeader>
        <DialogDescription>{DISCARD_DIALOG_DESCRIPTION}</DialogDescription>
        <Label className="flex flex-col gap-1">
          <span>Type {slug} to confirm</span>
          <div className="normal-case tracking-normal font-normal text-foreground">
            <Input
              value={discard.slugConfirmation}
              onChange={(event) => discard.onSlugConfirmationChange(event.target.value)}
              aria-invalid={discard.errorMessage !== null}
              aria-describedby={discard.errorMessage !== null ? "discard-error" : undefined}
            />
          </div>
        </Label>
        {discard.errorMessage !== null && (
          <p id="discard-error" role="alert" className="text-sm text-destructive">
            {discard.errorMessage}
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={discard.isConfirming}>
              Keep draft
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            loading={discard.isConfirming}
            disabled={!discard.isConfirmEnabled || discard.isConfirming}
            onClick={discard.onConfirm}
          >
            Discard draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
