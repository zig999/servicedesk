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
import {
  applyConfirmationDiffIsEmpty,
  type ApplyConfirmationDiff,
  type KeyChangeSet,
} from "../services/connector-configuration-apply-diff";
import {
  APPLY_CONFIRMATION_CONFIRM_BUTTON,
  APPLY_CONFIRMATION_DIALOG_TITLE,
  APPLY_CONFIRMATION_KEEP_EDITING_BUTTON,
  APPLY_DIFF_EMPTY_MESSAGE,
  APPLY_DIFF_NOT_ITEMISABLE_MESSAGE,
  APPLY_OVER_UNSAVED_EDIT_DESCRIPTION,
  KEY_CHANGE_ADDED_PREFIX,
  KEY_CHANGE_CHANGED_PREFIX,
  KEY_CHANGE_LIST_TOP_LEVEL_LABEL,
  KEY_CHANGE_REMOVED_PREFIX,
} from "../services/connector-configuration-messages";

function KeyChangeList({
  label,
  changes,
}: {
  label: string;
  changes: KeyChangeSet;
}): JSX.Element | null {
  const hasAny = changes.added.length > 0 || changes.removed.length > 0 || changes.changed.length > 0;
  if (!hasAny) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <ul className="flex flex-col gap-1">
        {changes.added.map((key) => (
          <li key={`added:${key}`} className="text-sm">
            {KEY_CHANGE_ADDED_PREFIX}
            <span className="font-medium">{key}</span>
          </li>
        ))}
        {changes.removed.map((key) => (
          <li key={`removed:${key}`} className="text-sm">
            {KEY_CHANGE_REMOVED_PREFIX}
            <span className="font-medium">{key}</span>
          </li>
        ))}
        {changes.changed.map((key) => (
          <li key={`changed:${key}`} className="text-sm">
            {KEY_CHANGE_CHANGED_PREFIX}
            <span className="font-medium">{key}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ApplyConfirmationDiffBody({ diff }: { diff: ApplyConfirmationDiff }): JSX.Element {
  if (diff.kind === "not-itemisable") {
    return <p className="text-sm text-muted-foreground">{APPLY_DIFF_NOT_ITEMISABLE_MESSAGE}</p>;
  }

  if (applyConfirmationDiffIsEmpty(diff)) {
    return <p className="text-sm text-muted-foreground">{APPLY_DIFF_EMPTY_MESSAGE}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <KeyChangeList label={KEY_CHANGE_LIST_TOP_LEVEL_LABEL} changes={diff.topLevel} />
      {diff.nested.map((entry) => (
        <KeyChangeList key={entry.key} label={entry.key} changes={entry.diff} />
      ))}
    </div>
  );
}

export function ConnectorConfigurationApplyConfirmationDialog({
  diff,
  onOpenChange,
  onConfirm,
}: {
  diff: ApplyConfirmationDiff | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}): JSX.Element {
  return (
    <Dialog open={diff !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{APPLY_CONFIRMATION_DIALOG_TITLE}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{APPLY_OVER_UNSAVED_EDIT_DESCRIPTION}</DialogDescription>
        {diff !== null && <ApplyConfirmationDiffBody diff={diff} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {APPLY_CONFIRMATION_KEEP_EDITING_BUTTON}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" variant="destructive" onClick={onConfirm}>
              {APPLY_CONFIRMATION_CONFIRM_BUTTON}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
