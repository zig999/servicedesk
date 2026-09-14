---
target: backend
title: Persistence-deadline e2e test's injected total pinned to the specification's declared 20-second figure — proof
summary: A source-level guard test pinning TOTAL_DEADLINE_BUDGET_MS to 20000, the only mechanical way
  to make criterion 1 fail on a future regression given the file's runtime behavior is insensitive to
  the total's exact value.
implementation: sha256:e2c5071281ba6539627b81ab07e93aefb6566b4d45b65d00c5c9b80470f21568
run: run/deadline-test-value-corrective-suite-full
tests:
- file: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  name: declares TOTAL_DEADLINE_BUDGET_MS, the total deadline this file injects into the diagnose
    runner, equal to rules/investigation/an-answer-arrives-within-the-declared-deadline's own declared
    total of 20000ms (2000 overhead/margin + 7000 collection + 5000 judgment + 4000 writing + 2000
    persistence), never a locally chosen figure that diverges from it
  proves: "Criterion 1 — the constant this test uses to compute the injected deadline equals the specification's
    declared total deadline in milliseconds."
  fails_when: TOTAL_DEADLINE_BUDGET_MS in this file is declared as any value other than 20000 (e.g.
    reverted to 30000, or changed to any other figure).
not_applicable:
- edge_case: a boundary at each end of a stated range
  why: the specification declares a single fixed total (20 seconds), not a range; criterion 1 has one
    representative value with no boundary to distinguish it from.
- edge_case: two operations against one subject at once / concurrent diagnose requests
  why: no criterion of this task and no clause of the node it implements addresses concurrency; the
    corrective concerns only a constant's declared value and the file's continued build/pass.
- edge_case: a dependency that answers slowly
  why: already exercised, unmodified, by this file's own pre-existing test asserting a named HTTP 500
    reporting InvestigationWriteDeadlineExceededError; per run-diagnosis.ts's fixed 2_000ms persistence-stage
    cap, that test's behavior does not change between a 30_000 and a 20_000 total, so no new test is
    owed.
- edge_case: an operation against state that forbids it
  why: already exercised, unmodified, by this file's own pre-existing releaseRevisionDirectly refusal
    test, which never reads TOTAL_DEADLINE_BUDGET_MS at all and is unaffected by this change.
- edge_case: absent or empty input, or a duplicate where uniqueness is claimed
  why: criterion 1 concerns a single source-level numeric constant, not request input; nothing in this
    task's scope accepts a payload to vary.
untested:
- Criterion 2 (the file still builds and the full suite still passes) is confirmed by run/deadline-test-value-corrective-typecheck
  and run/deadline-test-value-corrective-suite, both passing cleanly, rather than by a test in this file.
- rules/investigation/an-answer-arrives-within-the-declared-deadline's own fact has two clauses — the
  twenty-second total, and that this total is smaller than the caller's timeout. This task's own Notes
  (REMAINDER) state that the second clause reaches no criterion of this task and belongs to a separate
  task implementing the diagnose route's own deadline propagation. No test in this file compares the
  declared total against a caller's timeout, so the node's fact is not decided whole by anything here.
- The task's own third ADVISORY note observes that both criteria are satisfied by any locally re-declared
  20_000 literal, with no node refusing that pattern. The guard test this record adds pins the current
  value in this one file but does not, and cannot, close that structural risk — a future re-declaration
  of this same mistake in another file would need its own guard.
---
## What it is
A guard test pinning the corrected constant.

## Notes
run/deadline-test-value-corrective-build and run/deadline-test-value-corrective-suite-full both passed cleanly, confirming criterion 2.
