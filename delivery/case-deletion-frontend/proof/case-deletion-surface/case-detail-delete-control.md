---
target: frontend
title: Delete control on the case detail surface for a case holding no version
summary: Frontend tests for the slug-confirmed delete dialog on CaseDetailScreen -- its conditional visibility,
  the further explicit act it requires before issuing a DELETE, exactly one DELETE under a double click,
  the post-accept navigation to the cases listing, and the listing's own state once the delete is accepted
  -- with the accepted-delete statement question left untested rather than pinned either way.
implementation: sha256:a2517bd338fb2cfc33dda871d348ab09d8febf325970226889524f114286031d
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/case-deletion-surface-case-detail-delete-control-suite
tests:
- file: src/routes/case-detail-screen-delete-control.spec.ts
  name: offers a Delete case control once the case's own versions read answers no version
  proves: Criterion 1 (the case detail surface offers a delete control for a case whose versions read
    answers no version), positive representative
  fails_when: The versions read answers zero versions and CaseDetailScreen renders no "Delete case" control.
- file: src/routes/case-detail-screen-delete-control.spec.ts
  name: renders no Delete case control when the case holds at least one version
  proves: Criterion 1, the boundary representative -- a case holding a version offers no delete control
  fails_when: The versions read answers at least one version and CaseDetailScreen still renders a "Delete
    case" control.
- file: src/routes/case-detail-screen-delete-control.spec.ts
  name: issues a DELETE to /v1/cases/:slug only once the curator both opens the control and reproduces
    the case's own slug exactly in a further confirm -- never on opening alone, never on a mismatched
    act, and never on declining
  proves: Criterion 2 (completing the delete act sends exactly one DELETE to /v1/cases/<slug>); UNDERDETERMINED
    entries 1 and 2 (opening the control alone issues no delete, and neither a mismatched slug nor declining
    issues one); the frontend-observable half of rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug
  fails_when: A DELETE fires on opening the dialog alone, on a mismatched or uppercase-typed slug, or
    on clicking "Keep case" -- or no DELETE fires once the exact slug is typed and the confirm button
    is clicked.
- file: src/routes/case-detail-screen-delete-control.spec.ts
  name: issues exactly one DELETE even when the confirm control is clicked twice in quick succession
  proves: Criterion 2's double-click boundary -- a second click while the mutation is already pending
    issues no second DELETE
  fails_when: A second DELETE call is observed after two rapid clicks on the confirm button while the
    first request is still pending.
- file: src/routes/case-detail-screen-delete-control.spec.ts
  name: navigates to the cases listing route once the delete is accepted, rather than staying on the deleted
    case's own detail route
  proves: UNDERDETERMINED entry 3 (the curator is taken to the cases listing, never left on the deleted
    case's own detail route)
  fails_when: The router's location after an accepted delete is anything other than /cases (e.g. it stays
    on /cases/<slug>).
  demonstrates: rules/knowledge/a-successful-case-deletion-lands-on-the-listing-of-every-case
- file: src/routes/case-detail-screen-delete-outcome-listing.spec.ts
  name: no longer lists the deleted case's own slug and still lists every other case once the curator
    lands on the cases listing
  proves: Criteria 3 and 4 (the cases listing carries no entry for the deleted slug and still carries
    every other case, after the 204)
  fails_when: The cases listing, once the curator lands on it after the accepted delete, still shows the
    deleted slug, or no longer shows the other case's slug.
not_applicable:
- edge_case: A case holding two or more versions, as a further representative beyond the one-version boundary
    already tested.
  why: Criterion 1 and the visibility node treat "holds any version" as one class; a second count inside
    that class proves the same thing the one-version representative already proves.
- edge_case: An empty typed-confirmation field, as a further representative beyond the uppercase mismatch
    already tested.
  why: isConfirmEnabled is a single equality check (typed === slug); empty and case-mismatched input are
    the same "typed !== slug" class.
- edge_case: Dismissing the dialog by Escape or by a backdrop click, as further representatives beyond
    the "Keep case" click already tested.
  why: The implementation's own record treats Keep case, Escape and backdrop as the same onOpenChange
    path; one representative of the "decline" class is tested.
- edge_case: The delete request refused with CaseHoldsVersionsError, CaseNotFoundError, an unrecognised
    code, or a network failure.
  why: No criterion of this task reaches an onError path; the task's own REMAINDER note assigns the refusal-presentation
    behavior to task/case-deletion-surface/case-delete-refusal-presentation.
- edge_case: Two curators deleting, or reading the listing, concurrently.
  why: No criterion of this task states a concurrency guarantee, and the constraining node declares consistency
    eventual at the backend, which this task's frontend surface does not arbitrate.
untested:
- The accepted-delete statement UNDERDETERMINED entry 4 names (whether the surface states that the case
  was deleted, or navigates silently). No test is written either way -- a test asserting "deleted" would
  fail against the delivered silent-navigation choice, and the opposite would pin a reading the criteria
  do not decide. See contested for why this entry's own classification is disputed.
- rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete's fact, whole (its
  accepted clause and both refusal clauses). No test in this task's files decides the node whole; the
  refusal clauses are out of scope (REMAINDER) and the accepted clause is the subject of the disagreement
  recorded under contested.
- rules/knowledge/a-case-deletion-takes-a-further-explicit-act-reproducing-the-cases-own-slug's fact,
  whole. The frontend-observable half (which acts issue a delete) is fully covered; the clause that declining
  leaves the case, hypotheses, revisions and collects untouched is backend state no frontend test can
  observe -- relied on by inference only.
- scenarios/knowledge/a-case-holding-no-version-is-deleted's fact, whole. Its first two then-clauses are
  covered by the outcome-listing test; its third (a future create-draft reclaiming the freed slug) is
  not exercised by anything in this task.
- rules/knowledge/a-case-holding-no-version-may-be-deleted's fact. The accept/refuse decision is the backend's,
  already delivered and tested; this task's frontend only conditions a control's visibility on the same
  zero-version fact, already covered as criterion 1.
- constraints/a-successful-case-deletion-answers-with-no-content's fact. This task's tests mock a 204
  response and rely on it; they do not independently assert that apiFetch<void> treats 204 as returning
  undefined -- that is delete-case-mutation's own, already-proven behavior.
- contracts/knowledge/case-lifecycle's and contracts/knowledge/case-query's facts. Each publishes several
  operations; this task exercises only delete and relies on the already-existing list-cases refetch without
  testing a new read.
- domain/knowledge/case's fact. The aggregate's Description spans more than the delete path; this task's
  tests exercise only the slug-identity dimension reached through delete.
contested:
- what: rules/knowledge/a-case-deletion-surface-states-which-refusal-answered-its-delete's accepted clause,
    over whether silent navigation (no statement that the case was deleted) satisfies the node.
  why: The task's Notes classify this gap as UNDERDETERMINED and record silent navigation as passing,
    but the node's own statement is unconditional on this point ("where the delete was accepted, the surface
    states that the case was deleted") and carries no clause scoping it to only the refusal outcomes.
    The task's REMAINDER note defers only "the refusal clauses" of this node to case-delete-refusal-presentation;
    nothing defers the accepted clause, and the task's own implements list carries the node whole. The
    implementation record's own per-node account for this node shows no encoded_at at all -- by its own
    admission nothing here is contributed toward the node's fact, accepted clause included. Read this
    way, the accepted-clause silence is not a reading the criteria leave open; it is this node's own stated
    requirement left unimplemented by a task that lists the node as one it implements. No test is written
    over this disagreement -- the route for it is a record, not a test that would overrule a delivered,
    criterion-satisfying implementation.
---

## What it is
Frontend tests over CaseDetailScreen's delete control: visibility, the slug-confirmation gate, double-click safety, post-accept navigation, and the cases-listing's own state once the delete is accepted.

## Notes
None.
