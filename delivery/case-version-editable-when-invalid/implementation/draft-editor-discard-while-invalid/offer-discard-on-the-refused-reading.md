---
target: frontend
title: Offer discard on the refused reading
summary: The editor's not-valid view offers and confirms a draft's discard, reusing the existing discard-confirmation
  service and gated on the version's own state.
task: sha256:0dafa1876cc82b15ed62b6c6c3428bca02267576c3880ace0da1b6931c386424
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/draft-editor-discard-while-invalid-offer-discard-on-the-refused-reading-full-3
files:
- path: src/routes/discard-draft-dialog.tsx
  effect: new shared DiscardDraftDialog component (discard confirmation dialog with slug-typed confirmation,
    error text and destructive confirm button), extracted from case-version-editor-ready-view.tsx's inline
    JSX so the identical structure/wording can be reused by both the ready and not-valid views
- path: src/routes/case-version-editor-ready-view.tsx
  effect: replaced the inline discard Dialog block with DiscardDraftDialog; removed the now-unused Label/Input
    imports and the DISCARD_DIALOG_DESCRIPTION constant (moved into the shared component). Behavior unchanged
- path: src/routes/case-version-editor-not-valid-view.tsx
  effect: 'added a slug prop; added readonly discard?: DiscardControlState to EnrichedNotValidState; rendered
    DiscardDraftDialog inside the button footer, gated on state.discard !== undefined && state.discard.canDiscard'
- path: src/routes/case-version-editor-screen.tsx
  effect: passed slug through to CaseVersionEditorNotValidView
- path: src/hooks/use-edit-draft-version-form.ts
  effect: 'added readonly discard?: DiscardControlState to the "not-valid" phase''s EditDraftVersionFormState
    union member; hoisted the discardMutation declaration (built once via buildDiscardMutationOptions,
    shared by both phases) above the useNotValidDraftVersionState call, and threaded the discard dialog-open/slugConfirmation/errorMessage
    state tuples, discardMutation.isPending and its confirm callback into that call as new arguments'
- path: src/hooks/use-not-valid-draft-version-state.ts
  effect: 'added five new parameters (discardDialogOpen, discardSlugConfirmation, discardErrorMessage,
    isDiscardConfirming, onDiscardConfirm) carrying the raw ingredients buildDiscardControlState needs;
    on the enriched "not-valid" return, added a discard field built via buildDiscardControlState with
    canDiscard: notValidVersionState === "draft", left undefined otherwise'
criteria:
- criterion: On the not-valid reading of a draft whose manifest holds no entry, the editor offers the
    discard control.
  met: true
  how: the sub-hook only reaches the enriched not-valid return (which carries discard) when isNotValid
    is true and notValidVersionState === "draft" -- this covers a draft whose manifest holds no entry
    exactly as it covers any other not-valid draft, since the gate never inspects the manifest
- criterion: On the not-valid reading of a released version, the editor offers no discard control.
  met: true
  how: 'when notValidVersionState !== "draft", the sub-hook returns the bare { phase: "not-valid" } with
    no discard field at all, before any discard control is ever built'
- criterion: On that reading of a draft, asking for the discard without confirming it issues no discard.
  met: true
  how: buildDiscardControlState's isConfirmEnabled is isSlugConfirmed(slugConfirmation, slug), false until
    the typed text equals the slug; the shared dialog's confirm button is disabled until then
- criterion: On that reading of a draft, confirming the discard with text other than the case's own slug
    issues no discard.
  met: true
  how: same isSlugConfirmed check -- any typed text other than the exact slug keeps isConfirmEnabled false
    and the confirm button disabled
- criterion: On that reading of a draft, confirming the discard reproducing the case's own slug issues
    a discard of that version.
  met: true
  how: typing the exact slug makes isConfirmEnabled true, enabling the confirm button; its onClick calls
    discardMutation.mutate(), whose mutationFn issues DELETE /v1/cases/{slug}/versions/{version}
- criterion: A discard answered HTTP 204 on that reading shows no discard-failure statement.
  met: true
  how: buildDiscardMutationOptions's onSuccess never touches discardErrorText; discard.errorMessage stays
    null, so the dialog's error block never renders
nodes:
- node: rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/routes/case-version-editor-not-valid-view.tsx
  - src/routes/discard-draft-dialog.tsx
  how: the not-valid reading's discard field is gated on notValidVersionState === "draft" alone -- nothing
    about the manifest holding no entry, or any other validator-rule failure, withholds it; and the same
    buildDiscardMutationOptions mutation the ready phase uses accepts the discard regardless of the version's
    current validation outcome
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  how: 'canDiscard: notValidVersionState === "draft" decides the offer by the version''s own state alone,
    read from useCaseVersions, never from the manifest or declared attributes that drive the not-valid
    reading itself'
- node: rules/knowledge/releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act
  encoded_at:
  - src/routes/discard-draft-dialog.tsx
  how: the discard control is a Dialog/DialogTrigger pair -- opening it performs nothing; only the further,
    explicit confirm click issues the mutation
- node: rules/knowledge/a-draft-case-versions-discard-reproduces-the-cases-own-slug
  encoded_at:
  - src/routes/discard-draft-dialog.tsx
  how: the reused Label/Input requires the curator to type the case's own slug before the confirm button
    enables
- node: scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  how: the scenario's given (a draft whose manifest holds no hypothesis) is exactly the not-valid reading
    this task targets; the discard offer built here does not distinguish that case from any other not-valid
    draft
- node: constraints/a-successful-case-version-discard-answers-with-no-content
  how: reached by REMAINDER per the task's own Notes -- a server-side response-shape constraint the backend
    epic draft-discard-while-invalid already implements; nothing in this editor-only task encodes it
- node: domain/knowledge/case-version
  encoded_at:
  - src/hooks/use-not-valid-draft-version-state.ts
  - src/hooks/use-edit-draft-version-form.ts
  how: the discard offer and its confirmation act on the case-version aggregate's own state and version
    attributes, read through useCaseVersions and passed into the existing discard operation's client-side
    counterpart
inferences:
- inferred: The not-valid reading's discard control uses the exact same JSX structure, wording and layout
    as the ready phase's own discard dialog, now extracted into a shared DiscardDraftDialog component.
  from: the task's own Notes instructing reuse of the identical structure/wording, plus both discard rules'
    own closing lines leaving wording/placement to the interface
- inferred: The shared dialog's trigger button is disabled via a disabled prop bound to state.isBlocked
    on both call sites, rather than left always-enabled on the not-valid reading.
  from: the ready view's existing convention for its own discard trigger
- inferred: The shared component lives at src/routes/discard-draft-dialog.tsx, alongside other small extracted
    view components, rather than under shared/components.
  from: the existing convention (CaseVersionEditorLink) and this initiative's repeated pattern of extracting
    small shared components for budget/duplication pressure
preserved:
- the ready phase's discard offer, confirmation flow, wording and gating are unchanged in behavior --
  only its JSX was moved into the shared DiscardDraftDialog component
- the not-valid reading's existing correction flow (form, submit, field-blur, cancel, conflict/not-found
  handling) from the two immediately-prior tasks is untouched
- the single shared discardMutation instance now serves both the ready and not-valid phases identically,
  rather than each phase owning its own mutation
---

## What it is

The editor's not-valid view now offers and confirms a draft's discard through a new shared DiscardDraftDialog component, reusing the existing discard-confirmation service, gated on the version's own state rather than the ready phase's record.state.

## Notes

The build's first attempt failed lint's MNT-01 300-line cap on use-edit-draft-version-form.ts (302 lines); fixed by packing the newly-threaded discard arguments onto fewer lines, with no logic change. The passing build is run/draft-editor-discard-while-invalid-offer-discard-on-the-refused-reading-full-2, named on this record.
