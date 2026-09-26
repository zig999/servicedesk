---
title: A refused case delete tells the curator which refusal it met
summary: How the case detail surface presents a delete answered with CaseHoldsVersionsError, with CaseNotFoundError,
  or with any other refusal.
rationale: The scope asks for the refused outcomes to be presented but does not say how to cut them. They
  are cut apart from the accepted path because the presentation of refusals changes with the error-state
  map, and the accepted path changes with the listing.
sources:
- intake/scope.md
objective: A delete refused from the case detail surface tells the curator which of the stated refusals
  it met.
criteria:
- A delete answered with HTTP 409 CaseHoldsVersionsError is presented to the curator as the case holding
  a version and not having been deleted.
- A delete answered with HTTP 404 CaseNotFoundError is presented to the curator as no case answering that
  slug.
- What the surface presents for a CaseHoldsVersionsError refusal differs from what it presents for a CaseNotFoundError
  refusal.
- A delete refused with any error code other than CaseHoldsVersionsError or CaseNotFoundError is presented
  as a failure distinct from both of those refusals.
- After a delete answered with HTTP 409 CaseHoldsVersionsError, the cases listing still carries an entry
  for that slug.
depends_on:
- task/case-deletion-surface/case-holds-versions-error-state
- task/case-deletion-surface/case-detail-delete-control
implements:
- rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete
- rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure
- rules/knowledge/a-case-holding-no-version-may-be-deleted
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
- contracts/knowledge/case-lifecycle
- contracts/knowledge/case-query
- domain/knowledge/case
---

## What it is
The delete mutation's onError on the case detail surface, which maps the caught error through uiStateForApiError to what the curator is shown.
A VALIDATION_ERROR or INTERNAL_ERROR answer lands in the unrecognised-failure notice per rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure.

## Notes
UNDERDETERMINED, from the specification — the CaseNotFoundError criterion asks only that the surface present "no case answering that slug", not also that the case was not deleted, unlike its CaseHoldsVersionsError sibling. Passes: a surface that, on 404, says only "no case answers <slug>" with wording that could read as the case having just been removed.
UNDERDETERMINED, from the specification — no criterion requires the other-refusal notice to use unrecognised-reason wording or to withhold the refusal's error code, message and carried values, only that it be told apart from the two named refusals. Passes: a surface that on HTTP 500 or HTTP 400 shows "Delete failed: INTERNAL_ERROR, an unexpected error occurred" or lists the VALIDATION_ERROR details verbatim.
REMAINDER, from the specification — rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete's accepted-branch clause (stating the case was deleted) reaches no criterion here, which covers only refused deletes. Belongs to task/case-deletion-surface/case-detail-delete-control.
REMAINDER, from the specification — rules/knowledge/a-case-holding-no-version-may-be-deleted's cascade effect and 409 message/details shape, and rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's reach over reads and its details shape, reach no criterion here. Belongs to case-deletion-backend, already delivered.
REMAINDER, from the specification — rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug covers confirming the delete before it is issued; this task begins only once a delete has been issued and refused. Belongs to task/case-deletion-surface/case-detail-delete-control.
REMAINDER, from the specification — rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case covers only the accepted branch's landing destination. Belongs to task/case-deletion-surface/case-detail-delete-control.
ADVISORY, from the specification — read literally, rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's 404 wording would also cover a case that exists but holds no version, which the delete rule accepts; the delivered backend's own reading (404 only where no case answers the slug at all) is what criterion 2 follows, and is not contradicted, though the rule's own wording does not settle it by itself.
ADVISORY, from the specification — no candidate states what the surface tells the curator when a delete gets no answer carrying any error code at all (a transport failure, an unparseable body); this task's objective does not depend on that case.
ADVISORY, from the specification — criterion 5 describes what list-cases (contracts/knowledge/case-query) answers, which the backend alone satisfies whatever this surface does; it requires only that the surface not present the refused case as gone.
