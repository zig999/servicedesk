---
title: Proof for map-status-for-typed-refusals
summary: Tests that statusForError resolves each of the four hotfix classes to its stated status, that
  the whole HTTP stack answers with that status and the standard domain envelope instead of the generic
  500, and that status-map.ts's header comment now names all four under their correct group.
implementation: sha256:d958be86d7413cb1ca94414712535864507d10a5f777218166484abaacee4168
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/revise-hypothesis-status-map-hotfix-map-status-for-typed-refusals-suite-2
tests:
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves CaseHoldsNoDraftError to 409
  proves: statusForError(new CaseHoldsNoDraftError(slug)) returns 409.
  fails_when: STATUS_BY_ERROR_CLASS carries no entry for CaseHoldsNoDraftError, or maps it to any status
    other than 409.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves ConceptNotInGlossaryError to 404
  proves: statusForError(new ConceptNotInGlossaryError(slug, hypothesisName, concepts)) returns 404.
  fails_when: STATUS_BY_ERROR_CLASS carries no entry for ConceptNotInGlossaryError, or maps it to any
    status other than 404.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves HypothesisRevisionCollectsNoConceptError to 422
  proves: statusForError(new HypothesisRevisionCollectsNoConceptError(slug, hypothesisName)) returns 422.
  fails_when: STATUS_BY_ERROR_CLASS carries no entry for HypothesisRevisionCollectsNoConceptError, or
    maps it to any status other than 422.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves ConceptRefusesSubjectTypeError to 422
  proves: statusForError(new ConceptRefusesSubjectTypeError(context)) returns 422.
  fails_when: STATUS_BY_ERROR_CLASS carries no entry for ConceptRefusesSubjectTypeError, or maps it to
    any status other than 422.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: the header's top paragraph cites each of the four hotfix classes' own governing rule alongside
    the HTTP status it fixes
  proves: the header enumeration/citation half of "status-map.ts's own header comment ... is updated to
    name the four new classes" -- each class's own HTTP status, governing rule path and quoted refusal
    clause appears in the top paragraph.
  fails_when: any of CaseHoldsNoDraftError, ConceptNotInGlossaryError, HypothesisRevisionCollectsNoConceptError
    or ConceptRefusesSubjectTypeError loses its own status/rule-path/quoted-clause citation from the header's
    top paragraph.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: the header's own 404/409/422 group enumeration names each of the four hotfix classes under its
    correct group, alongside the rule that governs it
  proves: status-map.ts's own header comment, which enumerates the members of its 404, 409 and 422 groups,
    is updated to name the four new classes under their correct group.
  fails_when: ConceptNotInGlossaryError is absent from (or misplaced out of) the 404-group enumeration,
    CaseHoldsNoDraftError from the 409-group enumeration, or HypothesisRevisionCollectsNoConceptError
    / ConceptRefusesSubjectTypeError from the 422-group enumeration in the "Grouped by..." paragraph.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: the header's own "reached this table" narrative explains the ninth and tenth entries arrived through
    this hotfix rather than a newly-exposed route
  proves: the implementation record's own disclosed inference that the 422 group's "reached this table"
    ordinal narrative was extended with a ninth-and-tenth clause explaining these two reached the table
    via this hotfix rather than a newly-exposed route.
  fails_when: that narrative is absent, reverted, or the ninth/tenth entries are folded into the narrative
    as if a new route exposed them (the alternative the inference rejected).
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: the header comment names eleven specification nodes that now fix a status as a decided fact, and
    keeps citing the three pre-existing 422-group rules unchanged
  proves: a pre-existing test in this same file hard-coded the running count of specification-fixed statuses
    as "seven"; keeping it true after this task's own header edit (which the implementation record states
    moves the count to eleven) is part of proving "status-map.ts's own header comment ... is updated"
    rather than leaving a now-false assertion in the suite. Only the stale literal ("seven" to "eleven",
    in both the test's title and its one count assertion) was edited; every other assertion in this pre-existing
    test is unchanged.
  fails_when: the header's top-paragraph specification-fixed count reverts to any number other than eleven,
    or any of the three pre-existing citations (ConnectorConfigurationNotWellFormedError, SubjectDoesNotCoverCaseInputsError,
    ConnectorPlaceholderOutsideInputSchemaError) it already asserted is lost.
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 409 with CaseHoldsNoDraftError's own code, message and context as details, never the generic
    500, when reviseHypothesis rejects with it
  proves: 'A POST /v1/cases/:slug/hypotheses request that reaches ... CaseHoldsNoDraftError responds with
    that status and a body of { error: { code, message, details } }, never the generic 500 INTERNAL_ERROR
    fallback.'
  fails_when: 'the response is the generic 500 { error: { code: ''INTERNAL_ERROR'', ... } } envelope,
    or the status/code/message/details differ from CaseHoldsNoDraftError''s own 409/name/message/context.'
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 404 with ConceptNotInGlossaryError's own code, message and context as details, never the
    generic 500, when reviseHypothesis rejects with it
  proves: the same criterion 5 clause, for ConceptNotInGlossaryError.
  fails_when: the response is the generic 500 envelope, or the status/code/message/details differ from
    ConceptNotInGlossaryError's own 404/name/message/context.
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 422 with HypothesisRevisionCollectsNoConceptError's own code, message and context as details,
    never the generic 500, when reviseHypothesis rejects with it
  proves: the same criterion 5 clause, for HypothesisRevisionCollectsNoConceptError.
  fails_when: the response is the generic 500 envelope, or the status/code/message/details differ from
    HypothesisRevisionCollectsNoConceptError's own 422/name/message/context.
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 422 with ConceptRefusesSubjectTypeError's own code, message and context as details, never
    the generic 500, when reviseHypothesis rejects with it
  proves: the same criterion 5 clause, for ConceptRefusesSubjectTypeError.
  fails_when: the response is the generic 500 envelope, or the status/code/message/details differ from
    ConceptRefusesSubjectTypeError's own 422/name/message/context.
not_applicable:
- edge_case: absent or malformed input to statusForError (a non-Error thrown value, a typed error class
    the table does not name)
  why: this task only appends four new map entries; the function's own handling of a non-Error value and
    of an unmapped class is unchanged and already proved by this file's own pre-existing tests, which
    this task does not touch.
- edge_case: a boundary at each end of a numeric range
  why: nothing this task adds is range-bounded -- a status map is a discrete class-to-status table, and
    the four new entries are each one fixed status, not a range.
- edge_case: an empty collection returned where one is expected
  why: statusForError never returns a collection, and the four new error classes' own construction (whether
    their own concepts array may be empty) is that class's own concern, decided and tested where each
    class was itself authored -- not a fact this task's criteria state anything about.
- edge_case: a dependency that is unavailable, slow or answers in an unexpected shape
  why: this task touches only src/errors/status-map.ts, a pure synchronous lookup with no dependency;
    reviseHypothesis is exercised only as a mocked boundary stand-in (TST-03), never invoking a real store
    or glossary.
- edge_case: two operations against one subject at once
  why: statusForError is a stateless, synchronous function over an immutable map, and the route-level
    tests each build and tear down their own Fastify instance; nothing this task introduces is shared
    mutable state a concurrent request could race against.
untested:
- 'Whether STATUS_BY_ERROR_CLASS''s insertion position for the four new entries (appended at the end of
  each group, per the implementation record''s own inference) has any observable consequence, as opposed
  to any other insertion order. The map''s own doc comment states iteration order carries no behavioral
  consequence here because none of the twenty-nine classes extends another, so no behavior exists for
  a test to distinguish -- asserting on the map''s internal iteration order itself would be asserting
  an internal structure rather than an observable behavior, which is outside what a test may assert. This
  is a finding about the inference rather than an omission: the choice is real (disclosed against the
  alternative of reordering alphabetically) but nothing behavioral falsifies it.'
---

## What it is

The tests proving task/revise-hypothesis-status-map-hotfix/map-status-for-typed-refusals's five
criteria: each of the four classes' own status resolution, the whole HTTP stack's envelope for
each, and the header comment's own updated citations.

## Notes

run/revise-hypothesis-status-map-hotfix-map-status-for-typed-refusals-suite failed at the test step (cause: setup, per failure-diagnostician): src/.env.test, which npm test loads via node --env-file, was absent from this fresh worktree -- an untracked, gitignored file never copied by git worktree add, unrelated to this task's own files. Copied from the main checkout's own src/.env.test (the same file the primary working tree already uses for its own test runs against the lab Postgres instance); run-suite-2 passed clean with no source or test file changed.
