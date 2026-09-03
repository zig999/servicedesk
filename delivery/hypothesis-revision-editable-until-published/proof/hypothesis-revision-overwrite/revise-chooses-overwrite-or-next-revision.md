---
title: Revise-hypothesis overwrite-or-next-revision routing, proven
summary: Integration tests over ReviseHypothesisOperation prove the overwrite/insert routing and its manifest
  side-effects, and unit tests over status-map and the revise-hypothesis route prove the new ReleasedHypothesisRevisionNotAlterableError-to-409
  mapping the task's own UNDERDETERMINED note named.
implementation: sha256:9f8764a6f8d2fe5ce5397205dc60f4e54a210dd5f8b4f32750d1248a0ef986f7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-overwrite-revise-chooses-overwrite-or-next-revision-suite-2
tests:
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: overwrites an already-named hypothesis's own highest revision in place, keeping its revision number
    unchanged, when that revision is referenced by no case version in released state
  proves: Revising a hypothesis whose highest existing revision is referenced by no case version in released
    state leaves that hypothesis's highest revision number unchanged. / After such a revise, that revision's
    content reads as the content the revise carried.
  fails_when: a second revise against an unreleased highest revision answers any number other than 1,
    or the stored row does not read the second revise's own criterion text, or a second row is created
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: leaves exactly the revision it held before three successive revises of an unreleased highest revision,
    reading the content of the most recent of them afterward
  proves: Three successive revises of a hypothesis whose highest existing revision is referenced by no
    case version in released state leave that hypothesis holding exactly the revisions it held before
    the first of them. / After those three revises, the hypothesis's highest revision reads the content
    of the most recent of them.
  fails_when: any of the three successive revises inserts an additional row instead of overwriting the
    existing one, or the surviving row does not read the third revise's own text
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: creates a revision numbered exactly one past the highest existing revision when that revision
    is referenced by a case version in released state
  proves: Revising a hypothesis whose highest existing revision is referenced by a case version in released
    state creates a revision numbered exactly one past that highest revision.
  fails_when: the revise overwrites revision 1 instead, or answers any number other than 2, or no row
    for revision 2 is persisted
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: leaves the released-referenced revision's own content reading exactly as it did before a revise
    creates the next revision
  proves: After such a revise, the revision that released case version references reads exactly the content
    it read before the revise.
  fails_when: the insert path (or any other path) touches revision 1's own stored content
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: leaves the released case version's manifest referencing the same revision number it referenced
    before a revise creates the next revision
  proves: After such a revise, that released case version's manifest still references the revision number
    it referenced before.
  fails_when: the operation writes to the manifest at all, or the released version's manifest entry advances
    past revision 1
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: rejects with the store's own typed ReleasedHypothesisRevisionNotAlterableError rather than silently
    succeeding, when the released-reference reading it acted on had already gone stale — the revision
    was released for real between that read and the write it drove
  proves: 'the task''s own UNDERDETERMINED note: rules/knowledge/a-released-hypothesis-revision-is-never-altered
    requires the stale-read race to be refused at the point of the attempt rather than silently dropped
    and answered as though the revise succeeded'
  fails_when: the operation swallows the store's ReleasedHypothesisRevisionNotAlterableError and answers
    as though the revise succeeded, or the released revision's stored content changes despite the refusal
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: leaves a draft manifest entry for the hypothesis referencing the same revision number it referenced
    before a revise that replaced the highest revision's content in place
  proves: After a revise that replaced the highest revision's content in place, the case's draft manifest
    entry for that hypothesis references the same revision number it referenced before the revise.
  fails_when: the overwrite path touches or renumbers the manifest entry pinning the overwritten revision
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: leaves an already-existing revision of the hypothesis reading exactly as it did, refusing to alter
    it, when a later revise is refused for the case holding no draft version
  proves: A revise refused because the case holds no draft version leaves every existing revision of that
    hypothesis reading exactly as it did, and creates none.
  fails_when: the stored revision's content changes, or a second row appears, despite the no-draft refusal
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: originates a never-named hypothesis's own identity and its first revision, numbered 1
  proves: Revising a hypothesis that holds no revision creates that hypothesis's revision 1.
  fails_when: a hypothesis with no prior revision answers any number other than 1, or no row is written
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves ReleasedHypothesisRevisionNotAlterableError to 409
  proves: the task's own UNDERDETERMINED note's required HTTP 409 mapping for ReleasedHypothesisRevisionNotAlterableError
  fails_when: statusForError stops mapping ReleasedHypothesisRevisionNotAlterableError to 409
- file: src/__tests__/unit/http/revise-hypothesis.routes.spec.ts
  name: answers 409 with ReleasedHypothesisRevisionNotAlterableError's own code, message and context as
    details, never the generic 500, when reviseHypothesis rejects with it
  proves: the task's own UNDERDETERMINED note's required HTTP 409 response reporting ReleasedHypothesisRevisionNotAlterableError,
    at the HTTP layer
  fails_when: the route answers anything other than 409 with that error's own code/message/context when
    reviseHypothesis rejects with ReleasedHypothesisRevisionNotAlterableError
not_applicable:
- edge_case: a revise against a hypothesis whose highest revision is unreleased while an earlier, non-highest
    revision of the same hypothesis is released-referenced
  why: no criterion of this task distinguishes this from the ordinary unreleased-highest case; the routing
    reads only the highest revision's own release state, and no node named by this task states different
    behavior for an older revision's own state
- edge_case: absent or malformed HTTP request bodies for the revise-hypothesis endpoint
  why: the task's own Notes state the HTTP layer passes the request body through unchanged and asks nothing
    new of it; validation-boundary behavior is unmodified by this delivery and already covered by revise-hypothesis.routes.spec.ts's
    pre-existing 400-response tests
- edge_case: a genuinely concurrent pair of revises racing against the same hypothesis through two real,
    simultaneously-running calls
  why: a true concurrency race is nondeterministic to reproduce in a test and would make the suite flaky;
    the stale-read race the rule itself names is instead reproduced deterministically by making one read
    answer as though unreleased while the real store's own trigger still sees the revision as released
untested:
- a true, simultaneously-executing double revise against one hypothesis, as opposed to the deterministic
  single-threaded stale-read simulation this proof writes — no test here drives two concurrent database
  transactions against the same row
- whether the HTTP layer answers exactly the rule's own message and context for a genuine, non-simulated
  stale-read race reaching production end to end through a running server, rather than through a mocked
  reviseHypothesis
---

## What it is
Integration tests over `ReviseHypothesisOperation` prove the overwrite-in-place path, the create-next-revision path, and the stale-read race the task's own UNDERDETERMINED note names. Unit tests over `status-map.ts` and the revise-hypothesis route prove the new `ReleasedHypothesisRevisionNotAlterableError` to HTTP 409 mapping.

## Notes
The existing integration test asserting always-insert numbering was rewritten in place, per the task's own Notes, rather than left standing beside tests that contradict it.
The stale-read race is reproduced deterministically by substituting a store whose `readHighestRevisionReleaseState` answers as though unreleased while the real, trigger-protected `overwriteHypothesisRevision` still refuses the write — this proves the operation propagates the store's own typed refusal rather than swallowing it, without a genuinely concurrent, nondeterministic test.
