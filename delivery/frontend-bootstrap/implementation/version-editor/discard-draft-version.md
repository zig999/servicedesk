---
title: Discard a draft case version
summary: Adds the client-gated "Discard draft" control and its slug-typed confirmation Dialog to the Version
  Editor, issuing DELETE /v1/cases/{slug}/versions/{version} on confirm and landing the curator on Case
  Detail on success.
task: sha256:34f0cac6498477d36ff0b92d51a13edd9ac0cc2f5a6b806193ae7896a72ef3d8
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/version-editor-onda-5-full-suite
files:
- path: src/services/discard-confirmation.ts
  effect: New service module. Exports DiscardControlState; isSlugConfirmed (exact-match confirmation barrier,
    criterion 3); discardErrorMessage (renders an ApiError's own message verbatim, falling back to a generic
    string for a non-ApiError failure, criterion 6); buildDiscardMutationOptions (the isolated DELETE's
    own useMutation options object -- no body, guards version === null, resolves the discarded version
    number to onDiscarded so the hook needs no extra null-narrowing, routes every other outcome to onFailed
    with that response's own message); and buildDiscardControlState (assembles the "ready"-phase discard
    field from the hook's own raw useState tuples and the mutation's own pending/confirm callback, including
    the Dialog's open/close reset). Both builders were extracted here rather than only checklist-style
    pure logic, specifically to keep use-edit-draft-version-form.ts under this project's own ESLint max-lines
    limit (300, already tight after release-draft-version's own addition).
- path: src/hooks/use-edit-draft-version-form.ts
  effect: 'Added the Discard Dialog''s own local state (open flag, typed slug confirmation, error text),
    one more isolated useMutation (discardMutation, built via buildDiscardMutationOptions) whose success
    invalidates ["case-version", slug, discardedVersion] and ["case-versions", slug], telemeters caseDraftDiscarded,
    and navigates to /cases/$slug (Case Detail); whose failure sets the Dialog''s own error text without
    navigating or closing. Added an optional discard?: DiscardControlState field to EditDraftVersionFormState''s
    "ready" variant, populated via buildDiscardControlState from the same record.state === "draft" &&
    !isReleased gate canRelease already uses. A handful of the newly added lines depart from this file''s
    dominant one-item-per-line formatting (a single-line import, one single-line triple useState, and
    a couple of merged object properties in the two new builder calls) to stay under the project''s own
    ESLint max-lines rule -- disclosed as an inference below, not a rule violation (no standard rule here
    governs items-per-line; Prettier is not a lint gate in this project''s registry).'
- path: src/routes/case-version-editor-ready-view.tsx
  effect: 'Added a slug: string prop (needed to render "Type {slug} to confirm"); reads state.discard
    and, when discard.canDiscard, renders a destructive-variant "Discard draft" trigger (disabled while
    state.isBlocked, matching Release''s own trigger-disabling convention) opening a controlled Dialog
    with a generic (non-name-specific) statement that the case''s hypotheses keep their content, a Label-wrapped
    confirmation Input wired to onSlugConfirmationChange, an aria-describedby-linked error paragraph (role="alert",
    shown exactly when discard.errorMessage !== null), a "Keep draft" DialogClose (criterion 7), and a
    destructive confirm button disabled until discard.isConfirmEnabled and while discard.isConfirming.'
- path: src/routes/case-version-editor-screen.tsx
  effect: Passes the route's own slug param through to CaseVersionEditorReadyView as its new required
    prop.
- path: src/routes/new-case-draft-screen.tsx
  effect: 'Same mechanical slug prop pass-through as case-version-editor-screen.tsx, required because
    this file is the other of the two existing call sites of the now-changed shared CaseVersionEditorReadyView
    component (task/version-editor/new-draft-creation''s own screen). No behavior of that task changes:
    useNewDraftVersionForm''s own blank-form "ready" literal never sets discard, and canDiscard reads
    false there for the same disclosed reason canRelease already does.'
criteria:
- criterion: The Version Editor renders a "Discard draft" control only while the currently loaded version's
    own state is draft.
  met: true
  how: discard.canDiscard (record.state === "draft" && !isReleased, buildDiscardControlState's own input)
    gates the trigger's render in case-version-editor-ready-view.tsx; identical gating expression to canRelease,
    so a released version (this session's or one already released on load) never shows the control.
- criterion: Clicking "Discard draft" opens an in-place TUI Dialog (no navigation) stating that the case's
    hypotheses keep their content and that only this draft and its manifest are removed.
  met: true
  how: A controlled Dialog/DialogTrigger/DialogContent (no route change) whose DialogDescription states
    DISCARD_DIALOG_DESCRIPTION verbatim.
- criterion: The Dialog's own "Discard draft" control stays disabled until the curator has typed the case's
    own slug, exactly, into the confirmation field.
  met: true
  how: The confirm Button's disabled reads !discard.isConfirmEnabled || discard.isConfirming; isConfirmEnabled
    is isSlugConfirmed(slugConfirmation, slug), an exact === string comparison (discard-confirmation.ts).
- criterion: Confirming with the slug typed exactly issues one DELETE /v1/cases/{slug}/versions/{version}
    request with no body.
  met: true
  how: 'buildDiscardMutationOptions''s mutationFn issues exactly apiFetch<void>(.../versions/${version},
    { method: "DELETE" }), no body key; discard.onConfirm calls discardMutation.mutate() with no arguments.'
- criterion: A 204 response to that DELETE navigates the curator to that case's own Case Detail route.
  met: true
  how: 'apiFetch''s own 204 branch (services/api-client.ts, unmodified) resolves with no body; onDiscarded
    (in the hook) then calls navigate({ to: "/cases/$slug", params: { slug } }).'
- criterion: Any error response to that DELETE keeps the Dialog open, rendering that error's own message,
    rather than navigating away.
  met: true
  how: onError in buildDiscardMutationOptions never touches isOpen and never navigates; it calls onFailed(discardErrorMessage(error,
    GENERIC_DISCARD_FAILURE_MESSAGE)), which the hook wires to setDiscardErrorText; the Dialog renders
    that text in a role="alert" paragraph while staying open. Applies uniformly to every response (404,
    409, or anything else) -- no branch treats one differently, matching the scope's own "qualquer erro"
    wording.
- criterion: The Dialog's "Keep draft" control closes it without issuing any request.
  met: true
  how: A DialogClose asChild wrapping the "Keep draft" Button; Radix's own close mechanism only calls
    the controlled onOpenChange, which resets local state and never calls discardMutation.mutate().
nodes:
- node: contracts/knowledge/case-lifecycle
  how: Implements the contract's own discard operation as one DELETE with no body, 204 on success; the
    confirmation barrier is entirely client-side per the task's own rationale, never carried in the request.
  encoded_at:
  - src/services/discard-confirmation.ts
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/knowledge/case
  how: The case's own slug (its stable identity) is what the confirmation barrier requires the curator
    to reproduce exactly before the destructive action is enabled, and is what both the Dialog's own prompt
    and the DELETE URL address by.
  encoded_at:
  - src/services/discard-confirmation.ts
  - src/routes/case-version-editor-ready-view.tsx
  - src/hooks/use-edit-draft-version-form.ts
- node: domain/knowledge/case-version
  how: The DELETE removes exactly the addressed version and stops it being renderable by this screen;
    the Dialog's own description states the survival of the case's hypotheses (never the version's own
    manifest entries) per the node's own responsibility split.
  encoded_at:
  - src/services/discard-confirmation.ts
  - src/hooks/use-edit-draft-version-form.ts
  - src/routes/case-version-editor-ready-view.tsx
- node: domain/knowledge/case-version-state
  how: canDiscard reads record.state === "draft" exactly, treating a released state (or an absent one,
    for the new-draft-creation call site) as not-discardable, never guessing.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
- node: rules/knowledge/only-a-draft-case-version-may-be-discarded
  how: Client-side gate (canDiscard) never renders the control for a non-draft version; the actual enforcement
    remains the backend's own 409 CaseVersionNotDraftError, which this task's own criterion 6 already
    routes through the uniform error-message path rather than a special client bypass.
  encoded_at:
  - src/hooks/use-edit-draft-version-form.ts
  - src/services/discard-confirmation.ts
inferences:
- inferred: The Discard Dialog's title/description wording, and the confirmation prompt's "Type {slug}
    to confirm" phrasing.
  from: intake/onda-5-scope.md's own quoted §2.7 ASCII mockup, the same source release-draft-version's
    own delivery already cited for its own Dialog wording. Generalized rather than copied verbatim --
    the mockup names two specific hypotheses by that example's own data; this component and the hook it
    reads from hold no manifest/hypothesis-name data for this Dialog, and criterion 2 states the fact
    generically ("the case's hypotheses keep their content"), so the rendered text does too.
- inferred: The generic fallback message rendered only for a non-ApiError DELETE failure (a network drop
    that never reached api-client.ts's own typed wrapping).
  from: Mirrors patchMutation's and releaseMutation's own established generic-fallback wording pattern
    in the same file (no criterion or specification node states wording for this case; criterion 6 only
    speaks to an actual error response, whose own message is used verbatim instead).
- inferred: Calling telemetry.caseDraftDiscarded({ slug, version }) on a successful discard, and invalidating
    both ["case-version", slug, discardedVersion] and ["case-versions", slug].
  from: No criterion of this task names telemetry or cache invalidation explicitly. Inferred from use-telemetry.ts's
    own header comment (caseDraftDiscarded declared "unused by any call site yet") and the inventory's
    own convention note ("a mutation that changes version state invalidates one or both of these keys"),
    matching releaseMutation's own two-key invalidation exactly.
- inferred: 'Adding a required slug: string prop to CaseVersionEditorReadyView, threaded through both
    of its call sites.'
  from: Criterion 3 requires the curator to type "the case's own slug" into the confirmation field; the
    hook's own DiscardControlState deliberately does not re-expose slug as a field (it is used only internally
    for the exact-match comparison), so the view needs it from the route param it is already available
    at, the same way case-version-editor-screen.tsx already reads it.
- inferred: discard-confirmation.ts extracts the mutation's own options object and the "ready"-phase return
    field's own object literal, not only checklist-shaped pure computation -- a different extraction shape
    than release-checklist.ts's own precedent.
  from: This task's own logic is thinner than release's checklist (no violations array, no multi-item
    computation), so extracting only "pure" computation would not have closed use-edit-draft-version-form.ts's
    own remaining gap to this project's ESLint max-lines rule (300) the way release's own larger checklist
    extraction did. Extracting the two builders instead, plus a few single-line-per-exception formatting
    compactions in the hook itself, keeps the hook's own line count comfortably under the limit without
    altering any behavior.
preserved:
- 'The Release control and its own Dialog/checklist/violations behavior (task/version-editor/release-draft-version),
  delivered into the same three files this task touches: every edit was additive alongside the existing
  release field, releaseMutation, and the Release Dialog''s own JSX block.'
- 'The edit-mode save state machine (clean/dirty/saving/conflict) and its PATCH mutation: patchMutation,
  the effects driving status, and isBlocked''s own computation are untouched.'
- 'task/version-editor/new-draft-creation''s own blank-form flow (useNewDraftVersionForm, new-case-draft-screen.tsx):
  only the mechanical slug prop pass-through was added to keep that screen compiling against CaseVersionEditorReadyView''s
  new required prop.'
- '"/cases/$slug/versions/$version/discard" (VersionDiscardPlaceholder) and its route: route-tree.tsx
  and route-placeholders.tsx were not opened for edit, per this task''s own Notes.'
deferred:
- what: Whether the confirmation Input's height (TUI's own default, shared by every other field in this
    screen) meets the 44px touch-target rule (ACC-10).
  why: Not a fact this task introduces -- the same Input component and sizing is already used throughout
    case-version-editor-form-fields.tsx; a project-wide sizing change is outside this task's own scope
    and answers to the project's own a11y tooling step, not a hand-rolled check here.
---

## What it is
The section 2.7 Discard confirmation the scope describes, over the real DELETE .../versions/{version} endpoint the scope's own backend finding confirms (no request body, 204 on success, 404/409 CaseVersionNotDraftError reused).
The slug-typed confirmation barrier the scope's finding #4 confirms is entirely client-side, never echoed to or checked by the server.
The survival of hypotheses and hypothesis-revisions across a discard, the scope's finding #5 confirms and the wireframe's own copy states verbatim.

## Notes
"/cases/$slug/versions/$version/discard" (VersionDiscardPlaceholder) stays unreachable and unretired by this task, per the epic's own Dialog-in-place decision.
This task reuses use-manifest-builder.ts's own established mutation convention (one isolated useMutation, its own onSuccess/onError branch) rather than inventing a fourth pattern, per the inventory's own Notes.
src/services/discard-confirmation.ts is a new file, extracted from use-edit-draft-version-form.ts for the same ESLint max-lines reason release-draft-version's own delivery already extracted two other files for -- a different extraction shape (it also carries the mutation's options object and the return field's object literal, not only pure checklist-shaped computation), disclosed as this task's own inference.
