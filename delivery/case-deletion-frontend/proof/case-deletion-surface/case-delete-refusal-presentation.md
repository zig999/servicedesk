---
target: frontend
title: Refusal presentation for a case delete on the case detail surface
summary: Tests over CaseDetailScreen's rendered delete dialog proving each of the three distinguishable,
  disclosure-appropriate refusal statements this task wires (CaseHoldsVersionsError, CaseNotFoundError,
  any other code), their mutual distinctness, and that the cases listing still carries the refused case's
  own slug.
implementation: sha256:fd920b8d8e585da6bbb4869656d9dad1dda77298faeceee50918a972532332f1
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-deletion-surface-case-delete-refusal-presentation-suite
tests:
- file: src/routes/case-detail-screen-delete-refusal.spec.ts
  name: presents a CaseHoldsVersionsError refusal as the case still holding a version and not having been
    deleted
  proves: Criterion 1 (a delete answered with HTTP 409 CaseHoldsVersionsError is presented as the case
    holding a version and not having been deleted)
  fails_when: The rendered message for a 409 CaseHoldsVersionsError refusal fails to state that the case
    was not deleted, or fails to state that it still holds a version.
- file: src/routes/case-detail-screen-delete-refusal.spec.ts
  name: presents a CaseNotFoundError refusal as the case not having been deleted and no case answering
    the slug
  proves: Criterion 2, read under the fuller reading the delivered implementation chose (both that no
    case answers the slug and that the case was not deleted); and UNDERDETERMINED entry 1, by refusing
    exactly the weaker implementation it names.
  fails_when: The rendered message for a 404 CaseNotFoundError refusal omits the confirmed slug, omits
    that no case answers it, or omits that the case was not deleted.
- file: src/routes/case-detail-screen-delete-refusal.spec.ts
  name: renders different text for a CaseHoldsVersionsError refusal than for a CaseNotFoundError refusal
  proves: Criterion 3 (what the surface presents for a CaseHoldsVersionsError refusal differs from what
    it presents for a CaseNotFoundError refusal)
  fails_when: The two rendered messages, captured from two separate mounts triggering each refusal in
    turn, are the same text.
- file: src/routes/case-detail-screen-delete-refusal.spec.ts
  name: presents any other refusal as a failure distinct from both named refusals, disclosing neither
    its code, its message, nor any carried value
  proves: Criterion 4; and UNDERDETERMINED entry 2, by refusing exactly the implementations it names --
    a notice showing the raw error code and message, or one listing the refusal's details verbatim.
  fails_when: The rendered notice for a refusal carrying an unnamed code (HTTP 500 INTERNAL_ERROR) fails
    to state that the delete failed for a reason the screen does not recognise, or contains the error's
    code, its message, or its carried detail value, or matches either named refusal's own wording.
  demonstrates: rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure
- file: src/routes/case-detail-screen-delete-refusal.spec.ts
  name: still lists the refused case's own slug on the cases listing once a CaseHoldsVersionsError refusal
    is met
  proves: Criterion 5 (after a delete answered with HTTP 409 CaseHoldsVersionsError, the cases listing
    still carries an entry for that slug)
  fails_when: The cases listing, once the curator navigates there after the refused delete, no longer
    shows the refused case's own slug.
not_applicable:
- edge_case: A second "other" error code beyond the one representative tested (e.g. both an HTTP 500 INTERNAL_ERROR
    and an HTTP 400 VALIDATION_ERROR in separate tests).
  why: caseDeleteFailureMessage's fallback branch is reached identically, and inspects nothing about the
    specific code, message or details, for every code that is neither CaseHoldsVersionsError nor CaseNotFoundError;
    a second representative proves nothing the first did not already prove.
- edge_case: Two curators issuing a delete, or reading the listing, against the same case concurrently.
  why: No criterion of this task states a concurrency guarantee, and the constraining node declares consistency
    eventual at the backend.
- edge_case: The dialog's own open/retry state, or a second delete attempt, after a refusal is shown.
  why: No criterion of this task states what happens to the dialog's open state or to a further delete
    attempt after a refusal -- only what message it presents. The control's own state machine is task/case-deletion-surface/case-detail-delete-control's
    own, already tested there.
untested:
- rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete's fact, whole (its
  accepted-branch clause together with the two refusal clauses and their mutual distinctness). This task's
  own REMAINDER note assigns the accepted-branch clause to task/case-deletion-surface/case-detail-delete-control;
  only the two refusal clauses and their distinctness are exercised here.
- rules/knowledge/a-case-holding-no-version-may-be-deleted's fact, whole (the accept/refuse decision,
  the cascade removal, and the 409's message/details shape). The policy's own accept/refuse and cascade
  facts are the backend's, already delivered and tested there.
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's fact, whole (its reach over reads,
  and the 404's details shape). The rule's reach over reads and its details shape are the backend's, already
  delivered and tested there.
- contracts/knowledge/case-lifecycle's fact, whole. This task exercises only delete's refusal outcomes;
  the other eight published operations this contract names are untouched.
- contracts/knowledge/case-query's fact, whole. Criterion 5 is satisfied by this task adding no new cache
  invalidation on a refused delete; no read this task adds is tested against this contract.
- domain/knowledge/case's fact, whole. The aggregate's Description spans attributes and operations beyond
  delete; this task's tests exercise only the slug-identity dimension reached through the CaseNotFoundError
  message.
- The implementation's inference that a caught error which is not an ApiError instance at all is routed
  through the same unrecognised-failure fallback. No criterion or node requires this; left unpinned rather
  than tested, per the implementation record's own inference note.
---

## What it is
Tests over the case delete dialog's rendered refusal notice for CaseHoldsVersionsError, CaseNotFoundError and any other error code, and over the cases listing's own post-refusal state.

## Notes
None.
