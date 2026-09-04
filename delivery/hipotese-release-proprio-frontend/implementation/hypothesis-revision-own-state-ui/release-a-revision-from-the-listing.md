---
title: Direct release control for a hypothesis-revision on the revisions listing
summary: Adds a per-row release confirmation control to the hypothesis-revisions listing, backed by a new mutation hook that releases a revision directly, updates the listing's own cache on success, and re-reads it from the server on the one named refusal.
task: sha256:41d7d8afb68103b67a0fc979a1fd072d69a16ae02825f3de22296b8210a73114
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/hypothesis-revision-own-state-ui-release-a-revision-from-the-listing-build
files:
- path: src/hooks/use-hypothesis-revision-release.ts
  effect: New hook useHypothesisRevisionRelease(slug, hypothesisName, revision) returning the mutation-plus-dialog-state shape (isOpen, onOpenChange, isConfirming, onConfirm). Its mutation POSTs to /v1/cases/:slug/hypotheses/:name/revisions/:revision/release with no body and no headers. On success it writes the released state directly into the hypothesisRevisionsQueryOptions cache entry for the one matching revision via queryClient.setQueryData, closing the dialog, with no refetch and no other query touched. On a refusal whose errorStateKind is hypothesis-revision-not-draft-at-release it closes the dialog, toasts the ApiError's own message, and invalidates the same listing query key so it is re-read from the server; any other error leaves the dialog open and shows a generic toast.
- path: src/routes/hypothesis-revision-history.tsx
  effect: Adds an exported HypothesisRevisionReleaseActionProps type and a local HypothesisRevisionReleaseAction component rendering a Dialog-confirmed "Release..." button driven by the new hook. The row-mapping's actions cell now composes this control (shown only when revision.state === "draft") alongside the pre-existing "Revise ->" link (shown only when the row isCurrent) as two independent elements in a flex container, instead of the link alone.
criteria:
- criterion: A row whose revision's own state is draft offers a release control.
  met: true
  how: The row's actions cell renders <HypothesisRevisionReleaseAction .../> exactly when revision.state === "draft", sourced from the listing's own already-disclosed per-revision state.
- criterion: A row whose revision's own state is released offers no release control.
  met: true
  how: The same condition (revision.state === "draft") is false for a released revision, so the element is omitted entirely from that row's actions cell -- no control renders, disabled or otherwise.
- criterion: Confirming the control issues one POST to /v1/cases/:slug/hypotheses/:name/revisions/:revision/release for the row's own revision number.
  met: true
  how: 'onConfirm calls releaseMutation.mutate() once per click, whose mutationFn issues exactly one apiFetch<void> POST to the literal templated URL built from the row''s own slug, hypothesisName and revision closed over by the hook''s own arguments; the app''s shared QueryClient sets no mutation retry (only queries.retry: 1 is configured), so a single confirm yields a single request.'
- criterion: That request names no case version, carries no manifest entry and sends no credential.
  met: true
  how: The URL path holds only slug, hypothesisName and revision (no version segment or query param), the fetch call passes { method "POST" } with no body and no headers, matching the same no-body, no-header shape every other mutation in this codebase already uses and carrying nothing that names a manifest entry or a credential.
- criterion: After the request succeeds, the released revision's row states released without the screen being reloaded.
  met: true
  how: onSuccess writes the new state straight into the existing hypothesisRevisionsQueryOptions cache entry through queryClient.setQueryData, updating only the one matching revision's state field to "released" in place; no invalidateQueries, no refetch and no navigation is triggered, so the table re-renders from the same cache write, and REVISION_STATE_CELL renders it as "Released" on the next render.
- criterion: A revision no case version's manifest holds an entry for is offered the release control on the same terms as a manifested one.
  met: true
  how: The control's visibility depends solely on revision.state === "draft", computed with no reference to currentPin, isCurrent or any manifest-derived value at all -- an unmanifested draft revision and a manifested one reach the exact same branch.
- criterion: After a release succeeds, every case version's own state reads exactly what it read before the release.
  met: true
  how: The hook's onSuccess and onError paths touch only the ["hypothesis-revisions", slug, hypothesisName] query key (via setQueryData or invalidateQueries); no ["case-version", ...] or ["case-versions", ...] key is read, written or invalidated anywhere in this file, so every case version's own cached state is left untouched by this action.
- criterion: A release refused with HypothesisRevisionNotDraftAtReleaseError leaves the listing re-read from the server rather than showing the row as it stood before the attempt.
  met: true
  how: In onError, when errorStateKind(error) === "hypothesis-revision-not-draft-at-release" (the kind the prior task mapped that error code to), the hook calls queryClient.invalidateQueries({ queryKey }) against the listing's own query key, triggering a background refetch from the server instead of leaving the pre-attempt cached row in place or guessing at the outcome.
- criterion: What the curator is told after that refusal reports the refusal's own condition and message and no further value about the revision.
  met: true
  how: The same branch calls toast.error(error.message) -- the backend's own HypothesisRevisionNotDraftAtReleaseError message, which already states the condition (not in draft state, so not releasable) in full prose -- and nothing else is appended (no revision number, no violations list, no further computed value); the unrelated generic-error branch shows a distinct, unrelated message, so the two stay distinguishable.
nodes:
- node: domain/knowledge/hypothesis-revision
  how: This node declares release as the revision's own operation, answering to no case version and no manifest, and states that once released its content never changes again. The new control issues that exact operation directly against the revision (never against a case version), and the dialog's own description states that guarantee to the curator before confirming.
  encoded_at:
  - src/hooks/use-hypothesis-revision-release.ts
  - src/routes/hypothesis-revision-history.tsx
- node: domain/knowledge/hypothesis-revision-state
  how: The two-value enumeration (draft, released) is exactly what gates the control's visibility and what the success handler writes back into the cache -- no third value is produced or checked anywhere in the new code.
  encoded_at:
  - src/hooks/use-hypothesis-revision-release.ts
  - src/routes/hypothesis-revision-history.tsx
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  how: The rule's one forward transition (draft to released via release) is what a successful confirm performs, and its refusal clause -- a release asked of a non-draft revision is refused with HypothesisRevisionNotDraftAtReleaseError reporting no further value, the revision already standing released whenever it is raised -- is exactly why the refusal branch re-reads the listing from the server instead of trusting any locally-held guess about the row's state.
  encoded_at:
  - src/hooks/use-hypothesis-revision-release.ts
- node: rules/knowledge/a-hypothesis-revisions-listing-discloses-each-revisions-own-state
  how: This task adds no new disclosure of its own -- the prior task already put the revision's own state on every row -- but it is what the new control's gate (revision.state === "draft") reads to decide, per row, whether to offer release, so the disclosed fact now also drives an action rather than only a badge.
  encoded_at:
  - src/routes/hypothesis-revision-history.tsx
- node: scenarios/knowledge/a-hypothesis-revision-is-released-independently-of-any-manifest
  how: The scenario states a curator may release a revision no case version's manifest ever held an entry for, with nothing about any case version changing. The control's availability ignores manifest/pin data entirely, the request itself names no manifest entry, and the success/error handlers touch no case-version query key at all -- together the exact shape this scenario describes.
  encoded_at:
  - src/hooks/use-hypothesis-revision-release.ts
  - src/routes/hypothesis-revision-history.tsx
- node: contracts/knowledge/case-lifecycle
  how: The contract names release-hypothesis as a curator's action taken directly against a hypothesis-revision, never against a case and answering to no manifest. The new control is the frontend surface for exactly that operation, calling its endpoint directly per revision; no fact of this contract is added, only exercised.
  encoded_at:
  - src/hooks/use-hypothesis-revision-release.ts
- node: constraints/no-route-enforces-authentication
  how: The new request sends no credential of any kind, consistent with this constraint's posture, and every screen it reaches (including this listing) is already wrapped by the app-shell's own unconditional disclosure delivered under frontend-console-foundation -- this task adds no disclosure of its own and needed none.
inferences:
- inferred: The release dialog's copy ("Release revision {n}?", "Once released, this revision's own content can never change again.", "Release...", "Cancel", "Release") is free-form frontend wording rather than a specification-fixed string.
  from: domain/knowledge/hypothesis-revision's stated guarantee ("Once released, this content never changes again") paraphrased for the dialog, and the case-version release dialog in case-version-editor-ready-view.tsx, whose trigger/cancel/confirm labels and DialogTitle/DialogDescription shape this reuses verbatim as the mutation-plus-dialog-state convention the inventory names.
- inferred: The release control composes into the existing "actions" cell beside the Revise link rather than occupying a new column.
  from: The inventory's must_not_duplicate note that this exact cell already renders the conditional Revise link, and MNT-03/ARC-01's preference for composing an existing structure over adding a parallel one where no node requires a new column.
- inferred: A successful release updates the cache directly via setQueryData for the one revision rather than invalidating and refetching.
  from: Criterion 5's "without the screen being reloaded" read against criterion 8's explicit "re-read from the server" for the refusal case -- the two are worded differently on purpose -- combined with the response and the lifecycle rule's own certainty that a successful release always yields exactly "released", leaving nothing that a refetch would learn that the response did not already establish.
- inferred: The not-draft-at-release refusal closes the dialog and invalidates the listing query; every other mutation error leaves the dialog open and shows only a generic toast.
  from: The existing case-version release mutation in use-edit-draft-version-form.ts, whose case-version-not-draft-at-release branch closes its dialog and invalidates, while its own fallback branch leaves the dialog state untouched -- the same shape mirrored here for the sibling hypothesis-revision refusal.
- inferred: The refusal's toast reads the ApiError's own message verbatim, with a generic fallback only if the error is not an ApiError.
  from: The existing discardErrorMessage helper in discard-confirmation.ts and the global QueryCache's own onError in query-client.ts, both of which surface error.message directly for a recognized ApiError rather than composing a new string, and HypothesisRevisionNotDraftAtReleaseError's own message already stating the refusal's condition in curator-readable prose.
preserved:
- The existing "Revise ->" link, rendered only for the row matching currentPin.pinnedRevision, keeps its own condition, target and params untouched.
- The "State" and "Status" (current/frozen) columns added by the prior task, and their independent computation from revision.state and currentPin.pinnedRevision, are unchanged.
- The screen's loading, load-error/retry and "uses no revision" branches are unchanged.
- The case-version release control, its checklist/violations dialog and its mutation in case-version-editor-ready-view.tsx / use-edit-draft-version-form.ts are untouched -- this task adds a second, independent release control rather than altering that one.
- The error-ui-state.ts table and its HypothesisRevisionNotDraftAtReleaseError entry, delivered by the prior task, are consumed as-is through errorStateKind and not modified.
---
## What it is

A release mutation, a confirmation dialog, and a per-row control offered only for a draft revision, reusing the app's existing mutation-plus-dialog-state shape.
A successful release updates the listing's own cache in place; the one named refusal invalidates it instead, so the row is re-read from the server rather than left stale.

## Notes

None.
