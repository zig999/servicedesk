---
title: Delete control on the detail surface of a case holding no version
summary: A control on CaseDetailScreen that deletes a case whose versions read answers no version, after
  which the case is gone from the cases listing.
rationale: The scope asks for a way to delete but does not say where. The case detail surface was chosen
  because its VersionsPanel is the one place that already tells a case holding no version apart from one
  holding a version. One placement was cut instead of a second one on the listing's rows.
sources:
- intake/scope.md
objective: A curator on the detail surface of a case holding no version deletes that case, after which
  the cases listing no longer carries it.
criteria:
- The case detail surface, for a case whose versions read answers no version, offers a control to delete
  that case.
- Completing the delete act from that control sends exactly one HTTP DELETE request to /v1/cases/<that
  case's slug>.
- After the delete is answered with HTTP 204, the cases listing carries no entry for the deleted slug.
- After the delete is answered with HTTP 204, the cases listing still carries an entry for every other
  case it carried before the delete.
depends_on:
- task/case-deletion-surface/delete-case-mutation
implements:
- rules/knowledge/a-case-holding-no-version-may-be-deleted
- constraints/a-successful-case-deletion-answers-with-no-content
- scenarios/knowledge/a-case-holding-no-version-is-deleted
- contracts/knowledge/case-lifecycle
- contracts/knowledge/case-query
- domain/knowledge/case
- rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug
- rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case
- rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete
---

## What it is
A delete control on frontend/app/src/routes/case-detail-screen.tsx, next to the VersionsPanel statement that the case currently holds no version.
It consumes the case-delete mutation, and a confirming act reproducing the case's own slug per rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug, landing on the cases listing per rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case once accepted.

## Notes
UNDERDETERMINED, from the specification — no criterion requires that taking the control alone issues no delete, or that a further explicit act reproducing the case's own slug is what actually sends it. Passes: a control that sends the DELETE immediately on the first click, or after a plain yes/no confirm asking for no slug.
UNDERDETERMINED, from the specification — no criterion requires that an act reproducing no slug or the wrong slug issues no delete, or that declining leaves the case, its hypotheses, revisions and collects untouched. Passes: a confirm step that sends the DELETE whatever the curator types into a slug field, or on cancel/dismiss.
UNDERDETERMINED, from the specification — no criterion says where the curator is taken after the 204; rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case requires landing on the cases listing, never on a surface keyed on the deleted slug. Passes: staying on the case detail surface after the 204, which then shows the 404 CaseNotFoundError refusal for that now-deleted slug.
UNDERDETERMINED, from the specification — no criterion asks the surface to state anything after an accepted delete, though rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete's accepted clause requires stating that the case was deleted. Passes: navigating to the cases listing silently, without any deleted-confirmation statement.
REMAINDER, from the specification — the refusal clauses of rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete and of rules/knowledge/a-case-deletion-refusal-the-surface-cannot-name-is-told-as-an-unrecognised-failure reach no criterion of this task. Belongs to task/case-deletion-surface/case-delete-refusal-presentation.
REMAINDER, from the specification — rules/knowledge/a-case-holding-no-version-may-be-deleted's server-side cascade effect and its 409 message/details shape reach no criterion here. Belongs to case-deletion-backend's delete-case-over-case-lifecycle, already delivered.
ADVISORY, from the specification — no candidate states the request path "/v1/cases/<slug>"; contracts/knowledge/case-lifecycle publishes delete as an operation with no route, so the executor should confirm the path against the backend route case-deletion-backend already delivered.
ADVISORY, from the specification — constraints/a-malformed-request-is-refused-with-a-validation-error and constraints/a-domain-error-unmapped-by-status-is-refused-generically are system-wide wire answers and neighbours to this task, left out of implements.
