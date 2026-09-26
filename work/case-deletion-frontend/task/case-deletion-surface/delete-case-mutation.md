---
title: Case-delete client mutation
summary: A mutation hook that sends DELETE /v1/cases/:slug and invalidates the cases listing when the
  delete is accepted.
rationale: The scope does not state this cut. The hook is the interface the detail surface consumes, so
  it is cut apart from its consumer. It follows the sibling removals the survey found in use-connector-configuration-detail.ts
  and use-glossary-concepts.ts, with no bespoke shape.
sources:
- intake/scope.md
objective: Invoking the case-delete mutation for a slug sends the case-lifecycle delete for that slug
  and, once accepted, leaves the cases listing to be read again.
criteria:
- Invoking the mutation for slug s sends exactly one HTTP DELETE request to /v1/cases/s.
- An HTTP 204 answer with an empty body settles the mutation as succeeded.
- A succeeded mutation invalidates the query backing the cases listing.
- An HTTP 409 answer settles the mutation as failed with an ApiError whose code is CaseHoldsVersionsError.
- An HTTP 404 answer settles the mutation as failed with an ApiError whose code is CaseNotFoundError.
implements:
- contracts/knowledge/case-lifecycle
- domain/knowledge/case
- constraints/a-successful-case-deletion-answers-with-no-content
- rules/knowledge/a-case-holding-no-version-may-be-deleted
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
- scenarios/knowledge/a-case-holding-no-version-is-deleted
---

## What it is
A useMutation over apiFetch<void>(`/v1/cases/${slug}`, { method: "DELETE" }), placed beside the existing case hooks under frontend/app/src/hooks.
apiFetch already returns undefined for a 204 and throws ApiError for any non-2xx answer.

## Notes
UNDERDETERMINED, from the specification — no criterion says what the mutation settles with when the answer is neither 204, 409 nor 404 (for example HTTP 500 INTERNAL_ERROR or HTTP 400 VALIDATION_ERROR); rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure requires the surface to tell such a refusal apart from the two named ones, which requires the mutation to keep the wire code rather than mapping it onto CaseHoldsVersionsError or CaseNotFoundError. Passes: a mutation that settles every other non-204 answer as failed with an ApiError whose code is CaseNotFoundError, meeting all five criteria while leaving the surface unable to tell an unanticipated refusal apart from case-not-found.
REMAINDER, from the specification — the accepted branch's server-side effect (removing the case, its hypotheses, their revisions and collects) and the 409's message/details shape reach no criterion here. Belongs to case-deletion-backend's delete-case-over-case-lifecycle, already delivered.
REMAINDER, from the specification — rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's reach over reads and other lifecycle operations, and its details shape, reach no criterion here; only the 404-on-delete answer is used. Belongs to the case-query read surfaces and the other case-lifecycle operations' own tasks.
REMAINDER, from the specification — rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug's confirmation gate reaches no criterion here; this mutation sends the delete whenever invoked. Belongs to task/case-deletion-surface/case-detail-delete-control.
REMAINDER, from the specification — rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case's landing destination reaches no criterion here; this task only invalidates the listing query. Belongs to task/case-deletion-surface/case-detail-delete-control.
REMAINDER, from the specification — rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete's telling of deleted/not-deleted reaches no criterion here. Belongs to task/case-deletion-surface/case-delete-refusal-presentation.
REMAINDER, from the specification — rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure's unrecognised-failure notice reaches no criterion here beyond the underdetermined note above. Belongs to task/case-deletion-surface/case-delete-refusal-presentation.
ADVISORY, from the specification — criterion 3's "query backing the cases listing" is contracts/knowledge/case-query's list-cases; this task only invalidates it and never calls it, so case-query is left out of implements as a neighbour.
ADVISORY, from the specification — read literally, rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's 404 wording would also cover a case holding no version, which the delete rule accepts; criterion 5 is consistent with the backend's own delivered reading (404 only where no case answers the slug at all), but the rule's own wording does not settle it by itself.
