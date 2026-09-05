---
title: Guard proof for diagnose-persistence-deadline-e2e.spec.ts's routed release fixture
summary: Confirms the existing deadline test still passes unchanged and adds a self-contained test proving releaseRevisionDirectly routes through the guarded lifecycle operation rather than an unguarded write, by exercising the refusal a raw SQL UPDATE could never produce.
implementation: sha256:164390edbe77cc25e5d7b37f6c5c80b5c4acef7b64871546cfdcfc67884d27f8
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/diagnose-persistence-deadline-fixture-corrective-route-through-the-declared-lifecycle-operation-suite
tests:
- file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  name: answers a named 500 reporting InvestigationWriteDeadlineExceededError, never the assessment, and leaves no investigation readable by its id immediately afterward, when the investigation write is slowed past the persistence deadline
  proves: 'Criterion 2 — running this file''s own full test suite continues to pass with every existing assertion unchanged. This test is untouched by the fixture-write substitution: its body and every one of its assertions are exactly as they were before the fixture was rerouted.'
  fails_when: releaseRevisionDirectly's new call into createCaseLifecycle(connection).releaseHypothesisRevision fails to move the fixture's revision to released during beforeAll's seedFixture, or any of assertDeadlineExceeded's existing assertions stop holding.
- file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  name: refuses releaseRevisionDirectly's own second call against a hypothesis-revision it already released, with HypothesisRevisionNotDraftAtReleaseError, rather than silently rewriting its already-released state
  proves: Criterion 1 as observable behavior — that releaseRevisionDirectly's own implementation calls the case lifecycle's guarded releaseHypothesisRevision rather than a hand-written UPDATE or the persistence layer's own unguarded write method. A raw UPDATE or an unguarded write both silently succeed on a second call against an already-released revision; only the guarded operation refuses it.
  fails_when: releaseRevisionDirectly is changed back to a raw SQL UPDATE against hypothesis_revisions.state, or to any call on the persistence layer's own unguarded write method, so that the second call in this test silently rewrites the already-released row instead of throwing.
not_applicable:
- edge_case: Absent or empty input at a validation boundary
  why: releaseRevisionDirectly is a private test-fixture helper called only from within this same file with fully-formed identity objects the file itself constructs; it is not a request handler and receives no external input to validate.
- edge_case: A boundary value at either end of a numeric range
  why: Neither criterion states a range; the file's only numeric constants are untouched by this task and already covered by the existing, unmodified test.
- edge_case: An empty collection returned where one is expected
  why: Neither this task's fixture substitution nor either criterion produces or reads a collection.
- edge_case: Two operations against one subject at once (concurrency)
  why: Criterion 1 is about which function releaseRevisionDirectly calls on a single, sequential path. A true concurrent double-release race is the guarded operation's own concern, already exercised by release-hypothesis-revision.operation.spec.ts.
untested:
- 'rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle''s HTTP-409 clause, its never-stored-identity trigger, and its refusal-carries-no-further-value clause remain unexercised anywhere in this file, per the task''s own REMAINDER note: this fixture only ever calls the lifecycle operation directly, never over HTTP. Those clauses are the concern of the tasks that deliver the release operation itself and expose it over HTTP (already covered by release-hypothesis-revision.operation.spec.ts and release-hypothesis-revision.routes.spec.ts).'
---
## What it is

Cites the file's own unaffected existing test as proof of no regression, plus one new test proving the release-write substitution actually enforces the lifecycle guard.

## Notes

None.
