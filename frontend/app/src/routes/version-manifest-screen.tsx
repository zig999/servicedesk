import { useEffect, useRef, type JSX, type RefObject } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { Tooltip, TooltipProvider } from "@tui/ui/tooltip";
import { Label } from "@tui/ui/label";
import { Select, type SelectOption } from "@tui/ui/select";
import { cn } from "@tui/lib/cn";
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
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import { ConflictBanner } from "../shared/components/conflict-banner";
import { useManifestBuilder, type ManifestRow } from "../hooks/use-manifest-builder";
import { useManifestRowRevisions } from "../hooks/use-manifest-row-revisions";
import {
  pinnedRevisionStateCell,
  usePinnedRevisionState,
} from "../hooks/use-pinned-revision-state";

const REMOVE_DISABLED_TOOLTIP = "A case must keep at least one hypothesis";

const MANIFEST_COLUMNS: StatusTableColumn[] = [
  { key: "position", header: "#" },
  { key: "hypothesis", header: "Hypothesis" },
  { key: "actions", header: "" },
];

export type RowActionsProps = {
  readonly row: ManifestRow;
  readonly disabled: boolean;
};

function RowActions({ row, disabled }: RowActionsProps): JSX.Element {
  const removeDisabled = row.isOnlyEntry || disabled;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          aria-label={`Move ${row.hypothesisName} up`}
          disabled={!row.canMoveUp || disabled}
          onClick={row.onMoveUp}
        >
          ▲
        </Button>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Move ${row.hypothesisName} down`}
          disabled={!row.canMoveDown || disabled}
          onClick={row.onMoveDown}
        >
          ▼
        </Button>
        <Dialog>
          <Tooltip content={REMOVE_DISABLED_TOOLTIP} disabled={!row.isOnlyEntry}>
            <span className="inline-block">
              <DialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={removeDisabled}>
                  Remove
                </Button>
              </DialogTrigger>
            </span>
          </Tooltip>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove {row.hypothesisName}?</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              This removes {row.hypothesisName} from this draft&apos;s manifest.
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="button" variant="destructive" onClick={row.onRemove}>
                  Remove
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {row.moveErrorMessage !== null && (

        <p role="alert" className="text-sm text-destructive">
          {row.moveErrorMessage}
        </p>
      )}
    </div>
  );
}

export type RevisionSelectProps = {
  readonly slug: string;
  readonly row: ManifestRow;
  readonly disabled: boolean;
};

function optionsWithPinnedRevision(
  revisions: readonly { readonly revision: number }[],
  pinnedRevision: number,
): SelectOption[] {
  const options = revisions.map((item) => ({
    value: String(item.revision),
    label: String(item.revision),
  }));
  const pinnedValue = String(pinnedRevision);
  if (options.some((option) => option.value === pinnedValue)) {
    return options;
  }

  return [...options, { value: pinnedValue, label: pinnedValue }];
}

function useTriggerAriaLinkage(
  containerRef: RefObject<HTMLDivElement | null>,
  isInvalid: boolean,
  describedById: string | undefined,
): void {
  useEffect(() => {
    const trigger = containerRef.current?.querySelector<HTMLButtonElement>(
      'button[role="combobox"]',
    );
    if (!trigger) {
      return;
    }
    if (isInvalid) {
      trigger.setAttribute("aria-invalid", "true");
    } else {
      trigger.removeAttribute("aria-invalid");
    }
    if (describedById !== undefined) {
      trigger.setAttribute("aria-describedby", describedById);
    } else {
      trigger.removeAttribute("aria-describedby");
    }
  }, [containerRef, isInvalid, describedById]);
}

type PinnedRevisionStateBadgeProps = {
  readonly cell: { readonly color: string; readonly label: string };
};

function PinnedRevisionStateBadge({ cell }: PinnedRevisionStateBadgeProps): JSX.Element {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-sm">
      <span aria-hidden="true" className={cn("inline-block h-2 w-2 rounded-full", cell.color)} />
      {cell.label}
    </span>
  );
}

function RevisionSelect({ slug, row, disabled }: RevisionSelectProps): JSX.Element {
  const { revisions, highestRevision, isLoading } = useManifestRowRevisions(
    slug,
    row.hypothesisName,
  );
  const pinnedState = usePinnedRevisionState(slug, row.hypothesisName, row.revision);
  const pinnedStateCell = pinnedRevisionStateCell(pinnedState);
  const containerRef = useRef<HTMLDivElement>(null);
  const errorId = `revision-error-${row.hypothesisName}`;
  const isInvalid = row.revisionErrorMessage !== null;
  useTriggerAriaLinkage(containerRef, isInvalid, isInvalid ? errorId : undefined);

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-2">
        {row.hypothesisName}
        <PinnedRevisionStateBadge cell={pinnedStateCell} />
      </span>
    );
  }

  const options = optionsWithPinnedRevision(revisions, row.revision);
  const hasNewerRevision = highestRevision !== undefined && row.revision < highestRevision;

  function repinIfChanged(value: string): void {
    const chosenRevision = Number(value);
    if (chosenRevision !== row.revision) {
      row.onRepin(chosenRevision);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Label className="flex min-w-0 flex-1 flex-col gap-1">
          {row.hypothesisName}
          <Select
            ref={containerRef}
            value={String(row.revision)}
            onChange={repinIfChanged}
            options={options}
            disabled={disabled}
            placeholder="Select a revision"
          />
        </Label>
        <PinnedRevisionStateBadge cell={pinnedStateCell} />
        {hasNewerRevision && (
          <span className="shrink-0 text-sm text-warning">Newer revision available</span>
        )}
      </div>
      {row.revisionErrorMessage !== null && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {row.revisionErrorMessage}
        </p>
      )}
    </div>
  );
}

function toStatusRow(row: ManifestRow, disabled: boolean, slug: string): StatusTableRow {
  return {
    id: row.hypothesisName,
    position: row.position,
    hypothesis: <RevisionSelect slug={slug} row={row} disabled={disabled} />,
    actions: <RowActions row={row} disabled={disabled} />,
  };
}

export function VersionManifestScreen(): JSX.Element {
  const { slug, version } = useParams({
    from: "/cases/$slug/versions/$version/manifest",
  });
  const state = useManifestBuilder(slug, Number(version));

  if (state.phase === "loading") {
    return <p>Loading manifest…</p>;
  }

  if (state.phase === "load-error") {
    return (
      <section>
        <p>Unable to load this manifest right now.</p>
        <Button type="button" onClick={state.retryLoad}>
          Retry
        </Button>
      </section>
    );
  }

  const rowsDisabled = state.isBlocked || state.isBusy || state.isReleased;
  const rows = state.rows.map((row) => toStatusRow(row, rowsDisabled, slug));

  return (
    <TooltipProvider>
      <section>
        <div className="flex items-center justify-between">
          <h1>Manifest — v{version}</h1>
          <Link
            to="/cases/$slug/versions/$version/manifest/hypotheses/new"
            params={{ slug, version }}
          >
            + Add hypothesis
          </Link>
        </div>
        {state.isBlocked && (
          <ConflictBanner
            title="This version was released by someone else"
            message="Your changes were not saved. Reload to see the current state, or start a new draft."
          />
        )}
        <StatusTable columns={MANIFEST_COLUMNS} rows={rows} />
      </section>
    </TooltipProvider>
  );
}
