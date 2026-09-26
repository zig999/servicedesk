---
target: frontend
title: Delete control on the case detail surface for a case holding no version
summary: Adds a slug-confirmed delete dialog to CaseDetailScreen's VersionsPanel, wired to the already-delivered
  useDeleteCase() mutation, that issues one DELETE to /v1/cases/<slug> and lands the curator on the cases
  listing once accepted.
task: sha256:d884981321e9a3f773997307461841554e6831a226b8b7f1c7ea7ba6a6bc0413
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-deletion-surface-case-detail-delete-control-build
files:
- path: src/services/case-delete-confirmation.ts
  effect: New service module. Exports CaseDeleteControlState and buildCaseDeleteControlState, which derives
    isConfirmEnabled by reusing discard-confirmation.ts's exported isSlugConfirmed(typedSlug, slug), and
    resets the typed slug whenever the dialog's open state changes.
- path: src/hooks/use-case-delete-control.ts
  effect: New hook. Wires useDeleteCase() (delivered by delete-case-mutation) and useNavigate() into buildCaseDeleteControlState's
    onConfirm -- mutate(slug) fires the DELETE, and a per-call onSuccess navigates to /cases once the
    mutation's own onSuccess (cases-list invalidation, already in useDeleteCase) has run.
- path: src/routes/case-delete-dialog.tsx
  effect: New presentational component. A Dialog/DialogTrigger ("Delete case") holding a Label+Input asking
    the curator to type the case's own slug, a secondary "Keep case" DialogClose, and a destructive "Delete
    case" button disabled until the typed slug matches and while the mutation is pending -- same shape
    as discard-draft-dialog.tsx's typed-slug convention.
- path: src/routes/case-detail-screen.tsx
  effect: VersionsPanel now calls useCaseDeleteControl(slug) unconditionally alongside its existing hooks
    (before the loading/error early returns, preserving hook-call order), and renders CaseDeleteDialog
    next to the "This case currently holds no version." paragraph, only in the rows.length === 0 branch.
criteria:
- criterion: The case detail surface, for a case whose versions read answers no version, offers a control
    to delete that case.
  met: true
  how: CaseDeleteDialog is rendered only inside VersionsPanel's rows.length === 0 branch, beside the existing
    "This case currently holds no version." statement.
- criterion: Completing the delete act from that control sends exactly one HTTP DELETE request to /v1/cases/<that
    case's slug>.
  met: true
  how: 'The dialog''s confirm button is disabled until the typed slug matches and while a delete is already
    pending, so exactly one click can reach onConfirm, which calls useDeleteCase()''s already-delivered
    mutate(slug) -- apiFetch<void>(`/v1/cases/${slug}`, { method: "DELETE" }) -- exactly once.'
- criterion: After the delete is answered with HTTP 204, the cases listing carries no entry for the deleted
    slug.
  met: true
  how: useDeleteCase's own onSuccess (delivered, unmodified) invalidates the ["cases-list"] query key;
    useCasesList refetches /v1/cases and no longer lists the deleted slug. This task's own onSuccess additionally
    navigates to /cases so the curator lands where that refetch is visible.
- criterion: After the delete is answered with HTTP 204, the cases listing still carries an entry for
    every other case it carried before the delete.
  met: true
  how: The same refetch is the one useCasesList already performs for every other read of the listing;
    nothing this task adds touches any other case's row, and the backend's own delete removes only the
    named slug's case, hypotheses, hypothesis-revisions and collects.
nodes:
- node: rules/knowledge/a-case-holding-no-version-may-be-deleted
  how: This task builds only the surface for the delete the rule already authorizes; the accept/refuse
    decision itself is the backend's, already delivered. The control is offered only where the versions
    read already answered zero, which is the condition this rule turns on.
  encoded_at:
  - src/routes/case-detail-screen.tsx
- node: constraints/a-successful-case-deletion-answers-with-no-content
  how: apiFetch<void> already treats a 204 as returning undefined (unmodified); the mutation this task
    calls declares T=void for exactly that reason, so no response body is read or expected here.
  encoded_at:
  - src/hooks/use-case-delete-control.ts
- node: scenarios/knowledge/a-case-holding-no-version-is-deleted
  how: The scenario's given/when/then is exactly this control's path -- control shown for a zero-version
    case, confirming issues the delete, and the accepted delete leaves the case out of the listing the
    curator is navigated to.
  encoded_at:
  - src/routes/case-detail-screen.tsx
  - src/hooks/use-case-delete-control.ts
- node: contracts/knowledge/case-lifecycle
  how: delete is the operation this control's confirm act reaches, through the already-delivered useDeleteCase()
    client binding; this task adds no new operation and states nothing about create-draft, release, discard
    or the hypothesis operations the contract also publishes -- honored, not implemented further.
- node: contracts/knowledge/case-query
  how: list-cases is the read this task's post-delete navigation relies on (useCasesList already reads
    it); this task adds no new read operation.
- node: domain/knowledge/case
  how: The control is keyed on the case's own slug (typed-confirmation input, DELETE path parameter) and
    reached only through that identity, per the aggregate's own Description.
  encoded_at:
  - src/routes/case-delete-dialog.tsx
  - src/hooks/use-case-delete-control.ts
- node: rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug
  how: buildCaseDeleteControlState gates isConfirmEnabled on isSlugConfirmed(typedSlug, slug); taking
    the trigger control alone (opening the dialog) issues no delete, and only the confirm button -- enabled
    solely once the typed text equals the case's own slug -- calls mutate(). An act reproducing no slug,
    or the wrong one, leaves the button disabled and issues no delete; declining (Keep case, Escape, backdrop)
    closes the dialog through onOpenChange, which resets the typed slug and touches nothing else.
  encoded_at:
  - src/services/case-delete-confirmation.ts
  - src/routes/case-delete-dialog.tsx
- node: rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case
  how: useCaseDeleteControl's onConfirm passes a per-call onSuccess to mutate() that navigates to "/cases"
    (the cases-listing route) -- never to a surface keyed on the deleted slug.
  encoded_at:
  - src/hooks/use-case-delete-control.ts
- node: rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete
  how: Deferred by the task's own REMAINDER note to task/case-deletion-surface/case-delete-refusal-presentation;
    this control wires no onError and states nothing for any outcome the delete refuses. Nothing here
    contradicts the rule -- it is simply not yet answered by this file.
inferences:
- inferred: The delete control is a typed-slug-confirmation dialog (Label+Input matching the case's own
    slug), rather than the plain Keep/Remove dialog the connector-configuration and glossary-concept siblings
    use.
  from: rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug is
    a node this task implements and explicitly requires the further act to reproduce the case's own slug
    -- a requirement the plain-dialog convention does not satisfy on its own. The declared rule outranks
    the evidenced convention, so the typed-slug shape at discard-confirmation.ts and discard-draft-dialog.tsx
    was reused instead.
- inferred: The accepted delete states nothing to the curator beyond the silent navigation to /cases (no
    toast, no confirmation banner).
  from: The task's own Notes mark this UNDERDETERMINED and explicitly pass "navigating to the cases listing
    silently, without any deleted-confirmation statement" -- chosen to keep this task's surface minimal
    and leave what a screen states about an outcome to the case-delete-refusal-presentation task.
- inferred: onConfirm passes navigation as a per-call mutate() option rather than adding a second onSuccess
    to useDeleteCase() itself.
  from: Reading @tanstack/query-core's own mutation.js and mutationObserver.js to confirm the mutation-level
    onSuccess (cases-list invalidation, already delivered) and a mutate()-level onSuccess both fire, in
    that order -- letting this task add navigation without touching a file delete-case-mutation already
    delivered.
preserved:
- useDeleteCase()'s own mutationFn, path and onSuccess (cases-list invalidation) -- untouched, only consumed.
- Every other row and action in CaseDetailScreen's VersionsPanel (draft/released state cells, New draft
  link, current-version-validity alert, retry/loading/error branches) -- unchanged.
- useCasesList and useCaseVersions -- unchanged; the cases-listing and per-case version reads this task
  depends on for its criteria to hold.
deferred:
- what: Stating which refusal answered a delete that failed (CaseHoldsVersionsError, CaseNotFoundError,
    or an unrecognised code) on this surface.
  why: The task's own REMAINDER note assigns rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete
    and rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure
    to task/case-deletion-surface/case-delete-refusal-presentation; no criterion here reaches an onError
    path, so none was added.
---

## What it is
A typed-slug-confirmation delete dialog wired into CaseDetailScreen's VersionsPanel for a case holding no version, consuming the already-delivered useDeleteCase() mutation and navigating to the cases listing once accepted.

## Notes
None.
