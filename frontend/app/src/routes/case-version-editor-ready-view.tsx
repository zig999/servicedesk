import type { JSX } from "react";
import { Link } from "@tanstack/react-router";
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
import { ConflictBanner } from "../shared/components/conflict-banner";
import {
  CASE_VERSION_EDITOR_FORM_ID,
  CaseVersionEditorFormFields,
} from "./case-version-editor-form-fields";
import type { EditDraftVersionFormState } from "../hooks/use-edit-draft-version-form";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import type { CaseVersionManifestEntry } from "../services/case-version-record";
import {
  useManifestPinnedRevisionStates,
  type ManifestPinnedRevisionStates,
} from "../hooks/use-manifest-pinned-revision-states";
import {
  pinnedRevisionStateCell,
  type PinnedRevisionStateResult,
} from "../hooks/use-pinned-revision-state";

const CONFLICT_BANNER_TITLE = "This version was released by someone else";
const CONFLICT_BANNER_MESSAGE =
  "Your changes were not saved. Reload to see the current state, or start a new draft.";

const RELEASE_DIALOG_DESCRIPTION =
  "Once released, this version and every manifest entry it holds are frozen — permanently.";

const DISCARD_DIALOG_DESCRIPTION =
  "This case's own hypotheses keep their content — only this draft and its manifest are removed. This cannot be undone.";

const MANIFEST_COLUMNS: StatusTableColumn[] = [
  { key: "position", header: "Position" },
  { key: "hypothesis", header: "Hypothesis" },
  { key: "revision", header: "Revision" },
  { key: "state", header: "State" },
  { key: "criterion", header: "Criterion" },
];

const STILL_UNRESOLVED_PIN_STATE: PinnedRevisionStateResult = { status: "pending" };

function toManifestRow(
  entry: CaseVersionManifestEntry,
  pinnedStates: ManifestPinnedRevisionStates,
): StatusTableRow {
  const pinnedState = pinnedStates.get(entry.position) ?? STILL_UNRESOLVED_PIN_STATE;
  return {
    id: entry.position,
    position: entry.position,
    hypothesis: entry.hypothesis_revision.hypothesis.name,
    revision: entry.hypothesis_revision.revision,
    state: pinnedRevisionStateCell(pinnedState),
    criterion: entry.hypothesis_revision.criterion,
  };
}

export type ManifestTableProps = {
  readonly slug: string;
  readonly manifest: readonly CaseVersionManifestEntry[];
};

function ManifestTable({ slug, manifest }: ManifestTableProps): JSX.Element {
  const pinnedStates = useManifestPinnedRevisionStates(slug, manifest);

  if (manifest.length === 0) {
    return <p>This version&apos;s manifest holds no entry.</p>;
  }

  return (
    <StatusTable
      columns={MANIFEST_COLUMNS}
      rows={manifest.map((entry) => toManifestRow(entry, pinnedStates))}
    />
  );
}

export type CaseVersionEditorReadyViewProps = {
  readonly state: Extract<EditDraftVersionFormState, { phase: "ready" }>;

  readonly slug: string;
};

export function CaseVersionEditorReadyView({
  state,
  slug,
}: CaseVersionEditorReadyViewProps): JSX.Element {
  const release = state.release;
  const discard = state.discard;
  const isReadOnly = state.isReadOnly ?? false;
  return (
    <>
      {state.status === "conflict" && (
        <ConflictBanner title={CONFLICT_BANNER_TITLE} message={CONFLICT_BANNER_MESSAGE} />
      )}
      <CaseVersionEditorFormFields
        form={state.form}
        savedAt={state.savedAt}
        isBlocked={state.isBlocked}
        outcomeOptions={state.outcomeOptions}
        actionOptions={state.actionOptions}
        recipientOptions={state.recipientOptions}
        onSubmit={state.onSubmit}
        onFieldBlur={state.onFieldBlur}
        isReadOnly={isReadOnly}
      />
      {isReadOnly && (

        <section className="flex flex-col gap-2">
          <h2>Manifest</h2>
          <ManifestTable slug={slug} manifest={state.manifest ?? []} />
        </section>
      )}
      <div className="flex flex-wrap items-center justify-end gap-4">
        {release !== undefined && release.canRelease && (
          <Dialog open={release.isOpen} onOpenChange={release.onOpenChange}>
            <DialogTrigger asChild>
              <Button type="button" disabled={state.isBlocked}>
                Release…
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Release v{release.version}?</DialogTitle>
              </DialogHeader>
              <DialogDescription>{RELEASE_DIALOG_DESCRIPTION}</DialogDescription>
              {release.dialog.kind === "checklist" ? (
                <ul className="flex flex-col gap-1 text-sm">
                  {release.dialog.items.map((item) => (
                    <li
                      key={item.label}
                      className={item.satisfied ? "text-foreground" : "text-destructive"}
                    >
                      {item.satisfied ? "✓" : "!"} {item.label}
                    </li>
                  ))}
                </ul>
              ) : (

                <div role="alert">
                  {release.dialog.violations.length === 0 ? (

                    <p className="text-sm text-destructive">
                      No specific violation was returned.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-1 text-sm text-destructive">
                      {release.dialog.violations.map((violation) => (
                        <li key={violation}>! {violation}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" disabled={release.isConfirming}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" loading={release.isConfirming} onClick={release.onConfirm}>
                  Release
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {discard !== undefined && discard.canDiscard && (
          <Dialog open={discard.isOpen} onOpenChange={discard.onOpenChange}>
            <DialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={state.isBlocked}>
                Discard draft
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Discard this draft?</DialogTitle>
              </DialogHeader>
              <DialogDescription>{DISCARD_DIALOG_DESCRIPTION}</DialogDescription>
              {/* Label's own default styling (uppercase, wide tracking, accent color, all CSS-inherited) is reset in this wrapping div, matching case-version-editor-form-fields.tsx's own FormField convention for the same reason -- otherwise it would cascade into the typed slug itself. */}
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
        )}
        {!isReadOnly && (
          <Button
            type="submit"
            form={CASE_VERSION_EDITOR_FORM_ID}
            disabled={state.isBlocked || state.status === "clean"}
          >
            Save changes
          </Button>
        )}
        <Button type="button" variant="secondary" asChild>
          <Link to="/cases/$slug" params={{ slug }}>
            Cancel
          </Link>
        </Button>
      </div>
    </>
  );
}
