---
title: Proof that read-case's answer carries no document hash
summary: Two new/rewritten unit tests prove ReadCaseResult carries no hash and that read-case still distinguishes
  each stored version by its own content; the existing suite for diagnose.controller.ts and seed.ts continuing
  to pass, unedited, is the proof for real callers; run-diagnosis.ts's header-comment criterion is prose
  with no runtime effect and is left untested, disclosed rather than invented against.
implementation: sha256:024475dd0011589f2fbce7cbb13c14fd4a48b09ce4120f10d7852395e861b28f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-and-investigation-model-case-query-drops-the-document-hash-suite-3
tests:
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers a case with no hash property at all, since read-case no longer pins by content
  proves: Criterion 1 -- ReadCaseResult (case-query.port.ts) declares no hash field, and readCase's return
    (case-query.service.ts) carries no hash.
  fails_when: readCase's resolved result carries a `hash` property, of any value, for any stored version
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers each version by its own content, never another version's
  proves: read-case still distinguishes two stored versions of the same slug by their own content once
    the hash pin that used to distinguish them in this test is gone -- rewritten from the pre-existing
    "pins each version by its own hash, never another version's", which asserted exactly the pin this
    task's criterion 1 retires
  fails_when: reading version 2 answers version 1's content (or vice versa), i.e. the two stored versions
    are not kept apart once neither answer carries a hash
not_applicable:
- edge_case: absent/empty input, a range boundary, a duplicate, forbidden-state operations, a slow/failing
    dependency, concurrent operations
  why: this task changes an output shape (a return type losing a field), not an input; readCase's own
    input handling (slug/version) is untouched and already covered by the pre-existing not-found and cross-check
    tests in this same file, and nothing here introduces a range, a collection, a state machine, a new
    dependency call, or concurrency-relevant state.
untested:
- Criterion 3 (run-diagnosis.ts's own module header comment describing the case pin as 'by slug and version',
  never 'by content') is prose in a comment with no executable effect. No unit test can assert what a
  comment says without reading the source text itself, which is not a test of behavior -- verifying it
  is a reading of the file, not a run of the suite. No test was written to force this.
- Criterion 2 (real callers diagnose.controller.ts and seed.ts are unaffected) has no new test written
  for it. Both callers already only destructure `case` off readCase's result, and neither the pre-existing
  unit coverage (build-app.spec.ts, stubbing ICaseQuery) nor the pre-existing integration coverage (diagnose-e2e.spec.ts,
  diagnose-persistence-deadline-e2e.spec.ts, seed.spec.ts) reads a hash anywhere -- grepped for `.hash`
  across every test under src/src/__tests__ and confirmed no other reference. This criterion is proven
  by that existing, unedited suite continuing to pass rather than by a new test, since nothing about it
  changed.
divergences:
- from: the ordinary route of re-delivering the proof over the task that owns the two broken pre-existing
    test files -- task/case-store/read-case under work/case-authoring-mvp, which carries closure.md and
    is history
  departure: 'Two pre-existing test files, both owned exclusively by task/case-store/read-case (case-authoring-mvp,
    closed), were edited directly inside this delivery rather than through a re-delivery of that task,
    following the pattern the human approved in the case-aggregate-shape and investigation-record-shape
    deliveries immediately before this one. (1) src/__tests__/unit/case/case-query.service.spec.ts --
    two of its own tests asserted exactly the hash pin this task''s own criterion 1 retires and had typecheck
    errors as a result: "pins the answered case by exactly the hash the store attached to the version
    this call read, not a value read-case computes itself" was deleted outright, since once ReadCaseResult
    carries no hash of any kind, there is nothing left to "pin by exactly the hash" -- its whole point
    is now a structural fact of case-query.port.ts''s own declaration, proven instead by the new "answers
    a case with no hash property at all" test above rather than by adapting a now-empty assertion. "pins
    each version by its own hash, never another version''s" was rewritten into "answers each version by
    its own content, never another version''s", keeping its real structural point (read-case must not
    cross-contaminate two stored versions of the same slug) while asserting it through content rather
    than through a hash neither version''s answer carries any more. Two further tests in the same file,
    not reported by typecheck (toMatchObject''s expected-object typing is untyped against the received
    value, so these compiled cleanly) but broken at runtime by the same removal -- "refuses at a later
    read a case that validated earlier, once the glossary no longer holds a concept it depends on" and
    "...once the capability registry no longer answers a concept it depends on" -- each had a setup assertion
    `resolves.toMatchObject({ hash: ''a-hash'' })` confirming the first read succeeded before the later
    refusal; both were changed to `resolves.toMatchObject({ case: { slug: SLUG } })`, asserting the same
    "first read succeeded, and answered the right case" fact the original meant to confirm. (2) src/__tests__/integration/factories/case-query.factory.spec.ts
    -- the one `expect(result.hash).toBe(createHash(''sha256'')...)` line was dropped, its now-dead `createHash`
    import removed, and the test''s own name was shortened to drop the hash-pin claim, since the deleted
    assertion was the whole reason the name claimed one; the test''s own real assertion about `result.case`
    and the `rawStored` sanity check are otherwise untouched.'
  why: work/case-authoring-mvp carries closure.md and is history, so no re-delivery route exists for task/case-store/read-case;
    the human-approved precedent for exactly this situation (case-aggregate-shape's and investigation-record-shape's
    own divergence entries, disclosed the same way in this same epic) is followed rather than inventing
    a new route.
---

## What it is

The proof that ReadCaseResult and readCase carry no hash any more, and that the two pre-existing tests asserting the retired pin -- owned by a now-closed initiative with no re-delivery route -- no longer stand in the way of that fact.

## Notes

Divergence disclosed above follows the precedent case-aggregate-shape and investigation-record-shape already set in this same epic for pre-existing tests owned by closed work roots.
Criterion 3 (a comment's own wording) and criterion 2 (real callers unaffected) are left untested by design, disclosed above, rather than proven by an invented test.
