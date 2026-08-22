import type { JSX } from "react";
import { ConflictBanner } from "../shared/components/conflict-banner";
import { CaseVersionEditorFormFields } from "./case-version-editor-form-fields";
import type { EditDraftVersionFormState } from "../hooks/use-edit-draft-version-form";

/**
 * The Version Editor's "ready" phase markup -- the conflict banner plus the
 * shared field form -- factored out of case-version-editor-screen.tsx
 * (task/version-editor/edit-draft-version) so task/version-editor/
 * new-draft-creation's own screen (once its own hook has switched into the
 * same edit-mode flow that screen already renders) composes the identical
 * markup rather than a second, hand-copied one: both screens end up
 * rendering through this exact function once their own hook reaches the
 * "ready" phase, whichever verb (POST or PATCH) got them there.
 *
 * The conflict banner's exact wording is sourced from edit-draft-version's
 * own `sources` (intake/onda-3-scope.md, itself quoting
 * docs/frontend-triage-console-proposal.md §2.3's own ASCII banner
 * verbatim), per that task's own Notes -- not from a specification node.
 */
const CONFLICT_BANNER_TITLE = "This version was released by someone else";
const CONFLICT_BANNER_MESSAGE =
  "Your changes were not saved. Reload to see the current state, or start a new draft.";

export type CaseVersionEditorReadyViewProps = {
  readonly state: Extract<EditDraftVersionFormState, { phase: "ready" }>;
};

export function CaseVersionEditorReadyView({
  state,
}: CaseVersionEditorReadyViewProps): JSX.Element {
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
      />
    </>
  );
}
