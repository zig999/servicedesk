---
target: backend
title: Proof that discard accepts a draft failing validation
summary: Two new tests exercise the real discard route, controller and operation -- one against a real
  Postgres-backed store for a manifest-empty draft, one against a fake store standing in for the boundary
  a foreign key makes unreachable -- showing acceptance and a bodyless 204 for both a structural and a
  coherence validator failure, plus one pre-existing test cited for the no-content constraint it already
  fully decides.
implementation: sha256:2082fd82bc677386fe9b7b37affa364fce12549c317fe6b438719dcc64d67a25
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/draft-discard-while-invalid-prove-discard-accepts-a-draft-failing-validation-suite
tests:
- file: src/__tests__/integration/http/discard-accepts-an-invalid-draft.routes.spec.ts
  name: 'accepts a discard of a draft whose manifest holds no entry: the route answers 204 with an empty
    body, the store then answers no case version at that slug and number, and the case''s next draft is
    not numbered with the discarded draft''s number'
  proves: criteria 1-3 together, against the real chain (discard.routes.ts -> discard.controller.ts ->
    discardCaseVersion in discard.operation.ts -> RelationalCaseStore against real Postgres), over a draft
    actually created with an empty manifest; the response-body assertion also closes the task's own UNDERDETERMINED
    entry for this scenario
  fails_when: discardCaseVersion or the route/controller layer begins inspecting the draft's manifest
    before accepting a discard; the route answers a non-204 status or a non-empty body for a manifest-empty
    draft; the store still answers assembleVersion for that slug/version after the discard; or a case's
    next created draft is assigned the discarded draft's version number
  demonstrates: scenarios/knowledge/a-case-with-no-hypothesis-is-still-discardable
- file: src/__tests__/unit/http/discard.routes.spec.ts
  name: accepts a discard of a draft whose stored subject names a subject type the glossary does not hold,
    answering 204 with an empty body, routed through the real controller and the real discard operation
    rather than a mocked dependency
  proves: criterion 4, against the real chain over a stored version whose subject is an arbitrary string
    seeded into no glossary table; a real Postgres store cannot hold this state (a foreign key with no
    ON DELETE clause), so a minimal fake implementing ICaseStore stands in for the store boundary alone
    -- every method discardCaseVersion does not call throws if reached. The response-body assertion also
    closes the task's UNDERDETERMINED entry for this second scenario.
  fails_when: the route, controller or discardCaseVersion begins consulting glossary coherence before
    accepting the discard, so the discard is refused or the response carries a body for a draft whose
    subject the glossary does not hold
- file: src/__tests__/unit/http/discard.routes.spec.ts
  name: removes the named draft version through discard and answers 204 with a wholly empty body
  proves: constraints/a-successful-case-version-discard-answers-with-no-content's stated fitness -- an
    accepted discard answers HTTP 204 carrying no body -- a fact this pre-existing test already decides
    whole regardless of which validator condition the discarded draft failed, since the route and controller
    never branch on it
  fails_when: an accepted discard's response carries any body content, or answers a status other than
    204
  demonstrates: constraints/a-successful-case-version-discard-answers-with-no-content
untested:
- rules/knowledge/a-discard-is-offered-and-accepted-while-its-drafts-current-read-does-not-answer-a-case
  -- its own statement reaches "any other validator rule failing over v" generically, an open set validation-runs-at-every-read
  does not enumerate closed, not the two representative failures this proof exercises (a structural absence
  and a glossary-coherence failure). No finite test decides a totality over an unenumerated set; the two
  tests above are evidence toward the rule rather than a decision of it whole, and the task's own ADVISORY
  entry already flags this as a caller's judgment call on whether two representative cases are enough.
---

## What it is

Two new tests -- one integration test against a real, empty-manifest draft over the actual chain (route, controller, operation, Postgres store), one unit test against a fake store standing in for a glossary-incoherent subject a real store's own foreign key cannot hold -- prove discard accepts a draft failing validation for both a structural and a coherence reason, each asserting the response body is empty. A third, pre-existing test is cited as already deciding constraints/a-successful-case-version-discard-answers-with-no-content whole.

## Notes

None.
