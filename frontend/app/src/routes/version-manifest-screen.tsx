import type { JSX } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@tui/ui/button";
import { Tooltip, TooltipProvider } from "@tui/ui/tooltip";
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

function toStatusRow(row: ManifestRow, disabled: boolean): StatusTableRow {
  return {
    id: row.hypothesisName,
    position: row.position,
    hypothesis: `${row.hypothesisName} · rev ${row.revision}`,
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

  const rowsDisabled = state.isBlocked || state.isBusy;
  const rows = state.rows.map((row) => toStatusRow(row, rowsDisabled));

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
