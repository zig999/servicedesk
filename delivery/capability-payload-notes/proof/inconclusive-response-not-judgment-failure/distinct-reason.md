---
target: backend
title: A well-formed inconclusive judgment declares not-grounded, proved by the corrected sibling test
summary: The same test corrected by stale-judgment-failure-assertions-for-inconclusive/corrected-to-not-grounded
  proves this task's own criteria -- the well-formed-inconclusive case declares not-grounded, and
  every parse-failure/unrecognized-shape/provider-rejection case still declares judgment-failure.
implementation: sha256:2645e9a1a0d6c04cb371a45f479870e8d10e40562fca7d91e5af07768e01f4b7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/register-capability-payload-notes-corrections-suite-5
tests:
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: "maps the model's own well-formed inconclusive answer to reason not-grounded"
  proves: 'Criterion 1 -- A well-formed model response of exactly {"verdict":"inconclusive"}
    yields an evaluation whose reason is "not-grounded".'
  fails_when: outcomeFromModelText's parsed.verdict === 'inconclusive' branch stops calling
    notGroundedOutcome, or the outcome carries any reason other than 'not-grounded'.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when the model response is not valid JSON
  proves: Criterion 2 -- a response that cannot be parsed as JSON still yields reason
    judgment-failure.
  fails_when: a non-JSON model response stops carrying reason judgment-failure.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: answers inconclusive with reason judgment-failure when the model response is valid JSON
    but matches none of the three declared shapes
  proves: Criterion 2 -- a response whose shape this adapter does not recognize still yields
    reason judgment-failure.
  fails_when: a well-formed-JSON-but-unrecognized-verdict response stops carrying reason
    judgment-failure.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: parses a well-formed confirmed answer into the confirmed verdict with its citations
  proves: 'Criterion 3 -- A well-formed {"verdict":"confirmed",...} response is unaffected by
    this change and yields the same verdict and citations as before.'
  fails_when: a well-formed confirmed answer stops yielding the confirmed verdict with its
    citations.
- file: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  name: parses a well-formed refuted answer into the refuted verdict with its citations
  proves: 'Criterion 3 -- A well-formed {"verdict":"refuted",...} response is unaffected by this
    change and yields the same verdict and citations as before.'
  fails_when: a well-formed refuted answer stops yielding the refuted verdict with its citations.
not_applicable:
- edge_case: an outcome carrying reason deadline-exceeded
  why: this adapter never produces deadline-exceeded; it is produced by the collection-timeout
    work this task does not touch.
untested:
- domain/investigation/evaluation-reason's fact -- that the four reasons are mutually distinct --
  is not decided whole by any test in this file, since this adapter only ever produces three of
  the four.
- rules/investigation/an-inconclusive-evaluation-declares-its-reason's no-data-citation clause is
  not exercised by anything in this file; it is exercised elsewhere (e.g.
  hypothesis-evaluator.port.spec.ts's no-data fixture test).
divergences:
- from: the framework convention that a task's own proof is written by its own test-author pass
  departure: This task's own criteria are proved entirely by tests already written and captured
    under stale-judgment-failure-assertions-for-inconclusive/corrected-to-not-grounded's own
    delivery, rather than by a dedicated test-author pass under this task's name.
  why: The corrective task fixed the exact pre-existing assertion this task's own criteria
    describe -- criterion 1 is precisely "the well-formed-inconclusive case declares
    not-grounded", which is the corrected test's own subject. Writing a second, duplicate test
    under this task's name would assert the identical fact the corrected test already decides.
---

## What it is

This task's three criteria are proved by the same tests the stale-judgment-failure-assertions-for-inconclusive
corrective task already corrected and captured, since that correction's subject is exactly this
task's own not-grounded-vs-judgment-failure distinction.

## Notes

None.
