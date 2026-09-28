---
target: backend
title: Configured request-body size ceiling -- proof
summary: Tests envSchema's MAX_REQUEST_BODY_BYTES field (default, coercion, positive-integer boundaries),
  the factory's wiring of env.MAX_REQUEST_BODY_BYTES onto BuildAppDependencies.bodyLimit, and buildApp()'s
  Fastify instance refusing an oversized body with 413 before any route handler runs.
implementation: sha256:6ae873b34a938a64dfac1c9c549521e98fe816bef6552a7d1a71fa6d4877341e
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/request-body-size-limit-configured-body-limit-suite-2
tests:
- file: src/__tests__/unit/config/env.spec.ts
  name: defaults MAX_REQUEST_BODY_BYTES to 1048576 when the given environment names none
  proves: Criterion 1's default clause.
  fails_when: loadEnv() on a source naming no MAX_REQUEST_BODY_BYTES yields an Env whose MAX_REQUEST_BODY_BYTES
    is not exactly 1048576.
- file: src/__tests__/unit/config/env.spec.ts
  name: parses a configured MAX_REQUEST_BODY_BYTES as a number, distinct from its default
  proves: Criterion 1's coercion clause.
  fails_when: loadEnv() given MAX_REQUEST_BODY_BYTES='2000000' yields anything other than the number 2000000.
- file: src/__tests__/unit/config/env.spec.ts
  name: throws InvalidEnvironmentError naming MAX_REQUEST_BODY_BYTES when it is set to a non-numeric value
  proves: Criterion 1 -- garbage input is refused rather than silently coerced.
  fails_when: loadEnv() given MAX_REQUEST_BODY_BYTES='not-a-number' does not throw InvalidEnvironmentError
    naming MAX_REQUEST_BODY_BYTES.
- file: src/__tests__/unit/config/env.spec.ts
  name: throws InvalidEnvironmentError naming MAX_REQUEST_BODY_BYTES for a non-integer value (it.each
    case, value '2.5')
  proves: Criterion 1's integer boundary.
  fails_when: loadEnv() given MAX_REQUEST_BODY_BYTES='2.5' does not throw InvalidEnvironmentError naming
    MAX_REQUEST_BODY_BYTES.
- file: src/__tests__/unit/config/env.spec.ts
  name: throws InvalidEnvironmentError naming MAX_REQUEST_BODY_BYTES for a zero value (it.each case, value
    '0')
  proves: Criterion 1's positivity boundary.
  fails_when: loadEnv() given MAX_REQUEST_BODY_BYTES='0' does not throw InvalidEnvironmentError naming
    MAX_REQUEST_BODY_BYTES.
- file: src/__tests__/unit/factories/build-app.factory.spec.ts
  name: carries env.MAX_REQUEST_BODY_BYTES through onto the returned dependencies' own bodyLimit field,
    unchanged
  proves: Criterion 2's factory half.
  fails_when: buildAppDependencies() given an Env whose MAX_REQUEST_BODY_BYTES is 2000000 returns a BuildAppDependencies
    object whose bodyLimit is not 2000000.
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers 200 and invokes the diagnose handler for a request whose body sits within the configured
    bodyLimit
  proves: Criterion 2's build-app.ts half, at the within-limit boundary.
  fails_when: buildApp() given a BuildAppDependencies with bodyLimit 300 refuses, or fails to invoke the
    diagnose handler for, a request whose JSON body is well under 300 bytes.
- file: src/__tests__/unit/http/build-app.spec.ts
  name: refuses with 413 a request whose body exceeds the configured bodyLimit, invoking no route handler
  proves: Criterion 3.
  fails_when: buildApp() given a BuildAppDependencies with bodyLimit 300 answers anything other than 413
    for a request whose JSON body is well over 300 bytes, or invokes the diagnose handler for it.
not_applicable:
- edge_case: A request body whose size is exactly equal to the configured bodyLimit
  why: The criterion states only that a body which exceeds the ceiling is refused; it says nothing about
    exact equality, which is Fastify's own semantics and not a fact this task's criteria state either
    way.
- edge_case: An upper ceiling on the value MAX_REQUEST_BODY_BYTES itself may take
  why: Criterion 1 states only a lower constraint (positive integer) and a default; no maximum is declared.
- edge_case: An empty (zero-byte) request body
  why: Simply another instance of within-the-limit, already covered by the within-limit test and by pre-existing
    200-status diagnose tests.
- edge_case: A dependency that is unavailable, slow, or answers unexpectedly, and two operations against
    one subject at once
  why: The body-size ceiling is a synchronous, stateless check Fastify performs before any handler or
    dependency is reached; no external dependency or shared mutable state is introduced.
- edge_case: A duplicate or a uniqueness violation, and an operation attempted against state that forbids
    it
  why: Neither concept applies to a request-body size ceiling, enforced identically regardless of any
    resource's existence or state.
- edge_case: FakeHypothesisEvaluator's/FakeAssessmentConsolidator's own no-data evaluation shape, corrected
    in diagnose-e2e.spec.ts and diagnose-persistence-deadline-e2e.spec.ts by this proof-only re-delivery
  why: This task's own criteria govern only env.ts's field, the factory's wiring, and build-app.ts's 413
    refusal; the two files' evaluation fixtures are e2e specs for the diagnose route as a whole, touched
    by this task only to add MAX_REQUEST_BODY_BYTES to their placeholderEnv() literals. No criterion of
    this task states anything about an evaluation's usage/elapsed_ms/prompt fields, so no test of this
    task's own is written over the correction; it is a fixture-consistency fix, not a behavior this task's
    criteria assert.
---

## What it is

The proof for task/request-body-size-limit/configured-body-limit: env.ts's new field, the factory's wiring, and buildApp()'s 413 refusal, each pinned by a test.

## Notes

This is a proof-only re-delivery answering to the sibling delivery task/fake-hypothesis-evaluator-no-data-usage/no-usage-or-elapsed-for-no-data (initiative post-reconcile-audit-corrections). That delivery changed FakeHypothesisEvaluator so that a no-data EvaluationOutcome no longer carries usage, elapsed_ms or prompt, per domain/investigation/evaluation's own stated rule. Two integration fixtures this task's own implementation record lists under files -- because this task added MAX_REQUEST_BODY_BYTES to their placeholderEnv()/baseEnv() literals -- had seeded FakeAssessmentConsolidator with a no-data evaluation that still carried usage/elapsed_ms, which no longer matched what FakeHypothesisEvaluator now actually answers; FakeAssessmentConsolidator's fixture-matching throw ("has no fixture seeded for this evaluations/evidence/register call") fired before the investigation was ever persisted. This re-delivery corrected exactly the seeded/expected evaluation shape in the two files -- EXPECTED_NARROWED_EVALUATIONS in src/__tests__/integration/http/diagnose-e2e.spec.ts (around lines 57-60) and buildFakes()'s consolidator seed in src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts (around lines 231-242), dropping usage/elapsed_ms from each no-data entry -- touching no assertion about the 413/body-limit behavior itself, and this task's own 7 tests over env.ts, build-app.factory.ts and build-app.ts are unchanged and still prove its 3 criteria. This task implements no specification node, so no test here carries a demonstrates.
