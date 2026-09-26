---
target: frontend
title: Refusal presentation for a case delete on the case detail surface
summary: The delete mutation's onError on CaseDetailScreen now maps CaseHoldsVersionsError, CaseNotFoundError
  and every other refusal to three distinguishable, inline-rendered statements, without touching the accepted
  path.
task: sha256:bce3e58b9e37b025ee9fbe88b38aceb6e5e524f396f2af4a61a8a6f6c0096a2e
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-deletion-surface-case-delete-refusal-presentation-build
files:
- path: src/services/case-delete-confirmation.ts
  effect: Adds caseDeleteFailureMessage(error, slug) -- maps a caught delete error through uiStateForApiError
    to one of three static messages (case-holds-versions, case-not-found, unrecognised-failure fallback)
    -- and extends CaseDeleteControlState / buildCaseDeleteControlState with an errorMessage field (string
    | null), cleared whenever the dialog's own open state changes.
- path: src/hooks/use-case-delete-control.ts
  effect: Wires an onError callback into the deleteCase.mutate() call (alongside the existing onSuccess),
    setting the new errorMessage state from caseDeleteFailureMessage(error, slug).
- path: src/routes/case-delete-dialog.tsx
  effect: Renders control.errorMessage inline as a role="alert" paragraph beside the slug-confirmation
    input, with aria-invalid and aria-describedby wired to it when a message is present.
criteria:
- criterion: A delete answered with HTTP 409 CaseHoldsVersionsError is presented to the curator as the
    case holding a version and not having been deleted.
  met: true
  how: 'caseDeleteFailureMessage returns "This case was not deleted: it still holds at least one version."
    for the "case-holds-versions" UI-state kind (already mapped from CaseHoldsVersionsError by error-ui-state.ts);
    use-case-delete-control.ts''s onError sets this as the dialog''s errorMessage, and case-delete-dialog.tsx
    renders it inline.'
- criterion: A delete answered with HTTP 404 CaseNotFoundError is presented to the curator as no case
    answering that slug.
  met: true
  how: 'caseDeleteFailureMessage''s "case-not-found" branch returns "This case was not deleted: no case
    answers <slug>." (interpolating the confirmed slug), rendered the same way.'
- criterion: What the surface presents for a CaseHoldsVersionsError refusal differs from what it presents
    for a CaseNotFoundError refusal.
  met: true
  how: The two branches return distinct static strings, so the two are never the same rendered text.
- criterion: A delete refused with any error code other than CaseHoldsVersionsError or CaseNotFoundError
    is presented as a failure distinct from both of those refusals.
  met: true
  how: caseDeleteFailureMessage's fallback branch (reached for every other ApiError kind, and for a caught
    error that is not an ApiError instance at all) returns UNRECOGNISED_DELETE_FAILURE_MESSAGE, a third
    string distinct from both named-refusal messages, disclosing no error code, message or carried value.
- criterion: After a delete answered with HTTP 409 CaseHoldsVersionsError, the cases listing still carries
    an entry for that slug.
  met: true
  how: Satisfied by omission rather than new code -- use-delete-case.ts's useMutation only invalidates
    the "cases-list" query key from its own onSuccess; no code path this task adds touches that cache
    on a refusal.
nodes:
- node: rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete
  encoded_at:
  - src/services/case-delete-confirmation.ts
  - src/hooks/use-case-delete-control.ts
  - src/routes/case-delete-dialog.tsx
  how: 'Encodes only this node''s two refusal clauses -- the CaseHoldsVersionsError statement and the
    CaseNotFoundError statement, told apart from one another. The node''s accepted-branch clause is not
    touched by this delivery: it was assigned by this task''s own REMAINDER note to task/case-deletion-surface/case-detail-delete-control,
    whose delivered implementation chose silent navigation instead, a choice its own proof records as
    contested rather than settled.'
- node: rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure
  encoded_at:
  - src/services/case-delete-confirmation.ts
  - src/hooks/use-case-delete-control.ts
  - src/routes/case-delete-dialog.tsx
  how: caseDeleteFailureMessage's fallback branch states only that the delete failed for a reason the
    screen does not recognise, told apart from the two named-refusal statements, and discloses neither
    the error's code, nor its message, nor any carried value.
- node: rules/knowledge/a-case-holding-no-version-may-be-deleted
  encoded_at:
  - src/services/case-delete-confirmation.ts
  how: This task reaches only this rule's CaseHoldsVersionsError refusal as something the surface must
    present; the accept/refuse decision itself, the cascade removal and the 409's message/details shape
    are the backend's, already delivered and out of this task's reach.
- node: rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
  encoded_at:
  - src/services/case-delete-confirmation.ts
  how: This task reaches only this rule's CaseNotFoundError refusal as something the surface must present
    for a delete; the refusal's own reach over reads, and its details shape, are the backend's, already
    delivered and out of this task's reach.
- node: contracts/knowledge/case-lifecycle
  encoded_at:
  - src/hooks/use-case-delete-control.ts
  how: Reaches only the already-published delete operation's refusal outcomes; no other operation this
    contract publishes is touched.
- node: contracts/knowledge/case-query
  how: Reached only through criterion 5, which this delivery satisfies by adding no cache invalidation
    on a refused delete -- list-cases' own answer is exercised by no new code here.
- node: domain/knowledge/case
  encoded_at:
  - src/services/case-delete-confirmation.ts
  how: The CaseNotFoundError message names the case's own slug, read from the confirmed slugConfirmation
    value already threaded through this control.
inferences:
- inferred: The exact wording of all three messages -- the specification states the facts each must carry
    but never a literal sentence.
  from: rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete's and rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure's
    own expression text.
- inferred: The CaseNotFoundError message states both that the case was not deleted and that no case answers
    the slug, rather than only the narrower "no case answering that slug" the task's own UNDERDETERMINED
    note would also have accepted.
  from: rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete's expression,
    which states both facts unconditionally for that branch; chosen as the fuller, still-passing reading
    since nothing blocks it.
- inferred: A caught error that is not an ApiError instance at all (a transport failure, an unparseable
    body) is routed through the same unrecognised-failure message rather than left unhandled.
  from: This task's own ADVISORY note, which states no candidate settles this case; the unrecognised-failure
    branch already existed as the natural fallback, so extending it here costs nothing and leaves no case
    silently unhandled.
- inferred: The refusal message is rendered inline in the dialog (an errorMessage field threaded through
    CaseDeleteControlState, shown as a role="alert" paragraph) rather than through a toast.
  from: discard-confirmation.ts and discard-draft-dialog.tsx's own convention for the same typed-slug-confirmation
    dialog family case-delete-dialog.tsx already belongs to, read as the closer sibling than the toast-based
    convention used by the plain-dialog family (connector configuration, glossary concept).
divergences:
- from: The connector-configuration / glossary-concept convention of surfacing a delete's onError message
    through toast.error(...).
  departure: case-delete-dialog.tsx renders the refusal message inline (a role="alert" paragraph beside
    the slug-confirmation input) rather than through a toast.
  why: case-delete-dialog.tsx is already a typed-slug-confirmation dialog, the same family as discard-draft-dialog.tsx,
    which surfaces its own mutation failure inline rather than as a toast; following that closer sibling
    keeps the message visible beside the control the curator is still looking at.
- from: The connector-configuration / glossary-concept convention of a generic "Nothing was removed."-style
    wording for every refusal the surface does not otherwise name.
  departure: caseDeleteFailureMessage's fallback branch states that the delete failed for a reason the
    screen does not recognise, rather than a generic "nothing was removed" sentence.
  why: rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure,
    which this task implements, requires the notice to state that the delete failed "for a reason it does
    not recognise" and to disclose nothing else about the refusal -- a stronger and more specific requirement
    than the sibling wording carries.
preserved:
- CaseDetailScreen's delete control visibility, conditioned on the case's versions read answering zero
  versions
- The typed-slug confirmation gate (isConfirmEnabled) and its case-sensitive equality check
- Exactly one DELETE despite a double click, via isDeleting disabling the confirm button
- The onSuccess path's navigation to /cases and its invalidation of the "cases-list" query key
- Dialog dismissal (Keep case / Escape / backdrop) issuing no DELETE
deferred:
- what: Whether the accepted-delete branch must additionally state that the case was deleted (rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete's
    accepted clause), against the delivered case-detail-delete-control's silent-navigation choice.
  why: This task's own criteria reach only the refused branch; the disagreement is recorded, unresolved,
    in delivery/case-deletion-frontend/proof/case-deletion-surface/case-detail-delete-control.md's contested
    entry. Settling it belongs to the scope or to the specification, not to this task -- this delivery
    touches no code on the accepted path and adds nothing to that disagreement.
---

## What it is
Wires an onError path into the case delete control, mapping CaseHoldsVersionsError, CaseNotFoundError and every other refusal to three distinguishable, inline-rendered statements.

## Notes
None.
