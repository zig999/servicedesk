---
target: backend
title: Delete a case over the case-lifecycle surface — HTTP route, controller, dto
  and wiring
summary: Unit tests over the route/controller's own status and envelope mapping, an
  extended build-app wiring sweep, and two real-store integration tests proving acceptance-with-cascade,
  the two identical CaseHoldsVersionsError refusals, the CaseNotFoundError refusal,
  and the post-delete listing/create-draft-renumbering scenario.
implementation: sha256:c3f52ff105cfe3fdbfa927a673d6def2d7a90e58d553993602b5dc005d0f0271
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/case-deletion-delete-case-over-case-lifecycle-suite-3
tests:
- file: src/__tests__/unit/http/delete-case.routes.spec.ts
  name: removes the named case through delete and answers 204 with a wholly empty
    body
  proves: A delete request on the case-lifecycle surface naming a case that holds
    no case version is answered with HTTP 204 and an empty body.
  fails_when: the route stops answering 204 with an empty body, or stops passing the
    parsed slug through to the delete dependency, for an accepted delete.
- file: src/__tests__/unit/http/delete-case.routes.spec.ts
  name: refuses with the status the status map assigns CaseHoldsVersionsError when
    the named case holds a draft version, carrying that slug in its details — the
    route and controller add no error-mapping logic of their own, so this test and
    its sibling below (for a released version) are deliberately symmetric rather than
    distinguishing a boundary this layer cannot see
  proves: A delete request on the case-lifecycle surface naming a case that holds
    a draft case version is answered with HTTP 409 reporting a CaseHoldsVersionsError
    whose details carry that slug.
  fails_when: the route stops answering 409 with code CaseHoldsVersionsError and the
    slug somewhere in details when the delete dependency rejects with that error.
- file: src/__tests__/unit/http/delete-case.routes.spec.ts
  name: refuses with the identical status, code and details shape when the named case
    holds a released version instead of a draft one — the same disclosed scope boundary
    as its sibling above
  proves: A delete request on the case-lifecycle surface naming a case that holds
    a released case version is answered with HTTP 409 reporting a CaseHoldsVersionsError
    whose details carry that slug.
  fails_when: the route stops answering identically for this same error class (the
    route/controller cannot itself distinguish draft from released, so this is the
    same code path as the test above, exercised as its own named criterion).
- file: src/__tests__/unit/http/delete-case.routes.spec.ts
  name: refuses with the status the status map assigns CaseNotFoundError when no case
    answers an unknown slug, carrying that slug in its details
  proves: A delete request on the case-lifecycle surface naming a slug no case holds
    is answered with HTTP 404 reporting a CaseNotFoundError whose details carry that
    slug.
  fails_when: the route stops answering 404 with code CaseNotFoundError and the slug
    somewhere in details when the delete dependency rejects with that error.
- file: src/__tests__/unit/http/delete-case.routes.spec.ts
  name: answers 400 via validation for a request with an empty :slug segment, naming
    the path as what failed validation, without ever reaching delete
  proves: A delete request whose slug path segment fails the route's declared shape
    is answered with HTTP 400 with error code VALIDATION_ERROR and a non-empty details
    list, and UNDERDETERMINED entry 3 (that the message names the path).
  fails_when: the 400 stops carrying code VALIDATION_ERROR, its details list becomes
    empty, its message stops naming "path", or delete is invoked despite the malformed
    segment.
- file: src/__tests__/unit/http/delete-case.routes.spec.ts
  name: forwards CaseNotFoundError's own message through this route unreformatted,
    still naming the case in Brazilian Portuguese ("caso", never the English "case")
  proves: 'UNDERDETERMINED entry 2 (the CaseNotFoundError half): no criterion checks
    that this route''s own forwarded message stays in Brazilian Portuguese naming
    the case as "caso".'
  fails_when: this route's response carries an English message such as "Case 'x' was
    not found" instead of forwarding CaseNotFoundError's own Portuguese message unchanged.
- file: src/__tests__/unit/http/build-app.spec.ts
  name: reaches its own controller rather than answering 404, for the delete-case
    route (parameterized it.each entry added to REGISTERED_ROUTE_REQUESTS)
  proves: A delete request on the case-lifecycle surface reaches its own controller
    through the fully assembled app — buildApp, buildAppDependencies, lifecycleDependencies
    and routePluginFactories wired together.
  fails_when: build-app.ts stops registering createDeleteCaseRoutesPlugin(dependencies.deleteCase)
    in routePluginFactories, or buildAppDependencies/lifecycleDependencies stops threading
    caseLifecycle.delete through to dependencies.deleteCase.
- file: src/__tests__/integration/http/delete-case.routes.spec.ts
  name: accepts an HTTP delete of a case holding no version — removing it together
    with every hypothesis and every hypothesis-revision (released included) and collect
    it held — and refuses that same HTTP delete, through 409 reporting CaseHoldsVersionsError
    whose message names the case slug in Brazilian Portuguese and whose details carry
    exactly that slug and no other field, for a case holding a draft version and,
    identically, for one holding a released version, leaving each still held
  proves: rules/knowledge/a-case-holding-no-version-may-be-deleted's own statement,
    whole, reached through the HTTP route, controller and operation this task adds,
    against the real store — together with criteria 2, 3 and 7, and UNDERDETERMINED
    entry 1.
  fails_when: an accepted delete leaves any hypothesis, hypothesis-revision or collect
    of that case standing, or a refused delete answers with a status other than 409,
    a code other than CaseHoldsVersionsError, a message that does not name the slug
    in Portuguese, or details carrying anything but exactly {slug}.
  demonstrates: rules/knowledge/a-case-holding-no-version-may-be-deleted
- file: src/__tests__/integration/http/delete-case.routes.spec.ts
  name: refuses an HTTP delete naming a slug no case holds, through 404 reporting
    CaseNotFoundError carrying that slug
  proves: A delete request on the case-lifecycle surface naming a slug no case holds
    is answered with HTTP 404 reporting a CaseNotFoundError whose details carry that
    slug — end to end against the real store.
  fails_when: the real store's refusal for an unknown slug stops reaching the client
    as 404 CaseNotFoundError carrying that slug once routed through this task's own
    wiring.
- file: src/__tests__/integration/http/delete-case.routes.spec.ts
  name: given a case whose only draft version was discarded so it currently holds
    no version at all, when a curator deletes that case through this HTTP route, the
    deletion is accepted with 204 and an empty body, the case no longer appears in
    the case listing, and a later create-draft naming that same slug creates a new
    case under it as though the deleted one had never existed — a version numbered
    1, that case's next_version left standing at 2, and the listing holding exactly
    one entry for it
  proves: criteria 1, 6, 8, 9 and 10 together, and scenarios/knowledge/a-case-holding-no-version-is-deleted's
    own given/when/then, whole; and constraints/a-successful-case-deletion-answers-with-no-content's
    own fitness function.
  fails_when: an accepted delete of a versionless case stops answering 204 with an
    empty body, the deleted slug still appears anywhere in the case listing afterward,
    or a create-draft naming that slug afterward fails to originate a fresh case numbered
    version 1 with next_version 2 and exactly one listing entry.
  demonstrates: scenarios/knowledge/a-case-holding-no-version-is-deleted
- file: src/__tests__/unit/domain-depends-on-no-infrastructure.spec.ts
  name: the case, glossary, capability-registry and investigation modules import no
    driver and no framework
  proves: The delete operation's domain module imports no framework, driver or provider
    client package — this pre-existing test reads every .ts file under case/ by directory
    listing at run time, so src/case/delete-case.operation.ts is swept automatically
    without any edit to this file.
  fails_when: delete-case.operation.ts (or any other file under case/) imports fastify,
    pg, an ORM, or any other forbidden driver/framework package.
  demonstrates: constraints/the-domain-depends-on-no-infrastructure
not_applicable:
- edge_case: Two concurrent HTTP deletes of the same case (or a delete concurrent
    with a create-draft on the same slug)
  why: No criterion of this task states a concurrency requirement, and the transaction
    boundary that would decide the outcome is the store's own (proven by the sibling
    store task); this task's own code is a stateless pass-through with nothing of
    its own to race.
- edge_case: The database being slow, unreachable, or answering in an unexpected shape
    during a delete
  why: No criterion of this task names this failure, and the generic handling of it
    is the driver/repository layer's own concern, already the sibling store task's
    to prove, not this thin route/controller/operation's.
- edge_case: A slug segment containing characters that would need URL-encoding, or
    one exceeding some length
  why: deleteCaseParamsSchema states only z.string().min(1) — no criterion or node
    names a stricter shape, so no such boundary exists for this task's own DTO to
    be tested against.
untested:
- 'contracts/knowledge/case-lifecycle: the extended build-app.spec.ts sweep proves
  delete now reaches its own controller among the published surface, but no test in
  this proof decides the node''s declared operations list whole.'
- 'domain/knowledge/case: this task''s own tests exercise one consequence of the aggregate
  (delete + a later create-draft leaves next_version consistent and the slug reclaimable),
  but the node''s whole fact is not decided by a single test here.'
- 'domain/knowledge/case-version, domain/knowledge/hypothesis, domain/knowledge/hypothesis-revision:
  this task''s own implementation record claims no new code encodes them; their own
  facts are decided by the sibling store task''s tests and by their own already-delivered
  tasks.'
- 'rules/knowledge/a-case-is-created-by-the-first-create-draft-naming-its-slug: the
  integration scenario test decides only the ''no case holds s'' branch; the ''a case
  already holds s'' branch is the already-delivered create-draft task''s own to prove.'
- 'rules/knowledge/a-slug-identifies-one-case: this invariant is enforced by a database
  uniqueness constraint no path in this task''s own flow tests positively or negatively;
  it is exercised by create-draft''s own suite.'
- 'rules/knowledge/a-case-read-by-an-unknown-slug-or-version-is-refused: this task''s
  own unknown-slug test is one representative of a system-wide fact spanning every
  read and lifecycle operation, per the task''s own REMAINDER note.'
- 'constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  and constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese: both
  are scope: system facts; this proof''s own tests check only CaseHoldsVersionsError
  and CaseNotFoundError as reached through this one route.'
- 'constraints/a-malformed-request-is-refused-with-a-validation-error: scope: system,
  spanning a malformed path, query and body across the whole surface; this route has
  only a path segment to offer, so this proof''s own 400 test is one representative.'
---

## What it is

Route, controller and integration tests proving the delete-case HTTP surface end to end, against the real store.

## Notes

run/case-deletion-delete-case-over-case-lifecycle-suite failed at test-unit on the same unrelated, pre-existing timing flake (anthropic-assessment-consolidator.adapter.spec.ts) seen on both sibling tasks; not diagnosed, since the failing step is not the suite-role step, and the retry passed clean.

run/case-deletion-delete-case-over-case-lifecycle-suite-2 failed at the suite-role (test) step with two failures, both in this task's own new file src/__tests__/integration/http/delete-case.routes.spec.ts. The failure-diagnostician classed both cause: test, confirming the implementation is correct: (1) a fixture slug prefix ("delete-case-http-rule") accidentally contained the English word "case", tripping the message's own English-word check; renamed to "delete-caso-http-rule". (2) a listing assertion relied on a fixed-size page (limit 1000) of the shared, persistent test database's `cases` table, which by then held more rows than one page could guarantee to contain the freshly created slug; replaced with a helper that walks every page. Both were fixture defects, not implementation defects.

run/case-deletion-delete-case-over-case-lifecycle-suite-3 passed clean; this record pins that run.
