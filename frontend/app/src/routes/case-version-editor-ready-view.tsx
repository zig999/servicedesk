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
import { ConflictBanner } from "../shared/components/conflict-banner";
import { CaseVersionEditorFormFields } from "./case-version-editor-form-fields";
import type { EditDraftVersionFormState } from "../hooks/use-edit-draft-version-form";
import {
  StatusTable,
  type StatusTableColumn,
  type StatusTableRow,
} from "../shared/components/status-table";
import type { CaseVersionManifestEntry } from "../services/case-version-record";

/**
 * The Version Editor's "ready" phase markup -- the conflict banner, the
 * shared field form, and (task/version-editor/release-draft-version) the
 * "Release…" control and its confirmation Dialog -- factored out of
 * case-version-editor-screen.tsx (task/version-editor/edit-draft-version) so
 * task/version-editor/new-draft-creation's own screen (once its own hook has
 * switched into the same edit-mode flow that screen already renders)
 * composes the identical markup rather than a second, hand-copied one: both
 * screens end up rendering through this exact function once their own hook
 * reaches the "ready" phase, whichever verb (POST or PATCH) got them there.
 *
 * The conflict banner's exact wording is sourced from edit-draft-version's
 * own `sources` (intake/onda-3-scope.md, itself quoting
 * docs/frontend-triage-console-proposal.md §2.3's own ASCII banner
 * verbatim), per that task's own Notes -- not from a specification node. The
 * Release Dialog's own title/body/checklist wording below is sourced the
 * same way, from release-draft-version's own `sources`
 * (intake/onda-5-scope.md, itself quoting that same proposal's §2.6 ASCII
 * mockup verbatim) -- also not a specification node's wording, this task's
 * own inference, disclosed in its delivery record.
 *
 * `release` is optional on `state` (use-edit-draft-version-form.ts's own
 * header comment) -- use-new-draft-version-form.ts's own blank-form "ready"
 * object never carries one, so this component renders no Release control at
 * all for that call site, exactly as if `state.release.canRelease` had come
 * back `false`. `discard` is optional for the same reason
 * (task/version-editor/discard-draft-version).
 *
 * The Discard Dialog's own title/body wording below is sourced the same way
 * as the Release Dialog's (this file's own header comment above) --
 * intake/onda-5-scope.md, itself quoting the proposal's own §2.7 ASCII
 * mockup, not a specification node's wording; this task's own inference,
 * disclosed in its delivery record. Unlike the mockup's own example text
 * (which names two specific hypotheses by their own case's data), the
 * confirmation body below states the fact generically -- criterion 2 names
 * only "the case's hypotheses keep their content", never particular names,
 * and neither this component nor the hook it reads from holds the loaded
 * manifest's own hypothesis names to interpolate one.
 *
 * task/version-editor/view-released-version-read-only, criteria 4-6: once
 * `state.isReadOnly` is `true` (the loaded record's own state is released),
 * this component passes it through to CaseVersionEditorFormFields (which
 * that task's own header comment says omits its own Save control for
 * exactly this flag) and additionally renders every manifest entry
 * `state.manifest` carries, in the exact order the response returned them,
 * each showing its own declared position, its hypothesis's own name, and
 * its hypothesis-revision's own revision number and criterion
 * (domain/knowledge/manifest-entry, domain/knowledge/hypothesis-revision) --
 * composed over the same generic, data-driven StatusTable
 * (shared/components/status-table.tsx) the Versions tab already renders
 * through (case-detail-screen.tsx), rather than a second, hand-rolled table
 * (ARC-01, must_not_duplicate). `release` and `discard` above already
 * render nothing for a released record (`canRelease`/`canDiscard` both read
 * `record.state === "draft"`), so this task adds no further gating around
 * either -- only the Save control and the manifest listing are new here.
 */
const CONFLICT_BANNER_TITLE = "This version was released by someone else";
const CONFLICT_BANNER_MESSAGE =
  "Your changes were not saved. Reload to see the current state, or start a new draft.";

const RELEASE_DIALOG_DESCRIPTION =
  "Once released, this version and every manifest entry it holds are frozen — permanently.";

const DISCARD_DIALOG_DESCRIPTION =
  "This case's own hypotheses keep their content — only this draft and its manifest are removed. This cannot be undone.";

/** The read-only manifest listing's own columns (criterion 6): declared position, hypothesis name, revision number, criterion -- in that order. */
const MANIFEST_COLUMNS: StatusTableColumn[] = [
  { key: "position", header: "Position" },
  { key: "hypothesis", header: "Hypothesis" },
  { key: "revision", header: "Revision" },
  { key: "criterion", header: "Criterion" },
];

/**
 * One manifest entry as StatusTable's own generic row shape (ARC-03: the
 * transformation lives in a top-level function, never inline in JSX, the
 * same convention case-detail-screen.tsx's own toRow() already establishes
 * for that same shared component). Keyed by `position` -- a manifest's own
 * declared precedence position is unique within one version
 * (domain/knowledge/manifest-entry) -- rather than by array index (MNT-04).
 */
function toManifestRow(entry: CaseVersionManifestEntry): StatusTableRow {
  return {
    id: entry.position,
    position: entry.position,
    hypothesis: entry.hypothesis_revision.hypothesis.name,
    revision: entry.hypothesis_revision.revision,
    criterion: entry.hypothesis_revision.criterion,
  };
}

export type CaseVersionEditorReadyViewProps = {
  readonly state: Extract<EditDraftVersionFormState, { phase: "ready" }>;
  /** Rendered into the Discard Dialog's own confirmation prompt (criterion 3) -- read from the route's own params, not from `state`, since the hook's own DiscardControlState carries it only as an internal comparison, never as a field a caller reads back. */
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
        status={state.status}
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
        // criterion 6: every manifest entry the loaded record's own read
        // carries, in the exact order the response returned them -- API-04's
        // own empty-collection convention (case-detail-screen.tsx's own
        // Versions-tab precedent) covers the domain edge this task's own
        // Notes already names as unreachable in practice (a released
        // version has already passed read-case's own manifest.min(1)
        // coherence check at release time), rather than leaving this
        // section silently blank if it were ever reached.
        <section className="flex flex-col gap-2">
          <h2>Manifest</h2>
          {(state.manifest ?? []).length === 0 ? (
            <p>This version&apos;s manifest holds no entry.</p>
          ) : (
            <StatusTable
              columns={MANIFEST_COLUMNS}
              rows={(state.manifest ?? []).map(toManifestRow)}
            />
          )}
        </section>
      )}
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
              // ACC-07: the Dialog is already open and focused when a 422
              // swaps this body from the checklist to this list -- role="alert"
              // on the wrapping div (rather than the list itself, which would
              // override its own implicit "list" role) is what tells
              // assistive technology content changed here, matching
              // case-version-editor-form-fields.tsx's own field error
              // paragraphs (FormField, same role, same reasoning).
              <div role="alert">
                {release.dialog.violations.length === 0 ? (
                  // a-release-refusal-with-no-named-violation-says-so: where
                  // the 422's own `violations` array names nothing, this
                  // region says so explicitly rather than rendering an empty
                  // <ul>, matching this same file's own load-error /
                  // empty-list convention (case-hypotheses-tab.tsx's own
                  // empty-state branch) for the same "empty collection" shape.
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
              // criterion 6: any error keeps this Dialog open and renders
              // that error's own message here -- role="alert" for the same
              // ACC-07 reason as the Release Dialog's own violations list
              // above (content changing while the Dialog stays open and
              // focused).
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
    </>
  );
}
