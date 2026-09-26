---
title: Delete a case over the case-lifecycle surface
summary: The domain-level delete operation and its HTTP route, controller and dto,
  wired into the case-lifecycle factory and the app.
rationale: The scope states no cut. The operation module has no consumer other than
  its route and only passes through to the store, so it is kept with the route under
  one objective instead of being cut into a task with nothing of its own to demonstrate.
  The scenario's listing and re-creation outcomes are placed here because they are
  what the published surface shows.
sources:
- intake/scope.md
objective: A curator's delete request on the case-lifecycle surface removes a case
  that holds no case version, answering HTTP 204 with no body, and is refused for
  any other case as the rules state.
criteria:
- A delete request on the case-lifecycle surface naming a case that holds no case
  version is answered with HTTP 204 and an empty body.
- A delete request on the case-lifecycle surface naming a case that holds a draft
  case version is answered with HTTP 409 reporting a CaseHoldsVersionsError whose
  details carry that slug.
- A delete request on the case-lifecycle surface naming a case that holds a released
  case version is answered with HTTP 409 reporting a CaseHoldsVersionsError whose
  details carry that slug.
- A delete request on the case-lifecycle surface naming a slug no case holds is answered
  with HTTP 404 reporting a CaseNotFoundError whose details carry that slug.
- A delete request whose slug path segment fails the route's declared shape is answered
  with HTTP 400 with error code VALIDATION_ERROR and a non-empty details list.
- After an accepted delete, the case listing holds no entry for the deleted slug.
- After an accepted delete of a case whose hypotheses included a released hypothesis-revision
  with a collect, no hypothesis, hypothesis-revision or collect of that case remains.
- After an accepted delete, a create-draft naming the deleted slug creates a case
  version numbered 1.
- After an accepted delete and a create-draft naming the deleted slug, that case's
  next_version stands at 2.
- After an accepted delete and a create-draft naming the deleted slug, the case listing
  holds exactly one entry for that slug.
- The delete operation's domain module imports no framework, driver or provider client
  package.
depends_on:
- task/case-deletion/store-deletes-a-versionless-case
implements:
- rules/knowledge/a-case-holding-no-version-may-be-deleted
- constraints/a-successful-case-deletion-answers-with-no-content
- scenarios/knowledge/a-case-holding-no-version-is-deleted
- contracts/knowledge/case-lifecycle
- domain/knowledge/case
- domain/knowledge/case-version
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug
- rules/knowledge/a-slug-identifies-one-case
- rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/the-domain-depends-on-no-infrastructure
---

## What it is

A delete operation module, added as a delete entry on CaseLifecycleOperations.
Its route file, thin controller and zod dto, wired in build-app.factory.ts and registered in build-app.ts's routePluginFactories.
An accepted delete answers HTTP 204 with no body, per constraints/a-successful-case-deletion-answers-with-no-content.

## Notes

UNDERDETERMINED, from the specification — criteria 2-3 check only that the 409's details "carry" the slug, not that the message names it and the details carry the slug and nothing else, as rules/knowledge/a-case-holding-no-version-may-be-deleted's own statement requires. Passes: a 409 CaseHoldsVersionsError whose details hold the slug plus other fields, or whose message does not name the slug.
UNDERDETERMINED, from the specification — no criterion checks the Brazilian-Portuguese vocabulary constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese and constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word fix for CaseHoldsVersionsError's and CaseNotFoundError's own messages on this route. Passes: an English message such as "Case 'x' still holds draft versions".
UNDERDETERMINED, from the specification — criterion 5 checks the 400's status, code and non-empty details list, but not that its message names the path as what failed validation, per constraints/a-malformed-request-is-refused-with-a-validation-error. Passes: a 400 VALIDATION_ERROR with a non-empty details list whose message is generic or names the body instead.
REMAINDER, from the specification — clauses of rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused and rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug about reads, about other lifecycle operations, and about an existing-slug create-draft reach no criterion here; delete names only a slug and this task uses only the no-case-holds-the-slug and post-delete-recreation branches. Belongs to the read operations and the other case-lifecycle operations (create-draft, discard, release), each already delivered or in its own task.
ADVISORY, from the specification — read literally, rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused's 404 would also cover a case that exists but holds no version; its own Description and rules/knowledge/a-case-holding-no-version-may-be-deleted's acceptance of that same case both say the 404 test is whether any case holds the slug, never whether a version answers it.
ADVISORY, from the specification — rules/knowledge/a-case-holding-no-version-may-be-deleted declares consistency: eventual over case, case-version, hypothesis and hypothesis-revision; removing the case and its hypotheses/revisions/collects may run in one transaction or settle one after the other, and no criterion depends on which — a test of the hypothesis-removal criterion should read the state once the delete has settled.
